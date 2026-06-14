'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CheckCircle2, GraduationCap, Sparkles, TimerReset } from 'lucide-react'

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

const plans = [
  {
    name: 'Free beta',
    price: '0 €',
    note: 'Durante la beta',
    description: 'Para empezar a practicar con Pausia mientras seguimos validando el producto.',
    features: [
      'Acceso a ejercicios oficiales disponibles',
      'Correcciones limitadas',
      'Simulacros limitados',
      'Historial básico',
      'Mi Plan semanal',
    ],
    cta: 'Empezar gratis',
    href: '/login',
  },
  {
    name: 'Premium previsto',
    price: '7,99 €/mes',
    note: 'Próximamente',
    description: 'Para estudiantes que quieren practicar más y tener un seguimiento más completo.',
    features: [
      'Más correcciones diarias',
      'Más simulacros semanales',
      'Chat tutor ampliado',
      'Plan de mejora más completo',
      'Predicción de nota y seguimiento avanzado',
    ],
    cta: 'Quiero acceso premium',
    recommended: true,
  },
  {
    name: 'Pack PAU',
    price: '19,99 €',
    note: 'Pago único · 3 meses · Mayo-Julio',
    description: 'Pensado para la recta final de la PAU y la preparación intensiva.',
    features: [
      'Acceso Premium durante la preparación intensiva',
      'Simulacros y correcciones ampliadas',
      'Seguimiento de progreso',
      'Enfoque en la recta final de la PAU',
      'Sin suscripción mensual durante el pack',
    ],
    cta: 'Me interesa el Pack PAU',
  },
]

export default function PricingPage() {
  const [interest, setInterest] = useState('')

  function registerInterest(planName: string) {
    setInterest(`Gracias. Te avisaremos cuando ${planName} esté disponible.`)
  }

  return (
    <main
      className="pau-bg-atmosphere"
      style={{
        minHeight: '100vh',
        color: C.ink,
      }}
    >
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
          <span
            style={{
              width: 42,
              height: 42,
              borderRadius: 15,
              background: C.grad,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(37,99,235,0.22)',
            }}
          >
            <GraduationCap size={21} />
          </span>
          <span>
            <strong style={{ display: 'block', color: C.ink, fontSize: 18, lineHeight: 1 }}>Pausia</strong>
            <small style={{ display: 'block', color: C.soft, marginTop: 2 }}>Planes en beta</small>
          </span>
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

      <section style={{ maxWidth: 1120, margin: '0 auto', padding: 'clamp(56px, 8vw, 94px) clamp(20px, 5vw, 32px)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto 42px', textAlign: 'center' }}>
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
            Planes para preparar la PAU con Pausia
          </h1>
          <p style={{ margin: '0 auto', maxWidth: 620, color: C.muted, fontSize: 'clamp(1rem, 2.4vw, 1.16rem)', lineHeight: 1.75 }}>
            Durante la beta estamos validando el uso real antes de activar pagos. Puedes apuntarte al acceso Premium cuando esté disponible.
          </p>
        </div>

        {interest && (
          <div
            role="status"
            style={{
              maxWidth: 700,
              margin: '0 auto 22px',
              border: '1px solid #bfdbfe',
              background: 'rgba(239,246,255,0.96)',
              color: '#1e3a8a',
              borderRadius: 22,
              padding: '14px 18px',
              fontWeight: 850,
              textAlign: 'center',
              boxShadow: '0 14px 34px rgba(37,99,235,0.08)',
            }}
          >
            {interest}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 18,
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
                background: plan.recommended ? 'rgba(239,246,255,0.96)' : '#fff',
                border: plan.recommended ? '1.5px solid rgba(96,165,250,0.35)' : 'none',
                borderRadius: 14,
                padding: 26,
                boxShadow: plan.recommended
                  ? '0 4px 12px rgba(37,99,235,0.10)'
                  : '0 2px 8px rgba(37,99,235,0.06), 0 8px 24px rgba(37,99,235,0.05)',
                minHeight: 480,
              }}
            >
              {plan.recommended && (
                <span
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    borderRadius: 999,
                    background: C.grad,
                    color: '#fff',
                    padding: '6px 11px',
                    fontSize: 11,
                    fontWeight: 950,
                    boxShadow: '0 12px 26px rgba(37,99,235,0.2)',
                  }}
                >
                  Recomendado
                </span>
              )}

              <div style={{ marginBottom: 18, paddingRight: plan.recommended ? 110 : 0 }}>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 950, color: C.ink }}>{plan.name}</h2>
                <p style={{ margin: '8px 0 0', color: C.muted, fontSize: 14, lineHeight: 1.6 }}>{plan.description}</p>
              </div>

              <div style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ color: plan.recommended ? C.blue : C.ink, fontSize: 38, lineHeight: 1, fontWeight: 950 }}>{plan.price}</strong>
                </div>
                <p style={{ margin: '8px 0 0', color: plan.recommended ? C.blue : C.soft, fontSize: 13, fontWeight: 850 }}>{plan.note}</p>
              </div>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 26px', display: 'grid', gap: 13 }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: C.muted, fontSize: 14, fontWeight: 700, lineHeight: 1.55 }}>
                    <CheckCircle2 size={17} style={{ color: plan.recommended ? C.blue : '#0f766e', flexShrink: 0, marginTop: 1 }} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'auto' }}>
                {plan.href ? (
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
                      background: C.grad,
                      color: '#fff',
                      textDecoration: 'none',
                      fontSize: 15,
                      fontWeight: 800,
                      boxShadow: '0 8px 20px rgba(37,99,235,0.20)',
                    }}
                  >
                    {plan.cta} <ArrowRight size={16} />
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => registerInterest(plan.name)}
                    className="pricing-action"
                    style={{
                      width: '100%',
                      minHeight: 48,
                      borderRadius: 999,
                      border: plan.recommended ? 'none' : `1.5px solid ${C.border}`,
                      background: plan.recommended ? C.grad : '#fff',
                      color: plan.recommended ? '#fff' : C.blue,
                      fontSize: 15,
                      fontWeight: 950,
                      boxShadow: plan.recommended ? '0 8px 20px rgba(37,99,235,0.20)' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: 24,
            border: `1px solid ${C.border}`,
            background: 'rgba(255,255,255,0.86)',
            borderRadius: 12,
            padding: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            color: C.muted,
            fontWeight: 750,
            lineHeight: 1.65,
          }}
        >
          <TimerReset size={22} style={{ color: C.blue, flexShrink: 0 }} />
          <span>Los pagos todavía no están activos. Estos planes forman parte de la validación de beta.</span>
        </div>
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
