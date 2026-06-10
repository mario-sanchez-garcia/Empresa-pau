'use client'

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { normalizeExamStatement } from '@/app/lib/mathFormatting'

const defaultComponents = {
  h1: ({ children }: any) => <h1 className="mb-4 mt-7 text-2xl font-black text-slate-950">{children}</h1>,
  h2: ({ children }: any) => <h2 className="mb-3 mt-7 border-b border-slate-200 pb-2 text-xl font-black text-slate-950">{children}</h2>,
  h3: ({ children }: any) => <h3 className="mb-2 mt-6 text-base font-black text-blue-900">{children}</h3>,
  p: ({ children }: any) => <p className="my-3 leading-8 text-slate-700">{children}</p>,
  li: ({ children }: any) => <li className="my-2 leading-8 text-slate-700">{children}</li>,
  ul: ({ children }: any) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }: any) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
  strong: ({ children }: any) => <strong className="font-black text-slate-950">{children}</strong>,
  blockquote: ({ children }: any) => <blockquote className="my-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-300 bg-white p-4 text-slate-600 shadow-sm">{children}</blockquote>,
  table: ({ children }: any) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>,
  th: ({ children }: any) => <th className="border border-slate-200 bg-blue-50 px-3 py-2 text-left font-black text-blue-900">{children}</th>,
  td: ({ children }: any) => <td className="border border-slate-200 px-3 py-2 align-top text-slate-700">{children}</td>,
  code: ({ children }: any) => <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">{children}</code>,
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
        components={{ ...defaultComponents, ...(components ?? {}) }}
      >
        {normalizeExamStatement(text)}
      </ReactMarkdown>
    </div>
  )
}
