'use client'

import { useState } from 'react'
import { BookOpen, CheckCircle2, Lock, Shield, Target, Zap } from 'lucide-react'
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

const C = {
  blue:        '#3B3BCA',
  blueDark:    '#2D2DA8',
  blueLight:   '#EEF2FF',
  blueBorder:  '#C7D2FE',
  green:       '#16A34A',
  greenLight:  '#DCFCE7',
  greenBorder: '#86EFAC',
  greenDark:   '#14532D',
  text:        '#111827',
  textSub:     '#4B5563',
  textMuted:   '#9CA3AF',
  bg:          '#F9FAFB',
  white:       '#FFFFFF',
  border:      '#E5E7EB',
  amber:       '#B45309',
  amberLight:  '#FEF9C3',
  amberBorder: '#FDE047',
  red:         '#DC2626',
  redLight:    '#FEF2F2',
  redBorder:   '#FECACA',
}

const STEPS = [
  {
    num: '01',
    title: 'Hace ejercicios de sus exámenes PAU reales',
    desc: 'Tu hijo/a practica con exámenes oficiales de años anteriores, en papel o en pantalla.',
  },
  {
    num: '02',
    title: 'La IA lo corrige con los criterios oficiales',
    desc: 'Explica exactamente qué ha fallado y por qué — igual que haría un corrector PAU oficial.',
  },
  {
    num: '03',
    title: 'Mejora cada día con su plan personalizado',
    desc: 'Un itinerario de estudio semana a semana desde septiembre hasta la PAU.',
  },
]

const STATS = [
  { Icon: BookOpen, value: '+5.000',  label: 'ejercicios PAU reales' },
  { Icon: Zap,      value: '< 30 s',  label: 'tiempo de corrección'  },
  { Icon: Target,   value: '2 CCAA',  label: 'Madrid y Cataluña'     },
]

