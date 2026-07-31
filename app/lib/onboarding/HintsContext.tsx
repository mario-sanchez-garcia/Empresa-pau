'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { VALID_HINT_KEYS, type HintKey } from '@/app/lib/onboarding/hintsConfig'

type HintsCtx = {
  seenKeys: Set<HintKey>
  markSeen: (key: HintKey) => void
  isLoaded: boolean
}

const HintsContext = createContext<HintsCtx>({
  seenKeys: new Set(),
  markSeen: () => {},
  isLoaded: false,
})

export function useHints() {
  return useContext(HintsContext)
}

export function HintsProvider({ children }: { children: React.ReactNode }) {
  const [seenKeys, setSeenKeys] = useState<Set<HintKey>>(new Set())
  const [isLoaded, setIsLoaded] = useState(false)
  // Keys marked before the initial load completes — flushed into the set once loaded
  const pendingRef = useRef<HintKey[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) { setIsLoaded(true); return }
      fetch('/api/onboarding/hints-seen', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.ok ? r.json() : { seenKeys: [] })
        .then((d: { seenKeys: HintKey[] }) => {
          const set = new Set<HintKey>(d.seenKeys)
          for (const k of pendingRef.current) set.add(k)
          setSeenKeys(set)
          setIsLoaded(true)
        })
        .catch(() => {
          // On failure assume all seen — never leave the user with stuck hint cards
          setSeenKeys(new Set(VALID_HINT_KEYS))
          setIsLoaded(true)
        })
    })
  }, [])

  function markSeen(key: HintKey) {
    setSeenKeys(prev => new Set([...prev, key]))
    if (!isLoaded) {
      pendingRef.current.push(key)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token
      if (!token) return
      fetch('/api/onboarding/hints-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ key }),
      }).catch(() => undefined)
    })
  }

  return (
    <HintsContext.Provider value={{ seenKeys, markSeen, isLoaded }}>
      {children}
    </HintsContext.Provider>
  )
}
