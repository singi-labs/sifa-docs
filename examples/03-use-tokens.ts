/**
 * Read brand color tokens from the SDK.
 *
 * Compiles against the pinned sifa-sdk version on every CI run.
 */

import { colors } from '@singi-labs/sifa-sdk/tokens'

// Use in a React component, a Canvas drawing, a CLI ANSI escape, etc.
const primaryFill = colors.primary // Flexoki Blue
const secondaryStroke = colors.secondary // Flexoki Purple

console.log({ primaryFill, secondaryStroke })

// Or build a CSS variable map for a stylesheet.
const cssVars = Object.fromEntries(
  Object.entries(colors).map(([key, value]) => [`--sifa-${key}`, value])
)

console.log(cssVars)
