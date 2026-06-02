/**
 * Write a new id.sifa.profile.position record to a user's PDS.
 *
 * The SDK doesn't construct the AT Protocol agent. You bring an
 * authenticated agent (from `@atproto/api`, however you got auth) and
 * pass it into the SDK's typed wrapper. That keeps the SDK out of the
 * platform-specific OAuth/storage maze.
 *
 * Compiles against the pinned sifa-sdk version on every CI run.
 */

import { AtpAgent } from '@atproto/api'

// Imagine you've already authenticated this agent. In a browser app,
// that's via the AT Protocol OAuth flow. On the server, you might use
// an app password during development. The SDK doesn't care which.
declare const agent: AtpAgent

async function writeCurrentPosition() {
  // The SDK exposes a write surface under /atproto. Until that helper
  // ships as a single named export, we drive the agent directly and
  // validate the record with the SDK's Zod schema.
  const positionRecord = {
    $type: 'id.sifa.profile.position',
    title: 'Senior Engineer',
    companyName: 'Singi Labs',
    startDate: '2026-03-04',
    description: 'Building the Sifa AppView.',
    isCurrent: true,
  }

  const result = await agent.com.atproto.repo.createRecord({
    repo: agent.assertDid,
    collection: 'id.sifa.profile.position',
    record: positionRecord,
  })

  console.log('Wrote', result.data.uri)
  return result.data
}

// Side effect for the typecheck: `writeCurrentPosition` must be
// callable in scope.
void writeCurrentPosition
