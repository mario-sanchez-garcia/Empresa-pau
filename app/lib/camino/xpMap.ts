// Única fuente de verdad para el XP BASE de cada acción que da XP real en
// Kairo (el garantizado, antes del bonus de calidad que añade awardXp() por
// encima — ver app/lib/camino/awardXp.ts).
//
// Antes existía un TASK_TYPE_XP_MAP duplicado en caminoProgressServer.ts,
// copia exacta y sin usar de MISSION_TASK_XP en caminoCurriculum.ts (ningún
// código llamaba a resolveTaskXp en producción) — se eliminó en vez de
// mantenerlo sincronizado con esto. MISSION_TASK_XP sigue existiendo aparte:
// gobierna el XP *estimado* que se muestra en una misión antes de
// completarla, con un vocabulario de tareas más fino (flashcard,
// ejercicio_corto...); este módulo gobierna el XP *real* que se otorga al
// completar, con el vocabulario más grueso de mission_type/source_type.

export const MISSION_TYPE_XP_DEFAULT = 20

// XP de exámenes/parciales/simulacros proporcional a su duración/esfuerzo
// real frente a una misión normal — antes eran números sueltos sin relación
// con el tiempo real invertido: una misión de ~20-25 min con nota alta podía
// dar hasta 45 XP, mientras que un simulacro completo de ~90 min (el
// equivalente a 3-4 misiones seguidas, bajo condiciones de examen real) solo
// daba 50 de base, apenas más que UNA misión corta. Exámenes tenía el mismo
// problema en miniatura: 20 XP fijos, igual que la misión de referencia más
// corta de Camino, sin reflejar que corregir un ejercicio completo lleva más
// tiempo/esfuerzo que eso.
//
// REFERENCE_MISSION_MINUTES/XP son la misión "típica" de Camino (el slot
// principal de dailyTimeCapacity.ts, ~25 min, XP por defecto de
// resolveMissionTypeXp). xpForDuration() escala esa base linealmente por
// duración y le añade un effortMultiplier > 1: mantener la concentración
// bajo condiciones de examen real durante toda la duración de un simulacro
// (o de una sesión de parcial cronometrada) es más exigente que la misma
// cantidad de minutos repartida en varias misiones cortas con margen para
// pausar entre ellas — sin ese plus, un simulacro largo quedaría exactamente
// IGUAL que la suma de misiones equivalentes, y el objetivo es que quede
// claramente por encima. Un ejercicio de Exámenes es una corrección puntual
// y sin cronómetro — no lleva ese plus de presión sostenida, así que su
// effortMultiplier se queda en 1 y la propia duración (~30-40 min, más que
// una misión corta pero menos que un simulacro entero) ya basta para
// situarlo claramente entre Camino y Simulacro.
//
// El bonus de nota (applyQualityBonus en awardXp.ts) es un multiplicador
// sobre esta base, así que sigue los mismos tramos de siempre pero ya sale
// proporcionalmente mayor en XP absoluto sin tocar esa lógica aparte.
export const REFERENCE_MISSION_MINUTES = 25
export const REFERENCE_MISSION_XP = MISSION_TYPE_XP_DEFAULT

// Duración real aproximada de cada tipo de contenido de examen: un
// simulacro completo replica un examen PAU real (~90 min); una práctica
// parcial es un bloque acotado, bastante más corto; un ejercicio de
// Exámenes es una corrección puntual de ~30-40 min sin cronómetro.
export const SIMULACRO_MINUTES = 90
export const PARCIAL_MINUTES = 45
export const EXAM_CORRECTION_MINUTES = 35

function xpForDuration(minutes: number, effortMultiplier = 1): number {
  return Math.round(REFERENCE_MISSION_XP * (minutes / REFERENCE_MISSION_MINUTES) * effortMultiplier)
}

export const SIMULACRO_COMPLETION_XP = xpForDuration(SIMULACRO_MINUTES, 1.25)
export const PARCIAL_COMPLETION_XP = xpForDuration(PARCIAL_MINUTES, 1.15)
// Sin effortMultiplier (queda en 1, el valor por defecto): ver nota arriba.
export const EXAM_CORRECTION_XP = xpForDuration(EXAM_CORRECTION_MINUTES)
export const FLASHCARD_DECK_COMPLETION_XP = 15
// Otorgado al autor de un mazo público cuando otro alumno lo completa con
// buena nota (ver umbral en el route handler) — recompensa publicar mazos
// que de verdad ayudan, no solo publicar por publicar.
export const FLASHCARD_DECK_AUTHOR_BONUS_XP = 10

// mission_type real de camino_calendar (constraint en la migración
// 20260803120000_widen_camino_calendar_partial_constraints.sql) → XP base
// otorgado al completar. 'partial_practice' nunca pasa por
// resolveMissionTypeXp() en la ruta de otorgamiento real — esas misiones se
// completan desde /api/simulacro con PARCIAL_COMPLETION_XP directamente y
// marcan el calendario aparte (ver markCalendarMissionCompleted.ts, que
// explícitamente NO llama a awardXp para no duplicar el XP de la misma
// entrega) — pero SÍ se lee aquí para la tarjeta de estimación pre-completar
// en Camino, así que tiene que coincidir con PARCIAL_COMPLETION_XP o esa
// tarjeta prometería menos XP del que realmente da la práctica.
export const MISSION_TYPE_XP: Record<string, number> = {
  concept: 20,
  review: 10,
  pau_practice: 30,
  comment_text: 30,
  mock_exam: 50,
  bonus: 10,
  recovery: 10,
  partial_practice: PARCIAL_COMPLETION_XP,
}

export function resolveMissionTypeXp(missionType: string): number {
  return MISSION_TYPE_XP[missionType] ?? MISSION_TYPE_XP_DEFAULT
}
