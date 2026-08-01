import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Te han invitado a una liga en Kairo'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ codigo: string }> }) {
  const { codigo: rawCodigo } = await params
  const codigo = (rawCodigo ?? '').toUpperCase()

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 34, fontWeight: 800, color: '#ffffff', letterSpacing: '0.22em' }}>
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
            INVITACIÓN A LIGA
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.03,
              letterSpacing: '-0.03em',
            }}
          >
            Te retan a estudiar.
          </div>
          <div
            style={{
              marginTop: 24,
              fontSize: 30,
              color: 'rgba(255,255,255,0.58)',
              lineHeight: 1.45,
              maxWidth: 820,
            }}
          >
            Liga semanal de preparación PAU. Quien más trabaja, sube en la
            clasificación. Entra y compite con tu clase.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          {codigo ? (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  fontSize: 15,
                  color: 'rgba(255,255,255,0.40)',
                  letterSpacing: '0.16em',
                  marginBottom: 10,
                }}
              >
                CÓDIGO DE LIGA
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: 46,
                  fontWeight: 800,
                  color: '#f97316',
                  letterSpacing: '0.14em',
                  border: '2px solid rgba(249,115,22,0.35)',
                  borderRadius: 16,
                  padding: '14px 32px',
                }}
              >
                {codigo}
              </div>
            </div>
          ) : (
            <div />
          )}
          <div style={{ fontSize: 25, color: 'rgba(255,255,255,0.55)', fontWeight: 700 }}>
            kairo-pau.com
          </div>
        </div>
      </div>
    ),
    size,
  )
}
