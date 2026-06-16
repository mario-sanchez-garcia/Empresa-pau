import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import PausiaBrand from '@/components/shared/PausiaBrand'

export const metadata: Metadata = {
  title: 'Pago recibido · Pausia',
  description: 'Tu pago ha sido recibido. Estamos activando el Pack Curso PAU.',
}

// This page is intentionally passive — it does NOT activate any entitlement.
// Activation happens exclusively in the Stripe webhook.
export default function ParentCheckoutSuccess() {
  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoRow}>
          <PausiaBrand subtitle={null} size="md" />
        </div>

        <div style={styles.successIcon}><CheckCircle2 size={34} strokeWidth={2.4} /></div>

        <h1 style={styles.title}>Pago recibido</h1>

        <p style={styles.body}>
          Hemos recibido tu pago. El Pack Curso PAU se activará automáticamente
          en los próximos minutos una vez que confirmemos el pago con Stripe.
        </p>

        <p style={styles.body}>
          El alumno recibirá acceso completo al Camino PAU en su cuenta de Pausia.
          No es necesario hacer nada más.
        </p>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            Si el acceso no aparece en 10 minutos, escríbenos a{' '}
            <a href="mailto:hola@pausia.es" style={{ color: '#1e40af', fontWeight: 700 }}>hola@pausia.es</a> con el número de pedido que Stripe
            te ha enviado por email.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8, justifyContent: 'center' as const }}>
          <a href="/legal/privacidad" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Privacidad</a>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
          <a href="/legal/terminos" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Términos</a>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
          <a href="/legal/reembolsos" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Reembolsos</a>
          <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
          <a href="/contacto" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Contacto</a>
        </div>
      </div>
    </main>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 20% 10%, rgba(219,234,254,0.9), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #eff6ff 100%)',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 20,
    alignItems: 'center' as const,
    textAlign: 'center' as const,
  },
  logoRow: { display: 'flex' as const, alignItems: 'center' as const, gap: 10 },
  successIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    display: 'grid' as const,
    placeItems: 'center' as const,
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
  infoText: { fontSize: 13, color: '#1e40af', lineHeight: 1.5, margin: 0, textAlign: 'left' as const },
}
