'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, X, Sparkles } from 'lucide-react'
import PausiaBrand from '@/components/shared/PausiaBrand'

const C = {
  ink: '#111827',
  muted: '#64748b',
  soft: '#94a3b8',
  border: '#dbe7fb',
  blue: '#2563eb',
  deep: '#1d4ed8',
  sky: '#38bdf8',
  wash: '#eff6ff',
  grad: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 54%, #38bdf8 100%)',
  bg: 'radial-gradient(circle at 16% 12%, rgba(219,234,254,0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224,231,255,0.78), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186,230,253,0.52), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)',
}

type Plan = {
  name: string
  price: string
  priceStrike?: string
  note: string
  description: string
  features: Array<{ text: string; included: boolean }>
  cta: string
  href: string
  recommended?: boolean
  badge?: string
  badgeAmber?: boolean
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: '0 €',
    note: 'Sin tarjeta',
    description: 'Para probar Pausia y practicar con exámenes reales sin ningún compromiso.',
    features: [
      { text: '10 correcciones con IA al mes', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Historial básico', included: true },
      { text: 'Camino PAU', included: false },
      { text: 'Simulacros', included: false },
      { text: 'Chat tutor IA ilimitado', included: false },
    ],
    cta: 'Empezar gratis',
    href: '/login',
  },
  {
    name: 'Mensual',
    price: '7,99 €',
    note: '/mes · cancela cuando quieras',
    description: 'Todo incluido. La forma más flexible de preparar la PAU mes a mes.',
    features: [
      { text: 'Correcciones ilimitadas con IA', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU y misiones diarias', included: true },
      { text: 'Simulacros con tiempo real', included: true },
      { text: 'Chat con tutor IA 24/7', included: true },
      { text: 'Plan de estudio personalizado', included: true },
    ],
    cta: 'Empezar ahora',
    href: '/login',
    recommended: true,
    badge: 'Precio de lanzamiento',
  },
  {
    name: 'Pack Curso PAU',
    price: '49 €',
    priceStrike: '79 €',
    note: 'sep–jun · pago único',
    description: 'Acceso para todo el curso académico. La opción más completa y económica.',
    features: [
      { text: 'Correcciones ilimitadas con IA', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU completo sep–jun', included: true },
      { text: 'Simulacros ilimitados', included: true },
      { text: 'Chat con tutor IA 24/7', included: true },
      { text: 'Sin renovación mensual', included: true },
    ],
    cta: 'Reservar precio early bird',
    href: '/login',
    badge: 'Early bird hasta 30 sep',
    badgeAmber: true,
  },
  {
    name: 'Pack Intensivo',
    price: '19,99 €',
    note: 'mayo–julio · pago único · sin renovación',
    description: 'Para la recta final de la PAU. Tres meses de acceso completo.',
    features: [
      { text: 'Correcciones ilimitadas con IA', included: true },
      { text: 'Todos los exámenes oficiales', included: true },
      { text: 'Camino PAU mayo–julio', included: true },
      { text: 'Simulacros intensivos', included: true },
      { text: 'Chat con tutor IA 24/7', included: true },
      { text: 'Sin renovación', included: true },
    ],
    cta: 'Quiero el Pack Intensivo',
    href: '/login',
  },
]

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', color: C.ink }}>
      <style>{`
        @media (hover: hover) and (pointer: fine) {
          .pricing-action:hover {
            filter: brightness(1.04) saturate(1.05);
            transform: translateY(-1px);
          }
          .pricing-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 20px 52px rgba(37,99,235,0.12) !important;
          }
        }
        .pricing-action {
          transition: transform 160ms var(--ease-out), box-shadow 160ms var(--ease-out), filter 160ms var(--ease-out);
        }
        .pricing-action:active { transform: scale(0.97) !important; }
        .pricing-card {
          transition: transform 200ms var(--ease-out), box-shadow 200ms var(--ease-out);
        }
      `}</style>

      <header
        style={{
          height: '72px',
          padding: '0 clamp(20px, 5vw, 48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(219,231,251,0.95)',
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(22px)',
        }}
      >
        <Link href="/landing" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <PausiaBrand subtitle={null} size="md" />
        </Link>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link
            href="/landing"
            className="pricing-action"
            style={{
              border: `1px solid ${C.border}`,
              background: '#fff',
              color: C.muted,
              borderRadius: 999,
              padding: '10px 16px',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            Volver
          </Link>
          <Link
            href="/login"
            className="pricing-action"
            style={{
              background: C.grad,
              color: '#fff',
              borderRadius: 999,
              padding: '10px 18px',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 900,
              boxShadow: '0 14px 32px rgba(37,99,235,0.22)',
            }}
          >
            Entrar
          </Link>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(56px, 8vw, 94px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto 48px', textAlign: 'center' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999, marginBottom: 18,
            background: 'rgba(255,255,255,0.72)', border: `1px solid ${C.border}`,
            color: C.deep, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' as const,
          }}>
            <Sparkles size={11} /> Precios de lanzamiento
          </span>
          <h1
            style={{
              margin: '0 0 18px',
              color: C.ink,
              fontSize: 'clamp(2.1rem, 6vw, 3.5rem)',
              lineHeight: 1.08,
              fontWeight: 950,
              letterSpacing: '-0.025em',
            }}
          >
            Elige tu plan PAU
          </h1>
          <p style={{ margin: '0 auto', maxWidth: 580, color: C.muted, fontSize: 'clamp(1rem, 2.4vw, 1.1rem)', lineHeight: 1.75 }}>
            Empieza gratis. Actualiza cuando quieras. Sin permanencia en el plan mensual.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
            alignItems: 'stretch',
          }}
        >
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="pricing-card"
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                background: plan.recommended ? 'rgba(239,246,255,0.94)' : 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(16px) saturate(1.12)',
                WebkitBackdropFilter: 'blur(16px) saturate(1.12)',
                border: plan.recommended ? '1.5px solid rgba(96,165,250,0.4)' : `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 26,
                boxShadow: plan.recommended
                  ? '0 4px 12px rgba(37,99,235,0.10)'
                  : '0 2px 8px rgba(37,99,235,0.05)',
                minHeight: 500,
              }}
            >
              {/* Badges */}
              {plan.badge && (
                <span
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    borderRadius: 999,
                    background: plan.badgeAmber
                      ? 'linear-gradient(135deg, #d97706, #f59e0b)'
                      : C.grad,
                    color: '#fff',
                    padding: '5px 10px',
                    fontSize: 10,
                    fontWeight: 950,
                    boxShadow: plan.badgeAmber
                      ? '0 8px 20px rgba(217,119,6,0.30)'
                      : '0 8px 20px rgba(37,99,235,0.22)',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  {plan.badge}
                </span>
              )}

              {/* Name + description */}
              <div style={{ marginBottom: 16, paddingRight: plan.badge ? 110 : 0 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 950, color: C.ink }}>{plan.name}</h2>
                <p style={{ margin: 0, color: C.muted, fontSize: 13.5, lineHeight: 1.6 }}>{plan.description}</p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: plan.recommended ? C.blue : C.ink, fontSize: 38, lineHeight: 1, fontWeight: 950 }}>
                    {plan.price}
                  </strong>
                  {plan.priceStrike && (
                    <span style={{ fontSize: 20, color: C.soft, fontWeight: 700, textDecoration: 'line-through', lineHeight: 1.6 }}>
                      {plan.priceStrike}
                    </span>
                  )}
                </div>
                <p style={{ margin: '7px 0 0', color: plan.recommended ? C.blue : C.soft, fontSize: 13, fontWeight: 800 }}>
                  {plan.note}
                </p>
              </div>

              {/* Features */}
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'grid', gap: 11 }}>
                {plan.features.map((feature) => (
                  <li key={feature.text} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5, fontWeight: 650, lineHeight: 1.5 }}>
                    {feature.included
                      ? <CheckCircle2 size={16} style={{ color: plan.recommended ? C.blue : '#0f766e', flexShrink: 0, marginTop: 1 }} />
                      : <X size={16} style={{ color: '#d1d5db', flexShrink: 0, marginTop: 1 }} />
                    }
                    <span style={{ color: feature.included ? C.muted : '#cbd5e1' }}>{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ marginTop: 'auto' }}>
                <Link
                  href={plan.href}
                  className="pricing-action"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 9,
                    width: '100%',
                    minHeight: 48,
                    borderRadius: 999,
                    background: plan.recommended ? C.grad : plan.badgeAmber ? 'linear-gradient(135deg,#d97706,#f59e0b)' : '#fff',
                    color: (plan.recommended || plan.badgeAmber) ? '#fff' : C.blue,
                    border: (plan.recommended || plan.badgeAmber) ? 'none' : `1.5px solid ${C.border}`,
                    textDecoration: 'none',
                    fontSize: 14.5,
                    fontWeight: 850,
                    boxShadow: plan.recommended
                      ? '0 8px 20px rgba(37,99,235,0.22)'
                      : plan.badgeAmber
                      ? '0 8px 20px rgba(217,119,6,0.24)'
                      : 'none',
                  }}
                >
                  {plan.cta} <ArrowRight size={15} />
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 13, color: C.soft, fontWeight: 600 }}>
          Los precios incluyen IVA. El Pack Curso PAU early bird está disponible hasta el 30 de septiembre de 2026.
        </p>
      </section>

      <footer style={{ padding: '4px 24px 36px', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/legal/privacidad" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Privacidad</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
        <Link href="/legal/terminos" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Términos</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
        <Link href="/legal/reembolsos" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Reembolsos</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
        <Link href="/legal/ia" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Uso de IA</Link>
        <span style={{ fontSize: 12, color: '#d1d5db' }}>·</span>
        <Link href="/contacto" style={{ fontSize: 12, color: '#94a3b8', textDecoration: 'none' }}>Contacto</Link>
      </footer>
    </main>
  )
}
