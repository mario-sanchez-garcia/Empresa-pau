export type WhyExplanationStatus = 'generated' | 'needs_review' | 'verified' | 'not_available'

export interface WhyExplanation {
  title?: string
  keyIdea?: string
  whyHere?: string
  method?: string
  studentConnection?: string
  commonMistake?: string
  miniExample?: string
  examTip?: string
  sourcesUsed?: string[]
  status?: WhyExplanationStatus
}

const WHY_HEADING = '¿Por qué es así?'

export function normalizeWhyExplanation(value: unknown): WhyExplanation | null {
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text || text === 'not_available') return null
    return text ? { title: WHY_HEADING, keyIdea: text, status: 'generated' } : null
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const explanation: WhyExplanation = {
    title: WHY_HEADING,
    keyIdea: stringValue(record.keyIdea),
    whyHere: stringValue(record.whyHere),
    method: stringValue(record.method),
    studentConnection: stringValue(record.studentConnection),
    commonMistake: stringValue(record.commonMistake),
    miniExample: stringValue(record.miniExample),
    examTip: stringValue(record.examTip),
    sourcesUsed: Array.isArray(record.sourcesUsed) ? record.sourcesUsed.filter(Boolean).map(String) : undefined,
    status: isWhyStatus(record.status) ? record.status : 'generated',
  }

  if (explanation.status === 'not_available') return null
  return hasWhyContent(explanation) ? explanation : null
}

export function hasWhyContent(value: WhyExplanation | null | undefined) {
  return Boolean(
    value?.keyIdea ||
    value?.whyHere ||
    value?.method ||
    value?.studentConnection ||
    value?.commonMistake ||
    value?.miniExample ||
    value?.examTip
  )
}

export function whyExplanationToMarkdown(value: unknown) {
  const explanation = normalizeWhyExplanation(value)
  if (!explanation) return ''

  return [
    explanation.keyIdea ? `### Idea clave\n${explanation.keyIdea}` : '',
    explanation.whyHere ? `### Por qué se usa aquí\n${explanation.whyHere}` : '',
    explanation.method ? `### Cómo se responde\n${explanation.method}` : '',
    explanation.studentConnection ? `### Qué pasó en tu respuesta\n${explanation.studentConnection}` : '',
    explanation.commonMistake ? `### Error típico PAU\n${explanation.commonMistake}` : '',
    explanation.miniExample ? `### Mini ejemplo\n${explanation.miniExample}` : '',
    explanation.examTip ? `### Cómo escribirlo para sacar puntos\n${explanation.examTip}` : '',
    explanation.sourcesUsed?.length ? `### Fuentes usadas\n${explanation.sourcesUsed.map(source => `- ${source}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n')
}

export function splitWhyExplanationMarkdown(markdown: string) {
  const heading = /^##\s*(?:¿Por qué es así\?|Teoría del ejercicio)\s*$/im
  const match = heading.exec(markdown)

  if (!match) return { main: markdown.trim(), why: '' }

  return {
    main: markdown.slice(0, match.index).trim(),
    why: markdown.slice(match.index + match[0].length).trim(),
  }
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

function isWhyStatus(value: unknown): value is WhyExplanationStatus {
  return value === 'generated' || value === 'needs_review' || value === 'verified' || value === 'not_available'
}
