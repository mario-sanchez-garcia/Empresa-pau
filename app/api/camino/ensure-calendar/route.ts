import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { syncKairoMissionsToGoogle } from '@/app/lib/calendar/sync'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'
import { getMadridToday } from '@/app/lib/camino/studyDays'
import { injectWeakReviewMissions } from '@/app/lib/camino/injectWeakReviewMissions'

export const dynamic = 'force-dynamic'

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
    const db = createServiceClient()
    const today = getMadridToday()

    if (!force) {
      const { data: log } = await db
        .from('camino_ensure_log')
        .select('last_ensured_day')
        .eq('user_id', user.id)
        .maybeSingle()

      if (log?.last_ensured_day === today) {
        return NextResponse.json({ ok: true, skipped: 'already_ensured_today' })
      }
    }

    await ensureCaminoCalendar(user.id, db)
    const weakReviews = await injectWeakReviewMissions(user.id, db)
    const personalization = await applyCalendarPersonalization(user.id, db)
    await syncKairoMissionsToGoogle(user.id, db).catch(error => {
      console.warn('[camino/ensure-calendar] calendar sync skipped:', error)
    })

    // El marcador se escribe DESPUÉS de que las tres operaciones terminen: si
    // alguna lanza, el día no queda marcado y el siguiente intento vuelve a
    // probar, en vez de dejar el Camino a medias hasta mañana.
    const { error: logError } = await db
      .from('camino_ensure_log')
      .upsert(
        { user_id: user.id, last_ensured_at: new Date().toISOString(), last_ensured_day: today },
        { onConflict: 'user_id' },
      )
    if (logError) console.error('[camino/ensure-calendar] log upsert failed:', logError.message)

    return NextResponse.json({ ok: true, personalization, weakReviews })
  } catch (error) {
    console.error('[camino/ensure-calendar]', error)
    return NextResponse.json({ error: 'No se pudo preparar tu Camino' }, { status: 500 })
  }
}
