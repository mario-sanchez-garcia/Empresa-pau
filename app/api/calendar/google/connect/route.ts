import { NextRequest, NextResponse } from 'next/server'

import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { buildGoogleAuthUrl } from '@/app/lib/calendar/google'
import { createCalendarOAuthState } from '@/app/lib/calendar/oauthState'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const auth = await getAuthContext(request)
  if ('response' in auth) return auth.response
  try {
    const state = createCalendarOAuthState(auth.user.id)
    return NextResponse.json({ url: buildGoogleAuthUrl(state) })
  } catch (error) {
    console.error('[calendar/google/connect]', error)
    return NextResponse.json({ error: 'Google Calendar no está configurado todavía.' }, { status: 500 })
  }
}
