import { type SupabaseClient } from '@supabase/supabase-js'

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function isWeekend(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow === 0 || dow === 6
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
  let streak = 0
  let current = today

  // Walk backwards from today, skipping weekends (they never break the streak)
  while (true) {
    if (isWeekend(current)) {
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
