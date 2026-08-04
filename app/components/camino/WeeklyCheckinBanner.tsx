'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

const CHECKIN_INTERVAL_DAYS = 7

export default function WeeklyCheckinBanner() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null)
  const [busy, setBusy] = useState<'confirm' | 'dismiss' | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) return
      try {
        const [profileRes, onboardingRes] = await Promise.all([
          fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        if (cancelled || !profileRes.ok) return
        const profile = await profileRes.json() as { last_weekly_checkin_at?: string | null }
        const onboarding = onboardingRes.ok
          ? await onboardingRes.json() as { onboarding?: { dailyMinutes?: number | null; completedAt?: string | null } | null }
          : null
        if (cancelled || !onboarding?.onboarding?.completedAt) return
        const lastCheckin = profile.last_weekly_checkin_at ? new Date(profile.last_weekly_checkin_at) : null
        const dueAgain = !lastCheckin ||
          (Date.now() - lastCheckin.getTime()) >= CHECKIN_INTERVAL_DAYS * 24 * 60 * 60 * 1000
        if (dueAgain) {
          setDailyMinutes(onboarding.onboarding.dailyMinutes ?? null)
          setVisible(true)
        }
      } catch { /* silent — the weekly check-in is a nice-to-have, never blocks the page */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function markCheckin() {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mark_weekly_checkin: true }),
    }).catch(() => undefined)
    return token
  }

  async function confirmSame() {
    setBusy('confirm')
    try {
      const token = await markCheckin()
      if (token) {
        await fetch('/api/camino/ensure-calendar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: true }),
        }).catch(() => undefined)
      }
      setVisible(false)
    } finally {
      setBusy(null)
    }
  }

  async function dismiss() {
    setBusy('dismiss')
    try {
      await markCheckin()
      setVisible(false)
    } finally {
      setBusy(null)
    }
  }

  function goChange() {
    markCheckin()
    router.push('/settings')
  }

  if (!visible) return null

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px', margin: '12px 20px 0',
      background: '#f8fafc', borderLeft: '3px solid #2563eb', borderRadius: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3, lineHeight: 1.4 }}>
          {dailyMinutes ? `¿Sigues con ${dailyMinutes} min/día? ¿Cómo vas?` : '¿Cómo vas esta semana?'}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>
          Cada semana te lo preguntamos para que tu Camino refleje tu ritmo real.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={confirmSame}
            disabled={busy !== null}
            style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 800, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            {busy === 'confirm' ? 'Recalculando…' : 'Sigo igual'}
          </button>
          <button
            onClick={goChange}
            disabled={busy !== null}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 11, fontWeight: 800, cursor: busy ? 'default' : 'pointer' }}
          >
            Quiero cambiarlo
          </button>
        </div>
      </div>
      <button
        onClick={dismiss}
        disabled={busy !== null}
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: busy ? 'default' : 'pointer', color: '#94a3b8', padding: 2, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Ahora no"
      >
        <X size={15} />
      </button>
    </div>
  )
}
