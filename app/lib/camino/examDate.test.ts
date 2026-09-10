import assert from 'node:assert/strict'
import { test } from 'node:test'

import { FINAL_REVIEW_RESERVED_STUDY_DAYS, defaultTargetExamDate, resolveTargetExamDate } from './examDate.ts'
import { planningCutoffDate, studyDatesBetween } from './studyCapacity.ts'

test('la fecha objetivo sigue al curso académico, no se congela', () => {
  // Septiembre 2026 → convocatoria de junio de 2027.
  assert.equal(defaultTargetExamDate('2026-09-10'), '2027-06-07')
  // Marzo 2027 → sigue siendo junio de 2027.
  assert.equal(defaultTargetExamDate('2027-03-01'), '2027-06-07')
  // Regresión: pasada la convocatoria, el objetivo salta al curso siguiente
  // en vez de quedarse en una fecha ya pasada (que dejaba la urgencia a 0).
  assert.equal(defaultTargetExamDate('2027-09-01'), '2028-06-07')
})

test('la fecha declarada por el alumno manda; una ya pasada se ignora', () => {
  assert.equal(resolveTargetExamDate('2026-09-10', { examDate: '2027-06-03' }), '2027-06-03')
  assert.equal(resolveTargetExamDate('2026-09-10', { examDate: '2020-06-03' }), '2027-06-07')
  assert.equal(resolveTargetExamDate('2026-09-10', { examDate: 'no-es-fecha' }), '2027-06-07')
  assert.equal(resolveTargetExamDate('2026-09-10', { examDate: null }), '2027-06-07')
  assert.equal(resolveTargetExamDate('2026-09-10'), '2027-06-07')
})

test('la convocatoria declarada cambia la fecha objetivo', () => {
  assert.equal(resolveTargetExamDate('2026-09-10', { convocatoria: 'extraordinaria' }), '2027-07-01')
  assert.equal(resolveTargetExamDate('2026-09-10', { convocatoria: 'ordinaria' }), '2027-06-07')
  // Un valor que no es convocatoria válida no debe romper el plan.
  assert.equal(resolveTargetExamDate('2026-09-10', { convocatoria: 'otra-cosa' }), '2027-06-07')
})

test('una convocatoria de este curso que ya pasó salta al curso siguiente', () => {
  // 20 de junio de 2027: la ordinaria del 7 ya pasó.
  assert.equal(resolveTargetExamDate('2027-06-20', { convocatoria: 'ordinaria' }), '2028-06-07')
  // Pero la extraordinaria de ese mismo curso todavía no.
  assert.equal(resolveTargetExamDate('2027-06-20', { convocatoria: 'extraordinaria' }), '2027-07-01')
})

test('la fecha declarada gana a la convocatoria', () => {
  assert.equal(
    resolveTargetExamDate('2026-09-10', { examDate: '2027-06-02', convocatoria: 'extraordinaria' }),
    '2027-06-02',
  )
})

test('C01: el plan no siembra temario después del examen', () => {
  // Reproducción del informe: desde el 17/05/2027 quedan ~15 días de estudio
  // antes del 07/06, pero una ventana de 30 llegaba al 28/06.
  const today = '2027-05-17'
  const examDate = '2027-06-07'
  const cutoff = planningCutoffDate(today, examDate, FINAL_REVIEW_RESERVED_STUDY_DAYS)
  assert.ok(cutoff < examDate, 'el corte tiene que caer antes del examen')

  const sembrables = studyDatesBetween(today, examDate).filter(d => d < cutoff)
  for (const date of sembrables) {
    assert.ok(date < examDate, `${date} cae después del examen`)
  }
  // Y quedan días reservados para práctica/repaso final.
  const total = studyDatesBetween(today, examDate).length
  assert.equal(total - sembrables.length, FINAL_REVIEW_RESERVED_STUDY_DAYS)
})

test('C01: pegado al examen no entra ni una lección nueva', () => {
  // 3 días de estudio por delante, reserva de 5 → todo es repaso final.
  const cutoff = planningCutoffDate('2027-06-02', '2027-06-07', FINAL_REVIEW_RESERVED_STUDY_DAYS)
  assert.equal(cutoff, '2027-06-02')
  assert.equal(studyDatesBetween('2027-06-02', '2027-06-07').filter(d => d < cutoff).length, 0)
})

test('con horizonte amplio el corte no estorba', () => {
  const cutoff = planningCutoffDate('2026-09-14', '2027-06-07', FINAL_REVIEW_RESERVED_STUDY_DAYS)
  const sembrables = studyDatesBetween('2026-09-14', '2027-06-07').filter(d => d < cutoff)
  assert.ok(sembrables.length > 150, `esperaba curso completo, hay ${sembrables.length}`)
})
