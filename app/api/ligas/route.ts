import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getXpByUserInRange, currentWeekRange, MAX_LIGAS_PER_USER } from '@/app/lib/camino/leagueRounds'
import { resolveDisplayNames } from '@/app/lib/camino/rankingNames'

export const dynamic = 'force-dynamic'

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

async function buildLigaPayload(db: NonNullable<ReturnType<typeof createServiceSupabase>>, ligaRow: { id: string; codigo: string; nombre: string }, currentUserId: string) {
  const { data: members } = await db.from('liga_miembros').select('user_id').eq('liga_id', ligaRow.id)
  const memberIds = (members ?? []).map(m => m.user_id as string)

  // Fetch weekly XP and total XP in parallel
  const [xpByUser, progressResult] = await Promise.all([
    getXpByUserInRange(db, currentWeekRange(), memberIds),
    db.from('camino_user_progress').select('user_id, xp_total').in('user_id', memberIds),
  ])

  const totalXpByUser = new Map<string, number>()
  for (const row of progressResult.data ?? []) {
    totalXpByUser.set(row.user_id as string, Number(row.xp_total ?? 0))
  }

  const nameById = await resolveDisplayNames(db, memberIds, currentUserId)

  const miembros = memberIds.map(uid => ({
    user_id: uid,
    name: nameById.get(uid) ?? 'Alumno Kairo',
    weekly_xp: xpByUser.get(uid) ?? 0,
    total_xp: totalXpByUser.get(uid) ?? 0,
  }))

  return { id: ligaRow.id, codigo: ligaRow.codigo, nombre: ligaRow.nombre, miembros }
}

// Todas las ligas a las que pertenece el usuario, con su ranking de
// miembros ya calculado — usado tanto por GET como por el POST de creación
// (que devuelve la lista completa actualizada, no solo la liga nueva, para
// que el cliente pueda pintar directamente sin un segundo fetch).
async function buildAllLigasPayload(db: NonNullable<ReturnType<typeof createServiceSupabase>>, userId: string) {
  const { data: memberships } = await db
    .from('liga_miembros')
    .select('liga_id, ligas(id, codigo, nombre)')
    .eq('user_id', userId)

  const ligaRows = (memberships ?? [])
    .map(m => m.ligas as unknown as { id: string; codigo: string; nombre: string } | null)
    .filter((l): l is { id: string; codigo: string; nombre: string } => l !== null)

  return Promise.all(ligaRows.map(ligaRow => buildLigaPayload(db, ligaRow, userId)))
}

// GET — devuelve TODAS las ligas del usuario actual (hasta MAX_LIGAS_PER_USER)
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ ligas: [] })

  const ligas = await buildAllLigasPayload(db, user.id)
  return NextResponse.json({ ligas })
}

// POST — crear una liga nueva (hasta un máximo de MAX_LIGAS_PER_USER por alumno)
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let body: Record<string, unknown>
  try { body = await request.json() } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre.trim().slice(0, 40) : ''
  if (!nombre) return NextResponse.json({ error: 'Nombre requerido' }, { status: 400 })

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Servicio no disponible' }, { status: 500 })

  const { count: existingCount } = await db
    .from('liga_miembros')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((existingCount ?? 0) >= MAX_LIGAS_PER_USER) {
    return NextResponse.json({ error: `Ya perteneces al máximo de ${MAX_LIGAS_PER_USER} ligas` }, { status: 409 })
  }

  let codigo = generateCode()
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: taken } = await db.from('ligas').select('id').eq('codigo', codigo).maybeSingle()
    if (!taken) break
    codigo = generateCode()
  }

  const { data: ligaRow, error } = await db
    .from('ligas')
    .insert({ codigo, nombre, creador_user_id: user.id })
    .select('id, codigo, nombre')
    .single()

  if (error || !ligaRow) return NextResponse.json({ error: 'Error al crear liga' }, { status: 500 })

  await db.from('liga_miembros').insert({ liga_id: ligaRow.id, user_id: user.id })

  const ligas = await buildAllLigasPayload(db, user.id)
  return NextResponse.json({ ligas })
}
