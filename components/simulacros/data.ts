import { Atom, BarChart3, BookOpen, Dna, FlaskConical, Globe, Landmark, Sigma } from 'lucide-react'
import { examenes, examenesHistoria } from '@/app/data/examenes'
import { examenesFisica } from '@/app/data/fisica'
import { examenesQuimica } from '@/app/data/quimica'
import { examenesLengua } from '@/app/data/lengua'
import { examenesIngles } from '@/app/data/ingles'
import { BIOLOGIA_TOPICS, examenesBiologia } from '@/app/data/biologia'
import { examenesFisicaCataluna } from '@/app/data/fisica_cataluna'
import { examenesQuimicaCataluna } from '@/app/data/quimica_cataluna'
import { examenesLenguaCataluna } from '@/app/data/lengua_cataluna'
import { examenesCataluna } from '@/app/data/examenes_cataluna'
import { examenesMatematicasCCSSMadrid, MATEMATICAS_CCSS_LABEL } from '@/app/data/matematicas_ccss_madrid'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'
import { normalizeBlockKey } from '@/app/lib/simulacros/blockNormalization'
import type { SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroSubject } from './types'

type SimulacroYearSelection = 'all' | SimulacroDifficulty
type SimulacroOptionSelection = 'mixed' | SimulacroOption

interface GenerateSimulacroSettings {
  yearSelection?: SimulacroYearSelection
  optionSelection?: SimulacroOptionSelection
  blockFilter?: string
  // Historia only, and only once a Parcial's exam_topics rows are known —
  // when set, replaces the año/dificultad selection entirely (topic-based
  // selection, not "instead of AND also"): pulls straight from the topics
  // the student picked with the chip selector rather than a random exam by
  // year. The theme/format diversity loop below (cuestiones/fuente/tema/
  // texto) still runs unchanged, just over this narrower pool.
  historiaTopicSlugs?: string[]
}

export const SUBJECTS = {
  mates: { label: 'Matemáticas II', short: 'Mates', color: '#2563eb', light: '#eff6ff', icon: Sigma, available: true },
  matematicas_ccss: { label: MATEMATICAS_CCSS_LABEL, short: 'Matemáticas CCSS', color: '#7c3aed', light: '#f5f3ff', icon: BarChart3, available: false },
  fisica: { label: 'Física', short: 'Física', color: '#CA8A04', light: '#FEFCE8', icon: Atom, available: true },
  quimica: { label: 'Química', short: 'Química', color: '#ea580c', light: '#fff7ed', icon: FlaskConical, available: true },
  biologia: { label: 'Biología', short: 'Bio', color: '#4d7c0f', light: '#f7fee7', icon: Dna, available: true },
  ingles: { label: 'Inglés', short: 'Inglés', color: '#0891B2', light: '#CFFAFE', icon: Globe, available: true },
  lengua: { label: 'Lengua Castellana y Literatura II', short: 'Lengua', color: '#0284C7', light: '#E0F2FE', icon: BookOpen, available: true },
  historia: { label: 'Historia de España', short: 'Historia', color: '#2f6f4e', light: '#f0fdf4', icon: Landmark, available: true }
} as const

const CATALUNYA_SIMULACRO_SUBJECTS = new Set<SimulacroSubject>(['fisica', 'quimica', 'lengua', 'historia'])

export function isSubjectAvailableForCommunity(subject: SimulacroSubject, comunidad: string) {
  return SUBJECTS[subject].available && (comunidad !== 'Cataluña' || CATALUNYA_SIMULACRO_SUBJECTS.has(subject))
}

export const DIFFICULTIES: Array<{ id: SimulacroDifficulty; label: SimulacroDifficulty; description: string }> = [
  { id: 'Fácil', label: 'Fácil', description: 'Convocatorias más antiguas, preguntas más directas' },
  { id: 'Media', label: 'Media', description: 'Convocatorias intermedias, dificultad estándar' },
  { id: 'Difícil', label: 'Difícil', description: 'Convocatorias más recientes, máxima exigencia' }
]

