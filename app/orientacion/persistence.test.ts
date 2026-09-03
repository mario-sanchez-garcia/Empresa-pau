import assert from 'node:assert/strict'
import test from 'node:test'
import { loadOrientationState, persistOrientationState, persistOrientationTarget } from './persistence.ts'
import { createOrientationState } from './state.ts'
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
  assert.equal(sentBody.target_community, target.community)
  assert.equal('user_id' in sentBody, false)
})

test('un fallo de red devuelve error controlado y permite reintentar', async () => {
  const saved = await persistOrientationTarget('valid-token', target, async () => {
    throw new TypeError('network unavailable')
  })

  assert.equal(saved, false)
})

test('carga el estado autenticado sin enviar identidad controlada por el cliente', async () => {
  const state = createOrientationState('Madrid', null, '2026-09-03T10:00:00.000Z')
  const loaded = await loadOrientationState('valid-token', async (_input, init) => {
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer valid-token')
    return Response.json({ state })
  })
  assert.deepEqual(loaded, state)
})

test('guarda el documento completo con PATCH y sin user_id', async () => {
  const state = createOrientationState('Madrid', null, '2026-09-03T10:00:00.000Z')
  const saved = await persistOrientationState('valid-token', state, async (input, init) => {
    assert.equal(input, '/api/orientation/state')
    assert.equal(init?.method, 'PATCH')
    assert.equal(new Headers(init?.headers).get('Authorization'), 'Bearer valid-token')
    const body = JSON.parse(String(init?.body)) as Record<string, unknown>
    assert.deepEqual(body.state, state)
    assert.equal('user_id' in body, false)
    return Response.json({ state })
  })
  assert.deepEqual(saved, state)
})

test('el usuario anónimo permanece local y no hace requests de estado', async () => {
  let calls = 0
  const request = async () => { calls += 1; return Response.json({}) }
  assert.equal(await loadOrientationState(null, request), null)
  assert.equal(await persistOrientationState(null, createOrientationState('Madrid'), request), null)
  assert.equal(calls, 0)
})

test('rechaza respuestas de servidor corruptas y propaga fallos de red al autosave', async () => {
  await assert.rejects(() => loadOrientationState('token', async () => Response.json({ state: { version: 99 } })), /orientation-state-invalid/)
  await assert.rejects(() => persistOrientationState('token', createOrientationState('Madrid'), async () => { throw new TypeError('offline') }), /offline/)
})
