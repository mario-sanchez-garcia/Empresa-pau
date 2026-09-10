import assert from 'node:assert/strict'
import test from 'node:test'
import { correctionOutcome, isFreshCorrectionClaim, normalizeCompletedIndexes } from './lifecycle.ts'

test('partial correction never becomes complete or XP-eligible', () => {
  assert.deepEqual(correctionOutcome([true, true, false]), {
    status: 'partial', completedIndexes: [0, 1], failedIndexes: [2], mayAwardXp: false,
  })
})

test('only a complete correction may award XP', () => {
  assert.equal(correctionOutcome([true, true, true]).mayAwardXp, true)
  assert.equal(correctionOutcome([false, false]).status, 'failed')
})

test('retry reuses only valid unique block indexes', () => {
  assert.deepEqual(normalizeCompletedIndexes([2, 0, 2, -1, 99, '1'], 3), [0, 2])
})

test('a fresh correction claim blocks a concurrent submit but a stale one recovers', () => {
  const now = Date.parse('2026-09-09T12:00:00.000Z')
  assert.equal(isFreshCorrectionClaim('processing', '2026-09-09T11:59:00.000Z', now), true)
  assert.equal(isFreshCorrectionClaim('processing', '2026-09-09T11:57:00.000Z', now), false)
  assert.equal(isFreshCorrectionClaim('partial', '2026-09-09T11:59:00.000Z', now), false)
})
