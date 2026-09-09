import { supabase } from '@/app/lib/supabase'

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

const OPTIONAL_HISTORY_FIELDS = [
  'why_it_works',
  'why_it_works_context',
  'detected_concepts',
  'curriculum_source_ids',
] as const

function legacyPayload(payload: ExamHistoryPayload) {
  const result = { ...payload } as Record<string, unknown>
  for (const field of OPTIONAL_HISTORY_FIELDS) delete result[field]
  return result
}

function isMissingOptionalColumn(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? ''
  return error?.code === 'PGRST204' && OPTIONAL_HISTORY_FIELDS.some(field => message.includes(field))
}

/**
 * Persists a correction under the authenticated user's RLS identity, then asks
 * the server to award XP with the signed grant returned by the correction API.
 * A failed XP request does not undo a successfully saved correction.
 */
export async function saveExamHistory({
  historyId,
  payload,
  accessToken,
  xpGrant,
}: {
  historyId: string
  payload: ExamHistoryPayload
  accessToken: string
  xpGrant?: string | null
}): Promise<{ historyId: string; xp: ExamXpResult | null; xpPending: boolean }> {
  // The insert is authorized by Supabase RLS using the current access token.
  // Reading the already validated local session avoids a second network auth
  // round-trip between correction and persistence (and its avoidable failure
  // window) without weakening ownership enforcement.
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  const session = sessionData.session
  const sessionUserId = session?.user.id
  if (sessionError || !sessionUserId || session?.access_token !== accessToken) {
    throw new Error('Tu sesión ha caducado. Vuelve a iniciar sesión para guardar la corrección.')
  }

  const fullPayload = { id: historyId, user_id: sessionUserId, ...payload }
  let insertResult = await supabase.from('historial_examenes').insert(fullPayload).select('id').single()
  if (insertResult.error && isMissingOptionalColumn(insertResult.error)) {
    insertResult = await supabase
      .from('historial_examenes')
      .insert({ id: historyId, user_id: sessionUserId, ...legacyPayload(payload) })
      .select('id')
      .single()
  }
  if (insertResult.error || !insertResult.data?.id) {
    throw new Error('La corrección está lista, pero no se ha podido guardar en Historial. Reintenta antes de salir de esta pantalla.')
  }

  if (payload.nota == null || !xpGrant) return { historyId, xp: null, xpPending: payload.nota != null }

  try {
    const response = await fetch('/api/camino/award-exam-xp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ historialExamenId: historyId, xpGrant }),
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
