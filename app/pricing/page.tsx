import { redirect } from 'next/navigation'
import { PRICING_PATH } from '@/app/lib/pricing'

export default function LegacyPricingPage() {
  redirect(PRICING_PATH)
}
