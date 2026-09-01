import assert from 'node:assert/strict'
import test from 'node:test'
import { persistOrientationTarget } from './persistence.ts'
import type { OrientationTarget } from './data.ts'

const target: OrientationTarget = {
  id: 'target-id',
  degreeId: '07c12ba0-4ab8-4e13-9b83-85b0b529a278',
  universityId: '3a224872-bf00-4906-9c45-27331c38cff0',
  degreeCode: 'psi',
  universityCode: 'uam',
  degree: 'Psicología',
  university: 'Universidad Autónoma de Madrid',
  universityAcronym: 'UAM',
  community: 'Comunidad de Madrid',
  referenceScore: 11.07,
  referenceLabel: 'Referencia',
  source: { type: 'official', label: 'Fuente oficial', url: 'https://example.com', academicYear: '2026-2027', verifiedAt: '2026-09-01T00:00:00Z' },
  subjects: [],
}

test('el guardado envía ids estables sin aceptar un user_id del cliente', async () => {
  let sentBody: Record<string, unknown> = {}
  const saved = await persistOrientationTarget('valid-token', target, async (_input, init) => {
    sentBody = JSON.parse(String(init?.body))
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer valid-token')
    return new Response(null, { status: 200 })
  })

  assert.equal(saved, true)
  assert.equal(sentBody.target_degree_id, target.degreeId)
  assert.equal(sentBody.target_university_id, target.universityId)
  assert.equal('user_id' in sentBody, false)
})

test('un fallo de red devuelve error controlado y permite reintentar', async () => {
  const saved = await persistOrientationTarget('valid-token', target, async () => {
    throw new TypeError('network unavailable')
  })

  assert.equal(saved, false)
})
