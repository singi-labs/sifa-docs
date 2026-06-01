import Image from 'next/image'
import Link from 'next/link'
import { SiteFooter } from '../components/site-footer'

const sections = [
  {
    title: 'Create an account',
    description:
      'Sign in with your existing Bluesky, Eurosky, or other Atmosphere account, or create one in a minute.',
    href: '/docs/create-account',
  },
  {
    title: 'Import from LinkedIn',
    description:
      'Bring your positions, education, and skills across. Your LinkedIn ZIP is extracted in your browser and never leaves your device.',
    href: '/docs/import-linkedin',
  },
  {
    title: 'What is the Atmosphere?',
    description:
      'New to the AT Protocol? Start here. The open network Sifa is built on, in five short pages.',
    href: '/docs/what-is-the-atmosphere',
  },
  {
    title: 'Activity feed',
    description:
      'How Sifa decides what shows up on your profile: articles, reviews, and other work you create, not likes or bookmarks.',
    href: '/docs/activity-feed',
  },
  {
    title: 'Atom feeds',
    description:
      'Every Sifa profile publishes an Atom feed. Subscribe in NetNewsWire, Reeder, Feedly, or any reader. No Sifa account needed.',
    href: '/docs/atom-feeds',
  },
  {
    title: 'Standard.site cards',
    description:
      'Configure your own website so Sifa, Bluesky, and other AT Protocol apps render rich cards when you share a link.',
    href: '/docs/standard-site-cards',
  },
]

export default function HomePage() {
  return (
    <>
      <main className="flex flex-1 flex-col items-center px-4 py-16">
        <div className="flex flex-col items-center gap-4 text-center">
          <Image
            src="/sifa-logo-light.svg"
            alt=""
            width={72}
            height={72}
            className="dark:hidden"
            priority
          />
          <Image
            src="/sifa-logo-dark.svg"
            alt=""
            width={72}
            height={72}
            className="hidden dark:block"
            priority
          />
          <h1 className="font-display text-4xl font-bold tracking-tight">Sifa Docs</h1>
          <p className="max-w-lg text-fd-muted-foreground">
            Documentation for Sifa, the decentralized professional network on the AT Protocol.
          </p>
        </div>

        <div className="mt-12 grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-lg border border-fd-border p-6 transition-colors hover:border-fd-primary hover:bg-fd-accent/50"
            >
              <h2 className="mb-2 font-display text-lg font-bold group-hover:text-fd-primary">
                {section.title}
              </h2>
              <p className="text-sm text-fd-muted-foreground">{section.description}</p>
            </Link>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  )
}
