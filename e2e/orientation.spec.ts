import type { Page, Request } from '@playwright/test'
import { expect, test } from './authenticated-test'
import { hasAuthenticatedSession } from './auth-session'
import type { OrientationStateV1 } from '../app/orientacion/state'

type Target = {
  id: string; degreeCode: string; degreeId: string; universityId: string
  degree: string; university: string; community: string; referenceScore: number
  source: { type: 'official' }; subjects: Array<{ id: string; name: string; weighting: number }>
}
type SavedTarget = { degreeId: string | null; universityId: string | null; degree: string; university: string; community: string | null; admissionScore: number }
type OrientationPayload = { community: 'Madrid' | 'Cataluña'; targets: Target[]; universities: unknown[]; criteria: unknown[]; savedTarget: SavedTarget | null; catalogAvailable: boolean }

const sessionExpired = 'Sesión E2E caducada. Ejecuta npm run e2e:auth'
function isOrientationRequest(request: Request, method?: string) { const url = new URL(request.url()); return url.pathname === '/api/orientation' && (!method || request.method() === method) }
function isStateRequest(request: Request, method?: string) { const url = new URL(request.url()); return url.pathname === '/api/orientation/state' && (!method || request.method() === method) }

async function authenticatedFetch(page: Page, path: string, init: { method?: string; body?: unknown } = {}) {
  return page.evaluate(async ({ path, init }) => {
    let accessToken = ''
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index)
      if (!key?.startsWith('sb-') || !key.endsWith('-auth-token')) continue
      try { const value = JSON.parse(localStorage.getItem(key) ?? '{}') as { access_token?: unknown }; if (typeof value.access_token === 'string') accessToken = value.access_token } catch {}
    }
    const response = await fetch(path, { method: init.method, headers: { Authorization: `Bearer ${accessToken}`, ...(init.body === undefined ? {} : { 'Content-Type': 'application/json' }) }, body: init.body === undefined ? undefined : JSON.stringify(init.body) })
    return { status: response.status, body: await response.json().catch(() => ({})) as Record<string, unknown> }
  }, { path, init })
}

async function openOrientation(page: Page) {
  const responsePromise = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET'))
  await page.goto('/orientacion')
  await expect.poll(() => hasAuthenticatedSession(page), { timeout: 10_000, message: sessionExpired }).toBe(true)
  const response = await responsePromise
  expect(response.ok()).toBe(true)
  await expect(page.getByRole('heading', { name: 'Explorar grados', exact: true })).toBeVisible()
  return response.json() as Promise<OrientationPayload>
}
async function openObjective(page: Page) { await page.getByRole('button', { name: 'Mi objetivo', exact: true }).click(); await expect(page.getByRole('radiogroup', { name: 'Modo de Orientación' })).toBeVisible() }
async function chooseMode(page: Page, mode: 'free' | 'target') { const option = page.getByRole('radio', { name: mode === 'free' ? /Solo calcular mi nota/ : /Tengo un objetivo/ }); if (await option.getAttribute('aria-checked') !== 'true') await option.click(); await expect(option).toHaveAttribute('aria-checked', 'true') }

async function chooseTarget(page: Page, target: Target) {
  await page.getByRole('button', { name: 'Explorar grados', exact: true }).click()
  await page.getByRole('textbox', { name: 'Buscar grado en universidades' }).fill(target.degree)
  const card = page.locator('article').filter({ has: page.getByRole('heading', { name: target.degree, exact: true }) }).filter({ hasText: target.university }).first()
  await expect(card).toBeVisible()
  await card.getByRole('button', { name: /Elegir como objetivo|Objetivo seleccionado/ }).click()
  await expect(page.locator(`[data-selected-id="${target.id}"]`)).toBeVisible()
}
async function expectRestoredTarget(page: Page, target: Target) {
  const payload = await openOrientation(page)
  expect(payload.savedTarget?.degreeId).toBe(target.degreeId); expect(payload.savedTarget?.universityId).toBe(target.universityId)
  await openObjective(page)
  await expect(page.locator(`[data-selected-id="${target.id}"]`)).toBeVisible()
  await expect(page.getByRole('region', { name: 'Objetivo oficial' })).toContainText(target.university)
}
async function restoreTarget(page: Page, target: Target | null) {
  if (!target) return authenticatedFetch(page, '/api/orientation', { method: 'DELETE' })
  return authenticatedFetch(page, '/api/orientation', { method: 'POST', body: { target_degree_id: target.degreeId, target_university_id: target.universityId, target_degree: target.degree, target_university: target.university, target_admission_score: target.referenceScore, target_community: target.community, source_type: 'official' } })
}

