const MATH_TOKEN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g
const ENVIRONMENTS = 'pmatrix|bmatrix|vmatrix|matrix|cases|aligned'
const UNITS = 'kg|mol|atm|kJ|Pa|Hz|cm|mm|kg|g|m|s|N|J|W|T|C|V|A|L'

export function normalizeExamStatement(input?: string | null) {
  if (!input) return ''

  let text = normalizePdfGlyphs(input)
  text = normalizeExistingMath(text)
  text = mapOutsideMath(text, repairLostLatex)
  text = mapOutsideMath(text, wrapLatexEnvironments)
  text = formatBrokenMathBlocks(text)
  text = formatLinearSystems(text)
  text = normalizeSoftLineBreaks(text)
  text = mapOutsideMath(text, formatLimitsAndIntegrals)
  text = mapOutsideMath(text, formatScientificNotation)
  text = mapOutsideMath(text, wrapExplicitLatex)
  text = mapOutsideMath(text, formatPhysicsNotation)
  text = mapOutsideMath(text, formatCommonMathExpressions)
  text = mapOutsideMath(text, formatChemicalNotation)
  text = mapOutsideMath(text, formatExamStructure)

  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n(?!\n)/g, '  \n')
    .trim()
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
  text = normalizeExistingMath(text)
  text = mapOutsideMath(text, repairLostLatex)
  text = mapOutsideMath(text, wrapLatexEnvironments)
  text = mapOutsideMath(text, formatLimitsAndIntegrals)
  text = mapOutsideMath(text, formatScientificNotation)
  text = mapOutsideMath(text, wrapExplicitLatex)
  text = mapOutsideMath(text, formatPhysicsNotation)
  text = mapOutsideMath(text, formatCommonMathExpressions)
  text = mapOutsideMath(text, formatChemicalNotation)
  return text.replace(/[ \t]{2,}/g, ' ').trim()
}

