import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { StudentPlanContext } from './planWindow'
import { buildCoverageForecast, type ForecastCalendarRow, type ForecastEvent } from './coverageForecast'
import { CONTENT_DURATION_MODEL } from './placementDuration'
import { canRepositionAutomatically } from './automaticPlacement'
import { readAllRows } from './readAllRows'

/** Reutiliza las mismas restricciones que ve el alumno. Incluye las reservas
 * manuales y el trabajo completado hoy: ambos consumen presupuesto real. */
export async function loadCalendarDiagnostics(userId: string, db: SupabaseClient, context: StudentPlanContext) {
  const [calendar, events] = await Promise.all([
    readAllRows<ForecastCalendarRow>((from, to) => db.from('camino_calendar')
      .select('id, title, queue_id, subject, scheduled_date, status, source, locked, mission_type, start_time, end_time, metadata')
      .eq('user_id', userId).in('status', ['pending', 'postponed', 'completed'])
      .gte('scheduled_date', context.today).order('id').range(from, to)),
    readAllRows<ForecastEvent>((from, to) => db.from('camino_custom_events')
      .select('event_date, recurrence, recurrence_until, day_of_week, start_time, end_time')
      .eq('user_id', userId).order('id').range(from, to)),
  ])
  return { conflicts: buildCoverageForecast(context, calendar, [], events, [], { withRemedy: false }).riskItems,
    requiresDurationRefresh: calendar.filter(row => canRepositionAutomatically(row) && row.metadata?.duration_model !== CONTENT_DURATION_MODEL).map(row => row.id) }
}
