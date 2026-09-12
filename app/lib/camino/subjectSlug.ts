// El espacio de claves canónico de las asignaturas. Sin dependencias.
//
// Existe porque la app maneja DOS formas de nombrar lo mismo y las mezcla en
// las fronteras: el alumno ve etiquetas humanas ("Física", "Historia de
// España") y la base de datos guarda slugs ("fisica", "historia_espana").
// Mientras cada capa se quede en su forma no pasa nada; el problema aparece
// cuando dos capas se cruzan y una busca con slug en un objeto indexado por
// etiqueta. Entonces no hay error: hay un `undefined` que se convierte en
// valor por defecto, y el sistema sigue funcionando con el dato equivocado.
//
// Eso ya ocurrió, y costó caro: el punto de partida declarado en onboarding se
// guardaba con claves humanas y `generateCaminoPlan` lo consultaba con slugs,
// así que TODOS los alumnos se planificaban como si empezaran de cero — y
// `student_block_knowledge` se quedaba vacía para siempre, porque su primera
// fila depende de una declaración que nunca llegaba a marcarse.
//
// Vive aparte de caminoCurriculumPlan.ts a propósito: aquel importa el seed
// del temario vía alias `@/app/...`, que no resuelve en los tests que corren
// con node a secas. Separarlo permite que cualquier módulo puro —startingPoint
// entre ellos— normalice sin arrastrar el temario entero.

export const SUBJECT_LABELS: Record<string, string> = {
  matematicas_ii: 'Matemáticas II',
  matematicas_ccss: 'Matemáticas CCSS',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
  lengua: 'Lengua Castellana',
  historia_espana: 'Historia de España',
  historia: 'Historia de España',
  historia_filosofia: 'Historia de la Filosofía',
  ingles: 'Inglés',
  llengua_catalana: 'Llengua Catalana',
}

export const SUBJECT_SLUG_BY_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(SUBJECT_LABELS).map(([slug, label]) => [label, slug])
)

export function subjectLabelFromSlug(subject: string) {
  return SUBJECT_LABELS[subject] ?? subject
}

/**
 * Forma canónica de una asignatura, venga como venga: etiqueta con acentos,
 * slug ya normalizado, o alias histórico.
 *
 * Idempotente — normalizar dos veces da lo mismo que una — que es lo que
 * permite usarla en los DOS lados de una búsqueda sin saber en qué forma
 * llega cada uno.
 */
export function normalizeSubjectSlug(subject?: string | null) {
  const slug = (subject ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')

  if (slug === 'mates' || slug === 'matematicas' || slug === 'matematicas_ii') return 'matematicas_ii'
  if (
    slug === 'matematicas_ccss' ||
    slug === 'matematicas_sociales' ||
    slug === 'matematicas_aplicadas_ccss' ||
    slug === 'matematicas_aplicadas_a_las_ciencias_sociales'
  ) return 'matematicas_ccss'
  if (slug === 'fisica') return 'fisica'
  if (slug === 'quimica') return 'quimica'
  if (slug === 'biologia') return 'biologia'
  if (slug === 'lengua' || slug === 'lengua_castellana' || slug === 'lengua_castellana_y_literatura' || slug === 'lengua_castellana_literatura') return 'lengua'
  if (slug === 'historia' || slug === 'historia_de_espana' || slug === 'historia_espana') return 'historia_espana'
  if (slug === 'filosofia' || slug === 'historia_filosofia' || slug === 'historia_de_la_filosofia') return 'historia_filosofia'
  if (slug === 'ingles' || slug === 'english') return 'ingles'
  if (slug === 'llengua_catalana') return 'llengua_catalana'

  return SUBJECT_SLUG_BY_LABEL[subject ?? ''] ?? slug
}

export function subjectSlugFromLabel(label: string) {
  return normalizeSubjectSlug(label)
}