export default function ParentCheckoutClient({
  token, planLabel, planFeatures, priceCents, currency, studentDisplayName, expiresAt,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handleCheckout() {
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/checkout/parent-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Error al iniciar el pago. Inténtalo de nuevo.'); return }
      if (data.checkoutUrl) window.location.href = data.checkoutUrl
    } catch {
      setError('Error de conexión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const price  = formatPrice(priceCents, currency)
  const expiry = formatExpiry(expiresAt)
  const name   = studentDisplayName

  const container: React.CSSProperties = { maxWidth: 600, margin: '0 auto', padding: '0 20px' }
  const font = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Helvetica, sans-serif'

  return (
    <div style={{ fontFamily: font, background: C.bg, minHeight: '100dvh', WebkitFontSmoothing: 'antialiased' }}>

      {/* ── 1. HEADER ──────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 100, background: C.white, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <PausiaBrand subtitle={null} size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: C.greenLight, border: `1px solid ${C.greenBorder}`, borderRadius: 999, padding: '6px 12px' }}>
            <Lock size={12} style={{ color: C.green }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#166534' }}>Pago seguro</span>
          </div>
        </div>
      </header>

      {/* ── 2. HERO ────────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(160deg, #EEF2FF 0%, #F0F4FF 55%, #F9FAFB 100%)', padding: '52px 0 44px' }}>
        <div style={{ ...container, textAlign: 'center' }}>

          {/* Pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: C.white, border: `1px solid ${C.blueBorder}`, borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.blue, letterSpacing: '0.02em' }}>Tu hijo/a te ha pedido esto</span>
          </div>

          {/* H1 */}
          <h1 style={{ fontSize: 'clamp(26px, 8vw, 40px)', fontWeight: 900, color: C.text, margin: '0 0 16px', lineHeight: 1.15, letterSpacing: '-0.025em', whiteSpace: 'pre-line' }}>
            {name ? `La PAU de ${name}\nempieza aquí` : 'La PAU de tu hijo/a\nempieza aquí'}
          </h1>

          {/* Sub */}
          <p style={{ fontSize: 17, color: C.textSub, lineHeight: 1.65, margin: '0 auto 40px', maxWidth: 460 }}>
            Pausia corrige sus ejercicios con las rúbricas oficiales — igual que un profesor, en segundos. Plan completo de septiembre a junio.
          </p>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {STATS.map(({ Icon, value, label }) => (
              <div key={label} style={{ background: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: '16px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                  <Icon size={18} style={{ color: C.blue }} />
                </div>
                <p style={{ fontSize: 17, fontWeight: 900, color: C.blue, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.textMuted, margin: '5px 0 0', lineHeight: 1.3 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. CÓMO FUNCIONA ───────────────────────────────────── */}
      <section style={{ background: C.white, padding: '56px 0' }}>
        <div style={container}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: C.blue, textTransform: 'uppercase', margin: '0 0 8px' }}>Cómo funciona</p>
          <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: C.text, margin: '0 0 28px', lineHeight: 1.2 }}>¿Cómo ayuda Pausia a tu hijo/a?</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {STEPS.map(step => (
              <div key={step.num} style={{ display: 'flex', gap: 18, alignItems: 'flex-start', background: C.bg, borderRadius: 18, padding: '20px', border: `1px solid ${C.border}` }}>
                <div style={{ minWidth: 44, height: 44, borderRadius: 12, background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.white, letterSpacing: '-0.02em' }}>{step.num}</span>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: '0 0 5px', lineHeight: 1.3 }}>{step.title}</p>
                  <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.6, margin: 0 }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. QUÉ INCLUYE ─────────────────────────────────────── */}
      <section style={{ background: C.bg, padding: '56px 0' }}>
        <div style={container}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: C.blue, textTransform: 'uppercase', margin: '0 0 8px' }}>Qué incluye</p>
          <h2 style={{ fontSize: 'clamp(20px, 5vw, 28px)', fontWeight: 900, color: C.text, margin: '0 0 20px', lineHeight: 1.2 }}>Todo lo que incluye el {planLabel}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {planFeatures.map((f, i) => {
              const highlight = f.toLowerCase().includes('correcciones ia')
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14, background: highlight ? C.blueLight : C.white, border: `1px solid ${highlight ? C.blueBorder : C.border}` }}>
                  <CheckCircle2 size={18} style={{ color: C.green, flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: highlight ? 700 : 500, color: highlight ? C.blue : C.text, lineHeight: 1.4, flex: 1 }}>{f}</span>
                  {highlight && (
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', color: C.blue, background: C.blueBorder, borderRadius: 999, padding: '3px 9px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                      Destacado
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 5. PRECIO + CTA ────────────────────────────────────── */}
      <section style={{ background: C.white, padding: '56px 0' }}>
        <div style={{ ...container, textAlign: 'center' }}>

          {/* Price */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 'clamp(48px, 13vw, 68px)', fontWeight: 900, color: C.text, letterSpacing: '-0.04em', lineHeight: 1 }}>{price}</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.textMuted, marginLeft: 10 }}>pago único</span>
          </div>

          <p style={{ fontSize: 14, color: C.textMuted, margin: '0 0 16px', fontWeight: 600 }}>
            Sin suscripción · Sin renovaciones · Acceso hasta junio 2027
          </p>

          {/* Comparison */}
          <p style={{ fontSize: 13, color: C.textSub, margin: '0 auto 32px', maxWidth: 380, lineHeight: 1.55, background: C.bg, borderRadius: 12, padding: '12px 16px', border: `1px solid ${C.border}` }}>
            Las academias cobran <strong>200 €/mes</strong>. Pausia cuesta{' '}
            <strong style={{ color: C.blue }}>{price} todo el curso</strong>.
          </p>

          {/* Error */}
          {error && (
            <div role="alert" style={{ background: C.redLight, border: `1px solid ${C.redBorder}`, borderRadius: 14, padding: '12px 16px', marginBottom: 16, fontSize: 14, color: C.red, fontWeight: 600, textAlign: 'left' }}>
              {error}
            </div>
          )}

          {/* CTA */}
          <button
            type="button"
            onClick={handleCheckout}
            disabled={loading}
            aria-busy={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', minHeight: 58,
              background: loading
                ? '#818CF8'
                : `linear-gradient(135deg, ${C.blue} 0%, #4F46E5 100%)`,
              color: C.white, border: 'none', borderRadius: 18,
              padding: '18px 24px', fontSize: 17, fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: loading ? 'none' : '0 10px 28px rgba(59,59,202,0.32)',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
              touchAction: 'manipulation',
              letterSpacing: '-0.01em',
            }}
          >
            <Lock size={18} />
            {loading ? 'Redirigiendo al pago…' : `Desbloquear Pausia para ${name ?? 'tu hijo/a'}`}
          </button>

          {/* Security */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12 }}>
            <Shield size={13} style={{ color: C.textMuted }} />
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>Pago procesado por Stripe · Datos cifrados SSL</span>
          </div>

          {/* Expiry */}
          {expiry && (
            <p style={{ fontSize: 13, color: C.amber, fontWeight: 700, marginTop: 20, background: C.amberLight, border: `1px solid ${C.amberBorder}`, borderRadius: 10, padding: '9px 16px', display: 'inline-block' }}>
              Este enlace caduca el {expiry}
            </p>
          )}
        </div>
      </section>

      {/* ── 6. GARANTÍA ────────────────────────────────────────── */}
      <section style={{ background: C.greenLight, borderTop: `1px solid ${C.greenBorder}`, padding: '52px 0' }}>
        <div style={{ ...container, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 20, background: C.white, border: `1px solid ${C.greenBorder}`, marginBottom: 20, boxShadow: '0 4px 12px rgba(22,163,74,0.12)' }}>
            <Shield size={28} style={{ color: C.green }} />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 900, color: C.greenDark, margin: '0 0 12px', lineHeight: 1.2 }}>Garantía de devolución de 7 días</h2>
          <p style={{ fontSize: 15, color: '#166534', lineHeight: 1.7, margin: '0 auto', maxWidth: 420 }}>
            Si en los primeros 7 días no estás satisfecho, te devolvemos el dinero completo sin preguntas.
            Escríbenos a{' '}
            <a href="mailto:legal@pausia.es" style={{ color: C.green, fontWeight: 700 }}>legal@pausia.es</a>.
            {' '}Ver{' '}
            <a href="/legal/reembolsos" style={{ color: C.green, fontWeight: 700 }}>política de reembolsos</a>.
          </p>
        </div>
      </section>

      {/* ── 7. FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: '#F3F4F6', borderTop: `1px solid ${C.border}`, padding: '32px 0' }}>
        <div style={{ ...container, textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '6px 18px', marginBottom: 14 }}>
            {[
              { label: '© 2026 Pausia', href: null },
              { label: 'legal@pausia.es', href: 'mailto:legal@pausia.es' },
              { label: 'Términos', href: '/legal/terminos' },
              { label: 'Privacidad', href: '/legal/privacidad' },
            ].map(({ label, href }) =>
              href ? (
                <a key={label} href={href} style={{ fontSize: 13, color: C.textMuted, fontWeight: 600, textDecoration: 'none' }}>{label}</a>
              ) : (
                <span key={label} style={{ fontSize: 13, color: C.textMuted, fontWeight: 600 }}>{label}</span>
              )
            )}
          </div>
          <p style={{ fontSize: 11, color: '#D1D5DB', lineHeight: 1.6, margin: '0 auto', maxWidth: 460 }}>
            Las correcciones generadas por IA son orientativas y pueden contener errores. No sustituyen a un profesor ni a los criterios oficiales de corrección PAU.{' '}
            <a href="/legal/ia" style={{ color: '#D1D5DB', textDecoration: 'underline' }}>Política de uso de IA</a>
          </p>
        </div>
      </footer>

    </div>
  )
}
