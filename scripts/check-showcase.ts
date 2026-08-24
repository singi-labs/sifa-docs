/**
 * Health check for the Sifa-driven sites showcase.
 *
 * Reads content/data/site-showcase.json, and for every entry:
 *   - fetches the displayed URL and checks it returns 2xx (liveness), and
 *   - for `marker` entries, fetches the marker source (the page plus its
 *     same-origin JS bundles) and checks the entry's own marker is still there.
 *
 * Exits 1 if any entry is dead or drifted, and writes a Markdown report to
 * ./showcase/health.md so the scheduled workflow can open an issue from it.
 * `manual` and `unreachable` entries are reported for a human but never fail
 * the run — we cannot tell a host that blocks CI from a genuinely dead one.
 *
 * Rationale for per-entry markers (not one global check): decisions/
 * 2026-08-23-sifa-driven-sites-showcase.md in the Sifa workspace.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import {
  classifyEntry,
  isProblem,
  type FetchResult,
  type ShowcaseEntry,
  type ShowcaseVerdict,
} from './showcase'

const DATA = path.resolve(process.cwd(), 'content/data/site-showcase.json')
const REPORT_DIR = path.resolve(process.cwd(), 'showcase')
const TIMEOUT_MS = 20_000
const RETRIES = 2
// Wait between retries so a transient blip (a Cloudflare/deploy hiccup that
// briefly serves a 404 or 5xx) has time to clear before we call it dead.
const RETRY_DELAY_MS = 2_000
const MAX_JS_FILES = 15

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))
const is2xx = (status: number): boolean => status >= 200 && status < 300
// Look like a real browser: some hosts (Cloudflare and friends) reject requests
// without a browser UA or Accept headers, which would otherwise read as failure.
const HEADERS = {
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
}

interface FetchOutcome {
  /** true when we got an HTTP response at all (any status). */
  reachable: boolean
  status: number
  text: string
}

async function fetchOnce(url: string): Promise<FetchOutcome> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: HEADERS,
    })
    const text = res.ok ? await res.text() : ''
    return { reachable: true, status: res.status, text }
  } catch {
    return { reachable: false, status: 0, text: '' }
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Fetch with retries so a transient blip is not a failure. Retries BOTH network
 * errors and any non-2xx response (a live site can briefly 404/5xx during a
 * deploy or CDN hiccup — that is what wrongly removed clembs.com once). Only a
 * 2xx short-circuits; a persistent failure returns the last outcome.
 */
async function fetchText(url: string): Promise<FetchOutcome> {
  let last: FetchOutcome = { reachable: false, status: 0, text: '' }
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    if (attempt > 0) await sleep(RETRY_DELAY_MS)
    last = await fetchOnce(url)
    if (last.reachable && is2xx(last.status)) return last
  }
  return last
}

/** Same-origin `<script src>` URLs, so a marker baked into a JS bundle is found. */
function sameOriginScripts(html: string, pageUrl: string): string[] {
  const origin = new URL(pageUrl).origin
  const out: string[] = []
  const re = /<script[^>]+src=["']([^"']+)["']/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) {
    const src = m[1]
    if (!src) continue
    try {
      const abs = new URL(src, pageUrl)
      if (abs.origin === origin) out.push(abs.href)
    } catch {
      // ignore unparseable src
    }
  }
  return [...new Set(out)].slice(0, MAX_JS_FILES)
}

/** The page plus its same-origin JS, so a marker in a bundle is still found. */
async function bodyWithScripts(html: string, pageUrl: string): Promise<string> {
  const scripts = sameOriginScripts(html, pageUrl)
  const js = await Promise.all(scripts.map((s) => fetchText(s).then((r) => r.text)))
  return [html, ...js].join('\n')
}

async function check(entry: ShowcaseEntry): Promise<ShowcaseVerdict> {
  // Liveness is always the displayed URL — that's the link a reader clicks.
  const live = await fetchText(entry.url)
  if (!live.reachable || live.status < 200 || live.status >= 300) {
    return classifyEntry(entry, { reachable: live.reachable, status: live.status, body: '' })
  }
  if (entry.provenance.mode === 'manual') {
    return classifyEntry(entry, { reachable: true, status: live.status, body: '' })
  }
  const source = entry.provenance.markerUrl ?? entry.url
  const body =
    source === entry.url
      ? await bodyWithScripts(live.text, entry.url)
      : await (async () => {
          const page = await fetchText(source)
          return page.reachable ? bodyWithScripts(page.text, source) : ''
        })()
  const result: FetchResult = { reachable: true, status: live.status, body }
  return classifyEntry(entry, result)
}

const ICON: Record<ShowcaseVerdict['state'], string> = {
  ok: '✅',
  manual: '👁️',
  unreachable: '❓',
  drifted: '⚠️',
  dead: '❌',
}

async function main(): Promise<void> {
  const entries = JSON.parse(readFileSync(DATA, 'utf8')) as ShowcaseEntry[]
  const verdicts = await Promise.all(entries.map(check))

  for (const v of verdicts) {
    console.log(`${ICON[v.state]} ${v.state.padEnd(11)} ${v.entry.label} — ${v.detail}`)
  }

  const problems = verdicts.filter(isProblem)
  const advisory = verdicts.filter((v) => v.state === 'manual' || v.state === 'unreachable')

  const lines: string[] = []
  if (problems.length > 0) {
    lines.push('The following showcase entries need attention. Remove or fix them in')
    lines.push('`content/data/site-showcase.json`.', '')
    for (const v of problems) {
      lines.push(
        `- ${ICON[v.state]} **${v.state}** — [${v.entry.label}](${v.entry.url}) — ${v.detail}`
      )
    }
    lines.push('')
  }
  if (advisory.length > 0) {
    lines.push('Advisory (not failing) — verify by hand when convenient:', '')
    for (const v of advisory) {
      lines.push(
        `- ${ICON[v.state]} **${v.state}** — [${v.entry.label}](${v.entry.url}) — ${v.detail}`
      )
    }
    lines.push('')
  }
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(path.join(REPORT_DIR, 'health.md'), lines.join('\n'))

  const ok = verdicts.length - problems.length - advisory.length
  console.log(
    `\n${verdicts.length} entries: ${ok} ok, ${advisory.length} advisory, ${problems.length} to fix.`
  )
  if (problems.length > 0) process.exit(1)
}

void main()
