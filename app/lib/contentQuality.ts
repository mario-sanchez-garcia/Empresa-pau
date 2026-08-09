const EDITORIAL_PHRASES = [
  'requereix revisio',
  'requiere revision',
  'revision visual',
  'ocr quedo truncado',
  'se anadira proximamente',
  'imagen pendiente',
]

const EDITORIAL_PENDING_PATTERNS = [
  /\b(?:contenido|figura|fuente|grafica|grafico|imagen|ocr|tabla)\s+pendiente\b/,
  /\bpendiente\s+(?:de\s+)?(?:adaptar|anadir|cargar|imagen|insertar|revision|revisar|subir|validar)\b/,
  /\bpendent\s+(?:de\s+)?(?:adaptar|afegir|contingut|figura|font|grafic|imatge|ocr|revisio|taula|validar)\b/,
]

const REVISION_FLAGS = [
  'requireRevision',
  'requiresRevision',
  'requiereRevision',
]

const IMAGE_FLAGS = [
  'requiereImagen',
  'requiresImage',
]

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function hasPendingWithEditorialContext(value: string) {
  return EDITORIAL_PENDING_PATTERNS.some(pattern => pattern.test(value))
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasUsableImage(value: Record<string, unknown>) {
  const imageKeys = ['imagenes', 'images', 'imagen_url', 'imagenFuente', 'fuente']
  return imageKeys.some(key => {
    const candidate = value[key]
    if (Array.isArray(candidate)) return candidate.length > 0
    if (typeof candidate === 'string') return candidate.trim().length > 0
    if (isPlainObject(candidate)) {
      return Boolean(candidate.imagen_url || (Array.isArray(candidate.imagenes_url) && candidate.imagenes_url.length > 0))
    }
    return false
  })
}

function hasInternalIncompleteFlag(value: Record<string, unknown>) {
  if (REVISION_FLAGS.some(flag => value[flag] === true)) return true
  return IMAGE_FLAGS.some(flag => value[flag] === true) && !hasUsableImage(value)
}

export function hasEditorialPlaceholderText(value: unknown, seen = new WeakSet<object>()): boolean {
  if (typeof value === 'string') {
    const normalized = normalizeText(value)
    return EDITORIAL_PHRASES.some(phrase => normalized.includes(phrase)) || hasPendingWithEditorialContext(normalized)
  }

  if (value == null || typeof value !== 'object') return false
  if (seen.has(value)) return false
  seen.add(value)

  if (Array.isArray(value)) {
    return value.some(item => hasEditorialPlaceholderText(item, seen))
  }

  return Object.values(value as Record<string, unknown>).some(item => hasEditorialPlaceholderText(item, seen))
}

export function isIncompleteOfficialExercise(exercise: unknown): boolean {
  if (!isPlainObject(exercise)) return hasEditorialPlaceholderText(exercise)
  return hasInternalIncompleteFlag(exercise) || hasEditorialPlaceholderText(exercise)
}
