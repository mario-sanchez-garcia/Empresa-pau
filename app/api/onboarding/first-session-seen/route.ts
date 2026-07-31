import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let db: ReturnType<typeof createServiceClient>
  try {
    db = createServiceClient()
  } catch {
    return NextResponse.json({ error: 'Supabase service role not configured' }, { status: 500 })
  }

  // Idempotent — ignore if already exists
  const { data: existing } = await db
    .from('billing_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_type', 'first_session_seen')
    .limit(1)
    .maybeSingle()

  if (!existing) {
    await db.from('billing_events').insert({
      user_id: user.id,
      event_type: 'first_session_seen',
      payload: { first_session_seen: true },
    })
  }

  return NextResponse.json({ ok: true })
}
