'use client'

import { useState } from 'react'
import { ChevronDown, Lightbulb } from 'lucide-react'
import type { Components } from 'react-markdown'
import MathMarkdown from './MathMarkdown'
import { type WhyExplanation, whyExplanationToMarkdown } from '@/app/lib/whyExplanation'

export default function WhyExplanation({
  explanation,
  markdown,
  components,
}: {
  explanation?: WhyExplanation | string | null
  markdown?: string | null
  components?: Partial<Components>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const structuredContent = whyExplanationToMarkdown(explanation)
  const content = (structuredContent || markdown?.trim() || '').trim()

  if (!content) return null

  return (
    <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--clay-border, #dbeafe)' }}>
      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        aria-expanded={isOpen}
        title={isOpen ? 'Ocultar explicación contextual' : 'Ver explicación contextual'}
        className="ml-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2"
        style={{
          border: '1px solid var(--clay-border, #bfdbfe)',
          background: 'var(--clay-surface, #fff)',
          color: 'var(--clay-accent-text, #1d4ed8)',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--clay-accent-soft, #eff6ff)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--clay-surface, #fff)' }}
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        ¿Por qué es así?
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          className="mt-3 rounded-md p-4"
          style={{
            border: '1px solid var(--clay-border, #bfdbfe)',
            background: 'var(--clay-accent-soft, rgba(239,246,255,.7))',
            color: 'var(--clay-text, #1e293b)',
          }}
        >
          <MathMarkdown text={content} format={false} components={components} />
        </div>
      )}
    </div>
  )
}
