import { examenes } from '../../data/examenes'
import { examenesBiologia } from '../../data/biologia'
import { examenesFisica } from '../../data/fisica'
import { examenesHistoriaFilosofiaMadrid } from '../../data/historia_filosofia_madrid'
import { examenesIngles } from '../../data/ingles'
import { examenesLengua } from '../../data/lengua'
import { examenesMatematicasCCSSMadrid } from '../../data/matematicas_ccss_madrid'
import { examenesQuimica } from '../../data/quimica'

type CaminoExamSubject = 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'historia_filosofia' | 'ingles'
type MatchLevel = 'topic' | 'block' | 'keyword' | 'subject_fallback'

interface ExamQuestion {
  id?: string
  bloque?: string
  opcion?: string
  enunciado?: string
  criterios?: string
  label?: string
  tema?: string
  titulo?: string
  texto?: string
  problema?: string
  autor?: string
}

interface ExamLike {
  id?: number | string
  año: number
  tipo: string
  asignatura?: string
  comunidad?: string
  ccaa?: string
  preguntas?: ExamQuestion[]
}

interface ExerciseCandidate {
  subject: CaminoExamSubject
  exerciseId: string
  examId: string
  year: number
  convocatoria: string
  blockSlug: string
  topicSlug: string
  questionIndex: number
  text: string
}

export interface RandomEvauExerciseQuery {
  subject?: string | null
  community?: string | null
  block?: string | null
  blockSlug?: string | null
  topic?: string | null
  topicSlug?: string | null
  missionId?: string | null
  recentExerciseIds?: string[]
  avoidRecent?: boolean
}

export interface RandomEvauExerciseResult {
  subject: CaminoExamSubject
  exerciseId: string
  examId: string
  year: number
  convocatoria: string
  blockSlug: string
  topicSlug: string
  questionIndex: number
  matchLevel: MatchLevel
  warning?: string
  targetUrl: string
}

const RECENT_LIMIT = 8

const TOPIC_KEYWORDS: Record<string, string[]> = {
  algebra: ['matriz', 'matrices', 'determinante', 'rango', 'sistema', 'gauss', 'cramer', 'programacion lineal', 'restricciones'],
  analisis: ['funcion', 'derivada', 'derivar', 'continuidad', 'limite', 'tangente', 'crecimiento', 'decrecimiento', 'maximo', 'minimo', 'optimizacion'],
  integrales: ['integral', 'integrales', 'primitiva', 'area', '\\int'],
  geometria: ['vector', 'recta', 'plano', 'producto vectorial', 'distancia', 'angulo', 'perpendicular', 'paralelo'],
  probabilidad: ['probabilidad', 'suceso', 'sucesos', 'bayes', 'binomial', 'normal', 'tipificacion', 'independientes'],
  estadistica: ['intervalo', 'confianza', 'muestra', 'proporcion', 'media muestral', 'contraste'],
  sintaxis: ['sintaxis', 'sintactico', 'subordinada', 'coordinada', 'oracion', 'nexo', 'funcion sintactica'],
  comentario: ['comentario', 'texto', 'tesis', 'argumento', 'cohesion', 'adecuacion', 'modalizacion', 'resumen'],
  literatura: ['modernismo', 'generacion del 98', 'novecentismo', 'generacion del 27', 'posguerra', 'literatura', 'teatro'],
  reading: ['reading', 'comprension', 'comprehension', 'true', 'false', 'find words', 'text'],
  writing: ['writing', 'essay', 'composition', 'opinion', 'write'],
  restauracion: ['restauracion', 'turno pacifico', 'canovas', 'alfonso xii', 'caciquismo'],
  republica: ['republica', 'constitucion de 1931', 'bienio', 'frente popular'],
  franquismo: ['franquismo', 'franco', 'dictadura', 'autarquia', 'desarrollismo'],
  platon: ['platon', 'republica', 'ideas', 'caverna'],
  descartes: ['descartes', 'metodo', 'cogito', 'duda'],
  kant: ['kant', 'critica', 'imperativo', 'razon'],
  hume: ['hume', 'empirismo', 'causalidad'],
  marx: ['marx', 'alienacion', 'materialismo'],
  campo: ['campo', 'gravitatorio', 'electrico', 'magnetico', 'fuerza', 'potencial'],
  ondas: ['onda', 'ondas', 'frecuencia', 'longitud de onda', 'interferencia', 'optica'],
  equilibrio: ['equilibrio', 'constante', 'le chatelier'],
  acido_base: ['acido', 'base', 'ph', 'volumetria'],
  redox: ['redox', 'oxidacion', 'reduccion', 'electrolisis'],
}

