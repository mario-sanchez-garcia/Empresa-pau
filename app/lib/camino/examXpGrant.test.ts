import assert from 'node:assert/strict'
import test from 'node:test'
import { digestExamCorrection, issueExamXpGrant, verifyExamXpGrant, EXAM_XP_GRANT_TTL_MS } from './examXpGrant.ts'

const historyId = 'cd1dc315-c0f2-4bd6-9e4d-4f78b165c463'
const userId = 'user-123'
const issuedAt = Date.UTC(2026, 8, 9, 10, 0, 0)
const correctionDigest = digestExamCorrection({ nota_final: 7 })

test.before(() => {
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-secret'
})

test('exam XP grant authorizes only its exact user, history row and score', () => {
  const token = issueExamXpGrant({ historyId, userId, score: 1.75, maxScore: 2.5, correctionDigest, issuedAt })
  assert.equal(verifyExamXpGrant(token, { historyId, userId, score: 1.75, maxScore: 2.5, correctionDigest }, issuedAt + 1_000), true)
  assert.equal(verifyExamXpGrant(token, { historyId, userId: 'other-user', score: 1.75, maxScore: 2.5, correctionDigest }, issuedAt + 1_000), false)
  assert.equal(verifyExamXpGrant(token, { historyId, userId, score: 2.5, maxScore: 2.5, correctionDigest }, issuedAt + 1_000), false)
  assert.equal(verifyExamXpGrant(token, { historyId: '311d226e-7893-461a-87ec-7d2166ded6e9', userId, score: 1.75, maxScore: 2.5, correctionDigest }, issuedAt + 1_000), false)
  assert.equal(verifyExamXpGrant(token, { historyId, userId, score: 1.75, maxScore: 2.5, correctionDigest: digestExamCorrection({ nota_final: 10 }) }, issuedAt + 1_000), false)
})

test('exam XP grant rejects tampering and expiry', () => {
  const token = issueExamXpGrant({ historyId, userId, score: 7, maxScore: 10, correctionDigest, issuedAt })
  assert.equal(verifyExamXpGrant(`${token}x`, { historyId, userId, score: 7, maxScore: 10, correctionDigest }, issuedAt + 1_000), false)
  assert.equal(verifyExamXpGrant(token, { historyId, userId, score: 7, maxScore: 10, correctionDigest }, issuedAt + EXAM_XP_GRANT_TTL_MS + 1), false)
})
