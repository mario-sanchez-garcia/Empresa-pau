import type { SupabaseClient } from '@supabase/supabase-js'

// Persiste el reajuste antes de responder al guardado. Una carga posterior
// de Camino lo aplica aunque el alumno cierre Ajustes antes del recálculo.
// Es auxiliar: su fallo no debe ocultar el resultado de la operación principal.
export async function markReplanPending(db: SupabaseClient, userId: string): Promise<boolean> {
  try {
    const { error } = await db
      .from('camino_ensure_log')
      .upsert(
        { user_id: userId, replan_pending_at: new Date().toISOString() },
        { onConflict: 'user_id' },
      )
    if (error) {
      console.error('[camino/ensure-calendar] no se pudo anotar el reajuste pendiente:', error.message)
      return false
    }
    return true
  } catch (error) {
    console.error('[camino] pending replan could not be recorded', error)
    return false
  }
}

