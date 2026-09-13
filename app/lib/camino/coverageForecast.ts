import type { StudentPlanContext } from './planWindow.ts'
import { planningDates } from './planWindow.ts'
import { eligibleDatesForRow, preferredDatesFor, isNewContent, orderRowsForPlacement, type PlacementRow } from './planPlacement.ts'
import { estimatedMinutesForMission, minutesBetweenTimes, toMinutes } from './missionDuration.ts'
import { VALID_DAILY_MINUTES } from './dailyTimeCapacity.ts'
import { minutesForPlacement, placementDuration } from './placementDuration.ts'
import { canRepositionAutomatically } from './automaticPlacement.ts'
import { planningCutoffDate, studyDayIndexesFor } from './studyCapacity.ts'
import { FINAL_REVIEW_RESERVED_STUDY_DAYS } from './examDate.ts'

export type ForecastCalendarRow = {
  id: string; title?: string | null; queue_id: string | null; subject: string; scheduled_date: string;
  status: string; source: string | null; locked: boolean | null; mission_type: string | null;
  start_time: string | null; end_time: string | null; metadata: Record<string, unknown> | null
}
export type ForecastQueueRow = {
  id: string; title?: string | null; subject: string; queue_status: string; retry_not_before?: string | null;
  metadata: Record<string, unknown> | null
}
export type ForecastEvent = {
  event_date: string; recurrence: string; recurrence_until: string | null; day_of_week: number | null;
  start_time: string | null; end_time: string | null
}
type Range = [number, number]
type Day = { date: string; free: Range[]; budget: number; capacity: number }
type Work = PlacementRow & { title?: string | null; subject: string; minutes: number; metadata: Record<string, unknown> | null; notBefore?: string | null }
export type SubjectForecast = {
  subject: string; scheduledMinutes: number; pendingMinutes: number; projectedPendingMinutes: number;
  scheduledAtRiskMinutes: number; atRiskMinutes: number; reservedActivityMinutes: number; estimatedItems: number
}

export type ForecastRiskReason = 'after_exam' | 'partial_deadline' | 'final_review_window'
  | 'unavailable_day' | 'daily_budget' | 'occupied_time' | 'task_too_long' | 'retry_wait' | 'no_slot'
