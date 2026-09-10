// Punto de partida del alumno EN CADA ASIGNATURA.
//
// El generador siempre tuvo cinco modos (`zero`, `first_block`, `mid`,
// `review`, `unknown`), pero:
//
//  1. El finalizador de onboarding enviaba `startMode: 'zero'` fijo, así que
//     los otros cuatro no llegaban a usarse nunca.
//  2. Era UN modo para todo el Camino. Un alumno que llega en abril con
//     Álgebra dominada y Análisis sin empezar necesita cosas distintas en
//     cada asignatura; un único modo global no puede expresar eso.
//  3. `mid` daba por repaso "los dos primeros bloques" en términos absolutos,
//     sin relación con cuántos bloques tiene realmente la asignatura.
//
// Aquí el modo es por asignatura y se traduce a una FRACCIÓN del temario ya
// trabajado en clase, que a su vez decide qué bloques entran como repaso
// express en vez de como concepto nuevo.
//
// Regla que no se negocia: lo declarado NUNCA se marca como completado.
// Entra como repaso —más rápido que ver el tema por primera vez, pero sigue
// dentro del plan y sigue contando en el denominador curricular—. Declarar no
// es demostrar; el alumno se autoevalúa, y la autoevaluación es exactamente
// la señal que el informe pide no confundir con dominio.

export const VALID_START_MODES = ['zero', 'first_block', 'mid', 'review', 'unknown'] as const
export type StartMode = typeof VALID_START_MODES[number]

export function isStartMode(value: unknown): value is StartMode {
  return typeof value === 'string' && (VALID_START_MODES as readonly string[]).includes(value)
}

export function normalizeStartMode(value: unknown): StartMode {
  return isStartMode(value) ? value : 'zero'
}

/**
 * Qué fracción del temario declara el alumno haber trabajado ya en clase.
 *
 * `unknown` se trata como 0 a propósito: si el alumno no sabe por dónde va,
 * la opción segura es programarlo todo. Sobra material que puede ir rápido;
 * falta material que nunca se programó.
 */
const COVERED_FRACTION: Record<StartMode, number> = {
  zero: 0,
  first_block: 0,       // un bloque exacto, ver coveredBlockCount
  mid: 0.5,
  review: 1,
  unknown: 0,
}

/**
 * Cuántos bloques (de los `totalBlocks` de la asignatura) entran como repaso
 * porque el alumno declara haberlos dado ya.
 *
 * Proporcional al temario real de cada asignatura: "voy por la mitad" en una
 * asignatura de 4 bloques y en una de 12 no significan lo mismo.
 */
export function coveredBlockCount(mode: StartMode, totalBlocks: number): number {
  if (totalBlocks <= 0) return 0
  if (mode === 'first_block') return Math.min(1, totalBlocks)
  if (mode === 'review') return totalBlocks
  const fraction = COVERED_FRACTION[mode] ?? 0
  return Math.min(totalBlocks, Math.floor(totalBlocks * fraction))
}

export type QueueItemMetadata = {
  mission_type: 'concept' | 'review'
  topic_slug: string
  express?: true
  beta_sequence?: true
  /** Modo declarado que generó esta fila — deja rastro de POR QUÉ un tema entró como repaso. */
  declared_start_mode?: StartMode
}

/**
 * Metadata de una fila de cola según si su bloque cae dentro de lo que el
 * alumno declaró como ya trabajado.
 */
export function queueMetadataFor(
  mode: StartMode,
  isCoveredBlock: boolean,
  topicSlug: string,
): QueueItemMetadata {
  if (!isCoveredBlock) {
    return mode === 'zero'
      ? { mission_type: 'concept', beta_sequence: true, topic_slug: topicSlug }
      : { mission_type: 'concept', topic_slug: topicSlug, declared_start_mode: mode }
  }
  // Declarado como dado: repaso express, NO completado.
  return { mission_type: 'review', express: true, topic_slug: topicSlug, declared_start_mode: mode }
}

/**
 * Modos por asignatura ya normalizados, con `fallback` para las asignaturas
 * de las que no se declaró nada.
 */
export function resolveStartModes(
  subjects: string[],
  declared: Record<string, unknown> | null | undefined,
  fallback: StartMode = 'zero',
): Record<string, StartMode> {
  const result: Record<string, StartMode> = {}
  for (const subject of subjects) {
    const raw = declared?.[subject]
    result[subject] = isStartMode(raw) ? raw : fallback
  }
  return result
}

/** Texto que ve el alumno en el onboarding, por modo. */
export const START_MODE_LABELS: Record<StartMode, string> = {
  zero: 'Empiezo de cero',
  first_block: 'He empezado el primer bloque',
  mid: 'Voy por la mitad del temario',
  review: 'Lo he dado casi todo, quiero repasar',
  unknown: 'No sabría decirlo',
}

export const START_MODE_HINTS: Record<StartMode, string> = {
  zero: 'Verás todo el temario desde el principio.',
  first_block: 'El primer bloque entrará como repaso rápido.',
  mid: 'La primera mitad entrará como repaso rápido.',
  review: 'Todo el temario entrará como repaso, no como teoría nueva.',
  unknown: 'Lo programamos todo y ajustamos según cómo te vaya.',
}
