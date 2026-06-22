'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export interface ActivePlan {
  planId: string
  expiresAt: string | null
  startedAt: string
  source: string
}

export interface PendingCheckout {
  planId: string
  status: string
  expiresAt: string
}

export interface BillingStatus {
  loading: boolean
  hasActivePack: boolean
  activePlans: ActivePlan[]
  pendingParentCheckout: PendingCheckout | null
}

const INITIAL: BillingStatus = {
  loading: true,
  hasActivePack: false,
  activePlans: [],
  pendingParentCheckout: null,
}

async function fetchBillingStatus() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) return null
  const res = await globalThis.fetch('/api/billing/me', {
    headers: { Authorization: `Bearer ${session.access_token}` }
  })
  if (!res.ok) return null
  return await res.json()
}

export function useBillingStatus(): BillingStatus & { refresh: () => void } {
  const [status, setStatus] = useState<BillingStatus>(INITIAL)

  const refresh = useCallback(async () => {
    try {
      const data = await fetchBillingStatus()
      setStatus(data
        ? { loading: false, hasActivePack: data.hasActivePack ?? false, activePlans: data.activePlans ?? [], pendingParentCheckout: data.pendingParentCheckout ?? null }
        : { loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null }
      )
    } catch {
      setStatus({ loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null })
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const data = await fetchBillingStatus()
        if (cancelled) return
        setStatus(data
          ? { loading: false, hasActivePack: data.hasActivePack ?? false, activePlans: data.activePlans ?? [], pendingParentCheckout: data.pendingParentCheckout ?? null }
          : { loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null }
        )
      } catch {
        if (!cancelled) setStatus({ loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null })
      }
    }
    void run()
    return () => { cancelled = true }
  }, [])

  return { ...status, refresh }
}
