'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const EMBED_ORIGIN = 'https://sifa.id'
// frame=panel gives the card the same rounded panel it has on sifa.id.
const EMBED_URL = `${EMBED_ORIGIN}/embed/featured?frame=panel`
// Card height before the embed reports its real size, and without JavaScript.
const DEFAULT_HEIGHT = 260

type DocsTheme = 'light' | 'dark'

// The docs theme toggle sets the `dark` class on <html>. Watch it so the card
// follows the docs theme, not only the system setting.
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

function getTheme(): DocsTheme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

// Server render and no-JS: no theme param, so the embed follows the system setting.
function getServerTheme(): DocsTheme | null {
  return null
}

/**
 * Live card for the most recent featured profile, served by sifa.id. The docs
 * page stays static: the card inside the iframe changes each weekday without
 * a docs rebuild. The embed posts its height, so the frame fits the card,
 * and it gets the docs theme, so the card matches light or dark mode.
 */
export function FeaturedProfileEmbed() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(DEFAULT_HEIGHT)
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme)
  const src = theme ? `${EMBED_URL}&theme=${theme}` : EMBED_URL

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
      src={src}
      title="Most recent featured profile on Sifa"
      loading="lazy"
      height={height}
      className="my-6 block w-full max-w-xl border-0"
    />
  )
}
