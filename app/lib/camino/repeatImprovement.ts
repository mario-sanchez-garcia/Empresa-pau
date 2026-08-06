// "Repetir para mejorar": XP reducido al repetir un simulacro/examen/curso
// ya hecho, solo si la nota nueva supera la de referencia. La base XP nunca
// se vuelve a otorgar íntegra (eso premiaría repetir sin más, como si fuera
// la primera vez) — se escala a un porcentaje fijo de la base normal de esa
// acción y, sobre esa base reducida, se sigue aplicando el mismo bonus de
// calidad por nota que ya usa awardXp() (así que una mejora grande sigue
// dando más que una mejora mínima). Sin mejora real, 0 — no hay XP por
// intentarlo otra vez sin superar el resultado anterior.
export const REPEAT_XP_BASE_RATIO = 0.4

// Devuelve la base XP (antes del bonus de calidad de awardXp) para una
// repetición, o 0 si no hay mejora real. 0 significa "no llamar a awardXp"
// — camino_xp_events.xp_amount exige > 0.
export function computeRepeatBaseXp(normalBaseXp: number, previousScoreOnTen: number | null, newScoreOnTen: number | null): number {
  if (previousScoreOnTen == null || newScoreOnTen == null) return 0
  if (newScoreOnTen <= previousScoreOnTen) return 0
  return Math.round(normalBaseXp * REPEAT_XP_BASE_RATIO)
}
