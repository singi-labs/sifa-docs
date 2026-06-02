import { readFile, readdir } from 'node:fs/promises'
import { join } from 'node:path'

export const dynamic = 'force-static'

const SITE = 'https://docs.sifa.id'
const DOCS_DIR = join(process.cwd(), 'content', 'docs')

/**
 * Serves /llms-full.txt: every doc page concatenated as raw Markdown. Lets
 * an LLM ingest the entire site in one request without HTML parsing or
 * per-page roundtrips.
 *
 * Each page is delimited by an HTTP-style preamble so a reader can split on
 * the URL header reliably.
 */
export async function GET() {
  const entries = await readdir(DOCS_DIR, { withFileTypes: true })
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.mdx'))
    .map((e) => e.name)
    .sort()

  const blocks: string[] = []
  blocks.push('# Sifa Docs: full corpus\n')
  blocks.push(
    '> Every page on docs.sifa.id concatenated as Markdown, for offline ingestion by LLMs and agents. Each section is preceded by its canonical URL.\n'
  )

  for (const name of files) {
    const slug = name === 'index.mdx' ? '' : name.replace(/\.mdx$/, '')
    const url = slug ? `${SITE}/docs/${slug}` : SITE
    const raw = await readFile(join(DOCS_DIR, name), 'utf8')
    blocks.push(`\n---\n\n## ${url}\n\n${raw.trim()}\n`)
  }

  return new Response(blocks.join(''), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
