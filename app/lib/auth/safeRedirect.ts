const CONTROL_OR_BACKSLASH_RE = /[\\\u0000-\u001f\u007f]/

/**
 * Accept only an application-local path. This helper is intentionally shared
 * by client pages and Route Handlers so OAuth, email confirmation and normal
 * login cannot disagree about what is safe.
 */
export function safeLocalRedirect(value: unknown, fallback = '/camino'): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) {
    return fallback
  }
  if (CONTROL_OR_BACKSLASH_RE.test(value)) return fallback

  try {
    const base = new URL('https://kairo.invalid')
    const parsed = new URL(value, base)
    if (parsed.origin !== base.origin) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
