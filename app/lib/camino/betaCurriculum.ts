import type { CaminoCurriculumTopic } from './caminoCurriculumPlan'

export const PRIVATE_BETA_SUBJECTS = [
  'matematicas_ii',
  'matematicas_ccss',
  'lengua',
  'historia_espana',
] as const

export type PrivateBetaSubject = typeof PRIVATE_BETA_SUBJECTS[number]

export function isPrivateBetaSubject(subject: string): subject is PrivateBetaSubject {
  return (PRIVATE_BETA_SUBJECTS as readonly string[]).includes(subject)
}

type TopicInput = {
  subject: PrivateBetaSubject
  blockSlug: string
  blockTitle: string
  topicSlug: string
  title: string
  orderIndex: number
  tags: string[]
  prerequisites?: string[]
  minutes?: number
}

function compactLesson(item: TopicInput) {
  const tags = item.tags.slice(0, 4).join(', ')
  return {
    explanation: [
      `Qué es: ${item.title} es una unidad de ${item.blockTitle} que debes reconocer antes de pasar a práctica PAU.`,
      `Para qué sirve: te ayuda a resolver ejercicios donde aparecen ${tags}.`,
      `Cuándo se usa en PAU/EVAU: cuando el enunciado pide explicar, calcular, justificar o redactar una respuesta del bloque ${item.blockTitle}.`,
      `Error típico: aprender el nombre del tema sin conectar el procedimiento con el tipo de pregunta.`,
    ].join('\n\n'),
    guidedExample: `Ejemplo guiado: identifica primero el bloque (${item.blockTitle}), subraya los datos o conceptos clave y escribe una respuesta breve siguiendo el orden: idea principal, desarrollo y comprobación.`,
    practicePrompt: `Ejercicio aplicado: resuelve una práctica corta sobre ${item.title}. Explica el procedimiento y justifica cada paso para que Pausia pueda corregirte.`,
    rawLatex: '',
  }
}

function topic(input: TopicInput): CaminoCurriculumTopic {
  const lesson = compactLesson(input)
  return {
    ...input,
    contentStatus: 'latex_notes',
    ...lesson,
    evauPracticeQuery: {
      subject: input.subject === 'matematicas_ii' ? 'mates' : input.subject === 'lengua' ? 'lengua' : input.subject,
      block: input.blockSlug,
      topic: input.topicSlug,
    },
    appliedExercise: `Resuelve una actividad aplicada de ${input.title} y escribe una justificación clara. No basta con dar el resultado: explica por qué usas cada paso.`,
    referenceSolution: `Una respuesta válida identifica el tipo de ejercicio, aplica el método propio de ${input.blockTitle}, justifica los pasos y revisa el resultado final.`,
    commonMistakes: [
      'Saltar directamente al resultado sin explicar el procedimiento.',
      'Confundir el bloque del tema con otro parecido.',
      'No comprobar si la respuesta encaja con el enunciado PAU.',
    ],
    progressCriteria: {
      seen: 'El alumno abre la explicación del curso.',
      practiced: 'El alumno entrega el ejercicio aplicado.',
      completed: 'El ejercicio aplicado queda corregido con Pausia.',
      mastered: 'El alumno completa ejercicio aplicado y PAU/EVAU del mismo tema con nota suficiente.',
    },
    examTags: input.tags,
    estimatedMinutes: input.minutes ?? 25,
    source: 'private_beta_latex_pack',
    compatibleSubjects: [input.subject],
    v2SortOrder: input.orderIndex,
  }
}

