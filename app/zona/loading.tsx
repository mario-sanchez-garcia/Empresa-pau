// La silueta específica de Zona ya existe y la usa también la propia pantalla
// para su estado de carga de cliente; aquí solo se elige la pestaña.
import ZonaSkeleton from '@/app/components/zona/ZonaSkeleton'

export default function ZonaLoading() {
  return <ZonaSkeleton variant="estudio" />
}
