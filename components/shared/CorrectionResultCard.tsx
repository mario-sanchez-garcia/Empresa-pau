'use client'

import { correctionPayloadToMarkdown, splitCorrectionTheory } from '@/app/lib/correctionParsing'
import MathMarkdown from './MathMarkdown'
import TheoryToggle from './TheoryToggle'

export default function CorrectionResultCard({
  correction,
  officialMaxScore,
  className = '',
  components,
}: {
  correction: unknown
  officialMaxScore?: number
  className?: string
  components?: Record<string, any>
}) {
  const markdown = correctionPayloadToMarkdown(correction, { officialMaxScore })
  const { correction: mainCorrection, theory } = splitCorrectionTheory(markdown)

  return (
    <div className={className}>
      <MathMarkdown text={mainCorrection} format={false} components={components} />
      <TheoryToggle theory={theory} components={components} />
    </div>
  )
}
