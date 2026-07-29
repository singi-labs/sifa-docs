import apps from '../content/data/app-registry.json'

interface App {
  id: string
  name: string
  category: string
  description: string | null
  externallySourced: boolean
}

/**
 * Every app Sifa reads activity from, grouped by category.
 *
 * Sourced from `content/data/app-registry.json`, a committed snapshot of the
 * live registry in sifa-api (`scripts/fetch-app-registry.mjs`). Generated
 * rather than hand-written so the page can't quietly fall behind the product.
 */
export function SupportedApps() {
  const byCategory = new Map<string, App[]>()
  for (const app of apps as App[]) {
    const list = byCategory.get(app.category) ?? []
    list.push(app)
    byCategory.set(app.category, list)
  }

  const categories = [...byCategory.entries()].sort(([a], [b]) => a.localeCompare(b))

  return (
    <div className="my-6">
      <p className="mb-4 text-sm text-fd-muted-foreground">
        {(apps as App[]).length} apps, grouped by the category they appear under on your profile.
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
                      {app.name}
                      {app.externallySourced && (
                        <span className="ml-2 text-xs text-fd-muted-foreground">
                          (not on the Atmosphere)
                        </span>
                      )}
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
