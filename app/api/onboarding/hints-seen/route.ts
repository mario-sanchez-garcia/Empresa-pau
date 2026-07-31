import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { HINTS_CUTOFF_DATE, VALID_HINT_KEYS, type HintKey } from '@/app/lib/onboarding/hintsConfig'

export const dynamic = 'force-dynamic'

// GET — returns all hint keys already seen for the current user
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  // Legacy users (registered before the cutoff) get all keys pre-seen.
  // This protects existing users from seeing every hint on deploy day.
  if (user.created_at && new Date(user.created_at) < new Date(HINTS_CUTOFF_DATE)) {
    return NextResponse.json({ seenKeys: [...VALID_HINT_KEYS] })
  }

  let db: ReturnType<typeof createServiceClient>
  try {
    db = createServiceClient()
  } catch {
    return NextResponse.json({ seenKeys: [] })
  }

  const eventTypes = VALID_HINT_KEYS.map(k => `hint:${k}`)
  const { data } = await db
    .from('billing_events')
    .select('event_type')
    .eq('user_id', user.id)
    .in('event_type', eventTypes)

  const seenKeys = (data ?? []).map(r =>
    (r.event_type as string).replace('hint:', '') as HintKey
  )

  return NextResponse.json({ seenKeys })
}

// POST — mark a hint key as seen (idempotent)
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: { key?: unknown }
  try { body = await request.json() } catch { body = {} }

  const key = body.key as HintKey
  if (!VALID_HINT_KEYS.includes(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  let db: ReturnType<typeof createServiceClient>
  try {
    db = createServiceClient()
  } catch {
    return NextResponse.json({ ok: true })
  }

  const eventType = `hint:${key}`
  const { data: existing } = await db
    .from('billing_events')
    .select('id')
    .eq('user_id', user.id)
    .eq('event_type', eventType)
    .limit(1)
    .maybeSingle()

  if (!existing) {
    await db.from('billing_events').insert({
      user_id: user.id,
      event_type: eventType,
      payload: { hint_key: key },
    })
  }

  return NextResponse.json({ ok: true })
}
