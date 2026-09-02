// Anotador de símbolos de fórmulas para el glosario interactivo del Curso:
// envuelve las apariciones literales de un símbolo conocido (ej. "E_m")
// dentro de segmentos de LaTeX ($...$/$$...$$) con \htmlData{glossary-info=
// <json codificado>}{...}, que KaTeX renderiza como un <span> con un
// atributo data-glossary-info — MathMarkdown ya acota `trust` para permitir
// exactamente ese comando (ver components/shared/MathMarkdown.tsx). El
// significado viaja dentro del propio atributo (JSON percent-encoded), así
// que el click/hover en el DOM no necesita ninguna consulta ni mapa aparte
// en tiempo de interacción.
//
// Coincidencia por texto literal, no parseo semántico de LaTeX: cada
// `symbol` de la tabla formula_glossary debe ser exactamente la subcadena
// que aparece en el markdown original (mismos backslashes/llaves).

export type GlossaryEntry = { label: string; definition: string }

// El payload va dentro de un argumento "raw" de \htmlData, que KaTeX lee con
// su propio lexer de LaTeX — no un parser de texto genérico. "%" es el
// carácter de comentario de LaTeX (todo lo que sigue en la línea se
// descarta), así que percent-encoding (encodeURIComponent/JSON normal)
// rompe el parseo en cuanto aparece el primer "%" de un byte UTF-8
// codificado. Se usa base64url (alfabeto A-Za-z0-9-_, sin relleno "=") en
// su lugar: ningún carácter de ese alfabeto tiene significado especial para
// el lexer de LaTeX, y tampoco coincide con el separador "," ni con el "="
// que \htmlData usa internamente para trocear sus propios pares clave/valor.
export function encodeGlossaryPayload(entry: GlossaryEntry): string {
  const bytes = new TextEncoder().encode(JSON.stringify(entry))
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function decodeGlossaryPayload(value: string): GlossaryEntry | null {
  try {
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0))
    const json = new TextDecoder().decode(bytes)
    const parsed = JSON.parse(json)
    if (parsed && typeof parsed.label === 'string' && typeof parsed.definition === 'string') return parsed
    return null
  } catch {
    return null
  }
}

const PROTECTED_COMMAND = /\\(?:text|mathrm)\{[^}]*\}/g

// Marcador de sustitución temporal para proteger \text{}/\mathrm{} mientras
// se anota. Se construye con String.fromCharCode (carácter de control U+0000)
// en vez de escribir el byte nulo literal en el fuente, para no dejar
// bytes no imprimibles en el archivo — pero el efecto es el mismo: una
// secuencia que no puede aparecer en LaTeX ni en texto normal, así que
// restaurarla nunca puede confundirse con contenido real (a diferencia de
// un separador imprimible como un espacio, que sí podría coincidir con
// números sueltos genuinos del propio LaTeX, p. ej. "2 \pi r").
const MASK_MARK = String.fromCharCode(0)

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Construye una única alternación con todos los símbolos, más largos
// primero, cada uno con su propio lookaround de límite — así "M_T" se
// intenta antes que "M" en cada posición, y una sola pasada evita volver a
// escanear texto ya sustituido (que podría contener letras sueltas del
// JSON codificado y producir falsos positivos).
function buildSymbolPattern(symbols: string[]): RegExp | null {
  if (symbols.length === 0) return null
  const sorted = [...symbols].sort((a, b) => b.length - a.length)
  const parts = sorted.map(symbol => {
    const escaped = escapeRegExp(symbol)
    const isCommand = symbol.startsWith('\\')
    const before = isCommand ? '(?<![A-Za-z\\\\])' : '(?<![A-Za-z0-9_\\\\])'
    const after = isCommand ? '(?![A-Za-z])' : '(?![A-Za-z0-9_])'
    return `${before}${escaped}${after}`
  })
  return new RegExp(parts.join('|'), 'g')
}

function annotateSegment(segment: string, pattern: RegExp, entries: Map<string, GlossaryEntry>): string {
  // \text{...}/\mathrm{...} suelen llevar unidades ("m" = metros, "V" =
  // voltios) que coinciden por texto con símbolos de variable ("m" = masa,
  // "V" = potencial) — se enmascaran antes de anotar para no marcar una
  // unidad como si fuera la variable, y se restauran después intactos.
  const protectedRuns: string[] = []
  const masked = segment.replace(PROTECTED_COMMAND, match => {
    protectedRuns.push(match)
    return `${MASK_MARK}${protectedRuns.length - 1}${MASK_MARK}`
  })

  const annotated = masked.replace(pattern, matched => {
    const entry = entries.get(matched)
    if (!entry) return matched
    const payload = encodeGlossaryPayload(entry)
    return `\\htmlData{glossary-info=${payload}}{${matched}}`
  })

  const restorePattern = new RegExp(`${MASK_MARK}(\\d+)${MASK_MARK}`, 'g')
  return annotated.replace(restorePattern, (_full, index: string) => protectedRuns[Number(index)])
}

// Recorre `markdown` buscando bloques $$...$$ e inline $...$ (los únicos
// delimitadores que produce normalizeLessonMarkdown) y aplica el anotador
// solo dentro de ellos — el resto del texto (prosa, títulos, tablas) no se
// toca en ningún caso.
export function annotateGlossarySymbols(markdown: string, entries: Map<string, GlossaryEntry> | undefined | null): string {
  if (!markdown || !entries || entries.size === 0) return markdown
  const pattern = buildSymbolPattern([...entries.keys()])
  if (!pattern) return markdown

  return markdown.replace(/\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g, (whole, block: string | undefined, inline: string | undefined) => {
    const isBlock = block !== undefined
    const inner = isBlock ? block : (inline ?? '')
    const replaced = annotateSegment(inner, pattern, entries)
    return isBlock ? `$$${replaced}$$` : `$${replaced}$`
  })
}
