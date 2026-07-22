import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { getUserInstituteMembership } from '@/app/lib/camino/institutePace'
import { resolveCaminoTopic } from '@/app/lib/camino/caminoCurriculumPlan'

export const dynamic = 'force-dynamic'

const SIGNAL_TYPES = new Set(['not_taught_yet', 'currently_learning'])
const SOURCES = new Set(['topic_page', 'daily_mission', 'flashcard'])
const DAILY_SIGNAL_LIMIT = 20

type PaceSignalBody = {
  subject?: unknown
  blockSlug?: unknown
  topicSlug?: unknown
  v2SortOrder?: unknown
  signalType?: unknown
  source?: unknown
}

function cleanText(value: unknown, max = 120) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response

  let body: PaceSignalBody
  try {
    body = await request.json() as PaceSignalBody
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const signalType = cleanText(body.signalType) || 'not_taught_yet'
  const source = cleanText(body.source) || 'topic_page'

  if (!SIGNAL_TYPES.has(signalType)) {
    return NextResponse.json({ error: 'Tipo de señal no valido' }, { status: 400 })
  }

  if (!SOURCES.has(source)) {
    return NextResponse.json({ error: 'Origen de señal no valido' }, { status: 400 })
  }

  if (signalType !== 'not_taught_yet') {
    return NextResponse.json({ error: 'Solo not_taught_yet esta activo en Fase 1' }, { status: 400 })
  }

  const subject = cleanText(body.subject)
  const blockSlug = cleanText(body.blockSlug)
  const topicSlug = cleanText(body.topicSlug)

  if (!subject || !blockSlug || !topicSlug) {
    return NextResponse.json({ error: 'subject, blockSlug y topicSlug son obligatorios' }, { status: 400 })
  }

  const resolved = resolveCaminoTopic({ subjectSlug: subject, blockSlug, topicSlug })
  if (!resolved.topic) {
    return NextResponse.json({ error: 'Tema no encontrado' }, { status: 400 })
  }

  const db = createServiceClient()
  let membership
  try {
    membership = await getUserInstituteMembership(db, auth.user.id)
  } catch {
    return NextResponse.json({
      ok: true,
      individualOnly: true,
      message: 'El registro de ritmo de instituto aun no esta disponible.',
    })
  }
  if (!membership) {
    return NextResponse.json({
      ok: true,
      individualOnly: true,
      message: 'No hay instituto asociado al usuario.',
    })
  }

  const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const { count: dailyCount, error: countError } = await db
    .from('pace_signals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', auth.user.id)
    .eq('signal_day', today)

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 })
  }

  if ((dailyCount ?? 0) >= DAILY_SIGNAL_LIMIT) {
    return NextResponse.json({
      error: 'Has marcado muchos temas hoy. Vuelve a intentarlo mañana.',
      code: 'PACE_SIGNAL_DAILY_LIMIT',
    }, { status: 429 })
  }

  const canonicalTopic = resolved.topic
  const v2SortOrder = typeof body.v2SortOrder === 'number'
    ? body.v2SortOrder
    : canonicalTopic.v2SortOrder ?? null

  const { error: upsertError } = await db
    .from('pace_signals')
    .upsert({
      user_id: auth.user.id,
      institute_id: membership.instituteId,
      subject: canonicalTopic.subject,
      block_slug: canonicalTopic.blockSlug,
      topic_slug: canonicalTopic.topicSlug,
      v2_sort_order: v2SortOrder,
      signal_type: signalType,
      source,
      signal_day: today,
      metadata: {
        matched_by: resolved.matchedBy,
        requested_subject: subject,
        requested_block_slug: blockSlug,
        requested_topic_slug: topicSlug,
      },
    }, {
      onConflict: 'user_id,institute_id,subject,block_slug,topic_slug,signal_type,signal_day',
      ignoreDuplicates: false,
    })

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 })
  }

  const { data: lagRow } = await db
    .from('view_institute_lag')
    .select('unique_students, last_signal_at')
    .eq('institute_id', membership.instituteId)
    .eq('subject', canonicalTopic.subject)
    .eq('block_slug', canonicalTopic.blockSlug)
    .eq('topic_slug', canonicalTopic.topicSlug)
    .maybeSingle()

  return NextResponse.json({
    ok: true,
    individualOnly: false,
    instituteLag: Boolean(lagRow),
  })
}
