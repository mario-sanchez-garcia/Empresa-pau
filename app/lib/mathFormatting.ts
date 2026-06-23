const MATH_TOKEN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g
const CODE_FENCE_TOKEN = /(```[\s\S]*?```)/g
const ENVIRONMENTS = 'pmatrix|bmatrix|vmatrix|matrix|cases|aligned|array|align|equation'
const UNITS = 'kg|mol|atm|kJ|Pa|Hz|cm|mm|kg|g|m|s|N|J|W|T|C|V|A|L'
const RESPONSE_HEADINGS = [
  'Definir las variables',
  'Plantear las ecuaciones',
  'Resolver el sistema',
  'Sistema resultante',
  'Caso 1',
  'Caso 2',
  'Caso 3',
  'Puntos fuertes',
  'Errores a corregir',
  'Corrección paso a paso',
  'Correccion paso a paso',
  'Teoría aplicada',
  'Teoria aplicada',
  'Solución',
  'Solucion',
  'Conclusión',
  'Conclusion',
  'Criterios de corrección',
  'Criterios de correccion',
]

export function normalizeExamStatement(input?: string | null) {
  if (!input) return ''

  let text = normalizePdfGlyphs(input)
  text = normalizeAiLatexBlocks(text)
  text = normalizeExistingMath(text)
  text = mapOutsideMath(text, repairLostLatex)
  text = mapOutsideMath(text, wrapLatexEnvironments)
  text = formatBrokenMathBlocks(text)
  text = formatLinearSystems(text)
  text = mapOutsideMath(text, normalizeSoftLineBreaks)
  text = mapOutsideMath(text, formatLimitsAndIntegrals)
  text = mapOutsideMath(text, formatScientificNotation)
  text = mapOutsideMath(text, wrapExplicitLatex)
  text = mapOutsideMath(text, formatPhysicsNotation)
  text = mapOutsideMath(text, formatCommonMathExpressions)
  text = mapOutsideMath(text, formatChemicalNotation)
  text = mapOutsideMath(text, formatBulletPoints)
  text = mapOutsideMath(text, formatExamStructure)

  return normalizeDisplayMathBlocks(text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n(?!\n)/g, '  \n')
  ).trim()
}

// Kept for compatibility with the existing renderer and imports.
export const formatExamText = normalizeExamStatement

