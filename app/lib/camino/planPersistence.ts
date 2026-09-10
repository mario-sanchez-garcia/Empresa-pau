import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export class PlanBusyError extends Error {
  constructor() { super('Tu Camino ya se está actualizando. Vuelve a intentarlo en unos segundos.') }
}

/** Database lease shared by every server instance. Always released by its owner. */
export async function withPlanLock<T>(db: SupabaseClient, userId: string, run: () => Promise<T>): Promise<T> {
  const owner = crypto.randomUUID()
  const claim = await db.rpc('camino_claim_plan', { p_user_id: userId, p_owner: owner })
  if (claim.error) throw new Error(`Plan lock unavailable: ${claim.error.message}`)
  if (claim.data !== true) throw new PlanBusyError()
  try {
    return await run()
  } finally {
    const release = await db.rpc('camino_release_plan', { p_user_id: userId, p_owner: owner })
    if (release.error) console.error('[camino] release lock failed:', release.error.message)
  }
}

export async function reconcilePlanWork(db: SupabaseClient, userId: string) {
  const { error } = await db.rpc('camino_reconcile_work', { p_user_id: userId })
  if (error) throw new Error(`Plan recovery failed: ${error.message}`)
}
