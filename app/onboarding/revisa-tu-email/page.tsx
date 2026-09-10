import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Confirma tu email',
  robots: { index: false, follow: false },
}

// La confirmación pasó de enlace a CÓDIGO dentro de la app (/verificar-email).
// Esta ruta se conserva como redirect, no se borra: puede estar abierta en la
// pestaña de alguien a mitad de registro, o guardada en un marcador.
//
// El `draft` se conserva porque es lo que devuelve al alumno a SU
// finalización; el `email` de la URL se descarta a propósito — el flujo nuevo
// no lo lleva ahí. Sin contexto en sessionStorage, /verificar-email muestra su
// estado de "volver al registro", que es el comportamiento seguro.
export default async function RevisaTuEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const draft = typeof params.draft === 'string' ? params.draft : null
  redirect(draft ? `/verificar-email?draft=${encodeURIComponent(draft)}` : '/verificar-email')
}
