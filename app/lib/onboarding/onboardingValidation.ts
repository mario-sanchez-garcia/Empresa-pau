import { SUBJECT_OPTS } from '../subjectCatalog.ts'
import { cleanStudentExams } from '../camino/cleanStudentExams.ts'

const SUPPORTED_SUBJECTS = new Set(
  SUBJECT_OPTS.filter(subject => subject.betaStatus === 'enabled').map(subject => subject.id),
)

function cleanStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string').map(item => item.trim()).filter(Boolean).slice(0, 12)
    : []
}

export function cleanSupportedSubjects(value: unknown) {
  return [...new Set(cleanStringArray(value).filter(subject => SUPPORTED_SUBJECTS.has(subject)))]
}

export function cleanStudentExamsForSubjects(value: unknown, subjects: string[]) {
  const selected = new Set(subjects)
  return cleanStudentExams(value).filter(exam => selected.has(exam.subject))
}
