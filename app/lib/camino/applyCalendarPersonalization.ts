import 'server-only'

import { createHash } from 'crypto'
import { type SupabaseClient } from '@supabase/supabase-js'

import { addDays, getMadridToday, isPreferredStudyDay } from './studyDays'

const VALID_DAILY_MINUTES = [30, 45, 60, 90, 150, 180] as const
const VALID_WEEKLY_DAYS = [3, 4, 5, 6, 7] as const
const PERSONALIZATION_VERSION = 'calendar_personalization_v1'

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

function missionsPerDay(dailyMinutes: number) {
  return dailyMinutes >= 60 ? 2 : 1
}

function estimatedMinutesForSlot(dailyMinutes: number, slot: number) {
  if (slot === 0) return Math.min(Math.max(25, Math.round(dailyMinutes / 2)), 60)
  return Math.min(30, Math.max(15, Math.round(dailyMinutes / 3)))
}

function metadataObject(value: Record<string, unknown> | null | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
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
  const weeklyStudyDaysValue = cleanWeeklyDays(payload?.weekly_study_days_value)
  const dailyMinutes = cleanDailyMinutes(payload?.daily_minutes)
  if (!weeklyStudyDaysValue || !dailyMinutes) return null
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
    const preferenceHash = stableHash(`${prefs.weeklyStudyDaysValue}:${prefs.dailyMinutes}`)
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

    const capacity = missionsPerDay(prefs.dailyMinutes)
    const appliedFrom = rows[0]?.scheduled_date ?? today
    const applicationHash = stableHash(`${preferenceHash}:${appliedFrom}`)
    const preferredDates = nextPreferredDates(appliedFrom, prefs.weeklyStudyDaysValue, rows.length, capacity)
    if (preferredDates.length === 0) return { applied: false, reason: 'error', updatedRows: 0, preferenceHash }

    let rowIndex = 0
    const updates: Array<PromiseLike<{ error: { message: string } | null }>> = []
    for (const date of preferredDates) {
      for (let slot = 0; slot < capacity && rowIndex < rows.length; slot += 1) {
        const row = rows[rowIndex]
        const meta = metadataObject(row.metadata)
        updates.push(
          supabase
            .from('camino_calendar')
            .update({
              scheduled_date: date,
              updated_at: new Date().toISOString(),
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
      if (rowIndex >= rows.length) break
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
