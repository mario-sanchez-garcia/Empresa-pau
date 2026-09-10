import { type SupabaseClient } from '@supabase/supabase-js'

import { estimatedMinutesForMission } from './missionDuration'
import { normalizeTime, toMinutes } from './missionDuration.ts'
import { mondayBasedDayIndex } from './studyDays'
import { loadSchedulingBehaviorProfile } from './schedulingBehaviorProfile'
import { findBestScoredSlot, getSlotScoringDebug, scoreDateSlot, type MissionSlotScoringContext, type SchedulingBehaviorProfile } from './slotScoring'

export type TimeRange = { start: string; end: string; subject?: string | null; missionType?: string | null } // "HH:MM", 24h

// Ventana de estudio por defecto donde el motor intenta colocar misiones,
// evitando lo que el alumno ya tenga ocupado (cole, extraescolares) dentro
// de ella. Fija por ahora (decisión de producto v1: sin preferencia de
// horario configurable en Ajustes todavía) — entre semana empieza a las
// 16:00 asumiendo que el instituto ha terminado; fin de semana es más
// amplia porque no hay horario de clase que la acote por la mañana.
const WEEKDAY_STUDY_WINDOW: TimeRange = { start: '16:00', end: '22:00' }
const WEEKEND_STUDY_WINDOW: TimeRange = { start: '10:00', end: '21:00' }

export function studyWindowFor(dateStr: string): TimeRange {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return dow === 0 || dow === 6 ? WEEKEND_STUDY_WINDOW : WEEKDAY_STUDY_WINDOW
}

// La duración de una misión vive en missionDuration.ts (puro, testeable sin
// Supabase). Se reexporta aquí porque este módulo es la puerta de entrada
// histórica de los llamadores del scheduler.
export {
  estimatedMinutesForMissionType,
  estimatedMinutesForMission,
  minutesBetweenTimes,
  type MissionDurationRow,
} from './missionDuration.ts'

