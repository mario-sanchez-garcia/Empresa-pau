import 'server-only'

import { loadCalendarDiagnostics } from './calendarDiagnostics'
import { createHash } from 'crypto'
import { readAllRows } from './readAllRows'
import { reconcilePlanWork } from './planPersistence'
import { getAvailability, busySlotsForMadridDate, type LocalBusyRange } from '../calendar/availability'
import { minutesForPlacement, placementDurationMetadata, CONTENT_DURATION_MODEL } from './placementDuration'
import { MissionSlots, type SlotRow } from './placementSlots'
import { type SupabaseClient } from '@supabase/supabase-js'

import { getMadridToday, mondayBasedDayIndex } from './studyDays'
import { canRepositionAutomatically } from './automaticPlacement'
import { VALID_DAILY_MINUTES } from './dailyTimeCapacity'
import { createDaySchedulers, type DayScheduler } from './scheduleTimeSlot'
import { loadStudentPlanContext, planningDates, type DeclaredAvailability, type StudentPlanContext } from './studentPlanContext'
import { eligibleDatesForRow, isNewContent, orderRowsForPlacement, preferredDatesFor, unscheduledReasonFor, type PlacementRow, type PlacementWindow } from './planPlacement'
import { admitsMoreNewContent, contentPaceDates, dailyNewContentBudget } from './contentPace'
import { normalizeTime, toMinutes } from './missionDuration'

const VALID_WEEKLY_DAYS = [1, 2, 3, 4, 5, 6, 7] as const
// v3: la colocación cambió de algoritmo (dos ventanas — temario nuevo y
// repaso —, reintento sobre todos los días elegibles y estado explícito para
// lo que no cabe). Sin subir la versión, las filas con el hash anterior salían
// por `already_current` y nunca llegaban a pasar por las reglas nuevas.
const PERSONALIZATION_VERSION = 'calendar_personalization_v6'

type PersonalizationPrefs = {
  weeklyStudyDaysValue: number
  dailyMinutes: number
}

type CalendarRow = {
  id: string
  source: string
  start_time: string | null
  end_time: string | null
  scheduled_date: string
  subject: string
  v2_sort_order: number | null
  status: string
  locked: boolean | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
  mission_type: string | null
  queue_id: string | null
}

/** mission_type efectivo de la fila (columna, o metadata como respaldo). */
function missionTypeOf(row: CalendarRow): string {
  const meta = metadataObject(row.metadata)
  return row.mission_type ?? (typeof meta.mission_type === 'string' ? meta.mission_type : 'concept')
}

type PersonalizationResult = {
  applied: boolean
  reason: 'missing_preferences' | 'no_rows' | 'already_current' | 'applied' | 'error'
  updatedRows: number
  preferenceHash?: string
  /**
   * Misiones que NO caben en el plan del alumno y han quedado marcadas
   * 'unscheduled'. No es un fallo: es el dato honesto de cuánto trabajo se
   * queda fuera. Cero significa que todo lo pendiente tiene fecha válida.
   */
  unscheduledRows?: number
}

