import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

// Marca como completada la fila de camino_calendar que originó una práctica
// de parcial, una vez esa práctica se ha corregido — mismo patrón atómico
// (UPDATE ... WHERE status IN ('pending','missed'), 0 filas afectadas = ya
// estaba hecha o no existe) que ya usa /api/camino/complete-mission, pero
// SIN volver a llamar a awardXp(): el XP de esta acción ya lo otorga
// /api/simulacro con sourceType 'parcial_completion' (con su propio bonus de
// calidad por nota); llamarlo aquí también duplicaría el XP de la misma
// entrega. Acepta 'missed' además de 'pending' por el mismo motivo que
// /api/camino/complete-mission: con el fix de cronología el alumno puede
// corregir tarde una práctica de un día ya pasado que ensureCaminoCalendar
// ya marcó 'missed' — sin esto, corregirla tarde no la marcaba como hecha.
//
// resultId (el id de historial_simulacros ya corregido) se guarda en
// metadata.practica_simulacro_id para que la UI del calendario pueda
// enlazar directamente a esa corrección en vez de dejar que el alumno
// vuelva a abrir el flujo de "nueva práctica".
//
// xpAwarded (opcional): el total real ya otorgado por /api/simulacro (base +
// bonus de calidad), para que la tarjeta de esta misión en el calendario de
// Camino muestre el mismo número que ya vio el alumno en la pantalla de
// resultados en vez de quedarse sin badge de XP.
export async function markCalendarMissionCompleted(
  db: SupabaseClient,
  userId: string,
  calendarRowId: string,
  resultId: string,
  xpAwarded?: number,
): Promise<void> {
  try {
    const { data: row } = await db
      .from('camino_calendar')
      .select('metadata')
      .eq('id', calendarRowId)
      .eq('user_id', userId)
      .in('status', ['pending', 'missed'])
      .maybeSingle()

    if (!row) return // ya completada, no existe, o no es de este usuario

    const existingMetadata = (row.metadata ?? {}) as Record<string, unknown>

    await db
      .from('camino_calendar')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        metadata: { ...existingMetadata, practica_simulacro_id: resultId },
        ...(typeof xpAwarded === 'number' && xpAwarded > 0 ? { xp_awarded: xpAwarded } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', calendarRowId)
      .eq('user_id', userId)
      .in('status', ['pending', 'missed'])
  } catch (error) {
    console.error('[markCalendarMissionCompleted] failed', { calendarRowId, message: (error as Error)?.message?.slice(0, 200) })
  }
}
