#!/usr/bin/env node
/**
 * Copies content/docs/**.mdx to public/raw/**.md so each doc page has a
 * machine-readable source endpoint:
 *
 *   content/docs/activity-feed.mdx          -> /raw/activity-feed.md
 *   content/docs/sdk/reference/colors.mdx   -> /raw/sdk/reference/colors.md
 *
 * The HTML pages reference these via <link rel="alternate" type="text/markdown">
 * so agents can fetch the source instead of parsing HTML.
 *
 * Runs as part of `pnpm prebuild` so the files exist when Next.js copies
 * public/ to out/ during the static export.
 */

import { readdir, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const docsDir = join(root, 'content', 'docs')
const outDir = join(root, 'public', 'raw')

await rm(outDir, { recursive: true, force: true })
await mkdir(outDir, { recursive: true })

/**
 * Walks a directory recursively and yields absolute paths of every .mdx
 * file found. Skips dot-prefixed entries (e.g. `.DS_Store`).
 */
async function* walkMdx(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      yield* walkMdx(full)
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      yield full
    }
  }
}

let count = 0
for await (const filePath of walkMdx(docsDir)) {
  const raw = await readFile(filePath, 'utf8')
  const relPath = relative(docsDir, filePath).replace(/\.mdx$/, '.md')
  const outPath = join(outDir, relPath)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, raw)
  count++
}

console.log(`[copy-mdx-to-raw] wrote ${count} files to public/raw/`)
