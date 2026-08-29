import 'server-only'

import crypto from 'crypto'

type CalendarOAuthState = {
  userId: string
  provider: 'google'
  exp: number
  nonce: string
}

function secret() {
  return process.env.CALENDAR_OAUTH_STATE_SECRET ?? process.env.CALENDAR_TOKEN_ENCRYPTION_KEY
}

function sign(payload: string) {
  const key = secret()
  if (!key) throw new Error('CALENDAR_OAUTH_STATE_SECRET is required')
  return crypto.createHmac('sha256', key).update(payload).digest('base64url')
}

export function createCalendarOAuthState(userId: string): string {
  const payload: CalendarOAuthState = {
    userId,
    provider: 'google',
    exp: Date.now() + 10 * 60 * 1000,
    nonce: crypto.randomBytes(16).toString('base64url'),
  }
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${body}.${sign(body)}`
}

export function verifyCalendarOAuthState(state: string | null): CalendarOAuthState | null {
  try {
    if (!state) return null
    const [body, signature] = state.split('.')
    if (!body || !signature) return null
    const expected = sign(body)
    const left = Buffer.from(signature)
    const right = Buffer.from(expected)
    if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) return null
    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as CalendarOAuthState
    if (parsed.provider !== 'google' || parsed.exp < Date.now()) return null
    return parsed
  } catch {
    return null
  }
}
