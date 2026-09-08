import AppScreenSkeleton from '@/app/components/ui/AppScreenSkeleton'

// Sin rail: el informe se abre desde un enlace firmado que normalmente
// abre una familia, no el alumno con su sesión.
export default function InformeLoading() {
  return <AppScreenSkeleton heroHeight={0} showRail={false} content="text" label="Cargando el informe" />
}
