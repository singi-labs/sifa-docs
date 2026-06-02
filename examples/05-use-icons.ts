/**
 * Use the Sifa icon-set convention to pick a Phosphor weight in context.
 *
 * The SDK doesn't bundle icon SVGs (Phosphor is its own package). It
 * documents the convention so consumers know which weight to render in
 * which UI context.
 *
 * Compiles against the pinned sifa-sdk version on every CI run.
 */

import { iconSet, iconWeights, type IconWeights } from '@singi-labs/sifa-sdk/tokens'

console.log(`Icon library: ${iconSet}`)

// Map a UI context to its conventional Phosphor weight.
function weightForContext(context: keyof IconWeights): string {
  return iconWeights[context]
}

// In a React app using @phosphor-icons/react:
const buttonIconWeight = weightForContext('uiChrome') // 'regular'
const activeNavWeight = weightForContext('interactive') // 'bold'
const heroIconWeight = weightForContext('decorative') // 'duotone'

console.log({ buttonIconWeight, activeNavWeight, heroIconWeight })

// Example usage (pseudo-JSX, written as a comment to keep this file
// dependency-free for the typecheck):
//
//   import { House } from '@phosphor-icons/react'
//   <House weight={iconWeights.uiChrome} size={20} />
