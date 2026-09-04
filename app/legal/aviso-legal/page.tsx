import type { Metadata } from 'next'
import AvisoLegalClient from './AvisoLegalClient'

export const metadata: Metadata = {
  title: 'Aviso Legal',
  description: 'Aviso legal e información del titular del servicio Kairo, conforme a la LSSI-CE.',
}

export default function AvisoLegalPage() {
  return <AvisoLegalClient />
}
