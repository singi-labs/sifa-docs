interface VideoProps {
  src: string
  poster?: string
  alt: string
  caption?: string
}

/**
 * A short, self-hosted video from `public/videos/`. The video has no
 * speech, so `alt` is the text alternative: it renders as a collapsible
 * description under the player and is linked to the video for screen
 * readers. `preload="none"` keeps the page light until the reader presses
 * play.
 */
export function Video({ src, poster, alt, caption }: VideoProps) {
  const href = `/videos/${src}`
  const descriptionId = `video-description-${src.replace(/[^a-z0-9]/gi, '-')}`
  return (
    <figure className="my-6">
      <video
        controls
        playsInline
        preload="none"
        poster={poster ? `/videos/${poster}` : undefined}
        aria-describedby={descriptionId}
        className="w-full overflow-hidden rounded-lg border border-fd-border"
      >
        <source src={href} type="video/mp4" />
      </video>
      {caption ? (
        <figcaption className="mt-2 text-center text-xs text-fd-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
      <details className="mt-2 text-sm text-fd-muted-foreground">
        <summary className="cursor-pointer">Video description</summary>
        <p id={descriptionId} className="mt-1">
          {alt}
        </p>
      </details>
    </figure>
  )
}
