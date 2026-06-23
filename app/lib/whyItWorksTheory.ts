import { CAMINO_CURRICULUM_TOPICS, SUBJECT_LABELS, subjectSlugFromLabel, type CaminoCurriculumTopic } from './camino/caminoCurriculumPlan'

export interface DetectedConcept {
  conceptSlug: string
  label: string
  step: string
  whyNeeded: string
}

export interface TheoryContextInput {
  subject: string
  community?: string
  year?: number | string | null
  examCall?: string
  exerciseId?: string
  exerciseLabel?: string
  blockSlug?: string
  topicSlug?: string
  subtopicSlugs?: string[]
  exerciseText: string
  officialSolution?: string
  rubric?: string
  concepts?: string[]
}

export interface TheoryContextForExercise {
  blockSlug: string
  topicSlug: string
  blockTitle: string
  topicTitle: string
  theorySummary: string
  relevantFormulas: string[]
  guidedExample: string
  commonMistakes: string[]
  sourceIds: string[]
  detectedConcepts: DetectedConcept[]
  fallbackReason?: string
}

type TopicRule = {
  subject?: string
  blockSlug: string
  topicSlug: string
  keywords: string[]
  concepts: DetectedConcept[]
}

const SAFE_FALLBACK_MESSAGE = 'Todavía no tengo una explicación teórica específica para este tema. Te explico el razonamiento usando la solución del ejercicio.'

