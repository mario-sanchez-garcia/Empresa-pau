import { type SupabaseClient } from '@supabase/supabase-js'

import { PRIVATE_BETA_SUBJECTS, isPrivateBetaSubject } from './camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from './camino/caminoCurriculumPlan'

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
  const ordered = (PRIVATE_BETA_SUBJECTS as readonly string[]).filter(subject => subjects.includes(subject))
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  if (dow === 0 || dow === 6) return null
  return ordered[(dow - 1) % ordered.length] ?? subjects[0]
}

type QueueItem = {
  id: string
  subject: string
  v2_sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
  metadata: Record<string, unknown> | null
}

function queueTopicMeta(item: QueueItem) {
  const subject = normalizeSubjectSlug(item.subject)
  const fromMetadata = typeof item.metadata?.topic_slug === 'string' ? item.metadata.topic_slug : null
  const topic = CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    (candidate.v2SortOrder === item.v2_sort_order || candidate.orderIndex === item.v2_sort_order)
  ) ?? CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject &&
    normalizeTopicSlug(candidate.title) === normalizeTopicSlug(item.title)
  )
  const blockSlug = item.block_slug ?? topic?.blockSlug ?? null
  const rawTopicSlug = fromMetadata ?? topic?.topicSlug ?? normalizeTopicSlug(item.title)
  return {
    blockSlug,
    topicSlug: blockSlug ? resolveTopicSlugAlias(subject, blockSlug, rawTopicSlug) : normalizeTopicSlug(rawTopicSlug),
  }
}

// Returns a lower number = higher PAU priority
function rescuePriority(subject: string, sortOrder: number): number {
  if (subject === 'matematicas_ii') {
    if (sortOrder >= 35 && sortOrder <= 49) return 1 // Análisis
    if (sortOrder >= 50 && sortOrder <= 60) return 2 // Probabilidad
    if (sortOrder >= 1 && sortOrder <= 19) return 3  // Álgebra
    if (sortOrder >= 20 && sortOrder <= 34) return 4 // Geometría
    return 5
  }
  if (subject === 'historia_espana') {
    if (sortOrder >= 53 && sortOrder <= 79) return 1   // Siglo XIX y Restauración
    if (sortOrder >= 89 && sortOrder <= 106) return 2  // 2ª República y Guerra Civil
    if (sortOrder >= 107 && sortOrder <= 127) return 3 // Franquismo y Transición
    return 4 // Resto de bloques
  }
  return 10
}

function commentTextIntervalDays(today: string): number | null {
  if (today >= '2026-09-01' && today <= '2026-12-31') return 28
  if (today >= '2027-01-01' && today <= '2027-03-31') return 14
  if (today >= '2027-04-01' && today <= '2027-05-31') return 7
  return null
}

