import apps from '../content/data/app-registry.json'

interface App {
  id: string
  name: string
  category: string
  description: string | null
  externallySourced: boolean
  homepage: string | null
  logo: string | null
}

/**
 * Every app Sifa reads activity from, grouped by category.
 *
 * Sourced from `content/data/app-registry.json`, a committed snapshot of the
 * live registry in sifa-api (`scripts/fetch-app-registry.mjs`). Generated
 * rather than hand-written so the page can't quietly fall behind the product.
 *
 * Logos come from Sifa's favicon proxy, resolved from each app's own site, so a
 * newly onboarded app gets one without anybody adding an asset here. Both the
 * logo and the link are probed when the snapshot is taken, so anything absent
 * from the data is something that did not respond rather than something to
 * handle at render time. That keeps this a plain static export.
 */
export function SupportedApps() {
  const byCategory = new Map<string, App[]>()
  for (const app of apps as App[]) {
    const list = byCategory.get(app.category) ?? []
    list.push(app)
    byCategory.set(app.category, list)
  }

  const categories = [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))
  const total = (apps as App[]).length

  return (
    <div className="my-6">
      <p className="mb-4 text-sm text-fd-muted-foreground">
        {total} apps, grouped by the category they appear under on your profile.
      </p>
      {categories.map(([category, list]) => (
        <div key={category} className="mb-6">
          <h3 className="mb-2 text-sm font-semibold">{category}</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fd-border text-left">
                  <th className="py-2 pr-4 font-medium">App</th>
                  <th className="py-2 font-medium">What it is</th>
                </tr>
              </thead>
              <tbody>
                {list.map((app) => (
                  <tr key={app.id} className="border-b border-fd-border/50">
                    <td className="py-2 pr-4 align-top whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        {app.logo ? (
                          // eslint-disable-next-line @next/next/no-img-element -- external origin, static export
                          <img
                            src={app.logo}
                            alt=""
                            width={16}
                            height={16}
                            className="size-4 shrink-0 rounded-sm"
                            loading="lazy"
                          />
                        ) : (
                          <span
                            aria-hidden="true"
                            className="size-4 shrink-0 rounded-sm bg-fd-muted"
                          />
                        )}
                        {app.homepage ? (
                          <a href={app.homepage} rel="noopener noreferrer" target="_blank">
                            {app.name}
                          </a>
                        ) : (
                          app.name
                        )}
                        {app.externallySourced && (
                          <span className="text-xs text-fd-muted-foreground">
                            (not on the Atmosphere)
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="py-2 align-top text-fd-muted-foreground">
                      {app.description ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
