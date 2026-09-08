'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { CalendarDays, Check, ChevronDown, Link2, Loader2, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

type CalendarStatus =
  | { connected: false; error?: string }
  | { connected: true; accountEmail: string | null; calendarId: string | null; calendarSummary: string | null; lastSyncedAt: string | null; watchExpiration: string | null }

export default function GoogleCalendarConnection({ onOpenCalendar }: { onOpenCalendar: () => void }) {
  const { theme: gcalTheme } = useClayThemePreference()
  const isDark = gcalTheme === 'dark'
  const redText = isDark ? '#f87171' : '#b91c1c'
  const greenText = isDark ? '#4ade80' : '#15803d'
  const [status, setStatus] = useState<CalendarStatus>({ connected: false })
  const [loading, setLoading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [statusError, setStatusError] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const getToken = useCallback(async () => {
    const session = await supabase.auth.getSession()
    return session.data.session?.access_token ?? null
  }, [])

  const refreshStatus = useCallback(async (token?: string | null) => {
    const accessToken = token ?? await getToken()
    if (!accessToken) return
    try {
      const res = await fetch('/api/calendar/google/status', { headers: { Authorization: `Bearer ${accessToken}` } })
      if (!res.ok) throw new Error('status_failed')
      setStatus(await res.json() as CalendarStatus)
      setStatusError(false)
    } catch {
      setStatusError(true)
    }
  }, [getToken])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshStatus()
      const params = new URLSearchParams(window.location.search)
      const calendarResult = params.get('calendar')
      if (calendarResult === 'connected') setMessage('Google Calendar conectado')
      if (calendarResult === 'cancelled') setMessage('Conexión cancelada')
      if (calendarResult === 'error') setMessage('No se ha podido conectar. Reintentar')
      if (calendarResult) {
        params.delete('calendar')
        const next = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}${window.location.hash}`
        window.history.replaceState({}, '', next)
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refreshStatus])

  useEffect(() => {
    if (!menuOpen) return
    function onDocClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [menuOpen])

  async function connect() {
    setLoading(true)
    setMessage('')
    try {
      const token = await getToken()
      if (!token) throw new Error('no_session')
      const res = await fetch('/api/calendar/google/connect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json() as { url?: string }
      if (!res.ok || !json.url) throw new Error('connect_failed')
      window.location.href = json.url
    } catch {
      setMessage('No se ha podido conectar. Reintentar')
      setLoading(false)
    }
  }

  async function disconnect() {
    setLoading(true)
    setMessage('')
    try {
      const token = await getToken()
      if (!token) throw new Error('no_session')
      const confirmed = window.confirm('¿Desconectar Google Calendar? Tus misiones de Kairo no se borrarán.')
      if (!confirmed) { setLoading(false); return }
      const res = await fetch('/api/calendar/google/disconnect', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('disconnect_failed')
      setStatus({ connected: false })
      setMenuOpen(false)
      setMessage('')
    } catch {
      setMessage('No se ha podido desconectar.')
    } finally {
      setLoading(false)
    }
  }

  const buttonBase: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    fontWeight: 800,
    padding: '8px 12px',
    borderRadius: 10,
    cursor: loading ? 'default' : 'pointer',
    border: '1px solid var(--clay-border)',
    background: 'var(--clay-surface)',
    color: 'var(--clay-text)',
    transition: 'all .15s',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    opacity: loading ? 0.72 : 1,
  }

  return (
    <div ref={rootRef} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
      <button type="button" onClick={() => setMenuOpen(v => !v)} disabled={loading} style={buttonBase} aria-expanded={menuOpen}>
        {loading ? <Loader2 size={13} className="animate-spin" /> : <CalendarDays size={13} />}
        Calendario
        {status.connected && <Check size={12} color={greenText} aria-label="Google Calendar conectado" />}
        <ChevronDown size={12} />
      </button>

      {menuOpen && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', zIndex: 60, width: 260, borderRadius: 12, border: '1px solid var(--clay-border)', background: 'var(--clay-surface)', boxShadow: '0 18px 44px rgba(15,23,42,.16)', padding: 6 }}>
          <button type="button" onClick={() => { setMenuOpen(false); onOpenCalendar() }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--clay-surface)', color: 'var(--clay-text)', fontSize: 12, fontWeight: 850, cursor: 'pointer', textAlign: 'left' }}>
            <CalendarDays size={15} color="var(--clay-accent-text)" /> Mi calendario Kairo
          </button>
          <div style={{ height: 1, background: 'var(--clay-border)', margin: '3px 6px' }} />
          {status.connected ? <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px' }}>
              <Check size={14} color={greenText} />
              <span style={{ minWidth: 0, fontSize: 11, fontWeight: 800, color: 'var(--clay-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Google Calendar · {status.accountEmail ?? 'Conectado'}</span>
            </div>
            <button type="button" onClick={disconnect} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '9px 10px', borderRadius: 8, border: 'none', background: 'var(--clay-surface)', color: redText, fontSize: 12, fontWeight: 800, cursor: loading ? 'default' : 'pointer', textAlign: 'left' }}><X size={14} /> Desconectar Google</button>
          </> : (
            <button type="button" onClick={connect} disabled={loading} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '10px', borderRadius: 8, border: 'none', background: 'var(--clay-surface)', color: 'var(--clay-text)', fontSize: 12, fontWeight: 800, cursor: loading ? 'default' : 'pointer', textAlign: 'left' }}><Link2 size={14} /> Conectar Google Calendar</button>
          )}
          {statusError && <button type="button" onClick={() => void refreshStatus()} style={{ border: 0, background: 'transparent', color: redText, fontSize: 11, fontWeight: 800, cursor: 'pointer', padding: '8px 10px' }}>No se pudo comprobar Google · Reintentar</button>}
          {message && <p style={{ margin: '5px 10px', fontSize: 11, fontWeight: 750, color: message.startsWith('No') ? redText : greenText }}>{message}</p>}
        </div>
      )}
    </div>
  )
}
