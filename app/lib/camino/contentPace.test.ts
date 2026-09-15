import assert from 'node:assert/strict'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { CONSOLIDATION_RESERVE_RATIO, contentPaceDates, dailyNewContentBudget } from './contentPace.ts'
import { buildStudentPlanContext, planningDates } from './planWindow.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const dates = (n: number) => Array.from({ length: n }, (_, i) => `d${String(i).padStart(3, '0')}`)

test('el tramo final de consolidacion no recibe temario nuevo', () => {
  const all = dates(218)
  const pace = contentPaceDates(all)
  assert.equal(pace.length, 218 - Math.floor(218 * CONSOLIDATION_RESERVE_RATIO))
  assert.equal(pace[0], all[0])
  assert.ok(pace.at(-1)! < all.at(-1)!, 'el ultimo dia del curso no puede llevar temario nuevo')
})

test('un curso de un solo dia sigue teniendo donde colocar el temario', () => {
  assert.deepEqual(contentPaceDates(['solo']), ['solo'])
  assert.deepEqual(contentPaceDates([]), [])
})

test('el temario se reparte en vez de agotarse: 308 temas no caben en ocho semanas', () => {
  // Caso reproducido: 180 min x 6 dias, PAU 07/06/2027, temario real.
  const context = buildStudentPlanContext({
    today: '2026-09-14', examDate: '2027-06-07', dailyMinutes: 180, weeklyStudyDays: 6, holidays: new Set(),
  })
  const all = planningDates(context, { includeFinalReviewWindow: true })
  const pace = contentPaceDates(all)
  const pendingContentMinutes = 7740
  const perDay = dailyNewContentBudget({ pendingContentMinutes, paceStudyDays: pace.length, dailyMinutes: 180 })
  assert.ok(perDay < 180, 'a maxima velocidad el temario se agota antes de noviembre')
  // El reparto tiene que cubrir el temario entero dentro del tramo de ritmo.
  assert.ok(perDay * pace.length >= pendingContentMinutes, 'el reparto no puede dejar temario fuera')
  const daysUsed = Math.ceil(pendingContentMinutes / perDay)
  assert.ok(daysUsed > 45, `el temario seguia cabiendo en ${daysUsed} dias de estudio`)
})

test('el ritmo nunca frena a quien va justo de tiempo', () => {
  // Mas temario que capacidad: el tope se queda en el presupuesto completo.
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 9000, paceStudyDays: 20, dailyMinutes: 180 }), 180)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 1, paceStudyDays: 0, dailyMinutes: 180 }), 180)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 0, paceStudyDays: 100, dailyMinutes: 180 }), 180)
})

test('el reparto nunca baja de una mision: un dia de ritmo no puede quedar en cero', () => {
  const budget = dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 180 })
  assert.ok(budget >= 25, `un tope de ${budget} min deja dias sin una sola mision`)
  // ...salvo que el propio alumno declare menos que una mision de referencia.
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 20 }), 20)
  assert.equal(dailyNewContentBudget({ pendingContentMinutes: 10, paceStudyDays: 200, dailyMinutes: 0 }), 0)
})

// ── Presupuesto acumulado: función pura primero, antes de tocar el motor ──
// (ver la nota larga en contentPace.ts sobre los dos intentos descartados)

import { admitsCumulativeNewContent, cumulativeNewContentAllowance } from './contentPace.ts'

test('el ejemplo de referencia: 36 min/dia, sesiones de 30, los restos se acumulan', () => {
  const paceDates = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6']
  const allowance = cumulativeNewContentAllowance(paceDates, 36)
  assert.deepEqual([...allowance.values()], [36, 72, 108, 144, 180, 216])

  let scheduled = 0
  const placedPerDay: number[] = []
  for (const date of paceDates) {
    const allowed = allowance.get(date)!
    let today = 0
    while (admitsCumulativeNewContent({ cumulativeScheduledMinutes: scheduled, missionMinutes: 30, cumulativeAllowedMinutes: allowed })) {
      scheduled += 30; today += 30
    }
    placedPerDay.push(today)
  }
  // dia1-4: una sesion (30). dia5: el acumulado ya permite DOS (180<=180).
  // dia6: vuelve a una. Los restos nunca se pierden, solo se retrasan.
  assert.deepEqual(placedPerDay, [30, 30, 30, 30, 60, 30])
  assert.equal(scheduled, 210, '7 sesiones de 30 en 6 dias: mas de una sesion por dia de media, no menos')
})

