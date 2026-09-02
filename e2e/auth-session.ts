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
      const response = await window.fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  })
}
