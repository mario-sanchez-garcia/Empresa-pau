// Lógica pura de generación de canonical_solution (Pieza 2). Sin 'server-only'
// a propósito: la usan tanto la ruta admin (app/api/admin/canonical-solutions/
// generate/route.ts) como scripts/generate-canonical-solutions.ts, que corre
// con `node` fuera de Next y no puede importar ese marcador (lanza un throw
// incondicional si no hay bundler que lo sustituya).

import { createHash } from 'node:crypto'
import Anthropic from '@anthropic-ai/sdk'
import { withAnthropicRetry } from '../ai/withAnthropicRetry.ts'

export const CANONICAL_SOLUTIONS_MODEL = 'claude-sonnet-4-6'
export const CANONICAL_SOLUTION_SCHEMA_VERSION = 1 as const

const MAX_TOKENS = 4000
const MAX_GENERATION_ATTEMPTS = 2

export type CanonicalSolutionStep = { n: number; title: string; content: string }

export type CanonicalSolutionJson = {
  schema_version: 1
  steps: CanonicalSolutionStep[]
  result: string
  method_note: string
}

export type CanonicalSolutionSource = {
  subject: string
  enunciado: string
  officialSolution: string | null
  rubric: string | null
}

export function buildCanonicalSolutionPrompt(source: CanonicalSolutionSource, retryNote?: string): string {
  const { subject, enunciado, officialSolution, rubric } = source
  const base = `Eres un profesor experto en PAU/EvAU. A partir del enunciado y la corrección oficial del ejercicio, genera una explicación paso a paso clara y pedagógica para un alumno de 2º de Bachillerato.

No inventes contenido. Basa cada paso en la corrección oficial. Añade las aclaraciones que un profesor añadiría en clase pero que la corrección oficial no incluye por brevedad.

Todas las fórmulas matemáticas deben escribirse en LaTeX estándar: $...$ para fórmulas en línea, $$...$$ para fórmulas en bloque (con saltos de línea antes y después). No uses \\(...\\) ni \\[...\\] bajo ningún concepto. No hay ningún sistema que corrija el LaTeX después, así que debe ser válido y estar bien formado directamente.

Devuelve EXCLUSIVAMENTE el JSON con el formato acordado (schema_version 1: steps[], result, method_note).

Formato exacto (ejemplo de FORMA, no de contenido):
{
  "schema_version": 1,
  "steps": [
    { "n": 1, "title": "Título breve del paso 1", "content": "Explicación del paso, con LaTeX si hace falta: $x^2 + 1 = 0$" },
    { "n": 2, "title": "Título breve del paso 2", "content": "..." }
  ],
  "result": "Resultado final del ejercicio, en LaTeX si aplica.",
  "method_note": "Nota breve sobre el método o estrategia general usada."
}

Asignatura: ${subject}

Enunciado del ejercicio:
${enunciado}
${officialSolution ? `\nSolución oficial:\n${officialSolution}\n` : ''}
Criterios de corrección oficiales:
${rubric ?? '(no disponibles; resuelve con rigor matemático estándar y explica el razonamiento paso a paso)'}`

  if (!retryNote) return base
  return `${base}\n\nIMPORTANTE: el intento anterior no cumplió el formato exigido (${retryNote}). Corrígelo y devuelve EXCLUSIVAMENTE el JSON válido, con LaTeX bien formado ($...$ / $$...$$, nunca \\(...\\) ni \\[...\\]).`
}

export function computeCanonicalSolutionSourceHash(source: {
  enunciado: string
  officialSolution: string | null
  rubric: string | null
}): string {
  const payload = JSON.stringify([source.enunciado, source.officialSolution ?? '', source.rubric ?? ''])
  return createHash('sha256').update(payload).digest('hex')
}

export function extractJsonBlock(text: string): string | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = fenced ? fenced[1] : text
  const start = candidate.indexOf('{')
  const end = candidate.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  return candidate.slice(start, end + 1)
}

export type ShapeValidation =
  | { valid: true; data: CanonicalSolutionJson }
  | { valid: false; errors: string[] }

export function validateCanonicalSolutionShape(parsed: unknown): ShapeValidation {
  const errors: string[] = []
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, errors: ['root_not_object'] }
  }
  const data = parsed as Record<string, unknown>
  if (data.schema_version !== CANONICAL_SOLUTION_SCHEMA_VERSION) errors.push('schema_version_invalid')

  if (!Array.isArray(data.steps) || data.steps.length === 0) {
    errors.push('steps_missing_or_empty')
  } else {
    data.steps.forEach((step, index) => {
      if (!step || typeof step !== 'object') { errors.push(`step_${index}_not_object`); return }
      const s = step as Record<string, unknown>
      if (typeof s.n !== 'number') errors.push(`step_${index}_n_invalid`)
      if (typeof s.title !== 'string' || !s.title.trim()) errors.push(`step_${index}_title_invalid`)
      if (typeof s.content !== 'string' || !s.content.trim()) errors.push(`step_${index}_content_invalid`)
    })
  }

  if (typeof data.result !== 'string' || !data.result.trim()) errors.push('result_invalid')
  if (typeof data.method_note !== 'string' || !data.method_note.trim()) errors.push('method_note_invalid')

  if (errors.length) return { valid: false, errors }
  return { valid: true, data: data as unknown as CanonicalSolutionJson }
}

