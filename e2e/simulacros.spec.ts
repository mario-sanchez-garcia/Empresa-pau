import { expect, test } from '@playwright/test'

test.describe('Simulacros authenticated lifecycle', () => {
  test('unique start, authoritative timer, latest-write protection, F5, partial retry and continue', async ({ page, context }) => {
    const consoleErrors: string[] = []
    const failedRequests: string[] = []
    page.on('console', message => {
      if (message.type() !== 'error') return
      const text = message.text()
      if (text.includes("upgrade-insecure-requests") || /status of (409|502)/.test(text)) return
      consoleErrors.push(text)
    })
    page.on('requestfailed', request => {
      if (request.resourceType() !== 'font') failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`)
    })

    await page.goto('/simulacros')
    await expect(page).not.toHaveURL(/\/login/)
    const accessToken = await page.evaluate(() => {
      for (const value of Object.values(window.localStorage)) {
        try {
          const parsed = JSON.parse(value)
          if (typeof parsed?.access_token === 'string') return parsed.access_token as string
        } catch { /* another app key */ }
      }
      return null
    })
    expect(accessToken).toBeTruthy()
    const foreignId = crypto.randomUUID()
    const foreignSave = await page.request.post('/api/simulacro/session', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { action: 'save', attemptId: foreignId, expectedRevision: 0, answers: {} },
    })
    expect(foreignSave.status()).toBe(404)
    const foreignTimer = await page.request.post('/api/simulacro/timer', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: { simulacroId: foreignId, action: 'resume' },
    })
    expect(foreignTimer.status()).toBe(404)
    const createButton = page.getByRole('button', { name: /Empezar simulacro normal/i })
    await expect(createButton).toBeEnabled()

    let startCalls = 0
    page.on('request', request => {
      if (request.url().endsWith('/api/simulacro/session') && request.postDataJSON()?.action === 'start') startCalls += 1
    })
    await createButton.evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
    await expect(page).toHaveURL(/\/simulacros\/[0-9a-f-]+$/i)
    expect(startCalls).toBe(1)
    const attemptId = page.url().split('/').pop()!

    try {

    let timerStarts = 0
    page.on('request', request => {
      if (request.url().endsWith('/api/simulacro/timer') && request.postDataJSON()?.action === 'resume') timerStarts += 1
    })
    const beginButton = page.getByRole('button', { name: /Empezar simulacro/i })
    await beginButton.evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
    await expect(page.getByRole('button', { name: /Entregar simulacro/i })).toBeVisible()
    expect(timerStarts).toBe(1)

    const firstAnswer = page.locator('textarea').first()
    const answerA = 'Respuesta E2E inicial con LaTeX: $x^2 + 1$.'
    await firstAnswer.fill(answerA)
    await expect(page.getByText('Guardado', { exact: true })).toBeVisible({ timeout: 15_000 })

    await page.reload()
    await expect(page.locator('textarea').first()).toHaveValue(answerA)
    await expect(page.getByRole('button', { name: /Entregar simulacro/i })).toBeVisible()

    const secondPage = await context.newPage()
    await secondPage.goto(`/simulacros/${attemptId}`)
    const answerB = 'Respuesta guardada desde la segunda pestaña.'
    await secondPage.locator('textarea').first().fill(answerB)
    await expect(secondPage.getByText('Guardado', { exact: true })).toBeVisible({ timeout: 15_000 })

    await firstAnswer.fill('Cambio obsoleto desde la primera pestaña.')
    await expect(page.getByText('Error al guardar', { exact: true })).toBeVisible({ timeout: 15_000 })
    await page.reload()
    await expect(page.locator('textarea').first()).toHaveValue(answerB)
    await secondPage.close()

    let correctionCalls = 0
    await page.route('**/api/simulacro', async route => {
      correctionCalls += 1
      await new Promise(resolve => setTimeout(resolve, 250))
      await route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({
          correction_error: true,
          estado_correccion: 'parcial',
          mensaje_usuario: 'La corrección quedó parcial: 3 de 4 bloques listos. Reintenta para corregir solo el pendiente; no se ha concedido XP.',
        }),
      })
    })
    await page.getByRole('button', { name: /Entregar simulacro/i }).click()
    const submitButton = page.getByRole('button', { name: 'Entregar y corregir' })
    await submitButton.evaluate((button: HTMLButtonElement) => { button.click(); button.click() })
    await expect(page.getByRole('alert').filter({ hasText: 'corrección quedó parcial' })).toBeVisible()
    expect(correctionCalls).toBe(1)
    await page.unroute('**/api/simulacro')
    await page.getByRole('button', { name: 'Seguir revisando' }).click()

    await page.getByRole('button', { name: /Pausar/i }).click()
    await expect(page.getByRole('button', { name: /Continuar simulacro/i })).toBeVisible()

    await page.setViewportSize({ width: 390, height: 844 })
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(1)

    await page.goto('/simulacros')
    await page.getByRole('button', { name: /Mis simulacros/i }).click()
    const attemptLink = page.locator(`a[href="/simulacros/${attemptId}"]`).first()
    await expect(attemptLink).toBeVisible()
    await attemptLink.click()
    await expect(page.getByRole('button', { name: /Continuar simulacro/i })).toBeVisible()

    await page.goto('/simulacros')
    await page.getByRole('button', { name: /Mis simulacros/i }).click()
    const row = page.locator(`a[href="/simulacros/${attemptId}"]`).first().locator('..')
    page.once('dialog', dialog => dialog.accept())
    await row.getByRole('button', { name: 'Borrar intento sin terminar' }).click()
    await expect(page.locator(`a[href="/simulacros/${attemptId}"]`)).toHaveCount(0)

    expect(consoleErrors).toEqual([])
    expect(failedRequests).toEqual([])
    } finally {
      // Avoid leaving a synthetic attempt in the test account if an assertion
      // aborts the journey before the UI cleanup step.
      await page.request.post('/api/simulacro/session', {
        headers: { Authorization: `Bearer ${accessToken}` },
        data: { action: 'delete', attemptId },
      }).catch(() => undefined)
    }
  })
})
