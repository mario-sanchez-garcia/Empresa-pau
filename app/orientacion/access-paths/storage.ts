import type { AdmissionSubject, OrientationTarget } from '../data'
import { ACCESS_PATH_IDS, createDefaultAccessScenarios, createEmptyStoredSubjectInputs } from './model.ts'
import type { AccessPathId, AccessPathStorageState, AccessScenario, CaminoOrientationContext, StoredSubjectInputs } from './types'

export const ACCESS_PATH_STORAGE_KEY = 'kairo.orientation.access-paths.v1'
export const CAMINO_ORIENTATION_CONTEXT_KEY = 'kairo.orientation.camino-context.v1'

function grade(value: unknown, fallback: number, minimum = 0, maximum = 10) {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : fallback
}

function optionalGrade(value: unknown, minimum: number, maximum: number) {
  if (value === null || value === undefined) return null
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(maximum, Math.max(minimum, value)) : null
}

function validPath(value: unknown): value is AccessPathId {
  return typeof value === 'string' && ACCESS_PATH_IDS.includes(value as AccessPathId)
}

export function subjectInputsFromScenarios(subjects: Record<AccessPathId, AdmissionSubject[]>): StoredSubjectInputs {
  const result = createEmptyStoredSubjectInputs()
  for (const pathId of ACCESS_PATH_IDS) {
    result[pathId] = Object.fromEntries(subjects[pathId].map(subject => [subject.subjectCode, { grade: grade(subject.defaultGrade, 7), enabled: subject.enabled }]))
  }
  return result
}

export function applyStoredSubjectInputs(subjects: AdmissionSubject[], stored: Record<string, { grade: number; enabled: boolean }> | undefined) {
  return subjects.map(subject => {
    const input = stored?.[subject.subjectCode]
    return input ? { ...subject, defaultGrade: grade(input.grade, subject.defaultGrade), enabled: Boolean(input.enabled) } : { ...subject }
  })
}

export function parseAccessPathStorage(raw: string | null): AccessPathStorageState | null {
  if (!raw) return null
  try {
    const candidate = JSON.parse(raw) as Partial<AccessPathStorageState>
    if (candidate.version !== 1 || !validPath(candidate.selectedPath)) return null
    const defaults = createDefaultAccessScenarios()
    const scenarios = candidate.scenarios
    const storedInputs = createEmptyStoredSubjectInputs()
    for (const pathId of ACCESS_PATH_IDS) {
      const entries = candidate.subjectInputs?.[pathId]
      if (!entries || typeof entries !== 'object') continue
      for (const [code, value] of Object.entries(entries)) {
        if (value && typeof value === 'object') storedInputs[pathId][code] = { grade: grade(value.grade, 7), enabled: Boolean(value.enabled) }
      }
    }
    return {
      version: 1,
      selectedPath: candidate.selectedPath,
      scenarios: {
        spanish_bachillerato: { ...defaults.spanish_bachillerato, ...scenarios?.spanish_bachillerato, pathId: 'spanish_bachillerato', bachillerato: grade(scenarios?.spanish_bachillerato?.bachillerato, defaults.spanish_bachillerato.bachillerato), accessPhase: grade(scenarios?.spanish_bachillerato?.accessPhase, defaults.spanish_bachillerato.accessPhase) },
        bachibac: { ...defaults.bachibac, ...scenarios?.bachibac, pathId: 'bachibac', bachillerato: grade(scenarios?.bachibac?.bachillerato, defaults.bachibac.bachillerato), externalTest: grade(scenarios?.bachibac?.externalTest, defaults.bachibac.externalTest), accessPhase: grade(scenarios?.bachibac?.accessPhase, defaults.bachibac.accessPhase), route: scenarios?.bachibac?.route === 'spanish_pau' ? 'spanish_pau' : 'french_diploma' },
        ib: { ...defaults.ib, ...scenarios?.ib, pathId: 'ib', accreditedCau: optionalGrade(scenarios?.ib?.accreditedCau, 5, 10), subjectAverage: optionalGrade(scenarios?.ib?.subjectAverage, 2, 7), inputMode: scenarios?.ib?.inputMode === 'subject_average' ? 'subject_average' : 'accredited_cau' },
        international: { ...defaults.international, ...scenarios?.international, pathId: 'international', accreditedCau: optionalGrade(scenarios?.international?.accreditedCau, 5, 10), homologatedAverage: optionalGrade(scenarios?.international?.homologatedAverage, 5, 10), pceGrades: defaults.international.pceGrades.map((_, index) => optionalGrade(scenarios?.international?.pceGrades?.[index], 0, 10)) as [number | null, number | null, number | null, number | null], route: scenarios?.international?.route === 'homologation_pce' || scenarios?.international?.route === 'homologation_pending' ? scenarios.international.route : 'direct_unedasiss' },
      },
      subjectInputs: storedInputs,
    }
  } catch {
    return null
  }
}