export type ForecastRiskItem = {
  id: string; title?: string | null; subject: string; minutes: number; reason: ForecastRiskReason
  scheduled: boolean; automatic: boolean; date: string; deadlineDate?: string | null
}
export type ForecastRemedy = {
  dailyMinutesNeeded: number | null
  weeklyStudyDaysNeeded: number | null
  combinedChange: { dailyMinutes: number; weeklyStudyDays: number } | null
  replanRecommended: boolean
  maxAvailabilityAtRiskMinutes: number
  manualMinutes: number
  deficitMinutes: number
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
/** El mismo alumno con otra disponibilidad declarada, para poder resimular. */
function withAvailability(context: StudentPlanContext, dailyMinutes: number, weeklyStudyDays: number | null): StudentPlanContext {
  return {
    ...context,
    dailyMinutes,
    weeklyStudyDays,
    studyDayIndexes: studyDayIndexesFor(weeklyStudyDays),
    // El corte del repaso final se mide en DÍAS DE ESTUDIO: cambiar el patrón
    // semanal lo mueve y hay que recalcularlo, pero cambiar los minutos al día
    // no, y recalcularlo igualmente pisaría el corte real del alumno.
    planningCutoff: weeklyStudyDays === context.weeklyStudyDays
      ? context.planningCutoff
      : planningCutoffDate(context.today, context.examDate, FINAL_REVIEW_RESERVED_STUDY_DAYS, {
          weeklyStudyDays, holidays: context.holidays,
        }),
  }
}

/** Simulación de solo lectura. Un presupuesto compartido, plazos y huecos reales. */
export function buildCoverageForecast(context: StudentPlanContext, calendar: readonly ForecastCalendarRow[], queue: readonly ForecastQueueRow[], events: readonly ForecastEvent[], activeSubjects: readonly string[] = [], options: { withRemedy?: boolean } = {}): CoverageForecast {
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
    return { date, free, budget: capacity, capacity }
  })
  const dayByDate = new Map(days.map(day => [day.date, day]))
  const window = { dates, examDate: context.examDate, planningCutoff: context.planningCutoff, capacityPerDay: Infinity }
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
  const riskItems: ForecastRiskItem[] = []
  // Activas antes que restos unscheduled del mismo trabajo: un reintento no
  // convierte dos colocaciones de una identidad en dos temas que estudiar.
  const rows = [...calendar].sort((a, b) => Number(!['pending', 'postponed'].includes(a.status)) - Number(!['pending', 'postponed'].includes(b.status)) || Number(canRepositionAutomatically(a)) - Number(canRepositionAutomatically(b)) || a.id.localeCompare(b.id))
  for (const row of rows) {
    if (!['pending', 'postponed', 'unscheduled', 'missed'].includes(row.status) || (row.queue_id && completedIds.has(row.queue_id))) continue
    const key = row.queue_id ? `queue:${row.queue_id}` : row.metadata?.partial_exam_id
      ? `partial:${row.subject}:${row.metadata.partial_exam_id}:${row.metadata.partial_mission_type ?? row.id}` : `calendar:${row.id}`
    if (seen.has(key)) continue
    seen.add(key)
    const isScheduled = ['pending', 'postponed'].includes(row.status) && row.scheduled_date >= context.today
    const duration = minutesBetweenTimes(row.start_time, row.end_time)
    const type = row.mission_type ?? (typeof row.metadata?.mission_type === 'string' ? row.metadata.mission_type : 'concept')
    const contentEstimate = placementDuration(type, row.metadata)
    // El horario reservado mide ocupación, no el tiempo real de aprendizaje.
    // Si se obtuvo de una referencia por tipo, sigue siendo una estimación.
    const estimated = isScheduled && duration != null
      ? { minutes: duration, estimated: contentEstimate.estimated } : contentEstimate
    const work: Work = { ...asPlacement(row), missionType: type, minutes: estimated.minutes, subject: row.subject, title: row.title, metadata: row.metadata }
    const stats = subject(row.subject)
    if (estimated.estimated) stats.estimatedItems++
    const eligible = eligibleDatesForRow(work, window)
    const day = dayByDate.get(row.scheduled_date)
    if (isScheduled) {
      stats.scheduledMinutes += work.minutes
      if (row.source === 'partial' || !isNewContent(row.mission_type)) stats.reservedActivityMinutes += work.minutes
      const automatic = canRepositionAutomatically(row)
      const fits = day && eligible.includes(row.scheduled_date)
        && consume(day, work.minutes, row.start_time, row.end_time)
      if (!fits) {
        const reason: ForecastRiskReason = row.scheduled_date >= context.examDate ? 'after_exam'
          : row.source === 'partial' && work.deadlineDate && row.scheduled_date >= work.deadlineDate ? 'partial_deadline'
          : !day ? 'unavailable_day'
          : !eligible.includes(row.scheduled_date) ? 'final_review_window'
          : work.minutes > day.budget ? 'daily_budget' : 'occupied_time'
        riskItems.push({ id: row.id, title: row.title, subject: row.subject, minutes: work.minutes,
          reason, scheduled: true, automatic, date: row.scheduled_date, deadlineDate: work.deadlineDate })
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
    const estimated = placementDuration(type, row.metadata)
    const stats = subject(row.subject)
    if (estimated.estimated) stats.estimatedItems++
    pending.push({ id: row.id, queueId: row.id, subject: row.subject, title: row.title, scheduledDate: context.today,
      missionType: type, source: 'algorithm', minutes: estimated.minutes, metadata: row.metadata, notBefore: row.retry_not_before })
  }
  const availableAfterScheduledMinutes = days.reduce((sum, day) => sum + Math.min(day.budget, length(day.free)), 0)
  for (const work of orderRowsForPlacement(pending)) {
    let placedMinutes: number | null = null
    for (const date of preferredDatesFor(work, window)) {
      const day = dayByDate.get(date)!
      if (work.notBefore && date < work.notBefore.slice(0, 10)) continue
      const minutes = minutesForPlacement(work.missionType, work.metadata)
      if (!consume(day, minutes)) continue
      placedMinutes = minutes
      break
    }
    // La carga pendiente conserva su estimación aunque no encuentre hueco.
    const stats = subject(work.subject)
    stats.pendingMinutes += placedMinutes ?? work.minutes
    if (placedMinutes != null) stats.projectedPendingMinutes += placedMinutes
    else {
      stats.atRiskMinutes += work.minutes
      const eligible = eligibleDatesForRow(work, window)
      const reason: ForecastRiskReason = work.source === 'partial' && work.deadlineDate && eligible.length === 0 ? 'partial_deadline'
        : isNewContent(work.missionType) && context.today >= context.planningCutoff ? 'final_review_window'
        : work.minutes > (context.dailyMinutes ?? 60) ? 'task_too_long'
        : work.notBefore && !eligible.some(date => date >= work.notBefore!.slice(0, 10)) ? 'retry_wait' : 'no_slot'
      riskItems.push({ id: work.id, title: work.title, subject: work.subject, minutes: work.minutes,
        reason, scheduled: false, automatic: true, date: work.scheduledDate, deadlineDate: work.deadlineDate })
    }
  }
  const subjects = [...subjectMap.values()]
  const total = (key: keyof Omit<SubjectForecast, 'subject'>) => subjects.reduce((sum, row) => sum + row[key], 0)
  const atRisk = total('atRiskMinutes')
  const totalCapacityMinutes = days.reduce((sum, day) => sum + day.capacity, 0)

  let remedy: ForecastRemedy | null = null
  if (atRisk > 0 && options.withRemedy !== false) {
    const currentDaily = context.dailyMinutes ?? 60
    const currentWeekly = context.weeklyStudyDays ?? 5
    const maxWeekly = Math.max(currentWeekly, Math.min(7, context.accessMaxStudyDaysPerWeek ?? 7))
    // Un cambio de disponibilidad RECOLOCA trabajo automático. Mantener sus
    // horas antiguas aquí hacía que ningún ajuste pudiera resolver un solape.
    const movable = calendar.map(row => canRepositionAutomatically(row)
      ? { ...row, status: 'unscheduled', start_time: null, end_time: null } : row)
    const simulations = new Map<string, number>()
    const riskFor = (daily: number, weekly: number) => {
      const key = `${daily}:${weekly}`
      if (!simulations.has(key)) simulations.set(key, buildCoverageForecast(
        withAvailability(context, daily, weekly), movable, queue, events, activeSubjects, { withRemedy: false },
      ).atRiskMinutes)
      return simulations.get(key)!
    }
    const replanRecommended = riskFor(currentDaily, currentWeekly) === 0
    let dailyMinutesNeeded: number | null = null
    let weeklyStudyDaysNeeded: number | null = null
    let combinedChange: ForecastRemedy['combinedChange'] = null
    if (!replanRecommended) {
      for (const daily of VALID_DAILY_MINUTES.filter(value => value > currentDaily)) {
        if (riskFor(daily, currentWeekly) === 0) { dailyMinutesNeeded = daily; break }
      }
      for (let weekly = currentWeekly + 1; weekly <= maxWeekly; weekly++) {
        if (riskFor(currentDaily, weekly) === 0) { weeklyStudyDaysNeeded = weekly; break }
      }
      if (dailyMinutesNeeded == null && weeklyStudyDaysNeeded == null) {
        const combinations = VALID_DAILY_MINUTES.filter(daily => daily > currentDaily).flatMap(daily =>
          Array.from({ length: Math.max(0, maxWeekly - currentWeekly) }, (_, i) => ({ dailyMinutes: daily, weeklyStudyDays: currentWeekly + i + 1 })))
          .sort((a, b) => a.dailyMinutes * a.weeklyStudyDays - b.dailyMinutes * b.weeklyStudyDays || a.dailyMinutes - b.dailyMinutes)
        combinedChange = combinations.find(c => riskFor(c.dailyMinutes, c.weeklyStudyDays) === 0) ?? null
      }
    }
    remedy = { dailyMinutesNeeded, weeklyStudyDaysNeeded, combinedChange, replanRecommended,
      maxAvailabilityAtRiskMinutes: riskFor(180, maxWeekly), manualMinutes: protectedConflictMinutes,
      deficitMinutes: Math.max(0, total('scheduledMinutes') + total('pendingMinutes') - totalCapacityMinutes) }
  }

  return {
    asOf: context.today, examDate: context.examDate, planningCutoff: context.planningCutoff,
    dailyMinutes: context.dailyMinutes ?? 60, weeklyStudyDays: context.weeklyStudyDays,
    totalCapacityMinutes,
    finalReviewCapacityMinutes: days.filter(day => day.date >= context.planningCutoff).reduce((sum, day) => sum + day.capacity, 0),
    scheduledMinutes: total('scheduledMinutes'), pendingMinutes: total('pendingMinutes'),
    scheduledAtRiskMinutes: total('scheduledAtRiskMinutes'),
    validScheduledMinutes: total('scheduledMinutes') - total('scheduledAtRiskMinutes'),
    projectedPendingMinutes: total('projectedPendingMinutes'), atRiskMinutes: atRisk,
    reservedActivityMinutes: total('reservedActivityMinutes'), availableAfterScheduledMinutes,
    riskItems, protectedConflictMinutes, estimatedItems: total('estimatedItems'), subjects,
    missingSubjects: activeSubjects.filter(name => !queue.some(row => row.subject === name) && !calendar.some(row => row.subject === name)),
    externalCalendarIncluded: false as const,
    remedy,
  }
}

// Explícito y no ReturnType: la función se llama a sí misma para calcular el
// remedio, y un tipo inferido sobre una función recursiva no se puede resolver.
export type CoverageForecast = {
  asOf: string; examDate: string; planningCutoff: string
  dailyMinutes: number; weeklyStudyDays: number | null
  totalCapacityMinutes: number; finalReviewCapacityMinutes: number
  scheduledMinutes: number; pendingMinutes: number; scheduledAtRiskMinutes: number
  validScheduledMinutes: number; projectedPendingMinutes: number; atRiskMinutes: number
  reservedActivityMinutes: number; availableAfterScheduledMinutes: number
  riskItems: ForecastRiskItem[]
  protectedConflictMinutes: number; estimatedItems: number
  subjects: SubjectForecast[]; missingSubjects: string[]
  externalCalendarIncluded: false
  remedy: ForecastRemedy | null
}
