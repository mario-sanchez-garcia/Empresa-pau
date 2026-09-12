import type { SupabaseClient } from '@supabase/supabase-js'

import { canRepositionAutomatically } from './automaticPlacement.ts'
import { planningDates } from './planWindow.ts'
import { loadStudentPlanContext } from './studentPlanContext.ts'
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
   * Misiones recolocables que están en una fecha que el alumno YA NO PUEDE
   * usar. No es un aviso para él: es la señal de que hay que replanificar
   * aunque el día ya estuviera marcado como hecho.
   */
  misplaced: string[]
}

type NoticeRow = {
  id: string
  scheduled_date: string | null
  status: string
  source: string | null
  locked: boolean | null
  metadata: Record<string, unknown> | null
}

export async function collectPlanNotices(
  userId: string,
  db: SupabaseClient,
  today: string = getMadridToday(),
): Promise<PlanNotices> {
  const context = await loadStudentPlanContext(userId, db, today)

  const { data, error } = await db
    .from('camino_calendar')
    .select('id, scheduled_date, status, source, locked, metadata')
    .eq('user_id', userId)
    .in('status', ['pending', 'postponed'])
    .gte('scheduled_date', today)
  if (error) throw new Error(`Plan notices read: ${error.message}`)

  const rows = (data ?? []) as NoticeRow[]
  const validDates = new Set(planningDates(context, { includeFinalReviewWindow: true, limit: 730 }))

  const protectedConflicts: string[] = []
  const misplaced: string[] = []

  for (const row of rows) {
    if (typeof row.scheduled_date !== 'string') continue
    const repositionable = canRepositionAutomatically(row)
    // Después de la fecha objetivo no hay plan que valga. Si el alumno la
    // fijó, es conflicto suyo y se le enseña; si no, es trabajo a recolocar.
    if (row.scheduled_date >= context.examDate) {
      if (repositionable) misplaced.push(row.id)
      else protectedConflicts.push(row.id)
      continue
    }
    // Dentro de plazo pero en un día que su patrón actual no incluye: pasa
    // cuando el acceso se degrada después de haber planificado.
    if (repositionable && !validDates.has(row.scheduled_date)) misplaced.push(row.id)
  }

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
