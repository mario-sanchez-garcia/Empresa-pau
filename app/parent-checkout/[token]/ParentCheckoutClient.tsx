'use client'

import { useState } from 'react'
import { CheckCircle2, Lock, PenLine, Shield, Sparkles, Timer, TrendingUp } from 'lucide-react'
import PausiaBrand from '@/components/shared/PausiaBrand'

interface Props {
  token: string
  planId: string
  planLabel: string
  planFeatures: string[]
  priceCents: number
  currency: string
  studentDisplayName: string | null
  expiresAt: string
}

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100)
}

function formatExpiry(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return '' }
}

export default function ParentCheckoutClient({
  token, planLabel, planFeatures, priceCents, currency, studentDisplayName, expiresAt
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout/parent-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar el pago. Inténtalo de nuevo.')
        return
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const price = formatPrice(priceCents, currency)
  const expiry = formatExpiry(expiresAt)
  const name = studentDisplayName

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <Logo />
          <div style={styles.badge}>Pago seguro</div>
        </div>

        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.heroTitle}>
            {name ? `Camino PAU para ${name}` : 'Camino PAU · Pausia'}
          </h1>
          <p style={styles.heroSub}>
            Plan de estudio PAU de septiembre a junio con misiones diarias personalizadas,
            correcciones con IA y simulacros completos.
          </p>
        </div>

        {/* What is Pausia */}
        <div style={styles.whatIsSection}>
          <p style={styles.whatIsText}>
            Pausia es la plataforma que prepara a tu hijo/a para la PAU con inteligencia artificial. Corrige sus ejercicios con las rúbricas oficiales de corrección, igual que haría un profesor — en segundos.
          </p>
        </div>

        {/* How it works */}
        <div style={styles.howItWorksSection}>
          <p style={styles.sectionLabel}>Cómo funciona</p>
          <div style={styles.stepsList}>
            <div style={styles.stepItem}>
              <div style={styles.stepIconWrap}><PenLine size={16} style={{ color: '#2563eb' }} /></div>
              <p style={styles.stepText}>Tu hijo/a hace ejercicios de sus exámenes PAU reales</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepIconWrap}><Sparkles size={16} style={{ color: '#7c3aed' }} /></div>
              <p style={styles.stepText}>La IA los corrige con criterios oficiales y explica cada error</p>
            </div>
            <div style={styles.stepItem}>
              <div style={styles.stepIconWrap}><TrendingUp size={16} style={{ color: '#059669' }} /></div>
              <p style={styles.stepText}>Mejora cada día con su plan de estudio personalizado</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={styles.featuresCard}>
          <p style={styles.featuresTitle}>Qué incluye el {planLabel}</p>
          <ul style={styles.featuresList}>
            {planFeatures.map(f => (
              <li key={f} style={styles.featureItem}>
                <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: 2 }} />
                <span style={styles.featureText}>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Guarantee */}
        <div style={styles.guaranteeGreen}>
          <Shield size={20} style={{ color: '#15803d', flexShrink: 0 }} />
          <p style={styles.guaranteeGreenText}>
            <strong>Garantía de devolución de 7 días.</strong> Si no estás satisfecho, te devolvemos el dinero sin preguntas. <a href="mailto:hola@pausia.es" style={{ color: '#15803d' }}>hola@pausia.es</a> · <a href="/legal/reembolsos" style={{ color: '#15803d' }}>Política de reembolsos</a>
          </p>
        </div>

        {/* IA disclaimer */}
        <div style={styles.disclaimer}>
          <p style={styles.disclaimerText}>
            Las correcciones generadas por IA son orientativas y pueden contener errores. No sustituyen a un profesor ni a los criterios oficiales de corrección PAU.{' '}
            <a href="/legal/ia" style={{ color: '#94a3b8', textDecoration: 'underline' }}>Política de uso de IA</a>
          </p>
        </div>

        {/* Price + CTA */}
        <div style={styles.ctaSection}>
          <div style={styles.priceRow}>
            <span style={styles.priceLabel}>Precio único</span>
            <span style={styles.priceValue}>{price}</span>
          </div>
          <p style={styles.priceNote}>Un solo pago. Sin suscripción mensual.</p>

          {error && <p style={styles.errorMsg}>{error}</p>}

          <p style={styles.trustNote}>
            Pago único de {price}. Sin suscripción. Sin renovaciones automáticas. Tu hijo/a tiene acceso durante todo el curso 2026-2027.
          </p>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            style={{ ...styles.ctaButton, opacity: loading ? 0.7 : 1, cursor: loading ? 'wait' : 'pointer' }}
          >
            <Lock size={16} />
            {loading ? 'Redirigiendo a pago…' : `Desbloquear ${planLabel}`}
          </button>

          <div style={styles.securityRow}>
            <Shield size={13} />
            <span style={styles.securityText}>Pago procesado por Stripe · Datos cifrados</span>
          </div>
        </div>

        {/* Expiry notice */}
        {expiry && (
          <div style={styles.expiryRow}>
            <Timer size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <p style={styles.expiryText}>Este enlace caduca el {expiry}</p>
          </div>
        )}

        {/* Legal footer */}
        <div style={styles.legalFooter}>
          <a href="/legal/privacidad" style={styles.legalLink}>Privacidad</a>
          <span style={styles.legalSep}>·</span>
          <a href="/legal/terminos" style={styles.legalLink}>Términos</a>
          <span style={styles.legalSep}>·</span>
          <a href="/legal/reembolsos" style={styles.legalLink}>Reembolsos</a>
          <span style={styles.legalSep}>·</span>
          <a href="/legal/ia" style={styles.legalLink}>Uso de IA</a>
          <span style={styles.legalSep}>·</span>
          <a href="/contacto" style={styles.legalLink}>Contacto</a>
        </div>
      </div>
    </main>
  )
}

