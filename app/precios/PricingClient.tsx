'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, ChevronDown, ShieldCheck, Sparkles } from 'lucide-react'
import { useCookieConsent } from '@/app/lib/analytics/CookieConsentContext'
import { posthog } from '@/app/lib/analytics/posthog'
import type { PublicPlanView } from '@/app/lib/pricing'

type Props = {
  plans: PublicPlanView[]
  children?: ReactNode
}

function capture(status: string, event: string, properties: Record<string, string | boolean>) {
  if (status === 'accepted') posthog.capture(event, properties)
}

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
      className={`pricing-cta${plan.highlighted ? ' pricing-cta--primary' : ''}`}
    >
      <span>{plan.ctaLabel}</span>
      <ArrowRight aria-hidden="true" size={17} />
    </Link>
  )
}

function ComparisonValue({ value }: { value: string | number }) {
  return <span>{value}</span>
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
    <div className="pricing-shell">
      <style>{`
        .pricing-shell {
          min-height: 100dvh;
          color: #13213a;
          background:
            radial-gradient(circle at 9% 8%, rgba(96,165,250,.26), transparent 30rem),
            radial-gradient(circle at 92% 22%, rgba(167,139,250,.2), transparent 28rem),
            linear-gradient(180deg, #eff6ff 0%, #f8fbff 44%, #eef4ff 100%);
        }
        .pricing-nav {
          position: sticky; top: 0; z-index: 30; height: 66px;
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 clamp(20px,5vw,64px);
          background: rgba(247,250,255,.72);
          border-bottom: 1px solid rgba(148,163,184,.2);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
        }
        .pricing-nav__links { display: flex; align-items: center; gap: 8px; }
        .pricing-nav__link {
          border-radius: 999px; padding: 9px 14px; color: #53647d;
          font-size: 13px; font-weight: 750; text-decoration: none;
        }
        .pricing-nav__link:hover { color: #173c76; background: rgba(255,255,255,.7); }
        .pricing-hero { max-width: 1120px; margin: 0 auto; padding: clamp(70px,10vw,116px) 24px 48px; text-align: center; }
        .pricing-kicker {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 22px;
          padding: 8px 13px; border: 1px solid rgba(96,165,250,.3); border-radius: 999px;
          background: rgba(255,255,255,.58); box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 10px 30px rgba(37,99,235,.08);
          color: #2555a5; font-size: 12px; font-weight: 850; letter-spacing: .04em;
        }
        .pricing-title { margin: 0 auto; max-width: 900px; font-size: clamp(44px,7vw,78px); line-height: .98; letter-spacing: -.055em; color: #132e56; }
        .pricing-subtitle { max-width: 690px; margin: 22px auto 0; color: #5d6f89; font-size: clamp(16px,2vw,20px); line-height: 1.65; }
        .pricing-trust { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 28px; }
        .pricing-trust span {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 12px; border-radius: 14px;
          background: rgba(255,255,255,.58); border: 1px solid rgba(255,255,255,.9);
          box-shadow: 7px 7px 18px rgba(80,110,160,.1), -7px -7px 18px rgba(255,255,255,.8);
          color: #526681; font-size: 12px; font-weight: 750;
        }
        .pricing-plans { max-width: 1120px; margin: 0 auto; padding: 20px 24px 52px; display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; align-items: stretch; }
        .pricing-card {
          position: relative; display: flex; flex-direction: column; min-width: 0; padding: 28px;
          border-radius: 30px; border: 1px solid rgba(255,255,255,.88);
          background: linear-gradient(145deg,rgba(255,255,255,.83),rgba(240,247,255,.62));
          box-shadow: 18px 18px 44px rgba(71,101,149,.14), -14px -14px 36px rgba(255,255,255,.92), inset 0 1px 0 rgba(255,255,255,.98);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
        }
        .pricing-card--featured {
          transform: translateY(-12px); color: white; border-color: rgba(255,255,255,.3);
          background: linear-gradient(145deg,#1749c6 0%,#2d73ed 56%,#4aa9ef 100%);
          box-shadow: 0 26px 60px rgba(37,99,235,.3), inset 0 1px 0 rgba(255,255,255,.28), inset 0 -2px 0 rgba(17,45,120,.2);
        }
        .pricing-badge {
          position: absolute; top: 18px; right: 18px; display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 10px; border-radius: 999px; background: rgba(255,255,255,.18); border: 1px solid rgba(255,255,255,.28);
          font-size: 10px; font-weight: 900; letter-spacing: .09em; text-transform: uppercase;
        }
        .pricing-plan-name { margin: 0 0 12px; color: #5d7191; font-size: 12px; font-weight: 900; letter-spacing: .13em; text-transform: uppercase; }
        .pricing-card--featured .pricing-plan-name { color: rgba(255,255,255,.72); }
        .pricing-value { min-height: 58px; margin: 0 0 10px; font-size: 24px; line-height: 1.18; letter-spacing: -.025em; color: #18345d; }
        .pricing-card--featured .pricing-value { color: white; }
        .pricing-price { display: flex; align-items: baseline; gap: 8px; margin: 12px 0 4px; }
        .pricing-price strong { font-size: clamp(42px,5vw,60px); line-height: 1; letter-spacing: -.055em; color: #173b76; }
        .pricing-card--featured .pricing-price strong { color: white; }
        .pricing-period { min-height: 34px; color: #71839c; font-size: 12px; line-height: 1.45; font-weight: 700; }
        .pricing-card--featured .pricing-period { color: rgba(255,255,255,.68); }
        .pricing-description { margin: 18px 0 22px; min-height: 72px; color: #60728b; font-size: 14px; line-height: 1.65; }
        .pricing-card--featured .pricing-description { color: rgba(255,255,255,.78); }
        .pricing-features { display: grid; gap: 11px; padding: 0; margin: 0 0 26px; list-style: none; }
        .pricing-feature { display: flex; align-items: flex-start; gap: 9px; color: #405571; font-size: 13px; line-height: 1.42; }
        .pricing-feature svg { flex: 0 0 auto; margin-top: 1px; color: #2d6cdf; }
        .pricing-card--featured .pricing-feature { color: rgba(255,255,255,.9); }
        .pricing-card--featured .pricing-feature svg { color: #d9efff; }
        .pricing-cta {
          margin-top: auto; display: flex; align-items: center; justify-content: space-between; gap: 10px;
          min-height: 52px; padding: 0 18px; border-radius: 17px; text-decoration: none;
          color: #1b4b95; background: #edf4ff; border: 1px solid rgba(96,165,250,.25);
          box-shadow: 7px 7px 16px rgba(75,100,140,.14), -7px -7px 16px rgba(255,255,255,.95), inset 0 1px 0 white;
          font-size: 14px; font-weight: 900; transition: transform .18s ease, box-shadow .18s ease;
        }
        .pricing-cta:hover { transform: translateY(-2px); box-shadow: 9px 12px 22px rgba(75,100,140,.18), -7px -7px 16px white; }
        .pricing-cta--primary { color: #18438a; background: white; border-color: rgba(255,255,255,.65); box-shadow: 0 14px 30px rgba(10,45,120,.24), inset 0 1px 0 white; }
        .pricing-cta:focus-visible, .pricing-compare-button:focus-visible, .pricing-nav__link:focus-visible { outline: 3px solid #f5b942; outline-offset: 3px; }
        .pricing-compare { max-width: 1120px; margin: 0 auto; padding: 16px 24px 70px; }
        .pricing-compare-card { border-radius: 30px; border: 1px solid rgba(255,255,255,.9); background: rgba(255,255,255,.7); box-shadow: 14px 18px 44px rgba(72,99,145,.13), inset 0 1px 0 white; overflow: hidden; backdrop-filter: blur(18px); }
        .pricing-compare-button {
          width: 100%; min-height: 74px; padding: 0 24px; border: 0; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          color: #18345d; background: transparent; font: inherit; font-size: 17px; font-weight: 900; text-align: left;
        }
        .pricing-compare-button svg { transition: transform .2s ease; }
        .pricing-compare-button[aria-expanded="true"] svg { transform: rotate(180deg); }
        .pricing-table-wrap { overflow-x: auto; border-top: 1px solid rgba(148,163,184,.22); }
        .pricing-table { width: 100%; min-width: 760px; border-collapse: collapse; }
        .pricing-table caption { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        .pricing-table th, .pricing-table td { padding: 15px 18px; border-bottom: 1px solid rgba(148,163,184,.18); text-align: left; vertical-align: top; font-size: 13px; line-height: 1.45; }
        .pricing-table thead th { color: #214875; background: rgba(226,238,255,.7); font-size: 12px; }
        .pricing-table tbody th { width: 27%; color: #576a83; font-weight: 800; }
        .pricing-table td { color: #263c5d; }
        .pricing-table td[data-featured="true"] { background: rgba(37,99,235,.055); color: #164b9b; font-weight: 800; }
        .pricing-conditions { max-width: 1120px; margin: 0 auto; padding: 0 24px 84px; }
        .pricing-conditions__inner { display: grid; grid-template-columns: .8fr 1.2fr; gap: 28px; padding: 28px; border-radius: 26px; background: rgba(225,235,249,.72); border: 1px solid rgba(255,255,255,.9); box-shadow: inset 6px 6px 14px rgba(94,119,158,.08), inset -6px -6px 14px rgba(255,255,255,.8); }
        .pricing-conditions h2 { margin: 0; color: #18345d; font-size: 22px; }
        .pricing-conditions ul { margin: 0; padding-left: 18px; color: #566a84; font-size: 13px; line-height: 1.65; }
        .pricing-legal-links { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 14px; }
        .pricing-legal-links a { color: #2458a5; font-size: 12px; font-weight: 850; text-underline-offset: 3px; }
        .pricing-footer { padding: 30px 24px 38px; text-align: center; color: #71839c; font-size: 12px; }
        .pricing-parent section { background: rgba(255,255,255,.42) !important; border-color: rgba(148,163,184,.2) !important; }
        .pricing-parent section > div { max-width: 1120px !important; }
        @media (max-width: 900px) {
          .pricing-plans { grid-template-columns: 1fr; max-width: 620px; }
          .pricing-card--featured { transform: none; order: -1; }
          .pricing-description, .pricing-value { min-height: 0; }
          .pricing-conditions__inner { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .pricing-nav { height: 60px; padding: 0 16px; }
          .pricing-nav__link:first-child { display: none; }
          .pricing-hero { padding: 62px 18px 34px; text-align: left; }
          .pricing-kicker { margin-bottom: 18px; }
          .pricing-title { font-size: 44px; }
          .pricing-subtitle { font-size: 16px; }
          .pricing-trust { justify-content: flex-start; }
          .pricing-plans, .pricing-compare, .pricing-conditions { padding-left: 14px; padding-right: 14px; }
          .pricing-card { padding: 23px; border-radius: 25px; }
          .pricing-price strong { font-size: 50px; }
          .pricing-compare-button { padding: 0 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .pricing-cta, .pricing-compare-button svg { transition: none; }
        }
      `}</style>

      <nav className="pricing-nav" aria-label="Navegación de precios">
        <Link href="/" aria-label="Volver al inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kairo-logo.png" alt="Kairo" width={104} height={32} style={{ width: 104, height: 'auto', display: 'block' }} />
        </Link>
        <div className="pricing-nav__links">
          <Link className="pricing-nav__link" href="/">Cómo funciona</Link>
          <Link className="pricing-nav__link" href="/login">Entrar</Link>
        </div>
      </nav>

      <main>
        <header className="pricing-hero">
          <span className="pricing-kicker"><Sparkles aria-hidden="true" size={15} /> Planes claros, sin letra pequeña escondida</span>
          <h1 className="pricing-title">Elige cuánto acompañamiento necesitas.</h1>
          <p className="pricing-subtitle">Empieza gratis, prepara todo el curso con Premium o haz un único pago hasta junio. Los límites que ves aquí son los mismos que aplica Kairo.</p>
          <div className="pricing-trust" aria-label="Ventajas de contratación">
            <span><ShieldCheck aria-hidden="true" size={15} /> IVA incluido</span>
            <span><Check aria-hidden="true" size={15} /> Sin cargos de prueba</span>
            <span><Check aria-hidden="true" size={15} /> Pago seguro con Stripe</span>
          </div>
        </header>

        <section className="pricing-plans" aria-label="Planes disponibles">
          {plans.map((plan) => (
            <article
              key={plan.id}
              data-testid={`pricing-card-${plan.id}`}
              className={`pricing-card${plan.highlighted ? ' pricing-card--featured' : ''}`}
            >
              {plan.highlighted && <span className="pricing-badge"><Sparkles aria-hidden="true" size={12} /> Recomendado</span>}
              <p className="pricing-plan-name">{plan.name}</p>
              <h2 className="pricing-value">{plan.valueProposition}</h2>
              <div className="pricing-price"><strong>{plan.priceDisplay}</strong></div>
              <p className="pricing-period">{plan.periodDisplay}</p>
              <p className="pricing-description">{plan.description}</p>
              <ul className="pricing-features">
                {plan.highlights.map((feature) => (
                  <li className="pricing-feature" key={feature}><Check aria-hidden="true" size={16} /> <span>{feature}</span></li>
                ))}
              </ul>
              <PricingCta plan={plan} consent={status} />
            </article>
          ))}
        </section>

        <section className="pricing-compare" aria-labelledby="compare-title">
          <div className="pricing-compare-card">
            <button
              type="button"
              className="pricing-compare-button"
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
              <div id="pricing-comparison" className="pricing-table-wrap">
                <table className="pricing-table">
                  <caption>Comparación detallada de los planes públicos de Kairo</caption>
                  <thead>
                    <tr>
                      <th scope="col">Incluye</th>
                      {plans.map((plan) => <th key={plan.id} scope="col">{plan.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.label}>
                        <th scope="row">{row.label}</th>
                        {plans.map((plan) => (
                          <td key={plan.id} data-featured={plan.highlighted}><ComparisonValue value={row.value(plan)} /></td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="pricing-conditions" aria-labelledby="conditions-title">
          <div className="pricing-conditions__inner">
            <div>
              <h2 id="conditions-title">Condiciones fáciles de entender</h2>
              <div className="pricing-legal-links">
                <Link href="/legal/terminos">Términos</Link>
                <Link href="/legal/reembolsos">Reembolsos</Link>
                <Link href="/legal/privacidad">Privacidad</Link>
              </div>
            </div>
            <ul>
              <li>Premium se renueva cada mes. Puedes cancelarlo desde tu portal de facturación y conservar el acceso hasta terminar el periodo pagado.</li>
              <li>Curso PAU es un pago único, no se renueva y da acceso hasta el 30 de junio.</li>
              <li>Las cuotas de correcciones, fotos y simulacros se reinician al comenzar cada mes natural.</li>
              <li>Los precios mostrados incluyen IVA. La política comercial de reembolso vigente está enlazada arriba.</li>
            </ul>
          </div>
        </section>
      </main>

      {children && <div className="pricing-parent">{children}</div>}
      <footer className="pricing-footer">Kairo · Preparación PAU para Madrid y Cataluña</footer>
    </div>
  )
}
