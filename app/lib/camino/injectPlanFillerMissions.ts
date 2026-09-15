import 'server-only'

import { type SupabaseClient } from '@supabase/supabase-js'

import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, sanitizeLessonTitle } from './caminoCurriculumPlan'
import { estimatedMinutesForMission, estimatedMinutesForMissionType } from './missionDuration'
import { readAllRows } from './readAllRows'
import { DayScheduler, studyWindowFor } from './scheduleTimeSlot'
import { addDays, getMadridToday, mondayBasedDayIndex } from './studyDays'
import { loadStudentPlanContext, planningDates } from './studentPlanContext'

// RELLENO DEL PLAN: el paso que impide que queden días de estudio vacíos.
//
// El ritmo (camino/contentPace.ts) deja de vaciar la cola en ocho semanas,
// pero por sí solo no llena el día: reparte 308 temas entre 163 días de
// estudio, así que un alumno de 180 min al día recibe ~48 minutos de temario
// nuevo y le sobran ~130. Y el tramo final de consolidación —más de dos
// meses— no recibe temario nuevo EN ABSOLUTO, por diseño. Sin este paso, esos
// minutos seguían apareciendo como "Aún sin planificar".
//
// Lo que los llena es repaso espaciado real de lo que el alumno YA ha visto:
// nunca se propone repasar un tema antes de su propia lección, y cada vuelta
// se aleja de la anterior. No es relleno decorativo — 308 temas por cinco
// vueltas son ~1.500 sesiones de 20 minutos, que es aproximadamente la
// capacidad que sobra en un curso entero a máxima disponibilidad.
//
// Las filas van con queue_id = null, como las de repaso por área débil
// (injectWeakReviewMissions.ts) y por el mismo motivo, que no es estético:
// `camino_one_live_placement_per_queue` permite UNA sola colocación viva por
// item de cola, y `camino_reconcile_work` marca como 'superseded' cualquier
// fila pendiente cuyo item de cola esté completado. Un repaso que reutilizara
// el queue_id de su lección desaparecería en cuanto el alumno diera la
// lección — justo cuando el repaso empieza a tener sentido.
const FILLER_VERSION = 'plan_filler_v1'

// Días naturales entre la lección y cada vuelta de repaso. Creciente: la
// primera vuelta llega mientras el tema aún está fresco y las siguientes se
// separan a medida que se asienta. Cinco vueltas es el máximo por tema; a
// partir de ahí el tema deja de ser candidato y el hueco lo ocupa otro.
const REVIEW_INTERVALS_DAYS = [7, 21, 50, 100, 170] as const

// Cuántos días de estudio se rellenan por ejecución cuando nadie pide una
// fecha concreta. Coincide con el horizonte de siembra de
// ensureCaminoCalendar: una carga normal no debe recorrer el curso entero.
// Al navegar a una semana futura, `throughDate` amplía este alcance igual que
// amplía el horizonte de temario.
const DEFAULT_FILL_HORIZON_DAYS = 30

// Tope de repasos del mismo tema en la misma semana. Sin él, un alumno con
// pocos temas vistos todavía recibiría el mismo repaso dos días seguidos.
const MIN_DAYS_BETWEEN_REVIEWS_OF_A_TOPIC = 6

const INSERT_CHUNK_SIZE = 500

type CalendarRow = {
  id: string
  scheduled_date: string
  subject: string
  v2_sort_order: number | null
  status: string
  mission_type: string | null
  start_time: string | null
  end_time: string | null
  metadata: Record<string, unknown> | null
}

type EventRow = {
  event_date: string
  recurrence: string
  recurrence_until: string | null
  day_of_week: number | null
  start_time: string | null
  end_time: string | null
}

function metadataObject(value: Record<string, unknown> | null | undefined): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

function topicKey(subject: string, sortOrder: number) {
  return `${normalizeSubjectSlug(subject)}:${sortOrder}`
}

