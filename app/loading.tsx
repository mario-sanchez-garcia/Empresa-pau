import KairoLoader from './components/ui/KairoLoader'

// El arranque de la app conserva la animación de las letras KAIRO: aquí no es
// una espera cualquiera, es la primera impresión de la marca.
//
// Este fichero es además el comodín de todo lo que no tenga su propio
// loading.tsx, y por eso las letras pueden aparecer al abrir una pantalla
// directamente por URL o al recargar: esa carga en frío ES el arranque. En
// la navegación de dentro de la app manda el loading.tsx de cada ruta, que a
// estas alturas es un skeleton en todas las pantallas de producto.
//
// Las otras dos esperas con animación propia y deliberada:
//   · el pago (app/checkout/**), donde una silueta parecería que la página ya
//     cargó y está rota;
//   · la generación del Camino (app/onboarding/finalizando), que tiene su
//     propia pantalla con los mensajes de cada etapa.
export default function Loading() {
  return <KairoLoader />
}
