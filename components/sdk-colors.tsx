import { colors } from '@singi-labs/sifa-sdk/tokens'

/**
 * Renders the SDK's brand-color tokens as a swatch grid. Values come from
 * @singi-labs/sifa-sdk/tokens at build time, so a future palette update
 * propagates here on the next docs rebuild.
 */
export function SdkColors() {
  const entries = Object.entries(colors) as Array<[string, string]>

  return (
    <div className="my-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map(([name, value]) => (
        <div key={name} className="flex items-center gap-4 rounded-lg border border-fd-border p-3">
          <div
            aria-hidden="true"
            className="h-12 w-12 shrink-0 rounded-md border border-fd-border"
            style={{ backgroundColor: value }}
          />
          <div className="min-w-0">
            <p className="font-mono text-sm font-semibold">{name}</p>
            <p className="font-mono text-xs text-fd-muted-foreground">{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
