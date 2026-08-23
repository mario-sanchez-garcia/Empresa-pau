import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lista de espera — Curso PAU',
  description: 'Reserva tu plaza en el Curso PAU de Kairo con precio congelado. Comparte tu link e invita a amigos para bajar el precio.',
  alternates: { canonical: '/waitlist' },
}

export default function WaitlistLayout({ children }: { children: React.ReactNode }) {
  return children
}
