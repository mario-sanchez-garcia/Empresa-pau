import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { disconnectGoogleCalendar } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    await disconnectGoogleCalendar(auth.user.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[calendar/google/disconnect]', error)
    return NextResponse.json({ error: 'No se pudo desconectar Google Calendar.' }, { status: 500 })
  }
}
