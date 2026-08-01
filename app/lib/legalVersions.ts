// Single source of truth for legal document versions.
// Bump the version string when content changes — the consent log records it.
export const LEGAL_VERSIONS = {
  terminos:     { version: '2026-08-01', label: 'agosto de 2026' },
  privacidad:   { version: '2026-08-01', label: 'agosto de 2026' },
  desistimiento:{ version: '2026-08-01', label: 'agosto de 2026' },
  aviso:        { version: '2026-08-01', label: 'agosto de 2026' },
} as const
