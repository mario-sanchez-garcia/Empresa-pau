import type { Metadata } from 'next'
import FinalizandoClient from './FinalizandoClient'

export const metadata: Metadata = {
  title: 'Construyendo tu Camino',
  description: 'Estamos generando tu preparación PAU personalizada.',
}

export default function FinalizandoPage() {
  return <FinalizandoClient />
}
