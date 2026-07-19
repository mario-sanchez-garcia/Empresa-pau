// Maps display names (AI-generated or human-readable) → canonical rawTheme keys
// used by generatePracticeSession and the question bank.
// Lookup is case-insensitive via lowercased keys; unknown values pass through unchanged.
const LOWER_TO_RAW: Record<string, string> = {
  // mates
  'álgebra': 'Algebra', 'algebra': 'Algebra',
  'análisis': 'Analisis', 'analisis': 'Analisis',
  'análisis matemático': 'Analisis', 'analisis matematico': 'Analisis',
  'geometría': 'Geometria', 'geometria': 'Geometria',
  'probabilidad': 'Probabilidad',
  'probabilidad y estadística': 'Probabilidad', 'probabilidad y estadistica': 'Probabilidad',
  // matematicas_ccss (raw keys already in "Ejercicio N" form — kept for identity)
  'ejercicio 1': 'Ejercicio 1', 'ejercicio 2': 'Ejercicio 2',
  'ejercicio 3': 'Ejercicio 3', 'ejercicio 4': 'Ejercicio 4',
  'ejercicio 5': 'Ejercicio 5',
  'estadística': 'Estadistica', 'estadistica': 'Estadistica',
  // fisica
  'gravitación': 'Gravitacion', 'gravitacion': 'Gravitacion',
  'ondas': 'Ondas',
  'electricidad': 'Electricidad',
  'óptica': 'Optica', 'optica': 'Optica',
  'radioactividad moderna': 'RadioactividadModerna',
  'radioactividadmoderna': 'RadioactividadModerna',
  'radioactividad y física moderna': 'RadioactividadModerna',
  // quimica / biologia
  'pregunta 1': 'Pregunta1', 'pregunta1': 'Pregunta1',
  'pregunta 2': 'Pregunta2', 'pregunta2': 'Pregunta2',
  'pregunta 3': 'Pregunta3', 'pregunta3': 'Pregunta3',
  'pregunta 4': 'Pregunta4', 'pregunta4': 'Pregunta4',
  'pregunta 5': 'Pregunta5', 'pregunta5': 'Pregunta5',
  // ingles
  'reading: true / false': 'Q1', 'q1': 'Q1',
  'reading comprehension': 'Q2', 'q2': 'Q2',
  'vocabulary': 'Q3', 'q3': 'Q3',
  'use of english': 'Q4', 'q4': 'Q4',
  'writing': 'Q5', 'q5': 'Q5',
  // lengua
  'comunicación': 'Comunicacion', 'comunicacion': 'Comunicacion',
  'reflexión sobre la lengua': 'ReflexionLengua', 'reflexion sobre la lengua': 'ReflexionLengua',
  'reflexionlengua': 'ReflexionLengua',
  'educación literaria': 'EducacionLiteraria', 'educacion literaria': 'EducacionLiteraria',
  'educacionliteraria': 'EducacionLiteraria',
  // historia (raw keys are lowercase)
  'cuestiones': 'cuestiones',
  'fuente 1': 'fuente1', 'fuente1': 'fuente1',
  'fuente 2': 'fuente2', 'fuente2': 'fuente2',
  'fuente': 'fuente',
  'tema': 'tema',
  'texto': 'texto',
}

export function normalizeBlockKey(displayName: string): string {
  if (!displayName) return displayName
  return LOWER_TO_RAW[displayName.toLowerCase().trim()] ?? displayName
}
