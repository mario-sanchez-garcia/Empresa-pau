import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ayuda',
  description: 'Cómo funciona Kairo: Camino PAU, Simulacros, Exámenes y corrección por IA. Preguntas frecuentes sobre la plataforma.',
  alternates: { canonical: '/ayuda' },
}

export default function AyudaLayout({ children }: { children: React.ReactNode }) {
  return children
}