const SUBJECT_FALLBACK_LABELS: Record<CaminoExamSubject, string> = {
  mates: 'Matematicas II',
  matematicas_ccss: 'Matematicas CCSS',
  fisica: 'Fisica',
  quimica: 'Quimica',
  biologia: 'Biologia',
  lengua: 'Lengua',
  historia: 'Historia',
  historia_filosofia: 'Historia de la Filosofia',
  ingles: 'Ingles',
}

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function slugifyEvauParam(value?: string | null) {
  return normalizeText(value ?? '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function normalizeCaminoExamSubject(value?: string | null): CaminoExamSubject | null {
  const slug = slugifyEvauParam(value).replace(/-/g, '_')
  if (slug === 'mates' || slug === 'matematicas_ii' || slug === 'matematicas') return 'mates'
  if (slug === 'matematicas_ccss' || slug === 'matematicas_sociales' || slug === 'matematicas_aplicadas_ccss') return 'matematicas_ccss'
  if (slug === 'fisica') return 'fisica'
  if (slug === 'quimica') return 'quimica'
  if (slug === 'biologia') return 'biologia'
  if (slug === 'lengua' || slug === 'lengua_castellana') return 'lengua'
  if (slug === 'historia' || slug === 'historia_de_espana') return 'historia'
  if (slug === 'historia_filosofia' || slug === 'filosofia' || slug === 'historia_de_la_filosofia') return 'historia_filosofia'
  if (slug === 'ingles' || slug === 'english') return 'ingles'
  return null
}

function textForQuestion(question: ExamQuestion) {
  return `${question.bloque ?? ''} ${question.label ?? ''} ${question.titulo ?? ''} ${question.tema ?? ''} ${question.autor ?? ''} ${question.problema ?? ''} ${question.enunciado ?? ''} ${question.texto ?? ''} ${question.criterios ?? ''}`
}

function inferTopicSlug(blockSlug: string, text: string) {
  const normalized = normalizeText(text)
  const topic = Object.entries(TOPIC_KEYWORDS).find(([, words]) =>
    words.some(word => normalized.includes(normalizeText(word)))
  )?.[0]

  return topic ?? blockSlug
}

function normalizeBlockSlug(question: ExamQuestion, subject: CaminoExamSubject) {
  const explicitBlock = slugifyEvauParam(question.bloque)
  const text = normalizeText(textForQuestion(question))

  if (subject === 'mates') {
    if (explicitBlock.includes('algebra')) return 'algebra'
    if (explicitBlock.includes('analisis')) return 'analisis'
    if (explicitBlock.includes('geometria')) return 'geometria'
    if (explicitBlock.includes('probabilidad')) return 'probabilidad'
  }

  if (TOPIC_KEYWORDS.algebra.some(word => text.includes(normalizeText(word)))) return 'algebra'
  if (TOPIC_KEYWORDS.integrales.some(word => text.includes(normalizeText(word)))) return 'analisis'
  if (TOPIC_KEYWORDS.analisis.some(word => text.includes(normalizeText(word)))) return 'analisis'
  if (TOPIC_KEYWORDS.estadistica.some(word => text.includes(normalizeText(word)))) return 'probabilidad'
  if (TOPIC_KEYWORDS.probabilidad.some(word => text.includes(normalizeText(word)))) return 'probabilidad'
  if (subject === 'mates' && TOPIC_KEYWORDS.geometria.some(word => text.includes(normalizeText(word)))) return 'geometria'
  if (subject === 'lengua' && TOPIC_KEYWORDS.sintaxis.some(word => text.includes(normalizeText(word)))) return 'reflexion-lengua'
  if (subject === 'lengua' && TOPIC_KEYWORDS.comentario.some(word => text.includes(normalizeText(word)))) return 'comunicacion'
  if (subject === 'lengua' && TOPIC_KEYWORDS.literatura.some(word => text.includes(normalizeText(word)))) return 'educacion-literaria'
  if (subject === 'ingles' && TOPIC_KEYWORDS.writing.some(word => text.includes(normalizeText(word)))) return 'writing'
  if (subject === 'ingles') return 'reading'
  if (subject === 'historia_filosofia') return explicitBlock || 'filosofia'
  return explicitBlock || 'ejercicio'
}

function sourceForSubject(subject: CaminoExamSubject): ExamLike[] {
  if (subject === 'matematicas_ccss') return examenesMatematicasCCSSMadrid as ExamLike[]
  if (subject === 'fisica') return examenesFisica as ExamLike[]
  if (subject === 'quimica') return examenesQuimica as ExamLike[]
  if (subject === 'biologia') return examenesBiologia as ExamLike[]
  if (subject === 'lengua') return examenesLengua as ExamLike[]
  if (subject === 'ingles') return examenesIngles as ExamLike[]
  if (subject === 'historia') return (examenes as ExamLike[]).filter(exam => exam.asignatura === 'Historia de España')
  if (subject === 'historia_filosofia') {
    return examenesHistoriaFilosofiaMadrid.map(exam => ({
      id: exam.id,
      año: exam.anio,
      tipo: exam.convocatoria === 'extraordinaria' ? 'Extraordinaria' : 'Ordinaria',
      comunidad: exam.comunidad,
      preguntas: [
        ...exam.textos.flatMap(texto => texto.preguntas.map(pregunta => ({
          id: `${exam.id}-${texto.opcion}-${pregunta.id}`,
          bloque: pregunta.bloque ?? texto.problema,
          label: pregunta.titulo,
          tema: texto.problema,
          enunciado: `${texto.autor}. ${pregunta.enunciado}`,
          criterios: texto.solucionOrientativa ?? exam.criteriosGenerales?.join('\n') ?? '',
          autor: texto.autor,
          problema: texto.problema,
          texto: texto.texto,
        }))),
        ...(exam.preguntasComunes ?? []).map(pregunta => ({
          id: `${exam.id}-comun-${pregunta.id}`,
          bloque: pregunta.bloque,
          label: pregunta.titulo,
          tema: pregunta.bloque,
          enunciado: pregunta.enunciado,
          criterios: exam.criteriosGenerales?.join('\n') ?? '',
        })),
      ],
    }))
  }
  return (examenes as ExamLike[]).filter(exam => exam.asignatura === 'Matemáticas II')
}

function flattenCandidates(subject: CaminoExamSubject, community = 'Madrid'): ExerciseCandidate[] {
  return sourceForSubject(subject)
    .filter(exam => (exam.comunidad ?? exam.ccaa) === community && Array.isArray(exam.preguntas))
    .flatMap(exam => (exam.preguntas ?? []).map((question, questionIndex) => {
      const text = textForQuestion(question)
      const blockSlug = normalizeBlockSlug(question, subject)
      const topicSlug = inferTopicSlug(blockSlug, text)
      return {
        subject,
        exerciseId: String(question.id ?? `${exam.id}-${questionIndex}`),
        examId: String(exam.id ?? `${exam.año}-${exam.tipo}`),
        year: exam.año,
        convocatoria: exam.tipo,
        blockSlug,
        topicSlug,
        questionIndex,
        text: normalizeText(text),
      }
    }))
}

function topicFamily(topicSlug: string) {
  if (topicSlug.includes('integral') || topicSlug.includes('area')) return 'integrales'
  if (topicSlug.includes('deriv') || topicSlug.includes('optimiz') || topicSlug.includes('limite') || topicSlug.includes('continuidad')) return 'analisis'
  if (topicSlug.includes('matriz') || topicSlug.includes('sistema') || topicSlug.includes('gauss') || topicSlug.includes('lineal')) return 'algebra'
  if (topicSlug.includes('bayes') || topicSlug.includes('normal') || topicSlug.includes('probabilidad')) return 'probabilidad'
  if (topicSlug.includes('intervalo') || topicSlug.includes('confianza') || topicSlug.includes('estadistica')) return 'estadistica'
  if (topicSlug.includes('vector') || topicSlug.includes('plano') || topicSlug.includes('geometria')) return 'geometria'
  if (topicSlug.includes('sintaxis') || topicSlug.includes('oracion') || topicSlug.includes('subordin')) return 'sintaxis'
  if (topicSlug.includes('comentario') || topicSlug.includes('texto') || topicSlug.includes('comunicacion')) return 'comentario'
  if (topicSlug.includes('literatura') || topicSlug.includes('generacion') || topicSlug.includes('modernismo') || topicSlug.includes('teatro')) return 'literatura'
  if (topicSlug.includes('writing') || topicSlug.includes('essay')) return 'writing'
  if (topicSlug.includes('reading') || topicSlug.includes('comprension')) return 'reading'
  if (topicSlug.includes('restauracion')) return 'restauracion'
  if (topicSlug.includes('republica')) return 'republica'
  if (topicSlug.includes('franquismo')) return 'franquismo'
  if (topicSlug.includes('platon')) return 'platon'
  if (topicSlug.includes('descartes')) return 'descartes'
  if (topicSlug.includes('kant')) return 'kant'
  if (topicSlug.includes('hume')) return 'hume'
  if (topicSlug.includes('marx')) return 'marx'
  if (topicSlug.includes('campo')) return 'campo'
  if (topicSlug.includes('onda') || topicSlug.includes('optica')) return 'ondas'
  if (topicSlug.includes('equilibrio')) return 'equilibrio'
  if (topicSlug.includes('acido') || topicSlug.includes('ph')) return 'acido_base'
  if (topicSlug.includes('redox')) return 'redox'
  return topicSlug
}

function filteredByRecent(candidates: ExerciseCandidate[], recentExerciseIds: string[], avoidRecent = true) {
  if (!avoidRecent || !recentExerciseIds.length || candidates.length <= 1) return candidates
  const recent = new Set(recentExerciseIds.slice(-RECENT_LIMIT))
  const fresh = candidates.filter(candidate => !recent.has(candidate.exerciseId))
  return fresh.length ? fresh : candidates
}

function pickRandom(candidates: ExerciseCandidate[]) {
  return candidates[Math.floor(Math.random() * candidates.length)]
}

function pickLeastRecent(candidates: ExerciseCandidate[], recentExerciseIds: string[], avoidRecent = true) {
  if (!avoidRecent || !recentExerciseIds.length || candidates.length <= 1) return pickRandom(candidates)
  const recent = recentExerciseIds.slice(-RECENT_LIMIT)
  const recentOrder = new Map(recent.map((id, index) => [id, index]))
  const unseen = candidates.filter(candidate => !recentOrder.has(candidate.exerciseId))
  if (unseen.length) return pickRandom(unseen)
  const oldestIndex = Math.min(...candidates.map(candidate => recentOrder.get(candidate.exerciseId) ?? -1))
  return pickRandom(candidates.filter(candidate => (recentOrder.get(candidate.exerciseId) ?? -1) === oldestIndex))
}

function scoreCandidates(candidates: ExerciseCandidate[], blockSlug: string, topicSlug: string) {
  const family = topicFamily(topicSlug)
  const topicMatches = candidates.filter(candidate => candidate.topicSlug === family)
  if (topicMatches.length) return { candidates: topicMatches, matchLevel: 'topic' as const }

  const blockMatches = candidates.filter(candidate => candidate.blockSlug === blockSlug || candidate.blockSlug === family)
  if (blockMatches.length) return { candidates: blockMatches, matchLevel: 'block' as const }

  const keywords = TOPIC_KEYWORDS[family] ?? []
  const keywordMatches = keywords.length
    ? candidates.filter(candidate => keywords.some(word => candidate.text.includes(normalizeText(word))))
    : []
  if (keywordMatches.length) return { candidates: keywordMatches, matchLevel: 'keyword' as const }

  return { candidates, matchLevel: 'subject_fallback' as const }
}

export function getRandomEvauExerciseForMission(query: RandomEvauExerciseQuery): RandomEvauExerciseResult | null {
  const subject = normalizeCaminoExamSubject(query.subject)
  if (!subject) return null

  const blockSlug = topicFamily(slugifyEvauParam(query.blockSlug ?? query.block))
  const topicSlug = topicFamily(slugifyEvauParam(query.topicSlug ?? query.topic))
  const allCandidates = flattenCandidates(subject, query.community ?? 'Madrid')
  if (!allCandidates.length) return null

  const scored = scoreCandidates(allCandidates, blockSlug, topicSlug)
  const candidates = filteredByRecent(scored.candidates, query.recentExerciseIds ?? [], query.avoidRecent)
  const selected = pickLeastRecent(candidates, query.recentExerciseIds ?? [], query.avoidRecent)
  const warning = scored.matchLevel === 'subject_fallback'
    ? `Todavía no tenemos un ejercicio PAU específico de este tema. Te mostramos uno relacionado con ${SUBJECT_FALLBACK_LABELS[subject]}.`
    : undefined
  const params = new URLSearchParams({
    subject,
    mode: 'selected',
    source: 'camino_pau',
    exerciseId: selected.exerciseId,
    year: String(selected.year),
    call: selected.convocatoria,
    block: selected.blockSlug,
    topic: selected.topicSlug,
    matchLevel: scored.matchLevel,
  })
  if (query.missionId) params.set('missionId', query.missionId)

  return {
    ...selected,
    matchLevel: scored.matchLevel,
    warning,
    targetUrl: `/?${params.toString()}`,
  }
}

export function rememberRecentEvauExerciseIds(current: string[], exerciseId: string) {
  return [...current.filter(id => id !== exerciseId), exerciseId].slice(-RECENT_LIMIT)
}
