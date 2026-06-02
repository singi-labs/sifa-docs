import type { MetadataRoute } from 'next'

// Required for `output: 'export'` (static export).
export const dynamic = 'force-static'

const SITE = 'https://docs.sifa.id'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Everyone (including AI crawlers) is welcome by default. Docs only
      // work if they're crawlable and ingestible.
      { userAgent: '*', allow: '/' },

      // Explicit allowlist for the major AI crawlers. Belt and braces:
      // if a crawler honours the named entry over the wildcard, the answer
      // is still "yes please".
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'OAI-SearchBot', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'Claude-User', allow: '/' },
      { userAgent: 'Claude-SearchBot', allow: '/' },
      { userAgent: 'anthropic-ai', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Perplexity-User', allow: '/' },
      { userAgent: 'Google-Extended', allow: '/' },
      { userAgent: 'Applebot-Extended', allow: '/' },
      { userAgent: 'CCBot', allow: '/' },
      { userAgent: 'Bytespider', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  }
}
