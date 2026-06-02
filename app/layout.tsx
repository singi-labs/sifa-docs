import { RootProvider } from 'fumadocs-ui/provider/next'
import { Source_Code_Pro } from 'next/font/google'
import localFont from 'next/font/local'
import type { ReactNode } from 'react'
import type { Metadata, Viewport } from 'next'
import './globals.css'

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
        >
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
