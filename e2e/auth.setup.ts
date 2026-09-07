import fs from 'node:fs/promises'
import path from 'node:path'
import { test } from '@playwright/test'
import { hasAuthenticatedSession } from './auth-session'

const authState = path.join(process.cwd(), 'playwright', '.auth', 'user.json')

test('guardar una sesión iniciada manualmente', async ({ page, context }) => {
  test.setTimeout(0)
  await page.goto('/login?returnTo=%2Forientacion')
  process.stdout.write('Se ha abierto el navegador. Inicia sesión normalmente y, cuando veas Kairo autenticado, vuelve aquí y escribe listo.\n')

  for (;;) {
    let authenticated = false
    try {
      authenticated = await hasAuthenticatedSession(page)
    } catch {
      // page.evaluate puede lanzar "Execution context was destroyed" si el
      // login del alumno dispara justo entonces una navegación (p.ej. el
      // redirect a /camino) — no es un fallo real, solo hay que reintentar
      // en el siguiente tick en vez de abortar el test.
    }
    if (authenticated) break
    await page.waitForTimeout(750)
  }

  await fs.mkdir(path.dirname(authState), { recursive: true })
  const state = await context.storageState()
  const storageOrigin = process.env.E2E_STORAGE_ORIGIN?.replace(/\/$/, '')
  const currentOrigin = new URL(page.url()).origin
  const currentStorage = state.origins.find(origin => origin.origin === currentOrigin)
  if (storageOrigin && currentStorage && !state.origins.some(origin => origin.origin === storageOrigin)) {
    // Supabase stores the browser session in localStorage. Login against the
    // deployed HTTPS origin (where email/OAuth redirects are reliable), then
    // copy only those storage entries to the local E2E origin. No credential
    // is printed and the ignored storageState remains the only persisted file.
    const supabaseSession = currentStorage.localStorage.filter(entry => entry.name.startsWith('sb-') && entry.name.endsWith('-auth-token'))
    state.origins.push({ origin: storageOrigin, localStorage: supabaseSession })
  }
  await fs.writeFile(authState, JSON.stringify(state), { encoding: 'utf8', mode: 0o600 })
  try { await fs.chmod(authState, 0o600) } catch { /* Windows may not expose POSIX permissions. */ }
  process.stdout.write('Sesión detectada y guardada de forma local.\n')
})