function stableHash(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

function cleanDailyMinutes(value: unknown): number | null {
  return VALID_DAILY_MINUTES.includes(value as typeof VALID_DAILY_MINUTES[number])
    ? value as number
    : null
}

function cleanWeeklyDays(value: unknown): number | null {
  return VALID_WEEKLY_DAYS.includes(value as typeof VALID_WEEKLY_DAYS[number])
    ? value as number
    : null
}

function metadataObject(value: Record<string, unknown> | null | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

async function loadPreferences(
  userId: string,
  supabase: SupabaseClient,
  declared?: DeclaredAvailability,
): Promise<PersonalizationPrefs | null> {
  const { data, error } = await supabase
    .from('billing_events')
    .select('payload')
    .eq('user_id', userId)
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Onboarding preferences error: ${error.message}`)
  const payload = data?.payload as Record<string, unknown> | null | undefined
  // Lo declarado en esta petición manda: durante el onboarding el evento
  // `onboarding_completed` todavía no existe (se escribe al final), así que
  // sin esto el PRIMER calendario nunca llegaba a personalizarse.
  const requestedWeeklyDays = cleanWeeklyDays(declared?.weeklyStudyDays ?? payload?.weekly_study_days_value)
  const dailyMinutes = cleanDailyMinutes(declared?.dailyMinutes ?? payload?.daily_minutes)
  if (!requestedWeeklyDays || !dailyMinutes) return null

  const weeklyStudyDaysValue = requestedWeeklyDays
  return { weeklyStudyDaysValue, dailyMinutes }
}

/**
 * Fechas candidatas: los días de estudio REALES del alumno, del contexto
 * compartido.
 *
 * Antes se calculaban aquí con `isPreferredStudyDay(prefs.weeklyStudyDaysValue)`
 * — una segunda fuente de disponibilidad, y por tanto una segunda respuesta.
 * Es lo que anulaba la apertura excepcional de días de una entrada muy tardía:
 * el generador sembraba repaso en sábado y domingo y esto los declaraba sin
 * sitio, dejando el Camino vacío.
 *
 * La lista NO se recorta al mínimo necesario: si un día no tiene hueco horario
 * real, hace falta tener a dónde ir. `MAX_CANDIDATE_DAYS` la acota por
 * seguridad ante horizontes enormes.
 */
const MAX_CANDIDATE_DAYS = 730

function candidateDates(context: StudentPlanContext, appliedFrom: string): string[] {
  return planningDates(context, {
    from: appliedFrom,
    limit: MAX_CANDIDATE_DAYS,
    includeFinalReviewWindow: true,
  })
}

export async function applyCalendarPersonalization(
  userId: string,
  supabase: SupabaseClient,
  options: { planContext?: StudentPlanContext; declared?: DeclaredAvailability; force?: boolean } = {},
): Promise<PersonalizationResult> {
  try {
    const { planContext, declared } = options
    await reconcilePlanWork(supabase, userId)
    const prefs = await loadPreferences(userId, supabase, declared)
    if (!prefs) return { applied: false, reason: 'missing_preferences', updatedRows: 0 }

    const today = getMadridToday()
    // La misma fotografía de disponibilidad que usa el motor. Se recibe si
    // quien llama ya la tiene; si no, se carga aquí — pero nunca se prescinde
    // de ella: reubicar sin conocer la fecha objetivo es lo que producía
    // fechas posteriores al examen.
    const context = planContext ?? await loadStudentPlanContext(userId, supabase, today, declared)
    // PERSONALIZATION_VERSION is folded into the hash (not just stored
    // alongside it) so bumping it invalidates every previously-computed
    // hash and forces re-application on the next run — needed the one time
    // the formula itself changes (e.g. the missions-per-day/duration
    // scaling fix), otherwise a student whose weeklyStudyDaysValue/
    // dailyMinutes never changed would stay stuck on whatever the old
    // formula produced forever.
    // La fecha objetivo entra en el hash: cambiar la convocatoria en Ajustes
    // cambia hasta dónde puede llegar el calendario, así que tiene que
    // invalidar la personalización ya aplicada. Antes el hash solo miraba
    // versión, días y minutos — mover el examen no re-disparaba nada y las
    // filas se quedaban donde las había dejado la fecha anterior.
    // Los días entran por su valor EFECTIVO (context.weeklyStudyDays), no por
    // el pedido (prefs.weeklyStudyDaysValue). No es un matiz: cuando el acceso
    // caduca o se degrada, lo que el alumno tiene guardado no cambia — cambia
    // lo que su plan puede usar. Con el valor pedido en la identidad, perder
    // Superpremium dejaba el hash idéntico, la personalización respondía
    // `already_current` y las misiones se quedaban en martes y viernes: días
    // que ese alumno ya no tiene. El corte de planificación entra por lo
    // mismo, porque acota hasta dónde puede colocarse temario nuevo.
    const preferenceHash = stableHash(
      `${PERSONALIZATION_VERSION}:${context.weeklyStudyDays}:${prefs.dailyMinutes}:${context.examDate}:${context.planningCutoff}:${context.today}:${context.emergencyAvailability}`,
    )
    // Orden de LECTURA, no solo de exhibición: `orderRowsForPlacement` (más
    // abajo) sirve las filas "resto" —ni parcial ni por tipo— en el mismo
    // orden en que llegan aquí (usa `.filter()`, que no reordena). Antes se
    // leían por `scheduled_date` — precisamente el campo que ESTE MISMO paso
    // reescribe. Con dos temas de un tema/asignatura empatados a fecha de
    // partida, el desempate caía en `id` (un UUID sin relación con el
    // temario) y podía colocar el tema con v2_sort_order MAYOR en una fecha
    // ANTERIOR al de v2_sort_order menor — el orden curricular invertido,
    // reproducido en un test dedicado sin hacer falta repetir la llamada.
    // `v2_sort_order` es la posición curricular: no cambia nunca, así que
    // el orden de servicio es estable pase lo que pase con las fechas.
    const rows = (await readAllRows<CalendarRow>((from, to) => supabase
      .from('camino_calendar')
      .select('id, source, start_time, end_time, scheduled_date, subject, v2_sort_order, status, locked, metadata, created_at, updated_at, mission_type, queue_id')
      .eq('user_id', userId)
      .or(`scheduled_date.gte.${today},status.eq.unscheduled`)
      .in('status', ['pending', 'postponed', 'unscheduled'])
      .in('source', ['algorithm', 'partial'])
      .order('subject', { ascending: true })
      .order('v2_sort_order', { ascending: true, nullsFirst: false })
      .order('id', { ascending: true })
      .range(from, to))).filter(canRepositionAutomatically)
    if (rows.length === 0) return { applied: false, reason: 'no_rows', updatedRows: 0, preferenceHash }

    const alreadyCurrent = rows.every(row => {
      const meta = metadataObject(row.metadata)
      const personalization = metadataObject(meta.camino_personalization as Record<string, unknown> | null)
      return personalization.preference_hash === preferenceHash
    })

    if (alreadyCurrent && !options.force && !rows.some(row => row.status === 'unscheduled')) {
      const { conflicts, requiresDurationRefresh } = await loadCalendarDiagnostics(userId, supabase, context)
      if (requiresDurationRefresh.length === 0 && !conflicts.some(row => row.scheduled && row.automatic))
        return { applied: false, reason: 'already_current', updatedRows: 0, preferenceHash }
    }

    const capacity = Infinity
    const appliedFrom = today
    const applicationHash = stableHash(`${preferenceHash}:${appliedFrom}`)

    const window: PlacementWindow = {
      dates: candidateDates(context, appliedFrom),
      capacityPerDay: capacity,
      planningCutoff: context.planningCutoff,
      examDate: context.examDate,
    }

    // Las REGLAS (qué fechas admite cada misión, en qué orden se sirven, por
    // qué una queda sin sitio) viven en planPlacement.ts, puras y con tests
    // sobre datos. Aquí se ejecutan contra el scheduler real: un día sin hueco
    // horario hace pasar al SIGUIENTE día elegible, nunca abandonar la misión.
    // Declarar "no cabe" tras probar una sola fecha era exactamente el fallo.
    const changes: Record<string, unknown>[] = []
    const placedIds = new Set<string>()

    const placementRows: Array<PlacementRow & { row: CalendarRow }> = rows.map(row => ({
      id: row.id,
      scheduledDate: row.scheduled_date,
      missionType: missionTypeOf(row),
      queueId: row.queue_id,
      source: row.source,
      deadlineDate: typeof metadataObject(row.metadata).partial_exam_date === 'string'
        ? String(metadataObject(row.metadata).partial_exam_date) : null,
      // Suelo de fecha de la propia fila (ver planPlacement.notBeforeDate). Lo
      // escribe quien la genera: hoy, el repaso espaciado, que sin esto se
      // recolocaba delante de la lección que repasa.
      notBeforeDate: typeof metadataObject(row.metadata).place_not_before === 'string'
        ? String(metadataObject(row.metadata).place_not_before) : null,
      row,
    }))

    // ── Estabilidad: no recolocar lo que ya está bien colocado ──────────────
    //
    // Antes este pase recolocaba TODA `rows` en cada ejecución, aunque nada
    // hubiera cambiado — así que abrir Camino dos veces seguidas sin tocar
    // ninguna entrada reordenaba el calendario igualmente: bastaba con que
    // ensureCaminoCalendar hubiera añadido una sola fila nueva desde la
    // última vez (backlog restante, repaso espaciado que ahora tocaba) para
    // que TODO el resto — ya personalizado, ya con hora — se recalculara
    // desde cero y aterrizara en fechas distintas por el simple azar de en
    // qué orden entraban las filas nuevas.
    //
    // Una fila es ESTABLE (no pasa por reposition) si:
    //   1. Su `preference_hash` coincide con el actual — nada de lo que
    //      determina la personalización (días, minutos, examen, corte,
    //      disponibilidad de emergencia) ha cambiado desde que se colocó.
    //   2. Su fecha actual sigue dentro de `eligibleDatesForRow` — no cruzó
    //      una convocatoria parcial ni quedó antes de su `notBeforeDate`.
    //   3. Tiene hora asignada (start_time/end_time) — sin hora no hay un
    //      "sitio real" que validar.
    //   4. El día en que vive sigue cumpliendo TODAS las reglas vigentes
    //      contando solo lo real: otras filas estables de ese día, eventos
    //      propios del alumno (camino_custom_events) y lo externo (Google
    //      Calendar) no dejan que se pase del presupuesto diario declarado
    //      ni que dos horarios se pisen.
    //
    // El punto 4 se resuelve POR FECHA: si cualquier fila estable de un día
    // incumple capacidad u horario, se degradan TODAS las de ese día a
    // reposition — nunca se elige cuál "tenía prioridad", porque esa
    // elección volvería a depender del orden de lectura.
    const tentativelyStable: Array<PlacementRow & {
      row: CalendarRow; startMinutes: number; endMinutes: number; durationMinutes: number
    }> = []
    const needsPlacementRows: Array<PlacementRow & { row: CalendarRow }> = []
    for (const candidate of placementRows) {
      const row = candidate.row
      const meta = metadataObject(row.metadata)
      const personalization = metadataObject(meta.camino_personalization as Record<string, unknown> | null)
      const hashMatches = personalization.preference_hash === preferenceHash
      const hasTimeSlot = typeof row.start_time === 'string' && typeof row.end_time === 'string'
      const dateStillEligible = row.status !== 'unscheduled'
        && eligibleDatesForRow(candidate, window).includes(row.scheduled_date)
      // Una fila con duración heredada de un modelo anterior no es estable
      // aunque su fecha y su hash sigan siendo válidos: dejarla tal cual
      // congelaría para siempre una duración que ya no es la que calcula
      // el modelo actual (ver placementDurationMetadata).
      const durationCurrent = meta.duration_model === CONTENT_DURATION_MODEL
      if (hashMatches && hasTimeSlot && dateStillEligible && durationCurrent) {
        tentativelyStable.push({
          ...candidate,
          startMinutes: toMinutes(normalizeTime(row.start_time as string)),
          endMinutes: toMinutes(normalizeTime(row.end_time as string)),
          durationMinutes: minutesForPlacement(candidate.missionType, meta, prefs.dailyMinutes),
        })
      } else {
        needsPlacementRows.push(candidate)
      }
    }

    const stableDates = [...new Set(tentativelyStable.map(c => c.row.scheduled_date))].sort()
    const externalBusyByDate = new Map<string, LocalBusyRange[]>()
    if (stableDates.length) {
      const busy = await getAvailability(userId, stableDates[0], stableDates[stableDates.length - 1])
      for (const day of stableDates) externalBusyByDate.set(day, busySlotsForMadridDate(busy, day))
    }
    type BusyEvent = { event_date: string; recurrence: string; recurrence_until: string | null
      day_of_week: number | null; start_time: string; end_time: string }
    const customEvents = stableDates.length ? await readAllRows<BusyEvent>((from, to) => supabase
      .from('camino_custom_events')
      .select('event_date, recurrence, recurrence_until, day_of_week, start_time, end_time')
      .eq('user_id', userId)
      .not('start_time', 'is', null).not('end_time', 'is', null)
      .order('event_date', { ascending: true })
      .range(from, to)) : []
    const customEventsBusyFor = (date: string) => customEvents
      .filter(event => event.recurrence === 'none' ? event.event_date === date
        : event.recurrence === 'weekly' && event.day_of_week === mondayBasedDayIndex(date)
          && event.event_date <= date && (!event.recurrence_until || event.recurrence_until >= date))
      .map(event => ({ start: toMinutes(normalizeTime(event.start_time)), end: toMinutes(normalizeTime(event.end_time)) }))
    // Filas de camino_calendar que NO están en `rows` (completadas, bloqueadas
    // manualmente, editadas a mano) pero pueden compartir fecha con una
    // candidata estable — su hora ya es un compromiso real, no negociable en
    // este pase, exactamente igual que ve `createDaySchedulers` para todo lo
    // que no excluye.
    const rowIdSet = new Set(rows.map(r => r.id))
    type OtherBusyRow = { id: string; scheduled_date: string; start_time: string | null; end_time: string | null }
    const otherCalendarRows = stableDates.length ? (await readAllRows<OtherBusyRow>((from, to) => supabase
      .from('camino_calendar')
      .select('id, scheduled_date, start_time, end_time')
      .eq('user_id', userId)
      .in('scheduled_date', stableDates)
      .in('status', ['pending', 'postponed', 'completed'])
      .not('start_time', 'is', null).not('end_time', 'is', null)
      .range(from, to))).filter(r => !rowIdSet.has(r.id)) : []
    const otherByDate = new Map<string, OtherBusyRow[]>()
    for (const r of otherCalendarRows) {
      const list = otherByDate.get(r.scheduled_date) ?? []
      list.push(r); otherByDate.set(r.scheduled_date, list)
    }
    const overlaps = (aStart: number, aEnd: number, bStart: number, bEnd: number) => aStart < bEnd && bStart < aEnd

    const stableByDate = new Map<string, typeof tentativelyStable>()
    for (const c of tentativelyStable) {
      const list = stableByDate.get(c.row.scheduled_date) ?? []
      list.push(c); stableByDate.set(c.row.scheduled_date, list)
    }
    const invalidDates = new Set<string>()
    for (const [date, candidates] of stableByDate) {
      const fixedBusy: { start: number; end: number }[] = [
        ...(externalBusyByDate.get(date) ?? []).map(b => ({ start: toMinutes(normalizeTime(b.start)), end: toMinutes(normalizeTime(b.end)) })),
        ...customEventsBusyFor(date),
        ...(otherByDate.get(date) ?? []).map(r => ({ start: toMinutes(normalizeTime(r.start_time as string)), end: toMinutes(normalizeTime(r.end_time as string)) })),
      ]
      let totalMinutes = 0
      let dateInvalid = false
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[i]
        totalMinutes += c.durationMinutes
        if (fixedBusy.some(busy => overlaps(c.startMinutes, c.endMinutes, busy.start, busy.end))) { dateInvalid = true; break }
        for (let j = i + 1; j < candidates.length; j++) {
          if (overlaps(c.startMinutes, c.endMinutes, candidates[j].startMinutes, candidates[j].endMinutes)) { dateInvalid = true; break }
        }
        if (dateInvalid) break
      }
      if (totalMinutes > prefs.dailyMinutes) dateInvalid = true
      if (dateInvalid) invalidDates.add(date)
    }
    for (const c of tentativelyStable) {
      if (invalidDates.has(c.row.scheduled_date)) needsPlacementRows.push(c)
    }
    const stableRows = tentativelyStable.filter(c => !invalidDates.has(c.row.scheduled_date))

    // Solo lo que SÍ va a pasar por reposition debe dejar de contar como
    // "hueco ocupado" al buscar sitio: las filas estables siguen siendo una
    // ocupación real del día, exactamente igual que un evento propio o una
    // misión ya completada.
    const excludeCalendarRowIds = new Set(needsPlacementRows.map(candidate => candidate.id))

    // UNA fotografía del rango entero, no una por día. Este pase no escribe
    // hasta el `camino_apply_placements` final, así que el snapshot vale para
    // todas las fechas — es lo mismo que hacía el caché por día de antes, pero
    // con 3 lecturas en vez de 5 por fecha y una llamada a Google en vez de
    // una por fecha. Con el curso abierto eso eran ~500 idas y vueltas
    // secuenciales, que es de donde salía el minuto largo de «Preparando las
    // misiones de esta semana».
    let schedulers: Map<string, DayScheduler> | null = null
    const schedulerFor = async (date: string) => {
      if (!schedulers) {
        const dates = window.dates
        if (!dates.length) return null
        const placementExternalBusyByDate = new Map<string, LocalBusyRange[]>()
        const busy = await getAvailability(userId, dates[0], dates[dates.length - 1])
        for (const day of dates) placementExternalBusyByDate.set(day, busySlotsForMadridDate(busy, day))
        schedulers = await createDaySchedulers(userId, supabase, [...dates], {
          dailyMinutes: prefs.dailyMinutes, externalBusyByDate: placementExternalBusyByDate, excludeCalendarRowIds,
        })
      }
      return schedulers.get(date) ?? null
    }

    // RITMO. Sin esto la recolocación deshace lo que siembra
    // ensureCaminoCalendar: el personalizador sirve cada misión en el primer
    // día elegible con presupuesto libre, así que volvía a apelmazar el curso
    // entero contra septiembre y octubre por mucho que la siembra lo hubiera
    // repartido. El tope es el MISMO cálculo (camino/contentPace.ts) para que
    // las dos pasadas no discrepen.
    //
    // El temario pendiente son DOS cosas: lo que ya tiene fila de calendario y
    // lo que sigue en la cola sin materializar. Contar solo lo primero hacía
    // que el personalizador calculara un ritmo mucho más lento que la siembra
    // —el calendario lleva 30 días y la cola, el curso entero— y acabara
    // dejando un solo tema al día donde el motor había puesto tres.
    const queuedRows = await readAllRows<{ metadata: Record<string, unknown> | null }>((from, to) => supabase
      .from('user_learning_queue')
      .select('id, metadata')
      .eq('user_id', userId)
      .eq('queue_status', 'pending')
      .order('id', { ascending: true })
      .range(from, to))
    const newContentMinutes = placementRows
      .filter(candidate => isNewContent(candidate.missionType))
      .reduce((sum, candidate) => sum + minutesForPlacement(candidate.missionType, metadataObject(candidate.row.metadata), prefs.dailyMinutes), 0)
      + queuedRows.reduce((sum, item) => {
        const meta = metadataObject(item.metadata)
        return sum + minutesForPlacement((meta.mission_type as string) ?? 'concept', meta, prefs.dailyMinutes)
      }, 0)
    const newContentBudget = dailyNewContentBudget({
      pendingContentMinutes: newContentMinutes,
      paceStudyDays: contentPaceDates(planningDates(context)).length,
      dailyMinutes: prefs.dailyMinutes,
    })
    // Se siembra con lo que las filas ESTABLES ya ocupan de temario nuevo en
    // su fecha: sin esto, el ritmo del día vería la fecha "vacía" y dejaría
    // colocar más de la cuenta encima de lo que ya había.
    const contentMinutesByDate = new Map<string, number>()
    for (const c of stableRows) {
      if (isNewContent(c.missionType)) {
        contentMinutesByDate.set(c.row.scheduled_date, (contentMinutesByDate.get(c.row.scheduled_date) ?? 0) + c.durationMinutes)
      }
    }

    // Plazas de la restricción UNIQUE(user_id, scheduled_date, subject,
    // v2_sort_order). Se siembra con TODO el calendario del alumno, no sólo
    // con lo que este pase mueve: una misión completada o fallada ocupa su
    // plaza igual, porque la restricción no mira el estado. Ver placementSlots.
    const slots = new MissionSlots(await readAllRows<SlotRow>((from, to) => supabase
      .from('camino_calendar')
      .select('scheduled_date, subject, v2_sort_order')
      .eq('user_id', userId)
      .not('v2_sort_order', 'is', null)
      .order('id', { ascending: true })
      .range(from, to)))

    // El ORDEN y las FECHAS ELEGIBLES de cada fila —parciales incluidos— los
    // decide planPlacement.ts, puro y con tests. Aquí solo se ejecuta contra
    // el scheduler real.
    for (const candidate of orderRowsForPlacement(needsPlacementRows)) {
      const row = candidate.row
      const meta = metadataObject(row.metadata)
      for (const date of preferredDatesFor(candidate, window)) {
        // Un día cuya plaza ya está tomada no es una fecha elegible para esta
        // misión: colocarla ahí abortaría la transacción entera del pase.
        if (!slots.available(date, row)) continue
        const scheduler = await schedulerFor(date)
        if (!scheduler) continue
        const duration = minutesForPlacement(candidate.missionType, meta, prefs.dailyMinutes)
        const contentToday = contentMinutesByDate.get(date) ?? 0
        // `continue`, no `break`: una fecha que ya tiene su temario del día no
        // descarta la misión, la empuja al siguiente día elegible — que es
        // exactamente el reparto que se busca. Y el ritmo nunca deja un día de
        // temario a cero: decide cuándo dejar de añadir MÁS, no si el día
        // recibe su primera misión.
        if (isNewContent(candidate.missionType) && !admitsMoreNewContent({
          scheduledMinutes: contentToday, missionMinutes: duration, dailyBudget: newContentBudget,
        })) continue
        const timeSlot = scheduler.placeBest(duration, {
          date,
          subject: row.subject,
          missionType: candidate.missionType,
          deadlineDate: candidate.deadlineDate,
          priority: typeof meta.priority === 'string' ? meta.priority : null,
        })
        // La agenda propia del alumno (clase, extraescolares) llena este día:
        // se prueba el siguiente, sin consumir su capacidad.
        if (!timeSlot) continue
        const resolvedMeta = { ...meta }
        delete resolvedMeta.unscheduled_reason
        delete resolvedMeta.unscheduled_at
        changes.push({
          id: row.id, expected_status: row.status, expected_updated_at: row.updated_at,
          status: row.status === 'unscheduled' ? 'pending' : row.status,
          scheduled_date: date, start_time: timeSlot.start, end_time: timeSlot.end,
          metadata: { ...resolvedMeta, ...placementDurationMetadata(candidate.missionType, meta, prefs.dailyMinutes),
            camino_personalization: {
              version: PERSONALIZATION_VERSION, preference_hash: preferenceHash,
              application_hash: applicationHash, applied_from: appliedFrom,
              weekly_study_days_value: prefs.weeklyStudyDaysValue, daily_minutes: prefs.dailyMinutes,
              target_exam_date: context.examDate, emergency_availability: context.emergencyAvailability,
            },
          },
        })
        if (isNewContent(candidate.missionType)) contentMinutesByDate.set(date, contentToday + duration)
        slots.move(date, row)
        placedIds.add(row.id)
        break
      }
    }

    // Lo que no ha encontrado sitio en NINGUNA de sus fechas elegibles no se
    // queda con su fecha antigua. Dejarlo ahí es lo que hacía que una misión
    // del 08/06, con la PAU el 07/06, siguiera mostrándose como trabajo
    // programado normal. Pasa a 'unscheduled' —explícito, contado y NO
    // borrado— y su fila de cola vuelve a 'pending' para replanificarse.
    const unplaced = needsPlacementRows.filter(candidate => !placedIds.has(candidate.id))
    for (const candidate of unplaced) {
      const meta = metadataObject(candidate.row.metadata)
      changes.push({
        id: candidate.id, expected_status: candidate.row.status, expected_updated_at: candidate.row.updated_at,
        status: 'unscheduled', scheduled_date: candidate.row.scheduled_date,
        start_time: null, end_time: null,
        metadata: { ...meta, unscheduled_reason: unscheduledReasonFor(candidate, window), unscheduled_at: new Date().toISOString() },
      })
    }
    // One transaction updates placements and reconciles user_learning_queue.
    const { error: writeError } = await supabase.rpc('camino_apply_placements', {
      p_user_id: userId, p_changes: changes,
    })
    if (writeError) throw new Error(`Calendar update error: ${writeError.message}`)

    return {
      applied: true,
      reason: 'applied',
      updatedRows: placedIds.size,
      unscheduledRows: unplaced.length,
      preferenceHash,
    }
  } catch (error) {
    console.warn('[camino/personalization] skipped:', error)
    return { applied: false, reason: 'error', updatedRows: 0 }
  }
}
