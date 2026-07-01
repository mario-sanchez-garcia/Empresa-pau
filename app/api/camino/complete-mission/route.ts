import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

const XP_BY_MISSION_TYPE: Record<string, number> = {
  concept: 20,
  review: 10,
  pau_practice: 30,
}

function getMadridToday(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subject = typeof body.subject === 'string' ? body.subject : null
    const v2SortOrder = typeof body.v2SortOrder === 'number' ? body.v2SortOrder : null
    const missionType = typeof body.missionType === 'string' ? body.missionType : 'concept'
    const xpAwarded =
      typeof body.xpAwarded === 'number'
        ? body.xpAwarded
        : (XP_BY_MISSION_TYPE[missionType] ?? 20)

    if (!subject || v2SortOrder == null) {
      return NextResponse.json(
        { error: 'subject y v2SortOrder son obligatorios' },
        { status: 400 },
      )
    }

    const today = getMadridToday()
    const db = createServiceClient()
    const now = new Date().toISOString()

    // PASO 2: Marcar la entrada del calendario como completada
    await db
      .from('camino_calendar')
      .update({
        status: 'completed',
        completed_at: now,
        xp_awarded: xpAwarded,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .eq('scheduled_date', today)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .eq('status', 'pending')

    // PASO 3: Marcar el item de la cola como completado
    await db
      .from('user_learning_queue')
      .update({ queue_status: 'completed' })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[camino/complete-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
