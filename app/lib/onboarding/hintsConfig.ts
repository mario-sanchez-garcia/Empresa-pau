// Update HINTS_CUTOFF_DATE to control who sees the discovery hints.
// Users who registered BEFORE this date are treated as legacy — all hints
// are pre-marked as seen so they don't get bombarded on deploy day.
//
// Set to a date before your earliest real user to protect them.
// Move it forward (e.g. to tomorrow) to test with a fresh account and
// still have existing users protected, or backward to let more accounts
// through during development.
export const HINTS_CUTOFF_DATE = '2026-07-01T00:00:00Z'

export const VALID_HINT_KEYS = [
  'kairo_map_seen',   // Mapa de Kairo — after first correction
  'hint_simulacros',  // First visit to Simulacros
  'hint_examenes',    // First visit to Exámenes
  'hint_zona',        // First visit to La Zona
  'hint_zona_cursos', // First visit to La Zona → Mis Cursos
  'hint_tutor',       // First visit to Tutor/Chat
  'hint_historial',   // First visit to Historial
] as const

export type HintKey = typeof VALID_HINT_KEYS[number]
