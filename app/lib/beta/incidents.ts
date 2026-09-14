import 'server-only'
import { createHash } from 'node:crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function reportPlanIncident(db: SupabaseClient, userId: string, code: 'plan_failed' | 'plan_degraded' | 'onboarding_failed') {
  // Only an allowlisted code and route: no answers, names, tokens or raw stack traces.
  const route = code === 'onboarding_failed' ? '/onboarding/finalizando' : '/camino'
  const fingerprint = createHash('sha256').update(`${userId}:${code}:${new Date().toISOString().slice(0,10)}`).digest('hex')
  try {
    const { error } = await db.rpc('record_beta_incident', { p_user_id: userId, p_source: 'automatic', p_code: code,
      p_route: route, p_description: '', p_severity: code === 'plan_degraded' ? 'high' : 'blocking', p_fingerprint: fingerprint })
    if (error) console.error('[beta/incidents] storage unavailable', { code })
  } catch { console.error('[beta/incidents] storage unavailable', { code }) }
}
