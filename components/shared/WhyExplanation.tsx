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
    <div className="mt-4 border-t border-blue-100 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen(current => !current)}
        aria-expanded={isOpen}
        title={isOpen ? 'Ocultar explicación contextual' : 'Ver explicación contextual'}
        className="ml-auto flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        ¿Por qué es así?
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/70 p-4 text-slate-800">
          <MathMarkdown text={content} format={false} components={components} />
        </div>
      )}
    </div>
  )
}
