'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export interface InternalUserStatus {
  loading: boolean
  isInternalUser: boolean
}

const INITIAL: InternalUserStatus = { loading: true, isInternalUser: false }

export function useIsInternalUser(): InternalUserStatus {
  const [status, setStatus] = useState<InternalUserStatus>(INITIAL)

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          if (!cancelled) setStatus({ loading: false, isInternalUser: false })
          return
        }
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        const data = res.ok ? await res.json() : { isAdmin: false }
        if (!cancelled) setStatus({ loading: false, isInternalUser: data?.isAdmin === true })
      } catch {
        if (!cancelled) setStatus({ loading: false, isInternalUser: false })
      }
    }
    void run()
    return () => { cancelled = true }
  }, [])

  return status
}
