import assert from 'node:assert/strict'
import { test } from 'node:test'

import { rotateSubjectForDay, studySlotOrdinal, weekdayOrdinal } from './subjectRotation.ts'

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

// ── Rotación sobre los turnos REALES del alumno ──────────────────────────

test('con 2 días semanales, 5 asignaturas reciben turnos — no solo dos', () => {
  // Reproducción del informe: lunes y jueves con el contador de días
  // laborables caían siempre en los índices 0 y 3, así que tres asignaturas
  // no salían NUNCA (8 semanas → A: 8, B: 0, C: 0, D: 8, E: 0).
  const subjects = ['A', 'B', 'C', 'D', 'E']
  const pattern = [0, 3] // lunes y jueves
  const counts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0 }
  let date = '2026-09-14' // lunes
  for (let i = 0; i < 8 * 7; i += 1) {
    const subject = rotateSubjectForDay(date, subjects, { studyDayIndexes: pattern })
    if (subject) counts[subject] += 1
    date = new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
  }
  for (const subject of subjects) {
    assert.ok(counts[subject] > 0, `${subject} no recibió ni un turno: ${JSON.stringify(counts)}`)
  }
  // 16 turnos entre 5 asignaturas: nadie se lleva más de uno de diferencia.
  const values = Object.values(counts)
  assert.ok(Math.max(...values) - Math.min(...values) <= 1, JSON.stringify(counts))
})

test('con 7 días semanales el fin de semana también recibe asignatura', () => {
  // `allowWeekends` no llegaba desde el filtro de días, así que dos semanas de
  // plan a 7 días devolvían 10 días con materia en vez de 14.
  const pattern = [0, 1, 2, 3, 4, 5, 6]
  let withSubject = 0
  let date = '2026-09-14'
  for (let i = 0; i < 14; i += 1) {
    if (rotateSubjectForDay(date, ['A', 'B', 'C'], { studyDayIndexes: pattern })) withSubject += 1
    date = new Date(Date.parse(`${date}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
  }
  assert.equal(withSubject, 14)
})

test('un día fuera del patrón del alumno nunca recibe asignatura', () => {
  // Martes, con un alumno que solo estudia lunes y jueves.
  assert.equal(rotateSubjectForDay('2026-09-15', ['A', 'B'], { studyDayIndexes: [0, 3] }), null)
})

test('el patrón por defecto (L-V) no cambia el reparto de siempre', () => {
  // Garantía de no regresión: sin patrón explícito, el contador es el mismo
  // que el weekdayOrdinal histórico.
  for (const date of ['2026-09-14', '2026-09-15', '2026-09-18', '2026-09-21']) {
    assert.equal(
      rotateSubjectForDay(date, ['A', 'B', 'C']),
      rotateSubjectForDay(date, ['A', 'B', 'C'], { studyDayIndexes: [0, 1, 2, 3, 4] }),
      date,
    )
  }
})

test('studySlotOrdinal avanza de uno en uno por turno del alumno', () => {
  // Lunes y jueves de la misma semana son turnos CONSECUTIVOS, no 0 y 3.
  const lunes = studySlotOrdinal('2026-09-14', [0, 3])
  const jueves = studySlotOrdinal('2026-09-17', [0, 3])
  const lunesSiguiente = studySlotOrdinal('2026-09-21', [0, 3])
  assert.equal(jueves - lunes, 1)
  assert.equal(lunesSiguiente - jueves, 1)
})
