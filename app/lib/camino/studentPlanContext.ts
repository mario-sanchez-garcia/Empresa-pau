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

/**
 * Disponibilidad que el alumno acaba de declarar y que TODAVÍA no está
 * persistida en `billing_events`.
 *
 * Existe por el onboarding: el evento `onboarding_completed` se escribe
 * DESPUÉS de generar y verificar el calendario (y debe seguir siendo así — es
 * el evento que significa "el proceso terminó"). Sin esto, el primer plan de
 * una cuenta nueva se construía con `weeklyStudyDays: null` y
 * `dailyMinutes: null`, es decir, contra L-V y la capacidad por defecto,
 * mientras otra parte del mismo generador usaba los minutos recibidos por
 * parámetro: dos componentes del MISMO primer plan con disponibilidades
 * distintas.
 */
export type DeclaredAvailability = {
  weeklyStudyDays?: number | null
  dailyMinutes?: number | null
}

export async function loadStudentPlanContext(
  userId: string,
  supabase: SupabaseClient,
  today: string = getMadridToday(),
  declared?: DeclaredAvailability,
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

  // Lo declarado en esta misma petición manda sobre lo persistido: durante el
  // onboarding lo persistido todavía no existe, y en cualquier otro momento
  // ambos coinciden.
  const persistedWeekly = typeof rawWeekly === 'number' && rawWeekly > 0 ? rawWeekly : null
  const persistedMinutes = typeof rawMinutes === 'number' ? rawMinutes : null

  return buildStudentPlanContext({
    today,
    examDate,
    weeklyStudyDays: declared?.weeklyStudyDays ?? persistedWeekly,
    dailyMinutes: declared?.dailyMinutes ?? persistedMinutes,
  })
}