// Lighter normalization for AI-generated correction/chat text.
// Unlike normalizeExamStatement it does NOT:
//   - run normalizePdfGlyphs (no OCR glyph artefacts in AI text)
//   - run normalizeSoftLineBreaks (preserves the markdown structure the AI wrote)
//   - run formatBrokenMathBlocks / formatLinearSystems (OCR-specific)
//   - run formatExamStructure (bolding a)/b)/1.1. etc. — not needed in corrections)
//   - add trailing soft-break spaces to every line
export function normalizeCorrectionText(input?: string | null) {
  if (!input) return ''
  let text = input
  text = unwrapLatexCodeFences(text)
  text = normalizeMathDelimiters(text)
  text = mapOutsideCodeFences(text, removeVisibleInvalidValues)
  text = mapOutsideCodeFences(text, normalizeMixedDollarBlocks)
  text = mapOutsideCodeFences(text, normalizeRiskyMarkdownTables)
  text = mapOutsideMath(text, normalizeResponseStructure)
  text = formatOrphanCasesBlocks(text)
  text = normalizeAiLatexBlocks(text)
  text = normalizeExistingMath(text)
  text = mapOutsideMath(text, repairLostLatex)
  text = mapOutsideMath(text, wrapDanglingLatexEnvironmentFragments)
  text = mapOutsideMath(text, wrapLatexEnvironments)
  text = formatOrphanCasesBlocks(text)
  text = mapOutsideMath(text, formatLimitsAndIntegrals)
  text = mapOutsideMath(text, formatScientificNotation)
  text = mapOutsideMath(text, wrapExplicitLatex)
  text = mapOutsideMath(text, wrapOrphanLatexFragments)
  text = mapOutsideMath(text, promoteLongLatexToDisplay)
  text = mapOutsideMath(text, formatPhysicsNotation)
  text = mapOutsideMath(text, formatCommonMathExpressions)
  text = mapOutsideMath(text, formatChemicalNotation)
  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export const normalizeCorrectionMarkdownForRender = normalizeCorrectionText

function normalizeMathDelimiters(text: string) {
  return mapOutsideCodeFences(text, part => part
    .replace(/\$\\\(([\s\S]*?)\\\)\$/g, (_, body) => `$${body.trim()}$`)
    .replace(/\$+\s*\\\(([\s\S]*?)\\\)\s*\$+/g, (_, body) => `$${body.trim()}$`)
    .replace(/\\\[((?:.|\n)*?)\\\]/g, (_, body) => `\n\n$$\n${body.trim()}\n$$\n\n`)
    .replace(/\\\(([^()\n]*(?:\\[a-zA-Z]+|[=+\-*/^_{}])[^()\n]*)\\\)/g, (_, body) => `$${body.trim()}$`)
  )
}

function normalizeMixedDollarBlocks(text: string) {
  return text.replace(/\$\$([\s\S]*?)\$\$/g, (match, body) => {
    if (!body.includes('$')) return match
    const expressions: string[] = []
    for (const matchItem of body.matchAll(/([+\-]?\s*)\$([^$]+)\$/g)) {
      const cleanPrefix = (matchItem[1] ?? '').trim()
      const cleanExpression = (matchItem[2] ?? '').trim()
      const signedExpression = cleanPrefix === '-' && cleanExpression.startsWith('-')
        ? cleanExpression
        : `${cleanPrefix}${cleanExpression}`.trim()
      const expression = signedExpression.replace(/^\+\s*/, '')
      if (expression) expressions.push(expression)
    }

    if (!expressions.length) return match
    return expressions.map(expression => `\n\n$$\n${repairLostLatex(expression)}\n$$\n\n`).join('')
  })
}

function normalizeRiskyMarkdownTables(text: string) {
  return text.replace(/(?:^|\n)((?:\|[^\n]*\|\s*\n?){2,})/g, (match, table) => {
    if (!/[\\$]|\\begin\{|\\frac|\\tfrac|\\cdot/.test(table)) return match
    const rows = table
      .trim()
      .split('\n')
      .map((row: string) => row.trim())
      .filter((row: string) => row && !/^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(row))
      .map((row: string) => row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim()).filter(Boolean))
      .filter((cells: string[]) => cells.length)

    if (rows.length < 2) return match
    const [, ...bodyRows] = rows
    const items = bodyRows.map((cells: string[]) => `- ${cells.join(': ')}`)
    if (!items.length) return match
    return `\n\n### Puntuación estimada\n\n${items.join('\n')}\n\n`
  })
}

function normalizeDisplayMathBlocks(text: string) {
  const parts = text.split('$$')
  if (parts.length < 3) return text

  return parts.map((part, index) => {
    if (index % 2 === 0) return part
    const body = part
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n[ \t]+/g, '\n')
      .trim()
    return `\n\n$$\n${body}\n$$\n\n`
  }).join('')
}

function removeVisibleInvalidValues(text: string) {
  return text
    .replace(/(^|\n)[ \t]*(?:undefined|null|NaN)[ \t]*(?=\n|$)/gi, '$1')
    .replace(/(:|\b(?:resultante|resultado|solución|solucion|respuesta|detalle|teoría|teoria)\b)[ \t]*(?:undefined|null|NaN)\b/gi, '$1')
    .replace(/\bundefined\b|\bNaN\b/g, '')
}

