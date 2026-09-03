import { ACCESS_PATH_IDS, createDefaultAccessScenarios, createEmptyStoredSubjectInputs } from './access-paths/model.ts'
import type { AccessPathId, AccessPathStorageState, AccessScenarioMap, StoredSubjectInputs } from './access-paths/types'
import { normalizeOrientationCommunity, type OrientationCommunity } from './community.ts'

export const ORIENTATION_STATE_STORAGE_KEY = 'kairo.orientation.state.v1'
export const ORIENTATION_STATE_MAX_BYTES = 64 * 1024
const MAX_SUBJECTS_PER_PATH = 128

export type OrientationExploration = {
  community: OrientationCommunity
  degreeGroupKey: string | null
  degreeName: string | null
  degreeId: string | null
  universityId: string | null
}

export type OrientationStateV1 = {
  version: 1
  updatedAt: string
  activeCommunity: OrientationCommunity
  activeAccessPath: AccessPathId
  exploration: OrientationExploration
  scenarios: AccessScenarioMap
  subjectInputs: StoredSubjectInputs
}

type UnknownRecord = Record<string, unknown>

function record(value: unknown): UnknownRecord | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null
}

function number(value: unknown, minimum: number, maximum: number) {
  return typeof value === 'number' && Number.isFinite(value) && value >= minimum && value <= maximum ? value : null
}

function nullableNumber(value: unknown, minimum: number, maximum: number): number | null | undefined {
  if (value === null) return null
  return number(value, minimum, maximum) ?? undefined
}

function text(value: unknown, maximum: number) {
  if (value === null) return null
  if (typeof value !== 'string') return undefined
  const cleaned = value.trim()
  return cleaned && cleaned.length <= maximum ? cleaned : undefined
}

function uuid(value: unknown) {
  if (value === null) return null
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) ? value : undefined
}

function parseScenarios(value: unknown): AccessScenarioMap | null {
  const scenarios = record(value)
  if (!scenarios) return null
  const spanish = record(scenarios.spanish_bachillerato)
  const bachibac = record(scenarios.bachibac)
  const ib = record(scenarios.ib)
  const international = record(scenarios.international)
  if (!spanish || !bachibac || !ib || !international) return null

  const bachillerato = number(spanish.bachillerato, 0, 10)
  const accessPhase = number(spanish.accessPhase, 0, 10)
  const bachibacAverage = number(bachibac.bachillerato, 0, 10)
  const externalTest = number(bachibac.externalTest, 0, 10)
  const bachibacAccess = number(bachibac.accessPhase, 0, 10)
  const accreditedCau = nullableNumber(ib.accreditedCau, 5, 10)
  const subjectAverage = nullableNumber(ib.subjectAverage, 2, 7)
  const internationalCau = nullableNumber(international.accreditedCau, 5, 10)
  const homologatedAverage = nullableNumber(international.homologatedAverage, 5, 10)
  const pceValues = Array.isArray(international.pceGrades) && international.pceGrades.length === 4
    ? international.pceGrades.map(value => nullableNumber(value, 0, 10))
    : null
  if (bachillerato === null || accessPhase === null || bachibacAverage === null || externalTest === null || bachibacAccess === null
    || accreditedCau === undefined || subjectAverage === undefined || internationalCau === undefined || homologatedAverage === undefined
    || !pceValues || pceValues.some(value => value === undefined)) return null
  if (bachibac.route !== 'french_diploma' && bachibac.route !== 'spanish_pau') return null
  if (ib.inputMode !== 'accredited_cau' && ib.inputMode !== 'subject_average') return null
  if (international.route !== 'direct_unedasiss' && international.route !== 'homologation_pce' && international.route !== 'homologation_pending') return null

  return {
    spanish_bachillerato: { pathId: 'spanish_bachillerato', bachillerato, accessPhase },
    bachibac: { pathId: 'bachibac', route: bachibac.route, bachillerato: bachibacAverage, externalTest, accessPhase: bachibacAccess },
    ib: { pathId: 'ib', inputMode: ib.inputMode, accreditedCau, subjectAverage },
    international: { pathId: 'international', route: international.route, accreditedCau: internationalCau, homologatedAverage, pceGrades: pceValues as [number | null, number | null, number | null, number | null] },
  }
}

