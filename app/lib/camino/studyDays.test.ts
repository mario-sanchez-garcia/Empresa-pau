import assert from 'node:assert/strict'
import test from 'node:test'

import { getMadridDate, isValidIsoCalendarDate } from './madridDate.ts'

test('getMadridDate attributes summer work after Madrid midnight to the new day', () => {
  assert.equal(getMadridDate('2026-09-08T22:30:00.000Z'), '2026-09-09')
})

test('getMadridDate attributes winter work after Madrid midnight to the new day', () => {
  assert.equal(getMadridDate('2026-12-01T23:30:00.000Z'), '2026-12-02')
})

test('calendar dates reject impossible days instead of reaching Postgres as a 500', () => {
  assert.equal(isValidIsoCalendarDate('2028-02-29'), true)
  assert.equal(isValidIsoCalendarDate('2026-02-29'), false)
  assert.equal(isValidIsoCalendarDate('2026-04-31'), false)
})
