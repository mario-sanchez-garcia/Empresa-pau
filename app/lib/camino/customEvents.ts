import type { SupabaseClient } from '@supabase/supabase-js'

export const CUSTOM_EVENT_CATEGORIES = ['deberes', 'extraescolar', 'estudio_personal', 'otro'] as const
export type CustomEventCategory = typeof CUSTOM_EVENT_CATEGORIES[number]

export const CUSTOM_EVENT_CATEGORY_LABELS: Record<CustomEventCategory, string> = {
  deberes: 'Deberes',
  extraescolar: 'Extraescolar',
  estudio_personal: 'Estudio personal',
  otro: 'Otro',
}

export type CustomEvent = {
  id: string
  date: string
  title: string
  description: string | null
  category: CustomEventCategory
  startTime: string | null
  endTime: string | null
}

type CustomEventRow = {
  id: string
  event_date: string
  title: string
  description: string | null
  category: string
  start_time: string | null
  end_time: string | null
}

function rowToEvent(row: CustomEventRow): CustomEvent {
  const category = (CUSTOM_EVENT_CATEGORIES as readonly string[]).includes(row.category)
    ? (row.category as CustomEventCategory)
    : 'otro'
  return {
    id: row.id,
    date: row.event_date,
    title: row.title,
    description: row.description,
    category,
    startTime: row.start_time,
    endTime: row.end_time,
  }
}

export async function fetchCustomEvents(
  supabase: SupabaseClient,
  userId: string,
  fromDate: string,
  toDate: string,
): Promise<CustomEvent[]> {
  const { data, error } = await supabase
    .from('camino_custom_events')
    .select('id, event_date, title, description, category, start_time, end_time')
    .eq('user_id', userId)
    .gte('event_date', fromDate)
    .lte('event_date', toDate)
    .order('event_date', { ascending: true })
  if (error || !data) return []
  return (data as CustomEventRow[]).map(rowToEvent)
}

export type CustomEventDraft = {
  date: string
  title: string
  description: string
  category: CustomEventCategory
  startTime: string
  endTime: string
}

export async function createCustomEvent(
  supabase: SupabaseClient,
  userId: string,
  draft: CustomEventDraft,
): Promise<CustomEvent | null> {
  const title = draft.title.trim().slice(0, 120)
  if (!title || !draft.date) return null
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
    })
    .select('id, event_date, title, description, category, start_time, end_time')
    .single()
  if (error || !data) return null
  return rowToEvent(data as CustomEventRow)
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
