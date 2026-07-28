"use client"

import { useMemo, useState, type RefObject } from "react"

type MathGroupId = "basico" | "calculo" | "algebra" | "vectores" | "probabilidad" | "fisica" | "quimica" | "plantillas"

type MathSnippet = {
  label: string
  title: string
  latex: string
  cursorOffset?: number
}

interface MathAnswerToolbarProps {
  subject?: string | null
  value: string
  onChange: (value: string) => void
  textareaRef?: RefObject<HTMLTextAreaElement | null>
  editorRef?: RefObject<HTMLDivElement | null>
  accentColor?: string
  softColor?: string
  borderColor?: string
}

const MATH_SUBJECTS = new Set(["mates", "matematicas", "matematicas_ii", "matematicas_ccss", "matematicas_sociales", "fisica", "quimica"])

const GROUPS: Array<{ id: MathGroupId; label: string; snippets: MathSnippet[] }> = [
  {
    id: "basico",
    label: "Básico",
    snippets: [
      { label: "a/b", title: "Fracción", latex: "$\\frac{a}{b}$" },
      { label: "√", title: "Raíz", latex: "$\\sqrt{x}$" },
      { label: "x²", title: "Potencia", latex: "$x^{2}$" },
      { label: "_{}", title: "Subíndice", latex: "$x_{1}$" },
      { label: "·", title: "Producto", latex: "$\\cdot$" },
      { label: "±", title: "Más menos", latex: "$\\pm$" },
      { label: "≠", title: "Distinto", latex: "$\\neq$" },
      { label: "≤", title: "Menor o igual", latex: "$\\leq$" },
      { label: "≥", title: "Mayor o igual", latex: "$\\geq$" },
      { label: "≈", title: "Aproximado", latex: "$\\approx$" },
      { label: "∞", title: "Infinito", latex: "$\\infty$" },
      { label: "π", title: "Pi", latex: "$\\pi$" },
      { label: "α", title: "Alfa", latex: "$\\alpha$" },
      { label: "β", title: "Beta", latex: "$\\beta$" },
      { label: "θ", title: "Theta", latex: "$\\theta$" },
      { label: "λ", title: "Lambda", latex: "$\\lambda$" },
      { label: "μ", title: "Mu", latex: "$\\mu$" },
      { label: "σ", title: "Sigma", latex: "$\\sigma$" },
    ],
  },
  {
    id: "calculo",
    label: "Cálculo",
    snippets: [
      { label: "lim", title: "Límite", latex: "$\\lim_{x \\to a} f(x)$" },
      { label: "∫", title: "Integral indefinida", latex: "$\\int f(x)\\,dx$" },
      { label: "∫ dx", title: "Integral definida", latex: "$\\int_{a}^{b} f(x)\\,dx$" },
      { label: "d/dx", title: "Derivada", latex: "$\\frac{d}{dx}\\left(f(x)\\right)$" },
      { label: "f'", title: "Primera derivada", latex: "$f'(x)$" },
      { label: "f''", title: "Segunda derivada", latex: "$f''(x)$" },
      { label: "Δx", title: "Incremento", latex: "$\\Delta x$" },
    ],
  },
  {
    id: "algebra",
    label: "Álgebra",
    snippets: [
      { label: "mat 2x2", title: "Matriz 2x2", latex: "$$\n\\begin{pmatrix}\na & b \\\\\nc & d\n\\end{pmatrix}\n$$" },
      { label: "|A|", title: "Determinante 2x2", latex: "$$\n\\begin{vmatrix}\na & b \\\\\nc & d\n\\end{vmatrix}\n$$" },
      { label: "sistema", title: "Sistema de ecuaciones", latex: "$$\n\\begin{cases}\nax+by=c\\\\\ndx+ey=f\n\\end{cases}\n$$" },
      { label: "A⁻¹", title: "Matriz inversa", latex: "$A^{-1}$" },
      { label: "Aᵗ", title: "Matriz traspuesta", latex: "$A^t$" },
      { label: "|A|", title: "Determinante", latex: "$|A|$" },
      { label: "rg(A)", title: "Rango de matriz", latex: "$\\operatorname{rg}(A)$" },
    ],
  },
  {
    id: "vectores",
    label: "Vectores",
    snippets: [
      { label: "u⃗", title: "Vector u", latex: "$\\vec{u}$", cursorOffset: 6 },
      { label: "AB⃗", title: "Vector AB", latex: "$\\overrightarrow{AB}$", cursorOffset: 17 },
      { label: "·", title: "Producto escalar", latex: "$\\cdot$" },
      { label: "×", title: "Producto vectorial", latex: "$\\times$" },
      { label: "⊥", title: "Perpendicular", latex: "$\\perp$" },
      { label: "∥", title: "Paralelo", latex: "$\\parallel$" },
      { label: "||u||", title: "Módulo de vector", latex: "$\\|\\vec{u}\\|$" },
    ],
  },
  {
    id: "probabilidad",
    label: "Prob.",
    snippets: [
      { label: "P(A)", title: "Probabilidad", latex: "$P(A)$" },
      { label: "A∩B", title: "Intersección", latex: "$P(A \\cap B)$" },
      { label: "A∪B", title: "Unión", latex: "$P(A \\cup B)$" },
      { label: "A|B", title: "Probabilidad condicionada", latex: "$P(A \\mid B)$" },
      { label: "nCk", title: "Combinatoria", latex: "$\\binom{n}{k}$" },
      { label: "B(n,p)", title: "Binomial", latex: "$X \\sim B(n,p)$" },
      { label: "N(μ,σ)", title: "Normal", latex: "$X \\sim N(\\mu,\\sigma)$" },
      { label: "Z", title: "Tipificación", latex: "$Z=\\frac{X-\\mu}{\\sigma}$" },
    ],
  },
  {
    id: "fisica",
    label: "Física",
    snippets: [
      { label: "F⃗", title: "Fuerza vectorial", latex: "$\\vec{F}$" },
      { label: "E⃗", title: "Campo eléctrico", latex: "$\\vec{E}$" },
      { label: "B⃗", title: "Campo magnético", latex: "$\\vec{B}$" },
      { label: "G", title: "Constante de gravitación", latex: "$G$" },
      { label: "g", title: "Campo gravitatorio", latex: "$g$" },
      { label: "v", title: "Velocidad", latex: "$v$" },
      { label: "a", title: "Aceleración", latex: "$a$" },
      { label: "Ep", title: "Energía potencial", latex: "$E_p$" },
      { label: "Ec", title: "Energía cinética", latex: "$E_c$" },
      { label: "Em", title: "Energía mecánica", latex: "$E_m$" },
      { label: "F=ma", title: "Segunda ley de Newton", latex: "$F = ma$" },
      { label: "Gmm/r²", title: "Gravitación", latex: "$F = G\\frac{m_1m_2}{r^2}$" },
      { label: "½mv²", title: "Energía cinética", latex: "$E = \\frac{1}{2}mv^2$" },
      { label: "unidad", title: "Unidad SI", latex: "$\\,\\mathrm{}$", cursorOffset: 11 },
    ],
  },
  {
    id: "quimica",
    label: "Química",
    snippets: [
      { label: "Kc", title: "Constante Kc", latex: "$K_c$" },
      { label: "Kp", title: "Constante Kp", latex: "$K_p$" },
      { label: "Ka", title: "Constante Ka", latex: "$K_a$" },
      { label: "Kb", title: "Constante Kb", latex: "$K_b$" },
      { label: "pH", title: "pH", latex: "pH" },
      { label: "[H+]", title: "Concentración de protones", latex: "$[H^+]$" },
      { label: "[OH-]", title: "Concentración de hidróxido", latex: "$[OH^-]$" },
      { label: "ΔH", title: "Entalpía", latex: "$\\Delta H$" },
      { label: "ΔG", title: "Energía libre de Gibbs", latex: "$\\Delta G$" },
      { label: "⇌", title: "Equilibrio", latex: "$\\rightleftharpoons$" },
      { label: "→", title: "Flecha de reacción", latex: "$\\rightarrow$" },
      { label: "e-", title: "Electrón", latex: "$e^-$" },
    ],
  },
  {
    id: "plantillas",
    label: "Plantillas",
    snippets: [
      { label: "∫a→b", title: "Integral definida", latex: "$\\int_{a}^{b} f(x)\\,dx = F(b)-F(a)$" },
      { label: "tangente", title: "Recta tangente", latex: "$y - f(a) = f'(a)(x-a)$" },
      { label: "sistema", title: "Sistema 2x2", latex: "$$\n\\begin{cases}\nax+by=c\\\\\ndx+ey=f\n\\end{cases}\n$$" },
      { label: "ampliada", title: "Matriz ampliada", latex: "$$\n\\left(\n\\begin{array}{cc|c}\n & & \\\\\n & & \n\\end{array}\n\\right)\n$$" },
      { label: "Kc", title: "Equilibrio químico", latex: "$K_c=\\frac{[productos]}{[reactivos]}$" },
      { label: "g", title: "Campo gravitatorio", latex: "$g = G\\frac{M}{r^2}$" },
    ],
  },
]

