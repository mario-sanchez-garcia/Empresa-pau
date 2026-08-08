import 'server-only'

import { createHash } from 'crypto'
import { type SupabaseClient } from '@supabase/supabase-js'

import { addDays, getMadridToday, isPreferredStudyDay } from './studyDays'
import { getCaminoPlanLimits } from './caminoPlanLimits'
import { VALID_DAILY_MINUTES, missionsPerDayForMinutes, estimatedMinutesForSlot } from './dailyTimeCapacity'
import { createDayScheduler } from './scheduleTimeSlot'

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
}

type PersonalizationResult = {
  applied: boolean
  reason: 'missing_preferences' | 'no_rows' | 'already_current' | 'applied' | 'error'
  updatedRows: number
  preferenceHash?: string
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

async function loadPreferences(userId: string, supabase: SupabaseClient): Promise<PersonalizationPrefs | null> {
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
  const requestedWeeklyDays = cleanWeeklyDays(payload?.weekly_study_days_value)
  const dailyMinutes = cleanDailyMinutes(payload?.daily_minutes)
  if (!requestedWeeklyDays || !dailyMinutes) return null

  const maxWeeklyDays = await loadPlanMaxWeeklyDays(userId, supabase)
  const weeklyStudyDaysValue = Math.min(requestedWeeklyDays, maxWeeklyDays)
  return { weeklyStudyDaysValue, dailyMinutes }
}

function nextPreferredDates(startDate: string, weeklyStudyDaysValue: number, neededRows: number, capacity: number) {
  const dates: string[] = []
  let current = startDate
  const maxIterations = Math.max(neededRows * 14, 120)
  for (let i = 0; dates.length * capacity < neededRows && i < maxIterations; i += 1) {
    if (isPreferredStudyDay(current, weeklyStudyDaysValue)) dates.push(current)
    current = addDays(current, 1)
  }
  return dates
}

export async function applyCalendarPersonalization(
  userId: string,
  supabase: SupabaseClient,
): Promise<PersonalizationResult> {
  try {
    const prefs = await loadPreferences(userId, supabase)
    if (!prefs) return { applied: false, reason: 'missing_preferences', updatedRows: 0 }

    const today = getMadridToday()
    // PERSONALIZATION_VERSION is folded into the hash (not just stored
    // alongside it) so bumping it invalidates every previously-computed
    // hash and forces re-application on the next run — needed the one time
    // the formula itself changes (e.g. the missions-per-day/duration
    // scaling fix), otherwise a student whose weeklyStudyDaysValue/
    // dailyMinutes never changed would stay stuck on whatever the old
    // formula produced forever.
    const preferenceHash = stableHash(`${PERSONALIZATION_VERSION}:${prefs.weeklyStudyDaysValue}:${prefs.dailyMinutes}`)
    const { data, error } = await supabase
      .from('camino_calendar')
      .select('id, scheduled_date, subject, v2_sort_order, status, locked, metadata, created_at')
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
    const preferredDates = nextPreferredDates(appliedFrom, prefs.weeklyStudyDaysValue, rows.length, capacity)
    if (preferredDates.length === 0) return { applied: false, reason: 'error', updatedRows: 0, preferenceHash }

    // Todas las filas de `rows` se están reubicando en este mismo pase, así
    // que su hora actual (si la tenían de una pasada anterior) nunca debe
    // contar como "hueco ocupado" al buscar sitio en su nueva fecha —
    // solo importa lo que el alumno tiene fuera de Camino (camino_custom_events)
    // y lo que otras misiones YA reubicadas en este pase hayan ocupado.
    const excludeCalendarRowIds = new Set(rows.map(row => row.id))

    let rowIndex = 0
    const updates: Array<PromiseLike<{ error: { message: string } | null }>> = []
    for (const date of preferredDates) {
      if (rowIndex >= rows.length) break
      const scheduler = await createDayScheduler(userId, supabase, date, { excludeCalendarRowIds })
      for (let slot = 0; slot < capacity && rowIndex < rows.length; slot += 1) {
        const row = rows[rowIndex]
        const meta = metadataObject(row.metadata)
        const timeSlot = scheduler.place(estimatedMinutesForSlot(prefs.dailyMinutes, slot))
        // Sin hueco libre este día (agenda propia ya lo llena) -> no se
        // reubica esta misión aquí; se prueba en el siguiente día preferido
        // en vez de forzarla sin hora en un día completo.
        if (!timeSlot) break
        updates.push(
          supabase
            .from('camino_calendar')
            .update({
              scheduled_date: date,
              updated_at: new Date().toISOString(),
              start_time: timeSlot.start,
              end_time: timeSlot.end,
              metadata: {
                ...meta,
                estimated_minutes: estimatedMinutesForSlot(prefs.dailyMinutes, slot),
                camino_personalization: {
                  version: PERSONALIZATION_VERSION,
                  preference_hash: preferenceHash,
                  application_hash: applicationHash,
                  applied_from: appliedFrom,
                  weekly_study_days_value: prefs.weeklyStudyDaysValue,
                  daily_minutes: prefs.dailyMinutes,
                },
              },
            })
            .eq('id', row.id)
            .eq('user_id', userId),
        )
        rowIndex += 1
      }
    }

    const results = await Promise.all(updates)
    const failed = results.find(result => result.error)
    if (failed?.error) throw new Error(`Calendar update error: ${failed.error.message}`)

    return { applied: true, reason: 'applied', updatedRows: updates.length, preferenceHash }
  } catch (error) {
    console.warn('[camino/personalization] skipped:', error)
    return { applied: false, reason: 'error', updatedRows: 0 }
  }
}
