import Link from 'next/link'

const sections = [
  {
    title: 'Activity feed',
    description:
      'How Sifa decides what shows up on your profile — articles, reviews, and other work you create, not likes or bookmarks.',
    href: '/docs/activity-feed',
  },
  {
    title: 'Adam feeds',
    description:
      'Curated feeds of professional content on the network. How they work and how to block topics you do not want to see.',
    href: '/docs/adam-feeds',
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
    <main className="flex min-h-screen flex-col items-center px-4 py-16">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sifa Docs</h1>
        <p className="max-w-lg text-fd-muted-foreground">
          Documentation for Sifa, the decentralized professional network on the AT Protocol.
        </p>
      </div>

      <div className="mt-12 grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group rounded-lg border border-fd-border p-6 transition-colors hover:border-fd-primary hover:bg-fd-accent/50"
          >
            <h2 className="mb-2 text-lg font-semibold group-hover:text-fd-primary">
              {section.title}
            </h2>
            <p className="text-sm text-fd-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}
