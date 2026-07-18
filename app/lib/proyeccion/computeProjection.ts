export interface SubjectProjection {
  asignatura: string
  nota_proyectada: number | null
  num_entries: number
  recent_entries: number          // entries in last 30 days
  confidence: 'low' | 'medium' | 'high'
  trend_7d: number | null         // avg(last 7d) - avg(prev 7d), null if insufficient data
  last_updated: string | null
}

// Canonical slug per raw DB value (after accent-strip + lowercase)
const SUBJECT_NORMALIZE: Record<string, string> = {
  // Matemáticas II
  'mates': 'matematicas_ii',
  'mat ii': 'matematicas_ii',
  'mat. ii': 'matematicas_ii',
  'matematicas ii': 'matematicas_ii',
  'matematicas_ii': 'matematicas_ii',
  // Matemáticas CCSS
  'matematicas ccss': 'matematicas_ccss',
  'mat ccss': 'matematicas_ccss',
  'mat. ccss': 'matematicas_ccss',
  'matematicas_ccss': 'matematicas_ccss',
  // Lengua
  'lengua': 'lengua',
  'lengua castellana': 'lengua',
  'lengua y literatura': 'lengua',
  'lengua castellana y literatura': 'lengua',
  // Historia
  'historia': 'historia_espana',
  'historia de espana': 'historia_espana',
  'historia_espana': 'historia_espana',
  'historia espana': 'historia_espana',
}

function normalizeSubject(raw: string): string {
  // NFD decomposes accented chars into base + combining mark; strip the marks (U+0300–U+036F)
  const key = raw.trim().toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '')
  return SUBJECT_NORMALIZE[key] ?? key
}

interface SimulacroRow {
  asignatura: string
  nota_final: number | null
  resultado_json: {
    desglose_bloques?: Array<{
      puntos_conseguidos?: number
      puntos_maximos?: number
    }>
  } | null
  created_at: string
}

interface ExamenRow {
  asignatura: string | null
  nota: number | null
  nota_maxima: number | null
  created_at: string
}

type Accumulator = {
  weightedSum: number
  weightTotal: number
  entries: number
  recentEntries: number     // last 30 days
  sum7d: number             // raw 0-10 sum, entries in last 7 days
  count7d: number
  sumPrev7d: number         // raw 0-10 sum, entries 7-14 days ago
  countPrev7d: number
  lastUpdated: string | null
}

// weight = 0.5^(daysSince/21): results 21 days ago count half as much
function decayWeight(createdAt: string, nowMs: number): number {
  const daysSince = Math.max(0, (nowMs - new Date(createdAt).getTime()) / 86400000)
  return Math.pow(0.5, daysSince / 21)
}

export function computeProjection(
  simulacros: SimulacroRow[],
  examenes: ExamenRow[],
): SubjectProjection[] {
  const nowMs = Date.now()
  const MS_30D = 30 * 86400000
  const MS_7D = 7 * 86400000
  const MS_14D = 14 * 86400000
  const bySubject = new Map<string, Accumulator>()

  function getAcc(asignatura: string): Accumulator {
    if (!bySubject.has(asignatura)) {
      bySubject.set(asignatura, {
        weightedSum: 0, weightTotal: 0, entries: 0,
        recentEntries: 0,
        sum7d: 0, count7d: 0,
        sumPrev7d: 0, countPrev7d: 0,
        lastUpdated: null,
      })
    }
    return bySubject.get(asignatura)!
  }

  function addEntry(rawAsignatura: string, nota010: number, createdAt: string) {
    const asignatura = normalizeSubject(rawAsignatura)
    const msAgo = nowMs - new Date(createdAt).getTime()
    const w = decayWeight(createdAt, nowMs)
    const a = getAcc(asignatura)
    a.weightedSum += nota010 * w
    a.weightTotal += w
    a.entries++
    if (msAgo <= MS_30D) a.recentEntries++
    if (msAgo <= MS_7D) { a.sum7d += nota010; a.count7d++ }
    else if (msAgo <= MS_14D) { a.sumPrev7d += nota010; a.countPrev7d++ }
    if (!a.lastUpdated || createdAt > a.lastUpdated) a.lastUpdated = createdAt
  }

  for (const s of simulacros) {
    if (!s.asignatura) continue
    if (s.nota_final !== null && s.nota_final !== undefined) {
      addEntry(s.asignatura, s.nota_final, s.created_at)
    } else {
      const bloques = s.resultado_json?.desglose_bloques ?? []
      let totalPts = 0, maxPts = 0
      for (const b of bloques) {
        const got = b.puntos_conseguidos ?? 0
        const max = b.puntos_maximos ?? 0
        if (max > 0) { totalPts += got; maxPts += max }
      }
      if (maxPts > 0) addEntry(s.asignatura, (totalPts / maxPts) * 10, s.created_at)
    }
  }

  for (const e of examenes) {
    if (!e.asignatura || e.nota === null || e.nota_maxima === null || e.nota_maxima === 0) continue
    addEntry(e.asignatura, (e.nota / e.nota_maxima) * 10, e.created_at)
  }

  const results: SubjectProjection[] = []
  for (const [asignatura, data] of bySubject) {
    const confidence: SubjectProjection['confidence'] =
      data.recentEntries < 3 ? 'low' : data.recentEntries < 10 ? 'medium' : 'high'
    const trend_7d =
      data.count7d > 0 && data.countPrev7d > 0
        ? Math.round((data.sum7d / data.count7d - data.sumPrev7d / data.countPrev7d) * 10) / 10
        : null
    results.push({
      asignatura,
      nota_proyectada: data.weightTotal > 0
        ? Math.round((data.weightedSum / data.weightTotal) * 10) / 10
        : null,
      num_entries: data.entries,
      recent_entries: data.recentEntries,
      confidence,
      trend_7d,
      last_updated: data.lastUpdated,
    })
  }
  return results.sort((a, b) => a.asignatura.localeCompare(b.asignatura))
}
