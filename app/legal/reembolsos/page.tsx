import type { Metadata } from 'next'
import ReembolsosClient from './ReembolsosClient'

export const metadata: Metadata = {
  title: 'Política de Reembolsos',
  description: 'Condiciones de reembolso del Pack Curso PAU.',
}

export default function ReembolsosPage() {
  return <ReembolsosClient />
}
