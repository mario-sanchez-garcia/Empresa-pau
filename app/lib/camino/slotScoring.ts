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
  started_at?: string | null
  completed_at?: string | null
  actual_duration_minutes?: number | null
  completion_delay_minutes?: number | null
  postpone_count?: number | null
  last_postponed_at?: string | null
  manual_reschedule_count?: number | null
  conflict_reschedule_count?: number | null
  subject?: string | null
  mission_type?: string | null
}
export type BehaviorProfileBucketStats = {
  scheduled: number
  startKnown: number
  started: number
  completed: number
  completedAfterStart: number
  postponedManual: number
  manuallyRescheduled: number
  delayed: number
  startRate: number
  completionRateScheduled: number
  completionRateAfterStart: number
  manualPostponeRate: number
  manualRescheduleRate: number
  averageCompletionDelayMinutes: number | null
}
export type BehaviorDurationBucketStats = {
  scheduled: number
  started: number
  completed: number
  actualCount: number
  averageActualToPlannedRatio: number | null
}
export type SchedulingBehaviorProfile = {
  sampleSize: number
  timeOfDay: Record<TimeBucket, number>
  durationFit: Record<DurationBucket, number>
  continuityAdjustment: number
  timeOfDayReasons?: Record<TimeBucket, string[]>
  durationFitReasons?: Record<DurationBucket, string[]>
  continuityReason?: string | null
  metrics?: {
    timeOfDay: Record<TimeBucket, BehaviorProfileBucketStats>
    durationFit: Record<DurationBucket, BehaviorDurationBucketStats>
    baseline: {
      startRate: number
      completionRateScheduled: number
      completionRateAfterStart: number
      manualPostponeRate: number
      manualRescheduleRate: number
    }
    telemetryRows: number
    diversity: number
  }
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

function emptyTimeStats() {
  return {
    scheduled: 0,
    startKnown: 0,
    started: 0,
    completed: 0,
    completedAfterStart: 0,
    postponedManual: 0,
    manuallyRescheduled: 0,
    delayTotal: 0,
    delayCount: 0,
  }
}

function emptyDurationStats() {
  return {
    scheduled: 0,
    started: 0,
    completed: 0,
    actualCount: 0,
    actualToPlannedTotal: 0,
  }
}

function rate(count: number, total: number) {
  return total > 0 ? count / total : 0
}

function smoothedDelta(count: number, total: number, baseline: number) {
  if (total <= 0) return 0
  return smoothedRate(count, total) - baseline
}

function meaningfulAdjustment(delta: number, scale: number) {
  if (Math.abs(delta) < ADAPTIVE_SLOT_SCORING_CONFIG.minimumMeaningfulDelta) return 0
  return Math.round(delta * scale)
}

function averageDelayPenalty(delayTotal: number, delayCount: number) {
  if (delayCount < ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket) return 0
  const avg = delayTotal / delayCount
  if (avg <= 30) return 0
  if (avg <= 60) return -1
  if (avg <= 120) return -2
  return -3
}

function durationRatioAdjustment(actualToPlannedTotal: number, actualCount: number) {
  if (actualCount < ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket) return 0
  const avgRatio = actualToPlannedTotal / actualCount
  if (avgRatio <= 1.15) return 2
  if (avgRatio <= 1.35) return 1
  if (avgRatio <= 1.65) return 0
  if (avgRatio <= 2) return -1
  return -2
}

export function buildSchedulingBehaviorProfile(rows: BehaviorProfileSourceRow[]): SchedulingBehaviorProfile {
  const stats = {
    timeOfDay: {
      early: emptyTimeStats(),
      middle: emptyTimeStats(),
      late: emptyTimeStats(),
    },
    durationFit: {
      short: emptyDurationStats(),
      medium: emptyDurationStats(),
      long: emptyDurationStats(),
      extraLong: emptyDurationStats(),
    },
    continuity: { positive: 0, total: 0 },
    totalCompleted: 0,
    totalStarted: 0,
    totalCompletedAfterStart: 0,
    totalPostponedManual: 0,
    totalManualRescheduled: 0,
    totalStartKnown: 0,
    telemetryRows: 0,
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
    const hasStartTelemetryColumns = Object.prototype.hasOwnProperty.call(row, 'started_at') || Object.prototype.hasOwnProperty.call(row, 'completed_at')
    const completed = row.status === 'completed'
    const started = Boolean(row.started_at || row.completed_at)
    const conflictReschedules = row.conflict_reschedule_count ?? 0
    const postponedManual = (row.postpone_count ?? 0) > 0 || Boolean(row.last_postponed_at) || (row.status === 'postponed' && conflictReschedules === 0)
    const manuallyRescheduled = (row.manual_reschedule_count ?? 0) > 0
    const window = scoringStudyWindowFor(row.scheduled_date)
    const timeBucket = timeBucketFor(row.start_time, window)
    const durationBucket = durationBucketFor(minutes)
    stats.timeOfDay[timeBucket].scheduled += 1
    stats.durationFit[durationBucket].scheduled += 1
    stats.total += 1
    if (hasStartTelemetryColumns || row.actual_duration_minutes != null || row.completion_delay_minutes != null || postponedManual || manuallyRescheduled) {
      stats.telemetryRows += 1
    }
    if (hasStartTelemetryColumns) {
      stats.timeOfDay[timeBucket].startKnown += 1
      stats.totalStartKnown += 1
    }
    if (started) {
      stats.timeOfDay[timeBucket].started += 1
      stats.durationFit[durationBucket].started += 1
      stats.totalStarted += 1
    }
    if (completed) {
      stats.timeOfDay[timeBucket].completed += 1
      stats.durationFit[durationBucket].completed += 1
      stats.totalCompleted += 1
      if (started) {
        stats.timeOfDay[timeBucket].completedAfterStart += 1
        stats.totalCompletedAfterStart += 1
      }
    }
    if (postponedManual) {
      stats.timeOfDay[timeBucket].postponedManual += 1
      stats.totalPostponedManual += 1
    }
    if (manuallyRescheduled) {
      stats.timeOfDay[timeBucket].manuallyRescheduled += 1
      stats.totalManualRescheduled += 1
    }
    if (typeof row.completion_delay_minutes === 'number' && Number.isFinite(row.completion_delay_minutes)) {
      stats.timeOfDay[timeBucket].delayTotal += Math.max(0, row.completion_delay_minutes)
      stats.timeOfDay[timeBucket].delayCount += 1
    }
    if (typeof row.actual_duration_minutes === 'number' && Number.isFinite(row.actual_duration_minutes) && row.actual_duration_minutes > 0) {
      stats.durationFit[durationBucket].actualCount += 1
      stats.durationFit[durationBucket].actualToPlannedTotal += row.actual_duration_minutes / minutes
    }

    const previous = relevant[index - 1]
    if (previous?.subject && row.subject && previous.subject === row.subject && previous.scheduled_date === row.scheduled_date) {
      stats.continuity.total += 1
      if ((started && completed) && !postponedManual) stats.continuity.positive += 1
    }
  }

  const baselineCompletion = stats.total > 0 ? smoothedRate(stats.totalCompleted, stats.total) : ADAPTIVE_SLOT_SCORING_CONFIG.smoothingPriorRate
  const baselineStart = stats.totalStartKnown > 0 ? smoothedRate(stats.totalStarted, stats.totalStartKnown) : ADAPTIVE_SLOT_SCORING_CONFIG.smoothingPriorRate
  const baselineAfterStart = stats.totalStarted > 0 ? smoothedRate(stats.totalCompletedAfterStart, stats.totalStarted) : ADAPTIVE_SLOT_SCORING_CONFIG.smoothingPriorRate
  const baselinePostpone = stats.total > 0 ? smoothedRate(stats.totalPostponedManual, stats.total) : 0
  const baselineManualReschedule = stats.total > 0 ? smoothedRate(stats.totalManualRescheduled, stats.total) : 0
  const timeOfDayReasons: Record<TimeBucket, string[]> = { early: [], middle: [], late: [] }
  const durationFitReasons: Record<DurationBucket, string[]> = { short: [], medium: [], long: [], extraLong: [] }
  const timeAdjustmentFor = (bucket: TimeBucket) => {
    const bucketStats = stats.timeOfDay[bucket]
    if (bucketStats.scheduled < ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket) return 0
    let adjustment = 0
    const startAdj = bucketStats.startKnown >= ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket
      ? meaningfulAdjustment(smoothedDelta(bucketStats.started, bucketStats.startKnown, baselineStart), 8)
      : 0
    if (startAdj) {
      adjustment += startAdj
      timeOfDayReasons[bucket].push(`personal_${bucket}_start_${startAdj > 0 ? 'positive' : 'negative'}`)
    }
    const afterStartAdj = bucketStats.started >= ADAPTIVE_SLOT_SCORING_CONFIG.minSampleTimeBucket
      ? meaningfulAdjustment(smoothedDelta(bucketStats.completedAfterStart, bucketStats.started, baselineAfterStart), 5)
      : 0
    if (afterStartAdj) {
      adjustment += afterStartAdj
      timeOfDayReasons[bucket].push(`personal_${bucket}_completion_after_start_${afterStartAdj > 0 ? 'positive' : 'negative'}`)
    }
    const completionAdj = meaningfulAdjustment(smoothedDelta(bucketStats.completed, bucketStats.scheduled, baselineCompletion), 5)
    if (completionAdj && Math.sign(completionAdj) !== Math.sign(startAdj + afterStartAdj)) {
      adjustment += completionAdj
      timeOfDayReasons[bucket].push(`personal_${bucket}_completion_${completionAdj > 0 ? 'positive' : 'negative'}`)
    }
    const postponeAdj = -Math.max(0, meaningfulAdjustment(smoothedDelta(bucketStats.postponedManual, bucketStats.scheduled, baselinePostpone), 6))
    if (postponeAdj) {
      adjustment += postponeAdj
      timeOfDayReasons[bucket].push('personal_postpone_rate_negative')
    }
    const manualRescheduleAdj = -Math.max(0, meaningfulAdjustment(smoothedDelta(bucketStats.manuallyRescheduled, bucketStats.scheduled, baselineManualReschedule), 3))
    if (manualRescheduleAdj) {
      adjustment += manualRescheduleAdj
      timeOfDayReasons[bucket].push('personal_manual_reschedule_negative')
    }
    const delayAdj = averageDelayPenalty(bucketStats.delayTotal, bucketStats.delayCount)
    if (delayAdj) {
      adjustment += delayAdj
      timeOfDayReasons[bucket].push('personal_completion_delay_negative')
    }
    return clamp(adjustment, -5, 5)
  }
  const timeOfDay = {
    early: timeAdjustmentFor('early'),
    middle: timeAdjustmentFor('middle'),
    late: timeAdjustmentFor('late'),
  }
  const durationAdjustmentFor = (bucket: DurationBucket) => {
    const bucketStats = stats.durationFit[bucket]
    if (bucketStats.scheduled < ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket) return 0
    let adjustment = 0
    const ratioAdj = durationRatioAdjustment(bucketStats.actualToPlannedTotal, bucketStats.actualCount)
    if (ratioAdj) {
      adjustment += ratioAdj
      durationFitReasons[bucket].push(ratioAdj > 0 ? 'personal_duration_fit' : 'personal_duration_actual_long_negative')
    }
    const afterStartAdj = bucketStats.started >= ADAPTIVE_SLOT_SCORING_CONFIG.minSampleDurationBucket
      ? meaningfulAdjustment(smoothedDelta(bucketStats.completed, bucketStats.started, baselineAfterStart), 4)
      : 0
    if (afterStartAdj) {
      adjustment += afterStartAdj
      durationFitReasons[bucket].push(afterStartAdj > 0 ? 'personal_duration_completion_positive' : 'personal_duration_low_adherence')
    }
    const historicalCompletionAdj = !ratioAdj && !afterStartAdj
      ? meaningfulAdjustment(smoothedDelta(bucketStats.completed, bucketStats.scheduled, baselineCompletion), 4)
      : 0
    if (historicalCompletionAdj) {
      adjustment += historicalCompletionAdj
      durationFitReasons[bucket].push(historicalCompletionAdj > 0 ? 'personal_duration_completion_positive' : 'personal_duration_low_adherence')
    }
    return clamp(adjustment, -3, 3)
  }
  const durationFit = {
    short: durationAdjustmentFor('short'),
    medium: durationAdjustmentFor('medium'),
    long: durationAdjustmentFor('long'),
    extraLong: durationAdjustmentFor('extraLong'),
  }
  const continuityAdjustment = clamp(bucketAdjustment(
    stats.continuity.positive,
    stats.continuity.total,
    ADAPTIVE_SLOT_SCORING_CONFIG.smoothingPriorRate,
    ADAPTIVE_SLOT_SCORING_CONFIG.minSampleContinuity,
    ADAPTIVE_SLOT_SCORING_CONFIG.continuityScale,
  ), -4, 4)
  const diversity = (['early', 'middle', 'late'] as TimeBucket[]).filter(bucket => stats.timeOfDay[bucket].scheduled > 0).length / 3
  const reliability = stats.total > 0 ? stats.telemetryRows / stats.total : 0
  const confidence = clamp((stats.total / ADAPTIVE_SLOT_SCORING_CONFIG.historyLimit) * 0.55 + diversity * 0.25 + reliability * 0.2, 0, 1)
  return {
    sampleSize: stats.total,
    timeOfDay,
    durationFit,
    continuityAdjustment,
    timeOfDayReasons,
    durationFitReasons,
    continuityReason: continuityAdjustment ? (continuityAdjustment > 0 ? 'personal_continuity_positive' : 'personal_continuity_negative') : null,
    metrics: {
      timeOfDay: {
        early: {
          scheduled: stats.timeOfDay.early.scheduled,
          startKnown: stats.timeOfDay.early.startKnown,
          started: stats.timeOfDay.early.started,
          completed: stats.timeOfDay.early.completed,
          completedAfterStart: stats.timeOfDay.early.completedAfterStart,
          postponedManual: stats.timeOfDay.early.postponedManual,
          manuallyRescheduled: stats.timeOfDay.early.manuallyRescheduled,
          delayed: stats.timeOfDay.early.delayCount,
          startRate: rounded(rate(stats.timeOfDay.early.started, stats.timeOfDay.early.startKnown)),
          completionRateScheduled: rounded(rate(stats.timeOfDay.early.completed, stats.timeOfDay.early.scheduled)),
          completionRateAfterStart: rounded(rate(stats.timeOfDay.early.completedAfterStart, stats.timeOfDay.early.started)),
          manualPostponeRate: rounded(rate(stats.timeOfDay.early.postponedManual, stats.timeOfDay.early.scheduled)),
          manualRescheduleRate: rounded(rate(stats.timeOfDay.early.manuallyRescheduled, stats.timeOfDay.early.scheduled)),
          averageCompletionDelayMinutes: stats.timeOfDay.early.delayCount ? rounded(stats.timeOfDay.early.delayTotal / stats.timeOfDay.early.delayCount) : null,
        },
        middle: {
          scheduled: stats.timeOfDay.middle.scheduled,
          startKnown: stats.timeOfDay.middle.startKnown,
          started: stats.timeOfDay.middle.started,
          completed: stats.timeOfDay.middle.completed,
          completedAfterStart: stats.timeOfDay.middle.completedAfterStart,
          postponedManual: stats.timeOfDay.middle.postponedManual,
          manuallyRescheduled: stats.timeOfDay.middle.manuallyRescheduled,
          delayed: stats.timeOfDay.middle.delayCount,
          startRate: rounded(rate(stats.timeOfDay.middle.started, stats.timeOfDay.middle.startKnown)),
          completionRateScheduled: rounded(rate(stats.timeOfDay.middle.completed, stats.timeOfDay.middle.scheduled)),
          completionRateAfterStart: rounded(rate(stats.timeOfDay.middle.completedAfterStart, stats.timeOfDay.middle.started)),
          manualPostponeRate: rounded(rate(stats.timeOfDay.middle.postponedManual, stats.timeOfDay.middle.scheduled)),
          manualRescheduleRate: rounded(rate(stats.timeOfDay.middle.manuallyRescheduled, stats.timeOfDay.middle.scheduled)),
          averageCompletionDelayMinutes: stats.timeOfDay.middle.delayCount ? rounded(stats.timeOfDay.middle.delayTotal / stats.timeOfDay.middle.delayCount) : null,
        },
        late: {
          scheduled: stats.timeOfDay.late.scheduled,
          startKnown: stats.timeOfDay.late.startKnown,
          started: stats.timeOfDay.late.started,
          completed: stats.timeOfDay.late.completed,
          completedAfterStart: stats.timeOfDay.late.completedAfterStart,
          postponedManual: stats.timeOfDay.late.postponedManual,
          manuallyRescheduled: stats.timeOfDay.late.manuallyRescheduled,
          delayed: stats.timeOfDay.late.delayCount,
          startRate: rounded(rate(stats.timeOfDay.late.started, stats.timeOfDay.late.startKnown)),
          completionRateScheduled: rounded(rate(stats.timeOfDay.late.completed, stats.timeOfDay.late.scheduled)),
          completionRateAfterStart: rounded(rate(stats.timeOfDay.late.completedAfterStart, stats.timeOfDay.late.started)),
          manualPostponeRate: rounded(rate(stats.timeOfDay.late.postponedManual, stats.timeOfDay.late.scheduled)),
          manualRescheduleRate: rounded(rate(stats.timeOfDay.late.manuallyRescheduled, stats.timeOfDay.late.scheduled)),
          averageCompletionDelayMinutes: stats.timeOfDay.late.delayCount ? rounded(stats.timeOfDay.late.delayTotal / stats.timeOfDay.late.delayCount) : null,
        },
      },
      durationFit: {
        short: { scheduled: stats.durationFit.short.scheduled, started: stats.durationFit.short.started, completed: stats.durationFit.short.completed, actualCount: stats.durationFit.short.actualCount, averageActualToPlannedRatio: stats.durationFit.short.actualCount ? rounded(stats.durationFit.short.actualToPlannedTotal / stats.durationFit.short.actualCount) : null },
        medium: { scheduled: stats.durationFit.medium.scheduled, started: stats.durationFit.medium.started, completed: stats.durationFit.medium.completed, actualCount: stats.durationFit.medium.actualCount, averageActualToPlannedRatio: stats.durationFit.medium.actualCount ? rounded(stats.durationFit.medium.actualToPlannedTotal / stats.durationFit.medium.actualCount) : null },
        long: { scheduled: stats.durationFit.long.scheduled, started: stats.durationFit.long.started, completed: stats.durationFit.long.completed, actualCount: stats.durationFit.long.actualCount, averageActualToPlannedRatio: stats.durationFit.long.actualCount ? rounded(stats.durationFit.long.actualToPlannedTotal / stats.durationFit.long.actualCount) : null },
        extraLong: { scheduled: stats.durationFit.extraLong.scheduled, started: stats.durationFit.extraLong.started, completed: stats.durationFit.extraLong.completed, actualCount: stats.durationFit.extraLong.actualCount, averageActualToPlannedRatio: stats.durationFit.extraLong.actualCount ? rounded(stats.durationFit.extraLong.actualToPlannedTotal / stats.durationFit.extraLong.actualCount) : null },
      },
      baseline: {
        startRate: rounded(baselineStart),
        completionRateScheduled: rounded(baselineCompletion),
        completionRateAfterStart: rounded(baselineAfterStart),
        manualPostponeRate: rounded(baselinePostpone),
        manualRescheduleRate: rounded(baselineManualReschedule),
      },
      telemetryRows: stats.telemetryRows,
      diversity: rounded(diversity),
    },
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
    reasons.push(...(profile.timeOfDayReasons?.[timeBucket]?.length ? profile.timeOfDayReasons[timeBucket] : [`personal_${timeBucket}_${timeAdjustment > 0 ? 'positive' : 'negative'}`]))
  }
  const durationBucket = durationBucketFor(input.durationMinutes)
  const durationAdjustment = profile.durationFit[durationBucket] ?? 0
  if (durationAdjustment) {
    adjustment += durationAdjustment
    reasons.push(...(profile.durationFitReasons?.[durationBucket]?.length ? profile.durationFitReasons[durationBucket] : [durationAdjustment > 0 ? 'personal_duration_fit' : 'personal_duration_low_adherence']))
  }
  if (input.touchesSameSubject && profile.continuityAdjustment) {
    adjustment += profile.continuityAdjustment
    reasons.push(profile.continuityReason ?? (profile.continuityAdjustment > 0 ? 'personal_continuity_positive' : 'personal_continuity_negative'))
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
