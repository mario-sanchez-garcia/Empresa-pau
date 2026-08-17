import curriculumSeed from '@/app/data/camino/curriculum_seed.json'
import { PRIVATE_BETA_CURRICULUM_TOPICS } from './betaCurriculum'

export type CaminoMissionType =
  | 'concept_explanation'
  | 'guided_example'
  | 'guided_practice'
  | 'evau_practice'
  | 'error_review'
  | 'exam_focus'
  | 'mock_exam'

export type CaminoContentStatus = 'latex_notes' | 'itinerary_only' | 'flashcard_v2'

export interface CaminoEvauPracticeQuery {
  subject: string
  block: string
  topic: string
}

export interface CaminoCurriculumTopic {
  subject: string
  blockSlug: string
  blockTitle: string
  topicSlug: string
  title: string
  orderIndex: number
  contentStatus: CaminoContentStatus
  explanation: string
  guidedExample: string
  practicePrompt: string
  rawLatex: string
  appliedExercise?: string
  referenceSolution?: string
  commonMistakes?: string[]
  progressCriteria?: {
    seen: string
    practiced: string
    completed: string
    mastered: string
  }
  examTags?: string[]
  estimatedMinutes?: number
  evauPracticeQuery: CaminoEvauPracticeQuery
  source: string
  compatibleSubjects: string[]
  v2SortOrder?: number
}

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

export const CAMINO_CURRICULUM_TOPICS = [
  ...(curriculumSeed as CaminoCurriculumTopic[]),
  ...PRIVATE_BETA_CURRICULUM_TOPICS,
]
  .slice()
  .sort((a, b) => a.subject.localeCompare(b.subject) || a.orderIndex - b.orderIndex)

export function subjectLabelFromSlug(subject: string) {
  return SUBJECT_LABELS[subject] ?? subject
}

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