function normalizeResponseStructure(text: string) {
  let output = text
    .replace(/([A-Za-zÀ-ÿ])([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:las?|los?|del?|de|a|al|y|o)\s+[A-Za-zÀ-ÿ]+){0,3})(?=\s|:)/g, (match, before, after) => {
      if (!RESPONSE_HEADINGS.some(heading => normalizeHeading(heading) === normalizeHeading(after))) return match
      return `${before}.\n\n${after}`
    })
    .replace(/\b(variables|ecuaciones|sistema)(Asignamos|Traducimos|Organizamos|Resolvemos|Calculamos|Comprobamos)\b/g, '$1.\n\n$2')
    .replace(/(casos posibles:)\s*(Caso\s+\d+)/gi, '$1\n\n$2')
    .replace(/(queda:)\s*([A-ZÁÉÍÓÚÑ])/g, '$1\n\n$2')
    .replace(/(raíces:|raices:)\s*\(/gi, '$1 $(')
    .replace(/([^\n])\s+((?:Caso|Sistema resultante|Puntos fuertes|Errores a corregir|Correcci[oó]n paso a paso|Teor[ií]a aplicada|Soluci[oó]n|Conclusi[oó]n|Criterios de correcci[oó]n)\b)/g, '$1\n\n$2')
    .replace(/([^\n])\s+(\d{1,2}[.)]\s+(?=[A-ZÁÉÍÓÚÑ]))/g, '$1\n\n$2')
    .replace(/(\d{1,2}[.)]\s+[^\n]+?)(?=\s+\d{1,2}[.)]\s+)/g, '$1\n\n')
    .replace(/(?<!\d)([.:;])\s*(\d{1,2}[.)]\s+)/g, '$1\n\n$2')

  for (const heading of RESPONSE_HEADINGS) {
    const escaped = escapeRegExp(heading)
    output = output.replace(new RegExp(`(^|\\n)(?!#{1,6}\\s)\\s*(${escaped})(?=\\s*:?\\s*)`, 'gi'), (_, prefix, title) => {
      const cleanTitle = title.trim()
      return `${prefix}## ${cleanTitle}`
    })
  }

  return output
    .replace(/(## [^\n:]+):[ \t]*(?=\S)/g, '$1\n\n')
    .replace(/\n{3,}/g, '\n\n')
}

function unwrapLatexCodeFences(text: string) {
  return text.replace(
    /```(?:latex|math|tex|plain)?\s*\n([\s\S]*?)\n```/gi,
    (match, content) => {
      if (new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}|\\\\frac|\\\\tfrac|\\\\dfrac|\\\\sqrt`).test(content)) {
        const clean = content
          .replace(/%[^\n]*/g, '')
          .replace(/\bundefined\b|\bNaN\b/g, '')
          .trim()
        return `\n\n$$\n${clean}\n$$\n\n`
      }
      return match
    }
  )
}

function formatOrphanCasesBlocks(text: string) {
  return mapOutsideCodeFences(text, part => part.replace(
    /(^|\n)(?!\s*\$\$)([^\n$]*?\\end\{cases\})/g,
    (match, prefix, body) => {
      const rows = body
        .replace(/\\begin\{cases\}/g, '')
        .replace(/\\end\{cases\}/g, '')
        .split(/\\{2,}|\\\s+(?=[0-9A-Za-z])/)
        .map((row: string) => spaceEquation(row))
        .filter((row: string) => row.includes('='))

      if (rows.length < 2) return match
      return `${prefix}\n\n$$\n\\begin{cases}\n${rows.join(' \\\\\n')}\n\\end{cases}\n$$\n\n`
    }
  ))
}

function promoteLongLatexToDisplay(text: string) {
  return text.replace(
    /(^|[^\$])((?:\\begin\{(?:cases|matrix|pmatrix|bmatrix|aligned|align|array)\}[\s\S]*?\\end\{(?:cases|matrix|pmatrix|bmatrix|aligned|align|array)\})|(?:\\frac\{[^{}\n]+\}\{[^{}\n]+\}[^.\n]*(?:\\implies|\\cdot)[^.\n]{35,}))/g,
    (_, prefix, body) => `${prefix}\n\n$$\n${body.trim()}\n$$\n\n`
  )
}

function normalizeExistingMath(text: string) {
  return mapOutsideCodeFences(text, part => part.replace(MATH_TOKEN, token => {
    const display = token.startsWith('$$')
    const delimiter = display ? '$$' : '$'
    const content = token.slice(delimiter.length, -delimiter.length)
    // For inline math, skip formatLatexEnvironment — it adds \n which breaks MATH_TOKEN
    // matching in later pipeline steps, causing wrapLatexEnvironments to double-wrap.
    const envReplacer = display
      ? (_: string, env: string, body: string) => formatLatexEnvironment(env, body)
      : (_: string, env: string, body: string) => `\\begin{${env}}${body}\\end{${env}}`
    const normalized = repairLostLatex(content)
      .replace(/\bGm_1m_2\b/g, 'Gm_{1}m_{2}')
      .replace(new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`, 'g'), envReplacer)
    return `${delimiter}${normalized}${delimiter}`
  }))
}

function mapOutsideMath(text: string, formatter: (value: string) => string) {
  return mapOutsideCodeFences(text, part => part
    .split(MATH_TOKEN)
    .map(part => part.startsWith('$') ? part : formatter(part))
    .join(''))
}

function mapOutsideCodeFences(text: string, formatter: (value: string) => string) {
  return text
    .split(CODE_FENCE_TOKEN)
    .map(part => part.startsWith('```') ? part : formatter(part))
    .join('')
}

