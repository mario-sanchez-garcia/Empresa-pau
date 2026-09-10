import { expect, test } from './authenticated-test'

test('completed user cannot fall back into onboarding', async ({ page }) => {
  await page.goto('/onboarding')
  await expect(page).toHaveURL(/\/camino(?:[/?#]|$)/)
  await expect(page.getByText(/¿Cuánto tiempo podrías estudiar al día\?/)).toHaveCount(0)
})

test('authenticated onboarding state is available from the protected API', async ({ page }) => {
  await page.goto('/camino')
  const result = await page.evaluate(async () => {
    const supabaseKey = Object.keys(localStorage).find(key => key.startsWith('sb-') && key.endsWith('-auth-token'))
    const stored = supabaseKey ? JSON.parse(localStorage.getItem(supabaseKey) ?? 'null') : null
    const token = stored?.access_token
    if (!token) return { status: 0, complete: false }
    const response = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } })
    const json = await response.json().catch(() => null)
    return { status: response.status, complete: Boolean(json?.onboarding?.completedAt) }
  })
  expect(result).toEqual({ status: 200, complete: true })
})

test('server failure never trusts a local completed marker from another account', async ({ page }) => {
  await page.route('**/api/onboarding/me', route => route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"offline"}' }))
  await page.addInitScript(() => {
    localStorage.setItem('kairo_onboarding_v1', JSON.stringify({
      completedAt: '2026-01-01T00:00:00Z',
      lastStep: 'daily-time',
      community: 'Madrid',
      subjects: ['Inglés'],
    }))
  })
  await page.goto('/onboarding')
  await expect(page).toHaveURL(/\/onboarding(?:[/?#]|$)/)
  await expect(page.getByText('¿Cuánto tiempo podrías estudiar al día?')).toBeVisible()
})
