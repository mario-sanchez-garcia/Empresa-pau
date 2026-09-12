// Las decisiones manuales y el trabajo terminado no pertenecen al replanificador.
export function canRepositionAutomatically(row: {
  source?: string | null; status?: string; locked?: boolean | null; metadata?: Record<string, unknown> | null
}): boolean {
  const meta = row.metadata ?? {}
  return (row.source === 'algorithm' || row.source === 'partial')
    && ['pending', 'postponed', 'unscheduled'].includes(row.status ?? '')
    && !row.locked && !meta.manual_editor
    && !['calendar_editor', 'kairo_chat'].includes(String(meta.action_source ?? ''))
}