function caminoRoute(scenario: AccessScenario): NonNullable<CaminoOrientationContext['route']> {
  if (scenario.pathId === 'spanish_bachillerato') return 'spanish_pau'
  if (scenario.pathId === 'bachibac') return scenario.route === 'spanish_pau' ? 'bachibac_spanish_pau' : 'bachibac_diploma'
  if (scenario.pathId === 'ib') return 'ib_unedasiss'
  if (scenario.route === 'direct_unedasiss') return 'international_direct_unedasiss'
  if (scenario.route === 'homologation_pce') return 'international_homologation_pce'
  return 'international_homologation_pending'
}

export function parseCaminoOrientationContext(raw: string | null): CaminoOrientationContext | null {
  if (!raw) return null
  try {
    const candidate = JSON.parse(raw) as Partial<CaminoOrientationContext>
    if (candidate.version !== 1 || !validPath(candidate.accessPath) || !candidate.target || typeof candidate.target !== 'object') return null
    const target = candidate.target
    if (typeof target.degree !== 'string' || typeof target.university !== 'string' || typeof target.referenceScore !== 'number' || !Number.isFinite(target.referenceScore)) return null
    const validRoutes: Array<NonNullable<CaminoOrientationContext['route']>> = ['spanish_pau', 'bachibac_spanish_pau', 'bachibac_diploma', 'ib_unedasiss', 'international_direct_unedasiss', 'international_homologation_pce', 'international_homologation_pending']
    const route = validRoutes.includes(candidate.route as NonNullable<CaminoOrientationContext['route']>)
      ? candidate.route
      : candidate.accessPath === 'spanish_bachillerato' ? 'spanish_pau' : candidate.accessPath === 'ib' ? 'ib_unedasiss' : undefined
    const impactSubjects = Array.isArray(candidate.impactSubjects)
      ? candidate.impactSubjects.flatMap(subject => {
        if (!subject || typeof subject !== 'object' || typeof subject.subjectCode !== 'string' || typeof subject.name !== 'string' || (subject.weighting !== 0.1 && subject.weighting !== 0.2)) return []
        return [{ subjectCode: subject.subjectCode, name: subject.name, weighting: subject.weighting, defaultGrade: grade(subject.defaultGrade, 7) }]
      }).slice(0, 2)
      : []
    return {
      version: 1,
      accessPath: candidate.accessPath,
      route,
      calculationComplete: candidate.calculationComplete === true || (candidate.calculationComplete === undefined && candidate.estimatedScore != null),
      target: {
        degreeId: typeof target.degreeId === 'string' ? target.degreeId : null,
        universityId: typeof target.universityId === 'string' ? target.universityId : null,
        degree: target.degree,
        university: target.university,
        universityAcronym: typeof target.universityAcronym === 'string' ? target.universityAcronym : null,
        referenceScore: grade(target.referenceScore, 5, 5, 14),
      },
      estimatedScore: optionalGrade(candidate.estimatedScore, 0, 14),
      gap: optionalGrade(candidate.gap, -14, 14),
      impactSubjects,
      updatedAt: typeof candidate.updatedAt === 'string' ? candidate.updatedAt : '',
    }
  } catch {
    return null
  }
}

export function createCaminoOrientationContext(pathId: AccessPathId, target: OrientationTarget, estimatedScore: number | null, gap: number | null, subjects: AdmissionSubject[], scenario: AccessScenario, calculationComplete: boolean, now = new Date()): CaminoOrientationContext {
  const impactSubjects = subjects
    .filter(subject => subject.enabled && subject.defaultGrade >= 5)
    .sort((a, b) => b.weighting - a.weighting || a.defaultGrade - b.defaultGrade)
    .slice(0, 2)
    .map(({ subjectCode, name, weighting, defaultGrade }) => ({ subjectCode, name, weighting, defaultGrade }))
  return {
    version: 1,
    accessPath: pathId,
    route: caminoRoute(scenario),
    calculationComplete,
    target: { degreeId: target.degreeId, universityId: target.universityId, degree: target.degree, university: target.university, universityAcronym: target.universityAcronym, referenceScore: target.referenceScore },
    estimatedScore,
    gap,
    impactSubjects,
    updatedAt: now.toISOString(),
  }
}
