// Umbral mínimo de cobertura del Curso para generar el Simulacro de un
// examen (el "método Kairo") -- por defecto es fijo (80%, ver
// MIN_COVERAGE_PCT_FOR_SIMULACRO en injectPartialExamMissions.ts), pero un
// alumno concreto puede desactivar esa protección bajo su propio criterio
// desde Ajustes (perfiles.simulacro_coverage_override_enabled/_pct vía
// /api/profile). Mismo patrón que gradeThreshold.ts: constante de default +
// función resolver, única fuente de verdad para leer el ajuste que aplica.

export const DEFAULT_SIMULACRO_COVERAGE_PCT = 80
export const MIN_SIMULACRO_COVERAGE_OVERRIDE_PCT = 30
export const MAX_SIMULACRO_COVERAGE_OVERRIDE_PCT = 100

export type SimulacroCoverageOverrideConfig = {
  enabled: boolean
  pct: number | null
}

export function clampSimulacroCoveragePct(value: number): number {
  return Math.min(MAX_SIMULACRO_COVERAGE_OVERRIDE_PCT, Math.max(MIN_SIMULACRO_COVERAGE_OVERRIDE_PCT, value))
}

// config=null/enabled=false/pct inválido siempre cae en el 80% fijo -- un
// alumno que nunca toca este ajuste (o cuyo perfil aún no tiene las
// columnas, ej. despliegue tolerante) se comporta exactamente igual que
// antes de que este ajuste existiera.
export function resolveSimulacroCoverageThreshold(config: SimulacroCoverageOverrideConfig | null | undefined): number {
  if (!config?.enabled) return DEFAULT_SIMULACRO_COVERAGE_PCT
  const pct = config.pct
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return DEFAULT_SIMULACRO_COVERAGE_PCT
  return clampSimulacroCoveragePct(pct)
}
