/**
 * Health model for the Sifa-driven sites showcase
 * (content/data/site-showcase.json, rendered by components/sifa-driven-sites.tsx).
 *
 * We cannot prove a page is Sifa-driven — a static-build site (e.g. gui.do/cv)
 * bakes its Sifa data at build time and ships plain HTML with no runtime marker.
 * So each entry declares how to verify ITSELF: either a `marker` string we know
 * appears in that specific site's delivered assets, or `manual` for sites with
 * no reliable marker (checked by a human).
 *
 * The health check has two jobs, split by reliability:
 *   1. Liveness (reliable for every entry): the URL must return a 2xx. A 404 /
 *      dead domain is unambiguous — flag it.
 *   2. Drift (only where a marker exists): the entry's own marker must still be
 *      present. A site redesigned away from Sifa loses its marker. `manual`
 *      entries skip this and are surfaced for a human to eyeball.
 *
 * `classifyEntry` is pure so it can be unit-tested without the network. The
 * runner (check-showcase.ts) does the fetching and feeds it the result.
 */

export interface ShowcaseProvenanceMarker {
  mode: 'marker'
  /** A string known to appear in the delivered HTML or same-origin JS. */
  marker: string
  /** Fetch the marker from here instead of `url` (e.g. a homepage, not /about). */
  markerUrl?: string
}

export interface ShowcaseProvenanceManual {
  mode: 'manual'
  /** Why this site can't be auto-verified. */
  reason: string
}

export interface ShowcaseEntry {
  url: string
  label: string
  handle?: string
  note?: string
  provenance: ShowcaseProvenanceMarker | ShowcaseProvenanceManual
}

/** What the runner fetched: the marker-source page plus its same-origin JS. */
export interface FetchResult {
  /** true when the marker-source URL returned a 2xx status. */
  ok: boolean
  status: number
  /** HTML of the marker source concatenated with its same-origin JS bundles. */
  body: string
}

export type ShowcaseState = 'ok' | 'dead' | 'drifted' | 'manual'

export interface ShowcaseVerdict {
  entry: ShowcaseEntry
  state: ShowcaseState
  detail: string
}

/**
 * Decide an entry's health from what was fetched. Pure — no network.
 *
 * Liveness beats drift: a dead URL is reported as `dead` even for a `manual`
 * entry (a 404 is a 404 regardless of how we verify provenance).
 */
export function classifyEntry(entry: ShowcaseEntry, result: FetchResult): ShowcaseVerdict {
  if (!result.ok) {
    return { entry, state: 'dead', detail: `HTTP ${result.status}` }
  }

  if (entry.provenance.mode === 'manual') {
    return { entry, state: 'manual', detail: entry.provenance.reason }
  }

  const { marker, markerUrl } = entry.provenance
  const source = markerUrl ?? entry.url
  if (result.body.includes(marker)) {
    return { entry, state: 'ok', detail: `marker "${marker}" present` }
  }
  return { entry, state: 'drifted', detail: `marker "${marker}" not found at ${source}` }
}

/** A verdict that should fail the check and be surfaced for removal/review. */
export function isProblem(verdict: ShowcaseVerdict): boolean {
  return verdict.state === 'dead' || verdict.state === 'drifted'
}
