import { RootProvider } from 'fumadocs-ui/provider/next'
import { Source_Code_Pro } from 'next/font/google'
import Script from 'next/script'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'

// Self-hosted Umami (cookieless, aggregate page views), proxied same-origin
// under /u by Caddy. data-domains keeps local dev and previews out of the stats.
const UMAMI_WEBSITE_ID = 'bbae6816-1b97-416c-88a3-51d28be94c87'

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

// Space Grotesk -- headings + wordmark. Same file sifa-web ships.
const spaceGrotesk = localFont({
  src: '../public/fonts/space-grotesk/space-grotesk-bold.woff2',
  weight: '700',
  variable: '--font-space-grotesk',
  display: 'swap',
})

// iA Writer Quattro -- body text. Same files sifa-web ships.
const iaWriterQuattro = localFont({
  src: [
    {
      path: '../public/fonts/ia-writer-quattro/quattro-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/ia-writer-quattro/quattro-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../public/fonts/ia-writer-quattro/quattro-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../public/fonts/ia-writer-quattro/quattro-bold-italic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  variable: '--font-quattro',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://docs.sifa.id'),
  title: {
    default: 'Sifa Docs',
    template: '%s | Sifa Docs',
  },
  description: 'Documentation for Sifa, the decentralized professional network on the AT Protocol',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'Sifa Docs',
    images: ['/og/default.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og/default.png'],
  },
  icons: {
    // Explicit because setting `icons` here disables Next's file-convention
    // auto-link for app/icon.svg. favicon.ico is still auto-injected.
    icon: [{ url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' }],
    apple: { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
  colorScheme: 'dark light',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${sourceCodePro.variable} ${spaceGrotesk.variable} ${iaWriterQuattro.variable}`}
      suppressHydrationWarning
    >
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        <a
          href="#nd-page"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-fd-primary focus:px-4 focus:py-2 focus:text-fd-primary-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-fd-ring"
        >
          Skip to main content
        </a>
        <RootProvider
          theme={{
            defaultTheme: 'dark',
            enableSystem: true,
          }}
          search={{
            // Static export: the search index is built at compile time
            // and fetched as JSON from /api/search. See
            // app/api/search/route.ts.
            options: {
              type: 'static',
            },
          }}
        >
          {children}
        </RootProvider>
        <Script
          src="/u/script.js"
          data-website-id={UMAMI_WEBSITE_ID}
          data-domains="docs.sifa.id"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
