// Shared sanitizer for the `student_exams` jsonb column on `perfiles`.
// Previously duplicated (with drifting field sets) across
// /api/onboarding/setup and /api/onboarding/generate — the generate route's
// copy didn't even keep `priority`, so an exam's priority set during
// onboarding never reached injectPartialExamMissions in the first place.
// One shared shape now backs onboarding, profile PATCH, and mission injection.

export const VALID_EXAM_PRIORITIES = ['baja', 'normal', 'alta', 'muy_alta'] as const
export type ExamPriority = typeof VALID_EXAM_PRIORITIES[number]

export const VALID_EXAM_CONFIDENCE = ['bajo', 'medio', 'alto'] as const
export type ExamConfidence = typeof VALID_EXAM_CONFIDENCE[number]

export type StudentExam = {
  id: string
  subject: string
  date: string
  block: string
  blockSlug?: string
  topic: string
  name: string
  priority: ExamPriority
  confidence?: ExamConfidence
  content?: string
}

function cleanString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value.trim().slice(0, 160) : fallback
}

export function cleanStudentExams(value: unknown): StudentExam[] {
  if (!Array.isArray(value)) return []
  return value
    .flatMap((raw, index) => {
      if (!raw || typeof raw !== 'object') return []
      const exam = raw as Record<string, unknown>
      const subject = cleanString(exam.subject, '').slice(0, 80)
      const date = cleanString(exam.date, '').slice(0, 10)
      if (!subject || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return []
      const priority: ExamPriority = (VALID_EXAM_PRIORITIES as readonly string[]).includes(exam.priority as string)
        ? (exam.priority as ExamPriority)
        : 'normal'
      const confidence = (VALID_EXAM_CONFIDENCE as readonly string[]).includes(exam.confidence as string)
        ? (exam.confidence as ExamConfidence)
        : undefined
      const blockSlug = cleanString(exam.blockSlug, '').slice(0, 80) || undefined
      const content = cleanString(exam.content, '').slice(0, 500) || undefined
      return [{
        id: cleanString(exam.id, `onboarding-exam-${index + 1}`).slice(0, 80),
        subject,
        date,
        block: cleanString(exam.block, 'Repaso general').slice(0, 80) || 'Repaso general',
        blockSlug,
        topic: cleanString(exam.topic, '').slice(0, 120),
        name: cleanString(exam.name, `Parcial de ${subject}`).slice(0, 120) || `Parcial de ${subject}`,
        priority,
        confidence,
        content,
      }]
    })
    .slice(0, 8)
}
