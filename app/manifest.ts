import type { MetadataRoute } from 'next'

// Required for `output: 'export'` (static export).
export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sifa Docs',
    short_name: 'Sifa Docs',
    description:
      'Documentation for Sifa, the decentralized professional network on the AT Protocol',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any', purpose: 'any' },
      { src: '/apple-icon', type: 'image/png', sizes: '180x180', purpose: 'any' },
      { src: '/favicon.ico', type: 'image/x-icon', sizes: '48x48' },
    ],
  }
}
