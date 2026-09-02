import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateAccessPathScore, calculateIbCauFromSubjectAverage, convertForeignGradeToSpanish } from './calculation.ts'
import { FIXTURE_SOURCE, type AdmissionSubject } from '../data.ts'
import type { AccessScenario } from './types.ts'

const subject = (id: string, grade: number, weighting: 0.1 | 0.2, enabled = true): AdmissionSubject => ({ id, subjectCode: id, name: id, defaultGrade: grade, weighting, enabled, source: FIXTURE_SOURCE })

test('Bachillerato español conserva la regresión 60/40', () => {
  const result = calculateAccessPathScore({ pathId: 'spanish_bachillerato', bachillerato: 8, accessPhase: 7 }, [])
  assert.equal(result.baseScore, 7.6)
  assert.equal(result.finalScore, 7.6)
})

test('Bachibac diplôme aplica 70/30 en mínimo, caso típico y máximo', () => {
  assert.equal(calculateAccessPathScore({ pathId: 'bachibac', route: 'french_diploma', bachillerato: 5, externalTest: 5, accessPhase: 0 }, []).baseScore, 5)
  assert.equal(calculateAccessPathScore({ pathId: 'bachibac', route: 'french_diploma', bachillerato: 8, externalTest: 7, accessPhase: 0 }, []).baseScore, 7.699999999999999)
  assert.equal(calculateAccessPathScore({ pathId: 'bachibac', route: 'french_diploma', bachillerato: 10, externalTest: 10, accessPhase: 0 }, []).baseScore, 10)
})

test('Bachibac por título español conserva 60/40 y aísla la prueba externa', () => {
  const result = calculateAccessPathScore({ pathId: 'bachibac', route: 'spanish_pau', bachillerato: 8, externalTest: 1, accessPhase: 7 }, [])
  assert.equal(result.baseScore, 7.6)
})

test('Bachibac exige superar la prueba externa al usar el diplôme', () => {
  const result = calculateAccessPathScore({ pathId: 'bachibac', route: 'french_diploma', bachillerato: 9, externalTest: 4.9, accessPhase: 0 }, [])
  assert.equal(result.complete, false)
  assert.match(result.incompleteReason ?? '', /prueba externa/i)
})

test('IB convierte la media 2–7 al intervalo español 5–10', () => {
  assert.equal(calculateIbCauFromSubjectAverage(2), 5)
  assert.equal(calculateIbCauFromSubjectAverage(4.5), 7.5)
  assert.equal(calculateIbCauFromSubjectAverage(7), 10)
  assert.equal(convertForeignGradeToSpanish(7, 2, 7), 10)
})

test('IB usa la CAU acreditada sin aplicar una fórmula sobre 45 puntos', () => {
  const result = calculateAccessPathScore({ pathId: 'ib', inputMode: 'accredited_cau', accreditedCau: 8.742, subjectAverage: 2 }, [])
  assert.equal(result.baseScore, 8.742)
})

test('IB queda incompleto cuando falta el dato de acreditación o la media de materias', () => {
  const accredited = calculateAccessPathScore({ pathId: 'ib', inputMode: 'accredited_cau', accreditedCau: null, subjectAverage: null }, [])
  const estimated = calculateAccessPathScore({ pathId: 'ib', inputMode: 'subject_average', accreditedCau: null, subjectAverage: null }, [])
  assert.equal(accredited.complete, false)
  assert.equal(estimated.complete, false)
  assert.equal(accredited.finalScore, 0)
  assert.match(accredited.incompleteReason ?? '', /completa/i)
})

test('todas las vías completas suman solo las dos mejores ponderaciones y limitan a 14', () => {
  const subjects = [subject('a', 10, 0.2), subject('b', 10, 0.2), subject('c', 10, 0.2)]
  const scenarios: AccessScenario[] = [
    { pathId: 'spanish_bachillerato', bachillerato: 10, accessPhase: 10 },
    { pathId: 'bachibac', route: 'french_diploma', bachillerato: 10, externalTest: 10, accessPhase: 0 },
    { pathId: 'ib', inputMode: 'accredited_cau', accreditedCau: 10, subjectAverage: 7 },
    { pathId: 'international', route: 'direct_unedasiss', accreditedCau: 10, homologatedAverage: 5, pceGrades: [5, 5, 5, 5] },
  ]
  for (const scenario of scenarios) {
    const result = calculateAccessPathScore(scenario, subjects)
    assert.equal(result.weightedPoints, 4)
    assert.equal(result.finalScore, 14)
  }
})

test('internacional sin convenio aplica la fórmula Madrid 2026-2027', () => {
  const result = calculateAccessPathScore({ pathId: 'international', route: 'homologation_pce', accreditedCau: 5, homologatedAverage: 8, pceGrades: [7, 8, 9, 10] }, [])
  assert.equal(result.baseScore, 9)
  assert.equal(result.complete, true)
})

test('internacional detecta modalidad incompleta y el caso sin PCE', () => {
  const insufficient = calculateAccessPathScore({ pathId: 'international', route: 'homologation_pce', accreditedCau: 5, homologatedAverage: 8, pceGrades: [7, 6, 4, 4] }, [])
  const pending = calculateAccessPathScore({ pathId: 'international', route: 'homologation_pending', accreditedCau: 5, homologatedAverage: 8, pceGrades: [0, 0, 0, 0] }, [])
  assert.equal(insufficient.complete, false)
  assert.equal(pending.complete, false)
  assert.equal(pending.finalScore, 0)
})

test('internacional no inventa una nota cuando falta la acreditación o la homologación', () => {
  const direct = calculateAccessPathScore({ pathId: 'international', route: 'direct_unedasiss', accreditedCau: null, homologatedAverage: null, pceGrades: [null, null, null, null] }, [])
  const homologation = calculateAccessPathScore({ pathId: 'international', route: 'homologation_pce', accreditedCau: null, homologatedAverage: null, pceGrades: [7, 7, 7, null] }, [])
  assert.equal(direct.complete, false)
  assert.equal(homologation.complete, false)
})
