import type { Page } from '@playwright/test'
import { expect, test } from './authenticated-test'

const correction = {
  nota_final: 2,
  feedback_general: 'Corrección E2E completada y estructurada.',
  fortalezas: ['Respuesta clara.'],
  errores_principales: ['Falta una comprobación final.'],
  plan_repaso: [],
  desglose_bloques: [{
    numero_bloque: 'Ejercicio',
    tema: 'Prueba E2E',
    puntos_conseguidos: 2,
    puntos_maximos: 2.5,
    que_hizo_bien: 'Planteamiento correcto.',
    errores_detectados: ['Revisar el cierre.'],
    correccion_detalle: 'El razonamiento principal es correcto.',
    solucion_orientativa: 'Desarrollo orientativo completo.',
    consejo_especifico: 'Comprueba el resultado.',
  }],
}

async function useCommunity(page: Page, community: 'Madrid' | 'Cataluña') {
  await page.addInitScript(value => {
    localStorage.setItem('kairo_ccaa', value)
    localStorage.setItem('kairo_cookie_consent', 'rejected')
  }, community)
}

async function mockSuccessfulCorrection(page: Page) {
  const correctionBodies: Record<string, unknown>[] = []
  const historyBodies: Record<string, unknown>[] = []
  const xpBodies: Record<string, unknown>[] = []

  await page.route('**/api/exam/correct', async route => {
    correctionBodies.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, contentType: 'application/json', json: { correction, notEvaluable: false, truncated: false, xpGrant: 'signed-e2e-grant' } })
  })
  await page.route('**/rest/v1/historial_examenes*', async route => {
    if (route.request().method() !== 'POST') return route.fallback()
    const body = route.request().postDataJSON() as Record<string, unknown>
    historyBodies.push(body)
    await route.fulfill({ status: 201, contentType: 'application/json', json: { id: body.id } })
  })
  await page.route('**/api/camino/award-exam-xp', async route => {
    xpBodies.push(route.request().postDataJSON())
    await route.fulfill({ status: 200, contentType: 'application/json', json: { success: true, xpAwarded: 20, bonusXp: 0 } })
  })
  return { correctionBodies, historyBodies, xpBodies }
}

test('listado oficial, cambio de asignatura y borrador sobreviven F5 sin requests por tecla', async ({ page }) => {
  await useCommunity(page, 'Madrid')
  let correctionRequests = 0
  await page.route('**/api/exam/correct', async route => { correctionRequests++; await route.abort() })
  await page.goto('/examenes?subject=mates')

  await expect(page.locator('.pau-rich-editor')).toBeVisible()
  const answer = page.locator('.pau-rich-editor')
  const mathDraft = `Borrador matemáticas ${Date.now()} con x^2 y raíz`
  await answer.fill(mathDraft)
  await page.reload()
  await expect(page.locator('.pau-rich-editor')).toHaveText(mathDraft)

  await page.getByRole('button', { name: 'Física', exact: true }).click()
  const physicsDraft = `Borrador física ${Date.now()}`
  await page.locator('.pau-rich-editor').fill(physicsDraft)
  await page.getByRole('button', { name: 'Matemáticas', exact: true }).click()
  await expect(page.locator('.pau-rich-editor')).toHaveText(mathDraft)
  expect(correctionRequests).toBe(0)
})

test('Historia Cataluña permite abrir cada serie y la búsqueda conserva la sesión exacta', async ({ page }) => {
  await useCommunity(page, 'Cataluña')
  await page.goto('/examenes?subject=historia')

  const year = page.locator('.exam-filter-trigger').filter({ hasText: 'Año' })
  await year.click()
  await page.getByRole('button', { name: '2024', exact: true }).click()
  const session = page.locator('.exam-filter-trigger').filter({ hasText: 'Sesión' })
  await expect(session).toContainText('Serie 1')
  await session.click()
  await page.getByRole('button', { name: 'Serie 3', exact: true }).click()
  await expect(page.getByText('El regeneracionismo', { exact: true })).toBeVisible()

  const search = page.getByPlaceholder('Buscar examen...')
  await search.fill('desastre de Annual')
  await page.getByRole('button', { name: /Ejercicio 1.*El desastre de Annual/ }).click()
  await expect(page.locator('.exam-filter-trigger').filter({ hasText: 'Sesión' })).toContainText('Serie 5')
  await expect(page.getByText('El desastre de Annual', { exact: true })).toBeVisible()
})

test('doble envío crea una sola corrección, un historial y un XP', async ({ page }) => {
  await useCommunity(page, 'Madrid')
  const calls = await mockSuccessfulCorrection(page)
  await page.goto('/examenes?subject=mates')
  await page.locator('.pau-rich-editor').fill('Desarrollo completo de la respuesta.')
  const submit = page.getByRole('button', { name: 'Corregir con Kairo' })
  await submit.evaluate(button => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
  })
  await expect(page.getByText('Respuesta clara.').first()).toBeVisible()
  await expect.poll(() => ({
    corrections: calls.correctionBodies.length,
    history: calls.historyBodies.length,
    xp: calls.xpBodies.length,
  })).toEqual({ corrections: 1, history: 1, xp: 1 })
  expect(calls.historyBodies[0].id).toBe(calls.correctionBodies[0].historyId)
  expect(calls.xpBodies[0]).toEqual({ historialExamenId: calls.correctionBodies[0].historyId, xpGrant: 'signed-e2e-grant' })
})

