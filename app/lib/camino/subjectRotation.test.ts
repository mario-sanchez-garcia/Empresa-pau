import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rotateSubjectForDay, weekdayOrdinal } from './subjectRotation.ts'

const SIX_SUBJECTS = ['matematicas_ii', 'lengua', 'historia_espana', 'fisica', 'quimica', 'ingles']

// 14 días naturales desde el lunes 2026-09-14.
function nextDays(start: string, n: number): string[] {
  const out: string[] = []
  let cur = Date.parse(`${start}T12:00:00Z`)
  for (let i = 0; i < n; i++) {
    out.push(new Date(cur).toISOString().slice(0, 10))
    cur += 86400000
  }
  return out
}

test('weekdayOrdinal avanza de forma continua entre semanas', () => {
  // Lunes 2026-09-14 … viernes 2026-09-18, luego lunes 2026-09-21.
  const week1 = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18']
  const ordinals = week1.map(weekdayOrdinal)
  assert.deepEqual(ordinals.map(o => o - ordinals[0]), [0, 1, 2, 3, 4])
  // El lunes siguiente NO reinicia: continúa en +5.
  assert.equal(weekdayOrdinal('2026-09-21') - ordinals[0], 5)
})

test('con 6 asignaturas, las 6 reciben días en un reparto de 14 días', () => {
  const counts: Record<string, number> = Object.fromEntries(SIX_SUBJECTS.map(s => [s, 0]))
  for (const day of nextDays('2026-09-14', 14)) {
    const subject = rotateSubjectForDay(day, SIX_SUBJECTS)
    if (subject) counts[subject] += 1
  }
  // Regresión del bug: `(dow - 1) % 6` dejaba Inglés (posición 5) a cero.
  for (const subject of SIX_SUBJECTS) {
    assert.ok(counts[subject] > 0, `${subject} no recibió ningún día: ${JSON.stringify(counts)}`)
  }
})

test('el reparto es equilibrado a medio plazo', () => {
  const counts: Record<string, number> = Object.fromEntries(SIX_SUBJECTS.map(s => [s, 0]))
  for (const day of nextDays('2026-09-14', 84)) {
    const subject = rotateSubjectForDay(day, SIX_SUBJECTS)
    if (subject) counts[subject] += 1
  }
  const values = Object.values(counts)
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, `reparto desequilibrado: ${JSON.stringify(counts)}`)
})

test('los fines de semana no reciben asignatura', () => {
  assert.equal(rotateSubjectForDay('2026-09-19', SIX_SUBJECTS), null) // sábado
  assert.equal(rotateSubjectForDay('2026-09-20', SIX_SUBJECTS), null) // domingo
})

test('un examen ese día gana a la rotación', () => {
  const subject = rotateSubjectForDay('2026-09-16', SIX_SUBJECTS, { priority: ['ingles'] })
  assert.equal(subject, 'ingles')
})

test('si la asignatura que toca no tiene trabajo, el día no se desperdicia', () => {
  const day = '2026-09-14'
  const chosen = rotateSubjectForDay(day, SIX_SUBJECTS)
  assert.ok(chosen)
  const fallback = rotateSubjectForDay(day, SIX_SUBJECTS, { hasWork: s => s !== chosen })
  assert.ok(fallback && fallback !== chosen, 'debería ceder el día a otra asignatura con temario')
})

test('sin ninguna asignatura con trabajo devuelve null', () => {
  assert.equal(rotateSubjectForDay('2026-09-14', SIX_SUBJECTS, { hasWork: () => false }), null)
})

test('una sola asignatura recibe todos los días lectivos', () => {
  const days = nextDays('2026-09-14', 7).filter(d => rotateSubjectForDay(d, ['lengua']))
  assert.equal(days.length, 5)
})
