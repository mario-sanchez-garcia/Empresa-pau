// El puente entre el clic en Camino y la página de la misión.
//
// El inicio de la medición es el clic deliberado en "Ir a practicar", no la
// carga de la página. Esa distinción no es cosmética: captura al alumno que
// abre una misión, lee la explicación entera y se va sin tocar nada. Con el
// primer engagement semántico como inicio, ese alumno producía cero tramos.
//
// El problema es que el clic ocurre en un componente y la medición en otro, con
// una navegación de por medio. La opción evidente —meter segment_id y t0 en la
// URL— funciona, pero convierte la barra de direcciones en canal de telemetría
// y arrastra esos parámetros al historial, a los logs del servidor y al
// referrer de cualquier recurso externo. Como origen y destino comparten
// origen, `sessionStorage` hace el mismo trabajo sin ensuciar nada.
//
// Tres reglas que impiden que este puente inicie una misión que no es:
//
//  1. La clave incluye el `missionId`. Leer la de otra misión es imposible por
//     construcción, no por comprobación.
//  2. TTL corto. Un pendiente que nadie consumió (el alumno hizo clic y dio
//     atrás) caduca en vez de quedarse esperando a la próxima visita y
//     fechar un tramo con un clic de hace media hora.
//  3. Se consume UNA vez. El refresco de la página de destino ya no lo
//     encuentra, así que no puede reabrir el mismo tramo dos veces.

export type PendingMissionStart = {
  missionId: string
  segmentId: string
  /** Instante del clic, en ms. Se envía como `occurred_at` del tramo. */
  t0: number
}

/** Mismo contrato que `sessionStorage`, para poder probarlo sin navegador. */
export type StorageLike = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

const KEY_PREFIX = 'kairo:pending-mission-start:'

/**
 * Cinco minutos. Suficiente para una navegación lenta y una página pesada, muy
 * poco para que un clic olvidado fabrique un inicio falso más tarde.
 */
export const PENDING_START_TTL_MS = 5 * 60 * 1000

function keyFor(missionId: string) {
  return `${KEY_PREFIX}${missionId}`
}

/**
 * `sessionStorage` lanza en modo privado y con cookies bloqueadas. Ninguna
 * medición justifica romper la navegación del alumno: si falla, no hay puente
 * y el destino cae al fallback de primer engagement.
 */
export function safeSessionStorage(): StorageLike | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null
    return window.sessionStorage
  } catch {
    return null
  }
}

export function writePendingStart(
  storage: StorageLike | null,
  pending: PendingMissionStart,
): boolean {
  if (!storage || !pending.missionId || !pending.segmentId) return false
  try {
    storage.setItem(keyFor(pending.missionId), JSON.stringify(pending))
    return true
  } catch {
    return false
  }
}

/**
 * Lee y BORRA el pendiente de esta misión. Devuelve null si no existe, si
 * caducó, si está corrupto o si pertenece a otra misión — en todos esos casos
 * el destino debe caer al fallback, nunca adivinar.
 */
export function consumePendingStart(
  storage: StorageLike | null,
  missionId: string,
  nowMs: number,
  ttlMs: number = PENDING_START_TTL_MS,
): PendingMissionStart | null {
  if (!storage || !missionId) return null
  const key = keyFor(missionId)
  let raw: string | null = null
  try {
    raw = storage.getItem(key)
  } catch {
    return null
  }
  if (!raw) return null

  // Se borra pase lo que pase: un pendiente ilegible tampoco debe sobrevivir a
  // la lectura y reaparecer en la siguiente visita.
  try { storage.removeItem(key) } catch { /* da igual */ }

  let parsed: unknown
  try { parsed = JSON.parse(raw) } catch { return null }
  if (!parsed || typeof parsed !== 'object') return null

  const candidate = parsed as Partial<PendingMissionStart>
  if (typeof candidate.missionId !== 'string' || candidate.missionId !== missionId) return null
  if (typeof candidate.segmentId !== 'string' || !candidate.segmentId) return null
  if (typeof candidate.t0 !== 'number' || !Number.isFinite(candidate.t0)) return null
  if (candidate.t0 > nowMs) return null
  if (nowMs - candidate.t0 > ttlMs) return null

  return { missionId: candidate.missionId, segmentId: candidate.segmentId, t0: candidate.t0 }
}

/** Identificador de pestaña. Distingue dos pestañas del mismo alumno. */
export function readOrCreateOrigin(storage: StorageLike | null, mint: () => string): string {
  const key = 'kairo:activity-origin'
  if (!storage) return mint()
  try {
    const existing = storage.getItem(key)
    if (existing) return existing
    const next = mint()
    storage.setItem(key, next)
    return next
  } catch {
    return mint()
  }
}
