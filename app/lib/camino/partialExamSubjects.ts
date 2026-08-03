// Shared subject-name -> slug mapping for parciales, used by both
// injectPartialExamMissions.ts (per-exam mission injection) and
// ensureCaminoCalendar.ts (daily round-robin), so both agree on which
// slug an exam's free-text subject maps to.

export const EXAM_SUBJECT_SLUG: Record<string, string> = {
  'Matemáticas II': 'matematicas_ii',
  'Matemáticas CCSS': 'matematicas_ccss',
  'Historia de España': 'historia_espana',
  'Lengua Castellana': 'lengua',
  'Lengua Castellana y Literatura': 'lengua',
  'Física': 'fisica',
  'Química': 'quimica',
  'Biología': 'biologia',
  'Inglés': 'ingles',
}

export const SIMULACRO_SUBJECT: Record<string, string> = {
  matematicas_ii: 'mates',
  matematicas_ccss: 'matematicas_ccss',
  historia_espana: 'historia',
  lengua: 'lengua',
  fisica: 'fisica',
  quimica: 'quimica',
  biologia: 'biologia',
  ingles: 'ingles',
}

export function examSubjectSlug(subject: string): string {
  return EXAM_SUBJECT_SLUG[subject] ?? subject
}

// Inverso de SIMULACRO_SUBJECT: dado el slug guardado en
// historial_simulacros.asignatura (p.ej. 'mates'), devuelve el slug canónico
// de Camino (p.ej. 'matematicas_ii') para el rollup de camino_subject_xp.
const CAMINO_SUBJECT_FROM_SIMULACRO: Record<string, string> = Object.fromEntries(
  Object.entries(SIMULACRO_SUBJECT).map(([caminoSlug, simulacroSlug]) => [simulacroSlug, caminoSlug]),
)

export function caminoSubjectFromSimulacro(simulacroAsignatura: string): string {
  return CAMINO_SUBJECT_FROM_SIMULACRO[simulacroAsignatura] ?? simulacroAsignatura
}
