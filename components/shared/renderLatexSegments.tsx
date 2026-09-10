import katex from "katex"

// Extraído de MathEditor.tsx (usado en producción por Simulacros y Camino)
// para poder reutilizarlo tal cual desde otros sitios (ej. la vista previa
// de RichTextArea en Exámenes) sin duplicar la lógica de parseo/render.
export const HAS_LATEX = /\$|\\\[|\\\(|\\begin\{/

// Character-by-character scanner — handles adjacent $A$$B$ correctly.
// When previous char was $, current $ is a new inline block, NOT display math.
export function renderLatexSegments(text: string): React.ReactNode[] {
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
