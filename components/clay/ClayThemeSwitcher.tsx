'use client'

import { useClayThemePreference, type ClayTheme } from '@/components/clay/useClayThemePreference'
import ClayThemeScope from '@/components/clay/ClayThemeScope'

const OPTIONS: { value: ClayTheme; label: string }[] = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
  { value: 'color', label: 'Color' },
]

export default function ClayThemeSwitcher() {
  const { theme, setTheme } = useClayThemePreference()
  return (
    <ClayThemeScope theme={theme}>
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
                border: active ? '1.5px solid var(--clay-accent)' : '1px solid var(--clay-border)',
                background: active ? 'var(--clay-accent-soft)' : 'var(--clay-surface)',
                color: active ? 'var(--clay-accent-text)' : 'var(--clay-text-muted)',
                boxShadow: active ? 'inset 0 1px 0 var(--clay-shadow-light), 0 2px 0 var(--clay-shadow-shelf)' : 'none',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      <p style={{ fontSize: 11, color: 'var(--clay-text-muted)', marginTop: 8 }}>
        Piloto: por ahora solo cambia el aspecto de algunas secciones de Kairo. Lo iremos ampliando al resto de la plataforma.
      </p>
    </ClayThemeScope>
  )
}