// Todos los bloques que existen de verdad en cada asignatura, en el orden en
// que se presentan al alumno. Varias asignaturas tienen 5 bloques (como el
// examen oficial) y el simulacro elige 4, así que esta lista NO es "los 4 que
// entran": ver la selección aleatoria en generateSimulacro. Faltaban aquí
// bloques enteros con material real —Física 'RadioactividadModerna' (51
// ejercicios), Química 'Pregunta5' (46), Inglés 'Q3'/Vocabulary (65)— que por
// eso no aparecían nunca en un simulacro, pese a estar ya reconocidos en
// app/lib/simulacros/blockNormalization.ts y usarse en la práctica de Camino.
// Matemáticas CCSS listaba temas ('Algebra', 'Analisis'…) que su dataset no
// usa: sus bloques son posicionales ('Ejercicio 1'…'Ejercicio 5').
const THEME_ORDER: Record<SimulacroSubject, string[]> = {
  mates: ['Algebra', 'Analisis', 'Geometria', 'Probabilidad'],
  matematicas_ccss: ['Ejercicio 1', 'Ejercicio 2', 'Ejercicio 3', 'Ejercicio 4', 'Ejercicio 5'],
  fisica: ['Gravitacion', 'Ondas', 'Electricidad', 'Optica', 'RadioactividadModerna'],
  quimica: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4', 'Pregunta5'],
  biologia: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4', 'Pregunta5'],
  ingles: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'],
  lengua: ['Comunicacion', 'ReflexionLengua', 'EducacionLiteraria'],
  // 'fuente' no va en la lista: normalizeTheme() lo colapsa en 'fuente1', así
  // que como entrada propia nunca casaba con nada.
  historia: ['cuestiones', 'fuente1', 'fuente2', 'tema', 'texto']
}

