import type { Page } from '@playwright/test'

/** Checks a Supabase browser session without returning or logging its tokens. */
export async function hasAuthenticatedSession(page: Page) {
  return page.evaluate(async () => {
    let accessToken = ''
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index)
      if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue
      try {
        const value = JSON.parse(window.localStorage.getItem(key) ?? '{}') as { access_token?: unknown }
        if (typeof value.access_token === 'string') accessToken = value.access_token
      } catch {
        // Ignore unrelated or incomplete local state while login is in progress.
      }
    }
    if (!accessToken) return false
    try {
      const payloadSegment = accessToken.split('.')[1]
      if (!payloadSegment) return false
      const normalizedPayload = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
      const paddedPayload = normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, '=')
      const payload = JSON.parse(window.atob(paddedPayload)) as { exp?: unknown }
      if (typeof payload.exp !== 'number' || payload.exp <= Math.floor(Date.now() / 1000) + 5) return false

      // /api/admin/me exige rol interno -- una cuenta de alumno normal nunca
      // lo pasa, así que este check se quedaba esperando para siempre.
      // /api/onboarding/me solo exige sesión válida (getAuthContext), que es
      // lo único que hace falta comprobar aquí: que hay una sesión real.
      const response = await window.fetch('/api/onboarding/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  })
}
