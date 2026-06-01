import { ACTIVITY_TIERS } from '@singi-labs/sifa-sdk'
import type { ActivityTier, LexiconEntry } from '@singi-labs/sifa-sdk'

interface Row {
  nsid: string
  entry: LexiconEntry
}

function rowsForTier(tier: ActivityTier): Row[] {
  return Object.entries(ACTIVITY_TIERS.lexicons)
    .filter(([, entry]) => entry.tier === tier)
    .map(([nsid, entry]) => ({ nsid, entry }))
    .sort((a, b) => a.nsid.localeCompare(b.nsid))
}

interface ActivityRegistryProps {
  tier: ActivityTier
}

export function ActivityRegistry({ tier }: ActivityRegistryProps) {
  const rows = rowsForTier(tier)
  const meta = ACTIVITY_TIERS.tiers[tier]

  return (
    <div className="my-6">
      <p className="mb-3 text-sm text-fd-muted-foreground">{meta.description}</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-fd-border text-left">
              <th className="py-2 pr-4 font-semibold">Lexicon</th>
              <th className="py-2 pr-4 font-semibold">App</th>
              <th className="py-2 font-semibold">Notes</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ nsid, entry }) => (
              <tr key={nsid} className="border-b border-fd-border/50">
                <td className="py-2 pr-4 font-mono text-xs">{nsid}</td>
                <td className="py-2 pr-4 text-fd-muted-foreground">{entry.app ?? '—'}</td>
                <td className="py-2 text-fd-muted-foreground">{entry.notes ?? ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-fd-muted-foreground">
        Source:{' '}
        <a
          href="https://github.com/singi-labs/sifa-sdk/blob/main/src/taxonomy/activity-tiers.json"
          className="underline"
        >
          @singi-labs/sifa-sdk
        </a>{' '}
        v{ACTIVITY_TIERS.version} (updated {ACTIVITY_TIERS.updated}). This table is regenerated from
        the SDK at build time; if it looks stale, the docs site needs to be rebuilt against a newer
        SDK release.
      </p>
    </div>
  )
}
