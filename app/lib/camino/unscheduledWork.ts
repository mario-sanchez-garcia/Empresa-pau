export type UnscheduledRow = {
  id: string; queue_id: string | null; subject: string; v2_sort_order: number | null;
  metadata: Record<string, unknown> | null
}
export function summarizeUnscheduled(rows: readonly UnscheduledRow[], resolvedQueueIds: ReadonlySet<string>) {
  const seen = new Set<string>()
  const subjects = new Set<string>()
  const reasons = new Set<string>()
  for (const row of rows) {
    if (row.queue_id && resolvedQueueIds.has(row.queue_id)) continue
    const meta = row.metadata ?? {}
    const key = row.queue_id ?? (meta.partial_exam_id ? `${row.subject}:${meta.partial_exam_id}:${meta.partial_mission_type}`
      : meta.diagnostic_for ? `${row.subject}:diagnostic:${meta.diagnostic_for}`
      : `${row.subject}:${meta.topic_slug ?? row.v2_sort_order ?? row.id}`)
    seen.add(String(key))
    subjects.add(row.subject)
    if (typeof meta.unscheduled_reason === 'string') reasons.add(meta.unscheduled_reason)
  }
  return { topics: seen.size, subjects: [...subjects], reasons: [...reasons] }
}
