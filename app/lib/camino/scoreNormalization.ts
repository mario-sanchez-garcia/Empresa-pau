// Normaliza cualquier nota a una escala 0-10, sea cual sea la puntuación
// máxima real del ejercicio (2,5, 5, 1,25...). Mismo patrón que
// normalizedHistoryScore en app/page-client.tsx, extraído aquí para que el
// servidor (bonus de calidad de awardXp) y el cliente compartan la misma
// fórmula en vez de mantener dos copias que puedan divergir.
export function normalizeScoreToTen(nota: unknown, notaMaxima: unknown): number | null {
  const score = Number(nota)
  const max = Number(notaMaxima)
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null
  return Math.min(10, Math.max(0, (score / max) * 10))
}
