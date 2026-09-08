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

  // A15 de la auditoría del 7-8 de septiembre de 2026: estas dos consultas no
  // tenían límite, así que dependían del techo invisible de 1.000 filas de
  // Supabase. Aquí el recorte es benigno — son datos de UN alumno y van
  // ordenados por fecha descendente, así que lo que se pierde es lo más
  // antiguo, que además pesa poco: computeProjection aplica decaimiento
  // (0,5^(días/21), un resultado de hace 21 días vale la mitad).
  // El límite se hace explícito de todas formas: un tope elegido es una
  // decisión, y un tope heredado del cliente de base de datos es un accidente
  // esperando a cambiar cuando alguien toque la configuración.
  const MAX_HISTORY_ROWS = 1000
  const [simsResult, examResult] = await Promise.all([
    db.from('historial_simulacros')
      .select('asignatura, nota_final, resultado_json, created_at')
      .eq('user_id', userId)
      .eq('estado', 'completado')
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_ROWS),
    db.from('historial_examenes')
      .select('asignatura, nota, nota_maxima, bloque, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY_ROWS),
  ])

  const projections = computeProjection(
    simsResult.data ?? [],
    examResult.data ?? [],
  )

  return NextResponse.json({ projections })
}
