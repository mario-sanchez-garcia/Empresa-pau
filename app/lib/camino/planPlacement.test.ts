import assert from 'node:assert/strict'
import { test } from 'node:test'

import { isNewContent, planPlacement, type PlacementRow, type PlacementWindow } from './planPlacement.ts'

const row = (id: string, missionType: string, scheduledDate = '2026-05-20'): PlacementRow =>
  ({ id, missionType, scheduledDate, queueId: `q-${id}` })

// Alumno con la PAU el 07/06 y cinco días de reserva de repaso final: el
// temario nuevo se corta el 01/06.
const WINDOW: PlacementWindow = {
  dates: ['2026-05-25', '2026-05-26', '2026-05-27', '2026-05-28', '2026-05-29', '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05'],
  capacityPerDay: 1,
  planningCutoff: '2026-06-01',
  examDate: '2026-06-07',
}

test('el temario nuevo nunca entra en la reserva de repaso final', () => {
  // Reproducción del informe: con corte de teoría el 26/05, una misión del
  // curso se movía al 26/05, dentro de la reserva.
  const rows = Array.from({ length: 8 }, (_, i) => row(`c${i}`, 'concept'))
  const { placements, unscheduled } = planPlacement(rows, WINDOW)
  for (const placement of placements) {
    assert.ok(placement.date < WINDOW.planningCutoff, `${placement.date} es reserva de repaso final`)
  }
  // Solo caben 5: los tres que sobran se dicen, no se esconden.
  assert.equal(placements.length, 5)
  assert.equal(unscheduled.length, 3)
  for (const item of unscheduled) assert.equal(item.reason, 'no_capacity')
})

test('el repaso y la práctica SÍ pueden caer en la reserva final', () => {
  const rows = Array.from({ length: 8 }, (_, i) => row(`r${i}`, 'review'))
  const { placements, unscheduled } = planPlacement(rows, WINDOW)
  assert.equal(unscheduled.length, 0)
  assert.ok(placements.some(p => p.date >= WINDOW.planningCutoff), 'la reserva final se queda vacía')
})

test('una misión con fecha posterior al examen se marca, no se deja donde está', () => {
  // Reproducción del informe: una fila pendiente el 08/06, con examen el
  // 07/06, permanecía el 08/06 y devolvía cero cambios.
  const late = row('tarde', 'concept', '2026-06-08')
  const { placements, unscheduled } = planPlacement([late], WINDOW)
  assert.equal(placements.length, 1, 'si cabe antes del examen, se recoloca')
  assert.ok(placements[0].date < '2026-06-07')

  // Y si NO cabe, queda explícita con su motivo — nunca en el 08/06.
  const sinHueco = planPlacement([late], { ...WINDOW, dates: [] })
  assert.deepEqual(sinHueco.placements, [])
  assert.deepEqual(sinHueco.unscheduled, [{ id: 'tarde', queueId: 'q-tarde', reason: 'after_exam' }])
})

test('ninguna fecha propuesta alcanza el examen, ni aunque se le pasen', () => {
  const conFechasImposibles: PlacementWindow = {
    ...WINDOW,
    dates: [...WINDOW.dates, '2026-06-07', '2026-06-08', '2026-07-08'],
  }
  const rows = Array.from({ length: 20 }, (_, i) => row(`r${i}`, 'review'))
  for (const placement of planPlacement(rows, conFechasImposibles).placements) {
    assert.ok(placement.date < '2026-06-07', `${placement.date} alcanza o pasa el examen`)
  }
})

test('el temario nuevo se sirve primero: el repaso no le gasta los días', () => {
  // Si el repaso fuera primero, ocuparía los días anteriores al corte y el
  // temario nuevo se quedaría sin ninguno, aunque el repaso sí cabía después.
  const rows = [
    ...Array.from({ length: 5 }, (_, i) => row(`r${i}`, 'review')),
    ...Array.from({ length: 5 }, (_, i) => row(`c${i}`, 'concept')),
  ]
  const { placements, unscheduled } = planPlacement(rows, WINDOW)
  assert.equal(unscheduled.length, 0, 'todo cabía y algo se ha quedado fuera')
  const content = placements.filter(p => p.id.startsWith('c'))
  assert.equal(content.length, 5)
  for (const p of content) assert.ok(p.date < WINDOW.planningCutoff)
})

