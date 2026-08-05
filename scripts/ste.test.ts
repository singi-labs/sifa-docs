/**
 * Tests for the Simplified Technical English checker.
 *
 * Run with `pnpm check:ste:test` (node:test through tsx, no extra dependency).
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { checkSource, maskNonProse } from './ste'

function rules(source: string): string[] {
  return checkSource(source).map((violation) => violation.rule)
}

const FRONTMATTER =
  '---\ntitle: Test page\ndescription: A short and clean description of the page.\n---\n\n'

function page(body: string): string {
  return `${FRONTMATTER}${body}\n`
}

test('clean prose produces no violations', () => {
  assert.deepEqual(rules(page('Sifa reads your merged pull requests. Open the settings page.')), [])
})

test('S1 flags a long descriptive sentence', () => {
  const long = `The ${'very '.repeat(26)}long sentence continues.`
  assert.ok(rules(page(long)).includes('S1'))
})

test('S1 uses the 20-word limit for instructions', () => {
  const instruction = `Open the page ${'and the panel '.repeat(6)}now.`
  const found = checkSource(page(instruction)).filter((v) => v.rule === 'S1')
  assert.equal(found.length, 1)
  assert.match(found[0]?.message ?? '', /instruction sentence/)
})

test('S2 flags a paragraph over six sentences', () => {
  assert.ok(
    rules(
      page(
        'One thing. Two things. Three things. Four things. Five things. Six things. Seven things.'
      )
    ).includes('S2')
  )
})

test('S3 flags two actions in one instruction', () => {
  assert.ok(rules(page('Open the settings page and save the record.')).includes('S3'))
  assert.ok(rules(page('Open the settings page, then save the record.')).includes('S3'))
})

test('S4 flags passive voice', () => {
  assert.ok(rules(page('The record is created by the server.')).includes('S4'))
})

test('S5 flags perfect and continuous tenses', () => {
  assert.ok(rules(page('Sifa has added your record.')).includes('S5'))
  assert.ok(rules(page('The job is running now.')).includes('S5'))
})

test('S6 flags an -ing participle after a preposition', () => {
  assert.ok(rules(page('After connecting GitHub, your pull requests appear.')).includes('S6'))
})

test('S6 allows technical -ing nouns on the allowlist', () => {
  assert.ok(!rules(page('Look for it in settings.')).includes('S6'))
})

test('S7 flags contractions', () => {
  assert.ok(rules(page('You do not need it. It is ready.')).length === 0)
  assert.ok(rules(page("You don't need it.")).includes('S7'))
})

test('S8 flags an unapproved synonym', () => {
  assert.ok(rules(page('Use the token in order to sign in.')).includes('S8'))
})

test('S9 flags idiom', () => {
  assert.ok(rules(page('Sifa handles the work under the hood.')).includes('S9'))
})

test('S11 flags an unapproved ecosystem spelling', () => {
  assert.ok(rules(page('Sifa runs on ATproto today.')).includes('S11'))
  assert.ok(!rules(page('Sifa runs on atproto today.')).includes('S11'))
})

test('code fences and inline code are not prose', () => {
  const body = [
    '```ts',
    "const x = it's + don't + utilize",
    '```',
    '',
    "Read `it's-fine` in the file.",
  ].join('\n')
  assert.deepEqual(rules(page(body)), [])
})

test('frontmatter description is checked, other keys are not', () => {
  const source =
    "---\ntitle: Don't worry\ndescription: You don't need an account.\n---\n\nPlain text.\n"
  const found = checkSource(source)
  assert.equal(found.length, 1)
  assert.equal(found[0]?.rule, 'S7')
})

test('link labels are prose and link targets are not', () => {
  assert.ok(
    rules(page('Read the [utilize guide](https://example.com/in-order-to).')).includes('S8')
  )
  assert.deepEqual(rules(page('Read the [guide](https://example.com/dont-utilize).')), [])
})

test('JSX alt and caption text is prose, other attributes are not', () => {
  const body =
    '<Screenshot src="dont-utilize.png" alt="The settings page." caption="It is ready." />'
  assert.deepEqual(rules(page(body)), [])
  const bad = '<Screenshot src="a.png" alt="You don\'t need it." caption="Ready." />'
  assert.ok(rules(page(bad)).includes('S7'))
})

test('ste-allow suppresses the named rule on that line and the line above', () => {
  const inline = page(
    'The record is created by the server. {/* ste-allow: S4 quoting the API contract */}'
  )
  assert.deepEqual(rules(inline), [])
  const above = page(
    '{/* ste-allow: S4 quoting the API contract */}\nThe record is created by the server.'
  )
  assert.deepEqual(rules(above), [])
})

test('ste-allow does not suppress a different rule', () => {
  const source = page("You don't need it. {/* ste-allow: S4 unrelated */}")
  assert.ok(rules(source).includes('S7'))
})

test('violations carry the original line number', () => {
  const source = page(['First line is clean.', '', "Second block isn't clean."].join('\n'))
  const found = checkSource(source)
  assert.equal(found.length, 1)
  assert.equal(found[0]?.line, 8)
})

test('maskNonProse preserves length and newlines', () => {
  const source = page('```\ncode\n```\n\nText.')
  const masked = maskNonProse(source)
  assert.equal(masked.length, source.length)
  assert.equal(masked.split('\n').length, source.split('\n').length)
})

test('S2 does not treat a bullet list as a paragraph', () => {
  const list = [
    'Sifa reads these records:',
    '',
    '- One thing.',
    '- Two things.',
    '- Three things.',
    '- Four things.',
    '- Five things.',
    '- Six things.',
    '- Seven things.',
  ].join('\n')
  assert.ok(!rules(page(list)).includes('S2'))
})

test('S2 still flags a long prose paragraph', () => {
  const prose =
    'One thing. Two things. Three things. Four things. Five things. Six things. Seven things.'
  assert.ok(rules(page(prose)).includes('S2'))
})

test('S1 does not treat a table row as a sentence', () => {
  const table = [
    '| Source | What Sifa reads | Setup |',
    '| --- | --- | --- |',
    `| GitHub | ${'word '.repeat(30)} | link |`,
  ].join('\n')
  assert.ok(!rules(page(table)).includes('S1'))
})

test('S2 does not treat JSX attribute text as a paragraph', () => {
  const shot = [
    '<Screenshot',
    '  src="a.png"',
    '  alt="One. Two. Three. Four. Five. Six. Seven. Eight."',
    '/>',
  ].join('\n')
  assert.ok(!rules(page(shot)).includes('S2'))
})

test('S4 does not flag a hyphenated adjective such as read-only', () => {
  assert.ok(!rules(page('Today a company page is read-only.')).includes('S4'))
  assert.ok(rules(page('The page is read by the AppView.')).includes('S4'))
})

test('each list item counts as its own sentence', () => {
  const list = ['Fields:', '', `- ${'word '.repeat(15)}one`, `- ${'word '.repeat(15)}two`].join(
    '\n'
  )
  const found = checkSource(page(list)).filter((v) => v.rule === 'S1')
  assert.equal(found.length, 0)
})

test('a long single list item still trips S1', () => {
  const list = ['Fields:', '', `- ${'word '.repeat(30)}end.`].join('\n')
  assert.ok(rules(page(list)).includes('S1'))
})
