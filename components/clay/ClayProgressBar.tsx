'use client'

export default function ClayProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value))
  return (
    <div
      style={{
        height: 16,
        borderRadius: 999,
        background: 'var(--clay-surface)',
        boxShadow: `inset 3px 3px 6px var(--clay-shadow-dark), inset -3px -3px 6px var(--clay-shadow-light)`,
        padding: 2,
        overflow: 'hidden',
      }}
    >
      <div
        key={pct}
        style={{
          height: '100%',
          width: `${pct * 100}%`,
          borderRadius: 999,
          background: `linear-gradient(180deg, var(--clay-accent), var(--clay-accent-deep))`,
          // Pequeño relieve propio del relleno — brillo arriba, sombra abajo —
          // para que no sea un bloque de color plano dentro de la ranura.
          boxShadow: `inset 0 1px 1px rgba(255,255,255,.45), inset 0 -2px 2px rgba(0,0,0,.20)`,
          transformOrigin: 'left center',
          animation: 'clay-progress-bounce 480ms var(--ease-spring, ease-out)',
        }}
      />
    </div>
  )
}
