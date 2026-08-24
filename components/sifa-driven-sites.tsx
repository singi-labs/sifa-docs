import sites from '../content/data/site-showcase.json'

interface ShowcaseSite {
  url: string
  label: string
  handle?: string
  note?: string
  screenshot?: string
}

/**
 * Personal sites that render their owner's `id.sifa.*` records.
 *
 * Sourced from `content/data/site-showcase.json`, a curated list — unlike the
 * generated app registry, membership here is human-judged, because whether a
 * site is "driven by a Sifa profile" is not something we can detect reliably
 * (a static-build site bakes the data at build time and ships no runtime
 * marker). Thumbnails are captured on demand by `scripts/capture-showcase.ts`.
 * Liveness and per-entry provenance markers are checked on a schedule by
 * `scripts/check-showcase.ts`; see decisions/2026-08-23-sifa-driven-sites-
 * showcase.md in the Sifa workspace.
 */
export function SifaDrivenSites() {
  return (
    <ul className="my-6 grid list-none grid-cols-1 gap-4 pl-0 sm:grid-cols-2 lg:grid-cols-3">
      {(sites as ShowcaseSite[]).map((site) => (
        <li key={site.url} className="m-0">
          <a href={site.url} target="_blank" rel="noreferrer" className="group block no-underline">
            {site.screenshot ? (
              <span className="block aspect-[3/2] overflow-hidden rounded-lg border border-fd-border">
                {/* eslint-disable-next-line @next/next/no-img-element -- external showcase thumbnail, static export */}
                <img
                  src={`/showcase/${site.screenshot}`}
                  alt={`Screenshot of ${site.label}`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top transition-opacity group-hover:opacity-90"
                />
              </span>
            ) : null}
            <span className="mt-2 block text-sm">
              <span className="text-fd-primary underline underline-offset-2">{site.label}</span>
              {site.note ? <span className="text-fd-muted-foreground"> ({site.note})</span> : null}
            </span>
          </a>
        </li>
      ))}
    </ul>
  )
}
