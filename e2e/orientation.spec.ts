import { expect, test, type Page, type Request } from '@playwright/test'
import { hasAuthenticatedSession } from './auth-session'

type SavedTarget = {
  degreeId: string | null
  universityId: string | null
  degree: string
  university: string
  community: string | null
  admissionScore: number
}

type Target = {
  id: string
  degreeCode: string
  degreeId: string | null
  universityId: string | null
  degree: string
  university: string
  community: string | null
  referenceScore: number
  source: { type: 'official' | 'fixture' }
  subjects: unknown[]
}

type OrientationPayload = {
  community: 'Madrid' | 'Cataluña'
  targets: Target[]
  universities: unknown[]
  savedTarget: SavedTarget | null
  catalogAvailable: boolean
}

const saveButtonName = /Guardar y usar en Camino|Usar este objetivo en Camino|Actualizar objetivo en Camino|Guardando…/
const sessionExpired = 'Sesión E2E caducada. Ejecuta npm run e2e:auth'

function isOrientationRequest(request: Request, method?: string) {
  const url = new URL(request.url())
  return url.pathname === '/api/orientation' && (!method || request.method() === method)
}

async function assertAuthenticated(page: Page) {
  await expect.poll(() => hasAuthenticatedSession(page), { timeout: 8_000, message: sessionExpired }).toBe(true)
}

