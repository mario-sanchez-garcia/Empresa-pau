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

export function useBillingStatus(): BillingStatus & { refresh: () => void } {
  const [status, setStatus] = useState<BillingStatus>(INITIAL)

  const fetch = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setStatus({ loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null })
      return
    }
    try {
      const res = await globalThis.fetch('/api/billing/me', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (!res.ok) {
        setStatus({ loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null })
        return
      }
      const data = await res.json()
      setStatus({
        loading: false,
        hasActivePack: data.hasActivePack ?? false,
        activePlans: data.activePlans ?? [],
        pendingParentCheckout: data.pendingParentCheckout ?? null,
      })
    } catch {
      setStatus({ loading: false, hasActivePack: false, activePlans: [], pendingParentCheckout: null })
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { ...status, refresh: fetch }
}
