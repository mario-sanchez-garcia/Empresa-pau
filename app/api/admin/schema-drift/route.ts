import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { isInternalUser } from '@/app/lib/internalUsers'
import { createServiceClient } from '@/app/lib/billing/supabase'
import { runSchemaDriftCheck } from '@/app/lib/schema/checkDrift'

export const dynamic = 'force-dynamic'

/**
 * Compara el esquema REAL de producción con lo que el código espera.
 *
 * Existe porque durante seis semanas hubo migraciones en el repo sin aplicar y
 * no había ninguna forma de saberlo: el rate limiting de registro estaba
 * inerte y las tablas de ligas abiertas, ambos fallando en silencio.
 *
 * Este endpoint es el chequeo manual desde el panel de admin. El mismo
 * chequeo corre automáticamente a diario vía app/api/cron/schema-drift-check
 * — este endpoint sigue existiendo para poder mirarlo a mano antes de un
 * despliegue importante, sin esperar al cron.
 */

function getBearerToken(request: NextRequest): string | null {
  const match = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)
  return match?.[1] ?? null
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) return NextResponse.json({ error: 'Config error' }, { status: 500 })

  const accessToken = getBearerToken(request)
  if (!accessToken) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const authSupabase = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: userData, error: authError } = await authSupabase.auth.getUser(accessToken)
  if (authError || !userData.user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  if (!isInternalUser(userData.user.email)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const db = createServiceClient()
  const result = await runSchemaDriftCheck(db)
  if ('error' in result) {
    return NextResponse.json(result, { status: 503 })
  }
  return NextResponse.json(result)
}
