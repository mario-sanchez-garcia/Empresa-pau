import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import {
  currentDayRange,
  currentRoundRange,
  currentWeekRange,
  ETAPA_MEDAL_WEIGHTS,
  getCurrentRoundXpByUser,
  getXpByUserInRange,
  scopeKeyForComunidadMateria,
  scopeKeyPrefixForComunidad,
  type Medal,
} from '@/app/lib/camino/leagueRounds'
import { PRIVATE_BETA_SUBJECTS } from '@/app/lib/camino/betaCurriculum'
import { subjectLabelFromSlug } from '@/app/lib/camino/caminoCurriculumPlan'

export const dynamic = 'force-dynamic'

type Scope = 'personal' | 'comunidad_materia' | 'global'
type Mode = 'ronda' | 'etapas' | 'xp_total' | 'top' | 'historial'
type Period = 'day' | 'week' | 'month'

// Sentinel para "todas las asignaturas" — selector de materia compartido
// por los tres ámbitos (Personal/Comunidad/Global). El ámbito decide
// contra quién compites; la materia (o "todas") decide qué XP cuenta —
// son ejes independientes. Etapas no se ve afectado por este selector en
// Personal/Global: las medallas de ronda no se desglosan por materia ahí
// (solo Comunidad+Materia las tiene, vía su scope_key).
const ALL_SUBJECTS = '__all__'

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

// Lista fija de asignaturas activas (misma fuente que onboarding/Camino:
// PRIVATE_BETA_SUBJECTS) — antes se derivaba de camino_subject_xp, así que
// un alumno solo veía las materias en las que ya tenía XP registrado (las
// demás, aunque estuviera inscrito, no aparecían en el selector).
function getAvailableSubjects(): Array<{ id: string; label: string }> {
  return PRIVATE_BETA_SUBJECTS.map(id => ({ id, label: subjectLabelFromSlug(id) }))
}

// XP de un conjunto de alumnos para el modo "ronda" (mes en curso),
// opcionalmente restringido a una materia. `memberIds: null` = sin
// restringir usuarios (ámbito Global); `subject: null` = todas las
// materias combinadas. Delega en el helper compartido con /api/ligas y
// /api/ligas/[codigo] para que los tres usen siempre el mismo cálculo.
async function getRondaScores(db: SupabaseClient, memberIds: string[] | null, subject: string | null): Promise<Map<string, number>> {
  return getCurrentRoundXpByUser(db, memberIds, subject)
}

// XP de un conjunto de alumnos para el modo "top" — mismo cálculo que
// "ronda" pero con un rango de fechas elegido por el alumno (hoy / esta
// semana / este mes) en vez de fijo al mes natural.
function rangeForPeriod(period: Period): { start: string; end: string } {
  if (period === 'day') return currentDayRange()
  if (period === 'week') return currentWeekRange()
  return currentRoundRange()
}

async function getTopScores(db: SupabaseClient, period: Period, memberIds: string[] | null, subject: string | null): Promise<Map<string, number>> {
  return getXpByUserInRange(db, rangeForPeriod(period), memberIds, subject)
}

// Días que quedan para el cierre de la ronda (mes) en curso — se muestra
// junto al modo "Ronda actual".
function daysRemainingInRound(): number {
  const { end } = currentRoundRange()
  const endOfDay = new Date(`${end}T23:59:59.999Z`).getTime()
  return Math.max(0, Math.ceil((endOfDay - Date.now()) / 86_400_000))
}

// Puesto del alumno en la última ronda YA CERRADA de este mismo ámbito —
// permite mostrar la flecha de subida/bajada respecto al mes anterior.
// Solo tiene sentido cuando hay una scope_key concreta y única (personal,
// global, o comunidad+materia con una materia elegida) — con "todas las
// asignaturas" en Comunidad hay varias rondas (una por materia) y no hay
// una única posición previa que comparar, así que se omite (null).
async function getPreviousRoundRank(db: SupabaseClient, userId: string, scopeType: Scope, scopeKey: string): Promise<number | null> {
  const { data: ronda } = await db
    .from('ligas_rondas')
    .select('id')
    .eq('scope_type', scopeType)
    .eq('scope_key', scopeKey)
    .order('period_start', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!ronda) return null

  const { data: resultado } = await db
    .from('ligas_rondas_resultados')
    .select('rank')
    .eq('ronda_id', ronda.id)
    .eq('user_id', userId)
    .maybeSingle()
  return typeof resultado?.rank === 'number' ? resultado.rank : null
}

