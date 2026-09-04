'use client'

import { useEffect, useState } from 'react'

export type ClayTheme = 'light' | 'dark' | 'color'

const STORAGE_KEY = 'kairo-clay-theme-pilot'

function readStored(): ClayTheme {
  if (typeof window === 'undefined') return 'light'
  const value = window.localStorage.getItem(STORAGE_KEY)
  return value === 'dark' || value === 'color' ? value : 'light'
}

// Preferencia de tema del piloto de claymorfismo. Vive solo en localStorage
// (sin contexto global ni cambios en app/layout.tsx) porque hoy solo la leen
// las 2 pantallas piloto — Ajustes y esas pantallas se sincronizan al montar,
// que es suficiente porque cada una vive en una ruta distinta. El estado
// arranca en 'light' y se corrige en un efecto tras montar (no con un
// inicializador perezoso) a propósito: estos componentes 'use client' sí se
// renderizan primero en el servidor (sin localStorage), así que leer el
// valor real antes del montaje produciría un mismatch de hidratación si el
// alumno ya tenía guardado 'dark' o 'color'.
export function useClayThemePreference() {
  const [theme, setThemeState] = useState<ClayTheme>('light')

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza desde localStorage tras montar; ver comentario de arriba sobre hidratación
    setThemeState(readStored())
  }, [])

  function setTheme(next: ClayTheme) {
    window.localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }

  return { theme, setTheme }
}