export function generateSimulacro(
  subject: SimulacroSubject,
  difficulty: SimulacroDifficulty,
  option: SimulacroOption,
  comunidad: string,
  settings: GenerateSimulacroSettings = {}
) {
  const hasHistoriaTopicFilter = subject === 'historia' && (settings.historiaTopicSlugs?.length ?? 0) > 0
  const yearSelection = settings.yearSelection ?? difficulty
  const optionSelection = settings.optionSelection ?? option
  // Topic-based selection stands on its own — ignore the año/dificultad
  // tier entirely rather than intersecting with it, so a Parcial covering
  // e.g. Prehistoria isn't starved down to whatever few exercises from that
  // topic also happen to fall in one arbitrary year range.
  const years = hasHistoriaTopicFilter ? null : yearSelection === 'all' ? null : yearsForSubject(subject, yearSelection, comunidad)

  if (subject === 'lengua') {
    // Lengua tenía su propio rango fijo (Fácil 2019-2020, Media 2021-2022,
    // Difícil 2023-2024), aún más estrecho que el general: dejaba fuera de
    // cualquier tramo 2018, 2025 y 2026. Usa ya los mismos tramos derivados
    // del dataset que el resto de asignaturas.
    const lenguaYears = yearSelection === 'all' ? null : yearsForSubject('lengua', yearSelection, comunidad)
    const selectedOption = optionSelection === 'mixed' ? randomOption() : optionSelection

    if (comunidad === 'Cataluña') {
      const candidates = examenesLenguaCataluna.filter(exam => !lenguaYears || lenguaYears.includes(exam.anio))
      if (!candidates.length) return null
      const selected = shuffle(candidates)[0]
      const blocks = normalizeLenguaCatalunaExam(selected, selectedOption)
      if (!blocks.length) return null
      const dificultadReal = selected.anio >= 2023 ? 'Difícil' : selected.anio >= 2019 ? 'Media' : 'Fácil'
      return { id: crypto.randomUUID(), blocks: withCommunity(blocks, comunidad), dificultadReal }
    }

    const candidates = examenesLengua.filter(exam => (!lenguaYears || lenguaYears.includes(exam.año)) && (exam.comunidad ?? 'Madrid') === comunidad)
    if (!candidates.length) return null
    const selected = shuffle(candidates)[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blocks = (selected?.preguntas ?? []).filter((p: any) => !isIncompleteOfficialExercise(p)).map((p: any, index: number) => ({
      ...toItem('lengua', selected, p, p.bloque).block,
      numero: index + 1,
      option: 'A' as SimulacroOption
    }))
    const averageYear = blocks.reduce((sum, block) => sum + block.year, 0) / Math.max(1, blocks.length)
    const dificultadReal = averageYear >= 2023 ? 'Difícil' : averageYear >= 2019 ? 'Media' : 'Fácil'
    return { id: crypto.randomUUID(), blocks: withCommunity(blocks, comunidad), dificultadReal }
  }

  const questions = normalizeQuestions(subject, comunidad).filter(item => (
    (!years || years.includes(item.year)) &&
    (optionSelection === 'mixed' || item.option === optionSelection) &&
    !isIncompleteOfficialExercise(item.block) &&
    (!hasHistoriaTopicFilter || (item.block.topicSlugs ?? []).some(slug => settings.historiaTopicSlugs!.includes(slug)))
  ))
  const distinctYears = new Set(questions.map(q => q.year)).size
  const usedYears = new Set<number>()
  const blocks: SimulacroBlock[] = []

  if (settings.blockFilter) {
    const targetTheme = settings.blockFilter
    const targetPool = shuffle(questions.filter(item => normalizeTheme(subject, item.rawTheme) === targetTheme))
    const otherThemes = (THEME_ORDER[subject] ?? []).filter(t => t !== targetTheme)

    // Up to 2 questions from the target block
    for (const q of targetPool) {
      if (blocks.length >= 2) break
      blocks.push({ ...q.block, numero: blocks.length + 1 })
    }

    // 1 question each from other blocks until we have 4 total
    for (const theme of shuffle(otherThemes)) {
      if (blocks.length >= 4) break
      const pool = shuffle(questions.filter(item => normalizeTheme(subject, item.rawTheme) === theme))
      if (pool[0]) blocks.push({ ...pool[0].block, numero: blocks.length + 1 })
    }

    // Fallback: fill remaining slots from any unused question
    if (blocks.length < 4) {
      for (const q of shuffle(questions)) {
        if (blocks.length >= 4) break
        if (blocks.some(b => b.id === q.block.id)) continue
        blocks.push({ ...q.block, numero: blocks.length + 1 })
      }
    }
  } else {
    // Antes se recorría THEME_ORDER en orden y se cortaba al llegar a 4
    // bloques, así que en una asignatura de 5 bloques el quinto no salía
    // JAMÁS (Biología 'Pregunta5', y lo mismo le pasaba a Historia con
    // 'texto': 38 ejercicios inalcanzables, mientras 'fuente2' —que tiene uno
    // solo— entraba en todos los simulacros por estar antes en la lista). Se
    // sortean los bloques con material y se toman 4; el orden de
    // presentación sigue siendo el canónico de THEME_ORDER.
    const themeOrder = THEME_ORDER[subject] ?? []
    const themesWithContent = themeOrder.filter(theme => questions.some(item => normalizeTheme(subject, item.rawTheme) === theme))
    const chosenThemes = shuffle(themesWithContent)
      .slice(0, 4)
      .sort((a, b) => themeOrder.indexOf(a) - themeOrder.indexOf(b))
    for (const theme of chosenThemes) {
      const sameTheme = shuffle(questions.filter(item => normalizeTheme(subject, item.rawTheme) === theme))
      const preferred = sameTheme.find(item => !usedYears.has(item.year)) ?? sameTheme[0]
      if (!preferred) continue
      usedYears.add(preferred.year)
      blocks.push({ ...preferred.block, numero: blocks.length + 1 })
      if (blocks.length === 4) break
    }

    if (blocks.length < 4) {
      for (const candidate of shuffle(questions)) {
        if (blocks.some(block => block.id === candidate.block.id)) continue
        if (usedYears.has(candidate.year) && distinctYears >= 4) continue
        usedYears.add(candidate.year)
        blocks.push({ ...candidate.block, numero: blocks.length + 1 })
        if (blocks.length === 4) break
      }
    }
  }

  if (blocks.length === 0) return null

  const averageYear = blocks.reduce((sum, block) => sum + block.year, 0) / Math.max(1, blocks.length)
  const dificultadReal = averageYear >= 2023 ? 'Difícil' : averageYear >= 2019 ? 'Media' : 'Fácil'
  return { id: crypto.randomUUID(), blocks: withCommunity(blocks, comunidad), dificultadReal }
}

function withCommunity(blocks: SimulacroBlock[], comunidad: string) {
  return blocks.map(block => ({ ...block, comunidad }))
}

// Los tres tramos de años ('Años clásicos'/'intermedios'/'recientes' en la
// UI, ver YEAR_CHOICES en app/simulacros/page.tsx) se calculan del propio
// dataset en lugar de ser listas fijas. Antes estaban escritos a mano
// (Fácil 2015-2018, Media 2019-2022, Difícil 2023-2025) y cada convocatoria
// nueva que se subía quedaba fuera del tramo "recientes" hasta que alguien
// se acordaba de tocar esta constante: las de 2026 de Mates, Física,
// Química, Lengua, Historia, Inglés y Mates CCSS eran inalcanzables salvo
// con "Todos los años". Al derivarlos de los años que existen de verdad,
// subir un examen nuevo basta para que entre, y desaparecen también los
// tramos vacíos o casi vacíos que el rango fijo provocaba (Física "Fácil"
// solo tenía 2018 real de los cuatro años que prometía).
const yearTiersCache = new Map<string, Record<SimulacroDifficulty, number[]>>()

function splitYearsIntoTiers(years: number[]): Record<SimulacroDifficulty, number[]> {
  const sorted = [...new Set(years)].sort((a, b) => a - b)
  // Con menos de 3 convocatorias no hay tramos que repartir: cualquier
  // elección usa todo el material disponible en vez de quedarse a cero.
  if (sorted.length < 3) return { 'Fácil': sorted, 'Media': sorted, 'Difícil': sorted }
  const recent = Math.ceil(sorted.length / 3)
  const classic = Math.floor(sorted.length / 3)
  return {
    'Fácil': sorted.slice(0, classic),
    'Media': sorted.slice(classic, sorted.length - recent),
    'Difícil': sorted.slice(sorted.length - recent),
  }
}

// Años con al menos un ejercicio realmente utilizable: se descartan aquí los
// mismos ejercicios incompletos que descarta generateSimulacro, para que un
// año presente en el fichero pero sin contenido usable no cree un tramo que
// luego no genera nada.
function availableYears(subject: SimulacroSubject, comunidad: string): number[] {
  if (subject === 'lengua') {
    return comunidad === 'Cataluña'
      ? examenesLenguaCataluna.map(exam => exam.anio)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : examenesLengua.filter((exam: any) => (exam.comunidad ?? 'Madrid') === comunidad).map((exam: any) => exam.año)
  }
  return normalizeQuestions(subject, comunidad)
    .filter(item => !isIncompleteOfficialExercise(item.block))
    .map(item => item.year)
}

function yearsForSubject(subject: SimulacroSubject, difficulty: SimulacroDifficulty, comunidad: string) {
  const key = `${subject}|${comunidad}`
  let tiers = yearTiersCache.get(key)
  if (!tiers) {
    tiers = splitYearsIntoTiers(availableYears(subject, comunidad))
    yearTiersCache.set(key, tiers)
  }
  const tier = tiers[difficulty]
  // null = sin restricción de año. Un tramo vacío (asignatura con muy pocas
  // convocatorias) nunca debe traducirse en "cero preguntas".
  return tier.length ? tier : null
}

function randomOption(): SimulacroOption {
  return Math.random() > 0.5 ? 'B' : 'A'
}

function normalizeQuestions(subject: SimulacroSubject, comunidad: string) {
  if (comunidad === 'Cataluña') {
    if (subject === 'fisica') return normalizeFisicaCatalunaItems()
    if (subject === 'quimica') return normalizeQuimicaCatalunaItems()
    if (subject === 'historia') return normalizeHistoriaCatalunaItems()
    return []
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const byComunidad = (exam: any) => (exam.comunidad ?? 'Madrid') === comunidad
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'mates') return examenes.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'matematicas_ccss') return examenesMatematicasCCSSMadrid.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'fisica') return examenesFisica.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'quimica') return examenesQuimica.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'biologia') return examenesBiologia.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'ingles') return examenesIngles.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (subject === 'lengua') return examenesLengua.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (examenesHistoria as any[]).filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.tipo)))
}

