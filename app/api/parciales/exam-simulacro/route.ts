import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

// Same pattern as /api/parciales/exam-topics: exam_simulacro has RLS with no
// policies for authenticated/anon (migration 20260825120000), so the actual
// read/write has to go through a service-role route, and exam_id is checked
// against the caller's own perfiles.student_exams since it's free text, not
// a real FK.
//
// One row per exam_id (UNIQUE) — generateSimulacro() is called by the
// client and stays a pure function with no DB access of its own; the
// caller is expected to GET here first and skip generation entirely on a
// hit, then POST the freshly generated result on a miss so every later
// visit for the same exam_id — from Camino or from Simulacros directly —
// gets back the exact same simulacro.

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
  const { data, error } = await db.from('exam_simulacro').select('simulacro_data').eq('exam_id', examId).maybeSingle()
  if (error) return NextResponse.json({ error: 'No se pudo comprobar si ya existe un simulacro para este examen.' }, { status: 500 })

  return NextResponse.json({ simulacroData: data?.simulacro_data ?? null })
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }

  const examId = typeof body.examId === 'string' ? body.examId.trim() : ''
  const simulacroData = body.simulacroData

  if (!examId) return NextResponse.json({ error: 'Falta examId.' }, { status: 400 })
  if (simulacroData === undefined || simulacroData === null) {
    return NextResponse.json({ error: 'Falta simulacroData.' }, { status: 400 })
  }

  if (!(await assertOwnsExam(user.id, examId))) {
    return NextResponse.json({ error: 'Ese examen no existe o no es tuyo.' }, { status: 403 })
  }

  const db = createServiceClient()

  // exam_id is UNIQUE — a concurrent double-save (e.g. two tabs generating
  // at once) both trying to insert the first result should end with one
  // winner and the loser reading it back, not an error surfaced to either
  // tab, so ignoreDuplicates + a follow-up select covers that race cleanly.
  const { error: upsertError } = await db
    .from('exam_simulacro')
    .upsert({ exam_id: examId, simulacro_data: simulacroData }, { onConflict: 'exam_id', ignoreDuplicates: true })
  if (upsertError) return NextResponse.json({ error: 'No se pudo guardar el simulacro de este examen.' }, { status: 500 })

  const { data: saved, error: readError } = await db.from('exam_simulacro').select('simulacro_data').eq('exam_id', examId).maybeSingle()
  if (readError || !saved) return NextResponse.json({ error: 'No se pudo confirmar el simulacro guardado.' }, { status: 500 })

  return NextResponse.json({ simulacroData: saved.simulacro_data })
}
