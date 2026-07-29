/**
 * Snapshot the live app registry to `content/data/app-registry.json`.
 *
 * The registry is the source of truth for which AT Protocol apps Sifa reads
 * activity from, and it lives in sifa-api. Rather than fetch it during
 * `next build`, which would put a third-party network call on the critical
 * path of every deploy, this writes a committed snapshot that a scheduled
 * workflow refreshes. Same shape as the screenshot pipeline.
 *
 * Only the fields the docs render are kept, so an unrelated registry change
 * doesn't churn the diff.
 *
 * Usage: node scripts/fetch-app-registry.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'

const SOURCE = process.env.SIFA_API_URL ?? 'https://sifa.id'
const ENDPOINT = `${SOURCE}/api/apps/registry`
const OUT = 'content/data/app-registry.json'

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

const apps = registry
  .map((entry) => ({
    id: entry.id,
    name: entry.name,
    category: entry.category,
    description: entry.tooltipDescription ?? null,
    // Absent for AT Protocol apps; true for sources pulled from a third-party
    // API instead of a PDS (GitHub today).
    externallySourced: entry.externallySourced === true,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

const missing = apps.filter((a) => !a.id || !a.name || !a.category)
if (missing.length > 0) {
  console.error('fetch-app-registry: entries missing id, name or category:', missing)
  process.exit(1)
}

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, `${JSON.stringify(apps, null, 2)}\n`)

console.log(`fetch-app-registry: wrote ${apps.length} apps to ${OUT}`)
