import { readFileSync } from 'node:fs'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function assert(name, condition) {
  if (!condition) {
    console.error(`FAIL ${name}`)
    process.exitCode = 1
    return
  }
  console.log(`OK   ${name}`)
}

const scoring = read('app/lib/camino/slotScoring.ts')
const scheduler = read('app/lib/camino/scheduleTimeSlot.ts')
const ensureCalendar = read('app/lib/ensureCaminoCalendar.ts')
const partials = read('app/lib/camino/injectPartialExamMissions.ts')
const weakReviews = read('app/lib/camino/injectWeakReviewMissions.ts')
const blockPractice = read('app/lib/camino/generateBlockPracticeMission.ts')
const personalization = read('app/lib/camino/applyCalendarPersonalization.ts')
const freeReviewAdd = read('app/api/camino/free-review-suggestion/add/route.ts')
const reorganize = read('app/api/camino/calendar-conflicts/reorganize/route.ts')

assert(
  'slot scoring has centralized deterministic weights and reasons',
  scoring.includes('export const SLOT_SCORING_WEIGHTS') &&
    scoring.includes('export function scoreCandidateSlot') &&
    scoring.includes('reasons.push') &&
    scoring.includes('deterministicEarlyTieBreak') &&
    !scoring.includes('Math.random')
)

assert(
  'candidate generation uses 15 minute slots and rejects overlaps with exact boundaries allowed',
  scoring.includes('for (let cursor = windowStart; cursor + durationMinutes <= windowEnd; cursor += 15)') &&
    scoring.includes('return Math.max(a.start, b.start) < Math.min(a.end, b.end)') &&
    scoring.includes('if (!Number.isFinite(scored.score)) continue') &&
    scheduler.includes('findBestScoredSlot(durationMinutes, this.busy, this.window, context)')
)

assert(
  'scoring covers urgency difficulty day load repetition continuity and tiny gaps',
  scoring.includes('exam_within_7_days') &&
    scoring.includes('exam_within_14_days') &&
    scoring.includes('high_load_early_slot') &&
    scoring.includes('low_load_late_slot') &&
    scoring.includes('daily_load_penalty') &&
    scoring.includes('repeated_subject_penalty') &&
    scoring.includes('excessive_same_subject_penalty') &&
    scoring.includes('same_subject_continuity') &&
    scoring.includes('tiny_gap_penalty')
)

assert(
  'scheduler keeps legacy first-slot place and exposes opt-in best-slot placement',
  scheduler.includes('place(durationMinutes: number): TimeRange | null') &&
    scheduler.includes('const slot = findFreeSlot(durationMinutes, this.busy, this.window)') &&
    scheduler.includes('placeBest(durationMinutes: number, context: MissionSlotScoringContext = {})') &&
    scheduler.includes('placeBestAcrossDates')
)

assert(
  'automatic Camino flows use best-slot scoring with academic context',
  ensureCalendar.includes('scheduler.placeBest') &&
    ensureCalendar.includes('deadlineDate: item.subject ===') &&
    partials.includes('scheduler.placeBest') &&
    partials.includes('daysUntilExam') &&
    partials.includes('priority: partialExam.priority') &&
    weakReviews.includes('scheduler.placeBest') &&
    blockPractice.includes('scheduler.placeBest') &&
    personalization.includes('scheduler.placeBest') &&
    freeReviewAdd.includes('scheduler.placeBest')
)

assert(
  'Reorganizar compares several valid dates with the same scorer and still updates existing events',
  reorganize.includes('placeBestAcrossDates') &&
    reorganize.includes('candidateDates') &&
    reorganize.includes('externalBusyByDate') &&
    reorganize.includes('syncExistingKairoMissionToGoogle') &&
    reorganize.includes('calendar_reorganized_reasons') &&
    !reorganize.includes('syncKairoMissionsToGoogle')
)

assert(
  'busy slots include Kairo mission subject/type for saturation scoring and Google busy remains hard invalid',
  scheduler.includes("select('id, start_time, end_time, subject, mission_type')") &&
    scheduler.includes('subject: row.subject') &&
    scheduler.includes('missionType: row.mission_type') &&
    scheduler.includes('const busy = [...localBusy, ...externalBusy]') &&
    scoring.includes('if (numericBusy.some(item => overlaps(candidate, item))) continue')
)

assert(
  'no-slot fallback remains pending/no-time rather than inventing a schedule',
  partials.includes('start_time: timeSlot?.start ?? null') &&
    partials.includes('end_time: timeSlot?.end ?? null') &&
    reorganize.includes('start_time: null') &&
    reorganize.includes('pending_no_time') &&
    freeReviewAdd.includes("calendar_sync_status: slot ? 'pending' : 'pending_no_time'")
)