const TOPIC_RULES: TopicRule[] = [
  {
    subject: 'matematicas_ccss',
    blockSlug: 'algebra',
    topicSlug: 'sistemas-gauss',
    keywords: ['sistema', 'matriz', 'matrices', 'rango', 'rouche', 'frobenius', 'compatible', 'indeterminado', 'determinado', 'gauss', 'determinante'],
    concepts: [
      {
        conceptSlug: 'gauss',
        label: 'Método de Gauss',
        step: 'Escalonamiento de la matriz o del sistema',
        whyNeeded: 'permite transformar el sistema en otro equivalente y leer soluciones o dependencias entre ecuaciones'
      },
      {
        conceptSlug: 'rouche-frobenius',
        label: 'Teorema de Rouché-Frobenius',
        step: 'Discusión del sistema mediante rangos',
        whyNeeded: 'permite decidir si hay solución única, infinitas soluciones o ninguna comparando rangos'
      }
    ]
  },
  {
    subject: 'matematicas_ii',
    blockSlug: 'algebra',
    topicSlug: 'sistemas-gauss',
    keywords: ['sistema', 'matriz', 'matrices', 'rango', 'rouche', 'frobenius', 'compatible', 'indeterminado', 'determinado', 'gauss', 'determinante'],
    concepts: [
      {
        conceptSlug: 'gauss',
        label: 'Método de Gauss',
        step: 'Operaciones elementales entre filas',
        whyNeeded: 'mantienen sistemas equivalentes y simplifican el cálculo hasta forma escalonada'
      },
      {
        conceptSlug: 'rango',
        label: 'Rango de una matriz',
        step: 'Conteo de filas independientes tras escalonar',
        whyNeeded: 'mide cuántas ecuaciones aportan información real al sistema'
      }
    ]
  },
  {
    blockSlug: 'analisis',
    topicSlug: 'derivadas-optimizacion',
    keywords: ['derivada', 'derivar', 'tangente', 'pendiente', 'crecimiento', 'decrecimiento', 'maximo', 'minimo', 'extremo'],
    concepts: [
      {
        conceptSlug: 'derivada',
        label: 'Derivada',
        step: 'Cálculo de pendiente, crecimiento o extremos',
        whyNeeded: 'traduce la variación instantánea de la función en una condición algebraica'
      }
    ]
  },
  {
    blockSlug: 'analisis',
    topicSlug: 'areas-integrales',
    keywords: ['integral', 'primitiva', 'barrow', 'area', 'área', 'encerrada'],
    concepts: [
      {
        conceptSlug: 'barrow',
        label: 'Regla de Barrow',
        step: 'Cálculo de áreas o acumulación mediante primitivas',
        whyNeeded: 'convierte una integral definida en la diferencia de valores de una primitiva'
      }
    ]
  },
  {
    subject: 'matematicas_ccss',
    blockSlug: 'programacion-lineal',
    topicSlug: 'optimizacion-economica',
    keywords: ['region factible', 'región factible', 'restricciones', 'funcion objetivo', 'función objetivo', 'vertice', 'vértice', 'maximo', 'mínimo', 'beneficio'],
    concepts: [
      {
        conceptSlug: 'programacion-lineal',
        label: 'Programación lineal',
        step: 'Evaluación de la función objetivo en los vértices',
        whyNeeded: 'en una región factible cerrada y acotada, el óptimo de una función lineal se alcanza en un vértice'
      }
    ]
  },
  {
    blockSlug: 'probabilidad',
    topicSlug: 'bayes-tablas-arboles',
    keywords: ['probabilidad condicionada', 'bayes', 'suceso', 'sucesos', 'independiente', 'independientes', 'intersección', 'union', 'unión', 'p('],
    concepts: [
      {
        conceptSlug: 'probabilidad-condicionada',
        label: 'Probabilidad condicionada',
        step: 'Definición de sucesos y cálculo de intersecciones',
        whyNeeded: 'permite traducir frases del enunciado a relaciones entre sucesos antes de operar'
      }
    ]
  },
  {
    subject: 'matematicas_ccss',
    blockSlug: 'estadistica',
    topicSlug: 'intervalos-confianza',
    keywords: ['normal', 'binomial', 'intervalo de confianza', 'confianza', 'proporcion', 'proporción', 'muestra', 'tipificar', 'zα', 'z_'],
    concepts: [
      {
        conceptSlug: 'normal-inferencia',
        label: 'Distribución normal e inferencia',
        step: 'Tipificación o construcción de intervalo de confianza',
        whyNeeded: 'permite comparar una observación con una escala estándar o acotar un parámetro desconocido'
      }
    ]
  },
  {
    subject: 'quimica',
    blockSlug: 'equilibrio',
    topicSlug: 'kc-kp-le-chatelier',
    keywords: ['equilibrio', 'kc', 'kp', 'constante de equilibrio', 'le chatelier', 'concentracion', 'concentración'],
    concepts: [
      {
        conceptSlug: 'equilibrio-quimico',
        label: 'Equilibrio químico',
        step: 'Uso de la constante de equilibrio',
        whyNeeded: 'relaciona las concentraciones de reactivos y productos cuando el sistema ya está en equilibrio'
      }
    ]
  },
  {
    subject: 'lengua',
    blockSlug: 'sintaxis',
    topicSlug: 'subordinadas',
    keywords: ['subordinada', 'sintaxis', 'oracion', 'oración', 'nexo', 'complemento directo', 'sustantiva'],
    concepts: [
      {
        conceptSlug: 'subordinadas',
        label: 'Subordinación',
        step: 'Identificación de la función sintáctica',
        whyNeeded: 'clasifica la proposición por la función que cumple dentro de la oración principal, no solo por su nexo'
      }
    ]
  }
]

export function getTheoryContextForExercise(input: TheoryContextInput): TheoryContextForExercise {
  const subjectSlug = normalizeSubject(input.subject)
  const normalizedText = normalizeSearchText([
    input.exerciseLabel,
    input.exerciseId,
    input.blockSlug,
    input.topicSlug,
    input.exerciseText,
    input.officialSolution,
    input.rubric,
    ...(input.concepts ?? [])
  ].filter(Boolean).join('\n'))

  const mappedRule = findRule(subjectSlug, normalizedText, input)
  const topic = findCurriculumTopic(subjectSlug, mappedRule?.blockSlug ?? input.blockSlug, mappedRule?.topicSlug ?? input.topicSlug, normalizedText)
  const detectedConcepts = mappedRule?.concepts ?? detectConceptsFromText(normalizedText)
  const blockTitle = topic?.blockTitle ?? titleFromSlug(mappedRule?.blockSlug ?? input.blockSlug ?? '')
  const topicTitle = topic?.title ?? titleFromSlug(mappedRule?.topicSlug ?? input.topicSlug ?? '')
  const sourceIds = [
    topic?.source ? `curriculum_topics:${topic.subject}:${topic.blockSlug}:${topic.topicSlug}` : '',
    input.exerciseId ? `exercise:${input.exerciseId}` : '',
    input.rubric ? 'official_rubric' : '',
    input.officialSolution ? 'official_solution' : ''
  ].filter(Boolean)

  return {
    blockSlug: topic?.blockSlug ?? mappedRule?.blockSlug ?? input.blockSlug ?? '',
    topicSlug: topic?.topicSlug ?? mappedRule?.topicSlug ?? input.topicSlug ?? '',
    blockTitle,
    topicTitle,
    theorySummary: compact(topic?.explanation) || fallbackTheorySummary(detectedConcepts, input),
    relevantFormulas: extractRelevantFormulas(topic, input),
    guidedExample: compact(topic?.guidedExample) || '',
    commonMistakes: buildCommonMistakes(detectedConcepts, input),
    sourceIds,
    detectedConcepts,
    fallbackReason: topic ? undefined : SAFE_FALLBACK_MESSAGE
  }
}

