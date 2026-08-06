import type { SupabaseClient } from '@supabase/supabase-js'

import { addDays, mondayBasedDayIndex } from './studyDays'

export const CUSTOM_EVENT_CATEGORIES = ['deberes', 'extraescolar', 'estudio_personal', 'otro'] as const
export type CustomEventCategory = typeof CUSTOM_EVENT_CATEGORIES[number]

export const CUSTOM_EVENT_CATEGORY_LABELS: Record<CustomEventCategory, string> = {
  deberes: 'Deberes',
  extraescolar: 'Extraescolar',
  estudio_personal: 'Estudio personal',
  otro: 'Otro',
}

export const CUSTOM_EVENT_RECURRENCES = ['none', 'weekly'] as const
export type CustomEventRecurrence = typeof CUSTOM_EVENT_RECURRENCES[number]

// 0=lunes..6=domingo — mismo criterio que mondayBasedDayIndex().
export const WEEKDAY_LABELS_FULL = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export type CustomEvent = {
  /** El id de la fila real en camino_custom_events (compartido por todas las ocurrencias de un evento semanal). */
  id: string
  /** Único por instancia renderizada: igual a `id` para eventos sueltos, `id:date` para cada ocurrencia semanal — usar como key de lista. */
  occurrenceKey: string
  /** Fecha de ESTA ocurrencia concreta (proyectada, si el evento es semanal). */
  date: string
  title: string
  description: string | null
  category: CustomEventCategory
  startTime: string | null
  endTime: string | null
  recurrence: CustomEventRecurrence
  /** Solo si recurrence='weekly'. 0=lunes..6=domingo. */
  dayOfWeek: number | null
  /** Fecha de inicio de la serie (para eventos sueltos, igual a `date`). */
  anchorDate: string
  recurrenceUntil: string | null
}

type CustomEventRow = {
  id: string
  event_date: string
  title: string
  description: string | null
  category: string
  start_time: string | null
  end_time: string | null
  recurrence: string
  day_of_week: number | null
  recurrence_until: string | null
}

const SELECT_COLUMNS = 'id, event_date, title, description, category, start_time, end_time, recurrence, day_of_week, recurrence_until'

function normalizeCategory(value: string): CustomEventCategory {
  return (CUSTOM_EVENT_CATEGORIES as readonly string[]).includes(value) ? (value as CustomEventCategory) : 'otro'
}

function normalizeRecurrence(value: string): CustomEventRecurrence {
  return (CUSTOM_EVENT_RECURRENCES as readonly string[]).includes(value) ? (value as CustomEventRecurrence) : 'none'
}

function rowToEvent(row: CustomEventRow, occurrenceDate: string): CustomEvent {
  return {
    id: row.id,
    occurrenceKey: occurrenceDate === row.event_date ? row.id : `${row.id}:${occurrenceDate}`,
    date: occurrenceDate,
    title: row.title,
    description: row.description,
    category: normalizeCategory(row.category),
    startTime: row.start_time,
    endTime: row.end_time,
    recurrence: normalizeRecurrence(row.recurrence),
    dayOfWeek: row.day_of_week,
    anchorDate: row.event_date,
    recurrenceUntil: row.recurrence_until,
  }
}

// Un evento semanal ('Lunes-Viernes Instituto', 'Martes natación') no vive
// en una fila por semana — vive en UNA fila con day_of_week + una fecha de
// inicio (event_date) y opcionalmente un fin (recurrence_until). Para
// pintarlo en un rango de fechas visible (grid mensual o vista por horas)
// hay que proyectarlo: una instancia por cada fecha del rango que caiga en
// ese día de la semana y esté dentro de [event_date, recurrence_until].
function expandWeeklyOccurrences(row: CustomEventRow, fromDate: string, toDate: string): CustomEvent[] {
  if (row.day_of_week == null) return []
  const rangeStart = row.event_date > fromDate ? row.event_date : fromDate
  const rangeEnd = row.recurrence_until && row.recurrence_until < toDate ? row.recurrence_until : toDate
  if (rangeStart > rangeEnd) return []

  const occurrences: CustomEvent[] = []
  let cursor = rangeStart
  let guard = 0
  while (cursor <= rangeEnd && guard < 400) {
    if (mondayBasedDayIndex(cursor) === row.day_of_week) occurrences.push(rowToEvent(row, cursor))
    cursor = addDays(cursor, 1)
    guard += 1
  }
  return occurrences
}

export async function fetchCustomEvents(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<CustomEvent[]> {
  const [oneOffRes, weeklyRes] = await Promise.all([
    supabase
      .from('camino_custom_events')
      .select(SELECT_COLUMNS)
      .eq('user_id', userId)
      .eq('recurrence', 'none')
      .gte('event_date', fromDate)
      .lte('event_date', toDate),
    supabase
      .from('camino_custom_events')
      .select(SELECT_COLUMNS)
      .eq('user_id', userId)
      .eq('recurrence', 'weekly')
      .lte('event_date', toDate)
      .or(`recurrence_until.is.null,recurrence_until.gte.${fromDate}`),
  ])
  if (oneOffRes.error || weeklyRes.error) return []

  const oneOff = (oneOffRes.data as CustomEventRow[] ?? []).map(row => rowToEvent(row, row.event_date))
  const weekly = (weeklyRes.data as CustomEventRow[] ?? []).flatMap(row => expandWeeklyOccurrences(row, fromDate, toDate))

  return [...oneOff, ...weekly].sort((a, b) =>
    a.date.localeCompare(b.date) || (a.startTime ?? '').localeCompare(b.startTime ?? ''))
}

export type CustomEventDraft = {
  date: string
  title: string
  description: string
  category: CustomEventCategory
  startTime: string
  endTime: string
  recurrence: CustomEventRecurrence
  /** Solo si recurrence='weekly'; si se omite se calcula a partir de `date`. */
  dayOfWeek?: number
  recurrenceUntil?: string
}

export async function createCustomEvent(
  supabase: SupabaseClient,
  userId: string,
  draft: CustomEventDraft,
): Promise<CustomEvent | null> {
  const title = draft.title.trim().slice(0, 120)
  if (!title || !draft.date) return null
  const isWeekly = draft.recurrence === 'weekly'
  const { data, error } = await supabase
    .from('camino_custom_events')
    .insert({
      user_id: userId,
      event_date: draft.date,
      title,
      description: draft.description.trim().slice(0, 500) || null,
      category: draft.category,
      start_time: draft.startTime || null,
      end_time: draft.endTime || null,
      recurrence: draft.recurrence,
      day_of_week: isWeekly ? draft.dayOfWeek ?? mondayBasedDayIndex(draft.date) : null,
      recurrence_until: isWeekly ? draft.recurrenceUntil || null : null,
    })
    .select(SELECT_COLUMNS)
    .single()
  if (error || !data) return null
  return rowToEvent(data as CustomEventRow, (data as CustomEventRow).event_date)
}

export async function deleteCustomEvent(
  supabase: SupabaseClient,
  userId: string,
  eventId: string,
): Promise<boolean> {
  const { error } = await supabase
    .from('camino_custom_events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', userId)
  return !error
}
