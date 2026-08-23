'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { supabase } from '@/app/lib/supabase'
import KairoLoader from '@/app/components/ui/KairoLoader'
import CheckoutShell from '@/components/shared/CheckoutShell'
import { CheckCircle2, Lock } from 'lucide-react'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

const PLAN_LABELS: Record<string, string> = {
  pack_curso_pau: 'Curso PAU',
  premium: 'Premium',
}

const WITHDRAWAL_VERSION = LEGAL_VERSIONS.desistimiento.version

type State = 'loading' | 'ready' | 'paying' | 'error' | 'already_active'

function CheckoutFlow() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') ?? 'pack_curso_pau'
  const planLabel = PLAN_LABELS[planId] ?? planId
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [withdrawalAccepted, setWithdrawalAccepted] = useState(false)
  const initiated = useRef(false)

  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    async function start() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session?.access_token) {
        const returnTo = `/checkout?plan=${encodeURIComponent(planId)}`
        window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
        return
      }

      setToken(session.access_token)
      setState('ready')
    }

    void start()
  }, [planId])

  async function handlePay() {
    if (!withdrawalAccepted || !token) return
    setState('paying')
    try {
      const res = await fetch('/api/checkout/student-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          plan_id: planId,
          withdrawal_accepted: true,
          withdrawal_version: WITHDRAWAL_VERSION,
        }),
      })

      const data = await res.json()

      if (res.status === 409) { setState('already_active'); return }
      if (!res.ok) {
        setErrorMsg(data.error ?? 'No hemos podido iniciar el pago. Inténtalo de nuevo.')
        setState('error')
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        setErrorMsg('No hemos podido obtener la URL de pago.')
        setState('error')
      }
    } catch {
      setErrorMsg('Error de conexión. Comprueba tu conexión y vuelve a intentarlo.')
      setState('error')
    }
  }

  if (state === 'already_active') {
    return (
      <CheckoutShell>
        <Logo />
        <div style={styles.iconRow}>
          <div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}>
            <CheckCircle2 size={26} strokeWidth={2.2} />
          </div>
        </div>
        <h1 style={{ ...styles.title, fontFamily: B }}>Ya tienes acceso.</h1>
        <p style={{ ...styles.body, textAlign: 'center' }}>
          Tu cuenta ya tiene un plan activo. No necesitas volver a pagar.
        </p>
        <a href="/examenes" style={{ ...styles.btnPrimary, fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>Ir a Kairo →</a>
      </CheckoutShell>
    )
  }

  if (state === 'error') {
    return (
      <CheckoutShell>
        <Logo />
        <div style={styles.iconRow}>
          <div style={{ ...styles.iconBadge, borderColor: 'rgba(248,113,113,.3)', color: '#f87171' }}>✕</div>
        </div>
        <h1 style={{ ...styles.title, fontFamily: B }}>Algo ha salido mal.</h1>
        <p style={{ ...styles.body, textAlign: 'center' }}>{errorMsg}</p>
        <a href="/pricing" style={{ ...styles.btnPrimary, fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)' }}>Ver planes →</a>
        <a href="mailto:hola@kairo.es" style={{ ...styles.link, textAlign: 'center', display: 'block', marginTop: 14 }}>hola@kairo.es</a>
      </CheckoutShell>
    )
  }

  if (state === 'ready') {
    return (
      <CheckoutShell>
        <style>{`
          .co-field { display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.12); cursor: pointer; transition: border-color 160ms, background 160ms; }
          .co-field.checked { border-color: rgba(255,255,255,.4); background: rgba(255,255,255,.08); }
          .co-btn { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; height: 54px; background: #fff; color: #0d0d0d; font-size: 15px; font-weight: 700; letter-spacing: .01em; border: none; cursor: pointer; transition: transform 160ms cubic-bezier(0.22,1,0.36,1), opacity 160ms; font-family: var(--font-geist-sans, system-ui, sans-serif); }
          .co-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: .93; }
          .co-btn:active:not(:disabled) { transform: scale(0.98); }
          .co-btn:disabled { opacity: .32; cursor: not-allowed; }
        `}</style>
        <Logo />
        <p style={{ ...styles.eyebrow, fontFamily: M, textAlign: 'center' }}>Camino PAU · Checkout</p>
        <h1 style={{ ...styles.title, fontFamily: B, textAlign: 'center' }}>Plan {planLabel}.</h1>
        <p style={{ ...styles.body, textAlign: 'center', marginBottom: 4 }}>Antes de ir al pago, confirma lo siguiente:</p>

        <label className={`co-field${withdrawalAccepted ? ' checked' : ''}`}>
          <input
            type="checkbox"
            checked={withdrawalAccepted}
            onChange={e => setWithdrawalAccepted(e.target.checked)}
            style={{ marginTop: 2, flexShrink: 0, width: 16, height: 16, accentColor: '#fff', cursor: 'pointer' }}
          />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1.6 }}>
            Solicito acceso inmediato a Kairo y entiendo que, al empezar a usarlo, pierdo el derecho de desistimiento de 14 días una vez el servicio se haya prestado por completo.{' '}
            <a href="/legal/terminos#desistimiento" target="_blank" rel="noopener noreferrer" style={styles.link}>Saber más</a>
          </span>
        </label>

        {errorMsg && (
          <div role="alert" style={styles.errorBanner}>{errorMsg}</div>
        )}

        <button type="button" onClick={handlePay} disabled={!withdrawalAccepted} className="co-btn" style={{ marginTop: 4 }}>
          <Lock size={16} /> Ir al pago
        </button>
        <p style={{ ...styles.eyebrow, fontFamily: M, textAlign: 'center', marginTop: 4 }}>Pago seguro procesado por Stripe</p>
      </CheckoutShell>
    )
  }

  if (state === 'paying') {
    return (
      <div style={{ position: 'relative' }}>
        <KairoLoader />
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 48, gap: 8, pointerEvents: 'none' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.55)', margin: 0 }}>
            Preparando el pago del plan <strong style={{ color: 'white' }}>{planLabel}</strong>
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', margin: 0 }}>No cierres esta ventana</p>
        </div>
      </div>
    )
  }

  return <KairoLoader />
}

function Logo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/kairo-logo-white.png" alt="Kairo" loading="eager" style={{ height: 26, width: 'auto', display: 'block' }} />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<KairoLoader />}>
      <CheckoutFlow />
    </Suspense>
  )
}

const styles: Record<string, React.CSSProperties> = {
  eyebrow: {
    fontSize: 10,
    color: 'rgba(255,255,255,.35)',
    letterSpacing: '.14em',
    textTransform: 'uppercase',
    margin: '0 0 6px',
  },
  title: {
    fontSize: 'clamp(36px, 6vw, 48px)',
    lineHeight: .92,
    letterSpacing: '.01em',
    color: '#fff',
    margin: '0 0 16px',
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,.55)',
    lineHeight: 1.7,
    margin: '0 0 20px',
  },
  iconRow: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: 18,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    fontSize: 20,
    fontWeight: 900,
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.12)',
  },
  errorBanner: {
    padding: '10px 14px',
    background: 'rgba(220,38,38,.12)',
    border: '1px solid rgba(220,38,38,.3)',
    fontSize: 13,
    color: '#f87171',
    fontWeight: 600,
    width: '100%',
    textAlign: 'left',
    marginTop: 14,
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    background: '#fff',
    color: '#0d0d0d',
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    marginTop: 4,
  },
  link: {
    color: 'rgba(255,255,255,.75)',
    fontWeight: 600,
    textDecoration: 'underline',
    textUnderlineOffset: 2,
  },
}
