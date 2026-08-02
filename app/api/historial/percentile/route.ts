import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createServiceClient } from '@/app/lib/billing/supabase'

export const dynamic = 'force-dynamic'

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  return m?.[1] ?? null
}

async function getUser(token: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const client = createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
  return client.auth.getUser(token)
}

function normalizedScore(nota: unknown, notaMaxima: unknown): number | null {
  const score = Number(nota)
  const max = Number(notaMaxima)
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null
  return Math.min(10, Math.max(0, (score / max) * 10))
}

// Percentil real de la media de notas del alumno frente al resto de usuarios
// con correcciones guardadas. historial_examenes tiene RLS por user_id, así
// que comparar contra otros usuarios solo es posible con el service role
// desde el servidor — no hay ninguna columna "media por usuario" precalculada,
// así que se agrega en memoria (a la escala actual de la beta esto es barato;
// si el histórico crece mucho, esto debería moverse a una vista materializada).
export async function GET(request: NextRequest) {
  const token = getBearerToken(request)
  if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { data: { user }, error } = await getUser(token)
  if (error || !user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const db = createServiceClient()
  const { data: rows, error: fetchError } = await db
    .from('historial_examenes')
    .select('user_id, nota, nota_maxima')

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })

  const sums = new Map<string, { total: number; count: number }>()
  for (const row of rows ?? []) {
    const score = normalizedScore(row.nota, row.nota_maxima)
    if (score === null) continue
    const entry = sums.get(row.user_id) ?? { total: 0, count: 0 }
    entry.total += score
    entry.count += 1
    sums.set(row.user_id, entry)
  }

  const averages = [...sums.entries()].map(([userId, { total, count }]) => ({ userId, avg: total / count }))
  const mine = averages.find(a => a.userId === user.id)

  if (!mine || averages.length < 5) {
    // Muestra insuficiente para que un percentil signifique algo — mejor no
    // inventar un número que decir "estás por encima de X" sin base real.
    // (Umbral subido de 3 a 5: con muy pocos usuarios un percentil real
    // igual sale demasiado extremo/poco significativo para mostrarlo.)
    return NextResponse.json({
      promedio: mine ? Number(mine.avg.toFixed(1)) : null,
      percentil: null,
      totalUsuarios: averages.length,
    })
  }

  const others = averages.filter(a => a.userId !== user.id)
  const beaten = others.filter(a => a.avg < mine.avg).length
  const percentil = Math.round((beaten / others.length) * 100)

  return NextResponse.json({
    promedio: Number(mine.avg.toFixed(1)),
    percentil,
    totalUsuarios: averages.length,
  })
}