function toHHMM(minutes: number): string {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes))
  const h = Math.floor(clamped / 60).toString().padStart(2, '0')
  const m = (clamped % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

// Busca el primer hueco >= durationMinutes dentro de `window`, evitando los
// intervalos ya ocupados en `busy`. Los intervalos de busy que caen fuera de
// window se recortan a la ventana; los que no la tocan en absoluto se
// ignoran. Función pura — sin llamadas a red — para poder testear/reusar
// tanto en la asignación de una sola misión como en el bucle de varias
// misiones del mismo día (ver DayScheduler más abajo).
export function findFreeSlot(durationMinutes: number, busy: TimeRange[], window: TimeRange): TimeRange | null {
  if (durationMinutes <= 0) return null
  const windowStart = toMinutes(window.start)
  const windowEnd = toMinutes(window.end)

  const clipped = busy
    .map(b => ({ start: toMinutes(b.start), end: toMinutes(b.end) }))
    .filter(b => b.end > windowStart && b.start < windowEnd)
    .map(b => ({ start: Math.max(b.start, windowStart), end: Math.min(b.end, windowEnd) }))
    .sort((a, b) => a.start - b.start)

  const merged: { start: number; end: number }[] = []
  for (const b of clipped) {
    const last = merged[merged.length - 1]
    if (last && b.start <= last.end) last.end = Math.max(last.end, b.end)
    else merged.push({ ...b })
  }

  let cursor = windowStart
  for (const b of merged) {
    if (b.start - cursor >= durationMinutes) {
      return { start: toHHMM(cursor), end: toHHMM(cursor + durationMinutes) }
    }
    cursor = Math.max(cursor, b.end)
  }
  if (windowEnd - cursor >= durationMinutes) {
    return { start: toHHMM(cursor), end: toHHMM(cursor + durationMinutes) }
  }
  return null
}

// Todo lo que ya ocupa hora en el día del alumno: eventos propios (sueltos
// del día exacto, o semanales recurrentes que caigan en ese día de la
// semana dentro de su rango de vigencia) y misiones de camino_calendar que
// ya tuvieran hora asignada de una pasada anterior. Solo cuentan los
// eventos/misiones que SÍ tienen start_time+end_time — uno sin hora es
// "algún momento del día", no bloquea ningún hueco.
export async function getBusyIntervalsForDate(
  userId: string,
  supabase: SupabaseClient,
  dateStr: string,
  options: { excludeCalendarRowIds?: Set<string> } = {},
): Promise<TimeRange[]> {
  const dow = mondayBasedDayIndex(dateStr)

  const [oneOffRes, weeklyRes, calendarRes] = await Promise.all([
    supabase
      .from('camino_custom_events')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .eq('recurrence', 'none')
      .eq('event_date', dateStr)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null),
    supabase
      .from('camino_custom_events')
      .select('start_time, end_time')
      .eq('user_id', userId)
      .eq('recurrence', 'weekly')
      .eq('day_of_week', dow)
      .lte('event_date', dateStr)
      .or(`recurrence_until.is.null,recurrence_until.gte.${dateStr}`)
      .not('start_time', 'is', null)
      .not('end_time', 'is', null),
    supabase
      .from('camino_calendar')
      .select('id, start_time, end_time, subject, mission_type')
      .eq('user_id', userId)
      .eq('scheduled_date', dateStr)
      .in('status', ['pending', 'postponed', 'completed'])
      .not('start_time', 'is', null)
      .not('end_time', 'is', null),
  ])

  for (const result of [oneOffRes, weeklyRes, calendarRes]) {
    if (result.error) throw new Error(`Availability read failed: ${result.error.message}`)
  }
  const busy: TimeRange[] = []
  for (const row of [...(oneOffRes.data ?? []), ...(weeklyRes.data ?? [])] as { start_time: string; end_time: string }[]) {
    busy.push({ start: normalizeTime(row.start_time), end: normalizeTime(row.end_time) })
  }
  for (const row of (calendarRes.data ?? []) as { id: string; start_time: string; end_time: string; subject: string | null; mission_type: string | null }[]) {
    if (options.excludeCalendarRowIds?.has(row.id)) continue
    busy.push({ start: normalizeTime(row.start_time), end: normalizeTime(row.end_time), subject: row.subject, missionType: row.mission_type })
  }
  return busy
}

// Coloca varias misiones seguidas en el mismo día sin que se pisen entre
// ellas: cada `place()` añade el hueco que acaba de ocupar a su propia lista
// antes de buscar el siguiente. Un día ya lleno (huecos agotados) devuelve
// null para las misiones que no quepan — el llamador debe tratarlo como
// "sin hora asignada", nunca como error.
export class DayScheduler {
  private busy: TimeRange[]
  private remainingMinutes: number
  private readonly window: TimeRange
  private readonly behaviorProfile: SchedulingBehaviorProfile | null

  constructor(initialBusy: TimeRange[], window: TimeRange, behaviorProfile: SchedulingBehaviorProfile | null = null, remainingMinutes = Infinity) {
    this.remainingMinutes = Math.max(0, remainingMinutes)
    this.busy = [...initialBusy]
    this.window = window
    this.behaviorProfile = behaviorProfile
  }

  place(durationMinutes: number): TimeRange | null {
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > this.remainingMinutes) return null
    const slot = findFreeSlot(durationMinutes, this.busy, this.window)
    if (slot) { this.busy.push(slot); this.remainingMinutes -= durationMinutes }
    return slot
  }

  placeBest(durationMinutes: number, context: MissionSlotScoringContext = {}): TimeRange | null {
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0 || durationMinutes > this.remainingMinutes) return null
    const slot = findBestScoredSlot(durationMinutes, this.busy, this.window, { behaviorProfile: this.behaviorProfile, ...context })
    if (slot) {
      this.busy.push({ start: slot.start, end: slot.end, subject: context.subject, missionType: context.missionType })
      this.remainingMinutes -= durationMinutes
    }
    return slot ? { start: slot.start, end: slot.end } : null
  }

  debugBestCandidates(durationMinutes: number, context: MissionSlotScoringContext = {}) {
    return getSlotScoringDebug(durationMinutes, this.busy, this.window, { behaviorProfile: this.behaviorProfile, ...context })
  }
}