test('auditoría autenticada completa de Orientación', async ({ page }) => {
  test.setTimeout(600_000)
  const consoleErrors: string[] = []; const runtimeErrors: string[] = []; const failedRequests: string[] = []; let expectedFailure = false
  page.on('console', message => { if (message.type() !== 'error' || /posthog|analytics|favicon|upgrade-insecure-requests/i.test(message.text()) || (expectedFailure && /Failed to load resource/i.test(message.text()))) return; consoleErrors.push(message.text()) })
  page.on('pageerror', error => { if (error.message !== 'Transition was skipped') runtimeErrors.push(error.message) })
  page.on('requestfailed', request => { if ((expectedFailure && (isOrientationRequest(request) || isStateRequest(request))) || /posthog|analytics|googletagmanager/i.test(request.url())) return; failedRequests.push(`${request.method()} ${request.url()}`) })
  let originalState: OrientationStateV1 | null = null; let originalTarget: Target | null = null; let originalCaminoContext: string | null = null

  try {
    await page.addInitScript(() => { localStorage.removeItem('kairo.orientation.state.v1'); localStorage.setItem('kairo_cookie_consent', 'rejected') })
    const madrid = await test.step('carga autenticada y datos oficiales Madrid', async () => {
      const payload = await openOrientation(page)
      expect(payload.catalogAvailable).toBe(true); expect(payload.targets).toHaveLength(554); expect(payload.universities).toHaveLength(6)
      expect(payload.targets.reduce((total, target) => total + target.subjects.length, 0)).toBe(4473)
      expect(payload.targets.every(target => target.source.type === 'official' && target.degreeId && target.universityId)).toBe(true)
      await expect(page.getByText(/Datos demo · no oficiales/)).toHaveCount(0)
      const stateResponse = await authenticatedFetch(page, '/api/orientation/state'); expect(stateResponse.status).toBe(200)
      originalState = (stateResponse.body.state ?? null) as OrientationStateV1 | null
      originalCaminoContext = await page.evaluate(() => localStorage.getItem('kairo.orientation.camino-context.v1'))
      originalTarget = payload.savedTarget?.degreeId && payload.savedTarget.universityId ? payload.targets.find(target => target.degreeId === payload.savedTarget?.degreeId && target.universityId === payload.savedTarget?.universityId) ?? null : null
      return payload
    })
    const target = madrid.targets.find(item => item.subjects.length >= 2 && item.degreeId !== originalTarget?.degreeId) ?? madrid.targets[0]
    const secondTarget = madrid.targets.find(item => item.subjects.length >= 2 && item.degreeId !== target.degreeId) ?? madrid.targets[1]

    await test.step('modo libre calcula, persiste y no guarda objetivos', async () => {
      await openObjective(page); await chooseMode(page, 'free')
      const simulator = page.getByRole('region', { name: 'Simulador sin objetivo' }); await expect(simulator).toBeVisible()
      let objectivePosts = 0; const count = (request: Request) => { if (isOrientationRequest(request, 'POST')) objectivePosts += 1 }; page.on('request', count)
      const bach = page.getByRole('spinbutton', { name: 'Nota media Bachillerato, nota numérica' }); const before = await simulator.innerText()
      await bach.fill((await bach.inputValue()) === '8.35' ? '8.45' : '8.35'); await expect.poll(() => simulator.innerText()).not.toBe(before)
      await page.getByRole('button', { name: 'Añadir asignatura optativa' }).click()
      await page.getByRole('combobox', { name: /Asignatura optativa/ }).first().selectOption({ label: 'Química' })
      await page.getByRole('button', { name: '0,2' }).last().click(); await expect(page.getByText('Guardado', { exact: true })).toBeVisible()
      expect(objectivePosts).toBe(0); page.off('request', count)
      const reload = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET')); await page.reload(); expect((await reload).ok()).toBe(true)
      await openObjective(page); await expect(page.getByRole('radio', { name: /Solo calcular mi nota/ })).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByRole('combobox', { name: /Asignatura optativa Química/ })).toBeVisible()
    })

    await test.step('mínimos de acceso y duplicados no inflan la nota', async () => {
      const bach = page.getByRole('spinbutton', { name: 'Nota media Bachillerato, nota numérica' }); const pau = page.getByRole('spinbutton', { name: 'Fase de acceso PAU, nota numérica' })
      await bach.fill('10'); await pau.fill('3.9'); await expect(page.getByText(/fase de acceso debe tener al menos un 4/i)).toBeVisible()
      await expect(page.getByRole('region', { name: 'Desglose de nota' })).toHaveCount(0); await pau.fill('8')
      await page.getByRole('button', { name: 'Añadir asignatura optativa' }).click()
      await expect(page.getByRole('combobox', { name: /Asignatura optativa/ }).nth(1).locator('option', { hasText: 'Química' })).toBeDisabled()
    })

    await test.step('selección oficial, IDs, sliders y error/reintento de guardado', async () => {
      const stateSave = page.waitForResponse(response => isStateRequest(response.request(), 'PATCH')); await chooseTarget(page, target); expect((await stateSave).ok()).toBe(true)
      const region = page.getByRole('region', { name: 'Objetivo oficial' }); await expect(region).toContainText(target.degree)
      let targetPosts = 0; const count = (request: Request) => { if (isOrientationRequest(request, 'POST')) targetPosts += 1 }; page.on('request', count)
      const before = await region.innerText(); const subjectInput = region.getByRole('spinbutton', { name: /Nota de/ }).first()
      await subjectInput.fill((await subjectInput.inputValue()) === '9.1' ? '8.9' : '9.1'); await expect.poll(() => region.innerText()).not.toBe(before)
      expect(targetPosts).toBe(0); page.off('request', count)
      expectedFailure = true
      await page.route('**/api/orientation', async route => route.request().method() === 'POST' ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ error: 'simulated' }) }) : route.continue())
      await page.getByRole('button', { name: /Guardar y usar en Camino|Actualizar objetivo en Camino/ }).click(); await expect(page.getByRole('alert')).toContainText('No se pudo guardar el objetivo')
      await expect(page).toHaveURL(/\/orientacion/); await page.unroute('**/api/orientation'); expectedFailure = false
      const post = page.waitForResponse(response => isOrientationRequest(response.request(), 'POST'))
      await page.getByRole('button', { name: /Guardar y usar en Camino|Actualizar objetivo en Camino/ }).click(); const response = await post; expect(response.ok()).toBe(true)
      const body = response.request().postDataJSON() as Record<string, unknown>; expect(body.target_degree_id).toBe(target.degreeId); expect(body.target_university_id).toBe(target.universityId); expect('user_id' in body).toBe(false)
      await expect(page).toHaveURL(/\/camino/)
    })

    await test.step('F5 y salir/volver restauran por IDs', async () => {
      await expectRestoredTarget(page, target)
      const reload = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET')); await page.reload(); const payload = await (await reload).json() as OrientationPayload
      expect(payload.savedTarget?.degreeId).toBe(target.degreeId); await openObjective(page); await expect(page.locator(`[data-selected-id="${target.id}"]`)).toBeVisible()
      await page.getByRole('link', { name: 'Camino PAU' }).click(); await expect(page).toHaveURL(/\/camino/); await expectRestoredTarget(page, target)
    })

    await test.step('payloads manipulados se rechazan', async () => {
      const fixture = await authenticatedFetch(page, '/api/orientation', { method: 'POST', body: { target_degree: 'Inventado', target_university: 'Inventada', target_admission_score: 14, source_type: 'fixture' } }); expect(fixture.status).toBe(400)
      const mismatch = await authenticatedFetch(page, '/api/orientation', { method: 'POST', body: { target_degree_id: target.degreeId, target_university_id: secondTarget.universityId, target_degree: target.degree, target_university: secondTarget.university, target_admission_score: target.referenceScore, target_community: 'Madrid', source_type: 'official' } }); expect(mismatch.status).toBe(400)
      const latest = await authenticatedFetch(page, '/api/orientation/state'); const current = latest.body.state as OrientationStateV1; const tampered = structuredClone(current)
      tampered.exploration.degreeId = '07c12ba0-4ab8-4e13-9b83-85b0b529a278'; tampered.exploration.universityId = '3a224872-bf00-4906-9c45-27331c38cff0'
      const invalid = await authenticatedFetch(page, '/api/orientation/state', { method: 'PATCH', body: { state: tampered, expectedUpdatedAt: current.updatedAt } }); expect(invalid.status).toBe(400)
    })

    await test.step('dos pestañas no sobrescriben en silencio', async () => {
      const latest = await authenticatedFetch(page, '/api/orientation/state'); const current = latest.body.state as OrientationStateV1; expect(current.updatedAt).toBeTruthy()
      const first = structuredClone(current); const stale = structuredClone(current); first.activeAccessPath = first.activeAccessPath === 'ib' ? 'spanish_bachillerato' : 'ib'; stale.activeAccessPath = 'bachibac'
      const accepted = await authenticatedFetch(page, '/api/orientation/state', { method: 'PATCH', body: { state: first, expectedUpdatedAt: current.updatedAt } }); expect(accepted.status).toBe(200)
      const conflict = await authenticatedFetch(page, '/api/orientation/state', { method: 'PATCH', body: { state: stale, expectedUpdatedAt: current.updatedAt } }); expect(conflict.status).toBe(409); expect(conflict.body.error).toBe('orientation-state-conflict')
    })

    await test.step('Cataluña permanece oficial, separada y operable', async () => {
      await page.getByRole('button', { name: 'Explorar grados', exact: true }).click()
      const responsePromise = page.waitForResponse(response => new URL(response.url()).searchParams.get('community') === 'cataluna' && isOrientationRequest(response.request(), 'GET'))
      await page.getByRole('group', { name: 'Selecciona comunidad' }).getByRole('button', { name: 'Cataluña' }).click(); const payload = await (await responsePromise).json() as OrientationPayload
      expect(payload.catalogAvailable).toBe(true); expect(payload.targets).toHaveLength(560); expect(payload.universities).toHaveLength(8); expect(payload.targets.reduce((total, item) => total + item.subjects.length, 0)).toBe(4797)
      expect(payload.targets.every(item => item.community === 'Cataluña' && item.source.type === 'official')).toBe(true); await expect(page.getByText(/Datos oficiales de preinscripción 2026/)).toBeVisible()
      await page.getByRole('button', { name: 'Cómo se corrige' }).click(); await expect(page.getByRole('link', { name: 'Ver fuente oficial' })).toHaveAttribute('href', /universitats\.gencat\.cat/)
    })

    await test.step('quitar objetivo limpia Camino y conserva modo libre', async () => {
      await page.getByRole('button', { name: 'Mi objetivo' }).click()
      const madridResponse = page.waitForResponse(response => new URL(response.url()).searchParams.get('community') === 'madrid' && isOrientationRequest(response.request(), 'GET'))
      await page.getByRole('group', { name: 'Selecciona comunidad' }).getByRole('button', { name: 'Madrid' }).click(); expect((await madridResponse).ok()).toBe(true)
      await chooseTarget(page, target); const deletion = page.waitForResponse(response => isOrientationRequest(response.request(), 'DELETE'))
      await page.getByRole('button', { name: 'Quitar objetivo guardado' }).click(); expect((await deletion).ok()).toBe(true)
      await expect(page.getByRole('region', { name: 'Simulador sin objetivo' })).toBeVisible(); expect(await page.evaluate(() => localStorage.getItem('kairo.orientation.camino-context.v1'))).toBeNull()
    })

    await test.step('móvil y teclado no desbordan', async () => {
      await page.setViewportSize({ width: 390, height: 844 }); const group = page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' }); await expect(group).toBeVisible()
      const first = group.getByRole('radio').first(); await first.focus(); await expect(first).toBeFocused(); expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
    })
  } finally {
    if (page.url() !== 'about:blank') {
      try { await restoreTarget(page, originalTarget) } catch {}
      try {
        const latest = await authenticatedFetch(page, '/api/orientation/state')
        if (originalState) {
          const current = latest.body.state as OrientationStateV1 | null
          const restored = await authenticatedFetch(page, '/api/orientation/state', { method: 'PATCH', body: { state: originalState, expectedUpdatedAt: current?.updatedAt ?? null } })
          if (restored.status === 200) await page.evaluate(state => localStorage.setItem('kairo.orientation.state.v1', JSON.stringify(state)), restored.body.state)
        } else { await authenticatedFetch(page, '/api/orientation/state', { method: 'DELETE' }); await page.evaluate(() => localStorage.removeItem('kairo.orientation.state.v1')) }
        await page.evaluate(context => context === null ? localStorage.removeItem('kairo.orientation.camino-context.v1') : localStorage.setItem('kairo.orientation.camino-context.v1', context), originalCaminoContext)
      } catch {}
    }
  }
  expect(consoleErrors, `console.error inesperados:\n${consoleErrors.join('\n')}`).toEqual([]); expect(runtimeErrors, `errores runtime:\n${runtimeErrors.join('\n')}`).toEqual([]); expect(failedRequests, `requests fallidas inesperadas:\n${failedRequests.join('\n')}`).toEqual([])
})
