import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { getCalendarConnectionStatus } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    return NextResponse.json(await getCalendarConnectionStatus(auth.user.id))
  } catch (error) {
    console.error('[calendar/google/status]', error)
    return NextResponse.json({ connected: false, error: 'No se pudo leer la integración.' }, { status: 500 })
  }
}
