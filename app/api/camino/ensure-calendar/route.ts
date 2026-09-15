import { markReplanPending } from '@/app/lib/camino/replanPending'
import { checkedDb } from '@/app/lib/camino/checkedDb'
import { NextRequest, NextResponse } from 'next/server'
import { withPlanLock, PlanBusyError, reconcilePlanWork } from '@/app/lib/camino/planPersistence'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { syncKairoMissionsToGoogle } from '@/app/lib/calendar/sync'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'
import { addDays, getMadridToday } from '@/app/lib/camino/studyDays'
import { injectWeakReviewMissions } from '@/app/lib/camino/injectWeakReviewMissions'
import { injectDiagnosticMissions } from '@/app/lib/camino/injectDiagnosticMissions'
import { injectPlanFillerMissions } from '@/app/lib/camino/injectPlanFillerMissions'
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
 * `throughDate` amplía el horizonte al abrir una semana futura y también
 * evita el retorno diario, sin cambiar la disponibilidad ni la fecha PAU.
 */
export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  let force = false
  let throughDate: string | undefined
  try {
    const body = await request.json()
    force = body?.force === true
    if (body?.throughDate != null) {
      const date = body.throughDate
      if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)
        || !Number.isFinite(Date.parse(`${date}T12:00:00Z`))
        || new Date(`${date}T12:00:00Z`).toISOString().slice(0, 10) !== date
        || date > addDays(getMadridToday(), 366))
        return NextResponse.json({ error: 'invalid_planning_date' }, { status: 400 })
      // La fecha pedida se siembra ENTERA, sin tope.
      //
      // Hubo aquí un cap de 8 semanas contra "~650 consultas cuando el alumno
      // navega hasta la PAU de golpe". Ese coste ya no existe: los schedulers
      // se piden en bloque para todas las fechas candidatas y la
      // disponibilidad externa en un solo rango, así que abrir el curso entero
      // cuesta ~63 consultas, las mismas que abrir una semana.
      //
      // Y el cap no era neutral. Se medía desde HOY, no desde lo ya sembrado,
      // así que no avanzaba con las peticiones: abrir la semana 30 seguía
      // sembrando solo hasta la 8, una y otra vez. El temario nunca se
      // repartía más allá —170 de 218 días de estudio sin una sola misión, con
      // 214 temas atrapados en la cola— que es justo lo que `throughDate`
      // existe para evitar.
      //
      // Lo que sí escala con el horizonte es el tiempo de colocación (~1,2 s
      // para el curso completo), y se paga UNA vez: la siguiente apertura de
      // la misma fecha baja a ~170 ms porque ya no queda nada que sembrar.
      throughDate = date
    }
  } catch {
    // Sin cuerpo (o cuerpo no-JSON) es una llamada normal de carga: throttled.
  }

  const rawDb = createServiceClient()
  const db = checkedDb(rawDb)

  try {
    return await withPlanLock(db, user.id, async () => {
    const today = getMadridToday()

    // La columna del pendiente se lee aparte y tolera no existir: entre el
    // despliegue del código y la aplicación de su migración hay una ventana, y
    // en ella un select que falla dejaría el Camino entero en 500. Sin
    // columna, el comportamiento es exactamente el de antes.
    let pendingAt: string | null = null
    const withPending = await rawDb
      .from('camino_ensure_log')
      .select('last_ensured_day, replan_pending_at')
      .eq('user_id', user.id)
      .maybeSingle()

    let log: { last_ensured_day?: string | null } | null = withPending.data
    if (withPending.error) {
      console.warn('[camino/ensure-calendar] sin columna de reajuste pendiente (¿migración sin aplicar?):', withPending.error.message)
      const fallback = await db
        .from('camino_ensure_log')
        .select('last_ensured_day')
        .eq('user_id', user.id)
        .maybeSingle()
      if (fallback.error) throw fallback.error
      log = fallback.data
    } else {
      // Reajuste que quedó pendiente de una vez anterior: el alumno guardó sus
      // ajustes y el bloqueo estaba ocupado (o el intento salió degradado),
      // así que aquello no llegó a entrar. Vale tanto como un `force`
      // explícito —y es justo lo que evita tener que pulsar «Recalcular mi
      // plan»—, pero solo se limpia si ESTA ejecución termina limpia.
      pendingAt = (withPending.data?.replan_pending_at as string | null) ?? null
    }
    if (pendingAt) force = true

    if (!force && !throughDate) {
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
    const ensure = await ensureCaminoCalendar(user.id, db, { throughDate })
    const weakReviews = await injectWeakReviewMissions(user.id, db)
    // Microdiagnóstico: como mucho uno, y solo si el alumno ya tiene ritmo
    // (ver camino/knowledgeState.ts). Nunca bloquea el resto del Camino.
    const diagnostics = await injectDiagnosticMissions(user.id, db)
    const personalization = await applyCalendarPersonalization(user.id, db, { force })
    // Relleno: el ÚLTIMO paso que escribe misiones, y tiene que serlo.
    //
    // Va después de todo lo que reserva minutos del día (temario, repaso por
    // área débil, diagnóstico) para ocupar solo el presupuesto que de verdad
    // ha quedado libre. Y después de personalizar porque la recolocación MUEVE
    // lecciones: sembrar el repaso antes significaba fijar la vuelta de un
    // tema y que su lección se fuera detrás, proponiendo repasar en octubre
    // algo que se da en febrero. Coloca su propio hueco horario con el mismo
    // scheduler que el resto, así que no necesita pasar por la recolocación.
    const filler = await injectPlanFillerMissions(user.id, db, { throughDate })
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
    let degradedPending = false
    const degraded = [
      ...ensure.degraded,
      ...(weakReviews.reason === 'error' ? ['weak_reviews'] : []),
      ...(diagnostics.reason === 'error' ? ['diagnostics'] : []),
      ...(filler.reason === 'error' ? ['plan_filler'] : []),
      ...(personalization.reason === 'error' ? ['personalization'] : []),
    ]
    if (degraded.length === 0) {
      const { error: logError } = await db
        .from('camino_ensure_log')
        .upsert(
          {
            user_id: user.id,
            last_ensured_at: new Date().toISOString(),
            last_ensured_day: today,
          },
          { onConflict: 'user_id' },
        )
      if (logError) degraded.push('ensure_log')
      else if (pendingAt) {
        // El pendiente se salda aquí y solo aquí: esta ejecución lo atendió y
        // ha terminado limpia. Y se salda por igualdad con la marca que
        // leímos, no a ciegas: si mientras corría entró un pendiente NUEVO
        // (otro guardado en Ajustes), la marca ya es otra y sobrevive para la
        // siguiente ejecución en vez de perderse.
        await db
          .from('camino_ensure_log')
          .update({ replan_pending_at: null })
          .eq('user_id', user.id)
          .eq('replan_pending_at', pendingAt)
      }
    } else {
      console.error('[camino/ensure-calendar] degraded run, day not marked:', degraded.join(', '))
      // Un reajuste forzado que sale degradado no se pierde: queda pendiente y
      // lo recoge la siguiente ejecución, sin que el alumno pulse nada.
      if (force) degradedPending = await markReplanPending(db, user.id)
    }

    return NextResponse.json({
      ok: degraded.length === 0,
      degraded: degraded.length > 0 ? degraded : undefined,
      personalization,
      weakReviews,
      diagnostics,
      filler,
      // Ambos viajan SIEMPRE, también vacíos: es lo que permite retirar un
      // aviso cuando el problema se resuelve. Omitirlos dejaba el banner
      // encendido para siempre.
      protectedConflicts: notices.protectedConflicts,
      availability: notices.availability,
      retryable: degraded.length > 0,
      // El cliente lo usa para no pedir una acción manual que ya no hace
      // falta: el reajuste quedó apuntado y entrará solo.
      replanPending: degradedPending,
    }, { status: degraded.length > 0 ? 503 : 200 })
    })
  } catch (error) {
    // Un `force` que no entra queda anotado, ocupado o roto el motivo: lo que
    // el alumno acaba de guardar se aplicará solo en la siguiente ejecución.
    const pending = force ? await markReplanPending(db, user.id) : false
    if (error instanceof PlanBusyError) return NextResponse.json({ ok: false, retryable: true, error: 'plan_busy', replanPending: pending }, { status: 409, headers: { 'Retry-After': '2' } })
    console.error('[camino/ensure-calendar]', error)
    return NextResponse.json({ error: 'No se pudo preparar tu Camino', replanPending: pending }, { status: 500 })
  }
}
