import ParentCheckoutClient from '../[token]/ParentCheckoutClient'

const PREVIEW_FEATURES = [
  'Camino PAU: misiones diarias personalizadas',
  'Correcciones IA con uso razonable',
  'Simulacros completos con corrección automática',
  'Historial de progreso y análisis de errores',
  'Seguimiento semana a semana hasta la PAU',
  'Soporte prioritario',
]

export default function ParentCheckoutPreviewPage() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  return (
    <div>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: '#fef9c3', borderBottom: '1px solid #fde047',
        padding: '8px 16px', textAlign: 'center' as const,
        fontSize: 12, fontWeight: 800, color: '#713f12', letterSpacing: '0.04em',
      }}>
        VISTA PREVIA · El botón de pago no funciona en modo preview
      </div>
      <div style={{ paddingTop: 36 }}>
        <ParentCheckoutClient
          token="preview-token-fake"
          planId="pack_curso_pau"
          planLabel="Pack Curso PAU"
          planFeatures={PREVIEW_FEATURES}
          priceCents={4900}
          currency="eur"
          studentDisplayName="Mario"
          expiresAt={expiresAt}
        />
      </div>
    </div>
  )
}
