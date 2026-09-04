import type { Metadata } from 'next'
import ContactoClient from './ContactoClient'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Contacta con el equipo de Kairo para soporte, privacidad, reembolsos o preguntas sobre la beta.',
}

export default function ContactoPage() {
  return <ContactoClient />
}
