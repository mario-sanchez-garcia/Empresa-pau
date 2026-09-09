import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test as base } from '@playwright/test'

const authState = path.join(process.cwd(), 'playwright', '.auth', 'user.json')

async function readSupabaseSessionSeed() {
  try {
    const state = JSON.parse(await fs.readFile(authState, 'utf8')) as {
      origins?: Array<{ localStorage?: Array<{ name?: string; value?: string }> }>
    }
    for (const origin of state.origins ?? []) {
      const token = origin.localStorage?.find(item => item.name?.startsWith('sb-') && item.name.endsWith('-auth-token'))
      if (token?.name && token.value) return { name: token.name, value: token.value }
    }
  } catch { /* the project will report the missing session normally */ }
  return null
}

/**
 * Supabase may rotate its refresh token during a long authenticated E2E run.
 * Persist the context after every test so the next Playwright invocation uses
 * the newest session instead of forcing another manual login.
 */
export const test = base.extend<{ persistRenewedAuth: void }>({
  persistRenewedAuth: [async ({ context }, use) => {
    const sessionSeed = await readSupabaseSessionSeed()
    if (sessionSeed) {
      // storageState is origin-scoped. Seed the same ignored local session when
      // E2E runs on a collision-free localhost port (never log its value).
      // Always replace the project-level value: Playwright resolves storageState
      // when the worker starts, while Supabase rotates refresh tokens after each
      // test and the fixture persists the newer token to disk. Do it only on the
      // first navigation of this context so an F5 cannot restore a refresh token
      // that Supabase has already rotated during the same test.
      await context.addInitScript(seed => {
        const marker = 'kairo:e2e-session-seeded:v1'
        if (sessionStorage.getItem(marker)) return
        localStorage.setItem(seed.name, seed.value)
        sessionStorage.setItem(marker, '1')
      }, sessionSeed)
    }
    await use()
    await fs.mkdir(path.dirname(authState), { recursive: true })
    await context.storageState({ path: authState })
    try { await fs.chmod(authState, 0o600) } catch { /* Windows may not expose POSIX permissions. */ }
  }, { auto: true }],
})

export { expect }