async function openOrientation(page: Page) {
  const responsePromise = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET'))
  await page.goto('/orientacion')
  await assertAuthenticated(page)
  const response = await responsePromise
  expect(response.ok()).toBe(true)
  const payload = await response.json() as OrientationPayload
  await expect(page.getByRole('heading', { name: 'Mi objetivo' })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Carrera y universidad' })).toBeVisible()
  return payload
}

async function selectTarget(page: Page, target: Target) {
  expect(target.degreeId, 'El grado oficial debe tener degree_id').toBeTruthy()
  expect(target.universityId, 'El grado oficial debe tener university_id').toBeTruthy()
  const combobox = page.getByRole('combobox', { name: 'Carrera y universidad' })
  await combobox.fill(target.degree)
  const option = page.getByRole('listbox', { name: 'Resultados de grados' }).getByRole('option').filter({ hasText: target.degree }).filter({ hasText: target.university }).first()
  await expect(option).toBeVisible()
  await option.click()
  await expect(page.locator(`[data-selected-id="${target.id}"]`)).toBeVisible()
}

async function switchCommunity(page: Page, community: 'Madrid' | 'Cataluña') {
  const button = page.getByRole('group', { name: 'Selecciona comunidad' }).getByRole('button', { name: community, exact: true })
  if (await button.getAttribute('aria-pressed') === 'true') return openOrientation(page)
  const slug = community === 'Madrid' ? 'madrid' : 'cataluna'
  const responsePromise = page.waitForResponse(response => {
    const url = new URL(response.url())
    return url.pathname === '/api/orientation' && url.searchParams.get('community') === slug && response.request().method() === 'GET'
  })
  await button.click()
  const response = await responsePromise
  expect(response.ok()).toBe(true)
  await expect(page.getByRole('button', { name: community, pressed: true })).toBeVisible()
  return response.json() as Promise<OrientationPayload>
}

async function saveTarget(page: Page, target: Target, assertPending = false) {
  let releaseResponse: (() => void) | undefined
  const responseGate = assertPending ? new Promise<void>(resolve => { releaseResponse = resolve }) : Promise.resolve()

  if (assertPending) {
    await page.route('**/api/orientation', async route => {
      if (route.request().method() !== 'POST') return route.continue()
      const response = await route.fetch()
      await responseGate
      await route.fulfill({ response })
    })
  }

  const requestPromise = page.waitForRequest(request => isOrientationRequest(request, 'POST'))
  const responsePromise = page.waitForResponse(response => isOrientationRequest(response.request(), 'POST'))
  const button = page.getByRole('button', { name: saveButtonName })
  if (assertPending) {
    await button.dispatchEvent('click')
    try {
      await requestPromise
      await expect(button).toBeDisabled()
    } finally {
      releaseResponse?.()
    }
  } else await button.click()
  const response = await responsePromise
  expect(response.ok()).toBe(true)
  const body = response.request().postDataJSON() as Record<string, unknown>
  expect(body.target_degree_id).toBe(target.degreeId)
  expect(body.target_university_id).toBe(target.universityId)
  expect(body.target_community).toBe(target.community)
  expect('user_id' in body).toBe(false)
  await expect(page).toHaveURL(/\/camino(?:\?|$)/)
  if (assertPending) await page.unroute('**/api/orientation')
}

async function expectRestoredTarget(page: Page, target: Target) {
  const payload = await openOrientation(page)
  expect(payload.savedTarget?.degreeId).toBe(target.degreeId)
  expect(payload.savedTarget?.universityId).toBe(target.universityId)
  await expect(page.locator(`[data-selected-id="${target.id}"]`)).toBeVisible()
  const saved = page.getByText('Objetivo guardado', { exact: true }).locator('..')
  await expect(saved).toContainText(target.degree)
  await expect(saved).toContainText(target.university)
  return payload
}

test('Orientación conserva el objetivo autenticado y mantiene el simulador local', async ({ page }) => {
  test.setTimeout(150_000)
  const consoleErrors: string[] = []
  const runtimeErrors: string[] = []
  const failedRequests: string[] = []
  let expectedSaveFailure = false
  let expectedFailedResourceMessages = 0

  page.on('console', message => {
    if (message.type() !== 'error') return
    const text = message.text()
    if (/posthog|analytics|favicon/i.test(text)) return
    if (/upgrade-insecure-requests.*report-only policy/i.test(text)) return
    if (/Failed to load resource: net::ERR_FAILED/i.test(text) && expectedFailedResourceMessages > 0) {
      expectedFailedResourceMessages -= 1
      return
    }
    consoleErrors.push(text)
  })
  page.on('pageerror', error => {
    if (error.message === 'Transition was skipped') return
    runtimeErrors.push(error.message)
  })
  page.on('requestfailed', request => {
    if (expectedSaveFailure && isOrientationRequest(request, 'POST')) return
    if (request.method() === 'HEAD' && request.failure()?.errorText === 'net::ERR_ABORTED') return
    if (!/posthog|analytics|googletagmanager/i.test(request.url())) failedRequests.push(`${request.method()} ${request.url()}`)
  })

  let originalTarget: Target | undefined
  let originalSavedTarget: SavedTarget | null = null

  try {
    await page.addInitScript(() => {
      if (!localStorage.getItem('kairo_orientation_community_v1')) localStorage.setItem('kairo_orientation_community_v1', 'Madrid')
    })
    const initial = await test.step('carga autenticada y catálogo oficial', async () => {
      const payload = await openOrientation(page)
      const accessPaths = page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' })
      await accessPaths.getByRole('radio', { name: /^Bachillerato/ }).click()
      await expect(accessPaths.getByRole('radio', { name: /^Bachillerato/ })).toHaveAttribute('aria-checked', 'true')
      expect(payload.catalogAvailable).toBe(true)
      expect(payload.targets).toHaveLength(554)
      expect(payload.universities).toHaveLength(6)
      expect(new Set(payload.targets.map(target => target.degreeId)).size).toBe(554)
      expect(payload.targets.reduce((total, target) => total + target.subjects.length, 0)).toBe(4473)
      expect(new Set(payload.targets.map(target => target.community))).toEqual(new Set(['Comunidad de Madrid']))
      expect(payload.targets.every(target => Number.isFinite(target.referenceScore))).toBe(true)
      expect(payload.targets.every(target => target.source.type === 'official')).toBe(true)
      await expect(page.getByText(/Datos demo · no oficiales/)).toHaveCount(0)
      return payload
    })

    const initialSavedTarget = initial.savedTarget
    originalSavedTarget = initialSavedTarget
    originalTarget = initialSavedTarget?.degreeId && initialSavedTarget.universityId
      ? initial.targets.find(target => target.degreeId === initialSavedTarget.degreeId && target.universityId === initialSavedTarget.universityId)
      : undefined
    const firstTarget = initial.targets.find(target => target.degreeId !== initialSavedTarget?.degreeId && target.subjects.length >= 2) ?? initial.targets[0]
    const secondTarget = initial.targets.find(target => target.degreeId !== firstTarget.degreeId && target.subjects.length >= 2) ?? initial.targets[1]
    expect(firstTarget).toBeTruthy()
    expect(secondTarget).toBeTruthy()

    await test.step('selección y guardado por identificadores estables', async () => {
      await selectTarget(page, firstTarget)
      await saveTarget(page, firstTarget, true)
    })

    await test.step('F5 restaura universidad y grado mediante IDs', async () => {
      await expectRestoredTarget(page, firstTarget)
      const responsePromise = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET'))
      await page.reload()
      const response = await responsePromise
      const payload = await response.json() as OrientationPayload
      expect(payload.savedTarget?.degreeId).toBe(firstTarget.degreeId)
      expect(payload.savedTarget?.universityId).toBe(firstTarget.universityId)
      await expect(page.locator(`[data-selected-id="${firstTarget.id}"]`)).toBeVisible()
    })

    await test.step('salir y volver no depende del estado React anterior', async () => {
      await page.getByRole('link', { name: 'Camino PAU' }).click()
      await expect(page).toHaveURL(/\/camino(?:\?|$)/)
      await expectRestoredTarget(page, firstTarget)
    })

    await test.step('sliders y oportunidades reaccionan sin persistencia accidental', async () => {
      let orientationRequests = 0
      const countRequests = (request: Request) => { if (isOrientationRequest(request)) orientationRequests += 1 }
      page.on('request', countRequests)
      const score = page.locator('[aria-label^="Tu nota estimada es"]')
      const scoreBefore = await score.getAttribute('aria-label')
      const opportunities = page.getByRole('region', { name: 'Alternativas con tu nota actual' })
      const opportunitiesBefore = await opportunities.innerText()
      await page.getByRole('spinbutton', { name: 'Nota media Bachillerato, nota numérica' }).fill('10')
      await page.getByRole('spinbutton', { name: 'Fase de acceso PAU, nota numérica' }).fill('10')
      await expect(score).not.toHaveAttribute('aria-label', scoreBefore ?? '')
      await expect.poll(() => opportunities.innerText()).not.toBe(opportunitiesBefore)
      expect(orientationRequests).toBe(0)
      await expect(opportunities).toContainText(/Por encima|Cerca|Por debajo/)
      await expect(page.getByText(/no garantiza la admisión/i)).toBeVisible()
      page.off('request', countRequests)
    })

    await test.step('cada vía muestra sus campos, calcula en vivo y mantiene escenarios aislados', async () => {
      const accessPaths = page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' })
      const ordinaryBach = page.getByRole('spinbutton', { name: 'Nota media Bachillerato, nota numérica' })
      const ordinaryPau = page.getByRole('spinbutton', { name: 'Fase de acceso PAU, nota numérica' })
      await ordinaryBach.fill('9.25')
      await ordinaryPau.fill('8.75')

      await accessPaths.getByRole('radio', { name: /^Bachibac/ }).click()
      await expect(page.getByRole('radiogroup', { name: '¿Qué título usarás para acceder?' })).toBeVisible()
      await expect(page.getByRole('spinbutton', { name: 'Prueba externa Bachibac, nota numérica' })).toBeVisible()
      const bachibacScore = page.locator('[aria-label^="Tu nota estimada es"]')
      const beforeBachibac = await bachibacScore.getAttribute('aria-label')
      await page.getByRole('spinbutton', { name: 'Prueba externa Bachibac, nota numérica' }).fill('9.5')
      await expect(bachibacScore).not.toHaveAttribute('aria-label', beforeBachibac ?? '')

      await accessPaths.getByRole('radio', { name: /^IB/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'CAU acreditada por UNEDasiss, nota numérica' })).toBeVisible()
      await page.getByRole('spinbutton', { name: 'CAU acreditada por UNEDasiss, nota numérica' }).fill('8.65')
      await page.getByRole('radiogroup', { name: '¿Qué dato tienes ahora?' }).getByRole('radio', { name: /^Media de materias IB/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'Media de las materias del Diploma IB, nota numérica' })).toBeVisible()
      await expect(page.getByText(/no los puntos \/45/i)).toBeVisible()

      await accessPaths.getByRole('radio', { name: /^Bachillerato/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'Nota media Bachillerato, nota numérica' })).toHaveValue('9.25')
      await expect(page.getByRole('spinbutton', { name: 'Fase de acceso PAU, nota numérica' })).toHaveValue('8.75')

      await accessPaths.getByRole('radio', { name: /^IB/ }).click()
      await page.reload()
      const restoredPaths = page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' })
      await expect(restoredPaths.getByRole('radio', { name: /^IB/ })).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByRole('spinbutton', { name: 'Media de las materias del Diploma IB, nota numérica' })).toBeVisible()
      await restoredPaths.getByRole('radio', { name: /^Bachillerato/ }).click()
    })

    await test.step('buscador accesible y filtros útiles del catálogo', async () => {
      const search = page.getByRole('combobox', { name: 'Carrera y universidad' })
      await search.fill('economi uc3m')
      await expect(search).toHaveAttribute('aria-expanded', 'true')
      await expect(page.getByRole('listbox', { name: 'Resultados de grados' }).getByRole('option').first()).toContainText(/Econom/i)
      await search.press('Escape')
      await expect(search).toHaveAttribute('aria-expanded', 'false')

      await page.getByRole('button', { name: 'Explorar grados' }).click()
      await expect(page.getByRole('heading', { name: 'Encuentra grados que encajan contigo' })).toBeVisible()
      const degreeSearch = page.getByRole('textbox', { name: 'Buscar grado en universidades' })
      await degreeSearch.fill('qxzvnpj')
      await expect(page.getByText('No hay grados con esta combinación.')).toBeVisible()
      await page.getByRole('button', { name: 'Limpiar filtros' }).click()
      await expect(degreeSearch).toHaveValue('')
      await expect(page.getByText('554').first()).toBeVisible()

      await page.getByRole('button', { name: 'Cómo se corrige' }).click()
      await expect(page.getByRole('heading', { name: 'Cómo se corrige de verdad' })).toBeVisible()
      await expect(page.getByText(/no los denomina rúbrica formal/i)).toBeVisible()
      await expect(page.getByRole('link', { name: 'Ver fuente oficial' })).toBeVisible()
      await page.getByRole('button', { name: 'Mi objetivo' }).click()
    })

    await test.step('un cambio real de objetivo persiste el nuevo degree_id', async () => {
      await selectTarget(page, secondTarget)
      await saveTarget(page, secondTarget)
      await expectRestoredTarget(page, secondTarget)
      const responsePromise = page.waitForResponse(response => isOrientationRequest(response.request(), 'GET'))
      await page.reload()
      const response = await responsePromise
      const payload = await response.json() as OrientationPayload
      expect(payload.savedTarget?.degreeId).toBe(secondTarget.degreeId)
      expect(payload.savedTarget?.universityId).toBe(secondTarget.universityId)
    })

    await test.step('Cataluña carga su catálogo, reglas y objetivo sin mezclar Madrid', async () => {
      const catalunya = await switchCommunity(page, 'Cataluña')
      expect(catalunya.community).toBe('Cataluña')
      if (!catalunya.catalogAvailable) {
        test.info().annotations.push({
          type: 'deployment',
          description: 'El catálogo catalán aún no está cargado en la base remota; las aserciones se activan automáticamente al aplicar las migraciones.',
        })
        await switchCommunity(page, 'Madrid')
        await expectRestoredTarget(page, secondTarget)
        return
      }
      expect(catalunya.catalogAvailable).toBe(true)
      expect(catalunya.universities).toHaveLength(8)
      expect(catalunya.targets).toHaveLength(560)
      expect(new Set(catalunya.targets.map(item => item.degreeId)).size).toBe(560)
      expect(catalunya.targets.reduce((total, item) => total + item.subjects.length, 0)).toBe(4797)
      expect(catalunya.targets.every(item => item.community === 'Cataluña')).toBe(true)
      expect(catalunya.targets.every(item => Number.isFinite(item.referenceScore))).toBe(true)
      expect(catalunya.targets.every(item => item.source.type === 'official')).toBe(true)
      for (const degreeCode of ['CAT:41066', 'CAT:61057']) {
        const targetWithoutInferredWeights = catalunya.targets.find(item => item.degreeCode === degreeCode)
        expect(targetWithoutInferredWeights, `Falta el grado oficial ${degreeCode}`).toBeDefined()
        expect(targetWithoutInferredWeights?.subjects, `${degreeCode} no debe recibir ponderaciones inferidas`).toHaveLength(0)
      }
      await expect(page.getByText(/Datos oficiales de preinscripción 2026/)).toBeVisible()
      const targetSearch = page.getByRole('combobox', { name: 'Carrera y universidad' })
      const searchCases: Array<[string, RegExp]> = [
        ['barcelona', /Barcelona|UB|UAB|UPC|UPF/], ['uab', /UAB/], ['autonoma barcelona', /UAB/],
        ['AUTÒNOMA BARCELONA', /UAB/], ['tecnologia ciencia', /Ciència i Tecnologia/],
        ['upc', /UPC/], ['politecnica catalunya', /UPC/], ['catalunya politecnica', /UPC/],
        ['pompeu', /UPF/], ['girona', /UdG/], ['lleida', /UdL/], ['rovira', /URV/], ['vic', /UVic-UCC/],
      ]
      for (const [query, expected] of searchCases) {
        await targetSearch.fill(query)
        const options = page.getByRole('listbox', { name: 'Resultados de grados' }).getByRole('option')
        await expect(options.first(), `Sin resultados catalanes para ${query}`).toBeVisible()
        expect((await options.allTextContents()).join('\n')).toMatch(expected)
        expect((await options.allTextContents()).join('\n')).not.toMatch(/\b(?:UAH|UAM|UC3M|UCM|UPM|URJC)\b/)
      }
      await targetSearch.fill('')
      const catalanTarget = catalunya.targets.find(item => item.subjects.length >= 2) ?? catalunya.targets[0]
      await selectTarget(page, catalanTarget)
      await expect(page.getByText(/Nota de referencia · 1.ª asignación de junio/)).toBeVisible()
      await saveTarget(page, catalanTarget)
      await expect(page.getByTestId('camino-orientation-target')).toContainText(catalanTarget.degree)
      const restored = await expectRestoredTarget(page, catalanTarget)
      expect(restored.savedTarget?.community).toMatch(/Cataluña|Catalunya/)

      const catalanAccessPaths = page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' })
      await catalanAccessPaths.getByRole('radio', { name: /^Bachibac/ }).click()
      await expect(page.getByRole('radiogroup', { name: '¿Qué título usarás para acceder?' })).toBeVisible()
      await catalanAccessPaths.getByRole('radio', { name: /^IB/ }).click()
      await page.getByRole('radiogroup', { name: '¿Qué dato tienes ahora?' }).getByRole('radio', { name: /^CAU de UNEDasiss/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'CAU acreditada por UNEDasiss, nota numérica' })).toBeVisible()
      await catalanAccessPaths.getByRole('radio', { name: /^Internacional/ }).click()
      const internationalRoutes = page.getByRole('radiogroup', { name: '¿De qué sistema procedes?' })
      await internationalRoutes.getByRole('radio', { name: /^UE \/ convenio/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'CAU acreditada por UNEDasiss, nota numérica' })).toBeVisible()
      await internationalRoutes.getByRole('radio', { name: /^Sin convenio \+ PAU\/PCE/ }).click()
      await expect(page.getByRole('spinbutton', { name: 'Obligatoria 1, nota numérica' })).toBeVisible()
      await internationalRoutes.getByRole('radio', { name: /^Sin PCE\/modalidad/ }).click()
      await expect(page.getByText(/Kairo no inventará una equivalencia/)).toBeVisible()
      await catalanAccessPaths.getByRole('radio', { name: /^Bachillerato/ }).click()

      await page.getByRole('button', { name: 'Explorar grados' }).click()
      await expect(page.getByText('Filtra 560 referencias por universidad, nota y materias que ponderan 0,2.')).toBeVisible()
      let orientationRequests = 0
      const countOrientationRequests = (request: Request) => { if (isOrientationRequest(request)) orientationRequests += 1 }
      page.on('request', countOrientationRequests)
      await page.getByRole('combobox', { name: 'Universidad', exact: true }).selectOption(catalanTarget.universityId!)
      await expect(page.locator('article').filter({ hasText: catalanTarget.university }).first()).toBeVisible()
      await page.getByRole('combobox', { name: 'Nota de referencia', exact: true }).selectOption('10-12')
      await page.getByRole('combobox', { name: 'Con mi nota', exact: true }).selectOption('improve')
      await page.getByRole('combobox', { name: 'Pondera 0,2', exact: true }).selectOption({ index: 1 })
      await page.getByRole('button', { name: 'Limpiar', exact: true }).click()
      await expect(page.getByText('560').first()).toBeVisible()
      await page.getByRole('textbox', { name: 'Buscar grado en universidades' }).fill('qxzvnpj')
      await expect(page.getByText('No hay grados con esta combinación.')).toBeVisible()
      await page.getByRole('button', { name: 'Limpiar filtros' }).click()
      expect(orientationRequests).toBe(0)
      page.off('request', countOrientationRequests)

      await page.getByRole('button', { name: 'Mi objetivo' }).click()
      await page.getByRole('radio', { name: /^Internacional/ }).click()
      await page.getByRole('radiogroup', { name: '¿De qué sistema procedes?' }).getByRole('radio', { name: /^UE \/ convenio/ }).click()
      await expect(page.getByText(/no basta con que aparezcan reconocidas en UNEDasiss/i)).toBeVisible()
      await page.getByRole('button', { name: 'Cómo se corrige' }).click()
      await page.getByLabel('Asignatura').selectOption({ label: 'Química' })
      await expect(page.getByText('PAU Cataluña · junio 2026')).toBeVisible()
      await expect(page.getByText('OFICIAL', { exact: true }).first()).toBeVisible()
      await expect(page.getByText('KAIRO TE LO EXPLICA', { exact: true })).toBeVisible()
      await expect(page.getByText(/Comunidad de Madrid/)).toHaveCount(0)
      await expect(page.getByRole('link', { name: 'Ver fuente oficial' })).toHaveAttribute('href', /universitats\.gencat\.cat/)
      await page.getByRole('button', { name: 'Mi objetivo' }).click()

      await page.setViewportSize({ width: 390, height: 844 })
      await expect(page.getByRole('region', { name: 'Comunidad del catálogo' })).toBeVisible()
      const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      expect(mobileOverflow).toBeLessThanOrEqual(1)
      await page.setViewportSize({ width: 1440, height: 900 })

      await switchCommunity(page, 'Madrid')
      await expect(page.getByText(/Tu objetivo guardado está en Cataluña\. Puedes explorar Madrid sin sustituirlo\./)).toBeVisible()
      await page.getByRole('link', { name: 'Camino PAU' }).click()
      await expect(page.getByTestId('camino-orientation-target')).toContainText(catalanTarget.degree)
      await openOrientation(page)
      await switchCommunity(page, 'Madrid')
      await selectTarget(page, secondTarget)
      await saveTarget(page, secondTarget)
      const madridRestored = await expectRestoredTarget(page, secondTarget)
      expect(madridRestored.savedTarget?.community).toBe('Madrid')
    })

    await test.step('un fallo de red muestra error y libera el estado guardando', async () => {
      expectedSaveFailure = true
      await page.route('**/api/orientation', async route => {
        if (route.request().method() === 'POST') {
          expectedFailedResourceMessages += 1
          return route.abort('failed')
        }
        return route.continue()
      })
      const button = page.getByRole('button', { name: saveButtonName })
      await button.click()
      await expect(page.getByText('No se pudo guardar. Revisa tu sesión y vuelve a intentarlo.')).toBeVisible()
      await expect(button).toBeEnabled()
      await expect(page).toHaveURL(/\/orientacion(?:\?|$)/)
      await page.unroute('**/api/orientation')
      expectedSaveFailure = false
    })

    await test.step('el selector y el simulador no desbordan en móvil', async () => {
      await page.setViewportSize({ width: 390, height: 844 })
      await expect(page.getByRole('radiogroup', { name: 'Vía de acceso a la universidad' })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true)
    })
  } finally {
    if (originalSavedTarget?.degreeId && originalSavedTarget.universityId && page.url() !== 'about:blank') {
      try {
        if (!/\/orientacion(?:\?|$)/.test(page.url())) await openOrientation(page)
        const originalCommunity = /catalu/i.test(originalSavedTarget.community ?? '') ? 'Cataluña' : 'Madrid'
        const payload = await switchCommunity(page, originalCommunity)
        originalTarget = payload.targets.find(item => item.degreeId === originalSavedTarget?.degreeId && item.universityId === originalSavedTarget?.universityId)
        if (originalTarget) {
          await selectTarget(page, originalTarget)
          await saveTarget(page, originalTarget)
        }
      } catch {
        // The main assertions report the failure; cleanup remains best-effort.
      }
    }
  }

  expect(consoleErrors, `console.error inesperados:\n${consoleErrors.join('\n')}`).toEqual([])
  expect(runtimeErrors, `errores runtime:\n${runtimeErrors.join('\n')}`).toEqual([])
  expect(failedRequests, `requests fallidas inesperadas:\n${failedRequests.join('\n')}`).toEqual([])
})
