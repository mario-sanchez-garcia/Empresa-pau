import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { collectPlanNotices } from '@/app/lib/camino/planNotices'
import { loadCoverageForecast } from '@/app/lib/camino/loadCoverageForecast'
import { loadStudentPlanContext } from '@/app/lib/camino/studentPlanContext'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    const db = createServiceClient()
    // Una fotografía por petición: los avisos y la previsión deben usar el
    // mismo acceso y disponibilidad, incluso si caducan mientras se leen.
    const context = await loadStudentPlanContext(auth.user.id, db)
    const [notices, forecast] = await Promise.all([
      collectPlanNotices(auth.user.id, db, context.today, context),
      loadCoverageForecast(auth.user.id, db, context),
    ])
    return NextResponse.json({ userId: auth.user.id, notices, forecast }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('[camino/overview]', error)
    return NextResponse.json({ error: 'No se pudo calcular la previsión. Vuelve a intentarlo.' }, { status: 503 })
  }
}
