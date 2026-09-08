import Skeleton, { SkeletonLines } from '@/app/components/ui/Skeleton'

// Silueta genérica para las pantallas de dentro de la app que no tenían
// ninguna. Casi todas comparten el mismo esqueleto — rail de 60 px, un hero
// con foto oscura de altura fija y contenido debajo — así que en vez de
// escribir seis componentes casi idénticos se parametriza lo que de verdad
// cambia: la altura del hero, si el título va centrado o a la izquierda, y la
// forma del contenido.
//
// Dónde NO se usa esto, a propósito:
//   · app/loading.tsx — el arranque de la app conserva el KairoLoader de las
//     letras: ahí la animación es la primera impresión de la marca.
//   · /checkout y /parent-checkout — durante un pago, una silueta parece que
//     la página ya cargó y está rota. Mejor un loader explícito.
//   · /onboarding/finalizando — mientras se genera el Camino hay una pantalla
//     que explica qué está pasando; sustituirla por bloques grises sería
//     perder información, no ganarla.
//
// El hero va oscuro (#131c30) y no gris claro porque las piezas reales son
// fotos con velo negro: un placeholder claro daría un fogonazo justo antes de
// que entre la foto. Mismo criterio que CaminoSkeleton y ZonaSkeleton.

export type AppScreenContent = 'cards' | 'form' | 'lesson' | 'text'

export default function AppScreenSkeleton({
  heroHeight = 200,
  heroAlign = 'left',
  content = 'cards',
  showRail = true,
  label = 'Cargando',
}: {
  heroHeight?: number
  heroAlign?: 'left' | 'center'
  content?: AppScreenContent
  showRail?: boolean
  label?: string
}) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg, #f4f7fb)' }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>{label}</span>
      {showRail && <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,.06)' }} aria-hidden />}

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {heroHeight > 0 && (
          <div
            className="kairo-skeleton kairo-skeleton--dark"
            style={{ height: heroHeight, flexShrink: 0, borderRadius: 0, background: '#131c30' }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                padding: '20px 28px',
                justifyContent: heroAlign === 'center' ? 'center' : 'flex-end',
                alignItems: heroAlign === 'center' ? 'center' : 'flex-start',
              }}
            >
              {heroAlign === 'center' && <Skeleton width={72} height={72} radius="50%" style={{ background: 'rgba(255,255,255,.18)' }} />}
              <Skeleton width={112} height={8} radius={4} style={{ background: 'rgba(255,255,255,.16)' }} />
              <Skeleton width={heroAlign === 'center' ? 180 : 288} height={30} radius={8} style={{ background: 'rgba(255,255,255,.24)' }} />
            </div>
          </div>
        )}

        <div style={{ flex: 1, padding: '20px 24px 40px' }}>
          {content === 'cards' ? <CardsContent /> : content === 'form' ? <FormContent /> : content === 'lesson' ? <LessonContent /> : <TextContent />}
        </div>
      </div>
    </div>
  )
}

/** Rejilla de tarjetas: catálogos, listados, paneles. */
function CardsContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ borderRadius: 16, border: '1px solid var(--clay-border, #e2e8f0)', background: 'var(--clay-surface, #fff)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, opacity: i > 3 ? 0.5 : 1 }}>
          <Skeleton width={78} height={9} radius={4} />
          <Skeleton height={13} radius={6} />
          <Skeleton width="60%" height={13} radius={6} />
        </div>
      ))}
    </div>
  )
}

/** Secciones de ajustes: bloques con etiqueta y control. */
function FormContent() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[0, 1, 2, 3].map(i => (
        <div key={i} style={{ borderRadius: 16, border: '1px solid var(--clay-border, #e2e8f0)', background: 'var(--clay-surface, #fff)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, opacity: i > 2 ? 0.5 : 1 }}>
          <Skeleton width={148} height={11} radius={5} />
          <Skeleton height={42} radius={11} />
          <Skeleton width="52%" height={9} radius={4} />
        </div>
      ))}
    </div>
  )
}

/** Lección o ficha de tema: enunciado, teoría y práctica. */
function LessonContent() {
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Skeleton width={92} height={22} radius={999} />
        <Skeleton width={74} height={22} radius={999} />
      </div>
      {[0, 1, 2].map(i => (
        <div key={i} style={{ borderRadius: 16, border: '1px solid var(--clay-border, #e2e8f0)', background: 'var(--clay-surface, #fff)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, opacity: i > 1 ? 0.5 : 1 }}>
          <Skeleton width={132} height={11} radius={5} />
          <SkeletonLines lines={i === 0 ? 4 : 3} height={12} />
        </div>
      ))}
    </div>
  )
}

/** Página de lectura: informe, invitación de liga. */
function TextContent() {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Skeleton width="58%" height={24} radius={8} />
      <SkeletonLines lines={5} height={12} />
      <div style={{ display: 'flex', gap: 10 }}>
        <Skeleton width={148} height={42} radius={12} />
        <Skeleton width={112} height={42} radius={12} />
      </div>
    </div>
  )
}
