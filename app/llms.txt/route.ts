import { source } from '@/lib/source'

// Static export needs this on every route handler.
export const dynamic = 'force-static'

const SITE = 'https://docs.sifa.id'

/**
 * Serves /llms.txt in the proposed llmstxt.org format.
 *
 * Format:
 *   # Title
 *   > one-line summary of the site
 *   ## Section heading
 *   - [Page title](url): page summary
 *
 * The section grouping mirrors content/docs/meta.json so the file structure
 * matches what humans see in the sidebar.
 */
export function GET() {
  const pages = source.getPages()

  // Group pages by their sidebar section by walking source.pageTree.
  const tree = source.pageTree
  const lines: string[] = []

  lines.push('# Sifa Docs')
  lines.push('')
  lines.push(
    '> Documentation for Sifa, the decentralized professional network on the AT Protocol. Covers account creation, importing from LinkedIn, custom-domain handles, the open-network model the Atmosphere is built on, profile activity rules, Atom-feed subscriptions, external-account linking, Standard.site link cards, and account-migration / privacy reference material.'
  )
  lines.push('')

  // Recursively walk the page tree, emitting headings for folders and links
  // for pages.
  function walk(node: (typeof tree)['children'][number], depth: number) {
    if (node.type === 'folder' || (node as { type?: string }).type === 'separator') {
      const heading = '#'.repeat(Math.max(2, depth + 1))
      const name = 'name' in node ? String(node.name) : ''
      if (name) {
        lines.push(`${heading} ${name}`)
        lines.push('')
      }
      if ('children' in node && Array.isArray(node.children)) {
        for (const child of node.children) walk(child, depth + 1)
      }
    } else if (node.type === 'page') {
      const url = `${SITE}${node.url}`
      // Look up the description from getPages() since the tree node only has title.
      const page = pages.find((p) => p.url === node.url)
      const desc = page?.data.description?.trim() ?? ''
      const suffix = desc ? `: ${desc}` : ''
      lines.push(`- [${node.name}](${url})${suffix}`)
    }
  }

  for (const child of tree.children) {
    walk(child, 1)
  }
  lines.push('')

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
