import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { getXpByUserInRange, currentWeekRange } from '@/app/lib/camino/leagueRounds'

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

  const { data: profiles } = await db.from('perfiles').select('id, username').in('id', memberIds)
  const nameById = new Map<string, string>()
  for (const p of profiles ?? []) {
    const name = (p.username as string | null)?.trim() ?? ''
    if (name) nameById.set(p.id as string, name)
  }

  const miembros = memberIds.map(uid => ({
    user_id: uid,
    name: uid === currentUserId ? 'Tú' : (nameById.get(uid) || 'Alumno Kairo'),
    weekly_xp: xpByUser.get(uid) ?? 0,
    total_xp: totalXpByUser.get(uid) ?? 0,
  }))

  return { id: ligaRow.id, codigo: ligaRow.codigo, nombre: ligaRow.nombre, miembros }
}

// GET — devuelve la liga del usuario actual (o null si no tiene)
export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ liga: null })

  const { data: membership } = await db
    .from('liga_miembros')
    .select('liga_id, ligas(id, codigo, nombre)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!membership) return NextResponse.json({ liga: null })

  const ligaRow = membership.ligas as unknown as { id: string; codigo: string; nombre: string } | null
  if (!ligaRow) return NextResponse.json({ liga: null })

  const liga = await buildLigaPayload(db, ligaRow, user.id)
  return NextResponse.json({ liga })
}

// POST — crear una liga nueva
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

  const { data: existing } = await db.from('liga_miembros').select('liga_id').eq('user_id', user.id).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Ya perteneces a una liga' }, { status: 409 })

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

  const liga = await buildLigaPayload(db, ligaRow as { id: string; codigo: string; nombre: string }, user.id)
  return NextResponse.json({ liga })
}
