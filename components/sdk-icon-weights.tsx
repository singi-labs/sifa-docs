import { iconSet, iconWeights } from '@singi-labs/sifa-sdk/tokens'

/**
 * Renders the SDK's icon-set convention and weight table. The SDK
 * doesn't ship icon SVGs (the Phosphor package is its own npm
 * dependency); it documents the convention so consumers know which
 * weight to pick in each context.
 */
export function SdkIconWeights() {
  const entries = Object.entries(iconWeights) as Array<[keyof typeof iconWeights, string]>

  return (
    <div className="my-6 space-y-4">
      <p className="text-sm text-fd-muted-foreground">
        Icon library convention: <span className="font-mono font-semibold">{iconSet}</span> (install
        separately with <span className="font-mono">npm i @phosphor-icons/react</span> in React,
        <span className="font-mono"> @phosphor-icons/web</span> elsewhere).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fd-border text-left">
              <th className="py-2 pr-4 font-semibold">Role</th>
              <th className="py-2 pr-4 font-semibold">Phosphor weight</th>
              <th className="py-2 font-semibold">When to use</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-fd-border/50">
              <td className="py-2 pr-4 font-mono">uiChrome</td>
              <td className="py-2 pr-4 font-mono">{iconWeights.uiChrome}</td>
              <td className="py-2 text-fd-muted-foreground">
                Buttons, nav, default UI state. Highest density of use.
              </td>
            </tr>
            <tr className="border-b border-fd-border/50">
              <td className="py-2 pr-4 font-mono">interactive</td>
              <td className="py-2 pr-4 font-mono">{iconWeights.interactive}</td>
              <td className="py-2 text-fd-muted-foreground">
                Selected items, primary buttons, active toggles.
              </td>
            </tr>
            <tr className="border-b border-fd-border/50">
              <td className="py-2 pr-4 font-mono">decorative</td>
              <td className="py-2 pr-4 font-mono">{iconWeights.decorative}</td>
              <td className="py-2 text-fd-muted-foreground">
                Empty states, hero sections, illustrative use only.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="text-xs text-fd-muted-foreground">
        {entries.length} weights exported. The convention is guidance, not enforced; tooling that
        wants to lint icon usage can reference the same constants.
      </p>
    </div>
  )
}
