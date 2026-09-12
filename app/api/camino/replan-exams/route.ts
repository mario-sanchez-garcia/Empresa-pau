import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { checkedDb } from '@/app/lib/camino/checkedDb'
import { withPlanLock, PlanBusyError } from '@/app/lib/camino/planPersistence'
import { loadStudentPlanContext } from '@/app/lib/camino/studentPlanContext'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { injectAllPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'

import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { canRepositionAutomatically } from '@/app/lib/camino/automaticPlacement'

export const maxDuration = 300
export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    const body = await request.json().catch(() => ({}))
    const db = checkedDb(createServiceClient())
    return await withPlanLock(db, auth.user.id, async () => {
      const { data: profile } = await db.from('perfiles').select('student_exams').eq('id', auth.user.id).maybeSingle()
      const exams = cleanStudentExams(profile?.student_exams)
      const forceExamId = typeof body.forceExamId === 'string' ? body.forceExamId : undefined
      if (forceExamId && !exams.some(exam => exam.id === forceExamId)) return NextResponse.json({ error: 'exam_not_owned' }, { status: 404 })
      const ids = new Set(exams.map(exam => exam.id))
      const { data: previous } = await db.from('camino_calendar').select('id, source, status, locked, metadata')
        .eq('user_id', auth.user.id).eq('source', 'partial').in('status', ['pending','postponed','unscheduled'])
      const obsolete = (previous ?? []).filter(canRepositionAutomatically).filter(row => !ids.has(row.metadata?.partial_exam_id)).map(row => row.id)
      if (obsolete.length) await db.from('camino_calendar').update({ status: 'superseded', start_time: null, end_time: null })
        .eq('user_id', auth.user.id).in('id', obsolete)
      const planContext = await loadStudentPlanContext(auth.user.id, db)
      await injectAllPartialExamMissions(auth.user.id, db, exams, { planContext, forceExamId })
      const personalization = await applyCalendarPersonalization(auth.user.id, db, { planContext, force: true })
      if (personalization.reason === 'error') throw new Error('partial_personalization_failed')
      return NextResponse.json({ ok: true, personalization })
    })
  } catch (error) {
    console.error('[camino/replan-exams]', error)
    return NextResponse.json({ error: 'No se pudieron actualizar los parciales', retryable: true }, { status: error instanceof PlanBusyError ? 409 : 503 })
  }
}
