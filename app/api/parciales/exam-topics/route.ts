import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

// exam_topics has RLS enabled with no policies for authenticated/anon (see
// migration 20260825120000) — client-side supabase can read curriculum_topics
// directly (that one does have a select policy), but exam_id/topic_id writes
// have to go through this service-role route.
//
// exam_id is free text, not a real FK (perfiles.student_exams is a jsonb
// array, not a table — see the same migration's comment on exam_topics), so
// ownership is checked by confirming examId is one of the caller's own
// student_exams ids before touching exam_topics for it.

async function assertOwnsExam(userId: string, examId: string) {
  const db = createServiceClient()
  const { data } = await db.from('perfiles').select('student_exams').eq('id', userId).maybeSingle()
  const exams = Array.isArray(data?.student_exams) ? data.student_exams as Array<{ id?: unknown }> : []
  return exams.some(e => e?.id === examId)
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const examId = request.nextUrl.searchParams.get('examId')?.trim()
  if (!examId) return NextResponse.json({ error: 'Falta examId.' }, { status: 400 })

  if (!(await assertOwnsExam(user.id, examId))) {
    return NextResponse.json({ error: 'Ese examen no existe o no es tuyo.' }, { status: 403 })
  }

  const db = createServiceClient()
  const { data, error } = await db.from('exam_topics').select('topic_id').eq('exam_id', examId)
  if (error) return NextResponse.json({ error: 'No se pudieron leer los temas del examen.' }, { status: 500 })

  return NextResponse.json({ topicIds: (data ?? []).map(row => row.topic_id) })
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const examId = typeof body.examId === 'string' ? body.examId.trim() : ''
  const topicIds = Array.isArray(body.topicIds)
    ? body.topicIds.filter((t): t is string => typeof t === 'string' && t.trim().length > 0)
    : []

  if (!examId) return NextResponse.json({ error: 'Falta examId.' }, { status: 400 })

  if (!(await assertOwnsExam(user.id, examId))) {
    return NextResponse.json({ error: 'Ese examen no existe o no es tuyo.' }, { status: 403 })
  }

  const db = createServiceClient()

  // Replace, not append: re-saving a Parcial's chips should reflect exactly
  // what's selected now, not accumulate rows from every previous save.
  const { error: deleteError } = await db.from('exam_topics').delete().eq('exam_id', examId)
  if (deleteError) return NextResponse.json({ error: 'No se pudieron actualizar los temas del examen.' }, { status: 500 })

  if (topicIds.length > 0) {
    const { error: insertError } = await db.from('exam_topics').insert(
      topicIds.map(topicId => ({ exam_id: examId, topic_id: topicId }))
    )
    if (insertError) return NextResponse.json({ error: 'No se pudieron guardar los temas del examen.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, count: topicIds.length })
}