export function shouldShowMathToolbar(subject?: string | null) {
  const slug = (subject ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")

  return MATH_SUBJECTS.has(slug)
}

function selectionBelongsToEditor(editor: HTMLDivElement, selection: Selection | null) {
  if (!selection || selection.rangeCount === 0) return false
  const node = selection.getRangeAt(0).commonAncestorContainer
  return editor === node || editor.contains(node)
}

export default function MathAnswerToolbar({
  subject,
  value,
  onChange,
  textareaRef,
  editorRef,
  accentColor = "#2563eb",
  softColor = "#eff6ff",
  borderColor = "#dbeafe",
}: MathAnswerToolbarProps) {
  const [open, setOpen] = useState(false)
  const [group, setGroup] = useState<MathGroupId>("basico")
  const visible = shouldShowMathToolbar(subject)
  const activeGroup = useMemo(() => GROUPS.find(item => item.id === group) ?? GROUPS[0], [group])

  if (!visible) return null

  function insertIntoTextarea(snippet: MathSnippet) {
    const textarea = textareaRef?.current
    if (!textarea) return false
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const nextValue = value.slice(0, start) + snippet.latex + value.slice(end)
    onChange(nextValue)
    requestAnimationFrame(() => {
      textarea.blur()
    })
    return true
  }

  function insertIntoEditor(snippet: MathSnippet) {
    const editor = editorRef?.current
    if (!editor) return false
    editor.focus()
    const selection = window.getSelection()
    let range: Range
    if (selectionBelongsToEditor(editor, selection)) {
      range = selection!.getRangeAt(0)
    } else {
      range = document.createRange()
      range.selectNodeContents(editor)
      range.collapse(false)
    }
    range.deleteContents()
    const node = document.createTextNode(snippet.latex)
    range.insertNode(node)
    const cursor = snippet.cursorOffset ?? snippet.latex.length
    const nextRange = document.createRange()
    nextRange.setStart(node, Math.min(cursor, snippet.latex.length))
    nextRange.collapse(true)
    selection?.removeAllRanges()
    selection?.addRange(nextRange)
    onChange(editor.innerText)
    return true
  }

  function insertSnippet(snippet: MathSnippet) {
    if (!insertIntoTextarea(snippet)) insertIntoEditor(snippet)
    setOpen(false)
  }

  return (
    <div
      data-kairo-math-toolbar="true"
      className="pau-math-answer-toolbar"
      style={{
        borderLeft: `1.5px solid ${borderColor}`,
        borderRight: `1.5px solid ${borderColor}`,
        borderBottom: `1px solid #e2e8f0`,
        background: "#f8fafc",
      }}
    >
      <div className="flex items-center gap-2 overflow-x-auto px-2 py-2">
        <button
          type="button"
          aria-expanded={open}
          aria-label={open ? "Ocultar símbolos matemáticos" : "Mostrar símbolos matemáticos"}
          title={open ? "Ocultar símbolos" : "Insertar símbolos"}
          onMouseDown={event => event.preventDefault()}
          onClick={() => setOpen(current => !current)}
          className="shrink-0 rounded-xl px-3 py-1.5 text-xs font-black transition"
          style={{ background: open ? accentColor : softColor, color: open ? "#fff" : accentColor }}
        >
          ƒx Símbolos
        </button>
        {open && activeGroup.snippets.slice(0, 8).map(snippet => (
          <button
            key={`${activeGroup.id}-${snippet.title}-${snippet.latex}`}
            type="button"
            aria-label={`Insertar ${snippet.title}`}
            title={snippet.title}
            onMouseDown={event => event.preventDefault()}
            onClick={() => insertSnippet(snippet)}
            className="shrink-0 rounded-xl border bg-white px-3 py-1.5 text-xs font-black text-slate-700 transition hover:-translate-y-0.5"
            style={{ borderColor }}
          >
            {snippet.label}
          </button>
        ))}
      </div>
      {open && (
        <div className="border-t px-2 pb-2" style={{ borderColor }}>
          <div className="flex gap-1 overflow-x-auto py-2">
            {GROUPS.map(item => (
              <button
                key={item.id}
                type="button"
                aria-label={`Ver grupo ${item.label}`}
                title={item.label}
                onMouseDown={event => event.preventDefault()}
                onClick={() => setGroup(item.id)}
                className="shrink-0 rounded-full px-3 py-1 text-[11px] font-black"
                style={{ background: group === item.id ? accentColor : softColor, color: group === item.id ? "#fff" : accentColor }}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {activeGroup.snippets.map(snippet => (
              <button
                key={`${activeGroup.id}-panel-${snippet.title}-${snippet.latex}`}
                type="button"
                aria-label={`Insertar ${snippet.title}`}
                title={snippet.title}
                onMouseDown={event => event.preventDefault()}
                onClick={() => insertSnippet(snippet)}
                className="shrink-0 rounded-xl border bg-white px-3 py-2 text-xs font-black text-slate-700"
                style={{ borderColor }}
              >
                {snippet.label}
              </button>
            ))}
          </div>
        </div>
      )}
      <p className="px-3 pb-2 text-[11px] font-semibold leading-5 text-slate-500">
        Puedes usar formato matemático. Ejemplo: límite de f(x) cuando x tiende a a. Kairo lo entenderá.
      </p>
    </div>
  )
}