export function normalizeTopicSlug(value?: string | null) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\$\\cdot\$/g, ' ')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\cdot|cdot|[·∙⋅×]/g, ' ')
    .replace(/\\times|times/g, ' ')
    .replace(/\\[a-z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeCaminoSlug(value?: string | null) {
  return normalizeTopicSlug(value)
}

export function sanitizeLessonTitle(value?: string | null) {
  return (value ?? '')
    .replace(/\\vec\{([^{}]*)\}/g, (_match, inner) => `${inner}⃗`)
    .replace(/\$\\cdot\$/g, '·')
    .replace(/\$([^$]*?)\\cdot([^$]*?)\$/g, (_match, left, right) => `${left.trim()} · ${right.trim()}`.trim())
    .replace(/\\cdot|cdot/g, '·')
    .replace(/\\times|times/g, '×')
    // Red de seguridad: desenvuelve cualquier macro LaTeX restante (p.ej. \mathbb{R} → R)
    // ya que este título se muestra como texto plano, no vía KaTeX.
    .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
    .replace(/\$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sanitizeSlugSource(value?: string | null) {
  return sanitizeLessonTitle(value)
}

const TOPIC_ALIASES: Record<string, string> = {
  'matematicas_ii:algebra:matrices-y-operaciones-basicas': 'matrices-operaciones',
  'matematicas_ii:algebra:dimension-de-una-matriz': 'matrices-operaciones',
  'matematicas_ii:algebra:suma-y-resta-de-matrices': 'matrices-operaciones',
  'matematicas_ii:algebra:producto-por-un-escalar': 'producto-por-un-escalar',
  'matematicas_ii:algebra:producto-por-un-escalar-numero-matriz': 'producto-por-un-escalar',
  'matematicas_ii:algebra:producto-por-un-escalar-numero-cdot-matriz': 'producto-por-un-escalar',
  'matematicas_ii:algebra:multiplicacion-de-matrices': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra:multiplicacion-de-matrices-a-b': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra:multiplicacion-de-matrices-a-cdot-b': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra-lineal:matrices-operaciones': 'matrices-operaciones',
  'matematicas_ii:algebra-lineal:matrices-y-operaciones-basicas': 'matrices-operaciones',
  'matematicas_ii:algebra-lineal:dimension-de-una-matriz': 'matrices-operaciones',
  'matematicas_ii:algebra-lineal:suma-y-resta-de-matrices': 'matrices-operaciones',
  'matematicas_ii:algebra-lineal:producto-por-un-escalar': 'producto-por-un-escalar',
  'matematicas_ii:algebra-lineal:producto-por-un-escalar-numero-matriz': 'producto-por-un-escalar',
  'matematicas_ii:algebra-lineal:producto-por-un-escalar-numero-cdot-matriz': 'producto-por-un-escalar',
  'matematicas_ii:algebra-lineal:multiplicacion-de-matrices': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra-lineal:multiplicacion-de-matrices-a-b': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra-lineal:multiplicacion-de-matrices-a-cdot-b': 'multiplicacion-de-matrices',
  'matematicas_ii:algebra-lineal:matriz-inversa-por-gauss-jordan': 'determinantes-inversa-rango',
  'matematicas_ii:algebra-lineal:determinantes-inversa-rango': 'determinantes-inversa-rango',
  'matematicas_ii:algebra-lineal:rango-de-una-matriz-metodo-de-gauss': 'determinantes-inversa-rango',
  'matematicas_ii:algebra-lineal:sistemas-gauss': 'sistemas-gauss-rouche',
  'matematicas_ii:analisis:limites-continuidad': 'limites-continuidad-asintotas',
  'matematicas_ii:analisis:derivadas-optimizacion': 'derivadas-tangente-optimizacion',
  'matematicas_ii:integrales:areas-integrales': 'primitivas-barrow-areas',
  'matematicas_ccss:algebra-lineal:dimension-de-una-matriz': 'matrices-sistemas-gauss',
  'matematicas_ccss:algebra-lineal:sistemas-gauss': 'matrices-sistemas-gauss',
  'historia_espana:prehistoria-y-edad-antigua:prehistoria-y-edad-antigua': 'origenes-reino-visigodo',
  'historia_espana:al-andalus:al-andalus': 'edad-media-peninsular',
  'historia_espana:reinos-medievales-cristianos:reinos-medievales-cristianos': 'edad-media-peninsular',
  'historia_espana:los-reyes-catolicos:los-reyes-catolicos': 'edad-moderna',
  'historia_espana:el-imperio-de-los-austrias:el-imperio-de-los-austrias': 'edad-moderna',
  'historia_espana:el-siglo-xviii-los-borbones:el-siglo-xviii-los-borbones': 'edad-moderna',
  'historia_espana:crisis-del-antiguo-regimen-y-liberalismo:crisis-del-antiguo-regimen-y-liberalismo': 'crisis-antiguo-regimen',
  'historia_espana:la-restauracion:la-restauracion': 'restauracion',
  'historia_espana:crisis-de-la-restauracion-y-la-dictadura:crisis-de-la-restauracion-y-la-dictadura': 'restauracion',
  'historia_espana:la-segunda-republica:la-segunda-republica': 'segunda-republica',
  'historia_espana:la-guerra-civil:la-guerra-civil': 'guerra-civil',
  'historia_espana:la-dictadura-franquista:la-dictadura-franquista': 'franquismo',
  'historia_espana:la-transicion-y-la-democracia:la-transicion-y-la-democracia': 'transicion-democracia',
}

function aliasTopicSlug(subjectSlug: string, blockSlug: string, topicSlug: string) {
  const key = `${subjectSlug}:${blockSlug}:${topicSlug}`
  return TOPIC_ALIASES[key] ?? TOPIC_ALIASES[`${subjectSlug}:${blockSlug}:${normalizeTopicSlug(topicSlug)}`] ?? null
}

export function resolveTopicSlugAlias(subjectSlug: string, blockSlug: string, topicSlug: string) {
  return aliasTopicSlug(normalizeSubjectSlug(subjectSlug), normalizeTopicSlug(blockSlug), normalizeTopicSlug(topicSlug)) ?? normalizeTopicSlug(topicSlug)
}

export function resolveCaminoTopic(input: { subjectSlug: string; blockSlug: string; topicSlug: string }) {
  const subjectSlug = normalizeSubjectSlug(input.subjectSlug)
  const normalizedBlockSlug = normalizeTopicSlug(input.blockSlug)
  const normalizedTopicSlug = normalizeTopicSlug(input.topicSlug)
  const inSubjectBlock = CAMINO_CURRICULUM_TOPICS.filter(t =>
    t.subject === subjectSlug && normalizeTopicSlug(t.blockSlug) === normalizedBlockSlug
  )

  const exact = inSubjectBlock.find(t => normalizeTopicSlug(t.topicSlug) === normalizedTopicSlug)
  if (exact) return { topic: exact, matchedBy: 'exact' as const, resolvedTopicSlug: exact.topicSlug }

  const aliasedSlug = aliasTopicSlug(subjectSlug, normalizedBlockSlug, normalizedTopicSlug)
  if (aliasedSlug) {
    const aliased = CAMINO_CURRICULUM_TOPICS.find(t =>
      t.subject === subjectSlug && normalizeTopicSlug(t.topicSlug) === normalizeTopicSlug(aliasedSlug)
    )
    if (aliased) return { topic: aliased, matchedBy: 'alias' as const, resolvedTopicSlug: aliased.topicSlug }
  }

  const inSubject = CAMINO_CURRICULUM_TOPICS.filter(t => t.subject === subjectSlug)
  const topicMatch = inSubject.find(t =>
    normalizeTopicSlug(t.topicSlug) === normalizedTopicSlug ||
    normalizeTopicSlug(t.title) === normalizedTopicSlug
  )
  if (topicMatch) return { topic: topicMatch, matchedBy: 'topic' as const, resolvedTopicSlug: topicMatch.topicSlug }

  const blockAsTopic = inSubject.find(t =>
    normalizeTopicSlug(t.topicSlug) === normalizedBlockSlug ||
    normalizeTopicSlug(t.title) === normalizedBlockSlug
  )
  if (blockAsTopic) return { topic: blockAsTopic, matchedBy: 'block-as-topic' as const, resolvedTopicSlug: blockAsTopic.topicSlug }

  const blockFallback = inSubject.find(t =>
    normalizeTopicSlug(t.blockSlug) === normalizedBlockSlug ||
    normalizeTopicSlug(t.blockTitle) === normalizedBlockSlug
  )
  if (blockFallback) return { topic: blockFallback, matchedBy: 'block' as const, resolvedTopicSlug: blockFallback.topicSlug }

  return { topic: null, matchedBy: 'missing' as const, resolvedTopicSlug: normalizedTopicSlug }
}

export function getCurriculumForSubject(subject: string) {
  const subjectSlug = normalizeSubjectSlug(subject)
  return CAMINO_CURRICULUM_TOPICS
    .filter(topic => topic.subject === subjectSlug || topic.compatibleSubjects.includes(subjectSlug))
    .filter(topic => subjectSlug !== 'matematicas_ccss' || topic.blockSlug !== 'geometria-3d')
    .sort((a, b) => a.orderIndex - b.orderIndex)
}

export function getCurriculumForSubjects(subjectLabels: string[]) {
  const seen = new Set<string>()
  return subjectLabels.flatMap(label => getCurriculumForSubject(label)).filter(topic => {
    const key = `${topic.subject}:${topic.blockSlug}:${topic.topicSlug}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function getTopic(subject: string, blockSlug: string, topicSlug: string) {
  return resolveCaminoTopic({ subjectSlug: subject, blockSlug, topicSlug }).topic
}

export function getTopicByV2SortOrder(subject: string, sortOrder?: number | null) {
  if (sortOrder == null) return null
  const subjectSlug = normalizeSubjectSlug(subject)
  return CAMINO_CURRICULUM_TOPICS.find(topic =>
    topic.subject === subjectSlug && topic.v2SortOrder === sortOrder
  ) ?? null
}

export function buildTopicHref(topic: Pick<CaminoCurriculumTopic, 'subject' | 'blockSlug' | 'topicSlug'>) {
  return `/camino-pau/curso/${topic.subject}/${topic.blockSlug}/${topic.topicSlug}`
}

export function buildEvauHref(topic: CaminoCurriculumTopic) {
  const q = topic.evauPracticeQuery
  return `/examenes?subject=${encodeURIComponent(q.subject)}&block=${encodeURIComponent(q.block)}&topic=${encodeURIComponent(q.topic)}&mode=random&source=camino`
}

export function hasLatexContent(topic: CaminoCurriculumTopic) {
  return topic.contentStatus === 'latex_notes' && Boolean(topic.explanation || topic.guidedExample || topic.practicePrompt || topic.rawLatex)
}
