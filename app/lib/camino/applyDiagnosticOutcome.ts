import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { recordBetaMetric } from '@/app/lib/betaMetrics'
import { planQueueAdjustment } from './diagnosticAdjustment'
import {
  evaluateDiagnostic,
  nextAverage,
  type DiagnosticOutcome,
} from './knowledgeState'

// Qué hace el Camino con el resultado de un microdiagnóstico.
//
// APROBADO  → 'con_evidencia'. La declaración queda confirmada y el punto de
//             entrada se mantiene: ese bloque sigue en repaso express.
// SUSPENDIDO→ 'refutado'. El alumno creía tenerlo y no lo tiene, así que
//             recupera la lección completa: las filas de cola de ESE bloque
//             vuelven de 'review express' a 'concept'.
//
// Tres reglas que este módulo no puede romper:
//
//  1. NUNCA escribe queue_status='completed'. Ni al aprobar ni al suspender.
//     Un diagnóstico mueve el punto de ENTRADA; no completa ni descarta
//     temario. Aprobar significa "puedes ir rápido", no "ya está hecho".
//
//  2. Solo toca EL BLOQUE DIAGNOSTICADO. Nada de reconstruir el Camino.
//     El UPDATE va filtrado por (user_id, subject, block_slug) y además
//     restringido a queue_status='pending': lo ya completado, lo que está
//     programado en el calendario y cualquier fila que el alumno haya
//     tocado a mano se quedan exactamente como están.
//
//  3. NUNCA promueve a 'dominado'. Esa transición vive aislada en
//     knowledgeState.canPromoteToDominado y hoy no la invoca nadie.

export type DiagnosticContext = {
  missionId: string
  subject: string
  blockSlug: string
}

export type DiagnosticResult = {
  outcome: DiagnosticOutcome
  adjustedQueueRows: number
}

/**
 * Lee la fila de camino_calendar de una misión recién corregida y, si es un
 * microdiagnóstico, devuelve su contexto. Null para cualquier otra misión.
 */
export async function diagnosticContextForMission(
  db: SupabaseClient,
  userId: string,
  missionId: string,
): Promise<DiagnosticContext | null> {
  const { data } = await db
    .from('camino_calendar')
    .select('subject, block_slug, metadata')
    .eq('id', missionId)
    .eq('user_id', userId)
    .maybeSingle()
  if (!data) return null
  const meta = (data.metadata ?? {}) as Record<string, unknown>
  const blockSlug = typeof meta.diagnostic_for === 'string' ? meta.diagnostic_for : null
  if (!blockSlug) return null
  return { missionId, subject: String(data.subject), blockSlug }
}

/**
 * Aplica el resultado. Best-effort: si algo falla, la corrección del alumno
 * ya está guardada y el Camino se queda como estaba.
 */
export async function applyDiagnosticOutcome(
  db: SupabaseClient,
  userId: string,
  context: DiagnosticContext,
  scoreOnTen: number,
): Promise<DiagnosticResult | null> {
  try {
    const outcome = evaluateDiagnostic(scoreOnTen)
    const now = new Date().toISOString()

    const { data: existing } = await db
      .from('student_block_knowledge')
      .select('evidence_attempts, evidence_avg_score')
      .eq('user_id', userId)
      .eq('subject', context.subject)
      .eq('block_slug', context.blockSlug)
      .maybeSingle()

    const attempts = existing?.evidence_attempts ?? 0
    const avg = typeof existing?.evidence_avg_score === 'number' ? existing.evidence_avg_score : null

    await db.from('student_block_knowledge').upsert({
      user_id: userId,
      subject: context.subject,
      block_slug: context.blockSlug,
      state: outcome,
      evidence_attempts: attempts + 1,
      evidence_avg_score: nextAverage(avg, attempts, scoreOnTen),
      // mastery_attempts NO se toca: un diagnóstico no cuenta para dominio.
      last_evidence_at: now,
      diagnostic_completed_at: now,
      updated_at: now,
    }, { onConflict: 'user_id,subject,block_slug' })

    await recordBetaMetric(db, userId, 'diagnostic_completed', {
      subject: context.subject,
      block_slug: context.blockSlug,
      score_on_ten: scoreOnTen,
      outcome,
    })
    await recordBetaMetric(
      db, userId,
      outcome === 'con_evidencia' ? 'diagnostic_passed' : 'diagnostic_refuted',
      { subject: context.subject, block_slug: context.blockSlug, score_on_ten: scoreOnTen },
    )

    const adjustedQueueRows = outcome === 'refutado'
      ? await revertBlockToConcept(db, userId, context)
      : 0

    await recordBetaMetric(db, userId, 'diagnostic_camino_adjusted', {
      subject: context.subject,
      block_slug: context.blockSlug,
      outcome,
      effect: outcome === 'refutado' ? 'review_express_to_concept' : 'entry_point_confirmed',
      adjusted_queue_rows: adjustedQueueRows,
    })

    return { outcome, adjustedQueueRows }
  } catch (error) {
    console.warn('[camino/diagnostic] outcome skipped:', (error as Error)?.message?.slice(0, 200))
    return null
  }
}

/**
 * Devuelve las filas de cola de ESTE bloque de repaso express a lección
 * completa.
 *
 * Solo `queue_status='pending'`: una fila 'completed' es trabajo ya hecho,
 * una 'scheduled' ya tiene sitio en el calendario y una 'inactive' está
 * fuera por otro motivo. Ninguna se toca. Tampoco se borra ni se recrea
 * nada — es un UPDATE de metadata sobre las filas que aún no han entrado en
 * juego, que es exactamente "ajustar el punto de entrada futuro".
 */
async function revertBlockToConcept(
  db: SupabaseClient,
  userId: string,
  context: DiagnosticContext,
): Promise<number> {
  const { data: rows } = await db
    .from('user_learning_queue')
    .select('id, subject, block_slug, queue_status, metadata')
    .eq('user_id', userId)
    .eq('subject', context.subject)
    .eq('block_slug', context.blockSlug)
    .eq('queue_status', 'pending')

  const candidates = ((rows ?? []) as Array<{
    id: string
    subject: string
    block_slug: string | null
    queue_status: string
    metadata: Record<string, unknown> | null
  }>).map(row => ({
    id: row.id,
    subject: row.subject,
    blockSlug: row.block_slug,
    queueStatus: row.queue_status,
    metadata: row.metadata,
  }))

  // Qué se cambia y cómo lo decide una función pura (ver
  // diagnosticAdjustment.ts), donde está fijado por tests que esto no puede
  // tocar otro bloque, ni trabajo ya hecho, ni escribir queue_status.
  const adjustments = planQueueAdjustment(candidates, {
    subject: context.subject,
    blockSlug: context.blockSlug,
    at: new Date().toISOString(),
  })

  let adjusted = 0
  for (const adjustment of adjustments) {
    const { error } = await db
      .from('user_learning_queue')
      .update({ metadata: adjustment.metadata })
      .eq('id', adjustment.id)
      .eq('user_id', userId)
      .eq('queue_status', 'pending')
    if (!error) adjusted += 1
  }

  return adjusted
}
