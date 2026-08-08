import type { Metadata } from 'next'
import RevisaTuEmailClient from './RevisaTuEmailClient'

export const metadata: Metadata = {
  title: 'Revisa tu correo · Kairo',
  description: 'Confirma tu email para terminar de crear tu Camino PAU.',
}

export default function RevisaTuEmailPage() {
  return <RevisaTuEmailClient />
}
