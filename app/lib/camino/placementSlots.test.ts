import assert from 'node:assert/strict'
import test from 'node:test'

import { MissionSlots, missionSlotKey } from './placementSlots.ts'

// El caso real que motivó el módulo: un alumno con 65 misiones vivas veía "no
// hemos podido terminar de actualizar tu Camino" en CADA carga. El pase de
// recolocación proponía seis pares de misiones de la misma asignatura y el
// mismo v2_sort_order en el mismo día; camino_apply_placements escribe todo el
// pase en una transacción, así que la restricción UNIQUE la abortaba entera y
// no se movía ni una sola misión. Al no cambiar nada, el intento siguiente
// volvía a colisionar igual.

test('una plaza ya tomada no admite una segunda mision', () => {
  const slots = new MissionSlots([{ scheduled_date: '2026-09-23', subject: 'matematicas_ii', v2_sort_order: 11 }])
  const otra = { scheduled_date: '2026-10-01', subject: 'matematicas_ii', v2_sort_order: 11 }
  assert.equal(slots.available('2026-09-23', otra), false)
  assert.equal(slots.available('2026-09-24', otra), true)
})

test('quedarse donde ya esta nunca se bloquea a si misma', () => {
  const fila = { scheduled_date: '2026-09-23', subject: 'matematicas_ii', v2_sort_order: 11 }
  const slots = new MissionSlots([fila])
  assert.equal(slots.available('2026-09-23', fila), true)
})

test('mover libera la plaza de origen y toma la de destino', () => {
  const fila = { scheduled_date: '2026-09-23', subject: 'matematicas_ii', v2_sort_order: 11 }
  const slots = new MissionSlots([fila])
  slots.move('2026-09-30', fila)

  // La que venia detras ya puede ocupar el hueco que ha dejado.
  const siguiente = { scheduled_date: '2026-11-02', subject: 'matematicas_ii', v2_sort_order: 11 }
  assert.equal(slots.available('2026-09-23', siguiente), true)
  assert.equal(slots.available('2026-09-30', siguiente), false)
})

test('una asignatura distinta o un sort_order distinto no comparten plaza', () => {
  const slots = new MissionSlots([{ scheduled_date: '2026-09-23', subject: 'matematicas_ii', v2_sort_order: 11 }])
  assert.equal(slots.available('2026-09-23', { scheduled_date: null, subject: 'fisica', v2_sort_order: 11 }), true)
  assert.equal(slots.available('2026-09-23', { scheduled_date: null, subject: 'matematicas_ii', v2_sort_order: 12 }), true)
})

// Los parciales van con v2_sort_order nulo y en SQL dos NULL nunca son
// iguales, asi que la restriccion no los alcanza: dos parciales pueden
// compartir dia sin que nada falle, y bloquearlos seria inventar un limite.
test('las filas sin v2_sort_order no ocupan ni reservan plaza', () => {
  assert.equal(missionSlotKey('2026-09-23', 'matematicas_ii', null), null)
  const slots = new MissionSlots([{ scheduled_date: '2026-09-23', subject: 'matematicas_ii', v2_sort_order: null }])
  const parcial = { scheduled_date: '2026-09-20', subject: 'matematicas_ii', v2_sort_order: null }
  assert.equal(slots.available('2026-09-23', parcial), true)
  slots.move('2026-09-23', parcial)
  assert.equal(slots.available('2026-09-23', parcial), true)
})

test('el pase completo no propone dos veces la misma plaza', () => {
  // Tres misiones del mismo tema compitiendo por el mismo dia preferido.
  const slots = new MissionSlots([])
  const filas = [
    { scheduled_date: '2026-10-05', subject: 'matematicas_ii', v2_sort_order: 5 },
    { scheduled_date: '2026-10-06', subject: 'matematicas_ii', v2_sort_order: 5 },
    { scheduled_date: '2026-10-07', subject: 'matematicas_ii', v2_sort_order: 5 },
  ]
  const dias = ['2026-09-23', '2026-09-24', '2026-09-25']
  const colocadas: string[] = []
  for (const fila of filas) {
    const dia = dias.find(d => slots.available(d, fila))
    assert.ok(dia, 'una mision se ha quedado sin fecha disponible')
    slots.move(dia, fila)
    colocadas.push(missionSlotKey(dia, fila.subject, fila.v2_sort_order)!)
  }
  assert.equal(new Set(colocadas).size, colocadas.length, 'el pase repite una plaza y la transaccion fallaria entera')
})
