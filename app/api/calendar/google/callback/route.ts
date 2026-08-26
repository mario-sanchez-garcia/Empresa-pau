import { NextRequest, NextResponse } from 'next/server'

import { exchangeGoogleCode, getGoogleAccountEmail } from '@/app/lib/calendar/google'
import { verifyCalendarOAuthState } from '@/app/lib/calendar/oauthState'
import { upsertCalendarConnection } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

function caminoRedirect(request: NextRequest, status: 'connected' | 'error') {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  return NextResponse.redirect(`${origin}/camino?calendar=${status}`)
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')
  const state = verifyCalendarOAuthState(request.nextUrl.searchParams.get('state'))
  if (!code || !state) return caminoRedirect(request, 'error')
  try {
    const tokens = await exchangeGoogleCode(code)
    const accountEmail = await getGoogleAccountEmail(tokens.access_token)
    await upsertCalendarConnection({
      userId: state.userId,
      accountEmail,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token ?? null,
      expiresIn: tokens.expires_in,
    })
    return caminoRedirect(request, 'connected')
  } catch (error) {
    console.error('[calendar/google/callback]', error)
    return caminoRedirect(request, 'error')
  }
}
