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
 * The health check has three outcomes, split by how confident we can be:
 *   1. Dead — we got an HTTP response and it was not 2xx (a real 404 / 410 /
 *      5xx). Unambiguous, fails the run.
 *   2. Drifted (only where a marker exists) — the page is live but the entry's
 *      own marker is gone. A site redesigned away from Sifa. Fails the run.
 *   3. Unreachable — the fetch never got an HTTP response (network error,
 *      timeout, or the host blocked the request, e.g. a Cloudflare 403 on a
 *      datacenter IP). We cannot tell a blocked request from a dead one, so
 *      this is advisory: surfaced for a human, never fails the run. A site
 *      that reliably blocks CI (e.g. gui.do) lands here rather than a false
 *      "dead".
 *
 * `classifyEntry` is pure so it can be unit-tested without the network. The
 * runner (check-showcase.ts) does the fetching (with retries) and feeds it the
 * result.
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
  /** true when the fetch got an HTTP response at all (any status). */
  reachable: boolean
  /** HTTP status when reachable; 0 when the fetch threw (no response). */
  status: number
  /** HTML of the marker source concatenated with its same-origin JS bundles. */
  body: string
}

export type ShowcaseState = 'ok' | 'dead' | 'drifted' | 'manual' | 'unreachable'

export interface ShowcaseVerdict {
  entry: ShowcaseEntry
  state: ShowcaseState
  detail: string
}

/**
 * Decide an entry's health from what was fetched. Pure — no network.
 *
 * Order matters: unreachable (no response) is distinguished from dead (a real
 * non-2xx response) so a host blocking CI is not mistaken for a 404. Liveness
 * beats drift: a dead URL is `dead` even for a `manual` entry.
 */
export function classifyEntry(entry: ShowcaseEntry, result: FetchResult): ShowcaseVerdict {
  if (!result.reachable) {
    return {
      entry,
      state: 'unreachable',
      detail: 'no HTTP response (network error, timeout, or the host blocked the request)',
    }
  }
  if (result.status < 200 || result.status >= 300) {
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

/**
 * A verdict that should fail the check and be surfaced for removal/review.
 * `unreachable` is deliberately NOT a problem — we cannot tell a blocked
 * request from a dead site, so it is advisory only.
 */
export function isProblem(verdict: ShowcaseVerdict): boolean {
  return verdict.state === 'dead' || verdict.state === 'drifted'
}
