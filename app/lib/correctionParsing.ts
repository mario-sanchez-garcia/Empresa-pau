import { correctionJsonToMarkdownWithOptions, parseCorrectionJson } from './correctionPrompt'
import { splitWhyExplanationMarkdown } from './whyExplanation'

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
      const recovered = recoverMalformedCorrectionMarkdown(text)
      if (recovered) return recovered
      return 'No hemos podido formatear esta corrección automáticamente, pero tus datos están guardados. Vuelve a intentarlo para regenerar una corrección limpia.'
    }
    return text && !/^#{1,6}\s/m.test(text) ? `# Corrección de Kairo\n\n${text}` : text
  }

  return ''
}

export function splitCorrectionTheory(markdown: string) {
  const { main, why } = splitWhyExplanationMarkdown(markdown)
  return {
    correction: main,
    theory: why,
  }
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

function recoverMalformedCorrectionMarkdown(value: string) {
  const feedback = extractJsonString(value, 'feedback_general')
  const strengths = extractJsonStringArray(value, 'fortalezas')
  const errors = extractJsonStringArray(value, 'errores_principales')
  const detail = extractJsonString(value, 'correccion_detalle')
  const modelAnswer = extractJsonString(value, 'solucion_orientativa') || extractJsonString(value, 'solucion_correcta_corta')
  const advice = extractJsonString(value, 'consejo_especifico') || extractJsonString(value, 'consejo_para_mejorar')
  const theory = extractJsonString(value, 'teoria_ejercicio')
  const why = extractJsonString(value, 'porqueEsAsi') || extractJsonString(value, 'whyExplanation')
  const hasUsefulContent = Boolean(feedback || strengths.length || errors.length || detail || modelAnswer || advice || theory || why)

  const sections = [
    feedback ? `# Corrección de Kairo\n\n${feedback}` : '# Corrección de Kairo',
    strengths.length ? `## Lo que está bien\n\n${strengths.map(item => `- ${item}`).join('\n')}` : '',
    errors.length ? `## Errores o mejoras\n\n${errors.map(item => `- ${item}`).join('\n')}` : '',
    detail ? `## Corrección paso a paso\n\n${detail}` : '',
    modelAnswer ? `## Respuesta modelo\n\n${modelAnswer}` : '',
    advice ? `## Consejo final\n\n${advice}` : '',
    (why || theory) ? `## ¿Por qué es así?\n\n${why || theory}` : '',
  ].filter(Boolean)

  return hasUsefulContent ? sections.join('\n\n') : ''
}

function extractJsonString(value: string, key: string) {
  const match = value.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`))
  if (!match) return ''
  return decodeJsonString(match[1])
}

function extractJsonStringArray(value: string, key: string) {
  const match = value.match(new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`))
  if (!match) return []

  return Array.from(match[1].matchAll(/"((?:[^"\\]|\\.)*)"/g))
    .map(item => decodeJsonString(item[1]))
    .filter(Boolean)
}

function decodeJsonString(value: string) {
  const parsed = parseCorrectionJson(`{"value":"${value}"}`)
  return typeof parsed?.value === 'string' ? parsed.value : value
}

function isPlainRecord(value: unknown): value is PlainRecord {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}
