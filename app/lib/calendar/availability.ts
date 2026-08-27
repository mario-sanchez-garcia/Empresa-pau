import 'server-only'

import type { BusySlot } from './types'
import { getGoogleAvailability } from './sync'

const MADRID_TZ = 'Europe/Madrid'
const CACHE_TTL_MS = 90_000

type CachedBusy = { expiresAt: number; busy: BusySlot[] }
const availabilityCache = new Map<string, CachedBusy>()

export type LocalBusyRange = { start: string; end: string }

function madridParts(value: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: MADRID_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(value)
  const read = (type: string) => Number(parts.find(part => part.type === type)?.value ?? 0)
  return {
    year: read('year'),
    month: read('month'),
    day: read('day'),
    hour: read('hour'),
    minute: read('minute'),
  }
}

function dateKey(value: Date) {
  const parts = madridParts(value)
  return `${String(parts.year).padStart(4, '0')}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
}

function targetUtcMs(date: string, time: string) {
  const [year, month, day] = date.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)
  return Date.UTC(year, month - 1, day, hour, minute)
}

export function madridLocalToUtcIso(date: string, time: string) {
  const desiredUtc = targetUtcMs(date, time)
  const guessed = new Date(desiredUtc)
  const parts = madridParts(guessed)
  const shownUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
  return new Date(desiredUtc - (shownUtc - desiredUtc)).toISOString()
}

function addDays(date: string, days: number) {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function minutesToHHMM(minutes: number) {
  const clamped = Math.max(0, Math.min(24 * 60, minutes))
  const h = Math.floor(clamped / 60).toString().padStart(2, '0')
  const m = (clamped % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function instantInMadrid(value: string) {
  const date = new Date(value)
  const parts = madridParts(date)
  return {
    date: dateKey(date),
    minutes: parts.hour * 60 + parts.minute,
  }
}

export function busySlotsForMadridDate(busySlots: BusySlot[], date: string): LocalBusyRange[] {
  return busySlots.flatMap(slot => {
    const start = instantInMadrid(slot.start)
    const end = instantInMadrid(slot.end)
    if (end.date < date || start.date > date) return []
    const startMinutes = start.date < date ? 0 : start.minutes
    const endMinutes = end.date > date ? 24 * 60 : end.minutes
    if (endMinutes <= startMinutes) return []
    return [{ start: minutesToHHMM(startMinutes), end: minutesToHHMM(endMinutes) }]
  })
}

export function hasTimeConflict(a: LocalBusyRange, b: LocalBusyRange) {
  const toMinutes = (hhmm: string) => {
    const [h, m] = hhmm.slice(0, 5).split(':').map(Number)
    return h * 60 + (m || 0)
  }
  return Math.max(toMinutes(a.start), toMinutes(b.start)) < Math.min(toMinutes(a.end), toMinutes(b.end))
}

export async function getAvailability(userId: string, startDate: string, endDate: string): Promise<BusySlot[]> {
  const key = `${userId}:${startDate}:${endDate}`
  const cached = availabilityCache.get(key)
  if (cached && cached.expiresAt > Date.now()) return cached.busy
  const timeMin = madridLocalToUtcIso(startDate, '00:00')
  const timeMax = madridLocalToUtcIso(addDays(endDate, 1), '00:00')
  try {
    const busy = await getGoogleAvailability(userId, timeMin, timeMax)
    availabilityCache.set(key, { busy, expiresAt: Date.now() + CACHE_TTL_MS })
    return busy
  } catch (error) {
    console.warn('[calendar/availability] freebusy skipped:', error)
    return []
  }
}

export async function getAvailabilityForDate(userId: string, date: string): Promise<LocalBusyRange[]> {
  return busySlotsForMadridDate(await getAvailability(userId, date, date), date)
}
