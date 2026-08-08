import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { claimOnboardingDraft } from '@/app/lib/onboarding/claimOnboardingDraft'
import { recordBetaMetric } from '@/app/lib/betaMetrics'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Llamado desde /auth/callback (página cliente) justo después de completar
// el login (Google o email) para reclamar el draft ANTES de redirigir a
// /onboarding/finalizando. finalize también reclama por su cuenta (mismo
// helper, idempotente) — este endpoint existe para que el callback pueda
// hacerlo sin esperar a la primera llamada a finalize.
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const draftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null
  if (!draftId) return NextResponse.json({ error: 'invalid_draft' }, { status: 400 })

  const db = createServiceClient()
  const result = await claimOnboardingDraft(db, draftId, user.id)
  if (!result.ok) {
    const status = result.errorCode === 'draft_expired' ? 410 : result.errorCode === 'draft_claim_conflict' ? 409 : 404
    return NextResponse.json({ error: result.errorCode }, { status })
  }

  if (result.justClaimed) {
    void recordBetaMetric(db, user.id, 'onboarding_draft_claimed', {
      event_id: crypto.randomUUID(),
      trace_id: result.draft.trace_id,
      flow_version: result.draft.flow_version,
    })
  }

  return NextResponse.json({ ok: true, status: result.draft.status })
}
