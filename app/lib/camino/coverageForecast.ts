import type { StudentPlanContext } from './planWindow.ts'
import { planningDates } from './planWindow.ts'
import { eligibleDatesForRow, preferredDatesFor, isNewContent, orderRowsForPlacement, type PlacementRow } from './planPlacement.ts'
import { estimatedMinutesForMission, minutesBetweenTimes, toMinutes } from './missionDuration.ts'
import { missionsPerDayForMinutes } from './dailyTimeCapacity.ts'
import { minutesForPlacement } from './placementDuration.ts'
import { canRepositionAutomatically } from './automaticPlacement.ts'

export type ForecastCalendarRow = {
  id: string; queue_id: string | null; subject: string; scheduled_date: string;
  status: string; source: string | null; locked: boolean | null; mission_type: string | null;
  start_time: string | null; end_time: string | null; metadata: Record<string, unknown> | null
}
export type ForecastQueueRow = {
  id: string; subject: string; queue_status: string; retry_not_before?: string | null;
  metadata: Record<string, unknown> | null
}
export type ForecastEvent = {
  event_date: string; recurrence: string; recurrence_until: string | null; day_of_week: number | null;
  start_time: string | null; end_time: string | null
}
type Range = [number, number]
type Day = { date: string; free: Range[]; budget: number; capacity: number; usedSlots: number }
type Work = PlacementRow & { subject: string; minutes: number; metadata: Record<string, unknown> | null; notBefore?: string | null }
export type SubjectForecast = {
  subject: string; scheduledMinutes: number; pendingMinutes: number; projectedPendingMinutes: number;
  scheduledAtRiskMinutes: number; atRiskMinutes: number; reservedActivityMinutes: number; estimatedItems: number
}

function subtract(ranges: Range[], from: number, to: number): Range[] {
  return ranges.flatMap(([a, b]): Range[] => to <= a || from >= b ? [[a, b]]
    : [...(from > a ? [[a, Math.min(b, from)] as Range] : []), ...(to < b ? [[Math.max(a, to), b] as Range] : [])])
}
function length(ranges: Range[]) { return ranges.reduce((sum, [a, b]) => sum + b - a, 0) }
function consume(day: Day, minutes: number, start?: string | null, end?: string | null): boolean {
  if (minutes > day.budget) return false
  const fixed = minutesBetweenTimes(start, end) != null
  const range = fixed ? day.free.find(([a, b]) => toMinutes(start!) >= a && toMinutes(end!) <= b)
    : day.free.find(([a, b]) => b - a >= minutes)
  if (!range) return false
  const from = fixed ? toMinutes(start!) : range[0]
  day.free = subtract(day.free, from, from + minutes)
  day.budget -= minutes
  return true
}
function asPlacement(row: ForecastCalendarRow): PlacementRow {
  return { id: row.id, scheduledDate: row.scheduled_date, missionType: row.mission_type,
    queueId: row.queue_id, source: row.source,
    deadlineDate: typeof row.metadata?.partial_exam_date === 'string' ? row.metadata.partial_exam_date : null }
}
function estimate(type: string | null, metadata: Record<string, unknown> | null, context: StudentPlanContext, placing = false) {
  if (placing && (type === 'concept' || type === 'review'))
    return { minutes: minutesForPlacement(context.dailyMinutes, 0, type, metadata), estimated: true }
  const declared = typeof metadata?.estimated_minutes === 'number' && Number.isFinite(metadata.estimated_minutes) && metadata.estimated_minutes > 0
  if (declared || metadata?.links_to_simulacro_exam_id)
    return { minutes: estimatedMinutesForMission({ mission_type: type, metadata }), estimated: false }
  return { minutes: minutesForPlacement(context.dailyMinutes, 0, type, metadata), estimated: true }
}

