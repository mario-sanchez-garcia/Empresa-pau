import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveOnboardingDestination } from './resolveOnboardingDestination.ts'

test('completed server onboarding always enters Camino', () => {
  assert.equal(resolveOnboardingDestination({
    onboarding: { completedAt: '2026-09-10T00:00:00Z', community: 'Madrid', subjects: ['Inglés'] },
    draft: { id: 'old', status: 'failed' },
  }), '/camino')
})

test('an active server draft resumes finalization by stable id', () => {
  assert.equal(resolveOnboardingDestination({
    onboarding: null,
    draft: { id: 'draft/id', status: 'processing' },
  }), '/onboarding/finalizando?draft=draft%2Fid')
})

test('a new account enters onboarding', () => {
  assert.equal(resolveOnboardingDestination({ onboarding: null, draft: null }), '/onboarding')
})
