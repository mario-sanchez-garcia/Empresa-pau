import type { Metadata } from 'next'
import OrientationSimulator from './OrientationSimulator'

// A22 de la auditoría del 7-8 de septiembre de 2026: esta página no declaraba
// canonical propio, así que heredaba el '/' de app/layout.tsx — le estaba
// diciendo a Google que es un duplicado de la portada, que es la forma más
// eficaz de que no se indexe nunca. Y tampoco figuraba en el sitemap, siendo
// la pantalla mejor valorada del producto y accesible sin sesión.
export const metadata: Metadata = {
  title: 'Mi objetivo',
  description: 'Simula tu nota de admisión y descubre cómo acercarte a tu objetivo.',
  alternates: { canonical: '/orientacion' },
}

export default function OrientationPage() {
  return <OrientationSimulator />
}
