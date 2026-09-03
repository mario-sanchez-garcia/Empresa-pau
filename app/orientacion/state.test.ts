import assert from 'node:assert/strict'
import test from 'node:test'
import { LatestStateAutosave } from './autosave.ts'
import { createOrientationState, mergeStoredSubjectInputs, orientationStateContentKey, parseOrientationState, reconcileOrientationStates } from './state.ts'

function validState(updatedAt = '2026-09-03T10:00:00.000Z') {
  const state = createOrientationState('Cataluña', null, updatedAt)
  state.activeAccessPath = 'international'
  state.scenarios.bachibac.route = 'spanish_pau'
  state.scenarios.ib = { pathId: 'ib', inputMode: 'subject_average', accreditedCau: null, subjectAverage: 5.8 }
  state.scenarios.international = { pathId: 'international', route: 'homologation_pce', accreditedCau: null, homologatedAverage: 8.4, pceGrades: [7, 8, null, 9] }
  state.exploration = {
    community: 'Cataluña',
    degreeGroupKey: 'medicina',
    degreeName: 'Medicina',
    degreeId: '07c12ba0-4ab8-4e13-9b83-85b0b529a278',
    universityId: '3a224872-bf00-4906-9c45-27331c38cff0',
  }
  state.subjectInputs.international.biologia = { grade: 8.5, enabled: true }
  return state
}

test('valida y normaliza el documento completo de estado v1', () => {
  const state = validState()
  assert.deepEqual(parseOrientationState(JSON.stringify(state)), state)
  assert.equal(parseOrientationState({ ...state, version: 2 }), null)
  assert.equal(parseOrientationState({ ...state, activeCommunity: 'Galicia' }), null)
  assert.equal(parseOrientationState({ ...state, exploration: { ...state.exploration, degreeId: null } }), null)
  assert.equal(parseOrientationState({ ...state, scenarios: { ...state.scenarios, ib: { ...state.scenarios.ib, subjectAverage: 9 } } }), null)
  assert.equal(parseOrientationState(`{"padding":"${'x'.repeat(70_000)}"}`), null)
})

test('reconcilia por updatedAt y el servidor gana los empates', () => {
  const older = validState('2026-09-03T09:00:00.000Z')
  const newer = validState('2026-09-03T11:00:00.000Z')
  const tiedServer = { ...newer, updatedAt: older.updatedAt }
  assert.equal(reconcileOrientationStates(newer, older), newer)
  assert.equal(reconcileOrientationStates(older, newer), newer)
  assert.equal(reconcileOrientationStates(older, tiedServer), tiedServer)
  assert.equal(reconcileOrientationStates(null, newer), newer)
})

test('fusiona materias visibles sin perder las guardadas de otras ofertas y omite updatedAt del content key', () => {
  const state = validState()
  const previous = structuredClone(state.subjectInputs)
  previous.spanish_bachillerato.fisica = { grade: 6, enabled: false }
  const visible = structuredClone(state.subjectInputs)
  visible.spanish_bachillerato = { quimica: { grade: 9, enabled: true } }
  const merged = mergeStoredSubjectInputs(previous, visible)
  assert.deepEqual(merged.spanish_bachillerato.fisica, { grade: 6, enabled: false })
  assert.deepEqual(merged.spanish_bachillerato.quimica, { grade: 9, enabled: true })
  assert.equal(orientationStateContentKey(state), orientationStateContentKey({ ...state, updatedAt: '2030-01-01T00:00:00.000Z' }))
})

test('el autosave agrupa cambios rápidos y guarda solo el último', async () => {
  const saved: number[] = []
  const statuses: string[] = []
  const autosave = new LatestStateAutosave<number>(async value => { saved.push(value) }, status => statuses.push(status), 5)
  autosave.update(1)
  autosave.update(2)
  autosave.update(3)
  await autosave.flush()
  assert.deepEqual(saved, [3])
  assert.deepEqual(statuses, ['saving', 'saved'])
  autosave.dispose()
})

test('el autosave serializa peticiones y aplica latest-wins', async () => {
  const saved: number[] = []
  let releaseFirst!: () => void
  let releaseSecond!: () => void
  let firstStarted!: () => void
  let secondStarted!: () => void
  const started = new Promise<void>(resolve => { firstStarted = resolve })
  const secondStartedPromise = new Promise<void>(resolve => { secondStarted = resolve })
  const firstGate = new Promise<void>(resolve => { releaseFirst = resolve })
  const secondGate = new Promise<void>(resolve => { releaseSecond = resolve })
  const autosave = new LatestStateAutosave<number>(async value => {
    saved.push(value)
    if (value === 1) { firstStarted(); await firstGate }
    if (value === 2) { secondStarted(); await secondGate }
  }, () => {}, 5)
  autosave.update(1)
  const flushing = autosave.flush()
  await started
  autosave.update(2)
  releaseFirst()
  await secondStartedPromise
  let flushResolved = false
  void flushing.then(() => { flushResolved = true })
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(flushResolved, false)
  releaseSecond()
  await flushing
  assert.deepEqual(saved, [1, 2])
  autosave.dispose()
})

test('un error conserva el cambio pendiente y retry lo vuelve a guardar', async () => {
  let attempts = 0
  const statuses: string[] = []
  const autosave = new LatestStateAutosave<number>(async () => {
    attempts += 1
    if (attempts === 1) throw new Error('network')
  }, status => statuses.push(status), 5)
  autosave.update(7)
  await autosave.flush()
  assert.equal(statuses.at(-1), 'error')
  autosave.retry()
  await autosave.flush()
  assert.equal(attempts, 2)
  assert.equal(statuses.at(-1), 'saved')
  autosave.dispose()
})
