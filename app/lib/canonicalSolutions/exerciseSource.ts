import { examenes } from '../../data/examenes.ts'

export type ExerciseLookupResult = {
  exerciseId: string
  subject: string
  enunciado: string
  officialSolution: string | null
  rubric: string | null
}

// Pieza 2 arranca solo con Matemáticas II (ver docs/principio-canonical-
// solutions-2026-09-05.md, fase 3). El banco de app/data/examenes.ts no
// guarda un texto de "solución oficial" separado del enunciado — cada
// pregunta solo tiene `enunciado` y `criterios` (la rúbrica del modelo
// oficial, casi siempre genérica: "Se valorará el planteamiento correcto...").
// No hay ningún campo de respuesta resuelta que copiar: Claude resuelve el
// ejercicio él mismo a partir del enunciado, apoyándose en la rúbrica.
// official_solution queda null a propósito para Matemáticas II.
export function findMatematicasIIExercise(exerciseId: string): ExerciseLookupResult | null {
  for (const exam of examenes) {
    if (exam.asignatura !== 'Matemáticas II') continue
    const pregunta = exam.preguntas?.find(p => p.id === exerciseId)
    if (pregunta) {
      return {
        exerciseId,
        subject: 'Matemáticas II',
        enunciado: pregunta.enunciado,
        officialSolution: null,
        rubric: pregunta.criterios ?? null,
      }
    }
  }
  return null
}
