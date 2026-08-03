// Server-only billing utilities — never import in client components.

import { createServiceClient } from './supabase'
import { grantCourtesyAccessIfEligible } from './betaCourtesyAccess'

export interface UserBillingContext {
  hasActivePack: boolean
  planId: string | null
  daysSince: number
}

export async function getUserBillingContext(
  userId: string,
  userCreatedAt: string,
  email?: string | null
): Promise<UserBillingContext> {
  try {
    const db = createServiceClient()
    const now = new Date().toISOString()
    const { data } = await db
      .from('user_entitlements')
      .select('id, plan_id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .limit(1)

    let entitlement = data?.[0] ?? null
    if (!entitlement) {
      entitlement = await grantCourtesyAccessIfEligible(db, userId, email)
    }
    return {
      hasActivePack: entitlement !== null,
      planId: entitlement?.plan_id ?? null,
      daysSince: getDaysSince(userCreatedAt),
    }
  } catch {
    return { hasActivePack: false, planId: null, daysSince: getDaysSince(userCreatedAt) }
  }
}

export function getDaysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000)
}

export async function getMonthlyActionCount(userId: string, actions: string[]): Promise<number> {
  try {
    const db = createServiceClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { count } = await db
      .from('ai_usage_events')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('action', actions)
      .eq('status', 'success')
      .gte('created_at', startOfMonth)
    return count ?? 0
  } catch {
    return 0
  }
}

export async function getMonthlyUniqueActionCount(
  userId: string,
  actions: string[],
  metadataKey = 'creditKey'
): Promise<number> {
  try {
    const db = createServiceClient()
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const { data } = await db
      .from('ai_usage_events')
      .select('id, action, metadata')
      .eq('user_id', userId)
      .in('action', actions)
      .eq('status', 'success')
      .gte('created_at', startOfMonth)

    const uniqueCredits = new Set<string>()
    for (const row of data ?? []) {
      const metadata = row.metadata && typeof row.metadata === 'object'
        ? row.metadata as Record<string, unknown>
        : {}
      const key = metadata[metadataKey]
      uniqueCredits.add(typeof key === 'string' && key.trim()
        ? `${row.action}:${key.trim()}`
        : `${row.action}:event:${row.id}`)
    }
    return uniqueCredits.size
  } catch {
    return getMonthlyActionCount(userId, actions)
  }
}
