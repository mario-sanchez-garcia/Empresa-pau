import { NextRequest, NextResponse } from 'next/server'
import { getAuthContext, createServiceSupabase } from '@/app/lib/camino/caminoProgressServer'
import { computeProjection } from '@/app/lib/proyeccion/computeProjection'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const authContext = await getAuthContext(request)
  if ('response' in authContext) return authContext.response

  const db = createServiceSupabase()
  if (!db) return NextResponse.json({ error: 'Error de configuración' }, { status: 500 })

  const userId = authContext.user.id

  const [simsResult, examResult] = await Promise.all([
    db.from('historial_simulacros')
      .select('asignatura, nota_final, resultado_json, created_at')
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .order('created_at', { ascending: false }),
    db.from('historial_examenes')
      .select('asignatura, nota, nota_maxima, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  ])

  const projections = computeProjection(
    simsResult.data ?? [],
    examResult.data ?? [],
  )

  return NextResponse.json({ projections })
}
