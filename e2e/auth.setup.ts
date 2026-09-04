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
  await context.storageState({ path: authState })
  try { await fs.chmod(authState, 0o600) } catch { /* Windows may not expose POSIX permissions. */ }
  process.stdout.write('Sesión detectada y guardada de forma local.\n')
})
