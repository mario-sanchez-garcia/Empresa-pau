/** A successful HTTP response alone does not mean the planning run succeeded. */
export async function ensureServerCalendar(token: string, force = false): Promise<boolean> {
  for (let attempt = 0; attempt < 3; attempt++) {
    let retryable = true
    try {
      const response = await fetch('/api/camino/ensure-calendar', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const body = await response.json().catch(() => null)
      if (response.ok && body?.ok === true) {
        window.dispatchEvent(new Event('camino:updated'))
        return true
      }
      retryable = body?.retryable === true || response.status >= 500 || response.status === 409
    } catch { /* Connection errors are retryable; never an implicit success. */ }
    if (!retryable || attempt === 2) break
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
  }
  window.dispatchEvent(new Event('camino:plan-error'))
  return false
}
