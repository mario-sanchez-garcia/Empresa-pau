import { Atom, BookOpen, Dna, FlaskConical, Globe, Landmark, Sigma } from 'lucide-react'
import { examenes, examenesHistoria } from '@/app/data/examenes'
import { examenesFisica } from '@/app/data/fisica'
import { examenesQuimica } from '@/app/data/quimica'
import { examenesLengua } from '@/app/data/lengua'
import { examenesIngles } from '@/app/data/ingles'
import { BIOLOGIA_TOPICS, examenesBiologia } from '@/app/data/biologia'
import type { SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroSubject } from './types'

export const SUBJECTS = {
  mates: { label: 'Matemáticas II', short: 'Mates', color: '#2563eb', light: '#eff6ff', icon: Sigma, available: true },
  fisica: { label: 'Física', short: 'Física', color: '#6d28d9', light: '#f5f3ff', icon: Atom, available: true },
  quimica: { label: 'Química', short: 'Química', color: '#ea580c', light: '#fff7ed', icon: FlaskConical, available: true },
  biologia: { label: 'Biología', short: 'Bio', color: '#4d7c0f', light: '#f7fee7', icon: Dna, available: true },
  ingles: { label: 'Inglés', short: 'Inglés', color: '#0891B2', light: '#CFFAFE', icon: Globe, available: true },
  lengua: { label: 'Lengua Castellana y Literatura II', short: 'Lengua', color: '#4f46e5', light: '#eef2ff', icon: BookOpen, available: true },
  historia: { label: 'Historia de España', short: 'Historia', color: '#2f6f4e', light: '#f0fdf4', icon: Landmark, available: true }
} as const

export const DIFFICULTIES: Array<{ id: SimulacroDifficulty; label: SimulacroDifficulty; description: string; years: number[] }> = [
  { id: 'Fácil', label: 'Fácil', description: 'Años 2015-2018, preguntas más directas', years: [2015, 2016, 2017, 2018] },
  { id: 'Media', label: 'Media', description: 'Años 2019-2022, dificultad estándar', years: [2019, 2020, 2021, 2022] },
  { id: 'Difícil', label: 'Difícil', description: 'Años 2023-2025, máxima exigencia', years: [2023, 2024, 2025] }
]

const THEME_ORDER: Record<SimulacroSubject, string[]> = {
  mates: ['Algebra', 'Analisis', 'Geometria', 'Probabilidad'],
  fisica: ['Gravitacion', 'Ondas', 'Electricidad', 'Optica'],
  quimica: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4'],
  biologia: ['Pregunta1', 'Pregunta2', 'Pregunta3', 'Pregunta4', 'Pregunta5'],
  ingles: ['Q1', 'Q2', 'Q4', 'Q5'],
  lengua: ['Comunicacion', 'ReflexionLengua', 'EducacionLiteraria'],
  historia: ['cuestiones', 'fuente1', 'fuente2', 'tema', 'texto', 'fuente']
}

export function generateSimulacro(subject: SimulacroSubject, difficulty: SimulacroDifficulty, option: SimulacroOption, comunidad: string) {
  const years = yearsForSubject(subject, difficulty)
  if (subject === 'lengua') {
    const lenguaYears = difficulty === 'Fácil' ? [2019, 2020] : difficulty === 'Media' ? [2021, 2022] : [2023, 2024]
    const candidates = examenesLengua.filter(exam => lenguaYears.includes(exam.año) && (exam.comunidad ?? 'Madrid') === comunidad)
    if (!candidates.length) return null
    const selected = shuffle(candidates)[0]
    const blocks = (selected?.preguntas ?? []).map((p: any, index: number) => ({
      ...toItem('lengua', selected, p, p.bloque).block,
      numero: index + 1,
      option: 'A' as SimulacroOption
    }))
    const averageYear = blocks.reduce((sum, block) => sum + block.year, 0) / Math.max(1, blocks.length)
    const dificultadReal = averageYear >= 2023 ? 'Difícil' : averageYear >= 2019 ? 'Media' : 'Fácil'
    return { id: crypto.randomUUID(), blocks, dificultadReal }
  }

  const questions = normalizeQuestions(subject, comunidad).filter(item => years.includes(item.year) && item.option === option)
  const usedYears = new Set<number>()
  const blocks: SimulacroBlock[] = []

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
      if (usedYears.has(candidate.year) && questions.length >= 4) continue
      usedYears.add(candidate.year)
      blocks.push({ ...candidate.block, numero: blocks.length + 1 })
      if (blocks.length === 4) break
    }
  }

  if (blocks.length === 0) return null

  const averageYear = blocks.reduce((sum, block) => sum + block.year, 0) / Math.max(1, blocks.length)
  const dificultadReal = averageYear >= 2023 ? 'Difícil' : averageYear >= 2019 ? 'Media' : 'Fácil'
  return { id: crypto.randomUUID(), blocks, dificultadReal }
}

function yearsForSubject(subject: SimulacroSubject, difficulty: SimulacroDifficulty) {
  if (subject === 'biologia') {
    if (difficulty === 'Fácil') return [2020, 2021]
    if (difficulty === 'Media') return [2022, 2023]
    return [2024, 2025]
  }
  return DIFFICULTIES.find(item => item.id === difficulty)?.years ?? DIFFICULTIES[1].years
}

function normalizeQuestions(subject: SimulacroSubject, comunidad: string) {
  const byComunidad = (exam: any) => (exam.comunidad ?? 'Madrid') === comunidad
  if (subject === 'mates') return examenes.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  if (subject === 'fisica') return examenesFisica.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  if (subject === 'quimica') return examenesQuimica.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  if (subject === 'biologia') return examenesBiologia.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  if (subject === 'ingles') return examenesIngles.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  if (subject === 'lengua') return examenesLengua.filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.bloque)))
  return (examenesHistoria as any[]).filter(byComunidad).flatMap(exam => (exam.preguntas as any[]).map(p => toItem(subject, exam, p, p.tipo)))
}

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
    enunciado: p.enunciado,
    criterios: p.criterios,
    textoFuente: p.texto_fuente,
    conceptos: p.conceptos,
    imagenes: p.imagenes,
    requiereImagen: p.requiereImagen
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
