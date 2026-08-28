import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { addDays, getMadridToday, isStudyDay } from '@/app/lib/camino/studyDays'
import { recordMissionBehaviorEvent } from '@/app/lib/camino/missionBehavior'

export const dynamic = 'force-dynamic'

const RETRY_SCHOOL_DAYS = 3

function addSchoolDays(fromDateStr: string, n: number): string {
  let d = fromDateStr
  let count = 0
  while (count < n) {
    d = addDays(d, 1)
    if (isStudyDay(d)) count++
  }
  return d
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

    if (!subject || v2SortOrder == null) {
      return NextResponse.json({ error: 'subject y v2SortOrder son obligatorios' }, { status: 400 })
    }

    const db = createServiceClient()

    // PASO 1: Buscar el item en la cola
    const { data: queueItem } = await db
      .from('user_learning_queue')
      .select('id, block_key, v2_sort_order, retry_not_before')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .in('queue_status', ['pending', 'scheduled'])
      .maybeSingle()

    if (!queueItem) {
      return NextResponse.json({ success: true, warning: false, notFound: true })
    }

    // PASO 2: Decidir cómo tratar el "no lo he dado" según su posición en el
    // bloque:
    // - Primera tarjeta del bloque -> el bloque entero se salta (el alumno
    //   ni ha empezado el tema en clase), se pasa directo al primer tema del
    //   siguiente bloque.
    // - Tarjeta a mitad de bloque, primer aviso -> se reintenta la MISMA
    //   tarjeta pasados unos días lectivos (retry_not_before), sin tocar el
    //   resto de la cola.
    // - Tarjeta a mitad de bloque, segundo aviso consecutivo (ya tenía
    //   retry_not_before puesto) -> se da por perdida esa tarjeta y se pasa
    //   a la siguiente del mismo bloque, igual que el resto de postpones.
    let blockSkipped = false
    let retryScheduled = false
    let retryDate: string | null = null

    if (queueItem.block_key) {
      const { data: blockRows } = await db
        .from('user_learning_queue')
        .select('v2_sort_order')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('block_key', queueItem.block_key)
        .order('v2_sort_order', { ascending: true })
        .limit(1)

      const minSortOrderInBlock = blockRows?.[0]?.v2_sort_order ?? queueItem.v2_sort_order
      const isFirstOfBlock = queueItem.v2_sort_order === minSortOrderInBlock

      if (isFirstOfBlock) {
        await db
          .from('user_learning_queue')
          .update({ queue_status: 'postponed', postponed: true, postponed_reason: 'not_taught_block_start' })
          .eq('user_id', user.id)
          .eq('subject', subject)
          .eq('block_key', queueItem.block_key)
          .eq('queue_status', 'pending')
        // La propia fila también puede estar en queue_status='scheduled' si
        // ya se había colocado en el calendario — el UPDATE de arriba solo
        // cubre 'pending', así que la aseguramos aparte.
        await db
          .from('user_learning_queue')
          .update({ queue_status: 'postponed', postponed: true, postponed_reason: 'not_taught_block_start' })
          .eq('id', queueItem.id)
        blockSkipped = true
      } else if (!queueItem.retry_not_before) {
        retryDate = addSchoolDays(getMadridToday(), RETRY_SCHOOL_DAYS)
        await db
          .from('user_learning_queue')
          .update({ retry_not_before: retryDate })
          .eq('id', queueItem.id)
        retryScheduled = true
      } else {
        await db
          .from('user_learning_queue')
          .update({ queue_status: 'postponed', postponed: true, postponed_reason: 'not_taught_retry_failed' })
          .eq('id', queueItem.id)
      }
    } else {
      // Sin block_key no se puede saber la posición dentro del bloque —
      // se mantiene el comportamiento anterior (postpone directo).
      await db
        .from('user_learning_queue')
        .update({ queue_status: 'postponed', postponed: true, postponed_reason: 'not_taught_in_class' })
        .eq('id', queueItem.id)
    }

    // PASO 3: Marcar la misión del calendario como postponed (si está
    // pending). Mismo tema+asignatura puede tener más de una fila pendiente
    // en fechas distintas (ver ensureCaminoCalendar) — sin fecha ni límite,
    // este UPDATE marcaría TODAS como postponed de golpe, no solo la de hoy
    // (mismo bug de fondo que /api/camino/complete-mission). Se resuelve a
    // la fila de hoy o pasada más reciente antes de escribir.
    const { data: postponeCandidates } = await db
      .from('camino_calendar')
      .select('id, postpone_count')
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .eq('status', 'pending')
      .lte('scheduled_date', new Date().toISOString().slice(0, 10))
      .order('scheduled_date', { ascending: false })
      .limit(1)

    if (postponeCandidates?.[0]?.id) {
      const now = new Date().toISOString()
      const nextPostponeCount = (postponeCandidates[0].postpone_count ?? 0) + 1
      const { data: updatedPostpone } = await db
        .from('camino_calendar')
        .update({
          status: 'postponed',
          last_postponed_at: now,
          postpone_count: nextPostponeCount,
          updated_at: now,
        })
        .eq('id', postponeCandidates[0].id)
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .select('id, postpone_count')
      if (updatedPostpone?.[0]?.id) {
        await recordMissionBehaviorEvent(db, user.id, updatedPostpone[0].id, 'postponed_manual', `manual-postpone:${updatedPostpone[0].postpone_count}`, {
          subject,
          v2_sort_order: v2SortOrder,
          block_key: queueItem.block_key,
        }).catch(err => {
          console.warn('[postpone-mission] mission behavior event skipped', err)
        })
      }
    }

    // PASO 4: Calcular ratio de postponed en el bloque (solo informativo
    // cuando algo se ha saltado de verdad; un retry programado no cuenta
    // como "tendrás que verlo antes de la PAU" porque todavía puede volver).
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
    const warning = !retryScheduled && total > 0 && postponed / total > 0.3
    await recordBetaMetric(db, user.id, 'no_dado_en_clase_clicked', {
      subject,
      v2_sort_order: v2SortOrder,
      block_key: blockKey,
      block_skipped: blockSkipped,
      retry_scheduled: retryScheduled,
      postponed_in_block: postponed,
      total_in_block: total,
      warning,
    })

    return NextResponse.json({
      success: true,
      warning,
      blockSkipped,
      retryScheduled,
      retryDate,
      message: warning ? 'Tendrás que ver estos temas antes de la PAU' : undefined,
    })
  } catch (err) {
    console.error('[postpone-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
