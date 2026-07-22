import type { Metadata } from 'next'
import OnboardingClient from './OnboardingClient'

export const metadata: Metadata = {
  title: 'Crea tu Camino PAU · Kairo',
  description: 'Configura tu ruta de preparación PAU personalizada en menos de 2 minutos.',
}

export default function OnboardingPage() {
  return <OnboardingClient />
}
