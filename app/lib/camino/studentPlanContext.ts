import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { resolveTargetExamDate } from './examDate'
import { getMadridToday } from './studyDays'
import { loadStudyAccess } from './studyAccess'
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
  const results = await Promise.all([
    supabase.from('perfiles').select('pau_exam_date, pau_convocatoria').eq('id', userId).maybeSingle(),
    supabase
      .from('billing_events')
      .select('payload')
      .eq('user_id', userId)
      .eq('event_type', 'onboarding_completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from('billing_events').select('payload').eq('user_id', userId)
      .eq('event_type', 'camino_emergency_availability').order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  for (const result of results) {
    if (result.error) throw new Error(`Plan context read failed: ${result.error.message}`)
  }
  const [{ data: profile }, { data: prefsRow }, { data: exception }] = results
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

  const access = await loadStudyAccess(userId, supabase)
  const requestedWeekly = declared?.weeklyStudyDays ?? persistedWeekly ?? access.maxStudyDaysPerWeek
  const dailyMinutes = declared?.dailyMinutes ?? persistedMinutes ?? 60

  // Esta función es de LECTURA, y la llaman ensureCaminoCalendar, los
  // inyectores de repaso y diagnóstico, la práctica de bloque y la
  // repersonalización. Lanzar aquí porque lo guardado no encaja con el acceso
  // actual deja al alumno SIN Camino ninguno, y la población afectada no es
  // marginal: todo alumno free que eligió 3-7 días con el selector antiguo
  // (free permite 2), y cualquiera cuyo acceso caduque o se degrade.
  //
  // Así que aquí se acota, pero NO en silencio: el contexto viaja diciendo
  // qué pidió el alumno y que su acceso no da para tanto, y quien pinta
  // interfaz lo dice con esas palabras. El rechazo vive en los caminos de
  // ESCRITURA (onboarding/setup y finalize), que es donde el alumno todavía
  // puede elegir otra cosa.
  const exceedsAccess = typeof requestedWeekly === 'number' && requestedWeekly > access.maxStudyDaysPerWeek
  const effectiveWeekly = exceedsAccess ? access.maxStudyDaysPerWeek : requestedWeekly

  return {
    ...buildStudentPlanContext({
      today,
      examDate,
      emergencyAvailabilityAccepted: exception?.payload?.exam_date === examDate && exception?.payload?.accepted === true,
      weeklyStudyDays: effectiveWeekly,
      dailyMinutes,
    }),
    requestedWeeklyStudyDays: typeof requestedWeekly === 'number' ? requestedWeekly : null,
    availabilityExceedsAccess: exceedsAccess,
    accessMaxStudyDaysPerWeek: access.maxStudyDaysPerWeek,
    accessLabel: access.label,
  }
}
