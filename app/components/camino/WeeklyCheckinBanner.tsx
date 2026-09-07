'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

const CHECKIN_INTERVAL_DAYS = 7

export default function WeeklyCheckinBanner() {
  const router = useRouter()
  const [visible, setVisible] = useState(false)
  const [dailyMinutes, setDailyMinutes] = useState<number | null>(null)
  const [busy, setBusy] = useState<'confirm' | 'dismiss' | 'change' | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [error, setError] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }, [])

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
    if (!token) return false
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ mark_weekly_checkin: true }),
    }).catch(() => null)
    return response?.ok === true
  }

  async function confirmSame() {
    setBusy('confirm')
    setError(false)
    try {
      const saved = await markCheckin()
      if (!saved) {
        setError(true)
        return
      }
      setConfirmed(true)
      closeTimer.current = setTimeout(() => setVisible(false), 650)
    } finally {
      setBusy(null)
    }
  }

  async function dismiss() {
    setBusy('dismiss')
    setError(false)
    try {
      const saved = await markCheckin()
      if (!saved) {
        setError(true)
        return
      }
      setVisible(false)
    } finally {
      setBusy(null)
    }
  }

  async function goChange() {
    setBusy('change')
    setError(false)
    const saved = await markCheckin()
    if (!saved) {
      setError(true)
      setBusy(null)
      return
    }
    router.push('/settings?focus=availability')
  }

  if (!visible) return null

  return (
    <aside className="weekly-checkin-card" role="dialog" aria-label="Comprobación semanal de disponibilidad">
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3, lineHeight: 1.4 }}>
          {confirmed ? 'Entendido ✓' : dailyMinutes ? `¿Sigues estudiando ${dailyMinutes} min/día?` : '¿Tu tiempo de estudio sigue igual?'}
        </p>
        {!confirmed && <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5, marginBottom: 10 }}>
          Así tu semana sigue encajando contigo.
        </p>}
        {error && <p role="alert" style={{ fontSize: 11, fontWeight: 700, color: '#b91c1c', marginBottom: 8 }}>No se ha podido guardar. Reinténtalo.</p>}
        {!confirmed && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={confirmSame}
            disabled={busy !== null}
            style={{ padding: '7px 12px', borderRadius: 8, border: 'none', background: '#2563eb', color: 'white', fontSize: 11, fontWeight: 800, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.7 : 1 }}
          >
            Sigo igual
          </button>
          <button
            onClick={goChange}
            disabled={busy !== null}
            style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', color: '#334155', fontSize: 11, fontWeight: 800, cursor: busy ? 'default' : 'pointer' }}
          >
            {busy === 'change' ? 'Abriendo…' : 'Cambiarlo'}
          </button>
        </div>}
      </div>
      <button
        onClick={dismiss}
        disabled={busy !== null}
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: busy ? 'default' : 'pointer', color: '#94a3b8', padding: 2, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Ahora no"
      >
        <X size={15} />
      </button>
      <style jsx>{`
        .weekly-checkin-card {
          position: fixed;
          right: 190px;
          bottom: 22px;
          z-index: 45;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          width: min(340px, calc(100vw - 32px));
          padding: 15px 16px;
          border: 1px solid rgba(148, 163, 184, .3);
          border-radius: 18px;
          background: rgba(248, 250, 252, .94);
          box-shadow: 0 18px 48px rgba(15, 23, 42, .16), inset 0 1px 0 rgba(255, 255, 255, .9);
          backdrop-filter: blur(18px);
        }
        @media (max-width: 640px) {
          .weekly-checkin-card {
            right: 16px;
            bottom: calc(136px + env(safe-area-inset-bottom));
          }
        }
      `}</style>
    </aside>
  )
}
