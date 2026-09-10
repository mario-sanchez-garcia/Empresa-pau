// Pesos de rotación por asignatura: cuántos turnos EXTRA se gana una
// asignatura por tener un examen cerca.
//
// Vive aquí, y no dentro del componente de calendario, porque era una de las
// entradas que solo tenía el cliente: la vista previa del navegador daba más
// turnos a la asignatura del examen del martes y el servidor no, así que dos
// capas que dicen usar "el mismo motor" lo alimentaban con entradas distintas
// y producían planes distintos.
//
// Puro y sin dependencias: recibe slugs ya normalizados y fechas ISO.

export type ExamRotationPriority = 'baja' | 'normal' | 'alta' | 'muy_alta'

export type RotationExam = {
  /** Slug ya normalizado de la asignatura del examen. */
  subjectSlug: string
  /** Fecha del examen, YYYY-MM-DD. */
  date: string
  priority: ExamRotationPriority
}

/** Días naturales entre dos fechas ISO (b - a). */
function daysBetweenIso(from: string, to: string): number {
  return Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000)
}

export function priorityWeight(priority: ExamRotationPriority): number {
  if (priority === 'muy_alta') return 4
  if (priority === 'alta') return 3
  if (priority === 'normal') return 2
  return 1
}

/**
 * Turnos de rotación que le corresponden a `subjectSlug` en `dateISO`.
 *
 * Base 1 (todas las asignaturas rotan) más un extra acotado por proximidad y
 * prioridad del examen más cercano. El tope existe para que una asignatura
 * nunca se quede con toda la rotación: las demás conservan su turno base.
 */
export function examRotationWeight(
  subjectSlug: string,
  dateISO: string,
  exams: readonly RotationExam[],
): number {
  let extra = 0
  for (const exam of exams) {
    if (exam.subjectSlug !== subjectSlug) continue
    const distance = daysBetweenIso(dateISO, exam.date)
    if (distance < 0 || distance > 21) continue
    const weight = priorityWeight(exam.priority)
    if (distance <= 6) extra = Math.max(extra, weight - 1) // baja:+0, normal:+1, alta:+2, muy_alta:+3
    else if (distance <= 14 && weight >= 3) extra = Math.max(extra, 1)
  }
  return 1 + extra
}

/** Los pesos de todas las asignaturas de golpe, listos para buildPlanDays. */
export function examRotationWeights(
  subjectSlugs: readonly string[],
  dateISO: string,
  exams: readonly RotationExam[],
): Record<string, number> {
  const weights: Record<string, number> = {}
  for (const slug of subjectSlugs) weights[slug] = examRotationWeight(slug, dateISO, exams)
  return weights
}
