import { createHmac, timingSafeEqual } from 'crypto'

interface TokenPayload {
  userId: string
  weekStart: string // YYYY-MM-DD
}

function getSecret(): string {
  const secret = process.env.INFORME_SECRET
  if (!secret) throw new Error('INFORME_SECRET is not set')
  return secret
}

function toBase64url(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64url')
}

function fromBase64url(s: string): string {
  return Buffer.from(s, 'base64url').toString('utf-8')
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('hex')
}

export function generateInformeToken(userId: string, weekStart: string): string {
  const payload = toBase64url(JSON.stringify({ userId, weekStart } satisfies TokenPayload))
  const sig = sign(payload)
  return `${payload}.${sig}`
}

export function verifyInformeToken(token: string): TokenPayload | null {
  try {
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex < 1) return null

    const payload = token.slice(0, dotIndex)
    const sig = token.slice(dotIndex + 1)

    const expectedSig = sign(payload)
    // Timing-safe comparison — both must be same byte length (hex HMAC-SHA256 = 64 chars)
    if (sig.length !== expectedSig.length) return null
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expectedSig, 'hex')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null

    const parsed = JSON.parse(fromBase64url(payload)) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    const { userId, weekStart } = parsed as Record<string, unknown>
    if (typeof userId !== 'string' || typeof weekStart !== 'string') return null
    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return null

    return { userId, weekStart }
  } catch {
    return null
  }
}

export function isTokenExpired(weekStart: string, maxAgeDays = 30): boolean {
  const weekStartMs = new Date(weekStart + 'T12:00:00Z').getTime()
  return (Date.now() - weekStartMs) / 86400000 > maxAgeDays
}
