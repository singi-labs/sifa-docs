import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isLongDown, longDownReport, nextDownSince } from './link-health'

const TODAY = '2026-10-12'

test('nextDownSince: a healthy link has no down date', () => {
  assert.equal(nextDownSince('2026-10-01', true, TODAY), null)
  assert.equal(nextDownSince(null, true, TODAY), null)
})

test('nextDownSince: a first failure starts the clock today', () => {
  assert.equal(nextDownSince(null, false, TODAY), TODAY)
  assert.equal(nextDownSince(undefined, false, TODAY), TODAY)
})

test('nextDownSince: a link that stays down keeps its original date', () => {
  assert.equal(nextDownSince('2026-10-03', false, TODAY), '2026-10-03')
})

test('isLongDown: true from 7 days down, not before', () => {
  assert.equal(isLongDown('2026-10-05', TODAY), true)
  assert.equal(isLongDown('2026-10-06', TODAY), false)
  assert.equal(isLongDown(null, TODAY), false)
})

test('longDownReport: lists only links down for 7+ days, oldest first', () => {
  const report = longDownReport(
    [
      { name: 'Plonk', url: 'https://plonk.li', downSince: '2026-10-04' },
      { name: 'Fresh', url: 'https://fresh.example', downSince: '2026-10-11' },
      { name: 'Old', url: 'https://old.example', downSince: '2026-09-30' },
      { name: 'Up', url: 'https://up.example', downSince: null },
    ],
    TODAY,
    'Remove it from the list.'
  )
  assert.ok(report)
  const lines = report.split('\n').filter((l) => l.startsWith('- '))
  assert.deepEqual(lines, [
    '- [Old](https://old.example): down since 2026-09-30 (12 days)',
    '- [Plonk](https://plonk.li): down since 2026-10-04 (8 days)',
  ])
  assert.match(report, /Remove it from the list\./)
})

test('longDownReport: null when nothing has been down for 7 days', () => {
  assert.equal(
    longDownReport(
      [{ name: 'Fresh', url: 'https://f.example', downSince: '2026-10-11' }],
      TODAY,
      'x'
    ),
    null
  )
})
