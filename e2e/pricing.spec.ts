import { expect, test, type Page } from '@playwright/test'

function monitorRuntime(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    const text = message.text()
    const isChromiumReportOnlyNotice = text.includes("upgrade-insecure-requests")
      && text.includes('report-only policy')
    if (message.type() === 'error' && !isChromiumReportOnlyNotice) errors.push(text)
  })
  return errors
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('kairo_cookie_consent', 'rejected')
  })
})

test('pricing is coherent and usable on desktop', async ({ page }) => {
  const errors = monitorRuntime(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/precios')

  await expect(page).toHaveTitle(/Precios · Kairo/)
  await expect(page.getByTestId('pricing-card-free')).toContainText('0 €')
  await expect(page.getByTestId('pricing-card-premium')).toContainText('9,99 €')
  await expect(page.getByTestId('pricing-card-premium')).toContainText('Recomendado')
  await expect(page.getByTestId('pricing-card-curso_pau')).toContainText('79 €')
  await expect(page.getByTestId('pricing-card-curso_pau')).toContainText('pago único')
  await expect(page.getByText('Intensivo', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Superpremium', { exact: true })).toHaveCount(0)

  const premiumCta = page.getByTestId('pricing-cta-premium')
  await expect(premiumCta).toHaveAttribute('href', '/checkout?plan=premium')
  await premiumCta.focus()
  await expect(premiumCta).toBeFocused()
  await premiumCta.hover()
  await expect(page.getByTestId('pricing-cta-curso_pau')).toHaveAttribute('href', '/checkout?plan=pack_curso_pau')

  const compare = page.getByRole('button', { name: 'Comparar límites y funciones' })
  await compare.focus()
  await expect(compare).toBeFocused()
  await compare.press('Enter')
  await expect(compare).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('table')).toContainText('12')
  await expect(page.getByRole('table')).toContainText('Orientación de Madrid y Cataluña')
  await expect(page.getByRole('table')).toContainText('Ranking completo')
  await expect(page.locator('body')).not.toContainText(/ilimitad|unlimited/i)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/pricing-desktop.png', fullPage: true })
  expect(errors).toEqual([])
})

test('landing, pricing and safe checkout fit a 390px viewport', async ({ page }) => {
  const errors = monitorRuntime(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/precios')
  await expect(page.getByTestId('pricing-card-premium')).toBeVisible()
  await expect(page.getByTestId('pricing-card-free')).toBeVisible()
  await expect(page.getByTestId('pricing-card-curso_pau')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/pricing-mobile-390.png', fullPage: true })

  await page.goto('/')
  const landingPricing = page.locator('[data-testid="landing-pricing"]:visible').last()
  await landingPricing.scrollIntoViewIfNeeded()
  await expect(landingPricing.getByTestId('landing-pricing-card-premium')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)

  await page.goto('/checkout?plan=intensivo')
  await expect(page.getByText('Este plan no está disponible para compra.')).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/pricing-checkout-mobile-390.png', fullPage: true })
  expect(errors).toEqual([])
})

test('landing uses the same three public plans', async ({ page }) => {
  const errors = monitorRuntime(page)
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const pricing = page.getByTestId('landing-pricing')
  await expect(pricing.getByTestId('landing-pricing-card-free')).toContainText('0 €')
  await expect(pricing.getByTestId('landing-pricing-card-premium')).toContainText('9,99 €')
  await expect(pricing.getByTestId('landing-pricing-card-curso_pau')).toContainText('79 €')
  await expect(pricing.getByRole('link', { name: 'Comparar planes y condiciones →' })).toHaveAttribute('href', '/precios')
  await expect(pricing).not.toContainText(/ilimitad|unlimited|superpremium|intensivo/i)
  await pricing.scrollIntoViewIfNeeded()
  await expect(pricing).toBeVisible()
  await page.waitForTimeout(400)
  await pricing.screenshot({ path: 'test-results/pricing-landing.png' })
  expect(errors).toEqual([])
})

test('legacy pricing URL redirects and unavailable plans cannot enter checkout', async ({ page }) => {
  await page.goto('/pricing')
  await expect(page).toHaveURL(/\/precios$/)

  for (const plan of ['intensivo', 'superpremium']) {
    await page.goto(`/checkout?plan=${plan}`)
    await expect(page.getByRole('heading', { name: 'Algo ha salido mal.' })).toBeVisible()
    await expect(page.getByText('Este plan no está disponible para compra.')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ver planes →' })).toHaveAttribute('href', '/precios')
  }

  await page.goto('/checkout?plan=premium')
  await expect(page).toHaveURL(/\/login\?returnTo=.*premium/)
  await page.goto('/checkout?plan=pack_curso_pau')
  await expect(page).toHaveURL(/\/login\?returnTo=.*pack_curso_pau/)
})
