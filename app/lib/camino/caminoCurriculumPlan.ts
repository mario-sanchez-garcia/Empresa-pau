import curriculumSeed from '@/app/data/camino/curriculum_seed.json'

export type CaminoMissionType =
  | 'concept_explanation'
  | 'guided_example'
  | 'guided_practice'
  | 'evau_practice'
  | 'error_review'
  | 'exam_focus'
  | 'mock_exam'

export type CaminoContentStatus = 'latex_notes' | 'itinerary_only' | 'flashcard'

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
  flashcardId?: string
}

export const SUBJECT_LABELS: Record<string, string> = {
  matematicas_ii: 'Matemáticas II',
  matematicas_ccss: 'Matemáticas CCSS',
  fisica: 'Física',
  quimica: 'Química',
  biologia: 'Biología',
  lengua: 'Lengua Castellana',
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

export function subjectSlugFromLabel(label: string) {
  return SUBJECT_SLUG_BY_LABEL[label] ?? label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')
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
  return CAMINO_CURRICULUM_TOPICS.find(topic =>
    topic.subject === subjectSlug &&
    topic.blockSlug === blockSlug &&
    topic.topicSlug === topicSlug
  ) ?? null
}

export function buildTopicHref(topic: Pick<CaminoCurriculumTopic, 'subject' | 'blockSlug' | 'topicSlug'>) {
  return `/camino-pau/curso/${topic.subject}/${topic.blockSlug}/${topic.topicSlug}`
}

export function buildEvauHref(topic: CaminoCurriculumTopic) {
  const q = topic.evauPracticeQuery
  return `/?subject=${encodeURIComponent(q.subject)}&block=${encodeURIComponent(q.block)}&topic=${encodeURIComponent(q.topic)}&mode=random&source=camino`
}

export function hasLatexContent(topic: CaminoCurriculumTopic) {
  return (topic.contentStatus === 'latex_notes' || topic.contentStatus === 'flashcard') && Boolean(topic.explanation || topic.guidedExample || topic.practicePrompt || topic.rawLatex)
}
