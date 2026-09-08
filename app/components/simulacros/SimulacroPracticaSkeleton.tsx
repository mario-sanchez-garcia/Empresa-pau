import Skeleton, { SkeletonLines, SkeletonScreen } from '@/app/components/ui/Skeleton'

// Silueta de la práctica dirigida (app/simulacros/practica/[id]/page.tsx):
// cabecera de SimulacroShell con sus acciones (Volver a Camino, Pausar) y
// debajo el enunciado y el área de respuesta, con el mismo padding 24 del
// <main> real.
export default function SimulacroPracticaSkeleton() {
  return (
    <SkeletonScreen background="var(--clay-bg, #e9eefb)" label="Cargando la práctica">
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        <div style={{ background: 'var(--clay-surface, #eef3fc)', borderBottom: '1px solid var(--clay-border, #dbe7fb)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton width={248} height={15} radius={6} />
            <Skeleton width={172} height={9} radius={4} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={172} height={32} radius={11} />
            <Skeleton width={96} height={32} radius={11} />
          </div>
        </div>

        <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Enunciado */}
          <div style={{ background: 'var(--clay-surface, #eef3fc)', border: '1px solid var(--clay-border, #dbe7fb)', borderRadius: 14, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <Skeleton width={78} height={20} radius={999} />
              <Skeleton width={62} height={20} radius={999} />
            </div>
            <SkeletonLines lines={3} height={13} />
          </div>

          {/* Área de respuesta con su barra de herramientas */}
          <div style={{ background: 'var(--clay-surface, #eef3fc)', border: '1px solid var(--clay-border, #dbe7fb)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 6, padding: '10px 14px', borderBottom: '1px solid var(--clay-border, #dbe7fb)', flexWrap: 'wrap' }}>
              {[34, 34, 34, 52, 34, 44, 34].map((w, i) => <Skeleton key={i} width={w} height={26} radius={8} />)}
            </div>
            <div style={{ padding: '18px 20px' }}>
              <SkeletonLines lines={4} height={12} lastWidth="44%" />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <Skeleton width={118} height={40} radius={12} />
            <Skeleton width={152} height={40} radius={12} />
          </div>
        </div>
      </div>
    </SkeletonScreen>
  )
}
