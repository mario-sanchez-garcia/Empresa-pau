import { checkedDb } from '@/app/lib/camino/checkedDb'
import { NextRequest, NextResponse } from 'next/server'
import { withPlanLock, PlanBusyError, reconcilePlanWork } from '@/app/lib/camino/planPersistence'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { syncKairoMissionsToGoogle } from '@/app/lib/calendar/sync'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'
import { getMadridToday } from '@/app/lib/camino/studyDays'
import { injectWeakReviewMissions } from '@/app/lib/camino/injectWeakReviewMissions'
import { injectDiagnosticMissions } from '@/app/lib/camino/injectDiagnosticMissions'
import { collectPlanNotices } from '@/app/lib/camino/planNotices'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

/**
 * Prepara el Camino del usuario. Encadena tres operaciones de escritura, así
 * que NO debe ejecutarse en cada carga de página: una vez al día por usuario
 * basta para que aparezcan misiones nuevas y repasos.
 *
 * `force: true` salta el throttle. Lo usan los dos sitios donde el usuario
 * acaba de cambiar algo y espera verlo reflejado ya:
 *   · /settings al guardar días/minutos de estudio
 *   · generateCamino() tras crear el Camino desde cero
 */
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let force = false
  try {
    const body = await request.json()
    force = body?.force === true
  } catch {
    // Sin cuerpo (o cuerpo no-JSON) es una llamada normal de carga: throttled.
  }

  try {
    const db = checkedDb(createServiceClient())
    return await withPlanLock(db, user.id, async () => {
    const today = getMadridToday()

    if (!force) {
      const { data: log, error: logReadError } = await db
        .from('camino_ensure_log')
        .select('last_ensured_day')
        .eq('user_id', user.id)
        .maybeSingle()

      if (logReadError) throw logReadError
      if (log?.last_ensured_day === today) {
        // Saltarse el día no puede significar saltarse la realidad. Dos cosas
        // pasan aquí que antes no:
        //
        //  1. Los avisos vigentes se devuelven igual. Si no, recargar la
        //     página después de la primera ejecución del día borraba un aviso
        //     cuyo problema seguía ahí.
        //  2. Si hay misiones en fechas que el alumno ya no puede usar, el día
        //     NO se da por hecho. Un acceso que caduca por la tarde dejaba el
        //     calendario en días perdidos hasta el día siguiente, porque este
        //     retorno esquivaba la replanificación entera.
        const notices = await collectPlanNotices(user.id, db, today)
        if (notices.misplaced.length === 0) {
          return NextResponse.json({
            ok: true,
            skipped: 'already_ensured_today',
            availability: notices.availability,
            protectedConflicts: notices.protectedConflicts,
          })
        }
      }
    }

    await reconcilePlanWork(db, user.id)
    const ensure = await ensureCaminoCalendar(user.id, db)
    const weakReviews = await injectWeakReviewMissions(user.id, db)
    // Microdiagnóstico: como mucho uno, y solo si el alumno ya tiene ritmo
    // (ver camino/knowledgeState.ts). Nunca bloquea el resto del Camino.
    const diagnostics = await injectDiagnosticMissions(user.id, db)
    const personalization = await applyCalendarPersonalization(user.id, db, { force })
    // Se lee DESPUÉS de personalizar: es el estado con el que el alumno se va
    // a encontrar, no el de antes de recolocar. Misma fuente que el camino
    // corto de arriba, para que ambos digan exactamente lo mismo.
    const notices = await collectPlanNotices(user.id, db, today)
    await syncKairoMissionsToGoogle(user.id, db).catch(error => {
      console.warn('[camino/ensure-calendar] calendar sync skipped:', error)
    })

    // El marcador se escribe DESPUÉS de que las operaciones terminen: si
    // alguna lanza, el día no queda marcado y el siguiente intento vuelve a
    // probar, en vez de dejar el Camino a medias hasta mañana.
    //
    // Y no basta con que no lancen. Una escritura que falla y se registra
    // —una migración todavía sin aplicar, por ejemplo— deja el Camino
    // incompleto sin excepción ninguna; marcar el día igualmente convertía un
    // fallo recuperable en un día perdido. Un resultado degradado NO marca el
    // día: el siguiente intento reintenta.
    const degraded = [
      ...ensure.degraded,
      ...(weakReviews.reason === 'error' ? ['weak_reviews'] : []),
      ...(diagnostics.reason === 'error' ? ['diagnostics'] : []),
      ...(personalization.reason === 'error' ? ['personalization'] : []),
    ]
    if (degraded.length === 0) {
      const { error: logError } = await db
        .from('camino_ensure_log')
        .upsert(
          { user_id: user.id, last_ensured_at: new Date().toISOString(), last_ensured_day: today },
          { onConflict: 'user_id' },
        )
      if (logError) degraded.push('ensure_log')
    } else {
      console.error('[camino/ensure-calendar] degraded run, day not marked:', degraded.join(', '))
    }

    return NextResponse.json({
      ok: degraded.length === 0,
      degraded: degraded.length > 0 ? degraded : undefined,
      personalization,
      weakReviews,
      diagnostics,
      // Ambos viajan SIEMPRE, también vacíos: es lo que permite retirar un
      // aviso cuando el problema se resuelve. Omitirlos dejaba el banner
      // encendido para siempre.
      protectedConflicts: notices.protectedConflicts,
      availability: notices.availability,
      retryable: degraded.length > 0,
    }, { status: degraded.length > 0 ? 503 : 200 })
    })
  } catch (error) {
    if (error instanceof PlanBusyError) return NextResponse.json({ ok: false, retryable: true, error: 'plan_busy' }, { status: 409, headers: { 'Retry-After': '2' } })
    console.error('[camino/ensure-calendar]', error)
    return NextResponse.json({ error: 'No se pudo preparar tu Camino' }, { status: 500 })
  }
}
