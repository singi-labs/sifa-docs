import { fonts, fontFallbackStacks } from '@singi-labs/sifa-sdk/tokens'

/**
 * Renders the SDK's typography tokens as a three-row reference table.
 * Pulls live values from sifa-sdk at build time so any rebrand
 * propagates automatically.
 */
export function SdkTypography() {
  const rows = [
    {
      role: 'display',
      name: fonts.display,
      stack: fontFallbackStacks.display,
      sample: 'Atmosphere',
    },
    {
      role: 'sans',
      name: fonts.sans,
      stack: fontFallbackStacks.sans,
      sample: 'The quick brown fox',
    },
    {
      role: 'mono',
      name: fonts.mono,
      stack: fontFallbackStacks.mono,
      sample: 'goat account migrate',
    },
  ]

  return (
    <div className="my-6 space-y-3">
      {rows.map((row) => (
        <div key={row.role} className="rounded-lg border border-fd-border p-4">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-fd-muted-foreground">
              {row.role}
            </span>
            <span className="font-mono text-sm font-semibold">{row.name}</span>
          </div>
          <p className="mt-2 text-2xl" style={{ fontFamily: row.stack }}>
            {row.sample}
          </p>
          <p
            className="mt-2 break-all text-xs text-fd-muted-foreground"
            title="Fallback stack as exported by fontFallbackStacks"
          >
            {row.stack}
          </p>
        </div>
      ))}
    </div>
  )
}
