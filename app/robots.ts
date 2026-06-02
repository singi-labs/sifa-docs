import type { MetadataRoute } from 'next'

// Required for `output: 'export'` (static export).
export const dynamic = 'force-static'

const SITE = 'https://docs.sifa.id'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everyone (including AI crawlers) is welcome. The whole point of docs
      // is that they're crawlable and ingestible. If we ever want to scope
      // this, add per-user-agent blocks below.
      { userAgent: '*', allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
