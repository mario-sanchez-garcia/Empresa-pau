'use client'

import type { Components } from 'react-markdown'
import { sanitizeCorrectionDisplayText } from '@/app/lib/correctionBlockValidation'
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
  components?: Partial<Components>
  isStreaming?: boolean
}) {
  const markdown = sanitizeCorrectionDisplayText(correctionPayloadToMarkdown(correction, { officialMaxScore }))
  const { main, why } = splitWhyExplanationMarkdown(markdown)

  return (
    <div className={className}>
      {/* pau-stagger: each section (heading, paragraph, list...) eases in in
          sequence instead of the whole correction appearing at once. Skipped
          while isStreaming, where content is still arriving token by token. */}
      <MathMarkdown text={main} format={false} components={components} isStreaming={isStreaming} className={isStreaming ? '' : 'pau-stagger'} />
      {!isStreaming && <WhyExplanation markdown={why} components={components} />}
    </div>
  )
}
