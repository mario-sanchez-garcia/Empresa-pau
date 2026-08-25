import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { awardXp } from '@/app/lib/camino/awardXp'
import { resolveMissionTypeXp } from '@/app/lib/camino/xpMap'
import { getTopicByV2SortOrder, sanitizeLessonTitle } from '@/app/lib/camino/caminoCurriculumPlan'
import { resolveTopicIdentity } from '@/app/lib/camino/resolveTopicIdentity'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const authContext = await getAuthContext(request)
    if ('response' in authContext) return authContext.response
    const { user } = authContext

    let body: Record<string, unknown> = {}
    try { body = await request.json() } catch { /* ok */ }

    const subject = typeof body.subject === 'string' ? body.subject : null
    const v2SortOrder = typeof body.v2SortOrder === 'number' ? body.v2SortOrder : null
    const calendarRowId = typeof body.calendarRowId === 'string' ? body.calendarRowId : null
    const missionType = typeof body.missionType === 'string' ? body.missionType : 'concept'
    const title = typeof body.title === 'string' ? body.title : null
    // Nota normalizada sobre 10, si el cliente ya corrigió esta misión con
    // rúbrica (ver /api/camino/correct) antes de marcarla completada — misma
    // confianza en el cliente que ya existe hoy en el resto de la app para
    // notas (p.ej. historial_examenes.nota se inserta directo desde cliente).
    const rawScore = typeof body.score === 'number' ? body.score : null
    const scoreOnTen = rawScore != null && Number.isFinite(rawScore) ? Math.min(10, Math.max(0, rawScore)) : null

    if (!subject || v2SortOrder == null) {
      return NextResponse.json(
        { error: 'subject y v2SortOrder son obligatorios' },
        { status: 400 },
      )
    }

    // PASO 1 — XP base siempre calculado en servidor; el bonus de calidad lo
    // añade awardXp() por encima según scoreOnTen.
    const xp = resolveMissionTypeXp(missionType)

    const db = createServiceClient()
    const now = new Date().toISOString()
    const today = now.slice(0, 10)

    // PASO 1.5 — Resolver la fila EXACTA a completar antes de escribir nada.
    // calendarRowId es lo normal (el alumno abrió esta misión desde una
    // tarjeta concreta del calendario, ver missionId en CaminoCalendarClient/
    // CaminoTopicClient). Cuando no llega (p.ej. abierto desde La Zona → Mis
    // Cursos, sin contexto de día), antes se hacía un UPDATE directo
    // filtrando solo por subject+v2_sort_order+status — sin fecha ni límite
    // de filas. Si el motor de generación había dejado más de una fila
    // pendiente/missed para el mismo tema en fechas distintas (algo que sí
    // pasa — ver ensureCaminoCalendar), ese UPDATE las marcaba TODAS
    // completadas a la vez, incluidas fechas futuras que el alumno ni había
    // visto todavía. Ahora se resuelve primero a una única fila candidata
    // (pendiente/missed, con fecha <= hoy, la más reciente) y solo esa se
    // toca — nunca una fecha futura.
    let targetId = calendarRowId
    if (!targetId) {
      const { data: candidates } = await db
        .from('camino_calendar')
        .select('id')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('v2_sort_order', v2SortOrder)
        .in('status', ['pending', 'missed'])
        .lte('scheduled_date', today)
        .order('scheduled_date', { ascending: false })
        .limit(1)
      targetId = candidates?.[0]?.id ?? null
    }

    if (!targetId) {
      const { data: existing } = await db
        .from('camino_calendar')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('v2_sort_order', v2SortOrder)
        .lte('scheduled_date', today)
        .limit(10)

      if (existing?.some(row => row.status === 'completed')) {
        return NextResponse.json({ success: false, reason: 'already_completed' })
      }

      // Ninguna fila pendiente/missed/completada para este subject+v2_sort_order:
      // el alumno ha hecho este contenido por iniciativa propia (típicamente
      // abierto directo desde La Zona → Mis Cursos), sin que Kairo se lo
      // hubiera asignado todavía. Principio de diseño: lo que Kairo programa
      // nunca debe repetir contenido ya hecho, venga de donde venga — así que
      // en vez de devolver simplemente "sin misión pendiente":
      //   1. Se marca la fila de user_learning_queue como completada. El
      //      motor de generación (ensureCaminoCalendar) solo lee
      //      queue_status='pending', así que deja de considerar este tema y
      //      el cursor de esa asignatura avanza solo al siguiente contenido
      //      distinto la próxima vez que genere el calendario.
      //   2. Se deja un registro 'completed' en camino_calendar fechado hoy,
      //      con source='free_initiative' — así el calendario semanal refleja
      //      el trabajo hecho por libre iniciativa (tachado/hecho, distinto
      //      visualmente de una misión asignada), e injectWeakReviewMissions
      //      (que también excluye status='completed') tampoco vuelve a
      //      sugerirlo como repaso.
      // No se otorga XP de misión aquí: sigue siendo "práctica libre" como ya
      // comunica el toast del cliente — esto solo corrige que Kairo deje de
      // volver a programar algo que el alumno ya hizo por su cuenta.
      const { data: queueRow } = await db
        .from('user_learning_queue')
        .select('id, block_key')
        .eq('user_id', user.id)
        .eq('subject', subject)
        .eq('v2_sort_order', v2SortOrder)
        .in('queue_status', ['pending', 'scheduled'])
        .limit(1)
        .maybeSingle()

      if (queueRow?.id) {
        await db
          .from('user_learning_queue')
          .update({ queue_status: 'completed' })
          .eq('id', queueRow.id)
      }

      const topic = getTopicByV2SortOrder(subject, v2SortOrder)
      const { topicId } = await resolveTopicIdentity(db, subject, v2SortOrder)
      await db.from('camino_calendar').upsert({
        user_id: user.id,
        scheduled_date: today,
        subject,
        v2_sort_order: v2SortOrder,
        title: sanitizeLessonTitle(title ?? topic?.title ?? 'Práctica libre'),
        block_key: queueRow?.block_key ?? null,
        block_slug: topic?.blockSlug ?? null,
        mission_type: missionType,
        is_main: false,
        is_bonus: true,
        status: 'completed',
        completed_at: now,
        xp_awarded: 0,
        source: 'free_initiative',
        generated_by: 'free_initiative_v1',
        metadata: topicId ? { free_initiative: true, topic_id: topicId } : { free_initiative: true },
      }, { onConflict: 'user_id,scheduled_date,subject,v2_sort_order' })

      return NextResponse.json({ success: false, reason: 'free_initiative_recorded' })
    }

    // PASO 2 — Marcar calendario como completado. Acepta tanto 'pending' como
    // 'missed': el fix de cronología (las misiones ya no se mueven de su día
    // real) hace que un alumno pueda ver y corregir un día pasado cuya misión
    // ensureCaminoCalendar ya marcó 'missed' de madrugada por no haberse
    // hecho a tiempo — antes esto solo aceptaba 'pending', así que corregirla
    // tarde caía siempre en la rama "no_pending_mission" (sin XP, sin marcar
    // como hecha) aunque el alumno sí hubiera hecho el trabajo real.
    // Completar tarde sigue contando — pero solo la fila ya resuelta arriba.
    const { data: updated } = await db
      .from('camino_calendar')
      .update({
        status: 'completed',
        completed_at: now,
        xp_awarded: xp,
        updated_at: now,
      })
      .eq('id', targetId)
      .eq('user_id', user.id)
      .in('status', ['pending', 'missed'])
      .select('id')

    // PASO 4 — Idempotencia: 0 filas afectadas = ya completada entre medias
    if (!updated || updated.length === 0) {
      return NextResponse.json({ success: false, reason: 'already_completed' })
    }

    // PASO 2b — Marcar cola como completada (best-effort)
    await db
      .from('user_learning_queue')
      .update({ queue_status: 'completed' })
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)

    // PASO 2c — Si esta misma pieza de contenido (mismo subject+v2_sort_order)
    // tenía OTRAS filas todavía activas — una reprogramación tras un missed
    // anterior, o un duplicado de repaso —, ya no tienen sentido: el
    // contenido acaba de completarse de verdad. Dejarlas activas repetiría
    // hacia delante algo ya hecho, el mismo problema que ya se corrigió para
    // las misiones de repaso automáticas. Solo se tocan filas generadas por
    // el algoritmo — nunca una misión que el alumno haya añadido a mano.
    await db
      .from('camino_calendar')
      .delete()
      .eq('user_id', user.id)
      .eq('subject', subject)
      .eq('v2_sort_order', v2SortOrder)
      .neq('id', updated[0].id)
      .in('status', ['pending', 'missed', 'postponed'])
      .in('source', ['algorithm', 'partial'])

    await recordBetaMetric(db, user.id, 'correction_completed', {
      subject,
      v2_sort_order: v2SortOrder,
      calendar_row_id: targetId,
      mission_type: missionType,
      title,
    })
    await recordBetaMetric(db, user.id, 'xp_awarded', {
      subject,
      v2_sort_order: v2SortOrder,
      calendar_row_id: targetId,
      mission_type: missionType,
      xp,
    })

    // PASO 3 — Registrar XP y actualizar camino_user_progress (un mismo
    // helper compartido con exam_correction/simulacro_completion/parcial_completion)
    const result = await awardXp(db, user.id, {
      effortXp: xp,
      sourceType: 'mission_completion',
      sourceId: String(updated[0].id),
      subject,
      missionDate: now.slice(0, 10),
      missionsCompletedDelta: 1,
      scoreOnTen,
    })

    // PASO 4b — El PASO 2 ya guardó xp_awarded=xp (solo la base, antes de
    // saber la nota) para poder marcar la fila como completada de forma
    // atómica sin esperar a la corrección. Ahora que awardXp() ya calculó el
    // bonus de calidad, se corrige ese valor al total real — si no, la
    // tarjeta de esta misión en Camino se queda mostrando para siempre el XP
    // base sin bonus aunque el alumno haya sacado buena nota. Best-effort:
    // si falla, el XP real ya está bien escrito en camino_xp_events/
    // camino_user_progress, solo se pierde la actualización de este badge.
    if (result.awarded && result.xpAwarded !== xp) {
      await db.from('camino_calendar').update({ xp_awarded: result.xpAwarded }).eq('id', updated[0].id)
    }

    // PASO 5 — Respuesta
    return NextResponse.json({ success: true, xpAwarded: result.xpAwarded, bonusXp: result.bonusXp, totalXp: result.totalXp, streakDays: result.streakDays, leagueUpgrade: result.leagueUpgrade })
  } catch (err) {
    console.error('[camino/complete-mission]', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
