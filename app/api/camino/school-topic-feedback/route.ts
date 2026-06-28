import { NextRequest, NextResponse } from 'next/server'
import { createServiceSupabase, createUserSupabase, getAuthContext } from '@/app/lib/camino/caminoProgressServer'

export const dynamic = 'force-dynamic'

type FeedbackBody = {
  schoolName?: string | null
  community?: string | null
  subject?: string
  blockSlug?: string | null
  topicSlug?: string
  feedbackType?: string
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response

  let body: FeedbackBody
  try {
    body = await request.json() as FeedbackBody
  } catch {
    return NextResponse.json({ error: 'JSON invalido' }, { status: 400 })
  }

  const subject = cleanText(body.subject)
  const topicSlug = cleanText(body.topicSlug)
  const blockSlug = cleanText(body.blockSlug) || null
  const schoolName = cleanText(body.schoolName) || null
  const community = cleanText(body.community) || null

  if (!subject || !topicSlug || body.feedbackType !== 'not_seen_in_class') {
    return NextResponse.json({ error: 'Feedback incompleto' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const service = createServiceSupabase()
  const db = service ?? createUserSupabase(auth.accessToken)

  const { error: insertError } = await db.from('school_topic_feedback').insert({
    user_id: auth.user.id,
    school_name: schoolName,
    community,
    subject,
    block_slug: blockSlug,
    topic_slug: topicSlug,
    reason: 'not_seen_in_class',
  })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  if (!service || !schoolName) {
    return NextResponse.json({ status: 'not_seen', notSeenCount: 1 })
  }

  const countQuery = service
    .from('school_topic_feedback')
    .select('id', { count: 'exact', head: true })
    .eq('school_name', schoolName)
    .eq('subject', subject)
    .eq('topic_slug', topicSlug)
    .eq('reason', 'not_seen_in_class')
  const { count } = blockSlug
    ? await countQuery.eq('block_slug', blockSlug)
    : await countQuery.is('block_slug', null)

  const notSeenCount = count ?? 1
  const status = notSeenCount >= 2 ? 'delayed_for_school' : 'not_seen'

  const { error: statusError } = await service
    .from('school_topic_status')
    .upsert({
      school_name: schoolName,
      community,
      subject,
      block_slug: blockSlug,
      topic_slug: topicSlug,
      status,
      not_seen_count: notSeenCount,
      updated_at: now,
    }, { onConflict: 'school_name,subject,block_slug,topic_slug' })

  if (statusError) {
    return NextResponse.json({ status, notSeenCount, warning: statusError.message })
  }

  return NextResponse.json({ status, notSeenCount })
}
