// Shared color-by-category palette for the calendar — distinct from
// SUBJECT_COLORS (which colors mission cards by subject). This is the
// higher-level "what kind of thing is this" categorization used by the
// monthly calendar view so a student can tell at a glance what's a Kairo
// mission vs. an exam vs. something they added themselves, regardless of
// subject. Kept in one place so it stays consistent everywhere it's used.
export type ContentType = 'kairo_mission' | 'exam' | 'student_event'

export const CONTENT_TYPE_COLORS: Record<ContentType, { bg: string; text: string; border: string; dot: string }> = {
  // Blue — the app's primary brand color, already used for every Kairo CTA
  // and mission action ("Empezar →", "Ir a practicar").
  kairo_mission: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#2563eb' },
  // Amber — already the established color for exam/parcial content
  // (PartialExamBanner, "Prep. parcial" tags, "Parcial próximo" badges).
  exam: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  // Rose — new, distinct from every subject color and from amber/blue, so
  // student-added events never get mistaken for Kairo- or exam-generated ones.
  student_event: { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8', dot: '#db2777' },
}

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  kairo_mission: 'Misión Kairo',
  exam: 'Examen / parcial',
  student_event: 'Añadido por ti',
}
