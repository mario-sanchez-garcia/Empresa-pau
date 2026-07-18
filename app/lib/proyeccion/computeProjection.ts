export interface BlockProjection {
  bloque: string
  nota_proyectada: number    // 0-10 weighted average
  num_entries: number
  avg_max_pts: number | null // average max points for this block in a full exam
}

export interface SubjectProjection {
  asignatura: string
  nota_proyectada: number | null
  num_entries: number
  recent_entries: number          // entries in last 30 days
  confidence: 'low' | 'medium' | 'high'
  trend_7d: number | null         // avg(last 7d) - avg(prev 7d), null if insufficient data
  last_updated: string | null
  bloques: BlockProjection[]      // sorted weakest first (ascending nota_proyectada)
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
      tema?: string
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
  bloque: string | null
  created_at: string
}

type SubjectAcc = {
  weightedSum: number
  weightTotal: number
  entries: number
  recentEntries: number
  sum7d: number
  count7d: number
  sumPrev7d: number
  countPrev7d: number
  lastUpdated: string | null
}

type BlockAcc = {
  weightedSum: number
  weightTotal: number
  entries: number
  sumMaxPts: number
  countMaxPts: number
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

  const bySubject = new Map<string, SubjectAcc>()
  // subject → block → accumulator
  const bySubjectBlocks = new Map<string, Map<string, BlockAcc>>()

  function getSubjectAcc(asignatura: string): SubjectAcc {
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

  function getBlockAcc(asignatura: string, bloque: string): BlockAcc {
    if (!bySubjectBlocks.has(asignatura)) bySubjectBlocks.set(asignatura, new Map())
    const blockMap = bySubjectBlocks.get(asignatura)!
    if (!blockMap.has(bloque)) {
      blockMap.set(bloque, { weightedSum: 0, weightTotal: 0, entries: 0, sumMaxPts: 0, countMaxPts: 0 })
    }
    return blockMap.get(bloque)!
  }

  function addSubjectEntry(rawAsignatura: string, nota010: number, createdAt: string) {
    const asignatura = normalizeSubject(rawAsignatura)
    const msAgo = nowMs - new Date(createdAt).getTime()
    const w = decayWeight(createdAt, nowMs)
    const a = getSubjectAcc(asignatura)
    a.weightedSum += nota010 * w
    a.weightTotal += w
    a.entries++
    if (msAgo <= MS_30D) a.recentEntries++
    if (msAgo <= MS_7D) { a.sum7d += nota010; a.count7d++ }
    else if (msAgo <= MS_14D) { a.sumPrev7d += nota010; a.countPrev7d++ }
    if (!a.lastUpdated || createdAt > a.lastUpdated) a.lastUpdated = createdAt
  }

  function addBlockEntry(rawAsignatura: string, bloque: string, nota010: number, createdAt: string, maxPts: number | null) {
    if (!bloque.trim()) return
    const asignatura = normalizeSubject(rawAsignatura)
    const w = decayWeight(createdAt, nowMs)
    const b = getBlockAcc(asignatura, bloque.trim())
    b.weightedSum += nota010 * w
    b.weightTotal += w
    b.entries++
    if (maxPts !== null && maxPts > 0) { b.sumMaxPts += maxPts; b.countMaxPts++ }
    // Ensure the subject accumulator exists even if addSubjectEntry wasn't called for this subject
    getSubjectAcc(asignatura)
  }

  for (const s of simulacros) {
    if (!s.asignatura) continue
    const bloques = s.resultado_json?.desglose_bloques ?? []
    if (s.nota_final !== null && s.nota_final !== undefined) {
      addSubjectEntry(s.asignatura, s.nota_final, s.created_at)
    } else {
      // fall back to block aggregate when nota_final is null
      let totalPts = 0, maxPts = 0
      for (const b of bloques) {
        const got = b.puntos_conseguidos ?? 0
        const max = b.puntos_maximos ?? 0
        if (max > 0) { totalPts += got; maxPts += max }
      }
      if (maxPts > 0) addSubjectEntry(s.asignatura, (totalPts / maxPts) * 10, s.created_at)
    }
    // Per-block entries (independent of whether nota_final exists)
    for (const b of bloques) {
      const max = b.puntos_maximos ?? 0
      const got = b.puntos_conseguidos ?? 0
      if (b.tema && max > 0) {
        addBlockEntry(s.asignatura, b.tema, (got / max) * 10, s.created_at, max)
      }
    }
  }

  for (const e of examenes) {
    if (!e.asignatura || e.nota === null || e.nota_maxima === null || e.nota_maxima === 0) continue
    const nota010 = (e.nota / e.nota_maxima) * 10
    addSubjectEntry(e.asignatura, nota010, e.created_at)
    if (e.bloque) {
      addBlockEntry(e.asignatura, e.bloque, nota010, e.created_at, e.nota_maxima)
    }
  }

  const results: SubjectProjection[] = []
  for (const [asignatura, data] of bySubject) {
    const confidence: SubjectProjection['confidence'] =
      data.recentEntries < 3 ? 'low' : data.recentEntries < 10 ? 'medium' : 'high'
    const trend_7d =
      data.count7d > 0 && data.countPrev7d > 0
        ? Math.round((data.sum7d / data.count7d - data.sumPrev7d / data.countPrev7d) * 10) / 10
        : null

    const blockMap = bySubjectBlocks.get(asignatura) ?? new Map<string, BlockAcc>()
    const bloques: BlockProjection[] = []
    for (const [bloque, bData] of blockMap) {
      if (bData.weightTotal === 0) continue
      bloques.push({
        bloque,
        nota_proyectada: Math.round((bData.weightedSum / bData.weightTotal) * 10) / 10,
        num_entries: bData.entries,
        avg_max_pts: bData.countMaxPts > 0 ? Math.round((bData.sumMaxPts / bData.countMaxPts) * 10) / 10 : null,
      })
    }
    bloques.sort((a, b) => a.nota_proyectada - b.nota_proyectada) // weakest first

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
      bloques,
    })
  }
  return results.sort((a, b) => a.asignatura.localeCompare(b.asignatura))
}