export async function createDayScheduler(
  userId: string,
  supabase: SupabaseClient,
  dateStr: string,
  options: { excludeCalendarRowIds?: Set<string>; externalBusy?: TimeRange[] | null; behaviorProfile?: SchedulingBehaviorProfile | null; dailyMinutes?: number | null } = {},
): Promise<DayScheduler> {
  const localBusy = await getBusyIntervalsForDate(userId, supabase, dateStr, options)
  const externalBusy = options.externalBusy ?? []
  const busy = [...localBusy, ...externalBusy]
  const behaviorProfile = options.behaviorProfile === undefined
    ? await loadSchedulingBehaviorProfile(supabase, userId)
    : options.behaviorProfile
  let dailyMinutes = options.dailyMinutes
  if (dailyMinutes == null) {
    const { data: prefs, error } = await supabase.from('billing_events').select('payload')
      .eq('user_id', userId).eq('event_type', 'onboarding_completed')
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
    if (error) throw new Error(`Daily budget preferences: ${error.message}`)
    dailyMinutes = typeof prefs?.payload?.daily_minutes === 'number' ? prefs.payload.daily_minutes : 60
  }
  const { data: reserved, error } = await supabase.from('camino_calendar')
    .select('id, mission_type, metadata, start_time, end_time')
    .eq('user_id', userId).eq('scheduled_date', dateStr)
    .in('status', ['pending', 'postponed', 'completed'])
  if (error) throw new Error(`Daily budget read failed: ${error.message}`)
  const used = (reserved ?? []).filter(row => !options.excludeCalendarRowIds?.has(row.id))
    .reduce((sum, row) => sum + estimatedMinutesForMission(row), 0)
  // All mission sources consume the same budget, including rows without hours.
  return new DayScheduler(busy, studyWindowFor(dateStr), behaviorProfile, (dailyMinutes ?? 60) - used)
}

export async function placeBestAcrossDates(
  userId: string,
  supabase: SupabaseClient,
  dates: string[],
  durationMinutes: number,
  options: {
    excludeCalendarRowIds?: Set<string>
    externalBusyByDate?: Map<string, TimeRange[]>
    context?: MissionSlotScoringContext
    behaviorProfile?: SchedulingBehaviorProfile | null
  } = {},
): Promise<{ date: string; start: string; end: string; score: number; reasons: string[] } | null> {
  let best: { date: string; start: string; end: string; score: number; reasons: string[] } | null = null
  const behaviorProfile = options.behaviorProfile === undefined
    ? await loadSchedulingBehaviorProfile(supabase, userId)
    : options.behaviorProfile
  for (let index = 0; index < dates.length; index += 1) {
    const date = dates[index]
    const localBusy = await getBusyIntervalsForDate(userId, supabase, date, { excludeCalendarRowIds: options.excludeCalendarRowIds })
    const externalBusy = options.externalBusyByDate?.get(date) ?? []
    const busy = [...localBusy, ...externalBusy]
    const slot = findBestScoredSlot(durationMinutes, busy, studyWindowFor(date), { behaviorProfile, ...(options.context ?? {}), date })
    if (!slot) continue
    const scored = scoreDateSlot({ date, slot, busy, context: { behaviorProfile, ...(options.context ?? {}) }, dateIndex: index })
    const candidate = { date, start: slot.start, end: slot.end, score: scored.score, reasons: [...scored.reasons, ...scored.personalReasons] }
    if (!best || candidate.score > best.score || (candidate.score === best.score && `${candidate.date} ${candidate.start}` < `${best.date} ${best.start}`)) {
      best = candidate
    }
  }
  return best
}
