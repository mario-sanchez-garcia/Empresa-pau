'use client'

// Ilustración abstracta (formas redondeadas, trazo suave) para estados vacíos
// del piloto — deliberadamente sin la mascota Pau: public/mascots/pau/README.md
// dice que Pau está guardada pero "no se muestra en la plataforma hasta nueva
// decisión de producto", y esa decisión no es parte de este piloto visual.
function ClayBlobIllustration() {
  return (
    <svg width="52" height="52" viewBox="0 0 96 96" fill="none" aria-hidden="true">
      <path
        d="M30 52c0-12 8-20 18-20s18 8 18 20-8 16-18 16-18-4-18-16Z"
        stroke="var(--clay-accent)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="41" cy="48" r="3" fill="var(--clay-accent)" />
      <circle cx="55" cy="48" r="3" fill="var(--clay-accent)" />
      <path d="M41 58c3 3 11 3 14 0" stroke="var(--clay-accent)" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default function ClayEmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '28px 16px' }}>
      {/* Círculo con relieve real (canto + sombra difusa + brillo interior),
          igual que ClayCard/ClayBadge — no un círculo plano con icono encima. */}
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: '50%',
          background: 'var(--clay-surface-raised)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: [
            '0 6px 0 var(--clay-shadow-shelf)',
            '0 10px 18px var(--clay-shadow-elevate)',
            'inset 0 2px 3px var(--clay-shadow-light)',
          ].join(', '),
        }}
      >
        <ClayBlobIllustration />
      </div>
      <p style={{ fontSize: 14, fontWeight: 800, color: 'var(--clay-text)', margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--clay-text-muted)', margin: 0, maxWidth: 240 }}>{subtitle}</p>}
    </div>
  )
}
