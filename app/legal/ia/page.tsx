import type { Metadata } from 'next'
import IaClient from './IaClient'

export const metadata: Metadata = {
  title: 'Uso de Inteligencia Artificial',
  description: 'Cómo usa Kairo la inteligencia artificial en correcciones y simulacros.',
}

export default function IaPage() {
  return <IaClient />
}