/**
 * Resolve a block supplied by the browser back to the immutable official
 * dataset.  Session creation uses this on the server so a modified client
 * cannot replace an official exercise with an easier prompt and then obtain
 * a fabricated grade/XP. `numero` is presentation-only and is assigned by
 * the session route after canonicalisation.
 */
export function canonicalizeOfficialSimulacroBlock(
  subject: SimulacroSubject,
  comunidad: string,
  supplied: SimulacroBlock,
): SimulacroBlock | null {
  const candidates = normalizeQuestions(subject, comunidad).map(item => item.block)

  // Catalan Lengua is normalised per complete exam/option instead of through
  // normalizeQuestions(), so include both official option projections.
  if (subject === 'lengua' && comunidad === 'Cataluña') {
    for (const exam of examenesLenguaCataluna) {
      candidates.push(...normalizeLenguaCatalunaExam(exam, 'A'))
      candidates.push(...normalizeLenguaCatalunaExam(exam, 'B'))
    }
  }

  const match = candidates.find(candidate => sameAcademicBlock(candidate, supplied))
  if (!match) return null
  return { ...match, numero: supplied.numero, comunidad }
}

function sameAcademicBlock(a: SimulacroBlock, b: SimulacroBlock) {
  return a.id === b.id
    && Number(a.year) === Number(b.year)
    && a.convocatoria === b.convocatoria
    && a.option === b.option
    && Number(a.puntuacion) === Number(b.puntuacion)
    && a.enunciado === b.enunciado
    && (a.criterios ?? '') === (b.criterios ?? '')
    && (a.textoFuente ?? '') === (b.textoFuente ?? '')
}

