import type { Metadata } from 'next'

// La página de liga es un client component, así que los metadatos viven aquí.
// Sin esto, compartir una invitación por WhatsApp muestra una URL pelada.
export async function generateMetadata(
  { params }: { params: Promise<{ codigo: string }> },
): Promise<Metadata> {
  const { codigo } = await params
  const title = 'Te han invitado a una liga en Kairo'
  const description =
    'Compite cada semana con tu clase preparando la PAU. Quien más estudia, sube. Únete con el código ' +
    `${codigo.toUpperCase()}.`

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    // Invitaciones privadas: no queremos que Google las indexe.
    robots: { index: false, follow: false },
  }
}

export default function LigaLayout({ children }: { children: React.ReactNode }) {
  return children
}
