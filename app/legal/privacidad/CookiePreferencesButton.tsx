'use client'

import { useCookieConsent } from '@/app/lib/analytics/CookieConsentContext'

export default function CookiePreferencesButton() {
  const { openPreferences } = useCookieConsent()
  return (
    <button
      type="button"
      onClick={openPreferences}
      style={{ color: '#60a5fa', textDecoration: 'underline', background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: 'pointer' }}
    >
      Cambiar mis preferencias de cookies
    </button>
  )
}
