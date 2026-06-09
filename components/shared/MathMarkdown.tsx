'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { normalizeExamStatement } from '@/app/lib/mathFormatting'

const defaultComponents = {
  p: ({ children }: any) => <p className="my-3 leading-8 text-slate-700">{children}</p>,
  li: ({ children }: any) => <li className="my-2 leading-8 text-slate-700">{children}</li>,
  strong: ({ children }: any) => <strong className="font-black text-slate-950">{children}</strong>,
  blockquote: ({ children }: any) => <blockquote className="my-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-300 bg-white p-4 text-slate-600 shadow-sm">{children}</blockquote>,
}

export default function MathMarkdown({
  text,
  className = '',
  format = true,
  components,
}: {
  text?: string | null
  className?: string
  format?: boolean
  components?: Record<string, any>
}) {
  return (
    <div className={`math-markdown max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={components ?? defaultComponents}
      >
        {format ? normalizeExamStatement(text) : (text ?? '')}
      </ReactMarkdown>
    </div>
  )
}
