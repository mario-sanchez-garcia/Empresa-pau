import { expect, test, type Page, type Route } from '@playwright/test'

const target = {
  target_degree: 'Economía',
  target_university: 'Universidad Carlos III de Madrid',
  target_admission_score: 11.7,
  target_orientation_source_type: 'official',
}

const localContext = {
  version: 1,
  accessPath: 'spanish_bachillerato',
  route: 'spanish_pau',
  calculationComplete: true,
  target: { degreeId: 'degree-e2e', universityId: 'university-e2e', degree: target.target_degree, university: target.target_university, universityAcronym: 'UC3M', referenceScore: target.target_admission_score },
  estimatedScore: 11.2,
  gap: -0.5,
  impactSubjects: [
    { subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 6.5 },
    { subjectCode: 'historia-espana', name: 'Historia de España', weighting: 0.2, defaultGrade: 6.5 },
  ],
  updatedAt: '2026-09-02T12:00:00.000Z',
}

const todayISO = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(new Date())
const examDateISO = (() => {
  const date = new Date(`${todayISO}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + 4)
  return date.toISOString().slice(0, 10)
})()

async function interceptProfile(page: Page, orientationTarget: typeof target | null) {
  await page.route('**/api/profile', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        student_exams: [],
        target_degree: orientationTarget?.target_degree ?? null,
        target_university: orientationTarget?.target_university ?? null,
        target_admission_score: orientationTarget?.target_admission_score ?? null,
        target_orientation_source_type: orientationTarget?.target_orientation_source_type ?? null,
      },
    })
  })
}

async function interceptPriorityMission(page: Page) {
  await page.route('**/rest/v1/camino_calendar*', async route => {
    const url = new URL(route.request().url())
    const select = url.searchParams.get('select') ?? ''
    if (!select.includes('scheduled_date') || !select.includes('metadata')) {
      await route.fallback()
      return
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Content-Range': '0-0/1' },
      json: [{
        id: 'camino-priority-e2e',
        scheduled_date: todayISO,
        subject: 'historia_espana',
        title: 'La Guerra Civil: causas, etapas y consecuencias',
        block_key: 'La Guerra Civil',
        block_slug: 'la-guerra-civil',
        is_main: true,
        is_bonus: false,
        status: 'pending',
        v2_sort_order: 1,
        mission_type: 'guided_practice',
        xp_awarded: 30,
        start_time: null,
        end_time: null,
        metadata: { partial_exam_date: examDateISO, estimated_minutes: 30 },
      }],
    })
  })
}

test('muestra el objetivo persistido y el escenario local coincidente', async ({ page }) => {
  await page.addInitScript(context => localStorage.setItem('kairo.orientation.camino-context.v1', JSON.stringify(context)), localContext)
  await interceptProfile(page, target)
  await interceptPriorityMission(page)
  await page.goto('/camino')

  const targetCard = page.getByTestId('camino-orientation-target')
  await expect(targetCard.getByText('Objetivo', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('Economía · UC3M', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('Referencia', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('11,7', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('Tu escenario', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('11,2', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('Gap', { exact: true })).toBeVisible()
  await expect(targetCard.getByText('0,5', { exact: true })).toBeVisible()
  await expect(targetCard.getByRole('link', { name: 'Ver orientación' })).toHaveAttribute('href', '/orientacion')
  const reasons = page.getByTestId('camino-priority-reasons').locator('.camino-reason-chip')
  await expect(reasons).toHaveCount(2)
  await expect(reasons.nth(0)).toHaveText('Examen en 4 días')
  await expect(reasons.nth(1)).toHaveText('Pondera 0,2 para tu objetivo')
  await page.getByTestId('camino-why-now').getByText('¿Por qué ahora?').click()
  await expect(page.getByTestId('camino-why-now')).toContainText('Te recomiendo empezar por esto porque')
  await expect(page.getByTestId('camino-why-now')).toContainText('Economía en UC3M')
})

test('sin objetivo no añade el bloque y Camino sigue siendo responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.removeItem('kairo.orientation.camino-context.v1'))
  await interceptProfile(page, null)
  await page.goto('/camino')

  await expect(page.getByTestId('camino-orientation-target')).toHaveCount(0)
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})

test('a 390 px el objetivo y la misión principal conservan ancho útil sin overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(context => localStorage.setItem('kairo.orientation.camino-context.v1', JSON.stringify(context)), localContext)
  await interceptProfile(page, target)
  await interceptPriorityMission(page)
  await page.goto('/camino')

  await expect(page.getByTestId('camino-orientation-target')).toBeVisible()
  const mission = page.getByTestId('camino-main-mission')
  const body = page.getByTestId('camino-main-body')
  const action = page.getByTestId('camino-main-action')
  await expect(mission).toBeVisible()
  const [bodyBox, actionBox] = await Promise.all([body.boundingBox(), action.boundingBox()])
  expect(bodyBox).not.toBeNull()
  expect(actionBox).not.toBeNull()
  expect(bodyBox!.width).toBeGreaterThan(200)
  expect(actionBox!.y).toBeGreaterThanOrEqual(bodyBox!.y + bodyBox!.height - 1)
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})
