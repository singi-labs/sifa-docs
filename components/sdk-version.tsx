import sdkPackageJson from '@singi-labs/sifa-sdk/package.json' with { type: 'json' }

interface Props {
  /**
   * Render inline (as a bare span) rather than as a styled pill. Used
   * inside running prose where the surrounding sentence formatting
   * should stay intact.
   */
  inline?: boolean
}

/**
 * Renders the version of @singi-labs/sifa-sdk that this docs site is
 * pinned to at build time. Reads package.json at compile time so the
 * value lands in the static HTML; no client JS, no fetch.
 *
 * Usage in MDX:
 *   <SdkVersion />           => pill: "@singi-labs/sifa-sdk v0.9.18"
 *   <SdkVersion inline />    => "0.9.18"
 */
export function SdkVersion({ inline = false }: Props) {
  const version: string =
    typeof sdkPackageJson === 'object' && sdkPackageJson && 'version' in sdkPackageJson
      ? (sdkPackageJson.version as string)
      : 'unknown'

  if (inline) {
    return <span className="font-mono text-sm">{version}</span>
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-md border border-fd-border bg-fd-secondary/50 px-2 py-0.5 font-mono text-xs">
      <span className="text-fd-muted-foreground">@singi-labs/sifa-sdk</span>
      <span>v{version}</span>
    </span>
  )
}
