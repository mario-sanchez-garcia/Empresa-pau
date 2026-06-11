import { correctionJsonToMarkdownWithOptions, parseCorrectionJson } from './correctionPrompt'

type PlainRecord = Record<string, unknown>

const TECHNICAL_KEYS = new Set([
  'simulacro_id',
  'user_id',
  'route',
  'model',
  'tokens',
  'asignatura',
  'tiempo_empleado_minutos',
  'advertencia_tiempo',
  'dificultad_simulacro',
  'contexto_dificultad',
  'raw',
])

export function parseCorrectionPayload(input: unknown): PlainRecord | null {
  if (isPlainRecord(input)) return input
  if (typeof input !== 'string') return null

  let current = stripCodeFence(input)
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parsed = parseCorrectionJson(current)
    if (isPlainRecord(parsed)) return parsed

    try {
      const direct = JSON.parse(current)
      if (typeof direct === 'string') {
        current = stripCodeFence(direct)
        continue
      }
      if (isPlainRecord(direct)) return direct
    } catch {
      return null
    }
  }

  return null
}

export function correctionPayloadToMarkdown(input: unknown, options: { officialMaxScore?: number } = {}) {
  const parsed = parseCorrectionPayload(input)
  if (parsed) return correctionJsonToMarkdownWithOptions(hideTechnicalFields(parsed), options)

  if (typeof input === 'string') {
    const text = stripCodeFence(input)
    if (looksLikeRawJsonCorrection(text)) {
      return 'No hemos podido formatear esta corrección automáticamente, pero tus datos están guardados. Vuelve a intentarlo para regenerar una corrección limpia.'
    }
    return text
  }

  return ''
}

function hideTechnicalFields(value: PlainRecord): PlainRecord {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !TECHNICAL_KEYS.has(key))
      .map(([key, entry]) => [key, Array.isArray(entry) ? entry.map(cleanNested) : cleanNested(entry)])
  )
}

function cleanNested(value: unknown): unknown {
  if (!isPlainRecord(value)) return value
  return hideTechnicalFields(value)
}

function stripCodeFence(value: string) {
  return value
    .trim()
    .replace(/^```(?:json|markdown)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function looksLikeRawJsonCorrection(value: string) {
  return /^\s*\{/.test(value) || /"(?:feedback_general|errores_principales|plan_repaso|simulacro_id|nota_final)"\s*:/.test(value)
}

function isPlainRecord(value: unknown): value is PlainRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
