'use client'

// Página de destino del enlace de recuperación de contraseña
// (supabase.auth.resetPasswordForEmail en app/login/page.tsx, botón "¿La
// olvidaste?"). Mismo patrón de intercambio de código PKCE que
// app/auth/callback/page.tsx, pero en vez de redirigir directamente a
// /camino, se queda aquí para que el alumno establezca una contraseña
// nueva antes de continuar — un login normal tras el enlace de
// recuperación no cambia la contraseña por sí solo.

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

function mensajeErrorLegible(error?: string) {
  const text = error?.toLowerCase() ?? ''
  if (text.includes('password') && (text.includes('least') || text.includes('short') || text.includes('6 characters'))) {
    return 'La contraseña debe tener al menos 6 caracteres.'
  }
  if (text.includes('fetch') || text.includes('network')) {
    return 'Parece que no tienes conexión. Comprueba tu red e inténtalo de nuevo.'
  }
  return 'No se pudo guardar la contraseña. Inténtalo de nuevo en un momento.'
}

function ResetPasswordHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [linkStatus, setLinkStatus] = useState<'checking' | 'ready' | 'expired'>('checking')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    if (errorParam) {
      queueMicrotask(() => setLinkStatus('expired'))
      return
    }
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
        setLinkStatus(exchangeError ? 'expired' : 'ready')
      })
      return
    }
    // Enlace ya consumido en esta pestaña (recarga) — si ya hay sesión de
    // recuperación activa, se puede seguir igualmente.
    supabase.auth.getSession().then(({ data: { session } }) => {
      setLinkStatus(session ? 'ready' : 'expired')
    })
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }
    if (password !== confirmPassword) {
      setError('Las dos contraseñas no coinciden.')
      return
    }
    setSaving(true)
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (updateError) {
      setError(mensajeErrorLegible(updateError.message))
      return
    }
    setSaved(true)
    setTimeout(() => router.replace('/camino'), 1500)
  }

  const B = { fontFamily: 'system-ui, sans-serif' }

  if (linkStatus === 'checking') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: 'rgba(255,255,255,.5)', fontSize: 14, ...B }}>
        Comprobando el enlace…
      </div>
    )
  }

  if (linkStatus === 'expired') {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', padding: 24, gap: 16, ...B }}>
        <div style={{ color: '#f87171', fontSize: 14, maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
          Este enlace de recuperación ha caducado o ya se ha usado. Pide uno nuevo desde la pantalla de inicio de sesión.
        </div>
        <Link href="/login" style={{ padding: '10px 24px', background: '#fff', color: '#0d0d0d', borderRadius: 8, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
          Volver al login
        </Link>
      </div>
    )
  }

  if (saved) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', padding: 24, gap: 12, ...B }}>
        <div style={{ color: '#86efac', fontSize: 15, fontWeight: 700 }}>Contraseña actualizada</div>
        <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 13 }}>Entrando en Kairo…</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', padding: 24, ...B }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, marginBottom: 6 }}>Elige una contraseña nueva</h1>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12 }}>Para tu cuenta de Kairo.</p>
        </div>
        <div>
          <label htmlFor="reset-password" style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>Nueva contraseña</label>
          <div style={{ position: 'relative' }}>
            <input
              id="reset-password"
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              style={{ width: '100%', padding: '10px 40px 10px 12px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: '#fff', fontSize: 14 }}
            />
            <button
              type="button"
              onClick={() => setShowPwd(v => !v)}
              aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', display: 'flex' }}
            >
              {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="reset-password-confirm" style={{ display: 'block', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 6 }}>Repite la contraseña</label>
          <input
            id="reset-password-confirm"
            type={showPwd ? 'text' : 'password'}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.15)', borderRadius: 8, color: '#fff', fontSize: 14 }}
          />
        </div>
        {error && (
          <div role="alert" style={{ padding: '10px 14px', background: 'rgba(220,38,38,.12)', border: '1px solid rgba(220,38,38,.3)', borderRadius: 8, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          style={{ padding: '12px 24px', background: '#fff', color: '#0d0d0d', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: saving ? 'default' : 'pointer', opacity: saving ? 0.7 : 1 }}
        >
          {saving ? 'Guardando…' : 'Guardar nueva contraseña'}
        </button>
      </form>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordHandler />
    </Suspense>
  )
}
