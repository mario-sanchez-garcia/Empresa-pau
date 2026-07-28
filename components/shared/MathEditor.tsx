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

// Character-by-character scanner — handles adjacent $A$$B$ correctly.
// When previous char was $, current $ is a new inline block, NOT display math.
function renderLatexSegments(text: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  let i = 0
  let buf = ""
  let key = 0

  function flushText() {
    if (!buf) return
    buf.split("\n").forEach((line, li) => {
      if (li > 0) nodes.push(<br key={key++} />)
      if (line) nodes.push(<span key={key++}>{line}</span>)
    })
    buf = ""
  }

  function pushMath(math: string, display: boolean) {
    try {
      const html = katex.renderToString(math, { throwOnError: false, displayMode: display })
      if (display) {
        nodes.push(<span key={key++} dangerouslySetInnerHTML={{ __html: html }} style={{ display: "block", overflowX: "auto", margin: "4px 0" }} />)
      } else {
        nodes.push(<span key={key++} dangerouslySetInnerHTML={{ __html: html }} />)
      }
    } catch {
      nodes.push(<span key={key++} style={{ color: "#e11d48" }}>{display ? `$$${math}$$` : `$${math}$`}</span>)
    }
  }

  while (i < text.length) {
    if (text[i] !== "$") {
      buf += text[i++]
      continue
    }

    const prevWasDollar = i > 0 && text[i - 1] === "$"
    const nextIsDollar = text[i + 1] === "$"

    if (nextIsDollar && !prevWasDollar) {
      const close = text.indexOf("$$", i + 2)
      if (close !== -1) {
        flushText()
        pushMath(text.slice(i + 2, close).trim(), true)
        i = close + 2
        continue
      }
    }

    let j = i + 1
    while (j < text.length && text[j] !== "$") j++

    if (j < text.length && j > i + 1) {
      flushText()
      pushMath(text.slice(i + 1, j), false)
      i = j + 1
      continue
    }

    buf += text[i++]
  }

  flushText()
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
  // Show rendered view whenever there's LaTeX — including while focused/typing.
  // The textarea becomes transparent (color: transparent, caret visible) so the
  // rendered view shows through. No more focus/blur toggle.
  const showRendered = hasContent && hasLatex

  const focusTextarea = useCallback(() => {
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
        {/* Rendered view — always visible when there's LaTeX, sits behind the textarea */}
        {showRendered && (
          <div
            onClick={focusTextarea}
            aria-hidden="true"
            style={{
              minHeight,
              width: "100%",
              borderRadius: "0 0 16px 16px",
              border: `1.5px solid ${focused ? accentColor : borderColor}`,
              borderTop: "none",
              padding: "14px 16px",
              background: focused ? "#fff" : "#f8fbff",
              color: "#0f172a",
              fontSize: 14,
              lineHeight: 1.85,
              fontFamily: "inherit",
              boxSizing: "border-box",
              boxShadow: focused ? `0 0 0 4px ${accentColor}14` : "none",
              transition: "border-color 150ms, box-shadow 150ms, background 150ms",
              wordBreak: "break-word" as const,
              whiteSpace: "pre-wrap" as const,
            }}
          >
            {renderLatexSegments(value)}
          </div>
        )}

        {/* Textarea — always mounted so toolbar can insert into it.
            When showRendered, it overlaps the rendered view but is fully transparent
            (only the caret is visible) so the user types into it but sees rendered below. */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={showRendered ? "" : placeholder}
          className={textareaClassName}
          style={{
            width: "100%",
            minHeight,
            resize: showRendered ? ("none" as const) : ("vertical" as const),
            borderRadius: "0 0 16px 16px",
            border: showRendered ? "none" : `1.5px solid ${focused ? accentColor : borderColor}`,
            borderTop: "none",
            padding: "14px 16px",
            fontSize: 14,
            lineHeight: 1.85,
            fontFamily: "inherit",
            outline: "none",
            transition: "border-color 150ms, box-shadow 150ms, background 150ms",
            // When rendered view is active: transparent text, only cursor visible
            color: showRendered ? "transparent" : "#0f172a",
            caretColor: accentColor,
            background: "transparent",
            boxShadow: showRendered ? "none" : (focused ? `0 0 0 4px ${accentColor}14` : "none"),
            // Stack on top of rendered view
            position: showRendered ? "absolute" : "relative",
            inset: showRendered ? 0 : undefined,
            zIndex: showRendered ? 2 : undefined,
            ...textareaStyle,
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </div>
    </div>
  )
}
