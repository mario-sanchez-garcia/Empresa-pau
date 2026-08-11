'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { supabase } from '../lib/supabase'
import { Eye, EyeOff } from 'lucide-react'
import { PLATFORM_STRUCTURED_EXERCISES_LABEL, PLATFORM_STRUCTURED_EXERCISES_TEXT } from '@/app/lib/platformStats'
import { clearOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { resolveOnboardingDestination } from '@/app/lib/onboarding/resolveOnboardingDestination'

const bebas  = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/camino'
  const [startingFresh, setStartingFresh] = useState(false)

  // Dispositivo compartido: si ya hay una sesión activa (ej. un hermano que
  // no cerró sesión), "Empieza aquí" no puede limitarse a navegar a
  // /onboarding — esa pantalla ve la sesión existente y te manda directo a
  // /camino de esa cuenta. Se cierra sesión y se limpia cualquier borrador
  // local antes de entrar, para garantizar un onboarding realmente nuevo.
  const handleStartFresh = async () => {
    setStartingFresh(true)
    await supabase.auth.signOut()
    clearOnboarding()
    router.push('/onboarding')
  }

  // ── Auth state (preservado exactamente) ──────────────────────────────────────
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [mensaje, setMensaje]   = useState('')
  const [cargando, setCargando] = useState(false)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [showPwd, setShowPwd]               = useState(false)
  const isError   = !!mensaje && !mensaje.includes('confirmar')
  const isSuccess = !!mensaje && mensaje.includes('confirmar')

  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  // ── Google OAuth ──────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setCargando(true)
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const callbackUrl = returnTo !== '/camino'
      ? `${base}/auth/callback?next=${encodeURIComponent(returnTo)}`
      : `${base}/auth/callback`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) {
      setMensaje('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
      setCargando(false)
    }
  }

  // ── Email/password handler (login únicamente — /login ya no crea cuentas) ────
  async function handleSubmit() {
    if (!email || !password) return
    setCargando(true)
    setMensaje('')
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMensaje(mensajeAuthLegible(error.message))
    } else {
      // El navegador puede tener onboarding local de otra cuenta (p.ej.
      // varias cuentas probadas en el mismo dispositivo); se descarta al
      // iniciar sesión y se reconcilia con el servidor de la cuenta real.
      clearOnboarding()
      // El destino se resuelve server-side (Bearer token -> /api/onboarding/me)
      // para que funcione igual en un dispositivo nuevo sin localStorage:
      // completo -> returnTo (normalmente /camino); incompleto o con un
      // borrador sin terminar -> recuperar ese estado en vez de confiar
      // ciegamente en returnTo.
      let dest = returnTo
      try {
        const token = data.session?.access_token
        if (token) {
          const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json()
            const resolved = resolveOnboardingDestination(json)
            dest = resolved === '/camino' ? returnTo : resolved
          }
        }
      } catch {
        // Nunca bloquear el login por esta comprobación.
      }
      window.location.href = dest
    }
    setCargando(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function mensajeAuthLegible(error?: string) {
    const text = error?.toLowerCase() ?? ''
    if (text.includes('already been registered') || text.includes('already registered')) {
      return 'Ya existe una cuenta con este email. Inicia sesión o usa otra contraseña.'
    }
    if (text.includes('invalid login credentials')) {
      return 'Email o contraseña incorrectos.'
    }
    return error ?? 'No se pudo completar la operación. Inténtalo de nuevo.'
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: '#0d0d0d' }}>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Animations ── */
        @keyframes lg-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lg-shake {
          0%,100% { transform: translateX(0); }
          20%     { transform: translateX(-5px); }
          40%     { transform: translateX(5px); }
          60%     { transform: translateX(-3px); }
          80%     { transform: translateX(3px); }
        }
        @keyframes lg-spin {
          to { transform: rotate(360deg); }
        }
        .lg-up    { animation: lg-up   440ms cubic-bezier(0.22,1,0.36,1) both; }
        .lg-shake { animation: lg-shake 360ms cubic-bezier(0.36,0.07,0.19,0.97) both; }
        .lg-spin  { animation: lg-spin 700ms linear infinite; }

        /* ── Input fields ── */
        .lg-field {
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px; height: 48px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          cursor: text;
          transition: border-color 160ms, background 160ms, box-shadow 160ms;
        }
        .lg-field:focus-within {
          border-color: rgba(255,255,255,.35);
          background: rgba(255,255,255,.09);
          box-shadow: 0 0 0 3px rgba(255,255,255,.04);
        }
        .lg-field input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; font-weight: 400; color: #fff;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
        }
        .lg-field input::placeholder { color: rgba(255,255,255,.25); }

        /* ── Submit button ── */
        .lg-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 52px;
          background: #fff; color: #0d0d0d;
          font-size: 15px; font-weight: 700; letter-spacing: .02em;
          border: none; cursor: pointer;
          transition: transform 160ms cubic-bezier(0.22,1,0.36,1), opacity 160ms;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
        }
        .lg-btn-primary:hover:not(:disabled) { transform: translateY(-1px); opacity: .93; }
        .lg-btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .lg-btn-primary:disabled { opacity: 0.38; cursor: not-allowed; }

        /* ── Google button ── */
        .lg-btn-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; height: 48px;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.1);
          color: rgba(255,255,255,.85);
          font-size: 14px; font-weight: 500; cursor: pointer;
          transition: border-color 160ms, background 160ms, transform 160ms;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
        }
        .lg-btn-google:hover { border-color: rgba(255,255,255,.25); background: rgba(255,255,255,.09); transform: translateY(-1px); }
        .lg-btn-google:active { transform: scale(0.98); }

        /* ── Text links ── */
        .lg-link {
          background: none; border: none; cursor: pointer; padding: 0;
          color: rgba(255,255,255,.7); font-size: 13px; font-weight: 500;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
          text-decoration: underline; text-underline-offset: 3px;
          transition: color 140ms;
        }
        .lg-link:hover { color: #fff; }

        .lg-eye {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: rgba(255,255,255,.25); display: flex; align-items: center;
          flex-shrink: 0; transition: color 140ms;
        }
        .lg-eye:hover { color: rgba(255,255,255,.7); }

        /* ── Left panel: hide on mobile ── */
        .lg-left { display: flex; }
        @media (max-width: 767px) {
          .lg-left { display: none !important; }
          .lg-right { padding: 40px 24px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lg-up, .lg-shake { animation: none !important; }
        }
      `}</style>

      {/* ── Left panel — image ────────────────────────────────────────────────── */}
      <div className="lg-left" style={{
        position: 'sticky', top: 0, height: '100dvh',
        width: '46%', flexShrink: 0, flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Background image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/login-bg.png"
          alt=""
          aria-hidden
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%', objectFit: 'cover',
            filter: 'saturate(1.4) brightness(1.05) contrast(1.08)',
          }}
        />
        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,13,13,.78) 0%, rgba(13,13,13,.35) 45%, rgba(13,13,13,.82) 100%)',
        }} />

        {/* Logo */}
        <div style={{ position: 'absolute', top: 32, left: 36, zIndex: 2 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/kairo-logo-new.png"
            alt="Kairo"
            style={{ height: 30, width: 'auto', mixBlendMode: 'lighten', display: 'block' }}
          />
        </div>

        {/* Tagline */}
        <div style={{
          position: 'absolute', bottom: 100, left: 36, right: 36, zIndex: 2,
        }}>
          <h2 style={{
            fontFamily: B,
            fontSize: 'clamp(44px, 5vw, 68px)',
            lineHeight: .92, letterSpacing: '.01em',
            color: '#fff', marginBottom: 16,
          }}>
            Estudia menos.<br />Saca más nota.
          </h2>
          <p style={{
            fontFamily: M,
            fontSize: 11, color: 'rgba(255,255,255,.4)',
            letterSpacing: '.1em', textTransform: 'uppercase', lineHeight: 1.6,
          }}>
            Exámenes reales · Corrección IA · Plan diario
          </p>
        </div>

        {/* Stats */}
        <div style={{
          position: 'absolute', bottom: 32, left: 36, right: 36, zIndex: 2,
          display: 'flex', gap: 32, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20,
        }}>
          {[
            { v: PLATFORM_STRUCTURED_EXERCISES_LABEL, l: PLATFORM_STRUCTURED_EXERCISES_TEXT },
            { v: '38',   l: 'Semanas PAU' },
            { v: '<30s', l: 'Corrección' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontFamily: B, fontSize: 26, color: '#fff', letterSpacing: '.01em', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────────── */}
      <div className="lg-right" style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(40px,6vw,72px) clamp(24px,5vw,56px)',
        overflowY: 'auto',
        background: '#0d0d0d',
        borderLeft: '1px solid rgba(255,255,255,.07)',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Mobile logo */}
          <div className="lg-up" style={{ marginBottom: 36, display: 'none' }} id="mobile-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/kairo-logo-new.png" alt="Kairo" style={{ height: 28, width: 'auto', mixBlendMode: 'lighten' }} />
          </div>

          {/* Heading */}
          <div className="lg-up" style={{ marginBottom: 32, animationDelay: '30ms' }}>
            <h1 style={{
              fontFamily: B,
              fontSize: 'clamp(40px, 5vw, 56px)',
              lineHeight: .92, letterSpacing: '.01em',
              color: '#fff', marginBottom: 10,
            }}>
              Bienvenido.
            </h1>
            <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.12em', textTransform: 'uppercase' }}>
              Entra en tu cuenta
            </p>
          </div>

          {/* Google button */}
          <div className="lg-up" style={{ marginBottom: 8, animationDelay: '60ms' }}>
            <button
              type="button"
              className="lg-btn-google"
              onClick={handleGoogleLogin}
              disabled={cargando}
              aria-label="Continúa con Google"
            >
              <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continúa con Google
            </button>
          </div>

          {/* Divider */}
          <div className="lg-up" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '18px 0', animationDelay: '90ms',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
            <span style={{ fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.25)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
              o con email
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
          </div>

          {/* Form fields */}
          <div className="lg-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, animationDelay: '120ms' }}>

            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontFamily: M, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.35)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 7 }}>
                Correo electrónico
              </label>
              <div className="lg-field">
                <input
                  id="login-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="email"
                  aria-required="true"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <label htmlFor="login-password" style={{ fontFamily: M, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.35)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  Contraseña
                </label>
                <button type="button" className="lg-link" style={{ fontSize: 11 }}>
                  ¿La olvidaste?
                </button>
              </div>
              <div className="lg-field">
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                  aria-required="true"
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback */}
          {mensaje && (
            <div
              className={isError ? 'lg-shake' : ''}
              role="alert"
              aria-live="polite"
              style={{
                marginTop: 14, padding: '10px 14px',
                background: isError ? 'rgba(220,38,38,.12)' : 'rgba(22,163,74,.1)',
                border: `1px solid ${isError ? 'rgba(220,38,38,.3)' : 'rgba(22,163,74,.3)'}`,
                fontSize: 13, color: isError ? '#f87171' : '#86efac', lineHeight: 1.5,
              }}
            >
              {mensaje}
            </div>
          )}

          {/* Submit */}
          <div className="lg-up" style={{ marginTop: 22, animationDelay: '160ms' }}>
            <button
              type="button"
              className="lg-btn-primary"
              onClick={handleSubmit}
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando
                ? <span className="lg-spin" style={{
                    display: 'inline-block', width: 17, height: 17,
                    border: '2px solid rgba(0,0,0,.2)',
                    borderTopColor: '#0d0d0d', borderRadius: '50%',
                  }} aria-label="Cargando..." />
                : 'Entrar a Kairo'
              }
            </button>
          </div>

          {/* Primera vez -> onboarding (LOGIN es solo para usuarios existentes) */}
          <div className="lg-up" style={{
            textAlign: 'center', marginTop: 20, animationDelay: '190ms',
            fontSize: 13, color: 'rgba(255,255,255,.3)',
          }}>
            ¿Es tu primera vez?{' '}
            <button
              type="button"
              onClick={handleStartFresh}
              disabled={startingFresh}
              className="lg-link"
              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', cursor: startingFresh ? 'default' : 'pointer' }}
            >
              {startingFresh ? 'Un momento…' : 'Empieza aquí'}
            </button>
          </div>

          {/* Legal footer */}
          <p className="lg-up" style={{
            textAlign: 'center', marginTop: 28,
            fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.15)',
            lineHeight: 1.7, letterSpacing: '.04em', animationDelay: '220ms',
          }}>
            Al continuar aceptas los{' '}
            <a href="/legal/terminos" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Términos</a>
            {' '}y la{' '}
            <a href="/legal/privacidad" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacidad</a>
          </p>

        </div>
      </div>
    </div>
  )
}
