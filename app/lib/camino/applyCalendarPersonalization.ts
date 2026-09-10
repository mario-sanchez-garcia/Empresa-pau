import 'server-only'

import { createHash } from 'crypto'
import { type SupabaseClient } from '@supabase/supabase-js'

import { addDays, getMadridToday, isPreferredStudyDay } from './studyDays'
import { getCaminoPlanLimits } from './caminoPlanLimits'
import { VALID_DAILY_MINUTES, missionsPerDayForMinutes, estimatedMinutesForSlot } from './dailyTimeCapacity'
import { createDayScheduler } from './scheduleTimeSlot'
import { loadStudentPlanContext, type DeclaredAvailability, type StudentPlanContext } from './studentPlanContext'
import { planPlacement } from './planPlacement'

const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const PERSONALIZATION_VERSION = 'calendar_personalization_v2'

type PersonalizationPrefs = {
  weeklyStudyDaysValue: number
  dailyMinutes: number
}

type CalendarRow = {
  id: string
  scheduled_date: string
  subject: string
  v2_sort_order: number | null
  status: string
  locked: boolean | null
  metadata: Record<string, unknown> | null
  created_at: string
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

// El plan gratuito anuncia "solo 2 días de estudio por semana" pero nada
// comprobaba esto server-side: un alumno free podía elegir "7 días" en el
// onboarding (una opción válida del formulario) y el generador se lo
// respetaba igual que a un alumno de pago. Aquí es donde se aplica el tope
// real de cada plan, el mismo maxStudyDaysPerWeek que ya usa el cliente en
// CaminoCalendarClient.tsx — para que el límite exista de verdad, no solo
// en la vista previa local.
async function loadPlanMaxWeeklyDays(userId: string, supabase: SupabaseClient): Promise<number> {
  const now = new Date().toISOString()
  const { data } = await supabase
    .from('user_entitlements')
    .select('plan_id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .limit(1)
  const planId = data?.[0]?.plan_id ?? null
  return getCaminoPlanLimits(planId).maxStudyDaysPerWeek
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

  const maxWeeklyDays = await loadPlanMaxWeeklyDays(userId, supabase)
  const weeklyStudyDaysValue = Math.min(requestedWeeklyDays, maxWeeklyDays)
  return { weeklyStudyDaysValue, dailyMinutes }
}

/**
 * Fechas preferidas disponibles, SIN cruzar la fecha objetivo del alumno.
 *
 * `examDate` no es opcional por comodidad: sin él, esta función reubicaba
 * filas hasta donde hiciera falta para colocarlas todas. Reproducido: 30
 * filas, dos sesiones al día y dos días semanales desde el 17/05 aterrizaban
 * hasta el 08/07 — un mes después de la PAU del 07/06. Las filas que no caben
 * antes del examen no se reubican (se quedan donde estaban); moverlas a una
 * fecha imposible no es planificar, es esconder el problema.
 */
function nextPreferredDates(
  startDate: string,
  weeklyStudyDaysValue: number,
  neededRows: number,
  capacity: number,
  examDate: string,
) {
  const dates: string[] = []
  let current = startDate
  const maxIterations = Math.max(neededRows * 14, 120)
  for (let i = 0; dates.length * capacity < neededRows && i < maxIterations; i += 1) {
    if (current >= examDate) break
    if (isPreferredStudyDay(current, weeklyStudyDaysValue)) dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

export async function applyCalendarPersonalization(
  userId: string,
  supabase: SupabaseClient,
  options: { planContext?: StudentPlanContext; declared?: DeclaredAvailability } = {},
): Promise<PersonalizationResult> {
  try {
    const { planContext, declared } = options
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
      `${PERSONALIZATION_VERSION}:${prefs.weeklyStudyDaysValue}:${prefs.dailyMinutes}:${context.examDate}`,
    )
    const { data, error } = await supabase
      .from('camino_calendar')
      .select('id, scheduled_date, subject, v2_sort_order, status, locked, metadata, created_at, mission_type, queue_id')
      .eq('user_id', userId)
      .gte('scheduled_date', today)
      .in('status', ['pending', 'postponed'])
      .eq('source', 'algorithm')
      .order('scheduled_date', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(80)

    if (error) throw new Error(`Calendar read error: ${error.message}`)
    const rows = ((data ?? []) as CalendarRow[]).filter(row => !row.locked)
    if (rows.length === 0) return { applied: false, reason: 'no_rows', updatedRows: 0, preferenceHash }

    const alreadyCurrent = rows.every(row => {
      const meta = metadataObject(row.metadata)
      const personalization = metadataObject(meta.camino_personalization as Record<string, unknown> | null)
      return personalization.preference_hash === preferenceHash
    })
    if (alreadyCurrent) {
      return { applied: false, reason: 'already_current', updatedRows: 0, preferenceHash }
    }

    const capacity = missionsPerDayForMinutes(prefs.dailyMinutes)
    const appliedFrom = rows[0]?.scheduled_date ?? today
    const applicationHash = stableHash(`${preferenceHash}:${appliedFrom}`)

    // QUÉ va a QUÉ fecha lo decide una función pura (ver planPlacement.ts),
    // donde está fijado por tests que el temario nuevo no entra en la reserva
    // de repaso final y que lo que no cabe se marca en vez de quedarse con una
    // fecha imposible. Aquí solo se ejecuta la decisión.
    const candidateDates = nextPreferredDates(appliedFrom, prefs.weeklyStudyDaysValue, rows.length, capacity, context.examDate)
    const decision = planPlacement(
      rows.map(row => ({
        id: row.id,
        scheduledDate: row.scheduled_date,
        missionType: missionTypeOf(row),
        queueId: row.queue_id,
      })),
      {
        dates: candidateDates,
        capacityPerDay: capacity,
        planningCutoff: context.planningCutoff,
        examDate: context.examDate,
      },
    )

    // Todas las filas de `rows` se están reubicando en este mismo pase, así
    // que su hora actual (si la tenían de una pasada anterior) nunca debe
    // contar como "hueco ocupado" al buscar sitio en su nueva fecha —
    // solo importa lo que el alumno tiene fuera de Camino (camino_custom_events)
    // y lo que otras misiones YA reubicadas en este pase hayan ocupado.
    const excludeCalendarRowIds = new Set(rows.map(row => row.id))
    const rowsById = new Map(rows.map(row => [row.id, row]))

    const schedulers = new Map<string, Awaited<ReturnType<typeof createDayScheduler>>>()
    const schedulerFor = async (date: string) => {
      const existing = schedulers.get(date)
      if (existing) return existing
      const created = await createDayScheduler(userId, supabase, date, { excludeCalendarRowIds })
      schedulers.set(date, created)
      return created
    }

    const updates: Array<PromiseLike<{ error: { message: string } | null }>> = []
    const placedIds = new Set<string>()
    const unplaceableByTime: Array<{ id: string; queueId?: string | null }> = []

    for (const placement of decision.placements) {
      const row = rowsById.get(placement.id)
      if (!row) continue
      const meta = metadataObject(row.metadata)
      const scheduler = await schedulerFor(placement.date)
      const timeSlot = scheduler.placeBest(estimatedMinutesForSlot(prefs.dailyMinutes, placement.slot), {
        date: placement.date,
        subject: row.subject,
        missionType: missionTypeOf(row),
        deadlineDate: typeof meta.partial_exam_date === 'string' ? meta.partial_exam_date : null,
        priority: typeof meta.priority === 'string' ? meta.priority : null,
      })
      // Sin hueco libre ese día (la agenda propia del alumno ya lo llena), la
      // misión no se fuerza sin hora: cuenta como no colocada.
      if (!timeSlot) {
        unplaceableByTime.push({ id: row.id, queueId: row.queue_id })
        continue
      }
      updates.push(
        supabase
          .from('camino_calendar')
          .update({
            // El `status` NO se toca: una fila 'postponed' la apartó el alumno
            // y sigue apartada aunque se reubique.
            scheduled_date: placement.date,
            updated_at: new Date().toISOString(),
            start_time: timeSlot.start,
            end_time: timeSlot.end,
            metadata: {
              ...meta,
              estimated_minutes: estimatedMinutesForSlot(prefs.dailyMinutes, placement.slot),
              camino_personalization: {
                version: PERSONALIZATION_VERSION,
                preference_hash: preferenceHash,
                application_hash: applicationHash,
                applied_from: appliedFrom,
                weekly_study_days_value: prefs.weeklyStudyDaysValue,
                daily_minutes: prefs.dailyMinutes,
                target_exam_date: context.examDate,
              },
            },
          })
          .eq('id', row.id)
          .eq('user_id', userId),
      )
      placedIds.add(row.id)
    }

    // Lo que no ha encontrado sitio NO se queda con su fecha antigua. Dejarlo
    // ahí es lo que hacía que una misión del 08/06, con la PAU el 07/06,
    // siguiera mostrándose como trabajo programado normal. Pasa a
    // 'unscheduled' —explícito, contado y NO borrado— y su fila de cola vuelve
    // a 'pending' para que la siguiente planificación la recoloque.
    const unplaced = [
      ...decision.unscheduled,
      ...unplaceableByTime.map(row => ({ ...row, reason: 'no_capacity' as const })),
    ]
    for (const item of unplaced) {
      const row = rowsById.get(item.id)
      if (!row) continue
      const meta = metadataObject(row.metadata)
      updates.push(
        supabase
          .from('camino_calendar')
          .update({
            status: 'unscheduled',
            updated_at: new Date().toISOString(),
            metadata: {
              ...meta,
              unscheduled_reason: item.reason,
              unscheduled_at: new Date().toISOString(),
            },
          })
          .eq('id', row.id)
          .eq('user_id', userId)
          .eq('status', row.status),
      )
    }
    const queueIdsToReopen = unplaced.map(item => item.queueId).filter((id): id is string => Boolean(id))
    if (queueIdsToReopen.length > 0) {
      updates.push(
        supabase
          .from('user_learning_queue')
          .update({ queue_status: 'pending', scheduled_at: null })
          .in('id', queueIdsToReopen)
          .eq('user_id', userId)
          .eq('queue_status', 'scheduled'),
      )
    }

    const results = await Promise.all(updates)
    const failed = results.find(result => result.error)
    if (failed?.error) throw new Error(`Calendar update error: ${failed.error.message}`)

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