test('sin redondeo: el acumulado no necesita tolerancia de media mision', () => {
  // Con el modelo diario, budget=45 y sesion=30 admitia una 2a sesion por el
  // redondeo (30+15<=45). Con el acumulado, 45 solo autoriza una sesion mas
  // los 15 min sobrantes de este dia (no otra sesion entera): la comparacion
  // es exacta, no aproximada.
  const allowance = cumulativeNewContentAllowance(['d1'], 45)
  assert.equal(admitsCumulativeNewContent({ cumulativeScheduledMinutes: 0, missionMinutes: 30, cumulativeAllowedMinutes: allowance.get('d1')! }), true)
  assert.equal(admitsCumulativeNewContent({ cumulativeScheduledMinutes: 30, missionMinutes: 30, cumulativeAllowedMinutes: allowance.get('d1')! }), false, '30+30=60 > 45: no cabe, y no deberia -- el acumulado ya cuenta el resto para MANANA, no para regalarlo hoy')
})

test('el plan nunca empieza a cero, aunque la primera mision sea mas larga que un dia de presupuesto', () => {
  const allowance = cumulativeNewContentAllowance(['d1'], 10)
  assert.equal(admitsCumulativeNewContent({ cumulativeScheduledMinutes: 0, missionMinutes: 90, cumulativeAllowedMinutes: allowance.get('d1')! }), true)
})

test('no hace falta deuda: un presupuesto positivo siempre acaba desbloqueando cualquier mision', () => {
  // Mario pidio explicitamente no improvisar una regla de deuda. No hace
  // falta: el acumulado SOLO CRECE con cada dia de ritmo, asi que una
  // mision que hoy no cabe, cabe mas adelante sin necesitar prestamo.
  const paceDates = Array.from({ length: 30 }, (_, i) => `d${String(i).padStart(2, '0')}`)
  const allowance = cumulativeNewContentAllowance(paceDates, 5) // presupuesto muy bajo
  const bigMission = 90
  const scheduled = 30 // ya hay algo colocado, no es la primera mision del plan
  // Con 5 min/dia hacen falta (30+90)/5=24 dias de ritmo para desbloquearla
  // -- tarde, pero sin necesitar prestamo ni deuda.
  const unlockedAt = paceDates.find(d => admitsCumulativeNewContent({ cumulativeScheduledMinutes: scheduled, missionMinutes: bigMission, cumulativeAllowedMinutes: allowance.get(d)! }))
  assert.equal(unlockedAt, 'd23', 'se desbloquea justo cuando el acumulado alcanza 120 (24 dias x 5), ni un dia antes')
})

// Simulacion PURA de colocacion (no ensureCaminoCalendar, no Supabase): mismo
// esqueleto que el motor real -- por fecha, por asignatura en orden de
// rotacion, cursor por asignatura -- pero en memoria, para probar
// convergencia y neutralidad de rotacion ANTES de integrar nada.
type SimItem = { id: string; subject: string; minutes: number }
type SimPlaced = { id: string; date: string; subject: string; minutes: number }

function simulatePlacement(input: {
  paceDates: readonly string[]
  dailyBudget: number
  dailyMinutesCap: number
  items: readonly SimItem[]
  rotationOrder: (date: string) => string[]
  alreadyScheduled?: readonly SimPlaced[]
}): SimPlaced[] {
  const allowance = cumulativeNewContentAllowance(input.paceDates, input.dailyBudget)
  const placed: SimPlaced[] = [...(input.alreadyScheduled ?? [])]
  let cumulativeScheduled = placed.reduce((sum, r) => sum + r.minutes, 0)
  const bySubject = new Map<string, SimItem[]>()
  for (const item of input.items) {
    if (!bySubject.has(item.subject)) bySubject.set(item.subject, [])
    bySubject.get(item.subject)!.push(item)
  }
  const cursors = new Map<string, number>()
  for (const date of input.paceDates) {
    const allowed = allowance.get(date)!
    let dayTotal = 0
    for (const subject of input.rotationOrder(date)) {
      const queue = bySubject.get(subject) ?? []
      let cursor = cursors.get(subject) ?? 0
      while (cursor < queue.length) {
        const item = queue[cursor]
        if (dayTotal + item.minutes > input.dailyMinutesCap) break // tope FISICO del dia
        if (!admitsCumulativeNewContent({ cumulativeScheduledMinutes: cumulativeScheduled, missionMinutes: item.minutes, cumulativeAllowedMinutes: allowed })) break
        placed.push({ id: item.id, date, subject, minutes: item.minutes })
        cumulativeScheduled += item.minutes
        dayTotal += item.minutes
        cursor++
      }
      cursors.set(subject, cursor)
    }
  }
  return placed
}