export function theoryContextToPrompt(context: TheoryContextForExercise) {
  return `TEMA DETECTADO:
- Bloque: ${context.blockTitle || 'No especificado'} (${context.blockSlug || 'sin-slug'})
- Tema: ${context.topicTitle || 'No especificado'} (${context.topicSlug || 'sin-slug'})

CONCEPTOS DETECTADOS:
${context.detectedConcepts.length ? context.detectedConcepts.map(concept => `- ${concept.label}: ${concept.step}. Justificación: ${concept.whyNeeded}.`).join('\n') : '- No hay conceptos específicos detectados.'}

TEORÍA CURRICULAR RELEVANTE:
${context.theorySummary || SAFE_FALLBACK_MESSAGE}

FÓRMULAS / IDEAS ÚTILES:
${context.relevantFormulas.length ? context.relevantFormulas.map(item => `- ${item}`).join('\n') : '- No hay fórmulas específicas disponibles.'}

EJEMPLO O APUNTE LATEX RELACIONADO:
${context.guidedExample || 'No hay ejemplo LaTeX específico disponible para este tema.'}

ERRORES TÍPICOS A VIGILAR:
${context.commonMistakes.length ? context.commonMistakes.map(item => `- ${item}`).join('\n') : '- Evitar una explicación genérica que no conecte con el ejercicio.'}

FUENTES INTERNAS:
${context.sourceIds.length ? context.sourceIds.map(item => `- ${item}`).join('\n') : '- fallback_local'}`
}

