/**
 * Runs the universal-route link check over every MDX page in content/.
 *
 * Rule implementation and rationale live in scripts/app-links.ts.
 *
 * Exit 1 on any violation. Suppress a single line with
 * `{ /* links-allow: short reason *\/ }` on that line or the line above.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { checkSource, type LinkViolation } from './app-links'

const CONTENT_DIR = path.resolve(process.cwd(), 'content')

function walkMdx(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) {
      out.push(...walkMdx(full))
    } else if (entry.endsWith('.mdx')) {
      out.push(full)
    }
  }
  return out.sort()
}

// With no arguments, check the whole corpus. With arguments, check only
// those files, which is what you want while you edit one page.
const requested = process.argv.slice(2)
const files =
  requested.length > 0 ? requested.map((file) => path.resolve(file)) : walkMdx(CONTENT_DIR)
let total = 0

for (const file of files) {
  const relative = path.relative(process.cwd(), file)
  const violations: LinkViolation[] = checkSource(readFileSync(file, 'utf8'))
  if (violations.length === 0) continue
  total += violations.length
  console.error(`\n${relative}`)
  for (const violation of violations) {
    console.error(`  ${relative}:${violation.line}  ${violation.message}`)
    console.error(`      ${violation.excerpt}`)
  }
}

if (total === 0) {
  console.log(`App-link check passed. ${files.length} pages, no unlinked universal routes.`)
  process.exit(0)
}

console.error(`\nApp-link check failed: ${total} unlinked routes across ${files.length} pages.`)
process.exit(1)
