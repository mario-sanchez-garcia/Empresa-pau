import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext } from '@/app/lib/camino/caminoProgressServer'
import { generateInformeToken } from '@/app/lib/informe/token'

export const dynamic = 'force-dynamic'

function getMadridWeekStart(): string {
  const madridDate = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
  const d = new Date(madridDate + 'T12:00:00Z')
  const dow = d.getUTCDay()
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() - (dow === 0 ? 6 : dow - 1))
  return monday.toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  if (!process.env.INFORME_SECRET) {
    return NextResponse.json({ error: 'Informe no configurado' }, { status: 503 })
  }

  const weekStart = getMadridWeekStart()
  const token = generateInformeToken(authContext.user.id, weekStart)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://empresa-pau.vercel.app'
  const url = `${appUrl}/informe/${token}`

  return NextResponse.json({ url })
}
