import type { Metadata } from 'next'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { CheckCircle2 } from 'lucide-react'
import CheckoutShell from '@/components/shared/CheckoutShell'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const B = bebas.style.fontFamily
const M = dmMono.style.fontFamily

export const metadata: Metadata = {
  title: 'Pago recibido · Kairo',
  description: 'Tu pago ha sido recibido. Estamos activando el Pack Curso PAU.',
}

// This page is intentionally passive — it does NOT activate any entitlement.
// Activation happens exclusively in the Stripe webhook.
export default function ParentCheckoutSuccess() {
  return (
    <CheckoutShell>
      <div style={styles.logoRow}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 26, width: 'auto', display: 'block' }} />
      </div>

      <div style={styles.iconRow}><div style={{ ...styles.iconBadge, borderColor: 'rgba(74,222,128,.3)', color: '#4ade80' }}><CheckCircle2 size={26} strokeWidth={2.2} /></div></div>

      <h1 style={{ ...styles.title, fontFamily: B }}>Pago recibido.</h1>

      <p style={styles.body}>
        Hemos recibido tu pago. El Pack Curso PAU se activará automáticamente
        en los próximos minutos una vez que confirmemos el pago con Stripe.
      </p>

      <p style={styles.body}>
        El alumno recibirá acceso completo al Camino PAU en su cuenta de Kairo.
        No es necesario hacer nada más.
      </p>

      <div style={styles.infoBox}>
        <p style={{ ...styles.infoText, fontFamily: M }}>
          Si el acceso no aparece en 10 minutos, escríbenos a{' '}
          <a href="mailto:hola@kairo.es" style={styles.link}>hola@kairo.es</a> con el número de pedido que Stripe
          te ha enviado por email.
        </p>
      </div>

      <div style={styles.footerLinks}>
        <a href="/legal/privacidad" style={styles.footLink}>Privacidad</a>
        <span style={styles.dot}>·</span>
        <a href="/legal/terminos" style={styles.footLink}>Términos</a>
        <span style={styles.dot}>·</span>
        <a href="/legal/reembolsos" style={styles.footLink}>Reembolsos</a>
        <span style={styles.dot}>·</span>
        <a href="/contacto" style={styles.footLink}>Contacto</a>
      </div>
    </CheckoutShell>
  )
}

const styles: Record<string, React.CSSProperties> = {
  logoRow: { display: 'flex', justifyContent: 'center', marginBottom: 28 },
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
  title: {
    fontSize: 'clamp(32px, 6vw, 44px)',
    lineHeight: .92,
    letterSpacing: '.01em',
    color: '#fff',
    margin: '0 0 16px',
    textAlign: 'center',
  },
  body: { fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, margin: '0 0 14px', textAlign: 'center' },
  infoBox: {
    background: 'rgba(255,255,255,.05)',
    border: '1px solid rgba(255,255,255,.1)',
    padding: '14px 16px',
    width: '100%',
    marginTop: 6,
  },
  infoText: { fontSize: 12, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, margin: 0, textAlign: 'left' },
  link: { color: 'rgba(255,255,255,.75)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: 2 },
  footerLinks: { display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 },
  footLink: { fontSize: 12, color: 'rgba(255,255,255,.3)', textDecoration: 'none' },
  dot: { fontSize: 12, color: 'rgba(255,255,255,.15)' },
}
