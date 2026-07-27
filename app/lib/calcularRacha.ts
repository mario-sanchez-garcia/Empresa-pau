import { type SupabaseClient } from '@supabase/supabase-js'
import { SPAIN_HOLIDAYS } from './camino/spainHolidays'

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function isNonStudyDay(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow === 0 || dow === 6 || SPAIN_HOLIDAYS.has(dateStr)
}

export async function calcularRacha(
  userId: string,
  supabase: SupabaseClient,
): Promise<number> {
  const { data, error } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .eq('status', 'completed')

  if (error || !data || data.length === 0) return 0

  const completedDates = new Set(data.map(r => r.scheduled_date as string))

  const today = getMadridToday()

  // If today is a study day but not yet done, the previous streak is intact —
  // start the backward walk from yesterday so we don't show 0 until end of day.
  const start = !isNonStudyDay(today) && !completedDates.has(today)
    ? addDays(today, -1)
    : today

  let streak = 0
  let current = start

  while (true) {
    if (isNonStudyDay(current)) {
      current = addDays(current, -1)
      continue
    }
    if (completedDates.has(current)) {
      streak++
      current = addDays(current, -1)
    } else {
      break
    }
  }

  return streak
}
