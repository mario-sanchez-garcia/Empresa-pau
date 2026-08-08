import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

// Un draft solo puede pertenecer a un usuario. Nunca confiar en claimed_by
// enviado por el cliente — este helper es la única vía server-side para
// asignar un draft a un user_id, y usa un UPDATE condicional (WHERE
// claimed_by IS NULL) para que dos requests concurrentes reclamando el
// mismo draft no puedan "ganar" las dos: Postgres solo deja que una fila
// coincida con esa condición a la vez.

export interface OnboardingDraftRow {
  id: string
  trace_id: string
  flow_version: string
  payload: Record<string, unknown>
  status: 'pending_auth' | 'claimed' | 'processing' | 'completed' | 'failed' | 'expired'
  processing_stage: string | null
  expires_at: string
  claimed_by: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  last_error_code: string | null
}

export type ClaimOnboardingDraftResult =
  // justClaimed distingue una asignación NUEVA de una relectura idempotente
  // (mismo usuario, ya estaba claimed) — para que los llamadores solo
  // registren el evento de analytics onboarding_draft_claimed una vez de
  // verdad, no en cada llamada idempotente (encontrado en el E2E: bajo dos
  // invocaciones concurrentes — StrictMode en dev, dos pestañas en real —
  // ambas pasan por aquí y sin este flag ambas emitían el evento).
  | { ok: true; draft: OnboardingDraftRow; justClaimed: boolean }
  | { ok: false; errorCode: 'invalid_draft' | 'draft_expired' | 'draft_claim_conflict' }

export async function claimOnboardingDraft(
  db: SupabaseClient,
  draftId: string,
  userId: string,
): Promise<ClaimOnboardingDraftResult> {
  const { data: existing, error: readError } = await db
    .from('onboarding_drafts')
    .select('*')
    .eq('id', draftId)
    .maybeSingle()

  if (readError || !existing) return { ok: false, errorCode: 'invalid_draft' }
  const draft = existing as OnboardingDraftRow

  if (draft.status === 'expired' || Date.parse(draft.expires_at) < Date.now()) {
    return { ok: false, errorCode: 'draft_expired' }
  }

  if (draft.claimed_by && draft.claimed_by !== userId) {
    return { ok: false, errorCode: 'draft_claim_conflict' }
  }

  // Ya reclamado por este mismo usuario (reload, reintento) — idempotente,
  // no hace falta volver a escribir.
  if (draft.claimed_by === userId) {
    return { ok: true, draft, justClaimed: false }
  }

  // claimed_by es NULL todavía: intento atómico. Si otra request lo reclamó
  // entre el SELECT de arriba y este UPDATE, la condición .is('claimed_by',
  // null) deja de cumplirse y esta consulta no actualiza ninguna fila.
  const { data: claimed, error: claimError } = await db
    .from('onboarding_drafts')
    .update({ claimed_by: userId, status: 'claimed', updated_at: new Date().toISOString() })
    .eq('id', draftId)
    .is('claimed_by', null)
    .select('*')
    .maybeSingle()

  if (claimError) return { ok: false, errorCode: 'invalid_draft' }

  if (claimed) return { ok: true, draft: claimed as OnboardingDraftRow, justClaimed: true }

  // Perdió la carrera: reconsultar para dar el error correcto.
  const { data: after } = await db.from('onboarding_drafts').select('*').eq('id', draftId).maybeSingle()
  if (after && (after as OnboardingDraftRow).claimed_by === userId) {
    // Otra request concurrente (mismo usuario) ganó la carrera — ella ya
    // cuenta como el claim "nuevo"; esta es la idempotente.
    return { ok: true, draft: after as OnboardingDraftRow, justClaimed: false }
  }
  return { ok: false, errorCode: 'draft_claim_conflict' }
}