function normalizeExistingMath(text: string) {
  return text.replace(MATH_TOKEN, token => {
    const display = token.startsWith('$$')
    const delimiter = display ? '$$' : '$'
    const content = token.slice(delimiter.length, -delimiter.length)
    const normalized = repairLostLatex(content)
      .replace(/\bGm_1m_2\b/g, 'Gm_{1}m_{2}')
      .replace(new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`, 'g'),
        (_, environment, body) => `\\begin{${environment}}${body.replace(/\\(?=[xyz](?:\\|$))/g, '\\\\')}\\end{${environment}}`)
    return `${delimiter}${normalized}${delimiter}`
  })
}

function mapOutsideMath(text: string, formatter: (value: string) => string) {
  return text
    .split(MATH_TOKEN)
    .map(part => part.startsWith('$') ? part : formatter(part))
    .join('')
}

function repairLostLatex(text: string) {
  return text
    .replace(new RegExp(`(^|[^\\\\\\w])(egin|end)\\{(${ENVIRONMENTS})\\}`, 'g'),
      (_, prefix, command, environment) => `${prefix}\\${command === 'egin' ? 'begin' : 'end'}{${environment}}`)
    .replace(/(^|[^\\\w])(dfrac|frac|sqrt)\s*(?=\{)/g, '$1\\$2')
    .replace(/(^|[^\\\w])(int|sum|prod|cdot|times|leq|geq|neq|approx|rightarrow|text)\b/g, '$1\\$2')
    .replace(/(^|[^\\\w])(leftrightarrow|rightleftharpoons)\b/g, '$1\\rightleftharpoons')
    .replace(/\bdisplaystylelim\b/g, '\\displaystyle\\lim')
    .replace(/\bmathbbR\b|\bmathbb\{R\}/g, '\\mathbb{R}')
    .replace(/\b(?:ec|vec)\{([A-Za-z])\}/g, '\\vec{$1}')
    .replace(/\bhat\{([ijk])\}/g, '\\hat{$1}')
    .replace(new RegExp(`\\btext(${UNITS}|Sol)\\b`, 'g'), '\\text{$1}')
    .replace(/\b(infty|infinity)\b/g, '\\infty')
    .replace(/\blim_\{([^{}]*?)\s+o\s+([^{}]+)\}/g, '\\lim_{$1 \\to $2}')
    .replace(/\bx\s+o\s+(\\infty|[+-]?\d+)/g, 'x \\to $1')
    .replace(/\b(Delta)\b(?=\s*[A-ZHGS]\b|\s*[=+\-])/g, '\\Delta')
    .replace(/\b(lambda|alpha|beta|gamma|omega|theta|rho|sigma)\b(?=\s*[_^=+\-])/g, '\\$1')
    .replace(/\bmu\b(?=\s*[_^=+\-]|\s*\d)/g, '\\mu')
    .replace(/\bpi\b(?=\s*[_^=+\-*/]|\s*\d)/g, '\\pi')
    .replace(/det\(([^)\n]*?)\blambda\b([^)\n]*?)\)/g, 'det($1\\lambda$2)')
}

function wrapLatexEnvironments(text: string) {
  return text.replace(
    new RegExp(`\\\\begin\\{(${ENVIRONMENTS})\\}([\\s\\S]*?)\\\\end\\{\\1\\}`, 'g'),
    (_, environment, body) => {
      const rows = body
        .trim()
        .replace(/\s*;\s*/g, ' \\\\ ')
        .replace(/\s*\|\s*/g, ' & ')
        .replace(/\\\s+(?=\d|[A-Za-z])/g, ' \\\\ ')
      return `\n\n$$\\begin{${environment}} ${rows} \\end{${environment}}$$\n\n`
    }
  )
}

function wrapExplicitLatex(text: string) {
  let output = text
    .replace(/(det\([^)\n]+\)\s*=\s*[^,.;\n]+)/g, '$$$1$')
    .replace(/(\\vec\{[^{}\n]+\}\s*=\s*\\hat\{[^{}\n]+\}(?:\s*[+\-]\s*\\hat\{[^{}\n]+\})+)/g, '$$$1$')

  output = mapOutsideMath(output, part => part
    .replace(/(\\int(?:_\{?[^}\s]+\}?)?(?:\^\{?[^}\s]+\}?)?\s+[^,.;\n]+?\s+d[a-z]\b)/g, '$$$1$')
    .replace(/(\\begin\{(?:pmatrix|bmatrix|vmatrix|matrix|cases|aligned)\}[\s\S]*?\\end\{(?:pmatrix|bmatrix|vmatrix|matrix|cases|aligned)\})/g, '$$$1$')
    .replace(/(\\(?:d?frac)\{(?:[^{}]|\{[^{}]*\})+\}\{(?:[^{}]|\{[^{}]*\})+\}(?:[A-Za-z](?:[_^]\{?[^}\s]+\}?)?)*)/g, '$$$1$')
    .replace(/(\\sqrt(?:\[[^\]\n]+\])?\{(?:[^{}]|\{[^{}]*\})+\})/g, '$$$1$')
    .replace(/(\d+(?:[,.]\d+)?\s*\\\s*\\text\{[^{}\n]+\}(?:\s*\^\{?[-+]?\d+\}?)?)/g, '$$$1$')
    .replace(/(\\(?:vec|hat|mathbb)\{[^{}\n]+\})/g, '$$$1$')
    .replace(/([A-Za-z0-9_{}^()+\-.,]+\s*\\(?:cdot|times|leq|geq|neq|approx)\s*[A-Za-z0-9_{}^()+\-.,]+)/g, '$$$1$')
    .replace(/(\\(?:Delta|lambda|alpha|beta|gamma|mu|omega|theta|rho|sigma)(?:\s*[_^=+\-]\s*[A-Za-z0-9_{}^+\-]+)?)/g, '$$$1$')
  )
  return output
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
    .replace(/([^\n])\n(?!\n|[a-d]\)|[ivx]+\)|Datos?[.:]|Dato[.:]|[A-Z]\.|[0-9]+[.)]|[-\u2022]|\$\$)/gi, '$1 ')
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
    .replace(/(^|\n)\s*((?:[1-9]\d*)\.(?:[1-9]\d*)\.\s*(?:\([^)]+puntos?\))?)/gi, '$1**$2**')
    .replace(/(^|\n)\s*(([A-Z])\.(?:[1-9]\d*)\.\s*(?:\([^)]+puntos?\))?)/g, '$1**$2**')
    .replace(/(^|\n)\s*([a-d]\))/gi, '$1**$2**')
    .replace(/(^|\n)\s*([A-D]\.[1-9]\.)/g, '$1**$2**')
    .replace(/(^|\n)\s*((?:Datos?|Dato)[.:])/gi, '$1**$2**')
    .replace(/(^|\n)\s*([ivx]+\))/gi, '$1**$2**')
    .replace(/(\*\*(?:[1-9]\d*)\.(?:[1-9]\d*)\.\*\*)\s*(\([^)]+puntos?\))/gi, '$1 **$2**')
    .replace(/(\*\*[A-D]\.(?:[1-9]\d*)\.\*\*)\s*(\([^)]+puntos?\))/g, '$1 **$2**')
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
