import { createHash, createHmac, timingSafeEqual } from 'node:crypto'

const GRANT_VERSION = 2
export const EXAM_XP_GRANT_TTL_MS = 24 * 60 * 60 * 1000

type ExamXpGrantPayload = {
  v: number
  historyId: string
  userId: string
  score: number
  maxScore: number
  correctionDigest: string
  issuedAt: number
}

export type ExamXpGrantInput = Omit<ExamXpGrantPayload, 'v' | 'issuedAt'> & {
  issuedAt?: number
}

function grantSecret() {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!secret) throw new Error('Exam XP grant secret is not configured')
  return secret
}

function signature(encodedPayload: string) {
  return createHmac('sha256', grantSecret())
    .update(`kairo:exam-xp:v${GRANT_VERSION}:${encodedPayload}`)
    .digest('base64url')
}

function sameFiniteNumber(left: unknown, right: unknown) {
  const a = Number(left)
  const b = Number(right)
  return Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9
}

export function isValidExamHistoryId(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function digestExamCorrection(value: unknown) {
  let parsed = value
  if (typeof value === 'string') {
    try { parsed = JSON.parse(value) } catch { parsed = value.trim() }
  }
  return createHash('sha256').update(JSON.stringify(canonicalize(parsed)), 'utf8').digest('base64url')
}

/**
 * Issues a short-lived, server-signed authorization for exactly one corrected
 * history row. The browser can create its own row under RLS, but it cannot mint
 * a grant for an invented score or reuse a real correction under another id.
 */
export function issueExamXpGrant(input: ExamXpGrantInput) {
  if (!isValidExamHistoryId(input.historyId)) throw new Error('Invalid exam history id')
  if (!Number.isFinite(input.score) || !Number.isFinite(input.maxScore) || input.maxScore <= 0) {
    throw new Error('Invalid exam score')
  }
  if (!/^[A-Za-z0-9_-]{43}$/.test(input.correctionDigest)) throw new Error('Invalid correction digest')

  const payload: ExamXpGrantPayload = {
    v: GRANT_VERSION,
    historyId: input.historyId,
    userId: input.userId,
    score: input.score,
    maxScore: input.maxScore,
    correctionDigest: input.correctionDigest,
    issuedAt: input.issuedAt ?? Date.now(),
  }
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  return `${encodedPayload}.${signature(encodedPayload)}`
}

export function verifyExamXpGrant(
  token: unknown,
  expected: Omit<ExamXpGrantInput, 'issuedAt'>,
  now = Date.now(),
) {
  if (typeof token !== 'string' || !isValidExamHistoryId(expected.historyId)) return false
  const [encodedPayload, suppliedSignature, ...extra] = token.split('.')
  if (!encodedPayload || !suppliedSignature || extra.length) return false

  const expectedSignature = signature(encodedPayload)
  const suppliedBuffer = Buffer.from(suppliedSignature)
  const expectedBuffer = Buffer.from(expectedSignature)
  if (suppliedBuffer.length !== expectedBuffer.length || !timingSafeEqual(suppliedBuffer, expectedBuffer)) return false

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<ExamXpGrantPayload>
    return payload.v === GRANT_VERSION
      && payload.historyId === expected.historyId
      && payload.userId === expected.userId
      && sameFiniteNumber(payload.score, expected.score)
      && sameFiniteNumber(payload.maxScore, expected.maxScore)
      && payload.correctionDigest === expected.correctionDigest
      && typeof payload.issuedAt === 'number'
      && payload.issuedAt <= now + 60_000
      && now - payload.issuedAt <= EXAM_XP_GRANT_TTL_MS
  } catch {
    return false
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => [key, canonicalize(item)]))
  }
  return value
}
