/**
 * Caché en memoria del proceso, con TTL corto.
 *
 * Pensada para la parte COMPARTIDA de los rankings: el top de XP y los nombres
 * asociados son idénticos para todos los usuarios, y se recalculaban en cada
 * petición. Lo personalizado (tu puesto, tu vecindario) nunca pasa por aquí.
 *
 * Limitación consciente: en serverless cada instancia tiene su propia memoria,
 * así que esto no es una caché compartida ni intenta serlo. El beneficio
 * aparece justo cuando hace falta — bajo carga las instancias se reutilizan y
 * varias peticiones seguidas caen en la misma. Con poco tráfico apenas hace
 * nada, y tampoco importa.
 *
 * Si algún día se necesita caché real entre instancias, el reemplazo natural
 * es Redis; la interfaz de `cached()` no tendría que cambiar.
 */

type Entry<T> = { value: T; expiresAt: number }

const store = new Map<string, Entry<unknown>>()

// Cota de seguridad: sin esto, claves dinámicas podrían hacer crecer el Map
// indefinidamente dentro de una instancia de larga vida.
const MAX_KEYS = 200

function prune() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key)
  }
  if (store.size > MAX_KEYS) {
    // Elimina las más antiguas por orden de inserción (Map lo conserva).
    const sobran = store.size - MAX_KEYS
    let i = 0
    for (const key of store.keys()) {
      if (i++ >= sobran) break
      store.delete(key)
    }
  }
}

/**
 * Devuelve el valor cacheado si sigue vigente; si no, ejecuta `producer`,
 * guarda el resultado y lo devuelve. Un fallo de `producer` no se cachea.
 */
export async function cached<T>(key: string, ttlSeconds: number, producer: () => Promise<T>): Promise<T> {
  const hit = store.get(key)
  if (hit && hit.expiresAt > Date.now()) return hit.value as T

  const value = await producer()
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 })
  prune()
  return value
}

/** Para tests o invalidación manual. */
export function clearMemoCache() {
  store.clear()
}
