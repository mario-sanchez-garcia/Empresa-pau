import AppScreenSkeleton from '@/app/components/ui/AppScreenSkeleton'

// heroBand mide 200 px (app/orientacion/orientation.module.css:123) y el
// contenido es la calculadora más el catálogo de grados.
export default function OrientacionLoading() {
  return <AppScreenSkeleton heroHeight={200} content="cards" label="Cargando tu orientación" />
}
