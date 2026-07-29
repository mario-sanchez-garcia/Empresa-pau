"use client"

import { useMemo, useState, type ReactNode } from "react"
import katex from "katex"

export type MathTemplateId = "limite" | "fraccion" | "potencia" | "raiz" | "integral" | "sistema"

export const MATH_TEMPLATES: Array<{ id: MathTemplateId; label: string }> = [
  { id: "limite", label: "Límite" },
  { id: "fraccion", label: "Fracción" },
  { id: "potencia", label: "Potencia" },
  { id: "raiz", label: "Raíz" },
  { id: "integral", label: "Integral" },
  { id: "sistema", label: "Sistema" },
]

interface FormProps {
  onInsert: (latex: string) => void
  onCancel: () => void
  accentColor: string
  borderColor: string
}

// Caja de relleno — el alumno solo escribe el valor, nunca el símbolo que la rodea.
function FillBox({ value, onChange, placeholder, small, wide, accentColor }: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  small?: boolean
  wide?: boolean
  accentColor: string
}) {
  const chars = wide ? 22 : Math.min(Math.max(value.length, placeholder.length, 2) + 1, 12)
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      aria-label={placeholder}
      style={{
        width: `${chars}ch`,
        fontSize: small ? 11 : 14,
        fontStyle: "italic",
        textAlign: "center",
        border: "none",
        borderBottom: `2px dashed ${accentColor}66`,
        background: "#fff",
        borderRadius: 4,
        padding: small ? "1px 3px" : "3px 6px",
        outline: "none",
        color: "#0f172a",
        fontFamily: "Georgia, 'Times New Roman', serif",
      }}
    />
  )
}

function renderPreview(latex: string): string {
  try {
    return katex.renderToString(latex, { throwOnError: false, displayMode: false })
  } catch {
    return ""
  }
}

function FormShell({ title, hint, children, preview, onInsert, onCancel, canInsert, accentColor, borderColor }: {
  title: string
  hint?: string
  children: ReactNode
  preview: string
  onInsert: () => void
  onCancel: () => void
  canInsert: boolean
  accentColor: string
  borderColor: string
}) {
  const html = useMemo(() => (preview ? renderPreview(preview) : ""), [preview])
  return (
    <div className="rounded-xl border bg-white p-3" style={{ borderColor }}>
      <p className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
        {title} — rellena solo los huecos{hint ? ` · ${hint}` : ""}
      </p>
      <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-3">{children}</div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-h-[22px] flex-1 text-sm text-slate-700">
          {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : <span className="text-slate-300">Vista previa…</span>}
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={onCancel} className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-slate-400 hover:bg-slate-100">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!canInsert}
            onMouseDown={e => e.preventDefault()}
            onClick={onInsert}
            className="rounded-lg px-3 py-1 text-[11px] font-black text-white disabled:opacity-40"
            style={{ background: accentColor }}
          >
            Insertar
          </button>
        </div>
      </div>
    </div>
  )
}

function LimiteForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [target, setTarget] = useState("")
  const [expr, setExpr] = useState("")
  const latex = `\\lim_{x \\to ${target || "a"}} ${expr || "f(x)"}`
  return (
    <FormShell title="Límite" preview={`$${latex}$`} onInsert={() => onInsert(`$${latex}$`)} onCancel={onCancel} canInsert={Boolean(target || expr)} accentColor={accentColor} borderColor={borderColor}>
      <div className="flex flex-col items-start leading-tight">
        <span className="text-sm italic text-slate-700">lim</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500">
          x → <FillBox value={target} onChange={setTarget} placeholder="a" small accentColor={accentColor} />
        </span>
      </div>
      <FillBox value={expr} onChange={setExpr} placeholder="f(x)" accentColor={accentColor} />
    </FormShell>
  )
}

function FraccionForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [num, setNum] = useState("")
  const [den, setDen] = useState("")
  const latex = `\\frac{${num || "\\,"}}{${den || "\\,"}}`
  return (
    <FormShell title="Fracción" preview={`$${latex}$`} onInsert={() => onInsert(`$${latex}$`)} onCancel={onCancel} canInsert={Boolean(num || den)} accentColor={accentColor} borderColor={borderColor}>
      <div className="flex flex-col items-stretch gap-1">
        <FillBox value={num} onChange={setNum} placeholder="numerador" accentColor={accentColor} />
        <div style={{ borderTop: "2px solid #0f172a" }} />
        <FillBox value={den} onChange={setDen} placeholder="denominador" accentColor={accentColor} />
      </div>
    </FormShell>
  )
}

function PotenciaForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [base, setBase] = useState("")
  const [exp, setExp] = useState("")
  const latex = `${base || "x"}^{${exp || "2"}}`
  return (
    <FormShell title="Potencia" preview={`$${latex}$`} onInsert={() => onInsert(`$${latex}$`)} onCancel={onCancel} canInsert={Boolean(base || exp)} accentColor={accentColor} borderColor={borderColor}>
      <div className="flex items-start gap-0.5">
        <FillBox value={base} onChange={setBase} placeholder="base" accentColor={accentColor} />
        <FillBox value={exp} onChange={setExp} placeholder="exp" small accentColor={accentColor} />
      </div>
    </FormShell>
  )
}

function RaizForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [index, setIndex] = useState("")
  const [radicand, setRadicand] = useState("")
  const latex = index ? `\\sqrt[${index}]{${radicand || "x"}}` : `\\sqrt{${radicand || "x"}}`
  return (
    <FormShell
      title="Raíz"
      hint="deja el índice vacío para raíz cuadrada"
      preview={`$${latex}$`}
      onInsert={() => onInsert(`$${latex}$`)}
      onCancel={onCancel}
      canInsert={Boolean(radicand || index)}
      accentColor={accentColor}
      borderColor={borderColor}
    >
      <div className="flex items-end gap-1">
        <FillBox value={index} onChange={setIndex} placeholder="índice" small accentColor={accentColor} />
        <span className="text-lg text-slate-700">√</span>
        <div style={{ borderTop: "2px solid #0f172a", paddingTop: 2 }}>
          <FillBox value={radicand} onChange={setRadicand} placeholder="expresión" accentColor={accentColor} />
        </div>
      </div>
    </FormShell>
  )
}

function IntegralForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [lower, setLower] = useState("")
  const [upper, setUpper] = useState("")
  const [expr, setExpr] = useState("")
  const isDefinite = Boolean(lower || upper)
  const latex = isDefinite
    ? `\\int_{${lower || "a"}}^{${upper || "b"}} ${expr || "f(x)"}\\,dx`
    : `\\int ${expr || "f(x)"}\\,dx`
  return (
    <FormShell
      title="Integral"
      hint="deja los límites vacíos para integral indefinida"
      preview={`$${latex}$`}
      onInsert={() => onInsert(`$${latex}$`)}
      onCancel={onCancel}
      canInsert={Boolean(expr || lower || upper)}
      accentColor={accentColor}
      borderColor={borderColor}
    >
      <div className="flex flex-col items-center gap-0.5">
        <FillBox value={upper} onChange={setUpper} placeholder="sup." small accentColor={accentColor} />
        <span className="text-2xl leading-none text-slate-700">∫</span>
        <FillBox value={lower} onChange={setLower} placeholder="inf." small accentColor={accentColor} />
      </div>
      <FillBox value={expr} onChange={setExpr} placeholder="f(x)" accentColor={accentColor} />
      <span className="text-sm text-slate-500">dx</span>
    </FormShell>
  )
}

function SistemaForm({ onInsert, onCancel, accentColor, borderColor }: FormProps) {
  const [rows, setRows] = useState<string[]>(["", ""])
  const filled = rows.map(r => r.trim()).filter(Boolean)
  const latex = `\\begin{cases}\n${filled.join("\\\\\n")}\n\\end{cases}`

  function updateRow(i: number, v: string) {
    setRows(prev => prev.map((r, idx) => (idx === i ? v : r)))
  }

  return (
    <FormShell
      title="Sistema de ecuaciones"
      preview={filled.length ? `$$${latex}$$` : ""}
      onInsert={() => onInsert(`$$${latex}$$`)}
      onCancel={onCancel}
      canInsert={filled.length > 0}
      accentColor={accentColor}
      borderColor={borderColor}
    >
      <div className="flex flex-col gap-1.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <FillBox value={r} onChange={v => updateRow(i, v)} placeholder={`ecuación ${i + 1}`} wide accentColor={accentColor} />
            {rows.length > 2 && (
              <button
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}
                className="text-slate-300 hover:text-red-500"
                aria-label="Quitar ecuación"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onMouseDown={e => e.preventDefault()}
          onClick={() => setRows(prev => [...prev, ""])}
          className="self-start text-[11px] font-bold"
          style={{ color: accentColor }}
        >
          + Añadir ecuación
        </button>
      </div>
    </FormShell>
  )
}

export default function MathFillTemplateForm({
  templateId,
  onInsert,
  onCancel,
  accentColor,
  borderColor,
}: {
  templateId: MathTemplateId
  onInsert: (latex: string) => void
  onCancel: () => void
  accentColor: string
  borderColor: string
}) {
  const props = { onInsert, onCancel, accentColor, borderColor }
  if (templateId === "limite") return <LimiteForm {...props} />
  if (templateId === "fraccion") return <FraccionForm {...props} />
  if (templateId === "potencia") return <PotenciaForm {...props} />
  if (templateId === "raiz") return <RaizForm {...props} />
  if (templateId === "integral") return <IntegralForm {...props} />
  return <SistemaForm {...props} />
}
