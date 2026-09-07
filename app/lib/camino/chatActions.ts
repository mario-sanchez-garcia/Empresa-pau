export type CaminoChatIntent =
  | 'MOVE_MISSION'
  | 'CREATE_EXTRA_MISSION'
  | 'CREATE_EXAM'
  | 'POSTPONE_MISSION'
  | 'REORGANIZE_DAY'
  | 'SUGGEST_STUDY'
  | 'ASK_PRIORITY'
  | 'UNSUPPORTED'

export type CaminoChatAction = {
  intent: CaminoChatIntent
  mutates: boolean
  subjectQuery?: string
  missionQuery?: string
  topicQuery?: string
  sourceDate?: string
  targetDate?: string
  targetTime?: string
  durationMinutes?: number
  missing: Array<'subject' | 'mission' | 'date' | 'topic'>
}

const DAY_NAMES: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
}

const MONTHS: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
}

export function normalizeChatText(value: string) {
  return value.trim().toLocaleLowerCase('es-ES').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function addDays(todayISO: string, days: number) {
  const date = new Date(`${todayISO}T12:00:00`)
  date.setDate(date.getDate() + days)
  return iso(date)
}

export function resolveChatDate(text: string, todayISO: string): string | undefined {
  const normalized = normalizeChatText(text)
  if (/\bpasado manana\b/.test(normalized)) return addDays(todayISO, 2)
  if (/\bmanana\b/.test(normalized)) return addDays(todayISO, 1)
  if (/\bhoy\b/.test(normalized)) return todayISO

  const explicitIso = normalized.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/)
  if (explicitIso) return explicitIso[0]

  const namedMonth = normalized.match(/\b(?:el|dia)?\s*(\d{1,2})(?:\s+de)?\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de\s+(20\d{2}))?\b/)
  if (namedMonth) {
    const day = Number(namedMonth[1])
    const month = MONTHS[namedMonth[2]]
    let year = namedMonth[3] ? Number(namedMonth[3]) : Number(todayISO.slice(0, 4))
    let candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (!namedMonth[3] && candidate < todayISO) {
      year += 1
      candidate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
    return isValidFutureDate(candidate, todayISO, 370) ? candidate : undefined
  }

  const namedDays = Object.entries(DAY_NAMES)
    .flatMap(([name, dayNumber]) => {
      const index = normalized.lastIndexOf(name)
      return index >= 0 ? [{ name, dayNumber, index }] : []
    })
    .sort((a, b) => b.index - a.index)
  for (const { dayNumber } of namedDays) {
    const today = new Date(`${todayISO}T12:00:00`)
    let delta = (dayNumber - today.getDay() + 7) % 7
    if (delta === 0 && !normalized.includes('hoy')) delta = 7
    return addDays(todayISO, delta)
  }
  return undefined
}

export function isValidFutureDate(value: string, todayISO: string, maxDays = 90) {
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  if (!Number.isFinite(date.getTime()) || iso(date) !== value) return false
  const delta = Math.round((date.getTime() - new Date(`${todayISO}T12:00:00Z`).getTime()) / 86_400_000)
  return delta >= 0 && delta <= maxDays
}

function extractTime(text: string) {
  const normalized = normalizeChatText(text)
  const match = normalized.match(/\b(?:a\s+las?\s+)?([01]?\d|2[0-3])(?::|\.)([0-5]\d)\b|\b(?:a\s+las?\s+)([01]?\d|2[0-3])\b/)
  if (!match) return undefined
  return `${String(Number(match[1] ?? match[3])).padStart(2, '0')}:${match[2] ?? '00'}`
}

function extractDuration(text: string) {
  const normalized = normalizeChatText(text)
  const hours = normalized.match(/\b(\d+(?:[.,]\d+)?)\s*horas?\b/)
  if (hours) return Math.min(180, Math.max(5, Math.round(Number(hours[1].replace(',', '.')) * 60)))
  const minutes = normalized.match(/\b(\d{1,3})\s*(?:min|minutos?)\b/)
  return minutes ? Math.min(180, Math.max(5, Number(minutes[1]))) : undefined
}

