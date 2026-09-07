import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { cleanStudentExams } from '@/app/lib/camino/cleanStudentExams'
import { normalizeSubjectSlug, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { injectAllPartialExamMissions } from '@/app/lib/camino/injectPartialExamMissions'
import { syncKairoMissionsToGoogle } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

function cleanString(value: unknown, max = 160) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const subject = normalizeSubjectSlug(cleanString(body.subject, 80))
    const date = cleanString(body.date, 10)
    const topic = cleanString(body.topic, 120)
    if (!subject) return NextResponse.json({ error: 'subject_required' }, { status: 400 })
    if (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || date < new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })) {
      return NextResponse.json({ error: 'exam_date_invalid' }, { status: 400 })
    }
    if (!topic) return NextResponse.json({ error: 'exam_topic_required' }, { status: 400 })

    const db = createServiceClient()
    const { data: profile, error: profileError } = await db
      .from('perfiles')
      .select('subjects, student_exams')
      .eq('id', auth.user.id)
      .maybeSingle()
    if (profileError) throw profileError
    const activeSubjects = Array.isArray(profile?.subjects)
      ? profile.subjects.map(value => typeof value === 'string' ? normalizeSubjectSlug(value) : '').filter(Boolean)
      : []
    if (!activeSubjects.includes(subject)) return NextResponse.json({ error: 'subject_not_owned' }, { status: 403 })

    const previous = cleanStudentExams(profile?.student_exams)
    const duplicate = previous.find(exam => normalizeSubjectSlug(exam.subject) === subject && exam.date === date && exam.topic.toLocaleLowerCase('es-ES') === topic.toLocaleLowerCase('es-ES'))
    if (duplicate) {
      const sync = await syncKairoMissionsToGoogle(auth.user.id, db).catch(() => ({ failed: 1 }))
      if ((sync.failed ?? 0) > 0) return NextResponse.json({ ok: false, persisted: true, exam: duplicate, calendarSync: 'error', error: 'google_sync_failed' }, { status: 502 })
      return NextResponse.json({ ok: true, duplicate: true, exam: duplicate, calendarSync: 'synced' })
    }
    if (previous.length >= 8) return NextResponse.json({ error: 'exam_limit_reached' }, { status: 409 })

    const exam = {
      id: `exam-${crypto.randomUUID()}`,
      subject,
      date,
      block: topic,
      topic,
      name: `Examen de ${subjectLabelFromSlug(subject)}`,
      priority: 'alta' as const,
      examScope: 'parcial' as const,
    }
    const next = cleanStudentExams([...previous, exam])
    const { error: updateError } = await db.from('perfiles').update({ student_exams: next }).eq('id', auth.user.id)
    if (updateError) throw updateError

    try {
      await injectAllPartialExamMissions(auth.user.id, db, next)
    } catch (error) {
      await db.from('perfiles').update({ student_exams: previous }).eq('id', auth.user.id)
      throw error
    }

    let calendarSync = 'not_connected'
    try {
      const sync = await syncKairoMissionsToGoogle(auth.user.id, db)
      calendarSync = (sync.failed ?? 0) > 0 ? 'error' : 'synced'
    } catch (error) {
      console.warn('[camino/exams] google sync failed', error)
      calendarSync = 'error'
    }
    if (calendarSync === 'error') {
      return NextResponse.json({ ok: false, persisted: true, exam, calendarSync, error: 'google_sync_failed' }, { status: 502 })
    }
    return NextResponse.json({ ok: true, persisted: true, exam, calendarSync })
  } catch (error) {
    console.error('[camino/exams]', error)
    return NextResponse.json({ error: 'No se pudo añadir el examen. Reintentar.' }, { status: 500 })
  }
}