function Logo() {
  return (
    <PausiaBrand subtitle={null} size="sm" />
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: 'radial-gradient(ellipse 90% 60% at -5% -5%, rgba(219,234,254,0.55) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 105% -10%, rgba(224,231,255,0.42) 0%, transparent 50%), radial-gradient(ellipse 50% 70% at 50% 110%, rgba(239,246,255,0.35) 0%, transparent 60%), linear-gradient(165deg, #f7faff 0%, #f0f5fe 60%, #edf2fd 100%)',
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
    justifyContent: 'center' as const,
    padding: '32px 16px 64px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif',
  },
  container: {
    background: 'rgba(255,255,255,0.78)',
    backdropFilter: 'blur(20px) saturate(1.16)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.16)',
    borderRadius: 24,
    border: '1px solid rgba(219,231,251,0.80)',
    boxShadow: '0 22px 60px rgba(37,99,235,0.11), 0 2px 8px rgba(37,99,235,0.05)',
    padding: '36px 32px',
    maxWidth: 460,
    width: '100%',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 24,
  },
  header: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  },
  badge: {
    background: 'rgba(5,150,105,0.08)',
    border: '1px solid rgba(5,150,105,0.22)',
    color: '#065f46',
    borderRadius: 999,
    padding: '4px 12px',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.02em',
  },
  hero: { display: 'flex' as const, flexDirection: 'column' as const, gap: 8 },
  heroTitle: { fontSize: 24, fontWeight: 900, color: '#0d1424', margin: 0, lineHeight: 1.2, letterSpacing: '-0.02em' },
  heroSub: { fontSize: 15, color: '#64748b', lineHeight: 1.6, margin: 0 },
  whatIsSection: {
    background: 'rgba(241,245,254,0.85)',
    borderRadius: 14,
    padding: '14px 16px',
    border: '1px solid rgba(219,231,251,0.7)',
  },
  whatIsText: { fontSize: 14, color: '#374151', lineHeight: 1.65, margin: 0 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 800,
    color: '#94a3b8',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: 0,
  },
  howItWorksSection: { display: 'flex' as const, flexDirection: 'column' as const, gap: 12 },
  stepsList: { display: 'flex' as const, flexDirection: 'column' as const, gap: 10 },
  stepItem: { display: 'flex' as const, alignItems: 'center' as const, gap: 12 },
  stepIconWrap: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: 32,
    height: 32,
    borderRadius: 10,
    background: 'rgba(248,250,252,0.95)',
    border: '1px solid rgba(226,232,240,0.85)',
    flexShrink: 0,
  },
  stepText: { fontSize: 14, color: '#374151', lineHeight: 1.5, margin: 0 },
  featuresCard: {
    background: 'rgba(248,251,255,0.9)',
    borderRadius: 18,
    padding: '18px 20px',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 12,
    border: '1px solid rgba(219,231,251,0.75)',
  },
  featuresTitle: { fontSize: 13, fontWeight: 800, color: '#64748b', margin: 0 },
  featuresList: { listStyle: 'none', margin: 0, padding: 0, display: 'flex' as const, flexDirection: 'column' as const, gap: 8 },
  featureItem: { display: 'flex' as const, alignItems: 'flex-start' as const, gap: 10 },
  featureText: { fontSize: 14, color: '#374151', lineHeight: 1.5 },
  guarantee: {
    display: 'flex' as const,
    gap: 12,
    background: 'rgba(239,246,255,0.85)',
    border: '1px solid #bfdbfe',
    borderRadius: 16,
    padding: '14px 16px',
    alignItems: 'flex-start' as const,
  },
  guaranteeText: { fontSize: 13, color: '#1e40af', lineHeight: 1.5, margin: 0 },
  guaranteeGreen: {
    display: 'flex' as const,
    gap: 12,
    background: 'rgba(220,252,231,0.75)',
    border: '1px solid rgba(134,239,172,0.65)',
    borderRadius: 16,
    padding: '16px 18px',
    alignItems: 'flex-start' as const,
  },
  guaranteeGreenText: { fontSize: 13, color: '#14532d', lineHeight: 1.55, margin: 0 },
  ctaSection: { display: 'flex' as const, flexDirection: 'column' as const, gap: 12 },
  priceRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    padding: '0 4px',
  },
  priceLabel: { fontSize: 14, fontWeight: 600, color: '#64748b' },
  priceValue: { fontSize: 28, fontWeight: 900, color: '#111827' },
  priceNote: { fontSize: 12, color: '#94a3b8', margin: 0, textAlign: 'right' as const },
  trustNote: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 1.55,
    margin: 0,
    textAlign: 'center' as const,
    fontWeight: 500,
    padding: '2px 0',
  },
  errorMsg: {
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: 14,
    padding: '10px 14px',
    fontSize: 13,
    color: '#dc2626',
    margin: 0,
  },
  ctaButton: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #38bdf8 100%)',
    color: 'white',
    border: 'none',
    borderRadius: 16,
    padding: '16px 24px',
    fontSize: 16,
    fontWeight: 800,
    width: '100%',
    boxShadow: '0 14px 32px rgba(37,99,235,0.22)',
    transition: 'transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1)',
  },
  securityRow: { display: 'flex' as const, justifyContent: 'center' as const, alignItems: 'center' as const, gap: 6, color: '#94a3b8' },
  securityText: { fontSize: 12, color: '#94a3b8' },
  expiryRow: {
    display: 'flex' as const,
    alignItems: 'center' as const,
    gap: 6,
    justifyContent: 'center' as const,
  },
  expiryText: { fontSize: 12, color: '#94a3b8', margin: 0 },
  disclaimer: { background: '#f8fafc', borderRadius: 10, padding: '10px 14px' },
  disclaimerText: { fontSize: 12, color: '#94a3b8', lineHeight: 1.5, margin: 0 },
  legalFooter: { display: 'flex' as const, flexWrap: 'wrap' as const, gap: 8, justifyContent: 'center' as const, paddingTop: 4 },
  legalLink: { fontSize: 12, color: '#94a3b8', textDecoration: 'none' },
  legalSep: { fontSize: 12, color: '#d1d5db' },
}