// Un $...$/$$...$$ bien formado se extrae entero con este patrón (igual que
// MATH_TOKEN en app/lib/mathFormatting.ts). Lo que sobra después de quitar
// todos los tokens bien formados es, por definición, un "$" sin pareja.
const MATH_TOKEN = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g

export type LatexValidation = { valid: boolean; errors: string[] }

export function validateLatexDelimiters(text: string): LatexValidation {
  const errors: string[] = []
  if (/\\\(|\\\)/.test(text)) errors.push('forbidden_paren_delimiter')
  // (?<!\\)\\\[ excluye "\\[4pt]" (doble backslash + espaciado de fila en
  // matrices/cases), que es sintaxis LaTeX legítima y no un delimitador
  // \[...\] de math display.
  if (/(?<!\\)\\\[/.test(text) || /\\\]/.test(text)) errors.push('forbidden_bracket_delimiter')
  const stripped = text.replace(MATH_TOKEN, '')
  if (stripped.includes('$')) errors.push('unbalanced_dollar_delimiters')
  return { valid: errors.length === 0, errors }
}

function collectLatexErrors(data: CanonicalSolutionJson): string[] {
  const errors: string[] = []
  for (const step of data.steps) {
    const check = validateLatexDelimiters(step.content)
    if (!check.valid) errors.push(...check.errors.map(e => `step_${step.n}_${e}`))
  }
  const resultCheck = validateLatexDelimiters(data.result)
  if (!resultCheck.valid) errors.push(...resultCheck.errors.map(e => `result_${e}`))
  const noteCheck = validateLatexDelimiters(data.method_note)
  if (!noteCheck.valid) errors.push(...noteCheck.errors.map(e => `method_note_${e}`))
  return errors
}

export type CanonicalSolutionGenerationResult =
  | {
    ok: true
    data: CanonicalSolutionJson
    rawText: string
    usage: { inputTokens: number | null; outputTokens: number | null }
    attempts: number
  }
  | {
    ok: false
    reason: 'parse_error' | 'shape_invalid' | 'latex_invalid' | 'provider_error'
    errors: string[]
    rawText: string | null
    attempts: number
  }

export async function generateCanonicalSolutionWithClaude(
  apiKey: string,
  source: CanonicalSolutionSource
): Promise<CanonicalSolutionGenerationResult> {
  const client = new Anthropic({ apiKey, timeout: 55_000 })

  let lastRawText: string | null = null
  let lastErrors: string[] = []
  let lastReason: 'parse_error' | 'shape_invalid' | 'latex_invalid' = 'parse_error'
  let totalInputTokens = 0
  let totalOutputTokens = 0

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    const prompt = buildCanonicalSolutionPrompt(source, attempt > 1 ? lastErrors.join(', ') : undefined)

    let message
    try {
      message = await withAnthropicRetry(() => client.messages.create({
        model: CANONICAL_SOLUTIONS_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [{ role: 'user', content: prompt }],
      }))
    } catch (error) {
      return {
        ok: false,
        reason: 'provider_error',
        errors: [error instanceof Error ? error.message : 'unknown_provider_error'],
        rawText: lastRawText,
        attempts: attempt,
      }
    }

    totalInputTokens += message.usage?.input_tokens ?? 0
    totalOutputTokens += message.usage?.output_tokens ?? 0

    const rawText = message.content[0]?.type === 'text' ? message.content[0].text : ''
    lastRawText = rawText

    const jsonText = rawText ? extractJsonBlock(rawText) : null
    if (!jsonText) {
      lastReason = 'parse_error'
      lastErrors = ['no_json_found']
      continue
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      lastReason = 'parse_error'
      lastErrors = ['json_parse_failed']
      continue
    }

    const shapeResult = validateCanonicalSolutionShape(parsed)
    if (!shapeResult.valid) {
      lastReason = 'shape_invalid'
      lastErrors = shapeResult.errors
      continue
    }

    const latexErrors = collectLatexErrors(shapeResult.data)
    if (latexErrors.length) {
      lastReason = 'latex_invalid'
      lastErrors = latexErrors
      continue
    }

    return {
      ok: true,
      data: shapeResult.data,
      rawText,
      usage: { inputTokens: totalInputTokens || null, outputTokens: totalOutputTokens || null },
      attempts: attempt,
    }
  }

  return { ok: false, reason: lastReason, errors: lastErrors, rawText: lastRawText, attempts: MAX_GENERATION_ATTEMPTS }
}
