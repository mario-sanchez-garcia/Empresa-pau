import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import ts from 'typescript'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function loadSlotScoring() {
  const source = read('app/lib/camino/slotScoring.ts')
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText
  const module = { exports: {} }
  const context = {
    exports: module.exports,
    module,
    require: () => ({}),
    console,
  }
  vm.runInNewContext(js, context, { filename: 'slotScoring.ts' })
  return module.exports
}

function assert(name, condition, details = '') {
  if (!condition) {
    console.error(`FAIL ${name}${details ? ` — ${details}` : ''}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

const scoringSource = read('app/lib/camino/slotScoring.ts')
const schedulerSource = read('app/lib/camino/scheduleTimeSlot.ts')
const reorganizeSource = read('app/api/camino/calendar-conflicts/reorganize/route.ts')
const {
  SLOT_SCORING_WEIGHTS,
  findBestScoredSlot,
  getSlotScoringDebug,
  scoreDateSlot,
} = loadSlotScoring()

const window = { start: '16:00', end: '21:00' }

function busyOutside(starts, duration = 45) {
  const allowed = new Set(starts)
  const busy = []
  for (let h = 16; h < 21; h += 1) {
    for (const m of [0, 15, 30, 45]) {
      const start = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
      const endMinutes = h * 60 + m + 15
      const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
      const allowedForCandidate = [...allowed].some(candidate => {
        const [ch, cm] = candidate.split(':').map(Number)
        const cStart = ch * 60 + cm
        const cEnd = cStart + duration
        const s = h * 60 + m
        const e = endMinutes
        return Math.max(cStart, s) < Math.min(cEnd, e)
      })
      if (!allowedForCandidate) busy.push({ start, end })
    }
  }
  return busy
}

function winner(input) {
  return findBestScoredSlot(input.duration, input.busy ?? [], input.window ?? window, input.context ?? {})
}

function ranking(input) {
  return getSlotScoringDebug(input.duration, input.busy ?? [], input.window ?? window, input.context ?? {})
}

function printScenario(label, input) {
  const rows = ranking(input)
  const win = rows.find(row => row.valid)
  console.log(`\n[${label}] WINNER: ${win ? `${win.start}-${win.end} (${win.score})` : 'sin hueco'}`)
  for (const row of rows.slice(0, 6)) {
    const status = row.valid ? String(row.score).padStart(6, ' ') : 'invalid'
    const why = row.valid ? row.reasons.slice(0, 4).join(', ') : row.rejectionReason
    console.log(`${row.start}-${row.end}  ${status}  ${why}`)
  }
}

const scenarios = [
  {
    label: 'A Simulacro urgente',
    input: { duration: 45, busy: busyOutside(['16:00', '18:00', '20:00']), context: { subject: 'matematicas_ii', missionType: 'mock_exam', daysUntilExam: 3, priority: 'high' } },
    expect: '16:00',
  },
  {
    label: 'B Repaso ligero',
    input: { duration: 30, busy: busyOutside(['16:00', '18:00', '20:00'], 30), context: { subject: 'historia_espana', missionType: 'review' } },
    expect: '20:00',
  },
  {
    label: 'C Día saturado',
    custom() {
      const tue = scoreDateSlot({ date: '2026-09-15', slot: { start: '16:00', end: '16:30' }, busy: [{ start: '17:00', end: '20:00' }], context: { subject: 'lengua', missionType: 'concept' }, dateIndex: 0 })
      const wed = scoreDateSlot({ date: '2026-09-16', slot: { start: '16:00', end: '16:30' }, busy: [{ start: '18:00', end: '19:00' }], context: { subject: 'lengua', missionType: 'concept' }, dateIndex: 1 })
      console.log(`\n[C Día saturado] Tue=${tue.score} Wed=${wed.score}`)
      assert('C prefers lower daily load day', wed.score > tue.score, `Tue=${tue.score} Wed=${wed.score}`)
    },
  },
  {
    label: 'D Urgencia vence variedad',
    input: { duration: 45, busy: [{ start: '17:00', end: '17:30', subject: 'matematicas_ii' }, ...busyOutside(['16:00', '20:00'], 45)], context: { subject: 'matematicas_ii', missionType: 'pau_practice', daysUntilExam: 1 } },
    expect: '16:00',
  },
  {
    label: 'E Continuidad útil',
    input: { duration: 30, busy: [{ start: '18:00', end: '18:30', subject: 'historia_espana' }, ...busyOutside(['17:00', '18:30', '20:00'], 30)], context: { subject: 'historia_espana', missionType: 'concept' } },
    expect: '18:30',
  },
  {
    label: 'F Continuidad no domina',
    input: { duration: 30, busy: [{ start: '16:00', end: '18:00', subject: 'historia_espana' }, ...busyOutside(['18:00', '20:00'], 30)], context: { subject: 'historia_espana', missionType: 'concept' } },
    expect: '20:00',
  },
  {
    label: 'G Alta carga tardía',
    input: { duration: 45, busy: busyOutside(['16:00', '20:00'], 45), context: { subject: 'fisica', missionType: 'pau_practice' } },
    expect: '16:00',
  },
  {
    label: 'H Google busy',
    input: { duration: 45, busy: [{ start: '16:00', end: '17:00' }, ...busyOutside(['16:00', '18:00', '20:00'], 45)], context: { subject: 'matematicas_ii', missionType: 'mock_exam', daysUntilExam: 3 } },
    expect: '18:00',
    invalid: '16:00',
  },
  {
    label: 'I Tiny gap',
    input: { duration: 30, busy: [{ start: '16:45', end: '17:15' }, ...busyOutside(['16:00', '18:00'], 30)], context: { subject: 'lengua', missionType: 'concept' } },
    expect: '18:00',
  },
  {
    label: 'J Sin hueco',
    input: { duration: 30, busy: [{ start: '16:00', end: '21:00' }], context: { subject: 'quimica', missionType: 'pau_practice' } },
    expect: null,
  },
]

assert('weights remain centralized in slotScoring', scoringSource.includes('export const SLOT_SCORING_WEIGHTS') && !schedulerSource.includes('examWithin7Days'))
assert('breakdown exposes valid invalid score reasons components and rejectionReason', scoringSource.includes('export type CandidateScoreBreakdown') && scoringSource.includes('components: CandidateScoreComponents') && scoringSource.includes('rejectionReason'))
assert('debug helper returns ranked candidates including invalid entries', scoringSource.includes('export function getSlotScoringDebug') && schedulerSource.includes('debugBestCandidates') && scoringSource.includes('time_conflict'))
assert('Reorganizar uses shared scorer helper', reorganizeSource.includes('placeBestAcrossDates') && !reorganizeSource.includes('createDayScheduler'))
assert('scoring is deterministic and has no randomness', !scoringSource.includes('Math.random') && scoringSource.includes("a.start.localeCompare(b.start)"))
assert('long same-subject streak is visible in calibration reasons', scoringSource.includes('long_same_subject_streak_penalty'))

for (const scenario of scenarios) {
  if (scenario.custom) {
    scenario.custom()
    continue
  }
  printScenario(scenario.label, scenario.input)
  const win = winner(scenario.input)
  assert(`${scenario.label} winner`, (win?.start ?? null) === scenario.expect, `got ${win?.start ?? 'null'}`)
  if (scenario.invalid) {
    const invalid = ranking(scenario.input).find(row => row.start === scenario.invalid)
    assert(`${scenario.label} invalid candidate is explained`, invalid?.valid === false && invalid.rejectionReason === 'time_conflict')
  }
}

const boundary7 = winner({ duration: 30, busy: busyOutside(['16:00'], 30), context: { subject: 'matematicas_ii', missionType: 'pau_practice', daysUntilExam: 7 } })
assert('boundary exactly 7 days receives urgent reason', boundary7?.reasons.includes('exam_within_7_days'))

const boundary14 = winner({ duration: 30, busy: busyOutside(['16:00'], 30), context: { subject: 'matematicas_ii', missionType: 'pau_practice', daysUntilExam: 14 } })
assert('boundary exactly 14 days receives high reason', boundary14?.reasons.includes('exam_within_14_days'))

for (const duration of [30, 45, 60]) {
  const slot = winner({ duration, busy: busyOutside(['20:00'], duration), context: { subject: 'lengua', missionType: 'concept' } })
  assert(`duration ${duration} fits inside window`, slot?.start === '20:00')
}

const contiguous = ranking({ duration: 30, busy: [{ start: '16:00', end: '16:30' }, ...busyOutside(['16:30'], 30)], context: { subject: 'lengua', missionType: 'concept' } })
assert('contiguous slots are valid, not conflicts', contiguous.find(row => row.start === '16:30')?.valid === true)

const tie1 = winner({ duration: 30, busy: busyOutside(['18:00', '18:15'], 30), context: { subject: 'lengua', missionType: 'concept' } })
const tie2 = winner({ duration: 30, busy: busyOutside(['18:00', '18:15'], 30), context: { subject: 'lengua', missionType: 'concept' } })
assert('same input returns same output', tie1?.start === tie2?.start && tie1?.score === tie2?.score)

const finalSlot = ranking({ duration: 30, busy: busyOutside(['20:30'], 30), context: { subject: 'historia_espana', missionType: 'review' } }).find(row => row.start === '20:30')
assert('candidate exactly ending at window end is valid', finalSlot?.valid === true && finalSlot.end === '21:00')

console.log('\nPesos actuales:', JSON.stringify(SLOT_SCORING_WEIGHTS, null, 2))
