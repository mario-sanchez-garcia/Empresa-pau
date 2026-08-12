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
    <section data-theme="light" style={{ background: '#f9f9f9', color: '#1c1c1c', borderTop: '1px solid #e0e0e0' }}>
      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '56px 40px' }}>
        <p style={{ fontFamily: M, fontSize: 10, color: '#999', letterSpacing: '.18em', textTransform: 'uppercase', marginBottom: 10 }}>
          ¿No pagas tú el plan?
        </p>
        <h2 style={{ fontFamily: B, fontSize: 'clamp(28px, 3vw, 40px)', color: '#1c1c1c', lineHeight: 1, letterSpacing: '.01em', marginBottom: 12 }}>
          ¿Pagan tus padres?
        </h2>
        <p style={{ fontSize: 13, color: '#5a5a5a', maxWidth: '52ch', lineHeight: 1.6, marginBottom: 28 }}>
          Genera un enlace de pago y envíaselo a tus padres. En cuanto paguen, tu Pack Curso PAU se activa solo.
        </p>
        <div style={{ maxWidth: 420 }}>
          <ParentLinkModule billing={billing} />
        </div>
      </div>
    </section>
  )
}
