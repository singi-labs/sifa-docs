'use client'

import { useSearchContext } from 'fumadocs-ui/contexts/search'

/**
 * Search field for the docs homepage. The homepage uses no docs layout, so it
 * has no sidebar search. This opens the same search dialog (also on Cmd/Ctrl+K).
 */
export function HomeSearch() {
  const { enabled, hotKey, setOpenSearch } = useSearchContext()
  if (!enabled) return null

  return (
    <button
      type="button"
      onClick={() => setOpenSearch(true)}
      className="mt-8 flex w-full max-w-lg items-center gap-3 rounded-lg border border-fd-border bg-fd-secondary/50 px-4 py-3 text-left text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fd-ring"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 shrink-0"
      >
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <span className="flex-1">Search the docs</span>
      <span className="hidden gap-1 sm:inline-flex">
        {hotKey.map((k, i) => (
          <kbd
            key={i}
            className="rounded border border-fd-border bg-fd-background px-1.5 font-mono text-xs"
          >
            {k.display}
          </kbd>
        ))}
      </span>
    </button>
  )
}
