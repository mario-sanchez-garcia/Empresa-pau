import Skeleton, { SkeletonScreen } from '@/app/components/ui/Skeleton'

// Silueta de la pantalla de Exámenes (app/page-client.tsx, <main class="exams-screen">):
// tira de asignaturas, fila de píldoras de filtro y la tarjeta de filtros con
// el listado. Mismo ancho máximo (1420) y mismo padding que el real, para que
// al entrar los datos no se desplace nada.
export default function ExamenesLoading() {
  return (
    <SkeletonScreen background="#f8fafc" label="Cargando tus exámenes">
      <main style={{ flex: 1, padding: '20px 24px 56px', maxWidth: 1420, width: '100%', margin: '0 auto' }}>

        {/* Tira de asignaturas */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} style={{ flex: '1 0 214px', maxWidth: 280, background: 'white', border: '1px solid #e2e8f0', borderRadius: 14, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <Skeleton width={124} height={13} radius={6} />
              <Skeleton width={78} height={9} radius={4} />
            </div>
          ))}
        </div>

        {/* Píldoras de filtro */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <Skeleton width={62} height={9} radius={4} style={{ marginRight: 4 }} />
          {[74, 92, 68, 86, 78].map((w, i) => <Skeleton key={i} width={w} height={26} radius={999} />)}
        </div>

        {/* Tarjeta de filtros + listado */}
        <div style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '2px solid #0f172a', padding: '18px 20px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
            {[150, 130, 118].map((w, i) => <Skeleton key={i} width={w} height={34} radius={10} />)}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10, opacity: i > 3 ? 0.5 : 1 }}>
                <Skeleton width={88} height={9} radius={4} />
                <Skeleton height={14} radius={6} />
                <Skeleton width="64%" height={14} radius={6} />
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <Skeleton width={72} height={22} radius={999} />
                  <Skeleton width={58} height={22} radius={999} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </SkeletonScreen>
  )
}
