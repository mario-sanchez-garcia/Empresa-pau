import assert from 'node:assert/strict'
import { test } from 'node:test'

import { resolvePostAuthDestination } from './postAuthDestination.ts'

const DRAFT = '11111111-2222-3333-4444-555555555555'

const deps = (over: Partial<Parameters<typeof resolvePostAuthDestination>[1]> = {}) => ({
  claimDraft: async () => true,
  fetchOnboardingMe: async () => null,
  ...over,
})

// ── El draft no se pierde al pasar por la verificación ──────────────────

test('con draft, se reclama ANTES de decidir destino', () => {
  const order: string[] = []
  return resolvePostAuthDestination(DRAFT, {
    claimDraft: async id => { order.push(`claim:${id}`); return true },
    fetchOnboardingMe: async () => { order.push('me'); return null },
  }).then(result => {
    assert.deepEqual(order, [`claim:${DRAFT}`], 'no debe consultarse /me cuando hay draft')
    assert.equal(result.destination, `/onboarding/finalizando?draft=${DRAFT}`)
    assert.equal(result.draftClaimed, true)
  })
})

test('si el claim falla, NO se manda a finalizar algo que no le pertenece', async () => {
  const result = await resolvePostAuthDestination(DRAFT, deps({ claimDraft: async () => false }))
  assert.equal(result.destination, '/onboarding')
  assert.equal(result.draftClaimed, false)
})

test('un claim que lanza se trata como fallo, no revienta el login', async () => {
  const result = await resolvePostAuthDestination(DRAFT, deps({
    claimDraft: async () => { throw new Error('red caída') },
  }))
  assert.equal(result.destination, '/onboarding')
  assert.equal(result.draftClaimed, false)
})

// ── Usuario existente: nunca atrapado ───────────────────────────────────

test('sin draft y con onboarding completo, va directo a su Camino', async () => {
  const result = await resolvePostAuthDestination(null, deps({
    fetchOnboardingMe: async () => ({
      onboarding: { completedAt: '2026-01-01T00:00:00Z', community: 'madrid', subjects: ['mates'] },
      draft: null,
    }),
  }))
  assert.equal(result.destination, '/camino')
})

test('sin draft y con un borrador server-side, se retoma su finalización', async () => {
  const result = await resolvePostAuthDestination(null, deps({
    fetchOnboardingMe: async () => ({ onboarding: null, draft: { id: DRAFT, status: 'claimed' } }),
  }))
  assert.equal(result.destination, `/onboarding/finalizando?draft=${DRAFT}`)
})

test('sin draft y sin onboarding, empieza el onboarding', async () => {
  const result = await resolvePostAuthDestination(null, deps({
    fetchOnboardingMe: async () => ({ onboarding: null, draft: null }),
  }))
  assert.equal(result.destination, '/onboarding')
})

test('si /me no responde, se cae al destino de respaldo en vez de bloquear', async () => {
  const caido = await resolvePostAuthDestination(null, deps({ fetchOnboardingMe: async () => null }))
  assert.equal(caido.destination, '/camino')
  const lanza = await resolvePostAuthDestination(null, deps({
    fetchOnboardingMe: async () => { throw new Error('500') },
  }), '/camino')
  assert.equal(lanza.destination, '/camino')
})

test('el destino de respaldo es configurable por quien llama', async () => {
  const result = await resolvePostAuthDestination(null, deps({ fetchOnboardingMe: async () => null }), '/zona')
  assert.equal(result.destination, '/zona')
})

// ── El claim fallido tiene que ser distinguible por quien llama ─────────

test('draftClaimed distingue "no había draft" de "el claim falló"', () => {
  // Las dos situaciones pueden acabar en /onboarding, pero solo una obliga a
  // conservar las respuestas locales del alumno. Sin poder distinguirlas,
  // quien llama no puede decidir.
  return Promise.all([
    resolvePostAuthDestination(DRAFT, deps({ claimDraft: async () => false })),
    resolvePostAuthDestination(null, deps({ fetchOnboardingMe: async () => ({ onboarding: null, draft: null }) })),
  ]).then(([claimFallido, sinDraft]) => {
    assert.equal(claimFallido.destination, '/onboarding')
    assert.equal(sinDraft.destination, '/onboarding')
    // El dato que las separa:
    assert.equal(claimFallido.draftClaimed, false)
    assert.equal(sinDraft.draftClaimed, false)
    // …y el que de verdad usa quien llama es `draftId && !draftClaimed`.
    assert.equal(Boolean(DRAFT) && !claimFallido.draftClaimed, true, 'claim fallido: conservar respuestas')
    assert.equal(Boolean(null) && !sinDraft.draftClaimed, false, 'sin draft: no hay nada que conservar')
  })
})
