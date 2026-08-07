// El nuevo sistema de XP (documento de diseño: "El nuevo sistema de XP de
// Kairo") — combina 4 ingredientes multiplicativos para el XP de un primer
// intento, y añade un bonus de mejora aditivo para las repeticiones. Aplica
// solo HACIA DELANTE: nunca recalcules camino_xp_events ya escritos, esto
// solo decide cuánto XP dar a partir de ahora. La escritura real (
// camino_xp_events, increment_camino_progress) sigue en awardXp.ts — este
// módulo solo calcula números, no toca la base de datos.

// ─── Ingrediente 2: Dificultad del bloque ──────────────────────────────────
// Reutiliza la etiqueta de dificultad que ya existe en historial_simulacros
// (columna `dificultad`, NOT NULL, check ('Fácil','Media','Difícil') — ver
// migración 20260608152000). 'Muy difícil' está en la tabla del documento de
// diseño pero ningún contenido la produce todavía; se deja lista para cuando
// exista. Contenido sin dificultad etiquetada (Camino, Exámenes, flashcards
// — ninguno tiene esta columna) usa 'Media' (×1,00) por defecto, tal como
// pide el documento, así que no cambian de XP por este ingrediente.
export const DIFFICULTY_XP_MULTIPLIER: Record<string, number> = {
  'Fácil': 0.90,
  'Media': 1.00,
  'Difícil': 1.15,
  'Muy difícil': 1.30,
}
const DEFAULT_DIFFICULTY_MULTIPLIER = DIFFICULTY_XP_MULTIPLIER['Media']

export function resolveDifficultyMultiplier(label?: string | null): number {
  if (!label) return DEFAULT_DIFFICULTY_MULTIPLIER
  return DIFFICULTY_XP_MULTIPLIER[label] ?? DEFAULT_DIFFICULTY_MULTIPLIER
}

// ─── Ingrediente 3: Nota obtenida (ya existente, se mantiene tal cual) ─────
export function qualityBonusFraction(scoreOnTen: number | null | undefined): number {
  if (scoreOnTen == null || !Number.isFinite(scoreOnTen)) return 0
  if (scoreOnTen >= 9) return 1.25
  if (scoreOnTen >= 7) return 0.75
  if (scoreOnTen >= 5) return 0.25
  return 0
}

// ─── Ingrediente 4: Racha (nuevo) ──────────────────────────────────────────
// Curva suavizada con techo (0,5 × (1 − e^(−días/12))) en vez de exponencial
// sin freno: crece rápido los primeros días (motivador desde ya) y se
// aplana según se acerca a +50%, sin disparar el XP con rachas muy largas
// ni convertir perder un día en una catástrofe económica. Verificado contra
// la tabla del documento de diseño: día 1 → +4%, 3 → +11%, 7 → +22%,
// 14 → +34%, 30 → +46%, 60+ → ~+50% (asíntota continua, sin salto brusco).
const STREAK_BONUS_CEILING = 0.5
const STREAK_BONUS_TIME_CONSTANT_DAYS = 12

export function streakBonusFraction(streakDays: number | null | undefined): number {
  const days = Math.max(0, streakDays ?? 0)
  if (days <= 0) return 0
  return STREAK_BONUS_CEILING * (1 - Math.exp(-days / STREAK_BONUS_TIME_CONSTANT_DAYS))
}

export type FirstAttemptXpBreakdown = {
  effortXp: number
  difficultyMultiplier: number
  baseXp: number // Esfuerzo × Dificultad, redondeado
  qualityBonusFraction: number
  qualityBonusXp: number
  streakBonusFraction: number
  streakBonusXp: number
  totalXp: number
}

// XP = (Esfuerzo × Dificultad) × (1 + Bonus_nota) × (1 + Bonus_racha)
export function computeFirstAttemptXp(args: {
  effortXp: number
  difficultyLabel?: string | null
  scoreOnTen?: number | null
  streakDays?: number | null
}): FirstAttemptXpBreakdown {
  const difficultyMultiplier = resolveDifficultyMultiplier(args.difficultyLabel)
  const rawBaseXp = args.effortXp * difficultyMultiplier
  const baseXp = Math.round(rawBaseXp)
  const qFraction = qualityBonusFraction(args.scoreOnTen)
  const sFraction = streakBonusFraction(args.streakDays)
  const afterQuality = Math.round(rawBaseXp * (1 + qFraction))
  const totalXp = Math.round(rawBaseXp * (1 + qFraction) * (1 + sFraction))
  return {
    effortXp: args.effortXp,
    difficultyMultiplier,
    baseXp,
    qualityBonusFraction: qFraction,
    qualityBonusXp: afterQuality - baseXp,
    streakBonusFraction: sFraction,
    streakBonusXp: totalXp - afterQuality,
    totalXp: Math.max(0, totalXp),
  }
}

// ─── Reducción por repetición (ya existente, se mantiene) ─────────────────
// 100% → 50% → 25% → 12,5% → ..., con suelo de REPEAT_XP_MIN.
export const REPEAT_XP_MIN = 1

function reducedXpForGeneration(fullXp: number, repeatGeneration: number): number {
  const halved = Math.floor(fullXp / Math.pow(2, repeatGeneration))
  return Math.max(REPEAT_XP_MIN, halved)
}

