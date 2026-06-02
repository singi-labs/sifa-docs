/**
 * Resolve a record's tier without touching the network.
 *
 * Compiles against the pinned sifa-sdk version on every CI run. If the
 * SDK changes a name or type and breaks this file, the docs build fails
 * before merge.
 */

import {
  ACTIVITY_TIERS,
  getActivityTier,
  getLexiconEntry,
  getActivityTaxonomyVersion,
} from '@singi-labs/sifa-sdk'

const version = getActivityTaxonomyVersion()
console.log(`Activity taxonomy v${version.version} (updated ${version.updated})`)

// Look up tier for a few common record types.
const examples = [
  'app.bsky.feed.post',
  'app.bsky.feed.like',
  'sh.tangled.repo',
  'community.lexicon.calendar.rsvp',
] as const

for (const nsid of examples) {
  const tier = getActivityTier(nsid)
  const entry = getLexiconEntry(nsid)
  console.log(`${nsid}: ${tier}${entry?.app ? ` (${entry.app})` : ''}`)
}

// Or iterate every known record type.
const creationLexicons = Object.entries(ACTIVITY_TIERS.lexicons)
  .filter(([, entry]) => entry.tier === 'creation')
  .map(([nsid]) => nsid)

console.log(`${creationLexicons.length} record types classified as "Made"`)
