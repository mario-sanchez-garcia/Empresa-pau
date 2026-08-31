export type AdmissionSubject = {
  id: string
  name: string
  weighting: 0.1 | 0.2
  defaultGrade: number
  enabled: boolean
}

export type OrientationTarget = {
  id: string
  degree: string
  university: string
  referenceScore: number
  referenceLabel: string
  source: null
  subjects: AdmissionSubject[]
}

// Fixtures de demostración para la experiencia V1. No son notas de corte ni
// ponderaciones oficiales y la interfaz nunca las presenta como tales.
export const ORIENTATION_FIXTURES: OrientationTarget[] = [
  {
    id: 'psicologia-demo',
    degree: 'Psicología',
    university: 'Universidad de ejemplo · Madrid',
    referenceScore: 12.12,
    referenceLabel: 'Referencia de demostración',
    source: null,
    subjects: [
      { id: 'matematicas', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 7.5, enabled: true },
      { id: 'biologia', name: 'Biología', weighting: 0.2, defaultGrade: 6.5, enabled: true },
      { id: 'quimica', name: 'Química', weighting: 0.2, defaultGrade: 7, enabled: false },
    ],
  },
  {
    id: 'ingenieria-demo',
    degree: 'Ingeniería Informática',
    university: 'Universidad de ejemplo · Barcelona',
    referenceScore: 11.46,
    referenceLabel: 'Referencia de demostración',
    source: null,
    subjects: [
      { id: 'matematicas', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 8, enabled: true },
      { id: 'fisica', name: 'Física', weighting: 0.2, defaultGrade: 7, enabled: true },
      { id: 'dibujo', name: 'Dibujo Técnico II', weighting: 0.1, defaultGrade: 6.5, enabled: false },
    ],
  },
]

export function calculateAdmissionScore(
  bachillerato: number,
  accessPhase: number,
  subjects: AdmissionSubject[],
) {
  const weighted = subjects
    .filter(subject => subject.enabled)
    .map(subject => subject.defaultGrade * subject.weighting)
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((total, contribution) => total + contribution, 0)

  return Math.min(14, bachillerato * 0.6 + accessPhase * 0.4 + weighted)
}
