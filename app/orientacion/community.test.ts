import assert from 'node:assert/strict'
import test from 'node:test'
import { COMMUNITY_CONFIG, normalizeOrientationCommunity } from './community.ts'

test('normaliza perfil, URL y nombres de base de datos', () => {
  assert.equal(normalizeOrientationCommunity('Comunidad de Madrid'), 'Madrid')
  assert.equal(normalizeOrientationCommunity('Catalunya'), 'Cataluña')
  assert.equal(normalizeOrientationCommunity('cataluna'), 'Cataluña')
  assert.equal(normalizeOrientationCommunity('Otra'), null)
})

test('cada comunidad mantiene su ronda y etiqueta territorial', () => {
  assert.equal(COMMUNITY_CONFIG.Madrid.admissionRound, 'grupo_1_ordinaria')
  assert.equal(COMMUNITY_CONFIG.Cataluña.admissionRound, 'primera_assignacio_juny')
  assert.match(COMMUNITY_CONFIG.Cataluña.referenceLabel, /10\/07\/2026/)
})
