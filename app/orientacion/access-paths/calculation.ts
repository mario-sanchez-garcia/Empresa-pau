import type { AdmissionSubject } from '../data'
import type { AccessCalculationResult, AccessPathId, AccessScenario } from './types'

export const ACCESS_CALCULATION_RULES = {
  maxWeightedSubjects: 2,
  minimumWeightedSubjectGrade: 5,
  maxAdmissionScore: 14,
  spanish: { bachilleratoWeight: 0.6, pauWeight: 0.4 },
  bachibacDiploma: { bachilleratoWeight: 0.7, externalTestWeight: 0.3 },
  ib: { subjectMinimum: 2, subjectMaximum: 7, spanishMinimum: 5, spanishMaximum: 10 },
  internationalHomologation: { baseConstant: 4, averageWeight: 0.2, pceWeight: 0.1, maxPce: 4, minimumPassedPce: 3 },
} as const

function clamp(value: number, minimum: number, maximum: number) {
  if (!Number.isFinite(value)) return minimum
  return Math.min(maximum, Math.max(minimum, value))
}

export function calculateWeightedAdmissionPoints(subjects: AdmissionSubject[]) {
  return subjects
    .filter(subject => subject.enabled && clamp(subject.defaultGrade, 0, 10) >= ACCESS_CALCULATION_RULES.minimumWeightedSubjectGrade)
    .map(subject => clamp(subject.defaultGrade, 0, 10) * subject.weighting)
    .sort((a, b) => b - a)
    .slice(0, ACCESS_CALCULATION_RULES.maxWeightedSubjects)
    .reduce((total, contribution) => total + contribution, 0)
}

/** Orden EFD/550/2025, anexo III.a: convierte linealmente el intervalo aprobatorio a la escala española 5–10. */
export function convertForeignGradeToSpanish(value: number, foreignMinimum: number, foreignMaximum: number) {
  if (foreignMaximum <= foreignMinimum) throw new RangeError('La escala extranjera debe tener un intervalo positivo.')
  const normalized = (clamp(value, foreignMinimum, foreignMaximum) - foreignMinimum) / (foreignMaximum - foreignMinimum)
  return 5 + normalized * 5
}

export function calculateIbCauFromSubjectAverage(subjectAverage: number) {
  return convertForeignGradeToSpanish(
    subjectAverage,
    ACCESS_CALCULATION_RULES.ib.subjectMinimum,
    ACCESS_CALCULATION_RULES.ib.subjectMaximum,
  )
}

function baseResult(pathId: AccessPathId, baseScore: number, subjects: AdmissionSubject[], complete = true, incompleteReason: string | null = null, formulaParts: AccessCalculationResult['formulaParts'] = []): AccessCalculationResult {
  const weightedPoints = calculateWeightedAdmissionPoints(subjects)
  return {
    pathId,
    baseScore,
    weightedPoints,
    finalScore: Math.min(ACCESS_CALCULATION_RULES.maxAdmissionScore, baseScore + weightedPoints),
    complete,
    incompleteReason,
    formulaParts,
  }
}

