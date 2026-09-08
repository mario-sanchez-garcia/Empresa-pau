import Skeleton from '@/app/components/ui/Skeleton'

// Silueta compartida de las tres pantallas de La Zona. Las tres tienen el
// mismo chrome (rail + hero de 200 px + barra de pestañas + main), así que un
// solo componente con variante evita triplicar el mismo marcado:
//
//   estudio → /zona          (añade la banda de chips de asignatura)
//   canvas  → /zona/canvas   (Mi Espacio)
//   cursos  → /zona/cursos
//
// Sustituye al KairoSpinner — la rueda azul girando sobre pantalla vacía — que
// estas pantallas mostraban mientras resolvían sesión, plan y contenido.
//
// El hero va oscuro (#131c30) y no gris claro: la pieza real es una foto con
// un velo negro, y un placeholder claro daría un fogonazo antes de la foto.
// Mismo criterio que en CaminoSkeleton.

type ZonaVariant = 'estudio' | 'canvas' | 'cursos'

// "Zona de Estudio", "Mi Espacio", "Mis Cursos": mismas tres pestañas en las
// tres pantallas; lo único que cambia es cuál va subrayada.
const TAB_WIDTHS = [104, 78, 82]
const ACTIVE_TAB: Record<ZonaVariant, number> = { estudio: 0, canvas: 1, cursos: 2 }

export default function ZonaSkeleton({ variant = 'estudio' }: { variant?: ZonaVariant }) {
  const activeIndex = ACTIVE_TAB[variant]
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: 'var(--clay-bg, #e9eefb)' }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Cargando</span>
      <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,.06)' }} aria-hidden />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* Hero */}
        <div className="kairo-skeleton zona-skeleton-hero" style={{ height: 200, flexShrink: 0, borderRadius: 0, background: '#131c30' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px 28px', gap: 10 }}>
            <Skeleton width={118} height={8} radius={4} style={{ background: 'rgba(255,255,255,.16)' }} />
            <Skeleton width={variant === 'cursos' ? 210 : 168} height={34} radius={8} style={{ background: 'rgba(255,255,255,.24)' }} />
          </div>
        </div>

        {/* Banda de asignaturas: solo /zona la tiene */}
        {variant === 'estudio' && (
          <div style={{ background: 'var(--clay-surface, #eef3fc)', borderBottom: '2px solid var(--clay-border, #dbe7fb)', display: 'flex', gap: 18, padding: '12px 14px', flexShrink: 0 }}>
            {[84, 96, 72, 88, 104].map((w, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                <Skeleton width={6} height={6} radius="50%" />
                <Skeleton width={w} height={10} radius={5} />
              </div>
            ))}
          </div>
        )}

        {/* Pestañas */}
        <div style={{ background: 'var(--clay-surface, #eef3fc)', borderBottom: '1px solid var(--clay-border, #dbe7fb)', display: 'flex', padding: '0 20px', flexShrink: 0 }}>
          {TAB_WIDTHS.map((w, i) => (
            <div key={i} style={{ padding: '13px 20px', display: 'flex', alignItems: 'center', gap: 7, borderBottom: `3px solid ${i === activeIndex ? 'var(--clay-accent, #2563eb)' : 'transparent'}` }}>
              <Skeleton width={13} height={13} radius={4} />
              <Skeleton width={w} height={10} radius={5} />
            </div>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, overflow: 'hidden', padding: '20px 24px 40px' }}>
          {variant === 'cursos' ? <CursosContent /> : variant === 'canvas' ? <CanvasContent /> : <EstudioContent />}
        </div>
      </div>
    </div>
  )
}

/** /zona: tarjeta de introducción + rejilla de flashcards. */
function EstudioContent() {
  return (
    <>
      <div style={{ borderRadius: 16, border: '1px solid var(--clay-border, #dbe7fb)', background: 'var(--clay-surface, #eef3fc)', padding: '16px 20px', marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <Skeleton width={340} height={12} radius={6} />
        <Skeleton width={286} height={10} radius={5} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} style={{ borderRadius: 16, border: '1px solid var(--clay-border, #dbe7fb)', background: 'var(--clay-surface, #eef3fc)', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10, opacity: i > 3 ? 0.5 : 1 }}>
            <Skeleton width={72} height={9} radius={4} />
            <Skeleton height={13} radius={6} />
            <Skeleton width="58%" height={13} radius={6} />
          </div>
        ))}
      </div>
    </>
  )
}

/** /zona/cursos: rejilla de asignaturas con su progreso. */
function CursosContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} style={{ borderRadius: 20, border: '1px solid var(--clay-border, #dbe7fb)', background: 'var(--clay-surface, #eef3fc)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12, opacity: i > 2 ? 0.5 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Skeleton width={40} height={40} radius={13} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skeleton width="72%" height={13} radius={6} />
              <Skeleton width={92} height={9} radius={4} />
            </div>
          </div>
          <Skeleton height={8} radius={999} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton width={78} height={22} radius={999} />
            <Skeleton width={62} height={22} radius={999} />
          </div>
        </div>
      ))}
    </div>
  )
}

/** /zona/canvas (Mi Espacio): tablero de bloques. */
function CanvasContent() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gridAutoRows: 132, gap: 14 }}>
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} style={{ borderRadius: 18, border: '1px solid var(--clay-border, #dbe7fb)', background: 'var(--clay-surface, #eef3fc)', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, gridRow: i === 1 ? 'span 2' : undefined, opacity: i > 3 ? 0.5 : 1 }}>
          <Skeleton width={64} height={9} radius={4} />
          <Skeleton height={12} radius={6} />
          <Skeleton width="66%" height={12} radius={6} />
        </div>
      ))}
    </div>
  )
}
