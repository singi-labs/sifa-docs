import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { SiteFooter } from '../components/site-footer'

export const metadata: Metadata = {
  title: 'Page not found',
  description: "The page you're looking for doesn't exist on docs.sifa.id.",
  robots: {
    index: false,
    follow: true,
  },
}

const popularPages = [
  { title: 'Create a Sifa account', href: '/docs/create-account' },
  { title: 'Import from LinkedIn', href: '/docs/import-linkedin' },
  { title: 'What is the Atmosphere?', href: '/docs/what-is-the-atmosphere' },
  { title: 'Activity feed', href: '/docs/activity-feed' },
  { title: 'Standard.site cards', href: '/docs/standard-site-cards' },
]

export default function NotFound() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center px-4 py-16">
        <div className="flex max-w-lg flex-col items-center gap-4 text-center">
          <Image
            src="/sifa-logo-light.svg"
            alt=""
            width={64}
            height={64}
            className="dark:hidden"
            priority
          />
          <Image
            src="/sifa-logo-dark.svg"
            alt=""
            width={64}
            height={64}
            className="hidden dark:block"
            priority
          />
          <p className="font-mono text-xs uppercase tracking-wider text-fd-muted-foreground">404</p>
          <h1 className="font-display text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="text-fd-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist on docs.sifa.id. It may have
            moved, the URL may have a typo, or it may never have existed in the first place.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 rounded-md bg-fd-primary px-4 py-2 text-sm font-medium text-fd-primary-foreground transition-colors hover:bg-fd-primary/90"
          >
            Back to the docs index
          </Link>
        </div>

        <div className="mt-12 w-full max-w-2xl">
          <h2 className="mb-4 text-center text-xs font-bold uppercase tracking-wider text-fd-muted-foreground">
            Popular pages
          </h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {popularPages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="block rounded-lg border border-fd-border px-4 py-3 text-sm transition-colors hover:border-fd-primary hover:bg-fd-accent/50 hover:text-fd-primary"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-center text-sm text-fd-muted-foreground">
            Still can&apos;t find what you&apos;re looking for?{' '}
            <a
              href="https://github.com/singi-labs/sifa-docs/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-fd-primary underline underline-offset-4 hover:text-fd-primary/80"
            >
              Open an issue
            </a>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
