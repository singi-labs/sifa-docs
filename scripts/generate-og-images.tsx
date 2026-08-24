#!/usr/bin/env tsx
/**
 * Generates OpenGraph social-preview PNGs into public/og/ at build time:
 *
 *   public/og/default.png                 -- generic card (home page + fallback)
 *   public/og/docs/<slug>.png             -- one per doc page, showing its title
 *   public/apple-icon.png                 -- apple touch icon (180x180)
 *
 * Why real .png files instead of the Next.js `opengraph-image` metadata route:
 *   1. The metadata convention emits an EXTENSIONLESS file (`out/opengraph-image`).
 *      Caddy serves it with no `Content-Type`, and the site sends
 *      `x-content-type-options: nosniff`, so social scrapers reject it. A file
 *      with a `.png` extension is MIME-mapped to `image/png` correctly.
 *   2. The metadata convention cannot live under the docs' optional catch-all
 *      route (`app/docs/[[...slug]]`) -- Next requires a catch-all to be the last
 *      URL part -- so per-page images are impossible that way.
 *
 * The PNGs are referenced via `openGraph.images` / `twitter.images` in
 * app/layout.tsx (default) and app/docs/[[...slug]]/page.tsx (per page).
 *
 * Runs as part of `pnpm prebuild` so the files exist in public/ when Next.js
 * copies public/ to out/ during the static export. Output is gitignored.
 */

import { createRequire } from 'node:module'
import { readdir, mkdir, readFile, writeFile, rm } from 'node:fs/promises'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { colors } from '@singi-labs/sifa-sdk/tokens'

// next/og is authored for the Next runtime; its ESM subpath does not resolve
// under plain node ESM, but the CJS entry does. createRequire uses the public
// `next/og` subpath (not a fragile internal deep import).
const require = createRequire(import.meta.url)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { ImageResponse } = require('next/og') as any

const SIZE = { width: 1200, height: 630 }
const APPLE_SIZE = { width: 180, height: 180 }
const TAGLINE = 'Documentation for Sifa on the AT Protocol'

const here = dirname(fileURLToPath(import.meta.url))
const root = dirname(here)
const docsDir = join(root, 'content', 'docs')
const publicDir = join(root, 'public')
const outDir = join(publicDir, 'og')

/** Sifa logo mark. Identical paths to the sifa-web OG; fills from sifa-sdk tokens. */
function SifaMark({ size }: { size: number }) {
  return (
    <svg viewBox="0 0 256 256" width={size} height={size}>
      <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
        <path
          d="M128,71.5C159.183,71.5 184.5,96.817 184.5,128C184.5,159.183 159.183,184.5 128,184.5C96.817,184.5 71.5,159.183 71.5,128C71.5,96.817 96.817,71.5 128,71.5ZM128,104.5C115.03,104.5 104.5,115.03 104.5,128C104.5,140.97 115.03,151.5 128,151.5C140.97,151.5 151.5,140.97 151.5,128C151.5,115.03 140.97,104.5 128,104.5Z"
          fill={colors.primary}
        />
      </g>
      <g transform="matrix(0.333333,0,0,0.333333,37.583333,37.083333)">
        <path
          d="M174.866,194.259C182.45,189.218 192.7,191.282 197.741,198.866C202.782,206.45 200.718,216.7 193.134,221.741C175.432,233.507 150.846,240.5 128,240.5C66.284,240.5 15.5,189.716 15.5,128C15.5,66.284 66.284,15.5 128,15.5C189.716,15.5 240.5,66.284 240.5,128C240.5,160.538 225.46,184.5 196,184.5C166.54,184.5 151.5,160.538 151.5,128L151.5,88C151.5,78.893 158.893,71.5 168,71.5C177.107,71.5 184.5,78.893 184.5,88L184.5,128C184.5,134.408 185.237,140.363 187.279,145.164C188.851,148.858 191.536,151.5 196,151.5C200.464,151.5 203.149,148.858 204.721,145.164C206.763,140.363 207.5,134.408 207.5,128C207.5,84.388 171.612,48.5 128,48.5C84.388,48.5 48.5,84.388 48.5,128C48.5,171.612 84.388,207.5 128,207.5C144.415,207.5 162.148,202.713 174.866,194.259Z"
          fill={colors.primary}
        />
      </g>
      <path
        d="M176,47.75 L208,79.75 L176,111.75 L144,79.75 Z"
        fill="none"
        stroke="#FFFCF0"
        strokeWidth="12"
      />
      <path d="M80,144 L112,176 L80,208 L48,176 Z" fill="none" stroke="#FFFCF0" strokeWidth="12" />
      <path d="M152,192 L176,160 L200,192" fill="none" stroke={colors.secondary} strokeWidth="11" />
    </svg>
  )
}

