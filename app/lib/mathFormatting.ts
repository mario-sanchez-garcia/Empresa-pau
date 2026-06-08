const MATH_TOKEN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g

export function formatExamText(input?: string | null) {
  if (!input) return ''

  let text = normalizePdfGlyphs(input)
  text = formatBrokenMathBlocks(text)
  text = formatLinearSystems(text)
  text = normalizeSoftLineBreaks(text)
  text = mapOutsideMath(text, formatScientificNotation)
  text = mapOutsideMath(text, formatCommonMathExpressions)
  text = mapOutsideMath(text, formatChemicalNotation)
  text = mapOutsideMath(text, formatExamStructure)

  return text
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n(?!\n)/g, '  \n')
    .trim()
}

function formatExamStructure(text: string) {
  return text
    .replace(/(^|\n)\s*([a-d]\))/gi, '$1**$2**')
    .replace(/(^|\n)\s*((?:Datos?|Dato)[.:])/gi, '$1**$2**')
    .replace(/(^|\n)\s*([ivx]+\))/gi, '$1**$2**')
}

function mapOutsideMath(text: string, formatter: (value: string) => string) {
  return text
    .split(MATH_TOKEN)
    .map(part => part.startsWith('$') ? part : formatter(part))
    .join('')
}

function normalizePdfGlyphs(text: string) {
  return text
    .replace(/\u00ad/g, '')
    .replace(/\t/g, ' ')
    .replace(/\uf0b4|×/g, ' · ')
    .replace(/\uf0d7|∙|⋅|ꞏ/g, ' · ')
    .replace(/\uf0ae|\uf022|\uf0a2/g, '→')
    .replace(/\uf044|\uf0c4/g, '⇄')
    .replace(/\uf02d/g, '-')
    .replace(/\uf06c/g, 'λ')
    .replace(/\uf020/g, ' ')
    .replace(/\uf072/g, '')
    .replace(/\uf6da/g, '')
    .replace(/\u20d7\s*([ijk])/g, ' $\\vec{$1}$')
    .replace(//g, '⇄')
    .replace(//g, '→')
    .replace(//g, '-')
    .replace(//g, ' · ')
    .replace(//g, ' · ')
}

function normalizeSoftLineBreaks(text: string) {
  return text
    .replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2')
    .replace(/([^\n])\n(?!\n|[a-d]\)|[ivx]+\)|Datos?[.:]|Dato[.:]|[A-Z]\.|[0-9]+[.)]|[-•]|\$\$)/gi, '$1 ')
}

function formatBrokenMathBlocks(text: string) {
  return text
    .replace(/∫\s*([^\n]+)\n\s*([^\n]+)\n\s*([^\n]+(?:\n[^\n]+){0,3}?)\s*d([a-z])\./g, (_, upper, lower, expr, variable) =>
      '\n\n$$\\int_{' + toLatexExpression(lower) + '}^{' + toLatexExpression(upper) + '} ' + toLatexExpression(expr) + '\\,d' + variable + '$$\n\n'
    )
    .replace(/lim\s*\n\s*x\s*→\s*π\s*\n\s*2\s*\n\s*\(\s*\n\s*tg x\s*\n\s*2\s*\n\s*\)\s*\(\s*1\s*\n\s*cos x\s*\)\s*\./g,
      '\n\n$$\\lim_{x\\to\\pi/2}(\\tan x)^2\\left(\\frac{1}{\\cos x}\\right)$$\n\n'
    )
}

function formatLinearSystems(text: string) {
  return text.replace(
    /r\s*≡\s*\n?\{\s*([^\n]+)\n\s*([^\n]+?)\s+y el plano\s+π\s*≡\s*([^.\n]+)\./g,
    (_, first, second, plane) =>
      '$r \\equiv \\begin{cases} ' + toLatexExpression(first) + ' \\\\ ' + toLatexExpression(second) + ' \\end{cases}$ y el plano $\\pi \\equiv ' + toLatexExpression(plane) + '$.'
  )
}

function formatScientificNotation(text: string) {
  return text
    .replace(/(\d+(?:[,.]\d+)?)\s*[·]\s*10\s*([−-]?\s*\d+)/g, (_, coef, exp) =>
      '$' + coef + ' \\cdot 10^{' + normalizeExponent(exp) + '}$'
    )
    .replace(/10\s*([−-]\s*\d+)/g, (_, exp) => '$10^{' + normalizeExponent(exp) + '}$')
    .replace(/10\s+([3-9]|[1-3]\d)\b/g, (_, exp) => '$10^{' + exp + '}$')
    .replace(/\b([A-Za-z])\s*([₀₁₂₃₄₅₆₇₈₉])\b/g, (_, base, sub) => base + '$_{' + subscriptToNumber(sub) + '}$')
    .replace(/\b([A-Za-z])\s*([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, base, sup) => base + '$^{' + superscriptToText(sup) + '}$')
    .replace(/\b(m|cm|mm|kg|s|C|N|J|W|L|mol|A|T|Hz|atm|V)\s*([−-]\s*\d+)\b/g, (_, unit, exp) =>
      unit + '$^{' + normalizeExponent(exp) + '}$'
    )
    .replace(/\b(m|cm|mm|kg|s|J|W|L|mol|Hz|atm)\s*(\d+)\b/g, (_, unit, exp) => unit + '$^{' + exp + '}$')
}

function formatCommonMathExpressions(text: string) {
  return text
    .replace(/\b([fg])\s*\(\s*x\s*\)\s*=\s*([^,.;\n]+?)(?=\s+y\s+[fg]\s*\(\s*x\s*\)\s*=|,|\.|\n|$)/g, (_, name, expr) =>
      '$' + name + '(x) = ' + toLatexExpression(expr) + '$'
    )
    .replace(/\by\s*=\s*f\s*\(\s*x\s*\)/g, '$y = f(x)$')
    .replace(/\bz\s*[−-]\s*y\s*=\s*0/g, '$z-y=0$')
    .replace(/\b([xyz])(\d+)\b/g, (_, variable, exp) => '$' + variable + '^{' + exp + '}$')
    .replace(/\b(\d+)([xyz])(\d+)\b/g, (_, coef, variable, exp) => '$' + coef + variable + '^{' + exp + '}$')
    .replace(/\bπ\b/g, '$\\pi$')
}

function formatChemicalNotation(text: string) {
  const common = ['H2', 'O2', 'N2', 'Cl2', 'Br2', 'I2', 'F2', 'HCl', 'NaOH', 'KOH', 'NOBr', 'NOCl', 'HBr', 'NaCl', 'KCl', 'KI', 'HCHO', 'CH4', 'COCl2']
  let output = text

  for (const formula of common) {
    output = output.replace(new RegExp('\\b' + formula + '\\b', 'g'), '$' + toLatexChemical(formula) + '$')
  }

  return output.replace(/\b((?:[A-Z][a-z]?\d*|\([A-Za-z0-9+\-]+\)\d*){2,})(\d?[+-])?\b/g, (match, formula, charge) => {
    if (!/\d|\(|\)/.test(match)) return match
    return '$' + toLatexChemical(formula, charge) + '$'
  })
}

function toLatexExpression(expr: string) {
  return expr
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\bf\s*\(\s*x\s*\)/g, 'f(x)')
    .replace(/\bg\s*\(\s*x\s*\)/g, 'g(x)')
    .replace(/\btg\b/g, '\\tan')
    .replace(/\bsen\b/g, '\\sin')
    .replace(/\bln\b/g, '\\ln')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/π/g, '\\pi')
    .replace(/[·∙⋅ꞏ]/g, '\\cdot ')
    .replace(/\b([a-z])(\d+)\b/g, '$1^{$2}')
    .replace(/\b(\d+)([a-z])(\d+)\b/g, '$1$2^{$3}')
    .trim()
}

function toLatexChemical(formula: string, charge?: string) {
  const body = formula
    .replace(/([A-Z][a-z]?|\))(\d+)/g, '$1_$2')
    .replace(/−/g, '-')
  return '\\mathrm{' + body + '}' + (charge ? '^{' + charge.replace('−', '-') + '}' : '')
}

function normalizeExponent(exp: string) {
  return exp.replace(/\s+/g, '').replace('−', '-')
}

function subscriptToNumber(value: string) {
  return '₀₁₂₃₄₅₆₇₈₉'.indexOf(value)
}

function superscriptToText(value: string) {
  const map: Record<string, string> = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
  return value.split('').map(char => map[char] ?? char).join('')
}
