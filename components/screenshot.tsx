interface ScreenshotProps {
  src: string
  alt: string
  caption?: string
}

export function Screenshot({ src, alt, caption }: ScreenshotProps) {
  const href = `/screenshots/${src}`
  return (
    <figure className="my-6">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block overflow-hidden rounded-lg border border-fd-border"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={href} alt={alt} loading="lazy" decoding="async" className="w-full" />
      </a>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}
