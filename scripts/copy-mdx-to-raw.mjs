#!/usr/bin/env node
/**
 * Copies content/docs/*.mdx to public/raw/*.md so each doc page has a
 * machine-readable source endpoint:
 *
 *   /raw/activity-feed.md
 *   /raw/atom-feeds.md
 *   etc.
 *
 * The HTML pages reference these via <link rel="alternate" type="text/markdown">
 * so agents can fetch the source instead of parsing HTML.
 *
 * Runs as part of `pnpm prebuild` so the files exist when Next.js copies
 * public/ to out/ during the static export.
 */

import { readdir, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const docsDir = join(root, 'content', 'docs')
const outDir = join(root, 'public', 'raw')

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

const entries = await readdir(docsDir, { withFileTypes: true })
const files = entries.filter((e) => e.isFile() && e.name.endsWith('.mdx'))

let count = 0
for (const entry of files) {
  const raw = await readFile(join(docsDir, entry.name), 'utf8')
  const outName = entry.name.replace(/\.mdx$/, '.md')
  await writeFile(join(outDir, outName), raw)
  count++
}

console.log(`[copy-mdx-to-raw] wrote ${count} files to public/raw/`)
