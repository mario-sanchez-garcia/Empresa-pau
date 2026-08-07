import type { SupabaseClient } from '@supabase/supabase-js'

// Cuenta cuántas repeticiones separan `rowId` del intento original (0 si
// rowId ya es el intento original, sin repeated_from_id). Sigue la cadena
// repeated_from_id hacia atrás uno a uno — las cadenas son cortas en la
// práctica (un alumno no repite decenas de veces lo mismo), así que un bucle
// de lecturas sueltas es más simple que una CTE recursiva y basta de sobra.
// Usado por xpFormula.ts (vía awardRepeatImprovementXp) para saber cuántas
// veces aplicar la reducción por repetición.
export async function countRepeatDepth(
  db: SupabaseClient,
  table: 'historial_examenes' | 'historial_simulacros',
  rowId: string,
  userId: string
): Promise<number> {
  let depth = 0
  let currentId: string | null = rowId
  const MAX_DEPTH = 50
  while (currentId && depth < MAX_DEPTH) {
    const result = await db
      .from(table)
      .select('repeated_from_id')
      .eq('id', currentId)
      .eq('user_id', userId)
      .maybeSingle()
    const data = result.data as { repeated_from_id: string | null } | null
    const parent = data?.repeated_from_id ?? null
    if (!parent) break
    depth++
    currentId = parent
  }
  return depth
}
