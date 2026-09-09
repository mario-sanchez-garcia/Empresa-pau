'use client'

import { useEffect, useRef } from 'react'

const DRAFT_PREFIX = 'kairo:exam-draft:v1'
const MAX_DRAFT_CHARS = 20_000

export function examTextDraftKey(parts: Array<string | number | null | undefined>) {
  const stableParts = parts.map(part => encodeURIComponent(String(part ?? '')))
  return `${DRAFT_PREFIX}:${stableParts.join(':')}`
}

/** Keeps text answers recoverable across question changes and F5 without
 * sending keystrokes to the server. Images intentionally stay in memory only. */
export function useExamTextDraft(
  storageKey: string | null,
  value: string,
  setValue: (value: string) => void,
) {
  const hydrationRef = useRef<{ key: string; value: string } | null>(null)

  useEffect(() => {
    if (!storageKey) return
    let stored = ''
    try {
      stored = window.localStorage.getItem(storageKey) ?? ''
    } catch { /* localStorage may be unavailable in privacy mode */ }
    hydrationRef.current = { key: storageKey, value: stored }
    setValue(stored)
  }, [setValue, storageKey])

  useEffect(() => {
    if (!storageKey) return
    const hydration = hydrationRef.current
    if (hydration?.key === storageKey) {
      if (value === hydration.value) hydrationRef.current = null
      return
    }
    try {
      if (value) window.localStorage.setItem(storageKey, value.slice(0, MAX_DRAFT_CHARS))
      else window.localStorage.removeItem(storageKey)
    } catch { /* draft persistence is best-effort */ }
  }, [storageKey, value])
}
