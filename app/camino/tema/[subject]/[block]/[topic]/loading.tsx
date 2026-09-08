import AppScreenSkeleton from '@/app/components/ui/AppScreenSkeleton'

// Sin hero: esta pantalla abre directamente con el tema y sus tarjetas de
// contenido. Una vez montada tiene su propio ContentSkeleton por sección
// (CaminoTopicClient.tsx), así que esto solo cubre la transición de ruta.
export default function TemaLoading() {
  return <AppScreenSkeleton heroHeight={0} content="lesson" label="Cargando el tema" />
}
