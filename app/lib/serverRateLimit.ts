import 'server-only'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type ServerRateLimitArgs = {
  key: string
  limit: number
  windowSeconds: number
}

export type ServerRateLimitResult = {
  allowed: boolean
  count: number
  limit: number
  retryAfterSeconds?: number
}

const STORE_KEY = '__pausia_server_rate_limits__'

export function checkServerRateLimit(args: ServerRateLimitArgs): ServerRateLimitResult {
  const now = Date.now()
  const store = getStore()
  pruneExpired(store, now)

  const existing = store.get(args.key)
  if (!existing || existing.resetAt <= now) {
    store.set(args.key, {
      count: 1,
      resetAt: now + args.windowSeconds * 1000
    })
    return { allowed: true, count: 1, limit: args.limit }
  }

  if (existing.count >= args.limit) {
    return {
      allowed: false,
      count: existing.count,
      limit: args.limit,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000))
    }
  }

  existing.count += 1
  store.set(args.key, existing)
  return { allowed: true, count: existing.count, limit: args.limit }
}

export function getClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwardedFor || headers.get('x-real-ip') || 'unknown'
}

function getStore(): Map<string, RateLimitEntry> {
  const globalWithStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: Map<string, RateLimitEntry>
  }

  if (!globalWithStore[STORE_KEY]) {
    globalWithStore[STORE_KEY] = new Map()
  }

  return globalWithStore[STORE_KEY]
}

function pruneExpired(store: Map<string, RateLimitEntry>, now: number) {
  if (store.size < 500) return

  for (const [key, entry] of store.entries()) {
    if (entry.resetAt <= now) store.delete(key)
  }
}
