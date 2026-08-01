'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bebas_Neue, DM_Mono } from 'next/font/google'

const bebas  = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

function ConfirmarEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)

  async function handleResend() {
    if (cooldown || status === 'sending') return
    setStatus('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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

  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#0d0d0d', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: M }}>
      <style>{`
        @keyframes ce-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ce-up { animation: ce-up 440ms cubic-bezier(0.22,1,0.36,1) both; }

        .ce-resend {
          background: none; border: none; padding: 0;
          font-family: inherit; font-size: 13px; font-weight: 500;
          color: rgba(255,255,255,.5);
          text-decoration: underline; text-underline-offset: 3px;
          cursor: pointer; transition: color 140ms;
        }
        .ce-resend:hover:not(:disabled) { color: rgba(255,255,255,.85); }
        .ce-resend:disabled { opacity: 0.35; cursor: not-allowed; }
      `}</style>

      <div className="ce-up" style={{ maxWidth: 420, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
        {/* Icon */}
        <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(249,115,22,.12)', border: '1px solid rgba(249,115,22,.25)', display: 'grid', placeItems: 'center', fontSize: 28 }}>
          ✉️
        </div>

        {/* Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 style={{ fontFamily: B, fontSize: 36, letterSpacing: '.04em', color: '#fff', margin: 0 }}>
            REVISA TU CORREO
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, margin: 0 }}>
            Te hemos enviado un enlace de confirmación a{' '}
            {email && (
              <span style={{ color: '#f97316', fontWeight: 600 }}>{email}</span>
            )}.
            <br />
            Haz clic en él para activar tu cuenta.
          </p>
        </div>

        {/* Steps */}
        <div style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 12, textAlign: 'left' }}>
          {[
            { n: '1', text: 'Abre el correo de Kairo' },
            { n: '2', text: 'Haz clic en «Confirmar cuenta»' },
            { n: '3', text: 'Se abrirá Kairo con tu sesión lista' },
          ].map(step => (
            <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 8, background: 'rgba(249,115,22,.15)', border: '1px solid rgba(249,115,22,.3)', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, color: '#f97316' }}>{step.n}</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,.65)' }}>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Spam note */}
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.3)', margin: 0, lineHeight: 1.6 }}>
          Si no lo encuentras, revisa la carpeta de spam.
          <br />
          El enlace caduca en 24 horas.
        </p>

        {/* Resend */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          {status === 'sent' ? (
            <p style={{ fontSize: 13, color: '#4ade80', margin: 0, fontWeight: 500 }}>
              ✓ Reenvíado. Revisa tu bandeja de entrada.
            </p>
          ) : status === 'error' ? (
            <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{errorMsg}</p>
          ) : null}
          <button
            className="ce-resend"
            onClick={handleResend}
            disabled={status === 'sending' || cooldown}
          >
            {status === 'sending'
              ? 'Reenviando...'
              : cooldown
              ? 'Reenvíado. Espera 1 minuto para volver a intentarlo.'
              : '¿No has recibido el correo? Reenviar →'}
          </button>
        </div>

        {/* Back */}
        <a href="/login" style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', textDecoration: 'none', transition: 'color 140ms' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,.6)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,.3)')}
        >
          ← Volver al inicio de sesión
        </a>
      </div>
    </div>
  )
}

export default function ConfirmarEmailPage() {
  return (
    <Suspense>
      <ConfirmarEmailContent />
    </Suspense>
  )
}
