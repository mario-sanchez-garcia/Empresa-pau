// Umbral de nota (0-10) a partir del cual Kairo sugiere "Repetir para
// mejorar" en La Zona/Cursos, Simulacros y Exámenes. Única fuente de verdad
// para leer el umbral que aplica a una asignatura concreta — tanto Ajustes
// como Onboarding escriben este mismo shape (perfiles.grade_threshold_mode/
// grade_threshold/subject_grade_thresholds vía /api/profile).

export const DEFAULT_GRADE_THRESHOLD = 6
export const MIN_GRADE_THRESHOLD = 0
export const MAX_GRADE_THRESHOLD = 10

export type GradeThresholdMode = 'general' | 'per_subject'

export type GradeThresholdConfig = {
  mode: GradeThresholdMode
  general: number | null
  bySubject: Record<string, number>
}

export const DEFAULT_GRADE_THRESHOLD_CONFIG: GradeThresholdConfig = {
  mode: 'general',
  general: null,
  bySubject: {},
}

export function clampGrade(value: number): number {
  return Math.min(MAX_GRADE_THRESHOLD, Math.max(MIN_GRADE_THRESHOLD, value))
}

// subjectSlug: mismo slug normalizado que ya usa el resto de Camino
// (normalizeSubjectSlug) — historia_espana, matematicas_ii, etc.
export function resolveGradeThreshold(config: GradeThresholdConfig | null | undefined, subjectSlug: string): number {
  if (!config) return DEFAULT_GRADE_THRESHOLD
  if (config.mode === 'per_subject') {
    const bySubject = config.bySubject?.[subjectSlug]
    return typeof bySubject === 'number' && Number.isFinite(bySubject) ? bySubject : DEFAULT_GRADE_THRESHOLD
  }
  return typeof config.general === 'number' && Number.isFinite(config.general) ? config.general : DEFAULT_GRADE_THRESHOLD
}

// notaOnTen: nota ya normalizada sobre 10 (ver scoreNormalization.ts para
// convertir desde nota/nota_maxima si hace falta antes de llamar a esto).
export function shouldSuggestRepeat(notaOnTen: number | null | undefined, threshold: number): boolean {
  return typeof notaOnTen === 'number' && Number.isFinite(notaOnTen) && notaOnTen < threshold
}
