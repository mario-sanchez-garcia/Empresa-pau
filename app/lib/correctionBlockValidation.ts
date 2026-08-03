export function sanitizeCorrectionListItem(value: string) {
  const cleaned = value
    .trim()
    .replace(/^(?:[-•]\s*|\*\s+)/, '')
    .replace(/^\*\*(?:Error|Correcci[oó]n|Acierto|Punto fuerte|Mejora)\s*:?\*\*\s*/i, '')
    .replace(/^(?:Error|Correcci[oó]n|Acierto|Punto fuerte|Mejora)\s*:\s*/i, '')
    .replace(/\*\*/g, '')
    .trim()

  return /^[\s\-–—.]+$/.test(cleaned) ? '' : cleaned
}

export function sanitizeCorrectionDisplayText(value: string) {
  return repairTechnicalPlaceholderGaps(value)
    .split('\n')
    .map(line => line.replace(/(:\s*)(?:undefined|null|NaN)\b/gi, '$1').trimEnd())
    .filter(line => !/^\s*(?:undefined|null|NaN)\s*$/i.test(stripMarkdownNoise(line)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

function stripMarkdownNoise(value: string) {
  return value
    .replace(/^[\s>*_`~-]+/, '')
    .replace(/[\s*_`~-]+$/, '')
    .trim()
}

function repairTechnicalPlaceholderGaps(value: string) {
  const lines = value.split('\n')
  return lines.map((line, index) => {
    if (!/^\s*(?:undefined|null|NaN)\s*$/i.test(stripMarkdownNoise(line))) return line

    const previousHeading = findPreviousHeading(lines, index)
    const normalizedHeading = normalizeHeading(previousHeading)
    const previousContent = findPreviousContent(lines, index)
    const normalizedPreviousContent = normalizeHeading(previousContent)

    if (
      normalizedHeading.includes('sistema resultante') ||
      normalizedHeading.includes('sistema queda') ||
      normalizedHeading.includes('sistema lineal') ||
      normalizedHeading.includes('sistema a resolver') ||
      normalizedHeading.includes('sistema de ecuaciones') ||
      normalizedHeading.includes('vector') ||
      normalizedHeading.includes('matriz') ||
      normalizedHeading.includes('determinante') ||
      normalizedPreviousContent.endsWith('el sistema es:') ||
      normalizedPreviousContent.endsWith('el sistema queda:') ||
      normalizedPreviousContent.endsWith('sistema a resolver:') ||
      normalizedPreviousContent.endsWith('las ecuaciones que se montan son:') ||
      normalizedPreviousContent.endsWith('las tres ecuaciones que se montan son:') ||
      normalizedPreviousContent.endsWith('el vector es:') ||
      normalizedPreviousContent.endsWith('la matriz es:') ||
      normalizedPreviousContent.endsWith('el determinante es:') ||
      normalizedPreviousContent.includes('el sistema es:') ||
      normalizedPreviousContent.includes('las ecuaciones que se montan son:') ||
      normalizedPreviousContent.includes('el vector es:') ||
      normalizedPreviousContent.includes('la matriz es:') ||
      normalizedPreviousContent.includes('el determinante es:')
    ) {
      const system = buildSystemFromPreviousEquations(lines, index)
      if (system) return system
      return 'Este paso matemático no se generó correctamente. Reintenta la corrección para obtener el desarrollo completo.'
    }

    if (normalizedHeading.includes('donde se ve en la solucion')) {
      return 'Se ve en las ecuaciones y pasos anteriores de la corrección: primero se traduce cada condición del enunciado y después se resuelve el sistema resultante.'
    }

    return ''
  }).join('\n')
}

function findPreviousHeading(lines: string[], index: number) {
  for (let i = index - 1; i >= 0; i -= 1) {
    const clean = stripMarkdownNoise(lines[i] ?? '')
    if (!clean) continue
    if (/^(#{1,4}\s*)?(sistema resultante|el sistema queda|sistema lineal|sistema de ecuaciones|vector|matriz|determinante|d[oó]nde se ve en la soluci[oó]n|sistema a resolver)\b/i.test(clean)) {
      return clean
    }
    if (/^#{1,4}\s+/.test(clean) && index - i > 1) return clean
  }
  return ''
}

function findPreviousContent(lines: string[], index: number) {
  for (let i = index - 1; i >= 0; i -= 1) {
    const clean = stripMarkdownNoise(lines[i] ?? '')
    if (clean) return clean
  }
  return ''
}

function buildSystemFromPreviousEquations(lines: string[], index: number) {
  const start = Math.max(0, index - 24)
  const candidates = lines.slice(start, index)
    .map(extractEquationLine)
    .filter(Boolean)
    .slice(-4)

  if (candidates.length < 2) return ''
  return `$$\n\\begin{cases}\n${candidates.join(' \\\\\n')}\n\\end{cases}\n$$`
}

function extractEquationLine(line: string) {
  const clean = stripMarkdownNoise(line)
    .replace(/^["“”']+|["“”']+$/g, '')
    .replace(/^\$\$?|\$\$?$/g, '')
    .trim()

  if (!clean.includes('=')) return ''
  if (clean.length > 120) return ''
  if (/[A-Za-zÀ-ÿ]{4,}/.test(clean)) return ''
  return clean
}

function normalizeHeading(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^#{1,4}\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/[¿?]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}
