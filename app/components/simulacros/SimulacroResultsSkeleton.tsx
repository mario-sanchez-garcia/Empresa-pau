import Skeleton, { SkeletonLines } from '@/app/components/ui/Skeleton'

// Silueta de los resultados de un simulacro (app/simulacros/[id]/results):
// cabecera de SimulacroShell con sus acciones, la nota en grande, el desglose
// por bloques y el plan de entrenamiento.
//
// Sustituye al KairoSpinner del `if (!record)`. Esta pantalla es la que más
// tarda de las tres — espera a la corrección — así que era donde peor sentaba
// la rueda azul sobre fondo vacío.
export default function SimulacroResultsSkeleton() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg, #e9eefb)' }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Cargando tus resultados</span>
      <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,.06)' }} aria-hidden />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        <div style={{ background: 'var(--clay-surface, #eef3fc)', borderBottom: '1px solid var(--clay-border, #dbe7fb)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton width={202} height={15} radius={6} />
            <Skeleton width={156} height={9} radius={4} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={128} height={32} radius={11} />
            <Skeleton width={104} height={32} radius={11} />
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Nota */}
          <div style={{ background: 'var(--clay-surface, #eef3fc)', border: '1px solid var(--clay-border, #dbe7fb)', borderRadius: 18, padding: '26px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
            <Skeleton width={132} height={72} radius={12} />
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton width={104} height={9} radius={4} />
              <Skeleton width="68%" height={13} radius={6} />
              <Skeleton width="46%" height={11} radius={5} />
            </div>
          </div>

          {/* Desglose por bloques */}
          <div style={{ background: 'var(--clay-surface, #eef3fc)', border: '1px solid var(--clay-border, #dbe7fb)', borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Skeleton width={128} height={11} radius={5} />
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: i > 2 ? 0.5 : 1 }}>
                <Skeleton width={26} height={26} radius={8} />
                <Skeleton height={11} radius={5} />
                <Skeleton width={64} height={11} radius={5} />
              </div>
            ))}
          </div>

          {/* Plan de entrenamiento */}
          <div style={{ background: 'var(--clay-surface, #eef3fc)', border: '1px solid var(--clay-border, #dbe7fb)', borderRadius: 18, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Skeleton width={168} height={11} radius={5} />
            <SkeletonLines lines={3} height={12} />
          </div>
        </div>
      </div>
    </div>
  )
}