function normalizeAiLatexBlocks(text: string) {
  // Validation cases covered by this normalizer:
  // 1. $$$\begin{cases} 2x + y = 10 \ x - y = 2 \end{cases}$$$ -> display math cases.
  // 2. \begin{pmatrix}1 & 2 \ 3 & 4\end{pmatrix} -> display math matrix.
  // 3. "La solución es (x = 2) y (y = 3)." remains prose.
  // 4. Existing $$ x^2 + 1 = 0 $$ remains display math.
  // 5. Fenced code blocks are left untouched.
  return mapOutsideCodeFences(text, part => part
    .replace(/\$\$\$([\s\S]*?)\$\$\$/g, (_, body) => formatDisplayMathBlock(body))
    .replace(/\$\$\$([\s\S]*?)\$\$/g, (_, body) => formatDisplayMathBlock(body))
    .replace(/\$\$([\s\S]*?)\$\$\$/g, (_, body) => formatDisplayMathBlock(body))
  )
}

function formatDisplayMathBlock(body: string) {
  const normalized = formatLatexBlockContent(repairLostLatex(body.trim()))
  return `\n\n$$\n${normalized}\n$$\n\n`
}

function repairLostLatex(text: string) {
  return text
    .replace(new RegExp(`(^|[^\\\\\\w])(egin|end)\\{(${ENVIRONMENTS})\\}`, 'g'),
      (_, prefix, command, environment) => `${prefix}\\${command === 'egin' ? 'begin' : 'end'}{${environment}}`)
    .replace(/(^|[^\\\w])(dfrac|tfrac|frac|sqrt)\s*(?=\{)/g, '$1\\$2')
    .replace(/(^|[^\\\w])(int|sum|prod|cdot|times|leq|geq|neq|approx|rightarrow|text)\b/g, '$1\\$2')
    .replace(/(^|[^\\\w])(leftrightarrow|rightleftharpoons)\b/g, '$1\\rightleftharpoons')
    .replace(/\bdisplaystylelim\b/g, '\\displaystyle\\lim')
    .replace(/(?<!\\)mathbbR\b|(?<!\\)mathbb\{R\}/g, '\\mathbb{R}')
    .replace(/(^|[^\\\w])(?:ec|vec)\{([A-Za-z])\}/g, '$1\\vec{$2}')
    .replace(/(^|[^\\\w])hat\{([ijk])\}/g, '$1\\hat{$2}')
    .replace(new RegExp(`\\btext(${UNITS}|Sol)\\b`, 'g'), '\\text{$1}')
    .replace(/\b(infty|infinity)\b/g, '\\infty')
    .replace(/\blim_\{([^{}]*?)\s+o\s+([^{}]+)\}/g, '\\lim_{$1 \\to $2}')
    .replace(/\bx\s+o\s+(\\infty|[+-]?\d+)/g, 'x \\to $1')
    .replace(/\b(Delta)\b(?=\s*[A-ZHGS]\b|\s*[=+\-])/g, '\\Delta')
    .replace(/(^|[^\\\w])(lambda|alpha|beta|gamma|omega|theta|rho|sigma)\b(?=\s*[_^=+\-])/g, '$1\\$2')
    .replace(/(^|[^\\\w])mu\b(?=\s*[_^=+\-]|\s*\d)/g, '$1\\mu')
    .replace(/(^|[^\\\w])pi\b(?=\s*[_^=+\-*/]|\s*\d)/g, '$1\\pi')
    .replace(/det\(([^)\n]*?)(?<!\\)\blambda\b([^)\n]*?)\)/g, 'det($1\\lambda$2)')
}

function wrapLatexEnvironments(text: string) {
  return text.replace(
    new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`, 'g'),
    (_, environment, body) => {
      return `\n\n$$\n${formatLatexEnvironment(environment, body)}\n$$\n\n`
    }
  )
}

function formatLatexBlockContent(content: string) {
  return content.replace(
    new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`, 'g'),
    (_, environment, body) => formatLatexEnvironment(environment, body)
  )
}

