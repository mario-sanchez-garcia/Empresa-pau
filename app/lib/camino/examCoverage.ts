import type { SupabaseClient } from '@supabase/supabase-js'

import { missionPlanForMinutes } from './dailyTimeCapacity'

// Copia local, no importada de injectPartialExamMissions.ts a propósito —
// ese módulo importa computeExamCoverage de aquí, así que importar de vuelta
// crearía un ciclo. Misma implementación exacta que la de allí.
function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
function isWeekday(dateStr: string): boolean {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow !== 0 && dow !== 6
}
function weekdaysBefore(examDate: string, fromDate: string): string[] {
  const days: string[] = []
  let cur = fromDate
  while (cur < examDate) {
    if (isWeekday(cur)) days.push(cur)
    cur = shiftDate(cur, 1)
  }
  return days
}

// Historia only for now — curriculum_content_v2.topic_id (migration
// 20260825220000) is the only place a real Parcial's exam_topics can be
// resolved to a v2_sort_order today. Other subjects have no topic_id
// populated, so `computable` comes back false and every caller falls
// through to its existing behavior unchanged (see rule 4/6: no exam, or an
// exam whose coverage can't be computed, must look exactly like today).
const COVERAGE_SUBJECT = 'historia_espana'

export type ExamCoverage = {
  computable: boolean
  totalCount: number
  completedCount: number
  /** v2_sort_order still needed — includes items rescueMode marked 'inactive' (see inactiveQueueIdsToReactivate). */
  pendingSortOrders: number[]
  /** user_learning_queue ids that are 'inactive' (rescueMode's overflow cap) but belong to this exam's topics — must be reactivated to 'pending', not silently skipped, or they'd vanish from the count instead of counting as "still owed". */
  inactiveQueueIdsToReactivate: string[]
  /** Weekdays strictly before the exam date, counting from today (same helper injectPartialExamMissions.ts already uses). */
  weekdaysUntilExam: string[]
  /** Coverage % achievable if every one of weekdaysUntilExam is spent entirely on this exam's pending topics, at the student's max declared daily mission count. The ceiling used to decide the Simulacro's fate (100 / 80-99 / <80, see injectPartialExamMissions.ts). */
  maxProjectedCoveragePct: number
  /** missionPlanForMinutes(dailyMinutes).count — how many Curso lessons/day compression can realistically add, at this student's declared pace. Exposed so callers can project coverage at a specific EARLIER checkpoint (e.g. "3 weekdays before the exam"), not just at the exam date itself — see injectPartialExamMissions.ts's final_mini_mock placement. */
  maxPerDayCapacity: number
}

const NOT_COMPUTABLE: ExamCoverage = {
  computable: false,
  totalCount: 0,
  completedCount: 0,
  pendingSortOrders: [],
  inactiveQueueIdsToReactivate: [],
  weekdaysUntilExam: [],
  maxProjectedCoveragePct: 100,
  maxPerDayCapacity: 1,
}

async function getDeclaredDailyMinutes(db: SupabaseClient, userId: string): Promise<number | null> {
  const { data: prefsRow } = await db
    .from('billing_events')
    .select('payload')
    .eq('user_id', userId)
    .eq('event_type', 'onboarding_completed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  const value = (prefsRow?.payload as Record<string, unknown> | null | undefined)?.daily_minutes
  return typeof value === 'number' ? value : null
}

/**
 * Computes, for a single exam, how many of its exam_topics-linked Curso
 * lessons are still pending and whether compressing the student's Historia
 * schedule to every remaining weekday could realistically reach 80%/100%
 * coverage before the exam date. Pure read — no writes. Callers
 * (ensureCaminoCalendar.ts, injectPartialExamMissions.ts) decide what to do
 * with the result; this only measures it.
 */
export async function computeExamCoverage(
  db: SupabaseClient,
  userId: string,
  examId: string,
  subjectSlug: string,
  examDate: string,
  today: string,
): Promise<ExamCoverage> {
  if (subjectSlug !== COVERAGE_SUBJECT) return NOT_COMPUTABLE

  const { data: examTopicRows } = await db.from('exam_topics').select('topic_id').eq('exam_id', examId)
  const topicIds = (examTopicRows ?? []).map(r => r.topic_id as string).filter(Boolean)
  if (topicIds.length === 0) return NOT_COMPUTABLE

  const { data: cv2Rows } = await db
    .from('curriculum_content_v2')
    .select('sort_order')
    .eq('subject', subjectSlug)
    .in('topic_id', topicIds)
  const sortOrders = [...new Set((cv2Rows ?? []).map(r => r.sort_order as number))]
  if (sortOrders.length === 0) return NOT_COMPUTABLE

  const { data: queueRows } = await db
    .from('user_learning_queue')
    .select('id, v2_sort_order, queue_status')
    .eq('user_id', userId)
    .eq('subject', subjectSlug)
    .in('v2_sort_order', sortOrders)

  const completedSortOrders = new Set<number>()
  const pendingSortOrders: number[] = []
  const inactiveQueueIdsToReactivate: string[] = []
  const seenSortOrders = new Set<number>()
  for (const row of queueRows ?? []) {
    const sortOrder = row.v2_sort_order as number
    seenSortOrders.add(sortOrder)
    if (row.queue_status === 'completed') {
      completedSortOrders.add(sortOrder)
    } else {
      pendingSortOrders.push(sortOrder)
      if (row.queue_status === 'inactive') inactiveQueueIdsToReactivate.push(row.id as string)
    }
  }
  // A sort_order with no queue row at all (shouldn't normally happen once
  // the queue is seeded, but a topic added to curriculum_content_v2 after
  // the queue was generated would have none) counts as pending too — never
  // silently drop it from the denominator.
  for (const sortOrder of sortOrders) {
    if (!seenSortOrders.has(sortOrder)) pendingSortOrders.push(sortOrder)
  }

  const totalCount = sortOrders.length
  const completedCount = completedSortOrders.size
  const weekdaysUntilExam = weekdaysBefore(examDate, today)

  const dailyMinutes = await getDeclaredDailyMinutes(db, userId)
  const maxPerDay = missionPlanForMinutes(dailyMinutes).count
  const maxAdditionalCoverable = Math.min(pendingSortOrders.length, maxPerDay * weekdaysUntilExam.length)
  const maxProjectedCoveragePct = totalCount > 0
    ? Math.min(100, ((completedCount + maxAdditionalCoverable) / totalCount) * 100)
    : 100

  return {
    computable: true,
    totalCount,
    completedCount,
    pendingSortOrders,
    inactiveQueueIdsToReactivate,
    weekdaysUntilExam,
    maxProjectedCoveragePct,
    maxPerDayCapacity: maxPerDay,
  }
}

/** Undoes rescueMode's overflow-cap for these specific queue rows — they belong to an exam whose topics must stay counted as "still owed", never silently disappear. */
export async function reactivateQueueItems(db: SupabaseClient, userId: string, queueIds: string[]): Promise<void> {
  if (queueIds.length === 0) return
  await db
    .from('user_learning_queue')
    .update({ queue_status: 'pending' })
    .eq('user_id', userId)
    .in('id', queueIds)
    .eq('queue_status', 'inactive')
}
