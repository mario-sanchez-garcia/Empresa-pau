export interface SubjectProjection {
  asignatura: string
  nota_proyectada: number | null
  num_entries: number
  last_updated: string | null
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
  lastUpdated: string | null
}

// weight = 0.5^(daysSince/21): results from 21 days ago count half as much
function decayWeight(createdAt: string, nowMs: number): number {
  const daysSince = Math.max(0, (nowMs - new Date(createdAt).getTime()) / 86400000)
  return Math.pow(0.5, daysSince / 21)
}

export function computeProjection(
  simulacros: SimulacroRow[],
  examenes: ExamenRow[],
): SubjectProjection[] {
  const nowMs = Date.now()
  const bySubject = new Map<string, Accumulator>()

  function getAcc(asignatura: string): Accumulator {
    if (!bySubject.has(asignatura)) {
      bySubject.set(asignatura, { weightedSum: 0, weightTotal: 0, entries: 0, lastUpdated: null })
    }
    return bySubject.get(asignatura)!
  }

  function addEntry(asignatura: string, nota010: number, createdAt: string) {
    const w = decayWeight(createdAt, nowMs)
    const a = getAcc(asignatura)
    a.weightedSum += nota010 * w
    a.weightTotal += w
    a.entries++
    if (!a.lastUpdated || createdAt > a.lastUpdated) a.lastUpdated = createdAt
  }

  for (const s of simulacros) {
    if (!s.asignatura) continue
    if (s.nota_final !== null && s.nota_final !== undefined) {
      addEntry(s.asignatura, s.nota_final, s.created_at)
    } else {
      // fall back to block aggregate when nota_final is null
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
    results.push({
      asignatura,
      nota_proyectada: data.weightTotal > 0
        ? Math.round((data.weightedSum / data.weightTotal) * 10) / 10
        : null,
      num_entries: data.entries,
      last_updated: data.lastUpdated,
    })
  }
  return results.sort((a, b) => a.asignatura.localeCompare(b.asignatura))
}
