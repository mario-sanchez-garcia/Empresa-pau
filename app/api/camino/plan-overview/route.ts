import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { collectPlanNotices } from '@/app/lib/camino/planNotices'
import { loadCoverageForecast } from '@/app/lib/camino/loadCoverageForecast'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    const db = createServiceClient()
    const [notices, forecast] = await Promise.all([collectPlanNotices(auth.user.id, db), loadCoverageForecast(auth.user.id, db)])
    return NextResponse.json({ userId: auth.user.id, notices, forecast }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    console.error('[camino/overview]', error)
    return NextResponse.json({ error: 'No se pudo calcular la previsión. Vuelve a intentarlo.' }, { status: 503 })
  }
}
