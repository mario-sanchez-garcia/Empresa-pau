'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import SidebarNav from '@/app/components/SidebarNav'
import type { CSSProperties } from 'react'
import type { Components } from 'react-markdown'
import { examenes, examenesCatMates, examenesHistoria } from './data/examenes'
import { examenesCataluna } from './data/examenes_cataluna'
import { examenesFisica } from './data/fisica'
import { examenesFisicaCataluna } from './data/fisica_cataluna'
import { examenesQuimicaCataluna } from './data/quimica_cataluna'
import { examenesLenguaCataluna } from './data/lengua_cataluna'
import { examenesQuimica } from './data/quimica'
import { examenesLengua } from './data/lengua'
import { examenesIngles } from './data/ingles'
import { BIOLOGIA_TOPICS, examenesBiologia } from './data/biologia'
import { examenesMatematicasCCSSMadrid, MATEMATICAS_CCSS_LABEL } from './data/matematicas_ccss_madrid'
import { supabase } from './lib/supabase'
import { correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from './lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from './lib/correctionParsing'
import { splitWhyExplanationMarkdown } from './lib/whyExplanation'
import { getTheoryContextForExercise, theoryContextToPrompt } from './lib/whyItWorksTheory'
import { formatExamText } from './lib/mathFormatting'
import { getApiErrorMessage } from './lib/rateLimitMessages'
import { compressImageToBase64 } from './lib/clientImageCompression'
import { isIncompleteOfficialExercise } from './lib/contentQuality'
import { getRandomEvauExerciseForMission, normalizeCaminoExamSubject, rememberRecentEvauExerciseIds } from './lib/camino/randomEvauExercise'
import CatPreguntaCard from './components/CatPreguntaCard'
import CatHistoriaEjercicioCard from './components/CatHistoriaEjercicioCard'
import CatFisicaEjercicioCard from './components/CatFisicaEjercicioCard'
import CatEjercicioCard, { type CatEjercicioView } from './components/CatEjercicioCard'
import PhilosophyExamWorkspace from './components/PhilosophyExamWorkspace'
import { useCCAA } from './hooks/useCCAA'
import ExamStatement from '@/components/shared/ExamStatement'
import MathMarkdown from '@/components/shared/MathMarkdown'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import WhyExplanation from '@/components/shared/WhyExplanation'
import KairoLoadingDot from '@/components/shared/KairoLoadingDot'
import KairoBrand from '@/components/shared/KairoBrand'
import SectionIntroCard from '@/components/shared/SectionIntroCard'
import RichTextArea from '@/components/shared/RichTextArea'
import {
  ArrowUpRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Camera,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  Check,
  Dna,
  Download,
  Eye,
  Filter,
  Flame,
  FlaskConical,
  Globe,
  Landmark,
  LibraryBig,
  MessageCircle,
  MoreVertical,
  PenLine,
  Pin,
  Rocket,
  SendHorizontal,
  Sigma,
  SearchX,
  Target,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  WandSparkles,
  X
} from 'lucide-react'
const ASIGNATURAS = {
  general: { label: 'General', short: 'General', icon: MessageCircle, color: '#334155', light: '#f1f5f9', accent: '#94a3b8', soft: '#e2e8f0' },
  mates: { label: 'Matemáticas II', short: 'Mates', icon: Sigma, color: '#2563eb', light: '#eff6ff', accent: '#60a5fa', soft: '#dbeafe' },
  matematicas_ccss: { label: MATEMATICAS_CCSS_LABEL, short: 'Mates CCSS', icon: BarChart3, color: '#7c3aed', light: '#f5f3ff', accent: '#a78bfa', soft: '#ddd6fe' },
  fisica: { label: 'Física', short: 'Física', icon: Atom, color: '#CA8A04', light: '#FEFCE8', accent: '#FACC15', soft: '#FEF08A' },
  quimica: { label: 'Química', short: 'Química', icon: FlaskConical, color: '#ea580c', light: '#fff7ed', accent: '#fb923c', soft: '#ffedd5' },
  biologia: { label: 'Biología', short: 'Bio', icon: Dna, color: '#4d7c0f', light: '#f7fee7', accent: '#84cc16', soft: '#ecfccb' },
  lengua: { label: 'Lengua Castellana y Literatura II', short: 'Lengua', icon: BookOpen, color: '#0284C7', light: '#E0F2FE', accent: '#38BDF8', soft: '#BAE6FD' },
  historia: { label: 'Historia de España', short: 'Historia', icon: Landmark, color: '#2f6f4e', light: '#f0fdf4', accent: '#86c89a', soft: '#dcfce7' },
  historia_filosofia: { label: 'Historia de la Filosofía', short: 'Filosofía', icon: BrainCircuit, color: '#64748B', light: '#F8FAFC', accent: '#94A3B8', soft: '#E2E8F0' },
  ingles: { label: 'Inglés', short: 'Inglés', icon: Globe, color: '#0891B2', light: '#CFFAFE', accent: '#06B6D4', soft: '#CFFAFE' }
}

const WARM = {
  ink: '#111827',
  muted: '#64748b',
  softText: '#94a3b8',
  surface: '#ffffff',
  field: '#fafafa',
  wash: '#eff6ff',
  border: '#dbe7fb',
  amber: '#2563eb',
  coral: '#60a5fa',
  blue: '#2563eb',
  shadow: '0 24px 70px rgba(37, 99, 235, 0.09)'
}

const STUDY_DESK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_130632_68dfbf7a-aa85-468a-87c7-855c54c5b88f.png'
const BOOKS_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_134153_21d8ecce-c198-4ae1-8fc9-22814072fdbc.png'

const SUBJECT_HERO_IMGS: Record<string, string> = {
  mates:             STUDY_DESK_IMG,
  matematicas_ccss:  'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000821_38eb7eb4-e4a8-415f-b754-88efab45f708.png',
  fisica:            'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000822_ca28aa98-71b6-42b5-82a1-eb035f90e318.png',
  quimica:           'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000824_d921117a-9232-49e7-b9c2-08ffffcd4475.png',
  biologia:          'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000825_0fbd7567-1cac-444c-81e2-36c2551b946c.png',
  lengua:            BOOKS_IMG,
  historia:          'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260724_175525_a082853d-a113-4ae3-bd27-0bff89dc2c5b.png',
  historia_filosofia:'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000852_5474f700-2ed4-44ef-83b0-2a54eeff1d80.png',
  ingles:            'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260726_000853_ea284c50-cadc-413d-8412-9ddfb0c44ec9.png',
}

const STREAM_TRUNCATION_SENTINEL = '[[KAIRO_TRUNCATED_7f3a9b2c]]'

function readSafeStreamText(rawText: string) {
  const sentinelIndex = rawText.indexOf(STREAM_TRUNCATION_SENTINEL)
  if (sentinelIndex >= 0) {
    return { visibleText: rawText.slice(0, sentinelIndex), truncated: true }
  }

  const maxPrefixLength = Math.min(rawText.length, STREAM_TRUNCATION_SENTINEL.length - 1)
  for (let length = maxPrefixLength; length > 0; length -= 1) {
    if (rawText.endsWith(STREAM_TRUNCATION_SENTINEL.slice(0, length))) {
      return { visibleText: rawText.slice(0, -length), truncated: false }
    }
  }

  return { visibleText: rawText, truncated: false }
}

const CORRECTION_PROGRESS_STEPS = [
  'Leyendo tu respuesta',
  'Comparando con la rúbrica oficial',
  'Detectando aciertos principales',
  'Localizando errores importantes',
  'Preparando la explicación paso a paso',
  'Revisando el LaTeX de la corrección',
  'Guardando en Historial'
]

function hasUnsafeStreamingLatex(text: string) {
  const mathDelimiters = (text.match(/\$/g) ?? []).length
  const hasOpenEnvironment = /\\begin\{[^}]*$|\\begin\{[^}]+\}(?![\s\S]*\\end\{[^}]+\})/.test(text)
  const hasLatexCommand = /\\(?:frac|tfrac|dfrac|cdot|implies|begin|end)\b|[_^]\{|\{[0-9A-Za-z.+\-]+\}\{[0-9A-Za-z.+\-]*$/.test(text)
  return hasOpenEnvironment || (hasLatexCommand && mathDelimiters % 2 !== 0)
}

function SafeProgressiveCorrectionStream({ text, isContinuing, stage }: { text: string; isContinuing: boolean; stage?: string }) {
  const [autoStep, setAutoStep] = useState(0)
  const [visualProgress, setVisualProgress] = useState(8)

  // Advance one step every 9s; freeze at the last step until the component unmounts
  useEffect(() => {
    if (autoStep >= CORRECTION_PROGRESS_STEPS.length - 1) return
    const timer = window.setTimeout(
      () => setAutoStep(s => Math.min(s + 1, CORRECTION_PROGRESS_STEPS.length - 1)),
      9_000
    )
    return () => window.clearTimeout(timer)
  }, [autoStep])

  // Progress bar target derived from autoStep (starts at ~14%, reaches 94% at last step)
  const progressTarget = autoStep >= CORRECTION_PROGRESS_STEPS.length - 1
    ? 94
    : Math.round(Math.min(0.88, (autoStep / CORRECTION_PROGRESS_STEPS.length) * 0.88 + 0.14) * 100)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVisualProgress(current => {
        if (current >= progressTarget) return Math.min(progressTarget, current + 0.2)
        return Math.min(progressTarget, current + Math.max(0.8, (progressTarget - current) * 0.18))
      })
    }, 360)
    return () => window.clearInterval(timer)
  }, [progressTarget])

  const completedSteps = CORRECTION_PROGRESS_STEPS.slice(0, autoStep)
  const currentStep = CORRECTION_PROGRESS_STEPS[autoStep] ?? CORRECTION_PROGRESS_STEPS.at(-1)!
  const pendingSteps = CORRECTION_PROGRESS_STEPS.slice(autoStep + 1)
  const safePreviewAvailable = text.trim().length > 260 && !hasUnsafeStreamingLatex(text)
  const progressPct = Math.min(96, Math.round(visualProgress))

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px', borderRadius: 18, background: 'rgba(255,255,255,0.74)', border: '1px solid rgba(124,58,237,0.16)' }}>
        <div style={{ width: 38, height: 38, borderRadius: 14, background: 'linear-gradient(135deg, #6d28d9, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
          <KairoLoadingDot />
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#312e81' }}>
            {isContinuing ? 'Kairo está completando la corrección' : 'Kairo está corrigiendo tu ejercicio'}
          </p>
          <p style={{ margin: '5px 0 0', fontSize: 13.5, color: '#64748b', lineHeight: 1.5 }}>
            {isContinuing
              ? 'La primera respuesta se quedó corta; estamos terminándola antes de mostrarla.'
              : 'Mostramos el avance sin enseñar fórmulas incompletas ni texto técnico.'}
          </p>
          {stage && <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#7c3aed', fontWeight: 800 }}>{stage}</p>}
        </div>
      </div>
      <div style={{ height: 8, borderRadius: 999, overflow: 'hidden', background: '#ede9fe' }}>
        <div style={{ width: `${progressPct}%`, height: '100%', borderRadius: 999, background: 'linear-gradient(90deg, #2563eb, #7c3aed, #8b5cf6)', transition: 'width 420ms ease' }} />
      </div>
      <div style={{ display: 'grid', gap: 9 }}>
        {completedSteps.map(step => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#475569', fontSize: 13.5, fontWeight: 750 }}>
            <span style={{ width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 900 }}>✓</span>
            {step}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#312e81', fontSize: 13.5, fontWeight: 850 }}>
          <span style={{ width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#ede9fe', color: '#7c3aed', boxShadow: '0 0 0 6px rgba(124,58,237,0.1)' }}><KairoLoadingDot /></span>
          {currentStep}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13, fontWeight: 700 }}>
          <KairoLoadingDot />
          {progressPct >= 86 ? 'Últimos detalles...' : safePreviewAvailable ? 'Redactando explicación segura...' : 'Kairo está preparando esta parte...'}
        </div>
        {pendingSteps.map((step) => (
          <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#64748b', fontSize: 13.5, fontWeight: 700 }}>
            <span style={{ width: 10, height: 10, borderRadius: 999, background: '#ddd6fe', marginLeft: 4 }} />
            {step}
          </div>
        ))}
      </div>
    </div>
  )
}

const SUBJECT_CARDS = {
  general: {
    title: 'General',
    subtitle: 'Organización, técnicas de estudio y dudas sobre Kairo',
    icon: MessageCircle,
    kicker: 'Modo general'
  },
  mates: {
    title: 'Matemáticas',
    subtitle: 'Problemas, bloques y pasos limpios',
    icon: Sigma,
    kicker: 'Modo precisión'
  },
  matematicas_ccss: {
    title: 'Matemáticas CCSS',
    subtitle: 'Modelos sociales, probabilidad y análisis aplicado',
    icon: BarChart3,
    kicker: 'Modo aplicado'
  },
  fisica: {
    title: 'Física',
    subtitle: 'Ondas, campo, óptica y moderna',
    icon: Atom,
    kicker: 'Modo laboratorio'
  },
  quimica: {
    title: 'Química',
    subtitle: 'Problemas oficiales, formulación y equilibrio',
    icon: FlaskConical,
    kicker: 'Modo reacción'
  },
  biologia: {
    title: 'Biología',
    subtitle: 'Bioquímica, genética, inmunología y más',
    icon: Dna,
    kicker: 'Modo vida'
  },
  lengua: {
    title: 'Lengua',
    subtitle: 'Textos, comentario, lengua y literatura',
    icon: BookOpen,
    kicker: 'Modo expresión'
  },
  historia: {
    title: 'Historia',
    subtitle: 'Temas, comentarios y conceptos clave',
    icon: LibraryBig,
    kicker: 'Modo contexto'
  },
  historia_filosofia: {
    title: 'Historia de la Filosofía',
    subtitle: 'Textos, conceptos y argumentación filosófica',
    icon: BrainCircuit,
    kicker: 'Modo pensamiento'
  },
  ingles: {
    title: 'Inglés',
    subtitle: 'Reading, use of English, writing y comprensión',
    icon: Globe,
    kicker: 'Modo fluidez'
  }
}

const mdComponents: Partial<Components> = {
  h1: ({children}) => <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '1.2rem 0 0.65rem', borderBottom: '2px solid #e5edf9', paddingBottom: '0.35rem', color: '#111827' }}>{children}</h1>,
  h2: ({children}) => <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.05rem 0 0.5rem', color: '#111827' }}>{children}</h2>,
  h3: ({children}) => <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: '0.95rem 0 0.4rem' }}>{children}</h3>,
  strong: ({children}) => <strong style={{ fontWeight: 850, color: '#111827' }}>{children}</strong>,
  p: ({children}) => <p style={{ margin: '0.72rem 0', color: '#374151', lineHeight: 1.85 }}>{children}</p>,
  li: ({children}) => <li style={{ margin: '0.38rem 0', color: '#374151', lineHeight: 1.8 }}>{children}</li>,
  blockquote: ({children}) => <blockquote style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #93c5fd', borderRadius: '16px', padding: '1rem', margin: '1rem 0', color: '#475569', background: '#ffffff', boxShadow: '0 10px 24px rgba(37,99,235,0.06)' }}>{children}</blockquote>,
}

const darkMdComponents: Partial<Components> = {
  h1: ({children}) => <h1 style={{ fontSize: '1.05rem', fontWeight: 850, margin: '1.1rem 0 0.55rem', borderBottom: '1px solid #dbe7fb', paddingBottom: '0.3rem', color: '#0f172a', letterSpacing: '-0.02em' }}>{children}</h1>,
  h2: ({children}) => <h2 style={{ fontSize: '0.95rem', fontWeight: 850, margin: '0.95rem 0 0.45rem', color: '#1e3a8a', letterSpacing: '-0.01em' }}>{children}</h2>,
  h3: ({children}) => <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#334155', margin: '0.85rem 0 0.35rem' }}>{children}</h3>,
  strong: ({children}) => <strong style={{ fontWeight: 850, color: '#0f172a' }}>{children}</strong>,
  p: ({children}) => <p style={{ margin: '0.6rem 0', color: '#334155', lineHeight: 1.82 }}>{children}</p>,
  li: ({children}) => <li style={{ margin: '0.32rem 0', color: '#334155', lineHeight: 1.78 }}>{children}</li>,
  ul: ({children}) => <ul style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>{children}</ul>,
  ol: ({children}) => <ol style={{ paddingLeft: '1.2rem', margin: '0.5rem 0' }}>{children}</ol>,
  blockquote: ({children}) => <blockquote style={{ border: '1px solid #dbe7fb', borderLeft: '4px solid #60a5fa', borderRadius: '16px', padding: '0.9rem 1rem', margin: '0.85rem 0', color: '#475569', background: 'linear-gradient(135deg, #ffffff, #f8fbff)', boxShadow: '0 12px 26px rgba(37,99,235,0.06)' }}>{children}</blockquote>,
}

const planMdComponents: Partial<Components> = {
  h1: ({children}) => (
    <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: WARM.ink, margin: '0 0 18px', lineHeight: 1.2 }}>{children}</h1>
  ),
  h2: ({children}) => (
    <h2 style={{ margin: '22px 0 12px', padding: '14px 16px', borderRadius: '18px', background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: '1px solid #dbe7fb', color: WARM.blue, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 28px rgba(37,99,235,0.08)' }}>
      <Target size={17} />{children}
    </h2>
  ),
  h3: ({children}) => (
    <h3 style={{ margin: '16px 0 10px', color: WARM.ink, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Flame size={15} color={WARM.amber} />{children}
    </h3>
  ),
  strong: ({children}) => <strong style={{ fontWeight: 800, color: WARM.ink }}>{children}</strong>,
  p: ({children}) => <p style={{ margin: '0.55rem 0', color: WARM.muted, lineHeight: 1.75 }}>{children}</p>,
  ul: ({children}) => <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 16px', display: 'grid', gap: '8px' }}>{children}</ul>,
  ol: ({children}) => <ol style={{ paddingLeft: '1.2rem', margin: '10px 0 16px', display: 'grid', gap: '8px' }}>{children}</ol>,
  li: ({children}) => (
    <li style={{ background: WARM.surface, border: '1px solid #dbe7fb', borderRadius: '14px', padding: '10px 12px', color: WARM.ink, lineHeight: 1.6, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.045)' }}>
      {children}
    </li>
  ),
  blockquote: ({children}) => (
    <blockquote style={{ margin: '14px 0', padding: '14px 16px', borderRadius: '16px', background: WARM.wash, border: '1px solid #dbeafe', color: WARM.blue, fontWeight: 700 }}>
      {children}
    </blockquote>
  ),
}

function limpiarPlanGenerado(texto: string) {
  return texto
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/[ \t]+$/gm, '')
    .trim()
}

function examSystemLabel(ccaa: string) {
  if (ccaa === 'Madrid') return 'EBAU Madrid'
  if (ccaa === 'Cataluña') return 'PAU Catalunya'
  return 'PAU / EBAU'
}

function formatMatrixRows(raw: string) {
  const rows = raw
    .replace(/−/g, '-')
    .replace(/\t/g, ' ')
    .split('\n')
    .map(row => row.trim().replace(/\s+([+\-])\s+/g, '$1').replace(/\s+/g, ' '))
    .filter(Boolean)
    .map(row => row.split(' ').join(' & '))

  if (!rows.length) return ''

  const rowSeparator = ' ' + String.raw`\\` + ' '
  return '\n\n$$\\begin{pmatrix} ' + rows.join(rowSeparator) + ' \\end{pmatrix}$$\n\n'
}

function toLatexMathExpr(expr: string) {
  return expr
    .trim()
    .replace(/[−–]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/\btg\b/g, '\\tan')
    .replace(/\bsen\b/g, '\\sin')
    .replace(/\bln\b/g, '\\ln')
    .replace(/\bcos\b/g, '\\cos')
    .replace(/π/g, '\\pi')
    .replace(/[·∙⋅ꞏ]/g, '\\cdot ')
}

function formatBrokenMathBlocks(text: string) {
  return text
    .replace(/∫\s*([^\n]+)\n\s*([^\n]+)\n\s*([^\n.]+?)d([a-z])\./g, (_, upper, lower, expr, variable) =>
      '\n\n$$\\int_{' + toLatexMathExpr(lower) + '}^{' + toLatexMathExpr(upper) + '} ' + toLatexMathExpr(expr) + '\\,d' + variable + '$$\n\n'
    )
    .replace(/lim\s*\n\s*x\s*→\s*π\s*\n\s*2\s*\n\s*\(\s*\n\s*tg x\s*\n\s*2\s*\n\s*\)\s*\(\s*1\s*\n\s*cos x\s*\)\s*\./g,
      '\n\n$$\\lim_{x\\to\\pi/2}(\\tan x)^2\\left(\\frac{1}{\\cos x}\\right)$$\n\n'
    )
}

function normalizePdfGlyphs(text: string) {
  return text
    .replace(/\u00ad/g, '')
    .replace(/\t/g, ' ')
    .replace(/\uf0b4|×/g, ' · ')
    .replace(/\uf0d7|∙|⋅|ꞏ/g, ' · ')
    .replace(/\uf0ae|\uf022/g, '→')
    .replace(/\uf044/g, '⇄')
    .replace(/\uf02d/g, '-')
    .replace(/\uf06c/g, 'λ')
    .replace(/\uf020/g, ' ')
    .replace(/\uf072/g, '')
    .replace(/\uf6da/g, '')
    .replace(/\u20d7\s*([ijk])/g, ' $\\vec{$1}$')
}

function formatScientificNotation(text: string) {
  const unitPattern = '(m|cm|mm|kg|s|C|N|J|W|L|mol|A|T|Hz|atm|g)'
  const positiveUnitPattern = '(m|cm|mm|kg|s|J|W|L|mol|Hz|atm|g)'

  return text
    .replace(/10\s*[−-]\s*(\d+)/g, (_, exp) => '$10^{-' + exp + '}$')
    .replace(/10\s+([3-9]|[1-3]\d)\b/g, (_, exp) => '$10^{' + exp + '}$')
    .replace(new RegExp('\\b' + unitPattern + '\\s*[−-]\\s*(\\d+)\\b', 'g'), (_, unit, exp) => unit + '$^{-' + exp + '}$')
    .replace(new RegExp('(?<=\\s)' + positiveUnitPattern + '\\s*(\\d+)\\b', 'g'), (_, unit, exp) => unit + '$^{' + exp + '}$')
    .replace(/\b([A-Za-z])\s*([₀₁₂₃₄₅₆₇₈₉])\b/g, (_, base, sub) => base + '$_{' + '₀₁₂₃₄₅₆₇₈₉'.indexOf(sub) + '}$')
    .replace(/\b([A-Za-z])\s*([⁻⁰¹²³⁴⁵⁶⁷⁸⁹]+)/g, (_, base, sup) => {
      const map: Record<string, string> = { '⁻': '-', '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' }
      return base + '$^{' + String(sup).split('').map(ch => map[ch] ?? ch).join('') + '}$'
    })
}

function normalizeSoftLineBreaks(text: string) {
  return text
    .replace(/([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])-\s*\n\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ])/g, '$1$2')
    .replace(/([^\n])\n(?!\n|[a-d]\)|[ivx]+\)|Datos?[.:]|Dato[.:]|[A-Z]\.|[0-9]+[.)]|[-•])/gi, '$1 ')
}

function formatEnunciado(enunciado?: string | null) {
  return formatExamText(enunciado)
}

type Asignatura = 'general' | 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'historia_filosofia' | 'ingles'
type Tipo = 'Ordinaria' | 'Extraordinaria' | 'Modelo'
type Seccion = 'examenes' | 'chat' | 'historial' | 'planning'
interface MensajeChat { rol: 'usuario' | 'kairo'; texto: string }

const HOME_SECTIONS: Seccion[] = ['examenes', 'chat', 'historial', 'planning']
const HOME_SUBJECTS: Asignatura[] = ['mates', 'matematicas_ccss', 'fisica', 'quimica', 'biologia', 'ingles', 'lengua', 'historia', 'historia_filosofia']
// Asignaturas seleccionables en el Chat con Kairo — incluye "General" (sin temario/apuntes/toolbar de una asignatura concreta),
// que no es una asignatura con exámenes propios y por eso se mantiene fuera de HOME_SUBJECTS.
const CHAT_SUBJECTS: Asignatura[] = ['general', ...HOME_SUBJECTS]
const DEFAULT_PINNED_SUBJECTS: Asignatura[] = ['mates', 'fisica', 'historia']
const PINNED_SUBJECTS_STORAGE_KEY = 'kairo:pinned-subjects'
const PROFILE_PREFERENCES_STORAGE_KEY = 'kairo_profile_preferences'
const MAX_PINNED = 4

function readHomeSectionFromUrl(): Seccion | null {
  if (typeof window === 'undefined') return null
  const view = new URLSearchParams(window.location.search).get('view')
  return HOME_SECTIONS.includes(view as Seccion) ? view as Seccion : null
}

function readSubjectFromUrl(): Asignatura | null {
  if (typeof window === 'undefined') return null
  const subject = new URLSearchParams(window.location.search).get('subject')
  return HOME_SUBJECTS.includes(subject as Asignatura) ? subject as Asignatura : null
}

function readDefaultSubject(): Asignatura | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = JSON.parse(window.localStorage.getItem(PROFILE_PREFERENCES_STORAGE_KEY) ?? '{}')
    return HOME_SUBJECTS.includes(stored.defaultSubject as Asignatura) ? stored.defaultSubject as Asignatura : null
  } catch {
    return null
  }
}

function normalizePinnedSubjects(value: unknown): Asignatura[] {
  if (!Array.isArray(value)) return []
  const clean = value.filter((item): item is Asignatura => HOME_SUBJECTS.includes(item as Asignatura))
  return Array.from(new Set(clean)).slice(0, MAX_PINNED)
}

function hoverVars(color: string, light: string, accent = color) {
  return {
    '--hover-color': color,
    '--hover-bg': light,
    '--hover-border': accent,
    '--hover-shadow': `${accent}33`
  } as CSSProperties
}

function colorNota(n: number) {
  return n >= 7 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626'
}

type FilterDropdownOption = {
  label: string
  active?: boolean
  onSelect: () => void
}

type ExamSearchResult = {
  id: string
  year: string
  convocatoria: string
  title: string
  subtitle: string
  points: string
  searchText: string
  onSelect: () => void
}

function normalizeSearchText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function stringifyForSearch(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(stringifyForSearch).join(' ')
  if (typeof value === 'object') return Object.values(value as Record<string, unknown>).map(stringifyForSearch).join(' ')
  return ''
}

