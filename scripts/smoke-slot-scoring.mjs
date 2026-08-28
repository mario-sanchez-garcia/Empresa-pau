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
    process: { env: {} },
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
  ADAPTIVE_SLOT_SCORING_CONFIG,
  SLOT_SCORING_WEIGHTS,
  buildSchedulingBehaviorProfile,
  findBestScoredSlot,
  getSlotScoringDebug,
  scoreDateSlot,
} = loadSlotScoring()

const window = { start: '16:00', end: '21:00' }

function toMinutes(value) {
  const [h, m] = String(value).slice(0, 5).split(':').map(Number)
  return h * 60 + (m || 0)
}

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
    const why = row.valid ? [...row.reasons.slice(0, 3), ...row.personalReasons].join(', ') : row.rejectionReason
    const scoreParts = row.valid ? `base:${row.baseScore} personal:${row.personalAdjustment} final:${row.finalScore}` : ''
    console.log(`${row.start}-${row.end}  ${status}  ${scoreParts}  ${why}`)
  }
}

function behaviorRows({ early = { completed: 0, missed: 0 }, middle = { completed: 0, missed: 0 }, late = { completed: 0, missed: 0 }, durationLong = { completed: 0, missed: 0 }, continuity = { completed: 0, missed: 0 } } = {}) {
  const rows = []
  const add = (count, row) => {
    for (let i = 0; i < count; i += 1) rows.push({ scheduled_date: `2026-06-${String((rows.length % 20) + 1).padStart(2, '0')}`, ...row })
  }
  const completedTelemetry = { started_at: '2026-06-01T16:30:00.000Z', completed_at: '2026-06-01T17:00:00.000Z' }
  const missedTelemetry = { started_at: null, completed_at: null }
  add(early.completed, { status: 'completed', start_time: '16:30', end_time: '17:00', subject: 'matematicas_ii', mission_type: 'concept', ...completedTelemetry })
  add(early.missed, { status: 'missed', start_time: '16:30', end_time: '17:00', subject: 'matematicas_ii', mission_type: 'concept', ...missedTelemetry })
  add(middle.completed, { status: 'completed', start_time: '18:00', end_time: '18:30', subject: 'lengua', mission_type: 'concept', ...completedTelemetry })
  add(middle.missed, { status: 'missed', start_time: '18:00', end_time: '18:30', subject: 'lengua', mission_type: 'concept', ...missedTelemetry })
  add(late.completed, { status: 'completed', start_time: '20:00', end_time: '20:30', subject: 'historia_espana', mission_type: 'review', ...completedTelemetry })
  add(late.missed, { status: 'missed', start_time: '20:00', end_time: '20:30', subject: 'historia_espana', mission_type: 'review', ...missedTelemetry })
  add(durationLong.completed, { status: 'completed', start_time: '17:30', end_time: '18:45', subject: 'fisica', mission_type: 'pau_practice', ...completedTelemetry })
  add(durationLong.missed, { status: 'missed', start_time: '17:30', end_time: '18:45', subject: 'fisica', mission_type: 'pau_practice', ...missedTelemetry })
  for (let i = 0; i < continuity.completed; i += 1) {
    rows.push({ scheduled_date: `2026-07-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', subject: 'quimica', mission_type: 'concept', ...completedTelemetry })
    rows.push({ scheduled_date: `2026-07-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:30', end_time: '17:00', subject: 'quimica', mission_type: 'concept', ...completedTelemetry })
  }
  for (let i = 0; i < continuity.missed; i += 1) {
    rows.push({ scheduled_date: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', subject: 'quimica', mission_type: 'concept', ...completedTelemetry })
    rows.push({ scheduled_date: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`, status: 'missed', start_time: '16:30', end_time: '17:00', subject: 'quimica', mission_type: 'concept', ...missedTelemetry })
  }
  return rows
}

function telemetryBehaviorRows({
  early = { scheduled: 0, started: 0, completed: 0, postponed: 0, rescheduled: 0, delay: 0 },
  middle = { scheduled: 0, started: 0, completed: 0, postponed: 0, rescheduled: 0, delay: 0 },
  late = { scheduled: 0, started: 0, completed: 0, postponed: 0, rescheduled: 0, delay: 0 },
  durationMedium = { scheduled: 0, started: 0, completed: 0, actualRatio: 1 },
  durationExtraLong = { scheduled: 0, started: 0, completed: 0, actualRatio: 1 },
  continuity = { positive: 0, negative: 0 },
  conflictReschedules = 0,
} = {}) {
  const rows = []
  const addBucket = (bucket, spec, times) => {
    for (let i = 0; i < spec.scheduled; i += 1) {
      const started = i < spec.started
      const completed = i < spec.completed
      const postponed = i >= Math.max(spec.completed, spec.started) && i < Math.max(spec.completed, spec.started) + spec.postponed
      rows.push({
        scheduled_date: `2026-09-${String((rows.length % 20) + 1).padStart(2, '0')}`,
        status: completed ? 'completed' : postponed ? 'postponed' : 'missed',
        start_time: times.start,
        end_time: times.end,
        started_at: started ? `2026-09-01T${times.start}:00+02:00` : null,
        completed_at: completed ? `2026-09-01T${times.end}:00+02:00` : null,
        actual_duration_minutes: completed && started ? toMinutes(times.end) - toMinutes(times.start) : null,
        completion_delay_minutes: completed ? spec.delay : null,
        postpone_count: postponed ? 1 : 0,
        last_postponed_at: postponed ? '2026-09-01T18:00:00+02:00' : null,
        manual_reschedule_count: i < spec.rescheduled ? 1 : 0,
        conflict_reschedule_count: i < conflictReschedules ? 3 : 0,
        subject: bucket === 'early' ? 'matematicas_ii' : bucket === 'middle' ? 'lengua' : 'historia_espana',
        mission_type: 'concept',
      })
    }
  }
  addBucket('early', early, { start: '16:30', end: '17:00' })
  addBucket('middle', middle, { start: '18:00', end: '18:40' })
  addBucket('late', late, { start: '20:00', end: '20:30' })
  for (let i = 0; i < durationMedium.scheduled; i += 1) {
    const started = i < durationMedium.started
    const completed = i < durationMedium.completed
    rows.push({ scheduled_date: `2026-10-${String((i % 20) + 1).padStart(2, '0')}`, status: completed ? 'completed' : 'missed', start_time: '18:00', end_time: '18:40', started_at: started ? '2026-10-01T18:00:00+02:00' : null, actual_duration_minutes: completed ? Math.round(40 * durationMedium.actualRatio) : null, completion_delay_minutes: completed ? 5 : null, subject: 'fisica', mission_type: 'pau_practice' })
  }
  for (let i = 0; i < durationExtraLong.scheduled; i += 1) {
    const started = i < durationExtraLong.started
    const completed = i < durationExtraLong.completed
    const postponed = !completed && i % 2 === 0
    rows.push({ scheduled_date: `2026-11-${String((i % 20) + 1).padStart(2, '0')}`, status: completed ? 'completed' : postponed ? 'postponed' : 'missed', start_time: '17:00', end_time: '18:15', started_at: started ? '2026-11-01T17:00:00+01:00' : null, actual_duration_minutes: completed ? Math.round(75 * durationExtraLong.actualRatio) : null, completion_delay_minutes: completed ? 90 : null, postpone_count: postponed ? 1 : 0, subject: 'quimica', mission_type: 'pau_practice' })
  }
  for (let i = 0; i < continuity.positive; i += 1) {
    rows.push({ scheduled_date: `2026-12-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', started_at: '2026-12-01T16:00:00+01:00', subject: 'quimica', mission_type: 'concept' })
    rows.push({ scheduled_date: `2026-12-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:30', end_time: '17:00', started_at: '2026-12-01T16:30:00+01:00', subject: 'quimica', mission_type: 'concept' })
  }
  for (let i = 0; i < continuity.negative; i += 1) {
    rows.push({ scheduled_date: `2027-01-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', started_at: '2027-01-01T16:00:00+01:00', subject: 'quimica', mission_type: 'concept' })
    rows.push({ scheduled_date: `2027-01-${String((i % 20) + 1).padStart(2, '0')}`, status: 'postponed', start_time: '16:30', end_time: '17:00', postpone_count: 1, last_postponed_at: '2027-01-01T16:45:00+01:00', subject: 'quimica', mission_type: 'concept' })
  }
  return rows
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
assert('adaptive scoring keeps base personal and final score separated', scoringSource.includes('baseScore') && scoringSource.includes('personalAdjustment') && scoringSource.includes('finalScore') && scoringSource.includes('personalReasons'))
assert('adaptive profile is optional and centrally capped', scoringSource.includes('ADAPTIVE_SLOT_SCORING_CONFIG') && scoringSource.includes('maxPersonalAdjustment') && schedulerSource.includes('loadSchedulingBehaviorProfile'))

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

const newUserSlot = winner({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept' } })
const newUserSlotWithEmptyProfile = winner({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: buildSchedulingBehaviorProfile([]) } })
assert('adaptive new user matches base scorer', newUserSlot?.start === newUserSlotWithEmptyProfile?.start && newUserSlotWithEmptyProfile?.personalAdjustment === 0)

const tooLittleProfile = buildSchedulingBehaviorProfile(behaviorRows({ early: { completed: 2, missed: 0 } }))
const tooLittleSlot = winner({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: tooLittleProfile } })
assert('adaptive ignores tiny samples', tooLittleSlot?.personalAdjustment === 0)

const earlyProfile = buildSchedulingBehaviorProfile(behaviorRows({ early: { completed: 10, missed: 1 }, middle: { completed: 5, missed: 5 }, late: { completed: 4, missed: 7 } }))
const earlyRows = ranking({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: earlyProfile } })
const earlyCandidate = earlyRows.find(row => row.start === '16:30')
const lateCandidate = earlyRows.find(row => row.start === '20:00')
assert('adaptive early better gets small bonus', (earlyCandidate?.personalAdjustment ?? 0) > 0 && (earlyCandidate?.finalScore ?? 0) > (earlyCandidate?.baseScore ?? 0))
assert('adaptive late poor adherence gets moderate penalty', (lateCandidate?.personalAdjustment ?? 0) < 0 && lateCandidate?.personalReasons.some(reason => reason.includes('late') && reason.includes('negative')))

const latePreferenceProfile = buildSchedulingBehaviorProfile(behaviorRows({ early: { completed: 1, missed: 10 }, middle: { completed: 5, missed: 5 }, late: { completed: 10, missed: 1 } }))
const urgentRows = ranking({ duration: 45, busy: busyOutside(['16:00', '20:00'], 45), context: { subject: 'matematicas_ii', missionType: 'mock_exam', daysUntilExam: 1, behaviorProfile: latePreferenceProfile } })
assert('adaptive urgency still dominates personal preference', urgentRows.find(row => row.valid)?.start === '16:00')

const durationProfile = buildSchedulingBehaviorProfile(behaviorRows({ early: { completed: 8, missed: 4 }, middle: { completed: 8, missed: 4 }, durationLong: { completed: 1, missed: 7 } }))
const longSlot = winner({ duration: 75, busy: busyOutside(['17:30'], 75), context: { subject: 'fisica', missionType: 'pau_practice', behaviorProfile: durationProfile } })
assert('adaptive duration low adherence applies only as small adjustment', (longSlot?.personalAdjustment ?? 0) < 0 && Math.abs(longSlot?.personalAdjustment ?? 0) <= ADAPTIVE_SLOT_SCORING_CONFIG.maxPersonalAdjustment)

const continuityPositiveProfile = buildSchedulingBehaviorProfile(behaviorRows({ middle: { completed: 2, missed: 8 }, late: { completed: 2, missed: 8 }, continuity: { completed: 7, missed: 0 } }))
const continuityPositive = winner({ duration: 30, busy: [{ start: '16:00', end: '16:30', subject: 'quimica' }, ...busyOutside(['16:30'], 30)], context: { subject: 'quimica', missionType: 'concept', behaviorProfile: continuityPositiveProfile } })
assert('adaptive continuity positive adds a small reasoned bonus', continuityPositiveProfile.continuityAdjustment > 0 && continuityPositive?.personalReasons.includes('personal_continuity_positive'))

const continuityNegativeProfile = buildSchedulingBehaviorProfile(behaviorRows({ middle: { completed: 5, missed: 5 }, continuity: { completed: 0, missed: 7 } }))
const continuityNegative = winner({ duration: 30, busy: [{ start: '16:00', end: '16:30', subject: 'quimica' }, ...busyOutside(['16:30'], 30)], context: { subject: 'quimica', missionType: 'concept', behaviorProfile: continuityNegativeProfile } })
assert('adaptive continuity negative is visible and capped', (continuityNegative?.personalAdjustment ?? 0) < 0 && continuityNegative?.personalReasons.includes('personal_continuity_negative'))

const extremeProfile = {
  sampleSize: 60,
  timeOfDay: { early: 99, middle: 99, late: -99 },
  durationFit: { short: 99, medium: 99, long: -99, extraLong: -99 },
  continuityAdjustment: 99,
  confidence: 1,
}
const cappedSlot = winner({ duration: 30, busy: [{ start: '16:00', end: '16:30', subject: 'quimica' }, ...busyOutside(['16:30'], 30)], context: { subject: 'quimica', missionType: 'concept', behaviorProfile: extremeProfile } })
assert('adaptive profile extreme is capped', Math.abs(cappedSlot?.personalAdjustment ?? 0) <= ADAPTIVE_SLOT_SCORING_CONFIG.maxPersonalAdjustment)

const deterministicProfile = buildSchedulingBehaviorProfile(behaviorRows({ early: { completed: 10, missed: 1 }, middle: { completed: 5, missed: 5 }, late: { completed: 4, missed: 7 } }))
const deterministicA = winner({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: deterministicProfile } })
const deterministicB = winner({ duration: 30, busy: busyOutside(['16:30', '20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: deterministicProfile } })
assert('adaptive scoring remains deterministic', deterministicA?.start === deterministicB?.start && deterministicA?.score === deterministicB?.score && deterministicA?.personalAdjustment === deterministicB?.personalAdjustment)

const startRateProfile = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  early: { scheduled: 12, started: 11, completed: 9, postponed: 0, rescheduled: 0, delay: 5 },
  late: { scheduled: 12, started: 5, completed: 4, postponed: 0, rescheduled: 0, delay: 5 },
}))
assert('adaptive telemetry A early high start rate gives small bonus', startRateProfile.timeOfDay.early > 0 && startRateProfile.metrics.timeOfDay.early.startRate > startRateProfile.metrics.timeOfDay.late.startRate)

const sameCompletionProfile = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  early: { scheduled: 10, started: 9, completed: 6, postponed: 0, rescheduled: 0, delay: 5 },
  late: { scheduled: 10, started: 6, completed: 6, postponed: 0, rescheduled: 0, delay: 5 },
}))
assert('adaptive telemetry B separates start rate from completion after start', sameCompletionProfile.metrics.timeOfDay.late.completionRateAfterStart > sameCompletionProfile.metrics.timeOfDay.early.completionRateAfterStart && sameCompletionProfile.metrics.timeOfDay.late.startRate < sameCompletionProfile.metrics.timeOfDay.early.startRate)

const postponeLateProfile = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  early: { scheduled: 8, started: 7, completed: 6, postponed: 0, rescheduled: 0, delay: 5 },
  late: { scheduled: 8, started: 3, completed: 2, postponed: 4, rescheduled: 0, delay: 5 },
}))
assert('adaptive telemetry C manual postpone late is a moderate penalty', postponeLateProfile.timeOfDay.late < 0 && postponeLateProfile.timeOfDayReasons.late.includes('personal_postpone_rate_negative') && Math.abs(postponeLateProfile.timeOfDay.late) <= 5)

const conflictA = buildSchedulingBehaviorProfile(telemetryBehaviorRows({ late: { scheduled: 8, started: 6, completed: 5, postponed: 0, rescheduled: 0, delay: 5 }, conflictReschedules: 0 }))
const conflictB = buildSchedulingBehaviorProfile(telemetryBehaviorRows({ late: { scheduled: 8, started: 6, completed: 5, postponed: 0, rescheduled: 0, delay: 5 }, conflictReschedules: 8 }))
assert('adaptive telemetry D conflict reschedule has zero personal impact', JSON.stringify(conflictA.timeOfDay) === JSON.stringify(conflictB.timeOfDay))

const manualRescheduleProfile = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  early: { scheduled: 8, started: 7, completed: 6, postponed: 0, rescheduled: 0, delay: 5 },
  late: { scheduled: 8, started: 7, completed: 6, postponed: 0, rescheduled: 5, delay: 5 },
}))
assert('adaptive telemetry E manual reschedule is a weak penalty', manualRescheduleProfile.timeOfDay.late < 0 && manualRescheduleProfile.timeOfDayReasons.late.includes('personal_manual_reschedule_negative') && Math.abs(manualRescheduleProfile.timeOfDay.late) <= 5)

