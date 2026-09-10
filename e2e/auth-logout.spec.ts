import { expect, test } from '@playwright/test'
import fs from 'node:fs/promises'
import path from 'node:path'

test('logout clears this browser even when the provider request fails', async ({ page, context }) => {
  const state = JSON.parse(await fs.readFile(path.join(process.cwd(), 'playwright', '.auth', 'user.json'), 'utf8')) as {
    origins?: Array<{ localStorage?: Array<{ name?: string; value?: string }> }>
  }
  const session = state.origins?.flatMap(origin => origin.localStorage ?? [])
    .find(item => item.name?.startsWith('sb-') && item.name.endsWith('-auth-token'))
  expect(session?.name).toBeTruthy()
  expect(session?.value).toBeTruthy()
  await context.addInitScript(seed => {
    localStorage.setItem(seed.name, seed.value)
  }, { name: session!.name!, value: session!.value! })
  await page.route('**/auth/v1/logout**', route => route.abort('failed'))
  await page.goto('/settings')
  await page.getByRole('button', { name: /Cerrar sesión/i }).click()
  await expect(page).toHaveURL(/\/login(?:[/?#]|$)/)
  const hasSession = await page.evaluate(() => Object.keys(localStorage).some(key => key.startsWith('sb-') && key.endsWith('-auth-token')))
  expect(hasSession).toBe(false)
})