function parseSubjectInputs(value: unknown): StoredSubjectInputs | null {
  const candidate = record(value)
  if (!candidate) return null
  const result = createEmptyStoredSubjectInputs()
  for (const pathId of ACCESS_PATH_IDS) {
    const entries = record(candidate[pathId])
    if (!entries || Object.keys(entries).length > MAX_SUBJECTS_PER_PATH) return null
    for (const [subjectCode, rawInput] of Object.entries(entries)) {
      const input = record(rawInput)
      const grade = input ? number(input.grade, 0, 10) : null
      if (!input || !subjectCode.trim() || subjectCode.length > 100 || ['__proto__', 'constructor', 'prototype'].includes(subjectCode) || grade === null || typeof input.enabled !== 'boolean') return null
      result[pathId][subjectCode] = { grade, enabled: input.enabled }
    }
  }
  return result
}

export function parseOrientationState(value: unknown): OrientationStateV1 | null {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value)
    if (!serialized || new TextEncoder().encode(serialized).length > ORIENTATION_STATE_MAX_BYTES) return null
    const candidate = record(typeof value === 'string' ? JSON.parse(value) : value)
    if (!candidate || candidate.version !== 1 || typeof candidate.updatedAt !== 'string' || !Number.isFinite(Date.parse(candidate.updatedAt))) return null
    const activeCommunity = normalizeOrientationCommunity(candidate.activeCommunity)
    const activeAccessPath = typeof candidate.activeAccessPath === 'string' && ACCESS_PATH_IDS.includes(candidate.activeAccessPath as AccessPathId) ? candidate.activeAccessPath as AccessPathId : null
    const exploration = record(candidate.exploration)
    const explorationCommunity = normalizeOrientationCommunity(exploration?.community)
    const degreeGroupKey = text(exploration?.degreeGroupKey, 220)
    const degreeName = text(exploration?.degreeName, 180)
    const degreeId = uuid(exploration?.degreeId)
    const universityId = uuid(exploration?.universityId)
    const scenarios = parseScenarios(candidate.scenarios)
    const subjectInputs = parseSubjectInputs(candidate.subjectInputs)
    if (!activeCommunity || !activeAccessPath || !exploration || !explorationCommunity || degreeGroupKey === undefined || degreeName === undefined
      || degreeId === undefined || universityId === undefined || Boolean(degreeId) !== Boolean(universityId) || !scenarios || !subjectInputs) return null
    return {
      version: 1,
      updatedAt: new Date(candidate.updatedAt).toISOString(),
      activeCommunity,
      activeAccessPath,
      exploration: { community: explorationCommunity, degreeGroupKey, degreeName, degreeId, universityId },
      scenarios,
      subjectInputs,
    }
  } catch {
    return null
  }
}

export function createOrientationState(community: OrientationCommunity, accessState?: AccessPathStorageState | null, updatedAt = new Date().toISOString()): OrientationStateV1 {
  const stored = accessState ?? { version: 1, selectedPath: 'spanish_bachillerato', scenarios: createDefaultAccessScenarios(), subjectInputs: createEmptyStoredSubjectInputs() }
  return {
    version: 1,
    updatedAt,
    activeCommunity: community,
    activeAccessPath: stored.selectedPath,
    exploration: { community, degreeGroupKey: null, degreeName: null, degreeId: null, universityId: null },
    scenarios: stored.scenarios,
    subjectInputs: stored.subjectInputs,
  }
}

export function reconcileOrientationStates(localState: OrientationStateV1 | null, serverState: OrientationStateV1 | null) {
  if (!localState) return serverState
  if (!serverState) return localState
  return Date.parse(localState.updatedAt) > Date.parse(serverState.updatedAt) ? localState : serverState
}

export function orientationStateContentKey(state: OrientationStateV1) {
  return JSON.stringify({
    version: state.version,
    activeCommunity: state.activeCommunity,
    activeAccessPath: state.activeAccessPath,
    exploration: state.exploration,
    scenarios: state.scenarios,
    subjectInputs: state.subjectInputs,
  })
}

export function mergeStoredSubjectInputs(previous: StoredSubjectInputs, visible: StoredSubjectInputs): StoredSubjectInputs {
  return Object.fromEntries(ACCESS_PATH_IDS.map(pathId => [pathId, { ...previous[pathId], ...visible[pathId] }])) as StoredSubjectInputs
}

export function toAccessPathStorage(state: OrientationStateV1): AccessPathStorageState {
  return { version: 1, selectedPath: state.activeAccessPath, scenarios: state.scenarios, subjectInputs: state.subjectInputs }
}
