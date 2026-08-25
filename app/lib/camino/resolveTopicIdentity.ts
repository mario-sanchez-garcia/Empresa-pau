import type { SupabaseClient } from '@supabase/supabase-js'

// v2_sort_order (curriculum_content_v2.sort_order) is the identity every
// caller of this module already stores/reads today — this only ADDS the
// real curriculum_topics.id next to it, never replaces it. For
// historia_espana, curriculum_content_v2.topic_id (migration
// 20260825220000) already links each sort_order to its curriculum_topics
// row (128/128 matched by exact title) — this just looks that up. Other
// subjects have no topic_id populated yet, so they always resolve
// topicId: null and keep working exactly as before.
export type TopicIdentity = {
  v2SortOrder: number | null
  topicId: string | null
}

export async function resolveTopicIdentity(
  db: SupabaseClient,
  subject: string,
  v2SortOrder: number | null | undefined,
): Promise<TopicIdentity> {
  if (v2SortOrder == null) return { v2SortOrder: null, topicId: null }
  if (subject !== 'historia_espana') return { v2SortOrder, topicId: null }

  const { data } = await db
    .from('curriculum_content_v2')
    .select('topic_id')
    .eq('subject', subject)
    .eq('sort_order', v2SortOrder)
    .maybeSingle()

  return { v2SortOrder, topicId: (data?.topic_id as string | null | undefined) ?? null }
}

// Batch variant — avoids one query per row when resolving a whole calendar
// generation pass (ensureCaminoCalendar iterates dozens of queue items per
// run). Returns a map keyed by v2_sort_order for historia_espana only;
// other subjects are never queried since they have no topic_id populated.
export async function resolveTopicIdentitiesBatch(
  db: SupabaseClient,
  subject: string,
  v2SortOrders: Array<number | null | undefined>,
): Promise<Map<number, string | null>> {
  const map = new Map<number, string | null>()
  if (subject !== 'historia_espana') return map
  const uniqueOrders = [...new Set(v2SortOrders.filter((n): n is number => n != null))]
  if (uniqueOrders.length === 0) return map

  const { data } = await db
    .from('curriculum_content_v2')
    .select('sort_order, topic_id')
    .eq('subject', subject)
    .in('sort_order', uniqueOrders)

  for (const row of data ?? []) {
    map.set(row.sort_order as number, (row.topic_id as string | null) ?? null)
  }
  return map
}
