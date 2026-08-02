'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CURSO_PAU_EARLY_PRICE_CENTS,
  CURSO_PAU_STANDARD_PRICE_CENTS,
  WAITLIST_REFERRAL_TIERS,
  formatEur,
} from '@/app/lib/pricing'

const CURSO_PAU_EARLY_PRICE = CURSO_PAU_EARLY_PRICE_CENTS / 100
const CURSO_PAU_STANDARD_PRICE_DISPLAY = formatEur(CURSO_PAU_STANDARD_PRICE_CENTS)
// Tiers ordenados de más a menos referidos, ya vienen así de WAITLIST_REFERRAL_TIERS
const [TIER_3, TIER_1] = WAITLIST_REFERRAL_TIERS

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
  const [priceLocked, setPriceLocked] = useState(CURSO_PAU_EARLY_PRICE)
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

  return (
    <div className="wl-shell">
      <style>{`
        .wl-shell {
          min-height: 100vh;
          min-width: 0;
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 40vw;
          background: #0a0a0d;
          color: #fff;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .wl-content { display: flex; flex-direction: column; padding: 0 6vw; min-width: 0; }
        .wl-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 28px 0;
        }
        .wl-enter {
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.9); text-decoration: none;
          padding: 8px 16px; border-radius: 9px; border: 1.5px solid rgba(255,255,255,0.18);
          transition: border-color 150ms ease-out, background 150ms ease-out;
        }
        .wl-enter:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }

        .wl-main { flex: 1; display: flex; flex-direction: column; justify-content: center; max-width: 480px; padding: 20px 0 60px; min-width: 0; }

        .wl-screen {
          transition: opacity 350ms cubic-bezier(0.23,1,0.32,1), transform 350ms cubic-bezier(0.23,1,0.32,1);
        }
        .wl-screen.wl-hidden { opacity: 0; transform: translateY(10px); }
        .wl-screen.wl-visible { opacity: 1; transform: translateY(0); }

        .wl-eyebrow {
          margin: 0 0 16px; font-size: 11px; font-weight: 800; letter-spacing: 0.16em;
          text-transform: uppercase; color: #60a5fa;
        }
        .wl-h1 {
          margin: 0 0 20px; font-size: clamp(2.1rem, 4.6vw, 3.3rem); font-weight: 900; line-height: 1.03;
          letter-spacing: -0.035em; color: #fff;
        }
        .wl-lede {
          margin: 0 0 26px; font-size: 16.5px; color: rgba(255,255,255,0.55); line-height: 1.7; max-width: 40ch;
        }
        .wl-lede strong { color: #fff; font-weight: 800; }
        .wl-strike { color: rgba(255,255,255,0.32); text-decoration: line-through; font-weight: 600; }

        .wl-stat-row {
          display: flex; align-items: center; gap: 14px;
          padding: 16px 0; margin-bottom: 28px;
          border-top: 1px solid rgba(255,255,255,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .wl-stat-row .wl-num { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -0.02em; flex-shrink: 0; }
        .wl-stat-row .wl-lbl { font-size: 12.5px; color: rgba(255,255,255,0.45); font-weight: 600; line-height: 1.4; }

        .wl-form { display: flex; flex-direction: column; gap: 14px; }
        .wl-field label {
          display: block; font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.55);
          margin-bottom: 7px; letter-spacing: 0.02em;
        }
        .wl-field input, .wl-field select {
          width: 100%; height: 50px; border: 1.5px solid rgba(255,255,255,0.16); border-radius: 11px;
          padding: 0 15px; font-size: 15px; color: #fff; background: rgba(255,255,255,0.04);
          font-family: inherit; outline: none; transition: border-color 150ms ease-out, box-shadow 150ms ease-out, background 150ms;
          -webkit-appearance: none; appearance: none;
        }
        .wl-field input::placeholder { color: rgba(255,255,255,0.32); }
        .wl-field select {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path d="M1 1l5 5 5-5" stroke="%23ffffff" stroke-opacity="0.55" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>');
          background-repeat: no-repeat; background-position: right 16px center; padding-right: 38px;
          color: rgba(255,255,255,0.92); cursor: pointer;
        }
        .wl-field select option { color: #0a0a0d; }
        .wl-field input:focus, .wl-field select:focus {
          border-color: #3b82f6; background: rgba(255,255,255,0.07); box-shadow: 0 0 0 3.5px rgba(59,130,246,0.18);
        }
        .wl-row2 { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }

        .wl-error { margin: 0; font-size: 13.5px; color: #f87171; font-weight: 600; }

        .wl-cta {
          margin-top: 4px; height: 54px; border-radius: 12px; border: none; cursor: pointer;
          background: #3b82f6; color: #fff; font-size: 16px; font-weight: 800;
          font-family: inherit; transition: background 150ms ease-out;
          -webkit-tap-highlight-color: transparent;
        }
        .wl-cta:hover:not(:disabled) { background: #2563eb; }
        .wl-cta:disabled { background: rgba(59,130,246,0.45); cursor: not-allowed; }

        .wl-foot {
          margin: 22px 0 0; font-size: 12.5px; color: rgba(255,255,255,0.4); text-align: center; line-height: 1.6;
        }

        .wl-photo-wrap { position: relative; padding: 40px 40px 40px 0; display: flex; align-items: center; }
        .wl-photo {
          position: relative; width: 100%; height: calc(100vh - 80px); border-radius: 22px; overflow: hidden;
          background: #000 url('/brand/scene-exam.jpg') center / cover no-repeat;
          box-shadow: 0 40px 90px -30px rgba(0,0,0,0.7);
        }
        .wl-photo::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(0deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 40%);
        }
        .wl-photo-tag {
          position: absolute; left: 22px; bottom: 22px; z-index: 2;
          font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.85); letter-spacing: 0.03em;
        }

        /* ── Confirmation screen ── */
        .wl-referral {
          margin: 24px 0; background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.28);
          border-radius: 16px; padding: 20px 22px;
        }
        .wl-referral-title { margin: 0 0 6px; font-size: 14.5px; font-weight: 800; color: #fff; }
        .wl-referral-tiers { margin: 0 0 16px; font-size: 13px; color: #93c5fd; font-weight: 700; }
        .wl-share-url {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.16);
          border-radius: 10px; padding: 11px 14px; font-size: 13px; color: #93c5fd; font-weight: 600;
          word-break: break-all; margin-bottom: 16px; user-select: all;
        }
        .wl-wa-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          height: 52px; border-radius: 12px; background: #25d366; color: #fff;
          font-size: 15px; font-weight: 900; text-decoration: none;
          transition: transform 130ms ease-out; -webkit-tap-highlight-color: transparent;
        }
        .wl-copy-btn {
          height: 52px; border-radius: 12px; cursor: pointer; font-size: 15px; font-weight: 700;
          font-family: inherit; transition: background 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out;
          -webkit-tap-highlight-color: transparent;
          background: rgba(255,255,255,0.04); color: #fff; border: 1.5px solid rgba(255,255,255,0.18);
        }
        .wl-copy-btn.wl-copied { background: rgba(74,222,128,0.1); color: #4ade80; border-color: rgba(74,222,128,0.35); }

        @media (max-width: 980px) {
          .wl-shell { grid-template-columns: minmax(0, 1fr); }
          .wl-photo-wrap { padding: 0 24px 32px; order: -1; }
          .wl-photo { height: 40vh; margin-top: 24px; }
          .wl-content { padding: 0 24px; }
          .wl-lede { max-width: 100%; }
        }
      `}</style>

      <div className="wl-content">
        <header className="wl-header">
          <Link href="/landing" aria-label="Inicio">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 26, width: 'auto', display: 'block' }} />
          </Link>
          <Link href="/login" className="wl-enter">Entrar</Link>
        </header>

        <main className="wl-main">
          {/* ── FORM SCREEN ─────────────────────────────────────────────────── */}
          {screen === 'form' && (
            <div className={`wl-screen ${confirmed ? 'wl-visible' : 'wl-hidden'}`}>
              <p className="wl-eyebrow">Early Bird</p>
              <h1 className="wl-h1">La PAU 2027<br />empieza ahora.</h1>
              <p className="wl-lede">
                Reserva tu plaza: Curso PAU completo a <strong>{formatEur(CURSO_PAU_EARLY_PRICE_CENTS)}</strong>{' '}
                <span className="wl-strike">{CURSO_PAU_STANDARD_PRICE_DISPLAY}</span>. Exámenes reales, corrección IA
                y tu Camino diario de septiembre a junio.
              </p>

              <div className="wl-stat-row">
                <span className="wl-num">{daysLeft ?? '—'}</span>
                <span className="wl-lbl">días para el 15 de septiembre,<br />cuando empieza el curso.</span>
              </div>

              <form onSubmit={handleSubmit} className="wl-form">
                <div className="wl-field">
                  <label htmlFor="wl-email">Email</label>
                  <input
                    id="wl-email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="wl-row2">
                  <div className="wl-field">
                    <label htmlFor="wl-comunidad">Comunidad autónoma</label>
                    <select
                      id="wl-comunidad"
                      required
                      value={comunidad}
                      onChange={(e) => setComunidad(e.target.value)}
                    >
                      <option value="">Selecciona</option>
                      <option value="madrid">Madrid</option>
                      <option value="cataluna">Cataluña</option>
                      <option value="otra">Otra</option>
                    </select>
                  </div>

                  <div className="wl-field">
                    <label htmlFor="wl-curso">Curso</label>
                    <select
                      id="wl-curso"
                      required
                      value={curso}
                      onChange={(e) => setCurso(e.target.value)}
                    >
                      <option value="">Selecciona</option>
                      <option value="1bach">1º Bachillerato</option>
                      <option value="2bach">2º Bachillerato</option>
                    </select>
                  </div>
                </div>

                {errorMsg && <p className="wl-error">{errorMsg}</p>}

                <button type="submit" disabled={formState === 'submitting'} className="wl-cta">
                  {formState === 'submitting' ? 'Reservando…' : 'Reservar mi plaza →'}
                </button>
              </form>

              <p className="wl-foot">📱 App para iOS en camino — los de la waitlist la probarán primero.</p>
            </div>
          )}

          {/* ── CONFIRMATION SCREEN ──────────────────────────────────────────── */}
          {screen === 'confirmed' && (
            <div className={`wl-screen ${confirmed ? 'wl-visible' : 'wl-hidden'}`}>
              <p className="wl-eyebrow">Reserva confirmada</p>
              <h1 className="wl-h1">Plaza reservada 🎟️</h1>

              <p className="wl-lede">
                {alreadyRegistered
                  ? 'Ya tenías tu plaza reservada. Este es tu link:'
                  : <>Tu precio de <strong>{priceLocked} €</strong> está congelado hasta el 15 de octubre. Te avisaremos por email cuando abra el curso.</>}
              </p>

              <div className="wl-referral">
                <p className="wl-referral-title">¿Quieres bajarlo más? Comparte tu link:</p>
                <p className="wl-referral-tiers">
                  1 amigo = {formatEur(TIER_1.priceCents)} · 3 amigos = {formatEur(TIER_3.priceCents)}
                </p>
                <div className="wl-share-url">{shareUrl}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <a href={waUrl} target="_blank" rel="noopener noreferrer" className="wl-wa-btn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Compartir por WhatsApp
                  </a>
                  <button onClick={handleCopy} className={`wl-copy-btn ${copied ? 'wl-copied' : ''}`}>
                    {copied ? 'Copiado ✓' : 'Copiar link'}
                  </button>
                </div>
              </div>

              <p className="wl-foot">📱 App para iOS en camino — los de la waitlist la probarán primero.</p>
            </div>
          )}
        </main>
      </div>

      <div className="wl-photo-wrap">
        <div className="wl-photo">
          <div className="wl-photo-tag">Examen real · manuscrito</div>
        </div>
      </div>
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
