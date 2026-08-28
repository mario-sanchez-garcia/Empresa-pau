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

const migration = read('supabase/migrations/20260828173000_add_camino_mission_behavior_telemetry.sql')
const helper = read('app/lib/camino/missionBehavior.ts')
const startRoute = read('app/api/camino/start-mission/route.ts')
const completeRoute = read('app/api/camino/complete-mission/route.ts')
const postponeRoute = read('app/api/camino/postpone-mission/route.ts')
const reorganizeRoute = read('app/api/camino/calendar-conflicts/reorganize/route.ts')
const topicClient = read('app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient.tsx')
const calendarClient = read('app/components/camino/CaminoCalendarClient.tsx')
const slotScoring = read('app/lib/camino/slotScoring.ts')
const existingMissionUpdatePayload = calendarClient.slice(
  calendarClient.indexOf('const toUpdate = draft.flatMap'),
  calendarClient.indexOf('// INSERT new missions'),
)

assert(
  'mission behavior migration adds telemetry columns without changing existing checks',
  migration.includes('add column if not exists started_at timestamptz') &&
    migration.includes('add column if not exists last_postponed_at timestamptz') &&
    migration.includes('add column if not exists postpone_count integer not null default 0') &&
    migration.includes('add column if not exists manual_reschedule_count integer not null default 0') &&
    migration.includes('add column if not exists conflict_reschedule_count integer not null default 0') &&
    migration.includes('add column if not exists actual_duration_minutes integer') &&
    migration.includes('add column if not exists completion_delay_minutes integer') &&
    !migration.includes('drop constraint') &&
    !migration.includes('source_check')
)

assert(
  'mission event log is typed, idempotent and private',
  migration.includes('create table if not exists public.camino_mission_events') &&
    migration.includes("event_type in (") &&
    migration.includes("'started'") &&
    migration.includes("'completed'") &&
    migration.includes("'postponed_manual'") &&
    migration.includes("'rescheduled_manual'") &&
    migration.includes("'rescheduled_conflict'") &&
    migration.includes('unique (user_id, mission_id, event_type, idempotency_key)') &&
    migration.includes('alter table public.camino_mission_events enable row level security') &&
    migration.includes('auth.uid() = user_id') &&
    !migration.includes('security definer')
)

assert(
  'start mission endpoint records explicit starts once',
  startRoute.includes("from('camino_calendar')") &&
    startRoute.includes("started_at: now") &&
    startRoute.includes(".is('started_at', null)") &&
    startRoute.includes(".in('status', ['pending', 'missed'])") &&
    startRoute.includes("recordMissionBehaviorEvent(db, auth.user.id, missionId, 'started', 'started'") &&
    topicClient.includes("fetch('/api/camino/start-mission'") &&
    topicClient.includes('!shouldStartExercise') &&
    topicClient.includes('async function recordMissionStart') &&
    topicClient.includes('await recordMissionStart(accessToken)') &&
    topicClient.includes('startedMissionRef.current === missionId')
)

assert(
  'completion stores derived duration and delay only on first successful completion',
  helper.includes('export function minutesBetweenIso') &&
    helper.includes('export function completionDelayMinutes') &&
    completeRoute.includes(".select('id, started_at, scheduled_date, end_time')") &&
    completeRoute.includes('actual_duration_minutes: minutesBetweenIso(targetRow?.started_at, now)') &&
    completeRoute.includes('completion_delay_minutes: completionDelayMinutes(targetRow?.scheduled_date, targetRow?.end_time, now)') &&
    completeRoute.includes(".in('status', ['pending', 'missed'])") &&
    completeRoute.includes("recordMissionBehaviorEvent(db, user.id, updated[0].id, 'completed', 'completed'")
)

assert(
  'manual not-taught postpone increments only the affected pending calendar row',
  postponeRoute.includes(".select('id, postpone_count')") &&
    postponeRoute.includes('const nextPostponeCount = (postponeCandidates[0].postpone_count ?? 0) + 1') &&
    postponeRoute.includes("last_postponed_at: now") &&
    postponeRoute.includes('postpone_count: nextPostponeCount') &&
    postponeRoute.includes(".eq('status', 'pending')") &&
    postponeRoute.includes("recordMissionBehaviorEvent(db, user.id, updatedPostpone[0].id, 'postponed_manual'")
)

assert(
  'conflict reorganize distinguishes automatic conflict reschedules from manual postpones',
  reorganizeRoute.includes('stillConflicts') &&
    reorganizeRoute.includes('conflict_reschedule_count: (mission.conflict_reschedule_count ?? 0) + 1') &&
    reorganizeRoute.includes("recordMissionBehaviorEvent(db, auth.user.id, mission.id, 'rescheduled_conflict'") &&
    reorganizeRoute.includes('syncExistingKairoMissionToGoogle(auth.user.id, mission.id, db)') &&
    !reorganizeRoute.includes('postpone_count')
)

assert(
  'calendar editor counts manual reschedule only when date or time changed',
  calendarClient.includes('manual_reschedule_count') &&
    calendarClient.includes('calendar_manual_rescheduled_from') &&
    calendarClient.includes('calendar_manual_rescheduled_to') &&
    calendarClient.includes("event_type: 'rescheduled_manual'") &&
    calendarClient.includes('const scheduleChanged = Boolean(previous)') &&
    calendarClient.includes('previous!.scheduled_date !== fields.scheduled_date') &&
    calendarClient.includes('previous!.start_time !== nextStart') &&
    calendarClient.includes('previous!.end_time !== nextEnd') &&
    !existingMissionUpdatePayload.includes('source:')
)

assert(
  'mission behavior work does not alter adaptive slot scoring weights',
  slotScoring.includes('SLOT_SCORING_WEIGHTS') &&
    slotScoring.includes('examWithin7Days') &&
    slotScoring.includes('examWithin14Days') &&
    slotScoring.includes('ADAPTIVE_SLOT_SCORING_CONFIG') &&
    !slotScoring.includes('started_at') &&
    !slotScoring.includes('postpone_count') &&
    !slotScoring.includes('reschedule_count')
)
