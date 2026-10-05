/**
 * Shared bookkeeping for external links the docs show but do not control: the
 * supported apps' homepages (fetch-app-registry.mjs) and the showcase sites
 * (check-showcase.ts).
 *
 * A link that fails its check is hidden right away, and the date it first
 * failed is kept in the committed data (`downSince`) so it survives between
 * scheduled runs. A link that comes back clears the date and shows again.
 * Once a link has been down for LONG_DOWN_DAYS, the workflow opens an issue so
 * a human decides whether to remove it: one failed check is not proof a
 * project is gone, a week of them usually is.
 */

export const LONG_DOWN_DAYS = 7

const DAY_MS = 24 * 60 * 60 * 1000

/** Today as YYYY-MM-DD (UTC), the format stored in the data files. */
export function todayUtc(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10)
}

/** The new `downSince` after a check: null when healthy, else the first failure date. */
export function nextDownSince(
  previous: string | null | undefined,
  healthy: boolean,
  today: string
): string | null {
  if (healthy) return null
  return previous ?? today
}

function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / DAY_MS)
}

/** Has this link been down for at least LONG_DOWN_DAYS? */
export function isLongDown(downSince: string | null | undefined, today: string): boolean {
  return downSince != null && daysBetween(downSince, today) >= LONG_DOWN_DAYS
}

export interface TrackedLink {
  name: string
  url: string
  downSince: string | null | undefined
}

/**
 * Markdown issue body listing the links down for LONG_DOWN_DAYS or more,
 * oldest first, followed by `action`. Null when there are none.
 */
export function longDownReport(links: TrackedLink[], today: string, action: string): string | null {
  const stale = links
    .filter((l) => isLongDown(l.downSince, today))
    .sort((a, b) => (a.downSince ?? '').localeCompare(b.downSince ?? ''))
  if (stale.length === 0) return null
  const lines = stale.map(
    (l) =>
      `- [${l.name}](${l.url}): down since ${l.downSince} (${daysBetween(l.downSince as string, today)} days)`
  )
  return [
    `These links have failed every daily check for ${LONG_DOWN_DAYS} days or more. They are already hidden on docs.sifa.id.`,
    '',
    ...lines,
    '',
    action,
    '',
    'This issue is updated by the daily check and closes itself once nothing is down this long.',
    '',
  ].join('\n')
}
