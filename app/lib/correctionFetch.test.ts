import assert from 'node:assert/strict'
import test from 'node:test'
import { fetchCorrection } from './correctionFetch.ts'

test('aborta una corrección de red que no responde', async () => {
  const fakeFetch = ((_input: RequestInfo | URL, init?: RequestInit) => new Promise<Response>((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(init.signal?.reason), { once: true })
  })) as typeof fetch
  await assert.rejects(fetchCorrection('/api/exam/correct', { method: 'POST' }, 5, fakeFetch), /timed out/i)
})
