import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET is not set')
  return secret
}

export function generateUnsubscribeToken(userId: string): string {
  const encoded = Buffer.from(userId, 'utf-8').toString('base64url')
  const sig = createHmac('sha256', getSecret()).update(userId).digest('hex')
  return `${encoded}.${sig}`
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const dotIndex = token.lastIndexOf('.')
    if (dotIndex < 1) return null
    const encoded = token.slice(0, dotIndex)
    const sig = token.slice(dotIndex + 1)
    const userId = Buffer.from(encoded, 'base64url').toString('utf-8')
    if (!userId || userId.length < 10) return null
    const expectedSig = createHmac('sha256', getSecret()).update(userId).digest('hex')
    if (sig.length !== expectedSig.length) return null
    const sigBuf = Buffer.from(sig, 'hex')
    const expectedBuf = Buffer.from(expectedSig, 'hex')
    if (sigBuf.length !== expectedBuf.length) return null
    if (!timingSafeEqual(sigBuf, expectedBuf)) return null
    return userId
  } catch {
    return null
  }
}
