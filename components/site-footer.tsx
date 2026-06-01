import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="border-t border-fd-border bg-fd-muted/40">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="font-display text-base font-bold">Sifa Docs</p>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-4 text-fd-muted-foreground">
            <li>
              <a
                href="https://sifa.id"
                className="hover:text-fd-foreground hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sifa
              </a>
            </li>
            <li>
              <a
                href="https://github.com/singi-labs/sifa-docs"
                className="hover:text-fd-foreground hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="https://singi.dev"
                className="hover:text-fd-foreground hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Singi Labs
              </a>
            </li>
            <li>
              <Link href="/docs" className="hover:text-fd-foreground hover:underline">
                Docs
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  )
}
