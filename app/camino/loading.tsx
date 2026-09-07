import Skeleton, { SkeletonScreen } from '@/app/components/ui/Skeleton'

// Antes esto devolvía null: al entrar en Camino veías el fondo en blanco hasta
// que el cliente resolvía sesión, perfil y calendario. Ahora dibuja la silueta
// real de la pantalla (ver app/components/camino/CaminoCalendarClient.tsx):
// cabecera + ticker, y debajo columna izquierda con objetivo, hero de 340 px y
// misiones, más el panel derecho de 288 px.
export default function CaminoLoading() {
  return (
    <SkeletonScreen label="Cargando tu Camino PAU">
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Cabecera: "CAMINO PAU / Tu semana de estudio" + los cuatro botones */}
        <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            <Skeleton width={78} height={8} radius={4} />
            <Skeleton width={196} height={17} radius={6} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[132, 96, 82, 96].map((w, i) => <Skeleton key={i} width={w} height={31} radius={9} />)}
          </div>
        </div>

        {/* Ticker de chips */}
        <div style={{ background: 'rgba(248,251,255,.82)', borderBottom: '1px solid #dbeafe', padding: '8px 20px', display: 'flex', gap: 16 }}>
          {[92, 84, 88, 104, 118].map((w, i) => <Skeleton key={i} width={w} height={9} radius={5} />)}
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>

          {/* Columna izquierda */}
          <div style={{ flex: 1, minWidth: 0, borderRight: '1px solid #e2e8f0', background: 'rgba(255,255,255,.86)' }}>

            {/* Tarjeta de objetivo */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 14px', border: '1px solid rgba(191,219,254,.72)', borderRadius: 12, background: 'rgba(255,255,255,.68)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <Skeleton width={54} height={8} radius={4} />
                  <Skeleton width={320} height={12} radius={6} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginLeft: 'auto' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <Skeleton width={62} height={8} radius={4} />
                    <Skeleton width={30} height={11} radius={5} />
                  </div>
                  <Skeleton width={92} height={10} radius={5} />
                </div>
              </div>
            </div>

            {/* Hero: el bloque de 340 px con la foto y el contador de días.
                Va oscuro, no gris claro como el resto del skeleton, porque la
                pieza real es una foto con un velo rgba(10,15,30,.88): un
                placeholder claro daría un fogonazo blanco justo antes de que
                entre la foto. */}
            <div className="kairo-skeleton" style={{ height: 340, borderRadius: 0, borderBottom: '1px solid #e2e8f0', background: '#131c30' }}>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 32px', gap: 12 }}>
                <Skeleton width={148} height={9} radius={4} style={{ background: 'rgba(255,255,255,.16)' }} />
                <Skeleton width={230} height={88} radius={10} style={{ background: 'rgba(255,255,255,.24)' }} />
                <div style={{ display: 'flex', gap: 22, marginTop: 4 }}>
                  {[52, 74, 46].map((w, i) => <Skeleton key={i} width={w} height={30} radius={7} style={{ background: 'rgba(255,255,255,.16)' }} />)}
                </div>
              </div>
            </div>

            {/* Próximo parcial */}
            <div style={{ margin: '14px 16px', padding: '18px 22px', borderLeft: '3px solid #dbeafe', background: 'rgba(255,255,255,.7)', borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <Skeleton width={104} height={9} radius={4} />
                <Skeleton width={54} height={9} radius={4} />
              </div>
              <Skeleton width={342} height={16} radius={6} />
              <Skeleton width={268} height={10} radius={5} />
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <Skeleton width={148} height={36} radius={10} />
                <Skeleton width={158} height={36} radius={10} />
              </div>
            </div>

            {/* "Haz esto ahora" + misiones */}
            <div style={{ padding: '10px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <Skeleton width={118} height={14} radius={6} />
              <Skeleton width={92} height={10} radius={5} />
            </div>
            {[0, 1].map(i => (
              <div key={i} style={{ margin: '0 16px 12px', padding: '20px 22px', borderLeft: '3px solid #e2e8f0', background: 'rgba(255,255,255,.7)', borderRadius: 12, display: 'flex', gap: 20, opacity: i === 1 ? 0.55 : 1 }}>
                <Skeleton width={34} height={30} radius={7} />
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Skeleton width={92} height={9} radius={4} />
                    <Skeleton width={84} height={9} radius={4} />
                    <Skeleton width={58} height={14} radius={7} />
                  </div>
                  <Skeleton height={15} radius={6} />
                  <Skeleton width="72%" height={15} radius={6} />
                  <Skeleton height={1} radius={0} style={{ marginTop: 4 }} />
                </div>
                <Skeleton width={132} height={36} radius={10} />
              </div>
            ))}
          </div>

          {/* Panel derecho: 288 px, oculto por debajo de lg igual que el real */}
          <div className="camino-skeleton-aside" style={{ width: 288, flexShrink: 0, background: 'white', borderLeft: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton width={86} height={10} radius={5} />
              <Skeleton width={132} height={30} radius={8} />
              <Skeleton width={158} height={12} radius={6} />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Skeleton height={56} radius={12} />
              <Skeleton height={56} radius={12} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Skeleton width={142} height={10} radius={5} />
              <Skeleton height={30} radius={9} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Skeleton width={66} height={11} radius={5} />
              {[0, 1, 2].map(i => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Skeleton width={16} height={16} radius="50%" />
                  <Skeleton height={11} radius={5} />
                  <Skeleton width={50} height={11} radius={5} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* El panel derecho real es hidden lg:flex; el skeleton hace lo mismo para
          no prometer una columna que en móvil no va a existir. */}
      <style>{`@media (max-width: 1023px) { .camino-skeleton-aside { display: none !important; } }`}</style>
    </SkeletonScreen>
  )
}
