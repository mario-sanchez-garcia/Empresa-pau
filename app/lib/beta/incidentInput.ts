export const REPORT_CATEGORIES = ['technical', 'content', 'confusing'] as const
/** Keep route shape; never capture tokens, query strings or student draft IDs. */
export function incidentRoute(value: unknown): string {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/unknown'
  return value.split(/[?#]/, 1)[0].slice(0, 180)
    .split('/').map(part => /^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(part) || /^\d+$/.test(part) ? '[id]' : part).join('/')
}
export function parseIncidentReport(body: unknown) {
  if (!body || typeof body !== 'object') return null
  const value = body as Record<string, unknown>
  if (!REPORT_CATEGORIES.includes(value.category as typeof REPORT_CATEGORIES[number])) return null
  if (typeof value.description !== 'string' || value.description.trim().length < 10 || value.description.length > 1500) return null
  if (typeof value.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(value.requestId)) return null
  return { category: String(value.category), description: value.description.trim(),
    route: incidentRoute(value.route), requestId: value.requestId, blocking: value.blocking === true }
}
