import Skeleton, { SkeletonScreen } from '@/app/components/ui/Skeleton'

// Silueta del configurador de Simulacros (app/simulacros/page.tsx, .sim-main):
// cabecera, y luego los pasos Asignatura (rejilla de 4), Tipo (rejilla de 2),
// bloques y el botón de empezar. Mismo ancho máximo (860) y padding (24).
// Los colores salen de los tokens clay para que funcione en claro y oscuro.
export default function SimulacrosLoading() {
  return (
    <SkeletonScreen background="var(--clay-bg, #e9eefb)" label="Cargando simulacros">
      <div style={{ flex: 1, minWidth: 0 }}>

        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--clay-border, #dbe7fb)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <Skeleton width={168} height={18} radius={7} />
            <Skeleton width={104} height={26} radius={999} />
          </div>
        </div>

        <div style={{ padding: 24, maxWidth: 860, margin: '0 auto' }}>

          {/* Paso 1: asignatura */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Skeleton width={76} height={9} radius={4} />
              <Skeleton width={62} height={18} radius={999} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 10px', borderRadius: 12, border: '1px solid var(--clay-border, #dbe7fb)' }}>
                  <Skeleton width={12} height={12} radius="50%" />
                  <Skeleton width={68} height={10} radius={5} />
                </div>
              ))}
            </div>
          </div>

          {/* Paso 2: tipo */}
          <div style={{ marginBottom: 24 }}>
            <Skeleton width={40} height={9} radius={4} style={{ marginBottom: 10 }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--clay-border, #dbe7fb)' }}>
                  <Skeleton width={116} height={11} radius={5} />
                  <Skeleton width="78%" height={9} radius={4} />
                </div>
              ))}
            </div>
          </div>

          {/* Paso 3: bloques */}
          <div style={{ marginBottom: 24 }}>
            <Skeleton width={58} height={9} radius={4} style={{ marginBottom: 10 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, border: '1px solid var(--clay-border, #dbe7fb)', opacity: i > 2 ? 0.5 : 1 }}>
                  <Skeleton width={16} height={16} radius={5} />
                  <Skeleton height={11} radius={5} />
                  <Skeleton width={44} height={11} radius={5} />
                </div>
              ))}
            </div>
          </div>

          <Skeleton height={46} radius={12} />
        </div>
      </div>
    </SkeletonScreen>
  )
}