/** Corner pill so readers can tell this is the docs property, not the app. */
function DocsPill() {
  return (
    <div
      style={{
        padding: '8px 18px',
        borderRadius: 999,
        backgroundColor: colors.primary,
        color: '#ffffff',
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: '0.08em',
      }}
    >
      DOCS
    </div>
  )
}

/** Per-page card: logo + wordmark, DOCS pill, big left-aligned title + description. */
function DocCard({ title, description }: { title: string; description: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        backgroundColor: '#1a1a1a',
        color: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <SifaMark size={64} />
          <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em' }}>Sifa Docs</span>
        </div>
        <DocsPill />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        <div
          style={{
            display: 'flex',
            fontSize: 68,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.05,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 24,
            fontSize: 28,
            color: '#a3a3a3',
            lineHeight: 1.35,
            maxWidth: 980,
          }}
        >
          {description}
        </div>
      </div>

      <div style={{ display: 'flex', fontSize: 22, color: '#6b6f76' }}>docs.sifa.id</div>
    </div>
  )
}

/** Generic centered card for the home page and as a fallback. Mirrors the sifa.id default OG. */
function DefaultCard() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1a1a1a',
        color: '#fafafa',
        fontFamily: 'system-ui, sans-serif',
        position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: 40, right: 40, display: 'flex' }}>
        <DocsPill />
      </div>
      <div style={{ display: 'flex', marginBottom: 32 }}>
        <SifaMark size={120} />
      </div>
      <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
        Sifa Docs
      </div>
      <div style={{ fontSize: 28, color: '#a3a3a3' }}>{TAGLINE}</div>
    </div>
  )
}

/** Apple touch icon: the logo mark on the manifest's dark background. */
function AppleIcon() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0a0a',
      }}
    >
      <SifaMark size={140} />
    </div>
  )
}

/**
 * Minimal YAML frontmatter reader for `title` / `description`. Doc frontmatter
 * is flat single-line scalars, so a full YAML parser is unnecessary. Strips one
 * layer of matching surrounding quotes.
 */
function readFrontmatter(raw: string): { title?: string; description?: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(raw)
  if (!match?.[1]) return {}
  const out: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    const key = kv?.[1]
    let value = kv?.[2]?.trim()
    if (key === undefined || value === undefined) continue
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return { title: out.title, description: out.description }
}

async function* walkMdx(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) yield* walkMdx(full)
    else if (entry.isFile() && entry.name.endsWith('.mdx')) yield full
  }
}

async function renderPng(
  element: React.ReactElement,
  outPath: string,
  size: { width: number; height: number } = SIZE
) {
  const buffer = Buffer.from(await new ImageResponse(element, size).arrayBuffer())
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, buffer)
}

async function main() {
  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  await renderPng(<DefaultCard />, join(outDir, 'default.png'))
  // Apple touch icon lives at the public root (served as /apple-icon.png), not
  // under /og. Replaces the extensionless app/apple-icon.tsx metadata route,
  // which Caddy served without a Content-Type (same bug as the OG images).
  await renderPng(<AppleIcon />, join(publicDir, 'apple-icon.png'), APPLE_SIZE)

  let count = 0
  for await (const filePath of walkMdx(docsDir)) {
    const raw = await readFile(filePath, 'utf8')
    const { title, description } = readFrontmatter(raw)
    const rawDescription = description ?? TAGLINE
    const clamped =
      rawDescription.length > 160 ? `${rawDescription.slice(0, 157).trimEnd()}…` : rawDescription
    // content/docs/sdk/reference/x.mdx -> public/og/docs/sdk/reference/x.png
    const slug = relative(docsDir, filePath).replace(/\.mdx$/, '')
    await renderPng(
      <DocCard title={title ?? 'Sifa Docs'} description={clamped} />,
      join(outDir, 'docs', `${slug}.png`)
    )
    count++
  }

  console.log(
    `[generate-og-images] wrote apple-icon.png + og/default.png + ${count} per-page images`
  )
}

main().catch((error) => {
  console.error('[generate-og-images] failed:', error)
  process.exit(1)
})
