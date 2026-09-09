export const MAX_CORRECTION_PROMPT_CHARS = 50_000
export const MAX_CORRECTION_ANSWER_CHARS = 50_000
export const MAX_CORRECTION_CONTEXT_CHARS = 60_000
export const MAX_CORRECTION_TEXT_CHARS = 120_000

export type CorrectionTextValidation =
  | { valid: true; totalChars: number }
  | { valid: false; status: 400 | 413; error: string }

export function validateAiPrompt(value: unknown, label = 'La solicitud'): CorrectionTextValidation {
  if (typeof value !== 'string' || !value.trim()) {
    return { valid: false, status: 400, error: `${label} no puede estar vacía.` }
  }
  if (value.length > MAX_CORRECTION_TEXT_CHARS) {
    return { valid: false, status: 413, error: `${label} es demasiado larga.` }
  }
  return { valid: true, totalChars: value.length }
}

export function validateCorrectionTextPayload(input: {
  officialPrompt: string
  studentAnswer: string
  criteria?: string
  sourceText?: string
}): CorrectionTextValidation {
  if (!input.officialPrompt.trim()) return { valid: false, status: 400, error: 'Falta el enunciado del ejercicio.' }
  if (!input.studentAnswer.trim()) return { valid: false, status: 400, error: 'Falta la respuesta del alumno.' }
  if (input.officialPrompt.length > MAX_CORRECTION_PROMPT_CHARS) {
    return { valid: false, status: 413, error: 'El enunciado es demasiado largo para corregirlo de forma segura.' }
  }
  if (input.studentAnswer.length > MAX_CORRECTION_ANSWER_CHARS) {
    return { valid: false, status: 413, error: 'La respuesta es demasiado larga. Divídela en partes más breves.' }
  }
  const contextChars = (input.criteria?.length ?? 0) + (input.sourceText?.length ?? 0)
  if (contextChars > MAX_CORRECTION_CONTEXT_CHARS) {
    return { valid: false, status: 413, error: 'El contexto académico es demasiado largo para esta corrección.' }
  }
  const totalChars = input.officialPrompt.length + input.studentAnswer.length + contextChars
  if (totalChars > MAX_CORRECTION_TEXT_CHARS) {
    return { valid: false, status: 413, error: 'La corrección supera el tamaño máximo permitido.' }
  }
  return { valid: true, totalChars }
}