test('error de corrección es honesto, conserva respuesta y permite reintentar', async ({ page }) => {
  await useCommunity(page, 'Madrid')
  let attempt = 0
  await page.route('**/api/exam/correct', async route => {
    attempt++
    if (attempt === 1) {
      await route.fulfill({ status: 503, contentType: 'application/json', json: { error: 'ai_overloaded', message: 'Hay mucha gente corrigiendo ahora mismo.' } })
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', json: { correction, notEvaluable: false, truncated: true } })
    }
  })
  let historyWrites = 0
  await page.route('**/rest/v1/historial_examenes*', async route => {
    if (route.request().method() === 'POST') historyWrites++
    await route.fallback()
  })
  await page.goto('/examenes?subject=mates')
  const answer = page.locator('.pau-rich-editor')
  await answer.fill('Respuesta que no debe perderse.')
  const firstResponsePromise = page.waitForResponse(response => response.url().includes('/api/exam/correct'))
  await page.getByRole('button', { name: 'Corregir con Kairo' }).click()
  const firstResponse = await firstResponsePromise
  expect(firstResponse.status()).toBe(503)
  expect(attempt).toBe(1)
  await expect(page.getByText('Hay mucha gente corrigiendo ahora mismo.')).toBeVisible()
  await expect(answer).toHaveText('Respuesta que no debe perderse.')
  await page.getByRole('button', { name: 'Corregir con Kairo' }).click()
  await expect(page.getByText('Respuesta incompleta')).toBeVisible()
  expect(historyWrites).toBe(0)
})

test('historial anterior abre y repetir crea un id nuevo sin sobrescribir el original', async ({ page }) => {
  await useCommunity(page, 'Madrid')
  const originalId = '6b260946-c1cf-42e9-b88c-d5fb75dfe349'
  const oldCorrection = JSON.stringify(correction)
  await page.route('**/rest/v1/historial_examenes*', async route => {
    if (route.request().method() === 'HEAD') {
      await route.fulfill({ status: 200, headers: { 'Content-Range': '0-0/1' } })
      return
    }
    if (route.request().method() === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'Content-Range': '0-0/1' }, json: [{ id: originalId, user_id: 'e2e', asignatura: 'mates', tipo: 'Ordinaria', año: 2025, bloque: 'Álgebra', opcion: 'A', nota: 1.5, nota_maxima: 2.5, enunciado: 'Resuelve el sistema x + y = 2.', respuesta: 'x = 1, y = 1', correccion: oldCorrection, created_at: '2026-09-08T10:00:00.000Z' }] })
      return
    }
    await route.fallback()
  })
  await page.route('**/api/historial/percentile', async route => route.fulfill({ status: 200, contentType: 'application/json', json: { percentil: 50, totalUsuarios: 10 } }))
  const calls = await mockSuccessfulCorrection(page)
  await page.goto('/examenes?view=historial')
  await page.getByRole('button', { name: /Ver corrección/ }).first().click()
  await expect(page.getByText('Respuesta del alumno')).toBeVisible()
  await page.getByRole('button', { name: /repetir/i }).click()
  await page.locator('.pau-rich-editor').last().fill('Nueva respuesta mejorada.')
  await page.getByRole('button', { name: 'Corregir', exact: true }).click()
  await expect(page.getByText('Respuesta clara.').first()).toBeVisible()
  expect(calls.historyBodies).toHaveLength(1)
  expect(calls.historyBodies[0].repeated_from_id).toBe(originalId)
  expect(calls.historyBodies[0].id).not.toBe(originalId)
})

test('un fallo de persistencia no muestra éxito falso ni solicita XP', async ({ page }) => {
  await useCommunity(page, 'Madrid')
  let xpWrites = 0
  await page.route('**/api/exam/correct', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', json: { correction, notEvaluable: false, truncated: false, xpGrant: 'signed-e2e-grant' } })
  })
  await page.route('**/rest/v1/historial_examenes*', async route => {
    if (route.request().method() !== 'POST') return route.fallback()
    await route.fulfill({ status: 500, contentType: 'application/json', json: { code: 'E2E_SAVE_FAILURE', message: 'Fallo controlado de persistencia' } })
  })
  await page.route('**/api/camino/award-exam-xp', async route => {
    xpWrites++
    await route.fulfill({ status: 200, contentType: 'application/json', json: { success: true, xpAwarded: 20, bonusXp: 0 } })
  })

  await page.goto('/examenes?subject=mates')
  await page.locator('.pau-rich-editor').fill('Respuesta completa que debe seguir visible.')
  await page.getByRole('button', { name: 'Corregir con Kairo' }).click()

  await expect(page.getByText('Respuesta clara.').first()).toBeVisible()
  await expect(page.getByText(/no se ha podido guardar en Historial/)).toBeVisible()
  await expect(page.locator('.pau-rich-editor')).toHaveText('Respuesta completa que debe seguir visible.')
  expect(xpWrites).toBe(0)
})

test('la práctica sigue usable a 1440, 1024 y 390px sin overflow horizontal esencial', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await useCommunity(page, 'Madrid')
  await page.goto('/examenes?subject=mates')
  await expect(page.locator('.pau-rich-editor')).toBeVisible()
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(viewport)
    const metrics = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2)
  }
})
