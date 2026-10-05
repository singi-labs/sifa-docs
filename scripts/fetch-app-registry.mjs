/**
 * Snapshot the live app registry to `content/data/app-registry.json`.
 *
 * The registry is the source of truth for which AT Protocol apps Sifa reads
 * activity from, and it lives in sifa-api. Rather than fetch it during
 * `next build`, which would put a third-party network call on the critical
 * path of every deploy, this writes a committed snapshot that a scheduled
 * workflow refreshes. Same shape as the screenshot pipeline.
 *
 * Two things are probed here rather than at render time, so the page stays a
 * pure static export with no client-side error handling:
 *
 *   - whether the app's site actually responds, so a dead link never ships.
 *     `homepage` is derived from the lexicon's reverse-DNS authority
 *     (sifa-workspace#343), which is right far more often than not, but some
 *     derived domains do not resolve at all. A site that stops answering is
 *     hidden right away; `homepageDownSince` keeps the date it first failed,
 *     carried over from the previous snapshot, and the workflow opens an issue
 *     once that passes a week (scripts/link-health.ts).
 *   - whether the favicon proxy can produce a logo for it.
 *
 * Usage: pnpm fetch:apps
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { longDownReport, nextDownSince, todayUtc } from './link-health'
import { BLOCKED_STATUSES } from './showcase'

const SOURCE = process.env.SIFA_API_URL ?? 'https://sifa.id'
const ENDPOINT = `${SOURCE}/api/apps/registry`
const OUT = 'content/data/app-registry.json'
const REPORT = '.link-health/apps.md'
const PROBE_TIMEOUT_MS = 12_000
const PROBE_CONCURRENCY = 8

const res = await fetch(ENDPOINT, {
  headers: { accept: 'application/json' },
  signal: AbortSignal.timeout(20_000),
})

if (!res.ok) {
  console.error(`fetch-app-registry: ${ENDPOINT} returned ${res.status}`)
  process.exit(1)
}

const registry = await res.json()

if (!Array.isArray(registry) || registry.length === 0) {
  console.error('fetch-app-registry: expected a non-empty array')
  process.exit(1)
}

/** Does this URL respond at all? Any non-error status counts; liveness is the question. */
async function probeOnce(url) {
  try {
    const probe = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
      headers: { 'user-agent': 'sifa-docs-build/1.0 (+https://docs.sifa.id)' },
    })
    // 401/403/429 mean the server is up but refuses bots (voxport.com did):
    // that is a live site, not a dead link.
    return probe.status < 400 || BLOCKED_STATUSES.has(probe.status)
  } catch {
    return false
  }
}

/** One retry, so a single DNS or network blip does not hide a live site for a day. */
async function responds(url) {
  return (await probeOnce(url)) || (await probeOnce(url))
}

/** `homepageDownSince` per app id from the previous snapshot, if there is one. */
async function previousDownSince() {
  try {
    const previous = JSON.parse(await readFile(OUT, 'utf8'))
    return new Map(previous.map((a) => [a.id, a.homepageDownSince ?? null]))
  } catch {
    return new Map()
  }
}

/** Run `worker` over `items` with a small concurrency cap. */
async function mapLimit(items, worker) {
  const out = new Array(items.length)
  let cursor = 0
  const runners = Array.from({ length: Math.min(PROBE_CONCURRENCY, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++
      out[index] = await worker(items[index])
    }
  })
  await Promise.all(runners)
  return out
}

const today = todayUtc()
const downSince = await previousDownSince()
/** Derived homepage per app id, kept for the report: the snapshot nulls dead ones. */
const derivedHomepage = new Map()

const apps = await mapLimit(registry, async (entry) => {
  const homepage = entry.homepage ?? null
  const domain = homepage ? new URL(homepage).hostname : null

  const [live, hasLogo] = homepage
    ? await Promise.all([responds(homepage), responds(`${SOURCE}/api/company/favicon/${domain}`)])
    : [false, false]
  if (homepage) derivedHomepage.set(entry.id, homepage)

  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.tooltipDescription ?? null,
    // Absent for AT Protocol apps; true for sources pulled from a third-party
    // API instead of a PDS (GitHub today).
    externallySourced: entry.externallySourced === true,
    // Only kept when the site answered, so the page never links somewhere dead.
    homepage: live ? homepage : null,
    // The date the homepage first failed, while it keeps failing.
    homepageDownSince: homepage ? nextDownSince(downSince.get(entry.id), live, today) : null,
    // The favicon proxy resolves the logo from the app's own site, so a new app
    // gets one without anybody adding an asset here.
    logo: hasLogo ? `${SOURCE}/api/company/favicon/${domain}` : null,
  }
})

apps.sort((a, b) => a.name.localeCompare(b.name))

const missing = apps.filter((a) => !a.id || !a.name || !a.category)
if (missing.length > 0) {
  console.error('fetch-app-registry: entries missing id, name or category:', missing)
  process.exit(1)
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(apps, null, 2)}\n`)

const report = longDownReport(
  apps.map((a) => ({
    name: a.name,
    url: derivedHomepage.get(a.id) ?? '',
    downSince: a.homepageDownSince,
  })),
  today,
  'The app itself stays supported. If the project is gone, remove it from the registry in sifa-api (`src/lib/atproto-app-registry.ts`); if it moved, add the new address to `HOMEPAGE_OVERRIDES` there.'
)
if (report) {
  await mkdir(dirname(REPORT), { recursive: true })
  await writeFile(REPORT, report)
}

const linked = apps.filter((a) => a.homepage).length
const logos = apps.filter((a) => a.logo).length
console.log(
  `fetch-app-registry: wrote ${apps.length} apps to ${OUT} ` +
    `(${linked} linked, ${logos} with a logo)` +
    (report ? `; some homepages down 7+ days, see ${REPORT}` : '')
)
