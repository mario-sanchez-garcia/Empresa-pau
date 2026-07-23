'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import KairoBrand from '@/components/shared/KairoBrand'

const BLUE = '#2563eb'
const INK = '#0f172a'
const MUTED = '#64748b'
const BORDER = '#e2e8f0'
const BG_SUB = '#f8fafc'
const COURSE_START = new Date('2026-09-15T00:00:00+02:00')

function daysUntil(target: Date): number {
  return Math.max(0, Math.ceil((target.getTime() - Date.now()) / 86_400_000))
}

type FormState = 'idle' | 'submitting' | 'error'
type Screen = 'form' | 'confirmed'

function WaitlistContent() {
  const searchParams = useSearchParams()
  const refParam = searchParams.get('ref') ?? ''

  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [email, setEmail] = useState('')
  const [comunidad, setComunidad] = useState('')
  const [curso, setCurso] = useState('')
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [screen, setScreen] = useState<Screen>('form')
  const [referralCode, setReferralCode] = useState('')
  const [priceLocked, setPriceLocked] = useState(59)
  const [alreadyRegistered, setAlreadyRegistered] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    setDaysLeft(daysUntil(COURSE_START))
    // Refresh at next local midnight
    const now = new Date()
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timeout = setTimeout(() => setDaysLeft(daysUntil(COURSE_START)), nextMidnight.getTime() - now.getTime())
    return () => clearTimeout(timeout)
  }, [])

  // Trigger entrance animation after mount
  useEffect(() => {
    requestAnimationFrame(() => setConfirmed(true))
  }, [])

  const shareUrl = `https://kairo-pau.com/waitlist?ref=${referralCode}`
  const waText = encodeURIComponent(
    `Estoy usando Kairo para preparar la PAU — exámenes reales corregidos por IA. Si te apuntas con mi link los dos conseguimos el curso más barato: ${shareUrl}`,
  )
  const waUrl = `https://wa.me/?text=${waText}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormState('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), comunidad, curso, ref: refParam || undefined }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error ?? 'Algo salió mal. Inténtalo de nuevo.')
        setFormState('error')
        return
      }

      setReferralCode(data.referralCode)
      setPriceLocked(data.priceLocked)
      setAlreadyRegistered(!!data.alreadyRegistered)
      setConfirmed(false)
      setScreen('confirmed')
      requestAnimationFrame(() => setConfirmed(true))
    } catch {
      setErrorMsg('Sin conexión. Inténtalo de nuevo.')
      setFormState('error')
    } finally {
      setFormState('idle')
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      // Fallback: select the text
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    height: 52,
    border: `1.5px solid ${BORDER}`,
    borderRadius: 12,
    padding: '0 16px',
    fontSize: 16,
    color: INK,
    background: '#fff',
    outline: 'none',
    transition: 'border-color 150ms ease-out',
    WebkitAppearance: 'none',
    appearance: 'none',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 13,
    fontWeight: 700,
    color: INK,
    marginBottom: 6,
  }

  return (
    <div style={{ minHeight: '100vh', background: BG_SUB, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64, padding: '0 20px',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <Link href="/landing" style={{ textDecoration: 'none' }}>
          <KairoBrand subtitle={null} size="md" />
        </Link>
        <Link href="/login" style={{
          fontSize: 13, fontWeight: 700, color: BLUE, textDecoration: 'none',
          padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${BORDER}`,
          background: '#fff',
        }}>
          Entrar
        </Link>
      </header>

      <main style={{ maxWidth: 480, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* ── FORM SCREEN ─────────────────────────────────────────────────── */}
        {screen === 'form' && (
          <div style={{
            opacity: confirmed ? 1 : 0,
            transform: confirmed ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 350ms cubic-bezier(0.23,1,0.32,1), transform 350ms cubic-bezier(0.23,1,0.32,1)',
          }}>
            {/* Eyebrow */}
            <p style={{
              margin: '0 0 12px',
              fontSize: 11, fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: BLUE,
            }}>
              Early Bird
            </p>

            <h1 style={{
              margin: '0 0 16px',
              fontSize: 'clamp(2rem, 8vw, 2.6rem)',
              fontWeight: 900, color: INK,
              lineHeight: 1.1, letterSpacing: '-0.03em',
            }}>
              La PAU 2027 empieza ahora.
            </h1>

            <p style={{ margin: '0 0 20px', fontSize: 17, color: MUTED, lineHeight: 1.6 }}>
              Reserva tu plaza: Curso PAU completo a <strong style={{ color: INK }}>59 €</strong> en vez de 69 €.
              Exámenes reales, corrección IA y tu Camino diario de septiembre a junio.
            </p>

            {/* Countdown */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#eff6ff', border: `1px solid #bfdbfe`,
              borderRadius: 10, padding: '10px 14px',
              fontSize: 14, fontWeight: 700, color: '#1d4ed8',
              marginBottom: 32,
            }}>
              ⏳ El curso empieza el 15 de septiembre
              {daysLeft !== null && ` — quedan ${daysLeft} días`}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={labelStyle} htmlFor="wl-email">Email</label>
                <input
                  id="wl-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = BLUE }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="wl-comunidad">Comunidad autónoma</label>
                <select
                  id="wl-comunidad"
                  required
                  value={comunidad}
                  onChange={(e) => setComunidad(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40, cursor: 'pointer' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = BLUE }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                >
                  <option value="">Selecciona tu comunidad</option>
                  <option value="madrid">Madrid</option>
                  <option value="cataluna">Cataluña</option>
                  <option value="otra">Otra</option>
                </select>
              </div>

              <div>
                <label style={labelStyle} htmlFor="wl-curso">Curso</label>
                <select
                  id="wl-curso"
                  required
                  value={curso}
                  onChange={(e) => setCurso(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40, cursor: 'pointer' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = BLUE }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                >
                  <option value="">Selecciona tu curso</option>
                  <option value="1bach">1º Bachillerato</option>
                  <option value="2bach">2º Bachillerato</option>
                </select>
              </div>

              {errorMsg && (
                <p style={{ margin: 0, fontSize: 14, color: '#dc2626', fontWeight: 600 }}>
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={formState === 'submitting'}
                style={{
                  height: 56, borderRadius: 14,
                  background: formState === 'submitting' ? '#93c5fd' : BLUE,
                  color: '#fff', fontSize: 17, fontWeight: 900,
                  border: 'none', cursor: formState === 'submitting' ? 'not-allowed' : 'pointer',
                  transition: 'transform 130ms ease-out, background 150ms ease-out',
                  WebkitTapHighlightColor: 'transparent',
                }}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
              >
                {formState === 'submitting' ? 'Reservando…' : 'Reservar mi plaza →'}
              </button>
            </form>

            {/* Footer note */}
            <p style={{ margin: '24px 0 0', fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 1.6 }}>
              📱 App para iOS en camino — los de la waitlist la probarán primero.
            </p>
          </div>
        )}

        {/* ── CONFIRMATION SCREEN ──────────────────────────────────────────── */}
        {screen === 'confirmed' && (
          <div style={{
            opacity: confirmed ? 1 : 0,
            transform: confirmed ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 350ms cubic-bezier(0.23,1,0.32,1), transform 350ms cubic-bezier(0.23,1,0.32,1)',
          }}>
            <h1 style={{
              margin: '0 0 12px',
              fontSize: 'clamp(1.8rem, 7vw, 2.4rem)',
              fontWeight: 900, color: INK,
              lineHeight: 1.15, letterSpacing: '-0.03em',
              animationDelay: '0ms',
            }}>
              Plaza reservada 🎟️
            </h1>

            <p style={{ margin: '0 0 6px', fontSize: 17, color: MUTED, lineHeight: 1.6, animationDelay: '40ms' }}>
              {alreadyRegistered
                ? 'Ya tenías tu plaza reservada. Este es tu link:'
                : <>Tu precio de <strong style={{ color: INK }}>{priceLocked} €</strong> está congelado hasta el 15 de octubre. Te avisaremos por email cuando abra el curso.</>}
            </p>

            {/* Referral incentive */}
            <div style={{
              margin: '24px 0',
              background: '#eff6ff', border: `1px solid #bfdbfe`,
              borderRadius: 14, padding: '18px 20px',
            }}>
              <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 800, color: INK }}>
                ¿Quieres bajarlo más? Comparte tu link:
              </p>
              <p style={{ margin: '0 0 14px', fontSize: 13, color: '#1d4ed8', fontWeight: 700 }}>
                1 amigo = 49 € · 3 amigos = 39 €
              </p>

              {/* Visible link */}
              <div style={{
                background: '#fff', border: `1px solid #bfdbfe`,
                borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: '#1d4ed8', fontWeight: 600,
                wordBreak: 'break-all', marginBottom: 14,
                userSelect: 'all',
              }}>
                {shareUrl}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    height: 52, borderRadius: 12,
                    background: '#25d366', color: '#fff',
                    fontSize: 15, fontWeight: 900, textDecoration: 'none',
                    transition: 'transform 130ms ease-out',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Compartir por WhatsApp
                </a>

                <button
                  onClick={handleCopy}
                  style={{
                    height: 52, borderRadius: 12,
                    background: copied ? '#f0fdf4' : '#fff',
                    color: copied ? '#16a34a' : INK,
                    border: `1.5px solid ${copied ? '#bbf7d0' : BORDER}`,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                    transition: 'background 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out, transform 130ms ease-out',
                    WebkitTapHighlightColor: 'transparent',
                  }}
                  onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  onTouchStart={(e) => { e.currentTarget.style.transform = 'scale(0.97)' }}
                  onTouchEnd={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                >
                  {copied ? 'Copiado ✓' : 'Copiar link'}
                </button>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 13, color: MUTED, textAlign: 'center', lineHeight: 1.6 }}>
              📱 App para iOS en camino — los de la waitlist la probarán primero.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function WaitlistPage() {
  return (
    <Suspense>
      <WaitlistContent />
    </Suspense>
  )
}
