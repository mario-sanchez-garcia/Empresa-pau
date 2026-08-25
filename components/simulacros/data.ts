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

export const DIFFICULTIES: Array<{ id: SimulacroDifficulty; label: SimulacroDifficulty; description: string; years: number[] }> = [
  { id: 'Fácil', label: 'Fácil', description: 'Años 2015-2018, preguntas más directas', years: [2015, 2016, 2017, 2018] },
  { id: 'Media', label: 'Media', description: 'Años 2019-2022, dificultad estándar', years: [2019, 2020, 2021, 2022] },
  { id: 'Difícil', label: 'Difícil', description: 'Años 2023-2025, máxima exigencia', years: [2023, 2024, 2025] }
]

const THEME_ORDER: Record<SimulacroSubject, string[]> = {
  mates: ['Algebra', 'Analisis', 'Geometria', 'Probabilidad'],
  matematicas_ccss: ['Algebra', 'Analisis', 'Probabilidad', 'Estadistica'],
  fisica: ['Gravitacion', 'Ondas', 'Electricidad', 'Optica'],
  quimica: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4'],
  biologia: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4', 'Pregunta5'],
  ingles: ['Q1', 'Q2', 'Q4', 'Q5'],
  lengua: ['Comunicacion', 'ReflexionLengua', 'EducacionLiteraria'],
  historia: ['cuestiones', 'fuente1', 'fuente2', 'tema', 'texto', 'fuente']
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
  const years = hasHistoriaTopicFilter ? null : yearSelection === 'all' ? null : yearsForSubject(subject, yearSelection)

  if (subject === 'lengua') {
    const lenguaYears = yearSelection === 'all'
      ? null
      : yearSelection === 'Fácil'
      ? [2019, 2020]
      : yearSelection === 'Media'
      ? [2021, 2022]
      : [2023, 2024]
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
    for (const theme of THEME_ORDER[subject]) {
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

function yearsForSubject(subject: SimulacroSubject, difficulty: SimulacroDifficulty) {
  if (subject === 'biologia') {
    if (difficulty === 'Fácil') return [2020, 2021]
    if (difficulty === 'Media') return [2022, 2023]
    return [2024, 2025]
  }
  return DIFFICULTIES.find(item => item.id === difficulty)?.years ?? DIFFICULTIES[1].years
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
    topicSlugs: Array.isArray(p.topicSlugs) ? p.topicSlugs : undefined
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
  // Either not a topic-filtered Historia request, or the topic filter
  // matched nothing (still very rare — 207/209 exercises have topicSlugs —
  // but never worse than before): fall back to the original block match.
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
