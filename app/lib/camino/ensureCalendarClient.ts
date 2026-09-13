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

/** A successful HTTP response alone does not mean the planning run succeeded. */
export async function ensureServerCalendar(token: string, force = false): Promise<boolean> {
  let failure: PlanFailure = { kind: 'network', steps: [], status: null }
  for (let attempt = 0; attempt < 3; attempt++) {
    let retryable = true
    try {
      const response = await fetch('/api/camino/ensure-calendar', {
        method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      })
      const body = await response.json().catch(() => null)
      if (response.ok && body?.ok === true) {
        // También en la respuesta corta (`skipped: already_ensured_today`): el
        // servidor devuelve el estado vigente aunque hoy no haya generado nada.
        window.dispatchEvent(new Event('camino:updated'))
        return true
      }
      const steps: string[] = Array.isArray(body?.degraded) ? body.degraded.map(String) : []
      failure = {
        kind: response.status === 409 ? 'busy' : steps.length > 0 ? 'degraded' : 'server',
        steps,
        status: response.status,
      }
      retryable = body?.retryable === true || response.status >= 500 || response.status === 409
    } catch {
      // Connection errors are retryable; never an implicit success.
      failure = { kind: 'network', steps: [], status: null }
    }
    if (!retryable || attempt === 2) break
    await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
  }
  window.dispatchEvent(new CustomEvent('camino:plan-error', { detail: failure }))
  return false
}
