'use client'

import { useEffect, useState } from 'react'
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

// Controlled multi-select: the alumno puede elegir varios temas de varios
// bloques a la vez para un mismo Parcial de Historia. `selectedIds` son
// curriculum_topics.id (uuid) — el padre es quien decide qué hacer con ellos
// (guardarlos en exam_topics al crear/editar el Parcial).
export default function HistoriaTopicChips({
  selectedIds,
  onChange,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
}) {
  const [blocks, setBlocks] = useState<Block[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    supabase
      .from('curriculum_topics')
      .select('id, block_key, block_title, topic_slug, title, order')
      .eq('subject', 'historia_espana')
      .then(({ data, error: fetchError }) => {
        if (cancelled) return
        if (fetchError || !data) {
          setError('No hemos podido cargar los temas de Historia. Inténtalo de nuevo.')
          return
        }
        setBlocks(groupByBlock(data as CurriculumTopicRow[]))
      })
    return () => { cancelled = true }
  }, [])

  function toggle(id: string) {
    onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id])
  }

  if (error) return <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{error}</p>
  if (!blocks) return <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8' }}>Cargando temas…</p>

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
