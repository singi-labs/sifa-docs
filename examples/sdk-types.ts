/**
 * Re-export aggregation of the SDK's public types in one file, so
 * fumadocs-typescript's <AutoTypeTable> has a single path to point at.
 *
 * Pages that document SDK types reference this file as the source path.
 * If a type is renamed or removed from the SDK, this file fails to compile
 * (caught by the `examples:typecheck` script in CI), meaning the docs
 * can't ship a stale reference.
 *
 * Synthetic types in this file (Colors, ActivityHelpers) exist only for
 * documentation: they describe groupings of named exports that aren't
 * literal exported types in the SDK (e.g. the colors object is a value,
 * not a type; the activity helpers are a function family with no single
 * interface). These synthetic types are also covered by the typecheck.
 */

export type { ActivityTier, ActivityTaxonomy, TierMeta, LexiconEntry } from '@singi-labs/sifa-sdk'

import type {
  colors as RuntimeColors,
  fonts as RuntimeFonts,
  fontFallbackStacks as RuntimeFontFallbackStacks,
  iconSet as RuntimeIconSet,
  iconWeights as RuntimeIconWeights,
} from '@singi-labs/sifa-sdk/tokens'

/**
 * Brand-color constants from the Flexoki palette. Exported as a const
 * object at runtime; this is the inferred type for documentation.
 */
export type Colors = typeof RuntimeColors

/** Font family names (without fallbacks). */
export type Fonts = typeof RuntimeFonts

/** Full font-family strings with fallback chains, paste-ready into CSS. */
export type FontFallbackStacks = typeof RuntimeFontFallbackStacks

/** The icon-library identifier the SDK endorses. */
export type IconSetConst = typeof RuntimeIconSet

/** Phosphor weight mapping per UI context. */
export type IconWeightsConst = typeof RuntimeIconWeights

import {
  getActivityTier,
  getLexiconEntry,
  getTierMeta,
  getActivityTaxonomyVersion,
} from '@singi-labs/sifa-sdk'

/**
 * Pure helpers around the activity taxonomy. None of these touch the
 * network. Imported and re-typed here so the doc table shows the family
 * as a group.
 */
export interface ActivityHelpers {
  /** Look up the tier (creation / action / filtered) for a given NSID. */
  getActivityTier: typeof getActivityTier
  /** Get the full lexicon entry (tier + app + optional notes), or null. */
  getLexiconEntry: typeof getLexiconEntry
  /** Get tier metadata (label, description, public visibility). */
  getTierMeta: typeof getTierMeta
  /** Get the taxonomy version and last-updated date. */
  getActivityTaxonomyVersion: typeof getActivityTaxonomyVersion
}
