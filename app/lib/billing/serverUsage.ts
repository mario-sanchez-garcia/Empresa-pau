// Server-only billing utilities — never import in client components.

import { createServiceClient } from './supabase'

export interface UserBillingContext {
  hasActivePack: boolean
  planId: string | null
  daysSince: number
}

export async function getUserBillingContext(
  userId: string,
  userCreatedAt: string
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

    const entitlement = data?.[0] ?? null
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
