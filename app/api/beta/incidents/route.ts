import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { parseIncidentReport } from '@/app/lib/beta/incidentInput'

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  const body = parseIncidentReport(await request.json().catch(() => null))
  if (!body) return NextResponse.json({ error: 'Describe el problema con entre 10 y 1500 caracteres.' }, { status: 400 })
  try {
    const db = createServiceClient()
    const { count, error: countError } = await db.from('beta_incidents').select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.id).eq('source', 'student').gte('created_at', new Date(Date.now()-3600000).toISOString())
    if (countError) throw countError
    if ((count ?? 0) >= 10) return NextResponse.json({ error: 'Ya hemos recibido tus avisos. Espera un rato antes de enviar otro.' }, { status: 429 })
    const fingerprint = createHash('sha256').update(`${auth.user.id}:${body.requestId}`).digest('hex')
    const { data: id, error } = await db.rpc('record_beta_incident', { p_user_id: auth.user.id, p_source: 'student',
      p_code: body.category, p_route: body.route, p_description: body.description,
      p_severity: body.blocking ? 'blocking' : 'normal', p_fingerprint: fingerprint })
    if (error) throw error
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ error: 'No se ha podido guardar el aviso. Tu texto sigue aquí para reintentarlo.' }, { status: 503 })
  }
}
