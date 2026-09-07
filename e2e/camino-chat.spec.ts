import type { Page } from '@playwright/test'
import { expect, test } from './authenticated-test'
import { hasAuthenticatedSession } from './auth-session'

async function accessToken(page: Page) {
  return page.evaluate(() => {
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue
      try {
        const value = JSON.parse(localStorage.getItem(key) ?? '{}') as { access_token?: unknown }
        if (typeof value.access_token === 'string') return value.access_token
      } catch {}
    }
    return null
  })
}

async function deleteMission(page: Page, token: string, missionId: string | null) {
  if (!missionId) return
  await page.request.delete('/api/camino/calendar-editor/mission', { headers: { Authorization: `Bearer ${token}` }, data: { missionId } }).catch(() => undefined)
}

async function dismissCookies(page: Page) {
  const reject = page.getByRole('button', { name: 'Rechazar' })
  await reject.click({ timeout: 2_000 }).catch(() => undefined)
}

async function openChat(page: Page) {
  await page.getByRole('button', { name: 'Hablar con Kairo' }).click()
  await expect(page.getByRole('dialog', { name: 'Kairo, asistente de Camino' })).toBeVisible()
}

async function send(page: Page, text: string) {
  const input = page.getByRole('dialog', { name: 'Kairo, asistente de Camino' }).getByRole('textbox')
  await input.fill(text)
  await input.press('Enter')
}

test('chat mueve, persiste, crea extra, no muta preguntas y permite retry', async ({ page }) => {
  test.setTimeout(240_000)
  const stamp = Date.now()
  const title = `Misión chat E2E ${stamp}`
  const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date())
  let seedId: string | null = null
  let extraId: string | null = null

  await page.goto('/camino')
  await dismissCookies(page)
  await expect.poll(() => hasAuthenticatedSession(page), { timeout: 12_000 }).toBe(true)
  const token = await accessToken(page)
  expect(token).toBeTruthy()

  try {
    const seed = await page.request.post('/api/camino/calendar-editor/mission', {
      headers: { Authorization: `Bearer ${token}` },
      data: { scheduledDate: today, subject: 'matematicas_ii', title, missionType: 'review', role: 'bonus', estimatedMinutes: 30, startTime: null, requestKey: `chat-e2e:${stamp}` },
    })
    expect(seed.ok()).toBe(true)
    seedId = (await seed.json() as { mission: { id: string } }).mission.id
    await page.reload()
    await openChat(page)

    await send(page, `Mueve ${title} a mañana`)
    await expect(page.getByText('Vista previa', { exact: true })).toBeVisible()
    const moveResponsePromise = page.waitForResponse(response => response.url().includes('/api/camino/calendar-editor/mission') && response.request().method() === 'PATCH')
    await page.getByRole('button', { name: 'Confirmar' }).click()
    expect((await moveResponsePromise).ok()).toBe(true)
    await expect(page.getByText('Calendario actualizado ✓', { exact: true })).toBeVisible()

    await page.reload()
    await openChat(page)
    await send(page, `Mueve ${title} a hoy`)
    await expect(page.getByText('Vista previa', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Cancelar' }).click()

    let mutationRequests = 0
    page.on('request', request => {
      if (request.url().includes('/api/camino/calendar-editor/mission') && ['POST', 'PATCH', 'DELETE'].includes(request.method())) mutationRequests += 1
    })
    await send(page, '¿Qué debería estudiar hoy?')
    await expect(page.getByText(/Empieza por|Todavía no tienes misiones/).last()).toBeVisible()
    expect(mutationRequests).toBe(0)

    const extraResponsePromise = page.waitForResponse(response => response.url().includes('/api/camino/calendar-editor/mission') && response.request().method() === 'POST')
    await send(page, 'Añádeme 30 minutos de matrices mañana')
    await expect(page.getByText('Vista previa', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: 'Confirmar' }).click()
    const extraResponse = await extraResponsePromise
    expect(extraResponse.ok()).toBe(true)
    extraId = (await extraResponse.json() as { mission: { id: string } }).mission.id
    await expect(page.getByRole('button', { name: 'Confirmar' })).toHaveCount(0)
    await expect(page.getByRole('dialog', { name: 'Kairo, asistente de Camino' }).getByRole('textbox')).toBeEnabled()

    let failOnce = true
    await page.route('**/api/camino/calendar-editor/mission', async route => {
      if (route.request().method() === 'PATCH' && failOnce) {
        failOnce = false
        await route.fulfill({ status: 502, contentType: 'application/json', json: { error: 'google_sync_failed', persisted: false } })
        return
      }
      await route.fallback()
    })
    await send(page, `Mueve ${title} a mañana`)
    await expect(page.getByText('Vista previa', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Confirmar' })).toBeEnabled()
    await page.getByRole('button', { name: 'Confirmar' }).click()
    const errorCard = page.getByTestId('camino-chat-error')
    await expect(errorCard).toContainText('No he podido aplicar el cambio')
    await errorCard.getByRole('button', { name: 'Reintentar' }).click()
    await expect(page.getByText('Calendario actualizado ✓', { exact: true })).toBeVisible()
  } finally {
    if (token) {
      await deleteMission(page, token, extraId)
      await deleteMission(page, token, seedId)
    }
  }
})

for (const viewport of [{ width: 1440, height: 900 }, { width: 1024, height: 768 }, { width: 390, height: 844 }]) {
  test(`semana, contador y chat no se solapan a ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/camino')
    await dismissCookies(page)
    await expect.poll(() => hasAuthenticatedSession(page), { timeout: 12_000 }).toBe(true)
    const week = page.getByTestId('camino-week-overview')
    const days = page.getByTestId('camino-days-until-pau')
    await expect(week).toBeVisible()
    await expect(days).toBeVisible()
    const [weekBox, daysBox] = await Promise.all([week.boundingBox(), days.boundingBox()])
    expect(weekBox).not.toBeNull()
    expect(daysBox).not.toBeNull()
    expect(weekBox!.y).toBeGreaterThanOrEqual(daysBox!.y + daysBox!.height - 1)
    await openChat(page)
    const dialog = page.getByRole('dialog', { name: 'Kairo, asistente de Camino' })
    const box = await dialog.boundingBox()
    expect(box).not.toBeNull()
    expect(box!.x).toBeGreaterThanOrEqual(0)
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 1)
    const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
    expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
  })
}
