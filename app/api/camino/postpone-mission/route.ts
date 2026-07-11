import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subject = typeof body.subject === 'string' ? body.subject : null
    const v2SortOrder = typeof body.v2SortOrder === 'number' ? body.v2SortOrder : null

    if (!subject || v2SortOrder == null) {
      return NextResponse.json({ error: 'subject y v2SortOrder son obligatorios' }, { status: 400 })
    }

    const db = createServiceClient()

    // PASO 1: Buscar el item en la cola
    const { data: queueItem } = await db
      .from('user_learning_queue')
      .select('id, block_key')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .in('queue_status', ['pending', 'scheduled'])
      .maybeSingle()

    if (!queueItem) {
      return NextResponse.json({ success: true, warning: false, notFound: true })
    }

    // PASO 2: Marcar como postponed en la cola
    await db
      .from('user_learning_queue')
      .update({
        queue_status: 'postponed',
        postponed: true,
        postponed_reason: 'not_taught_in_class',
      })
      .eq('id', queueItem.id)

    // PASO 3: Marcar la misión del calendario como postponed (si está pending)
    await db
      .from('camino_calendar')
      .update({ status: 'postponed', updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .eq('status', 'pending')

    // PASO 4: Calcular ratio de postponed en el bloque
    const blockKey = queueItem.block_key
    const [{ count: totalInBlock }, { count: postponedInBlock }] = await Promise.all([
      db
        .from('user_learning_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('block_key', blockKey),
      db
        .from('user_learning_queue')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('block_key', blockKey)
        .eq('queue_status', 'postponed'),
    ])

    const total = totalInBlock ?? 0
    const postponed = postponedInBlock ?? 0
    const warning = total > 0 && postponed / total > 0.3
    await recordBetaMetric(db, user.id, 'no_dado_en_clase_clicked', {
      subject,
      v2_sort_order: v2SortOrder,
      block_key: blockKey,
      postponed_in_block: postponed,
      total_in_block: total,
      warning,
    })

    return NextResponse.json({
      success: true,
      warning,
      message: warning ? 'Tendrás que ver estos temas antes de la PAU' : undefined,
    })
  } catch (err) {
    console.error('[postpone-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