test('sin ningún día para temario nuevo, el motivo lo dice', () => {
  const dentroDeLaReserva: PlacementWindow = { ...WINDOW, dates: ['2026-06-02', '2026-06-03'], planningCutoff: '2026-06-01' }
  const { unscheduled } = planPlacement([row('c', 'concept')], dentroDeLaReserva)
  assert.deepEqual(unscheduled.map(u => u.reason), ['final_review_window'])
})

test('la capacidad diaria se respeta y se comparte entre los dos grupos', () => {
  const dos: PlacementWindow = { ...WINDOW, capacityPerDay: 2 }
  const rows = [row('c0', 'concept'), row('c1', 'concept'), row('r0', 'review')]
  const { placements } = planPlacement(rows, dos)
  const perDay = new Map<string, number>()
  for (const p of placements) perDay.set(p.date, (perDay.get(p.date) ?? 0) + 1)
  for (const [date, count] of perDay) assert.ok(count <= 2, `${date} tiene ${count} misiones`)
  // Tres misiones con capacidad 2 ocupan DOS días, no tres: los dos temarios
  // llenan el primero y el repaso abre el segundo.
  assert.equal(perDay.size, 2)
  assert.equal(perDay.get('2026-05-25'), 2)
  assert.equal(placements.find(p => p.id === 'r0')?.date, '2026-05-26')
})

test('ninguna fila desaparece: o se coloca o se cuenta', () => {
  const rows = [
    row('a', 'concept'), row('b', 'review'), row('c', 'pau_practice'),
    row('d', 'comment_text'), row('e', 'concept', '2026-06-20'),
  ]
  for (const window of [WINDOW, { ...WINDOW, dates: [] }, { ...WINDOW, capacityPerDay: 0 }]) {
    const { placements, unscheduled } = planPlacement(rows, window)
    assert.equal(placements.length + unscheduled.length, rows.length)
    const ids = [...placements.map(p => p.id), ...unscheduled.map(u => u.id)].sort()
    assert.deepEqual(ids, ['a', 'b', 'c', 'd', 'e'])
  }
})

test('isNewContent: solo lección y comentario de texto son temario nuevo', () => {
  assert.equal(isNewContent('concept'), true)
  assert.equal(isNewContent('comment_text'), true)
  assert.equal(isNewContent(null), true) // por defecto, lección
  assert.equal(isNewContent('review'), false)
  assert.equal(isNewContent('pau_practice'), false)
  assert.equal(isNewContent('partial_practice'), false)
})

// ── "No cabe" solo tras agotar los días ─────────────────────────────────

test('un día sin hueco horario hace pasar al siguiente, no abandonar la misión', () => {
  // Reproducción del informe: una misión, lunes ocupado, miércoles libre
  // antes del corte — solo se consultaba el lunes y salía 'no_capacity'.
  const ocupado = '2026-05-25'
  const { placements, unscheduled } = planPlacement(
    [row('m', 'concept')],
    WINDOW,
    (_row, date) => date !== ocupado,
  )
  assert.deepEqual(unscheduled, [])
  assert.equal(placements.length, 1)
  assert.equal(placements[0].date, '2026-05-26')
})

test('el día rechazado no consume su capacidad: sigue libre para otra misión', () => {
  const soloRechazaLaPrimera = (r: PlacementRow, date: string) => !(r.id === 'a' && date === '2026-05-25')
  const { placements } = planPlacement([row('a', 'concept'), row('b', 'concept')], WINDOW, soloRechazaLaPrimera)
  assert.equal(placements.find(p => p.id === 'a')?.date, '2026-05-26')
  assert.equal(placements.find(p => p.id === 'b')?.date, '2026-05-25')
})

test('solo se declara sin sitio cuando TODOS sus días la rechazan', () => {
  const { placements, unscheduled } = planPlacement([row('m', 'concept')], WINDOW, () => false)
  assert.deepEqual(placements, [])
  assert.deepEqual(unscheduled.map(u => u.reason), ['no_capacity'])
})

test('la agenda llena no cambia el motivo cuando el problema es la fecha', () => {
  // Una fila posterior al examen sigue diciendo 'after_exam', no 'no_capacity'.
  const late = row('tarde', 'review', '2026-06-20')
  const { unscheduled } = planPlacement([late], WINDOW, () => false)
  assert.deepEqual(unscheduled.map(u => u.reason), ['after_exam'])
})