const durationTelemetryProfile = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  durationMedium: { scheduled: 8, started: 8, completed: 7, actualRatio: 1.05 },
  durationExtraLong: { scheduled: 8, started: 5, completed: 2, actualRatio: 2.2 },
}))
assert('adaptive telemetry F duration real favors fitting medium bucket', durationTelemetryProfile.durationFit.medium > 0 && durationTelemetryProfile.durationFit.extraLong < 0)

const continuityTelemetryPositive = buildSchedulingBehaviorProfile(telemetryBehaviorRows({ continuity: { positive: 7, negative: 0 } }))
assert('adaptive telemetry G continuity positive is visible', continuityTelemetryPositive.continuityAdjustment > 0 && continuityTelemetryPositive.continuityReason === 'personal_continuity_positive')

const continuityTelemetryNegative = buildSchedulingBehaviorProfile(telemetryBehaviorRows({ continuity: { positive: 0, negative: 7 } }))
assert('adaptive telemetry H continuity fatigue is visible', continuityTelemetryNegative.continuityAdjustment < 0 && continuityTelemetryNegative.continuityReason === 'personal_continuity_negative')

const sparseTelemetry = buildSchedulingBehaviorProfile(telemetryBehaviorRows({ early: { scheduled: 3, started: 3, completed: 3, postponed: 0, rescheduled: 0, delay: 0 } }))
const sparseTelemetrySlot = winner({ duration: 30, busy: busyOutside(['16:30'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: sparseTelemetry } })
assert('adaptive telemetry I sparse data keeps adjustment zero', sparseTelemetrySlot?.personalAdjustment === 0)

const correlatedTelemetry = buildSchedulingBehaviorProfile(telemetryBehaviorRows({
  early: { scheduled: 10, started: 9, completed: 8, postponed: 0, rescheduled: 0, delay: 0 },
  late: { scheduled: 10, started: 2, completed: 1, postponed: 6, rescheduled: 5, delay: 140 },
}))
const correlatedLateSlot = winner({ duration: 30, busy: busyOutside(['20:00'], 30), context: { subject: 'lengua', missionType: 'concept', behaviorProfile: correlatedTelemetry } })
assert('adaptive telemetry J correlated negative signals remain capped', Math.abs(correlatedLateSlot?.personalAdjustment ?? 0) <= ADAPTIVE_SLOT_SCORING_CONFIG.maxPersonalAdjustment && correlatedTelemetry.timeOfDay.late >= -5)

console.log('\nPesos actuales:', JSON.stringify(SLOT_SCORING_WEIGHTS, null, 2))
console.log('Config adaptativa:', JSON.stringify(ADAPTIVE_SLOT_SCORING_CONFIG, null, 2))
