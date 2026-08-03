export const CORRECTION_BLOCK_FALLBACK = 'Esta parte de la corrección no pudo generarse. Reinténtalo.'

export type CorrectionBlockId = 'nota-resumen' | 'aciertos-errores' | 'paso-a-paso' | 'teoria-final'

export interface CorrectionBlockValidation {
  valid: boolean
  blockNumber: number
  missingFields: string[]
  forbiddenLiterals: string[]
  parseError: boolean
  truncated: boolean
}

const BLOCK_REQUIREMENTS: Record<CorrectionBlockId, string[]> = {
  'nota-resumen': ['## Resumen y nota estimada', 'Nota:'],
  'aciertos-errores': ['## Puntos fuertes', '## Errores a corregir'],
  'paso-a-paso': ['## Corrección paso a paso'],
  'teoria-final': ['## ¿Por qué es así?', '## Recomendación final'],
}

const BLOCK_NUMBERS: Record<CorrectionBlockId, number> = {
  'nota-resumen': 1,
  'aciertos-errores': 2,
  'paso-a-paso': 3,
  'teoria-final': 4,
}

const VISIBLE_TECHNICAL_LITERAL = /\b(undefined|null|NaN)\b/gi

export function isCorrectionBlockId(value: string): value is CorrectionBlockId {
  return value in BLOCK_REQUIREMENTS
}

export function validateCorrectionBlock(blockId: string, text: string, truncated: boolean): CorrectionBlockValidation {
  const id = isCorrectionBlockId(blockId) ? blockId : 'nota-resumen'
  const cleanedText = stripCodeFence(text).trim()
  const missingFields = BLOCK_REQUIREMENTS[id].filter(requirement => !hasRequirement(cleanedText, requirement))
  const forbiddenLiterals = Array.from(new Set(
    Array.from(cleanedText.matchAll(VISIBLE_TECHNICAL_LITERAL)).map(match => match[1])
  ))
  const parseError = looksLikeJson(cleanedText) && !canParseJson(stripCodeFence(cleanedText))
  const valid = Boolean(cleanedText) && !truncated && missingFields.length === 0 && forbiddenLiterals.length === 0 && !parseError

  return {
    valid,
    blockNumber: BLOCK_NUMBERS[id],
    missingFields: cleanedText ? missingFields : ['empty_response'],
    forbiddenLiterals,
    parseError,
    truncated,
  }
}

export function buildCorrectionBlockLog(
  requestId: string,
  validation: CorrectionBlockValidation,
  extra: { retry?: boolean } = {}
) {
  const parts = [
    `[correction-block] requestId=${requestId}`,
    `block=${validation.blockNumber}`,
    `valid=${validation.valid}`,
    `truncated=${validation.truncated}`,
  ]

  if (validation.missingFields.length) parts.push(`missing_fields=${validation.missingFields.join('|')}`)
  if (validation.forbiddenLiterals.length) parts.push(`forbidden_literals=${validation.forbiddenLiterals.join('|')}`)
  if (validation.parseError) parts.push('parse_error=true')
  if (extra.retry) parts.push('retry=true')

  return parts.join(' ')
}

export function sanitizeCorrectionListItem(value: string) {
  return value
    .trim()
    .replace(/^(?:[-•]\s*|\*\s+)/, '')
    .replace(/^\*\*(?:Error|Correcci[oó]n|Acierto|Punto fuerte|Mejora)\s*:?\*\*\s*/i, '')
    .replace(/^(?:Error|Correcci[oó]n|Acierto|Punto fuerte|Mejora)\s*:\s*/i, '')
    .replace(/\*\*/g, '')
    .trim()
}

export function sanitizeCorrectionDisplayText(value: string) {
  return value
    .split('\n')
    .map(line => line.replace(/(:\s*)(?:undefined|null|NaN)\b/gi, '$1').trimEnd())
    .filter(line => !/^\s*(?:undefined|null|NaN)\s*$/i.test(stripMarkdownNoise(line)))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}

export function containsVisibleTechnicalLiteral(text: string) {
  return /\b(?:undefined|null|NaN)\b/i.test(text)
}

function hasRequirement(text: string, requirement: string) {
  if (requirement.startsWith('## ')) {
    const escapedHeading = escapeRegExp(requirement.replace(/^##\s*/, '').trim())
    return new RegExp(`^##\\s+${escapedHeading}\\s*$`, 'im').test(text)
  }

  return text.toLowerCase().includes(requirement.toLowerCase())
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function stripMarkdownNoise(value: string) {
  return value
    .replace(/^[\s>*_`~-]+/, '')
    .replace(/[\s*_`~-]+$/, '')
    .trim()
}

function looksLikeJson(value: string) {
  return /^\s*\{/.test(value) || /^```json/i.test(value)
}

function canParseJson(value: string) {
  try {
    JSON.parse(value)
    return true
  } catch {
    return false
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
