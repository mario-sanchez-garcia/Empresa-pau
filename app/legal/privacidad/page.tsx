import type { Metadata } from 'next'
import PrivacidadClient from './PrivacidadClient'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de Privacidad de Kairo.',
}

export default function PrivacidadPage() {
  return <PrivacidadClient />
}
