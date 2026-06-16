'use client'

import { correctionPayloadToMarkdown } from '@/app/lib/correctionParsing'
import { splitWhyExplanationMarkdown } from '@/app/lib/whyExplanation'
import MathMarkdown from './MathMarkdown'
import WhyExplanation from './WhyExplanation'

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
  const { main, why } = splitWhyExplanationMarkdown(markdown)

  return (
    <div className={className}>
      <MathMarkdown text={main} format={false} components={components} />
      <WhyExplanation markdown={why} components={components} />
    </div>
  )
}