async function maybeInjectCommentText(
  userId: string,
  supabase: SupabaseClient,
  today: string,
): Promise<void> {
  const intervalDays = commentTextIntervalDays(today)
  if (intervalDays === null) return

  // Only for users who have historia_espana in their queue
  const { count: histCount } = await supabase
    .from('user_learning_queue')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('subject', 'historia_espana')
  if (!histCount) return

  // Skip if there's already a future comment_text scheduled
  const { data: futureRows } = await supabase
    .from('camino_calendar')
    .select('id')
    .eq('user_id', userId)
    .eq('mission_type', 'comment_text')
    .gte('scheduled_date', today)
    .limit(1)
  if (futureRows && futureRows.length > 0) return

  // Check interval since last past comment_text
  const { data: lastRows } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .eq('mission_type', 'comment_text')
    .lt('scheduled_date', today)
    .order('scheduled_date', { ascending: false })
    .limit(1)

  const lastDate: string | null = lastRows?.[0]?.scheduled_date ?? null
  if (lastDate) {
    const daysSinceLast = Math.floor(
      (new Date(today + 'T12:00:00Z').getTime() - new Date(lastDate + 'T12:00:00Z').getTime()) / 86400000,
    )
    if (daysSinceLast < intervalDays) return
  }

  // Get taken dates in the next 42 days to find a free slot
  const horizon = addDays(today, 42)
  const { data: existingDates } = await supabase
    .from('camino_calendar')
    .select('scheduled_date')
    .eq('user_id', userId)
    .gte('scheduled_date', today)
    .lte('scheduled_date', horizon)
  const takenDates = new Set((existingDates ?? []).map(r => r.scheduled_date as string))

  // Find next available Friday; fall back to Thursday if Friday is taken
  let candidate: string | null = null
  for (let i = 0; i < 42; i++) {
    const d = addDays(today, i)
    const dow = new Date(d + 'T12:00:00Z').getUTCDay()
    if (dow !== 5 || HOLIDAYS.has(d)) continue // only Fridays, non-holiday
    if (!takenDates.has(d)) { candidate = d; break }
    // Friday taken — try Thursday (day before)
    const thu = addDays(d, -1)
    if (thu >= today && !HOLIDAYS.has(thu) && !takenDates.has(thu)) { candidate = thu; break }
  }
  if (!candidate) return

  await supabase.from('camino_calendar').upsert({
    user_id: userId,
    scheduled_date: candidate,
    subject: 'historia_espana',
    v2_sort_order: 128,
    title: 'Comentario de texto histórico',
    mission_type: 'comment_text',
    is_main: true,
    is_bonus: false,
    status: 'pending',
    source: 'algorithm',
    generated_by: 'algorithm_v1',
  }, { onConflict: 'user_id,scheduled_date,subject,v2_sort_order', ignoreDuplicates: true })
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
    .in('status', ['pending', 'postponed'])

  const futureDaySet = new Set((futureDayRows ?? []).map(r => r.scheduled_date as string))
  if (futureDaySet.size >= CALENDAR_HORIZON) return

  // PASO 4+5 — Generar días hasta completar CALENDAR_HORIZON

  // Private beta scope: the Supabase calendar engine only schedules the active core PAU subjects.
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
      .filter(isPrivateBetaSubject),
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
  const rescueMode = ratio > 2
  const itemsPerDay = rescueMode || ratio > 1.5 ? 2 : 1

  // Obtener items pendientes de la cola ordenados por posición
  // queue_status='pending' excluye automáticamente postponed/scheduled/completed
  const { data: queueItems } = await supabase
    .from('user_learning_queue')
    .select('id, subject, v2_sort_order, title, block_key, block_slug, metadata')
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

  // Rescue mode: re-sort by PAU priority and mark overflow items inactive
  if (rescueMode) {
    const inactiveIds: string[] = []
    const perSubjectCap = Math.ceil((CALENDAR_HORIZON * 2) / subjects.length)

    for (const subj of subjects) {
      const queue = subjectQueues[subj] ?? []
      queue.sort((a, b) => {
        const pa = rescuePriority(a.subject, a.v2_sort_order)
        const pb = rescuePriority(b.subject, b.v2_sort_order)
        return pa !== pb ? pa - pb : a.v2_sort_order - b.v2_sort_order
      })
      if (queue.length > perSubjectCap) {
        for (const item of queue.slice(perSubjectCap)) inactiveIds.push(item.id)
        subjectQueues[subj] = queue.slice(0, perSubjectCap)
      } else {
        subjectQueues[subj] = queue
      }
    }

    if (inactiveIds.length > 0) {
      await supabase
        .from('user_learning_queue')
        .update({ queue_status: 'inactive' })
        .in('id', inactiveIds)
        .eq('user_id', userId)
    }
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
      const itemMeta = item.metadata ?? {}
      const topicMeta = queueTopicMeta(item)
      const missionType = (itemMeta.mission_type as string) ?? 'concept'
      const calMetadata: Record<string, unknown> = {}
      calMetadata.topic_slug = topicMeta.topicSlug
      if (itemMeta.express) calMetadata.express = true
      if (rescueMode) calMetadata.plan_mode = 'rescue'
      calendarRows.push({
        user_id: userId,
        scheduled_date: dateStr,
        subject: item.subject,
        v2_sort_order: item.v2_sort_order,
        title: sanitizeLessonTitle(item.title),
        block_key: item.block_key,
        block_slug: topicMeta.blockSlug,
        mission_type: missionType,
        is_main: true,
        is_bonus: false,
        status: 'pending',
        source: 'algorithm',
        generated_by: 'algorithm_v1',
        queue_id: item.id,
        metadata: calMetadata,
      })
      scheduledQueueIds.push(item.id)
      cursor++
    }
    cursors[subject] = cursor
  }

  if (calendarRows.length > 0) {
    await supabase.from('camino_calendar').upsert(calendarRows, {
      onConflict: 'user_id,scheduled_date,subject,v2_sort_order',
      ignoreDuplicates: true,
    })
  }

  if (scheduledQueueIds.length > 0) {
    await supabase
      .from('user_learning_queue')
      .update({ queue_status: 'scheduled', scheduled_at: now })
      .in('id', scheduledQueueIds)
      .eq('user_id', userId)
  }

  await maybeInjectCommentText(userId, supabase, today)
}
