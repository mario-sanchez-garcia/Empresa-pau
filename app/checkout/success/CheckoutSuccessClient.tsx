'use client'

import { useEffect, useRef, useState } from 'react'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import KairoLoader from '@/app/components/ui/KairoLoader'
import CheckoutShell from '@/components/shared/CheckoutShell'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

type CheckStatus = 'checking' | 'success' | 'pending' | 'signed_out'

const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 16 // ~40s total

export default function CheckoutSuccessClient() {
  const [status, setStatus] = useState<CheckStatus>('checking')
  const attemptsRef = useRef(0)
  const cancelledRef = useRef(false)

  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  useEffect(() => {
    cancelledRef.current = false

    async function pollOnce() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        if (!cancelledRef.current) setStatus('signed_out')
        return
      }

      try {
        const res = await fetch('/api/billing/me', { headers: { Authorization: `Bearer ${token}` } })
        const body = await res.json().catch(() => null)
        if (body?.hasActivePack) {
          if (!cancelledRef.current) setStatus('success')
          return
        }
      } catch { /* red temporal — reintenta en el próximo tick */ }

      attemptsRef.current += 1
      if (cancelledRef.current) return
      if (attemptsRef.current >= MAX_ATTEMPTS) {
        setStatus('pending')
        return
      }
      setTimeout(pollOnce, POLL_INTERVAL_MS)
    }

    pollOnce()
    return () => { cancelledRef.current = true }
  }, [])

  function retry() {
    attemptsRef.current = 0
    setStatus('checking')
  }

  if (status === 'checking') {
    return (
      <div style={{ position: 'relative' }}>
        <KairoLoader />
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 48, gap: 8, pointerEvents: 'none' }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.55)', margin: 0 }}>Estamos procesando tu pago</p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', margin: 0 }}>No cierres esta ventana</p>
        </div>
      </div>
    )
  }

  return (
    <CheckoutShell>
      <Logo />

      {status === 'success' && (
        <>
          <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}><CheckCircle2 size={26} strokeWidth={2.2} /></div></div>
          <h1 style={{ ...styles.title, fontFamily: B, textAlign: 'center' }}>¡Tu acceso está activado!</h1>
          <p style={{ ...styles.body, textAlign: 'center' }}>Tu pago se ha completado y tu plan ya está listo para usarse.</p>
          <a href="/examenes" style={styles.btnPrimary}>Ir a Kairo →</a>
        </>
      )}

      {status === 'pending' && (
        <>
          <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}><CheckCircle2 size={26} strokeWidth={2.2} /></div></div>
          <h1 style={{ ...styles.title, fontFamily: B, textAlign: 'center' }}>Tu pago se ha completado.</h1>
          <p style={{ ...styles.body, textAlign: 'center' }}>
            Está tardando más de lo normal en activarse. Puedes volver a comprobarlo o esperar un poco más — no hace falta pagar de nuevo.
          </p>
          <button onClick={retry} className="co-btn" style={styles.btnAsButton}>Comprobar de nuevo</button>
          <div style={styles.infoBox}>
            <p style={{ ...styles.infoText, fontFamily: M }}>
              Si sigue sin aparecer en unos minutos, escríbenos a{' '}
              <a href="mailto:hola@kairo.es" style={styles.link}>hola@kairo.es</a>{' '}
              con el número de pedido que Stripe te ha enviado por email.
            </p>
          </div>
        </>
      )}

      {status === 'signed_out' && (
        <>
          <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}><CheckCircle2 size={26} strokeWidth={2.2} /></div></div>
          <h1 style={{ ...styles.title, fontFamily: B, textAlign: 'center' }}>Tu pago se ha completado.</h1>
          <p style={{ ...styles.body, textAlign: 'center' }}>Inicia sesión con la misma cuenta para ver tu acceso activado.</p>
          <a href="/login" style={styles.btnPrimary}>Iniciar sesión →</a>
        </>
      )}

      <style>{`
        .co-btn { display: flex; align-items: center; justify-content: center; gap: 9px; width: 100%; height: 52px; background: #fff; color: #0d0d0d; font-size: 15px; font-weight: 700; letter-spacing: .01em; border: none; cursor: pointer; transition: transform 160ms cubic-bezier(0.22,1,0.36,1), opacity 160ms; font-family: var(--font-geist-sans, system-ui, sans-serif); }
        .co-btn:hover { transform: translateY(-1px); opacity: .93; }
        .co-btn:active { transform: scale(0.98); }
      `}</style>

      <div style={styles.footerLinks}>
        <a href="/legal/privacidad" style={styles.footLink}>Privacidad</a>
        <span style={styles.dot}>·</span>
        <a href="/legal/terminos" style={styles.footLink}>Términos</a>
        <span style={styles.dot}>·</span>
        <a href="/legal/reembolsos" style={styles.footLink}>Reembolsos</a>
      </div>
    </CheckoutShell>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 26, width: 'auto', display: 'block' }} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  title: {
    fontSize: 'clamp(32px, 6vw, 44px)',
    lineHeight: .92,
    letterSpacing: '.01em',
    color: '#fff',
    margin: '0 0 14px',
  },
  body: {
    fontSize: 14,
    color: 'rgba(255,255,255,.55)',
    lineHeight: 1.7,
    margin: '0 0 22px',
  },
  iconRow: { display: 'flex', justifyContent: 'center', marginBottom: 18 },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.12)',
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
    fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)',
  },
  btnAsButton: { marginBottom: 16 },
  infoBox: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    padding: '14px 16px',
    width: '100%',
  },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, margin: 0, textAlign: 'left' },
  link: { color: 'rgba(255,255,255,.75)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 },
  footerLinks: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 },
  footLink: { fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' },
  dot: { fontSize: 12, color: 'rgba(255,255,255,.15)' },
}
