import { examenes } from '../../data/examenes'
import { examenesMatematicasCCSSMadrid } from '../../data/matematicas_ccss_madrid'

type CaminoExamSubject = 'mates' | 'matematicas_ccss'
type MatchLevel = 'topic' | 'block' | 'keyword' | 'subject_fallback'

interface ExamQuestion {
  id?: string
  bloque?: string
  opcion?: string
  enunciado?: string
  criterios?: string
  label?: string
  tema?: string
}

interface ExamLike {
  id?: number | string
  año: number
  tipo: string
  comunidad?: string
  ccaa?: string
  preguntas?: ExamQuestion[]
}

interface ExerciseCandidate {
  subject: CaminoExamSubject
  exerciseId: string
  examId: string
  year: number
  convocatoria: string
  blockSlug: string
  topicSlug: string
  questionIndex: number
  text: string
}

export interface RandomEvauExerciseQuery {
  subject?: string | null
  block?: string | null
  topic?: string | null
  missionId?: string | null
  recentExerciseIds?: string[]
}

export interface RandomEvauExerciseResult {
  subject: CaminoExamSubject
  exerciseId: string
  examId: string
  year: number
  convocatoria: string
  blockSlug: string
  topicSlug: string
  questionIndex: number
  matchLevel: MatchLevel
  warning?: string
  targetUrl: string
}

const RECENT_LIMIT = 8

