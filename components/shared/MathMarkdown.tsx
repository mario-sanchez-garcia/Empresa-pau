import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { formatExamText } from '@/app/lib/mathFormatting'

const mdComponents = {
  p: ({ children }: any) => <p className="my-2 leading-8 text-slate-700">{children}</p>,
  li: ({ children }: any) => <li className="my-1 leading-8 text-slate-700">{children}</li>,
  strong: ({ children }: any) => <strong className="font-black text-slate-950">{children}</strong>,
  blockquote: ({ children }: any) => <blockquote className="my-4 rounded-xl border-l-4 border-slate-300 bg-white/70 p-4 text-slate-600">{children}</blockquote>,
}

export default function MathMarkdown({ text, className = '', format = true }: { text?: string | null; className?: string; format?: boolean }) {
  return (
    <div className={`math-markdown max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={mdComponents}
      >
        {format ? formatExamText(text) : text ?? ''}
      </ReactMarkdown>
    </div>
  )
}
