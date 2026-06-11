'use client'

import { correctionPayloadToMarkdown } from '@/app/lib/correctionParsing'
import MathMarkdown from './MathMarkdown'

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
  return (
    <MathMarkdown
      text={correctionPayloadToMarkdown(correction, { officialMaxScore })}
      format={false}
      className={className}
      components={components}
    />
  )
}
