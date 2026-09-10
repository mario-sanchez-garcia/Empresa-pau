"use client"

import { useRef, useState, useCallback } from "react"
import MathAnswerToolbar from "@/components/shared/MathAnswerToolbar"
import { HAS_LATEX, renderLatexSegments } from "@/components/shared/renderLatexSegments"

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
  renderedViewStyle?: React.CSSProperties
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
  renderedViewStyle,
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
              borderTop: "none",
              borderRight: `1.5px solid ${focused ? accentColor : borderColor}`,
              borderBottom: `1.5px solid ${focused ? accentColor : borderColor}`,
              borderLeft: `1.5px solid ${focused ? accentColor : borderColor}`,
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
              ...renderedViewStyle,
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
            borderTop: "none",
            borderRight: showRendered ? "none" : `1.5px solid ${focused ? accentColor : borderColor}`,
            borderBottom: showRendered ? "none" : `1.5px solid ${focused ? accentColor : borderColor}`,
            borderLeft: showRendered ? "none" : `1.5px solid ${focused ? accentColor : borderColor}`,
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
