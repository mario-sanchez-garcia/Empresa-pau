import Link from 'next/link'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { Check, X } from 'lucide-react'
import { PLAN_COPY, getPlanPriceDisplay, CURSO_PAU_STANDARD_PRICE_CENTS, CURSO_PAU_FOMO_REFERENCE_PRICE_CENTS, formatEur } from '@/app/lib/pricing'
import ParentLinkSection from '@/app/pricing/ParentLinkSection'

const bebas  = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

const PLANS = [
  {
    name: PLAN_COPY.free.label,
    price: getPlanPriceDisplay('free'),
    previousPrice: null,
    period: PLAN_COPY.free.periodDisplay,
    description: PLAN_COPY.free.description,
    features: PLAN_COPY.free.features.map((text) => ({ text, included: true })),
    cta: 'Empezar gratis →',
    href: '/onboarding',
    dark: false,
    badge: null,
  },
  {
    name: PLAN_COPY.premium.label,
    price: getPlanPriceDisplay('premium'),
    previousPrice: null,
    period: PLAN_COPY.premium.periodDisplay,
    description: PLAN_COPY.premium.description,
    features: PLAN_COPY.premium.features.map((text) => ({ text, included: true })),
    cta: 'Probar Premium →',
    href: '/checkout?plan=premium',
    dark: true,
    badge: 'Recomendado',
  },
  {
    name: PLAN_COPY.curso_pau.label,
    price: getPlanPriceDisplay('curso_pau'),
    previousPrice: formatEur(CURSO_PAU_FOMO_REFERENCE_PRICE_CENTS),
    period: PLAN_COPY.curso_pau.periodDisplay,
    description: PLAN_COPY.curso_pau.description,
    features: PLAN_COPY.curso_pau.features.map((text) => ({ text, included: true })),
    cta: 'Reservar →',
    href: '/checkout?plan=pack_curso_pau',
    dark: false,
    badge: 'Plazas limitadas',
  },
]

