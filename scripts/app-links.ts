/**
 * Rule: a Sifa app route that is the same for every reader must be a link.
 *
 * Pages tell readers to "open your export page at sifa.id/settings/export".
 * Written as inline code or bare prose, that is a dead string the reader has
 * to retype. Every /settings/* route is universal -- no username, no domain,
 * no placeholder -- so it can always be a real link.
 *
 * Flagged: `sifa.id/settings/export`, https://sifa.id/settings/export in
 * prose, and a bare /settings/export path.
 * Accepted: the same route as the destination of a Markdown link or an
 * <a href>. Fenced code blocks and frontmatter are out of scope.
 *
 * Placeholder routes stay out of the rule on purpose. /p/<username> and
 * /c/<domain> differ per reader, so they belong in code, not in a link.
 *
 * Suppress one line with `{ /* links-allow: short reason *\/ }` on that line
 * or the line above.
 */

export interface LinkViolation {
  line: number
  /** The route text as it appears on the page. */
  match: string
  message: string
  excerpt: string
}

/**
 * Universal app routes. A segment here never contains reader-specific data,
 * which is what makes a fixed link correct for everyone.
 */
const UNIVERSAL_ROUTE = /(?:https?:\/\/)?(?:sifa\.id)?(\/settings\/[a-z0-9-]+)/g

const ALLOW_DIRECTIVE = /\{\s*\/\*\s*links-allow:\s*(.+?)\*\/\s*\}/

function blank(text: string): string {
  return text.replace(/[^\n]/g, ' ')
}

/**
 * Replaces every span that is out of scope with spaces, so offsets and line
 * numbers still line up with the source.
 */
export function maskAcceptedForms(source: string): string {
  let masked = source

  const mask = (pattern: RegExp): void => {
    masked = masked.replace(pattern, (match) => blank(match))
  }

  // Frontmatter: cannot hold a link, so the rule does not apply there.
  mask(/^---\n[\s\S]*?\n---/)
  // Fenced code blocks: real commands and snippets, not instructions to click.
  mask(/^```[\s\S]*?^```/gm)
  // Markdown links and <a href>: already clickable, text included.
  mask(/\[[^\]]*\]\([^)]*\)/g)
  mask(/<a\s[^>]*>[\s\S]*?<\/a>/g)

  return masked
}

function lineOf(source: string, offset: number): number {
  let line = 1
  for (let i = 0; i < offset; i += 1) {
    if (source[i] === '\n') line += 1
  }
  return line
}

function isAllowed(lines: string[], line: number): boolean {
  const current = lines[line - 1] ?? ''
  const previous = lines[line - 2] ?? ''
  return ALLOW_DIRECTIVE.test(current) || ALLOW_DIRECTIVE.test(previous)
}

export function checkSource(source: string): LinkViolation[] {
  const masked = maskAcceptedForms(source)
  const lines = source.split('\n')
  const violations: LinkViolation[] = []

  for (const match of masked.matchAll(UNIVERSAL_ROUTE)) {
    const offset = match.index ?? 0
    const line = lineOf(source, offset)
    if (isAllowed(lines, line)) continue
    const route = match[1] ?? ''
    violations.push({
      line,
      match: match[0],
      message: `${route} is the same page for every reader. Write it as a link: [${route.slice(1)}](https://sifa.id${route})`,
      excerpt: (lines[line - 1] ?? '').trim(),
    })
  }

  return violations
}
