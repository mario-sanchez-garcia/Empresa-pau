"use client"

import { useRef, useState, useCallback } from "react"
import katex from "katex"
import MathAnswerToolbar from "@/components/shared/MathAnswerToolbar"

interface MathEditorProps {
  subject?: string | null
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  accentColor?: string
  softColor?: string
  borderColor?: string
  textareaClassName?: string
  textareaStyle?: React.CSSProperties
}

const HAS_LATEX = /\$|\\\[|\\\(|\\begin\{/

// Render a string containing $...$ and $$...$$ into an array of React-renderable HTML spans.
// Bypasses remark-math entirely to avoid the $$ adjacency parsing bug.
function renderLatexSegments(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  // Split on $$...$$ first (display math, usually contains newlines)
  const displayParts = text.split(/((?:\$\$)[\s\S]*?(?:\$\$))/)
  displayParts.forEach((seg, di) => {
    if (seg.startsWith("$$") && seg.endsWith("$$") && seg.length > 4) {
      const math = seg.slice(2, -2).trim()
      try {
        const html = katex.renderToString(math, { throwOnError: false, displayMode: true })
        nodes.push(<span key={`d${di}`} dangerouslySetInnerHTML={{ __html: html }} style={{ display: "block", overflowX: "auto" }} />)
      } catch {
        nodes.push(<span key={`d${di}`} style={{ color: "#e11d48" }}>{seg}</span>)
      }
      return
    }
    // Split remaining segment on $...$ (inline math)
    const inlineParts = seg.split(/(\$[^$\n]+?\$)/)
    inlineParts.forEach((part, ii) => {
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        const math = part.slice(1, -1)
        try {
          const html = katex.renderToString(math, { throwOnError: false, displayMode: false })
          nodes.push(<span key={`d${di}i${ii}`} dangerouslySetInnerHTML={{ __html: html }} />)
        } catch {
          nodes.push(<span key={`d${di}i${ii}`} style={{ color: "#e11d48" }}>{part}</span>)
        }
        return
      }
      if (!part) return
      // Plain text — preserve newlines
      part.split("\n").forEach((line, li) => {
        if (li > 0) nodes.push(<br key={`d${di}i${ii}br${li}`} />)
        if (line) nodes.push(<span key={`d${di}i${ii}l${li}`}>{line}</span>)
      })
    })
  })
  return nodes
}

export default function MathEditor({
  subject,
  value,
  onChange,
  placeholder = "Desarrolla tu respuesta paso a paso...",
  minHeight = 224,
  accentColor = "#2563eb",
  softColor = "#eff6ff",
  borderColor = "#dde8f8",
  textareaClassName,
  textareaStyle,
}: MathEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)

  const hasContent = value.trim().length > 0
  const hasLatex = HAS_LATEX.test(value)

  // Show rendered view only when blurred AND has LaTeX content
  const showRendered = !focused && hasContent && hasLatex

  const focusTextarea = useCallback(() => {
    setFocused(true)
    requestAnimationFrame(() => {
      const ta = textareaRef.current
      if (!ta) return
      ta.focus()
      ta.selectionStart = ta.selectionEnd = ta.value.length
    })
  }, [])

  return (
    <div>
      <MathAnswerToolbar
        subject={subject}
        value={value}
        onChange={onChange}
        textareaRef={textareaRef}
        accentColor={accentColor}
        softColor={softColor}
        borderColor={borderColor}
      />

      <div style={{ position: "relative" }}>
        {/* Raw textarea — always mounted so toolbar can insert into it */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={showRendered ? "" : placeholder}
          className={textareaClassName}
          style={{
            width: "100%",
            minHeight,
            resize: "vertical" as const,
            borderRadius: "0 0 16px 16px",
            border: `1.5px solid ${focused ? accentColor : borderColor}`,
            borderTop: "none",
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.85,
            fontFamily: "inherit",
            background: focused ? "#fff" : "#f8fbff",
            color: "#0f172a",
            outline: "none",
            boxShadow: focused ? `0 0 0 4px ${accentColor}14` : "none",
            transition: "border-color 150ms, box-shadow 150ms, background 150ms",
            opacity: showRendered ? 0 : 1,
            pointerEvents: showRendered ? "none" : "auto",
            position: showRendered ? "absolute" : "relative",
            inset: showRendered ? 0 : undefined,
            ...textareaStyle,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {/* Rendered LaTeX view — shown when blurred + has LaTeX */}
        {showRendered && (
          <div
            onClick={focusTextarea}
            title="Haz clic para editar"
            style={{
              minHeight,
              width: "100%",
              borderRadius: "0 0 16px 16px",
              border: `1.5px solid ${borderColor}`,
              borderTop: "none",
              padding: "14px 16px",
              background: "#f8fbff",
              cursor: "text",
              color: "#0f172a",
              fontSize: 14,
              lineHeight: 1.85,
              position: "relative",
            }}
          >
            <div style={{ lineHeight: 1.85 }}>
              {renderLatexSegments(value)}
            </div>
            <span
              style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: ".14em",
                textTransform: "uppercase" as const,
                color: accentColor,
                opacity: 0.5,
              }}
            >
              Haz clic para editar
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
