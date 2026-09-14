import { loadCalendarDiagnostics } from './calendarDiagnostics'
import type { SupabaseClient } from '@supabase/supabase-js'

import { loadStudentPlanContext, type StudentPlanContext } from './studentPlanContext.ts'
import { getMadridToday } from './studyDays.ts'

// El estado del plan que hay que CONTARLE al alumno, calculado aparte de quien
// lo provoca.
//
// Vive fuera de la ruta y fuera de ensureCaminoCalendar por un motivo concreto:
// estas condiciones siguen siendo ciertas aunque hoy no se genere nada. El
// Camino se prepara una vez al día; si el aviso solo viajara en la respuesta de
// esa ejecución, recargar la página después lo haría desaparecer con el
// problema todavía ahí. Un aviso que se borra al recargar es peor que no
// tenerlo: enseña que la app se contradice.
//
// Por lo mismo devuelve SIEMPRE los tres campos, también vacíos. "No hay
// recorte" es una respuesta, y es la única forma de que quien pinta el aviso
// sepa retirarlo cuando el problema se resuelve.

export type AvailabilityCapNotice = {
  requestedWeeklyStudyDays: number | null
  effectiveWeeklyStudyDays: number | null
  accessMaxStudyDaysPerWeek?: number
  accessLabel?: string
}

export type PlanNotices = {
  /** Recorte de días por acceso comercial, o null si su acceso da para lo que pidió. */
  availability: AvailabilityCapNotice | null
  /**
   * Misiones que el alumno fijó (bloqueadas, movidas a mano, puestas por el
   * chat) y que han quedado en o después de su fecha objetivo. No se tocan.
   */
  protectedConflicts: string[]
  /**
   * Misiones recolocables con conflicto de fecha, horario, presupuesto o
   * modelo de duración antiguo. Es la señal de que hay que replanificar
   * aunque el día ya estuviera marcado como hecho.
   */
  misplaced: string[]
}

export async function collectPlanNotices(
  userId: string,
  db: SupabaseClient,
  today: string = getMadridToday(),
  planContext?: StudentPlanContext,
): Promise<PlanNotices> {
  const context = planContext ?? await loadStudentPlanContext(userId, db, today)

  const { conflicts, requiresDurationRefresh } = await loadCalendarDiagnostics(userId, db, context)
  const misplaced = [...new Set([...conflicts.filter(row => row.scheduled && row.automatic).map(row => row.id), ...requiresDurationRefresh])]
  // El banner histórico se refiere a fechas posteriores a la PAU. Los demás
  // conflictos protegidos aparecen con su motivo en la previsión detallada.
  const protectedConflicts = conflicts.filter(row => row.scheduled && !row.automatic && row.reason === 'after_exam').map(row => row.id)

  return {
    availability: context.availabilityExceedsAccess
      ? {
          requestedWeeklyStudyDays: context.requestedWeeklyStudyDays ?? null,
          effectiveWeeklyStudyDays: context.weeklyStudyDays,
          accessMaxStudyDaysPerWeek: context.accessMaxStudyDaysPerWeek,
          accessLabel: context.accessLabel,
        }
      : null,
    protectedConflicts,
    misplaced,
  }
}