function formatLatexEnvironment(environment: string, body: string) {
  const rows = body
    .trim()
    .replace(/\s*;\s*/g, ' \\\\ ')
    .replace(/\s*\|\s*/g, ' & ')
    .replace(/(?<!\\)\\\s+(?=\d|[A-Za-z])/g, () => ` ${String.raw`\\`} `)
    .replace(/\s*\\\\\s*/g, () => ` ${String.raw`\\`}\n`)
    .replace(/\s*&\s*/g, ' & ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()

  return `\\begin{${environment}}\n${rows}\n\\end{${environment}}`
}

function wrapExplicitLatex(text: string) {
  let output = text
    .replace(/(det\([^)\n]+\)\s*=\s*[^,.;\n]+)/g, '$$$1$')
    .replace(/(\\vec\{[^{}\n]+\}\s*=\s*\\hat\{[^{}\n]+\}(?:\s*[+\-]\s*\\hat\{[^{}\n]+\})+)/g, '$$$1$')

  output = mapOutsideMath(output, part => part
    .replace(/(\\int(?:_\{?[^}\s]+\}?)?(?:\^\{?[^}\s]+\}?)?\s+[^,.;\n]+?\s+d[a-z]\b)/g, '$$$1$')
    .replace(/(\\begin\{(?:pmatrix|bmatrix|vmatrix|matrix|cases|aligned)\}[\s\S]*?\\end\{(?:pmatrix|bmatrix|vmatrix|matrix|cases|aligned)\})/g, '$$$1$')
    .replace(/(\\(?:d?frac|tfrac)\{(?:[^{}]|\{[^{}]*\})+\}\{(?:[^{}]|\{[^{}]*\})+\}(?:[A-Za-z](?:[_^]\{?[^}\s]+\}?)?)*)/g, '$$$1$')
    .replace(/(\\sqrt(?:\[[^\]\n]+\])?\{(?:[^{}]|\{[^{}]*\})+\})/g, '$$$1$')
    .replace(/(\d+(?:[,.]\d+)?\s*\\\s*\\text\{[^{}\n]+\}(?:\s*\^\{?[-+]?\d+\}?)?)/g, '$$$1$')
    .replace(/(\\(?:vec|hat|mathbb)\{[^{}\n]+\})/g, '$$$1$')
    .replace(/([A-Za-z0-9_{}^()+\-.,]+\s*\\(?:cdot|times|leq|geq|neq|approx)\s*[A-Za-z0-9_{}^()+\-.,]+)/g, '$$$1$')
    .replace(/(\\(?:Delta|lambda|alpha|beta|gamma|mu|omega|theta|rho|sigma)(?:\s*[_^=+\-]\s*[A-Za-z0-9_{}^+\-]+)?)/g, '$$$1$')
  )
  return output
}

function wrapDanglingLatexEnvironmentFragments(text: string) {
  return text.replace(
    new RegExp(`(^|\\n)(?!\\s*\\$\\$)([^\\n]*?(?:&|\\\\\\\\)[^\\n]*?\\\\end\\{(${ENVIRONMENTS})\\})`, 'g'),
    (match, prefix, body, environment) => {
      if (body.includes(`\\begin{${environment}}`)) return match
      if (!['pmatrix', 'bmatrix', 'vmatrix', 'matrix', 'cases', 'aligned'].includes(environment)) return match
      const cleanBody = body.replace(new RegExp(`\\\\end\\{${environment}\\}\\s*$`), '').trim()
      if (!cleanBody) return match
      return `${prefix}\n\n$$\n${formatLatexEnvironment(environment, cleanBody)}\n$$\n\n`
    }
  )
}

function wrapOrphanLatexFragments(text: string) {
  const fraction = String.raw`\\(?:tfrac|dfrac|frac)\{(?:[^{}]|\{[^{}]*\})+\}\{(?:[^{}]|\{[^{}]*\})+\}`
  const operator = String.raw`\\(?:cdot|times|implies|rightarrow|leq|geq|neq|approx)`
  const value = String.raw`(?:${fraction}|[A-Za-z0-9_{}^()+\-.,]+)`
  const orphanFragment = new RegExp(`${operator}(?:\\s*${value})+|${fraction}(?:\\s*${operator}\\s*${value})*`, 'g')

  return text
    .replace(orphanFragment, match => `$${match.trim()}$`)
    .replace(/\b([A-Z]\s*=\s*[A-Z]\^\{-?1\}\s*[A-Za-z])(?=\s|[.,;:]|$)/g, match => `$${match.replace(/\s+/g, ' ')}$`)
    .replace(/\b([A-Z]\^\{-?1\}\s*[A-Za-z])(?=\s|[.,;:]|$)/g, match => `$${match.replace(/\s+/g, ' ')}$`)
}

