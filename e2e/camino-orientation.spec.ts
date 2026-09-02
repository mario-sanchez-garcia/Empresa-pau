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
  impactSubjects: [{ subjectCode: 'matematicas-ii', name: 'Matemáticas II', weighting: 0.2, defaultGrade: 6.5 }],
  updatedAt: '2026-09-02T12:00:00.000Z',
}

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

test('muestra el objetivo persistido y el escenario local coincidente', async ({ page }) => {
  await page.addInitScript(context => localStorage.setItem('kairo.orientation.camino-context.v1', JSON.stringify(context)), localContext)
  await interceptProfile(page, target)
  await page.goto('/camino')

  await expect(page.getByText('Tu objetivo', { exact: true })).toBeVisible()
  await expect(page.getByText('Economía · UC3M', { exact: true })).toBeVisible()
  await expect(page.getByText('Referencia: 11,70', { exact: true })).toBeVisible()
  await expect(page.getByText('Tu escenario: 11,20', { exact: true })).toBeVisible()
  await expect(page.getByText('Te separan: 0,50', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver orientación' })).toHaveAttribute('href', '/orientacion')
})

test('sin objetivo no añade el bloque y Camino sigue siendo responsive', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => localStorage.removeItem('kairo.orientation.camino-context.v1'))
  await interceptProfile(page, null)
  await page.goto('/camino')

  await expect(page.getByText('Tu objetivo', { exact: true })).toHaveCount(0)
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
})
