// La silueta vive en el componente porque la propia pantalla la usa para su
// estado de carga de cliente (`if (!record)`), que es donde de verdad se
// espera: el render de servidor de esta ruta es instantáneo.
export { default } from '@/app/components/simulacros/SimulacroResultsSkeleton'
