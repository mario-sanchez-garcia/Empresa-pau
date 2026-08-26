import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { getGoogleAvailability } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  const timeMin = request.nextUrl.searchParams.get('timeMin')
  const timeMax = request.nextUrl.searchParams.get('timeMax')
  if (!timeMin || !timeMax) return NextResponse.json({ error: 'timeMin y timeMax son obligatorios' }, { status: 400 })
  try {
    return NextResponse.json({ busy: await getGoogleAvailability(auth.user.id, timeMin, timeMax) })
  } catch (error) {
    console.error('[calendar/availability]', error)
    return NextResponse.json({ error: 'No se pudo consultar disponibilidad.' }, { status: 500 })
  }
}
