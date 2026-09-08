import Skeleton from '@/app/components/ui/Skeleton'

// Ajustes no encaja en AppScreenSkeleton: tiene tres piezas que no comparte
// con ninguna otra pantalla — la franja de cuatro estadísticas bajo la
// cabecera, un formulario a dos columnas a todo ancho (no centrado) y una
// barra de acciones fija abajo. Se escribió a mano tras comparar con la
// pantalla real; la primera versión, deducida solo del código, se parecía
// poco y habría hecho saltar el layout al cargar.
//
// Medidas tomadas de app/settings/page.tsx: cabecera de 240 px con avatar
// centrado (:539), separador de 2 px (:587), franja de stats de 4 columnas
// (:590) y formulario con padding '28px 40px 20px' (:607).
export default function AjustesLoading() {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ display: 'flex', minHeight: '100vh', background: 'var(--clay-bg, #f4f7fb)' }}>
      <span style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Cargando tus ajustes</span>
      <div style={{ width: 60, flexShrink: 0, borderRight: '1px solid rgba(15,23,42,.06)' }} aria-hidden />

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Cabecera con avatar centrado */}
        <div className="kairo-skeleton kairo-skeleton--dark" style={{ height: 240, flexShrink: 0, borderRadius: 0, background: '#131c30' }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Skeleton width={96} height={8} radius={4} style={{ background: 'rgba(255,255,255,.16)' }} />
            <Skeleton width={64} height={64} radius="50%" style={{ background: 'rgba(255,255,255,.2)' }} />
            <Skeleton width={186} height={26} radius={7} style={{ background: 'rgba(255,255,255,.24)' }} />
            <Skeleton width={128} height={18} radius={999} style={{ background: 'rgba(255,255,255,.14)' }} />
          </div>
        </div>

        <div style={{ height: 2, background: '#0f172a', flexShrink: 0 }} />

        {/* Franja de estadísticas: cuatro columnas */}
        <div style={{ background: 'var(--clay-surface, #fff)', borderBottom: '1px solid var(--clay-border, #e2e8f0)', display: 'flex', flexShrink: 0 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{ flex: 1, padding: '12px 20px', borderRight: i < 3 ? '1px solid var(--clay-border, #e2e8f0)' : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
              <Skeleton width={82} height={7} radius={4} />
              <Skeleton width={62} height={16} radius={6} />
            </div>
          ))}
        </div>

        {/* Formulario: dos columnas, ancho completo */}
        <div style={{ flex: 1, padding: '28px 40px 20px', display: 'flex', flexDirection: 'column', gap: 26 }}>
          {[0, 1, 2].map(section => (
            <div key={section} style={{ display: 'flex', flexDirection: 'column', gap: 12, opacity: section === 2 ? 0.5 : 1 }}>
              <Skeleton width={112} height={8} radius={4} />
              <Skeleton height={1} radius={0} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18 }}>
                {[0, 1].map(field => (
                  <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <Skeleton width={124} height={8} radius={4} />
                    <Skeleton height={44} radius={10} />
                    <Skeleton width="64%" height={8} radius={4} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Barra de acciones inferior */}
        <div style={{ background: 'var(--clay-surface, #fff)', borderTop: '2px solid var(--clay-text, #0f172a)', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={128} height={34} radius={999} />
            <Skeleton width={124} height={34} radius={999} />
          </div>
          <Skeleton width={152} height={38} radius={999} />
        </div>
      </div>
    </div>
  )
}
