import type { Metadata } from 'next'
import CheckoutSuccessClient from './CheckoutSuccessClient'

export const metadata: Metadata = {
  title: 'Pago completado',
  description: 'Tu pago se ha completado. Bienvenido a Kairo Premium.',
}

export default function CheckoutSuccess() {
  return <CheckoutSuccessClient />
}
