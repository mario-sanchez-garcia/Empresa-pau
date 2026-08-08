import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { validateUsername } from '@/app/lib/username'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Recuperación específica de "username_taken" (ver /api/onboarding/finalize
// §15): la comprobación pre-auth es provisional, así que el nombre puede
// haber sido reclamado por otra cuenta mientras este usuario hacía
// OAuth/confirmaba su email. En vez de perder cuenta+draft y repetir las 11
// preguntas, se corrige solo el username y se reintenta finalize con el
// mismo draft_id.
export async function PATCH(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const draftId = typeof body.draft_id === 'string' && UUID_RE.test(body.draft_id) ? body.draft_id : null
  const username = typeof body.username === 'string' ? body.username.trim().slice(0, 20) : ''
  if (!draftId) return NextResponse.json({ error: 'invalid_draft' }, { status: 400 })

  const validationError = validateUsername(username)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  const db = createServiceClient()
  const { data: draft } = await db.from('onboarding_drafts').select('id, claimed_by, status, payload').eq('id', draftId).maybeSingle()
  if (!draft) return NextResponse.json({ error: 'invalid_draft' }, { status: 404 })
  if (draft.claimed_by !== user.id) return NextResponse.json({ error: 'draft_claim_conflict' }, { status: 403 })
  if (draft.status === 'processing' || draft.status === 'completed') {
    return NextResponse.json({ error: 'invalid_draft' }, { status: 409 })
  }

  const nextPayload = { ...(draft.payload as Record<string, unknown>), username }
  const { error } = await db
    .from('onboarding_drafts')
    .update({ payload: nextPayload, status: 'claimed', last_error_code: null, updated_at: new Date().toISOString() })
    .eq('id', draftId)

  if (error) return NextResponse.json({ error: 'internal_error' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
