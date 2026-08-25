'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type CurriculumTopicRow = {
  id: string
  block_key: string
  block_title: string
  topic_slug: string
  title: string
  order: number
}

type Block = { blockKey: string; blockTitle: string; topics: CurriculumTopicRow[] }

// curriculum_topics.order is a per-source sequential index, not a single
// chronological scale — a handful of blocks mix a low-numbered row from the
// old beta seed with the bulk of their rows in the high-numbered main seed
// (e.g. "Restauración" has one topic at order 6 and nine more at 71-80).
// Sorting blocks by their own minimum order would put those blocks wildly
// out of place; the median is robust to that one outlier without having to
// hardcode which blocks are affected.
function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function groupByBlock(rows: CurriculumTopicRow[]): Block[] {
  const byKey = new Map<string, Block>()
  for (const row of rows) {
    let block = byKey.get(row.block_key)
    if (!block) {
      block = { blockKey: row.block_key, blockTitle: row.block_title, topics: [] }
      byKey.set(row.block_key, block)
    }
    block.topics.push(row)
  }
  const blocks = [...byKey.values()]
  for (const block of blocks) block.topics.sort((a, b) => a.order - b.order)
  blocks.sort((a, b) => median(a.topics.map(t => t.order)) - median(b.topics.map(t => t.order)))
  return blocks
}

// Same normalization family used elsewhere for free-text block matching
// (blockNormalization.ts, injectPartialExamMissions.ts's toSlug) — here also
// strips a leading article, since curriculum_topics.block_title and the exam
// modal's BLOQUE dropdown both use titles like "La Guerra Civil" while a
// student's free-typed/legacy exam.block often reads just "Guerra Civil".
function normalizeBlockText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/^(la|el|los|las)\s+/, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Controlled multi-select: the alumno puede elegir varios temas de varios
// bloques a la vez para un mismo Parcial de Historia. `selectedIds` son
// curriculum_topics.id (uuid) — el padre es quien decide qué hacer con ellos
// (guardarlos en exam_topics al crear/editar el Parcial).
export default function HistoriaTopicChips({
  selectedIds,
  onChange,
  blockFilter,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  /** Display block title (e.g. draft.block from the exam modal's BLOQUE field) to restrict the chips to. Empty/undefined shows every block. */
  blockFilter?: string
}) {
  const [allBlocks, setAllBlocks] = useState<Block[] | null>(null)
  const [topicsWithExercises, setTopicsWithExercises] = useState<Set<string> | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    Promise.all([
      supabase
        .from('curriculum_topics')
        .select('id, block_key, block_title, topic_slug, title, order')
        .eq('subject', 'historia_espana'),
      fetch('/api/parciales/historia-topics-with-exercises').then(res => res.json()).catch(() => null),
    ]).then(([topicsResult, exercisesResult]) => {
      if (cancelled) return
      if (topicsResult.error || !topicsResult.data) {
        setError('No hemos podido cargar los temas de Historia. Inténtalo de nuevo.')
        return
      }
      setAllBlocks(groupByBlock(topicsResult.data as CurriculumTopicRow[]))
      const slugs = Array.isArray(exercisesResult?.topicSlugs) ? exercisesResult.topicSlugs as string[] : null
      setTopicsWithExercises(slugs ? new Set(slugs) : new Set())
    })
    return () => { cancelled = true }
  }, [])

  // Changing the bloque above after already picking chips would otherwise
  // leave selectedIds pointing at topic_ids from a block the student no
  // longer has selected — reset so exam_topics only ever reflects the
  // currently visible (and currently chosen) block's topics.
  const prevBlockFilter = useRef(blockFilter)
  useEffect(() => {
    if (prevBlockFilter.current !== blockFilter) {
      prevBlockFilter.current = blockFilter
      if (selectedIds.length > 0) onChange([])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockFilter])

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  if (error) return <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{error}</p>
  if (!allBlocks || !topicsWithExercises) return <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Cargando temas…</p>

  const normalizedFilter = blockFilter ? normalizeBlockText(blockFilter) : ''
  const blocks = allBlocks
    .map(block => ({ ...block, topics: block.topics.filter(t => topicsWithExercises.has(t.topic_slug)) }))
    .filter(block => block.topics.length > 0)
    .filter(block => !normalizedFilter || normalizeBlockText(block.blockTitle) === normalizedFilter)

  if (blocks.length === 0) {
    return (
      <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
        No hay temas con ejercicios disponibles para este bloque todavía. Elige otro bloque.
      </p>
    )
  }

  return (
    <div style={{ display: 'grid', gap: 12, maxHeight: 260, overflowY: 'auto', paddingRight: 2 }}>
      {blocks.map(block => (
        <div key={block.blockKey}>
          <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8' }}>
            {block.blockTitle}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {block.topics.map(topic => {
              const active = selectedIds.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => toggle(topic.id)}
                  aria-pressed={active}
                  style={{
                    borderRadius: 999,
                    border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                    background: active ? '#2563eb' : '#fafbfc',
                    color: active ? '#fff' : '#475569',
                    fontSize: 11,
                    fontWeight: 800,
                    padding: '6px 12px',
                    cursor: 'pointer',
                    transition: 'all 120ms',
                  }}
                >
                  {topic.title}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
