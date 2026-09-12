import 'server-only'

import { createHash } from 'crypto'
import { readAllRows } from './readAllRows'
import { reconcilePlanWork } from './planPersistence'
import { getAvailabilityForDate } from '../calendar/availability'
import { estimatedMinutesForMission } from './missionDuration'
import { type SupabaseClient } from '@supabase/supabase-js'

import { getMadridToday } from './studyDays'
import { canRepositionAutomatically } from './automaticPlacement'
import { VALID_DAILY_MINUTES, missionsPerDayForMinutes, estimatedMinutesForSlot } from './dailyTimeCapacity'
import { createDayScheduler } from './scheduleTimeSlot'
import { loadStudentPlanContext, planningDates, type DeclaredAvailability, type StudentPlanContext } from './studentPlanContext'
import { orderRowsForPlacement, preferredDatesFor, unscheduledReasonFor, type PlacementRow, type PlacementWindow } from './planPlacement'

const VALID_WEEKLY_DAYS = [1, 2, 3, 4, 5, 6, 7] as const
// v3: la colocación cambió de algoritmo (dos ventanas — temario nuevo y
// repaso —, reintento sobre todos los días elegibles y estado explícito para
// lo que no cabe). Sin subir la versión, las filas con el hash anterior salían
// por `already_current` y nunca llegaban a pasar por las reglas nuevas.
const PERSONALIZATION_VERSION = 'calendar_personalization_v5'

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
    const preferenceHash = stableHash(
      `${PERSONALIZATION_VERSION}:${prefs.weeklyStudyDaysValue}:${prefs.dailyMinutes}:${context.examDate}:${context.today}:${context.emergencyAvailability}`,
    )
    const rows = (await readAllRows<CalendarRow>((from, to) => supabase
      .from('camino_calendar')
      .select('id, source, start_time, end_time, scheduled_date, subject, v2_sort_order, status, locked, metadata, created_at, updated_at, mission_type, queue_id')
      .eq('user_id', userId)
      .or(`scheduled_date.gte.${today},status.eq.unscheduled`)
      .in('status', ['pending', 'postponed', 'unscheduled'])
      .in('source', ['algorithm', 'partial'])
      .order('scheduled_date', { ascending: true }).order('id', { ascending: true })
      .range(from, to))).filter(canRepositionAutomatically)
    if (rows.length === 0) return { applied: false, reason: 'no_rows', updatedRows: 0, preferenceHash }

    const alreadyCurrent = rows.every(row => {
      const meta = metadataObject(row.metadata)
      const personalization = metadataObject(meta.camino_personalization as Record<string, unknown> | null)
      return personalization.preference_hash === preferenceHash
    })
    if (alreadyCurrent && !options.force && !rows.some(row => row.status === 'unscheduled')) {
      return { applied: false, reason: 'already_current', updatedRows: 0, preferenceHash }
    }

    const capacity = missionsPerDayForMinutes(prefs.dailyMinutes)
    const appliedFrom = today
    const applicationHash = stableHash(`${preferenceHash}:${appliedFrom}`)

    // Todas las filas de `rows` se están reubicando en este mismo pase, así
    // que su hora actual (si la tenían de una pasada anterior) nunca debe
    // contar como "hueco ocupado" al buscar sitio en su nueva fecha — solo
    // importa lo que el alumno tiene fuera de Camino (camino_custom_events) y
    // lo que otras misiones YA reubicadas en este pase hayan ocupado.
    const excludeCalendarRowIds = new Set(rows.map(row => row.id))
    const schedulers = new Map<string, Awaited<ReturnType<typeof createDayScheduler>>>()
    const schedulerFor = async (date: string) => {
      const existing = schedulers.get(date)
      if (existing) return existing
      const created = await createDayScheduler(userId, supabase, date, { excludeCalendarRowIds, dailyMinutes: prefs.dailyMinutes, externalBusy: await getAvailabilityForDate(userId, date) })
      schedulers.set(date, created)
      return created
    }

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
    const used = new Map<string, number>()
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
      row,
    }))

    // El ORDEN y las FECHAS ELEGIBLES de cada fila —parciales incluidos— los
    // decide planPlacement.ts, puro y con tests. Aquí solo se ejecuta contra
    // el scheduler real.
    for (const candidate of orderRowsForPlacement(placementRows)) {
      const row = candidate.row
      const meta = metadataObject(row.metadata)
      for (const date of preferredDatesFor(candidate, window)) {
        const slot = used.get(date) ?? 0
        // Los parciales cuentan igual que todo lo demás. Eximirlos del
        // contador es crear tiempo que el alumno no tiene: declaró 60 minutos
        // y acababa con la lección del día MÁS la preparación del examen.
        if (slot >= capacity) continue
        const scheduler = await schedulerFor(date)
        const duration = candidate.missionType === 'concept' || candidate.missionType === 'review'
          ? estimatedMinutesForSlot(prefs.dailyMinutes, slot)
          : estimatedMinutesForMission({ mission_type: candidate.missionType, metadata: meta })
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
        used.set(date, slot + 1)
        const { unscheduled_reason: _reason, unscheduled_at: _at, ...resolvedMeta } = meta
        changes.push({
          id: row.id, expected_status: row.status, expected_updated_at: row.updated_at,
          status: row.status === 'unscheduled' ? 'pending' : row.status,
          scheduled_date: date, start_time: timeSlot.start, end_time: timeSlot.end,
          metadata: { ...resolvedMeta, estimated_minutes: duration,
            camino_personalization: {
              version: PERSONALIZATION_VERSION, preference_hash: preferenceHash,
              application_hash: applicationHash, applied_from: appliedFrom,
              weekly_study_days_value: prefs.weeklyStudyDaysValue, daily_minutes: prefs.dailyMinutes,
              target_exam_date: context.examDate, emergency_availability: context.emergencyAvailability,
            },
          },
        })
        placedIds.add(row.id)
        break
      }
    }

    // Lo que no ha encontrado sitio en NINGUNA de sus fechas elegibles no se
    // queda con su fecha antigua. Dejarlo ahí es lo que hacía que una misión
    // del 08/06, con la PAU el 07/06, siguiera mostrándose como trabajo
    // programado normal. Pasa a 'unscheduled' —explícito, contado y NO
    // borrado— y su fila de cola vuelve a 'pending' para replanificarse.
    const unplaced = placementRows.filter(candidate => !placedIds.has(candidate.id))
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
