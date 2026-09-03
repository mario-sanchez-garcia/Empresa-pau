import type { AdmissionSubject, OrientationTarget } from '../data'

export type AccessPathId = 'spanish_bachillerato' | 'bachibac' | 'ib' | 'international'
export type BachibacRoute = 'french_diploma' | 'spanish_pau'
export type IbInputMode = 'accredited_cau' | 'subject_average'
export type InternationalRoute = 'direct_unedasiss' | 'homologation_pce' | 'homologation_pending'

export type SpanishScenario = {
  pathId: 'spanish_bachillerato'
  bachillerato: number
  accessPhase: number
}

export type BachibacScenario = {
  pathId: 'bachibac'
  route: BachibacRoute
  bachillerato: number
  externalTest: number
  accessPhase: number
}

export type IbScenario = {
  pathId: 'ib'
  inputMode: IbInputMode
  accreditedCau: number | null
  subjectAverage: number | null
}

export type InternationalScenario = {
  pathId: 'international'
  route: InternationalRoute
  accreditedCau: number | null
  homologatedAverage: number | null
  pceGrades: [number | null, number | null, number | null, number | null]
}

export type AccessScenario = SpanishScenario | BachibacScenario | IbScenario | InternationalScenario
export type AccessScenarioMap = {
  spanish_bachillerato: SpanishScenario
  bachibac: BachibacScenario
  ib: IbScenario
  international: InternationalScenario
}

export type OfficialAccessSource = {
  organization: string
  document: string
  period: string
  url: string
}

export type AccessPathDefinition = {
  id: AccessPathId
  shortLabel: string
  label: string
  description: string
  officialSummary: string
  kairoSummary: string
  changes: string[]
  needs: string[]
  stays: string[]
  subjectOrigin: string
  sources: OfficialAccessSource[]
}

export type AccessCalculationResult = {
  pathId: AccessPathId
  baseScore: number
  weightedPoints: number
  finalScore: number
  complete: boolean
  incompleteReason: string | null
  formulaParts: Array<{ value: string; label: string }>
}

export type StoredSubjectInput = { grade: number; enabled: boolean }
export type StoredSubjectInputs = Record<AccessPathId, Record<string, StoredSubjectInput>>

export type AccessPathStorageState = {
  version: 1
  selectedPath: AccessPathId
  scenarios: AccessScenarioMap
  subjectInputs: StoredSubjectInputs
}

export type CaminoOrientationContext = {
  version: 1
  accessPath: AccessPathId
  /** Ruta concreta usada por el motor de Orientación. Ausente en contextos locales antiguos. */
  route?: 'spanish_pau' | 'bachibac_spanish_pau' | 'bachibac_diploma' | 'ib_unedasiss' | 'international_direct_unedasiss' | 'international_homologation_pce' | 'international_homologation_pending'
  calculationComplete?: boolean
  target: Pick<OrientationTarget, 'degreeId' | 'universityId' | 'degree' | 'university' | 'community' | 'referenceScore'> & { universityAcronym?: string | null }
  estimatedScore: number | null
  gap: number | null
  impactSubjects: Array<Pick<AdmissionSubject, 'subjectCode' | 'name' | 'weighting' | 'defaultGrade'>>
  updatedAt: string
}
