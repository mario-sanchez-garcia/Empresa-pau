import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { buildOnboardingReward } from '@/app/lib/onboarding/buildOnboardingReward'
import { getTopic, getTopicByV2SortOrder } from '@/app/lib/camino/caminoCurriculumPlan'

export const dynamic = 'force-dynamic'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isPainType(value: unknown): value is 'daily_plan' | 'correction_confidence' | 'procrastination' | 'improve_grade' {
  return value === 'daily_plan' || value === 'correction_confidence' || value === 'procrastination' || value === 'improve_grade'
}

// Permite a /onboarding/finalizando reconstruir su estado tras un reload sin
// volver a llamar a finalize (que ya es idempotente, pero esto evita incluso
// el intento de re-procesar cuando solo hace falta leer). Auth obligatorio;
// solo puede consultarse un draft que el propio usuario haya reclamado.
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const draftId = request.nextUrl.searchParams.get('draft')
  if (!draftId || !UUID_RE.test(draftId)) {
    return NextResponse.json({ error: 'invalid_draft' }, { status: 400 })
  }

  const db = createServiceClient()
  const { data: draft } = await db.from('onboarding_drafts').select('*').eq('id', draftId).maybeSingle()

  if (!draft) return NextResponse.json({ error: 'invalid_draft' }, { status: 404 })
  if (draft.claimed_by !== user.id) return NextResponse.json({ error: 'draft_claim_conflict' }, { status: 403 })

  const response: Record<string, unknown> = {
    status: draft.status,
    processing_stage: draft.processing_stage,
    last_error_code: draft.last_error_code,
    completed_at: draft.completed_at,
  }

  if (draft.status === 'completed') {
    const payload = draft.payload as Record<string, unknown>
    const today = new Date().toISOString().slice(0, 10)
    const { data: rows } = await db
      .from('camino_calendar')
      .select('title, subject, scheduled_date, mission_type, v2_sort_order, block_slug, metadata, created_at')
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true })
      .order('created_at', { ascending: true })
      .limit(3)

    const missions = (rows ?? []).map(row => {
      const meta = row.metadata as { topic_slug?: string | null } | null
      const topic = getTopicByV2SortOrder(row.subject, row.v2_sort_order)
        ?? (row.block_slug && meta?.topic_slug ? getTopic(row.subject, row.block_slug, meta.topic_slug) : null)
      return {
        title: row.title,
        subject: row.subject,
        scheduled_date: row.scheduled_date,
        mission_type: row.mission_type,
        supportsStepCorrection: Boolean(topic),
      }
    })

    response.reward = buildOnboardingReward(
      missions,
      typeof payload.daily_minutes === 'number' ? payload.daily_minutes : null,
      isPainType(payload.pain_type) ? payload.pain_type : null,
    )
  }

  return NextResponse.json(response)
}
