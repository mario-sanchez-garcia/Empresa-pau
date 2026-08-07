import type { SupabaseClient } from '@supabase/supabase-js'

// "Repetir para mejorar": XP reducido al repetir un simulacro/examen/curso
// ya hecho, solo si la nota nueva supera la de referencia. La base XP nunca
// se vuelve a otorgar íntegra (eso premiaría repetir sin más, como si fuera
// la primera vez) — se parte a la mitad en cada repetición sucesiva (1ª
// repetición = 50% de la base normal, 2ª = 25%, 3ª = 12.5%...) para que
// insistir sin límite dé cada vez menos, con un suelo de REPEAT_XP_MIN para
// que nunca llegue a 0 mientras siga habiendo mejora real. Sobre esa base
// reducida se sigue aplicando el mismo bonus de calidad por nota que ya usa
// awardXp() (así que una mejora grande sigue dando más que una mínima). Sin
// mejora real, 0 — no hay XP por intentarlo otra vez sin superar el
// resultado anterior.
export const REPEAT_XP_MIN = 1

// Devuelve la base XP (antes del bonus de calidad de awardXp) para una
// repetición, o 0 si no hay mejora real. 0 significa "no llamar a awardXp"
// — camino_xp_events.xp_amount exige > 0. `repeatGeneration` es 1 para la
// primera repetición, 2 para la segunda repitiendo esa repetición, etc.
// (ver countRepeatDepth).
export function computeRepeatBaseXp(
  normalBaseXp: number,
  previousScoreOnTen: number | null,
  newScoreOnTen: number | null,
  repeatGeneration: number
): number {
  if (previousScoreOnTen == null || newScoreOnTen == null) return 0
  if (newScoreOnTen <= previousScoreOnTen) return 0
  const halved = Math.floor(normalBaseXp / Math.pow(2, repeatGeneration))
  return Math.max(REPEAT_XP_MIN, halved)
}

// Cuenta cuántas repeticiones separan `rowId` del intento original (0 si
// rowId ya es el intento original, sin repeated_from_id). Sigue la cadena
// repeated_from_id hacia atrás uno a uno — las cadenas son cortas en la
// práctica (un alumno no repite decenas de veces lo mismo), así que un bucle
// de lecturas sueltas es más simple que una CTE recursiva y basta de sobra.
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
