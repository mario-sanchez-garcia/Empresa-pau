// Server-only. Never import in client components.
// Secure token generation and hashing for parent checkout links.
// Raw token is returned once to the caller; only the SHA-256 hash is stored.

import { createHash, randomBytes } from 'crypto'

export function generateRawToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex')
}

// Parent checkout link TTL in seconds (7 days).
export const LINK_TTL_SECONDS = 7 * 24 * 60 * 60

export function linkExpiresAt(): Date {
  return new Date(Date.now() + LINK_TTL_SECONDS * 1000)
}

// If a checkout_started link is this old, treat it as stale.
export const CHECKOUT_STARTED_STALE_SECONDS = 30 * 60
