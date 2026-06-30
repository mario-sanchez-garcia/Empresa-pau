import curriculumSeed from '@/app/data/camino/curriculum_seed.json'

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

export const CAMINO_CURRICULUM_TOPICS = (curriculumSeed as CaminoCurriculumTopic[])
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
  if (slug === 'lengua' || slug === 'lengua_castellana' || slug === 'lengua_castellana_y_literatura') return 'lengua'
  if (slug === 'historia') return 'historia'
  if (slug === 'historia_de_espana' || slug === 'historia_espana') return 'historia_espana'
  if (slug === 'filosofia' || slug === 'historia_filosofia' || slug === 'historia_de_la_filosofia') return 'historia_filosofia'
  if (slug === 'ingles' || slug === 'english') return 'ingles'
  if (slug === 'llengua_catalana') return 'llengua_catalana'

  return SUBJECT_SLUG_BY_LABEL[subject ?? ''] ?? slug
}

export function subjectSlugFromLabel(label: string) {
  return normalizeSubjectSlug(label)
}

export function getCurriculumForSubject(subject: string) {
  const subjectSlug = SUBJECT_LABELS[subject] ? subject : subjectSlugFromLabel(subject)
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
  const subjectSlug = SUBJECT_LABELS[subject] ? subject : subjectSlugFromLabel(subject)
  const inSubjectBlock = CAMINO_CURRICULUM_TOPICS.filter(t =>
    t.subject === subjectSlug && t.blockSlug === blockSlug
  )
  // Exact match first
  const exact = inSubjectBlock.find(t => t.topicSlug === topicSlug)
  if (exact) return exact
  // Bidirectional prefix fallback: handles legacy chapter_title slugs (url shorter than seed)
  // and full textSlug urls (url longer than truncated seed slug). Min 12 chars avoids false positives.
  return inSubjectBlock.find(t => {
    const minLen = Math.min(t.topicSlug.length, topicSlug.length)
    return minLen >= 12 && (t.topicSlug.startsWith(topicSlug) || topicSlug.startsWith(t.topicSlug))
  }) ?? null
}

export function buildTopicHref(topic: Pick<CaminoCurriculumTopic, 'subject' | 'blockSlug' | 'topicSlug'>) {
  return `/camino-pau/curso/${topic.subject}/${topic.blockSlug}/${topic.topicSlug}`
}

export function buildEvauHref(topic: CaminoCurriculumTopic) {
  const q = topic.evauPracticeQuery
  return `/?subject=${encodeURIComponent(q.subject)}&block=${encodeURIComponent(q.block)}&topic=${encodeURIComponent(q.topic)}&mode=random&source=camino`
}

export function hasLatexContent(topic: CaminoCurriculumTopic) {
  return topic.contentStatus === 'latex_notes' && Boolean(topic.explanation || topic.guidedExample || topic.practicePrompt || topic.rawLatex)
}