// ─── Cataluña: Física ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildCatalunaEjercicioEnunciado(ej: any, opcion?: any): string {
  const parts: string[] = []
  if (opcion) {
    if (opcion.titulo) parts.push(`**${opcion.titulo}**`)
    if (opcion.enunciado) parts.push(opcion.enunciado)
    for (const ap of (opcion.apartados ?? [])) {
      parts.push(`**${ap.letra})** ${ap.enunciado}`)
    }
    if (opcion.datos?.length) parts.push(`*Datos:* ${(opcion.datos as string[]).join(' — ')}`)
  } else {
    if (ej.enunciado) parts.push(ej.enunciado)
    if (ej.instrucciones) parts.push(`*${ej.instrucciones}*`)
    for (const ap of (ej.apartados ?? [])) {
      parts.push(`**${ap.letra})** ${ap.enunciado}`)
    }
    if (ej.datos?.length) parts.push(`*Datos:* ${(ej.datos as string[]).join(' — ')}`)
  }
  return parts.filter(Boolean).join('\n\n')
}

function normalizeFisicaCatalunaItems() {
  type Item = { rawTheme: string; year: number; option: SimulacroOption; block: SimulacroBlock }
  const items: Item[] = []
  for (const exam of examenesFisicaCataluna) {
    for (const ej of exam.ejercicios) {
      if (ej.opciones && ej.opciones.length > 0) {
        for (const op of ej.opciones) {
          items.push({
            rawTheme: `ej${ej.numero}`,
            year: exam.anio,
            option: op.opcion as SimulacroOption,
            block: {
              id: `${exam.id}-ej${ej.numero}-op${op.opcion}`,
              numero: 0,
              tema: `${ej.titulo} — Opció ${op.opcion}`,
              year: exam.anio,
              convocatoria: exam.convocatoria,
              option: op.opcion as SimulacroOption,
              puntuacion: 2.5,
              enunciado: buildCatalunaEjercicioEnunciado(ej, op),
              imagenes: (op.imagenes ?? ej.imagenes) as string[] | undefined,
              requiereImagen: op.requiereRevision ?? ej.requiereRevision
            }
          })
        }
      } else {
        // Exercise without A/B choice — available for both options
        const enunciado = buildCatalunaEjercicioEnunciado(ej)
        for (const opt of ['A', 'B'] as SimulacroOption[]) {
          items.push({
            rawTheme: `ej${ej.numero}`,
            year: exam.anio,
            option: opt,
            block: {
              id: `${exam.id}-ej${ej.numero}-${opt}`,
              numero: 0,
              tema: ej.titulo,
              year: exam.anio,
              convocatoria: exam.convocatoria,
              option: opt,
              puntuacion: 2.5,
              enunciado,
              imagenes: ej.imagenes as string[] | undefined,
              requiereImagen: ej.requiereRevision
            }
          })
        }
      }
    }
  }
  return items.filter(item => !isIncompleteOfficialExercise(item.block))
}

// ─── Cataluña: Química ───────────────────────────────────────────────────────

function normalizeQuimicaCatalunaItems() {
  type Item = { rawTheme: string; year: number; option: SimulacroOption; block: SimulacroBlock }
  const items: Item[] = []
  for (const exam of examenesQuimicaCataluna) {
    for (const ej of exam.ejercicios) {
      const enunciado = buildCatalunaEjercicioEnunciado(ej)
      for (const opt of ['A', 'B'] as SimulacroOption[]) {
        items.push({
          rawTheme: `ej${ej.numero}`,
          year: exam.anio,
          option: opt,
          block: {
            id: `${exam.id}-ej${ej.numero}-${opt}`,
            numero: 0,
            tema: ej.titulo,
            year: exam.anio,
            convocatoria: exam.convocatoria,
            option: opt,
            puntuacion: 2.5,
            enunciado,
            imagenes: ej.imagenes as string[] | undefined,
            requiereImagen: ej.requiereRevision
          }
        })
      }
    }
  }
  return items.filter(item => !isIncompleteOfficialExercise(item.block))
}

// ─── Cataluña: Historia ──────────────────────────────────────────────────────

function normalizeHistoriaCatalunaItems() {
  type Item = { rawTheme: string; year: number; option: SimulacroOption; block: SimulacroBlock }
  const items: Item[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const exam of Object.values(examenesCataluna) as any[]) {
    for (const ej of (exam.ejercicios ?? [])) {
      const fuente = ej.fuente
      const textoFuente: string | undefined = fuente?.texto ?? fuente?.descripcion ?? undefined
      const imagenes: string[] | undefined = fuente?.imagen_url ? [fuente.imagen_url] : undefined
      const p1Parts: string[] = (ej.pregunta1 ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any) => `**${p.letra})** ${p.enunciado}${p.puntos ? ` *(${p.puntos} pts)*` : ''}`
      )
      for (const p2 of (ej.pregunta2?.opciones ?? [])) {
        const opt = (p2.letra as string).toUpperCase() as SimulacroOption
        const enunciado = [
          fuente?.titulo ? `**Fuente: ${fuente.titulo}**` : '',
          p1Parts.join('\n\n'),
          `**Pregunta de desarrollo — Opción ${opt}:**\n\n${p2.enunciado}`
        ].filter(Boolean).join('\n\n')
        items.push({
          rawTheme: `ej${ej.numero}`,
          year: exam.anio,
          option: opt,
          block: {
            id: `cat-historia-${exam.id}-ej${ej.numero}-op${opt}`,
            numero: 0,
            tema: fuente?.titulo ? `Ejercicio ${ej.numero}: ${fuente.titulo}` : `Ejercicio ${ej.numero}`,
            year: exam.anio,
            convocatoria: 'Ordinaria',
            option: opt,
            puntuacion: 2.5,
            enunciado,
            textoFuente,
            imagenes,
            requiereImagen: !!imagenes
          }
        })
      }
    }
  }
  return items.filter(item => !isIncompleteOfficialExercise(item.block))
}

