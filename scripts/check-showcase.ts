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
 * `manual` entries are reported for a human to eyeball but never fail the run.
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
// A real browser UA: some hosts (e.g. Cloudflare) 403 obvious bots, which would
// otherwise read as a false "dead".
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36'
const MAX_JS_FILES = 15

async function fetchText(url: string): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: { 'user-agent': UA },
    })
    const text = res.ok ? await res.text() : ''
    return { ok: res.ok, status: res.status, text }
  } catch {
    return { ok: false, status: 0, text: '' }
  } finally {
    clearTimeout(timer)
  }
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

/** Build the body a marker is searched in: the source page + its same-origin JS. */
async function markerBody(sourceUrl: string): Promise<{ status: number; body: string }> {
  const page = await fetchText(sourceUrl)
  if (!page.ok) return { status: page.status, body: '' }
  const scripts = sameOriginScripts(page.text, sourceUrl)
  const js = await Promise.all(scripts.map((s) => fetchText(s).then((r) => r.text)))
  return { status: page.status, body: [page.text, ...js].join('\n') }
}

async function check(entry: ShowcaseEntry): Promise<ShowcaseVerdict> {
  // Liveness is always the displayed URL — that's the link a reader clicks.
  const live = await fetchText(entry.url)
  if (!live.ok) {
    return classifyEntry(entry, { ok: false, status: live.status, body: '' })
  }
  if (entry.provenance.mode === 'manual') {
    return classifyEntry(entry, { ok: true, status: live.status, body: '' })
  }
  // Always crawl the source page AND its same-origin JS: a marker may live only
  // in a bundle (e.g. a client-rendered site whose DID is in its JS), not the
  // delivered HTML. Reuse the already-fetched HTML when the source is the URL.
  const source = entry.provenance.markerUrl ?? entry.url
  const scripts = sameOriginScripts(live.text, entry.url)
  const marker =
    source === entry.url
      ? {
          status: live.status,
          body: [
            live.text,
            ...(await Promise.all(scripts.map((s) => fetchText(s).then((r) => r.text)))),
          ].join('\n'),
        }
      : await markerBody(source)
  const result: FetchResult = { ok: true, status: live.status, body: marker.body }
  return classifyEntry(entry, result)
}

const ICON: Record<ShowcaseVerdict['state'], string> = {
  ok: '✅',
  manual: '👁️',
  drifted: '⚠️',
  dead: '❌',
}

async function main(): Promise<void> {
  const entries = JSON.parse(readFileSync(DATA, 'utf8')) as ShowcaseEntry[]
  const verdicts = await Promise.all(entries.map(check))

  for (const v of verdicts) {
    console.log(`${ICON[v.state]} ${v.state.padEnd(8)} ${v.entry.label} — ${v.detail}`)
  }

  const problems = verdicts.filter(isProblem)
  const manual = verdicts.filter((v) => v.state === 'manual')

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
  if (manual.length > 0) {
    lines.push('Entries whose provenance is not machine-checkable — eyeball occasionally:', '')
    for (const v of manual) {
      lines.push(`- 👁️ [${v.entry.label}](${v.entry.url}) — ${v.detail}`)
    }
    lines.push('')
  }
  mkdirSync(REPORT_DIR, { recursive: true })
  writeFileSync(path.join(REPORT_DIR, 'health.md'), lines.join('\n'))

  console.log(
    `\n${verdicts.length} entries: ${verdicts.length - problems.length - manual.length} ok, ` +
      `${manual.length} manual, ${problems.length} to fix.`
  )
  if (problems.length > 0) process.exit(1)
}

void main()
