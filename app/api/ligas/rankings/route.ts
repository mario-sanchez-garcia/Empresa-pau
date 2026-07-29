import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { currentRoundRange, ETAPA_MEDAL_WEIGHTS, scopeKeyForComunidadMateria, type Medal } from '@/app/lib/camino/leagueRounds'

export const dynamic = 'force-dynamic'

type Scope = 'personal' | 'comunidad_materia' | 'global'
type Mode = 'ronda' | 'etapas' | 'xp_total'

type MedalTally = { oro: number; plata: number; bronce: number }
type Entry = { id: string; name: string; score: number; rank: number; isCurrentUser: boolean; medals?: MedalTally }

// Misma anonimización que /api/camino/leaderboard — IDs públicos hasheados
// para los ámbitos que abarcan a todos los usuarios (comunidad+materia/global).
function publicId(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16)
}

function safeName(value: unknown): string {
  if (typeof value !== 'string') return ''
  const cleaned = value.trim().replace(/\s+/g, ' ').slice(0, 32)
  if (!cleaned || cleaned.includes('@')) return ''
  return cleaned
}

// Nombre real del alumno — mismo criterio en cascada que /api/ligas:
// perfiles.display_name/nombre primero, y si el alumno nunca los rellenó
// (display_name es opt-in en Ajustes), el nombre de usuario de su email
// (antes de la @), igual que ya hace buildLigaPayload en
// app/api/ligas/route.ts. "Alumno PAU" queda solo como último recurso si
// ni siquiera hay email accesible.
async function getNameMap(db: SupabaseClient, userIds: string[]): Promise<Map<string, string>> {
  if (!userIds.length) return new Map()
  const { data } = await db.from('perfiles').select('id, display_name, nombre').in('id', userIds)
  const names = new Map<string, string>()
  for (const row of data ?? []) {
    const name = safeName(row.display_name) || safeName(row.nombre)
    if (name) names.set(row.id as string, name)
  }

  const missingIds = userIds.filter(id => !names.has(id))
  for (const id of missingIds) {
    const { data: authData } = await db.auth.admin.getUserById(id)
    const email = authData?.user?.email
    if (email) names.set(id, email.split('@')[0])
  }

  return names
}

function rankEntries(
  scores: Map<string, number>,
  currentUserId: string,
  nameFor: (userId: string) => string,
  anonymize: boolean,
): Entry[] {
  // Se muestran también los que están a 0 — el alumno quiere ver la
  // clasificación completa (incluida la suya) aunque todavía no tenga XP.
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([userId, score], index) => {
      const isCurrentUser = userId === currentUserId
      return {
        id: isCurrentUser ? 'me' : anonymize ? publicId(userId) : userId,
        name: isCurrentUser ? 'Tú' : (nameFor(userId) || 'Alumno PAU'),
        score,
        rank: index + 1,
        isCurrentUser,
      }
    })
}

function sumByUser(rows: Array<{ user_id: string; xp_amount?: number; xp_total?: number }>): Map<string, number> {
  const byUser = new Map<string, number>()
  for (const row of rows) {
    const amount = Number(row.xp_amount ?? row.xp_total ?? 0)
    byUser.set(row.user_id, (byUser.get(row.user_id) ?? 0) + amount)
  }
  return byUser
}

// "Etapas" es un ranking por medallas históricas (ganadores de ronda), no
// por XP — cada fila lleva su propio conteo oro/plata/bronce en vez de un
// número de XP. `weighted` (oro>plata>bronce) solo se usa para ordenar.
function rankEtapasEntries(
  tally: Map<string, MedalTally>,
  currentUserId: string,
  nameFor: (userId: string) => string,
  anonymize: boolean,
): Entry[] {
  const weighted = (m: MedalTally) => m.oro * ETAPA_MEDAL_WEIGHTS.oro + m.plata * ETAPA_MEDAL_WEIGHTS.plata + m.bronce * ETAPA_MEDAL_WEIGHTS.bronce
  return Array.from(tally.entries())
    .sort((a, b) => weighted(b[1]) - weighted(a[1]) || b[1].oro - a[1].oro || b[1].plata - a[1].plata)
    .map(([userId, medals], index) => {
      const isCurrentUser = userId === currentUserId
      return {
        id: isCurrentUser ? 'me' : anonymize ? publicId(userId) : userId,
        name: isCurrentUser ? 'Tú' : (nameFor(userId) || 'Alumno PAU'),
        score: weighted(medals),
        medals,
        rank: index + 1,
        isCurrentUser,
      }
    })
}

