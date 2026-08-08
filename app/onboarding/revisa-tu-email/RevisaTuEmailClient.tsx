'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Pantalla de "revisa tu correo" propia del flujo Fase 2 (onboarding
// anónimo → signup al final). No reemplaza /confirmar-email (login clásico,
// con su propio copy) — reutiliza el MISMO backend
// (/api/auth/resend-confirmation) para no duplicar la lógica de reenvío,
// pero conserva el draft_id en el reenvío para que el enlace siga
// apuntando a /onboarding/finalizando en vez de a /onboarding a secas.

function RevisaTuEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const draftId = searchParams.get('draft')

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)

  async function handleResend() {
    if (cooldown || status === 'sending' || !email) return
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, next: '/onboarding/finalizando', draft_id: draftId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'No se pudo reenviar el correo.')
        setStatus('error')
      } else {
        setStatus('sent')
        setCooldown(true)
        setTimeout(() => setCooldown(false), 60_000)
      }
    } catch {
      setErrorMsg('Error de conexión. Inténtalo de nuevo.')
      setStatus('error')
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 20, padding: 24, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(37,99,235,.12)', border: '1px solid rgba(37,99,235,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
        ✉️
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 44px)', color: '#fff', letterSpacing: '.01em' }}>
        Revisa tu correo
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', maxWidth: 380, lineHeight: 1.6, margin: 0 }}>
        Hemos enviado un enlace de confirmación{email ? <> a <strong style={{ color: '#fff' }}>{email}</strong></> : ''}. Ábrelo para terminar de crear tu cuenta y generar tu Camino.
      </p>

      <div style={{ width: '100%', maxWidth: 380, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8, textAlign: 'left' }}>
        {[
          'Abre el correo de Kairo en tu bandeja de entrada',
          'Haz clic en «Confirmar email y crear mi Camino»',
          'Tu Camino se generará automáticamente',
        ].map((step, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,.3)', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>{step}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', maxWidth: 340, lineHeight: 1.6 }}>
        Si no lo encuentras, revisa la carpeta de spam. El enlace caduca en 24 horas — puedes pedir uno nuevo cuando quieras.
      </p>

      {status === 'sent' && <p style={{ fontSize: 12, color: '#4ade80', margin: 0 }}>Correo reenviado. Revisa tu bandeja de entrada.</p>}
      {status === 'error' && <p style={{ fontSize: 12, color: '#f87171', margin: 0 }}>{errorMsg}</p>}

      <button
        onClick={handleResend}
        disabled={status === 'sending' || cooldown}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 12, fontWeight: 700, cursor: (status === 'sending' || cooldown) ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
      >
        {status === 'sending' ? 'Reenviando…' : cooldown ? 'Reenviado — espera 1 minuto' : '¿No has recibido el correo? Reenviar'}
      </button>

      <button
        onClick={() => router.push('/onboarding')}
        style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
      >
        ← Cambiar email o volver
      </button>
    </div>
  )
}

export default function RevisaTuEmailClient() {
  return (
    <Suspense>
      <RevisaTuEmailContent />
    </Suspense>
  )
}
