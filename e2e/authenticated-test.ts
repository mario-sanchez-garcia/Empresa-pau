import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test as base } from '@playwright/test'

const authState = path.join(process.cwd(), 'playwright', '.auth', 'user.json')

/**
 * Supabase may rotate its refresh token during a long authenticated E2E run.
 * Persist the context after every test so the next Playwright invocation uses
 * the newest session instead of forcing another manual login.
 */
export const test = base.extend<{ persistRenewedAuth: void }>({
  persistRenewedAuth: [async ({ context }, use) => {
    await use()
    await fs.mkdir(path.dirname(authState), { recursive: true })
    await context.storageState({ path: authState })
    try { await fs.chmod(authState, 0o600) } catch { /* Windows may not expose POSIX permissions. */ }
  }, { auto: true }],
})

export { expect }
