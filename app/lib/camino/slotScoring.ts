import { type TimeRange } from './scheduleTimeSlot'

export type MissionSlotScoringContext = {
  date?: string
  subject?: string | null
  missionType?: string | null
  daysUntilExam?: number | null
  deadlineDate?: string | null
  priority?: string | null
  behaviorProfile?: SchedulingBehaviorProfile | null
}

export type TimeBucket = 'early' | 'middle' | 'late'
export type DurationBucket = 'short' | 'medium' | 'long' | 'extraLong'
export type BehaviorProfileSourceRow = {
  scheduled_date?: string | null
  status?: string | null
  start_time?: string | null
  end_time?: string | null
  subject?: string | null
  mission_type?: string | null
}
export type SchedulingBehaviorProfile = {
  sampleSize: number
  timeOfDay: Record<TimeBucket, number>
  durationFit: Record<DurationBucket, number>
  continuityAdjustment: number
  confidence: number
}
export type ScoredTimeSlot = TimeRange & {
  score: number
  reasons: string[]
  baseScore?: number
  personalAdjustment?: number
  finalScore?: number
  personalReasons?: string[]
}
export type CandidateScoreComponents = {
  urgency: number
  difficultyFit: number
  dailyLoad: number
  subjectRepetition: number
  continuity: number
  tinyGap: number
  timeOfDay: number
  personal: number
  tieBreak: number
}
export type CandidateScoreBreakdown = TimeRange & {
  valid: boolean
  score: number | null
  baseScore: number | null
  personalAdjustment: number
  finalScore: number | null
  reasons: string[]
  personalReasons: string[]
  components: CandidateScoreComponents
  rejectionReason?: string
}

export const ADAPTIVE_SLOT_SCORING_CONFIG = {
  enabled: process.env.ENABLE_ADAPTIVE_SLOT_SCORING !== 'false',
  historyLimit: 60,
  maxPersonalAdjustment: 8,
  minSampleTimeBucket: 6,
  minSampleDurationBucket: 6,
  minSampleContinuity: 5,
  smoothingPriorRate: 0.65,
  smoothingPriorWeight: 4,
  timeBucketScale: 18,
  durationBucketScale: 14,
  continuityScale: 10,
  minimumMeaningfulDelta: 0.12,
} as const

export const SLOT_SCORING_WEIGHTS = {
  baseScore: 100,
  candidateStepMinutes: 15,
  examWithin7Days: 42,
  examWithin14Days: 24,
  highPriorityExam: 12,
  mediumPriorityExam: 6,
  maxDeadlineProximityPenalty: -28,
  highLoadEarly: 18,
  highLoadLatePenalty: -16,
  lowLoadLate: 10,
  lowLoadEarlyPenalty: -4,
  mediumMiddle: 6,
  dailyLoadHourPenalty: -5,
  repeatedSubjectPenalty: -7,
  excessiveSubjectPenalty: -10,
  continuityBonus: 6,
  longContinuityPenalty: -12,
  tinyGapPenalty: -8,
  deadlineProximityPenalty: -4,
  deterministicEarlyTieBreak: -0.01,
  highLoadEarlyMaxPosition: 0.35,
  lateSlotMinPosition: 0.72,
  lowLoadLateMinPosition: 0.62,
  lowLoadEarlyMaxPosition: 0.25,
  mediumSlotMinPosition: 0.28,
  mediumSlotMaxPosition: 0.72,
} as const

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(':').map(Number)
  return h * 60 + (m || 0)
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function scoringStudyWindowFor(dateStr: string): TimeRange {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return dow === 0 || dow === 6 ? { start: '10:00', end: '21:00' } : { start: '16:00', end: '22:00' }
}

function overlaps(a: { start: number; end: number }, b: { start: number; end: number }) {
  return Math.max(a.start, b.start) < Math.min(a.end, b.end)
}

function dateDiffDays(from: string, to: string) {
  return Math.floor((new Date(`${to}T12:00:00Z`).getTime() - new Date(`${from}T12:00:00Z`).getTime()) / 86400000)
}