function findRule(subjectSlug: string, normalizedText: string, input: TheoryContextInput) {
  const explicit = TOPIC_RULES.find(rule =>
    (!rule.subject || rule.subject === subjectSlug) &&
    (!input.blockSlug || rule.blockSlug === input.blockSlug) &&
    (!input.topicSlug || rule.topicSlug === input.topicSlug)
  )
  if (explicit) return explicit

  return TOPIC_RULES
    .filter(rule => !rule.subject || rule.subject === subjectSlug || compatibleMathSubject(subjectSlug, rule.subject))
    .map(rule => ({
      rule,
      score: rule.keywords.reduce((total, keyword) => total + (normalizedText.includes(normalizeSearchText(keyword)) ? 1 : 0), 0)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.rule ?? null
}

function findCurriculumTopic(subjectSlug: string, blockSlug: string | undefined | null, topicSlug: string | undefined | null, normalizedText: string) {
  const subjectTopics = CAMINO_CURRICULUM_TOPICS.filter(topic =>
    topic.subject === subjectSlug ||
    topic.compatibleSubjects.includes(subjectSlug) ||
    compatibleMathSubject(subjectSlug, topic.subject)
  )

  return subjectTopics.find(topic => topic.blockSlug === blockSlug && topic.topicSlug === topicSlug)
    ?? subjectTopics.find(topic => topic.topicSlug === topicSlug)
    ?? subjectTopics
      .map(topic => ({
        topic,
        score: [
          topic.title,
          topic.blockTitle,
          topic.topicSlug,
          topic.explanation,
          topic.guidedExample,
          topic.rawLatex
        ].reduce((total, value) => total + keywordOverlap(normalizedText, normalizeSearchText(value)), 0)
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)[0]?.topic
    ?? null
}

function detectConceptsFromText(normalizedText: string) {
  const concepts = TOPIC_RULES
    .filter(rule => rule.keywords.some(keyword => normalizedText.includes(normalizeSearchText(keyword))))
    .flatMap(rule => rule.concepts)
  const seen = new Set<string>()
  return concepts.filter(concept => {
    if (seen.has(concept.conceptSlug)) return false
    seen.add(concept.conceptSlug)
    return true
  })
}

function extractRelevantFormulas(topic: CaminoCurriculumTopic | null, input: TheoryContextInput) {
  const candidates = [
    ...(topic?.rawLatex.match(/\\\([^)]+\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) ?? []),
    ...(topic?.guidedExample.match(/\\\([^)]+\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) ?? []),
    ...(input.officialSolution?.match(/\\\([^)]+\\\)|\$\$[\s\S]*?\$\$|\$[^$\n]+\$/g) ?? [])
  ]
  return unique(candidates.map(compact)).slice(0, 5)
}

function buildCommonMistakes(concepts: DetectedConcept[], input: TheoryContextInput) {
  const base: string[] = concepts.map(concept => {
    if (concept.conceptSlug.includes('gauss') || concept.conceptSlug.includes('rango')) return 'No cambiar el sistema con operaciones que no mantengan ecuaciones equivalentes.'
    if (concept.conceptSlug.includes('barrow')) return 'No confundir primitiva con área: revisa signo, límites y si la función queda por encima o por debajo del eje.'
    if (concept.conceptSlug.includes('derivada')) return 'No usar la derivada sin interpretar qué representa en el enunciado: pendiente, crecimiento o extremo.'
    if (concept.conceptSlug.includes('probabilidad')) return 'No calcular probabilidades sin definir antes los sucesos y la condición.'
    if (concept.conceptSlug.includes('programacion')) return 'No elegir un punto cualquiera: hay que comprobar los vértices de la región factible.'
    return 'No aplicar una definición aislada sin conectarla con el paso concreto del ejercicio.'
  })
  if (input.rubric) base.push('Usar la rúbrica oficial para justificar por qué ese paso suma puntos.')
  return unique(base).slice(0, 4)
}

function fallbackTheorySummary(concepts: DetectedConcept[], input: TheoryContextInput) {
  if (concepts.length) {
    return concepts.map(concept => `${concept.label}: ${concept.whyNeeded}.`).join(' ')
  }
  if (input.officialSolution || input.rubric) {
    return 'No hay apunte curricular específico, pero la solución oficial y la rúbrica permiten justificar el método usado en este ejercicio.'
  }
  return SAFE_FALLBACK_MESSAGE
}

function normalizeSubject(subject: string) {
  if (SUBJECT_LABELS[subject]) return subject
  const lower = normalizeSearchText(subject)
  if (lower.includes('ccss') || lower.includes('sociales')) return 'matematicas_ccss'
  if (lower.includes('matematicas') || lower === 'mates') return 'matematicas_ii'
  if (lower.includes('fisica')) return 'fisica'
  if (lower.includes('quimica')) return 'quimica'
  if (lower.includes('biologia')) return 'biologia'
  if (lower.includes('lengua')) return 'lengua'
  if (lower.includes('historia') && lower.includes('filosofia')) return 'historia_filosofia'
  if (lower.includes('historia')) return 'historia'
  if (lower.includes('ingles')) return 'ingles'
  return subjectSlugFromLabel(subject)
}

function compatibleMathSubject(subjectSlug: string, ruleSubject?: string) {
  return Boolean(ruleSubject && ['matematicas_ii', 'matematicas_ccss'].includes(subjectSlug) && ['matematicas_ii', 'matematicas_ccss'].includes(ruleSubject))
}

function keywordOverlap(text: string, candidate: string) {
  if (!candidate) return 0
  return candidate.split(/\s+/).filter(word => word.length > 4 && text.includes(word)).length
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function titleFromSlug(slug: string) {
  return slug
    ? slug.split(/[-_]/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
    : ''
}

function compact(value: string | undefined | null) {
  return (value ?? '').replace(/\s+/g, ' ').trim()
}

function unique(items: string[]) {
  return Array.from(new Set(items.filter(Boolean)))
}
