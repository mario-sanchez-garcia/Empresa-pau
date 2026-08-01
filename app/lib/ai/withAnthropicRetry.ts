/**
 * Reintento ante saturación de la API de Anthropic.
 *
 * Los límites de Anthropic son POR ORGANIZACIÓN, no por usuario: todos los
 * alumnos de Kairo comparten el mismo cupo de tokens por minuto. Que cada uno
 * tenga su tope diario no evita que doscientos coincidan en el mismo minuto.
 *
 * Cuando eso pasa la API devuelve 429 (rate limit) o 529 (sobrecarga). Son
 * fallos TRANSITORIOS: el mismo intento un segundo después suele funcionar.
 * Antes se relanzaban igual que un error real y el alumno veía "no se pudo
 * corregir" con la foto ya hecha.
 *
 * No se reintenta nada más. Un 400 por imagen inválida o un 401 por clave mal
 * configurada no mejoran esperando, y reintentarlos solo gasta cupo.
 */

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 529])
const MAX_ATTEMPTS = 3
const BASE_DELAY_MS = 800

export class AnthropicOverloadedError extends Error {
  readonly status: number
  constructor(status: number) {
    super(`Anthropic no disponible tras ${MAX_ATTEMPTS} intentos (status ${status})`)
    this.name = 'AnthropicOverloadedError'
    this.status = status
  }
}

function statusOf(error: unknown): number | null {
  if (error && typeof error === 'object') {
    const s = (error as { status?: unknown }).status
    if (typeof s === 'number') return s
  }
  return null
}

/** Respeta Retry-After si la API lo manda; si no, espera exponencial con jitter. */
function delayFor(error: unknown, attempt: number): number {
  if (error && typeof error === 'object') {
    const headers = (error as { headers?: Record<string, string> }).headers
    const retryAfter = headers?.['retry-after'] ?? headers?.['Retry-After']
    const seconds = retryAfter ? Number(retryAfter) : NaN
    // Más de 30 s no tiene sentido: el alumno está esperando delante.
    if (Number.isFinite(seconds) && seconds > 0 && seconds <= 30) return seconds * 1000
  }
  const exponential = BASE_DELAY_MS * Math.pow(2, attempt)
  return exponential + Math.random() * 300
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function withAnthropicRetry<T>(
  call: () => Promise<T>,
  onRetry?: (attempt: number, status: number) => void,
): Promise<T> {
  let lastStatus = 0

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      return await call()
    } catch (error) {
      const status = statusOf(error)
      if (status === null || !RETRYABLE_STATUS.has(status)) throw error

      lastStatus = status
      const esUltimo = attempt === MAX_ATTEMPTS - 1
      if (esUltimo) break

      onRetry?.(attempt + 1, status)
      await sleep(delayFor(error, attempt))
    }
  }

  // Error propio para que la ruta pueda responder 503 con un mensaje que
  // explique la espera, en vez del error genérico de "no se pudo corregir".
  throw new AnthropicOverloadedError(lastStatus)
}

export function isOverloadedError(error: unknown): error is AnthropicOverloadedError {
  return error instanceof AnthropicOverloadedError
}
