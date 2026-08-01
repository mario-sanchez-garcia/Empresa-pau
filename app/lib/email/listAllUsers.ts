import type { SupabaseClient } from '@supabase/supabase-js'

export interface ListedUser {
  id: string
  email: string
  createdAt: string
  fullName: string | null
}

/**
 * Pagina auth.admin.listUsers() hasta agotar resultados. listUsers() nunca
 * devuelve más de perPage (1000) usuarios por llamada — por encima de esa
 * cifra los crons que hacían una sola llamada dejaban de ver (y de emailear)
 * a cualquier cuenta creada después de las primeras 1000, sin ningún error.
 */
export async function listAllUsers(db: SupabaseClient): Promise<Map<string, ListedUser>> {
  const users = new Map<string, ListedUser>()
  const perPage = 1000
  let page = 1

  while (true) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage })
    if (error) throw new Error(`listAllUsers: listUsers failed on page ${page}: ${error.message}`)

    for (const u of data.users) {
      if (!u.email) continue
      users.set(u.id, {
        id: u.id,
        email: u.email,
        createdAt: u.created_at,
        fullName: (u.user_metadata?.full_name as string | undefined) ?? null,
      })
    }

    if (data.users.length < perPage) break
    page++
  }

  return users
}