// ─── Cataluña: Lengua ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildLenguaCatalunaParteEnunciado(parte: any): string {
  const parts: string[] = [parte.titulo]
  if (parte.instrucciones) parts.push(parte.instrucciones)
  for (const ap of (parte.apartados ?? [])) {
    let text = `**${ap.titulo}**${ap.puntos != null ? ` *(${ap.puntos} pts)*` : ''}\n${ap.enunciado}`
    if (ap.opciones?.length) {
      text += '\n' + (ap.opciones as string[]).map((o, i) => `${i + 1}. ${o}`).join('\n')
    }
    parts.push(text)
  }
  return parts.filter(Boolean).join('\n\n')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeLenguaCatalunaExam(exam: any, option: SimulacroOption): SimulacroBlock[] {
  const blocks: SimulacroBlock[] = []

  if (exam.formato === '2025_cuatro_partes_obligatorias') {
    for (const parte of (exam.partesObligatorias ?? [])) {
      blocks.push({
        id: `${exam.id}-${parte.id}`,
        numero: 0,
        tema: parte.titulo,
        year: exam.anio,
        convocatoria: exam.convocatoria,
        option: 'A' as SimulacroOption,
        puntuacion: 2.5,
        enunciado: buildLenguaCatalunaParteEnunciado(parte),
        textoFuente: parte.texto
      })
    }
  } else {
    // opciones_mas_parte_comun
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opcionData = (exam.opciones ?? []).find((o: any) => o.opcion === option) ?? (exam.opciones ?? [])[0]
    const allBloques = [...(opcionData?.bloques ?? []), ...(exam.partesComunes ?? [])]
    for (const bloque of allBloques) {
      blocks.push({
        id: `${exam.id}-${bloque.id}`,
        numero: 0,
        tema: bloque.titulo,
        year: exam.anio,
        convocatoria: exam.convocatoria,
        option: (opcionData?.opcion ?? option) as SimulacroOption,
        puntuacion: 2.5,
        enunciado: buildLenguaCatalunaParteEnunciado(bloque),
        textoFuente: (opcionData?.texto ?? bloque.texto) as string | undefined
      })
    }
  }

  return blocks.filter(block => !isIncompleteOfficialExercise(block)).map((block, idx) => ({ ...block, numero: idx + 1 }))
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

// El enunciado crudo de algunos bancos de preguntas (p.ej. Lengua,
// "Comunicacion") repite el texto fuente completo dentro del propio
// enunciado (bajo una etiqueta suelta "TEXTO") además de guardarlo aparte en
// texto_fuente — la UI ya renderiza texto_fuente en su propio panel ("Texto
// fuente oficial"), así que dejarlo también dentro de enunciado lo mostraba
// duplicado. Es un no-op si el enunciado no contiene el texto fuente tal
// cual (la inmensa mayoría de asignaturas/preguntas), así que es seguro
// aplicarlo de forma genérica en vez de solo para Lengua.
function stripEmbeddedSourceText(enunciado: string, textoFuente?: string | null): string {
  if (typeof enunciado !== 'string' || !textoFuente) return enunciado
  const source = textoFuente.trim()
  if (!source) return enunciado
  const idx = enunciado.indexOf(source)
  if (idx === -1) return enunciado
  const before = enunciado.slice(0, idx).replace(/\bTEXTO\b\s*$/i, '').trimEnd()
  const after = enunciado.slice(idx + source.length).replace(/^\s+/, '')
  const result = [before, after].filter(Boolean).join('\n\n').trim()
  return result || enunciado
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toItem(subject: SimulacroSubject, exam: any, p: any, rawTheme: string) {
  const option = (p.opcion ?? exam.opcion ?? 'A') as SimulacroOption
  const label = p.label ?? labelFor(subject, rawTheme)
  const block: SimulacroBlock = {
    id: p.id,
    numero: 0,
    tema: label,
    year: p.año ?? exam.año,
    convocatoria: p.convocatoria ?? exam.tipo,
    option,
    puntuacion: Number(p.puntuacion ?? p.puntos ?? 2.5),
    enunciado: stripEmbeddedSourceText(p.enunciado, p.texto_fuente),
    criterios: p.criterios,
    textoFuente: p.texto_fuente,
    conceptos: p.conceptos,
    imagenes: p.imagenes,
    requiereImagen: p.requiereImagen,
    topicSlugs: Array.isArray(p.topicSlugs) ? p.topicSlugs : undefined,
    // Lengua "Educación literaria" bloques traen preguntas_opcionales
    // anidadas (tema + obra leída juntas) — extrae el periodo de las de
    // grupo "obra" para poder filtrar este item por libro declarado.
    obraPeriodos: Array.isArray(p.preguntas_opcionales)
      ? [...new Set<string>(
          p.preguntas_opcionales
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((pq: any) => pq?.grupo === 'obra' && typeof pq?.periodo === 'string')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((pq: any): string => pq.periodo),
        )]
      : undefined,
  }
  return { rawTheme, year: block.year, option, block }
}

function normalizeTheme(subject: SimulacroSubject, theme: string) {
  if (subject !== 'historia') return theme
  if (theme === 'fuente') return 'fuente1'
  return theme
}

function labelFor(subject: SimulacroSubject, theme: string) {
  const labels: Record<string, string> = {
    Algebra: 'Álgebra',
    Analisis: 'Análisis',
    Geometria: 'Geometría',
    Probabilidad: 'Probabilidad',
    Gravitacion: 'Gravitación',
    Optica: 'Óptica',
    RadioactividadModerna: 'Radioactividad moderna',
    Pregunta1: 'Pregunta 1',
    Pregunta2: 'Pregunta 2',
    Pregunta3: 'Pregunta 3',
    Pregunta4: 'Pregunta 4',
    Pregunta5: 'Pregunta 5',
    Q1: 'Reading: True / False',
    Q2: 'Reading comprehension',
    Q3: 'Vocabulary',
    Q4: 'Use of English',
    Q5: 'Writing',
    Comunicacion: 'Comunicación',
    ReflexionLengua: 'Reflexión sobre la lengua',
    EducacionLiteraria: 'Educación literaria',
    ...Object.fromEntries(BIOLOGIA_TOPICS.map(item => [item.tipo, item.label])),
    cuestiones: 'Cuestiones',
    fuente1: 'Fuente 1',
    fuente2: 'Fuente 2',
    fuente: 'Fuente',
    tema: 'Tema',
    texto: 'Texto'
  }
  return labels[theme] ?? (subject === 'historia' ? 'Historia' : theme)
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5)
}

// ─── Practice Session ────────────────────────────────────────────────────────

export interface PracticeSession {
  id: string
  subject: SimulacroSubject
  block: string
  comunidad: string
  questions: SimulacroBlock[]
  type: 'practice_session'
  created_at: string
}

export function generatePracticeSession(
  subject: SimulacroSubject,
  blockFilter: string,
  comunidad: string,
  numQuestions: number = 3,
  // Historia only, and only when the Parcial has real exam_topics rows
  // (chip selection) — filters by the topics the student actually picked
  // instead of the free-text block match below. Parciales created before
  // exam_topics existed (or other subjects, which don't have topicSlugs
  // populated yet) have no rows here and fall straight through to the
  // existing blockNormalization-based filter, unchanged.
  historiaTopicSlugs?: string[],
  // True only for a Historia Parcial's own practice/mission request
  // (subject==='historia' with a real, owned examId — see
  // /api/practica-parcial). Historia has no real "blockFilter" of its own
  // (blockNormalization.ts only recognizes structural keys like "cuestiones"/
  // "fuente1", never period names like "Guerra Civil"), so without
  // historiaTopicSlugs the two filters above never match anything for
  // Historia — the "any available block" fallback below used to silently
  // paper over that with unrelated content (e.g. Romans for a Guerra Civil
  // exam). When this flag is set, that fallback is skipped and the function
  // returns null instead, so the caller can tell the student to pick real
  // topics rather than handing them a random session. Other callers
  // (sunday_mock's free block practice, any other subject) keep the old
  // fallback untouched.
  strictHistoriaMatch = false,
  // Lengua "Educación literaria — Obra leída" only. Resolved server-side
  // (route) from the student's perfiles.lengua_obras_leidas via
  // filterObraLeidaExercises.ts, never computed here. Presence of this
  // parameter (even []) is itself the signal that the caller wants the
  // obra-leída-specific pool instead of the normal Educación literaria
  // (tema) match — an empty array means the student has a declared book but
  // no exercise matches its period, and must return null (never fall back
  // to unrelated/random content, same principle as strictHistoriaMatch).
  lenguaObraPeriodos?: string[],
): PracticeSession | null {
  const normalizedFilter = normalizeBlockKey(blockFilter)
  const allQuestions = normalizeQuestions(subject, comunidad)
  let usedBlock = normalizedFilter
  let pool: typeof allQuestions = []
  if (subject === 'historia' && historiaTopicSlugs?.length) {
    pool = allQuestions.filter(
      item => (item.block.topicSlugs ?? []).some(slug => historiaTopicSlugs.includes(slug)) && !isIncompleteOfficialExercise(item.block),
    )
  }
  if (subject === 'lengua' && lenguaObraPeriodos !== undefined) {
    pool = allQuestions.filter(
      item => normalizeTheme(subject, item.rawTheme) === 'EducacionLiteraria'
        && (item.block.obraPeriodos ?? []).some(periodo => lenguaObraPeriodos.includes(periodo))
        && !isIncompleteOfficialExercise(item.block),
    )
    // usedBlock se deja tal cual (normalizedFilter) para que la sesión
    // guarde el bloque real que pidió el caller ("Educación literaria —
    // Obra leída"), igual que Historia no reescribe usedBlock cuando filtra
    // por topicSlugs.
    // Nunca caer al fallback de "cualquier bloque disponible" de más abajo
    // — mostrar contenido de otro periodo (o de otro bloque) sería peor que
    // no generar nada; el caller (route) traduce este null en un mensaje
    // claro de "no hay ejercicios de obra leída para el libro declarado".
    if (pool.length === 0) return null
  }
  // Ni Historia con topicSlugs ni Lengua con obra leída (los dos casos de
  // arriba dejan pool con algo o retornan null antes de llegar aquí): cae al
  // match de bloque de siempre.
  if (pool.length === 0) {
    pool = allQuestions.filter(
      item => normalizeTheme(subject, item.rawTheme) === normalizedFilter && !isIncompleteOfficialExercise(item.block),
    )
  }
  if (pool.length === 0 && subject === 'historia' && strictHistoriaMatch) return null
  // Subject-level fallback: if no questions for the requested block, use any available block
  if (pool.length === 0) {
    const themes = [...new Set(allQuestions.map(item => normalizeTheme(subject, item.rawTheme)))]
    const fallbackTheme = themes.find(t =>
      allQuestions.some(item => normalizeTheme(subject, item.rawTheme) === t && !isIncompleteOfficialExercise(item.block))
    )
    if (!fallbackTheme) return null
    pool = allQuestions.filter(
      item => normalizeTheme(subject, item.rawTheme) === fallbackTheme && !isIncompleteOfficialExercise(item.block),
    )
    usedBlock = fallbackTheme
  }
  if (pool.length === 0) return null

  // "Comunicacion" (comentario de texto) aporta un único ejercicio por examen
  // real, largo y con su propio texto fuente — no son varias preguntas
  // cortas del mismo examen como en otros bloques. Pedir numQuestions=3 (el
  // valor por defecto) juntaba en una misma sesión de práctica los
  // comentarios de texto de hasta 3 exámenes reales distintos, cada uno con
  // su propio texto, mostrados como pestañas "Pregunta 1/2/3" — lo que los
  // alumnos veían como "dos (o tres) modelos de ejercicio a la vez" en vez
  // de una única práctica. Aquí se fuerza a un solo ejercicio.
  const effectiveNumQuestions = subject === 'lengua' && usedBlock === 'Comunicacion' ? 1 : numQuestions

  const shuffled = shuffle(pool)
  const usedYears = new Set<number>()
  const selected: SimulacroBlock[] = []

  // First pass: prefer distinct years
  for (const q of shuffled) {
    if (selected.length >= effectiveNumQuestions) break
    if (!usedYears.has(q.year)) {
      usedYears.add(q.year)
      selected.push({ ...q.block, numero: selected.length + 1 })
    }
  }

  // Second pass: fill remaining from any unused question
  if (selected.length < effectiveNumQuestions) {
    for (const q of shuffled) {
      if (selected.length >= effectiveNumQuestions) break
      if (selected.some(b => b.id === q.block.id)) continue
      selected.push({ ...q.block, numero: selected.length + 1 })
    }
  }

  if (selected.length === 0) return null

  return {
    id: crypto.randomUUID(),
    subject,
    block: usedBlock,
    comunidad,
    questions: withCommunity(selected, comunidad),
    type: 'practice_session',
    created_at: new Date().toISOString(),
  }
}
