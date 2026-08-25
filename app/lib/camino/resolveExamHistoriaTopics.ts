import type { SupabaseClient } from '@supabase/supabase-js'

// Server-side (service role) resolver for "which curriculum_topics.topic_slug
// should this Historia exam's Simulacro/Prep. parcial be filtered by":
//   - 'parcial' (default, and any exam without exam_topics rows): the fixed
//     topic_id set the student picked with the chip selector.
//   - 'global': no fixed set — every topic the student has ever completed
//     in camino_calendar for historia_espana, resolved fresh each time this
//     is called (so it can grow between one generation and the next, unlike
//     'parcial').
// Returns undefined (not []) when there's nothing to filter by, so callers
// can fall through to their existing non-topic-aware behavior unchanged.

export async function resolveExamHistoriaTopics(
  db: SupabaseClient,
  userId: string,
  examId: string,
  examScope: 'parcial' | 'global' | undefined,
): Promise<string[] | undefined> {
  if (examScope === 'global') {
    const { data: completedRows } = await db
      .from('camino_calendar')
      .select('title')
      .eq('user_id', userId)
      .eq('subject', 'historia_espana')
      .eq('status', 'completed')
    const titles = [...new Set((completedRows ?? []).map(r => r.title).filter((t): t is string => typeof t === 'string' && t.length > 0))]
    if (titles.length === 0) return undefined
    const { data: topicRows } = await db
      .from('curriculum_topics')
      .select('topic_slug')
      .eq('subject', 'historia_espana')
      .in('title', titles)
    const slugs = (topicRows ?? []).map(r => r.topic_slug).filter((s): s is string => typeof s === 'string')
    return slugs.length > 0 ? slugs : undefined
  }

  // 'parcial' (or scope unset — older Parciales saved before examScope existed).
  const { data: examTopicRows } = await db.from('exam_topics').select('topic_id').eq('exam_id', examId)
  const topicIds = (examTopicRows ?? []).map(r => r.topic_id).filter((id): id is string => typeof id === 'string')
  if (topicIds.length === 0) return undefined
  const { data: topicRows } = await db.from('curriculum_topics').select('topic_slug').in('id', topicIds)
  const slugs = (topicRows ?? []).map(r => r.topic_slug).filter((s): s is string => typeof s === 'string')
  return slugs.length > 0 ? slugs : undefined
}
