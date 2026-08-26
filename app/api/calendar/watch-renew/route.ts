import { NextRequest, NextResponse } from 'next/server'

import { renewExpiringGoogleWatches } from '@/app/lib/calendar/sync'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected && request.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    return NextResponse.json({ ok: true, ...(await renewExpiringGoogleWatches()) })
  } catch (error) {
    console.error('[calendar/watch-renew]', error)
    return NextResponse.json({ error: 'No se pudieron renovar los watches.' }, { status: 500 })
  }
}
