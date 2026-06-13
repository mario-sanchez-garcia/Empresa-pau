'use client'

import dynamic from 'next/dynamic'

const OnboardingFlow = dynamic(
  () => import('@/app/components/onboarding/OnboardingFlow'),
  { ssr: false }
)

export default function OnboardingClient() {
  return <OnboardingFlow />
}
