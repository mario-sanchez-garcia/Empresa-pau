import AppScreenSkeleton from '@/app/components/ui/AppScreenSkeleton'

// La cabecera de Ajustes mide 240 px y lleva el avatar centrado, no un
// título a la izquierda como el resto (app/settings/page.tsx:539).
export default function AjustesLoading() {
  return <AppScreenSkeleton heroHeight={240} heroAlign="center" content="form" label="Cargando tus ajustes" />
}
