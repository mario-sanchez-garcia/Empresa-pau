'use client'

import { useEffect, useState } from 'react'

export const CCAA_OPTIONS = ['Madrid', 'Cataluña'] as const
export type CCAA = typeof CCAA_OPTIONS[number]

const STORAGE_KEY = 'kairo_ccaa'
const CHANGE_EVENT = 'kairo_ccaa_change'

function isCCAA(value: string | null): value is CCAA {
  return CCAA_OPTIONS.includes(value as CCAA)
}

export function useCCAA() {
  const [ccaa, setCCAAState] = useState<CCAA>('Madrid')

  useEffect(() => {
    function readStoredCCAA() {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (isCCAA(stored)) setCCAAState(stored)
    }

    readStoredCCAA()
    window.addEventListener('storage', readStoredCCAA)
    window.addEventListener(CHANGE_EVENT, readStoredCCAA)
    return () => {
      window.removeEventListener('storage', readStoredCCAA)
      window.removeEventListener(CHANGE_EVENT, readStoredCCAA)
    }
  }, [])

  function setCCAA(nextCCAA: CCAA) {
    setCCAAState(nextCCAA)
    window.localStorage.setItem(STORAGE_KEY, nextCCAA)
    window.dispatchEvent(new Event(CHANGE_EVENT))
  }

  return { ccaa, setCCAA }
}
