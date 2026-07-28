import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import KairoBrand from '@/components/shared/KairoBrand'

export const metadata: Metadata = {
  title: 'Pago completado · Kairo',
  description: 'Tu pago se ha completado. Bienvenido a Kairo Premium.',
}

export default function CheckoutSuccess() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoRow}>
          <KairoBrand subtitle={null} size="md" />
        </div>

        <div style={styles.successIcon}>
          <CheckCircle2 size={34} strokeWidth={2.4} />
        </div>

        <h1 style={styles.title}>¡Tu acceso está activado!</h1>

        <p style={styles.body}>
          Tu pago se ha completado. El plan se activará en unos segundos.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Si el acceso no aparece en 5 minutos, escríbenos a{' '}
            <a href="mailto:hola@kairo.es" style={{ color: '#1e40af', fontWeight: 700 }}>
              hola@kairo.es
            </a>{' '}
            con el número de pedido que Stripe te ha enviado por email.
          </p>
        </div>

        <a href="/examenes" style={styles.cta}>Ir a Kairo →</a>

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
