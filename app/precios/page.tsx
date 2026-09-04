import type { Metadata } from 'next'
import { getPublicPlanDefinitions } from '@/app/lib/pricing'
import ParentLinkSection from '@/app/pricing/ParentLinkSection'
import PricingClient from './PricingClient'

export const metadata: Metadata = {
  title: 'Precios',
  description: 'Compara los planes reales de Kairo: Free, Premium mensual y Curso PAU hasta junio. Límites claros, Orientación incluida y checkout seguro.',
  alternates: { canonical: '/precios' },
}

export default function PreciosPage() {
  const plans = getPublicPlanDefinitions()
  return (
    <PricingClient plans={plans}>
      <ParentLinkSection />
    </PricingClient>
  )
}
