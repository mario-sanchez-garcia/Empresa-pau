'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { validateUsername } from '@/app/lib/username'

type Status = 'idle' | 'checking' | 'available' | 'taken' | 'invalid'

// Bloquea toda la app hasta que el alumno tenga username: sin él aparece
// como "Alumno Kairo" en todos los rankings para siempre (ver
// app/lib/camino/rankingNames.ts). Afecta sobre todo a cuentas creadas
// antes del 2026-07-31, cuando el paso de username no existía todavía en
// el onboarding — este gate es el catch-up para esas cuentas.
export default function UsernameGate() {
  const [loading, setLoading] = useState(true)
  const [needsUsername, setNeedsUsername] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const checkId = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(async ({ data }) => {
      const accessToken = data.session?.access_token ?? null
      if (!accessToken || cancelled) { if (!cancelled) setLoading(false); return }
      setToken(accessToken)
      try {
        const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${accessToken}` } })
        if (!res.ok || cancelled) { if (!cancelled) setLoading(false); return }
        const d = await res.json() as { username?: string }
        if (!d.username) {
          const localUsername = loadOnboarding().username?.trim()
          if (localUsername && !validateUsername(localUsername)) {
            try {
              const repairRes = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
                body: JSON.stringify({ username: localUsername }),
              })
              if (repairRes.ok && !cancelled) {
                setNeedsUsername(false)
                setLoading(false)
                return
              }
            } catch { /* best-effort repair for legacy onboarding rows */ }
          }
        }
        if (!cancelled) {
          setNeedsUsername(!d.username)
          setLoading(false)
        }
      } catch {
        if (!cancelled) setLoading(false)
      }
    }).catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  async function checkUsername(u: string): Promise<boolean> {
    const id = ++checkId.current
    if (!u.trim()) { setStatus('idle'); return false }
    setStatus('checking')
    try {
      const res = await fetch(`/api/username/check?u=${encodeURIComponent(u)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (checkId.current !== id) return false
      const d = await res.json() as { available?: boolean; error?: string; suggestions?: string[] }
      if (d.error) {
        setStatus('invalid')
        setError(d.error)
        return false
      }
      if (d.available) {
        setStatus('available')
        return true
      }
      setStatus('taken')
      setSuggestions(d.suggestions ?? [])
      return false
    } catch {
      if (checkId.current === id) setStatus('idle')
      return false
    }
  }

  function onChange(v: string) {
    setValue(v)
    setStatus('idle')
    setError('')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => void checkUsername(v), 350)
  }

  async function submit() {
    if (status !== 'available' || !token || saving) return
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: value.trim() }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'No se pudo guardar. Inténtalo de nuevo.')
        setStatus('invalid')
        setSaving(false)
        return
      }
      setNeedsUsername(false)
    } catch {
      setError('No se pudo guardar. Inténtalo de nuevo.')
      setStatus('invalid')
      setSaving(false)
    }
  }

  if (loading || !needsUsername) return null

  const borderColor = status === 'available' ? '#16a34a' : (status === 'taken' || status === 'invalid') ? '#dc2626' : '#e0e0e0'

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(15,23,42,.88)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: 'white', borderRadius: 16, padding: 28 }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 8 }}>
          Un último paso
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0f172a', margin: '0 0 6px' }}>Elige tu nombre de usuario</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px', lineHeight: 1.4 }}>
          Sin él apareces como &quot;Alumno Kairo&quot; en los rankings. Ponlo para que tus compañeros de liga te reconozcan.
        </p>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${borderColor}`, borderRadius: 10, background: '#fff', padding: '13px 16px', transition: 'border-color .15s' }}>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>@</span>
          <input
            type="text"
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && status === 'available') void submit() }}
            placeholder="tu_usuario"
            autoFocus
            autoComplete="username"
            spellCheck={false}
            style={{ flex: 1, border: 'none', outline: 'none', fontSize: 14, fontWeight: 700, color: '#0f172a' }}
          />
          {status === 'checking' && (
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e0e0e0', borderTopColor: '#2563eb', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
          )}
          {status === 'available' && (
            <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill="#16a34a"/><path d="M6 10l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
          {(status === 'taken' || status === 'invalid') && (
            <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill="#dc2626"/><path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
          )}
        </label>

        {status === 'invalid' && error && (
          <p style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{error}</p>
        )}
        {status === 'taken' && (
          <div style={{ marginTop: 8 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Ese nombre ya está cogido</p>
            {suggestions.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                {suggestions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setValue(s); void checkUsername(s) }}
                    style={{ padding: '4px 12px', border: '1px solid #e0e0e0', borderRadius: 8, background: '#f9fafb', fontSize: 12, fontWeight: 700, color: '#1c1c1c', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                  >
                    @{s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={status !== 'available' || saving}
          onClick={() => void submit()}
          style={{
            marginTop: 18, width: '100%', padding: '12px 0', borderRadius: 10, border: 'none',
            background: status === 'available' && !saving ? '#2563eb' : '#cbd5e1',
            color: 'white', fontSize: 14, fontWeight: 800, cursor: status === 'available' && !saving ? 'pointer' : 'default',
          }}
        >
          {saving ? 'Guardando…' : 'Confirmar'}
        </button>

        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
