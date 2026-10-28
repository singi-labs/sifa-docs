'use client'

import { useEffect, useRef, useState } from 'react'

const EMBED_ORIGIN = 'https://sifa.id'
const EMBED_URL = `${EMBED_ORIGIN}/embed/featured`
// Card height before the embed reports its real size, and without JavaScript.
const DEFAULT_HEIGHT = 260

/**
 * Live card for the most recent featured profile, served by sifa.id. The docs
 * page stays static: the card inside the iframe changes each weekday without
 * a docs rebuild. The embed posts its height, so the frame fits the card.
 */
export function FeaturedProfileEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== EMBED_ORIGIN) return
      if (event.source !== frameRef.current?.contentWindow) return
      const data = event.data as { type?: unknown; height?: unknown } | null
      if (data?.type === 'sifa-embed-resize' && typeof data.height === 'number') {
        setHeight(Math.ceil(data.height))
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <iframe
      ref={frameRef}
      src={EMBED_URL}
      title="Most recent featured profile on Sifa"
      loading="lazy"
      height={height}
      className="my-6 block w-full max-w-xl border-0"
    />
  )
}
