import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

export type DurableRateLimitResult =
  | { ok: true; allowed: true }
  | { ok: true; allowed: false; retryAfterSeconds: number }
  | { ok: false }

export async function reserveAuthEmailAttempt(
  db: SupabaseClient,
  input: { email: string; ip: string; action: 'signup_confirmation' | 'password_recovery' },
): Promise<DurableRateLimitResult> {
  const { data, error } = await db.rpc('reserve_auth_email_attempt', {
    p_email: input.email,
    p_ip: input.ip,
    p_action: input.action,
    p_email_window_seconds: 60,
    p_email_limit: 1,
    p_ip_window_seconds: 3600,
    p_ip_limit: 12,
  })
  if (error) return { ok: false }
  const row = Array.isArray(data) ? data[0] : data
  if (!row || row.allowed !== true) {
    return { ok: true, allowed: false, retryAfterSeconds: Math.max(1, Number(row?.retry_after_seconds) || 60) }
  }
  return { ok: true, allowed: true }
}

export async function reserveApiAttempt(
  db: SupabaseClient,
  input: { key: string; action: 'onboarding_draft'; limit: number; windowSeconds: number },
): Promise<DurableRateLimitResult> {
  const { data, error } = await db.rpc('reserve_api_rate_limit', {
    p_key: input.key,
    p_action: input.action,
    p_limit: input.limit,
    p_window_seconds: input.windowSeconds,
  })
  if (error) return { ok: false }
  const row = Array.isArray(data) ? data[0] : data
  if (!row || row.allowed !== true) {
    return { ok: true, allowed: false, retryAfterSeconds: Math.max(1, Number(row?.retry_after_seconds) || input.windowSeconds) }
  }
  return { ok: true, allowed: true }
}

export async function reserveSignupAttempt(
  db: SupabaseClient,
  input: { email: string; ip: string; emailLimit: number; ipLimit: number; windowSeconds: number },
): Promise<DurableRateLimitResult> {
  const { data, error } = await db.rpc('reserve_signup_attempt', {
    p_email: input.email,
    p_ip: input.ip,
    p_email_limit: input.emailLimit,
    p_ip_limit: input.ipLimit,
    p_window_seconds: input.windowSeconds,
  })
  if (error) return { ok: false }
  const row = Array.isArray(data) ? data[0] : data
  if (!row || row.allowed !== true) {
    return { ok: true, allowed: false, retryAfterSeconds: Math.max(1, Number(row?.retry_after_seconds) || input.windowSeconds) }
  }
  return { ok: true, allowed: true }
}
