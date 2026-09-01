import assert from 'node:assert/strict'
import test from 'node:test'
import { classifyOpportunity, isSavedOpportunity, rankOpportunities, type OpportunityCandidate } from './opportunities.ts'

const target = (id: string, referenceScore: number | null, university = 'Universidad B', degree = 'Grado B'): OpportunityCandidate => ({
  id, referenceScore, university, degree,
})

test('clasifica una nota superior como por encima', () => assert.equal(classifyOpportunity(12, 11.5), 'above'))
test('clasifica una nota exactamente igual como por encima', () => assert.equal(classifyOpportunity(11.5, 11.5), 'above'))
test('clasifica 0.1 por debajo como muy cerca', () => assert.equal(classifyOpportunity(11.4, 11.5), 'close'))
test('incluye exactamente 0.5 por debajo en muy cerca', () => assert.equal(classifyOpportunity(11, 11.5), 'close'))
test('clasifica más de 0.5 por debajo como mejora', () => assert.equal(classifyOpportunity(10.99, 11.5), 'improve'))
test('una referencia ausente no se clasifica como oportunidad', () => assert.equal(classifyOpportunity(11, null), 'unavailable'))

test('ordena varias universidades por cercanía y después por nombre', () => {
  const ranked = rankOpportunities([
    target('lejos', 13, 'Universidad C'),
    target('empate-z', 11.2, 'Universidad Z'),
    target('empate-a', 11.2, 'Universidad A'),
  ], 11, null)
  assert.deepEqual(ranked.map(item => item.id), ['empate-a', 'empate-z', 'lejos'])
})

test('el objetivo guardado queda primero aunque esté más lejos', () => {
  const saved = target('objetivo', 13.2, 'Universidad Objetivo', 'Grado Objetivo')
  const ranked = rankOpportunities([target('cerca', 11.1), saved], 11, { degree: saved.degree, university: saved.university })
  assert.equal(ranked[0].id, 'objetivo')
  assert.equal(isSavedOpportunity(ranked[0], { degree: saved.degree, university: saved.university }), true)
})

test('identifica el objetivo por ids estables aunque cambie el texto', () => {
  const candidate = { ...target('objetivo-id', 12), degreeId: 'degree-1', universityId: 'university-1' }
  assert.equal(isSavedOpportunity(candidate, { degreeId: 'degree-1', universityId: 'university-1', degree: 'Nombre anterior', university: 'Nombre anterior' }), true)
})

test('un catálogo vacío permanece vacío', () => assert.deepEqual(rankOpportunities([], 11, null), []))
