export type ExamHistoryPayload = {
  asignatura: string
  tipo: string
  año: number | null | undefined
  bloque: string | null
  opcion: string | null
  nota: number | null
  nota_maxima: number | null
  enunciado: string
  respuesta: string
  correccion: string
  repeated_from_id?: string | null
  v2_sort_order?: number | null
  why_it_works?: string | null
  why_it_works_context?: unknown
  detected_concepts?: string[]
  curriculum_source_ids?: string[]
}

export type ExamXpResult = {
  success: boolean
  xpAwarded: number
  bonusXp: number
  improved?: boolean | null
  streakDays?: number
  leagueUpgrade?: { from: string; to: string }
}

/**
 * Persists a correction through the authenticated server boundary that verifies
 * the signed score grant, then optionally asks the existing XP endpoint to
 * A failed XP request does not undo a successfully saved correction.
 */
export async function saveExamHistory({
  historyId,
  payload,
  accessToken,
  xpGrant,
  awardXp = true,
}: {
  historyId: string
  payload: ExamHistoryPayload
  accessToken: string
  xpGrant?: string | null
  awardXp?: boolean
}): Promise<{ historyId: string; xp: ExamXpResult | null; xpPending: boolean }> {
  if (payload.nota == null || !xpGrant) {
    throw new Error('La corrección no tiene una autorización válida para guardarse en Historial.')
  }
  const insertResponse = await fetch('/api/exam/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ historyId, payload, xpGrant }),
    signal: AbortSignal.timeout(15_000),
  })
  const insertJson = await insertResponse.json().catch(() => null) as { id?: string } | null
  if (!insertResponse.ok || insertJson?.id !== historyId) {
    throw new Error('La corrección está lista, pero no se ha podido guardar en Historial. Reintenta antes de salir de esta pantalla.')
  }

  if (!awardXp) return { historyId, xp: null, xpPending: false }

  try {
    const response = await fetch('/api/camino/award-exam-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ historialExamenId: historyId, xpGrant }),
      signal: AbortSignal.timeout(15_000),
    })
    const json = await response.json().catch(() => null) as Partial<ExamXpResult> | null
    if (!response.ok || !json?.success || typeof json.xpAwarded !== 'number') {
      return { historyId, xp: null, xpPending: true }
    }
    return {
      historyId,
      xp: {
        success: true,
        xpAwarded: json.xpAwarded,
        bonusXp: typeof json.bonusXp === 'number' ? json.bonusXp : 0,
        improved: typeof json.improved === 'boolean' ? json.improved : null,
        streakDays: typeof json.streakDays === 'number' ? json.streakDays : undefined,
        leagueUpgrade: json.leagueUpgrade && typeof json.leagueUpgrade === 'object'
          ? json.leagueUpgrade as { from: string; to: string }
          : undefined,
      },
      xpPending: false,
    }
  } catch {
    return { historyId, xp: null, xpPending: true }
  }
}