export function calculateAccessPathScore(scenario: AccessScenario, subjects: AdmissionSubject[]): AccessCalculationResult {
  switch (scenario.pathId) {
    case 'spanish_bachillerato': {
      const base = clamp(scenario.bachillerato, 0, 10) * ACCESS_CALCULATION_RULES.spanish.bachilleratoWeight
        + clamp(scenario.accessPhase, 0, 10) * ACCESS_CALCULATION_RULES.spanish.pauWeight
      return baseResult(scenario.pathId, base, subjects, true, null, [
        { value: '60%', label: 'Bachillerato' }, { value: '40%', label: 'Fase de acceso' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
      ])
    }
    case 'bachibac': {
      if (scenario.route === 'spanish_pau') {
        const base = clamp(scenario.bachillerato, 0, 10) * ACCESS_CALCULATION_RULES.spanish.bachilleratoWeight
          + clamp(scenario.accessPhase, 0, 10) * ACCESS_CALCULATION_RULES.spanish.pauWeight
        return baseResult(scenario.pathId, base, subjects, true, null, [
          { value: '60%', label: 'Bachillerato' }, { value: '40%', label: 'PAU' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
        ])
      }
      const base = clamp(scenario.bachillerato, 0, 10) * ACCESS_CALCULATION_RULES.bachibacDiploma.bachilleratoWeight
        + clamp(scenario.externalTest, 0, 10) * ACCESS_CALCULATION_RULES.bachibacDiploma.externalTestWeight
      const complete = scenario.externalTest >= 5
      return baseResult(scenario.pathId, base, subjects, complete, complete ? null : 'La prueba externa debe estar superada para obtener el diplôme.', [
        { value: '70%', label: 'Media Bachillerato' }, { value: '30%', label: 'Prueba externa' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
      ])
    }
    case 'ib': {
      const input = scenario.inputMode === 'accredited_cau' ? scenario.accreditedCau : scenario.subjectAverage
      if (input === null) {
        return baseResult(scenario.pathId, 0, [], false, 'Completa el dato de tu acreditación o la media de tus materias IB para calcular tu nota.', [
          { value: scenario.inputMode === 'accredited_cau' ? 'CAU' : '2–7 → 5–10', label: scenario.inputMode === 'accredited_cau' ? 'Acreditación UNEDasiss' : 'Media de materias IB' },
          { value: '+', label: 'Admisión' },
          { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
        ])
      }
      const base = scenario.inputMode === 'accredited_cau'
        ? clamp(input, 5, 10)
        : calculateIbCauFromSubjectAverage(input)
      return baseResult(scenario.pathId, base, subjects, true, null, [
        { value: scenario.inputMode === 'accredited_cau' ? 'CAU' : '2–7 → 5–10', label: scenario.inputMode === 'accredited_cau' ? 'Acreditación UNEDasiss' : 'Media de materias IB' },
        { value: '+', label: 'Admisión' },
        { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
      ])
    }
    case 'international': {
      if (scenario.route === 'homologation_pending') {
        return baseResult(scenario.pathId, 0, [], false, 'Sin PCE y modalidad acreditada no hay una nota comparable para el reparto ordinario de Madrid.', [
          { value: 'Pendiente', label: 'Homologación' }, { value: 'PCE', label: 'Acreditar modalidad' }, { value: 'Extraordinaria', label: 'Si falta modalidad' },
        ])
      }
      if (scenario.route === 'direct_unedasiss') {
        if (scenario.accreditedCau === null) {
          return baseResult(scenario.pathId, 0, [], false, 'Introduce la CAU que figura en tu acreditación UNEDasiss para calcular tu nota.', [
            { value: 'CAU', label: 'Acreditación UNEDasiss' }, { value: '+', label: 'Admisión' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
          ])
        }
        return baseResult(scenario.pathId, clamp(scenario.accreditedCau, 5, 10), subjects, true, null, [
          { value: 'CAU', label: 'Acreditación UNEDasiss' }, { value: '+', label: 'Admisión' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
        ])
      }
      const qualifyingPce = scenario.pceGrades.filter((grade): grade is number => grade !== null && grade >= 5).slice(0, ACCESS_CALCULATION_RULES.internationalHomologation.maxPce)
      if (scenario.homologatedAverage === null) {
        return baseResult(scenario.pathId, 0, [], false, 'Introduce la nota media de tu Bachillerato homologado para calcular tu nota.', [
          { value: '0,2 × media + 4', label: 'Homologación' }, { value: '+ 0,1 × PCE', label: 'Hasta cuatro aprobadas' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
        ])
      }
      const base = ACCESS_CALCULATION_RULES.internationalHomologation.baseConstant
        + clamp(scenario.homologatedAverage, 5, 10) * ACCESS_CALCULATION_RULES.internationalHomologation.averageWeight
        + qualifyingPce.reduce((total, grade) => total + clamp(grade, 0, 10) * ACCESS_CALCULATION_RULES.internationalHomologation.pceWeight, 0)
      const complete = qualifyingPce.length >= ACCESS_CALCULATION_RULES.internationalHomologation.minimumPassedPce
      return baseResult(scenario.pathId, Math.min(10, base), subjects, complete, complete ? null : 'Necesitas las PCE aprobadas que permitan acreditar una modalidad; Madrid indica un mínimo de tres.', [
        { value: '0,2 × media + 4', label: 'Homologación' }, { value: '+ 0,1 × PCE', label: 'Hasta cuatro aprobadas' }, { value: 'Hasta 4', label: 'Dos mejores ponderadas' },
      ])
    }
  }
}
