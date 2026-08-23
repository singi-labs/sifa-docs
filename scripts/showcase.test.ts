/**
 * Tests for the Sifa-driven sites health model.
 *
 * Run with `pnpm check:showcase:test` (node:test through tsx, no extra
 * dependency). Pure classifier — no network.
 */
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyEntry, isProblem, type ShowcaseEntry } from './showcase'

const markerEntry: ShowcaseEntry = {
  url: 'https://example.com/cv',
  label: 'example.com/cv',
  provenance: { mode: 'marker', marker: 'sifa.id/p/example' },
}

const manualEntry: ShowcaseEntry = {
  url: 'https://static.example/cv',
  label: 'static.example/cv',
  provenance: { mode: 'manual', reason: 'Static build, no runtime marker.' },
}

test('marker present on a live page is ok', () => {
  const v = classifyEntry(markerEntry, {
    ok: true,
    status: 200,
    body: '<a href="https://sifa.id/p/example">Sifa</a>',
  })
  assert.equal(v.state, 'ok')
  assert.equal(isProblem(v), false)
})

test('marker missing on a live page is drift', () => {
  const v = classifyEntry(markerEntry, {
    ok: true,
    status: 200,
    body: '<h1>My brand new CV</h1>',
  })
  assert.equal(v.state, 'drifted')
  assert.equal(isProblem(v), true)
  assert.match(v.detail, /sifa\.id\/p\/example/)
})

test('non-2xx is dead regardless of body', () => {
  const v = classifyEntry(markerEntry, {
    ok: false,
    status: 404,
    body: 'sifa.id/p/example',
  })
  assert.equal(v.state, 'dead')
  assert.equal(v.detail, 'HTTP 404')
  assert.equal(isProblem(v), true)
})

test('a dead URL wins over manual provenance', () => {
  const v = classifyEntry(manualEntry, { ok: false, status: 410, body: '' })
  assert.equal(v.state, 'dead')
  assert.equal(isProblem(v), true)
})

test('manual entry on a live page is surfaced but not a problem', () => {
  const v = classifyEntry(manualEntry, { ok: true, status: 200, body: 'anything' })
  assert.equal(v.state, 'manual')
  assert.equal(isProblem(v), false)
  assert.equal(v.detail, 'Static build, no runtime marker.')
})

test('markerUrl is named in the drift detail', () => {
  const entry: ShowcaseEntry = {
    url: 'https://beck.example/about/',
    label: 'beck.example/about',
    provenance: { mode: 'marker', marker: 'did:plc:abc', markerUrl: 'https://beck.example/' },
  }
  const v = classifyEntry(entry, { ok: true, status: 200, body: 'no marker here' })
  assert.equal(v.state, 'drifted')
  assert.match(v.detail, /beck\.example\/$/)
})
