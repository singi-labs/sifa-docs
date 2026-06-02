import { source } from '@/lib/source'
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/layouts/docs/page'
import { notFound } from 'next/navigation'
import { getMDXComponents } from '@/mdx-components'

const SITE = 'https://docs.sifa.id'

interface SidebarNode {
  type?: string
  name?: string
  url?: string
  children?: SidebarNode[]
}

/**
 * Walk the Fumadocs page tree to find the chain of ancestors leading to the
 * current page. Used for BreadcrumbList JSON-LD.
 */
function findBreadcrumb(
  node: SidebarNode,
  target: string,
  trail: SidebarNode[] = []
): SidebarNode[] | null {
  if (node.type === 'page' && node.url === target) return [...trail, node]
  if (node.children) {
    const next = node.type === 'folder' ? [...trail, node] : trail
    for (const child of node.children) {
      const found = findBreadcrumb(child, target, next)
      if (found) return found
    }
  }
  return null
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  const MDX = page.data.body

  const breadcrumbTrail = findBreadcrumb(source.pageTree as SidebarNode, page.url) ?? []

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: page.data.title,
    description: page.data.description,
    url: `${SITE}${page.url}`,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Sifa Docs',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Singi Labs',
      url: 'https://singi.dev',
    },
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Sifa Docs',
        item: SITE,
      },
      ...breadcrumbTrail.map((node, idx) => ({
        '@type': 'ListItem',
        position: idx + 2,
        name: node.name,
        item: node.url ? `${SITE}${node.url}` : undefined,
      })),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <DocsPage toc={page.data.toc} full={page.data.full}>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <DocsBody>
          <MDX components={getMDXComponents()} />
        </DocsBody>
      </DocsPage>
    </>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  const page = source.getPage(params.slug)
  if (!page) notFound()

  // The slug minus the /docs/ prefix is the filename of the raw markdown.
  // index.mdx is served at /docs (page.url === '/docs') so it maps to
  // /raw/index.md.
  const slugPath = page.url.replace(/^\/docs\/?/, '') || 'index'
  const rawUrl = `${SITE}/raw/${slugPath}.md`

  return {
    title: page.data.title,
    description: page.data.description,
    alternates: {
      canonical: page.url,
      types: {
        'text/markdown': rawUrl,
      },
    },
    openGraph: {
      title: page.data.title,
      description: page.data.description,
      url: page.url,
      type: 'article',
    },
    twitter: {
      title: page.data.title,
      description: page.data.description,
    },
  }
}