function normalizePdfGlyphs(text: string) {
  return text
    .replace(/\u00ad/g, '')
    .replace(/\t/g, ' ')
    .replace(/\uf0b4|\u00d7/g, ' \u00b7 ')
    .replace(/\uf0d7|\u2219|\u22c5|\ua78f/g, ' \u00b7 ')
    .replace(/\uf0ae|\uf022|\uf0a2/g, '\u2192')
    .replace(/\uf044|\uf0c4/g, '\u21cc')
    .replace(/\uf02d/g, '-')
    .replace(/\uf06c/g, '\u03bb')
    .replace(/\uf020|\uf072|\uf6da/g, ' ')
    .replace(/\u20d7\s*([ijk])/g, ' $\\vec{$1}$')
}

function normalizeSoftLineBreaks(text: string) {
  return text
    .replace(/([A-Za-z\u00c0-\u017f])-\s*\n\s*([A-Za-z\u00c0-\u017f])/g, '$1$2')
    .replace(/([^\n])\n(?!\n|[a-e]\)|[ivx]+\)|Datos?[.:]|Dato[.:]|[A-Z]\.|[0-9]+[)]|[-\u2022]|\$\$)/gi, '$1 ')
}

function formatBulletPoints(text: string) {
  return text
    .replace(/(^|\n)\s*\u2022\s+/g, '$1- ')
    .replace(/:\n(-\s+)/g, ':\n\n$1')
}

function formatBrokenMathBlocks(text: string) {
  return text.replace(
    /\u222b\s*([^\n]+)\n\s*([^\n]+)\n\s*([^\n]+(?:\n[^\n]+){0,3}?)\s*d([a-z])\./g,
    (_, upper, lower, expr, variable) =>
      `\n\n$$\\int_{${toLatexExpression(lower)}}^{${toLatexExpression(upper)}} ${toLatexExpression(expr)}\\,d${variable}$$\n\n`
  )
}

