import type { PreguntaOpcionalLengua } from '@/app/data/lengua'
import type { ObraLeidaDeclarada } from '@/app/components/camino/LenguaObrasLeidasSelector'

// Mecanismo mínimo, sin cablear todavía a ningún flujo de práctica real (ver
// propuesta-obra-leida-lengua.md — hoy ningún ejercicio tiene `obraSlug`
// poblado, así que esto no cambia nada en producción hasta que ese
// etiquetado exista). `obraSlug` en PreguntaOpcionalLengua guarda
// `lengua_obras_lectura.id` (uuid) — lengua_obras_lectura no tiene una
// columna `slug` propia, el nombre del campo es el que pidió la tarea.
//
// Dos niveles de precisión, de mejor a peor:
//   1. Coincidencia exacta de obra (una vez que un ejercicio tenga
//      `obraSlug`): solo cuenta si el alumno declaró justo ese libro.
//   2. Fallback por periodo: sin `obraSlug`, cualquier ejercicio de "obra
//      leída" cuyo periodo coincida con alguno de los periodos que el
//      alumno ha declarado — todavía es una recomendación razonable, ya que
//      todos los libros de un mismo tramo entran dentro de lo que pregunta
//      el enunciado real (nunca nombra el libro, solo el tramo).
export function filterObraLeidaExercisesForStudent(
  exercises: PreguntaOpcionalLengua[],
  declaradas: ObraLeidaDeclarada[],
): PreguntaOpcionalLengua[] {
  if (declaradas.length === 0) return []

  const declaredObraIds = new Set(declaradas.map(d => d.obraId).filter((id): id is string => Boolean(id)))
  const declaredPeriodos = new Set(declaradas.map(d => d.periodo))

  return exercises.filter(pq => {
    if (pq.grupo !== 'obra') return false
    if (pq.obraSlug) return declaredObraIds.has(pq.obraSlug)
    if (pq.periodo) return declaredPeriodos.has(pq.periodo)
    return false
  })
}