test('convergencia: ejecutar la simulacion 1, 2, 3 y 5 veces da el mismo resultado final', () => {
  const paceDates = Array.from({ length: 40 }, (_, i) => `d${String(i).padStart(2, '0')}`)
  const items: SimItem[] = Array.from({ length: 60 }, (_, i) => ({ id: `h-${i}`, subject: 'historia', minutes: 30 }))
  const rotation = () => ['historia']
  const dailyBudget = 36, dailyMinutesCap = 60

  const once = simulatePlacement({ paceDates, dailyBudget, dailyMinutesCap, items, rotationOrder: rotation })

  // "Varias ejecuciones": cada pasada relee lo YA colocado (como pacedRows en
  // produccion) y solo intenta con lo que queda de cola, sobre el MISMO
  // rango de fechas objetivo completo -- igual que ensureCaminoCalendar
  // releyendo el mismo throughDate una y otra vez.
  function runNTimes(n: number): SimPlaced[] {
    let scheduled: SimPlaced[] = []
    for (let i = 0; i < n; i++) {
      const placedIds = new Set(scheduled.map(r => r.id))
      const remaining = items.filter(item => !placedIds.has(item.id))
      scheduled = simulatePlacement({ paceDates, dailyBudget, dailyMinutesCap, items: remaining, rotationOrder: rotation, alreadyScheduled: scheduled })
    }
    return scheduled
  }
  for (const n of [2, 3, 5]) {
    const repeated = runNTimes(n)
    assert.equal(repeated.length, once.length, `${n} pasadas deberian dar el mismo numero de filas que una sola (${once.length}), no ${repeated.length}`)
    assert.deepEqual(repeated.map(r => r.id).sort(), once.map(r => r.id).sort(), `${n} pasadas colocan exactamente los mismos temas`)
    assert.deepEqual(repeated.map(r => `${r.id}@${r.date}`).sort(), once.map(r => `${r.id}@${r.date}`).sort(), `${n} pasadas colocan cada tema en la MISMA fecha`)
  }
})

test('dos o mas asignaturas: ninguna recibe presupuesto independiente', () => {
  const paceDates = Array.from({ length: 10 }, (_, i) => `d${i}`)
  const items: SimItem[] = [
    ...Array.from({ length: 20 }, (_, i) => ({ id: `h-${i}`, subject: 'historia', minutes: 30 })),
    ...Array.from({ length: 20 }, (_, i) => ({ id: `f-${i}`, subject: 'fisica', minutes: 30 })),
  ]
  const placed = simulatePlacement({
    paceDates, dailyBudget: 36, dailyMinutesCap: 60, items,
    rotationOrder: date => date.charCodeAt(1) % 2 === 0 ? ['historia', 'fisica'] : ['fisica', 'historia'],
  })
  const totalMinutes = placed.reduce((sum, r) => sum + r.minutes, 0)
  const allowance = cumulativeNewContentAllowance(paceDates, 36)
  const maxAllowed = [...allowance.values()].at(-1)!
  assert.ok(totalMinutes <= maxAllowed, `${totalMinutes} min colocados no puede superar el acumulado total (${maxAllowed}) aunque haya dos asignaturas compitiendo`)
  // Ninguna asignatura por separado llega a "su propio" acumulado completo:
  // las dos comparten el mismo total, no tienen 36 min/dia cada una.
  const porHistoria = placed.filter(r => r.subject === 'historia').reduce((s, r) => s + r.minutes, 0)
  const porFisica = placed.filter(r => r.subject === 'fisica').reduce((s, r) => s + r.minutes, 0)
  assert.ok(porHistoria + porFisica === totalMinutes)
  assert.ok(porHistoria < maxAllowed && porFisica < maxAllowed, 'ninguna de las dos agota el acumulado ella sola')
})

test('cambiar el orden de rotacion cambia QUE asignatura recibe cada mision, no CUANTO cabe en total', () => {
  const paceDates = Array.from({ length: 15 }, (_, i) => `d${i}`)
  const items: SimItem[] = [
    ...Array.from({ length: 30 }, (_, i) => ({ id: `h-${i}`, subject: 'historia', minutes: 30 })),
    ...Array.from({ length: 30 }, (_, i) => ({ id: `f-${i}`, subject: 'fisica', minutes: 30 })),
  ]
  const config = { paceDates, dailyBudget: 40, dailyMinutesCap: 60, items }
  const historiaPrimero = simulatePlacement({ ...config, rotationOrder: () => ['historia', 'fisica'] })
  const fisicaPrimero = simulatePlacement({ ...config, rotationOrder: () => ['fisica', 'historia'] })

  const totalMinutes = (rows: SimPlaced[]) => rows.reduce((s, r) => s + r.minutes, 0)
  assert.equal(totalMinutes(historiaPrimero), totalMinutes(fisicaPrimero), 'el total colocado no depende de quien va primero')
  // Pero SI cambia el reparto entre asignaturas: la que va primero cada dia
  // se lleva mas huecos disputados.
  const porSujeto = (rows: SimPlaced[], subject: string) => rows.filter(r => r.subject === subject).reduce((s, r) => s + r.minutes, 0)
  assert.notEqual(porSujeto(historiaPrimero, 'historia'), porSujeto(fisicaPrimero, 'historia'), 'el orden SI cambia el reparto entre asignaturas')
})

