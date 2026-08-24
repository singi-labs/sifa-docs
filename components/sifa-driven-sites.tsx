import sites from '../content/data/site-showcase.json'

interface ShowcaseSite {
  url: string
  label: string
  handle?: string
  note?: string
}

/**
 * Personal sites that render their owner's `id.sifa.*` records.
 *
 * Sourced from `content/data/site-showcase.json`, a curated list — unlike the
 * generated app registry, membership here is human-judged, because whether a
 * site is "driven by a Sifa profile" is not something we can detect reliably
 * (a static-build site bakes the data at build time and ships no runtime
 * marker). Liveness and per-entry provenance markers are checked on a schedule
 * by `scripts/check-showcase.ts`; see decisions/2026-08-23-sifa-driven-sites-
 * showcase.md in the Sifa workspace.
 */
export function SifaDrivenSites() {
  return (
    <ul className="my-6 list-disc space-y-1 pl-6">
      {(sites as ShowcaseSite[]).map((site) => (
        <li key={site.url}>
          <a
            href={site.url}
            target="_blank"
            rel="noreferrer"
            className="text-fd-primary underline underline-offset-2"
          >
            {site.label}
          </a>
          {site.note ? <span className="text-fd-muted-foreground"> ({site.note})</span> : null}
        </li>
      ))}
    </ul>
  )
}
