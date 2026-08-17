'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import CookieBanner from '@/app/components/analytics/CookieBanner'
import { initPostHog, optOutPostHog } from '@/app/lib/analytics/posthog'

type ConsentStatus = 'pending' | 'accepted' | 'rejected'

const STORAGE_KEY = 'kairo_cookie_consent'

type CookieConsentCtx = {
  status: ConsentStatus
  openPreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentCtx>({
  status: 'pending',
  openPreferences: () => {},
})

export function useCookieConsent() {
  return useContext(CookieConsentContext)
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>('pending')
  const [preferencesOpen, setPreferencesOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'accepted' || stored === 'rejected') {
      setStatus(stored)
      if (stored === 'accepted') initPostHog()
    }
  }, [])

  const acceptAll = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'accepted')
    setStatus('accepted')
    setPreferencesOpen(false)
    initPostHog()
  }, [])

  const rejectAll = useCallback(() => {
    window.localStorage.setItem(STORAGE_KEY, 'rejected')
    setStatus('rejected')
    setPreferencesOpen(false)
    optOutPostHog()
  }, [])

  const openPreferences = useCallback(() => setPreferencesOpen(true), [])

  return (
    <CookieConsentContext.Provider value={{ status, openPreferences }}>
      {children}
      {(status === 'pending' || preferencesOpen) && (
        <CookieBanner
          onAccept={acceptAll}
          onReject={rejectAll}
          onClose={() => setPreferencesOpen(false)}
          showCloseButton={preferencesOpen && status !== 'pending'}
        />
      )}
    </CookieConsentContext.Provider>
  )
}