/** Un tema repasable: su lección y las vueltas que ya tiene programadas. */
type ReviewCandidate = {
  key: string
  subject: string
  sortOrder: number
  title: string
  blockSlug: string | null
  blockTitle: string | null
  topicSlug: string | null
  /** Fecha de la lección: ninguna vuelta puede caer antes. */
  lessonDate: string
  /** Vueltas ya programadas (de cualquier ejecución anterior). */
  round: number
  /** Fecha de la última vuelta programada, para no repetirla en la semana. */
  lastReviewDate: string | null
}

function dueDateFor(candidate: ReviewCandidate): string | null {
  const interval = REVIEW_INTERVALS_DAYS[candidate.round]
  if (interval == null) return null
  return addDays(candidate.lessonDate, interval)
}

/**
 * Llena los días de estudio que tienen presupuesto libre con repaso espaciado.
 *
 * Nunca toca lo ya programado ni el temario nuevo: solo AÑADE en el hueco que
 * el resto del motor ha dejado. Como el resto de inyectores, un fallo aquí no
 * puede tumbar la carga del Camino — se reporta y se sigue.
 *
 * DESACTIVADO mientras quede temario sin ver en CUALQUIER asignatura del
 * alumno (16/09/2026, decisión de producto de Mario): "no puede ser que te
 * falten 90 horas y no puedas dar todo pero sí des repasos" — un alumno con
 * lecciones nuevas todavía pendientes no debe ver repaso de lo que ya sabe
 * mientras le queda por ver lo que no. ensureCaminoCalendar.ts ya no frena el
 * temario nuevo por ritmo (ver ese archivo), así que el hueco que antes
 * ocupaba este relleno ahora lo ocupa la siguiente lección. En cuanto el
 * alumno haya visto TODO su temario (cola vacía en todas sus asignaturas),
 * este inyector vuelve a actuar exactamente como antes — es la vuelta al
 * repaso que toca una vez no queda nada nuevo que dar; el repaso NO
 * desaparece para siempre, solo cede el turno.
 */
