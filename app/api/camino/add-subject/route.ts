import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { PRIVATE_BETA_CURRICULUM_TOPICS, isPrivateBetaSubject } from '@/app/lib/camino/betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle, subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'

export const dynamic = 'force-dynamic'

const ALLOWED_SUBJECTS = new Set(['matematicas_ii', 'matematicas_ccss', 'lengua', 'historia_espana', 'fisica', 'quimica'])

type QueueSourceItem = {
  sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
  subject: string
  topic_slug?: string | null
}

function queueTopicMeta(item: QueueSourceItem) {
  const subject = normalizeSubjectSlug(item.subject)
  const topic = CAMINO_CURRICULUM_TOPICS.find(c =>
    c.subject === subject && (c.v2SortOrder === item.sort_order || c.orderIndex === item.sort_order),
  ) ?? CAMINO_CURRICULUM_TOPICS.find(c =>
    c.subject === subject && normalizeTopicSlug(c.title) === normalizeTopicSlug(item.title),
  )
  const blockSlug = item.block_slug ?? topic?.blockSlug ?? null
  const rawTopicSlug = item.topic_slug ?? topic?.topicSlug ?? normalizeTopicSlug(item.title)
  return {
    blockSlug,
    topicSlug: blockSlug ? resolveTopicSlugAlias(subject, blockSlug, rawTopicSlug) : normalizeTopicSlug(rawTopicSlug),
  }
}

function betaSequenceItems(subject: string): QueueSourceItem[] {
  const normalized = normalizeSubjectSlug(subject)
  if (!isPrivateBetaSubject(normalized)) return []
  return PRIVATE_BETA_CURRICULUM_TOPICS
    .filter(t => t.subject === normalized)
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(t => ({
      sort_order: t.orderIndex,
      title: t.title,
      block_key: t.blockTitle,
      block_slug: t.blockSlug,
      subject: t.subject,
      topic_slug: t.topicSlug,
    }))
}

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subject = typeof body.subject === 'string' ? normalizeSubjectSlug(body.subject) : ''
    if (!subject || !ALLOWED_SUBJECTS.has(subject)) {
      return NextResponse.json({ error: 'Asignatura no válida' }, { status: 400 })
    }

    const db = createServiceClient()

    // Idempotency: skip if the subject's queue already exists
    const { count: existing } = await db
      .from('user_learning_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('subject', subject)
    if (existing && existing > 0) {
      return NextResponse.json({ ok: true, alreadyExists: true })
    }

    // Seed learning queue — same logic as /api/onboarding/generate
    const { data: flashcards } = await db
      .from('curriculum_content_v2')
      .select('sort_order, title, block_key, block_slug, subject')
      .eq('subject', subject)
      .order('sort_order', { ascending: true })

    const items: QueueSourceItem[] = (flashcards ?? []).filter(fc => isPrivateBetaSubject(fc.subject))
    const finalItems = items.length > 0 ? items : betaSequenceItems(subject)

    if (finalItems.length > 0) {
      const queueRows = finalItems.map((fc, i) => {
        const topicMeta = queueTopicMeta(fc)
        return {
          user_id: user.id,
          subject: fc.subject,
          block_key: fc.block_key,
          block_slug: topicMeta.blockSlug,
          v2_sort_order: fc.sort_order,
          title: sanitizeLessonTitle(fc.title),
          subject_position: i + 1,
          queue_status: 'pending',
          metadata: { mission_type: 'concept', beta_sequence: true, topic_slug: topicMeta.topicSlug },
        }
      })
      for (let i = 0; i < queueRows.length; i += 100) {
        const { error } = await db.from('user_learning_queue').insert(queueRows.slice(i, i + 100))
        if (error) throw new Error(`Queue insert: ${error.message}`)
      }
    }

    // Fill the next 14 calendar days — ensureCaminoCalendar picks up the new subject from queue
    await ensureCaminoCalendar(user.id, db)
    await applyCalendarPersonalization(user.id, db)

    // Mantener perfiles.subjects (la fuente de verdad server-side de
    // onboarding) al día — antes esta ruta solo sembraba la cola/calendario
    // y dejaba que cada navegador actualizara su propia copia local, así
    // que la asignatura añadida aquí no aparecía como "elegida" en ningún
    // otro dispositivo ni al recargar tras limpiar caché.
    try {
      const { data: perfil } = await db.from('perfiles').select('subjects').eq('id', user.id).maybeSingle()
      let currentLabels: string[] = Array.isArray(perfil?.subjects)
        ? perfil.subjects.filter((s: unknown): s is string => typeof s === 'string')
        : []

      // La columna perfiles.subjects se creó después de que muchas cuentas
      // completaran el onboarding, así que para ellas está vacía aunque SÍ
      // tengan asignaturas. Sin este rescate, el primer add-subject escribía
      // solo la asignatura nueva y borraba silenciosamente las demás: el
      // alumno se quedaba con una sola y el selector le ofrecía volver a
      // añadir las que ya tenía.
      if (currentLabels.length === 0) {
        const { data: snapshot } = await db
          .from('billing_events')
          .select('payload')
          .eq('user_id', user.id)
          .eq('event_type', 'onboarding_completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
        const previas = (snapshot?.payload as { subjects?: unknown } | null)?.subjects
        if (Array.isArray(previas)) {
          currentLabels = previas.filter((s: unknown): s is string => typeof s === 'string')
        }
      }

      const label = subjectLabelFromSlug(subject)
      if (!currentLabels.includes(label)) {
        await db.from('perfiles').upsert({ id: user.id, subjects: [...currentLabels, label] }, { onConflict: 'id' })
      }
    } catch { /* non-critical: la cola/calendario ya quedó sembrada arriba */ }

    return NextResponse.json({ ok: true, alreadyExists: false })
  } catch (err) {
    console.error('[camino/add-subject]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
