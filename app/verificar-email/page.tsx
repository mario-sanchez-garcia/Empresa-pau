import type { Metadata } from 'next'
import VerificarEmailClient from './VerificarEmailClient'

export const metadata: Metadata = {
  title: 'Confirma tu email',
  description: 'Introduce el código que te hemos enviado para terminar de crear tu Camino PAU.',
  robots: { index: false, follow: false },
}

export default function VerificarEmailPage() {
  return <VerificarEmailClient />
}
