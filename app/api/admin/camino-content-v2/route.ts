import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

// Fuente de datos real de /admin/camino-preview. curriculum_content_v2 tiene
// RLS que ya bloquea filas review_status='draft' para el rol 'authenticated'
// (ver migración 20260829150000) — esta ruta usa el service role a
// propósito, para que el equipo interno pueda seguir revisando borradores
// (p.ej. Matemáticas CCSS) sin exponerlos al cliente Supabase del navegador.

function getBearerToken(request: NextRequest): string | null {
  const authorization = request.headers.get('authorization') ?? ''
  const match = authorization.match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

export type CaminoContentV2Row = {
  sort_order: number
  title: string
  block_key: string
  block_slug: string
  subject: string
  video_id: string | null
  concept_markdown: string | null
  worked_example_markdown: string | null
  practice_prompt: string | null
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!isInternalUser(userData.user.email)) return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })

  const subject = request.nextUrl.searchParams.get('subject')?.trim()
  if (!subject) return NextResponse.json({ error: 'Falta subject.' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('curriculum_content_v2')
    .select('sort_order, title, block_key, block_slug, subject, video_id, concept_markdown, worked_example_markdown, practice_prompt')
    .eq('subject', subject)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ rows: (data ?? []) as CaminoContentV2Row[] })
}