function phraseAfter(text: string, pattern: RegExp) {
  const match = normalizeChatText(text).match(pattern)
  return match?.[1]?.replace(/\b(?:hoy|manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|a las? \d{1,2}(?::\d{2})?)\b.*$/g, '').trim() || undefined
}

export function parseCaminoChatAction(message: string, todayISO: string): CaminoChatAction {
  const text = normalizeChatText(message).slice(0, 500)
  const targetDate = resolveChatDate(text, todayISO)
  const targetTime = extractTime(text)
  const durationMinutes = extractDuration(text)

  if (/\b(que (?:deberia )?estudi(?:ar|o)?|que hago|recomiend\w*|donde meterias|ratos libres|repasar esta semana|llevo peor|voy bien)\b/.test(text)) {
    return { intent: 'SUGGEST_STUDY', mutates: false, targetDate, durationMinutes, missing: [] }
  }
  if (/\b(por que|prioridad|primero)\b/.test(text)) {
    return { intent: 'ASK_PRIORITY', mutates: false, missionQuery: phraseAfter(text, /(?:puesto|prioridad|primero)\s+(.+)/), missing: [] }
  }
  if (/\b(examen|parcial)\b/.test(text) && /\b(tengo|anade|añade|pon|crear?)\b/.test(text)) {
    const subjectQuery = phraseAfter(text, /(?:examen|parcial)\s+(?:de\s+)?(.+)/)
    const topicQuery = phraseAfter(text, /(?:tema(?:rio)?|entra|contenido)\s+(.+)/)
    const missing: CaminoChatAction['missing'] = []
    if (!subjectQuery) missing.push('subject')
    if (!targetDate) missing.push('date')
    if (!topicQuery) missing.push('topic')
    return { intent: 'CREATE_EXAM', mutates: true, subjectQuery, topicQuery, targetDate, missing }
  }
  if (/\b(hoy no puedo|reorganiz|redistribu)\b/.test(text)) {
    return { intent: 'REORGANIZE_DAY', mutates: true, sourceDate: targetDate ?? todayISO, missing: [] }
  }
  if (/\b(pospon|aun no|todavia no)\b/.test(text)) {
    const missionQuery = phraseAfter(text, /(?:pospon\w*|dado)\s+(.+)/)
    return { intent: 'POSTPONE_MISSION', mutates: true, missionQuery, missing: missionQuery ? [] : ['mission'] }
  }
  if (/\b(muev|pasa|cambia|reprograma)\w*\b/.test(text)) {
    const missionQuery = phraseAfter(text, /(?:muev\w*|pasa\w*|cambia\w*|reprograma\w*)\s+(?:la mision de\s+|la mision\s+|el repaso de\s+)?(.+)/)
    const missing: CaminoChatAction['missing'] = []
    if (!missionQuery) missing.push('mission')
    if (!targetDate && !targetTime) missing.push('date')
    return { intent: 'MOVE_MISSION', mutates: true, missionQuery, targetDate, targetTime, missing }
  }
  if (/\b(anade|añade|crea|ponme|quiero hacer|programa)\w*\b/.test(text) && /\b(mision|repaso|estudi|extra|minutos?)\b/.test(text)) {
    const topicQuery = phraseAfter(text, /(?:de|repaso de|estudiar)\s+(.+)/)
    const missing: CaminoChatAction['missing'] = []
    if (!topicQuery) missing.push('topic')
    if (!targetDate) missing.push('date')
    return { intent: 'CREATE_EXTRA_MISSION', mutates: true, topicQuery, targetDate, targetTime, durationMinutes: durationMinutes ?? 30, missing }
  }
  return { intent: 'UNSUPPORTED', mutates: false, missing: [] }
}

export function actionNeedsConfirmation(action: CaminoChatAction) {
  return action.mutates
}