function formatLinearSystems(text: string) {
  return text.replace(
    /r\s*\u2261\s*\n?\{\s*([^\n]+)\n\s*([^\n]+?)\s+y el plano\s+\u03c0\s*\u2261\s*([^.\n]+)\./g,
    (_, first, second, plane) =>
      `$r \\equiv \\begin{cases} ${toLatexExpression(first)} \\\\ ${toLatexExpression(second)} \\end{cases}$ y el plano $\\pi \\equiv ${toLatexExpression(plane)}$.`
  )
}

function formatLimitsAndIntegrals(text: string) {
  return text
    .replace(/\\displaystyle\\lim\s*_\{([^{}]+)\}\s*([^,.;\n]+)/g, '$\\displaystyle\\lim_{$1} $2$')
    .replace(/\\lim\s*_\{([^{}]+)\}\s*([^,.;\n]+)/g, '$\\lim_{$1} $2$')
    .replace(/\bint\s*_\{([^{}]+)\}\s*\^\{([^{}]+)\}\s*([^,.;\n]+?)\s*d([a-z])\b/g, '$\\int_{$1}^{$2} $3\\,d$4$')
    .replace(/\bint\s+([^,.;\n]+?)\s+d([a-z])\b/g, '$\\int $1\\,d$2$')
}

function formatScientificNotation(text: string) {
  return text
    .replace(/(\d+(?:[,.]\d+)?)\s*\\times\s*10\s*\^\s*\{?([+\-\u2212]?\d+)\}?\s*(?:\\\s*)?\\text\{([^{}\n]+)\}/g,
      (_, coefficient, exponent, unit) => `$${coefficient} \\times 10^{${normalizeExponent(exponent)}}\\,\\text{${unit}}$`)
    .replace(new RegExp(`(\\d+(?:[,.]\\d+)?)\\s*(?:\\u00b7|\\\\cdot|cdot|times)\\s*10\\s*\\^?\\s*\\{?([+\\-\\u2212]?\\s*\\d+)\\}?(?:\\s+\\\\text\\{(${UNITS})\\})?`, 'g'),
      (_, coefficient, exponent, unit) => `$${coefficient} \\cdot 10^{${normalizeExponent(exponent)}}${unit ? `\\,\\text{${unit}}` : ''}$`)
    .replace(/\b([A-Za-z])([₀-₉])\b/g, (_, base, subscript) => `$${base}_{${subscriptToNumber(subscript)}}$`)
    .replace(/\b([A-Za-z])([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, base, superscript) => `$${base}^{${superscriptToText(superscript)}}$`)
}

function formatPhysicsNotation(text: string) {
  let output = text
    .replace(new RegExp(`(\\$[^$]+\\$)\\s+\\\\text\\{(${UNITS})\\}(?:\\s*\\^\\s*\\{?([+\\-]?\\d+)\\}?)?`, 'g'),
      (_, value, unit, exponent) => `$${stripMath(value)}\\,\\text{${unit}}${exponent ? `^{${exponent}}` : ''}$`)
    .replace(new RegExp(`(\\d+(?:[,.]\\d+)?(?:\\s*\\$[^$]+\\$)?)\\s+\\\\text\\{(${UNITS})\\}(?:\\s*\\^\\s*\\{?([+\\-]?\\d+)\\}?)?`, 'g'),
      (_, value, unit, exponent) => `$${stripMath(value)}\\,\\text{${unit}}${exponent ? `^{${exponent}}` : ''}$`)
    .replace(new RegExp(`\\b(\\d+(?:[,.]\\d+)?)\\s+(${UNITS})(?:\\s*\\^\\s*\\{?([+\\-]?\\d+)\\}?)?\\b`, 'g'),
      (_, value, unit, exponent) => `$${value}\\,\\text{${unit}}${exponent ? `^{${exponent}}` : ''}$`)

  output = output.replace(/\b(E_mec|Gm_1m_2|v\^2|mu_0|omega)\b/g, value =>
    `$${value.replace('E_mec', 'E_{mec}').replace('Gm_1m_2', 'Gm_{1}m_{2}').replace('v^2', 'v^{2}').replace('mu_0', '\\mu_0').replace('omega', '\\omega')}$`
  )
  return output
}

function formatCommonMathExpressions(text: string) {
  return text
    .replace(/\b([fg])\s*\(\s*x\s*\)\s*=\s*([^,.;\n]+?)(?=\s+y\s+[fg]\s*\(\s*x\s*\)\s*=|,|\.|\n|$)/g,
      (_, name, expression) => `$${name}(x) = ${toLatexExpression(expression)}$`)
    .replace(/\by\s*=\s*f\s*\(\s*x\s*\)/g, '$y = f(x)$')
    .replace(/\bz\s*[\u2212-]\s*y\s*=\s*0/g, '$z-y=0$')
    .replace(/\b([xyz])(\d+)\b/g, (_, variable, exponent) => `$${variable}^{${exponent}}$`)
    .replace(/\b(\d+)([xyz])(\d+)\b/g, (_, coefficient, variable, exponent) => `$${coefficient}${variable}^{${exponent}}$`)
    .replace(/\b(?:in|en)\s+(?:\\mathbb\{R\}|R)\b/g, 'en $\\mathbb{R}$')
    .replace(/\b\u03c0\b/g, '$\\pi$')
    .replace(/\b\u03bb\b/g, '$\\lambda$')
}

function formatChemicalNotation(text: string) {
  const chemicalToken = String.raw`(?:[A-Z][a-z]?_?\d*)+(?:\^\{?[+-]\}?)?`
  const reaction = new RegExp(`((?:\\d*\\s*${chemicalToken})(?:\\s+\\+\\s+(?:\\d*\\s*${chemicalToken}))*)\\s+(\\\\rightarrow|\\\\rightleftharpoons|\\u2192|\\u21cc)\\s+((?:\\d*\\s*${chemicalToken})(?:\\s+\\+\\s+(?:\\d*\\s*${chemicalToken}))*)`, 'g')
  let output = text
    .replace(/\b(K_[abcpw])\b/g, (_, constant) => `$${constant}$`)
    .replace(/\bpH\s*=\s*(-?\s*(?:\\?log|ln)\s*\([^)\n]+\))/g, (_, expression) => `$pH = ${expression.replace(/\blog\b/, '\\log')}$`)
    .replace(/\b(E\^\{?\\?circ\}?|\\Delta\s*[HGS])\b/g, (_, symbol) => `$${symbol}$`)
    .replace(reaction,
      (_, reactants, arrow, products) => `$${normalizeChemicalSide(reactants)} ${arrow === '\\rightleftharpoons' || arrow === '\u21cc' ? '\\rightleftharpoons' : '\\rightarrow'} ${normalizeChemicalSide(products)}$`)
    .replace(/\b([A-Z][a-z]?)(?:_(\d+)|(\d+))([+-])(?=\s|$|[.,;:])/g, (_, element, subscriptA, subscriptB, charge) =>
      `$\\mathrm{${element}${subscriptA || subscriptB ? `_{${subscriptA ?? subscriptB}}` : ''}}^{${charge}}$`)
    .replace(/\b([A-Z][a-z]?)(?:\^)?([+-])(?=\s|$|[.,;:])/g, (_, element, charge) => `$\\mathrm{${element}}^{${charge}}$`)

  output = mapOutsideMath(output, part => part
    .replace(/\b((?:[A-Z][a-z]?_?\d*){2,})(\^\{?[+-]\}?)?/g, (match, formula, charge) =>
      /\d/.test(match) ? `$${toLatexChemical(formula)}${charge ?? ''}$` : match)
    .replace(/\b((?:[A-Z][a-z]?\d*|\([A-Za-z0-9+\-]+\)\d*){2,})(\d?[+-])?\b/g, (match, formula, charge) => {
      if (!/\d|\(|\)/.test(match)) return match
      return `$${toLatexChemical(formula, charge)}$`
    })
  )

  return output
}

function formatExamStructure(text: string) {
  return text
    .replace(/(^|[\n:;.!?])\s*([a-e]\))\s*(\(\s*\d+(?:[,.]\d+)?\s*puntos?\s*\))?/gim,
      (_, prefix, marker, score) => formatSectionBreak(prefix, marker, score))
    .replace(/(^|[\n:;])\s*((?:[1-9]\d*)\.(?:[1-9]\d*)\.)\s*(\(\s*\d+(?:[,.]\d+)?\s*puntos?\s*\))?/gim,
      (_, prefix, marker, score) => formatSectionBreak(prefix, marker, score))
    .replace(/(^|[\n:;])\s*([A-D]\.(?:[1-9]\d*)\.)\s*(\(\s*\d+(?:[,.]\d+)?\s*puntos?\s*\))?/gm,
      (_, prefix, marker, score) => formatSectionBreak(prefix, marker, score))
    .replace(/(^|\n)\s*((?:Datos?|Dato)[.:])/gi, '$1**$2**')
    .replace(/(^|\n)\s*([ivx]+\))/gi, '$1**$2**')
    .replace(/\b(Desarrolle el tema:|Tema:|Conceptos?:|Defina:|Definiciones?:)/gi, '**$1**')
    .replace(/(\*\*)?(\(\s*\d+(?:[,.]\d+)?\s*puntos?\s*\))(\*\*)?/gi,
      (match, before, score, after) => before && after ? match : `**${score}**`)
    .replace(/\n{3,}/g, '\n\n')
}

