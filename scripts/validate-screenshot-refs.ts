/**
 * Cross-checks <Screenshot src="..."> references in content/**.mdx against
 * the targets list in scripts/screenshot-targets.ts.
 *
 * Errors (exit 1):
 *   - An MDX embed references a name that has no target entry.
 *
 * Warnings (exit 0, but printed):
 *   - A target entry has no MDX embed pointing at it.
 *
 * This script is intentionally minimal — a regex pass over the MDX files
 * and a string match against the target names. It does NOT check whether
 * the PNG itself exists in public/screenshots/, because PNGs are produced
 * by the workflow after the target is added; CI would otherwise block
 * target-only PRs.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { targets } from './screenshot-targets'

const CONTENT_DIR = path.resolve(process.cwd(), 'content')

function walkMdx(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...walkMdx(full))
    } else if (entry.endsWith('.mdx')) {
      out.push(full)
    }
  }
  return out
}

interface Reference {
  file: string
  line: number
  src: string
}

function extractReferences(file: string): Reference[] {
  const text = readFileSync(file, 'utf8')
  const out: Reference[] = []
  // <Screenshot ...> tags are prettier-formatted across multiple lines, so
  // we scan with /s and resolve the source-line number from the match index.
  const pattern = /<Screenshot\b[^>]*?\bsrc\s*=\s*["']([^"']+)["'][^>]*?\/?\s*>/gs
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const line = text.slice(0, match.index).split('\n').length
    out.push({ file, line, src: match[1] })
  }
  return out
}

function main(): void {
  const targetNames = new Set(targets.map((t) => t.name))
  const referencedNames = new Set<string>()
  const errors: string[] = []

  const mdxFiles = walkMdx(CONTENT_DIR)
  for (const file of mdxFiles) {
    for (const ref of extractReferences(file)) {
      const name = ref.src.replace(/\.png$/, '')
      referencedNames.add(name)
      if (!targetNames.has(name)) {
        const rel = path.relative(process.cwd(), ref.file)
        errors.push(
          `${rel}:${ref.line}: <Screenshot src="${ref.src}"> references unknown target "${name}". ` +
            `Add it to scripts/screenshot-targets.ts.`
        )
      }
    }
  }

  for (const name of targetNames) {
    if (!referencedNames.has(name)) {
      console.warn(`warn: target "${name}" is not embedded in any MDX file.`)
    }
  }

  if (errors.length > 0) {
    for (const err of errors) {
      console.error(`error: ${err}`)
    }
    console.error(`\n${errors.length} broken <Screenshot> reference(s).`)
    process.exit(1)
  }

  console.log(
    `ok: ${referencedNames.size} embed(s) across ${mdxFiles.length} MDX file(s), ` +
      `${targetNames.size} target(s) defined.`
  )
}

main()