type HistorialItem = {
  periodStart: string
  periodEnd: string
  participated: boolean
  rank: number | null
  medalla: Medal | null
  roundXp: number | null
  subjectLabel?: string
}

// Historial de rondas ya cerradas para el alumno actual, en un scope_type
// dado — una fila por ronda cerrada que existe para ese scope_key (exacto,
// o todas las que empiecen por un prefijo — comunidad, todas las materias).
// Si el alumno no tiene resultado en esa ronda (no participó, o se unió
// después de que cerrara) se devuelve igualmente con participated: false,
// para que quede claro que la ronda existió pero no compitió en ella.
async function getRondaHistorial(
  db: SupabaseClient,
  userId: string,
  scopeType: Scope,
  scopeKey: { exact: string } | { prefix: string },
  limit = 12,
): Promise<HistorialItem[]> {
  let rondasQuery = db.from('ligas_rondas').select('id, scope_key, period_start, period_end').eq('scope_type', scopeType)
  rondasQuery = 'exact' in scopeKey ? rondasQuery.eq('scope_key', scopeKey.exact) : rondasQuery.like('scope_key', `${scopeKey.prefix}%`)
  rondasQuery = rondasQuery.order('period_start', { ascending: false }).limit(limit)
  const { data: rondas } = await rondasQuery
  if (!rondas?.length) return []

  const rondaIds = rondas.map(r => r.id as string)
  const { data: resultados } = await db
    .from('ligas_rondas_resultados')
    .select('ronda_id, rank, medalla, round_xp')
    .eq('user_id', userId)
    .in('ronda_id', rondaIds)

  const byRonda = new Map((resultados ?? []).map(r => [r.ronda_id as string, r]))

  return rondas
    .map(r => {
      const res = byRonda.get(r.id as string)
      const scopeKeyValue = r.scope_key as string
      const subjectLabel = scopeType === 'comunidad_materia'
        ? subjectLabelFromSlug(scopeKeyValue.split(':').slice(1).join(':'))
        : undefined
      return {
        periodStart: r.period_start as string,
        periodEnd: r.period_end as string,
        participated: Boolean(res),
        rank: typeof res?.rank === 'number' ? res.rank : null,
        medalla: (res?.medalla as Medal | null | undefined) ?? null,
        roundXp: typeof res?.round_xp === 'number' ? res.round_xp : null,
        subjectLabel,
      }
    })
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart))
}

