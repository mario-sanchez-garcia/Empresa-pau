'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import type { CoverageForecast } from '@/app/lib/camino/coverageForecast'
import type { PlanNotices } from '@/app/lib/camino/planNotices'
export type PlanOverview = { userId: string; notices: PlanNotices; forecast: CoverageForecast }

/** No cache shared between accounts. Late responses never replace a newer account/run. */
export function usePlanOverview() {
  const [state, setState] = useState<PlanOverview | null>(null)
  const [error, setError] = useState(false)
  useEffect(() => {
    let disposed = false, generation = 0
    let controller: AbortController | null = null
    async function load() {
      const current = ++generation
      controller?.abort()
      const abort = new AbortController(); controller = abort
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (disposed || current !== generation) return
        if (!session) { setState(null); setError(false); return }
        const response = await fetch('/api/camino/plan-overview', { headers: { Authorization: `Bearer ${session.access_token}` }, signal: abort.signal })
        if (!response.ok) throw new Error('overview_unavailable')
        const next = await response.json() as PlanOverview
        if (next.userId !== session.user.id) throw new Error('overview_account_mismatch')
        if (!disposed && current === generation) { setState(next); setError(false) }
      } catch {
        if (!disposed && current === generation && !abort.signal.aborted) { setState(null); setError(true) }
      }
    }
    void load()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      ++generation; controller?.abort(); setState(null)
      // Outside the auth callback: avoid holding the auth lock while getSession runs.
      queueMicrotask(() => { if (!disposed) void load() })
    })
    window.addEventListener('camino:updated', load)
    window.addEventListener('focus', load)
    return () => {
      disposed = true; ++generation; controller?.abort(); subscription.unsubscribe()
      window.removeEventListener('camino:updated', load); window.removeEventListener('focus', load)
    }
  }, [])
  return { state, error }
}
