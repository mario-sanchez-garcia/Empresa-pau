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
  isStreaming = false,
}: {
  correction: unknown
  officialMaxScore?: number
  className?: string
  components?: Record<string, any>
  isStreaming?: boolean
}) {
  const markdown = correctionPayloadToMarkdown(correction, { officialMaxScore })
  const { main, why } = splitWhyExplanationMarkdown(markdown)

  return (
    <div className={className}>
      <MathMarkdown text={main} format={false} components={components} isStreaming={isStreaming} />
      {!isStreaming && <WhyExplanation markdown={why} components={components} />}
    </div>
  )
}