export default function PricingPage() {
  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  return (
    <div style={{ fontFamily: 'var(--font-geist-sans, system-ui, sans-serif)', background: '#111', color: '#fff', minHeight: '100dvh' }}>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        /* ── Nav scroll-aware ── */
        #pr-nav {
          transition: background 300ms cubic-bezier(0.23,1,0.32,1),
                      border-bottom-color 300ms cubic-bezier(0.23,1,0.32,1);
          border-bottom: 1px solid transparent;
        }
        #pr-nav.v4c-on-light {
          background: rgba(249,249,249,0.88) !important;
          border-bottom-color: #e8e8e8;
        }
        #pr-nav-logo {
          transition: filter 300ms cubic-bezier(0.23,1,0.32,1);
        }
        #pr-nav.v4c-on-light #pr-nav-logo { filter: invert(1); }
        #pr-nav.v4c-on-light .pr-nav-link { color: rgba(28,28,28,.5) !important; }
        #pr-nav.v4c-on-light .pr-nav-link:hover { color: #1c1c1c !important; }
        #pr-nav.v4c-on-light .pr-nav-btn {
          border-color: rgba(28,28,28,.3) !important;
          color: #1c1c1c !important;
        }
        #pr-nav.v4c-on-light .pr-nav-btn:hover { background: rgba(0,0,0,.06) !important; }

        .pr-nav-link { transition: color 140ms; }
        .pr-nav-btn  { transition: background 140ms, border-color 140ms, color 140ms; }
        .pr-nav-btn:hover { background: rgba(255,255,255,.1) !important; }

        /* ── Plan columns ── */
        .pr-plans {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          border-top: 1px solid #e0e0e0;
        }
        .pr-col {
          padding: 48px 40px 56px;
          display: flex;
          flex-direction: column;
          border-right: 1px solid #e0e0e0;
        }
        .pr-col:last-child { border-right: none; }
        .pr-col-dark { background: #111; border-color: rgba(255,255,255,.08); }
        .pr-col-dark + .pr-col { border-left: none; }

        .pr-btn-light {
          display: block; width: 100%; padding: 14px 0; text-align: center;
          border: 1px solid #1c1c1c; color: #1c1c1c; text-decoration: none;
          font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          transition: background 140ms, color 140ms;
        }
        .pr-btn-light:hover { background: #1c1c1c; color: #f9f9f9; }

        .pr-btn-dark {
          display: block; width: 100%; padding: 14px 0; text-align: center;
          background: #fff; color: #111; text-decoration: none;
          font-size: 12px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase;
          transition: opacity 140ms, transform 140ms cubic-bezier(0.23,1,0.32,1);
        }
        .pr-btn-dark:hover { opacity: .88; transform: translateY(-1px); }

        /* ── Features list ── */
        .pr-feature { display: flex; align-items: center; gap: 10px; padding: 9px 0; }
        .pr-feature + .pr-feature { border-top: 1px solid #e0e0e0; }
        .pr-col-dark .pr-feature + .pr-feature { border-top-color: rgba(255,255,255,.07); }

        /* ── Responsive ── */
        @media (max-width: 860px) {
          .pr-plans { grid-template-columns: 1fr; }
          .pr-col { border-right: none; border-bottom: 1px solid #e0e0e0; padding: 40px 28px 48px; }
          .pr-col:last-child { border-bottom: none; }
          .pr-col-dark + .pr-col { border-left: none; }
          #pr-nav { padding: 0 20px !important; }
          .pr-hero { padding: 108px 28px 64px !important; }
          .pr-plans-wrap { padding: 0 !important; }
          .pr-note { padding: 40px 28px !important; }
          footer { padding: 28px 24px !important; flex-direction: column !important; align-items: flex-start !important; gap: 16px !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          #pr-nav, #pr-nav-logo { transition: none !important; }
          .pr-btn-dark, .pr-btn-light { transition: none !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────────── */}
      <nav id="pr-nav" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 54,
        background: 'rgba(17,17,17,0.82)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <Link href="/" aria-label="Inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img id="pr-nav-logo" src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 32, width: 'auto', display: 'block' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" className="pr-nav-link" style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,.5)', textDecoration: 'none', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            Inicio
          </Link>
          <Link href="/login" className="pr-nav-btn" style={{ padding: '7px 16px', border: '1px solid rgba(255,255,255,.3)', fontSize: 11, color: '#fff', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase' }}>
            Entrar →
          </Link>
        </div>
      </nav>

      {/* ── Hero (dark) ───────────────────────────────────────────────────────── */}
      <section className="pr-hero" style={{ background: '#111', padding: '120px 72px 80px' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 20 }}>
            Precios · Beta privada 2026
          </p>
          <h1 style={{ fontFamily: B, fontSize: 'clamp(56px, 9vw, 120px)', lineHeight: .9, letterSpacing: '.01em', color: '#fff', marginBottom: 24 }}>
            Elige tu plan.
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,.45)', maxWidth: '52ch', lineHeight: 1.7 }}>
            Exámenes oficiales, corrección con foto por IA y un Camino PAU personalizado —{' '}
            <span style={{ color: 'rgba(255,255,255,.8)' }}>por menos que una clase particular al mes.</span>
          </p>
        </div>
      </section>

      {/* ── Plans (light) ─────────────────────────────────────────────────────── */}
      <section data-theme="light" style={{ background: '#f9f9f9', color: '#1c1c1c' }}>
        <div className="pr-plans-wrap" style={{ maxWidth: 1040, margin: '0 auto', padding: '0 0' }}>
          <div className="pr-plans">
            {PLANS.map((plan) => (
              <div key={plan.name} className={`pr-col${plan.dark ? ' pr-col-dark' : ''}`}>

                {/* Badge */}
                {plan.badge && (
                  <p style={{
                    fontFamily: M, fontSize: 9, fontWeight: 500,
                    color: plan.dark ? 'rgba(255,255,255,.4)' : 'rgba(28,28,28,.4)',
                    letterSpacing: '.18em', textTransform: 'uppercase',
                    marginBottom: 20,
                  }}>
                    ● {plan.badge}
                  </p>
                )}
                {!plan.badge && <div style={{ marginBottom: 20, height: 17 }} />}

                {/* Plan name */}
                <p style={{
                  fontFamily: M, fontSize: 10, fontWeight: 500,
                  color: plan.dark ? 'rgba(255,255,255,.35)' : '#999',
                  letterSpacing: '.16em', textTransform: 'uppercase', marginBottom: 12,
                }}>
                  {plan.name}
                </p>

                {/* Price */}
                {plan.previousPrice && (
                  <p style={{
                    fontFamily: M, fontSize: 14, fontWeight: 500,
                    color: plan.dark ? 'rgba(255,255,255,.35)' : '#999',
                    textDecoration: 'line-through', marginBottom: 4,
                  }}>
                    {plan.previousPrice}
                  </p>
                )}
                <p style={{
                  fontFamily: B,
                  fontSize: 'clamp(48px, 5vw, 68px)',
                  lineHeight: .9, letterSpacing: '.01em',
                  color: plan.dark ? '#fff' : '#1c1c1c',
                  marginBottom: 8,
                }}>
                  {plan.price}
                </p>

                {/* Period */}
                <p style={{
                  fontFamily: M, fontSize: 10,
                  color: plan.dark ? 'rgba(255,255,255,.3)' : '#aaa',
                  letterSpacing: '.06em', marginBottom: 20,
                }}>
                  {plan.period}
                </p>

                {/* Description */}
                <p style={{
                  fontSize: 13, lineHeight: 1.7,
                  color: plan.dark ? 'rgba(255,255,255,.5)' : '#5a5a5a',
                  marginBottom: 28,
                }}>
                  {plan.description}
                </p>

                {/* Features */}
                <div style={{ flex: 1, marginBottom: 32 }}>
                  {plan.features.map((f) => (
                    <div key={f.text} className="pr-feature">
                      {f.included
                        ? <Check size={13} style={{ flexShrink: 0, color: plan.dark ? '#fff' : '#1c1c1c', opacity: .8 }} />
                        : <X size={13} style={{ flexShrink: 0, color: plan.dark ? 'rgba(255,255,255,.2)' : '#ccc' }} />
                      }
                      <span style={{
                        fontFamily: M, fontSize: 11,
                        color: f.included
                          ? (plan.dark ? 'rgba(255,255,255,.75)' : '#3a3a3a')
                          : (plan.dark ? 'rgba(255,255,255,.2)' : '#bbb'),
                        letterSpacing: '.02em',
                      }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Link href={plan.href} className={plan.dark ? 'pr-btn-dark' : 'pr-btn-light'}>
                  {plan.cta}
                </Link>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ¿Pagan tus padres? ───────────────────────────────────────────────── */}
      <ParentLinkSection />

      {/* ── Note strip (dark) ─────────────────────────────────────────────────── */}
      <section className="pr-note" style={{ background: '#111', padding: '40px 72px', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <p style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.25)', letterSpacing: '.04em', lineHeight: 1.7 }}>
            Los precios incluyen IVA. Curso PAU early bird {getPlanPriceDisplay('curso_pau')} hasta la fecha límite, después {formatEur(CURSO_PAU_STANDARD_PRICE_CENTS)}.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { href: '/legal/privacidad', label: 'Privacidad' },
              { href: '/legal/terminos',   label: 'Términos'   },
              { href: '/legal/reembolsos', label: 'Reembolsos' },
            ].map((l) => (
              <Link key={l.href} href={l.href} style={{
                fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.2)',
                textDecoration: 'none', letterSpacing: '.1em', textTransform: 'uppercase',
                transition: 'color 140ms',
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer style={{ background: '#111', padding: '32px 72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        <Link href="/" aria-label="Inicio">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/kairo-logo-white.png" alt="Kairo" style={{ height: 28, width: 'auto', display: 'block' }} />
        </Link>
        <ul style={{ display: 'flex', gap: 20, listStyle: 'none', flexWrap: 'wrap', padding: 0, margin: 0 }}>
          {[
            { label: 'Exámenes',   href: '/examenes'         },
            { label: 'Camino PAU', href: '/camino'           },
            { label: 'Simulacros', href: '/simulacros'       },
            { label: 'Privacidad', href: '/legal/privacidad' },
            { label: 'Términos',   href: '/legal/terminos'   },
          ].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.3)', textDecoration: 'none', letterSpacing: '.06em', textTransform: 'uppercase', transition: 'color 140ms' }}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <span style={{ fontFamily: M, fontSize: 10, color: 'rgba(255,255,255,.18)' }}>© 2026 KAIRO · Madrid y Cataluña</span>
      </footer>

      {/* ── Scroll-aware nav script ───────────────────────────────────────────── */}
      <script dangerouslySetInnerHTML={{ __html: `
(function(){
  var nav = document.getElementById('pr-nav');
  if (!nav) return;
  var NAV_H = 54;
  function check() {
    var els = document.querySelectorAll('[data-theme="light"]');
    var onLight = false;
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.top < NAV_H && r.bottom > 0) { onLight = true; break; }
    }
    nav.classList.toggle('v4c-on-light', onLight);
  }
  window.addEventListener('scroll', check, { passive: true });
  check();
})();
      `}} />

    </div>
  )
}
