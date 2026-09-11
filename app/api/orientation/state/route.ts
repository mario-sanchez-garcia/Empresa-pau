import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient, createUserClient, getAuthUser } from '@/app/lib/billing/supabase'
import { COMMUNITY_CONFIG } from '@/app/orientacion/community'
import { ORIENTATION_STATE_MAX_BYTES, parseOrientationState } from '@/app/orientacion/state'

export const dynamic = 'force-dynamic'

function bearer(request: NextRequest) {
  return request.headers.get('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1] ?? null
}

function missingColumn(error: { code?: string | null; message?: string | null } | null) {
  return Boolean(error && (error.code === '42703' || error.code === 'PGRST204') && /orientation_state/i.test(error.message ?? ''))
}

async function authenticated(request: NextRequest) {
  const token = bearer(request)
  if (!token) return null
  const auth = await getAuthUser(token)
  return auth?.data.user ? { token, user: auth.data.user } : null
}

async function explorationIsOfficial(state: NonNullable<ReturnType<typeof parseOrientationState>>) {
  const { degreeId, universityId, community } = state.exploration
  if (!degreeId && !universityId) return true
  if (!degreeId || !universityId) return false
  const db = createServiceClient()
  const [degree, university] = await Promise.all([
    db.from('orientation_degrees').select('id,university_id').eq('id', degreeId).eq('active', true).maybeSingle(),
    db.from('orientation_universities').select('id,community').eq('id', universityId).eq('active', true).maybeSingle(),
  ])
  return !degree.error && !university.error
    && degree.data?.university_id === universityId
    && university.data?.community === COMMUNITY_CONFIG[community].databaseValue
}

export async function GET(request: NextRequest) {
  const session = await authenticated(request)
  if (!session) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })
  const db = createUserClient(session.token)
  const { data, error } = await db.from('perfiles').select('orientation_state').eq('id', session.user.id).maybeSingle()
  if (missingColumn(error)) return NextResponse.json({ error: 'orientation-state-migration-required' }, { status: 503 })
  if (error) return NextResponse.json({ error: 'No se pudo cargar el estado de Orientación.' }, { status: 500 })
  const rawState = data?.orientation_state ?? null
  const state = rawState === null ? null : parseOrientationState(rawState)
  if (rawState !== null && !state) return NextResponse.json({ error: 'El estado guardado no es válido.' }, { status: 500 })
  return NextResponse.json({ state }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: NextRequest) {
  const session = await authenticated(request)
  if (!session) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })
  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > ORIENTATION_STATE_MAX_BYTES) return NextResponse.json({ error: 'Estado demasiado grande.' }, { status: 413 })

  let body: { state?: unknown; expectedUpdatedAt?: unknown }
  try { body = await request.json() as { state?: unknown; expectedUpdatedAt?: unknown } } catch { return NextResponse.json({ error: 'Datos no válidos.' }, { status: 400 }) }
  const parsed = parseOrientationState(body.state)
  if (!parsed) return NextResponse.json({ error: 'Estado de Orientación no válido.' }, { status: 400 })
  if (!await explorationIsOfficial(parsed)) return NextResponse.json({ error: 'El grado o la universidad no pertenecen al catálogo oficial indicado.' }, { status: 400 })
  const expectedUpdatedAt = body.expectedUpdatedAt
  if (expectedUpdatedAt !== null && (typeof expectedUpdatedAt !== 'string' || !Number.isFinite(Date.parse(expectedUpdatedAt)))) {
    return NextResponse.json({ error: 'Versión de estado no válida.' }, { status: 400 })
  }
  const state = { ...parsed, updatedAt: new Date().toISOString() }

  const db = createUserClient(session.token)
  let update = db.from('perfiles').update({ orientation_state: state }).eq('id', session.user.id)
  update = expectedUpdatedAt === null
    ? update.is('orientation_state', null)
    : update.filter('orientation_state->>updatedAt', 'eq', expectedUpdatedAt)
  const { data, error } = await update.select('orientation_state').maybeSingle()
  if (missingColumn(error)) return NextResponse.json({ error: 'orientation-state-migration-required' }, { status: 503 })
  if (error) return NextResponse.json({ error: 'No se pudo guardar el estado de Orientación.' }, { status: 500 })
  if (!data) {
    const { data: latest } = await db.from('perfiles').select('orientation_state').eq('id', session.user.id).maybeSingle()
    return NextResponse.json({ error: 'orientation-state-conflict', state: parseOrientationState(latest?.orientation_state) }, { status: 409 })
  }
  return NextResponse.json({ state }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(request: NextRequest) {
  const session = await authenticated(request)
  if (!session) return NextResponse.json({ error: 'Sesión no válida.' }, { status: 401 })
  const db = createUserClient(session.token)
  const { error } = await db.from('perfiles').update({ orientation_state: null }).eq('id', session.user.id)
  if (missingColumn(error)) return NextResponse.json({ error: 'orientation-state-migration-required' }, { status: 503 })
  if (error) return NextResponse.json({ error: 'No se pudo limpiar el estado de Orientación.' }, { status: 500 })
  return NextResponse.json({ state: null }, { headers: { 'Cache-Control': 'no-store' } })
}
