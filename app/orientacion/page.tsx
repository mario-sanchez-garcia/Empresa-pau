import type { Metadata } from 'next'
import OrientationSimulator from './OrientationSimulator'

export const metadata: Metadata = {
  title: 'Mi objetivo',
  description: 'Simula tu nota de admisión y descubre cómo acercarte a tu objetivo.',
}

export default function OrientationPage() {
  return <OrientationSimulator />
}
