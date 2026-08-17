'use client'

import posthog from 'posthog-js'

let loaded = false

// Only called after the user has explicitly accepted analytics cookies —
// never on page load. See CookieConsentContext.
export function initPostHog() {
  if (loaded || typeof window === 'undefined') return
  const key = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST
  if (!key || !host) return

  posthog.init(key, {
    api_host: host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
  })
  loaded = true
}

export function optOutPostHog() {
  if (!loaded) return
  posthog.opt_out_capturing()
  posthog.reset()
}

export { posthog }
