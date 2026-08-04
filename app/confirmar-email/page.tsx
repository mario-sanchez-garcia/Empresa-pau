'use client'

import { Suspense, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bebas_Neue, DM_Mono } from 'next/font/google'

const bebas  = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

function EnvelopeSVG() {
  return (
    <svg width="120" height="90" viewBox="0 0 120 90" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Body */}
      <rect x="1.5" y="1.5" width="117" height="87" rx="10" fill="#181818" stroke="rgba(249,115,22,0.3)" strokeWidth="1.5"/>
      {/* Flap shadow bottom fold */}
      <path d="M1.5 88L42 54" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2"/>
      <path d="M118.5 88L78 54" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2"/>
      {/* Flap V */}
      <path d="M1.5 16L60 55L118.5 16" stroke="rgba(249,115,22,0.28)" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Seal */}
      <circle cx="60" cy="55" r="6.5" fill="#f97316"/>
      <circle cx="60" cy="55" r="9" fill="none" stroke="rgba(249,115,22,0.2)" strokeWidth="1"/>
      {/* Kairo K mark inside seal */}
      <text x="60" y="59" textAnchor="middle" fontFamily="system-ui" fontWeight="900" fontSize="7" fill="white">K</text>
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="6.5" stroke="rgba(249,115,22,0.35)" strokeWidth="1"/>
      <path d="M4.5 7L6.2 8.8L9.5 5.5" stroke="#f97316" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ConfirmarEmailContent() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get('email') ?? ''
  const expired = searchParams.get('expired') === '1'

  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [cooldown, setCooldown] = useState(false)

  const cursorGlowRef = useRef<HTMLDivElement>(null)

  function handleMouseMove(e: React.MouseEvent) {
    if (cursorGlowRef.current) {
      cursorGlowRef.current.style.background =
        `radial-gradient(500px circle at ${e.clientX}px ${e.clientY}px, rgba(249,115,22,0.12), transparent 55%)`
    }
  }

  async function handleResend() {
    if (cooldown || status === 'sending') return
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanEmail) {
      setErrorMsg('Escribe tu correo para reenviar el enlace.')
      setStatus('error')
      return
    }
    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail }),
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
    <div onMouseMove={handleMouseMove} style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh', background: '#0d0d0d', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @keyframes ce-fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ce-float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-7px); }
        }
        @keyframes ce-pulse-ring {
          0%   { transform: scale(1);   opacity: 0.18; }
          60%  { transform: scale(1.6); opacity: 0; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        @keyframes ce-glow {
          0%, 100% { opacity: 0.12; }
          50%      { opacity: 0.22; }
        }

        .ce-d0 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) both; }
        .ce-d1 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 80ms both; }
        .ce-d2 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 160ms both; }
        .ce-d3 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 240ms both; }
        .ce-d4 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 320ms both; }
        .ce-d5 { animation: ce-fade-up 560ms cubic-bezier(0.16,1,0.3,1) 400ms both; }

        .ce-envelope { animation: ce-float 4s ease-in-out infinite; }
        .ce-glow-bg  { animation: ce-glow 4s ease-in-out infinite; }
        .ce-ring     { animation: ce-pulse-ring 2.8s ease-out infinite; }

        .ce-resend-btn {
          background: none; border: none; padding: 0;
          font-family: inherit; font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          cursor: pointer;
          transition: color 160ms;
          letter-spacing: 0.04em;
        }
        .ce-resend-btn:hover:not(:disabled) { color: rgba(255,255,255,0.7); }
        .ce-resend-btn:disabled { opacity: 0.3; cursor: not-allowed; }

        .ce-back {
          font-size: 11px; color: rgba(255,255,255,0.2);
          text-decoration: none; letter-spacing: 0.08em; text-transform: uppercase;
          font-family: inherit;
          transition: color 160ms;
        }
        .ce-back:hover { color: rgba(255,255,255,0.5); }

        @media (prefers-reduced-motion: reduce) {
          .ce-d0,.ce-d1,.ce-d2,.ce-d3,.ce-d4,.ce-d5 { animation: none; opacity: 1; transform: none; }
          .ce-envelope,.ce-glow-bg,.ce-ring { animation: none; }
        }
      `}</style>

      {/* Cursor spotlight */}
      <div ref={cursorGlowRef} aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }} />

      {/* Background radial glow */}
      <div aria-hidden className="ce-glow-bg" style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 600, height: 600,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249,115,22,0.12) 0%, transparent 65%)',
        pointerEvents: 'none',
      }}/>

      {/* Top bar */}
      <header className="ce-d0" style={{ padding: '28px 36px', zIndex: 2, position: 'relative' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/kairo-logo-new.png"
          alt="Kairo"
          style={{ height: 26, width: 'auto', mixBlendMode: 'lighten', display: 'block', opacity: 0.85 }}
        />
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px 64px',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{ maxWidth: 480, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Envelope + pulse ring */}
          <div className="ce-d1" style={{ position: 'relative', marginBottom: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 120, height: 90 }}>
            {/* Pulse ring */}
            <div className="ce-ring" style={{
              position: 'absolute',
              width: 160, height: 120,
              borderRadius: 20,
              border: '1px solid rgba(249,115,22,0.5)',
              pointerEvents: 'none',
            }}/>
            <div className="ce-envelope">
              <EnvelopeSVG />
            </div>
          </div>

          {/* Eyebrow */}
          <div className="ce-d2" style={{
            fontFamily: M,
            fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase',
            color: 'rgba(249,115,22,0.7)',
            marginBottom: 12,
          }}>
            Confirmación de cuenta
          </div>

          {/* Headline */}
          <h1 className="ce-d2" style={{
            fontFamily: B,
            fontSize: 'clamp(52px, 8vw, 80px)',
            lineHeight: 0.92,
            letterSpacing: '.02em',
            color: '#fff',
            textAlign: 'center',
            margin: '0 0 24px',
          }}>
            Revisa tu<br />correo.
          </h1>

          {expired && (
            <p className="ce-d3" style={{
              fontFamily: M,
              fontSize: 12,
              lineHeight: 1.7,
              color: 'rgba(255,255,255,0.52)',
              textAlign: 'center',
              maxWidth: 420,
              margin: '-10px 0 24px',
            }}>
              Tu enlace anterior ha caducado o ya se ha usado. Te enviaremos uno nuevo para terminar la cuenta.
            </p>
          )}

          {/* Email pill */}
          {initialEmail ? (
            <div className="ce-d3" style={{ marginBottom: 32 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                borderRadius: 9999,
                background: 'rgba(249,115,22,0.08)',
                border: '1px solid rgba(249,115,22,0.2)',
              }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f97316', flexShrink: 0 }}/>
                <span style={{
                  fontFamily: M,
                  fontSize: 13, fontWeight: 500,
                  color: '#f97316',
                  letterSpacing: '0.02em',
                }}>
                  {initialEmail}
                </span>
              </div>
            </div>
          ) : (
            <div className="ce-d3" style={{ width: '100%', marginBottom: 32 }}>
              <label style={{
                display: 'block',
                fontFamily: M,
                fontSize: 9,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.28)',
                marginBottom: 8,
              }}>
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '14px 16px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#fff',
                  fontFamily: M,
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          )}

          {/* Divider */}
          <div className="ce-d3" style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 32 }}/>

          {/* Steps */}
          <div className="ce-d4" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 40 }}>
            {[
              { text: 'Abre el correo de Kairo en tu bandeja de entrada' },
              { text: 'Haz clic en el botón «Confirmar cuenta»' },
              { text: 'Tu sesión se abrirá automáticamente' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '14px 0',
                borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}>
                <div style={{ flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                <span style={{
                  fontFamily: M,
                  fontSize: 13, color: 'rgba(255,255,255,0.5)',
                  lineHeight: 1.6, letterSpacing: '0.01em',
                }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>

          {/* Spam note */}
          <div className="ce-d4" style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontFamily: M, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
              Nota
            </span>
            <span style={{ fontFamily: M, fontSize: 11, color: 'rgba(255,255,255,0.28)', lineHeight: 1.6 }}>
              Si no encuentras el correo, revisa la carpeta de spam. El enlace caduca en 24 horas.
            </span>
          </div>

          {/* Resend */}
          <div className="ce-d5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {status === 'sent' && (
              <p style={{ fontFamily: M, fontSize: 11, color: '#4ade80', margin: '0 0 4px', letterSpacing: '.04em' }}>
                ✓ Correo reenviado. Revisa tu bandeja de entrada.
              </p>
            )}
            {status === 'error' && (
              <p style={{ fontFamily: M, fontSize: 11, color: '#f87171', margin: '0 0 4px' }}>{errorMsg}</p>
            )}
            <button
              className="ce-resend-btn"
              onClick={handleResend}
              disabled={status === 'sending' || cooldown}
              style={{ fontFamily: M }}
            >
              {status === 'sending'
                ? 'Reenviando...'
                : cooldown
                ? 'Reenviado · espera 1 minuto para volver a intentarlo'
                : '¿No has recibido el correo? Reenviar →'}
            </button>
          </div>

        </div>
      </main>

      {/* Bottom bar */}
      <footer className="ce-d5" style={{
        padding: '20px 36px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        position: 'relative',
      }}>
        <a href="/login" className="ce-back" style={{ fontFamily: M }}>← Volver al inicio de sesión</a>
      </footer>

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