const TOPIC_KEYWORDS: Record<string, string[]> = {
  algebra: ['matriz', 'matrices', 'determinante', 'rango', 'sistema', 'gauss', 'cramer', 'programacion lineal', 'restricciones'],
  analisis: ['funcion', 'derivada', 'derivar', 'continuidad', 'limite', 'tangente', 'crecimiento', 'decrecimiento', 'maximo', 'minimo', 'optimizacion'],
  integrales: ['integral', 'integrales', 'primitiva', 'area', '\\int'],
  geometria: ['vector', 'recta', 'plano', 'producto vectorial', 'distancia', 'angulo', 'perpendicular', 'paralelo'],
  probabilidad: ['probabilidad', 'suceso', 'sucesos', 'bayes', 'binomial', 'normal', 'tipificacion', 'independientes'],
  estadistica: ['intervalo', 'confianza', 'muestra', 'proporcion', 'media muestral', 'contraste'],
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function slugifyEvauParam(value?: string | null) {
  return normalizeText(value ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeCaminoExamSubject(value?: string | null): CaminoExamSubject | null {
  const slug = slugifyEvauParam(value).replace(/-/g, '_')
  if (slug === 'mates' || slug === 'matematicas_ii' || slug === 'matematicas') return 'mates'
  if (slug === 'matematicas_ccss' || slug === 'matematicas_sociales' || slug === 'matematicas_aplicadas_ccss') return 'matematicas_ccss'
  return null
}

function inferTopicSlug(blockSlug: string, text: string) {
  const normalized = normalizeText(text)
  const topic = Object.entries(TOPIC_KEYWORDS).find(([, words]) =>
    words.some(word => normalized.includes(normalizeText(word)))
  )?.[0]

  return topic ?? blockSlug
}

function normalizeBlockSlug(question: ExamQuestion, subject: CaminoExamSubject) {
  const explicitBlock = slugifyEvauParam(question.bloque)
  if (subject === 'mates') {
    if (explicitBlock.includes('algebra')) return 'algebra'
    if (explicitBlock.includes('analisis')) return 'analisis'
    if (explicitBlock.includes('geometria')) return 'geometria'
    if (explicitBlock.includes('probabilidad')) return 'probabilidad'
  }

  const text = normalizeText(`${question.bloque ?? ''} ${question.enunciado ?? ''} ${question.criterios ?? ''}`)
  if (TOPIC_KEYWORDS.algebra.some(word => text.includes(normalizeText(word)))) return 'algebra'
  if (TOPIC_KEYWORDS.integrales.some(word => text.includes(normalizeText(word)))) return 'analisis'
  if (TOPIC_KEYWORDS.analisis.some(word => text.includes(normalizeText(word)))) return 'analisis'
  if (TOPIC_KEYWORDS.estadistica.some(word => text.includes(normalizeText(word)))) return 'probabilidad'
  if (TOPIC_KEYWORDS.probabilidad.some(word => text.includes(normalizeText(word)))) return 'probabilidad'
  if (subject === 'mates' && TOPIC_KEYWORDS.geometria.some(word => text.includes(normalizeText(word)))) return 'geometria'
  return explicitBlock || 'ejercicio'
}

function sourceForSubject(subject: CaminoExamSubject): ExamLike[] {
  return subject === 'matematicas_ccss'
    ? examenesMatematicasCCSSMadrid as ExamLike[]
    : examenes as ExamLike[]
}

function flattenCandidates(subject: CaminoExamSubject): ExerciseCandidate[] {
  return sourceForSubject(subject)
    .filter(exam => (exam.comunidad ?? exam.ccaa) === 'Madrid' && Array.isArray(exam.preguntas))
    .flatMap(exam => (exam.preguntas ?? []).map((question, questionIndex) => {
      const text = `${question.bloque ?? ''} ${question.label ?? ''} ${question.tema ?? ''} ${question.enunciado ?? ''} ${question.criterios ?? ''}`
      const blockSlug = normalizeBlockSlug(question, subject)
      const topicSlug = inferTopicSlug(blockSlug, text)
      return {
        subject,
        exerciseId: String(question.id ?? `${exam.id}-${questionIndex}`),
        examId: String(exam.id ?? `${exam.año}-${exam.tipo}`),
        year: exam.año,
        convocatoria: exam.tipo,
        blockSlug,
        topicSlug,
        questionIndex,
        text: normalizeText(text),
      }
    }))
}

function topicFamily(topicSlug: string) {
  if (topicSlug.includes('integral') || topicSlug.includes('area')) return 'integrales'
  if (topicSlug.includes('deriv') || topicSlug.includes('optimiz') || topicSlug.includes('limite') || topicSlug.includes('continuidad')) return 'analisis'
  if (topicSlug.includes('matriz') || topicSlug.includes('sistema') || topicSlug.includes('gauss') || topicSlug.includes('lineal')) return 'algebra'
  if (topicSlug.includes('bayes') || topicSlug.includes('normal') || topicSlug.includes('probabilidad')) return 'probabilidad'
  if (topicSlug.includes('intervalo') || topicSlug.includes('confianza') || topicSlug.includes('estadistica')) return 'estadistica'
  if (topicSlug.includes('vector') || topicSlug.includes('plano') || topicSlug.includes('geometria')) return 'geometria'
  return topicSlug
}

function filteredByRecent(candidates: ExerciseCandidate[], recentExerciseIds: string[]) {
  if (!recentExerciseIds.length || candidates.length <= 1) return candidates
  const recent = new Set(recentExerciseIds.slice(-RECENT_LIMIT))
  const fresh = candidates.filter(candidate => !recent.has(candidate.exerciseId))
  return fresh.length ? fresh : candidates
}

function pickRandom(candidates: ExerciseCandidate[]) {
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function scoreCandidates(candidates: ExerciseCandidate[], blockSlug: string, topicSlug: string) {
  const family = topicFamily(topicSlug)
  const topicMatches = candidates.filter(candidate => candidate.topicSlug === family)
  if (topicMatches.length) return { candidates: topicMatches, matchLevel: 'topic' as const }

  const blockMatches = candidates.filter(candidate => candidate.blockSlug === blockSlug || candidate.blockSlug === family)
  if (blockMatches.length) return { candidates: blockMatches, matchLevel: 'block' as const }

  const keywords = TOPIC_KEYWORDS[family] ?? []
  const keywordMatches = keywords.length
    ? candidates.filter(candidate => keywords.some(word => candidate.text.includes(normalizeText(word))))
    : []
  if (keywordMatches.length) return { candidates: keywordMatches, matchLevel: 'keyword' as const }

  return { candidates, matchLevel: 'subject_fallback' as const }
}

export function getRandomEvauExerciseForMission(query: RandomEvauExerciseQuery): RandomEvauExerciseResult | null {
  const subject = normalizeCaminoExamSubject(query.subject)
  if (!subject) return null

  const blockSlug = topicFamily(slugifyEvauParam(query.block))
  const topicSlug = topicFamily(slugifyEvauParam(query.topic))
  const allCandidates = flattenCandidates(subject)
  if (!allCandidates.length) return null

  const scored = scoreCandidates(allCandidates, blockSlug, topicSlug)
  const candidates = filteredByRecent(scored.candidates, query.recentExerciseIds ?? [])
  const selected = pickRandom(candidates)
  const warning = scored.matchLevel === 'subject_fallback'
    ? 'No se encontró un ejercicio exacto para ese tema; se abrió una práctica real de la asignatura.'
    : undefined
  const params = new URLSearchParams({
    subject,
    mode: 'selected',
    source: 'camino_pau',
    exerciseId: selected.exerciseId,
    year: String(selected.year),
    call: selected.convocatoria,
    block: selected.blockSlug,
    topic: selected.topicSlug,
    matchLevel: scored.matchLevel,
  })
  if (query.missionId) params.set('missionId', query.missionId)

  return {
    ...selected,
    matchLevel: scored.matchLevel,
    warning,
    targetUrl: `/?${params.toString()}`,
  }
}

export function rememberRecentEvauExerciseIds(current: string[], exerciseId: string) {
  return [...current.filter(id => id !== exerciseId), exerciseId].slice(-RECENT_LIMIT)
}
