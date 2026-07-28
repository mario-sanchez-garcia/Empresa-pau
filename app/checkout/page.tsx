'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import KairoBrand from '@/components/shared/KairoBrand'
import KairoLoader from '@/app/components/ui/KairoLoader'

const PLAN_LABELS: Record<string, string> = {
  pack_curso_pau: 'Curso PAU',
  premium: 'Premium',
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const planId = searchParams.get('plan') ?? 'pack_curso_pau'
  const planLabel = PLAN_LABELS[planId] ?? planId
  const [error, setError] = useState<string | null>(null)
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
          // Already has active plan
          window.location.href = '/examenes'
          return
        }

        if (!res.ok) {
          setError(data.error ?? 'No hemos podido iniciar el pago. Inténtalo de nuevo.')
          return
        }

        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          setError('No hemos podido obtener la URL de pago.')
        }
      } catch {
        setError('Error de conexión. Comprueba tu conexión y vuelve a intentarlo.')
      }
    }

    void start()
  }, [planId])

  if (error) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <KairoBrand subtitle={null} size="md" />
          <div style={styles.errorIcon}>✕</div>
          <h1 style={styles.title}>Algo ha salido mal</h1>
          <p style={styles.body}>{error}</p>
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
  },
  link: { fontSize: 13, color: '#2563eb', textDecoration: 'none', fontWeight: 600 },
}
