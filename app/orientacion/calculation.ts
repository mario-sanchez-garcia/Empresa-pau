import type { AdmissionSubject } from './data'

export const ADMISSION_FORMULA = {
  bachilleratoWeight: 0.6,
  accessPhaseWeight: 0.4,
  maxWeightedSubjects: 2,
  maxScore: 14,
  minimumWeightedSubjectGrade: 5,
} as const

function clampGrade(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(10, Math.max(0, value))
}

/** Simulación general, no una regla particular sin fuente oficial. */
export function calculateAdmissionScore(bachillerato: number, accessPhase: number, subjects: AdmissionSubject[]) {
  const weighted = subjects
    .filter(subject => subject.enabled && clampGrade(subject.defaultGrade) >= ADMISSION_FORMULA.minimumWeightedSubjectGrade)
    .map(subject => clampGrade(subject.defaultGrade) * subject.weighting)
    .sort((a, b) => b - a)
    .slice(0, ADMISSION_FORMULA.maxWeightedSubjects)
    .reduce((total, contribution) => total + contribution, 0)
  const accessScore = clampGrade(bachillerato) * ADMISSION_FORMULA.bachilleratoWeight
    + clampGrade(accessPhase) * ADMISSION_FORMULA.accessPhaseWeight
  return Math.min(ADMISSION_FORMULA.maxScore, accessScore + weighted)
}

export function getTargetDifference(estimatedScore: number, referenceScore: number) {
  return estimatedScore - referenceScore
}