function FilterDropdown({ label, value, options }: { label: string; value: string; options: FilterDropdownOption[] }) {
  const [open, setOpen] = useState(false)
  const hasValue = options.some(o => o.active)
  return (
    <div className={`exam-filter-dropdown${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className={`exam-filter-trigger${hasValue ? ' has-value' : ''}${open ? ' is-open' : ''}`}
        aria-expanded={open}
        onClick={() => setOpen(c => !c)}
      >
        <span className="exam-filter-label">{label}</span>
        <span className="exam-filter-sep">·</span>
        <span className="exam-filter-value">{value}</span>
        <ChevronDown size={11} style={{ flexShrink: 0, color: open ? '#2563eb' : '#94a3b8', transition: 'transform 180ms cubic-bezier(0.23,1,0.32,1), color 140ms', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      {open && (
        <div className="exam-filter-menu">
          {options.map(option => (
            <button
              type="button"
              key={option.label}
              className={`exam-filter-option${option.active ? ' is-active' : ''}`}
              onClick={() => { option.onSelect(); setOpen(false) }}
            >
              <span>{option.label}</span>
              {option.active && <Check size={13} style={{ flexShrink: 0, color: '#2563eb' }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SubjectIllustration({ subject, color, accent }: { subject: Asignatura; color: string; accent: string }) {
  const common = {
    position: 'absolute' as const,
    right: '16px',
    bottom: '10px',
    width: '138px',
    height: '96px',
    opacity: 0.82,
    pointerEvents: 'none' as const
  }

  if (subject === 'mates' || subject === 'matematicas_ccss') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <path d="M18 84H132" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.28" />
        <path d="M24 80V22" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.28" />
        {[42, 62, 82, 102, 122].map(x => <path key={x} d={`M${x} 80V72`} stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.22" />)}
        <path d="M30 70C45 58 51 66 64 50C76 35 86 42 99 28C108 18 118 17 128 13" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" />
        <path d="M30 70C48 62 55 70 70 56C84 42 94 48 109 33C118 24 124 22 132 18" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.45" />
        <circle cx="30" cy="70" r="6" fill={accent} />
        <circle cx="70" cy="56" r="6" fill={accent} />
        <circle cx="109" cy="33" r="6" fill={accent} />
      </svg>
    )
  }

  if (subject === 'fisica') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <circle cx="74" cy="53" r="12" fill={accent} opacity="0.78" />
        <ellipse cx="74" cy="53" rx="52" ry="18" fill="none" stroke={color} strokeWidth="4" opacity="0.32" />
        <ellipse cx="74" cy="53" rx="52" ry="18" fill="none" stroke={accent} strokeWidth="3" transform="rotate(58 74 53)" opacity="0.6" />
        <ellipse cx="74" cy="53" rx="52" ry="18" fill="none" stroke={accent} strokeWidth="3" transform="rotate(-58 74 53)" opacity="0.48" />
        <path d="M105 66C116 75 124 75 135 66" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.22" />
        <circle cx="119" cy="35" r="5" fill={accent} />
      </svg>
    )
  }

  if (subject === 'quimica') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <path d="M62 18H98" stroke={color} strokeWidth="4" strokeLinecap="round" />
        <path d="M72 18V43L45 82C40 89 45 96 54 96H110C119 96 124 89 119 82L92 43V18" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
        <path d="M58 74C68 67 78 82 91 73C98 68 106 69 115 75L121 84C124 90 119 96 110 96H54C45 96 40 89 45 82L51 73C53 74 55 75 58 74Z" fill={accent} opacity="0.28" />
        <circle cx="64" cy="66" r="4" fill={accent} />
        <circle cx="97" cy="58" r="5" fill={accent} opacity="0.78" />
        <circle cx="86" cy="84" r="3" fill={color} opacity="0.35" />
      </svg>
    )
  }

  if (subject === 'biologia') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <path d="M42 17C92 21 104 82 52 88" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.58" />
        <path d="M104 17C54 21 42 82 94 88" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round" opacity="0.72" />
        {[25, 39, 53, 67, 81].map((y, index) => (
          <path key={y} d={`M${index % 2 ? 57 : 61} ${y}H${index % 2 ? 91 : 95}`} stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.38" />
        ))}
        <circle cx="42" cy="17" r="5" fill={accent} />
        <circle cx="52" cy="88" r="5" fill={color} opacity="0.7" />
        <circle cx="104" cy="17" r="5" fill={color} opacity="0.7" />
        <circle cx="94" cy="88" r="5" fill={accent} />
      </svg>
    )
  }

  if (subject === 'lengua') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <path d="M28 27C43 20 56 20 72 29V88C56 80 43 80 28 87V27Z" fill="#fff" stroke={color} strokeWidth="4" strokeLinejoin="round" opacity="0.78" />
        <path d="M72 29C88 20 103 20 122 27V87C104 80 89 80 72 88V29Z" fill="#fff" stroke={accent} strokeWidth="4" strokeLinejoin="round" opacity="0.86" />
        <path d="M43 39H60M43 51H61M43 63H57" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.38" />
        <path d="M86 39H107M86 51H111M86 63H103" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.58" />
        <path d="M104 18C116 23 121 34 117 48C113 37 107 29 96 24C99 22 101 20 104 18Z" fill={accent} opacity="0.42" />
        <path d="M96 24C108 29 114 38 117 48" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.52" />
        <path d="M95 71C102 79 112 80 121 72" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.36" />
      </svg>
    )
  }

  if (subject === 'historia_filosofia') {
    return (
      <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
        <path d="M58 88C57 75 50 70 42 62C33 53 32 38 42 28C51 18 68 17 79 25C90 18 107 22 113 35C119 48 112 61 101 67C94 71 90 77 91 88" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.52" />
        <path d="M55 38C61 31 70 31 76 38M82 39C89 33 99 35 103 43M49 53C58 51 64 56 68 63M80 61C87 53 98 54 104 62" fill="none" stroke={accent} strokeWidth="4" strokeLinecap="round" opacity="0.78" />
        <path d="M39 82H110" stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.32" />
        <path d="M98 20H125C131 20 135 24 135 30V49C135 55 131 59 125 59H119L112 69V59H102" fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.46" />
        <path d="M108 34H126M108 45H121" stroke={accent} strokeWidth="3" strokeLinecap="round" opacity="0.74" />
        <circle cx="77" cy="24" r="5" fill={accent} opacity="0.72" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 150 105" style={common} aria-hidden="true">
      <path d="M25 41L75 17L125 41" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.66" />
      <path d="M36 45H114" stroke={accent} strokeWidth="5" strokeLinecap="round" opacity="0.72" />
      {[45, 63, 81, 99].map(x => (
        <g key={x}>
          <path d={`M${x} 48V82`} stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.46" />
          <path d={`M${x - 7} 84H${x + 7}`} stroke={color} strokeWidth="4" strokeLinecap="round" opacity="0.34" />
        </g>
      ))}
      <path d="M30 91H120" stroke={color} strokeWidth="5" strokeLinecap="round" opacity="0.56" />
      <circle cx="75" cy="39" r="5" fill={accent} opacity="0.92" />
    </svg>
  )
}

function EmptyQuestionsState({ subject }: { subject: Asignatura }) {
  const config = ASIGNATURAS[subject]
  const title = SUBJECT_CARDS[subject].title
  const Icon = config.icon
  const isPendingDataSubject = subject === 'matematicas_ccss'

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.96)', borderRadius: '28px', border: '1px solid rgba(219, 231, 251, 0.95)', padding: '34px', marginBottom: '22px', boxShadow: WARM.shadow, textAlign: 'center' }}>
      <div style={{ width: '66px', height: '66px', borderRadius: '23px', background: config.light, color: config.color, border: '1px solid ' + config.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 14px 30px rgba(37,99,235,0.08)' }}>
        <SearchX size={30} />
      </div>
      <div style={{ fontSize: '20px', fontWeight: 850, color: WARM.ink, marginBottom: '8px' }}>
        {isPendingDataSubject ? 'No hay exámenes disponibles todavía para esta asignatura.' : `No hay preguntas de ${title} para este filtro.`}
      </div>
      <p style={{ maxWidth: '620px', margin: '0 auto', color: WARM.muted, fontSize: '15px', lineHeight: 1.7, fontWeight: 650 }}>
        {isPendingDataSubject
          ? 'Los PDFs de Matemáticas CCSS Madrid están registrados como fuente, pero sus ejercicios aún no están transcritos de forma estructurada.'
          : 'Prueba con otra convocatoria, año, opción o comunidad.'}
      </p>
      <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '999px', padding: '7px 12px', background: config.light, color: config.color, border: '1px solid ' + config.soft, fontSize: '12px', fontWeight: 800 }}>
        <Icon size={14} />{config.label}
      </div>
    </div>
  )
}

function officialScore(value: unknown, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function clampScore(value: unknown, max: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Math.min(max, Math.max(0, number))
}

function formatPts(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '0'
}

function sanitizeCorrectionScaleText(text: string, maxScore: number) {
  return text
    .replace(/\s*\(\s*[0-9]+[.,]?[0-9]*\s*\/\s*14\s*\)/gi, '')
    .replace(/([0-9]+[.,]?[0-9]*)\s*\/\s*14\b/g, (_, score) => `${score}/${formatPts(maxScore)} pts`)
    .replace(/sobre\s+14\b/gi, `sobre ${formatPts(maxScore)} puntos`)
}

type HistorialItem = {
  id?: string
  asignatura: string
  bloque: string
  tipo: string
  año: number | string
  nota: number | null
  nota_maxima: number
  created_at: string
  enunciado?: string | null
  correccion?: string | null
  respuesta?: string | null
}

function normalizedHistoryScore(item: HistorialItem) {
  const score = Number(item.nota)
  const max = Number(item.nota_maxima)
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) return null
  return Math.min(10, Math.max(0, (score / max) * 10))
}

function calcMedia(items: HistorialItem[]) {
  const scores = items.map(normalizedHistoryScore).filter((score): score is number => score !== null)
  if (!scores.length) return null
  return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
}

function historySourceLabel(item: HistorialItem) {
  const tipo = String(item.tipo ?? '').trim()
  if (!tipo) return 'Corrección'
  if (/camino/i.test(tipo)) return 'Camino PAU'
  return tipo
}

function historyScoreDisplay(item: HistorialItem) {
  if (item.nota == null || item.nota_maxima == null || Number(item.nota_maxima) <= 0) return '—'
  return `${Number(item.nota).toLocaleString('es-ES')}/${Number(item.nota_maxima).toLocaleString('es-ES')}`
}

// Donut de "promedio general" sobre 10 — trazado con stroke-dasharray, sin
// depender de ninguna librería de gráficos.
function HistorialDonut({ value, size = 96 }: { value: number | null; size?: number }) {
  const stroke = Math.round(size * 0.104)
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.max(0, Math.min(1, (value ?? 0) / 10))
  const offset = circumference * (1 - pct)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e8eef7" strokeWidth={stroke} />
      {value !== null && (
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={pct >= 0.7 ? '#16a34a' : pct >= 0.5 ? '#2563eb' : '#dc2626'}
          strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms cubic-bezier(0.23,1,0.32,1)' }}
        />
      )}
    </svg>
  )
}

// Línea de evolución mensual (0-10) — puntos sin dato (mes sin correcciones
// con nota) se saltan en vez de dibujarse como un 0 falso.
function HistorialTrendChart({ points }: { points: Array<{ label: string; avg: number | null }> }) {
  const width = 240
  const height = 118
  const padX = 6
  const padTop = 14
  const padBottom = 8
  const withData = points.filter(p => p.avg !== null) as Array<{ label: string; avg: number }>
  if (withData.length < 2) {
    return <p className="history-trend-empty">Aún no hay suficientes meses con notas para ver la evolución.</p>
  }
  const stepX = (width - padX * 2) / (points.length - 1)
  const toXY = (i: number, avg: number) => {
    const x = padX + i * stepX
    const y = height - padBottom - (avg / 10) * (height - padTop - padBottom)
    return [x, y]
  }
  const pathPoints = points
    .map((p, i) => (p.avg !== null ? toXY(i, p.avg) : null))
    .filter((p): p is [number, number] => p !== null)
  const path = pathPoints.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${path} L${pathPoints[pathPoints.length - 1][0]},${height} L${pathPoints[0][0]},${height} Z`
  const last = pathPoints[pathPoints.length - 1]
  const lastValue = withData[withData.length - 1].avg
  const withDataIndexes = points
    .map((p, i) => (p.avg !== null ? i : null))
    .filter((i): i is number => i !== null)
  return (
    <div className="history-trend-chart">
      <div className="history-trend-max">10</div>
      <div className="history-trend-min">0</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <line x1={padX} y1={padTop} x2={width - padX} y2={padTop} stroke="#eef2f7" strokeWidth={1} />
        <line x1={padX} y1={height - padBottom} x2={width - padX} y2={height - padBottom} stroke="#eef2f7" strokeWidth={1} />
        <path d={areaPath} fill="rgba(37,99,235,0.12)" stroke="none" />
        <path d={path} fill="none" stroke="#2563eb" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" />
        {pathPoints.map(([x, y], i) => {
          const pointIndex = withDataIndexes[i]
          const pointLabel = points[pointIndex].label
          const pointAvg = points[pointIndex].avg as number
          return (
            <circle key={i} cx={x} cy={y} r={i === pathPoints.length - 1 ? 4 : 3} fill="#2563eb" stroke="#fff" strokeWidth={i === pathPoints.length - 1 ? 2 : 0}>
              <title>{pointLabel}: {pointAvg.toFixed(1)}/10</title>
            </circle>
          )
        })}
        <text x={Math.min(last[0] + 6, width - 20)} y={last[1] - 8} fontSize="12" fontWeight={900} fill="#1d4ed8">
          {lastValue.toFixed(1)}
        </text>
      </svg>
      <div className="history-trend-labels">
        {points.map(p => <span key={p.label}>{p.label}</span>)}
      </div>
    </div>
  )
}

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  const [seccion, setSeccion] = useState<Seccion>('examenes')
  const [asignatura, setAsignatura] = useState<Asignatura>('mates')
  const [showAllSubjects, setShowAllSubjects] = useState(false)
  const [pinnedSubjects, setPinnedSubjects] = useState<Asignatura[]>([])
  const [pinnedLimitMsg, setPinnedLimitMsg] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [tipo, setTipo] = useState<Tipo>('Ordinaria')
  const [examenIdx, setExamenIdx] = useState(0)
  const [catEjercicioIdx, setCatEjercicioIdx] = useState(0)
  const [catHistoriaEjercicioIdx, setCatHistoriaEjercicioIdx] = useState(0)
  const [catFisicaEjercicioIdx, setCatFisicaEjercicioIdx] = useState(0)
  const [catAsignaturaEjercicioIdx, setCatAsignaturaEjercicioIdx] = useState(0)
  const [bloqueIdx, setBloqueIdx] = useState(0)
  const [diaHistoriaIdx, setDiaHistoriaIdx] = useState(0)
  const [opcion, setOpcion] = useState<0|1>(0)
  const [respuesta, setRespuesta] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)
  const [imagenTipo, setImagenTipo] = useState('image/jpeg')
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [correccion, setCorreccion] = useState('')
  const [streamText, setStreamText] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [continuingCorrection, setContinuingCorrection] = useState(false)
  const [correctionStage, setCorrectionStage] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto'|'imagen'>('texto')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [inputChat, setInputChat] = useState('')
  const [cargandoChat, setCargandoChat] = useState(false)
  const [historial, setHistorial] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [historialTotalCount, setHistorialTotalCount] = useState<number | null>(null)
  const [historialPercentil, setHistorialPercentil] = useState<{ percentil: number | null; totalUsuarios: number } | null>(null)
  const [historialSearch, setHistorialSearch] = useState('')
  const [historialSubjectFilter, setHistorialSubjectFilter] = useState<Asignatura | 'todas'>('todas')
  const [historialSourceFilter, setHistorialSourceFilter] = useState('todas')
  const [historialDateFilter, setHistorialDateFilter] = useState<'todas' | '30' | '90'>('todas')
  const [historialOrder, setHistorialOrder] = useState<'recent' | 'oldest' | 'best' | 'worst'>('recent')
  const [historialFiltersOpen, setHistorialFiltersOpen] = useState(true)
  const [historialTab, setHistorialTab] = useState<'todas' | 'guardadas'>('todas')
  const [historialRowMenuOpenId, setHistorialRowMenuOpenId] = useState<string | null>(null)
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  const [planIA, setPlanIA] = useState('')
  const [cargandoPlan, setCargandoPlan] = useState(false)
  const [contextoChat, setContextoChat] = useState('')
  const [caminoExerciseNotice, setCaminoExerciseNotice] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const chatInputRef = useRef<HTMLTextAreaElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const randomEvauResolutionKeyRef = useRef('')
  const cfg = ASIGNATURAS[asignatura]
  const { ccaa, setCCAA } = useCCAA()
  const isCatalunaMates = asignatura === 'mates' && ccaa === 'Cataluña'
  const isMadridMathStyle = asignatura === 'mates' || asignatura === 'matematicas_ccss'
  const isCatalunaHistoria = asignatura === 'historia' && ccaa === 'Cataluña'
  const isCatalunaFisica = asignatura === 'fisica' && ccaa === 'Cataluña'
  const isCatalunaQuimica = asignatura === 'quimica' && ccaa === 'Cataluña'
  const isCatalunaLengua = asignatura === 'lengua' && ccaa === 'Cataluña'
  const isPhilosophy = asignatura === 'historia_filosofia'
  const isCatalunaExam = isCatalunaMates || isCatalunaHistoria || isCatalunaFisica || isCatalunaQuimica || isCatalunaLengua || isPhilosophy
  const pinnedClean = normalizePinnedSubjects(pinnedSubjects)
  // Fill up to min 2 with recommended subjects not already pinned (never saved to localStorage)
  const fillerSubjects = HOME_SUBJECTS.filter(s => !pinnedClean.includes(s))
  const targetCount = Math.max(pinnedClean.length, 2)
  const orderedHomeSubjects = [...pinnedClean, ...HOME_SUBJECTS.filter(subject => !pinnedClean.includes(subject))]
  const visibleSubjectCards = showAllSubjects
    ? orderedHomeSubjects
    : [...pinnedClean, ...fillerSubjects].slice(0, targetCount)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else {
        setUsuario(data.user)
        if (window.location.pathname === '/' && !window.location.search) window.location.replace('/camino')
      }
    })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlSection = readHomeSectionFromUrl()
    const initialSubject = readSubjectFromUrl() ?? readDefaultSubject()
    if (initialSubject) cambiarAsignatura(initialSubject)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Inicialización desde URL en mount único — sin bucle posible
    if (urlSection) setSeccion(urlSection)
    if (urlSection === 'chat' && params.get('from') === 'camino_course') {
      const subject = params.get('subject') ?? ''
      const block = params.get('block') ?? ''
      const topic = params.get('topic') ?? ''
      const question = params.get('question')
      const label = [subject, block, topic].filter(Boolean).join(' · ')
      setContextoChat(`Camino PAU curso: ${label}. Ayuda al alumno con este tema sin inventar datos ni copiar apuntes.`)
      if (question) setInputChat(question)
      setMensajes(current => current.length ? current : [{ rol: 'kairo', texto: `Estoy contigo en este tema de Camino PAU${label ? `: ${label}` : ''}. Pregúntame la duda concreta y la trabajamos paso a paso.` }])
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    const textarea = chatInputRef.current
    if (!textarea) return
    const maxHeight = 180
    textarea.style.height = 'auto'
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight)
    textarea.style.height = `${nextHeight}px`
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [inputChat])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(PINNED_SUBJECTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const normalized = normalizePinnedSubjects(parsed)
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Hidratación desde localStorage en mount único
        setPinnedSubjects(normalized)
        // Re-save if localStorage had more than MAX_PINNED entries
        if (Array.isArray(parsed) && parsed.length !== normalized.length) {
          window.localStorage.setItem(PINNED_SUBJECTS_STORAGE_KEY, JSON.stringify(normalized))
        }
      }
    } catch {
      setPinnedSubjects(DEFAULT_PINNED_SUBJECTS)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- React 18 batchea estos setState — reset controlado al cambiar ccaa
    setTipo('Ordinaria')
    setExamenIdx(0)
    setCatEjercicioIdx(0)
    setCatHistoriaEjercicioIdx(0)
    setCatFisicaEjercicioIdx(0)
    setCatAsignaturaEjercicioIdx(0)
    setBloqueIdx(0)
    setOpcion(0)
    reset()
  }, [ccaa]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (seccion !== 'historial') return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Loading-state síncrono antes de llamada async — patrón estándar
    setCargandoHistorial(true)
    // El conteo real va aparte de la lista: la lista se pagina con un límite
    // generoso para la vista/agrupación por mes, pero "total correcciones" no
    // puede depender de ese límite o se queda pillado en cuanto se supera.
    Promise.all([
      supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(500),
      supabase.from('historial_examenes').select('*', { count: 'exact', head: true }),
    ]).then(([{ data }, { count }]) => {
      setHistorial(data || [])
      setHistorialTotalCount(count ?? (data ?? []).length)
      setCargandoHistorial(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) return
      fetch('/api/historial/percentile', { headers: { Authorization: `Bearer ${session.access_token}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setHistorialPercentil({ percentil: d.percentil, totalUsuarios: d.totalUsuarios }) })
        .catch(() => {})
    })
  }, [seccion])

  function syncHomeUrl(nextSection: Seccion, nextSubject = asignatura) {
    if (typeof window === 'undefined' || window.location.pathname !== '/') return
    const params = new URLSearchParams(window.location.search)
    if (nextSection === 'examenes') params.delete('view')
    else params.set('view', nextSection)
    if (nextSection === 'examenes') params.set('subject', nextSubject)
    else params.delete('subject')
    const query = params.toString()
    window.history.replaceState(null, '', query ? `/?${query}` : '/')
  }

  function navegarASeccion(nextSection: Seccion) {
    setSeccion(nextSection)
    syncHomeUrl(nextSection)
  }

  function navegarAAsignatura(nextSubject: Asignatura) {
    cambiarAsignatura(nextSubject)
    setSeccion('examenes')
    syncHomeUrl('examenes', nextSubject)
  }

  function togglePinnedSubject(subject: Asignatura) {
    const exists = pinnedSubjects.includes(subject)
    if (!exists && pinnedSubjects.length >= MAX_PINNED) {
      setPinnedLimitMsg(true)
      return
    }
    setPinnedLimitMsg(false)
    const next = exists ? pinnedSubjects.filter(item => item !== subject) : [subject, ...pinnedSubjects]
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(PINNED_SUBJECTS_STORAGE_KEY, JSON.stringify(next))
      } catch {}
    }
    setPinnedSubjects(next)
  }

  const TIPOS_FISICA = [
  { tipo: 'Gravitacion', label: 'Gravitación', puntos: 2 },
  { tipo: 'Ondas', label: 'Ondas', puntos: 2 },
  { tipo: 'Electricidad', label: 'Electricidad', puntos: 2 },
  { tipo: 'Optica', label: 'Óptica', puntos: 2 },
  { tipo: 'RadioactividadModerna', label: 'Radioactividad moderna', puntos: 2 }
] as const

const TIPOS_HISTORIA = [
  { tipo: 'tema', label: 'Tema', pts: 4 },
  { tipo: 'comentario', label: 'Comentario', pts: 3 },
  { tipo: 'definicion', label: 'Definiciones', pts: 1.5 },
  { tipo: 'corta', label: 'Respuesta corta', pts: 1.5 }
] as const

const TIPOS_LENGUA = [
  { tipo: 'Comunicacion', label: 'Comunicación', pts: 5 },
  { tipo: 'ReflexionLengua', label: 'Reflexión sobre la lengua', pts: 2.5 },
  { tipo: 'EducacionLiteraria', label: 'Educación literaria', pts: 2.5 }
] as const

const LABELS_HISTORIA: Record<string, string> = {
  cuestiones: 'Cuestiones',
  fuente: 'Fuente',
  fuente1: 'Fuente 1',
  fuente2: 'Fuente 2',
  tema: 'Tema',
  texto: 'Texto',
  comentario: 'Comentario',
  definicion: 'Definiciones',
  corta: 'Respuesta corta'
}

const EXAMENES_BY_ASIGNATURA: Partial<Record<Asignatura, any[]>> = { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  mates: examenes,
  matematicas_ccss: examenesMatematicasCCSSMadrid,
  fisica: examenesFisica,
  quimica: examenesQuimica,
  biologia: examenesBiologia,
  lengua: examenesLengua,
  ingles: examenesIngles,
  historia: examenesHistoria,
}

const SUBJECTS_REQUIRING_STRUCTURED_EXAMS = new Set<Asignatura>(['matematicas_ccss'])

const isAvailableOfficialExercise = (exercise: unknown) => !isIncompleteOfficialExercise(exercise)
const availableQuestionsForExam = (examen: any) => ((examen?.preguntas ?? []) as any[]).filter(isAvailableOfficialExercise) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
const hasStructuredQuestions = (examen: any) => Array.isArray(examen?.preguntas) && availableQuestionsForExam(examen).length > 0 // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión

const perteneceAComunidadSeleccionada = (examen: any) => // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  (examen.comunidad ?? examen.ccaa) === ccaa

const examenesAsignatura = EXAMENES_BY_ASIGNATURA[asignatura] ?? examenesHistoria
const requiresStructuredExams = SUBJECTS_REQUIRING_STRUCTURED_EXAMS.has(asignatura)

const examenesFiltrados = examenesAsignatura.filter(e =>
  e.tipo === tipo &&
  perteneceAComunidadSeleccionada(e) &&
  (!Array.isArray((e as any).preguntas) || availableQuestionsForExam(e).length > 0) && // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  (!requiresStructuredExams || hasStructuredQuestions(e))
)

const aniosDisponibles = isCatalunaMates
  ? Array.from(new Set(examenesCatMates.filter(p => p.tipo === tipo).map(p => p.year)))
      .sort((a, b) => b - a)
  : isCatalunaFisica
    ? Array.from(new Set(examenesFisicaCataluna
        .filter(examen => examen.convocatoria === tipo.toLowerCase())
        .map(examen => examen.anio)))
        .sort((a, b) => b - a)
  : isCatalunaQuimica
    ? Array.from(new Set(examenesQuimicaCataluna
        .filter(examen => examen.convocatoria === tipo.toLowerCase())
        .map(examen => examen.anio)))
        .sort((a, b) => b - a)
  : isCatalunaLengua
    ? Array.from(new Set(examenesLenguaCataluna
        .filter(examen => examen.convocatoria === tipo.toLowerCase())
        .map(examen => examen.anio)))
        .sort((a, b) => b - a)
  : isCatalunaHistoria
    ? Object.values(examenesCataluna)
        .map((e: any) => e.anio) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .filter((value, index, values) => values.indexOf(value) === index)
        .sort((a, b) => b - a)
  : Array.from(new Set(examenesFiltrados.map(e => e.año)))
      .sort((a, b) => b - a)

const anioSeleccionado = aniosDisponibles[examenIdx] ?? aniosDisponibles[0]

const examenesCatalunaDelAnio = isCatalunaHistoria
  ? Object.values(examenesCataluna).filter((e: any) => e.anio === anioSeleccionado) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  : []

const examenCatalunaActivo = examenesCatalunaDelAnio[0] ?? null
const ejerciciosCatalunaHistoria = (examenCatalunaActivo?.ejercicios ?? []).filter(isAvailableOfficialExercise)
const ejercicioCatalunaHistoriaActivo =
  ejerciciosCatalunaHistoria[catHistoriaEjercicioIdx] ?? ejerciciosCatalunaHistoria[0] ?? null

const examenFisicaCatalunaActivo = isCatalunaFisica
  ? examenesFisicaCataluna.find(examen => examen.anio === anioSeleccionado && examen.convocatoria === tipo.toLowerCase()) ?? null
  : null
const ejerciciosFisicaCataluna = (examenFisicaCatalunaActivo?.ejercicios ?? []).filter(isAvailableOfficialExercise)
const ejercicioFisicaCatalunaActivo =
  ejerciciosFisicaCataluna[catFisicaEjercicioIdx] ?? ejerciciosFisicaCataluna[0] ?? null

const examenQuimicaCatalunaActivo = isCatalunaQuimica
  ? examenesQuimicaCataluna.find(examen => examen.anio === anioSeleccionado && examen.convocatoria === tipo.toLowerCase()) ?? null
  : null
const ejerciciosQuimicaCataluna: CatEjercicioView[] = examenQuimicaCatalunaActivo?.ejercicios.filter(isAvailableOfficialExercise).map(ejercicio => ({
  id: String(ejercicio.numero),
  titulo: ejercicio.titulo,
  instrucciones: ejercicio.instrucciones,
  enunciado: ejercicio.enunciado,
  apartados: ejercicio.apartados.map(apartado => ({ id: apartado.letra, enunciado: apartado.enunciado, puntos: apartado.puntos })),
  datos: ejercicio.datos,
  imagenes: ejercicio.imagenes,
  requiereRevision: ejercicio.requiereRevision,
})) ?? []

const examenLenguaCatalunaActivo = isCatalunaLengua
  ? examenesLenguaCataluna.find(examen => examen.anio === anioSeleccionado && examen.convocatoria === tipo.toLowerCase()) ?? null
  : null
const ejerciciosLenguaCataluna: CatEjercicioView[] = (examenLenguaCatalunaActivo
  ? [
      ...(examenLenguaCatalunaActivo.opciones ?? []).flatMap(opcion => opcion.bloques.map(bloque => ({
        id: `${opcion.opcion}-${bloque.id}`,
        titulo: `${opcion.titulo} · ${bloque.titulo}`,
        instrucciones: bloque.instrucciones,
        texto: [opcion.texto, bloque.texto].filter(Boolean).join('\n\n'),
        fuente: [opcion.fuente, bloque.fuente].filter(Boolean).join('\n\n'),
        apartados: bloque.apartados,
        opcion: opcion.opcion,
      }))),
      ...(examenLenguaCatalunaActivo.partesComunes ?? []).map(bloque => ({
        id: `comun-${bloque.id}`,
        titulo: `Parte común · ${bloque.titulo}`,
        instrucciones: bloque.instrucciones,
        texto: bloque.texto,
        fuente: bloque.fuente,
        apartados: bloque.apartados,
        opcion: 'Parte común',
      })),
      ...(examenLenguaCatalunaActivo.partesObligatorias ?? []).map(bloque => ({
        id: bloque.id,
        titulo: bloque.titulo,
        instrucciones: bloque.instrucciones,
        texto: bloque.texto,
        fuente: bloque.fuente,
        apartados: bloque.apartados,
      })),
    ]
  : []).filter(isAvailableOfficialExercise)
const ejerciciosAsignaturaCataluna = isCatalunaQuimica ? ejerciciosQuimicaCataluna : ejerciciosLenguaCataluna
const ejercicioAsignaturaCatalunaActivo =
  ejerciciosAsignaturaCataluna[catAsignaturaEjercicioIdx] ?? ejerciciosAsignaturaCataluna[0] ?? null

const preguntasCatFiltradas = isCatalunaMates
  ? examenesCatMates.filter(p => p.tipo === tipo && p.year === anioSeleccionado)
  : []

const ejerciciosDisponiblesCat = preguntasCatFiltradas.filter((pregunta, index, preguntas) =>
  preguntas.findIndex(candidate => candidate.ejercicio === pregunta.ejercicio && candidate.opcion === pregunta.opcion) === index
)

const preguntaCatSeleccionada = ejerciciosDisponiblesCat[catEjercicioIdx]

const preguntaCatActiva = preguntaCatSeleccionada
  ? preguntasCatFiltradas.find(p => p.ejercicio === preguntaCatSeleccionada.ejercicio && p.opcion === preguntaCatSeleccionada.opcion)
  : undefined

const examen = examenesFiltrados.find(e => e.año === anioSeleccionado) ?? examenesFiltrados[0]

const examenesHistoriaDelAnio = asignatura === 'historia'
  ? (examenesFiltrados as typeof examenesHistoria).filter(e => e.año === anioSeleccionado)
  : []

const diasHistoriaDisponibles = Array.from(
  new Set(examenesHistoriaDelAnio.map(e => e.dia).filter(Boolean))
) as ('Lunes' | 'Martes')[]

const diaHistoriaSeleccionado = diasHistoriaDisponibles[diaHistoriaIdx] ?? diasHistoriaDisponibles[0]

const examenesHistoriaDelDia = diasHistoriaDisponibles.length
  ? examenesHistoriaDelAnio.filter(e => e.dia === diaHistoriaSeleccionado)
  : examenesHistoriaDelAnio

const examenesLenguaDelAnio = asignatura === 'lengua'
  ? (examenesFiltrados as typeof examenesLengua).filter(e => e.año === anioSeleccionado)
  : []

const versionesLenguaDisponibles = Array.from(
  new Set(examenesLenguaDelAnio.map(e => e.dia ?? e.opcion).filter(Boolean))
) as string[]

const versionLenguaSeleccionada = versionesLenguaDisponibles[diaHistoriaIdx] ?? versionesLenguaDisponibles[0]

const examenLengua = asignatura === 'lengua'
  ? versionesLenguaDisponibles.length
    ? examenesLenguaDelAnio.find(e => (e.dia ?? e.opcion) === versionLenguaSeleccionada) ?? examenesLenguaDelAnio[0]
    : examenesLenguaDelAnio[0]
  : null

const examenesInglesDelAnio = asignatura === 'ingles'
  ? (examenesFiltrados as typeof examenesIngles).filter(e => e.año === anioSeleccionado)
  : []

const diasInglesDisponibles = Array.from(new Set(examenesInglesDelAnio.map(e => e.dia).filter(Boolean))) as string[]

const diaInglesSeleccionado = diasInglesDisponibles[diaHistoriaIdx] ?? diasInglesDisponibles[0]

const examenesInglesDia = diasInglesDisponibles.length
  ? examenesInglesDelAnio.filter(e => e.dia === diaInglesSeleccionado)
  : examenesInglesDelAnio

const opcionesInglesDisponibles = asignatura === 'ingles'
  ? Array.from(new Set(examenesInglesDia.map(e => e.opcion)))
  : []

const examenIngles = asignatura === 'ingles'
  ? (examenesInglesDia.find(e => e.opcion === (opcion === 0 ? 'A' : 'B')) ??
     examenesInglesDia.find(e => e.opcion === 'Única') ??
     examenesInglesDia[0]) ?? null
  : null

const preguntasIngles = asignatura === 'ingles' ? availableQuestionsForExam(examenIngles) : []

const bloquesIngles = preguntasIngles.map((p: any) => ({ tipo: p.bloque, label: p.label, pts: p.puntuacion })) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión

const tipoInglesActivo = bloquesIngles[bloqueIdx]?.tipo

const preguntaIngles = asignatura === 'ingles'
  ? tipoInglesActivo
    ? preguntasIngles.find((p: any) => p.bloque === tipoInglesActivo) ?? null // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    : null
  : null

const preguntasA = isMadridMathStyle
  ? availableQuestionsForExam(examen).filter((p: any) => p.opcion === 'A') ?? [] // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  : []

const preguntasB = isMadridMathStyle
  ? availableQuestionsForExam(examen).filter((p: any) => p.opcion === 'B') ?? [] // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  : []

const bloquesMates = Array.from(new Set(
  isMadridMathStyle
    ? availableQuestionsForExam(examen).map((p: any) => p.bloque) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    : []
)) as string[]

const tipoMatesActivo = bloquesMates[bloqueIdx]

const preguntaMates =
  availableQuestionsForExam(examen).find(
    (p: any) => // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      p.opcion === (opcion === 0 ? 'A' : 'B') &&
      p.bloque === tipoMatesActivo
  ) ??
  availableQuestionsForExam(examen).find((p: any) => p.bloque === tipoMatesActivo) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  availableQuestionsForExam(examen)[0]

const tipoFisicaActivo = TIPOS_FISICA[bloqueIdx]?.tipo

const preguntaFisica = asignatura === 'fisica'
  ? availableQuestionsForExam(examen).find(
      (p: any) => // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoFisicaActivo
    ) ??
    availableQuestionsForExam(examen).find((p: any) => p.bloque === tipoFisicaActivo) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    availableQuestionsForExam(examen).find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    availableQuestionsForExam(examen)[0]
  : null

const preguntasQuimica = asignatura === 'quimica'
  ? availableQuestionsForExam(examen)
  : []

const bloquesQuimica = Array.from(
  new Map(
    preguntasQuimica.map((p: any) => [ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      p.bloque,
      { tipo: p.bloque, label: p.label ?? p.numero ?? p.bloque, pts: p.puntuacion }
    ])
  ).values()
) as { tipo: string; label: string; pts: number }[]

const tipoQuimicaActivo = bloquesQuimica[bloqueIdx]?.tipo

const preguntaQuimica = asignatura === 'quimica'
  ? preguntasQuimica.find(
      (p: any) => // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoQuimicaActivo
    ) ??
    preguntasQuimica.find((p: any) => p.bloque === tipoQuimicaActivo) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    preguntasQuimica.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    preguntasQuimica[0]
  : null

const examenesBiologiaDelAnio = asignatura === 'biologia'
  ? (examenesFiltrados as typeof examenesBiologia).filter(e => e.año === anioSeleccionado)
  : []

const seriesBiologiaDisponibles = Array.from(new Set(examenesBiologiaDelAnio.map(e => e.dia).filter(Boolean))) as string[]
const serieBiologiaSeleccionada = seriesBiologiaDisponibles[diaHistoriaIdx] ?? seriesBiologiaDisponibles[0]
const examenBiologia = asignatura === 'biologia'
  ? (seriesBiologiaDisponibles.length
      ? examenesBiologiaDelAnio.find(e => e.dia === serieBiologiaSeleccionada)
      : examenesBiologiaDelAnio[0]) ?? null
  : null

const preguntasBiologia = asignatura === 'biologia'
  ? availableQuestionsForExam(examenBiologia)
  : []

const bloquesBiologia = preguntasBiologia.length
  ? Array.from(
      new Map(
        preguntasBiologia.map((p: any) => [ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          p.bloque,
          { tipo: p.bloque, label: p.label ?? p.numero ?? p.bloque, pts: p.puntuacion }
        ])
      ).values()
    ) as { tipo: string; label: string; pts: number }[]
  : BIOLOGIA_TOPICS

const tipoBiologiaActivo = bloquesBiologia[bloqueIdx]?.tipo

const preguntaBiologia = asignatura === 'biologia'
  ? preguntasBiologia.find(
      (p: any) => // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoBiologiaActivo
    ) ??
    preguntasBiologia.find((p: any) => p.bloque === tipoBiologiaActivo) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    preguntasBiologia.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ?? // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    preguntasBiologia[0]
  : null

const preguntasLengua = asignatura === 'lengua'
  ? availableQuestionsForExam(examenLengua)
  : []

const bloquesLengua = preguntasLengua.length
  ? preguntasLengua.map((p: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      tipo: p.bloque,
      label: p.label ?? p.tema ?? p.bloque,
      pts: p.puntuacion
    }))
  : [...TIPOS_LENGUA]

const tipoLenguaActivo = bloquesLengua[bloqueIdx]?.tipo

const preguntaLengua = asignatura === 'lengua'
  ? preguntasLengua.find((p: any) => p.bloque === tipoLenguaActivo) ?? preguntasLengua[0] // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  : null

const OPCIONES = [0, 1] as const

const opcionesMatesDisponibles = isMadridMathStyle
  ? Array.from(new Set(
      ((examen as any)?.preguntas ?? []) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .filter((p: any) => isAvailableOfficialExercise(p) && p.bloque === tipoMatesActivo) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .map((p: any) => p.opcion) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ))
  : []

const opcionesFisicaDisponibles = asignatura === 'fisica'
  ? Array.from(new Set(
      ((examen as any)?.preguntas ?? []) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .filter((p: any) => isAvailableOfficialExercise(p) && p.bloque === tipoFisicaActivo) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .map((p: any) => p.opcion) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ))
  : []

const opcionesQuimicaDisponibles = asignatura === 'quimica'
  ? Array.from(new Set(
      preguntasQuimica
        .filter((p: any) => p.bloque === tipoQuimicaActivo) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .map((p: any) => p.opcion) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ))
  : []

const opcionesBiologiaDisponibles = asignatura === 'biologia'
  ? Array.from(new Set(
      preguntasBiologia
        .filter((p: any) => p.bloque === tipoBiologiaActivo) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .map((p: any) => p.opcion) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ))
  : []

const opcionesHistoriaDisponibles = asignatura === 'historia'
  ? Array.from(new Set(examenesHistoriaDelDia.map(e => e.opcion)))
  : []

const opcionesDisponibles: (0 | 1)[] =
  isMadridMathStyle && opcionesMatesDisponibles.length
    ? OPCIONES.filter(op => opcionesMatesDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'fisica' && opcionesFisicaDisponibles.length
    ? OPCIONES.filter(op => opcionesFisicaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'quimica' && opcionesQuimicaDisponibles.length
    ? OPCIONES.filter(op => opcionesQuimicaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'biologia' && opcionesBiologiaDisponibles.length
    ? OPCIONES.filter(op => opcionesBiologiaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'historia' && opcionesHistoriaDisponibles.length
    ? OPCIONES.filter(op => opcionesHistoriaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'lengua'
    ? []
    : asignatura === 'ingles'
    ? OPCIONES.filter(op => opcionesInglesDisponibles.includes(op === 0 ? 'A' : 'B'))
    : [...OPCIONES]

const examenHistoria = asignatura === 'historia'
  ? examenesHistoriaDelDia.find(
      e =>
        e.opcion === (opcion === 0 ? 'A' : 'B')
    ) ?? examenesHistoriaDelDia[0]
  : null

const preguntasHistoria = availableQuestionsForExam(examenHistoria)

const bloquesHistoria = preguntasHistoria.map(p => ({
  tipo: p.tipo,
  label: (p as any).label ?? LABELS_HISTORIA[p.tipo] ?? p.tipo, // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  pts: p.puntuacion
}))

const tipoHistoriaActivo = bloquesHistoria[bloqueIdx]?.tipo

const preguntaHistoria =
  preguntasHistoria.find(p => p.tipo === tipoHistoriaActivo) ??
  preguntasHistoria[0]

const preguntaActiva =
  isMadridMathStyle ? preguntaMates :
  asignatura === 'fisica' ? preguntaFisica :
  asignatura === 'quimica' ? preguntaQuimica :
  asignatura === 'biologia' ? preguntaBiologia :
  asignatura === 'lengua' ? preguntaLengua :
  asignatura === 'ingles' ? preguntaIngles :
  preguntaHistoria

const examenActivo = asignatura === 'lengua'
  ? examenLengua
  : asignatura === 'ingles'
    ? examenIngles ?? examen
    : asignatura === 'biologia'
      ? examenBiologia ?? examen
    : asignatura === 'historia'
      ? examenHistoria ?? examen
      : examen

const enunciadoActivo = formatEnunciado((preguntaActiva as any)?.enunciado) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
const preguntaActivaIncompleta = Boolean(preguntaActiva && isIncompleteOfficialExercise(preguntaActiva))
const puntuacionPreguntaActiva = officialScore(
  (preguntaActiva as any)?.puntuacion ?? (preguntaActiva as any)?.puntos ?? (preguntaActiva as any)?.pts, // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  isMadridMathStyle ? 2.5 : 2
)

const bloqueActivoLabel =
  isMadridMathStyle ? (preguntaActiva as any)?.bloque : // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  asignatura === 'fisica' ? (TIPOS_FISICA[bloqueIdx]?.label ?? '') :
  asignatura === 'quimica' ? ((preguntaActiva as any)?.label ?? bloquesQuimica[bloqueIdx]?.label ?? '') : // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  asignatura === 'biologia' ? ((preguntaActiva as any)?.label ?? bloquesBiologia[bloqueIdx]?.label ?? '') : // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  asignatura === 'lengua' ? ((preguntaActiva as any)?.label ?? bloquesLengua[bloqueIdx]?.label ?? '') : // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  asignatura === 'ingles' ? ((preguntaActiva as any)?.label ?? bloquesIngles[bloqueIdx]?.label ?? '') : // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  ((preguntaActiva as any)?.label ?? LABELS_HISTORIA[(preguntaActiva as any)?.tipo] ?? '') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión

const opcionMostrada = asignatura === 'lengua'
  ? (versionLenguaSeleccionada ?? 'Única')
  : asignatura === 'ingles'
    ? (diaInglesSeleccionado ? `${diaInglesSeleccionado} · ${(examenIngles as any)?.opcion ?? 'Única'}` : ((examenIngles as any)?.opcion ?? 'Única')) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    : asignatura === 'biologia'
      ? (serieBiologiaSeleccionada ? `${serieBiologiaSeleccionada} · ${(preguntaBiologia as any)?.opcion ?? 'Única'}` : ((preguntaBiologia as any)?.opcion ?? 'Única')) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    : (preguntaActiva as any)?.opcion ?? (opcion === 0 ? 'A' : 'B') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión

const preguntaActivaKey = [
  asignatura,
  (examenActivo as any)?.id ?? examenActivo?.año ?? 'sin-examen', // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  (preguntaActiva as any)?.id ?? (preguntaActiva as any)?.bloque ?? (preguntaActiva as any)?.tipo ?? bloqueIdx, // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  opcionMostrada
].join('-')

const preguntaActivaStorageId = [
  ccaa,
  asignatura,
  (examenActivo as any)?.año ?? anioSeleccionado ?? 'sin-anio', // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  tipo,
  (preguntaActiva as any)?.id ?? bloqueActivoLabel ?? 'pregunta', // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  opcionMostrada,
].filter(Boolean).join(':')

const enunciadoStorageKey = `principal:${preguntaActivaStorageId}:enunciado`
const fuenteStorageKey = `principal:${preguntaActivaStorageId}:fuente`
const correctionScoreMatch = correccion.match(/(?:nota|puntuaci[oó]n|calificaci[oó]n)[^\n:]*[:\s]+([0-9]+(?:[.,][0-9]+)?)\s*(?:\/|de)\s*([0-9]+(?:[.,][0-9]+)?)/i)
const correctionScoreLabel = correctionScoreMatch
  ? `${correctionScoreMatch[1].replace(',', '.')}/${correctionScoreMatch[2].replace(',', '.')}`
  : '--'

function extractCorrectionBullets(text: string, section: string): string[] {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = text.match(new RegExp(`## ${escaped}[\\s\\S]*?\\n([\\s\\S]*?)(?=##|$)`, 'i'))
  if (!match) return []
  return match[1].split('\n').map(l => l.replace(/^[-*•]\s*/, '').trim()).filter(Boolean)
}
const correctionFuertes = correccion ? extractCorrectionBullets(correccion, 'Puntos fuertes') : []
const correctionErrores = correccion ? extractCorrectionBullets(correccion, 'Errores a corregir') : []

useEffect(() => {
  if (typeof window === 'undefined' || window.location.pathname !== '/') return

  const params = new URLSearchParams(window.location.search)
  const mode = params.get('mode')
  const source = params.get('source') ?? ''
  if (!source.startsWith('camino')) return

  const resolutionKey = params.toString()
  if (randomEvauResolutionKeyRef.current === resolutionKey) return
  randomEvauResolutionKeyRef.current = resolutionKey

  const subject = normalizeCaminoExamSubject(params.get('subject')) as Asignatura | null
  if (!subject) return

  const selectedExerciseId = params.get('exerciseId')
  if (mode === 'selected' && selectedExerciseId) {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Inicialización desde URL de Camino PAU en mount único
    setSeccion('examenes')
    setCCAA('Madrid')
    setAsignatura(subject)
    selectMadridExerciseById(subject, selectedExerciseId)
    return
  }

  if (mode !== 'random') return

  const recentStorageKey = 'kairo_recent_evau_exercises_v1'
  let recentExerciseIds: string[] = []
  try {
    const stored = window.localStorage.getItem(recentStorageKey)
    const parsed = stored ? JSON.parse(stored) : []
    if (Array.isArray(parsed)) recentExerciseIds = parsed.filter(item => typeof item === 'string')
  } catch {}

  const resolved = getRandomEvauExerciseForMission({
    subject,
    community: params.get('community') ?? 'Madrid',
    block: params.get('block'),
    topic: params.get('topic'),
    missionId: params.get('missionId'),
    recentExerciseIds,
  })

  setSeccion('examenes')
  setCCAA('Madrid')
  setAsignatura(subject)

  if (!resolved) {
    setCaminoExerciseNotice(`Todavía no tenemos un ejercicio PAU específico de este tema. Te mostramos la zona de ${nombreAsignatura(subject)} para elegir uno relacionado.`)
    return
  }

  setAsignatura(resolved.subject)
  selectMadridExerciseById(resolved.subject, resolved.exerciseId)
  window.setTimeout(() => {
    selectMadridExerciseById(resolved.subject, resolved.exerciseId)
  }, 0)
  setCaminoExerciseNotice(resolved.warning ?? '')

  try {
    window.localStorage.setItem(
      recentStorageKey,
      JSON.stringify(rememberRecentEvauExerciseIds(recentExerciseIds, resolved.exerciseId))
    )
  } catch {}

  window.history.replaceState(null, '', resolved.targetUrl)
}, []) // eslint-disable-line react-hooks/exhaustive-deps

function puntosBloqueFisica(tipoBloque: string) {
  return (
    (examen as any)?.preguntas?.find( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  )?.puntuacion ?? 2
}

function puntosBloqueMates(bloque: string) {
  return (
    (examen as any)?.preguntas?.find( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      (p: any) => p.bloque === bloque && p.opcion === (opcion === 0 ? 'A' : 'B') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === bloque) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  )?.puntuacion ?? 2.5
}

function puntosBloqueQuimica(tipoBloque: string) {
  return (
    preguntasQuimica.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ) ??
    preguntasQuimica.find((p: any) => p.bloque === tipoBloque) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  )?.puntuacion ?? 2
}

function puntosBloqueBiologia(tipoBloque: string) {
  return (
    preguntasBiologia.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B') // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
    ) ??
    preguntasBiologia.find((p: any) => p.bloque === tipoBloque) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  )?.puntuacion ?? BIOLOGIA_TOPICS.find(topic => topic.tipo === tipoBloque)?.pts ?? 2
}

function cambiarBloqueMates(i: number, bloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = (examen as any)?.preguntas?.find((p: any) => p.bloque === bloque)?.opcion // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function selectMadridExerciseById(subject: Asignatura, exerciseId: string) {
  const source = EXAMENES_BY_ASIGNATURA[subject] ?? []
  const exam = source.find(candidate =>
    (candidate.comunidad ?? candidate.ccaa) === 'Madrid' &&
    availableQuestionsForExam(candidate).some((question: any) => String(question.id) === exerciseId) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  )
  if (!exam) return false

  const question = availableQuestionsForExam(exam).find((candidate: any) => String(candidate.id) === exerciseId) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  const blocks = Array.from(new Set(availableQuestionsForExam(exam).map((candidate: any) => candidate.bloque))) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  const years = Array.from(new Set(
    source
      .filter(candidate => candidate.tipo === exam.tipo && (candidate.comunidad ?? candidate.ccaa) === 'Madrid')
      .map(candidate => candidate.año)
  )).sort((a: any, b: any) => Number(b) - Number(a)) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión

  setTipo(exam.tipo as Tipo)
  setExamenIdx(Math.max(0, years.findIndex(year => year === exam.año)))
  setCatEjercicioIdx(0)
  setCatHistoriaEjercicioIdx(0)
  setCatFisicaEjercicioIdx(0)
  setCatAsignaturaEjercicioIdx(0)
  setDiaHistoriaIdx(0)
  setOpcion(question?.opcion === 'B' ? 1 : 0)
  setBloqueIdx(Math.max(0, blocks.findIndex(block => block === question?.bloque)))
  if (subject === 'historia') {
    const dayOptions = Array.from(new Set(source.filter(candidate => candidate.tipo === exam.tipo && candidate.año === exam.año && (candidate.comunidad ?? candidate.ccaa) === 'Madrid').map(candidate => candidate.dia).filter(Boolean)))
    setDiaHistoriaIdx(Math.max(0, dayOptions.findIndex(day => day === exam.dia)))
  } else if (subject === 'lengua') {
    const versionOptions = Array.from(new Set(source.filter(candidate => candidate.tipo === exam.tipo && candidate.año === exam.año && (candidate.comunidad ?? candidate.ccaa) === 'Madrid').map(candidate => candidate.dia ?? candidate.opcion).filter(Boolean)))
    setDiaHistoriaIdx(Math.max(0, versionOptions.findIndex(version => version === (exam.dia ?? exam.opcion))))
  } else if (subject === 'ingles') {
    const dayOptions = Array.from(new Set(source.filter(candidate => candidate.tipo === exam.tipo && candidate.año === exam.año && (candidate.comunidad ?? candidate.ccaa) === 'Madrid').map(candidate => candidate.dia).filter(Boolean)))
    setDiaHistoriaIdx(Math.max(0, dayOptions.findIndex(day => day === exam.dia)))
  }
  reset()
  return true
}

function cambiarBloqueFisica(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque)?.opcion // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function cambiarBloqueQuimica(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = preguntasQuimica.find((p: any) => p.bloque === tipoBloque)?.opcion // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function cambiarBloqueBiologia(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = preguntasBiologia.find((p: any) => p.bloque === tipoBloque)?.opcion // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function nombreAsignatura(a: string) {
  if (a === 'general') return 'General'
  if (a === 'mates') return 'Matemáticas II'
  if (a === 'matematicas_ccss') return MATEMATICAS_CCSS_LABEL
  if (a === 'fisica') return 'Física'
  if (a === 'quimica') return 'Química'
  if (a === 'biologia') return 'Biología'
  if (a === 'lengua') return 'Lengua Castellana y Literatura II'
  if (a === 'ingles') return 'Inglés'
  if (a === 'historia_filosofia') return 'Historia de la Filosofía'
  return 'Historia de España'
}

function reset() {
  setCorreccion(''); setStreamText(''); setTruncated(false)
  setRespuesta('')
  setImagen(null)
  setImagenPreview(null)
}

function cambiarAsignatura(a: Asignatura) {
  setAsignatura(a)
  setCaminoExerciseNotice('')
  setExamenIdx(0)
  setCatEjercicioIdx(0)
  setCatHistoriaEjercicioIdx(0)
  setCatFisicaEjercicioIdx(0)
  setCatAsignaturaEjercicioIdx(0)
  setBloqueIdx(0)
  setDiaHistoriaIdx(0)
  setOpcion(0)
  setTipo('Ordinaria')
  reset()
}

function cambiarTipo(t: Tipo) {
  setTipo(t)
  setExamenIdx(0)
  setCatEjercicioIdx(0)
  setCatHistoriaEjercicioIdx(0)
  setCatFisicaEjercicioIdx(0)
  setCatAsignaturaEjercicioIdx(0)
  setBloqueIdx(0)
  setDiaHistoriaIdx(0)
  setOpcion(0)
  reset()
}
  async function cerrarSesion() { await supabase.auth.signOut(); window.location.href = '/login' }

  async function getChatAccessToken() {
    const { data, error } = await supabase.auth.getSession()
    if (error || !data.session?.access_token) return null
    return data.session.access_token
  }

  async function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenPreview(URL.createObjectURL(file))
    setImagenTipo('image/jpeg')
    setImagen(await compressImageToBase64(file))
  }

  async function streamCorrectionRequest(
    accessToken: string,
    prompt: string,
    options: { includeImage: boolean; appendTo?: string; blockId?: string; sessionId?: string; creditKey?: string }
  ) {
    const res = await fetch('/api/chat?stream=1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        pregunta: prompt,
        imagen: options.includeImage && modo === 'imagen' ? imagen : null,
        imagenTipo: options.includeImage && modo === 'imagen' ? imagenTipo : null,
        correctionMode: 'chunked_correction',
        correctionBlock: options.blockId ?? null,
        correctionSessionId: options.sessionId ?? null,
        creditKey: options.creditKey ?? null
      })
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
    }

    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let accumulated = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      accumulated += decoder.decode(value, { stream: true })
      const safeStream = readSafeStreamText(accumulated)
      setStreamText(`${options.appendTo ?? ''}${safeStream.visibleText}`)
    }
    accumulated += decoder.decode()
    const completedStream = readSafeStreamText(accumulated)
    return {
      text: completedStream.truncated ? completedStream.visibleText : accumulated,
      truncated: completedStream.truncated
    }
  }

  function buildChunkedCorrectionPrompts(input: {
    subject: string
    subjectId: string
    community: string
    examLabel: string
    option: string
    maxScore: number
    year?: number | string | null
    examCall?: string
    exerciseId?: string
    exerciseLabel?: string
    officialPrompt: string
    criteria?: string
    sourceText?: string
    concepts?: string[]
    studentAnswer: string
  }) {
    const theoryContext = getTheoryContextForExercise({
      subject: input.subjectId || input.subject,
      community: input.community,
      year: input.year,
      examCall: input.examCall,
      exerciseId: input.exerciseId,
      exerciseLabel: input.exerciseLabel,
      exerciseText: input.officialPrompt,
      officialSolution: input.criteria,
      rubric: input.criteria,
      concepts: input.concepts
    })
    const theoryContextPrompt = theoryContextToPrompt(theoryContext)
    const sharedContext = `Contexto de corrección PAU:
- Asignatura: ${input.subject}
- Comunidad: ${input.community}
- Ejercicio: ${input.examLabel}
- Opción: ${input.option}
- Puntuación máxima oficial: ${formatPts(input.maxScore)}
- Criterios oficiales disponibles: ${input.criteria || 'No especificados'}
- Conceptos: ${input.concepts?.join(', ') || 'No especificados'}
- Texto fuente, si existe: ${input.sourceText || 'No hay texto fuente adicional'}
- Enunciado oficial: ${input.officialPrompt}
- Respuesta del alumno: ${input.studentAnswer}

Reglas comunes:
- Devuelve solo Markdown, sin JSON y sin bloques de código.
- No repitas el enunciado ni transcribas la respuesta completa del alumno.
- Usa LaTeX solo dentro de $...$ o bloques $$...$$. No mezcles $ y $$ en la misma línea.
- Matrices, determinantes y sistemas deben ir en bloque $$...$$: \\begin{pmatrix}...\\end{pmatrix}, \\begin{vmatrix}...\\end{vmatrix}, \\begin{cases}...\\end{cases}.
- No dejes comandos sueltos como \\frac, \\tfrac, \\cdot, \\begin o \\end fuera de delimitadores matemáticos.
- Si haces puntuación por apartados, usa lista Markdown en vez de tabla cuando haya fórmulas.
- Sé claro, concreto y breve.`

    return [
      {
        id: 'nota-resumen',
        label: 'Leyendo tu respuesta y estimando la nota...',
        essential: true,
        title: 'Resumen y nota estimada',
        theoryContext: null,
        includePreviousCorrection: false,
        prompt: `${sharedContext}

Bloque 1/4. Evalúa la respuesta con la rúbrica.
Devuelve exactamente estas secciones:

## Resumen y nota estimada

Nota: X/${formatPts(input.maxScore)}

- Resumen breve de la corrección.
- Justificación de la nota en 2-3 frases.`
      },
      {
        id: 'aciertos-errores',
        label: 'Detectando aciertos y errores principales...',
        essential: true,
        title: 'Aciertos y errores',
        theoryContext: null,
        includePreviousCorrection: false,
        prompt: `${sharedContext}

Bloque 2/4. Identifica máximo 3 aciertos y máximo 3 errores importantes.
Devuelve exactamente estas secciones:

## Puntos fuertes

- ...

## Errores a corregir

- Error: ...
  Corrección: ...`
      },
      {
        id: 'paso-a-paso',
        label: 'Corrigiendo paso a paso...',
        essential: true,
        title: 'Corrección paso a paso',
        theoryContext: null,
        includePreviousCorrection: false,
        prompt: `${sharedContext}

Bloque 3/4. Corrige paso a paso el ejercicio o sus apartados.
Si hay apartados, usa subtítulos "### Apartado a)", "### Apartado b)", etc.
Incluye solo los pasos necesarios para aprender y puntuar.
Devuelve exactamente esta sección:

## Corrección paso a paso`
      },
      {
        id: 'teoria-final',
        label: 'Preparando teoría aplicada y recomendación final...',
        essential: false,
        title: 'Teoría aplicada y recomendación final',
        theoryContext,
        includePreviousCorrection: true,
        prompt: `${sharedContext}

${theoryContextPrompt}

Bloque 4/4. Explica la teoría aplicada al ejercicio concreto y cierra con una recomendación accionable.
No des teoría genérica. Relaciona cada idea con un paso real del ejercicio, la rúbrica, la solución orientativa o la corrección previa.
Si no hay teoría curricular suficiente, usa la solución/criterios y escribe una explicación mínima segura sin inventar una clase larga.
Mantén el idioma del ejercicio o de la corrección.
Devuelve exactamente estas secciones:

## ¿Por qué es así?

**Idea clave**

**Por qué se aplica en este ejercicio**

**Dónde se ve en la solución**

**Error típico que debes evitar**

**Qué recordar para el examen**

## Recomendación final`
      }
    ]
  }

  function buildCompactRetryPrompt(prompt: string) {
    return `${prompt}

Rehaz este bloque de forma más breve para que no se corte. Mantén Markdown limpio, LaTeX correcto y cierra la respuesta.`
  }

  async function runChunkedCorrection(
    accessToken: string,
    chunks: ReturnType<typeof buildChunkedCorrectionPrompts>,
    sessionId: string,
    creditKey: string
  ) {
    const completed: string[] = []
    const failedOptional: string[] = []

    for (const chunk of chunks) {
      setCorrectionStage(chunk.label)
      setStreamText(completed.join('\n\n'))
      const chunkPrompt = chunk.includePreviousCorrection
        ? `${chunk.prompt}

CORRECCIÓN YA GENERADA:
${completed.join('\n\n')}

Usa la corrección anterior solo como contexto para conectar la teoría con pasos, aciertos y errores concretos.`
        : chunk.prompt
      let result = await streamCorrectionRequest(accessToken, chunkPrompt, {
        includeImage: true,
        appendTo: completed.length ? `${completed.join('\n\n')}\n\n` : '',
        blockId: chunk.id,
        sessionId,
        creditKey
      })

      if (result.truncated || !result.text.trim()) {
        setContinuingCorrection(true)
        setCorrectionStage(`${chunk.label} Reintentando este bloque en versión breve...`)
        result = await streamCorrectionRequest(accessToken, buildCompactRetryPrompt(chunkPrompt), {
          includeImage: true,
          appendTo: completed.length ? `${completed.join('\n\n')}\n\n` : '',
          blockId: `${chunk.id}:retry`,
          sessionId,
          creditKey
        })
        setContinuingCorrection(false)
      }

      if (result.truncated || !result.text.trim()) {
        if (chunk.essential) {
          return {
            markdown: completed.join('\n\n'),
            truncated: true,
            blocksCompleted: completed.length,
            failedBlock: chunk.id
          }
        }
        failedOptional.push(chunk.title)
        continue
      }

      completed.push(result.text.trim())
      setStreamText(completed.join('\n\n'))
    }

    const optionalNote = failedOptional.length
      ? `\n\n> Nota: No se pudo completar ${failedOptional.join(', ')}. La corrección principal sí está completa.`
      : ''
    return {
      markdown: `# Corrección de Kairo\n\n${completed.join('\n\n')}${optionalNote}`.trim(),
      truncated: false,
      blocksCompleted: completed.length,
      failedBlock: ''
    }
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && !imagen) return
    setCargando(true); setCorreccion(''); setStreamText(''); setTruncated(false); setContinuingCorrection(false); setCorrectionStage('Leyendo tu respuesta...')
    try {
      const accessToken = await getChatAccessToken()
      if (!accessToken) {
        setCorreccion('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }
      const p = preguntaActiva as any // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      const puntuacionMax = officialScore(p?.puntuacion ?? p?.puntos ?? p?.pts, puntuacionPreguntaActiva)
      const correctionSessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      const correctionCreditKey = `exam:${ccaa}:${asignatura}:${examenActivo?.año ?? anioSeleccionado}:${tipo}:${opcionMostrada}:${p?.id ?? preguntaActivaStorageId ?? bloqueActivoLabel ?? 'sin-id'}`
      const chunks = buildChunkedCorrectionPrompts({
        subject: nombreAsignatura(asignatura),
        subjectId: asignatura,
        community: ccaa,
        examLabel: `Práctica ${nombreAsignatura(asignatura)} ${examenActivo?.año ?? ''} ${tipo} ${bloqueActivoLabel || ''}`.trim(),
        option: opcionMostrada,
        maxScore: puntuacionMax,
        year: examenActivo?.año ?? anioSeleccionado,
        examCall: tipo,
        exerciseId: p?.id ?? preguntaActivaStorageId,
        exerciseLabel: bloqueActivoLabel || p?.label || p?.bloque || p?.tipo,
        officialPrompt: enunciadoActivo,
        criteria: p?.criterios,
        sourceText: p?.texto_fuente,
        concepts: p?.conceptos,
        studentAnswer: modo === 'imagen'
          ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.'
          : respuesta
      })
      const chunkedCorrection = await runChunkedCorrection(accessToken, chunks, correctionSessionId, correctionCreditKey)
      const accumulated = chunkedCorrection.markdown
      const isTruncated = chunkedCorrection.truncated
      if (!accumulated) {
        setStreamText('')
        setCorreccion('No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
        return
      }
      const parsedCorrection = parseCorrectionPayload(accumulated)
      const correccionJson = parsedCorrection ? normalizeCorrectionForOfficialScores(parsedCorrection, [puntuacionMax]) : null
      const correccionVisible = isTruncated
        ? 'La corrección se ha cortado antes de terminar. Puedes reintentar para obtener una versión completa.'
        : correccionJson
        ? correctionJsonToMarkdownWithOptions(correccionJson, { officialMaxScore: puntuacionMax })
        : sanitizeCorrectionScaleText(correctionPayloadToMarkdown(accumulated, { officialMaxScore: puntuacionMax }), puntuacionMax)
      const correccionGuardada = correccionJson ? JSON.stringify(correccionJson) : correccionVisible
      const markdownForWhy = correctionPayloadToMarkdown(correccionGuardada, { officialMaxScore: puntuacionMax })
      const whyItWorks = splitWhyExplanationMarkdown(markdownForWhy).why
      const whyContext = chunks.find(chunk => chunk.id === 'teoria-final')?.theoryContext
      // Batch all three updates — no empty-frame gap between streaming and final render.
      // isTruncated is not persisted to historial_examenes (no column yet).
      setCorreccion(correccionGuardada)
      setTruncated(isTruncated)
      setStreamText('')
      const bloqueJson = correccionJson?.desglose_bloques?.[0]
      const partes = !correccionJson ? accumulated.match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/) : null
      const rawNota = bloqueJson?.puntos_conseguidos != null
        ? Number(bloqueJson.puntos_conseguidos)
        : partes ? parseFloat(partes[1].replace(',', '.')) : null
      const nota = rawNota === null ? null : clampScore(rawNota, puntuacionMax)
      const notaMax = puntuacionMax
      if (!isTruncated) {
        setCorrectionStage('Guardando en Historial...')
        const historyPayload = {
          user_id: usuario.id, asignatura, tipo, año: examenActivo?.año,
          bloque: bloqueActivoLabel || '',
          opcion: asignatura === 'lengua' || asignatura === 'ingles' ? opcionMostrada : opcion === 0 ? 'A' : 'B', nota, nota_maxima: notaMax,
          enunciado: enunciadoActivo?.substring(0, 6000),
          respuesta: respuesta?.substring(0, 4000),
          // Do not truncate full correction: History modal needs complete feedback.
          correccion: correccionGuardada,
          why_it_works: whyItWorks || null,
          why_it_works_context: whyContext ? {
            blockSlug: whyContext.blockSlug,
            topicSlug: whyContext.topicSlug,
            blockTitle: whyContext.blockTitle,
            topicTitle: whyContext.topicTitle,
            fallbackReason: whyContext.fallbackReason ?? null
          } : null,
          detected_concepts: whyContext?.detectedConcepts ?? [],
          curriculum_source_ids: whyContext?.sourceIds ?? []
        }
        supabase.from('historial_examenes').insert(historyPayload).then(async ({ error }) => {
          if (!error) return
          const legacyPayload = {
            user_id: historyPayload.user_id,
            asignatura: historyPayload.asignatura,
            tipo: historyPayload.tipo,
            año: historyPayload.año,
            bloque: historyPayload.bloque,
            opcion: historyPayload.opcion,
            nota: historyPayload.nota,
            nota_maxima: historyPayload.nota_maxima,
            enunciado: historyPayload.enunciado,
            respuesta: historyPayload.respuesta,
            correccion: historyPayload.correccion
          }
          await supabase.from('historial_examenes').insert(legacyPayload)
        })
      }
    } catch (error) {
      setStreamText('')
      setTruncated(false)
      setContinuingCorrection(false)
      setCorrectionStage('')
      setCorreccion(error instanceof Error ? error.message : 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
    } finally {
      setContinuingCorrection(false)
      setCorrectionStage('')
      setCargando(false)
    }
  }

  async function enviarChat() {
    if (!inputChat.trim()) return
    const nuevoMensaje: MensajeChat = { rol: 'usuario', texto: inputChat }
    const hist = [...mensajes, nuevoMensaje]
    setMensajes(hist)
    setInputChat('')
    setCargandoChat(true)
    const accessToken = await getChatAccessToken()
    if (!accessToken) {
      setMensajes(prev => [...prev, { rol: 'kairo', texto: 'Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.' }])
      setCargandoChat(false)
      return
    }
    setMensajes(prev => [...prev, { rol: 'kairo', texto: '' }])
    const chatSystemIntro = asignatura === 'general'
      ? `Eres Kairo, el asistente de estudio de ${examSystemLabel(ccaa)}. El estudiante está en el modo General del chat: pregúntale con naturalidad sobre lo que necesite, incluidas dudas de organización, técnicas de estudio, motivación, cómo funciona la app, o cualquier cuestión que no encaje en una asignatura concreta. No fuerces la respuesta hacia matemáticas, lengua, historia u otra asignatura salvo que el estudiante lo pida explícitamente.\n` +
        'Responde de forma directa, clara y cercana. Preserva cualquier LaTeX que uses con $...$ o $$...$$.\n'
      : `Eres Kairo, tutor de ${examSystemLabel(ccaa)}. Responde dudas sobre matemáticas, física, química, biología, inglés, lengua, historia y filosofía.\n` +
        'Responde como profesor experto PAU: respuesta directa, pasos claros, ejemplo nuevo, aplicación PAU y error típico cuando proceda. Si la duda requiere base conceptual, añade al final una sección Markdown con el encabezado exacto "## ¿Por qué es así?" y contenido específico del ejercicio. No uses los nombres "Teoría desplegable", "Teoría" ni "Más información". No copies apuntes ni libros; explica con palabras propias de Kairo. Preserva cualquier LaTeX que uses con $...$ o $$...$$.\n'
    try {
      const res = await fetch('/api/chat?stream=1', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          pregunta: chatSystemIntro +
            (contextoChat ? 'CONTEXTO: ' + contextoChat + '\n' : '') +
            hist.map(m => (m.rol === 'usuario' ? 'Estudiante' : 'Kairo') + ': ' + m.texto).join('\n') +
            '\nResponde solo como Kairo.'
        })
      })
      if (!res.ok) {
        const data = await res.json()
        setMensajes(prev => [...prev.slice(0, -1), { rol: 'kairo', texto: getApiErrorMessage(data, 'No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.') }])
      } else {
        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          accumulated += decoder.decode(value, { stream: true })
          const safeStream = readSafeStreamText(accumulated)
          setMensajes(prev => [...prev.slice(0, -1), { rol: 'kairo', texto: safeStream.visibleText }])
        }
        accumulated += decoder.decode()
        const completedStream = readSafeStreamText(accumulated)
        const finalText = completedStream.truncated
          ? `${completedStream.visibleText}\n\n> Respuesta incompleta: se ha alcanzado el límite de longitud. Puedes pedirme que continúe.`
          : accumulated
        if (!finalText) {
          setMensajes(prev => [...prev.slice(0, -1), { rol: 'kairo', texto: 'No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.' }])
        } else {
          setMensajes(prev => [...prev.slice(0, -1), { rol: 'kairo', texto: finalText }])
        }
      }
    } catch {
      setMensajes(prev => [...prev.slice(0, -1), { rol: 'kairo', texto: 'No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.' }])
    } finally {
      setCargandoChat(false)
    }
  }

  function abrirChatConContexto(item: HistorialItem) {
    const ctx = 'El estudiante acaba de revisar esta corrección:\n' +
      'Asignatura: ' + nombreAsignatura(item.asignatura) + '\n' +
      'Ejercicio: ' + item.bloque + ' - ' + item.tipo + ' ' + item.año + '\n' +
      'Nota obtenida: ' + item.nota + '/' + item.nota_maxima + '\n' +
      'Enunciado: ' + (item.enunciado || '') + '\n' +
      'Corrección: ' + correctionPayloadToMarkdown(item.correccion || '') + '\n\n' +
      'El estudiante quiere entender mejor su nota. Ayúdale de forma clara y motivadora.'
    setContextoChat(ctx)
    setMensajes([{ rol: 'kairo', texto: '¡Hola! Veo que tienes dudas sobre tu corrección de ' + item.bloque + ' donde sacaste ' + item.nota + '/' + item.nota_maxima + '. ¿Qué parte no te queda clara? Pregúntame lo que quieras.' }])
    setItemSeleccionado(null)
    navegarASeccion('chat')
  }

  async function generarPlan() {
    window.location.href = '/camino'
  }

  const HeaderIcon =
    seccion === 'examenes' ? cfg.icon :
    seccion === 'chat' ? MessageCircle :
    seccion === 'historial' ? BarChart3 :
    Rocket

  const historialItems = historial as HistorialItem[]
  // "Guardadas" = correcciones con nota real (ya evaluadas); "Todas" no filtra.
  // No existe una columna de "guardado" separada en historial_examenes, así
  // que se usa la única distinción real que hay en los datos.
  const historialTabItems = historialTab === 'guardadas'
    ? historialItems.filter(item => item.nota != null && Number(item.nota_maxima) > 0)
    : historialItems
  const historialScoredItems = historialTabItems
    .map(item => ({ item, score10: normalizedHistoryScore(item) }))
    .filter((entry): entry is { item: HistorialItem; score10: number } => entry.score10 !== null)
  const historialAverage = historialScoredItems.length
    ? (historialScoredItems.reduce((sum, entry) => sum + entry.score10, 0) / historialScoredItems.length).toFixed(1)
    : null
  const historialBest = historialScoredItems.length
    ? historialScoredItems.reduce((best, entry) => entry.score10 > best.score10 ? entry : best, historialScoredItems[0])
    : null
  const historialRecentList = [...historialTabItems]
    .sort((a, b) => (new Date(b.created_at).getTime() || 0) - (new Date(a.created_at).getTime() || 0))
    .slice(0, 3)
  const historialSubjectStats = HOME_SUBJECTS.map(subject => {
    const items = historialTabItems.filter(item => item.asignatura === subject)
    const average = calcMedia(items)
    return {
      subject,
      config: ASIGNATURAS[subject],
      items,
      average,
      count: items.length
    }
  })
  const historialSourceOptions = Array.from(new Set(historialTabItems.map(historySourceLabel).filter(Boolean)))
  const normalizedHistorialSearch = normalizeSearchText(historialSearch.trim())
  const historialFilteredItems = historialTabItems
    .filter(item => historialSubjectFilter === 'todas' || item.asignatura === historialSubjectFilter)
    .filter(item => historialSourceFilter === 'todas' || historySourceLabel(item) === historialSourceFilter)
    .filter(item => {
      if (historialDateFilter === 'todas') return true
      const created = new Date(item.created_at).getTime()
      if (!Number.isFinite(created)) return false
      const days = Number(historialDateFilter)
      return created >= Date.now() - days * 24 * 60 * 60 * 1000
    })
    .filter(item => {
      if (!normalizedHistorialSearch) return true
      const haystack = normalizeSearchText([
        nombreAsignatura(item.asignatura),
        item.bloque,
        item.tipo,
        item.año,
        item.enunciado,
        item.correccion,
        item.respuesta,
        historyScoreDisplay(item)
      ].map(stringifyForSearch).join(' '))
      return haystack.includes(normalizedHistorialSearch)
    })
    .sort((a, b) => {
      if (historialOrder === 'best' || historialOrder === 'worst') {
        const scoreA = normalizedHistoryScore(a)
        const scoreB = normalizedHistoryScore(b)
        if (scoreA === null && scoreB === null) return 0
        if (scoreA === null) return 1
        if (scoreB === null) return -1
        return historialOrder === 'best' ? scoreB - scoreA : scoreA - scoreB
      }
      const timeA = new Date(a.created_at).getTime() || 0
      const timeB = new Date(b.created_at).getTime() || 0
      return historialOrder === 'oldest' ? timeA - timeB : timeB - timeA
    })
  const historialGrouped = historialFilteredItems.reduce((acc: Record<string, HistorialItem[]>, item) => {
    const d = new Date(item.created_at)
    const key = Number.isNaN(d.getTime())
      ? 'Sin fecha'
      // Formato "julio 2026" (sin "de") para que coincida con el diseño.
      : d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }).replace(' de ', ' ')
    const cap = key.charAt(0).toUpperCase() + key.slice(1)
    if (!acc[cap]) acc[cap] = []
    acc[cap].push(item)
    return acc
  }, {})

  // Actividad reciente y tendencia — derivadas de los mismos datos, sin
  // inventar cifras: si no hay suficiente muestra, se muestra null y la UI
  // lo trata como "sin datos" en vez de forzar un número.
  const nowTs = Date.now()
  const startOfWeekTs = (() => {
    const d = new Date()
    const day = (d.getDay() + 6) % 7 // lunes = 0
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - day)
    return d.getTime()
  })()
  const startOfMonthTs = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime()
  const ninetyDaysAgoTs = nowTs - 90 * 24 * 60 * 60 * 1000
  const historialActividad = {
    semana: historialTabItems.filter(i => new Date(i.created_at).getTime() >= startOfWeekTs).length,
    mes: historialTabItems.filter(i => new Date(i.created_at).getTime() >= startOfMonthTs).length,
    tresMeses: historialTabItems.filter(i => new Date(i.created_at).getTime() >= ninetyDaysAgoTs).length,
  }

  // Media de un conjunto de items en el mes que está "monthsAgo" meses atrás
  // (0 = mes en curso, 1 = mes anterior, ...). Null si no hay ninguna nota
  // real en ese mes — no se inventa un valor de relleno.
  function scoreAvgInMonth(entries: typeof historialScoredItems, monthsAgo: number): number | null {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1).getTime()
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 1).getTime()
    const inMonth = entries.filter(e => {
      const t = new Date(e.item.created_at).getTime()
      return t >= start && t < end
    })
    if (!inMonth.length) return null
    return inMonth.reduce((s, e) => s + e.score10, 0) / inMonth.length
  }

  // Prioriza asignaturas con al menos 2 correcciones para que una única nota
  // baja aislada no parezca tan urgente como una asignatura con mala media
  // sostenida en varias correcciones. Si no hay suficientes con 2+, cae a
  // cualquier asignatura con datos.
  const weakestSubjectsWithData = historialSubjectStats.filter(stat => stat.count > 0 && stat.average !== null)
  const weakestSubjectsReliable = weakestSubjectsWithData.filter(stat => stat.count >= 2)
  const weakestSubjects = (weakestSubjectsReliable.length ? weakestSubjectsReliable : weakestSubjectsWithData)
    .sort((a, b) => Number(a.average) - Number(b.average))
    .slice(0, 3)

  // Compara las dos últimas ventanas de correcciones CON datos por asignatura
  // (no necesariamente "este mes natural" vs "el anterior" — si aún no hay
  // correcciones en el mes en curso, esto sigue comparando los dos meses más
  // recientes que sí tienen notas, para no dejar la tarjeta vacía de forma
  // artificial los primeros días de cada mes).
  function latestTwoMonthAverages(entries: typeof historialScoredItems): { latest: number | null; previous: number | null } {
    const buckets = new Map<string, { total: number; count: number }>()
    for (const entry of entries) {
      const d = new Date(entry.item.created_at)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${d.getMonth()}`
      const bucket = buckets.get(key) ?? { total: 0, count: 0 }
      bucket.total += entry.score10
      bucket.count += 1
      buckets.set(key, bucket)
    }
    const sortedKeys = [...buckets.keys()].sort((a, b) => {
      const [ay, am] = a.split('-').map(Number)
      const [by, bm] = b.split('-').map(Number)
      return (by * 12 + bm) - (ay * 12 + am)
    })
    const avgOf = (key: string | undefined) => {
      if (!key) return null
      const bucket = buckets.get(key)!
      return bucket.total / bucket.count
    }
    return { latest: avgOf(sortedKeys[0]), previous: avgOf(sortedKeys[1]) }
  }

  // Delta entre las dos ventanas mensuales más recientes con datos, por
  // asignatura, para la flechita de tendencia en la tira de asignaturas.
  const subjectDeltaMap = new Map<Asignatura, number | null>(
    HOME_SUBJECTS.map(subject => {
      const entries = historialScoredItems.filter(e => e.item.asignatura === subject)
      const { latest, previous } = latestTwoMonthAverages(entries)
      return [subject, latest !== null && previous !== null ? latest - previous : null]
    })
  )

  const recentImprovingSubjects = HOME_SUBJECTS
    .map(subject => {
      const entries = historialScoredItems.filter(e => e.item.asignatura === subject)
      const { latest, previous } = latestTwoMonthAverages(entries)
      if (latest === null || previous === null) return null
      return { subject, config: ASIGNATURAS[subject], thisMonth: latest, delta: latest - previous }
    })
    .filter((entry): entry is { subject: Asignatura; config: typeof ASIGNATURAS[Asignatura]; thisMonth: number; delta: number } => entry !== null && entry.delta > 0)
    .sort((a, b) => b.delta - a.delta)
    .slice(0, 2)

  // Serie mensual para "Evolución general" — solo meses que realmente tienen
  // notas (hasta los últimos 4), más un mes anterior de contexto aunque esté
  // vacío. Evita mostrar de fijo los últimos 4 meses naturales cuando la
  // actividad real es más antigua o más corta (p.ej. MAY/AGO sin datos).
  const now = new Date()
  const monthsAgoWithData = Array.from({ length: 12 }, (_, i) => i)
    .filter(monthsAgo => scoreAvgInMonth(historialScoredItems, monthsAgo) !== null)
    .sort((a, b) => b - a)
  const monthsAgoRange = monthsAgoWithData.length
    ? Array.from({ length: Math.max(...monthsAgoWithData) - Math.min(...monthsAgoWithData) + 2 }, (_, i) => Math.max(...monthsAgoWithData) + 1 - i)
      .filter(m => m >= 0)
      .slice(-4)
    : [1, 0]
  const historialMonthlySeries = monthsAgoRange.map(monthsAgo => {
    const target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1)
    return {
      label: target.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase(),
      avg: scoreAvgInMonth(historialScoredItems, monthsAgo),
    }
  })

  const clearHistorialFilters = () => {
    setHistorialSearch('')
    setHistorialSubjectFilter('todas')
    setHistorialSourceFilter('todas')
    setHistorialDateFilter('todas')
    setHistorialOrder('recent')
  }
  const hasHistorialFilters = Boolean(
    historialSearch.trim() ||
    historialSubjectFilter !== 'todas' ||
    historialSourceFilter !== 'todas' ||
    historialDateFilter !== 'todas' ||
    historialOrder !== 'recent'
  )

  function exportHistorialCsv() {
    const header = ['Fecha', 'Asignatura', 'Tema', 'Fuente', 'Nota', 'Nota máxima']
    const rows = historialFilteredItems.map(item => [
      new Date(item.created_at).toLocaleDateString('es-ES'),
      nombreAsignatura(item.asignatura),
      item.bloque || '',
      historySourceLabel(item),
      item.nota ?? '',
      item.nota_maxima ?? '',
    ])
    const csv = [header, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial-kairo-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  const versionesExamenDisponibles = asignatura === 'historia'
    ? diasHistoriaDisponibles
    : asignatura === 'lengua'
      ? versionesLenguaDisponibles
      : asignatura === 'ingles'
        ? diasInglesDisponibles
        : asignatura === 'biologia'
          ? seriesBiologiaDisponibles
        : []
  const versionExamenSeleccionada = asignatura === 'historia'
    ? diaHistoriaSeleccionado
    : asignatura === 'lengua'
      ? versionLenguaSeleccionada
      : asignatura === 'ingles'
        ? diaInglesSeleccionado
        : asignatura === 'biologia'
          ? serieBiologiaSeleccionada
        : null
  const convocatoriaOptions = (isCatalunaExam ? ['Ordinaria', 'Extraordinaria'] : ['Ordinaria', 'Extraordinaria', 'Modelo']) as Tipo[]
  const yearFilterOptions: FilterDropdownOption[] = aniosDisponibles.map((anio, i) => ({
    label: String(anio),
    active: examenIdx === i,
    onSelect: () => {
      setExamenIdx(i)
      setCatEjercicioIdx(0)
      setCatHistoriaEjercicioIdx(0)
      setCatFisicaEjercicioIdx(0)
      setCatAsignaturaEjercicioIdx(0)
      setBloqueIdx(0)
      setDiaHistoriaIdx(0)
      setOpcion(0)
      reset()
    }
  }))
  const convocatoriaFilterOptions: FilterDropdownOption[] = convocatoriaOptions.map(t => ({
    label: t,
    active: tipo === t,
    onSelect: () => cambiarTipo(t)
  }))
  const versionFilterOptions: FilterDropdownOption[] = versionesExamenDisponibles.map((version, i) => ({
    label: version,
    active: diaHistoriaIdx === i,
    onSelect: () => {
      setDiaHistoriaIdx(i)
      setBloqueIdx(0)
      setOpcion(0)
      reset()
    }
  }))
  const questionFilterOptions: FilterDropdownOption[] = isCatalunaMates
    ? ejerciciosDisponiblesCat.map((pregunta, i) => ({
        label: pregunta.opcion
          ? `Ej. ${pregunta.ejercicio} · Opción ${pregunta.opcion}`
          : `Ejercicio ${pregunta.ejercicio} · ${pregunta.tema}`,
        active: catEjercicioIdx === i,
        onSelect: () => setCatEjercicioIdx(i)
      }))
    : isCatalunaFisica
      ? ejerciciosFisicaCataluna.map((ejercicio, i) => ({
          label: `Ejercicio ${ejercicio.numero} · ${ejercicio.bloque ?? ejercicio.titulo}`,
          active: catFisicaEjercicioIdx === i,
          onSelect: () => setCatFisicaEjercicioIdx(i)
        }))
      : (isCatalunaQuimica || isCatalunaLengua)
        ? ejerciciosAsignaturaCataluna.map((ejercicio, i) => ({
            label: ejercicio.titulo,
            active: catAsignaturaEjercicioIdx === i,
            onSelect: () => setCatAsignaturaEjercicioIdx(i)
          }))
        : isCatalunaHistoria
          ? ejerciciosCatalunaHistoria.map((ejercicio: any, i: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
              const labels: Record<string, string> = {
                analisis_fuentes: 'Análisis crítico de fuentes',
                redaccion_terminos: 'Redacción con términos históricos',
                exposicion_tema: 'Expón un tema',
                test: 'Test'
              }
              const label = labels[ejercicio.tipo]
              return {
                label: `Ejercicio ${ejercicio.numero}${label ? ` · ${label}` : ''}`,
                active: catHistoriaEjercicioIdx === i,
                onSelect: () => setCatHistoriaEjercicioIdx(i)
              }
            })
          : isMadridMathStyle
            ? bloquesMates.map((bloque: string, i: number) => ({
                label: `${i + 1}. ${bloque} · ${puntosBloqueMates(bloque)}pts`,
                active: bloqueIdx === i,
                onSelect: () => cambiarBloqueMates(i, bloque)
              }))
            : (asignatura === 'fisica' ? TIPOS_FISICA : asignatura === 'quimica' ? bloquesQuimica : asignatura === 'biologia' ? bloquesBiologia : asignatura === 'lengua' ? bloquesLengua : asignatura === 'ingles' ? bloquesIngles : bloquesHistoria).map((t: any, i: number) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                label: `${t.label} · ${asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : asignatura === 'quimica' ? puntosBloqueQuimica(t.tipo) : asignatura === 'biologia' ? puntosBloqueBiologia(t.tipo) : (t as any).pts}pts`, // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                active: bloqueIdx === i,
                onSelect: () => {
                  asignatura === 'fisica'
                    ? cambiarBloqueFisica(i, t.tipo)
                    : asignatura === 'quimica'
                      ? cambiarBloqueQuimica(i, t.tipo)
                      : asignatura === 'biologia'
                        ? cambiarBloqueBiologia(i, t.tipo)
                        : setBloqueIdx(i)
                  if (asignatura !== 'fisica' && asignatura !== 'quimica' && asignatura !== 'biologia') reset()
                }
              }))
  const questionFilterValue = questionFilterOptions.find(option => option.active)?.label ?? (isCatalunaExam ? 'Selecciona ejercicio' : 'Selecciona pregunta')
  const examSearchResults = useMemo<ExamSearchResult[]>(() => {
    if (!searchFocused || !searchQuery.trim() || asignatura === 'historia_filosofia') return []

    try {
      const withSearchText = (result: Omit<ExamSearchResult, 'searchText'>, rawParts: unknown[]): ExamSearchResult => ({
        ...result,
        searchText: normalizeSearchText(rawParts.map(stringifyForSearch).join(' '))
      })

      const tipoFromCataluna = (convocatoria: string): Tipo =>
        convocatoria === 'extraordinaria' ? 'Extraordinaria' : 'Ordinaria'

      const normalSource: any[] = (EXAMENES_BY_ASIGNATURA[asignatura] ?? examenesHistoria) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        .filter(exam => !SUBJECTS_REQUIRING_STRUCTURED_EXAMS.has(asignatura) || hasStructuredQuestions(exam))

      const selectNormalResult = (exam: any, question: any, questionIndex: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      const years = Array.from(new Set(
        normalSource
          .filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate))
          .map(candidate => candidate.año)
      )).sort((a: any, b: any) => Number(b) - Number(a)) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
      setTipo(exam.tipo)
      setExamenIdx(Math.max(0, years.findIndex(year => year === exam.año)))
      setCatEjercicioIdx(0)
      setCatHistoriaEjercicioIdx(0)
      setCatFisicaEjercicioIdx(0)
      setCatAsignaturaEjercicioIdx(0)

      if (asignatura === 'historia') {
        const examsOfYear = normalSource.filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate) && candidate.año === exam.año)
        const dias = Array.from(new Set(examsOfYear.map(candidate => candidate.dia).filter(Boolean)))
        setDiaHistoriaIdx(Math.max(0, dias.findIndex(dia => dia === exam.dia)))
        setOpcion(exam.opcion === 'B' ? 1 : 0)
        setBloqueIdx(questionIndex)
      } else if (asignatura === 'lengua') {
        const examsOfYear = normalSource.filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate) && candidate.año === exam.año)
        const versiones = Array.from(new Set(examsOfYear.map(candidate => candidate.dia ?? candidate.opcion).filter(Boolean)))
        setDiaHistoriaIdx(Math.max(0, versiones.findIndex(version => version === (exam.dia ?? exam.opcion))))
        setBloqueIdx(questionIndex)
        setOpcion(0)
      } else if (asignatura === 'ingles') {
        const examsOfYear = normalSource.filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate) && candidate.año === exam.año)
        const dias = Array.from(new Set(examsOfYear.map(candidate => candidate.dia).filter(Boolean)))
        setDiaHistoriaIdx(Math.max(0, dias.findIndex(dia => dia === exam.dia)))
        setOpcion(question.opcion === 'B' || exam.opcion === 'B' ? 1 : 0)
        setBloqueIdx(questionIndex)
      } else if (asignatura === 'biologia') {
        const examsOfYear = normalSource.filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate) && candidate.año === exam.año)
        const series = Array.from(new Set(examsOfYear.map(candidate => candidate.dia).filter(Boolean)))
        const blocks = Array.from(new Set((exam.preguntas ?? []).map((p: any) => p.bloque))) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        setDiaHistoriaIdx(Math.max(0, series.findIndex(serie => serie === exam.dia)))
        setOpcion(question.opcion === 'B' ? 1 : 0)
        setBloqueIdx(Math.max(0, blocks.findIndex(block => block === question.bloque)))
      } else if (asignatura === 'fisica') {
        setDiaHistoriaIdx(0)
        setOpcion(question.opcion === 'B' ? 1 : 0)
        setBloqueIdx(Math.max(0, TIPOS_FISICA.findIndex(item => item.tipo === question.bloque)))
      } else {
        const blocks = Array.from(new Set((exam.preguntas ?? []).map((p: any) => p.bloque))) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        setDiaHistoriaIdx(0)
        setOpcion(question.opcion === 'B' ? 1 : 0)
        setBloqueIdx(Math.max(0, blocks.findIndex(block => block === question.bloque)))
      }

      setSearchQuery('')
      setSearchFocused(false)
      reset()
    }

    if (!isCatalunaExam) {
      return normalSource
        .filter(exam => perteneceAComunidadSeleccionada(exam))
        .flatMap((exam: any) => ((exam.preguntas ?? []) as any[]).filter(isAvailableOfficialExercise).map((question, questionIndex) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          const points = question.puntuacion ?? question.puntos ?? question.pts
          const questionName = question.numero ?? question.id ?? question.bloque ?? question.tipo ?? `Pregunta ${questionIndex + 1}`
          const title = `${questionName}${question.opcion ? ` · Opción ${question.opcion}` : exam.opcion ? ` · Opción ${exam.opcion}` : ''}`
          const subtitle = question.label ?? question.tema ?? question.bloque ?? LABELS_HISTORIA[question.tipo] ?? exam.dia ?? exam.asignatura ?? cfg.label
          return withSearchText({
            id: `normal-${asignatura}-${exam.id ?? `${exam.año}-${exam.tipo}`}-${question.id ?? questionIndex}`,
            year: String(exam.año),
            convocatoria: exam.tipo,
            title,
            subtitle,
            points: points ? `${formatPts(points)} pts` : '',
            onSelect: () => selectNormalResult(exam, question, questionIndex)
          }, [
            asignatura,
            cfg.label,
            exam.año,
            exam.tipo,
            exam.dia,
            exam.opcion,
            questionName,
            subtitle,
            points,
            question
          ])
        }))
    }

    if (isCatalunaMates) {
      return examenesCatMates.filter(isAvailableOfficialExercise).map((question: any, index: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        const years = Array.from(new Set(examenesCatMates.filter(p => p.tipo === question.tipo).map(p => p.year))).sort((a, b) => b - a)
        const preguntasDelAnio = examenesCatMates.filter(p => p.tipo === question.tipo && p.year === question.year).filter(isAvailableOfficialExercise)
        const ejerciciosUnicos = preguntasDelAnio.filter((pregunta, i, preguntas) =>
          preguntas.findIndex(candidate => candidate.ejercicio === pregunta.ejercicio && candidate.opcion === pregunta.opcion) === i
        )
        const exerciseIndex = Math.max(0, ejerciciosUnicos.findIndex(candidate => candidate.ejercicio === question.ejercicio && candidate.opcion === question.opcion))
        return withSearchText({
          id: `cat-mates-${question.year}-${question.tipo}-${question.ejercicio}-${question.opcion ?? index}`,
          year: String(question.year),
          convocatoria: question.tipo,
          title: question.opcion ? `Ejercicio ${question.ejercicio} · Opción ${question.opcion}` : `Ejercicio ${question.ejercicio}`,
          subtitle: question.tema ?? question.bloque ?? 'Matemáticas Cataluña',
          points: question.puntos ? `${formatPts(question.puntos)} pts` : '',
          onSelect: () => {
            setTipo(question.tipo)
            setExamenIdx(Math.max(0, years.findIndex(year => year === question.year)))
            setCatEjercicioIdx(exerciseIndex)
            setCatHistoriaEjercicioIdx(0)
            setCatFisicaEjercicioIdx(0)
            setCatAsignaturaEjercicioIdx(0)
            setBloqueIdx(0)
            setDiaHistoriaIdx(0)
            setOpcion(0)
            setSearchQuery('')
            setSearchFocused(false)
            reset()
          }
        }, [asignatura, question.year, question.tipo, question.ejercicio, question.opcion, question.tema, question.bloque, question.puntos, question])
      })
    }

    if (isCatalunaFisica) {
      return examenesFisicaCataluna.flatMap(exam => exam.ejercicios.filter(isAvailableOfficialExercise).map((exercise, exerciseIndex) => {
        const selectedTipo = tipoFromCataluna(exam.convocatoria)
        const years = Array.from(new Set(examenesFisicaCataluna.filter(candidate => candidate.convocatoria === exam.convocatoria).map(candidate => candidate.anio))).sort((a, b) => b - a)
        const points = exercise.apartados?.reduce((total, apartado) => total + Number(apartado.puntos ?? 0), 0) || 2.5
        return withSearchText({
          id: `cat-fisica-${exam.id}-${exercise.numero}`,
          year: String(exam.anio),
          convocatoria: selectedTipo,
          title: `Ejercicio ${exercise.numero}`,
          subtitle: exercise.bloque ?? exercise.titulo,
          points: `${formatPts(points)} pts`,
          onSelect: () => {
            setTipo(selectedTipo)
            setExamenIdx(Math.max(0, years.findIndex(year => year === exam.anio)))
            setCatFisicaEjercicioIdx(exerciseIndex)
            setCatEjercicioIdx(0)
            setCatHistoriaEjercicioIdx(0)
            setCatAsignaturaEjercicioIdx(0)
            setBloqueIdx(0)
            setDiaHistoriaIdx(0)
            setOpcion(0)
            setSearchQuery('')
            setSearchFocused(false)
            reset()
          }
        }, [asignatura, exam, exercise, points])
      }))
    }

    if (isCatalunaQuimica || isCatalunaLengua) {
      const catExams = isCatalunaQuimica ? examenesQuimicaCataluna : examenesLenguaCataluna
      const flattenLengua = (exam: any): CatEjercicioView[] => [ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        ...((exam.opciones ?? []).flatMap((op: any) => op.bloques.map((bloque: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          id: `${op.opcion}-${bloque.id}`,
          titulo: `${op.titulo} · ${bloque.titulo}`,
          instrucciones: bloque.instrucciones,
          texto: [op.texto, bloque.texto].filter(Boolean).join('\n\n'),
          fuente: [op.fuente, bloque.fuente].filter(Boolean).join('\n\n'),
          apartados: bloque.apartados,
          opcion: op.opcion,
        })))),
        ...((exam.partesComunes ?? []).map((bloque: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          id: `comun-${bloque.id}`,
          titulo: `Parte común · ${bloque.titulo}`,
          instrucciones: bloque.instrucciones,
          texto: bloque.texto,
          fuente: bloque.fuente,
          apartados: bloque.apartados,
          opcion: 'Parte común',
        }))),
        ...((exam.partesObligatorias ?? []).map((bloque: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          id: bloque.id,
          titulo: bloque.titulo,
          instrucciones: bloque.instrucciones,
          texto: bloque.texto,
          fuente: bloque.fuente,
          apartados: bloque.apartados,
        }))),
      ]
      return catExams.flatMap((exam: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        const selectedTipo = tipoFromCataluna(exam.convocatoria)
        const years = Array.from(new Set(catExams.filter((candidate: any) => candidate.convocatoria === exam.convocatoria).map((candidate: any) => candidate.anio))).sort((a: any, b: any) => Number(b) - Number(a)) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        const exercises: any[] = isCatalunaQuimica // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          ? (exam.ejercicios ?? []).filter(isAvailableOfficialExercise).map((exercise: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
              id: String(exercise.numero),
              titulo: exercise.titulo,
              instrucciones: exercise.instrucciones,
              enunciado: exercise.enunciado,
              apartados: exercise.apartados,
              datos: exercise.datos,
              imagenes: exercise.imagenes,
              requiereRevision: exercise.requiereRevision,
            }))
          : flattenLengua(exam).filter(isAvailableOfficialExercise)
        return exercises.map((exercise, exerciseIndex) => {
          const points = (exercise.apartados ?? []).reduce((total: number, apartado: any) => total + Number(apartado.puntos ?? 0), 0) || 2.5 // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          return withSearchText({
            id: `cat-${asignatura}-${exam.id}-${exercise.id}`,
            year: String(exam.anio),
            convocatoria: selectedTipo,
            title: isCatalunaQuimica ? `Ejercicio ${exercise.id}` : exercise.titulo,
            subtitle: isCatalunaQuimica ? exercise.titulo : (exercise.opcion ?? 'Lengua Cataluña'),
            points: `${formatPts(points)} pts`,
            onSelect: () => {
              setTipo(selectedTipo)
              setExamenIdx(Math.max(0, years.findIndex((year: any) => year === exam.anio))) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
              setCatAsignaturaEjercicioIdx(exerciseIndex)
              setCatEjercicioIdx(0)
              setCatHistoriaEjercicioIdx(0)
              setCatFisicaEjercicioIdx(0)
              setBloqueIdx(0)
              setDiaHistoriaIdx(0)
              setOpcion(0)
              setSearchQuery('')
              setSearchFocused(false)
              reset()
            }
          }, [asignatura, exam, exercise, points])
        })
      })
    }

    if (isCatalunaHistoria) {
      return Object.values(examenesCataluna).flatMap((exam: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        const years = Object.values(examenesCataluna).map((e: any) => e.anio).filter((value, index, values) => values.indexOf(value) === index).sort((a: any, b: any) => Number(b) - Number(a)) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
        return (exam.ejercicios ?? []).filter(isAvailableOfficialExercise).map((exercise: any, exerciseIndex: number) => withSearchText({ // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
          id: `cat-historia-${exam.id}-${exercise.numero}`,
          year: String(exam.anio),
          convocatoria: exam.serie ?? 'Ordinaria',
          title: `Ejercicio ${exercise.numero}`,
          subtitle: exercise.fuente?.titulo ?? exercise.tipo ?? 'Historia Cataluña',
          points: '2.5 pts',
          onSelect: () => {
            setTipo('Ordinaria')
            setExamenIdx(Math.max(0, years.findIndex((year: any) => year === exam.anio))) // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
            setCatHistoriaEjercicioIdx(exerciseIndex)
            setCatEjercicioIdx(0)
            setCatFisicaEjercicioIdx(0)
            setCatAsignaturaEjercicioIdx(0)
            setBloqueIdx(0)
            setDiaHistoriaIdx(0)
            setOpcion(0)
            setSearchQuery('')
            setSearchFocused(false)
            reset()
          }
        }, [asignatura, exam, exercise]))
      })
    }

      return []
    } catch (error) {
      console.error('Exam search failed safely', error)
      return []
    }
  }, [asignatura, ccaa, cfg.label, isCatalunaExam, isCatalunaFisica, isCatalunaHistoria, isCatalunaLengua, isCatalunaMates, isCatalunaQuimica, searchFocused, searchQuery])
  const normalizedSearchQuery = normalizeSearchText(searchQuery.trim())
  const filteredSearchResults = useMemo(
    () => normalizedSearchQuery
      ? examSearchResults.filter(result => result.searchText.includes(normalizedSearchQuery)).slice(0, 10)
      : [],
    [examSearchResults, normalizedSearchQuery]
  )
  const showSearchResults = searchFocused && searchQuery.trim().length > 0

  if (!usuario) return null

  return (
    <div className="kairo-app-shell kairo-premium-shell" style={{
  display: 'flex',
  minHeight: '100vh',
}}>
      <style>{`
        .campus-hover,
        .campus-primary,
        .campus-subject-card,
        .campus-nav-item,
        .campus-arrow {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease, filter 180ms ease;
        }

        .campus-hover:hover {
          transform: translateY(-2px);
          border-color: var(--hover-border, #60a5fa) !important;
          background: linear-gradient(135deg, #ffffff, var(--hover-bg, #eff6ff)) !important;
          color: var(--hover-color, #2563eb) !important;
          box-shadow: 0 16px 34px var(--hover-shadow, rgba(96, 165, 250, 0.2)) !important;
        }

        .campus-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: saturate(1.08) brightness(1.03);
          box-shadow: 0 20px 42px var(--hover-shadow, rgba(96, 165, 250, 0.24)) !important;
        }

        .campus-nav-item:hover {
          background: var(--hover-bg, rgba(239, 246, 255, 0.78)) !important;
          border-color: var(--hover-border, rgba(96, 165, 250, 0.55)) !important;
          transform: translateX(2px);
        }

        .campus-subject-card:hover {
          transform: translateY(-6px);
          border-color: var(--hover-border, rgba(96, 165, 250, 0.65)) !important;
          box-shadow: 0 30px 80px var(--hover-shadow, rgba(96, 165, 250, 0.18)) !important;
        }

        .campus-subject-card:hover .campus-arrow {
          transform: rotate(8deg) scale(1.05);
          background: var(--hover-color, #2563eb) !important;
          color: #ffffff !important;
        }

        .subject-card-grid {
          display: flex;
          gap: 12px;
          width: 100%;
          overflow-x: auto;
          padding: 2px 2px 8px;
          scrollbar-width: thin;
        }

        .subject-card-grid > .pau-subject-card {
          flex: 1 0 214px;
          max-width: 280px;
        }

        .exams-screen {
          color: #111827;
        }

        .exams-screen .pau-subject-card > svg {
          display: none;
        }

        .exams-subject-section {
          position: relative;
          z-index: 1;
          margin-bottom: 28px !important;
        }

        .exams-subject-strip {
          align-items: stretch;
          padding: 2px 0 12px;
          overflow-y: visible;
        }

        .exams-subject-strip > .pau-subject-card {
          flex: 0 0 auto !important;
          min-width: 178px;
          max-width: 245px;
          min-height: 78px !important;
          height: auto !important;
          padding: 12px 16px !important;
          border-radius: 22px !important;
          background: #f7f7f8 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: none !important;
        }

        .exams-subject-strip > .pau-subject-card.is-active {
          background: linear-gradient(135deg, #ffffff, var(--hover-bg, #eff6ff)) !important;
          border-color: var(--hover-border, #4f46e5) !important;
          box-shadow: 0 14px 34px var(--hover-shadow, rgba(79, 70, 229, 0.12)) !important;
        }

        .exams-subject-strip > .pau-subject-card:hover {
          transform: translateY(-2px) !important;
          border-color: var(--hover-border, #60a5fa) !important;
          box-shadow: 0 16px 36px var(--hover-shadow, rgba(15, 23, 42, 0.1)) !important;
        }

        .exams-subject-strip .subject-kicker {
          display: none !important;
        }

        .exams-subject-strip > .pau-subject-card > div:nth-of-type(2) {
          align-items: flex-start !important;
          min-width: 0;
        }

        .exams-subject-strip > .pau-subject-card > div:nth-of-type(2) > div:last-child {
          min-width: 0;
          max-width: 100%;
        }

        .exams-subject-strip > .pau-subject-card > div:nth-of-type(2) > div:last-child > div:first-child {
          white-space: normal;
          overflow-wrap: anywhere;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .exams-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 28px;
        }

        .exams-search-bar {
          position: relative;
          z-index: 110;
          min-width: 260px;
          max-width: 340px;
          flex: 0 1 320px;
          border: 1px solid rgba(219, 231, 251, 0.95);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.92);
          color: #94a3b8;
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 700;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.06);
        }

        .exams-search-input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #111827;
          font: inherit;
        }

        .exams-search-input::placeholder {
          color: #94a3b8;
        }

        .exam-search-results {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          z-index: 130;
          width: min(460px, calc(100vw - 48px));
          max-height: 360px;
          overflow-y: auto;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 24px 70px rgba(15, 23, 42, 0.16);
          padding: 8px;
        }

        .exam-search-result {
          width: 100%;
          border: 0;
          border-radius: 14px;
          background: transparent;
          padding: 10px 12px;
          text-align: left;
          cursor: pointer;
          display: grid;
          gap: 5px;
        }

        .exam-search-result:hover {
          background: #f8fafc;
        }

        .exam-search-result-title {
          color: #111827;
          font-size: 13px;
          font-weight: 850;
          line-height: 1.35;
        }

        .exam-search-result-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          color: #6b7280;
          font-size: 11px;
          font-weight: 750;
        }

        .exam-search-empty {
          padding: 14px 12px;
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
          line-height: 1.5;
        }

        .exams-filter-bar {
          position: relative;
          z-index: 90;
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
          padding: 0;
          overflow: visible;
          flex-wrap: wrap;
        }

        .exams-filter-card {
          position: relative;
          z-index: 90;
          overflow: visible !important;
        }

        .exams-filter-card > div:not(:first-child):not(.exams-filter-bar) {
          display: none !important;
        }

        .exams-filter-divider {
          width: 1px;
          height: 18px;
          background: #e2e8f0;
          flex-shrink: 0;
          margin: 0 2px;
        }

        /* ── Filter dropdown ── */
        .exam-filter-dropdown {
          position: relative;
          z-index: 91;
        }

        .exam-filter-trigger {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 34px;
          padding: 0 11px;
          border: 1.5px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          white-space: nowrap;
          transition: border-color 140ms ease, background 140ms ease, box-shadow 140ms ease;
        }

        .exam-filter-trigger:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }

        .exam-filter-trigger.has-value {
          border-color: #bfdbfe;
          background: #f0f7ff;
        }

        .exam-filter-trigger.is-open {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          background: #f0f7ff;
        }

        .exam-filter-label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          flex-shrink: 0;
        }

        .exam-filter-sep {
          font-size: 11px;
          color: #cbd5e1;
          flex-shrink: 0;
          line-height: 1;
        }

        .exam-filter-value {
          font-size: 12px;
          font-weight: 800;
          color: #0f172a;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .exam-filter-trigger.has-value .exam-filter-value,
        .exam-filter-trigger.is-open .exam-filter-value {
          color: #1d4ed8;
        }

        @keyframes filterDropIn {
          from { opacity: 0; transform: translateY(-5px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .exam-filter-menu {
          position: absolute;
          left: 0;
          top: calc(100% + 6px);
          z-index: 120;
          min-width: 190px;
          max-height: 300px;
          overflow-y: auto;
          padding: 4px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.05);
          animation: filterDropIn 160ms cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        .exam-filter-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          padding: 7px 10px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          cursor: pointer;
          text-align: left;
          transition: background 100ms ease, color 100ms ease;
        }

        .exam-filter-option:hover {
          background: #f8fafc;
          color: #0f172a;
        }

        .exam-filter-option.is-active {
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 700;
        }

        /* ── Opción A / B group ── */
        .exams-option-group {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0 4px;
        }

        .exam-option-label {
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #94a3b8;
          margin-right: 2px;
        }

        .exam-option-button {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          border: 1.5px solid #e2e8f0;
          background: white;
          font-size: 12px;
          font-weight: 800;
          color: #475569;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: border-color 140ms ease, background 140ms ease, color 140ms ease;
        }

        .exam-option-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .exam-option-button.is-active {
          background: #eff6ff;
          border-color: #2563eb;
          color: #1d4ed8;
        }

        .exams-workspace {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 308px;
          gap: 22px;
          align-items: start;
        }

        .exams-main-column {
          min-width: 0;
        }

        .exams-ai-panel {
          position: sticky;
          top: 88px;
          display: flex;
          flex-direction: column;
        }

        .exams-side-card {
          width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          overflow: hidden;
        }

        .exams-side-section {
          border-radius: 18px;
          border: 1px solid #e5edf9;
          background: #f8fbff;
          padding: 13px 14px;
        }

        .exams-side-label {
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
        }

        .exams-side-text {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 600;
        }

        .exams-metric-row {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .exams-question-card {
          animation: pau-fade-up 300ms var(--ease-out) both;
        }

        .exams-answer-card {
          animation: pau-fade-up 340ms var(--ease-out) 60ms both;
        }

        .exams-correct-button {
          transition: filter 200ms ease, box-shadow 200ms ease, transform 200ms var(--ease-out) !important;
        }
        .exams-correct-button:not(:disabled):hover {
          filter: brightness(1.05) saturate(1.08);
          transform: translateY(-1px);
        }

        .history-screen {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: 22px 28px 40px;
          font-family: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
          background: #fff;
        }

        .history-shell {
          width: 100%;
          max-width: none;
          margin: 0 auto;
        }

        .history-hero {
          position: relative;
          height: 340px;
          border-radius: 0;
          overflow: hidden;
          margin: -22px -28px 24px;
          box-shadow: none;
        }

        .history-hero img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          filter: brightness(.5) saturate(.75);
          transition: opacity 400ms ease;
        }

        .history-hero-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
          padding: 28px 32px 32px;
          background: linear-gradient(to bottom, rgba(15,23,42,.16) 0%, rgba(15,23,42,.86) 100%);
        }

        .history-hero-eyebrow {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .18em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 6px;
        }

        .history-hero-title {
          font-size: clamp(48px, 6vw, 76px);
          font-weight: 900;
          color: #fff;
          line-height: .88;
          letter-spacing: -.045em;
        }

        .history-hero-sub {
          font-size: 11px;
          font-weight: 600;
          color: rgba(255,255,255,.55);
          margin-top: 8px;
        }

        .history-hero-count {
          flex-shrink: 0;
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 700;
          color: rgba(255,255,255,.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .history-topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 16px;
        }

        .history-topbar h1 {
          margin: 0;
          color: #0f172a;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.035em;
          line-height: 1.1;
        }

        .history-topbar p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.45;
        }

        .history-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .history-button {
          height: 42px;
          border-radius: 12px;
          border: 1px solid #dbe7fb;
          background: rgba(255,255,255,.92);
          color: #0f172a;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;
          box-shadow: 0 14px 36px rgba(15,23,42,.06);
          position: relative;
        }

        .history-button-primary {
          border-color: #2563eb;
          background: #2563eb;
          color: #fff;
          box-shadow: 0 14px 32px rgba(37,99,235,.28);
        }

        .history-button-primary.is-open {
          background: #1d4ed8;
          border-color: #1d4ed8;
        }

        .history-filter-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #fbbf24;
          box-shadow: 0 0 0 2px #2563eb;
        }

        .history-tabs {
          display: flex;
          gap: 18px;
          margin-top: 10px;
        }

        .history-tab {
          border: 0;
          background: transparent;
          padding: 0 0 6px;
          color: #94a3b8;
          font-weight: 750;
          font-size: 12px;
          cursor: pointer;
          position: relative;
        }

        .history-tab.is-active {
          color: #2563eb;
          font-weight: 850;
        }

        .history-tab.is-active::after {
          content: '';
          position: absolute;
          left: 0;
          right: 0;
          bottom: -1px;
          height: 2px;
          border-radius: 999px;
          background: #2563eb;
        }

        .history-overview {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 24px;
          align-items: start;
        }

        .history-main {
          min-width: 0;
        }

        .history-card {
          background: rgba(255,255,255,.94);
          border: 1px solid #dbe7fb;
          border-radius: 18px;
          box-shadow: 0 18px 50px rgba(37,99,235,.08);
        }

        .history-summary-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          margin-bottom: 20px;
        }

        .history-summary-zone {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-width: 0;
          padding: 20px 24px;
          border-right: 1px solid #e8eef7;
          min-height: 142px;
        }

        .history-summary-zone:last-child {
          border-right: 0;
        }

        .history-summary-zone-total {
          flex-direction: row;
          align-items: center;
          gap: 14px;
        }

        .history-total-illustration {
          flex-shrink: 0;
          margin-left: auto;
        }

        .history-total-copy > span,
        .history-side-card > h2 {
          display: block;
          margin: 0 0 8px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .history-total-copy > strong {
          display: block;
          color: #0f172a;
          font-size: clamp(28px, 3vw, 40px);
          font-weight: 800;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .history-total-delta {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          color: #16a34a;
          font-size: 12px;
          font-weight: 800;
        }

        .history-subject-card em,
        .history-row-score em,
        .history-stat-big em,
        .history-stat-donut-row strong em {
          font-style: normal;
          color: #94a3b8;
          font-size: 0.45em;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .history-side-card > p {
          display: block;
          margin: 0 0 14px;
          color: #64748b;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.45;
        }

        .history-subject-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(138px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        }

        .history-subject-card {
          border: 1px solid #e8eef7;
          border-top: 3px solid var(--subject-color, #2563eb);
          border-radius: 12px;
          background: #fff;
          padding: 12px 12px 11px;
          min-width: 0;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
          transition: box-shadow 150ms, transform 150ms;
        }

        .history-subject-card:hover {
          box-shadow: 0 12px 28px rgba(15,23,42,.08);
          transform: translateY(-1px);
        }

        .history-subject-card.active {
          border-color: var(--subject-color, #2563eb);
          background: var(--subject-light, #eff6ff);
          box-shadow: inset 0 0 0 2px var(--subject-color, #2563eb), 0 10px 24px -8px var(--subject-color, #2563eb);
        }

        .history-subject-icon {
          width: 28px;
          height: 28px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          margin-bottom: 8px;
          color: #fff;
          background: var(--subject-color, #2563eb);
        }

        .history-subject-card b {
          display: block;
          margin-bottom: 6px;
          color: #0f172a;
          font-size: 11.5px;
          font-weight: 900;
          line-height: 1.2;
        }

        .history-subject-card strong {
          display: block;
          color: #071735;
          font-size: 20px;
          font-weight: 950;
          letter-spacing: -0.04em;
          line-height: 1;
        }

        .history-subject-card small {
          display: block;
          margin-top: 6px;
          color: #94a3b8;
          font-size: 10.5px;
          font-weight: 700;
        }

        .history-filters {
          display: grid;
          grid-template-columns: minmax(220px, 1fr) 132px 132px 138px 190px auto;
          gap: 10px;
          align-items: center;
          padding: 0;
          margin-bottom: 18px;
        }

        .history-input,
        .history-select {
          height: 42px;
          border-radius: 8px;
          border: 1px solid #dbe7fb;
          background: #fff;
          color: #0f172a;
          padding: 0 13px;
          font-size: 13px;
          font-weight: 750;
          outline: none;
          box-shadow: 0 8px 20px rgba(15,23,42,.04);
        }

        .history-input {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #94a3b8;
        }

        .history-input input {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0f172a;
          font: inherit;
          min-width: 0;
        }

        .history-input::placeholder {
          color: #94a3b8;
        }

        .history-select {
          display: grid;
          grid-template-columns: 1fr;
          align-content: center;
          gap: 1px;
          padding: 0 11px;
        }

        .history-select span {
          color: #94a3b8;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .history-select select {
          width: 100%;
          border: 0;
          outline: 0;
          background: transparent;
          color: #0f172a;
          font-size: 12px;
          font-weight: 850;
          font-family: inherit;
        }

        .history-filter-clear {
          height: 42px;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #2563eb;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .history-month-title {
          margin: 2px 0 6px;
          color: #0f172a;
          font-size: 12.5px;
          font-weight: 900;
          letter-spacing: -.01em;
        }

        .history-rows-card {
          background: rgba(255,255,255,.96);
          border: 1px solid #dbe7fb;
          border-radius: 14px;
          box-shadow: 0 10px 28px rgba(15,23,42,.045);
          overflow: hidden;
        }

        .history-row {
          width: 100%;
          border: 0;
          border-bottom: 1px solid #eef2f7;
          background: transparent;
          min-height: 52px;
          padding: 8px 16px;
          display: grid;
          grid-template-columns: 50px minmax(0, 1fr) 135px 70px 140px 26px;
          align-items: center;
          gap: 14px;
          text-align: left;
          cursor: pointer;
          transition: background 120ms;
        }

        .history-row:last-child {
          border-bottom: 0;
        }

        .history-row:hover {
          background: #f8fbff;
        }

        .history-row-date {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: var(--subject-light, #eff6ff);
          color: var(--subject-color, #2563eb);
          display: grid;
          place-items: center;
          line-height: 1;
        }

        .history-row-date b {
          font-size: 15px;
          font-weight: 950;
          letter-spacing: -0.02em;
        }

        .history-row-date small {
          margin-top: -4px;
          font-size: 8px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .history-row-main {
          min-width: 0;
        }

        .history-row-main small {
          display: block;
          color: var(--subject-color, #2563eb);
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-row-main strong {
          display: block;
          margin-top: 4px;
          color: #0f172a;
          font-size: 15px;
          font-weight: 850;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .history-row-source {
          justify-self: start;
          border-radius: 999px;
          background: var(--subject-light, #eff6ff);
          color: var(--subject-color, #2563eb);
          padding: 5px 10px;
          font-size: 10px;
          font-weight: 900;
          white-space: nowrap;
        }

        .history-row-score {
          justify-self: end;
          color: #0f172a;
          font-size: 17px;
          font-weight: 950;
          letter-spacing: -0.03em;
        }

        .history-row-score.good {
          color: #16a34a;
        }

        .history-row-score.mid {
          color: #ca8a04;
        }

        .history-row-score.bad {
          color: #ef4444;
        }

        .history-row-score.muted {
          color: #94a3b8;
        }

        .history-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: sticky;
          top: 88px;
          max-height: calc(100vh - 108px);
          overflow-y: auto;
        }

        .history-side-card {
          padding: 18px;
        }

        .history-side-card > h2 {
          margin-bottom: 4px;
        }

        .history-side-card > p {
          margin: 0 0 14px;
        }

        .history-side-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid #e8eef7;
        }

        .history-side-row:last-child {
          border-bottom: 0;
        }

        .history-side-row span {
          color: #0f172a;
          font-size: 13px;
          font-weight: 850;
        }

        .history-side-row span::before {
          content: '';
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          background: var(--subject-color, #2563eb);
        }

        .history-side-row b {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #0f172a;
          font-size: 18px;
          font-weight: 950;
          letter-spacing: -0.04em;
        }

        .history-side-row b em {
          font-style: normal;
          margin-left: 2px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
        }

        .history-side-row.positive b {
          color: #16a34a;
        }

        .history-side-row-bar {
          display: block;
          padding: 9px 0;
        }

        .history-side-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 6px;
        }

        .history-bar-track {
          height: 5px;
          border-radius: 999px;
          background: #eef2f7;
          overflow: hidden;
        }

        .history-bar-fill {
          height: 100%;
          border-radius: 999px;
          background: var(--subject-color, #2563eb);
        }

        .history-side-row-count {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 600;
        }

        .history-stat-label {
          display: block;
          margin-bottom: 10px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
          line-height: 1.2;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .history-stat-donut-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-stat-donut-row strong {
          color: #0f172a;
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .history-stat-big {
          display: block;
          color: #0f172a;
          font-size: clamp(26px, 2.6vw, 34px);
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .history-stat-big.positive {
          color: #16a34a;
        }

        .history-stat-foot {
          display: block;
          margin-top: 8px;
          color: #64748b;
          font-size: 11.5px;
          font-weight: 700;
        }

        .history-stat-foot.muted {
          color: #94a3b8;
        }

        .history-summary-zone-recent {
          gap: 5px;
        }

        .history-recent-item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 8px;
          align-items: center;
          border: 0;
          background: transparent;
          padding: 3px 0;
          text-align: left;
          cursor: pointer;
        }

        .history-recent-item b {
          display: block;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #0f172a;
          font-size: 12px;
          font-weight: 800;
        }

        .history-recent-item-subject {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #94a3b8;
          font-size: 9.5px;
          font-weight: 700;
          margin-top: 1px;
        }

        .history-recent-item span {
          font-size: 12px;
          font-weight: 900;
          color: #0f172a;
        }

        .history-recent-item span.good { color: #16a34a; }
        .history-recent-item span.mid { color: #ca8a04; }
        .history-recent-item span.bad { color: #ef4444; }
        .history-recent-item span.muted { color: #94a3b8; }

        .history-recent-item small {
          color: #94a3b8;
          font-size: 10.5px;
          font-weight: 700;
          white-space: nowrap;
        }

        .history-subject-score {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .history-trend-up { color: #16a34a; }
        .history-trend-down { color: #ef4444; }

        .history-row-view {
          justify-self: end;
          height: 30px;
          padding: 0 12px;
          border-radius: 999px;
          border: 1px solid #bfdbfe;
          background: #fff;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
          cursor: pointer;
        }

        .history-row-menu-wrap {
          position: relative;
          justify-self: end;
        }

        .history-row-menu-btn {
          width: 26px;
          height: 26px;
          border: 0;
          background: transparent;
          color: #94a3b8;
          border-radius: 8px;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .history-row-menu-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .history-row-menu-backdrop {
          position: fixed;
          inset: 0;
          z-index: 40;
        }

        .history-row-menu {
          position: absolute;
          top: 30px;
          right: 0;
          z-index: 41;
          background: #fff;
          border: 1px solid #dbe7fb;
          border-radius: 12px;
          box-shadow: 0 18px 40px rgba(15,23,42,.14);
          padding: 6px;
          display: flex;
          flex-direction: column;
          min-width: 190px;
        }

        .history-row-menu button {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          padding: 9px 10px;
          border-radius: 8px;
          color: #0f172a;
          font-size: 12.5px;
          font-weight: 700;
          text-align: left;
          cursor: pointer;
        }

        .history-row-menu button:hover {
          background: #eff6ff;
          color: #2563eb;
        }

        .history-trend-chart {
          position: relative;
          margin-top: 10px;
        }

        .history-trend-max {
          position: absolute;
          top: 0;
          left: 0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
        }

        .history-trend-min {
          position: absolute;
          bottom: 22px;
          left: 0;
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
        }

        .history-trend-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 6px;
        }

        .history-trend-labels span {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }

        .history-trend-empty {
          margin: 0;
          color: #94a3b8;
          font-size: 12px;
          line-height: 1.6;
        }

        .history-activity-card-v2 {
          display: flex;
          flex-direction: column;
        }

        .history-activity-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 4px;
        }

        .history-activity-grid > div {
          border-radius: 12px;
          background: #f8fbff;
          border: 1px solid #e8eef7;
          padding: 10px 6px;
          text-align: center;
        }

        .history-activity-grid strong {
          display: block;
          color: #0f172a;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.04em;
        }

        .history-activity-grid span {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          line-height: 1.2;
        }

        .history-empty {
          min-height: 280px;
          display: grid;
          place-items: center;
          align-content: center;
          text-align: center;
          padding: 42px 24px;
          color: #64748b;
        }

        .history-empty-compact {
          min-height: 210px;
        }

        .history-empty-icon {
          width: 64px;
          height: 64px;
          border-radius: 20px;
          display: grid;
          place-items: center;
          margin-bottom: 16px;
          background: #eff6ff;
          color: #2563eb;
          box-shadow: 0 18px 40px rgba(37,99,235,.14);
        }

        .history-empty h2 {
          margin: 0 0 8px;
          color: #071735;
          font-size: 20px;
          font-weight: 950;
        }

        .history-empty p {
          margin: 0;
          max-width: 440px;
          font-size: 14px;
          font-weight: 650;
          line-height: 1.6;
        }

        .exams-footer {
          margin-top: 26px;
          padding: 20px 4px 0;
          border-top: 1px solid #eef0f4;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 650;
        }

        .exams-footer-links {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
        }

        @media (max-width: 920px) {
          .subject-card-grid {
            padding-bottom: 10px;
          }

          .subject-card-grid > .pau-subject-card {
            flex-basis: 220px;
          }

          .exams-workspace {
            grid-template-columns: 1fr;
          }

          .exams-ai-panel {
            position: static;
          }

          .exams-filter-bar {
            overflow-x: auto;
            padding-bottom: 4px;
          }

          .exam-filter-dropdown {
            flex: 0 0 auto;
          }

          .exams-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .history-overview {
            grid-template-columns: 1fr;
          }

          .history-side {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .history-summary-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .history-summary-zone {
            border-bottom: 1px solid #e8eef7;
          }

          .history-subject-row {
            display: flex;
            overflow-x: auto;
          }

          .history-subject-card {
            flex: 0 0 140px;
          }

          .history-filters {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .history-row {
            grid-template-columns: 48px minmax(0, 1fr) 82px;
          }

          .history-row-source,
          .history-row-view,
          .history-row-menu-wrap {
            display: none !important;
          }
        }

        @media (max-width: 1024px) {
          .kairo-app-shell {
            display: block !important;
          }
        }

        @media (max-width: 767px) {
          /* Hide the stat badges in the hero on small screens */
          .exams-hero-stats { display: none !important; }
          /* Reduce hero height */
          .exams-subject-hero { height: 130px !important; }
          .exams-subject-hero-title { font-size: 28px !important; }
          /* Main content padding */
          .exams-screen { padding: 14px 16px 40px !important; }
          /* Subject cards — allow 2 per row on mobile */
          .pau-subject-card { flex-basis: 150px !important; min-width: 140px !important; }

          .history-screen {
            padding: 20px 16px 44px;
          }

          .history-hero {
            height: 200px;
            margin: -20px -16px 20px;
          }

          .history-hero-title {
            font-size: 46px;
          }

          .history-hero-count {
            display: none;
          }

          .history-topbar {
            flex-direction: column;
          }

          .history-actions {
            width: 100%;
            justify-content: stretch;
          }

          .history-button {
            flex: 1;
            justify-content: center;
          }

          .history-summary-zone-total {
            flex-wrap: wrap;
          }

          .history-summary-bar {
            grid-template-columns: 1fr;
          }

          .history-filters {
            grid-template-columns: 1fr;
          }

          .history-side {
            grid-template-columns: 1fr;
          }

          .history-row {
            grid-template-columns: 46px minmax(0, 1fr);
            align-items: start;
          }

          .history-row-score {
            grid-column: 1 / -1;
            justify-self: start !important;
            padding-left: 60px;
          }
        }

        @media (max-width: 640px) {
          .kairo-app-header {
            padding: 14px 16px !important;
          }

          .exams-hero {
            align-items: flex-start;
            flex-direction: column;
          }

          .exams-search-bar {
            min-width: 0;
            max-width: none;
            width: 100%;
          }

          .exams-correct-button {
            width: 100% !important;
          }
        }

        /* ── Chat Campus Apple ──────────────────────── */
        @keyframes chat-msg-ai {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes chat-msg-user {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes chat-dot-bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes chat-avatar-pulse {
          0%, 100% { transform: translateY(0); box-shadow: 0 0 0 0 rgba(37,99,235,0), 0 24px 58px rgba(37,99,235,0.16); }
          50%       { transform: translateY(-4px); box-shadow: 0 0 0 11px rgba(96,165,250,0.10), 0 28px 68px rgba(37,99,235,0.22); }
        }

        .chat-msg-ai   { animation: chat-msg-ai   380ms cubic-bezier(0.23,1,0.32,1) both; }
        .chat-msg-user { animation: chat-msg-user  240ms cubic-bezier(0.23,1,0.32,1) both; }
        .chat-dot-1 { animation: chat-dot-bounce 1.4s ease-in-out infinite 0s; }
        .chat-dot-2 { animation: chat-dot-bounce 1.4s ease-in-out infinite 0.15s; }
        .chat-dot-3 { animation: chat-dot-bounce 1.4s ease-in-out infinite 0.30s; }
        .chat-avatar-pulse { animation: chat-avatar-pulse 3s ease-in-out infinite; }

        .chat-input-wrap {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 18px;
          padding: 10px 10px 10px 18px;
          display: flex;
          gap: 10px;
          align-items: flex-end;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        .chat-input-wrap:focus-within {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 3px rgba(37,99,235,.08);
        }

        .chat-send-btn {
          padding: 11px 18px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          background: #2563eb;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 7px;
          transition: transform 100ms ease, box-shadow 100ms ease, opacity 150ms ease;
        }
        .chat-send-btn:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(37,99,235,.3);
        }
        .chat-send-btn:disabled {
          opacity: 0.42;
          cursor: not-allowed;
          box-shadow: none;
          background: #dbe7fb;
          color: #64748b;
        }
      `}</style>
      <SidebarNav />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <header className="kairo-app-header kairo-topbar" style={{
  borderBottom: '1px solid rgba(219,231,251,0.78)',
  padding: '10px 32px',
  minHeight: '64px',
  display: (seccion === 'examenes' || seccion === 'chat' || seccion === 'historial') ? 'none' : 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '18px',
  position: 'sticky',
  top: 0,
  zIndex: 40,
  transition: 'background 300ms ease, border-color 300ms ease',
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: '1 1 auto', flexWrap: 'wrap' }}>
            {seccion === 'examenes' && (
              <div style={{ width: 30, height: 30, borderRadius: 10, background: cfg.light, border: '1px solid ' + cfg.soft, color: cfg.color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <cfg.icon size={16} />
              </div>
            )}
            {seccion === 'chat' && (
              <div style={{ width: 30, height: 30, borderRadius: 10, background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 8px 18px rgba(37,99,235,0.22)' }}>
                <MessageCircle size={15} color="#fff" />
              </div>
            )}
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em', transition: 'color 300ms ease', minWidth: 0, overflowWrap: 'anywhere', lineHeight: 1.25 }}>
              {seccion === 'examenes' && cfg.label}
              {seccion === 'chat' && 'Chat con Kairo'}
              {seccion === 'historial' && 'Historial de correcciones'}
              {seccion === 'planning' && 'Mi plan de estudio'}
            </div>
            <div style={{ fontSize: 12, color: seccion === 'chat' ? '#64748b' : '#94a3b8', fontWeight: 500, transition: 'color 300ms ease', whiteSpace: 'nowrap' }}>
              {seccion === 'examenes' && `· ${examSystemLabel(ccaa)}`}
              {seccion === 'chat' && '· Tutor inteligente'}
              {seccion === 'historial' && '· Correcciones guardadas'}
              {seccion === 'planning' && '· Tu semana'}
            </div>
          </div>
        </header>

        {seccion === 'examenes' && (
          <>
            {/* V4 Mesa de Trabajo — photo hero */}
            <div className="exams-subject-hero" style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
              <img src={SUBJECT_HERO_IMGS[asignatura] ?? STUDY_DESK_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%', filter: 'brightness(.5) saturate(.7)', transition: 'opacity 400ms ease' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '20px 28px', background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 70%)' }}>
                <div>
                  <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.18em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 6 }}>Exámenes PAU · {examSystemLabel(ccaa)}</div>
                  <div className="exams-subject-hero-title" style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: .9, letterSpacing: '-.035em' }}>{cfg.label}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 8, fontWeight: 600 }}>{tipo} · {anioSeleccionado ?? '—'} · {examSystemLabel(ccaa)}</div>
                </div>
                {(() => {
                  const h = historial.filter((item: any) => item.asignatura === asignatura) // eslint-disable-line @typescript-eslint/no-explicit-any
                  const med = calcMedia(h)
                  const mejor = h.filter((i: any) => i.nota && i.nota_maxima).length > 0 // eslint-disable-line @typescript-eslint/no-explicit-any
                    ? Math.max(...h.filter((i: any) => i.nota && i.nota_maxima).map((i: any) => (Number(i.nota) / i.nota_maxima) * 10)).toFixed(1) // eslint-disable-line @typescript-eslint/no-explicit-any
                    : null
                  return (
                    <div className="exams-hero-stats" style={{ display: 'flex', gap: 6 }}>
                      {[{ val: String(h.length), label: 'Ejercicios' }, { val: med ?? '—', label: 'Media' }, { val: mejor ?? '—', label: 'Mejor' }].map(stat => (
                        <div key={stat.label} style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 8, padding: '6px 12px', textAlign: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
                          <div style={{ fontSize: 18, fontWeight: 900, color: 'white', lineHeight: 1 }}>{stat.val}</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 2 }}>{stat.label}</div>
                        </div>
                      ))}
                    </div>
                  )
                })()}
              </div>
            </div>
            <main className="exams-screen" style={{ flex: 1, padding: '20px 24px 56px', maxWidth: '1420px', width: '100%', margin: '0 auto' }}>

            <SectionIntroCard
              hintKey="hint_examenes"
              line1="Práctica ejercicio a ejercicio, sin tiempo ni reloj."
              line2="Elige asignatura y tema, responde y lo corriges al momento. Para trabajar una parte del temario en profundidad."
            />

            {/* ── Search bar ──────────────────────────────── */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
              <div className="exams-search-bar pau-reveal pau-reveal-delay-1">
                <input
                  className="exams-search-input"
                  value={searchQuery}
                  onChange={event => setSearchQuery(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Buscar examen..."
                  aria-label="Buscar ejercicio"
                />
                {showSearchResults && (
                  <div className="exam-search-results">
                    {filteredSearchResults.length > 0 ? filteredSearchResults.map(result => (
                      <button
                        type="button"
                        key={result.id}
                        className="exam-search-result"
                        onMouseDown={event => {
                          event.preventDefault()
                          result.onSelect()
                        }}
                      >
                        <span className="exam-search-result-title">{result.title}</span>
                        <span style={{ color: '#4b5563', fontSize: 12, fontWeight: 760, lineHeight: 1.35 }}>{result.subtitle}</span>
                        <span className="exam-search-result-meta">
                          <span>{result.year}</span>
                          <span>·</span>
                          <span>{result.convocatoria}</span>
                          {result.points && (
                            <>
                              <span>·</span>
                              <span>{result.points}</span>
                            </>
                          )}
                        </span>
                      </button>
                    )) : (
                      <div className="exam-search-empty">No se han encontrado ejercicios para esta búsqueda.</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* V4 subject chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', color: '#94a3b8', marginRight: 4, whiteSpace: 'nowrap' }}>Asignatura</span>
              {HOME_SUBJECTS.map(key => {
                const val = ASIGNATURAS[key]
                const card = SUBJECT_CARDS[key]
                const isActive = asignatura === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => navegarAAsignatura(key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, border: isActive ? `1.5px solid ${val.color}` : '1px solid #e2e8f0', background: isActive ? val.light : 'white', fontSize: 12, fontWeight: 700, color: isActive ? val.color : '#475569', cursor: 'pointer', transition: 'all 120ms ease-out' }}
                  >
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: val.color, flexShrink: 0 }} />
                    {card.title}
                  </button>
                )
              })}
            </div>
           {!isPhilosophy && <div className="exams-filter-card" style={{ background: 'white', borderTop: '1px solid #e2e8f0', borderBottom: '2px solid #0f172a', padding: '12px 0', marginBottom: 20 }}>
              {caminoExerciseNotice && (
                <div style={{ marginBottom: '14px', borderRadius: '14px', border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', padding: '10px 12px', fontSize: '12px', fontWeight: 760, lineHeight: 1.45 }}>
                  {caminoExerciseNotice}
                </div>
              )}
              <div className="exams-filter-bar">
                <FilterDropdown
                  label="Año"
                  value={String(anioSeleccionado ?? aniosDisponibles[examenIdx] ?? 'Año')}
                  options={yearFilterOptions}
                />
                <div className="exams-filter-divider" />
                <FilterDropdown
                  label="Convocatoria"
                  value={tipo}
                  options={convocatoriaFilterOptions}
                />
                {versionFilterOptions.length > 1 && (
                  <>
                    <div className="exams-filter-divider" />
                    <FilterDropdown
                      label={asignatura === 'historia' || asignatura === 'ingles' || asignatura === 'biologia' ? 'Sesión' : 'Versión'}
                      value={versionExamenSeleccionada ?? 'Única'}
                      options={versionFilterOptions}
                    />
                  </>
                )}
                {questionFilterOptions.length > 0 && (
                  <>
                    <div className="exams-filter-divider" />
                    <FilterDropdown
                      label={isCatalunaExam ? 'Ejercicio' : 'Pregunta'}
                      value={questionFilterValue}
                      options={questionFilterOptions}
                    />
                  </>
                )}
                {!isCatalunaExam && opcionesDisponibles.length > 0 && (
                  <>
                    <div className="exams-filter-divider" />
                    <div className="exams-option-group">
                      <span className="exam-option-label">Opción</span>
                      {opcionesDisponibles.map(op => (
                        <button
                          type="button"
                          className={`exam-option-button ${opcion === op ? 'is-active' : ''}`}
                          key={op}
                          onClick={() => { setOpcion(op); reset() }}
                        >
                          {op === 0 ? 'A' : 'B'}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {isCatalunaMates && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ejerciciosDisponiblesCat.map((pregunta, i) => {
                    const label = pregunta.opcion
                      ? `Ej. ${pregunta.ejercicio} · Opción ${pregunta.opcion}`
                      : `Ejercicio ${pregunta.ejercicio} · ${pregunta.tema}`
                    return (
                      <button
                        className={catEjercicioIdx === i ? 'campus-primary' : 'campus-hover'}
                        key={`${pregunta.ejercicio}-${pregunta.opcion ?? 'unica'}`}
                        onClick={() => setCatEjercicioIdx(i)}
                        style={{
                          ...hoverVars(cfg.color, cfg.light, cfg.accent),
                          padding: '6px 14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: catEjercicioIdx === i ? cfg.color : WARM.field,
                          color: catEjercicioIdx === i ? '#fff' : WARM.muted,
                          border: catEjercicioIdx === i ? 'none' : '1px solid #dbe7fb'
                        } as CSSProperties}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}
              {isCatalunaFisica && ejerciciosFisicaCataluna.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ejerciciosFisicaCataluna.map((ejercicio, i) => (
                    <button
                      className={catFisicaEjercicioIdx === i ? 'campus-primary' : 'campus-hover'}
                      key={ejercicio.numero}
                      onClick={() => setCatFisicaEjercicioIdx(i)}
                      style={{
                        ...hoverVars(cfg.color, cfg.light, cfg.accent),
                        padding: '6px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: catFisicaEjercicioIdx === i ? cfg.color : WARM.field,
                        color: catFisicaEjercicioIdx === i ? '#fff' : WARM.muted,
                        border: catFisicaEjercicioIdx === i ? 'none' : '1px solid #dbe7fb'
                      } as CSSProperties}
                    >
                      Ejercicio {ejercicio.numero} · {ejercicio.bloque ?? ejercicio.titulo}
                    </button>
                  ))}
                </div>
              )}
              {(isCatalunaQuimica || isCatalunaLengua) && ejerciciosAsignaturaCataluna.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ejerciciosAsignaturaCataluna.map((ejercicio, i) => (
                    <button
                      className={catAsignaturaEjercicioIdx === i ? 'campus-primary' : 'campus-hover'}
                      key={ejercicio.id}
                      onClick={() => setCatAsignaturaEjercicioIdx(i)}
                      style={{
                        ...hoverVars(cfg.color, cfg.light, cfg.accent),
                        padding: '6px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: catAsignaturaEjercicioIdx === i ? cfg.color : WARM.field,
                        color: catAsignaturaEjercicioIdx === i ? '#fff' : WARM.muted,
                        border: catAsignaturaEjercicioIdx === i ? 'none' : '1px solid #dbe7fb'
                      } as CSSProperties}
                    >
                      {ejercicio.titulo}
                    </button>
                  ))}
                </div>
              )}
              {isCatalunaHistoria && ejerciciosCatalunaHistoria.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ejerciciosCatalunaHistoria.map((ejercicio: any, i: number) => { // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    const labels: Record<string, string> = {
                      analisis_fuentes: 'Análisis crítico de fuentes',
                      redaccion_terminos: 'Redacción con términos históricos',
                      exposicion_tema: 'Expón un tema',
                      test: 'Test'
                    }
                    const label = labels[ejercicio.tipo]
                    return (
                      <button
                        className={catHistoriaEjercicioIdx === i ? 'campus-primary' : 'campus-hover'}
                        key={ejercicio.numero}
                        onClick={() => setCatHistoriaEjercicioIdx(i)}
                        style={{
                          ...hoverVars(cfg.color, cfg.light, cfg.accent),
                          padding: '6px 14px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: 700,
                          background: catHistoriaEjercicioIdx === i ? cfg.color : WARM.field,
                          color: catHistoriaEjercicioIdx === i ? '#fff' : WARM.muted,
                          border: catHistoriaEjercicioIdx === i ? 'none' : '1px solid #dbe7fb'
                        } as CSSProperties}
                      >
                        Ejercicio {ejercicio.numero}{label ? ` · ${label}` : ''}
                      </button>
                    )
                  })}
                </div>
              )}
              {!isCatalunaExam && (asignatura === 'historia' || asignatura === 'lengua' || asignatura === 'ingles' || asignatura === 'biologia') && versionesExamenDisponibles.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{asignatura === 'historia' || asignatura === 'ingles' || asignatura === 'biologia' ? 'Sesión:' : 'Versión:'}</span>
                  {versionesExamenDisponibles.map((version, i) => (
                    <button
                      className={diaHistoriaIdx === i ? 'campus-primary' : 'campus-hover'}
                      key={version}
                      onClick={() => {
                        setDiaHistoriaIdx(i)
                        setBloqueIdx(0)
                        setOpcion(0)
                        reset()
                      }}
                      style={{
                        ...hoverVars(cfg.color, cfg.light, cfg.accent),
                        padding: '6px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: 700,
                        background: diaHistoriaIdx === i ? cfg.color : WARM.field,
                        color: diaHistoriaIdx === i ? '#fff' : WARM.muted,
                        border: diaHistoriaIdx === i ? 'none' : '1px solid #dbe7fb'
                      } as CSSProperties}
                    >
                      {version}
                    </button>
                  ))}
                </div>
              )}
              {!isCatalunaExam && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {isMadridMathStyle ? bloquesMates.map((bloque: string, i: number) => (
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => cambiarBloqueMates(i, bloque)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as CSSProperties}>{i + 1}. {bloque} · {puntosBloqueMates(bloque)}pts</button>
                )) : (asignatura === 'fisica' ? TIPOS_FISICA : asignatura === 'quimica' ? bloquesQuimica : asignatura === 'biologia' ? bloquesBiologia : asignatura === 'lengua' ? bloquesLengua : asignatura === 'ingles' ? bloquesIngles : bloquesHistoria).map((t: any, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => { asignatura === 'fisica' ? cambiarBloqueFisica(i, t.tipo) : asignatura === 'quimica' ? cambiarBloqueQuimica(i, t.tipo) : asignatura === 'biologia' ? cambiarBloqueBiologia(i, t.tipo) : setBloqueIdx(i); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as CSSProperties}>{t.label} · {asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : asignatura === 'quimica' ? puntosBloqueQuimica(t.tipo) : asignatura === 'biologia' ? puntosBloqueBiologia(t.tipo) : (t as any).pts}pts</button> // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                ))}
              </div>}
              {!isCatalunaExam && opcionesDisponibles.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: WARM.muted, fontWeight: 700 }}>Opción:</span>
                  {opcionesDisponibles.map(op => (
                    <button className={opcion === op ? 'campus-primary' : 'campus-hover'} key={op} onClick={() => { setOpcion(op); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', background: opcion === op ? cfg.color : WARM.field, color: opcion === op ? '#fff' : WARM.ink, border: opcion === op ? 'none' : '1px solid #dbe7fb' } as CSSProperties}>{op === 0 ? 'A' : 'B'}</button>
                  ))}
                </div>
              )}
            </div>}

            <div className="exams-workspace pau-reveal pau-reveal-delay-3">
              <div className="exams-main-column">

            {isPhilosophy && <PhilosophyExamWorkspace ccaa={ccaa} />}

            {(isCatalunaQuimica || isCatalunaLengua) && (
              <div className="mb-6 grid gap-5">
                {(examenQuimicaCatalunaActivo || examenLenguaCatalunaActivo) && ejercicioAsignaturaCatalunaActivo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '24px', border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color, padding: '16px 18px', fontSize: '14px', fontWeight: 800, boxShadow: '0 12px 28px rgba(37,99,235,0.06)' }}>
                      <ClipboardList size={18} />
                      {(examenQuimicaCatalunaActivo ?? examenLenguaCatalunaActivo)?.instrucciones}
                    </div>
                    <CatEjercicioCard
                      key={`${(examenQuimicaCatalunaActivo ?? examenLenguaCatalunaActivo)?.id}-${ejercicioAsignaturaCatalunaActivo.id}`}
                      asignatura={isCatalunaQuimica ? 'quimica' : 'lengua'}
                      asignaturaLabel={isCatalunaQuimica ? 'Química PAU Cataluña' : 'Lengua Castellana PAU Cataluña'}
                      examen={(examenQuimicaCatalunaActivo ?? examenLenguaCatalunaActivo)!}
                      ejercicio={ejercicioAsignaturaCatalunaActivo}
                      colorScheme={{ color: cfg.color, accent: cfg.accent, light: cfg.light, border: cfg.soft }}
                    />
                  </>
                ) : (
                  <EmptyQuestionsState subject={asignatura} />
                )}
              </div>
            )}

            {isCatalunaFisica && (
              <div className="mb-6 grid gap-5">
                {examenFisicaCatalunaActivo && ejercicioFisicaCatalunaActivo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '24px', border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color, padding: '16px 18px', fontSize: '14px', fontWeight: 800, boxShadow: '0 12px 28px rgba(37,99,235,0.06)' }}>
                      <ClipboardList size={18} />
                      {examenFisicaCatalunaActivo.instrucciones}
                    </div>
                    <CatFisicaEjercicioCard
                      key={`${examenFisicaCatalunaActivo.id}-${ejercicioFisicaCatalunaActivo.numero}`}
                      examen={examenFisicaCatalunaActivo}
                      ejercicio={ejercicioFisicaCatalunaActivo}
                    />
                  </>
                ) : (
                  <EmptyQuestionsState subject="fisica" />
                )}
              </div>
            )}

            {isCatalunaHistoria && (
              <div className="mb-6 grid gap-5">
                {examenCatalunaActivo ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderRadius: '24px', border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color, padding: '16px 18px', fontSize: '14px', fontWeight: 800, boxShadow: '0 12px 28px rgba(37,99,235,0.06)' }}>
                      <ClipboardList size={18} />
                      Selecciona un ejercicio para practicarlo individualmente.
                    </div>
                    {ejercicioCatalunaHistoriaActivo ? (
                      <CatHistoriaEjercicioCard
                        key={ejercicioCatalunaHistoriaActivo.numero}
                        ejercicio={ejercicioCatalunaHistoriaActivo}
                        contexto={`PAU Cataluña Historia ${examenCatalunaActivo.anio} - ${examenCatalunaActivo.serie}`}
                      />
                    ) : (
                      <EmptyQuestionsState subject="historia" />
                    )}
                  </>
                ) : (
                  <EmptyQuestionsState subject="historia" />
                )}
              </div>
            )}

            {isCatalunaMates && (
              <div className="mb-6 grid gap-5">
                {preguntaCatActiva && <CatPreguntaCard key={preguntaCatActiva.id} pregunta={preguntaCatActiva} />}
                {!preguntaCatActiva && (
                  <EmptyQuestionsState subject="mates" />
                )}
              </div>
            )}

            {!isCatalunaExam && !preguntaActiva && (
              <EmptyQuestionsState subject={asignatura} />
            )}

            {!isCatalunaExam && preguntaActiva && (
             <div className="exams-question-card" key={preguntaActivaKey} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 22 }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', whiteSpace: 'nowrap' }}>{examSystemLabel(ccaa)} {examenActivo?.año} · {tipo}</span>
                    {bloqueActivoLabel && <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color, whiteSpace: 'nowrap' }}>{bloqueActivoLabel}</span>}
                    {asignatura === 'historia' && diaHistoriaSeleccionado && (
                      <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color }}>{diaHistoriaSeleccionado}</span>
                    )}
                    {(asignatura === 'lengua' || asignatura === 'ingles' || asignatura === 'biologia') && versionExamenSeleccionada && (
                      <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, border: '1px solid ' + cfg.soft, background: cfg.light, color: cfg.color }}>{versionExamenSeleccionada}</span>
                    )}
                    <span style={{ fontSize: 9, fontWeight: 600, color: '#94a3b8' }}>
                      {asignatura === 'lengua' ? 'Versión' : asignatura === 'ingles' || asignatura === 'biologia' ? 'Sesión' : 'Opción'} {opcionMostrada}
                    </span>
                    <span style={{ marginLeft: 'auto', background: '#0f172a', color: 'white', fontSize: 11, fontWeight: 900, padding: '4px 12px', borderRadius: 999, whiteSpace: 'nowrap' }}>{formatPts(puntuacionPreguntaActiva)} pts</span>
                  </div>
                  {bloqueActivoLabel && <p style={{ marginTop: 8, fontSize: 18, fontWeight: 900, color: '#0f172a', lineHeight: 1.2 }}>{bloqueActivoLabel}</p>}
                </div>
                <div style={{ padding: 18, overflowY: 'auto' }}>
                  {!preguntaActivaIncompleta && asignatura === 'ingles' && (preguntaActiva as any)?.texto_fuente && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '18px', padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Text</div>
                      <ExamStatement
                        key={`${preguntaActivaKey}-texto`}
                        text={(preguntaActiva as any).texto_fuente} // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                        format={false}
                        components={mdComponents}
                        storageKey={fuenteStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode
                      />
                    </div>
                  )}
                  {asignatura === 'ingles' && (
                    <div style={{ padding: '20px 22px', borderRadius: '22px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 14px 34px rgba(37,99,235,0.07)', marginBottom: '18px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Question</div>
                      <ExamStatement
                        key={`${preguntaActivaKey}-enunciado`}
                        text={enunciadoActivo}
                        format="raw"
                        components={mdComponents}
                        storageKey={enunciadoStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode
                      />
                    </div>
                  )}
                  {!preguntaActivaIncompleta && (asignatura === 'historia' || (asignatura === 'lengua' && bloqueIdx > 0)) && (preguntaActiva as any)?.texto_fuente && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '18px', padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Texto fuente oficial</div>
                      <ExamStatement
                        text={(preguntaActiva as any).texto_fuente} // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                        components={mdComponents}
                        storageKey={fuenteStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode={asignatura === 'lengua'}
                      />
                    </div>
                  )}
                  {!preguntaActivaIncompleta && asignatura === 'historia' && (preguntaActiva as any).imagen_url && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Documento visual</div>
                      <img
                        src={(preguntaActiva as any).imagen_url} // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                        alt="Fuente histórica"
                        className="max-w-full rounded-2xl border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                  {!preguntaActivaIncompleta && asignatura === 'historia' && (preguntaActiva as any).imagenFuente && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Fuente histórica oficial</div>
                      <img src={(preguntaActiva as { imagenFuente?: string }).imagenFuente} alt="Fuente histórica oficial" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', display: 'block' }} />
                    </div>
                  )}
                  {!preguntaActivaIncompleta && Array.isArray((preguntaActiva as any).imagenes) && (preguntaActiva as any).imagenes.length > 0 && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                      {(preguntaActiva as any).imagenes.map((src: string, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                        <img key={src} src={src} alt={`Imagen oficial ${i + 1}`} style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '18px', border: '1px solid #e5edf9', background: '#fff' }} />
                      ))}
                    </div>
                  )}
                  {!preguntaActivaIncompleta && asignatura === 'historia' && (preguntaActiva as any).conceptos && ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                    <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(preguntaActiva as any).conceptos.map((c: string, i: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any -- Datos de examen: shape heterogéneo por asignatura — interfaz Pregunta unificada introduce riesgo de regresión
                        <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: cfg.light, color: cfg.color, border: '1px solid ' + cfg.accent, fontSize: '12px', fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {asignatura !== 'ingles' && (
                    <div>
                      <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', color: '#94a3b8', marginBottom: 8 }}>Enunciado</div>
                      {preguntaActivaIncompleta ? (
                        <div style={{ padding: '22px', borderRadius: '18px', background: cfg.light, border: '1px solid ' + cfg.soft, color: '#334155' }}>
                          <div style={{ fontSize: '17px', fontWeight: 850, color: cfg.color, marginBottom: '8px' }}>Ejercicio en preparación</div>
                          <div style={{ fontSize: '15px', lineHeight: 1.6, fontWeight: 650 }}>Estamos terminando de adaptar este contenido.</div>
                          <div style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.5, color: '#64748b', fontWeight: 650 }}>Prueba otro ejercicio mientras tanto.</div>
                        </div>
                      ) : (
                        <ExamStatement
                          text={enunciadoActivo}
                          format="raw"
                          components={mdComponents}
                          storageKey={enunciadoStorageKey}
                          accentColor={cfg.color}
                          softColor={cfg.light}
                          readingMode={asignatura === 'lengua'}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

           {!isCatalunaExam && preguntaActiva && <div className="exams-answer-card" style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: 22 }}>
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
                {(['texto', 'imagen'] as const).map(m => (
                  <button key={m} onClick={() => setModo(m)} style={{ padding: '10px 16px', fontSize: 12, fontWeight: 700, color: modo === m ? '#2563eb' : '#94a3b8', borderBottom: modo === m ? '2px solid #2563eb' : '2px solid transparent', marginBottom: -1, background: 'none', border: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: modo === m ? '#2563eb' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {m === 'texto' ? <PenLine size={13} /> : <Camera size={13} />}{m === 'texto' ? '✏️ Escribir' : '📷 Subir foto'}
                  </button>
                ))}
              </div>
              {/* Content */}
              <div style={{ padding: '0 16px' }}>
                {modo === 'texto' ? (
                  <RichTextArea
                    value={respuesta}
                    onChange={setRespuesta}
                    placeholder="Empieza a resolver el problema aquí..."
                    minHeight={asignatura === 'historia' || asignatura === 'lengua' ? 280 : 110}
                    accentColor={cfg.color}
                    softColor={cfg.light}
                    borderColor={cfg.soft}
                    mathSubject={asignatura}
                  />
                ) : (
                  <div style={{ padding: '14px 16px' }}>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleImagen} style={{ display: 'none' }} />
                    {imagenPreview ? (
                      <div style={{ position: 'relative' }}>
                        <img src={imagenPreview} alt="Respuesta" style={{ width: '100%', maxHeight: '260px', objectFit: 'contain', borderRadius: 10, border: '1.5px solid #dbe7fb' }} />
                        <button onClick={() => { setImagen(null); setImagenPreview(null) }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={14} /></button>
                      </div>
                    ) : (
                      <div className="campus-hover" onClick={() => fileRef.current?.click()} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), height: 160, borderRadius: 10, border: '2px dashed ' + cfg.accent, background: cfg.light + '40', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as CSSProperties}>
                        <UploadCloud size={30} color={cfg.color} />
                        <p style={{ fontSize: 13, fontWeight: 600, color: cfg.color, margin: '8px 0 3px' }}>Haz una foto o sube una imagen</p>
                        <p style={{ fontSize: 11, color: cfg.accent, margin: 0 }}>Fotografía tu respuesta manuscrita</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* Footer row */}
              <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button className="campus-primary exams-correct-button" onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '9px 20px', borderRadius: 10, border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', background: cargando ? '#94a3b8' : '#2563eb', color: '#fff', fontSize: 13, fontWeight: 800, opacity: (cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)) ? 0.5 : 1, boxShadow: cargando ? 'none' : '0 4px 16px rgba(37,99,235,.3)', display: 'flex', alignItems: 'center', gap: 7 }}>
                  {cargando ? <KairoLoadingDot /> : <WandSparkles size={15} />}{cargando ? 'Corrigiendo con Kairo...' : 'Corregir con Kairo'}
                </button>
              </div>
            </div>}

            {!isCatalunaExam && (correccion || streamText || cargando) && (
              <div style={{ borderRadius: '24px', border: '1.5px solid var(--pau-lilac-border)', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(255,255,255,0.97), rgba(238,232,255,0.48))', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(124,58,237,0.08), 0 1px 4px rgba(124,58,237,0.04)' }}>
                <div style={{ padding: '14px 22px', background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><WandSparkles size={16} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px', letterSpacing: '-0.01em' }}>Corrección de Kairo</span>
                </div>
                <div style={{ padding: '24px', fontSize: '0.925rem', lineHeight: '1.75' }}>
                  {!correccion && (streamText || cargando) ? (
                    <SafeProgressiveCorrectionStream text={streamText} isContinuing={continuingCorrection} stage={correctionStage} />
                  ) : (
                    <CorrectionResultCard
                      correction={correccion}
                      officialMaxScore={puntuacionPreguntaActiva}
                      components={mdComponents}
                    />
                  )}
                  {truncated && (
                    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 12, background: '#fef3c7', border: '1.5px solid #fcd34d', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#92400e' }}>Respuesta incompleta</p>
                        <p style={{ margin: '4px 0 8px', fontSize: 12.5, color: '#b45309', lineHeight: 1.4 }}>La corrección se ha cortado antes de terminar. No la hemos guardado en Historial para evitar guardar una explicación incompleta.</p>
                        <p style={{ margin: '0 0 8px', fontSize: 12.5, color: '#b45309', lineHeight: 1.4 }}>Puedes reintentar con la misma respuesta o imagen; si vuelve a pasar, prueba con una foto más concreta.</p>
                        <button
                          onClick={corregir}
                          style={{ fontSize: 12.5, fontWeight: 700, color: '#92400e', background: '#fde68a', border: '1px solid #fcd34d', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' }}
                        >
                          Reintentar corrección
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
              </div>

              <aside className="exams-ai-panel" aria-label="Panel de feedback de Kairo">
                <div className="exams-side-card">

                  {/* ── Nota estimada ── */}
                  {(() => {
                    const parts = correctionScoreLabel !== '--' ? correctionScoreLabel.split('/') : null
                    const ratio = parts ? parseFloat(parts[0]) / parseFloat(parts[1]) : null
                    return (
                      <div style={{ padding: 16, borderBottom: '1px solid #f1f5f9', background: '#fafbfc' }}>
                        <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94a3b8', marginBottom: 6 }}>Nota estimada</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                          <span style={{ fontSize: 32, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                            {correccion ? (parts?.[0] ?? '--') : cargando ? '…' : '--'}
                          </span>
                          {parts && <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>/{parts[1]}</span>}
                          {!parts && !cargando && (
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#cbd5e1' }}>/pts</span>
                          )}
                        </div>
                        <div style={{ height: 4, borderRadius: 999, background: '#f1f5f9', marginTop: 10, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: ratio !== null ? `${Math.min(ratio * 100, 100).toFixed(0)}%` : '0%', background: 'linear-gradient(90deg,#2563eb,#60a5fa)', borderRadius: 999, transition: 'width 700ms cubic-bezier(0.4,0,0.2,1)' }} />
                        </div>
                        {!correccion && (
                          <p style={{ margin: '8px 0 0', fontSize: 11, color: '#94a3b8', lineHeight: 1.5 }}>
                            {cargando ? 'Calculando con la rúbrica oficial…' : 'Resuelve el ejercicio y Kairo te dará feedback.'}
                          </p>
                        )}
                      </div>
                    )
                  })()}

                  {/* ── Puntos fuertes ── */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', color: '#15803d', marginBottom: 10 }}>Puntos fuertes</div>
                    {correctionFuertes.length > 0 ? correctionFuertes.map((point, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#dcfce7', color: '#16a34a', fontSize: 8, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>✓</div>
                        <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.55 }}>{point}</span>
                      </div>
                    )) : (
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                        {cargando ? 'Analizando…' : 'Aquí aparecerán tus puntos fuertes.'}
                      </p>
                    )}
                  </div>

                  {/* ── Errores a corregir ── */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', color: '#b91c1c', marginBottom: 10 }}>Errores a corregir</div>
                    {correctionErrores.length > 0 ? correctionErrores.map((err, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 16, height: 16, borderRadius: '50%', display: 'grid', placeItems: 'center', background: '#fee2e2', color: '#dc2626', fontSize: 8, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>!</div>
                        <span style={{ fontSize: 12, color: '#334155', lineHeight: 1.55 }}>{err}</span>
                      </div>
                    )) : (
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>
                        {cargando ? 'Revisando…' : 'Aquí verás qué debes corregir.'}
                      </p>
                    )}
                  </div>

                  {/* ── Bloque asociado ── */}
                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', color: '#94a3b8', marginBottom: 10 }}>Bloque asociado</div>
                    {!isCatalunaExam && preguntaActiva ? (
                      <>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 999, background: '#eff6ff', color: '#1d4ed8', fontSize: 11, fontWeight: 800, border: '1px solid #bfdbfe' }}>
                          📐 {bloqueActivoLabel}
                        </div>
                        <a href="/camino" style={{ display: 'block', marginTop: 8, fontSize: 11, fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>Ver material de repaso →</a>
                      </>
                    ) : (
                      <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>Selecciona un ejercicio para ver el bloque asociado.</p>
                    )}
                  </div>

                  {/* ── Sesión activa ── */}
                  <div style={{ margin: '0 16px 16px', marginTop: 16, padding: '10px 12px', background: '#f0fdf4', borderRadius: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d' }}>Sesión activa</div>
                      <div style={{ fontSize: 10, color: '#86efac', marginTop: 1 }}>
                        {respuesta.trim() || imagen ? 'Respuesta en progreso' : 'Empieza con el enunciado actual'}
                      </div>
                    </div>
                  </div>

                </div>
              </aside>
            </div>

            <footer className="exams-footer">
              <div>
                <strong style={{ color: '#111827' }}>Kairo</strong>
                <span style={{ marginLeft: 8 }}>Preparación EBAU de alto rendimiento.</span>
              </div>
              <div className="exams-footer-links" aria-label="Enlaces informativos">
                <a href="/legal/privacidad" style={{ color: '#6b7280', textDecoration: 'none' }}>Privacidad</a>
                <a href="/legal/terminos" style={{ color: '#6b7280', textDecoration: 'none' }}>Términos</a>
                <span>Metodología</span>
                <a href="/contacto" style={{ color: '#6b7280', textDecoration: 'none' }}>Contacto</a>
              </div>
            </footer>
          </main>
          </>
        )}

        {seccion === 'chat' && (
          /* V2 La Sala — full-width with photo hero + controls bar */
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100vh', background: 'white' }}>

            {/* Photo hero */}
            <div style={{ position: 'relative', height: 200, flexShrink: 0, overflow: 'hidden' }}>
              <img src={SUBJECT_HERO_IMGS[asignatura] ?? BOOKS_IMG} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(.45) saturate(.75)', transition: 'opacity 400ms ease' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,.85) 0%, rgba(15,23,42,.3) 55%, transparent 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 32px' }}>
                <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#93c5fd', marginBottom: 8 }}>Chat con Kairo · {examSystemLabel(ccaa)}</div>
                <div style={{ fontSize: 38, fontWeight: 900, color: 'white', letterSpacing: '-.04em', lineHeight: .9, marginBottom: 10 }}>Tutor<br />Inteligente</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CHAT_SUBJECTS.map(key => {
                    const card = SUBJECT_CARDS[key]
                    const isActive = asignatura === key
                    return (
                      <button key={key} type="button" onClick={() => cambiarAsignatura(key)} style={{ padding: '5px 12px', borderRadius: 999, border: isActive ? '1px solid rgba(147,197,253,.5)' : '1px solid rgba(255,255,255,.18)', background: isActive ? 'rgba(37,99,235,.5)' : 'rgba(255,255,255,.08)', color: isActive ? 'white' : 'rgba(255,255,255,.7)', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(8px)', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit' }}>
                        {card.title}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Tutor intro card */}
            <div style={{ padding: '12px 28px 0' }}>
              <SectionIntroCard
                hintKey="hint_tutor"
                line1="Pregúntale a Kairo lo que no entiendes, como si fuera un profesor."
                line2="Explica, da ejemplos y resuelve dudas concretas. Para cuando estás atascado y necesitas entender el porqué."
              />
            </div>

            {/* Controls bar */}
            <div style={{ background: 'white', borderBottom: '2px solid #0f172a', padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.14em', color: '#94a3b8', marginRight: 4, whiteSpace: 'nowrap' }}>Asignatura</span>
              {CHAT_SUBJECTS.map(key => {
                const val = ASIGNATURAS[key]
                const card = SUBJECT_CARDS[key]
                const isActive = asignatura === key
                return (
                  <button key={key} type="button" onClick={() => cambiarAsignatura(key)} style={{ padding: '5px 12px', borderRadius: 999, border: isActive ? '1.5px solid #2563eb' : '1px solid #e2e8f0', background: isActive ? '#eff6ff' : 'white', fontSize: 12, fontWeight: 700, color: isActive ? '#2563eb' : '#475569', cursor: 'pointer', transition: 'all 100ms', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: val.color, flexShrink: 0, display: 'inline-block' }} />
                    {card.title}
                  </button>
                )
              })}
            </div>

            {/* Messages scroll area */}
            <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
              <div style={{ maxWidth: 820, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', flex: 1 }}>

                {mensajes.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '40px 20px' }}>
                    <div className="chat-avatar-pulse" style={{ margin: '0 auto 28px', display: 'inline-flex', padding: '18px 32px', background: '#0f172a', borderRadius: 20, border: '1px solid rgba(37,99,235,.28)' }}>
                      <img src="/brand/kairo-logo-new.png" alt="Kairo" style={{ height: 46, width: 'auto', display: 'block' }} />
                    </div>
                    <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.24em', color: '#94a3b8', textTransform: 'uppercase' }}>Hola, soy</p>
                    <h2 style={{ margin: '0 0 18px', fontSize: 46, fontWeight: 900, color: '#2563eb', letterSpacing: '-0.045em', lineHeight: 1, textShadow: '0 0 32px rgba(37,99,235,.3)' }}>Kairo</h2>
                    <p style={{ margin: '0 0 18px', fontSize: 15, color: '#64748b', maxWidth: 340, lineHeight: 1.65, fontWeight: 450 }}>
                      Tu IA de estudio para la {examSystemLabel(ccaa)}.<br />Pregúntame cualquier cosa.
                    </p>
                  </div>
                )}

                {mensajes.map((msg, i) => (
                  msg.rol === 'kairo' ? (
                    <div key={i} className="chat-msg-ai" style={{ padding: '10px 0' }}>
                      <div style={{ borderRadius: 22, padding: '20px 22px', background: 'white', border: '1px solid #e8eef7', boxShadow: '0 4px 20px rgba(15,23,42,.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                          <KairoBrand variant="mark" size="sm" style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 10, fontWeight: 900, color: '#2563eb', marginBottom: 10, letterSpacing: '.12em', textTransform: 'uppercase' }}>Kairo</div>
                            {(() => {
                              const isStreamingMessage = cargandoChat && i === mensajes.length - 1
                              if (isStreamingMessage) {
                                return (
                                  <div style={{ fontSize: 14, lineHeight: 1.85, color: '#334155' }}>
                                    <MathMarkdown text={msg.texto} isStreaming components={darkMdComponents} />
                                  </div>
                                )
                              }
                              const { main, why } = splitWhyExplanationMarkdown(msg.texto)
                              return (
                                <>
                                  <div style={{ fontSize: 14, lineHeight: 1.85, color: '#334155' }}>
                                    <MathMarkdown text={main} format={false} components={darkMdComponents} />
                                  </div>
                                  <WhyExplanation markdown={why} components={darkMdComponents} />
                                </>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={i} className="chat-msg-user" style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 0' }}>
                      <div style={{ maxWidth: '65%', padding: '13px 18px', borderRadius: '22px 22px 5px 22px', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: 'white', fontSize: 14, fontWeight: 600, lineHeight: 1.65, boxShadow: '0 8px 24px rgba(37,99,235,.22)' }}>
                        {msg.texto}
                      </div>
                    </div>
                  )
                ))}

                {cargandoChat && mensajes[mensajes.length - 1]?.texto === '' && (
                  <div className="chat-msg-ai" style={{ padding: '16px 0' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <KairoBrand variant="mark" size="sm" style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0 }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingTop: 10 }}>
                        <span className="chat-dot-1" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
                        <span className="chat-dot-2" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
                        <span className="chat-dot-3" style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2563eb' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Input zone */}
            <div style={{ flexShrink: 0, background: 'linear-gradient(to top, white 60%, transparent)', padding: '12px 28px 20px' }}>
              <div style={{ maxWidth: 820, margin: '0 auto' }}>
                <div style={{ borderTop: '1px solid #e2e8f0', marginBottom: 12 }} />
                <div className="chat-input-wrap">
                  <textarea ref={chatInputRef} value={inputChat} onChange={e => setInputChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat() } }} placeholder="Pregunta lo que quieras a Kairo..." rows={1} style={{ flex: 1, minHeight: 40, maxHeight: 180, border: 'none', outline: 'none', fontSize: 14, lineHeight: '24px', resize: 'none', overflowY: 'hidden', background: 'transparent', color: '#0f172a', fontFamily: 'inherit', padding: '8px 4px 8px 0', boxSizing: 'border-box', scrollbarWidth: 'thin' as const }} />
                  <button className="chat-send-btn" onClick={enviarChat} disabled={!inputChat.trim() || cargandoChat}>
                    {cargandoChat ? <KairoLoadingDot /> : <SendHorizontal size={15} />}
                    {cargandoChat ? 'Pensando...' : 'Enviar'}
                  </button>
                </div>
                <p style={{ textAlign: 'center', fontSize: 10, color: '#94a3b8', marginTop: 8, letterSpacing: '.02em' }}>Enter para enviar · Shift+Enter para nueva línea</p>
              </div>
            </div>
          </div>
        )}

        {seccion === 'historial' && (
          <main className="history-screen">
            <div className="history-shell">
              <div className="history-hero">
                <img
                  src={historialSubjectFilter === 'todas' ? STUDY_DESK_IMG : (SUBJECT_HERO_IMGS[historialSubjectFilter] ?? STUDY_DESK_IMG)}
                  alt=""
                />
                <div className="history-hero-overlay">
                  <div>
                    <div className="history-hero-eyebrow">Historial · {examSystemLabel(ccaa)}</div>
                    <div className="history-hero-title">
                      {historialSubjectFilter === 'todas' ? 'Todas las asignaturas' : ASIGNATURAS[historialSubjectFilter].label}
                    </div>
                    <div className="history-hero-sub">
                      {historialSubjectFilter === 'todas' ? 'Todas tus correcciones guardadas' : nombreAsignatura(historialSubjectFilter)}
                    </div>
                  </div>
                  {(() => {
                    const count = historialTabItems.filter(item => historialSubjectFilter === 'todas' || item.asignatura === historialSubjectFilter).length
                    return (
                      <div className="history-hero-count">
                        {count} {count === 1 ? 'corrección analizada' : 'correcciones analizadas'}
                      </div>
                    )
                  })()}
                </div>
              </div>

              <header className="history-topbar">
                <div>
                  <h1>Historial de correcciones</h1>
                  <p>Explora tu progreso y repasa cada corrección para seguir mejorando.</p>
                  <div className="history-tabs">
                    <button type="button" className={`history-tab ${historialTab === 'todas' ? 'is-active' : ''}`} onClick={() => setHistorialTab('todas')}>Todas</button>
                    <button type="button" className={`history-tab ${historialTab === 'guardadas' ? 'is-active' : ''}`} onClick={() => setHistorialTab('guardadas')}>Guardadas</button>
                  </div>
                </div>
                <div className="history-actions">
                  <button type="button" className="history-button history-button-ghost" onClick={exportHistorialCsv}>
                    <Download size={15} /> Exportar
                  </button>
                  <button
                    type="button"
                    className={`history-button history-button-primary ${historialFiltersOpen ? 'is-open' : ''}`}
                    onClick={() => setHistorialFiltersOpen(o => !o)}
                  >
                    <Filter size={15} /> Filtros
                    {hasHistorialFilters && <span className="history-filter-dot" />}
                  </button>
                </div>
              </header>

            {cargandoHistorial ? (
              <div className="history-card history-empty">
                <KairoLoadingDot />
                <p>Cargando historial...</p>
              </div>
            ) : historial.length === 0 ? (
              <div className="history-card history-empty">
                <div className="history-empty-icon"><BarChart3 size={28} /></div>
                <h2>Sin correcciones todavía</h2>
                <p>Cuando corrijas tu primer ejercicio, aparecerá aquí con su nota, asignatura y feedback completo.</p>
              </div>
            ) : (
              <div className="history-overview">
                <section className="history-main">
                  <div className="history-card history-summary-bar">
                    <div className="history-summary-zone history-summary-zone-total">
                      <div className="history-total-copy">
                        <span>Total correcciones</span>
                        <strong>{historialTotalCount ?? historialItems.length}</strong>
                        {historialActividad.mes > 0 && (
                          <small className="history-total-delta"><TrendingUp size={12} /> {historialActividad.mes} este mes</small>
                        )}
                      </div>
                      <div className="history-total-illustration" aria-hidden="true">
                        <svg width="54" height="54" viewBox="0 0 64 64" fill="none">
                          <rect x="9" y="7" width="34" height="46" rx="6" fill="#bfdbfe" transform="rotate(-8 26 30)" />
                          <rect x="15" y="8" width="34" height="46" rx="6" fill="#fff" stroke="#93c5fd" strokeWidth="1.5" />
                          <path d="M21 19h22M21 26h22M21 33h15" stroke="#60a5fa" strokeWidth="2.25" strokeLinecap="round" />
                          <rect x="21" y="40" width="11" height="6" rx="2" fill="#eff6ff" />
                          <circle cx="47" cy="47" r="13.5" fill="#2563eb" />
                          <path d="M41 47l4.2 4.2L54 42.5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>

                    <div className="history-summary-zone">
                      <span className="history-stat-label">Promedio general</span>
                      <div className="history-stat-donut-row">
                        <HistorialDonut value={historialAverage !== null ? Number(historialAverage) : null} size={52} />
                        <strong>{historialAverage ?? '—'}<em>/10</em></strong>
                      </div>
                      {historialPercentil?.percentil != null && (
                        <small className="history-stat-foot">Percentil P{historialPercentil.percentil}</small>
                      )}
                    </div>

                    <div className="history-summary-zone">
                      <span className="history-stat-label">Mejor corrección</span>
                      <strong className="history-stat-big positive">{historialBest ? historialBest.score10.toFixed(1) : '—'}<em>/10</em></strong>
                      {historialBest ? (
                        <>
                          <small className="history-stat-foot">{nombreAsignatura(historialBest.item.asignatura)}</small>
                          <small className="history-stat-foot" style={{ marginTop: 1 }}>
                            {historialBest.item.bloque || historySourceLabel(historialBest.item)}
                            {' · '}
                            {(() => { const d = new Date(historialBest.item.created_at); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) })()}
                          </small>
                        </>
                      ) : (
                        <small className="history-stat-foot">Sin datos suficientes</small>
                      )}
                    </div>

                    <div className="history-summary-zone history-summary-zone-recent">
                      <span className="history-stat-label">Actividad reciente</span>
                      {historialRecentList.length ? historialRecentList.map((item, i) => {
                        const d = new Date(item.created_at)
                        return (
                          <button key={item.id ?? i} type="button" className="history-recent-item" onClick={() => setItemSeleccionado(item)}>
                            <div style={{ minWidth: 0 }}>
                              <b>{item.bloque || nombreAsignatura(item.asignatura)}</b>
                              {item.bloque && (
                                <div className="history-recent-item-subject">{nombreAsignatura(item.asignatura)}</div>
                              )}
                            </div>
                            <span className={
                              (() => { const s = normalizedHistoryScore(item); return s == null ? 'muted' : s >= 7 ? 'good' : s >= 5 ? 'mid' : 'bad' })()
                            }>{historyScoreDisplay(item)}</span>
                            <small>{Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</small>
                          </button>
                        )
                      }) : <small className="history-stat-foot">Sin actividad reciente</small>}
                    </div>
                  </div>

                  <div className="history-subject-row" style={{ gridTemplateColumns: `repeat(${historialSubjectStats.length}, minmax(0, 1fr))` }}>
                    {historialSubjectStats.map(({ subject, config, average, count }) => {
                      const Icon = config.icon
                      const active = historialSubjectFilter === subject
                      const delta = subjectDeltaMap.get(subject) ?? null
                      return (
                        <button
                          key={subject}
                          type="button"
                          className={`history-subject-card ${active ? 'active' : ''}`}
                          style={{ '--subject-color': config.color, '--subject-light': config.light } as CSSProperties}
                          onClick={() => setHistorialSubjectFilter(active ? 'todas' : subject)}
                        >
                          <span className="history-subject-icon"><Icon size={16} /></span>
                          <b>{config.short}</b>
                          <span className="history-subject-score">
                            <strong>{average ?? '—'}<em>/10</em></strong>
                            {delta !== null && delta !== 0 && (
                              delta > 0
                                ? <TrendingUp size={12} className="history-trend-up" />
                                : <TrendingDown size={12} className="history-trend-down" />
                            )}
                          </span>
                          <small>{count} {count === 1 ? 'corrección' : 'correcciones'}</small>
                        </button>
                      )
                    })}
                  </div>

                  {historialFiltersOpen && (
                    <div className="history-filters">
                      <label className="history-input">
                        <SearchX size={16} />
                        <input value={historialSearch} onChange={(e) => setHistorialSearch(e.target.value)} placeholder="Buscar por tema o título..." />
                      </label>
                      <label className="history-select">
                        <span>Asignatura</span>
                        <select value={historialSubjectFilter} onChange={(e) => setHistorialSubjectFilter(e.target.value as Asignatura | 'todas')}>
                          <option value="todas">Todas</option>
                          {HOME_SUBJECTS.map(subject => (
                            <option key={subject} value={subject}>{nombreAsignatura(subject)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="history-select">
                        <span>Fuente</span>
                        <select value={historialSourceFilter} onChange={(e) => setHistorialSourceFilter(e.target.value)}>
                          <option value="todas">Todas</option>
                          {historialSourceOptions.map(source => <option key={source} value={source}>{source}</option>)}
                        </select>
                      </label>
                      <label className="history-select">
                        <span>Fecha</span>
                        <select value={historialDateFilter} onChange={(e) => setHistorialDateFilter(e.target.value as 'todas' | '30' | '90')}>
                          <option value="todas">Todas</option>
                          <option value="30">Últimos 30 días</option>
                          <option value="90">Últimos 90 días</option>
                        </select>
                      </label>
                      <label className="history-select">
                        <span>Ordenar</span>
                        <select value={historialOrder} onChange={(e) => setHistorialOrder(e.target.value as 'recent' | 'oldest' | 'best' | 'worst')}>
                          <option value="recent">Más recientes</option>
                          <option value="oldest">Más antiguas</option>
                          <option value="best">Mejor nota</option>
                          <option value="worst">Más margen</option>
                        </select>
                      </label>
                      {hasHistorialFilters && (
                        <button type="button" className="history-filter-clear" onClick={clearHistorialFilters}>Limpiar filtros</button>
                      )}
                    </div>
                  )}

                  {historialFilteredItems.length === 0 ? (
                    <div className="history-card history-empty history-empty-compact">
                      <Filter size={22} />
                      <h2>No hay correcciones con estos filtros</h2>
                      <p>Prueba a ampliar la fecha, cambiar asignatura o limpiar la búsqueda.</p>
                    </div>
                  ) : (
                    <div className="history-list">
                      {Object.entries(historialGrouped).map(([month, items]) => (
                        <div key={month}>
                          <h2 className="history-month-title">{month}</h2>
                          <div className="history-rows-card">
                          {items.map((item, i) => {
                            const itemCfg = ASIGNATURAS[item.asignatura as Asignatura] ?? ASIGNATURAS.historia
                            const score10 = normalizedHistoryScore(item)
                            const date = new Date(item.created_at)
                            const rowKey = item.id ?? `${item.created_at}-${i}`
                            return (
                              <div
                                key={rowKey}
                                role="button"
                                tabIndex={0}
                                className="history-row"
                                onClick={() => setItemSeleccionado(item)}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setItemSeleccionado(item) }}
                                style={{ '--subject-color': itemCfg.color, '--subject-light': itemCfg.light } as CSSProperties}
                              >
                                <span className="history-row-date">
                                  <b>{Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('es-ES', { day: '2-digit' })}</b>
                                  <small>{Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('es-ES', { month: 'short' })}</small>
                                </span>
                                <span className="history-row-main">
                                  <small>{nombreAsignatura(item.asignatura)}</small>
                                  <strong>{item.bloque || 'Corrección guardada'}</strong>
                                </span>
                                <span className="history-row-source">{historySourceLabel(item)}</span>
                                <span className={`history-row-score ${score10 == null ? 'muted' : score10 >= 7 ? 'good' : score10 >= 5 ? 'mid' : 'bad'}`}>
                                  {historyScoreDisplay(item)}
                                </span>
                                <button
                                  type="button"
                                  className="history-row-view"
                                  onClick={(e) => { e.stopPropagation(); setItemSeleccionado(item) }}
                                >
                                  <Eye size={13} /> Ver corrección
                                </button>
                                <div className="history-row-menu-wrap">
                                  <button
                                    type="button"
                                    className="history-row-menu-btn"
                                    aria-label="Más opciones"
                                    onClick={(e) => { e.stopPropagation(); setHistorialRowMenuOpenId(historialRowMenuOpenId === rowKey ? null : rowKey) }}
                                  >
                                    <MoreVertical size={15} />
                                  </button>
                                  {historialRowMenuOpenId === rowKey && (
                                    <>
                                      <div className="history-row-menu-backdrop" onClick={(e) => { e.stopPropagation(); setHistorialRowMenuOpenId(null) }} />
                                      <div className="history-row-menu" onClick={(e) => e.stopPropagation()}>
                                        <button type="button" onClick={() => { setItemSeleccionado(item); setHistorialRowMenuOpenId(null) }}>
                                          <Eye size={14} /> Ver corrección
                                        </button>
                                        <button type="button" onClick={() => { setHistorialRowMenuOpenId(null); abrirChatConContexto(item) }}>
                                          <MessageCircle size={14} /> Preguntar a Kairo
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                <aside className="history-side">
                  <div className="history-card history-side-card">
                    <h2>Evolución general</h2>
                    <p>Promedio por corrección, últimos 3 meses</p>
                    <HistorialTrendChart points={historialMonthlySeries} />
                  </div>

                  <div className="history-card history-side-card">
                    <h2>Asignaturas a reforzar</h2>
                    <p>Basado en tu rendimiento guardado</p>
                    {weakestSubjects.length ? weakestSubjects.map(({ subject, config, average, count }) => (
                      <div key={subject} className="history-side-row history-side-row-bar" style={{ '--subject-color': config.color } as CSSProperties}>
                        <div className="history-side-row-top">
                          <span>{config.short}</span>
                          <b>{average}<em>/10</em></b>
                        </div>
                        <div className="history-bar-track">
                          <div className="history-bar-fill" style={{ width: `${Math.max(4, (Number(average) / 10) * 100)}%` }} />
                        </div>
                        <small className="history-side-row-count">{count} {count === 1 ? 'corrección' : 'correcciones'}</small>
                      </div>
                    )) : <small className="history-stat-foot">No hay suficientes notas todavía.</small>}
                  </div>

                  <div className="history-card history-side-card">
                    <h2>Mejora reciente</h2>
                    <p>¡Sigue así! Vas por buen camino.</p>
                    {recentImprovingSubjects.length ? recentImprovingSubjects.map(({ subject, config, delta }) => (
                      <div key={subject} className="history-side-row positive" style={{ '--subject-color': config.color } as CSSProperties}>
                        <span>{config.short}</span>
                        <b><TrendingUp size={13} /> +{delta.toFixed(1)}<em> vs mes anterior</em></b>
                      </div>
                    )) : <small className="history-stat-foot">Corrige algunos ejercicios más para ver tendencias.</small>}
                  </div>

                  <div className="history-card history-side-card history-activity-card-v2">
                    <h2>Actividad</h2>
                    <p>Resumen rápido</p>
                    <div className="history-activity-grid">
                      <div>
                        <strong>{historialActividad.semana}</strong>
                        <span>esta semana</span>
                      </div>
                      <div>
                        <strong>{historialActividad.mes}</strong>
                        <span>este mes</span>
                      </div>
                      <div>
                        <strong>{historialActividad.tresMeses}</strong>
                        <span>últimos 3 meses</span>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            )}
            </div>
          </main>
        )}

        {seccion === 'planning' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            <div style={{ background: WARM.surface, borderRadius: '28px', border: '1px solid #dbe7fb', padding: '30px', marginBottom: '20px', textAlign: 'center', boxShadow: WARM.shadow }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'linear-gradient(145deg, #1d4ed8, #2563eb 52%, #38bdf8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 18px 38px rgba(37,99,235,0.24), inset 0 1px 0 rgba(255,255,255,0.28)' }}><Rocket size={30} /></div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>Plan de estudio personalizado</div>
              <div style={{ fontSize: '14px', color: WARM.muted, marginBottom: '20px' }}>Kairo mira tus correcciones y te monta una semana realista para remontar puntos débiles</div>
              <button className="campus-primary" onClick={generarPlan} disabled={cargandoPlan} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: cargandoPlan ? 'not-allowed' : 'pointer', background: cargandoPlan ? '#cbd5e1' : 'linear-gradient(135deg, #1d4ed8, #60a5fa)', color: '#fff', fontSize: '15px', fontWeight: 700, boxShadow: cargandoPlan ? 'none' : '0 16px 34px rgba(37,99,235,0.22)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                {cargandoPlan ? <KairoLoadingDot /> : <BrainCircuit size={17} />}
                {cargandoPlan ? 'Generando...' : 'Abrir Mi Plan'}
              </button>
            </div>
            {planIA && (
              <div style={{ background: WARM.surface, borderRadius: '28px', border: '1px solid #dbe7fb', overflow: 'hidden', boxShadow: WARM.shadow }}>
                <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BrainCircuit size={17} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>TU PLAN SEMANAL · KAIRO</span>
                </div>
                <div style={{ padding: '26px', fontSize: '0.94rem', lineHeight: '1.75', background: 'linear-gradient(180deg, #ffffff, #eff6ff)' }}>
                  <MathMarkdown text={planIA} format={false} components={planMdComponents} />
                </div>
              </div>
            )}
          </main>
        )}

        {itemSeleccionado && (
          <div onClick={() => setItemSeleccionado(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: WARM.surface, borderRadius: '22px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto', border: '1px solid #dbe7fb', boxShadow: '0 28px 80px rgba(37,99,235,0.18)' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #dbe7fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#ffffff', zIndex: 50 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: WARM.ink }}>{nombreAsignatura(itemSeleccionado.asignatura)} · {itemSeleccionado.año} · {itemSeleccionado.bloque}</div>
                  <div style={{ fontSize: '12px', color: WARM.softText, marginTop: '2px' }}>{new Date(itemSeleccionado.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {itemSeleccionado.nota != null && itemSeleccionado.nota_maxima != null && itemSeleccionado.nota_maxima > 0 ? (
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: colorNota(itemSeleccionado.nota / itemSeleccionado.nota_maxima * 10) }}>{itemSeleccionado.nota}</span>
                      <span style={{ fontSize: '13px', color: WARM.softText }}>/{itemSeleccionado.nota_maxima}</span>
                    </div>
                  ) : (
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: '#cbd5e1' }}>—</span>
                    </div>
                  )}
                  <button className="campus-primary" onClick={() => abrirChatConContexto(itemSeleccionado)} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '9px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={15} />Preguntar a Kairo</button>
                  <button className="campus-hover" onClick={() => setItemSeleccionado(null)} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), width: '34px', height: '34px', borderRadius: '50%', background: WARM.wash, border: '1px solid #dbe7fb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: WARM.muted }}><X size={17} /></button>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                {itemSeleccionado.enunciado && (
                  <div style={{ marginBottom: '20px', padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 850, color: WARM.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Enunciado oficial</div>
                    <ExamStatement
                      text={itemSeleccionado.enunciado}
                      components={mdComponents}
                      storageKey={`historial:${itemSeleccionado.id ?? itemSeleccionado.created_at ?? 'item'}:enunciado`}
                      accentColor={(ASIGNATURAS[itemSeleccionado.asignatura as Asignatura] ?? ASIGNATURAS.historia).color}
                      softColor={(ASIGNATURAS[itemSeleccionado.asignatura as Asignatura] ?? ASIGNATURAS.historia).light}
                      readingMode={itemSeleccionado.asignatura === 'lengua'}
                    />
                  </div>
                )}
                {itemSeleccionado.respuesta && (
                  <div style={{ marginBottom: '20px', padding: '18px 20px', borderRadius: '20px', background: '#f8fbff', border: '1px solid #dbe7fb' }}>
                    <div style={{ fontSize: '11px', fontWeight: 850, color: WARM.blue, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Respuesta del alumno</div>
                    <MathMarkdown text={itemSeleccionado.respuesta} components={mdComponents} />
                  </div>
                )}
                {itemSeleccionado.correccion && (
                  <div style={{ padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #dbe7fb', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Corrección de Kairo</div>
                    <CorrectionResultCard correction={itemSeleccionado.correccion} officialMaxScore={itemSeleccionado.nota_maxima} components={mdComponents} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
