import Skeleton, { SkeletonScreen } from '@/app/components/ui/Skeleton'

// Silueta de la portada del simulacro (app/simulacros/[id]/page.tsx): cabecera
// sticky de SimulacroShell, el hero oscuro de 340 px con el título y la tira de
// bloques debajo. Se pinta oscuro porque la pantalla real lo es: un skeleton
// claro aquí daría un fogonazo blanco antes de que entre el contenido.
export default function SimulacroDetalleLoading() {
  return (
    <SkeletonScreen background="var(--clay-bg, #e9eefb)" label="Cargando el simulacro">
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        <div style={{ background: 'var(--clay-surface, #eef3fc)', borderBottom: '1px solid var(--clay-border, #dbe7fb)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton width={214} height={15} radius={6} />
            <Skeleton width={148} height={9} radius={4} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={164} height={32} radius={11} />
            <Skeleton width={96} height={32} radius={11} />
          </div>
        </div>

        {/* Hero oscuro */}
        <div className="sim-hero" style={{ height: 340, background: '#0b1220', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: '0 24px' }}>
          <Skeleton width={128} height={9} radius={4} style={{ background: 'rgba(255,255,255,.16)' }} />
          <Skeleton width={360} height={46} radius={10} style={{ background: 'rgba(255,255,255,.22)' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            {[92, 76, 108].map((w, i) => <Skeleton key={i} width={w} height={24} radius={20} style={{ background: 'rgba(255,255,255,.12)' }} />)}
          </div>
        </div>

        {/* Tira de bloques */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', background: '#0b1220', borderTop: '1px solid rgba(255,255,255,.06)' }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ padding: '16px 20px', borderRight: i < 3 ? '1px solid rgba(255,255,255,.06)' : undefined, display: 'flex', flexDirection: 'column', gap: 7 }}>
              <Skeleton width={58} height={7} radius={4} style={{ background: 'rgba(255,255,255,.14)' }} />
              <Skeleton width="76%" height={11} radius={5} style={{ background: 'rgba(255,255,255,.2)' }} />
              <Skeleton width={44} height={9} radius={4} style={{ background: 'rgba(255,255,255,.14)' }} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  )
}
