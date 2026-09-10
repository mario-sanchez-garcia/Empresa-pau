import assert from 'node:assert/strict'
import test from 'node:test'
import { safeLocalRedirect } from './safeRedirect.ts'
import { isPasswordLongEnough, MIN_PASSWORD_LENGTH } from './passwordPolicy.ts'

test('safeLocalRedirect keeps application-local paths', () => {
  assert.equal(safeLocalRedirect('/camino?tab=hoy#mission'), '/camino?tab=hoy#mission')
  assert.equal(safeLocalRedirect('/onboarding/finalizando?draft=123'), '/onboarding/finalizando?draft=123')
})

test('password length policy matches the configured backend minimum', () => {
  assert.equal(MIN_PASSWORD_LENGTH, 6)
  assert.equal(isPasswordLongEnough('12345'), false)
  assert.equal(isPasswordLongEnough('123456'), true)
})

test('safeLocalRedirect rejects executable and external destinations', () => {
  for (const value of [
    'javascript:alert(1)',
    'https://evil.example',
    '//evil.example/path',
    '/\\evil.example/path',
    '\\evil.example/path',
    '/camino\nmalicious',
    '',
    null,
  ]) {
    assert.equal(safeLocalRedirect(value, '/fallback'), '/fallback')
  }
})
