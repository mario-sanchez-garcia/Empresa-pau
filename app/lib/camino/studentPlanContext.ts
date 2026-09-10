import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { resolveTargetExamDate } from './examDate'
import { getMadridToday } from './studyDays'
import { buildStudentPlanContext, type StudentPlanContext } from './planWindow'

// Carga desde base de datos de la ventana de planificación del alumno. Las
// reglas viven en planWindow.ts (puras, comprobables sin Supabase); aquí solo
// se leen los datos, UNA vez por ejecución. Quien encadene varios escritores
// debe pasar el contexto, no recargarlo.

export {
  buildStudentPlanContext,
  capacityOptionsFor,
  isWithinPlan,
  planningDates,
  studyDaysRemaining,
  type StudentPlanContext,
} from './planWindow'

export async function loadStudentPlanContext(
  userId: string,
  supabase: SupabaseClient,
  today: string = getMadridToday(),
): Promise<StudentPlanContext> {
  const [{ data: profile }, { data: prefsRow }] = await Promise.all([
    supabase.from('perfiles').select('pau_exam_date, pau_convocatoria').eq('id', userId).maybeSingle(),
    supabase
      .from('billing_events')
      .select('payload')
      .eq('user_id', userId)
      .eq('event_type', 'onboarding_completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const examDate = resolveTargetExamDate(today, {
    examDate: (profile?.pau_exam_date as string | null | undefined) ?? null,
    convocatoria: (profile?.pau_convocatoria as string | null | undefined) ?? null,
  })

  const payload = prefsRow?.payload as Record<string, unknown> | null | undefined
  const rawWeekly = payload?.weekly_study_days_value
  const rawMinutes = payload?.daily_minutes

  return buildStudentPlanContext({
    today,
    examDate,
    weeklyStudyDays: typeof rawWeekly === 'number' && rawWeekly > 0 ? rawWeekly : null,
    dailyMinutes: typeof rawMinutes === 'number' ? rawMinutes : null,
  })
}
