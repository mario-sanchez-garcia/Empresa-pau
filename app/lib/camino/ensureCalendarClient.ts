/** Por qué NO se pudo terminar de actualizar el Camino.
 *
 * El endpoint ya devuelve `degraded` con el paso exacto que falló, pero antes
 * el cliente lo tiraba y el alumno solo veía "no hemos podido actualizar todo
 * tu Camino": ni qué falló, ni si era cosa suya, ni si valía la pena
 * reintentar. Un aviso que no dice nada obliga a adivinar exactamente igual
 * que decir "se salen 11,3 h" sin decir cuáles.
 *
 * `steps` viaja tal cual (calendar_upsert, personalization, partials...): en
 * beta privada es lo que convierte "me sale un error" en un informe que se
 * puede seguir sin reproducir el caso.
 */
export type PlanFailure = {
  /** 'status' no viene de aquí: es el aviso al no poder leer /plan-status. */
  kind: 'degraded' | 'busy' | 'server' | 'network' | 'status'
  /** Pasos del planificador que fallaron, tal como los nombra el servidor. */
  steps: string[]
  status: number | null
}

export type PlanErrorEvent = CustomEvent<PlanFailure>

// Una llamada compartida por sesión. El montaje, el reintento tras calendario
// vacío y los botones pueden coincidir; no deben competir por el mismo lease.
const running = new Map<string, { force: boolean; throughDate?: string; promise: Promise<boolean> }>()

export function ensureServerCalendar(token: string, force = false, throughDate?: string): Promise<boolean> {
  const previous = running.get(token)
  if (previous && (!force || previous.force) && (!throughDate || (previous.throughDate ?? '') >= throughDate)) return previous.promise
  // Un cambio de preferencias exige force; si estaba en curso una carga normal,
  // ejecutar el cambio después. Otros llamantes compartirán esa misma espera.
  const entry = { force, throughDate, promise: null as unknown as Promise<boolean> }
  entry.promise = (previous ? previous.promise.then(() => runEnsure(token, force, throughDate)) : runEnsure(token, force, throughDate))
    .finally(() => { if (running.get(token) === entry) running.delete(token) })
  running.set(token, entry)
  return entry.promise
}

/** A successful HTTP response alone does not mean the planning run succeeded. */
async function runEnsure(token: string, force: boolean, throughDate?: string): Promise<boolean> {
  let failure: PlanFailure = { kind: 'network', steps: [], status: null }
  let busyAttempts = 0
  let failedAttempts = 0
  window.dispatchEvent(new Event('camino:plan-updating'))
  try {
    while (busyAttempts < 8 && failedAttempts < 3) {
      let retryable = true
      let waitMs = 1000 * 2 ** failedAttempts
      try {
        const response = await fetch('/api/camino/ensure-calendar', {
          method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ force, ...(throughDate ? { throughDate } : {}) }), signal: AbortSignal.timeout(320_000),
        })
        const body = await response.json().catch(() => null)
        if (response.ok && body?.ok === true) {
          window.dispatchEvent(new Event('camino:updated'))
          return true
        }
        const steps: string[] = Array.isArray(body?.degraded) ? body.degraded.map(String) : []
        failure = { kind: response.status === 409 ? 'busy' : steps.length > 0 ? 'degraded' : 'server', steps, status: response.status }
        if (response.status === 409) {
          busyAttempts++
          const retryAfter = Number(response.headers?.get('Retry-After'))
          waitMs = Math.min(10_000, Math.max(2000 * 2 ** (busyAttempts - 1), Number.isFinite(retryAfter) ? retryAfter * 1000 : 0))
        } else { failedAttempts++ }
        retryable = body?.retryable === true || response.status >= 500 || response.status === 409
      } catch {
        failure = { kind: 'network', steps: [], status: null }
        failedAttempts++
      }
      if (!retryable || busyAttempts >= 8 || failedAttempts >= 3) break
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
    window.dispatchEvent(new CustomEvent('camino:plan-error', { detail: failure }))
    return false
  } finally { window.dispatchEvent(new Event('camino:plan-idle')) }
}
