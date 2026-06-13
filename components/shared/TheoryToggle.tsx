'use client'

import { useState } from 'react'
import { BookOpenText, ChevronDown } from 'lucide-react'
import MathMarkdown from './MathMarkdown'

export default function TheoryToggle({
  theory,
  components,
}: {
  theory?: string | null
  components?: Record<string, any>
}) {
  const [isOpen, setIsOpen] = useState(false)
  const cleanTheory = theory?.trim() ?? ''

  if (!cleanTheory) return null

  return (
    <div className="mt-4 border-t border-blue-100 pt-4">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        title={isOpen ? 'Ocultar teoría de este ejercicio' : 'Ver teoría de este ejercicio'}
        className="ml-auto flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <BookOpenText className="h-4 w-4" aria-hidden="true" />
        {isOpen ? 'Ocultar teoría' : 'T Teoría'}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div className="mt-3 rounded-md border border-blue-200 bg-blue-50/70 p-4 text-slate-800">
          <div className="mb-3 flex items-center gap-2 text-sm font-bold text-blue-800">
            <BookOpenText className="h-4 w-4" aria-hidden="true" />
            Teoría del ejercicio
          </div>
          <MathMarkdown text={cleanTheory} format={false} components={components} />
        </div>
      )}
    </div>
  )
}
