import { SPAIN_HOLIDAYS } from './spainHolidays'

export function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T12:00:00Z')
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export function mondayBasedDayIndex(dateStr: string): number {
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow === 0 ? 6 : dow - 1
}

export function isStudyDay(dateStr: string, options: { allowWeekends?: boolean } = {}): boolean {
  if (SPAIN_HOLIDAYS.has(dateStr)) return false
  if (options.allowWeekends) return true
  const dow = new Date(dateStr + 'T12:00:00Z').getUTCDay()
  return dow !== 0 && dow !== 6
}

export function getStudyDays(startDate: string, n: number, options: { allowWeekends?: boolean } = {}): string[] {
  const days: string[] = []
  let current = startDate
  while (days.length < n) {
    if (isStudyDay(current, options)) days.push(current)
    current = addDays(current, 1)
  }
  return days
}

export function countWorkingDays(from: string, to: string): number {
  let count = 0
  let current = from
  while (current < to) {
    if (isStudyDay(current)) count++
    current = addDays(current, 1)
  }
  return count
}

export function studyDayIndexesFor(count: number) {
  if (count <= 3) return [0, 2, 4]
  if (count === 4) return [0, 1, 3, 5]
  if (count === 5) return [0, 1, 2, 4, 5]
  if (count === 6) return [0, 1, 2, 3, 4, 5]
  return [0, 1, 2, 3, 4, 5, 6]
}

export function isPreferredStudyDay(dateStr: string, weeklyStudyDays: number): boolean {
  return studyDayIndexesFor(weeklyStudyDays).includes(mondayBasedDayIndex(dateStr)) &&
    isStudyDay(dateStr, { allowWeekends: true })
}
