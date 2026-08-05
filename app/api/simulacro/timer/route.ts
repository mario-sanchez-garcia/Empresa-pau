import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createUserSupabase } from '@/app/lib/camino/caminoProgressServer'
import { closeSegment, openSegment, totalElapsedSeconds, isValidSegments, isResumeExpired, type TimeSegment } from '@/app/lib/simulacros/timeSegments'

export const dynamic = 'force-dynamic'

// Pausa/reanuda un Simulacro o práctica parcial en curso. "En pausa" no es
// un estado.estado real — historial_simulacros.estado tiene un CHECK que
// solo permite 'en_progreso' | 'completado' (ver migración de creación de
// la tabla). En pausa = 'en_progreso' sin ningún tramo abierto en
// resultado_json.time_segments (ver app/lib/simulacros/timeSegments.ts).
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user, accessToken } = authContext

  let body: Record<string, unknown> = {}
  try { body = await request.json() } catch { /* ok */ }
  const simulacroId = typeof body.simulacroId === 'string' ? body.simulacroId : null
  const action = body.action === 'pause' || body.action === 'resume' ? body.action : null
  if (!simulacroId || !action) {
    return NextResponse.json({ error: 'simulacroId y action (pause|resume) son obligatorios' }, { status: 400 })
  }

  const db = createUserSupabase(accessToken)
  const { data: record, error: fetchError } = await db
    .from('historial_simulacros')
    .select('id, user_id, estado, resultado_json, created_at')
    .eq('id', simulacroId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    console.error('[simulacro/timer] fetch_failed', fetchError)
    return NextResponse.json({ error: 'No hemos podido comprobar esta sesión ahora mismo.' }, { status: 500 })
  }
  if (!record) {
    return NextResponse.json({ error: 'No hemos encontrado esta sesión para tu cuenta.' }, { status: 404 })
  }
  if (record.estado !== 'en_progreso') {
    return NextResponse.json({ error: 'Esta sesión ya está corregida y no se puede pausar ni reanudar.' }, { status: 409 })
  }

  const resultadoJson = (record.resultado_json && typeof record.resultado_json === 'object' && !Array.isArray(record.resultado_json))
    ? record.resultado_json as Record<string, unknown>
    : {}
  const existingSegments = isValidSegments(resultadoJson.time_segments) ? resultadoJson.time_segments : []

  if (action === 'resume') {
    // Una práctica de parcial ligada a un examen real conocido (mission_id
    // -> camino_calendar.metadata.partial_exam_date) no debería poder
    // "reanudarse" después de la fecha del propio examen — ver
    // resumeDeadline en timeSegments.ts. Best-effort: si esta consulta
    // falla, se aplica solo el límite general de MAX_RESUME_DAYS.
    let examDateISO: string | null = null
    const missionId = typeof resultadoJson.mission_id === 'string' ? resultadoJson.mission_id : null
    if (missionId) {
      const { data: missionRow } = await db
        .from('camino_calendar')
        .select('metadata')
        .eq('id', missionId)
        .maybeSingle()
      const metadata = missionRow?.metadata as Record<string, unknown> | null | undefined
      if (metadata && typeof metadata.partial_exam_date === 'string') examDateISO = metadata.partial_exam_date
    }

    if (isResumeExpired(record.created_at, new Date(), examDateISO)) {
      return NextResponse.json({
        error: 'expired',
        message: examDateISO
          ? 'Esta práctica ya no se puede continuar: ya ha pasado la fecha del parcial. Empieza una nueva si quieres seguir practicando.'
          : 'Esta sesión lleva pausada demasiado tiempo y ya no se puede continuar. Empieza una nueva.',
      }, { status: 410 })
    }
  }

  const nextSegments: TimeSegment[] = action === 'pause'
    ? closeSegment(existingSegments)
    : openSegment(existingSegments)

  const { error: updateError } = await db
    .from('historial_simulacros')
    .update({
      resultado_json: { ...resultadoJson, time_segments: nextSegments },
      updated_at: new Date().toISOString(),
    })
    .eq('id', simulacroId)
    .eq('user_id', user.id)

  if (updateError) {
    console.error('[simulacro/timer] update_failed', updateError)
    return NextResponse.json({ error: 'No hemos podido guardar el cambio. Inténtalo de nuevo.' }, { status: 500 })
  }

  return NextResponse.json({
    action,
    segments: nextSegments,
    elapsedSeconds: totalElapsedSeconds(nextSegments),
    isPaused: action === 'pause',
  })
}
