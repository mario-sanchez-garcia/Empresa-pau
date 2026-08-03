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

export const MISSION_TYPE_XP: Record<string, number> = {
  concept: 20,
  review: 10,
  pau_practice: 30,
  comment_text: 30,
  mock_exam: 50,
  bonus: 10,
  recovery: 10,
}
export const MISSION_TYPE_XP_DEFAULT = 20

export function resolveMissionTypeXp(missionType: string): number {
  return MISSION_TYPE_XP[missionType] ?? MISSION_TYPE_XP_DEFAULT
}

export const EXAM_CORRECTION_XP = 20
export const SIMULACRO_COMPLETION_XP = 50
export const PARCIAL_COMPLETION_XP = 30
