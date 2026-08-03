'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import KairoBrand from '@/components/shared/KairoBrand'
import { supabase } from '@/app/lib/supabase'

type CheckStatus = 'checking' | 'success' | 'pending' | 'signed_out'

const POLL_INTERVAL_MS = 2500
const MAX_ATTEMPTS = 16 // ~40s total

export default function CheckoutSuccessClient() {
  const [status, setStatus] = useState<CheckStatus>('checking')
  const attemptsRef = useRef(0)
  const cancelledRef = useRef(false)

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

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <KairoBrand subtitle={null} size="md" />
        </div>

        {status === 'checking' && (
          <>
            <div style={styles.spinnerIcon}>
              <style>{`@keyframes cs-spin{to{transform:rotate(360deg)}}`}</style>
              <div style={styles.spinner} />
            </div>
            <h1 style={styles.title}>Confirmando tu pago…</h1>
            <p style={styles.body}>
              Hemos recibido tu pago y estamos activando tu acceso. Esto tarda unos segundos.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} strokeWidth={2.4} />
            </div>
            <h1 style={styles.title}>¡Tu acceso está activado!</h1>
            <p style={styles.body}>Tu pago se ha completado y tu plan ya está listo para usarse.</p>
            <a href="/examenes" style={styles.cta}>Ir a Kairo →</a>
          </>
        )}

        {status === 'pending' && (
          <>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} strokeWidth={2.4} />
            </div>
            <h1 style={styles.title}>Tu pago se ha completado</h1>
            <p style={styles.body}>
              Está tardando más de lo normal en activarse. Puedes volver a comprobarlo o esperar un poco más — no hace falta pagar de nuevo.
            </p>
            <button onClick={retry} style={{ ...styles.cta, border: 'none', cursor: 'pointer' }}>Comprobar de nuevo</button>
            <div style={styles.infoBox}>
              <p style={styles.infoText}>
                Si sigue sin aparecer en unos minutos, escríbenos a{' '}
                <a href="mailto:hola@kairo.es" style={{ color: '#1e40af', fontWeight: 700 }}>hola@kairo.es</a>{' '}
                con el número de pedido que Stripe te ha enviado por email.
              </p>
            </div>
          </>
        )}

        {status === 'signed_out' && (
          <>
            <div style={styles.successIcon}>
              <CheckCircle2 size={34} strokeWidth={2.4} />
            </div>
            <h1 style={styles.title}>Tu pago se ha completado</h1>
            <p style={styles.body}>Inicia sesión con la misma cuenta para ver tu acceso activado.</p>
            <a href="/login" style={styles.cta}>Iniciar sesión →</a>
          </>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          <a href="/legal/privacidad" style={styles.footLink}>Privacidad</a>
          <span style={styles.dot}>·</span>
          <a href="/legal/terminos" style={styles.footLink}>Términos</a>
          <span style={styles.dot}>·</span>
          <a href="/legal/reembolsos" style={styles.footLink}>Reembolsos</a>
        </div>
      </div>
    </main>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 10%, rgba(219,234,254,0.9), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #eff6ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    background: 'rgba(255,255,255,0.78)',
    border: '1px solid rgba(219,231,251,0.80)',
    backdropFilter: 'blur(20px) saturate(1.16)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.16)',
    borderRadius: 24,
    boxShadow: '0 22px 60px rgba(37,99,235,0.11), 0 2px 8px rgba(37,99,235,0.05)',
    padding: '40px 36px',
    maxWidth: 440,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
  logoRow: { display: 'flex', alignItems: 'center', gap: 10 },
  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    display: 'grid',
    placeItems: 'center',
    color: '#16a34a',
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    boxShadow: '0 16px 34px rgba(22,163,74,0.12)',
  },
  spinnerIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    display: 'grid',
    placeItems: 'center',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
  },
  spinner: {
    width: 26,
    height: 26,
    borderRadius: '50%',
    border: '3px solid rgba(37,99,235,0.18)',
    borderTopColor: '#2563eb',
    animation: 'cs-spin 0.7s linear infinite',
  },
  title: { fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 },
  body: { fontSize: 15, color: '#64748b', lineHeight: 1.7, margin: 0 },
  infoBox: {
    background: 'rgba(239,246,255,0.9)',
    border: '1px solid #bfdbfe',
    borderRadius: 16,
    padding: '14px 18px',
    width: '100%',
  },
  infoText: { fontSize: 13, color: '#1e40af', lineHeight: 1.5, margin: 0, textAlign: 'left' },
  cta: {
    display: 'block',
    padding: '13px 32px',
    background: '#2563eb',
    color: 'white',
    borderRadius: 14,
    fontWeight: 900,
    fontSize: 15,
    textDecoration: 'none',
    width: '100%',
    textAlign: 'center',
  },
  footLink: { fontSize: 12, color: '#94a3b8', textDecoration: 'none' },
  dot: { fontSize: 12, color: '#d1d5db' },
}
