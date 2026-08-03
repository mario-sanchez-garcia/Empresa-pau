import type { SupabaseClient } from '@supabase/supabase-js'

// Placeholder para alumnos sin username — sin él no podemos mostrar nada
// (mostrar el email o su prefijo fue revertido por seguridad, ver
// e134403 "stop exposing email prefixes in rankings").
const FALLBACK_NAME = 'Alumno Kairo'

export function safeUsername(value: unknown): string {
  const s = (typeof value === 'string' ? value : '').trim().slice(0, 40)
  return s.includes('@') ? '' : s
}

// Fuente única de "qué nombre mostrar para cada user_id" en cualquier
// ranking (Mi liga, Global, ...) — antes /api/ligas y /api/ligas/global
// reimplementaban cada uno su propio fallback por separado y podían
// divergir; ahora ambos llaman aquí.
export async function resolveDisplayNames(
  db: SupabaseClient,
  userIds: string[],
  currentUserId: string,
): Promise<Map<string, string>> {
  const idsToFetch = userIds.filter(id => id !== currentUserId)
  const nameById = new Map<string, string>()
  if (idsToFetch.length > 0) {
    const { data } = await db.from('perfiles').select('id, username').in('id', idsToFetch)
    for (const p of data ?? []) {
      const name = safeUsername(p.username)
      if (name) nameById.set(p.id as string, name)
    }
  }
  const result = new Map<string, string>()
  for (const id of userIds) {
    result.set(id, id === currentUserId ? 'Tú' : (nameById.get(id) || FALLBACK_NAME))
  }
  return result
}
