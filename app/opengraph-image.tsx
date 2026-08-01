import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Kairo — Prepara tu PAU con exámenes oficiales y corrección con IA'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Imagen OG por defecto para toda la web. Next la sirve automáticamente en
// og:image y twitter:image de cualquier ruta que no defina la suya propia.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0d0d0d',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Barra superior: marca + etiqueta */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.22em',
            }}
          >
            KAIRO
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 17,
              fontWeight: 700,
              color: '#f97316',
              letterSpacing: '0.18em',
              border: '1px solid rgba(249,115,22,0.35)',
              background: 'rgba(249,115,22,0.10)',
              borderRadius: 999,
              padding: '9px 22px',
            }}
          >
            PAU · EBAU 2026
          </div>
        </div>

        {/* Titular */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 104,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
            }}
          >
            La PAU empieza hoy.
          </div>
          <div
            style={{
              marginTop: 26,
              fontSize: 31,
              color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.45,
              maxWidth: 880,
            }}
          >
            Tu plan de estudio diario, exámenes oficiales reales y corrección
            con IA que te dice exactamente dónde pierdes puntos.
          </div>
        </div>

        {/* Pie: tres datos + dominio */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 60 }}>
            {[
              ['4.200+', 'ALUMNOS'],
              ['8.4', 'NOTA MEDIA'],
              ['Madrid · Cataluña', 'COMUNIDADES'],
            ].map(([value, label]) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#ffffff' }}>{value}</div>
                <div
                  style={{
                    fontSize: 15,
                    color: 'rgba(255,255,255,0.40)',
                    letterSpacing: '0.16em',
                    marginTop: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 25, color: '#f97316', fontWeight: 700 }}>kairo-pau.com</div>
        </div>
      </div>
    ),
    size,
  )
}