export async function injectPlanFillerMissions(
  userId: string,
  supabase: SupabaseClient,
  options: { throughDate?: string } = {},
): Promise<{ inserted: number; filledDays: number; reason?: string }> {
  try {
    const { count: pendingCount, error: pendingError } = await supabase
      .from('user_learning_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('queue_status', 'pending')
    if (pendingError) throw new Error(`Filler pending-queue check failed: ${pendingError.message}`)
    if ((pendingCount ?? 0) > 0) return { inserted: 0, filledDays: 0, reason: 'pending_new_content' }

    const today = getMadridToday()
    const planContext = await loadStudentPlanContext(userId, supabase, today)
    const dailyMinutes = planContext.dailyMinutes
    if (!dailyMinutes || dailyMinutes <= 0) return { inserted: 0, filledDays: 0, reason: 'no_availability' }

    // El repaso SÍ puede ocupar la ventana de repaso final: es exactamente el
    // trabajo para el que esa ventana está reservada.
    const allDates = planningDates(planContext, { includeFinalReviewWindow: true })
    const limitDate = options.throughDate && options.throughDate > addDays(today, DEFAULT_FILL_HORIZON_DAYS)
      ? options.throughDate
      : addDays(today, DEFAULT_FILL_HORIZON_DAYS)
    const dates = allDates.filter(date => date <= limitDate)
    if (dates.length === 0) return { inserted: 0, filledDays: 0, reason: 'no_dates' }
    const lastDate = dates[dates.length - 1]

    // Una sola lectura del calendario entero, no una por día: con el curso
    // completo abierto esto son 200+ fechas y un `createDayScheduler` por
    // fecha convertiría la carga del Camino en cientos de viajes a la base.
    const calendarRows = await readAllRows<CalendarRow>((from, to) => supabase
      .from('camino_calendar')
      .select('id, scheduled_date, subject, v2_sort_order, status, mission_type, start_time, end_time, metadata')
      .eq('user_id', userId)
      .lte('scheduled_date', lastDate)
      .in('status', ['pending', 'postponed', 'completed'])
      .order('scheduled_date', { ascending: true })
      .order('id', { ascending: true })
      .range(from, to))

    const { data: eventRows, error: eventsError } = await supabase
      .from('camino_custom_events')
      .select('event_date, recurrence, recurrence_until, day_of_week, start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
    if (eventsError) throw new Error(`Filler events read failed: ${eventsError.message}`)

    // Temas con lección: la fecha más temprana en que el alumno lo ve o lo vio.
    const lessonDateByTopic = new Map<string, string>()
    // Vueltas de repaso ya existentes, vengan de aquí o de un área débil.
    const roundsByTopic = new Map<string, number>()
    const lastReviewByTopic = new Map<string, string>()
    const takenByDate = new Map<string, Set<string>>()
    const usedMinutesByDate = new Map<string, number>()
    const busyByDate = new Map<string, { start: string; end: string; subject?: string | null; missionType?: string | null }[]>()

    const isReviewRow = (row: CalendarRow) =>
      row.mission_type === 'review' || metadataObject(row.metadata).weak_review === true

    // PRIMERA PASADA — las lecciones. Tiene que estar completa antes de juzgar
    // ningún repaso: la fecha de una lección no es fija durante el curso.
    for (const row of calendarRows) {
      if (row.v2_sort_order == null || isReviewRow(row)) continue
      const key = topicKey(row.subject, row.v2_sort_order)
      const known = lessonDateByTopic.get(key)
      if (!known || row.scheduled_date < known) lessonDateByTopic.set(key, row.scheduled_date)
    }

    // Repasos que han quedado ADELANTADOS a su propia lección. Pasa de verdad:
    // el reparto del temario mueve lecciones a lo largo del curso, así que un
    // repaso sembrado en octubre para un tema que ahora se da en febrero
    // propone repasar algo que el alumno todavía no ha visto. `place_not_before`
    // impide que el personalizador los adelante, pero no que la lección se
    // retrase por debajo de ellos.
    //
    // Se borran, no se mueven: son filas generadas que el alumno no ha tocado
    // (status 'pending', sin trabajo asociado) y este mismo pase las vuelve a
    // sembrar donde toca. Nunca se toca nada completado, fallado o de otra
    // procedencia.
    const staleIds = calendarRows.filter(row => {
      if (row.status !== 'pending') return false
      if (metadataObject(row.metadata).plan_filler !== true) return false
      if (row.v2_sort_order == null) return true
      const lesson = lessonDateByTopic.get(topicKey(row.subject, row.v2_sort_order))
      return lesson == null || lesson >= row.scheduled_date
    }).map(row => row.id)
    if (staleIds.length > 0) {
      const { error: staleError } = await supabase
        .from('camino_calendar')
        .delete()
        .eq('user_id', userId)
        .eq('status', 'pending')
        .eq('generated_by', FILLER_VERSION)
        .in('id', staleIds)
      if (staleError) throw new Error(`Stale filler cleanup failed: ${staleError.message}`)
    }
    const stale = new Set(staleIds)

    // SEGUNDA PASADA — ocupación real del día y vueltas ya programadas, ya sin
    // las filas que acaban de retirarse.
    for (const row of calendarRows) {
      if (stale.has(row.id)) continue
      const date = row.scheduled_date
      usedMinutesByDate.set(date, (usedMinutesByDate.get(date) ?? 0) + estimatedMinutesForMission(row))
      if (row.start_time && row.end_time) {
        if (!busyByDate.has(date)) busyByDate.set(date, [])
        busyByDate.get(date)!.push({ start: row.start_time, end: row.end_time, subject: row.subject, missionType: row.mission_type })
      }
      if (row.v2_sort_order == null) continue
      const key = topicKey(row.subject, row.v2_sort_order)
      if (!takenByDate.has(date)) takenByDate.set(date, new Set())
      takenByDate.get(date)!.add(key)
      if (!isReviewRow(row)) continue
      roundsByTopic.set(key, (roundsByTopic.get(key) ?? 0) + 1)
      const previous = lastReviewByTopic.get(key)
      if (!previous || date > previous) lastReviewByTopic.set(key, date)
    }

    // Identidad del tema (título, bloque, slug) desde el currículo, que es la
    // fuente de verdad: el título de una fila de calendario puede venir ya
    // decorado ("Repaso: …", "Práctica prioritaria: …") de otra pasada.
    const topicBySortOrder = new Map<string, typeof CAMINO_CURRICULUM_TOPICS[number]>()
    for (const topic of CAMINO_CURRICULUM_TOPICS) {
      topicBySortOrder.set(topicKey(topic.subject, topic.v2SortOrder ?? topic.orderIndex), topic)
    }

    const candidates: ReviewCandidate[] = []
    for (const [key, lessonDate] of lessonDateByTopic) {
      const topic = topicBySortOrder.get(key)
      if (!topic) continue
      candidates.push({
        key,
        subject: normalizeSubjectSlug(topic.subject),
        sortOrder: topic.v2SortOrder ?? topic.orderIndex,
        title: topic.title,
        blockSlug: topic.blockSlug ?? null,
        blockTitle: topic.blockTitle ?? null,
        topicSlug: topic.topicSlug ?? null,
        lessonDate,
        round: roundsByTopic.get(key) ?? 0,
        lastReviewDate: lastReviewByTopic.get(key) ?? null,
      })
    }
    if (candidates.length === 0) return { inserted: 0, filledDays: 0, reason: 'nothing_to_review' }

    const reviewMinutes = estimatedMinutesForMissionType('review')
    const rowsToInsert: object[] = []
    let filledDays = 0

    for (const dateStr of dates) {
      const used = usedMinutesByDate.get(dateStr) ?? 0
      let remaining = dailyMinutes - used
      if (remaining < reviewMinutes) continue

      const busy = [...(busyByDate.get(dateStr) ?? [])]
      // Los eventos propios del alumno (clase, extraescolares) ocupan hora
      // real igual que en el resto del motor; se resuelven desde la misma
      // lectura en bloque en vez de una consulta por día.
      for (const range of localBusyFor(eventRows as EventRow[] | null, dateStr)) busy.push(range)
      const scheduler = new DayScheduler(busy, studyWindowFor(dateStr), null, remaining)
      const taken = takenByDate.get(dateStr) ?? new Set<string>()
      const subjectsToday = new Set<string>()
      let placedToday = 0

      while (remaining >= reviewMinutes) {
        const candidate = pickCandidate(candidates, dateStr, taken, subjectsToday)
        if (!candidate) break
        const slot = scheduler.placeBest(reviewMinutes, {
          date: dateStr, subject: candidate.subject, missionType: 'review',
        })
        if (!slot) break
        const round = candidate.round + 1
        rowsToInsert.push({
          user_id: userId,
          scheduled_date: dateStr,
          subject: candidate.subject,
          v2_sort_order: candidate.sortOrder,
          title: `Repaso: ${sanitizeLessonTitle(candidate.title)}`,
          block_key: candidate.blockTitle,
          block_slug: candidate.blockSlug,
          mission_type: 'review',
          is_main: true,
          is_bonus: false,
          status: 'pending',
          source: 'algorithm',
          generated_by: FILLER_VERSION,
          queue_id: null,
          start_time: slot.start,
          end_time: slot.end,
          metadata: {
            topic_slug: candidate.topicSlug,
            plan_filler: true,
            plan_filler_version: FILLER_VERSION,
            review_round: round,
            lesson_date: candidate.lessonDate,
            // Suelo duro para cualquier recolocación posterior: un repaso no
            // puede adelantarse a la lección que repasa (ver planPlacement).
            place_not_before: addDays(candidate.lessonDate, 1),
            reason: `Vuelta ${round} sobre este tema: lo diste el ${candidate.lessonDate} y toca asentarlo.`,
          },
        })
        candidate.round = round
        candidate.lastReviewDate = dateStr
        taken.add(candidate.key)
        subjectsToday.add(candidate.subject)
        remaining -= reviewMinutes
        placedToday += 1
      }
      if (placedToday > 0) filledDays += 1
    }

    if (rowsToInsert.length === 0) return { inserted: 0, filledDays: 0, reason: 'no_free_budget' }

    // Por lotes: abrir el curso entero de golpe genera más de mil filas y un
    // único upsert de ese tamaño es una petición que no hace falta arriesgar.
    for (let from = 0; from < rowsToInsert.length; from += INSERT_CHUNK_SIZE) {
      const { error: insertError } = await supabase
        .from('camino_calendar')
        .upsert(rowsToInsert.slice(from, from + INSERT_CHUNK_SIZE), {
          onConflict: 'user_id,scheduled_date,subject,v2_sort_order',
          ignoreDuplicates: true,
        })
      if (insertError) throw new Error(`Plan filler insert error: ${insertError.message}`)
    }

    return { inserted: rowsToInsert.length, filledDays }
  } catch (error) {
    console.warn('[camino/plan-filler] skipped:', error)
    return { inserted: 0, filledDays: 0, reason: 'error' }
  }
}

/**
 * El siguiente tema que toca repasar en esta fecha.
 *
 * Lo más atrasado primero, y a igualdad de atraso se prefiere una asignatura
 * que todavía no haya salido ese día: un día de repaso de seis sesiones de la
 * misma asignatura no es repaso, es un atracón.
 */
function pickCandidate(
  candidates: ReviewCandidate[],
  dateStr: string,
  taken: ReadonlySet<string>,
  subjectsToday: ReadonlySet<string>,
): ReviewCandidate | null {
  let best: ReviewCandidate | null = null
  let bestDue = ''
  let bestFresh = false
  // Respaldo para cuando no hay nada VENCIDO pero el día sigue teniendo
  // presupuesto: lo que lleve más tiempo sin tocarse. Sin él, los días en los
  // que todos los temas han agotado sus cinco vueltas —o en los que todavía
  // no vence ninguna— volvían a quedarse vacíos, que es justo lo que este
  // módulo existe para evitar.
  let fallback: ReviewCandidate | null = null
  let fallbackSeen = ''
  for (const candidate of candidates) {
    if (taken.has(candidate.key)) continue
    // Nunca antes de su propia lección, ni aunque el intervalo diera de sí.
    if (candidate.lessonDate >= dateStr) continue
    if (candidate.lastReviewDate && addDays(candidate.lastReviewDate, MIN_DAYS_BETWEEN_REVIEWS_OF_A_TOPIC) > dateStr) continue
    const lastSeen = candidate.lastReviewDate ?? candidate.lessonDate
    if (!fallback || lastSeen < fallbackSeen) { fallback = candidate; fallbackSeen = lastSeen }
    const due = dueDateFor(candidate)
    if (due == null || due > dateStr) continue
    const fresh = !subjectsToday.has(candidate.subject)
    if (!best || (fresh && !bestFresh) || (fresh === bestFresh && due < bestDue)) {
      best = candidate; bestDue = due; bestFresh = fresh
    }
  }
  return best ?? fallback
}

/** Los tramos ocupados por los eventos propios del alumno en una fecha. */
function localBusyFor(events: EventRow[] | null, dateStr: string) {
  const ranges: { start: string; end: string }[] = []
  const dow = mondayBasedDayIndex(dateStr)
  for (const event of events ?? []) {
    if (!event.start_time || !event.end_time) continue
    if (event.recurrence === 'weekly') {
      if (event.day_of_week !== dow) continue
      if (event.event_date > dateStr) continue
      if (event.recurrence_until && event.recurrence_until < dateStr) continue
    } else if (event.event_date !== dateStr) continue
    ranges.push({ start: event.start_time, end: event.end_time })
  }
  return ranges
}
