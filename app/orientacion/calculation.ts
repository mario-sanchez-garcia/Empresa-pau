import type { AdmissionSubject } from './data'
import { calculateAccessPathScore } from './access-paths/calculation.ts'

export const ADMISSION_FORMULA = {
  bachilleratoWeight: 0.6,
  accessPhaseWeight: 0.4,
  maxWeightedSubjects: 2,
  maxScore: 14,
  minimumWeightedSubjectGrade: 5,
} as const

/** Cálculo de regresión de la vía ordinaria; delega en el motor versionado por vía. */
export function calculateAdmissionScore(bachillerato: number, accessPhase: number, subjects: AdmissionSubject[]) {
  return calculateAccessPathScore({ pathId: 'spanish_bachillerato', bachillerato, accessPhase }, subjects).finalScore
}

export function getTargetDifference(estimatedScore: number, referenceScore: number) {
  return estimatedScore - referenceScore
}
