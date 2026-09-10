"use client"

import { useRef, useEffect, useCallback } from "react"
import { Bold, Italic, Eye } from "lucide-react"
import MathAnswerToolbar from "@/components/shared/MathAnswerToolbar"
import { HAS_LATEX, renderLatexSegments } from "@/components/shared/renderLatexSegments"

interface RichTextAreaProps {
  value: string
  onChange: (text: string) => void
  placeholder?: string
  minHeight?: number | string
  accentColor?: string
  softColor?: string
  borderColor?: string
  className?: string
  style?: React.CSSProperties
  mathSubject?: string | null
}

export default function RichTextArea({
  value,
  onChange,
  placeholder = "Escribe tu respuesta...",
  minHeight = 180,
  accentColor = "#2563eb",
  softColor = "#dbeafe",
  borderColor = "#dbe7fb",
  className,
  style,
  mathSubject,
}: RichTextAreaProps) {
  const editorRef = useRef<HTMLDivElement>(null)

  // Keep the DOM-backed contentEditable synchronized with restored drafts and
  // programmatic resets. Typing remains uninterrupted because innerText already
  // equals value on normal onInput-driven renders.
  useEffect(() => {
    const el = editorRef.current
    if (!el) return
    if (el.innerText !== value) el.innerText = value
  }, [value])

  const applyFormat = useCallback(
    (command: "bold" | "italic") => {
      const el = editorRef.current
      if (!el) return
      el.focus()
      document.execCommand(command, false)
      onChange(el.innerText)
    },
    [onChange]
  )

  const handleInput = useCallback(() => {
    const el = editorRef.current
    if (el) onChange(el.innerText)
  }, [onChange])

  // Vista previa en vivo: reutiliza tal cual la función de renderizado de
  // MathEditor.tsx (ya en producción en Simulacros/Camino) — la caja de
  // escritura sigue mostrando el código fuente sin cambios, esto solo añade
  // un bloque de solo lectura debajo que muestra cómo se leería. Solo se
  // muestra cuando hay LaTeX de verdad, igual que MathEditor decide cuándo
  // mostrar su vista renderizada.
  const showPreview = HAS_LATEX.test(value)

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: 8,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#64748b",
    transition: "background 120ms ease, color 120ms ease",
    flexShrink: 0,
  }

  return (
    <div className={className} style={style}>
      <style>{`
        .pau-rich-editor:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          display: block;
        }
        .pau-rich-editor:focus { outline: none; }
        .pau-rich-editor b, .pau-rich-editor strong { font-weight: 700; }
        .pau-rich-editor i, .pau-rich-editor em { font-style: italic; }
      `}</style>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: "4px 6px",
          background: "#f8fafc",
          borderRadius: "10px 10px 0 0",
          border: `1.5px solid ${borderColor}`,
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <button
          type="button"
          title="Negrita"
          style={btnBase}
          onMouseDown={(e) => {
            e.preventDefault()
            applyFormat("bold")
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = softColor
            e.currentTarget.style.color = accentColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#64748b"
          }}
        >
          <Bold size={14} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          title="Cursiva"
          style={btnBase}
          onMouseDown={(e) => {
            e.preventDefault()
            applyFormat("italic")
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = softColor
            e.currentTarget.style.color = accentColor
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "#64748b"
          }}
        >
          <Italic size={14} strokeWidth={2} />
        </button>
      </div>

      <MathAnswerToolbar
        subject={mathSubject}
        value={value}
        onChange={onChange}
        editorRef={editorRef}
        accentColor={accentColor}
        softColor={softColor}
        borderColor={borderColor}
      />

      {/* Editable area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        className="pau-rich-editor"
        data-placeholder={placeholder}
        onInput={handleInput}
        style={{
          minHeight,
          width: "100%",
          borderRadius: "0 0 16px 16px",
          padding: "14px",
          fontSize: "14px",
          lineHeight: "1.7",
          border: `1.5px solid ${borderColor}`,
          borderTop: "1px solid #e2e8f0",
          background: "#fafafa",
          color: "#1f2937",
          resize: "vertical",
          overflow: "auto",
          fontFamily: "inherit",
          boxSizing: "border-box" as const,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = accentColor
          e.currentTarget.style.boxShadow = `0 0 0 3px ${accentColor}22`
          e.currentTarget.style.background = "#ffffff"
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = borderColor
          e.currentTarget.style.boxShadow = "none"
          e.currentTarget.style.background = "#fafafa"
        }}
      />

      {showPreview && (
        <div
          className="pau-rich-editor-preview"
          style={{
            marginTop: 10,
            borderRadius: 14,
            border: `1.5px dashed var(--clay-border, ${borderColor})`,
            background: "var(--clay-surface-raised, #f8fbff)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderBottom: `1px solid var(--clay-border, ${borderColor})`,
              color: "var(--clay-accent-text, #3b82f6)",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            <Eye size={12} strokeWidth={2.5} />
            Vista previa
          </div>
          <div
            aria-live="polite"
            style={{
              padding: "12px 14px",
              fontSize: 14,
              lineHeight: 1.85,
              color: "var(--clay-text, #0f172a)",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
            }}
          >
            {renderLatexSegments(value)}
          </div>
        </div>
      )}
    </div>
  )
}