// Recuento de medallas por usuario en rondas cerradas de un scope_type,
// restringido (opcionalmente) a un scope_key concreto (una liga, o una
// comunidad+materia concreta).
async function getEtapasTally(db: SupabaseClient, scopeType: Scope, scopeKey?: string): Promise<Map<string, MedalTally>> {
  let rondasQuery = db.from('ligas_rondas').select('id').eq('scope_type', scopeType)
  if (scopeKey) rondasQuery = rondasQuery.eq('scope_key', scopeKey)
  const { data: rondas } = await rondasQuery
  const rondaIds = (rondas ?? []).map(r => r.id as string)
  if (!rondaIds.length) return new Map()

  const { data: resultados } = await db
    .from('ligas_rondas_resultados')
    .select('user_id, medalla')
    .in('ronda_id', rondaIds)

  const tally = new Map<string, MedalTally>()
  for (const row of resultados ?? []) {
    const medalla = row.medalla as Medal | null
    if (!medalla) continue
    const current = tally.get(row.user_id as string) ?? { oro: 0, plata: 0, bronce: 0 }
    current[medalla] += 1
    tally.set(row.user_id as string, current)
  }
  return tally
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const scope = (request.nextUrl.searchParams.get('scope') ?? 'global') as Scope
  const mode = (request.nextUrl.searchParams.get('mode') ?? 'ronda') as Mode
  const requestedSubject = request.nextUrl.searchParams.get('subject')

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects: [] })

  // ---------------------------------------------------------------
  // Personal — ranking dentro de la liga del usuario (nombres reales,
  // mismo criterio de privacidad que /api/ligas: RLS ya limita el acceso
  // a miembros de la misma liga).
  // ---------------------------------------------------------------
  if (scope === 'personal') {
    const { data: membership } = await db
      .from('liga_miembros')
      .select('liga_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) return NextResponse.json({ entries: [], currentUserId: user.id, error: 'not_in_liga' })
    const ligaId = membership.liga_id as string

    const { data: miembros } = await db.from('liga_miembros').select('user_id').eq('liga_id', ligaId)
    const memberIds = (miembros ?? []).map(m => m.user_id as string)
    const names = await getNameMap(db, memberIds)

    if (mode === 'etapas') {
      const tally = await getEtapasTally(db, 'personal', ligaId)
      // Todos los miembros parten de 0 medallas — así se ven en la
      // clasificación aunque todavía no hayan ganado ninguna ronda.
      const medals = new Map<string, MedalTally>(memberIds.map(id => [id, tally.get(id) ?? { oro: 0, plata: 0, bronce: 0 }]))
      return NextResponse.json({
        entries: rankEtapasEntries(medals, user.id, id => names.get(id) ?? '', false),
        currentUserId: user.id,
      })
    }

    // Todos los miembros parten de 0 XP — así se ven en la clasificación
    // aunque todavía no tengan XP registrado.
    const scores = new Map<string, number>(memberIds.map(id => [id, 0]))
    if (mode === 'ronda') {
      const { start, end } = currentRoundRange()
      const { data: xpRows } = await db
        .from('camino_xp_events')
        .select('user_id, xp_amount')
        .in('user_id', memberIds)
        .gte('mission_date', start)
        .lte('mission_date', end)
      for (const [id, xp] of sumByUser((xpRows ?? []) as Array<{ user_id: string; xp_amount: number }>)) scores.set(id, xp)
    } else {
      const { data: progressRows } = await db.from('camino_user_progress').select('user_id, xp_total').in('user_id', memberIds)
      for (const [id, xp] of sumByUser((progressRows ?? []) as Array<{ user_id: string; xp_total: number }>)) scores.set(id, xp)
    }

    return NextResponse.json({
      entries: rankEntries(scores, user.id, id => names.get(id) ?? '', false),
      currentUserId: user.id,
    })
  }

  // ---------------------------------------------------------------
  // Comunidad + Materia — requiere subject; una liga por asignatura.
  // ---------------------------------------------------------------
  if (scope === 'comunidad_materia') {
    const { data: subjectRows } = await db.from('camino_subject_xp').select('subject').eq('user_id', user.id)
    const availableSubjects = Array.from(new Set((subjectRows ?? []).map(r => r.subject as string)))

    if (!requestedSubject) {
      return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects })
    }

    const { data: ownProfile } = await db.from('perfiles').select('comunidad').eq('id', user.id).maybeSingle()
    const comunidad = ownProfile?.comunidad as string | undefined
    if (!comunidad) {
      return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects, error: 'no_comunidad' })
    }

    const scopeKey = scopeKeyForComunidadMateria(comunidad, requestedSubject)

    if (mode === 'etapas') {
      const tally = await getEtapasTally(db, 'comunidad_materia', scopeKey)
      const names = await getNameMap(db, Array.from(tally.keys()))
      return NextResponse.json({
        entries: rankEtapasEntries(tally, user.id, id => names.get(id) ?? '', true),
        currentUserId: user.id,
        availableSubjects,
        comunidad,
        subject: requestedSubject,
      })
    }

    let scores = new Map<string, number>()
    if (mode === 'xp_total') {
      const { data: subjectXpRows } = await db.from('camino_subject_xp').select('user_id, xp_total').eq('subject', requestedSubject).limit(2000)
      const candidateIds = (subjectXpRows ?? []).map(r => r.user_id as string)
      const { data: perfilesRows } = candidateIds.length
        ? await db.from('perfiles').select('id, comunidad').in('id', candidateIds)
        : { data: [] }
      const sameComunidad = new Set((perfilesRows ?? []).filter(p => p.comunidad === comunidad).map(p => p.id as string))
      for (const row of subjectXpRows ?? []) {
        if (sameComunidad.has(row.user_id as string)) scores.set(row.user_id as string, Number(row.xp_total ?? 0))
      }
    } else {
      const { start, end } = currentRoundRange()
      const { data: xpRows } = await db
        .from('camino_xp_events')
        .select('user_id, xp_amount')
        .eq('subject', requestedSubject)
        .gte('mission_date', start)
        .lte('mission_date', end)
        .limit(10_000)
      const candidateIds = Array.from(new Set((xpRows ?? []).map(r => r.user_id as string)))
      const { data: perfilesRows } = candidateIds.length
        ? await db.from('perfiles').select('id, comunidad').in('id', candidateIds)
        : { data: [] }
      const sameComunidad = new Set((perfilesRows ?? []).filter(p => p.comunidad === comunidad).map(p => p.id as string))
      const filtered = (xpRows ?? []).filter(row => sameComunidad.has(row.user_id as string)) as Array<{ user_id: string; xp_amount: number }>
      scores = sumByUser(filtered)
    }

    const names = await getNameMap(db, Array.from(scores.keys()))
    return NextResponse.json({
      entries: rankEntries(scores, user.id, id => names.get(id) ?? '', true),
      currentUserId: user.id,
      availableSubjects,
      comunidad,
      subject: requestedSubject,
    })
  }

  // ---------------------------------------------------------------
  // Global — todos los alumnos, sin filtrar.
  // ---------------------------------------------------------------
  if (mode === 'etapas') {
    const tally = await getEtapasTally(db, 'global', 'global')
    const names = await getNameMap(db, Array.from(tally.keys()))
    return NextResponse.json({
      entries: rankEtapasEntries(tally, user.id, id => names.get(id) ?? '', true),
      currentUserId: user.id,
    })
  }

  let scores = new Map<string, number>()
  if (mode === 'ronda') {
    const { start, end } = currentRoundRange()
    const { data: xpRows } = await db
      .from('camino_xp_events')
      .select('user_id, xp_amount')
      .gte('mission_date', start)
      .lte('mission_date', end)
      .limit(50_000)
    scores = sumByUser((xpRows ?? []) as Array<{ user_id: string; xp_amount: number }>)
  } else {
    const { data: progressRows } = await db
      .from('camino_user_progress')
      .select('user_id, xp_total')
      .order('xp_total', { ascending: false })
      .limit(500)
    scores = sumByUser((progressRows ?? []) as Array<{ user_id: string; xp_total: number }>)
  }

  const names = await getNameMap(db, Array.from(scores.keys()))
  return NextResponse.json({
    entries: rankEntries(scores, user.id, id => names.get(id) ?? '', true),
    currentUserId: user.id,
  })
}
