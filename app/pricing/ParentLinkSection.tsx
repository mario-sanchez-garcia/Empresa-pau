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
        .family-payment {
          background: #edf4ff;
          color: #17284d;
          padding: 0 24px 72px;
        }
        .family-payment__shell {
          align-items: center;
          backdrop-filter: blur(18px);
          background: rgba(255, 255, 255, .64);
          border: 1px solid rgba(255, 255, 255, .82);
          border-radius: 32px;
          box-shadow: 0 22px 60px rgba(53, 94, 150, .12), inset 0 1px 0 rgba(255, 255, 255, .9);
          display: grid;
          gap: clamp(32px, 7vw, 96px);
          grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
          margin: 0 auto;
          max-width: 1120px;
          padding: clamp(32px, 5vw, 60px);
        }
        .family-payment__copy p {
          color: #6580a9;
          font-size: 10px;
          letter-spacing: .18em;
          margin: 0 0 12px;
          text-transform: uppercase;
        }
        .family-payment__copy h2 {
          color: #17284d;
          font-size: clamp(32px, 4vw, 52px);
          letter-spacing: .01em;
          line-height: .98;
          margin: 0 0 18px;
          max-width: 12ch;
        }
        .family-payment__copy span {
          color: #55709b;
          display: block;
          font-size: 14px;
          line-height: 1.7;
          max-width: 52ch;
        }
        .family-payment__module { min-width: 0; }
        @media (max-width: 760px) {
          .family-payment { padding: 0 12px 52px; }
          .family-payment__shell {
            grid-template-columns: 1fr;
            padding: 28px 20px;
          }
          .family-payment__copy h2 { max-width: 14ch; }
        }
      `}</style>
    </section>
  )
}
