import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { awardXp } from '@/app/lib/camino/awardXp'
import { caminoSubjectFromSimulacro } from '@/app/lib/camino/partialExamSubjects'
import { normalizeScoreToTen } from '@/app/lib/camino/scoreNormalization'
import { EXAM_CORRECTION_XP } from '@/app/lib/camino/xpMap'

export const dynamic = 'force-dynamic'

// La corrección de un ejercicio de examen (página Exámenes) se guarda en
// historial_examenes directamente desde el cliente (ver page-client.tsx),
// no a través de una API de servidor. Este endpoint es lo que sí corre en
// servidor: recibe el id de la fila ya insertada, verifica que pertenece al
// usuario y que tiene una nota real (una corrección no evaluable no da XP),
// y otorga el XP a través del mismo awardXp compartido que complete-mission
// y /api/simulacro.
export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const historialExamenId = typeof body.historialExamenId === 'string' ? body.historialExamenId : null
    if (!historialExamenId) {
      return NextResponse.json({ error: 'historialExamenId es obligatorio' }, { status: 400 })
    }

    const db = createServiceClient()
    const { data: examen, error: examenError } = await db
      .from('historial_examenes')
      .select('id,user_id,asignatura,nota,nota_maxima,created_at')
      .eq('id', historialExamenId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (examenError) {
      console.error('[camino/award-exam-xp] lookup_error', examenError)
      return NextResponse.json({ error: 'No hemos podido validar esta corrección.' }, { status: 500 })
    }

    if (!examen) {
      return NextResponse.json({ success: false, reason: 'not_found' }, { status: 404 })
    }

    if (examen.nota == null) {
      // Corrección guardada pero sin nota evaluable — no cuenta como corrección real.
      return NextResponse.json({ success: false, reason: 'not_gradable' })
    }

    const missionDate = typeof examen.created_at === 'string'
      ? examen.created_at.slice(0, 10)
      : new Date().toISOString().slice(0, 10)

    const result = await awardXp(db, user.id, {
      xp: EXAM_CORRECTION_XP,
      sourceType: 'exam_correction',
      sourceId: String(examen.id),
      subject: caminoSubjectFromSimulacro(String(examen.asignatura)),
      missionDate,
      scoreOnTen: normalizeScoreToTen(examen.nota, examen.nota_maxima),
    })

    return NextResponse.json({
      success: true,
      xpAwarded: result.xpAwarded,
      bonusXp: result.bonusXp,
      totalXp: result.totalXp,
      streakDays: result.streakDays,
      leagueUpgrade: result.leagueUpgrade,
    })
  } catch (err) {
    console.error('[camino/award-exam-xp]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
