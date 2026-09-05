'use client'

import { Bebas_Neue, DM_Mono } from 'next/font/google'
import ParentLinkModule from '@/app/components/camino/ParentLinkModule'
import { useBillingStatus } from '@/app/hooks/useBillingStatus'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

export default function ParentLinkSection() {
  const billing = useBillingStatus()
  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  return (
    <section className="family-payment" data-theme="light">
      <div className="family-payment__shell">
        <div className="family-payment__copy">
          <p style={{ fontFamily: M }}>
            ¿No pagas tú el plan?
          </p>
          <h2 style={{ fontFamily: B }}>
            También puede pagarlo tu familia
          </h2>
          <span>
            Genera un enlace de pago seguro y compártelo. Cuando se complete el pago, el Pack Curso PAU se activa en tu cuenta.
          </span>
        </div>
        <div className="family-payment__module">
          <ParentLinkModule billing={billing} />
        </div>
      </div>
      <style jsx>{`
        /* Banda clara de cierre, con el mismo par de valores que usa la
           landing para sus secciones claras (#f9f9f9 sobre #1c1c1c) en vez
           del azul y el cristal que traia antes: /precios es oscura, y esta
           seccion cierra por contraste igual que hace .v4c-cta-split en la
           landing. Plano y con filete de 1px, sin radios grandes ni sombras. */
        .family-payment {
          background: #f9f9f9;
          color: #1c1c1c;
          padding: 72px 72px 80px;
          border-top: 1px solid #e0e0e0;
        }
        .family-payment__shell {
          align-items: center;
          display: grid;
          gap: clamp(32px, 6vw, 72px);
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          margin: 0 auto;
          max-width: 1040px;
        }
        .family-payment__copy p {
          color: #999;
          font-size: 10px;
          letter-spacing: .18em;
          margin: 0 0 14px;
          text-transform: uppercase;
        }
        .family-payment__copy h2 {
          color: #1c1c1c;
          font-size: clamp(32px, 4vw, 56px);
          letter-spacing: .01em;
          line-height: .95;
          margin: 0 0 18px;
          max-width: 12ch;
        }
        .family-payment__copy span {
          color: #666;
          display: block;
          font-size: 14px;
          line-height: 1.7;
          max-width: 52ch;
        }
        .family-payment__module { min-width: 0; }
        @media (max-width: 860px) {
          .family-payment { padding: 48px 24px 56px; }
          .family-payment__shell { grid-template-columns: 1fr; }
          .family-payment__copy h2 { max-width: 14ch; }
        }
      `}</style>
    </section>
  )
}
