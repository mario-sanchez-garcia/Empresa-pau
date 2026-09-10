import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { loadStudentPlanContext, planningDates } from '@/app/lib/camino/studentPlanContext'
import { readAllRows } from '@/app/lib/camino/readAllRows'
import { summarizeUnscheduled, type UnscheduledRow } from '@/app/lib/camino/unscheduledWork'
import { withPlanLock, PlanBusyError } from '@/app/lib/camino/planPersistence'

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    const db = createServiceClient()
    const userId = auth.user.id
    const context = await loadStudentPlanContext(userId, db)
    const rows = await readAllRows<UnscheduledRow>((from, to) => db.from('camino_calendar')
      .select('id, queue_id, subject, v2_sort_order, metadata').eq('user_id', userId)
      .eq('status', 'unscheduled').order('id').range(from, to))
    const queue = await readAllRows<{ id: string; queue_status: string }>((from, to) => db.from('user_learning_queue')
      .select('id, queue_status').eq('user_id', userId).order('id').range(from, to))
    const resolved = new Set(queue.filter(row => row.queue_status === 'completed' || row.queue_status === 'scheduled').map(row => row.id))
    return NextResponse.json({
      ...summarizeUnscheduled(rows, resolved),
      needsAvailability: context.emergencyAvailability && !context.emergencyAvailabilityAccepted,
      examDate: context.examDate,
      availableDays: planningDates(context, { includeFinalReviewWindow: true }).length,
      pendingTopics: queue.filter(row => row.queue_status === 'pending').length,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('[camino/status]', error)
    return NextResponse.json({ error: 'No se pudo consultar el estado del plan' }, { status: 503 })
  }
}

/** Explicit, exam-scoped exception. Never change the normal weekly preference. */
export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  const body = await request.json().catch(() => null)
  if (body?.acceptEmergency !== true) return NextResponse.json({ error: 'invalid_choice' }, { status: 400 })
  const db = createServiceClient()
  try {
    return await withPlanLock(db, auth.user.id, async () => {
      const context = await loadStudentPlanContext(auth.user.id, db)
      if (context.emergencyAvailability && !context.emergencyAvailabilityAccepted) {
        const { error } = await db.from('billing_events').insert({ user_id: auth.user.id,
          event_type: 'camino_emergency_availability', payload: { exam_date: context.examDate, accepted: true } })
        if (error) throw error
      }
      return NextResponse.json({ ok: true })
    })
  } catch (error) {
    return NextResponse.json({ error: error instanceof PlanBusyError ? 'plan_busy' : 'save_failed' }, { status: 503 })
  }
}
