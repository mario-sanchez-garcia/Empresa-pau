import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export interface WeakArea {
  subjectKey: string
  blockSlug: string
  label: string
  avgScore: number
  attempts: number
}

interface HistorialRow {
  asignatura: string
  bloque: string
  opcion: string | null
  nota: number | null
  nota_maxima: number | null
}

// Threshold: blocks with avg < 60% and at least 2 attempts are considered weak.
const WEAK_THRESHOLD = 0.60
const MIN_ATTEMPTS = 2

// Returns weak areas sorted by avgScore ascending (worst first).
// Returns [] on any error — never throws.
export async function getWeakAreas(
  supabase: SupabaseClient,
  userId: string
): Promise<WeakArea[]> {
  try {
    const { data, error } = await supabase
      .from('historial_examenes')
      .select('asignatura, bloque, opcion, nota, nota_maxima')
      .eq('user_id', userId)
      .not('nota', 'is', null)
      .not('nota_maxima', 'is', null)
      .gt('nota_maxima', 0)
      .order('created_at', { ascending: false })
      .limit(200)

    if (error || !data) return []

    // Aggregate per (asignatura, bloque)
    const agg: Record<string, { subjectKey: string; label: string; sum: number; max: number; count: number; baseCount: number }> = {}

    for (const row of data as HistorialRow[]) {
      if (!row.bloque || row.nota == null || row.nota_maxima == null || row.nota_maxima <= 0) continue
      const key = `${row.asignatura}||${row.bloque}`
      if (!agg[key]) {
        agg[key] = { subjectKey: row.asignatura, label: row.bloque, sum: 0, max: 0, count: 0, baseCount: 0 }
      }
      agg[key].sum += row.nota
      agg[key].max += row.nota_maxima
      agg[key].count += 1
      if ((row.opcion ?? '').toLowerCase() !== 'repaso') {
        agg[key].baseCount += 1
      }
    }

    const weakAreas: WeakArea[] = []
    for (const [, v] of Object.entries(agg)) {
      if (v.baseCount < MIN_ATTEMPTS) continue
      const avg = v.sum / v.max
      if (avg < WEAK_THRESHOLD) {
        weakAreas.push({
          subjectKey: v.subjectKey,
          blockSlug: v.label.toLowerCase().replace(/\s+/g, '_'),
          label: v.label,
          avgScore: Math.round(avg * 100),
          attempts: v.count,
        })
      }
    }

    return weakAreas.sort((a, b) => a.avgScore - b.avgScore)
  } catch {
    return []
  }
}

export function createServiceSupabaseForWeakAreas(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
