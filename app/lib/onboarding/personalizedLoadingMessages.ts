// Fase 1: cada mensaje debe reflejar algo que realmente está ocurriendo (no
// fingir pasos ni porcentajes falsos) — ver AGENTS.md. Extraído del antiguo
// paso "saving" de OnboardingFlow.tsx para reutilizarlo tal cual en
// /onboarding/finalizando (Fase 2), que es quien ahora muestra esta
// secuencia mientras el finalizer procesa de verdad.

export interface LoadingMessageInput {
  community: string | null
  subjects: string[]
  studentExams: Array<{ subject: string; date: string }>
  weeklyStudyDaysValue: number | null
  dailyMinutes: number | null
}

const PRIVATE_BETA_SUBJECT_MESSAGES: Record<string, string> = {
  'Matemáticas II': 'Ordenando tus 60 temas de Matemáticas II…',
  'Matemáticas CCSS': 'Ordenando tus temas de Matemáticas CCSS…',
  'Lengua Castellana': 'Preparando comentario, gramática y literatura…',
  'Historia de España': 'Construyendo tu cronología de Historia de España…',
}

export function buildPersonalizedLoadingMessages(input: LoadingMessageInput): string[] {
  const contextMsgs: string[] = []
  if (input.community && input.community !== 'Otra') {
    contextMsgs.push(`Preparando tu Camino para la PAU de ${input.community}…`)
  }
  const nextExam = [...input.studentExams].sort((a, b) => a.date.localeCompare(b.date))[0]
  if (nextExam) {
    contextMsgs.push(`Priorizando ${nextExam.subject} por tu próximo parcial…`)
  }
  if (input.weeklyStudyDaysValue) {
    contextMsgs.push(`Distribuyendo tus sesiones entre ${input.weeklyStudyDaysValue} días…`)
  }
  if (input.dailyMinutes) {
    contextMsgs.push(`Adaptando las sesiones a tus ${input.dailyMinutes} minutos disponibles…`)
  }

  const subjectMsgs: string[] = input.subjects
    .map(subject => PRIVATE_BETA_SUBJECT_MESSAGES[subject])
    .filter((msg): msg is string => Boolean(msg))
  if (subjectMsgs.length === 0) {
    subjectMsgs.push('Calculando tu ritmo de estudio…')
    subjectMsgs.push('Construyendo tu Camino PAU…')
  }

  return [...contextMsgs, ...subjectMsgs, 'Listo — tu primer día empieza mañana.']
}