// XP histórico total para el modo "xp_total", opcionalmente restringido a
// una materia. `camino_user_progress` es el total cruzado de materias;
// `camino_subject_xp` es el rollup por materia — misma fuente de XP por
// alumno en ambos casos (esto no cambia), solo cambia si se agrega todo
// o se filtra a una sola.
async function getXpTotalScores(db: SupabaseClient, memberIds: string[] | null, subject: string | null): Promise<Map<string, number>> {
  if (subject) {
    let query = db.from('camino_subject_xp').select('user_id, xp_total').eq('subject', subject)
    query = memberIds ? query.in('user_id', memberIds) : query.limit(500)
    const { data } = await query
    return sumByUser((data ?? []) as Array<{ user_id: string; xp_total: number }>)
  }
  let query = db.from('camino_user_progress').select('user_id, xp_total')
  query = memberIds ? query.in('user_id', memberIds) : query.order('xp_total', { ascending: false }).limit(500)
  const { data } = await query
  return sumByUser((data ?? []) as Array<{ user_id: string; xp_total: number }>)
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
// filtrado por scope_key exacto (una liga, o una comunidad+materia
// concreta) o por prefijo (todas las materias de una misma comunidad,
// para el modo "todas las asignaturas").
async function getEtapasTally(
  db: SupabaseClient,
  scopeType: Scope,
  scopeKey: { exact: string } | { prefix: string },
): Promise<Map<string, MedalTally>> {
  let rondasQuery = db.from('ligas_rondas').select('id').eq('scope_type', scopeType)
  rondasQuery = 'exact' in scopeKey ? rondasQuery.eq('scope_key', scopeKey.exact) : rondasQuery.like('scope_key', `${scopeKey.prefix}%`)
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

// mode "ronda" y "top" comparten forma (lista de XP por rango de fechas),
// solo cambia qué rango se usa — este helper centraliza esa elección para
// no repetirla en cada ámbito.
async function getScoresForMode(
  db: SupabaseClient,
  mode: Mode,
  period: Period,
  memberIds: string[] | null,
  subject: string | null,
): Promise<Map<string, number>> {
  if (mode === 'top') return getTopScores(db, period, memberIds, subject)
  if (mode === 'xp_total') return getXpTotalScores(db, memberIds, subject)
  return getRondaScores(db, memberIds, subject)
}

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  const scope = (request.nextUrl.searchParams.get('scope') ?? 'global') as Scope
  const mode = (request.nextUrl.searchParams.get('mode') ?? 'ronda') as Mode
  const period = (request.nextUrl.searchParams.get('period') ?? 'month') as Period
  const requestedSubject = request.nextUrl.searchParams.get('subject')
  const subject = requestedSubject && requestedSubject !== ALL_SUBJECTS ? requestedSubject : null

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects: [] })

  const availableSubjects = getAvailableSubjects()
  // Solo relevante para "Ronda actual" — Top e Historial ya llevan su
  // propio eje temporal (periodo elegido / lista de rondas pasadas).
  const roundExtras = mode === 'ronda' ? { daysRemaining: daysRemainingInRound() } : {}

  // ---------------------------------------------------------------
  // Personal — ranking dentro de la liga del usuario (nombres reales,
  // mismo criterio de privacidad que /api/ligas: RLS ya limita el acceso
  // a miembros de la misma liga). El selector de materia filtra el XP
  // pero no cambia el conjunto de gente (siempre tu liga).
  // ---------------------------------------------------------------
  if (scope === 'personal') {
    const { data: membership } = await db
      .from('liga_miembros')
      .select('liga_id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!membership) return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects, error: 'not_in_liga' })
    const ligaId = membership.liga_id as string

    if (mode === 'historial') {
      const history = await getRondaHistorial(db, user.id, 'personal', { exact: ligaId })
      return NextResponse.json({ history, currentUserId: user.id, availableSubjects })
    }

    const { data: miembros } = await db.from('liga_miembros').select('user_id').eq('liga_id', ligaId)
    const memberIds = (miembros ?? []).map(m => m.user_id as string)
    const names = await getNameMap(db, memberIds)

    if (mode === 'etapas') {
      const tally = await getEtapasTally(db, 'personal', { exact: ligaId })
      // Todos los miembros parten de 0 medallas — así se ven en la
      // clasificación aunque todavía no hayan ganado ninguna ronda.
      const medals = new Map<string, MedalTally>(memberIds.map(id => [id, tally.get(id) ?? { oro: 0, plata: 0, bronce: 0 }]))
      return NextResponse.json({
        entries: rankEtapasEntries(medals, user.id, id => names.get(id) ?? '', false),
        currentUserId: user.id,
        availableSubjects,
      })
    }

    // Todos los miembros parten de 0 XP — así se ven en la clasificación
    // aunque todavía no tengan XP registrado (en esta materia o en total).
    const scores = new Map<string, number>(memberIds.map(id => [id, 0]))
    const fetched = await getScoresForMode(db, mode, period, memberIds, subject)
    for (const [id, xp] of fetched) scores.set(id, xp)

    const previousRank = mode === 'ronda' ? await getPreviousRoundRank(db, user.id, 'personal', ligaId) : null

    return NextResponse.json({
      entries: rankEntries(scores, user.id, id => names.get(id) ?? '', false),
      currentUserId: user.id,
      availableSubjects,
      previousRank,
      ...roundExtras,
    })
  }

  // ---------------------------------------------------------------
  // Comunidad — te compara con alumnos de tu misma comunidad autónoma.
  // La materia (o "todas las asignaturas") decide qué XP cuenta, pero
  // el conjunto de gente (memberIds) es siempre el mismo: tu comunidad.
  // Antes esto solo se resolvía cuando había subject y usaba una query
  // distinta a Global (`camino_subject_xp` filtrado a mano) — ahora
  // ambos ámbitos comparten los mismos helpers (getRondaScores /
  // getXpTotalScores), y lo único que cambia entre ellos es qué
  // memberIds se pasan: aquí siempre la comunidad, en Global ninguno.
  // ---------------------------------------------------------------
  if (scope === 'comunidad_materia') {
    const { data: ownProfile } = await db.from('perfiles').select('comunidad').eq('id', user.id).maybeSingle()
    const comunidad = ownProfile?.comunidad as string | undefined
    if (!comunidad) {
      return NextResponse.json({ entries: [], currentUserId: user.id, availableSubjects, error: 'no_comunidad' })
    }

    if (mode === 'historial') {
      const history = subject
        ? await getRondaHistorial(db, user.id, 'comunidad_materia', { exact: scopeKeyForComunidadMateria(comunidad, subject) })
        : await getRondaHistorial(db, user.id, 'comunidad_materia', { prefix: scopeKeyPrefixForComunidad(comunidad) })
      return NextResponse.json({ history, currentUserId: user.id, availableSubjects, comunidad })
    }

    const { data: comunidadProfiles } = await db.from('perfiles').select('id').eq('comunidad', comunidad).limit(5000)
    const memberIds = Array.from(new Set([...(comunidadProfiles ?? []).map(p => p.id as string), user.id]))

    if (mode === 'etapas') {
      // Por materia concreta usa el scope_key exacto (comunidad:materia);
      // "todas las asignaturas" agrega medallas de todas las rondas
      // comunidad+materia de esa comunidad por prefijo.
      const tally = subject
        ? await getEtapasTally(db, 'comunidad_materia', { exact: scopeKeyForComunidadMateria(comunidad, subject) })
        : await getEtapasTally(db, 'comunidad_materia', { prefix: scopeKeyPrefixForComunidad(comunidad) })
      const names = await getNameMap(db, Array.from(tally.keys()))
      return NextResponse.json({
        entries: rankEtapasEntries(tally, user.id, id => names.get(id) ?? '', true),
        currentUserId: user.id,
        availableSubjects,
        comunidad,
      })
    }

    const fetched = await getScoresForMode(db, mode, period, memberIds, subject)
    const names = await getNameMap(db, Array.from(fetched.keys()))
    // Solo hay una posición previa "única" que comparar cuando se ha
    // elegido una materia concreta (ver comentario en getPreviousRoundRank).
    const previousRank = mode === 'ronda' && subject
      ? await getPreviousRoundRank(db, user.id, 'comunidad_materia', scopeKeyForComunidadMateria(comunidad, subject))
      : null

    return NextResponse.json({
      entries: rankEntries(fetched, user.id, id => names.get(id) ?? '', true),
      currentUserId: user.id,
      availableSubjects,
      comunidad,
      previousRank,
      ...roundExtras,
    })
  }

  // ---------------------------------------------------------------
  // Global — todos los alumnos, sin filtrar por comunidad ni liga. El
  // selector de materia sigue filtrando qué XP cuenta.
  // ---------------------------------------------------------------
  if (mode === 'historial') {
    const history = await getRondaHistorial(db, user.id, 'global', { exact: 'global' })
    return NextResponse.json({ history, currentUserId: user.id, availableSubjects })
  }

  if (mode === 'etapas') {
    const tally = await getEtapasTally(db, 'global', { exact: 'global' })
    const names = await getNameMap(db, Array.from(tally.keys()))
    return NextResponse.json({
      entries: rankEtapasEntries(tally, user.id, id => names.get(id) ?? '', true),
      currentUserId: user.id,
      availableSubjects,
    })
  }

  const fetched = await getScoresForMode(db, mode, period, null, subject)
  const names = await getNameMap(db, Array.from(fetched.keys()))
  const previousRank = mode === 'ronda' ? await getPreviousRoundRank(db, user.id, 'global', 'global') : null
  return NextResponse.json({
    entries: rankEntries(fetched, user.id, id => names.get(id) ?? '', true),
    currentUserId: user.id,
    availableSubjects,
    previousRank,
    ...roundExtras,
  })
}
