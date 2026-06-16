"use client"

import { type RefObject, useCallback } from "react"
import { Bold, Italic } from "lucide-react"

interface FormatToolbarProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
  accentColor?: string
  softColor?: string
}

function isWrappedWith(text: string, start: number, end: number, marker: string) {
  const mLen = marker.length
  return (
    text.slice(start - mLen, start) === marker &&
    text.slice(end, end + mLen) === marker
  )
}

export default function FormatToolbar({
  textareaRef,
  value,
  onChange,
  accentColor = "#2563eb",
  softColor = "#dbeafe",
}: FormatToolbarProps) {
  const applyFormat = useCallback(
    (marker: string) => {
      const ta = textareaRef.current
      if (!ta) return

      const start = ta.selectionStart
      const end = ta.selectionEnd
      const mLen = marker.length
      const selected = value.slice(start, end)

      let newValue: string
      let newStart: number
      let newEnd: number

      if (isWrappedWith(value, start, end, marker)) {
        // Unwrap
        newValue =
          value.slice(0, start - mLen) + selected + value.slice(end + mLen)
        newStart = start - mLen
        newEnd = end - mLen
      } else if (selected) {
        // Wrap selection
        newValue =
          value.slice(0, start) + marker + selected + marker + value.slice(end)
        newStart = start
        newEnd = end + mLen * 2
      } else {
        // No selection → insert markers and place cursor between them
        newValue = value.slice(0, start) + marker + marker + value.slice(start)
        newStart = start + mLen
        newEnd = start + mLen
      }

      onChange(newValue)
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(newStart, newEnd)
      })
    },
    [textareaRef, value, onChange]
  )

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
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = softColor
    e.currentTarget.style.color = accentColor
  }
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "transparent"
    e.currentTarget.style.color = "#64748b"
  }

  return (
    <div
      style={{
        display: "flex",
        gap: 2,
        padding: "4px 6px",
        background: "#f8fafc",
        borderRadius: "10px 10px 0 0",
        borderBottom: "1px solid #e2e8f0",
        borderTop: "1.5px solid #e2e8f0",
        borderLeft: "1.5px solid #e2e8f0",
        borderRight: "1.5px solid #e2e8f0",
      }}
    >
      <button
        type="button"
        title="Negrita (selecciona texto y pulsa)"
        style={btnBase}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => {
          e.preventDefault() // keep textarea focus + selection
          applyFormat("**")
        }}
      >
        <Bold size={14} strokeWidth={2.5} />
      </button>
      <button
        type="button"
        title="Cursiva (selecciona texto y pulsa)"
        style={{ ...btnBase, fontStyle: "italic" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={(e) => {
          e.preventDefault()
          applyFormat("*")
        }}
      >
        <Italic size={14} strokeWidth={2} />
      </button>
    </div>
  )
}
