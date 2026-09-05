'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { ChevronDown } from 'lucide-react'
import { useCookieConsent } from '@/app/lib/analytics/CookieConsentContext'
import { posthog } from '@/app/lib/analytics/posthog'
import type { PublicPlanView } from '@/app/lib/pricing'

// Esta pagina hablaba un idioma visual propio (degradado lavanda, tarjetas
// glass redondeadas, azules saturados) que no existia en ningun otro sitio
// del producto, y chocaba de frente con la landing que la enlaza. Aqui se
// reescribe SOLO la presentacion con el vocabulario de la landing: fondo
// #111, Bebas para titulares y precios, DM Mono en mayusculas para
// etiquetas, y el mismo tratamiento de columna que la seccion de precios de
// la propia landing (.v4c-p-col en app/landing/page.tsx), para que pasar de
// una a otra no parezca cambiar de producto.
//
// El contenido y la logica no se tocan: los planes siguen viniendo de
// getPublicPlanDefinitions() (app/lib/pricing.ts), y se conservan tal cual
// la analitica con consentimiento, los data-testid que usa e2e/pricing.spec.ts,
// la tabla comparativa, el bloque de condiciones y el modulo de pago familiar.

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const B = bebas.style.fontFamily
const M = dmMono.style.fontFamily

type Props = {
  plans: PublicPlanView[]
  children?: ReactNode
}

function capture(status: string, event: string, properties: Record<string, string | boolean | number>) {
  if (status === 'accepted') posthog.capture(event, properties)
}

const TRUST = ['IVA incluido', 'Sin cargos de prueba', 'Pago seguro con Stripe']

const CONDITIONS = [
  'Premium se renueva cada mes. Puedes cancelarlo desde tu portal de facturación y conservar el acceso hasta terminar el periodo pagado.',
  'Curso PAU es un pago único, no se renueva y da acceso hasta el 30 de junio.',
  'Las cuotas de correcciones, fotos y simulacros se reinician al comenzar cada mes natural.',
  'Los precios mostrados incluyen IVA. La política comercial de reembolso vigente está enlazada arriba.',
]

function PricingCta({ plan, consent }: { plan: PublicPlanView; consent: string }) {
  return (
    <Link
      href={plan.ctaHref}
      data-testid={`pricing-cta-${plan.id}`}
      onClick={() => capture(consent, 'plan_cta_click', {
        plan_id: plan.id,
        checkout_plan_id: plan.checkoutPlanId ?? 'free',
        surface: 'precios',
      })}
      className={`pr-cta${plan.highlighted ? ' pr-cta--primary' : ''}`}
    >
      {plan.ctaLabel}
    </Link>
  )
}

