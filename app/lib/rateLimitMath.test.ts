import assert from 'node:assert/strict'
import test from 'node:test'
import { wouldExceedAiRateLimit } from './rateLimitMath.ts'

test('una entrega multipágina consume todas sus unidades antes de entrar', () => {
  assert.equal(wouldExceedAiRateLimit(3, 2, 5), false)
  assert.equal(wouldExceedAiRateLimit(4, 2, 5), true)
  assert.equal(wouldExceedAiRateLimit(5, 1, 5), true)
})