export const PRIVATE_BETA_CURRICULUM_TOPICS: CaminoCurriculumTopic[] = [
  topic({ subject: 'matematicas_ii', orderIndex: 1, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'matrices-operaciones', title: 'Matrices y operaciones básicas', tags: ['matrices', 'operaciones', 'producto', 'inversa'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 2, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'determinantes-inversa-rango', title: 'Determinantes, inversa y rango', tags: ['determinantes', 'Sarrus', 'inversa', 'rango'], prerequisites: ['matrices-operaciones'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 3, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'sistemas-gauss-rouche', title: 'Sistemas, Gauss y Rouché-Frobenius', tags: ['sistemas', 'Gauss', 'Rouché-Frobenius', 'parámetros'], prerequisites: ['determinantes-inversa-rango'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 4, blockSlug: 'geometria-3d', blockTitle: 'Geometría', topicSlug: 'vectores-productos', title: 'Vectores, producto escalar y vectorial', tags: ['vectores', 'producto escalar', 'producto vectorial', 'perpendicularidad'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 5, blockSlug: 'geometria-3d', blockTitle: 'Geometría', topicSlug: 'rectas-planos-posiciones', title: 'Rectas, planos y posiciones relativas', tags: ['rectas', 'planos', 'intersección', 'posición relativa'], prerequisites: ['vectores-productos'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 6, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'limites-continuidad-asintotas', title: 'Límites, continuidad y asíntotas', tags: ['límites', 'continuidad', 'asíntotas', 'indeterminaciones'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 7, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'derivadas-tangente-optimizacion', title: 'Derivadas, tangente y optimización', tags: ['derivadas', 'recta tangente', 'Rolle', 'optimización'], prerequisites: ['limites-continuidad-asintotas'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 8, blockSlug: 'integrales', blockTitle: 'Integrales', topicSlug: 'primitivas-barrow-areas', title: 'Primitivas, Barrow y áreas', tags: ['integrales', 'primitivas', 'Barrow', 'áreas'], prerequisites: ['derivadas-tangente-optimizacion'] }),
  topic({ subject: 'matematicas_ii', orderIndex: 9, blockSlug: 'probabilidad', blockTitle: 'Probabilidad', topicSlug: 'condicionada-total-bayes-binomial-normal', title: 'Condicionada, total, Bayes, binomial y normal', tags: ['condicionada', 'total', 'Bayes', 'binomial', 'normal'] }),

  topic({ subject: 'matematicas_ccss', orderIndex: 1, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'matrices-sistemas-gauss', title: 'Matrices, sistemas y Gauss', tags: ['matrices', 'sistemas', 'Gauss', 'inversa'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 2, blockSlug: 'algebra', blockTitle: 'Álgebra', topicSlug: 'programacion-lineal', title: 'Programación lineal', tags: ['restricciones', 'región factible', 'función objetivo', 'optimización'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 3, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'limites-asintotas-continuidad', title: 'Límites, asíntotas y continuidad', tags: ['límites', 'asíntotas', 'continuidad', 'funciones a trozos'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 4, blockSlug: 'analisis', blockTitle: 'Análisis', topicSlug: 'derivadas-optimizacion-economica', title: 'Derivadas y optimización económica', tags: ['derivadas', 'costes', 'ingresos', 'beneficios', 'inflexión'], prerequisites: ['limites-asintotas-continuidad'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 5, blockSlug: 'probabilidad', blockTitle: 'Probabilidad', topicSlug: 'sucesos-tablas-bayes', title: 'Sucesos, tablas, árboles y Bayes', tags: ['Laplace', 'condicionada', 'árboles', 'Bayes'] }),
  topic({ subject: 'matematicas_ccss', orderIndex: 6, blockSlug: 'inferencia', blockTitle: 'Inferencia', topicSlug: 'intervalos-confianza-contrastes', title: 'Intervalos de confianza y contraste', tags: ['muestra', 'proporciones', 'error máximo', 'contraste'] }),

  topic({ subject: 'lengua', orderIndex: 1, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'organizacion-ideas', title: 'Organización de ideas', tags: ['estructura', 'tesis', 'argumentos', 'partes'] }),
  topic({ subject: 'lengua', orderIndex: 2, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'tema-resumen', title: 'Tema y resumen', tags: ['tema', 'resumen', 'objetividad', 'síntesis'] }),
  topic({ subject: 'lengua', orderIndex: 3, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'comentario-critico', title: 'Comentario crítico', tags: ['tesis propia', 'argumentación', 'conectores', 'valoración'] }),
  topic({ subject: 'lengua', orderIndex: 4, blockSlug: 'comentario-texto-pau', blockTitle: 'Comentario de texto PAU', topicSlug: 'adecuacion-coherencia-cohesion', title: 'Adecuación, coherencia y cohesión', tags: ['registro', 'progresión', 'cohesión', 'marcadores'] }),
  topic({ subject: 'lengua', orderIndex: 5, blockSlug: 'gramatica-lexico', blockTitle: 'Gramática y léxico', topicSlug: 'valores-se', title: 'Valores de SE', tags: ['se reflexivo', 'pasiva refleja', 'impersonal', 'dativo'] }),
  topic({ subject: 'lengua', orderIndex: 6, blockSlug: 'gramatica-lexico', blockTitle: 'Gramática y léxico', topicSlug: 'oracion-compuesta', title: 'Oración compuesta', tags: ['subordinadas', 'coordinadas', 'nexos', 'funciones'] }),
  topic({ subject: 'lengua', orderIndex: 7, blockSlug: 'literatura', blockTitle: 'Literatura', topicSlug: 'modernismo-generacion-98', title: 'Modernismo y Generación del 98', tags: ['Modernismo', '98', 'Rubén Darío', 'Unamuno'] }),
  topic({ subject: 'lengua', orderIndex: 8, blockSlug: 'literatura', blockTitle: 'Literatura', topicSlug: 'vanguardias-generacion-27', title: 'Vanguardias y Generación del 27', tags: ['vanguardias', 'Generación del 27', 'Lorca', 'poesía'] }),

  topic({ subject: 'historia_espana', orderIndex: 1, blockSlug: 'raices-historicas', blockTitle: 'Raíces históricas', topicSlug: 'origenes-reino-visigodo', title: 'De los orígenes al reino visigodo', tags: ['prehistoria', 'romanización', 'visigodos', 'pueblos prerromanos'] }),
  topic({ subject: 'historia_espana', orderIndex: 2, blockSlug: 'edad-media', blockTitle: 'Edad Media', topicSlug: 'edad-media-peninsular', title: 'La Península en la Edad Media', tags: ['Al-Ándalus', 'reinos cristianos', 'taifas', 'Reconquista'] }),
  topic({ subject: 'historia_espana', orderIndex: 3, blockSlug: 'edad-moderna', blockTitle: 'Edad Moderna', topicSlug: 'edad-moderna', title: 'España en la Edad Moderna', tags: ['Reyes Católicos', 'Austrias', 'Borbones', 'América'] }),
  topic({ subject: 'historia_espana', orderIndex: 4, blockSlug: 'crisis-antiguo-regimen', blockTitle: 'Crisis del Antiguo Régimen', topicSlug: 'crisis-antiguo-regimen', title: 'La crisis del Antiguo Régimen en España', tags: ['1808', 'Guerra de Independencia', 'Cádiz', 'Fernando VII'] }),
  topic({ subject: 'historia_espana', orderIndex: 5, blockSlug: 'estado-liberal', blockTitle: 'Estado liberal', topicSlug: 'construccion-estado-liberal', title: 'La construcción del Estado liberal', tags: ['Isabel II', 'carlismo', 'moderados', 'progresistas'] }),
  topic({ subject: 'historia_espana', orderIndex: 6, blockSlug: 'restauracion', blockTitle: 'Restauración', topicSlug: 'restauracion', title: 'El régimen de la Restauración', tags: ['Cánovas', 'turnismo', 'caciquismo', 'Constitución de 1876'] }),
  topic({ subject: 'historia_espana', orderIndex: 7, blockSlug: 'siglo-xx', blockTitle: 'Siglo XX', topicSlug: 'segunda-republica', title: 'La II República', tags: ['Constitución de 1931', 'reformas', 'Azaña', 'conflicto social'] }),
  topic({ subject: 'historia_espana', orderIndex: 8, blockSlug: 'siglo-xx', blockTitle: 'Siglo XX', topicSlug: 'guerra-civil', title: 'La Guerra Civil', tags: ['sublevación', 'bandos', 'no intervención', 'consecuencias'] }),
  topic({ subject: 'historia_espana', orderIndex: 9, blockSlug: 'franquismo-democracia', blockTitle: 'Franquismo y democracia', topicSlug: 'franquismo', title: 'El franquismo', tags: ['dictadura', 'autarquía', 'desarrollismo', 'oposición'] }),
  topic({ subject: 'historia_espana', orderIndex: 10, blockSlug: 'franquismo-democracia', blockTitle: 'Franquismo y democracia', topicSlug: 'transicion-democracia', title: 'La Transición y la Constitución de 1978', tags: ['Transición', 'Constitución de 1978', 'autonomías', 'democracia'] }),
].map(item => ({
  ...item,
  orderIndex: item.subject === 'matematicas_ii'
    ? item.orderIndex
    : item.orderIndex + subjectOffset(item.subject as PrivateBetaSubject),
}))

function subjectOffset(subject: PrivateBetaSubject) {
  if (subject === 'matematicas_ccss') return 1000
  if (subject === 'lengua') return 2000
  if (subject === 'historia_espana') return 3000
  return 0
}
