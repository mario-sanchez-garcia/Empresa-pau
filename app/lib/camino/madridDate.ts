export function getMadridDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value)
  return date.toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

export function isValidIsoCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
