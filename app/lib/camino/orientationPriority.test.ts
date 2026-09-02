import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { CaminoOrientationContext } from '../../orientacion/access-paths/types.ts'
import { formatPriorityReasons, matchingOrientationContext, missionPriorityScore, orientationImpactForSubject, orientationRotationBonusSlots, priorityReasonsForMission, rankMissionCandidates, withPriorityReasons } from './orientationPriority.ts'

function context(overrides: Partial<CaminoOrientationContext> = {}): CaminoOrientationContext {
  return {
    version: 1,
    accessPath: 'spanish_bachillerato',
    route: 'spanish_pau',
    calculationComplete: true,
    target: { degreeId: 'degree', universityId: 'university', degree: 'Economía', university: 'Universidad Carlos III de Madrid', universityAcronym: 'UC3M', referenceScore: 11.7 },
    estimatedScore: 11.2,
    gap: -0.5,
    impactSubjects: [
      { subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 6 },
      { subjectCode: 'fisica', name: 'Física', weighting: 0.1, defaultGrade: 6 },
    ],
    updatedAt: '2026-09-02T12:00:00.000Z',
    ...overrides,
  }
}

test('un examen inminente queda por encima de una ponderación 0,2', () => {
  const ranked = rankMissionCandidates([
    { subject: 'Matemáticas II' },
    { subject: 'Historia de España', metadata: { partial_exam_date: '2026-09-03' } },
  ], context(), '2026-09-02')
  assert.equal(ranked[0].subject, 'Historia de España')
})

test('una ponderación 0,2 mejora la relevancia sin urgencia y 0,1 aporta menos', () => {
  const high = orientationImpactForSubject('matematicas_ii', context())
  const low = orientationImpactForSubject('Física', context())
  assert.ok(high.score > low.score)
  assert.equal(orientationRotationBonusSlots('Matemáticas II', context()), 1)
  assert.equal(missionPriorityScore({ subject: 'Matemáticas II' }, context()) > missionPriorityScore({ subject: 'Lengua Castellana' }, context()), true)
})

test('una asignatura no ponderada no recibe bonus', () => {
  assert.deepEqual(orientationImpactForSubject('Lengua Castellana', context()), { level: 'none', score: 0, weighting: null, defaultGrade: null })
})

test('sin objetivo o sin ponderaciones oficiales se conserva el orden anterior', () => {
  const missions = [{ subject: 'Lengua Castellana' }, { subject: 'Matemáticas II' }]
  assert.deepEqual(rankMissionCandidates(missions, null), missions)
  assert.deepEqual(rankMissionCandidates(missions, context({ impactSubjects: [] })), missions)
  const local = context()
  assert.equal(matchingOrientationContext(local, { degree: 'Economía', university: 'Universidad Carlos III de Madrid', admissionScore: 11.7, sourceType: 'fixture' }), null)
  assert.equal(matchingOrientationContext(local, { degree: 'Otra carrera', university: 'Universidad Carlos III de Madrid', admissionScore: 11.7, sourceType: 'official' }), null)
  assert.equal(matchingOrientationContext(local, { degree: 'Economía', university: 'Universidad Carlos III de Madrid', admissionScore: 11.7, sourceType: 'official' }), local)
})

test('un gap por debajo de referencia refuerza la señal y estar por encima la atenúa', () => {
  const below = orientationImpactForSubject('Matemáticas II', context({ gap: -1.5 }))
  const above = orientationImpactForSubject('Matemáticas II', context({ gap: 0.5 }))
  assert.ok(below.score > above.score)
  assert.ok(above.score > 0)
})

test('una nota ya muy fuerte atenúa orientación frente a una debilidad real', () => {
  const strongContext = context({ impactSubjects: [{ subjectCode: 'quimica', name: 'Química', weighting: 0.2, defaultGrade: 9.4 }] })
  const chemistry = missionPriorityScore({ subject: 'Química' }, strongContext)
  const weakLanguage = missionPriorityScore({ subject: 'Lengua Castellana', metadata: { weak_review: true } }, strongContext)
  assert.ok(weakLanguage > chemistry)
})

test('solo las rutas completas y explícitas pueden influir', () => {
  for (const route of ['spanish_pau', 'bachibac_spanish_pau', 'bachibac_diploma', 'ib_unedasiss', 'international_direct_unedasiss', 'international_homologation_pce'] as const) {
    assert.ok(orientationImpactForSubject('Matemáticas II', context({ route })).score > 0)
  }
  assert.equal(orientationImpactForSubject('Matemáticas II', context({ accessPath: 'international', route: 'international_homologation_pending' })).score, 0)
  assert.equal(orientationImpactForSubject('Matemáticas II', context({ accessPath: 'bachibac', route: undefined })).score, 0)
  assert.equal(orientationImpactForSubject('Matemáticas II', context({ calculationComplete: false })).score, 0)
})

test('las razones son estructuradas, ordenadas y explicables', () => {
  const mission = withPriorityReasons({
    subject: 'Matemáticas II',
    metadata: { partial_exam_date: '2026-09-07', weak_review: true },
  }, context(), '2026-09-02')
  const reasons = priorityReasonsForMission(mission, context(), '2026-09-02')
  assert.deepEqual(reasons.map(reason => reason.code), ['exam_soon', 'weak_topic', 'orientation_high_weight', 'orientation_gap'])
  assert.match(formatPriorityReasons(mission), /examen es en 5 días/)
  assert.match(formatPriorityReasons(mission), /contenidos más flojos/)
})

test('la capa de Camino consume la ponderación ya resuelta sin duplicar fórmulas de admisión', () => {
  const impact = orientationImpactForSubject('Matemáticas II', context({ estimatedScore: null, gap: null }))
  assert.equal(impact.weighting, 0.2)
  assert.ok(impact.score > 0)
})
