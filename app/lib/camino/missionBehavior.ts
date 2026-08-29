type SupabaseLike = {
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => PromiseLike<{ error: { code?: string; message?: string } | null }>
  }
}

export type MissionBehaviorEventType =
  | 'started'
  | 'completed'
  | 'postponed_manual'
  | 'rescheduled_manual'
  | 'rescheduled_conflict'

export function minutesBetweenIso(startIso: string | null | undefined, endIso: string | null | undefined) {
  if (!startIso || !endIso) return null
  const start = new Date(startIso).getTime()
  const end = new Date(endIso).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return null
  return Math.round((end - start) / 60000)
}

function lastSundayOfMonthUtc(year: number, monthIndex: number) {
  const date = new Date(Date.UTC(year, monthIndex + 1, 0, 12, 0, 0))
  date.setUTCDate(date.getUTCDate() - date.getUTCDay())
  return date
}

function madridOffsetForDate(scheduledDate: string) {
  const year = Number(scheduledDate.slice(0, 4))
  if (!Number.isFinite(year)) return '+01:00'
  const day = new Date(`${scheduledDate}T12:00:00Z`)
  const dstStart = lastSundayOfMonthUtc(year, 2)
  const dstEnd = lastSundayOfMonthUtc(year, 9)
  return day >= dstStart && day < dstEnd ? '+02:00' : '+01:00'
}

export function completionDelayMinutes(scheduledDate: string | null | undefined, endTime: string | null | undefined, completedAtIso: string) {
  if (!scheduledDate || !endTime) return null
  const hhmmss = endTime.length >= 8 ? endTime.slice(0, 8) : `${endTime.slice(0, 5)}:00`
  const plannedEnd = new Date(`${scheduledDate}T${hhmmss}${madridOffsetForDate(scheduledDate)}`)
  const completedAt = new Date(completedAtIso)
  const planned = plannedEnd.getTime()
  const completed = completedAt.getTime()
  if (!Number.isFinite(planned) || !Number.isFinite(completed)) return null
  return Math.round((completed - planned) / 60000)
}

export async function recordMissionBehaviorEvent(
  db: SupabaseLike,
  userId: string,
  missionId: string,
  eventType: MissionBehaviorEventType,
  idempotencyKey: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await db.from('camino_mission_events').insert({
    user_id: userId,
    mission_id: missionId,
    event_type: eventType,
    idempotency_key: idempotencyKey,
    metadata,
  })
  if (!error || error.code === '23505') return
  if (error.code === '42703' || error.code === '42P01') return
  throw error
}
