import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { applyCalendarPersonalization } from '@/app/lib/camino/applyCalendarPersonalization'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { ensureCaminoCalendar } from '@/app/lib/ensureCaminoCalendar'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response
  const { user } = authContext

  try {
    const db = createServiceClient()
    await ensureCaminoCalendar(user.id, db)
    const personalization = await applyCalendarPersonalization(user.id, db)
    return NextResponse.json({ ok: true, personalization })
  } catch (error) {
    console.error('[camino/ensure-calendar]', error)
    return NextResponse.json({ error: 'No se pudo preparar tu Camino' }, { status: 500 })
  }
}
