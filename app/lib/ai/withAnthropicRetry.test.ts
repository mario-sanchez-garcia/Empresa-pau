import assert from 'node:assert/strict'
import test from 'node:test'
import { withAnthropicRetry } from './withAnthropicRetry.ts'

test('reintenta una saturación transitoria y devuelve el único resultado válido', async () => {
  let calls = 0
  const retries: number[] = []
  const result = await withAnthropicRetry(async () => {
    calls += 1
    if (calls === 1) throw Object.assign(new Error('saturado'), { status: 429, headers: { 'retry-after': '0.001' } })
    return 'corrección válida'
  }, (_attempt, status) => retries.push(status))
  assert.equal(result, 'corrección válida')
  assert.equal(calls, 2)
  assert.deepEqual(retries, [429])
})

test('no reintenta errores no transitorios', async () => {
  let calls = 0
  await assert.rejects(withAnthropicRetry(async () => {
    calls += 1
    throw Object.assign(new Error('payload inválido'), { status: 400 })
  }))
  assert.equal(calls, 1)
})
