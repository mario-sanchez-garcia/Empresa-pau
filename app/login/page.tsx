'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react'
import PausiaBrand from '@/components/shared/PausiaBrand'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:          '#ffffff',
  bgSub:       '#f8fafc',
  ink:         '#0f172a',
  ink2:        '#1e293b',
  muted:       '#64748b',
  soft:        '#94a3b8',
  border:      '#e2e8f0',
  borderFocus: '#93c5fd',
  blue:        '#2563eb',
  blueDeep:    '#1d4ed8',
  grad:        'linear-gradient(135deg, #1d4ed8 0%, #2563eb 52%, #3b82f6 100%)',
  red:         '#dc2626',
  redBg:       '#fef2f2',
  redBd:       '#fecaca',
  greenBg:     '#f0fdf4',
  greenBd:     '#bbf7d0',
  green:       '#16a34a',
}

export default function Login() {
  // ── Auth state (preserved exactly) ──────────────────────────────────────────
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo]         = useState<'login' | 'registro'>('login')
  const [mensaje, setMensaje]   = useState('')
  const [cargando, setCargando] = useState(false)

  // ── UI-only state ────────────────────────────────────────────────────────────
  const [showPwd, setShowPwd]     = useState(false)
  const [googleMsg, setGoogleMsg] = useState(false)
  const isError   = !!mensaje && !mensaje.includes('confirmar')
  const isSuccess = !!mensaje && mensaje.includes('confirmar')

  // ── Auth handler (preserved exactly) ────────────────────────────────────────
  async function handleSubmit() {
    if (!email || !password) return
    setCargando(true)
    setMensaje('')
    if (modo === 'registro') {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      if (!res.ok) {
        setMensaje(result.error ?? 'No se pudo crear la cuenta. Inténtalo de nuevo.')
      } else {
        await supabase.auth.setSession(result.session)
        window.location.href = '/'
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje(error.message)
      else window.location.href = '/'
    }
    setCargando(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit()
  }

  function switchModo() {
    setModo(m => m === 'login' ? 'registro' : 'login')
    setMensaje('')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', background: C.bg }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        /* ── Entry animations ── */
        @keyframes lg-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lg-shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-6px); }
          40%      { transform: translateX(6px); }
          60%      { transform: translateX(-4px); }
          80%      { transform: translateX(4px); }
        }
        @keyframes lg-spin {
          to { transform: rotate(360deg); }
        }
        .lg-up   { animation: lg-up 480ms cubic-bezier(0.22,1,0.36,1) both; }
        .lg-shake { animation: lg-shake 380ms cubic-bezier(0.36,0.07,0.19,0.97) both; }
        .lg-spin  { animation: lg-spin 700ms linear infinite; }

        /* ── Field wrapper ── */
        .lg-field {
          display: flex; align-items: center; gap: 10px;
          padding: 0 14px;
          border-radius: 12px;
          border: 1.5px solid ${C.border};
          background: ${C.bgSub};
          height: 48px;
          transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
          cursor: text;
        }
        .lg-field:focus-within {
          border-color: ${C.borderFocus};
          background: #fff;
          box-shadow: 0 0 0 3px rgba(147,197,253,0.25);
        }
        .lg-field input {
          flex: 1; background: transparent; border: none; outline: none;
          font-size: 14px; font-weight: 500; color: ${C.ink};
          font-family: inherit;
        }
        .lg-field input::placeholder { color: ${C.soft}; font-weight: 400; }

        /* ── Buttons ── */
        .lg-btn-primary {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 48px; border-radius: 12px;
          background: ${C.grad}; color: #fff;
          font-size: 15px; font-weight: 800; letter-spacing: -0.01em;
          border: none; cursor: pointer;
          box-shadow: 0 8px 24px rgba(37,99,235,0.28);
          transition: transform 160ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 160ms cubic-bezier(0.22,1,0.36,1),
                      opacity 160ms ease;
          font-family: inherit;
        }
        .lg-btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(37,99,235,0.32);
        }
        .lg-btn-primary:active:not(:disabled) { transform: scale(0.97); }
        .lg-btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .lg-btn-google {
          display: flex; align-items: center; justify-content: center; gap: 10px;
          width: 100%; height: 46px; border-radius: 12px;
          background: #fff; color: ${C.ink2};
          font-size: 14px; font-weight: 600;
          border: 1.5px solid ${C.border}; cursor: pointer;
          transition: transform 160ms cubic-bezier(0.22,1,0.36,1),
                      border-color 160ms ease, box-shadow 160ms ease;
          font-family: inherit;
        }
        .lg-btn-google:hover {
          transform: translateY(-1px);
          border-color: ${C.borderFocus};
          box-shadow: 0 4px 14px rgba(37,99,235,0.10);
        }
        .lg-btn-google:active { transform: scale(0.98); }

        .lg-link {
          background: none; border: none; cursor: pointer;
          color: ${C.blue}; font-weight: 700; font-size: 14px;
          text-decoration: none; padding: 0; font-family: inherit;
          transition: opacity 140ms ease;
        }
        .lg-link:hover { opacity: 0.75; }

        .lg-eye {
          background: none; border: none; cursor: pointer; padding: 4px;
          color: ${C.soft}; display: flex; align-items: center;
          transition: color 140ms ease;
          flex-shrink: 0;
        }
        .lg-eye:hover { color: ${C.blue}; }

        /* ── Mobile: show logo ── */
        .lg-mobile-logo { display: flex; }
        @media (min-width: 768px) { .lg-mobile-logo { display: none; } }
        @media (max-width: 767px) { .lg-left-panel { display: none !important; } }

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lg-up, .lg-shake { animation: none !important; }
        }
      `}</style>

      {/* ── Left panel — image ────────────────────────────────────────────── */}
      <div className="lg-left-panel" style={{
        position: 'sticky', top: 0, height: '100dvh',
        width: '55%', flexShrink: 0,
        overflow: 'hidden',
      }}>
        {/* Photo */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1400&q=90&auto=format&fit=crop)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(20%) contrast(1.05)',
        }} />

        {/* Brand gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(29,78,216,0.72) 0%, rgba(37,99,235,0.45) 50%, rgba(15,23,42,0.6) 100%)',
        }} />

        {/* Top: Logo */}
        <div style={{
          position: 'absolute', top: 36, left: 40,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <PausiaBrand variant="inverse" subtitle="EBAU Madrid" size="md" />
        </div>

        {/* Center: tagline */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'center',
          padding: '0 40px',
        }}>
          <p style={{
            fontSize: 'clamp(1.6rem,3vw,2.4rem)', fontWeight: 900,
            color: '#fff', lineHeight: 1.15, letterSpacing: '-0.03em',
            maxWidth: 380, textWrap: 'balance' as React.CSSProperties['textWrap'],
            textShadow: '0 2px 20px rgba(0,0,0,0.2)',
          }}>
            Estudia menos.<br />Aprende más.<br />Saca mejor nota.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginTop: 14, fontWeight: 400, lineHeight: 1.65, maxWidth: 340 }}>
            Exámenes reales de la EBAU Madrid corregidos por IA en menos de 30 segundos.
          </p>
        </div>

        {/* Bottom: stats */}
        <div style={{
          position: 'absolute', bottom: 36, left: 40, right: 40,
          display: 'flex', gap: 28,
        }}>
          {[
            { v: '2.400+', l: 'Exámenes' },
            { v: '38',     l: 'Semanas' },
            { v: '<30s',   l: 'Corrección' },
          ].map(s => (
            <div key={s.l}>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — form ────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(32px,6vw,64px) clamp(20px,5vw,48px)',
        overflowY: 'auto',
        background: C.bg,
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>

          {/* Mobile logo */}
          <div className="lg-mobile-logo lg-up" style={{
            alignItems: 'center', gap: 10, marginBottom: 32,
          }}>
            <PausiaBrand subtitle="EBAU Madrid" size="sm" />
          </div>

          {/* Heading */}
          <div className="lg-up" style={{ marginBottom: 28, animationDelay: '40ms' }}>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {modo === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p style={{ fontSize: 14, color: C.muted, margin: '8px 0 0', fontWeight: 400, lineHeight: 1.6 }}>
              {modo === 'login'
                ? 'Entra en tu cuenta de Pausia para continuar'
                : 'Empieza gratis a preparar tu EBAU con IA'}
            </p>
          </div>

          {/* Google button */}
          <div className="lg-up" style={{ animationDelay: '80ms', marginBottom: 6 }}>
            <button
              type="button"
              className="lg-btn-google"
              onClick={() => { setGoogleMsg(true); setTimeout(() => setGoogleMsg(false), 3000) }}
              aria-label="Continúa con Google"
            >
              {/* Google G logo */}
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continúa con Google
            </button>
            {googleMsg && (
              <p style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginTop: 6 }}>
                Próximamente disponible
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="lg-up" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            margin: '20px 0', animationDelay: '110ms',
          }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.soft, fontWeight: 600 }}>o continúa con email</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Form fields */}
          <div className="lg-up" style={{ display: 'flex', flexDirection: 'column', gap: 14, animationDelay: '140ms' }}>
            {/* Email */}
            <div>
              <label htmlFor="login-email" style={{ display: 'block', fontSize: 13, fontWeight: 700, color: C.ink2, marginBottom: 6 }}>
                Correo electrónico
              </label>
              <div className="lg-field">
                <Mail size={16} style={{ color: C.blue, flexShrink: 0 }} />
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 700, color: C.ink2 }}>
                  Contraseña
                </label>
                {modo === 'login' && (
                  <button type="button" className="lg-link" style={{ fontSize: 12 }}>
                    ¿La olvidaste?
                  </button>
                )}
              </div>
              <div className="lg-field">
                <LockKeyhole size={16} style={{ color: C.blueDeep, flexShrink: 0 }} />
                <input
                  id="login-password"
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoComplete={modo === 'login' ? 'current-password' : 'new-password'}
                  aria-required="true"
                />
                <button
                  type="button"
                  className="lg-eye"
                  onClick={() => setShowPwd(v => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Feedback message */}
          {mensaje && (
            <div
              className={isError ? 'lg-shake' : ''}
              style={{
                marginTop: 14, padding: '10px 14px', borderRadius: 10,
                background: isError ? C.redBg : C.greenBg,
                border: `1px solid ${isError ? C.redBd : C.greenBd}`,
                fontSize: 13, fontWeight: 500,
                color: isError ? C.red : C.green,
                lineHeight: 1.5,
              }}
              role="alert"
              aria-live="polite"
            >
              {mensaje}
            </div>
          )}

          {/* Submit */}
          <div className="lg-up" style={{ marginTop: 20, animationDelay: '180ms' }}>
            <button
              type="button"
              className="lg-btn-primary"
              onClick={handleSubmit}
              disabled={cargando}
              aria-busy={cargando}
            >
              {cargando
                ? <span className="lg-spin" style={{
                    display: 'inline-block', width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.35)',
                    borderTopColor: '#fff', borderRadius: '50%',
                  }} aria-label="Cargando..." />
                : <>
                    {modo === 'login' ? 'Entrar a Pausia' : 'Crear cuenta'}
                    <ArrowRight size={16} />
                  </>
              }
            </button>
          </div>

          {/* Mode toggle */}
          <div className="lg-up" style={{
            textAlign: 'center', marginTop: 22, animationDelay: '210ms',
            fontSize: 14, color: C.muted, fontWeight: 400,
          }}>
            {modo === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button type="button" className="lg-link" onClick={switchModo}>
              {modo === 'login' ? 'Crear una cuenta' : 'Iniciar sesión'}
            </button>
          </div>

          {/* Legal */}
          <p className="lg-up" style={{
            textAlign: 'center', marginTop: 28,
            fontSize: 11, color: C.soft, lineHeight: 1.6,
            animationDelay: '240ms',
          }}>
            Al continuar, aceptas nuestros{' '}
            <a href="/legal/terminos" style={{ color: C.muted, fontWeight: 600 }}>Términos de servicio</a>
            {' '}y la{' '}
            <a href="/legal/privacidad" style={{ color: C.muted, fontWeight: 600 }}>Política de privacidad</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
