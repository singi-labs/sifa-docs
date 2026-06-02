/**
 * Apply Sifa's font tokens in any styling layer.
 *
 * The SDK exports the font names and the full fallback stacks. Consumers
 * load the actual WOFF2 files themselves (Sifa Web does this via
 * `next/font`; mobile apps would bundle the files).
 *
 * Compiles against the pinned sifa-sdk version on every CI run.
 */

import { fonts, fontFallbackStacks } from '@singi-labs/sifa-sdk/tokens'

// In CSS-in-JS or React Native:
const headingStyle = {
  fontFamily: fontFallbackStacks.display,
  fontWeight: 700,
}

const bodyStyle = {
  fontFamily: fontFallbackStacks.sans,
  fontWeight: 400,
}

const codeStyle = {
  fontFamily: fontFallbackStacks.mono,
  fontSize: 14,
}

console.log({ headingStyle, bodyStyle, codeStyle })

// In Tailwind's theme config (next/font handles the variable swap):
const tailwindFontFamily = {
  display: [fonts.display, 'system-ui', 'sans-serif'],
  sans: [fonts.sans, 'system-ui', 'sans-serif'],
  mono: [fonts.mono, 'ui-monospace', 'monospace'],
}

console.log(tailwindFontFamily)