// ─── Bonus de mejora (nuevo) ────────────────────────────────────────────
// Siempre compara con el intento INMEDIATAMENTE ANTERIOR (previousScoreOnTen
// ya viene resuelto así por el caller, vía repeated_from_id — nunca con el
// primer intento histórico). g(nota) = (nota/10)^1.8 hace que subir cerca
// del 10 valga más que subir cerca del 5 a igualdad de puntos: el mismo
// punto de diferencia produce un Δg mayor cuanto más arriba está la nota de
// partida. ajuste_nota_final es un ajuste fino sobre la nota final obtenida,
// igual que antes. Verificado contra los 4 ejemplos del documento de diseño
// con XP_referencia_actividad≈40: 6→7≈7XP, 8→9≈9XP (más que 6→7, mismo
// salto de 1 punto, porque está más cerca del techo), 4→8≈27XP, 3→9≈42XP.
const IMPROVEMENT_BONUS_MULTIPLIER = 1.5
const IMPROVEMENT_CURVE_EXPONENT = 1.8

function improvementCurve(scoreOnTen: number): number {
  return Math.pow(Math.max(0, scoreOnTen) / 10, IMPROVEMENT_CURVE_EXPONENT)
}

function computeImprovementBonusXp(args: {
  effortXp: number
  difficultyMultiplier: number
  previousScoreOnTen: number
  newScoreOnTen: number
}): number {
  const deltaG = improvementCurve(args.newScoreOnTen) - improvementCurve(args.previousScoreOnTen)
  if (deltaG <= 0) return 0
  // XP que esta actividad daría en un primer intento con nota 10, antes de
  // racha: (1 + Bonus_nota a nota 10) = 1 + 1.25 = 2.25 — se reutiliza el
  // mismo qualityBonusFraction(10) en vez de hardcodear 2.25 aparte, para
  // que un cambio futuro en los tramos de nota (Ingrediente 3) se propague
  // aquí solo.
  const referenceXp = args.effortXp * args.difficultyMultiplier * (1 + qualityBonusFraction(10))
  const finalScoreAdjustment = 0.7 + 0.3 * (args.newScoreOnTen / 10)
  return Math.round(referenceXp * IMPROVEMENT_BONUS_MULTIPLIER * deltaG * finalScoreAdjustment)
}

// Envoltorio público de computeImprovementBonusXp para previsualizar el
// bonus de mejora con números reales (p.ej. en el desplegable "¿Cómo
// funciona el XP?" de Ayuda) sin pasar por toda la reducción por
// repetición — solo el bonus de mejora en sí, que es lo que ese ejemplo
// visual quiere mostrar.
export function previewImprovementBonusXp(
  effortXp: number,
  difficultyLabel: string | null | undefined,
  previousScoreOnTen: number,
  newScoreOnTen: number,
): number {
  return computeImprovementBonusXp({
    effortXp,
    difficultyMultiplier: resolveDifficultyMultiplier(difficultyLabel),
    previousScoreOnTen,
    newScoreOnTen,
  })
}

export type RepeatImprovementXpBreakdown = {
  asIfFirstAttempt: FirstAttemptXpBreakdown
  repeatGeneration: number
  reducedBaseXp: number
  improvementBonusXp: number
  totalXp: number
  improved: boolean
}

// XP = [(Esfuerzo × Dificultad) × (1 + Bonus_nota) × (1 + Bonus_racha) ×
//       Reducción_repetición] + Bonus_mejora
//
// Si no hay intento anterior registrado (previousScoreOnTen null), el
// documento de diseño dice explícitamente "es la primera vez": se otorga el
// XP completo sin reducción y sin bonus de mejora, exactamente igual que
// computeFirstAttemptXp. Si SÍ hay intento anterior pero la nota nueva no
// mejora, no hay penalización — se mantiene el XP reducido de repetición de
// siempre, solo sin el bonus de mejora encima.
export function computeRepeatImprovementXp(args: {
  effortXp: number
  difficultyLabel?: string | null
  previousScoreOnTen: number | null
  newScoreOnTen: number | null
  streakDays?: number | null
  repeatGeneration: number
}): RepeatImprovementXpBreakdown {
  const asIfFirstAttempt = computeFirstAttemptXp({
    effortXp: args.effortXp,
    difficultyLabel: args.difficultyLabel,
    scoreOnTen: args.newScoreOnTen,
    streakDays: args.streakDays,
  })

  if (args.previousScoreOnTen == null || args.newScoreOnTen == null) {
    return {
      asIfFirstAttempt,
      repeatGeneration: args.repeatGeneration,
      reducedBaseXp: asIfFirstAttempt.totalXp,
      improvementBonusXp: 0,
      totalXp: asIfFirstAttempt.totalXp,
      improved: false,
    }
  }

  const reducedBaseXp = reducedXpForGeneration(asIfFirstAttempt.totalXp, args.repeatGeneration)
  const improvementBonusXp = computeImprovementBonusXp({
    effortXp: args.effortXp,
    difficultyMultiplier: asIfFirstAttempt.difficultyMultiplier,
    previousScoreOnTen: args.previousScoreOnTen,
    newScoreOnTen: args.newScoreOnTen,
  })

  return {
    asIfFirstAttempt,
    repeatGeneration: args.repeatGeneration,
    reducedBaseXp,
    improvementBonusXp,
    totalXp: reducedBaseXp + improvementBonusXp,
    improved: improvementBonusXp > 0,
  }
}
