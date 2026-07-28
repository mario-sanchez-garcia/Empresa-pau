"use client"

import { useRef, useState, useCallback } from "react"
import MathAnswerToolbar from "@/components/shared/MathAnswerToolbar"
import MathMarkdown from "@/components/shared/MathMarkdown"

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
      // Place cursor at end
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
            // Hide visually when showing the rendered view, but keep mounted
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
            <MathMarkdown text={value} format="raw" />
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
