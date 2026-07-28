'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import KairoBrand from '@/components/shared/KairoBrand'
import KairoLoader from '@/app/components/ui/KairoLoader'
import { CheckCircle2 } from 'lucide-react'

const PLAN_LABELS: Record<string, string> = {
  pack_curso_pau: 'Curso PAU',
  premium: 'Premium',
}

type State = 'loading' | 'error' | 'already_active'

function CheckoutFlow() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') ?? 'pack_curso_pau'
  const planLabel = PLAN_LABELS[planId] ?? planId
  const [state, setState] = useState<State>('loading')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const initiated = useRef(false)

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

      try {
        const res = await fetch('/api/checkout/student-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ plan_id: planId }),
        })

        const data = await res.json()

        if (res.status === 409) {
          setState('already_active')
          return
        }

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

    void start()
  }, [planId])

  if (state === 'already_active') {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <KairoBrand subtitle={null} size="md" />
          <div style={styles.successIcon}>
            <CheckCircle2 size={30} strokeWidth={2.4} />
          </div>
          <h1 style={styles.title}>Ya tienes acceso</h1>
          <p style={styles.body}>
            Tu cuenta ya tiene un plan activo. No necesitas volver a pagar.
          </p>
          <a href="/examenes" style={styles.btn}>Ir a Kairo →</a>
        </div>
      </main>
    )
  }

  if (state === 'error') {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <KairoBrand subtitle={null} size="md" />
          <div style={styles.errorIcon}>✕</div>
          <h1 style={styles.title}>Algo ha salido mal</h1>
          <p style={styles.body}>{errorMsg}</p>
          <a href="/pricing" style={styles.btn}>Ver planes →</a>
          <a href="mailto:hola@kairo.es" style={styles.link}>hola@kairo.es</a>
        </div>
      </main>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <KairoLoader />
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        paddingBottom: 48, gap: 8,
        pointerEvents: 'none',
      }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,.55)', margin: 0 }}>
          Preparando el pago del plan <strong style={{ color: 'white' }}>{planLabel}</strong>
        </p>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,.28)', margin: 0 }}>
          No cierres esta ventana
        </p>
      </div>
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
    borderRadius: 24,
    boxShadow: '0 22px 60px rgba(37,99,235,0.11), 0 2px 8px rgba(37,99,235,0.05)',
    padding: '40px 36px',
    maxWidth: 420,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
    alignItems: 'center',
    textAlign: 'center',
  },
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
  errorIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: 'grid',
    placeItems: 'center',
    fontSize: 22,
    fontWeight: 900,
    color: '#dc2626',
    background: '#fef2f2',
    border: '1px solid #fecaca',
  },
  title: { fontSize: 22, fontWeight: 900, color: '#111827', margin: 0 },
  body: { fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 },
  btn: {
    display: 'block',
    padding: '12px 28px',
    background: '#2563eb',
    color: 'white',
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
    textDecoration: 'none',
    width: '100%',
    textAlign: 'center',
  },
  link: { fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 },
}