test('nunca supera el presupuesto fisico del dia (dailyMinutesCap), aunque el acumulado de sobra', () => {
  const paceDates = Array.from({ length: 30 }, (_, i) => `d${i}`)
  // Presupuesto de ritmo alto para forzar que el acumulado permita mucho,
  // pero el dia solo tiene 60 min reales de horario.
  const items: SimItem[] = Array.from({ length: 30 }, (_, i) => ({ id: `t-${i}`, subject: 'x', minutes: 30 }))
  const placed = simulatePlacement({ paceDates, dailyBudget: 180, dailyMinutesCap: 60, items, rotationOrder: () => ['x'] })
  const byDate = new Map<string, number>()
  for (const r of placed) byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.minutes)
  for (const [date, minutes] of byDate) assert.ok(minutes <= 60, `${date} coloco ${minutes} min, mas de los 60 reales del dia`)
})

test('la reserva de repaso final sigue fuera: el acumulado no crece mas alla de contentPaceDates', () => {
  const allDates = Array.from({ length: 100 }, (_, i) => `d${String(i).padStart(3, '0')}`)
  const paceDates = contentPaceDates(allDates) // recorta el ultimo 25%
  const allowance = cumulativeNewContentAllowance(paceDates, 36)
  assert.equal(allowance.size, paceDates.length)
  assert.ok(!allowance.has(allDates.at(-1)!), 'el ultimo dia del curso esta en la reserva, no tiene acumulado')
  const maxAllowed = [...allowance.values()].at(-1)!
  assert.equal(maxAllowed, paceDates.length * 36)
})

test('el forecast (horas fuera) no depende de contentPace: el arreglo no puede tocar el deficit', () => {
  // coverageForecast.ts hace su PROPIA simulacion de colocacion (greedy, sin
  // ritmo) para decidir que "no cabe". Si algun dia importa contentPace,
  // esta prueba avisa: significaria que el arreglo del reparto diario
  // podria mover las horas fuera, que es justo lo que NO debe pasar (son
  // aritmetica pura: trabajo total - capacidad total).
  const source = readFileSync(path.join(__dirname, 'coverageForecast.ts'), 'utf8')
  assert.ok(!source.includes('contentPace'), 'coverageForecast.ts no debe importar contentPace')
})

test('escenario real: con el acumulado, muchos menos dias de puro repaso que con el reparto diario', () => {
  // Mismo caso reproducido con el motor real esta sesion: 3 asignaturas,
  // temario real, 60 min/dia. El reparto diario (dailyNewContentBudget +
  // admitsMoreNewContent, dia a dia) dejaba 44 de 119 dias sin una sola
  // leccion nueva. Aqui se compara el mismo calculo puro (mismos numeros:
  // pendiente y paceStudyDays reales) con el acumulado.
  const seed = JSON.parse(readFileSync(path.join(__dirname, '..', '..', 'data', 'camino', 'curriculum_seed.json'), 'utf8')) as Array<{ subject: string }>
  const subjects = ['matematicas_ii', 'historia_espana', 'fisica']
  const items: SimItem[] = seed
    .filter(t => subjects.includes(t.subject))
    .map((t, i) => ({ id: `${t.subject}-${i}`, subject: t.subject, minutes: 30 }))
  const paceDates = Array.from({ length: 159 }, (_, i) => `d${String(i).padStart(3, '0')}`).slice(0, 119)
  const dailyBudget = 36 // el mismo presupuesto que dio el motor real en este caso
  const dailyMinutesCap = 60
  const rotation = (() => {
    const order = [...subjects]
    return (date: string) => {
      const shift = Number(date.slice(1)) % order.length
      return [...order.slice(shift), ...order.slice(0, shift)]
    }
  })()

  const placed = simulatePlacement({ paceDates, dailyBudget, dailyMinutesCap, items, rotationOrder: rotation })
  const byDate = new Map<string, number>()
  for (const r of placed) byDate.set(r.date, (byDate.get(r.date) ?? 0) + r.minutes)
  const diasSinNada = paceDates.filter(d => !((byDate.get(d) ?? 0) > 0)).length
  // El reparto diario original dejaba 44 de 119 dias sin nada. El acumulado
  // tiene que mejorarlo claramente.
  assert.ok(diasSinNada < 15, `${diasSinNada} dias sin temario nuevo de 119 -- deberia ser muy inferior a los 44 del reparto diario`)
})