export default function PricingClient({ plans, children }: Props) {
  const { status } = useCookieConsent()
  const [comparisonOpen, setComparisonOpen] = useState(false)
  const trackedView = useRef(false)

  useEffect(() => {
    if (status !== 'accepted' || trackedView.current) return
    trackedView.current = true
    posthog.capture('pricing_view', { surface: 'precios', public_plan_count: plans.length })
  }, [plans.length, status])

  const rows: Array<{ label: string; value: (plan: PublicPlanView) => string | number }> = [
    { label: 'Correcciones al mes', value: (plan) => plan.limits.correctionsPerMonth },
    { label: 'Correcciones con foto al mes', value: (plan) => plan.limits.photosPerMonth },
    { label: 'Prácticas parciales al mes', value: (plan) => plan.limits.partialsPerMonth },
    { label: 'Simulacros completos al mes', value: (plan) => plan.limits.fullMocksPerMonth || '—' },
    { label: 'Camino PAU', value: (plan) => plan.caminoLabel },
    { label: 'Orientación', value: (plan) => plan.orientationLabel },
    { label: 'Ranking', value: (plan) => plan.rankingLabel },
    { label: 'Tarjetas por mazo', value: (plan) => plan.limits.maxFlashcardsPerDeck },
  ]

  return (
    <div className="pr-shell">
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .pr-shell {
          min-height: 100dvh;
          background: #111;
          color: #fff;
          font-family: var(--font-geist-sans, system-ui, sans-serif);
        }

        /* Nav: mismo patron que la landing (fija, translucida, logo blanco). */
        .pr-nav {
          position: sticky; top: 0; z-index: 100;
          display: flex; align-items: center; justify-content: space-between;
          height: 54px; padding: 0 40px;
          background: rgba(17,17,17,.82);
          border-bottom: 1px solid rgba(255,255,255,.07);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .pr-nav-link {
          font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
          color: rgba(255,255,255,.5); text-decoration: none; transition: color 140ms;
        }
        .pr-nav-link:hover { color: #fff; }
        .pr-nav-btn {
          padding: 7px 16px; border: 1px solid rgba(255,255,255,.3);
          font-size: 11px; color: #fff; text-decoration: none;
          letter-spacing: .06em; text-transform: uppercase;
          transition: background 140ms;
        }
        .pr-nav-btn:hover { background: rgba(255,255,255,.1); }

        .pr-wrap { max-width: 1040px; margin: 0 auto; }

        /* Hero */
        .pr-hero { padding: 96px 72px 56px; }
        .pr-kicker {
          display: block; margin-bottom: 14px;
          font-size: 10px; letter-spacing: .18em; text-transform: uppercase;
          color: rgba(147,197,253,.75);
        }
        .pr-title {
          margin: 0 0 16px; max-width: 16ch;
          font-size: clamp(48px, 8vw, 104px); line-height: .9; letter-spacing: .01em; color: #fff;
        }
        .pr-subtitle {
          max-width: 58ch; margin: 0;
          font-size: 15px; line-height: 1.7; color: rgba(255,255,255,.5);
        }
        /* Garantias como fila editorial con filetes, no como pastillas. */
        .pr-trust {
          display: flex; flex-wrap: wrap; gap: 0 28px;
          margin-top: 34px; padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,.08);
          list-style: none;
        }
        .pr-trust li {
          font-size: 9px; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.38); padding: 4px 0;
        }

        /* Planes: mismo tratamiento de columna que la landing. */
        .pr-plans { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; padding: 0 72px; }
        .pr-col {
          display: flex; flex-direction: column; min-width: 0; padding: 28px;
          border: 1px solid rgba(255,255,255,.12); border-radius: 26px;
          background: linear-gradient(145deg,rgba(255,255,255,.09),rgba(255,255,255,.035));
          box-shadow: 14px 18px 40px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.13);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .pr-col--featured {
          border-color: rgba(147,197,253,.55);
          background: linear-gradient(145deg,rgba(37,99,235,.94),rgba(47,124,246,.8));
          box-shadow: 0 24px 54px rgba(37,99,235,.26), inset 0 1px 0 rgba(255,255,255,.25), inset 0 -1px 0 rgba(0,0,0,.14);
        }
        .pr-badge {
          margin: 0 0 10px; font-size: 9px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase; color: rgba(255,255,255,.8);
        }
        .pr-name {
          display: block; margin-bottom: 14px; font-size: 10px;
          letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.3);
        }
        .pr-col--featured .pr-name { color: rgba(255,255,255,.6); }
        .pr-value { min-height: 66px; margin: 0 0 18px; font-size: 20px; line-height: 1.2; letter-spacing: -.02em; color: #fff; }
        .pr-price { margin: 0 0 2px; font-size: 52px; line-height: 1; letter-spacing: .01em; color: #fff; }
        .pr-period { display: block; margin-bottom: 20px; font-size: 9px; color: rgba(255,255,255,.48); }
        .pr-desc { margin: 0 0 20px; font-size: 12px; line-height: 1.6; color: rgba(255,255,255,.45); }
        .pr-col--featured .pr-desc { color: rgba(255,255,255,.7); }
        .pr-rule { height: 1px; background: rgba(255,255,255,.08); margin-bottom: 18px; }
        .pr-col--featured .pr-rule { background: rgba(255,255,255,.2); }
        .pr-features { list-style: none; display: flex; flex-direction: column; gap: 8px; margin: 0 0 24px; padding: 0; flex: 1; }
        .pr-features li { position: relative; padding-left: 14px; font-size: 12px; line-height: 1.45; color: rgba(255,255,255,.55); }
        .pr-features li::before { content: '—'; position: absolute; left: 0; font-size: 10px; color: rgba(255,255,255,.18); }
        .pr-col--featured .pr-features li { color: rgba(255,255,255,.88); }
        .pr-col--featured .pr-features li::before { color: rgba(255,255,255,.45); }
        .pr-cta {
          margin-top: auto; align-self: flex-start;
          font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
          color: #fff; text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.3); padding-bottom: 1px;
          transition: border-color 140ms;
        }
        .pr-cta:hover { border-bottom-color: #fff; }
        .pr-cta--primary { border-bottom-color: rgba(255,255,255,.75); }

        /* Comparativa */
        .pr-compare { padding: 56px 72px 0; }
        .pr-compare-inner { border-top: 1px solid rgba(255,255,255,.09); }
        .pr-compare-btn {
          width: 100%; min-height: 68px; padding: 0; border: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          background: transparent; color: #fff; font: inherit;
          font-size: 13px; letter-spacing: .08em; text-transform: uppercase; text-align: left;
        }
        .pr-compare-btn svg { transition: transform 200ms; color: rgba(255,255,255,.4); }
        .pr-compare-btn[aria-expanded="true"] svg { transform: rotate(180deg); }
        .pr-table-wrap { overflow-x: auto; border-top: 1px solid rgba(255,255,255,.09); padding-bottom: 8px; }
        .pr-table { width: 100%; min-width: 720px; border-collapse: collapse; }
        .pr-table caption { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .pr-table th, .pr-table td {
          padding: 14px 16px; text-align: left; vertical-align: top;
          border-bottom: 1px solid rgba(255,255,255,.07);
          font-size: 12px; line-height: 1.45;
        }
        .pr-table thead th {
          font-size: 9px; letter-spacing: .16em; text-transform: uppercase;
          color: rgba(255,255,255,.4); padding-top: 20px;
        }
        .pr-table tbody th { width: 30%; font-weight: 400; color: rgba(255,255,255,.45); }
        .pr-table td { color: rgba(255,255,255,.75); }
        .pr-table td[data-featured="true"] { color: #fff; background: rgba(37,99,235,.12); }

        /* Condiciones */
        .pr-conditions { display: grid; grid-template-columns: .8fr 1.2fr; gap: 32px; padding: 64px 72px 72px; }
        .pr-conditions h2 { margin: 0 0 16px; font-size: clamp(28px,3.5vw,40px); line-height: .95; letter-spacing: .01em; color: #fff; }
        .pr-legal { display: flex; flex-wrap: wrap; gap: 14px; }
        .pr-legal a {
          font-size: 9px; letter-spacing: .14em; text-transform: uppercase;
          color: rgba(255,255,255,.45); text-decoration: none;
          border-bottom: 1px solid rgba(255,255,255,.18); padding-bottom: 1px; transition: color 140ms;
        }
        .pr-legal a:hover { color: #fff; }
        .pr-conditions ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .pr-conditions li {
          padding: 14px 0; font-size: 13px; line-height: 1.7; color: rgba(255,255,255,.5);
          border-bottom: 1px solid rgba(255,255,255,.07);
        }
        .pr-conditions li:first-child { padding-top: 0; }
        .pr-conditions li:last-child { border-bottom: none; }

        .pr-footer {
          padding: 28px 72px 40px; border-top: 1px solid rgba(255,255,255,.07);
          font-size: 9px; letter-spacing: .14em; text-transform: uppercase; color: rgba(255,255,255,.25);
        }

        .pr-cta:focus-visible, .pr-compare-btn:focus-visible,
        .pr-nav-link:focus-visible, .pr-nav-btn:focus-visible, .pr-legal a:focus-visible {
          outline: 2px solid #93c5fd; outline-offset: 3px;
        }

        @media (max-width: 860px) {
          .pr-nav { padding: 0 20px; }
          .pr-hero { padding: 64px 24px 40px; }
          .pr-plans { grid-template-columns: 1fr; padding: 0 24px; }
          .pr-col { padding: 26px; }
          .pr-col--featured { order: -1; }
          .pr-value { min-height: 0; }
          .pr-compare { padding: 48px 24px 0; }
          .pr-conditions { grid-template-columns: 1fr; padding: 48px 24px 56px; gap: 24px; }
          .pr-footer { padding: 24px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .pr-cta, .pr-nav-link, .pr-nav-btn, .pr-compare-btn svg, .pr-legal a { transition: none; }
        }
      `}</style>

      <nav className="pr-nav" aria-label="Navegación de precios">
        <Link href="/" aria-label="Volver al inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kairo-logo-white.png" alt="Kairo" loading="eager" style={{ height: 28, width: 'auto', display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link className="pr-nav-link" href="/">Cómo funciona</Link>
          <Link className="pr-nav-btn" href="/login">Entrar →</Link>
        </div>
      </nav>

      <main>
        <header className="pr-hero pr-wrap">
          <span className="pr-kicker" style={{ fontFamily: M }}>Planes claros, sin letra pequeña escondida</span>
          <h1 className="pr-title" style={{ fontFamily: B }}>Elige cuánto acompañamiento necesitas.</h1>
          <p className="pr-subtitle">Empieza gratis, prepara todo el curso con Premium o haz un único pago hasta junio. Los límites que ves aquí son los mismos que aplica Kairo.</p>
          <ul className="pr-trust" style={{ fontFamily: M }} aria-label="Ventajas de contratación">
            {TRUST.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </header>

        <section className="pr-plans pr-wrap" aria-label="Planes disponibles">
          {plans.map((plan) => (
            <article
              key={plan.id}
              data-testid={`pricing-card-${plan.id}`}
              className={`pr-col${plan.highlighted ? ' pr-col--featured' : ''}`}
            >
              {plan.highlighted
                ? <p className="pr-badge" style={{ fontFamily: M }}>● Recomendado</p>
                : <p className="pr-badge" style={{ fontFamily: M, visibility: 'hidden' }} aria-hidden="true">●</p>}
              <span className="pr-name" style={{ fontFamily: M }}>{plan.name}</span>
              <h2 className="pr-value">{plan.valueProposition}</h2>
              <p className="pr-price" style={{ fontFamily: B }}>{plan.priceDisplay}</p>
              <span className="pr-period" style={{ fontFamily: M }}>{plan.periodDisplay}</span>
              <p className="pr-desc">{plan.description}</p>
              <div className="pr-rule" />
              <ul className="pr-features">
                {plan.highlights.map((feature) => <li key={feature}>{feature}</li>)}
              </ul>
              <PricingCta plan={plan} consent={status} />
            </article>
          ))}
        </section>

        <section className="pr-compare pr-wrap" aria-labelledby="compare-title">
          <div className="pr-compare-inner">
            <button
              type="button"
              className="pr-compare-btn"
              style={{ fontFamily: M }}
              aria-expanded={comparisonOpen}
              aria-controls="pricing-comparison"
              onClick={() => {
                const next = !comparisonOpen
                setComparisonOpen(next)
                if (next) capture(status, 'plan_compare', { surface: 'precios', action: 'open' })
              }}
            >
              <span id="compare-title">Comparar límites y funciones</span>
              <ChevronDown aria-hidden="true" size={20} />
            </button>
            {comparisonOpen && (
              <div id="pricing-comparison" className="pr-table-wrap">
                <table className="pr-table">
                  <caption>Comparación detallada de los planes públicos de Kairo</caption>
                  <thead>
                    <tr>
                      <th scope="col" style={{ fontFamily: M }}>Incluye</th>
                      {plans.map((plan) => <th key={plan.id} scope="col" style={{ fontFamily: M }}>{plan.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {plans.map((plan) => (
                          <td key={plan.id} data-featured={plan.highlighted}>{row.value(plan)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="pr-conditions pr-wrap" aria-labelledby="conditions-title">
          <div>
            <h2 id="conditions-title" style={{ fontFamily: B }}>Condiciones fáciles de entender</h2>
            <div className="pr-legal" style={{ fontFamily: M }}>
              <Link href="/legal/terminos">Términos</Link>
              <Link href="/legal/reembolsos">Reembolsos</Link>
              <Link href="/legal/privacidad">Privacidad</Link>
            </div>
          </div>
          <ul>
            {CONDITIONS.map((item) => <li key={item}>{item}</li>)}
          </ul>
        </section>
      </main>

      {children}
      <footer className="pr-footer" style={{ fontFamily: M }}>Kairo · Preparación PAU para Madrid y Cataluña</footer>
    </div>
  )
}
