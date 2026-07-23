import { createServiceClient } from '@/app/lib/billing/supabase'

interface LogEmailEventParams {
  userId: string
  emailType: string
  dedupeKey: string
  status: 'sent' | 'failed' | 'skipped'
  resendMessageId?: string
  metadata?: Record<string, unknown>
}

/**
 * Inserta en email_events. Devuelve true si se insertó, false si ya existía (conflicto).
 *
 * Uso como lock de dedup (daily-reminder):
 *   const isNew = await logEmailEvent({ ..., status: 'skipped' })
 *   if (!isNew) continue  // ya procesado hoy
 *   // enviar email...
 *   await logEmailEvent({ ..., status: 'sent', resendMessageId: result.id })
 *
 * El segundo insert ('sent') usa upsert para actualizar el estado del lock existente.
 */
export async function logEmailEvent(params: LogEmailEventParams): Promise<boolean> {
  const db = createServiceClient()

  const row = {
    user_id:           params.userId,
    email_type:        params.emailType,
    dedupe_key:        params.dedupeKey,
    status:            params.status,
    resend_message_id: params.resendMessageId ?? null,
    metadata:          params.metadata ?? {},
  }

  if (params.status === 'skipped') {
    // Pure INSERT: used as an atomic check-and-lock. Returns false if the row
    // already exists (unique constraint) — meaning this event was already handled.
    const { error } = await db.from('email_events').insert(row)
    if (error) {
      if (error.code === '23505') return false
      console.error('[logEmailEvent] insert failed:', error.message)
      return false
    }
    return true
  }

  // For 'sent' / 'failed': upsert so we overwrite the 'skipped' lock row with
  // the actual outcome. This keeps the ledger accurate without needing a separate
  // updateEmailEvent helper.
  const { error } = await db
    .from('email_events')
    .upsert(row, { onConflict: 'user_id, email_type, dedupe_key' })
  if (error) {
    console.error('[logEmailEvent] upsert failed:', error.message)
    return false
  }
  return true
}
