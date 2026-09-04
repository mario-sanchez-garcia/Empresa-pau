'use client'

import { useClayThemePreference, type ClayTheme } from '@/components/clay/useClayThemePreference'

const OPTIONS: { value: ClayTheme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'color', label: 'Color' },
]

export default function ClayThemeSwitcher() {
  const { theme, setTheme } = useClayThemePreference()
  return (
    <div>
      <div style={{ display: 'flex', gap: 8 }}>
        {OPTIONS.map(opt => {
          const active = opt.value === theme
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              style={{
                fontSize: 12,
                fontWeight: 800,
                padding: '8px 16px',
                borderRadius: 10,
                border: active ? '1.5px solid var(--pau-blue)' : '1px solid var(--pau-border)',
                background: active ? 'var(--pau-blue-50)' : '#fff',
                color: active ? 'var(--pau-blue)' : 'var(--pau-muted)',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--pau-muted)', marginTop: 8 }}>
        Piloto: por ahora solo cambia el aspecto de la sección principal de la landing y de la ficha del tema &ldquo;Modelo Atómico de Bohr&rdquo; (Física).
      </p>
    </div>
  )
}
