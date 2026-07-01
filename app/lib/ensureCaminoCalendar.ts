import { type SupabaseClient } from '@supabase/supabase-js'

const HOLIDAYS = new Set([
  '2026-10-12', '2026-11-01', '2026-11-02',
  '2026-12-06', '2026-12-08', '2026-12-25',
  '2027-01-01', '2027-01-06', '2027-04-01',
  '2027-04-02', '2027-04-03', '2027-04-04',
  '2027-04-17', '2027-04-18', '2027-06-07',
])

const EXAM_DATE = '2027-06-07'
const CALENDAR_HORIZON = 14

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

function isStudyDay(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow !== 0 && dow !== 6 && !HOLIDAYS.has(dateStr)
}

function getStudyDays(startDate: string, n: number): string[] {
  const days: string[] = []
  let current = startDate
  while (days.length < n) {
    if (isStudyDay(current)) days.push(current)
    current = addDays(current, 1)
  }
  return days
}

function countWorkingDays(from: string, to: string): number {
  let count = 0
  let current = from
  while (current < to) {
    if (isStudyDay(current)) count++
    current = addDays(current, 1)
  }
  return count
}

function subjectForDay(dateStr: string, subjects: string[]): string | null {
  if (subjects.length === 0) return null
  if (subjects.length === 1) return subjects[0]
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  if (dow === 1 || dow === 2) {
    return subjects.includes('matematicas_ii') ? 'matematicas_ii' : subjects[0]
  }
  if (dow === 3 || dow === 4 || dow === 5) {
    return subjects.includes('historia_espana') ? 'historia_espana' : subjects[subjects.length - 1]
  }
  return null
}

type QueueItem = {
  id: string
  subject: string
  v2_sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
}

export async function ensureCaminoCalendar(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  const today = getMadridToday()

  // PASO 1 — Marcar misiones pasadas pendientes (no bonus) como missed
  await supabase
    .from('camino_calendar')
    .update({ status: 'missed', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .lt('scheduled_date', today)
    .eq('status', 'pending')
    .eq('is_bonus', false)

  // PASO 2 — Devolver a pending los items de la cola asociados a misiones missed
  const { data: missedRows } = await supabase
    .from('camino_calendar')
    .select('queue_id')
    .eq('user_id', userId)
    .eq('status', 'missed')
    .not('queue_id', 'is', null)

  const missedQueueIds = (missedRows ?? [])
    .map(r => r.queue_id as string)
    .filter(Boolean)

  if (missedQueueIds.length > 0) {
    await supabase
      .from('user_learning_queue')
      .update({ queue_status: 'pending', scheduled_at: null, calendar_id: null })
      .eq('user_id', userId)
      .in('id', missedQueueIds)
      .eq('queue_status', 'scheduled')
  }

  // PASO 3 — Contar días futuros pendientes (distintos)
  const { data: futureDayRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .gte('scheduled_date', today)
    .eq('status', 'pending')

  const futureDaySet = new Set((futureDayRows ?? []).map(r => r.scheduled_date as string))
  if (futureDaySet.size >= CALENDAR_HORIZON) return

  // PASO 4+5 — Generar días hasta completar CALENDAR_HORIZON

  // Obtener asignaturas del usuario desde la cola
  const { data: subjectRows } = await supabase
    .from('user_learning_queue')
    .select('subject')
    .eq('user_id', userId)
    .eq('queue_status', 'pending')
    .limit(500)

  const subjectSet = new Set(
    (subjectRows ?? [])
      .map(r => r.subject as string)
      .filter(s => s === 'matematicas_ii' || s === 'historia_espana'),
  )
  const subjects = [...subjectSet]
  if (subjects.length === 0) return

  // PASO 5 — Ratio de velocidad
  const { count: remainingQueue } = await supabase
    .from('user_learning_queue')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('queue_status', 'pending')

  const workingDaysUntilExam = countWorkingDays(today, EXAM_DATE)
  const ratio = workingDaysUntilExam > 0 ? (remainingQueue ?? 0) / workingDaysUntilExam : 0
  const itemsPerDay = ratio > 1.5 ? 2 : 1

  // Obtener items pendientes de la cola ordenados por posición
  const { data: queueItems } = await supabase
    .from('user_learning_queue')
    .select('id, subject, v2_sort_order, title, block_key, block_slug')
    .eq('user_id', userId)
    .eq('queue_status', 'pending')
    .in('subject', subjects)
    .order('subject', { ascending: true })
    .order('subject_position', { ascending: true })

  const subjectQueues: Record<string, QueueItem[]> = {}
  for (const item of (queueItems ?? []) as QueueItem[]) {
    if (!subjectQueues[item.subject]) subjectQueues[item.subject] = []
    subjectQueues[item.subject].push(item)
  }
  const cursors: Record<string, number> = Object.fromEntries(subjects.map(s => [s, 0]))

  // Días hábiles vacíos que necesitan misión (ventana amplia para cubrir gaps)
  const candidateDays = getStudyDays(today, CALENDAR_HORIZON * 4)
  const emptyDays = candidateDays
    .filter(d => !futureDaySet.has(d))
    .slice(0, CALENDAR_HORIZON - futureDaySet.size)

  if (emptyDays.length === 0) return

  const calendarRows: object[] = []
  const scheduledQueueIds: string[] = []
  const now = new Date().toISOString()

  for (const dateStr of emptyDays) {
    const subject = subjectForDay(dateStr, subjects)
    if (!subject) continue

    const queue = subjectQueues[subject] ?? []
    let cursor = cursors[subject] ?? 0

    for (let slot = 0; slot < itemsPerDay; slot++) {
      if (cursor >= queue.length) break
      const item = queue[cursor]
      calendarRows.push({
        user_id: userId,
        scheduled_date: dateStr,
        subject: item.subject,
        v2_sort_order: item.v2_sort_order,
        title: item.title,
        block_key: item.block_key,
        block_slug: item.block_slug,
        mission_type: 'concept',
        is_main: true,
        is_bonus: false,
        status: 'pending',
        source: 'algorithm',
        generated_by: 'algorithm_v1',
        queue_id: item.id,
      })
      scheduledQueueIds.push(item.id)
      cursor++
    }
    cursors[subject] = cursor
  }

  if (calendarRows.length > 0) {
    await supabase.from('camino_calendar').insert(calendarRows)
  }

  if (scheduledQueueIds.length > 0) {
    await supabase
      .from('user_learning_queue')
      .update({ queue_status: 'scheduled', scheduled_at: now })
      .in('id', scheduledQueueIds)
      .eq('user_id', userId)
  }
}
