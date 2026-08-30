/**
 * Tests for the universal-route link check.
 *
 * Run with `pnpm check:links:test` (node:test through tsx, no extra dependency).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkSource } from './app-links'

const FRONTMATTER =
  '---\ntitle: Test page\ndescription: A short and clean description of the page.\n---\n\n'

function page(body: string): string {
  return `${FRONTMATTER}${body}\n`
}

function matches(source: string): string[] {
  return checkSource(source).map((violation) => violation.match)
}

test('a linked route passes', () => {
  assert.deepEqual(
    matches(page('Open [sifa.id/settings/export](https://sifa.id/settings/export).')),
    []
  )
})

test('inline code around a universal route fails', () => {
  assert.deepEqual(matches(page('Open your export page at `sifa.id/settings/export`.')), [
    'sifa.id/settings/export',
  ])
})

test('a bare absolute URL in prose fails', () => {
  assert.deepEqual(matches(page('Open https://sifa.id/settings/activity to choose apps.')), [
    'https://sifa.id/settings/activity',
  ])
})

test('a bare path in prose fails', () => {
  assert.deepEqual(matches(page('The delete button sits on /settings/account.')), [
    '/settings/account',
  ])
})

test('link text repeating the route does not double-count', () => {
  assert.deepEqual(
    matches(page('See [your activity settings](https://sifa.id/settings/activity).')),
    []
  )
})

test('an <a href> passes', () => {
  assert.deepEqual(
    matches(page('See <a href="https://sifa.id/settings/export">the export page</a>.')),
    []
  )
})

test('a fenced code block is out of scope', () => {
  assert.deepEqual(matches(page('```bash\ncurl https://sifa.id/settings/export\n```')), [])
})

test('placeholder routes stay out of the rule', () => {
  assert.deepEqual(matches(page('Your profile lives at `https://sifa.id/p/<username>`.')), [])
  assert.deepEqual(matches(page('A company page lives at `/c/<domain>`.')), [])
})

test('the allow directive suppresses one line', () => {
  assert.deepEqual(
    matches(page('{/* links-allow: shows the raw string a reader types */}\n`/settings/export`')),
    []
  )
})

test('violations report the line number', () => {
  const violations = checkSource(page('First line.\n\n`sifa.id/settings/export`'))
  assert.equal(violations.length, 1)
  assert.equal(violations[0]?.line, 8)
})
