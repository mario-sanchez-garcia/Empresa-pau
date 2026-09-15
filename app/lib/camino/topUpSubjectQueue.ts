import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'

import { isPrivateBetaSubject } from './betaCurriculum'
import { CAMINO_CURRICULUM_TOPICS, normalizeSubjectSlug, normalizeTopicSlug, resolveTopicSlugAlias, sanitizeLessonTitle } from './caminoCurriculumPlan'
import { isCcssBlockCoveredByMatesII } from './mathOverlap'

// Repara la cola de un alumno cuando `curriculum_content_v2` publica más
// temario del que su cola ya tiene sembrado.
//
// El caso reproducido (15/09/2026): la cola se siembra UNA vez, la primera
// que `generateCaminoPlan`/`add-subject` la ven vacía para esa asignatura —
// y si en ese momento el catálogo real todavía no tenía filas publicadas,
// cae al respaldo de `betaCurriculum.ts` (PRIVATE_BETA_CURRICULUM_TOPICS,
// unos pocos temas de relleno por asignatura). Publicar el temario real
// DESPUÉS no repara nada: `subjectsWithQueue`/`add-subject` solo miran si
// la cola existe, no si está completa, así que la asignatura se queda en el
// relleno para siempre. matematicas_ccss: 4 de 5 alumnos atrapados en 6
// temas de relleno mientras el catálogo real tenía 43 filas publicadas.
//
// Por eso esto es SOLO ADITIVO. Nunca borra ni reescribe una fila existente
// —completada, en curso o del propio relleno—: añade lo que falte del
// catálogo real al final de la cola. Un alumno que venía del relleno ve ese
// puñado de temas seguido del temario real; no es la ordenación ideal, pero
// es la única que no arriesga el progreso de nadie.
//
// La identidad usada para "esto ya está en su cola" es el TÍTULO
// normalizado, no la posición numérica: `v2_sort_order` del catálogo real
// (curriculum_content_v2.sort_order) y el de PRIVATE_BETA_CURRICULUM_TOPICS
// (su `orderIndex`) son dos numeraciones independientes que arrancan las dos
// en 1 — comparar por número haría que el relleno "tapara" temas reales con
// la misma posición sin ser el mismo tema. El título es la misma identidad
// que ya usan las migraciones de backfill de topic_id de este repo
// ("se emparejan por coincidencia exacta de título").

type CatalogRow = {
  id: number
  sort_order: number
  title: string
  block_key: string | null
  block_slug: string | null
  subject: string
}

type ExistingQueueRow = {
  title: string | null
  subject_position: number | null
}

function topicMetaFor(subject: string, sortOrder: number, title: string, blockSlug: string | null) {
  const topic = CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject && candidate.v2SortOrder === sortOrder,
  ) ?? CAMINO_CURRICULUM_TOPICS.find(candidate =>
    candidate.subject === subject && normalizeTopicSlug(candidate.title) === normalizeTopicSlug(title),
  )
  const resolvedBlockSlug = blockSlug ?? topic?.blockSlug ?? null
  const rawTopicSlug = topic?.topicSlug ?? normalizeTopicSlug(title)
  return {
    blockSlug: resolvedBlockSlug,
    topicSlug: resolvedBlockSlug ? resolveTopicSlugAlias(subject, resolvedBlockSlug, rawTopicSlug) : normalizeTopicSlug(rawTopicSlug),
  }
}

/** Completa la cola de UNA asignatura con el temario publicado que le falte. */
export async function topUpSubjectQueue(
  userId: string,
  subject: string,
  db: SupabaseClient,
): Promise<{ added: number }> {
  const normalized = normalizeSubjectSlug(subject)
  if (!isPrivateBetaSubject(normalized)) return { added: 0 }

  const { data: catalog, error: catalogError } = await db
    .from('curriculum_content_v2')
    .select('id, sort_order, title, block_key, block_slug, subject')
    .eq('subject', normalized)
    .eq('review_status', 'published')
    .order('sort_order', { ascending: true })
  if (catalogError) throw new Error(`Catalog read: ${catalogError.message}`)
  const catalogRows = (catalog ?? []) as CatalogRow[]
  if (catalogRows.length === 0) return { added: 0 }

  const { data: existing, error: existingError } = await db
    .from('user_learning_queue')
    .select('title, subject_position')
    .eq('user_id', userId)
    .eq('subject', normalized)
  if (existingError) throw new Error(`Queue read: ${existingError.message}`)
  const existingRows = (existing ?? []) as ExistingQueueRow[]
  if (existingRows.length === 0) return { added: 0 } // no ha elegido esta asignatura, no hay nada que completar

  const existingTitles = new Set(existingRows.map(row => normalizeTopicSlug(row.title)))
  let missing = catalogRows.filter(row => !existingTitles.has(normalizeTopicSlug(row.title)))

  // Reponer CCSS no debe devolver el solape con Mates II que
  // generateCaminoPlan/add-subject ya evitaron sembrar — ver mathOverlap.ts.
  if (normalized === 'matematicas_ccss') {
    const { count: hasMatesII } = await db
      .from('user_learning_queue')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('subject', 'matematicas_ii')
    if (hasMatesII && hasMatesII > 0) {
      missing = missing.filter(row => !isCcssBlockCoveredByMatesII(row.block_slug))
    }
  }
  if (missing.length === 0) return { added: 0 }

  let cursor = existingRows.reduce((max, row) => Math.max(max, row.subject_position ?? 0), 0)
  const rows = missing.map(item => {
    const topicMeta = topicMetaFor(normalized, item.sort_order, item.title, item.block_slug)
    cursor += 1
    return {
      user_id: userId,
      subject: normalized,
      block_key: item.block_key,
      block_slug: topicMeta.blockSlug,
      v2_sort_order: item.sort_order,
      title: sanitizeLessonTitle(item.title),
      subject_position: cursor,
      queue_status: 'pending' as const,
      metadata: { mission_type: 'concept', topic_slug: topicMeta.topicSlug, topped_up: true },
    }
  })
  for (let i = 0; i < rows.length; i += 100) {
    const { error } = await db.from('user_learning_queue').insert(rows.slice(i, i + 100))
    if (error) throw new Error(`Queue insert: ${error.message}`)
  }
  return { added: rows.length }
}

/**
 * Completa la cola de TODAS las asignaturas que el alumno ya tiene en
 * `user_learning_queue`. Las descubre de ahí mismo en vez de en
 * `perfiles.subjects` — esa columna quedó vacía para cuentas que
 * completaron el onboarding antes de que existiera (ver add-subject/route.ts)
 * y no es la fuente de verdad de qué asignaturas tienen cola.
 */
export async function topUpQueues(
  userId: string,
  db: SupabaseClient,
): Promise<{ added: number; bySubject: Record<string, number> }> {
  const { data, error } = await db.from('user_learning_queue').select('subject').eq('user_id', userId)
  if (error) throw new Error(`Subjects read: ${error.message}`)
  const subjects = [...new Set((data ?? []).map(row => row.subject as string))]

  const bySubject: Record<string, number> = {}
  let added = 0
  for (const subject of subjects) {
    const result = await topUpSubjectQueue(userId, subject, db)
    if (result.added > 0) {
      bySubject[subject] = result.added
      added += result.added
    }
  }
  return { added, bySubject }
}
