/**
 * Runs the Simplified Technical English check over every MDX page in content/.
 *
 * Rule reference: decisions/2026-08-06-docs-simplified-technical-english.md in
 * the Sifa workspace. Rule implementations live in scripts/ste.ts.
 *
 * Exit 1 on any violation. Suppress a single line with
 * `{ /* ste-allow: S4 short reason *\/ }` on that line or the line above.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { checkSource, type Violation } from './ste'

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

const files = walkMdx(CONTENT_DIR)
let total = 0
const byRule = new Map<string, number>()

for (const file of files) {
  const relative = path.relative(process.cwd(), file)
  const violations: Violation[] = checkSource(readFileSync(file, 'utf8'))
  if (violations.length === 0) continue
  total += violations.length
  console.error(`\n${relative}`)
  for (const violation of violations) {
    byRule.set(violation.rule, (byRule.get(violation.rule) ?? 0) + 1)
    console.error(`  ${relative}:${violation.line}  [${violation.rule}] ${violation.message}`)
    console.error(`      ${violation.excerpt}`)
  }
}

if (total === 0) {
  console.log(`STE check passed. ${files.length} pages, no violations.`)
  process.exit(0)
}

console.error(`\nSTE check failed: ${total} violations across ${files.length} pages.`)
for (const [rule, count] of [...byRule].sort()) {
  console.error(`  ${rule}: ${count}`)
}
console.error(
  '\nRules: decisions/2026-08-06-docs-simplified-technical-english.md (Sifa workspace).'
)
process.exit(1)
