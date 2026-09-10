import { expect, test } from '@playwright/test'

test('onboarding partial survives F5 and navigation at 390px', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/login')
  await page.evaluate(() => {
    localStorage.setItem('kairo_onboarding_v1', JSON.stringify({
      completedAt: null,
      lastStep: 'daily-time',
      community: 'Madrid',
      schoolName: 'Centro de prueba',
      schoolSource: 'manual',
      subjects: ['Inglés'],
      preparationFeeling: 'Voy algo perdido/a',
      traceId: crypto.randomUUID(),
    }))
  })
  await page.goto('/onboarding')
  await expect(page.getByText('¿Cuánto tiempo podrías estudiar al día?')).toBeVisible()
  await page.reload()
  await expect(page.getByText('¿Cuánto tiempo podrías estudiar al día?')).toBeVisible()
  await page.goto('/login')
  await page.goto('/onboarding')
  await expect(page.getByText('¿Cuánto tiempo podrías estudiar al día?')).toBeVisible()
})

test('protected auth/onboarding APIs reject an anonymous browser', async ({ page }) => {
  await page.goto('/login')
  const statuses = await page.evaluate(async () => {
    const [me, finalize] = await Promise.all([
      fetch('/api/onboarding/me'),
      fetch('/api/onboarding/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_id: crypto.randomUUID() }),
      }),
    ])
    return [me.status, finalize.status]
  })
  expect(statuses).toEqual([401, 401])
})

test('protected product pages send an anonymous browser to login', async ({ page }) => {
  for (const path of ['/camino', '/settings', '/simulacros', '/examenes?view=historial']) {
    await page.goto(path)
    await expect(page).toHaveURL(/\/login(?:[/?#]|$)/)
  }
})

test('invalid login is generic and an immediate double click sends one request', async ({ page }) => {
  let attempts = 0
  await page.route('**/auth/v1/token?grant_type=password', async route => {
    attempts += 1
    await new Promise(resolve => setTimeout(resolve, 150))
    await route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'invalid_grant', error_description: 'Invalid login credentials' }),
    })
  })
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill('  NO-EXISTE@EXAMPLE.COM  ')
  await page.locator('#login-password').fill('incorrecta')
  await page.getByRole('button', { name: 'Entrar a Kairo' }).dblclick()
  await expect(page.getByText('Email o contraseña incorrectos.', { exact: true })).toBeVisible()
  expect(attempts).toBe(1)
})

test('password recovery network failure does not show false success', async ({ page }) => {
  await page.route('**/api/auth/request-password-reset', route => route.abort('failed'))
  await page.goto('/login')
  await page.getByLabel('Correo electrónico').fill('persona@example.com')
  await page.getByRole('button', { name: '¿La olvidaste?' }).click()
  await expect(page.getByRole('status')).toContainText('no tienes conexión')
  await expect(page.getByRole('status')).not.toContainText('Solicitud aceptada')
})

test('normal sessions cannot open the password recovery form', async ({ page }) => {
  await page.goto('/login/reset-password')
  await expect(page.getByText(/ha caducado o ya se ha usado/i)).toBeVisible()
})

test('malicious login returnTo is not forwarded to Google OAuth', async ({ page }) => {
  let authorizeUrl = ''
  await page.route('**/auth/v1/authorize**', async route => {
    authorizeUrl = route.request().url()
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<p>intercepted</p>' })
  })
  await page.goto('/login?returnTo=javascript%3Aalert%281%29')
  await page.getByRole('button', { name: 'Continúa con Google' }).click()
  await expect.poll(() => authorizeUrl).not.toBe('')
  const redirectTo = new URL(authorizeUrl).searchParams.get('redirect_to') ?? ''
  expect(redirectTo).toContain('/auth/callback')
  expect(redirectTo).not.toContain('javascript:')
  expect(redirectTo).not.toContain('evil')
})

test('callback errors never render the provider technical payload', async ({ page }) => {
  await page.goto('/auth/callback?error=access_denied&error_description=PRIVATE_PROVIDER_DETAIL')
  await expect(page.getByText(/No se pudo completar el inicio de sesión/)).toBeVisible()
  await expect(page.getByText('PRIVATE_PROVIDER_DETAIL')).toHaveCount(0)
})
