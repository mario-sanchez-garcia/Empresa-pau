import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { loadStudentPlanContext, type StudentPlanContext } from './studentPlanContext'
import { readAllRows } from './readAllRows'
import { buildCoverageForecast, type ForecastCalendarRow, type ForecastQueueRow, type ForecastEvent } from './coverageForecast'
import { normalizeSubjectSlug } from './caminoCurriculumPlan'

export async function loadCoverageForecast(userId: string, db: SupabaseClient, planContext?: StudentPlanContext) {
  const [context, calendar, queue, events, profile] = await Promise.all([
    planContext ?? loadStudentPlanContext(userId, db),
    readAllRows<ForecastCalendarRow>((from, to) => db.from('camino_calendar')
      .select('id, title, queue_id, subject, scheduled_date, status, source, locked, mission_type, start_time, end_time, metadata')
      .eq('user_id', userId).in('status', ['pending', 'postponed', 'unscheduled', 'missed', 'completed']).order('id').range(from, to)),
    readAllRows<ForecastQueueRow>((from, to) => db.from('user_learning_queue')
      .select('id, title, subject, queue_status, retry_not_before, metadata').eq('user_id', userId).order('subject_position').order('id').range(from, to)),
    readAllRows<ForecastEvent>((from, to) => db.from('camino_custom_events')
      .select('event_date, recurrence, recurrence_until, day_of_week, start_time, end_time').eq('user_id', userId).order('id').range(from, to)),
    db.from('perfiles').select('subjects').eq('id', userId).maybeSingle(),
  ])
  if (profile.error) throw new Error(profile.error.message)
  const subjects = Array.isArray(profile.data?.subjects) ? profile.data.subjects.filter((s: unknown): s is string => typeof s === 'string').map(normalizeSubjectSlug) : []
  return buildCoverageForecast(context, calendar, queue, events, subjects)
}
