import assert from 'node:assert/strict'
import test from 'node:test'
import { closeSegment, isValidSegments, openSegment, totalElapsedSeconds } from './timeSegments.ts'

test('timer resume/pause is idempotent and sums server timestamps', () => {
  const opened = openSegment([], '2026-09-09T10:00:00.000Z')
  assert.deepEqual(openSegment(opened, '2026-09-09T10:01:00.000Z'), opened)
  const closed = closeSegment(opened, '2026-09-09T10:10:00.000Z')
  assert.equal(totalElapsedSeconds(closed), 600)
  assert.deepEqual(closeSegment(closed, '2026-09-09T10:20:00.000Z'), closed)
})

test('timer validation rejects overlaps, reversed and multiple open segments', () => {
  assert.equal(isValidSegments([{ startedAt: '2026-09-09T10:00:00Z', endedAt: '2026-09-09T09:00:00Z' }]), false)
  assert.equal(isValidSegments([
    { startedAt: '2026-09-09T10:00:00Z', endedAt: null },
    { startedAt: '2026-09-09T10:01:00Z', endedAt: null },
  ]), false)
  assert.equal(isValidSegments([
    { startedAt: '2026-09-09T10:00:00Z', endedAt: '2026-09-09T10:10:00Z' },
    { startedAt: '2026-09-09T10:05:00Z', endedAt: '2026-09-09T10:15:00Z' },
  ]), false)
})