function formatSectionBreak(prefix: string, marker: string, score?: string) {
  const intro = prefix && prefix !== '\n' ? `${prefix}\n\n` : '\n\n'
  const cleanScore = score?.trim()
  return `${intro}**${marker.trim()}**${cleanScore ? ` **${cleanScore}**` : ''}\n`
}

function toLatexExpression(expression: string) {
  return expression
    .replace(/[\u2212\u2013]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\bf\s*\(\s*x\s*\)/g, 'f(x)')
    .replace(/\bg\s*\(\s*x\s*\)/g, 'g(x)')
    .replace(/\btg\b/g, '\\tan')
    .replace(/\bsen\b/g, '\\sin')
    .replace(/\bln\b/g, '\\ln')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/\u03c0/g, '\\pi')
    .replace(/[\u00b7\u2219\u22c5\ua78f]/g, '\\cdot ')
    .replace(/\b([a-z])(\d+)\b/g, '$1^{$2}')
    .replace(/\b(\d+)([a-z])(\d+)\b/g, '$1$2^{$3}')
    .trim()
}

function normalizeChemicalSide(side: string) {
  return side.split(/\s+\+\s+/).map(part => {
    const match = part.match(/^(\d*)\s*(.+)$/)
    return match ? `${match[1]}${toLatexChemical(match[2])}` : part
  }).join(' + ')
}

function toLatexChemical(formula: string, charge?: string) {
  const body = formula
    .replace(/([A-Z][a-z]?|\))(\d+)/g, '$1_$2')
    .replace(/\u2212/g, '-')
  return `\\mathrm{${body}}${charge ? `^{${charge.replace('\u2212', '-')}}` : ''}`
}

function stripMath(value: string) {
  return value.replace(/^\$|\$$/g, '')
}

function normalizeExponent(exponent: string) {
  return exponent.replace(/\s+/g, '').replace('\u2212', '-')
}

function subscriptToNumber(value: string) {
  return '₀₁₂₃₄₅₆₇₈₉'.indexOf(value)
}

function superscriptToText(value: string) {
  const map: Record<string, string> = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
  return value.split('').map(character => map[character] ?? character).join('')
}
function normalizeHeading(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function spaceEquation(value: string) {
  return value
    .trim()
    .replace(/\s*([=<>])\s*/g, ' $1 ')
    .replace(/\s*([+\-])\s*/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim()
}