function loadLevel(context: MissionSlotScoringContext): 'high' | 'medium' | 'low' {
  const missionType = context.missionType ?? ''
  const subject = context.subject ?? ''
  if (missionType === 'review') return 'low'
  if (missionType === 'comment_text') return 'medium'
  if (missionType === 'partial_practice' || missionType === 'pau_practice' || missionType === 'final_mini_mock' || missionType === 'mock_exam') return 'high'
  if (subject === 'matematicas_ii' || subject === 'matematicas_ccss' || subject === 'fisica' || subject === 'quimica') return 'high'
  return 'medium'
}

function tinyGapPenalty(candidate: { start: number; end: number }, busy: Array<{ start: number; end: number }>) {
  let penalty = 0
  for (const item of busy) {
    const before = candidate.start - item.end
    const after = item.start - candidate.end
    if (before > 0 && before <= SLOT_SCORING_WEIGHTS.candidateStepMinutes) penalty += SLOT_SCORING_WEIGHTS.tinyGapPenalty
    if (after > 0 && after <= SLOT_SCORING_WEIGHTS.candidateStepMinutes) penalty += SLOT_SCORING_WEIGHTS.tinyGapPenalty
  }
  return penalty
}

function emptyComponents(): CandidateScoreComponents {
  return {
    urgency: 0,
    difficultyFit: 0,
    dailyLoad: 0,
    subjectRepetition: 0,
    continuity: 0,
    tinyGap: 0,
    timeOfDay: 0,
    personal: 0,
    tieBreak: 0,
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function rounded(value: number) {
  return Math.round(value * 100) / 100
}

function durationMinutes(startTime: string | null | undefined, endTime: string | null | undefined) {
  if (!startTime || !endTime) return null
  const diff = toMinutes(endTime) - toMinutes(startTime)
  return diff > 0 ? diff : null
}

function timeBucketFor(startTime: string, window: TimeRange): TimeBucket {
  const start = toMinutes(startTime)
  const windowStart = toMinutes(window.start)
  const windowEnd = toMinutes(window.end)
  const position = (start - windowStart) / Math.max(1, windowEnd - windowStart)
  if (position < 1 / 3) return 'early'
  if (position < 2 / 3) return 'middle'
  return 'late'
}

function durationBucketFor(minutes: number): DurationBucket {
  if (minutes <= 30) return 'short'
  if (minutes <= 45) return 'medium'
  if (minutes <= 60) return 'long'
  return 'extraLong'
}

function smoothedRate(completed: number, total: number) {
  const { smoothingPriorRate, smoothingPriorWeight } = ADAPTIVE_SLOT_SCORING_CONFIG
  return (completed + smoothingPriorRate * smoothingPriorWeight) / (total + smoothingPriorWeight)
}

function bucketAdjustment(completed: number, total: number, baseline: number, minSample: number, scale: number) {
  if (total < minSample) return 0
  const delta = smoothedRate(completed, total) - baseline
  if (Math.abs(delta) < ADAPTIVE_SLOT_SCORING_CONFIG.minimumMeaningfulDelta) return 0
  return Math.round(delta * scale)
}

export function buildSchedulingBehaviorProfile(rows: BehaviorProfileSourceRow[]): SchedulingBehaviorProfile {
  const stats = {
    timeOfDay: {
      early: { completed: 0, total: 0 },
      middle: { completed: 0, total: 0 },
      late: { completed: 0, total: 0 },
    },
    durationFit: {
      short: { completed: 0, total: 0 },
      medium: { completed: 0, total: 0 },
      long: { completed: 0, total: 0 },
      extraLong: { completed: 0, total: 0 },
    },
    continuity: { completed: 0, total: 0 },
    totalCompleted: 0,
    total: 0,
  }
  const relevant = rows
    .filter(row => row.start_time && row.end_time && ['completed', 'missed', 'postponed'].includes(row.status ?? ''))
    .slice(0, ADAPTIVE_SLOT_SCORING_CONFIG.historyLimit)
    .sort((a, b) => `${a.scheduled_date ?? ''} ${a.start_time ?? ''}`.localeCompare(`${b.scheduled_date ?? ''} ${b.start_time ?? ''}`))

  for (let index = 0; index < relevant.length; index += 1) {
    const row = relevant[index]
    const minutes = durationMinutes(row.start_time, row.end_time)
    if (!row.start_time || !row.scheduled_date || !minutes) continue
    const completed = row.status === 'completed'
    const window = scoringStudyWindowFor(row.scheduled_date)
    const timeBucket = timeBucketFor(row.start_time, window)
    const durationBucket = durationBucketFor(minutes)
    stats.timeOfDay[timeBucket].total += 1
    stats.durationFit[durationBucket].total += 1
    stats.total += 1
    if (completed) {
      stats.timeOfDay[timeBucket].completed += 1
      stats.durationFit[durationBucket].completed += 1
      stats.totalCompleted += 1
    }

    const previous = relevant[index - 1]
    if (previous?.subject && row.subject && previous.subject === row.subject && previous.scheduled_date === row.scheduled_date) {
      stats.continuity.total += 1
      if (completed) stats.continuity.completed += 1
    }
  }

  const baseline = stats.total > 0 ? smoothedRate(stats.totalCompleted, stats.total) : ADAPTIVE_SLOT_SCORING_CONFIG.smoothingPriorRate
  const timeOfDay = {
    early: bucketAdjustment(stats.timeOfDay.early.completed, stats.timeOfDay.early.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket, ADAPTIVE_SLOT_SCORING_CONFIG.timeBucketScale),
    middle: bucketAdjustment(stats.timeOfDay.middle.completed, stats.timeOfDay.middle.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket, ADAPTIVE_SLOT_SCORING_CONFIG.timeBucketScale),
    late: bucketAdjustment(stats.timeOfDay.late.completed, stats.timeOfDay.late.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket, ADAPTIVE_SLOT_SCORING_CONFIG.timeBucketScale),
  }
  const durationFit = {
    short: bucketAdjustment(stats.durationFit.short.completed, stats.durationFit.short.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket, ADAPTIVE_SLOT_SCORING_CONFIG.durationBucketScale),
    medium: bucketAdjustment(stats.durationFit.medium.completed, stats.durationFit.medium.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket, ADAPTIVE_SLOT_SCORING_CONFIG.durationBucketScale),
    long: bucketAdjustment(stats.durationFit.long.completed, stats.durationFit.long.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket, ADAPTIVE_SLOT_SCORING_CONFIG.durationBucketScale),
    extraLong: bucketAdjustment(stats.durationFit.extraLong.completed, stats.durationFit.extraLong.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket, ADAPTIVE_SLOT_SCORING_CONFIG.durationBucketScale),
  }
  const continuityAdjustment = bucketAdjustment(stats.continuity.completed, stats.continuity.total, baseline, ADAPTIVE_SLOT_SCORING_CONFIG.minSampleContinuity, ADAPTIVE_SLOT_SCORING_CONFIG.continuityScale)
  const confidence = clamp(stats.total / ADAPTIVE_SLOT_SCORING_CONFIG.historyLimit, 0, 1)
  return {
    sampleSize: stats.total,
    timeOfDay,
    durationFit,
    continuityAdjustment,
    confidence: rounded(confidence),
  }
}

function capPersonalAdjustment(value: number) {
  return clamp(value, -ADAPTIVE_SLOT_SCORING_CONFIG.maxPersonalAdjustment, ADAPTIVE_SLOT_SCORING_CONFIG.maxPersonalAdjustment)
}

function scorePersonalAdjustment(input: {
  candidate: TimeRange
  window: TimeRange
  durationMinutes: number
  touchesSameSubject: boolean
  context: MissionSlotScoringContext
}): { adjustment: number; reasons: string[] } {
  if (!ADAPTIVE_SLOT_SCORING_CONFIG.enabled) return { adjustment: 0, reasons: [] }
  const profile = input.context.behaviorProfile
  if (!profile || profile.sampleSize <= 0) return { adjustment: 0, reasons: [] }
  let adjustment = 0
  const reasons: string[] = []
  const timeBucket = timeBucketFor(input.candidate.start, input.window)
  const timeAdjustment = profile.timeOfDay[timeBucket] ?? 0
  if (timeAdjustment) {
    adjustment += timeAdjustment
    reasons.push(`personal_${timeBucket}_${timeAdjustment > 0 ? 'positive' : 'negative'}`)
  }
  const durationBucket = durationBucketFor(input.durationMinutes)
  const durationAdjustment = profile.durationFit[durationBucket] ?? 0
  if (durationAdjustment) {
    adjustment += durationAdjustment
    reasons.push(durationAdjustment > 0 ? 'personal_duration_fit' : 'personal_duration_low_adherence')
  }
  if (input.touchesSameSubject && profile.continuityAdjustment) {
    adjustment += profile.continuityAdjustment
    reasons.push(profile.continuityAdjustment > 0 ? 'personal_continuity_positive' : 'personal_continuity_negative')
  }
  return { adjustment: capPersonalAdjustment(adjustment), reasons }
}

export function scoreCandidateSlotBreakdown(input: {
  candidate: TimeRange
  busy: TimeRange[]
  window: TimeRange
  context?: MissionSlotScoringContext
}): CandidateScoreBreakdown {
  const context = input.context ?? {}
  const reasons: string[] = []
  const components = emptyComponents()
  const start = toMinutes(input.candidate.start)
  const end = toMinutes(input.candidate.end)
  const windowStart = toMinutes(input.window.start)
  const windowEnd = toMinutes(input.window.end)
  const numericBusy = input.busy.map(item => ({ start: toMinutes(item.start), end: toMinutes(item.end), subject: item.subject }))
  const candidateRange = { start, end }

  const invalid = (rejectionReason: string): CandidateScoreBreakdown => ({
    start: input.candidate.start,
    end: input.candidate.end,
    valid: false,
    score: null,
    baseScore: null,
    personalAdjustment: 0,
    finalScore: null,
    reasons: [rejectionReason],
    personalReasons: [],
    components,
    rejectionReason,
  })
  if (end <= start) return invalid('invalid_duration')
  if (start < windowStart || end > windowEnd) return invalid('outside_study_window')
  if (numericBusy.some(item => overlaps(candidateRange, item))) return invalid('time_conflict')

  const windowLength = Math.max(1, windowEnd - windowStart)
  const position = (start - windowStart) / windowLength
  const busyMinutes = input.busy.reduce((sum, item) => {
    const busyStart = Math.max(toMinutes(item.start), windowStart)
    const busyEnd = Math.min(toMinutes(item.end), windowEnd)
    return busyEnd > busyStart ? sum + (busyEnd - busyStart) : sum
  }, 0)
  const sameSubjectBusy = context.subject
    ? input.busy.filter(item => item.subject === context.subject).length
    : 0
  const sameSubjectMinutes = context.subject
    ? input.busy.reduce((sum, item) => item.subject === context.subject ? sum + Math.max(0, toMinutes(item.end) - toMinutes(item.start)) : sum, 0)
    : 0
  const load = loadLevel(context)
  let score = SLOT_SCORING_WEIGHTS.baseScore

  const add = (component: keyof CandidateScoreComponents, amount: number, reason: string) => {
    components[component] += amount
    score += amount
    reasons.push(reason)
  }

  const daysUntilExam = context.daysUntilExam ?? (context.date && context.deadlineDate ? dateDiffDays(context.date, context.deadlineDate) : null)
  if (daysUntilExam != null) {
    if (daysUntilExam < 0) return invalid('after_deadline')
    if (daysUntilExam <= 7) add('urgency', SLOT_SCORING_WEIGHTS.examWithin7Days, 'exam_within_7_days')
    else if (daysUntilExam <= 14) add('urgency', SLOT_SCORING_WEIGHTS.examWithin14Days, 'exam_within_14_days')
    add('urgency', Math.max(SLOT_SCORING_WEIGHTS.maxDeadlineProximityPenalty, daysUntilExam * SLOT_SCORING_WEIGHTS.deadlineProximityPenalty), 'deadline_proximity')
  }

  if (context.priority === 'alta' || context.priority === 'high' || context.priority === 'urgente') {
    add('urgency', SLOT_SCORING_WEIGHTS.highPriorityExam, 'high_priority_exam')
  } else if (context.priority === 'media' || context.priority === 'medium' || context.priority === 'normal') {
    add('urgency', SLOT_SCORING_WEIGHTS.mediumPriorityExam, 'medium_priority_exam')
  }

  if (load === 'high') {
    if (position <= SLOT_SCORING_WEIGHTS.highLoadEarlyMaxPosition) add('difficultyFit', SLOT_SCORING_WEIGHTS.highLoadEarly, 'high_load_early_slot')
    else if (position >= SLOT_SCORING_WEIGHTS.lateSlotMinPosition) add('difficultyFit', SLOT_SCORING_WEIGHTS.highLoadLatePenalty, 'high_load_late_penalty')
  } else if (load === 'low') {
    if (position >= SLOT_SCORING_WEIGHTS.lowLoadLateMinPosition) add('difficultyFit', SLOT_SCORING_WEIGHTS.lowLoadLate, 'low_load_late_slot')
    else if (position <= SLOT_SCORING_WEIGHTS.lowLoadEarlyMaxPosition) add('difficultyFit', SLOT_SCORING_WEIGHTS.lowLoadEarlyPenalty, 'low_load_early_penalty')
  } else if (position >= SLOT_SCORING_WEIGHTS.mediumSlotMinPosition && position <= SLOT_SCORING_WEIGHTS.mediumSlotMaxPosition) {
    add('difficultyFit', SLOT_SCORING_WEIGHTS.mediumMiddle, 'medium_load_middle_slot')
  }

  const dailyLoadPenalty = Math.floor(busyMinutes / 60) * SLOT_SCORING_WEIGHTS.dailyLoadHourPenalty
  if (dailyLoadPenalty) add('dailyLoad', dailyLoadPenalty, 'daily_load_penalty')

  if (sameSubjectBusy >= 3 && !(daysUntilExam != null && daysUntilExam <= 7)) {
    add('subjectRepetition', SLOT_SCORING_WEIGHTS.excessiveSubjectPenalty, 'excessive_same_subject_penalty')
  } else if (sameSubjectBusy >= 1 && !(daysUntilExam != null && daysUntilExam <= 7)) {
    add('subjectRepetition', sameSubjectBusy * SLOT_SCORING_WEIGHTS.repeatedSubjectPenalty, 'repeated_subject_penalty')
  }

  const touchesSameSubject = Boolean(context.subject && numericBusy.some(item => item.subject === context.subject && (item.end === start || item.start === end)))
  if (touchesSameSubject && sameSubjectMinutes < 90) {
    add('continuity', SLOT_SCORING_WEIGHTS.continuityBonus, 'same_subject_continuity')
  } else if (touchesSameSubject && sameSubjectMinutes >= 90) {
    add('continuity', SLOT_SCORING_WEIGHTS.longContinuityPenalty, 'long_same_subject_streak_penalty')
  }

  const gapPenalty = tinyGapPenalty({ start, end }, numericBusy)
  if (gapPenalty) add('tinyGap', gapPenalty, 'tiny_gap_penalty')

  components.tieBreak = start * SLOT_SCORING_WEIGHTS.deterministicEarlyTieBreak
  score += components.tieBreak
  reasons.push(`load_${load}`)
  const baseScore = rounded(score)
  const personal = scorePersonalAdjustment({
    candidate: input.candidate,
    window: input.window,
    durationMinutes: end - start,
    touchesSameSubject,
    context,
  })
  components.personal = personal.adjustment
  const finalScore = rounded(baseScore + personal.adjustment)
  return {
    start: input.candidate.start,
    end: input.candidate.end,
    valid: true,
    score: finalScore,
    baseScore,
    personalAdjustment: personal.adjustment,
    finalScore,
    reasons,
    personalReasons: personal.reasons,
    components,
  }
}

export function scoreCandidateSlot(input: {
  candidate: TimeRange
  busy: TimeRange[]
  window: TimeRange
  context?: MissionSlotScoringContext
}): { score: number; reasons: string[] } {
  const breakdown = scoreCandidateSlotBreakdown(input)
  return { score: breakdown.score ?? Number.NEGATIVE_INFINITY, reasons: breakdown.reasons }
}

export function scoreCandidateSlots(durationMinutes: number, busy: TimeRange[], window: TimeRange, context: MissionSlotScoringContext = {}): ScoredTimeSlot[] {
  if (durationMinutes <= 0) return []
  const windowStart = toMinutes(window.start)
  const windowEnd = toMinutes(window.end)
  const candidates: ScoredTimeSlot[] = []
  for (let cursor = windowStart; cursor + durationMinutes <= windowEnd; cursor += SLOT_SCORING_WEIGHTS.candidateStepMinutes) {
    const candidate = { start: cursor, end: cursor + durationMinutes }
    const slot = { start: toHHMM(candidate.start), end: toHHMM(candidate.end) }
    const scored = scoreCandidateSlotBreakdown({ candidate: slot, busy, window, context })
    if (!scored.valid || scored.score == null) continue
    candidates.push({ ...slot, score: scored.score, reasons: scored.reasons, baseScore: scored.baseScore ?? undefined, personalAdjustment: scored.personalAdjustment, finalScore: scored.finalScore ?? undefined, personalReasons: scored.personalReasons })
  }
  return candidates.sort((a, b) => b.score - a.score || a.start.localeCompare(b.start))
}

export function getSlotScoringDebug(durationMinutes: number, busy: TimeRange[], window: TimeRange, context: MissionSlotScoringContext = {}): CandidateScoreBreakdown[] {
  if (durationMinutes <= 0) return []
  const windowStart = toMinutes(window.start)
  const windowEnd = toMinutes(window.end)
  const candidates: CandidateScoreBreakdown[] = []
  for (let cursor = windowStart; cursor + durationMinutes <= windowEnd; cursor += SLOT_SCORING_WEIGHTS.candidateStepMinutes) {
    const slot = { start: toHHMM(cursor), end: toHHMM(cursor + durationMinutes) }
    candidates.push(scoreCandidateSlotBreakdown({ candidate: slot, busy, window, context }))
  }
  return candidates.sort((a, b) => {
    if (a.valid !== b.valid) return a.valid ? -1 : 1
    if (a.score !== b.score) return (b.score ?? Number.NEGATIVE_INFINITY) - (a.score ?? Number.NEGATIVE_INFINITY)
    return a.start.localeCompare(b.start)
  })
}

export function findBestScoredSlot(durationMinutes: number, busy: TimeRange[], window: TimeRange, context: MissionSlotScoringContext = {}): ScoredTimeSlot | null {
  const [best] = scoreCandidateSlots(durationMinutes, busy, window, context)
  return best
}

export function scoreDateSlot(input: {
  date: string
  slot: TimeRange
  busy: TimeRange[]
  context?: MissionSlotScoringContext
  dateIndex?: number
}) {
  const context = { ...(input.context ?? {}), date: input.date }
  const base = scoreCandidateSlotBreakdown({ candidate: input.slot, busy: input.busy, window: scoringStudyWindowFor(input.date), context })
  const urgent = context.daysUntilExam != null && context.daysUntilExam <= 7
  const datePenalty = (input.dateIndex ?? 0) * (urgent ? 3 : 1)
  const baseScore = base.baseScore ?? base.score ?? Number.NEGATIVE_INFINITY
  const finalScore = base.score ?? Number.NEGATIVE_INFINITY
  return {
    score: rounded(finalScore - datePenalty),
    baseScore: rounded(baseScore - datePenalty),
    personalAdjustment: base.personalAdjustment,
    finalScore: rounded(finalScore - datePenalty),
    reasons: datePenalty ? [...base.reasons, 'date_distance_penalty'] : base.reasons,
    personalReasons: base.personalReasons,
  }
}