/** Simulación de solo lectura. Un presupuesto compartido, plazos y huecos reales. */
export function buildCoverageForecast(context: StudentPlanContext, calendar: readonly ForecastCalendarRow[], queue: readonly ForecastQueueRow[], events: readonly ForecastEvent[], activeSubjects: readonly string[] = []) {
  const dates = planningDates(context, { includeFinalReviewWindow: true, limit: 730 })
  const days: Day[] = dates.map(date => {
    const dow = new Date(`${date}T12:00:00Z`).getUTCDay()
    let free: Range[] = [dow === 0 || dow === 6 ? [600, 1260] : [960, 1320]]
    for (const event of events) {
      const applies = event.recurrence === 'weekly'
        ? event.day_of_week === (dow + 6) % 7 && event.event_date <= date && (!event.recurrence_until || event.recurrence_until >= date)
        : event.event_date === date
      if (applies && minutesBetweenTimes(event.start_time, event.end_time) != null)
        free = subtract(free, toMinutes(event.start_time!), toMinutes(event.end_time!))
    }
    // Trabajo ya completado HOY consume hoy, aunque ya no sea carga pendiente.
    const completed = calendar.filter(row => row.status === 'completed' && row.scheduled_date === date)
    for (const row of completed) if (minutesBetweenTimes(row.start_time, row.end_time) != null)
      free = subtract(free, toMinutes(row.start_time!), toMinutes(row.end_time!))
    const spent = completed.reduce((sum, row) => sum + estimatedMinutesForMission(row), 0)
    const capacity = Math.max(0, Math.min((context.dailyMinutes ?? 60) - spent, length(free)))
    return { date, free, budget: capacity, capacity, usedSlots: 0 }
  })
  const dayByDate = new Map(days.map(day => [day.date, day]))
  const window = { dates, examDate: context.examDate, planningCutoff: context.planningCutoff, capacityPerDay: missionsPerDayForMinutes(context.dailyMinutes) }
  const completedIds = new Set(queue.filter(row => row.queue_status === 'completed').map(row => row.id))
  for (const row of calendar) if (row.status === 'completed' && row.queue_id) completedIds.add(row.queue_id)
  const subjectMap = new Map<string, SubjectForecast>()
  function subject(name: string) {
    if (!subjectMap.has(name)) subjectMap.set(name, { subject: name, scheduledMinutes: 0, pendingMinutes: 0,
      projectedPendingMinutes: 0, scheduledAtRiskMinutes: 0, atRiskMinutes: 0, reservedActivityMinutes: 0, estimatedItems: 0 })
    return subjectMap.get(name)!
  }
  activeSubjects.forEach(subject)
  const seen = new Set<string>()
  const pending: Work[] = []
  let protectedConflictMinutes = 0
  // Activas antes que restos unscheduled del mismo trabajo: un reintento no
  // convierte dos colocaciones de una identidad en dos temas que estudiar.
  const rows = [...calendar].sort((a, b) => Number(!['pending', 'postponed'].includes(a.status)) - Number(!['pending', 'postponed'].includes(b.status)) || a.id.localeCompare(b.id))
  for (const row of rows) {
    if (!['pending', 'postponed', 'unscheduled', 'missed'].includes(row.status) || (row.queue_id && completedIds.has(row.queue_id))) continue
    const key = row.queue_id ? `queue:${row.queue_id}` : row.metadata?.partial_exam_id
      ? `partial:${row.subject}:${row.metadata.partial_exam_id}:${row.metadata.partial_mission_type ?? row.id}` : `calendar:${row.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const isScheduled = ['pending', 'postponed'].includes(row.status) && row.scheduled_date >= context.today
    const duration = minutesBetweenTimes(row.start_time, row.end_time)
    const type = row.mission_type ?? (typeof row.metadata?.mission_type === 'string' ? row.metadata.mission_type : 'concept')
    const estimated = isScheduled && duration != null ? { minutes: duration, estimated: false } : estimate(type, row.metadata, context, !isScheduled)
    const work: Work = { ...asPlacement(row), missionType: type, minutes: estimated.minutes, subject: row.subject, metadata: row.metadata }
    const stats = subject(row.subject)
    if (estimated.estimated) stats.estimatedItems++
    const eligible = eligibleDatesForRow(work, window)
    const day = dayByDate.get(row.scheduled_date)
    if (isScheduled) {
      stats.scheduledMinutes += work.minutes
      if (row.source === 'partial' || !isNewContent(row.mission_type)) stats.reservedActivityMinutes += work.minutes
      const automatic = canRepositionAutomatically(row)
      const fits = day && eligible.includes(row.scheduled_date)
        && (!automatic || day.usedSlots < window.capacityPerDay)
        && consume(day, work.minutes, row.start_time, row.end_time)
      if (day && automatic) day.usedSlots++
      if (!fits) {
        stats.scheduledAtRiskMinutes += work.minutes
        stats.atRiskMinutes += work.minutes
        if (!canRepositionAutomatically(row)) protectedConflictMinutes += work.minutes
        // Una reserva existente en conflicto sigue ocupando presupuesto; no
        // prometemos ese mismo tiempo a trabajo nuevo.
        if (day) {
          day.budget = Math.max(0, day.budget - work.minutes)
          if (duration != null) day.free = subtract(day.free, toMinutes(row.start_time!), toMinutes(row.end_time!))
        }
      }
    } else { pending.push(work) }
  }
  for (const row of queue) {
    if (completedIds.has(row.id) || seen.has(`queue:${row.id}`)) continue
    seen.add(`queue:${row.id}`)
    const type = typeof row.metadata?.mission_type === 'string' ? row.metadata.mission_type : 'concept'
    const estimated = estimate(type, row.metadata, context, true)
    const stats = subject(row.subject)
    if (estimated.estimated) stats.estimatedItems++
    pending.push({ id: row.id, queueId: row.id, subject: row.subject, scheduledDate: context.today,
      missionType: type, source: 'algorithm', minutes: estimated.minutes, metadata: row.metadata, notBefore: row.retry_not_before })
  }
  const availableAfterScheduledMinutes = days.reduce((sum, day) => sum + Math.min(day.budget, length(day.free)), 0)
  for (const work of orderRowsForPlacement(pending)) {
    let placedMinutes: number | null = null
    for (const date of preferredDatesFor(work, window)) {
      const day = dayByDate.get(date)!
      if ((work.notBefore && date < work.notBefore.slice(0, 10)) || day.usedSlots >= window.capacityPerDay) continue
      const minutes = minutesForPlacement(context.dailyMinutes, day.usedSlots, work.missionType, work.metadata)
      if (!consume(day, minutes)) continue
      day.usedSlots++
      placedMinutes = minutes
      break
    }
    // Sin hueco concreto, la carga variable conserva la estimación del primer
    // slot. Con hueco, cuenta la duración que el motor le asignaría allí.
    const stats = subject(work.subject)
    stats.pendingMinutes += placedMinutes ?? work.minutes
    if (placedMinutes != null) stats.projectedPendingMinutes += placedMinutes
    else stats.atRiskMinutes += work.minutes
  }
  const subjects = [...subjectMap.values()]
  const total = (key: keyof Omit<SubjectForecast, 'subject'>) => subjects.reduce((sum, row) => sum + row[key], 0)
  return {
    asOf: context.today, examDate: context.examDate, planningCutoff: context.planningCutoff,
    dailyMinutes: context.dailyMinutes ?? 60, weeklyStudyDays: context.weeklyStudyDays,
    totalCapacityMinutes: days.reduce((sum, day) => sum + day.capacity, 0),
    finalReviewCapacityMinutes: days.filter(day => day.date >= context.planningCutoff).reduce((sum, day) => sum + day.capacity, 0),
    scheduledMinutes: total('scheduledMinutes'), pendingMinutes: total('pendingMinutes'),
    scheduledAtRiskMinutes: total('scheduledAtRiskMinutes'),
    validScheduledMinutes: total('scheduledMinutes') - total('scheduledAtRiskMinutes'),
    projectedPendingMinutes: total('projectedPendingMinutes'), atRiskMinutes: total('atRiskMinutes'),
    reservedActivityMinutes: total('reservedActivityMinutes'), availableAfterScheduledMinutes,
    protectedConflictMinutes, estimatedItems: total('estimatedItems'), subjects,
    missingSubjects: activeSubjects.filter(name => !queue.some(row => row.subject === name) && !calendar.some(row => row.subject === name)),
    externalCalendarIncluded: false as const,
  }
}
export type CoverageForecast = ReturnType<typeof buildCoverageForecast>
