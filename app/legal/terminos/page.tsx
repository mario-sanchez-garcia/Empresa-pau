import type { Metadata } from 'next'
import TerminosClient from './TerminosClient'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y Condiciones de Uso de Kairo.',
}

export default function TerminosPage() {
  return <TerminosClient />
}
