import { NextRequest, NextResponse } from 'next/server'

import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { normalizeCaminoSlug, normalizeSubjectSlug, sanitizeLessonTitle, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { createDayScheduler } from '@/app/lib/camino/scheduleTimeSlot'
import { syncKairoMissionsToGoogle } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

const DEFAULT_MINUTES = 20

function cleanString(value: unknown, max = 180) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function todayMadrid() {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function isIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function stableNegativeSortOrder(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0
  }
  return -1 * (Math.abs(hash) % 1_000_000_000 || 1)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthContext(request)
    if ('response' in auth) return auth.response

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subjectRaw = cleanString(body.subject, 80)
    const focusNote = cleanString(body.focusNote, 180)
    const requestedDate = cleanString(body.date, 20)
    const scheduledDate = isIsoDate(requestedDate) ? requestedDate : todayMadrid()
    const subject = normalizeSubjectSlug(subjectRaw)

    if (!subject) {
      return NextResponse.json({ error: 'subject_required' }, { status: 400 })
    }

    const suggestionKey = `${scheduledDate}:${subject}:${normalizeCaminoSlug(focusNote || subjectRaw)}`
    const v2SortOrder = stableNegativeSortOrder(`free_review:${suggestionKey}`)
    const title = sanitizeLessonTitle(`Repaso sugerido: ${focusNote || subjectLabelFromSlug(subject)}`)
    const db = createServiceClient()

    const { data: existing } = await db
      .from('camino_calendar')
      .select('id, start_time, end_time')
      .eq('user_id', auth.user.id)
      .eq('scheduled_date', scheduledDate)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .maybeSingle()

    if (existing?.id) {
      return NextResponse.json({
        ok: true,
        duplicate: true,
        missionId: existing.id,
        calendarSync: existing.start_time && existing.end_time ? 'already_scheduled' : 'pending_no_time',
      })
    }

    const scheduler = await createDayScheduler(auth.user.id, db, scheduledDate)
    const slot = scheduler.place(DEFAULT_MINUTES)
    const metadata = {
      free_review_suggestion: true,
      suggestion_key: suggestionKey,
      focus_note: focusNote,
      reason: focusNote || 'Añadida desde repaso libre sugerido.',
      estimated_minutes: DEFAULT_MINUTES,
      calendar_sync_status: slot ? 'pending' : 'pending_no_time',
    }

    const { data: inserted, error } = await db
      .from('camino_calendar')
      .insert({
        user_id: auth.user.id,
        scheduled_date: scheduledDate,
        subject,
        v2_sort_order: v2SortOrder,
        title,
        block_key: focusNote || null,
        block_slug: focusNote ? normalizeCaminoSlug(focusNote) : null,
        mission_type: 'review',
        is_main: false,
        is_bonus: true,
        status: 'pending',
        locked: true,
        source: 'manual',
        generated_by: 'free_review_suggestion_v1',
        start_time: slot?.start ?? null,
        end_time: slot?.end ?? null,
        metadata,
      })
      .select('id, start_time, end_time')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ ok: true, duplicate: true, calendarSync: 'not_attempted' })
      }
      throw error
    }

    let calendarSync = inserted.start_time && inserted.end_time ? 'pending' : 'pending_no_time'
    if (inserted.start_time && inserted.end_time) {
      try {
        await syncKairoMissionsToGoogle(auth.user.id, db)
        calendarSync = 'attempted'
      } catch (error) {
        console.warn('[camino/free-review-suggestion/add] google sync skipped:', error)
        await db
          .from('camino_calendar')
          .update({ metadata: { ...metadata, calendar_sync_status: 'error' } })
          .eq('id', inserted.id)
          .eq('user_id', auth.user.id)
        calendarSync = 'error'
      }
    }

    return NextResponse.json({
      ok: true,
      duplicate: false,
      missionId: inserted.id,
      calendarSync,
      startTime: inserted.start_time,
      endTime: inserted.end_time,
    })
  } catch (error) {
    console.error('[camino/free-review-suggestion/add]', error)
    return NextResponse.json({ error: 'No se pudo añadir la misión sugerida.' }, { status: 500 })
  }
}
