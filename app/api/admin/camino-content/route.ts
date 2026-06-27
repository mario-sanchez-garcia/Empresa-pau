import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isInternalUser } from '@/app/lib/internalUsers'

export const dynamic = 'force-dynamic'

export interface CurriculumRow {
  subject: string
  block_slug: string
  topic_slug: string
  char_count: number
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_KEY
  if (!url || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const accessToken = getBearerToken(request)
  if (!accessToken) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  if (!isInternalUser(userData.user.email)) {
    return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
  }

  const serviceSupabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
  const { data, error } = await serviceSupabase
    .from('curriculum_content')
    .select('subject, block_slug, topic_slug, content_markdown')
    .order('block_slug')
    .order('topic_slug')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows: CurriculumRow[] = (data ?? []).map(row => ({
    subject: row.subject,
    block_slug: row.block_slug,
    topic_slug: row.topic_slug,
    char_count: (row.content_markdown ?? '').length,
  }))

  return NextResponse.json(rows)
}

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}
