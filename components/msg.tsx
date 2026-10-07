import type { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * A verbatim message the Sifa app shows on screen, quoted inside docs prose.
 *
 * Renders a `<samp>` (program output) in the body font with typographic
 * quotes, so it reads as "the app says this" rather than as code. Inline
 * code was the previous convention; its mono font and per-line border
 * fragment badly when a sentence wraps.
 *
 * The STE checker masks the content of `<Msg>` the same way it masks
 * inline code: the app's wording is quoted, not written here.
 *
 * Usage in MDX:
 *   The page shows <Msg>We couldn't save it. Try again later.</Msg>.
 */
export function Msg({ children }: Props) {
  return (
    <samp className="font-sans before:content-['\201C'] after:content-['\201D']">{children}</samp>
  )
}
