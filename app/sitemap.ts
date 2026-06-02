import type { MetadataRoute } from 'next'
import { source } from '../lib/source'

const SITE = 'https://docs.sifa.id'

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = source.getPages()
  return [
    {
      url: SITE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...pages.map((page) => ({
      url: `${SITE}${page.url}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
