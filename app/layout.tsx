import { RootProvider } from 'fumadocs-ui/provider/next'
import { Source_Code_Pro } from 'next/font/google'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import './globals.css'

const sourceCodePro = Source_Code_Pro({
  subsets: ['latin'],
  variable: '--font-source-code',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Sifa Docs',
    template: '%s | Sifa Docs',
  },
  description: 'Documentation for Sifa, the decentralized professional network on the AT Protocol',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sourceCodePro.variable} suppressHydrationWarning>
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
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
