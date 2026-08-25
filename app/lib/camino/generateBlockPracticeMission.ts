import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { createDayScheduler, estimatedMinutesForMissionType } from './scheduleTimeSlot'
import { getMadridToday, getStudyDays } from './studyDays'

const HISTORIA_SUBJECT = 'historia_espana'

// Cuando el alumno completa el ÚLTIMO tema fino de Curso de un bloque de
// Historia (todas sus lecciones en 'completed'), genera automáticamente UNA
// misión de "ejercicios de bloque" que combina práctica de todos sus temas
// — sin depender de que exista ningún examen/Parcial; es una recompensa
// automática por terminar el bloque, no una preparación de examen.
//
// mission_type='pau_practice' y source='algorithm' ya están permitidos por
// camino_calendar_mission_type_check/camino_calendar_source_check, y
// 'pau_practice' ya tiene XP definido en xpMap.ts — cero migración de
// esquema necesaria.
//
// El denominador se calcula sobre curriculum_content_v2.block_slug (los 14
// bloques finos reales con teoría), nunca sobre curriculum_topics.block_key
// — ese último mezcla algunos temas genéricos de betaCurriculum.ts con los
// finos bajo la misma clave (p. ej. "restauracion"), y el genérico nunca
// tiene lección de Curso, así que el bloque no llegaría nunca a "completo"
// si se contara por ahí.
export async function maybeGenerateBlockPracticeMission(
  db: SupabaseClient,
  userId: string,
  subject: string,
  v2SortOrder: number | null,
): Promise<void> {
  if (subject !== HISTORIA_SUBJECT || v2SortOrder == null) return

  const { data: completedRow } = await db
    .from('curriculum_content_v2')
    .select('block_slug, block_key')
    .eq('subject', HISTORIA_SUBJECT)
    .eq('sort_order', v2SortOrder)
    .maybeSingle()
  const blockSlug = completedRow?.block_slug as string | undefined
  const blockKey = completedRow?.block_key as string | undefined
  if (!blockSlug) return

  const { data: blockRows } = await db
    .from('curriculum_content_v2')
    .select('sort_order, topic_id')
    .eq('subject', HISTORIA_SUBJECT)
    .eq('block_slug', blockSlug)
    .not('topic_id', 'is', null)
  const denominator = blockRows ?? []
  if (denominator.length === 0) return

  const sortOrders = denominator.map(r => r.sort_order as number)
  const { data: completedRows } = await db
    .from('camino_calendar')
    .select('v2_sort_order')
    .eq('user_id', userId)
    .eq('subject', HISTORIA_SUBJECT)
    .eq('status', 'completed')
    .in('v2_sort_order', sortOrders)

  const completedSortOrders = new Set((completedRows ?? []).map(r => r.v2_sort_order as number))
  if (completedSortOrders.size < denominator.length) return // bloque todavía no completo del todo

  // Dedup — mismo patrón que injectPartialExamMissions.ts: comprobar antes
  // de insertar filtrando por una clave propia en metadata, no un UNIQUE de
  // BD (no existe una columna natural de "un bloque" en camino_calendar).
  const { data: existing } = await db
    .from('camino_calendar')
    .select('id')
    .eq('user_id', userId)
    .eq('subject', HISTORIA_SUBJECT)
    .eq('metadata->>block_practice_for', blockSlug)
    .limit(1)
    .maybeSingle()
  if (existing) return

  const topicIds = denominator.map(r => r.topic_id as string).filter(Boolean)
  const { data: topicRows } = await db
    .from('curriculum_topics')
    .select('topic_slug')
    .in('id', topicIds)
  const topicSlugs = (topicRows ?? []).map(r => r.topic_slug as string).filter(Boolean)
  if (topicSlugs.length === 0) return

  const today = getMadridToday()
  const candidateDays = getStudyDays(today, 14)
  for (const dateStr of candidateDays) {
    const scheduler = await createDayScheduler(userId, db, dateStr)
    const timeSlot = scheduler.place(estimatedMinutesForMissionType('pau_practice'))
    if (!timeSlot) continue // día sin hueco libre — se prueba el siguiente

    await db.from('camino_calendar').insert({
      user_id: userId,
      scheduled_date: dateStr,
      subject: HISTORIA_SUBJECT,
      v2_sort_order: null, // misión agregada de varios temas, no de uno solo
      title: `Ejercicios de bloque: ${blockKey ?? blockSlug}`,
      block_key: blockKey ?? null,
      block_slug: blockSlug,
      mission_type: 'pau_practice',
      is_main: true,
      is_bonus: false,
      status: 'pending',
      source: 'algorithm',
      generated_by: 'block_practice_v1',
      start_time: timeSlot.start,
      end_time: timeSlot.end,
      metadata: {
        block_practice_for: blockSlug,
        topicSlugs,
        simulacro_subject: 'historia',
      },
    })
    return
  }
  // Sin hueco libre en los próximos 14 días — best-effort, se deja sin
  // generar (mismo comportamiento que el resto de scheduler-based
  // injectors ante un calendario lleno).
}
