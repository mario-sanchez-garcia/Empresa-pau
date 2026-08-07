'use client'

import type { ReactNode } from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { normalizeExamStatement, normalizeCorrectionMarkdownForRender } from '@/app/lib/mathFormatting'

const defaultComponents: Partial<Components> = {
  h1: ({ children }: { children?: ReactNode }) => <h1 className="mb-4 mt-7 text-2xl font-black text-slate-950">{children}</h1>,
  h2: ({ children }: { children?: ReactNode }) => <h2 className="mb-3 mt-7 border-b border-slate-200 pb-2 text-xl font-black text-slate-950">{children}</h2>,
  h3: ({ children }: { children?: ReactNode }) => <h3 className="mb-2 mt-6 text-base font-black text-blue-900">{children}</h3>,
  p: ({ children }: { children?: ReactNode }) => <p className="my-3 leading-8 text-slate-700">{children}</p>,
  li: ({ children }: { children?: ReactNode }) => <li className="my-2 leading-8 text-slate-700">{children}</li>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="my-3 list-disc space-y-1 pl-6">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="my-3 list-decimal space-y-1 pl-6">{children}</ol>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-black text-slate-950">{children}</strong>,
  blockquote: ({ children }: { children?: ReactNode }) => <blockquote className="my-4 rounded-2xl border border-slate-200 border-l-4 border-l-blue-300 bg-white p-4 text-slate-600 shadow-sm">{children}</blockquote>,
  table: ({ children }: { children?: ReactNode }) => <div className="my-4 overflow-x-auto"><table className="w-full border-collapse text-sm">{children}</table></div>,
  th: ({ children }: { children?: ReactNode }) => <th className="border border-slate-200 bg-blue-50 px-3 py-2 text-left font-black text-blue-900">{children}</th>,
  td: ({ children }: { children?: ReactNode }) => <td className="border border-slate-200 px-3 py-2 align-top text-slate-700">{children}</td>,
  code: ({ children }: { children?: ReactNode }) => <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.9em] text-slate-800">{children}</code>,
  img: ({ src, alt }) => {
    const safeSrc = typeof src === 'string' ? src : undefined
    return (
      <span className="my-4 flex justify-center">
        <img
          src={safeSrc}
          alt={alt ?? 'Imagen oficial'}
          className="max-h-[240px] w-auto max-w-[min(100%,600px)] rounded-xl border border-slate-200 bg-white object-contain shadow-sm"
        />
      </span>
    )
  },
}

export default function MathMarkdown({
  text,
  className = '',
  format = true,
  components,
  isStreaming = false,
}: {
  text?: string | null
  className?: string
  // true → normalizeExamStatement (raw exam text)
  // false → normalizeCorrectionMarkdownForRender (raw AI correction text)
  // 'raw' → pass through as-is (already normalized)
  format?: boolean | 'raw'
  components?: Partial<Components>
  isStreaming?: boolean
}) {
  if (isStreaming) {
    // Streaming text arrives token by token, so it's frequently mid-formula
    // (e.g. an unclosed "$" or "\begin{cases}" with no "\end" yet). We still
    // want KaTeX active — strict:false + throwOnError:false means an
    // incomplete/invalid math span renders as a small inline error instead of
    // raw backslash text or a crash, and it self-corrects on the next chunk
    // once the delimiter closes. No normalization pass here on purpose: the
    // ~20-step regex pipeline is tuned for complete text and would be wasted
    // work re-run on every chunk — the model already emits $...$/$$...$$
    // per the prompt rules, which is enough for remark-math to pick up as
    // soon as a pair closes.
    return (
      <div className={`math-markdown max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, errorColor: '#64748b' }]]}
          components={{ ...defaultComponents, ...(components ?? {}) }}
        >
          {text ?? ''}
        </ReactMarkdown>
      </div>
    )
  }

  const normalized =
    format === 'raw' ? (text ?? '') :
    format ? normalizeExamStatement(text) :
    normalizeCorrectionMarkdownForRender(text)

  return (
    <div className={`math-markdown max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false, errorColor: '#64748b' }]]}
        components={{ ...defaultComponents, ...(components ?? {}) }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  )
}
