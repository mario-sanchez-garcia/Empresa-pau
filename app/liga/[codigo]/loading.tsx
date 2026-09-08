import AppScreenSkeleton from '@/app/components/ui/AppScreenSkeleton'

// Sin rail: a esta pantalla se llega desde un enlace compartido, a menudo
// sin sesión iniciada.
export default function LigaLoading() {
  return <AppScreenSkeleton heroHeight={0} showRail={false} content="text" label="Cargando la liga" />
}
