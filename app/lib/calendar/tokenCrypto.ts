import 'server-only'

import crypto from 'crypto'

const PREFIX = 'v1'

function getKey(): Buffer {
  const raw = process.env.CALENDAR_TOKEN_ENCRYPTION_KEY
  if (!raw) throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY is required')
  const trimmed = raw.trim()
  const decoded = trimmed.length === 64 && /^[0-9a-f]+$/i.test(trimmed)
    ? Buffer.from(trimmed, 'hex')
    : Buffer.from(trimmed, 'base64')
  if (decoded.length !== 32) throw new Error('CALENDAR_TOKEN_ENCRYPTION_KEY must decode to 32 bytes')
  return decoded
}

export function encryptToken(token: string | null | undefined): string | null {
  if (!token) return null
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return [PREFIX, iv.toString('base64url'), tag.toString('base64url'), ciphertext.toString('base64url')].join(':')
}

export function decryptToken(payload: string | null | undefined): string | null {
  if (!payload) return null
  const [prefix, ivRaw, tagRaw, ciphertextRaw] = payload.split(':')
  if (prefix !== PREFIX || !ivRaw || !tagRaw || !ciphertextRaw) throw new Error('Invalid encrypted token')
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(ivRaw, 'base64url'))
  decipher.setAuthTag(Buffer.from(tagRaw, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextRaw, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}
