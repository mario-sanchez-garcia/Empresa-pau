export type GradeSource = 'simulacro' | 'correction'
export type GradeConfidence = 'none' | 'baja' | 'media' | 'alta'

export type GradeEvidenceItem = {
  source: GradeSource
  subject?: string | null
  score?: number | null
  maxScore?: number | null
  score10?: number | null
  createdAt?: string | null
}

export type GradePredictionResult = {
  subject: string
  subjectLabel: string
  estimated: number
  min: number
  max: number
  confidence: GradeConfidence
  simulacroCount: number
  correctionCount: number
  trendAdjustment: number
}

const SUBJECTS = [
  ['mates', 'Matemáticas II'],
  ['fisica', 'Física'],
  ['quimica', 'Química'],
  ['biologia', 'Biología'],
  ['lengua', 'Lengua'],
  ['historia', 'Historia de España'],
  ['ingles', 'Inglés'],
  ['historia_filosofia', 'Historia de la Filosofía']
] as const

const SUBJECT_LABELS = new Map<string, string>(SUBJECTS)

const RECENT_SIMULACRO_WEIGHTS = [0.5, 0.3, 0.2]

export function calculateGradePredictions(items: GradeEvidenceItem[]) {
  const grouped = new Map<string, GradeEvidenceItem[]>()

  for (const item of items) {
    const subject = normalizeSubject(item.subject)
    if (!subject) continue
    const score = getScore10(item)
    if (score == null) continue
    const current = grouped.get(subject) ?? []
    current.push({ ...item, subject, score10: score })
    grouped.set(subject, current)
  }

  return Array.from(grouped.entries())
    .map(([subject, subjectItems]) => calculateGradePrediction(subject, subjectItems))
    .filter((prediction): prediction is GradePredictionResult => Boolean(prediction))
    .sort((a, b) => subjectOrder(a.subject) - subjectOrder(b.subject))
}

export function calculateGradePrediction(subject: string, items: GradeEvidenceItem[]) {
  const simulacros = sortRecent(items.filter(item => item.source === 'simulacro' && getScore10(item) != null)).slice(0, 3)
  const corrections = sortRecent(items.filter(item => item.source === 'correction' && getScore10(item) != null)).slice(0, 10)
  const simulacroScore = calculateWeightedRecentAverage(simulacros)
  const exerciseScore = average(corrections.map(item => getScore10(item)).filter(isNumber))

  let estimated: number | null = null
  if (simulacroScore != null && exerciseScore != null) estimated = simulacroScore * 0.7 + exerciseScore * 0.3
  else if (simulacroScore != null) estimated = simulacroScore
  else if (exerciseScore != null) estimated = exerciseScore
  if (estimated == null) return null

  const trendAdjustment = calculateTrendAdjustment(items)
  estimated = clampGrade(estimated + trendAdjustment)

  const confidence = getConfidenceLevel({
    simulacroCount: simulacros.length,
    correctionCount: corrections.length
  })
  const range = rangeForConfidence(confidence)

  return {
    subject,
    subjectLabel: SUBJECT_LABELS.get(subject) ?? subject,
    estimated,
    min: clampGrade(estimated - range),
    max: clampGrade(estimated + range),
    confidence,
    simulacroCount: simulacros.length,
    correctionCount: corrections.length,
    trendAdjustment
  }
}

export function normalizeScoreToTen(score?: number | null, maxScore?: number | null) {
  const value = toNumber(score)
  if (value == null) return null

  const max = toNumber(maxScore)
  if (max != null && max > 0) return clampGrade((value / max) * 10)
  if (value >= 0 && value <= 10) return clampGrade(value)
  return null
}

export function calculateWeightedRecentAverage(items: GradeEvidenceItem[]) {
  const scores = sortRecent(items)
    .slice(0, 3)
    .map(item => getScore10(item))
    .filter(isNumber)

  if (!scores.length) return null
  const weights = RECENT_SIMULACRO_WEIGHTS.slice(0, scores.length)
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0)
  return scores.reduce((sum, score, index) => sum + score * weights[index], 0) / weightTotal
}

export function getConfidenceLevel({ simulacroCount, correctionCount }: { simulacroCount: number; correctionCount: number }): GradeConfidence {
  const dataPoints = simulacroCount * 3 + correctionCount
  if (dataPoints <= 0) return 'none'
  if (dataPoints <= 3) return 'baja'
  if (dataPoints <= 10) return 'media'
  return simulacroCount >= 2 ? 'alta' : 'media'
}

export function clampGrade(value: number) {
  return Math.min(10, Math.max(0, value))
}

function getScore10(item: GradeEvidenceItem) {
  const directScore = toNumber(item.score10)
  if (directScore != null) return clampGrade(directScore)
  return normalizeScoreToTen(item.score, item.maxScore)
}

function calculateTrendAdjustment(items: GradeEvidenceItem[]) {
  const scores = sortRecent(items)
    .map(item => getScore10(item))
    .filter(isNumber)

  if (scores.length < 4) return 0
  const recent = average(scores.slice(0, 3))
  const previous = average(scores.slice(3))
  if (recent == null || previous == null) return 0
  if (recent - previous >= 0.5) return 0.2
  if (previous - recent >= 0.5) return -0.2
  return 0
}

function rangeForConfidence(confidence: GradeConfidence) {
  if (confidence === 'alta') return 0.35
  if (confidence === 'media') return 0.6
  return 1
}

function average(values: number[]) {
  if (!values.length) return null
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function sortRecent(items: GradeEvidenceItem[]) {
  return [...items].sort((a, b) => dateValue(b.createdAt) - dateValue(a.createdAt))
}

function dateValue(value?: string | null) {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

function normalizeSubject(value?: string | null) {
  const subject = removeAccents(value).toLowerCase().trim()
  if (!subject) return null
  if (subject.includes('filos')) return 'historia_filosofia'
  if (subject === 'mates' || subject.includes('mat')) return 'mates'
  if (subject.includes('fis')) return 'fisica'
  if (subject.includes('quim')) return 'quimica'
  if (subject === 'bio' || subject.includes('biolog')) return 'biologia'
  if (subject.includes('lengua')) return 'lengua'
  if (subject.includes('ingles') || subject.includes('english')) return 'ingles'
  if (subject.includes('historia')) return 'historia'
  return subject
}

function removeAccents(value?: string | null) {
  return (value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function subjectOrder(subject: string) {
  const index = SUBJECTS.findIndex(([key]) => key === subject)
  return index === -1 ? SUBJECTS.length : index
}

function toNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function isNumber(value: number | null): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}
