'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
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
import { supabase } from './lib/supabase'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from './lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from './lib/correctionParsing'
import { formatExamText } from './lib/mathFormatting'
import { getApiErrorMessage } from './lib/rateLimitMessages'
import Sidebar, { type SidebarItemId } from './components/Sidebar'
import CatPreguntaCard from './components/CatPreguntaCard'
import CatHistoriaEjercicioCard from './components/CatHistoriaEjercicioCard'
import CatFisicaEjercicioCard from './components/CatFisicaEjercicioCard'
import CatEjercicioCard, { type CatEjercicioView } from './components/CatEjercicioCard'
import PhilosophyExamWorkspace from './components/PhilosophyExamWorkspace'
import { useCCAA } from './hooks/useCCAA'
import ExamStatement from '@/components/shared/ExamStatement'
import MathMarkdown from '@/components/shared/MathMarkdown'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'
import {
  ArrowUpRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Camera,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Dna,
  FileText,
  Flame,
  FlaskConical,
  Globe,
  Landmark,
  LibraryBig,
  MessageCircle,
  PenLine,
  Pin,
  Rocket,
  SendHorizontal,
  Sigma,
  SearchX,
  Target,
  UploadCloud,
  WandSparkles,
  X
} from 'lucide-react'
const ASIGNATURAS = {
  mates: { label: 'Matemáticas II', short: 'Mates', icon: Sigma, color: '#2563eb', light: '#eff6ff', accent: '#60a5fa', soft: '#dbeafe' },
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

const SUBJECT_CARDS = {
  mates: {
    title: 'Matemáticas',
    subtitle: 'Problemas, bloques y pasos limpios',
    icon: Sigma,
    kicker: 'Modo precisión'
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

const mdComponents = {
  h1: ({children}: any) => <h1 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '1.2rem 0 0.65rem', borderBottom: '2px solid #e5edf9', paddingBottom: '0.35rem', color: '#111827' }}>{children}</h1>,
  h2: ({children}: any) => <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: '1.05rem 0 0.5rem', color: '#111827' }}>{children}</h2>,
  h3: ({children}: any) => <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1f2937', margin: '0.95rem 0 0.4rem' }}>{children}</h3>,
  strong: ({children}: any) => <strong style={{ fontWeight: 850, color: '#111827' }}>{children}</strong>,
  p: ({children}: any) => <p style={{ margin: '0.72rem 0', color: '#374151', lineHeight: 1.85 }}>{children}</p>,
  li: ({children}: any) => <li style={{ margin: '0.38rem 0', color: '#374151', lineHeight: 1.8 }}>{children}</li>,
  blockquote: ({children}: any) => <blockquote style={{ border: '1px solid #e2e8f0', borderLeft: '4px solid #93c5fd', borderRadius: '16px', padding: '1rem', margin: '1rem 0', color: '#475569', background: '#ffffff', boxShadow: '0 10px 24px rgba(37,99,235,0.06)' }}>{children}</blockquote>,
}

const planMdComponents = {
  h1: ({children}: any) => (
    <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: WARM.ink, margin: '0 0 18px', lineHeight: 1.2 }}>{children}</h1>
  ),
  h2: ({children}: any) => (
    <h2 style={{ margin: '22px 0 12px', padding: '14px 16px', borderRadius: '18px', background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', border: '1px solid #dbe7fb', color: WARM.blue, fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 12px 28px rgba(37,99,235,0.08)' }}>
      <Target size={17} />{children}
    </h2>
  ),
  h3: ({children}: any) => (
    <h3 style={{ margin: '16px 0 10px', color: WARM.ink, fontSize: '0.95rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Flame size={15} color={WARM.amber} />{children}
    </h3>
  ),
  strong: ({children}: any) => <strong style={{ fontWeight: 800, color: WARM.ink }}>{children}</strong>,
  p: ({children}: any) => <p style={{ margin: '0.55rem 0', color: WARM.muted, lineHeight: 1.75 }}>{children}</p>,
  ul: ({children}: any) => <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0 16px', display: 'grid', gap: '8px' }}>{children}</ul>,
  ol: ({children}: any) => <ol style={{ paddingLeft: '1.2rem', margin: '10px 0 16px', display: 'grid', gap: '8px' }}>{children}</ol>,
  li: ({children}: any) => (
    <li style={{ background: WARM.surface, border: '1px solid #dbe7fb', borderRadius: '14px', padding: '10px 12px', color: WARM.ink, lineHeight: 1.6, boxShadow: '0 8px 20px rgba(37, 99, 235, 0.045)' }}>
      {children}
    </li>
  ),
  blockquote: ({children}: any) => (
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

type Asignatura = 'mates' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'historia_filosofia' | 'ingles'
type Tipo = 'Ordinaria' | 'Extraordinaria' | 'Modelo'
type Seccion = 'examenes' | 'chat' | 'historial' | 'planning'
interface MensajeChat { rol: 'usuario' | 'pausia'; texto: string }

const HOME_SECTIONS: Seccion[] = ['examenes', 'chat', 'historial', 'planning']
const HOME_SUBJECTS: Asignatura[] = ['mates', 'fisica', 'quimica', 'biologia', 'ingles', 'lengua', 'historia', 'historia_filosofia']
const DEFAULT_PINNED_SUBJECTS: Asignatura[] = ['mates', 'fisica', 'historia']
const PINNED_SUBJECTS_STORAGE_KEY = 'pausia:pinned-subjects'
const PROFILE_PREFERENCES_STORAGE_KEY = 'pausia_profile_preferences'
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
  } as any
}

function colorNota(n: number) {
  return n >= 7 ? '#0f5ea8' : n >= 5 ? '#2563eb' : '#1d4ed8'
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
  return (
    <div className="exam-filter-dropdown">
      <button
        type="button"
        className="exam-filter-trigger"
        aria-expanded={open}
        onClick={() => setOpen(current => !current)}
      >
        <span className="exam-filter-label">{label}</span>
        <span className="exam-filter-value">{value}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className="exam-filter-menu">
          {options.map(option => (
            <button
              type="button"
              key={option.label}
              className={`exam-filter-option ${option.active ? 'is-active' : ''}`}
              onClick={() => {
                option.onSelect()
                setOpen(false)
              }}
            >
              {option.label}
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

  if (subject === 'mates') {
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

  return (
    <div style={{ background: 'rgba(255, 255, 255, 0.96)', borderRadius: '28px', border: '1px solid rgba(219, 231, 251, 0.95)', padding: '34px', marginBottom: '22px', boxShadow: WARM.shadow, textAlign: 'center' }}>
      <div style={{ width: '66px', height: '66px', borderRadius: '23px', background: config.light, color: config.color, border: '1px solid ' + config.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 14px 30px rgba(37,99,235,0.08)' }}>
        <SearchX size={30} />
      </div>
      <div style={{ fontSize: '20px', fontWeight: 850, color: WARM.ink, marginBottom: '8px' }}>
        No hay preguntas de {title} para este filtro.
      </div>
      <p style={{ maxWidth: '620px', margin: '0 auto', color: WARM.muted, fontSize: '15px', lineHeight: 1.7, fontWeight: 650 }}>
        Prueba con otra convocatoria, año, opción o comunidad.
      </p>
      <div style={{ marginTop: '18px', display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '999px', padding: '7px 12px', background: config.light, color: config.color, border: '1px solid ' + config.soft, fontSize: '12px', fontWeight: 800 }}>
        <Icon size={14} />{config.label}
      </div>
    </div>
  )
}

function officialScore(value: any, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number : fallback
}

function clampScore(value: any, max: number) {
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Math.min(max, Math.max(0, number))
}

function formatPts(value: any) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '0'
}

function sanitizeCorrectionScaleText(text: string, maxScore: number) {
  return text
    .replace(/\s*\(\s*[0-9]+[.,]?[0-9]*\s*\/\s*14\s*\)/gi, '')
    .replace(/([0-9]+[.,]?[0-9]*)\s*\/\s*14\b/g, (_, score) => `${score}/${formatPts(maxScore)} pts`)
    .replace(/sobre\s+14\b/gi, `sobre ${formatPts(maxScore)} puntos`)
}

function calcMedia(items: any[]) {
  if (!items.length) return null
  return (items.reduce((a: number, h: any) => a + (h.nota / h.nota_maxima * 10), 0) / items.length).toFixed(1)
}

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
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
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto'|'imagen'>('texto')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [inputChat, setInputChat] = useState('')
  const [cargandoChat, setCargandoChat] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null)
  const [planIA, setPlanIA] = useState('')
  const [cargandoPlan, setCargandoPlan] = useState(false)
  const [contextoChat, setContextoChat] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cfg = ASIGNATURAS[asignatura]
  const { ccaa } = useCCAA()
  const isCatalunaMates = asignatura === 'mates' && ccaa === 'Cataluña'
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
      else setUsuario(data.user)
    })
  }, [])

  useEffect(() => {
    const urlSection = readHomeSectionFromUrl()
    const initialSubject = readSubjectFromUrl() ?? readDefaultSubject()
    if (initialSubject) cambiarAsignatura(initialSubject)
    if (urlSection) setSeccion(urlSection)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const stored = window.localStorage.getItem(PINNED_SUBJECTS_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        const normalized = normalizePinnedSubjects(parsed)
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
    if (seccion === 'historial') {
      setCargandoHistorial(true)
      supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(50)
        .then(({ data }) => { setHistorial(data || []); setCargandoHistorial(false) })
    }
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

const perteneceAComunidadSeleccionada = (examen: any) =>
  (examen.comunidad ?? examen.ccaa) === ccaa

const examenesFiltrados =
    asignatura === 'mates'
      ? examenes.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
      : asignatura === 'fisica'
        ? examenesFisica.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
        : asignatura === 'quimica'
          ? examenesQuimica.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
          : asignatura === 'biologia'
            ? examenesBiologia.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
            : asignatura === 'lengua'
              ? examenesLengua.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
              : asignatura === 'ingles'
                ? examenesIngles.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))
                : examenesHistoria.filter(e => e.tipo === tipo && perteneceAComunidadSeleccionada(e))

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
        .map((e: any) => e.anio)
        .filter((value, index, values) => values.indexOf(value) === index)
        .sort((a, b) => b - a)
  : Array.from(new Set(examenesFiltrados.map(e => e.año)))
      .sort((a, b) => b - a)

const anioSeleccionado = aniosDisponibles[examenIdx] ?? aniosDisponibles[0]

const examenesCatalunaDelAnio = isCatalunaHistoria
  ? Object.values(examenesCataluna).filter((e: any) => e.anio === anioSeleccionado)
  : []

const examenCatalunaActivo = examenesCatalunaDelAnio[0] ?? null
const ejerciciosCatalunaHistoria = examenCatalunaActivo?.ejercicios ?? []
const ejercicioCatalunaHistoriaActivo =
  ejerciciosCatalunaHistoria[catHistoriaEjercicioIdx] ?? ejerciciosCatalunaHistoria[0] ?? null

const examenFisicaCatalunaActivo = isCatalunaFisica
  ? examenesFisicaCataluna.find(examen => examen.anio === anioSeleccionado && examen.convocatoria === tipo.toLowerCase()) ?? null
  : null
const ejerciciosFisicaCataluna = examenFisicaCatalunaActivo?.ejercicios ?? []
const ejercicioFisicaCatalunaActivo =
  ejerciciosFisicaCataluna[catFisicaEjercicioIdx] ?? ejerciciosFisicaCataluna[0] ?? null

const examenQuimicaCatalunaActivo = isCatalunaQuimica
  ? examenesQuimicaCataluna.find(examen => examen.anio === anioSeleccionado && examen.convocatoria === tipo.toLowerCase()) ?? null
  : null
const ejerciciosQuimicaCataluna: CatEjercicioView[] = examenQuimicaCatalunaActivo?.ejercicios.map(ejercicio => ({
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
const ejerciciosLenguaCataluna: CatEjercicioView[] = examenLenguaCatalunaActivo
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
  : []
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

const preguntasIngles = asignatura === 'ingles' ? (examenIngles as any)?.preguntas ?? [] : []

const bloquesIngles = preguntasIngles.map((p: any) => ({ tipo: p.bloque, label: p.label, pts: p.puntuacion }))

const tipoInglesActivo = bloquesIngles[bloqueIdx]?.tipo

const preguntaIngles = asignatura === 'ingles'
  ? tipoInglesActivo
    ? preguntasIngles.find((p: any) => p.bloque === tipoInglesActivo) ?? null
    : null
  : null

const preguntasA = asignatura === 'mates'
  ? (examen as any)?.preguntas?.filter((p: any) => p.opcion === 'A') ?? []
  : []

const preguntasB = asignatura === 'mates'
  ? (examen as any)?.preguntas?.filter((p: any) => p.opcion === 'B') ?? []
  : []

const bloquesMates = Array.from(new Set(
  asignatura === 'mates'
    ? ((examen as any)?.preguntas ?? []).map((p: any) => p.bloque)
    : []
)) as string[]

const tipoMatesActivo = bloquesMates[bloqueIdx]

const preguntaMates =
  (examen as any)?.preguntas?.find(
    (p: any) =>
      p.opcion === (opcion === 0 ? 'A' : 'B') &&
      p.bloque === tipoMatesActivo
  ) ??
  (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoMatesActivo) ??
  (examen as any)?.preguntas?.[0]

const tipoFisicaActivo = TIPOS_FISICA[bloqueIdx]?.tipo

const preguntaFisica = asignatura === 'fisica'
  ? (examen as any)?.preguntas?.find(
      (p: any) =>
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoFisicaActivo
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoFisicaActivo) ??
    (examen as any)?.preguntas?.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ??
    (examen as any)?.preguntas?.[0]
  : null

const preguntasQuimica = asignatura === 'quimica'
  ? (examen as any)?.preguntas ?? []
  : []

const bloquesQuimica = Array.from(
  new Map(
    preguntasQuimica.map((p: any) => [
      p.bloque,
      { tipo: p.bloque, label: p.label ?? p.numero ?? p.bloque, pts: p.puntuacion }
    ])
  ).values()
) as { tipo: string; label: string; pts: number }[]

const tipoQuimicaActivo = bloquesQuimica[bloqueIdx]?.tipo

const preguntaQuimica = asignatura === 'quimica'
  ? preguntasQuimica.find(
      (p: any) =>
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoQuimicaActivo
    ) ??
    preguntasQuimica.find((p: any) => p.bloque === tipoQuimicaActivo) ??
    preguntasQuimica.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ??
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
  ? (examenBiologia as any)?.preguntas ?? []
  : []

const bloquesBiologia = preguntasBiologia.length
  ? Array.from(
      new Map(
        preguntasBiologia.map((p: any) => [
          p.bloque,
          { tipo: p.bloque, label: p.label ?? p.numero ?? p.bloque, pts: p.puntuacion }
        ])
      ).values()
    ) as { tipo: string; label: string; pts: number }[]
  : BIOLOGIA_TOPICS

const tipoBiologiaActivo = bloquesBiologia[bloqueIdx]?.tipo

const preguntaBiologia = asignatura === 'biologia'
  ? preguntasBiologia.find(
      (p: any) =>
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoBiologiaActivo
    ) ??
    preguntasBiologia.find((p: any) => p.bloque === tipoBiologiaActivo) ??
    preguntasBiologia.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ??
    preguntasBiologia[0]
  : null

const preguntasLengua = asignatura === 'lengua'
  ? (examenLengua as any)?.preguntas ?? []
  : []

const bloquesLengua = preguntasLengua.length
  ? preguntasLengua.map((p: any) => ({
      tipo: p.bloque,
      label: p.label ?? p.tema ?? p.bloque,
      pts: p.puntuacion
    }))
  : [...TIPOS_LENGUA]

const tipoLenguaActivo = bloquesLengua[bloqueIdx]?.tipo

const preguntaLengua = asignatura === 'lengua'
  ? preguntasLengua.find((p: any) => p.bloque === tipoLenguaActivo) ?? preguntasLengua[0]
  : null

const OPCIONES = [0, 1] as const

const opcionesMatesDisponibles = asignatura === 'mates'
  ? Array.from(new Set(
      ((examen as any)?.preguntas ?? [])
        .filter((p: any) => p.bloque === tipoMatesActivo)
        .map((p: any) => p.opcion)
    ))
  : []

const opcionesFisicaDisponibles = asignatura === 'fisica'
  ? Array.from(new Set(
      ((examen as any)?.preguntas ?? [])
        .filter((p: any) => p.bloque === tipoFisicaActivo)
        .map((p: any) => p.opcion)
    ))
  : []

const opcionesQuimicaDisponibles = asignatura === 'quimica'
  ? Array.from(new Set(
      preguntasQuimica
        .filter((p: any) => p.bloque === tipoQuimicaActivo)
        .map((p: any) => p.opcion)
    ))
  : []

const opcionesBiologiaDisponibles = asignatura === 'biologia'
  ? Array.from(new Set(
      preguntasBiologia
        .filter((p: any) => p.bloque === tipoBiologiaActivo)
        .map((p: any) => p.opcion)
    ))
  : []

const opcionesHistoriaDisponibles = asignatura === 'historia'
  ? Array.from(new Set(examenesHistoriaDelDia.map(e => e.opcion)))
  : []

const opcionesDisponibles: (0 | 1)[] =
  asignatura === 'mates' && opcionesMatesDisponibles.length
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

const preguntasHistoria = examenHistoria?.preguntas ?? []

const bloquesHistoria = preguntasHistoria.map(p => ({
  tipo: p.tipo,
  label: (p as any).label ?? LABELS_HISTORIA[p.tipo] ?? p.tipo,
  pts: p.puntuacion
}))

const tipoHistoriaActivo = bloquesHistoria[bloqueIdx]?.tipo

const preguntaHistoria =
  preguntasHistoria.find(p => p.tipo === tipoHistoriaActivo) ??
  preguntasHistoria[0]

const preguntaActiva =
  asignatura === 'mates' ? preguntaMates :
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

const enunciadoActivo = formatEnunciado((preguntaActiva as any)?.enunciado)
const puntuacionPreguntaActiva = officialScore(
  (preguntaActiva as any)?.puntuacion ?? (preguntaActiva as any)?.puntos ?? (preguntaActiva as any)?.pts,
  asignatura === 'mates' ? 2.5 : 2
)

const bloqueActivoLabel =
  asignatura === 'mates' ? (preguntaActiva as any)?.bloque :
  asignatura === 'fisica' ? (TIPOS_FISICA[bloqueIdx]?.label ?? '') :
  asignatura === 'quimica' ? ((preguntaActiva as any)?.label ?? bloquesQuimica[bloqueIdx]?.label ?? '') :
  asignatura === 'biologia' ? ((preguntaActiva as any)?.label ?? bloquesBiologia[bloqueIdx]?.label ?? '') :
  asignatura === 'lengua' ? ((preguntaActiva as any)?.label ?? bloquesLengua[bloqueIdx]?.label ?? '') :
  asignatura === 'ingles' ? ((preguntaActiva as any)?.label ?? bloquesIngles[bloqueIdx]?.label ?? '') :
  ((preguntaActiva as any)?.label ?? LABELS_HISTORIA[(preguntaActiva as any)?.tipo] ?? '')

const opcionMostrada = asignatura === 'lengua'
  ? (versionLenguaSeleccionada ?? 'Única')
  : asignatura === 'ingles'
    ? (diaInglesSeleccionado ? `${diaInglesSeleccionado} · ${(examenIngles as any)?.opcion ?? 'Única'}` : ((examenIngles as any)?.opcion ?? 'Única'))
    : asignatura === 'biologia'
      ? (serieBiologiaSeleccionada ? `${serieBiologiaSeleccionada} · ${(preguntaBiologia as any)?.opcion ?? 'Única'}` : ((preguntaBiologia as any)?.opcion ?? 'Única'))
    : (preguntaActiva as any)?.opcion ?? (opcion === 0 ? 'A' : 'B')

const preguntaActivaKey = [
  asignatura,
  (examenActivo as any)?.id ?? examenActivo?.año ?? 'sin-examen',
  (preguntaActiva as any)?.id ?? (preguntaActiva as any)?.bloque ?? (preguntaActiva as any)?.tipo ?? bloqueIdx,
  opcionMostrada
].join('-')

const preguntaActivaStorageId = [
  ccaa,
  asignatura,
  (examenActivo as any)?.año ?? anioSeleccionado ?? 'sin-anio',
  tipo,
  (preguntaActiva as any)?.id ?? bloqueActivoLabel ?? 'pregunta',
  opcionMostrada,
].filter(Boolean).join(':')

const enunciadoStorageKey = `principal:${preguntaActivaStorageId}:enunciado`
const fuenteStorageKey = `principal:${preguntaActivaStorageId}:fuente`
const correctionScoreMatch = correccion.match(/(?:nota|puntuaci[oó]n|calificaci[oó]n)[^\n:]*[:\s]+([0-9]+(?:[.,][0-9]+)?)\s*(?:\/|de)\s*([0-9]+(?:[.,][0-9]+)?)/i)
const correctionScoreLabel = correctionScoreMatch
  ? `${correctionScoreMatch[1].replace(',', '.')}/${correctionScoreMatch[2].replace(',', '.')}`
  : '--'

function puntosBloqueFisica(tipoBloque: string) {
  return (
    (examen as any)?.preguntas?.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B')
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque)
  )?.puntuacion ?? 2
}

function puntosBloqueMates(bloque: string) {
  return (
    (examen as any)?.preguntas?.find(
      (p: any) => p.bloque === bloque && p.opcion === (opcion === 0 ? 'A' : 'B')
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === bloque)
  )?.puntuacion ?? 2.5
}

function puntosBloqueQuimica(tipoBloque: string) {
  return (
    preguntasQuimica.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B')
    ) ??
    preguntasQuimica.find((p: any) => p.bloque === tipoBloque)
  )?.puntuacion ?? 2
}

function puntosBloqueBiologia(tipoBloque: string) {
  return (
    preguntasBiologia.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B')
    ) ??
    preguntasBiologia.find((p: any) => p.bloque === tipoBloque)
  )?.puntuacion ?? BIOLOGIA_TOPICS.find(topic => topic.tipo === tipoBloque)?.pts ?? 2
}

function cambiarBloqueMates(i: number, bloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = (examen as any)?.preguntas?.find((p: any) => p.bloque === bloque)?.opcion
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function cambiarBloqueFisica(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque)?.opcion
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function cambiarBloqueQuimica(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = preguntasQuimica.find((p: any) => p.bloque === tipoBloque)?.opcion
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function cambiarBloqueBiologia(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = preguntasBiologia.find((p: any) => p.bloque === tipoBloque)?.opcion
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function nombreAsignatura(a: string) {
  if (a === 'mates') return 'Matemáticas II'
  if (a === 'fisica') return 'Física'
  if (a === 'quimica') return 'Química'
  if (a === 'biologia') return 'Biología'
  if (a === 'lengua') return 'Lengua Castellana y Literatura II'
  if (a === 'ingles') return 'Inglés'
  if (a === 'historia_filosofia') return 'Historia de la Filosofía'
  return 'Historia de España'
}

function reset() {
  setCorreccion('')
  setRespuesta('')
  setImagen(null)
  setImagenPreview(null)
}

function cambiarAsignatura(a: Asignatura) {
  setAsignatura(a)
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

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenTipo(file.type)
    setImagenPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setImagen((reader.result as string).split(',')[1])
    reader.readAsDataURL(file)
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && !imagen) return
    setCargando(true); setCorreccion('')
    try {
      const accessToken = await getChatAccessToken()
      if (!accessToken) {
        setCorreccion('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }
      const p = preguntaActiva as any
      const puntuacionMax = officialScore(p?.puntuacion ?? p?.puntos ?? p?.pts, puntuacionPreguntaActiva)
      const prompt = buildCorrectionPrompt({
        subject: nombreAsignatura(asignatura),
        community: ccaa,
        simulacroId: `Práctica ${nombreAsignatura(asignatura)} ${examenActivo?.año ?? ''} ${tipo} ${bloqueActivoLabel || ''}`.trim(),
        option: opcionMostrada,
        elapsedMinutes: 0,
        difficulty: 'Media',
        blocks: [{
          numeroBloque: 'Bloque 1',
          tema: bloqueActivoLabel || p?.bloque || p?.tipo || 'Pregunta',
          year: p?.año ?? examenActivo?.año ?? 'No especificado',
          convocatoria: p?.convocatoria ?? examenActivo?.tipo ?? tipo,
          option: p?.opcion ?? opcionMostrada,
          maxScore: puntuacionMax,
          officialPrompt: enunciadoActivo,
          criteria: p?.criterios,
          sourceText: p?.texto_fuente,
          concepts: p?.conceptos,
          studentAnswer: modo === 'imagen'
            ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.'
            : respuesta
        }]
      })
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ pregunta: prompt, imagen: modo === 'imagen' ? imagen : null, imagenTipo: modo === 'imagen' ? imagenTipo : null })
      })
      const data = await res.json()
      if (!res.ok) {
        setCorreccion(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsedCorrection = parseCorrectionPayload(data.respuesta)
      const correccionJson = parsedCorrection ? normalizeCorrectionForOfficialScores(parsedCorrection, [puntuacionMax]) : null
      const correccionVisible = correccionJson
        ? correctionJsonToMarkdownWithOptions(correccionJson, { officialMaxScore: puntuacionMax })
        : sanitizeCorrectionScaleText(correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: puntuacionMax }), puntuacionMax)
      setCorreccion(correccionVisible)
      const bloqueJson = correccionJson?.desglose_bloques?.[0]
      const partes = !correccionJson ? (data.respuesta || '').match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/) : null
      const rawNota = bloqueJson?.puntos_conseguidos != null
        ? Number(bloqueJson.puntos_conseguidos)
        : partes ? parseFloat(partes[1].replace(',', '.')) : null
      const nota = rawNota === null ? null : clampScore(rawNota, puntuacionMax)
      const notaMax = puntuacionMax
      supabase.from('historial_examenes').insert({
        user_id: usuario.id, asignatura, tipo, año: examenActivo?.año,
        bloque: bloqueActivoLabel || '',
        opcion: asignatura === 'lengua' || asignatura === 'ingles' ? opcionMostrada : opcion === 0 ? 'A' : 'B', nota, nota_maxima: notaMax,
        enunciado: enunciadoActivo?.substring(0, 6000),
        respuesta: respuesta?.substring(0, 4000),
        // Do not truncate full correction: History modal needs complete feedback.
        correccion: correccionVisible
      }).then(() => {})
    } catch {
      setCorreccion('No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.')
    } finally {
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
      setMensajes(prev => [...prev, { rol: 'pausia', texto: 'Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.' }])
      setCargandoChat(false)
      return
    }
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        pregunta: `Eres Pausia, tutor de ${examSystemLabel(ccaa)}. Responde dudas sobre matemáticas, física, química, biología, inglés, lengua, historia y filosofía.\n` +
          (contextoChat ? 'CONTEXTO: ' + contextoChat + '\n' : '') +
          hist.map(m => (m.rol === 'usuario' ? 'Estudiante' : 'Pausia') + ': ' + m.texto).join('\n') +
          '\nResponde solo como Pausia.'
      })
    })
    const data = await res.json()
    setMensajes(prev => [...prev, { rol: 'pausia', texto: res.ok ? data.respuesta : getApiErrorMessage(data, 'No he podido responder ahora mismo. Inténtalo de nuevo en unos minutos.') }])
    setCargandoChat(false)
  }

  function abrirChatConContexto(item: any) {
    const ctx = 'El estudiante acaba de revisar esta corrección:\n' +
      'Asignatura: ' + nombreAsignatura(item.asignatura) + '\n' +
      'Ejercicio: ' + item.bloque + ' - ' + item.tipo + ' ' + item.año + '\n' +
      'Nota obtenida: ' + item.nota + '/' + item.nota_maxima + '\n' +
      'Enunciado: ' + (item.enunciado || '') + '\n' +
      'Corrección: ' + (item.correccion || '') + '\n\n' +
      'El estudiante quiere entender mejor su nota. Ayúdale de forma clara y motivadora.'
    setContextoChat(ctx)
    setMensajes([{ rol: 'pausia', texto: '¡Hola! Veo que tienes dudas sobre tu corrección de ' + item.bloque + ' donde sacaste ' + item.nota + '/' + item.nota_maxima + '. ¿Qué parte no te queda clara? Pregúntame lo que quieras.' }])
    setItemSeleccionado(null)
    navegarASeccion('chat')
  }

  async function generarPlan() {
    window.location.href = '/planning'
  }

  const HeaderIcon =
    seccion === 'examenes' ? cfg.icon :
    seccion === 'chat' ? MessageCircle :
    seccion === 'historial' ? BarChart3 :
    Rocket

  const calcMedia = (items: any[]) => {
    const notas = items
      .filter((item) => item.nota !== null && item.nota_maxima)
      .map((item) => (item.nota / item.nota_maxima) * 10)

    if (notas.length === 0) return null

    return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
  }

  const matesH = historial.filter((item: any) => item.asignatura === 'mates')
  const fisicaH = historial.filter((item: any) => item.asignatura === 'fisica')
  const quimicaH = historial.filter((item: any) => item.asignatura === 'quimica')
  const biologiaH = historial.filter((item: any) => item.asignatura === 'biologia')
  const inglesH = historial.filter((item: any) => item.asignatura === 'ingles')
  const lenguaH = historial.filter((item: any) => item.asignatura === 'lengua')
  const historiaH = historial.filter((item: any) => item.asignatura === 'historia')

  const mediaM = calcMedia(matesH)
  const mediaFisica = calcMedia(fisicaH)
  const mediaQuimica = calcMedia(quimicaH)
  const mediaBiologia = calcMedia(biologiaH)
  const mediaIngles = calcMedia(inglesH)
  const mediaLengua = calcMedia(lenguaH)
  const mediaHist = calcMedia(historiaH)
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
          ? ejerciciosCatalunaHistoria.map((ejercicio: any, i: number) => {
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
          : asignatura === 'mates'
            ? bloquesMates.map((bloque: string, i: number) => ({
                label: `${i + 1}. ${bloque} · ${puntosBloqueMates(bloque)}pts`,
                active: bloqueIdx === i,
                onSelect: () => cambiarBloqueMates(i, bloque)
              }))
            : (asignatura === 'fisica' ? TIPOS_FISICA : asignatura === 'quimica' ? bloquesQuimica : asignatura === 'biologia' ? bloquesBiologia : asignatura === 'lengua' ? bloquesLengua : asignatura === 'ingles' ? bloquesIngles : bloquesHistoria).map((t: any, i: number) => ({
                label: `${t.label} · ${asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : asignatura === 'quimica' ? puntosBloqueQuimica(t.tipo) : asignatura === 'biologia' ? puntosBloqueBiologia(t.tipo) : (t as any).pts}pts`,
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

      const normalSource: any[] =
        asignatura === 'mates' ? examenes :
        asignatura === 'fisica' ? examenesFisica :
        asignatura === 'quimica' ? examenesQuimica :
        asignatura === 'biologia' ? examenesBiologia :
        asignatura === 'lengua' ? examenesLengua :
        asignatura === 'ingles' ? examenesIngles :
        examenesHistoria

      const selectNormalResult = (exam: any, question: any, questionIndex: number) => {
      const years = Array.from(new Set(
        normalSource
          .filter(candidate => candidate.tipo === exam.tipo && perteneceAComunidadSeleccionada(candidate))
          .map(candidate => candidate.año)
      )).sort((a: any, b: any) => Number(b) - Number(a))
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
        const blocks = Array.from(new Set((exam.preguntas ?? []).map((p: any) => p.bloque)))
        setDiaHistoriaIdx(Math.max(0, series.findIndex(serie => serie === exam.dia)))
        setOpcion(question.opcion === 'B' ? 1 : 0)
        setBloqueIdx(Math.max(0, blocks.findIndex(block => block === question.bloque)))
      } else if (asignatura === 'fisica') {
        setDiaHistoriaIdx(0)
        setOpcion(question.opcion === 'B' ? 1 : 0)
        setBloqueIdx(Math.max(0, TIPOS_FISICA.findIndex(item => item.tipo === question.bloque)))
      } else {
        const blocks = Array.from(new Set((exam.preguntas ?? []).map((p: any) => p.bloque)))
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
        .flatMap((exam: any) => ((exam.preguntas ?? []) as any[]).map((question, questionIndex) => {
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
      return examenesCatMates.map((question: any, index: number) => {
        const years = Array.from(new Set(examenesCatMates.filter(p => p.tipo === question.tipo).map(p => p.year))).sort((a, b) => b - a)
        const preguntasDelAnio = examenesCatMates.filter(p => p.tipo === question.tipo && p.year === question.year)
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
      return examenesFisicaCataluna.flatMap(exam => exam.ejercicios.map((exercise, exerciseIndex) => {
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
      const flattenLengua = (exam: any): CatEjercicioView[] => [
        ...((exam.opciones ?? []).flatMap((op: any) => op.bloques.map((bloque: any) => ({
          id: `${op.opcion}-${bloque.id}`,
          titulo: `${op.titulo} · ${bloque.titulo}`,
          instrucciones: bloque.instrucciones,
          texto: [op.texto, bloque.texto].filter(Boolean).join('\n\n'),
          fuente: [op.fuente, bloque.fuente].filter(Boolean).join('\n\n'),
          apartados: bloque.apartados,
          opcion: op.opcion,
        })))),
        ...((exam.partesComunes ?? []).map((bloque: any) => ({
          id: `comun-${bloque.id}`,
          titulo: `Parte común · ${bloque.titulo}`,
          instrucciones: bloque.instrucciones,
          texto: bloque.texto,
          fuente: bloque.fuente,
          apartados: bloque.apartados,
          opcion: 'Parte común',
        }))),
        ...((exam.partesObligatorias ?? []).map((bloque: any) => ({
          id: bloque.id,
          titulo: bloque.titulo,
          instrucciones: bloque.instrucciones,
          texto: bloque.texto,
          fuente: bloque.fuente,
          apartados: bloque.apartados,
        }))),
      ]
      return catExams.flatMap((exam: any) => {
        const selectedTipo = tipoFromCataluna(exam.convocatoria)
        const years = Array.from(new Set(catExams.filter((candidate: any) => candidate.convocatoria === exam.convocatoria).map((candidate: any) => candidate.anio))).sort((a: any, b: any) => Number(b) - Number(a))
        const exercises: any[] = isCatalunaQuimica
          ? (exam.ejercicios ?? []).map((exercise: any) => ({
              id: String(exercise.numero),
              titulo: exercise.titulo,
              instrucciones: exercise.instrucciones,
              enunciado: exercise.enunciado,
              apartados: exercise.apartados,
              datos: exercise.datos,
              imagenes: exercise.imagenes,
              requiereRevision: exercise.requiereRevision,
            }))
          : flattenLengua(exam)
        return exercises.map((exercise, exerciseIndex) => {
          const points = (exercise.apartados ?? []).reduce((total: number, apartado: any) => total + Number(apartado.puntos ?? 0), 0) || 2.5
          return withSearchText({
            id: `cat-${asignatura}-${exam.id}-${exercise.id}`,
            year: String(exam.anio),
            convocatoria: selectedTipo,
            title: isCatalunaQuimica ? `Ejercicio ${exercise.id}` : exercise.titulo,
            subtitle: isCatalunaQuimica ? exercise.titulo : (exercise.opcion ?? 'Lengua Cataluña'),
            points: `${formatPts(points)} pts`,
            onSelect: () => {
              setTipo(selectedTipo)
              setExamenIdx(Math.max(0, years.findIndex((year: any) => year === exam.anio)))
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
      return Object.values(examenesCataluna).flatMap((exam: any) => {
        const years = Object.values(examenesCataluna).map((e: any) => e.anio).filter((value, index, values) => values.indexOf(value) === index).sort((a: any, b: any) => Number(b) - Number(a))
        return (exam.ejercicios ?? []).map((exercise: any, exerciseIndex: number) => withSearchText({
          id: `cat-historia-${exam.id}-${exercise.numero}`,
          year: String(exam.anio),
          convocatoria: exam.serie ?? 'Ordinaria',
          title: `Ejercicio ${exercise.numero}`,
          subtitle: exercise.fuente?.titulo ?? exercise.tipo ?? 'Historia Cataluña',
          points: '2.5 pts',
          onSelect: () => {
            setTipo('Ordinaria')
            setExamenIdx(Math.max(0, years.findIndex((year: any) => year === exam.anio)))
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
    <div className="pausia-app-shell pausia-premium-shell" style={{
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

        .exams-subject-strip {
          padding: 2px 0 10px;
        }

        .exams-subject-strip > .pau-subject-card {
          flex: 0 0 auto !important;
          min-width: 178px;
          max-width: 245px;
          min-height: 64px !important;
          padding: 10px 14px !important;
          border-radius: 999px !important;
          background: #f7f7f8 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: none !important;
        }

        .exams-subject-strip > .pau-subject-card.is-active {
          background: #ffffff !important;
          border-color: #4f46e5 !important;
          box-shadow: 0 14px 34px rgba(79, 70, 229, 0.12) !important;
        }

        .exams-subject-strip > .pau-subject-card:hover {
          transform: translateY(-1px) !important;
          box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08) !important;
        }

        .exams-subject-strip .subject-kicker {
          display: none !important;
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
          align-items: stretch;
          gap: 0;
          width: 100%;
          overflow: visible;
        }

        .exams-filter-card {
          position: relative;
          z-index: 90;
          overflow: visible !important;
          margin-bottom: 34px !important;
        }

        .exams-filter-card > div:not(:first-child):not(.exams-filter-bar) {
          display: none !important;
        }

        .exams-filter-divider {
          width: 1px;
          align-self: stretch;
          background: #eef0f4;
          margin: 4px 10px;
          flex: 0 0 auto;
        }

        .exam-filter-dropdown {
          position: relative;
          z-index: 91;
          min-width: 150px;
          flex: 0 1 auto;
        }

        .exam-filter-trigger {
          min-height: 54px;
          width: 100%;
          border: 0;
          border-radius: 16px;
          background: transparent;
          color: #111827;
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          column-gap: 8px;
          padding: 8px 10px;
          cursor: pointer;
          text-align: left;
          transition: background 160ms ease, box-shadow 160ms ease;
        }

        .exam-filter-trigger:hover,
        .exam-filter-trigger[aria-expanded="true"] {
          background: #f8fafc;
          box-shadow: inset 0 0 0 1px #e5e7eb;
        }

        .exam-filter-label {
          grid-column: 1 / -1;
          color: #9ca3af;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.09em;
          text-transform: uppercase;
        }

        .exam-filter-value {
          min-width: 0;
          max-width: 260px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #111827;
          font-size: 13px;
          font-weight: 850;
        }

        .exam-filter-menu {
          position: absolute;
          left: 0;
          top: calc(100% + 8px);
          z-index: 120;
          min-width: 220px;
          max-height: 310px;
          overflow-y: auto;
          padding: 7px;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
        }

        .exam-filter-option {
          width: 100%;
          min-height: 36px;
          border: 0;
          border-radius: 12px;
          background: transparent;
          color: #374151;
          padding: 8px 10px;
          text-align: left;
          font-size: 13px;
          font-weight: 740;
          cursor: pointer;
        }

        .exam-filter-option:hover,
        .exam-filter-option.is-active {
          background: #eef2ff;
          color: #3730a3;
        }

        .exams-option-group {
          min-height: 54px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 4px;
        }

        .exam-option-label {
          color: #9ca3af;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-right: 2px;
        }

        .exam-option-button {
          width: 36px;
          height: 36px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
          cursor: pointer;
          font-size: 13px;
          font-weight: 900;
          display: inline-grid;
          place-items: center;
        }

        .exam-option-button.is-active {
          border-color: transparent;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          color: #ffffff;
          box-shadow: 0 12px 26px rgba(79, 70, 229, 0.18);
        }

        .exams-workspace {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: minmax(0, 1fr) 324px;
          gap: 22px;
          align-items: start;
        }

        .exams-main-column {
          min-width: 0;
        }

        .exams-ai-panel {
          position: sticky;
          top: 88px;
          display: grid;
          gap: 14px;
        }

        .exams-side-card {
          width: 100%;
          border: 1px solid rgba(219, 231, 251, 0.9);
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 24px 60px rgba(37, 99, 235, 0.09);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 18px;
        }

        .exams-ai-panel .exams-side-card:first-child {
          border-left: 4px solid #8b5cf6;
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
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07) !important;
        }

        .exams-question-card > div:first-child {
          background: #ffffff !important;
          border-bottom: 1px solid #eef0f4 !important;
        }

        .exams-answer-card {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.07) !important;
        }

        .exams-answer-card textarea {
          background: #fafafb !important;
          border-color: #e5e7eb !important;
        }

        .exams-correct-button {
          width: auto !important;
          margin-left: auto !important;
          padding: 13px 20px !important;
          border-radius: 16px !important;
          background: linear-gradient(135deg, #2563eb, #7c3aed) !important;
          box-shadow: 0 16px 34px rgba(79, 70, 229, 0.2) !important;
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
            min-width: 170px;
            flex: 0 0 auto;
          }

          .exams-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media (max-width: 1024px) {
          .pausia-app-shell {
            display: block !important;
          }
        }

        @media (max-width: 640px) {
          .pausia-app-header {
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
      `}</style>
      <Sidebar
        activeItem={seccion === 'planning' ? 'plan-estudio' : seccion as SidebarItemId}
        email={usuario?.email}
        onNavigate={(item) => navegarASeccion(item === 'plan-estudio' ? 'planning' : item as Seccion)}
        onLogout={cerrarSesion}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <header className="pausia-app-header pausia-topbar" style={{
  borderBottom: '1px solid rgba(219,231,251,0.78)',
  padding: '0 32px',
  minHeight: '64px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 40,
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.01em' }}>
              {seccion === 'examenes' && cfg.label}
              {seccion === 'chat' && 'Chat con Pausia'}
              {seccion === 'historial' && 'Historial de correcciones'}
              {seccion === 'planning' && 'Mi plan de estudio'}
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>
              {seccion === 'examenes' && `· ${examSystemLabel(ccaa)}`}
              {seccion === 'chat' && '· Resuelve dudas'}
              {seccion === 'historial' && '· Correcciones guardadas'}
              {seccion === 'planning' && '· Tu semana'}
            </div>
          </div>
        </header>

        {seccion === 'examenes' && (
          <main className="exams-screen" style={{ flex: 1, padding: '32px 32px 56px', maxWidth: '1420px', width: '100%', margin: '0 auto' }}>

            {/* ── Page title (Stitch) ──────────────────────────────── */}
            <div className="exams-hero">
              <div>
                <h1 style={{ margin: 0, fontSize: 30, fontWeight: 860, color: '#111827', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                  {cfg.label}
                </h1>
                <p style={{ margin: '8px 0 0', fontSize: 14, color: '#6b7280', lineHeight: 1.6, maxWidth: 620 }}>
                  Convocatoria {tipo} {anioSeleccionado ? `· ${anioSeleccionado}` : ''} · {examSystemLabel(ccaa)}
                </p>
              </div>
              <div className="exams-search-bar">
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

            <div style={{ marginBottom: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: WARM.softText, fontSize: 11, fontWeight: 850, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{showAllSubjects ? 'Todas las asignaturas' : 'Selecciona una asignatura'}</div>
                </div>
                <button
                  className="campus-hover"
                  onClick={() => setShowAllSubjects(value => !value)}
                  style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), border: '1px solid #dbe7fb', borderRadius: '999px', background: '#ffffff', color: WARM.blue, padding: '9px 14px', display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 850, cursor: 'pointer', boxShadow: '0 12px 24px rgba(37,99,235,0.06)' } as any}
                  type="button"
                >
                  {showAllSubjects ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  {showAllSubjects ? 'Ocultar' : 'Ver todas'}
                </button>
              </div>
              {pinnedLimitMsg && !showAllSubjects && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '8px 14px', marginBottom: '12px', color: '#c2410c', fontSize: '13px', fontWeight: 600 }}>
                  Puedes anclar hasta 4 asignaturas. Desancla una para añadir otra.
                </div>
              )}

              <div
                className="subject-card-grid exams-subject-strip"
                style={!showAllSubjects ? {
                  gridTemplateColumns:
                    visibleSubjectCards.length === 1 ? 'minmax(280px, 520px)' :
                    visibleSubjectCards.length === 2 ? 'repeat(2, 1fr)' :
                    visibleSubjectCards.length === 3 ? 'repeat(3, 1fr)' :
                    'repeat(4, 1fr)',
                  justifyContent: visibleSubjectCards.length === 1 ? 'center' : undefined,
                } : {}}
              >
              {visibleSubjectCards.map(key => {
                const val = ASIGNATURAS[key]
                const card = SUBJECT_CARDS[key]
                const Icon = card.icon
                const active = asignatura === key
                const pinned = pinnedClean.includes(key)
                return (
                  <div
                    className={`campus-subject-card pau-subject-card ${active ? 'is-active' : ''}`}
                    key={key}
                    onClick={() => navegarAAsignatura(key)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navegarAAsignatura(key)
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    style={{
                      ...hoverVars(val.color, val.light, val.accent),
                      position: 'relative',
                      overflow: 'hidden',
                      width: '100%',
                      textAlign: 'left',
                      minHeight: '104px',
                      padding: '16px',
                      borderRadius: '20px',
                      border: active ? '1px solid ' + val.accent : '1px solid rgba(219,231,251,0.95)',
                      background: active ? 'linear-gradient(145deg, #ffffff 0%, ' + val.light + ' 100%)' : 'rgba(255,255,255,0.9)',
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: active ? '0 18px 42px ' + val.accent + '22' : '0 12px 30px rgba(15, 23, 42, 0.06)'
                    }}
                  >
                    <div style={{ position: 'absolute', right: '-46px', bottom: '-54px', width: '120px', height: '120px', borderRadius: '50%', background: val.accent + '14' }} />
                    <SubjectIllustration subject={key} color={val.color} accent={val.accent} />
                    <button
                      aria-label={pinned ? `Desanclar ${card.title}` : `Anclar ${card.title}`}
                      className="campus-hover"
                      onClick={(event) => {
                        event.stopPropagation()
                        togglePinnedSubject(key)
                      }}
                      style={{ ...hoverVars(val.color, val.light, val.accent), position: 'absolute', right: '14px', top: '14px', width: '34px', height: '34px', borderRadius: '999px', border: '1px solid ' + (pinned ? val.accent : '#dbe7fb'), background: pinned ? val.light : '#ffffff', color: pinned ? val.color : WARM.softText, display: 'grid', placeItems: 'center', cursor: 'pointer', zIndex: 4, boxShadow: '0 10px 22px rgba(37,99,235,0.08)' } as any}
                      type="button"
                    >
                      <Pin size={16} fill={pinned ? 'currentColor' : 'none'} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '13px', paddingRight: '34px', position: 'relative', zIndex: 2 }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? '#ffffff' : val.light, color: val.color, boxShadow: '0 12px 28px rgba(37,99,235,0.08)', flex: '0 0 auto' }}>
                        <Icon size={22} strokeWidth={2.1} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 820, color: WARM.ink, lineHeight: 1.25 }}>{card.title}</div>
                        <div style={{ marginTop: '4px', color: WARM.muted, fontSize: '12px', lineHeight: '1.35', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.subtitle}</div>
                      </div>
                    </div>
                    <div className="subject-kicker" style={{ marginTop: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '999px', background: active ? '#ffffff' : val.light, color: val.color, fontSize: '11px', fontWeight: 760, position: 'relative', zIndex: 2 }}>
                      <Flame size={13} />{card.kicker}
                    </div>
                  </div>
                )
              })}
              </div>
            </div>
           {!isPhilosophy && <div className="exams-filter-card" style={{
  background: 'rgba(255, 255, 255, 0.92)',
  borderRadius: '22px',
  border: '1px solid rgba(219, 231, 251, 0.85)',
  padding: '20px',
  marginBottom: '22px',
  boxShadow: '0 20px 50px rgba(37,99,235,0.08)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)'
}}>
              <div style={{ fontSize: '12px', fontWeight: 850, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Filtros del examen</div>
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
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {((isCatalunaExam ? ['Ordinaria', 'Extraordinaria'] : ['Ordinaria', 'Extraordinaria', 'Modelo']) as Tipo[]).map(t => (
                  <button className={tipo === t ? 'campus-primary' : 'campus-hover'} key={t} onClick={() => cambiarTipo(t)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '7px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: tipo === t ? cfg.color : WARM.field, color: tipo === t ? '#fff' : WARM.muted, border: tipo === t ? 'none' : '1px solid #dbe7fb' } as any}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      {t === 'Ordinaria' ? <ClipboardList size={14} /> : t === 'Extraordinaria' ? <FileText size={14} /> : <Target size={14} />}
                      {t}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {aniosDisponibles.map((anio, i) => (
  <button
    className={examenIdx === i ? 'campus-primary' : 'campus-hover'}
    key={anio}
    onClick={() => {
      setExamenIdx(i)
      setCatEjercicioIdx(0)
      setCatHistoriaEjercicioIdx(0)
      setCatFisicaEjercicioIdx(0)
      setCatAsignaturaEjercicioIdx(0)
      setBloqueIdx(0)
      setDiaHistoriaIdx(0)
      setOpcion(0)
      reset()
    }}
    style={{
      ...hoverVars(cfg.color, cfg.light, cfg.accent),
      padding: '6px 14px',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 700,
      background: examenIdx === i ? cfg.color : WARM.field,
      color: examenIdx === i ? '#fff' : WARM.ink,
      border: examenIdx === i ? 'none' : '1px solid #dbe7fb'
    } as any}
  >
    {anio}
  </button>
))}
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
                        } as any}
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
                      } as any}
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
                      } as any}
                    >
                      {ejercicio.titulo}
                    </button>
                  ))}
                </div>
              )}
              {isCatalunaHistoria && ejerciciosCatalunaHistoria.length > 0 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  {ejerciciosCatalunaHistoria.map((ejercicio: any, i: number) => {
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
                        } as any}
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
                      } as any}
                    >
                      {version}
                    </button>
                  ))}
                </div>
              )}
              {!isCatalunaExam && <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {asignatura === 'mates' ? bloquesMates.map((bloque: string, i: number) => (
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => cambiarBloqueMates(i, bloque)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as any}>{i + 1}. {bloque} · {puntosBloqueMates(bloque)}pts</button>
                )) : (asignatura === 'fisica' ? TIPOS_FISICA : asignatura === 'quimica' ? bloquesQuimica : asignatura === 'biologia' ? bloquesBiologia : asignatura === 'lengua' ? bloquesLengua : asignatura === 'ingles' ? bloquesIngles : bloquesHistoria).map((t: any, i: number) => (
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => { asignatura === 'fisica' ? cambiarBloqueFisica(i, t.tipo) : asignatura === 'quimica' ? cambiarBloqueQuimica(i, t.tipo) : asignatura === 'biologia' ? cambiarBloqueBiologia(i, t.tipo) : setBloqueIdx(i); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as any}>{t.label} · {asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : asignatura === 'quimica' ? puntosBloqueQuimica(t.tipo) : asignatura === 'biologia' ? puntosBloqueBiologia(t.tipo) : (t as any).pts}pts</button>
                ))}
              </div>}
              {!isCatalunaExam && opcionesDisponibles.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: WARM.muted, fontWeight: 700 }}>Opción:</span>
                  {opcionesDisponibles.map(op => (
                    <button className={opcion === op ? 'campus-primary' : 'campus-hover'} key={op} onClick={() => { setOpcion(op); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', background: opcion === op ? cfg.color : WARM.field, color: opcion === op ? '#fff' : WARM.ink, border: opcion === op ? 'none' : '1px solid #dbe7fb' } as any}>{op === 0 ? 'A' : 'B'}</button>
                  ))}
                </div>
              )}
            </div>}

            <div className="exams-workspace">
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
             <div className="exams-question-card" key={preguntaActivaKey} style={{
  background: 'rgba(255, 255, 255, 0.82)',
  borderRadius: '24px',
  border: '1px solid rgba(219, 231, 251, 0.80)',
  overflow: 'clip',
  marginBottom: '22px',
  boxShadow: '0 4px 20px rgba(37,99,235,0.07), 0 1px 4px rgba(37,99,235,0.04)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)'
}}>
                <div style={{ padding: '16px 24px', backgroundColor: cfg.light, borderBottom: '2px solid ' + cfg.accent, display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{examSystemLabel(ccaa)} {examenActivo?.año} · {tipo}</span>
                    {asignatura === 'historia' && diaHistoriaSeleccionado && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{diaHistoriaSeleccionado}</span>
                    )}
                    {asignatura === 'lengua' && versionExamenSeleccionada && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{versionExamenSeleccionada}</span>
                    )}
                    {asignatura === 'ingles' && versionExamenSeleccionada && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{versionExamenSeleccionada}</span>
                    )}
                    {asignatura === 'biologia' && versionExamenSeleccionada && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{versionExamenSeleccionada}</span>
                    )}
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: cfg.color, color: '#fff', fontSize: '11px', fontWeight: 600 }}>{bloqueActivoLabel}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: WARM.wash, color: WARM.ink, fontSize: '11px', border: '1px solid ' + cfg.soft }}>{asignatura === 'lengua' ? 'Versión' : asignatura === 'ingles' || asignatura === 'biologia' ? 'Sesión / opción' : 'Opción'} {opcionMostrada}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: cfg.color }}>{formatPts(puntuacionPreguntaActiva)}</span>
                    <span style={{ fontSize: '13px', color: cfg.accent }}>pts</span>
                  </div>
                </div>
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                  {asignatura === 'ingles' && (preguntaActiva as any)?.texto_fuente && (
                    <div style={{ marginBottom: '18px', padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Text</div>
                      <ExamStatement
                        key={`${preguntaActivaKey}-texto`}
                        text={(preguntaActiva as any).texto_fuente}
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
                        format={false}
                        components={mdComponents}
                        storageKey={enunciadoStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode
                      />
                    </div>
                  )}
                  {(asignatura === 'historia' || (asignatura === 'lengua' && bloqueIdx > 0)) && (preguntaActiva as any)?.texto_fuente && (
                    <div style={{ marginBottom: '18px', padding: '18px 20px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Texto fuente oficial</div>
                      <ExamStatement
                        text={(preguntaActiva as any).texto_fuente}
                        components={mdComponents}
                        storageKey={fuenteStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode={asignatura === 'lengua'}
                      />
                    </div>
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).imagen_url && (
                    <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Documento visual</div>
                      <img
                        src={(preguntaActiva as any).imagen_url}
                        alt="Fuente histórica"
                        className="max-w-full rounded-2xl border border-slate-200 shadow-sm"
                      />
                    </div>
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).imagenFuente && (
                    <div style={{ marginBottom: '18px', padding: '14px', borderRadius: '20px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>Fuente histórica oficial</div>
                      <img src={(preguntaActiva as any).imagenFuente} alt="Fuente histórica oficial" style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', display: 'block' }} />
                    </div>
                  )}
                  {asignatura === 'quimica' && (preguntaActiva as any).pdfFuente && (
                    <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <a href={(preguntaActiva as any).pdfFuente} target="_blank" rel="noreferrer" style={{ padding: '8px 12px', borderRadius: '999px', background: cfg.light, color: cfg.color, border: '1px solid ' + cfg.soft, fontSize: '12px', fontWeight: 800, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                        <FileText size={14} />Ver PDF oficial
                      </a>
                    </div>
                  )}
                  {Array.isArray((preguntaActiva as any).imagenes) && (preguntaActiva as any).imagenes.length > 0 && (
                    <div style={{ marginBottom: '18px', display: 'grid', gap: '12px' }}>
                      {(preguntaActiva as any).imagenes.map((src: string, i: number) => (
                        <img key={src} src={src} alt={`Imagen oficial ${i + 1}`} style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '18px', border: '1px solid #e5edf9', background: '#fff' }} />
                      ))}
                    </div>
                  )}
                  {(preguntaActiva as any).requiereImagen && (!Array.isArray((preguntaActiva as any).imagenes) || (preguntaActiva as any).imagenes.length === 0) && (
                    <div style={{ marginBottom: '18px', padding: '16px 18px', borderRadius: '18px', background: cfg.light, color: cfg.color, border: '1px dashed ' + cfg.accent, fontSize: '13px', fontWeight: 800 }}>
                      {asignatura === 'biologia'
                        ? 'Este ejercicio requiere una imagen o esquema pendiente de revisión.'
                        : 'Esta pregunta incluye una imagen que se añadirá próximamente.'}
                    </div>
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).conceptos && (
                    <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(preguntaActiva as any).conceptos.map((c: string, i: number) => (
                        <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: cfg.light, color: cfg.color, border: '1px solid ' + cfg.accent, fontSize: '12px', fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  {asignatura !== 'ingles' && (
                    <div style={{ padding: '20px 22px', borderRadius: '22px', background: '#fff', border: '1px solid #e5edf9', boxShadow: '0 14px 34px rgba(37,99,235,0.07)' }}>
                      <div style={{ fontSize: '11px', fontWeight: 850, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Enunciado</div>
                      <ExamStatement
                        text={enunciadoActivo}
                        format={false}
                        components={mdComponents}
                        storageKey={enunciadoStorageKey}
                        accentColor={cfg.color}
                        softColor={cfg.light}
                        readingMode={asignatura === 'lengua'}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

           {!isCatalunaExam && preguntaActiva && <div className="exams-answer-card" style={{
  background: 'rgba(255, 255, 255, 0.82)',
  borderRadius: '24px',
  border: '1px solid rgba(219, 231, 251, 0.80)',
  padding: '26px',
  marginBottom: '22px',
  boxShadow: '0 4px 20px rgba(37,99,235,0.07), 0 1px 4px rgba(37,99,235,0.04)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)'
}}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: WARM.muted, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu respuesta</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['texto', 'imagen'] as const).map(m => (
                  <button className={modo === m ? 'campus-primary' : 'campus-hover'} key={m} onClick={() => setModo(m)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '9px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: modo === m ? 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')' : cfg.light, color: modo === m ? '#fff' : cfg.color, display: 'flex', alignItems: 'center', gap: '8px' }}>{m === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}{m === 'texto' ? 'Escribir' : 'Subir foto'}</button>
                ))}
              </div>
              {modo === 'texto' ? (
                <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} placeholder="Empieza a resolver el problema aquí..." style={{ width: '100%', height: asignatura === 'historia' || asignatura === 'lengua' ? '280px' : '180px', borderRadius: '16px', padding: '14px', fontSize: '14px', lineHeight: '1.7', border: '1.5px solid #dbe7fb', background: WARM.field, color: '#1f2937', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
                  {imagenPreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagenPreview} alt="Respuesta" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '16px', border: '1.5px solid #dbe7fb' }} />
                      <button onClick={() => { setImagen(null); setImagenPreview(null) }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <div className="campus-hover" onClick={() => fileRef.current?.click()} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), height: '180px', borderRadius: '18px', border: '2px dashed ' + cfg.accent, background: cfg.light + '40', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } as any}>
                      <UploadCloud size={34} color={cfg.color} />
                      <p style={{ fontSize: '14px', fontWeight: 600, color: cfg.color, margin: '8px 0 4px' }}>Haz clic para subir una foto</p>
                      <p style={{ fontSize: '12px', color: cfg.accent, margin: '0' }}>Fotografía tu respuesta manuscrita</p>
                    </div>
                  )}
                </div>
              )}
              <button className="campus-primary exams-correct-button" onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), marginTop: '16px', width: '100%', padding: '15px', borderRadius: '18px', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', background: cargando ? '#94a3b8' : 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')', color: '#fff', fontSize: '15px', fontWeight: 760, opacity: (cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)) ? 0.5 : 1, boxShadow: cargando ? 'none' : '0 16px 34px ' + cfg.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                {cargando ? <PausiaLoadingDot /> : <WandSparkles size={17} />}{cargando ? 'Corrigiendo con Pausia...' : 'Corregir con IA'}
              </button>
            </div>}

            {!isCatalunaExam && correccion && (
              <div style={{ borderRadius: '24px', border: '1.5px solid var(--pau-lilac-border)', overflow: 'hidden', background: 'linear-gradient(145deg, rgba(255,255,255,0.97), rgba(238,232,255,0.48))', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', boxShadow: '0 4px 20px rgba(124,58,237,0.08), 0 1px 4px rgba(124,58,237,0.04)' }}>
                <div style={{ padding: '14px 22px', background: 'linear-gradient(135deg, #6d28d9, #7c3aed, #8b5cf6)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><WandSparkles size={16} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px', letterSpacing: '-0.01em' }}>Corrección de Pausia</span>
                </div>
                <div style={{ padding: '24px', fontSize: '0.925rem', lineHeight: '1.75' }}>
                  <CorrectionResultCard correction={correccion} officialMaxScore={puntuacionPreguntaActiva} components={mdComponents} />
                </div>
              </div>
            )}
              </div>

              <aside className="exams-ai-panel" aria-label="Panel de feedback de Pausia">
                <div className="exams-side-card">
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                    <div>
                      <div className="exams-side-label">Nota estimada</div>
                      <div style={{ marginTop: 6, color: '#111827', fontSize: 38, lineHeight: 1, fontWeight: 920 }}>
                        {correccion ? correctionScoreLabel : '--'}
                        <span style={{ marginLeft: 5, color: '#6b7280', fontSize: 14, fontWeight: 800 }}>{correctionScoreLabel === '--' ? '' : 'pts'}</span>
                      </div>
                      <p className="exams-side-text" style={{ marginTop: 8 }}>
                        {correccion ? `Corrección generada. Máximo oficial: ${!isCatalunaExam && preguntaActiva ? formatPts(puntuacionPreguntaActiva) : '--'} pts.` : 'Resuelve el ejercicio y Pausia te dará feedback específico.'}
                      </p>
                    </div>
                    <div style={{ width: 42, height: 42, borderRadius: 16, display: 'grid', placeItems: 'center', background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }}>
                      <WandSparkles size={20} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: 10 }}>
                    <div className="exams-side-section">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#dcfce7', color: '#16a34a', fontSize: 12, fontWeight: 900 }}>✓</span>
                        <div className="exams-side-label" style={{ color: '#15803d' }}>Puntos fuertes</div>
                      </div>
                      <p className="exams-side-text">
                        {correccion ? 'Disponibles en la corrección detallada generada por Pausia.' : 'Aquí aparecerán tus puntos fuertes.'}
                      </p>
                    </div>
                    <div className="exams-side-section">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 18, height: 18, borderRadius: 999, display: 'grid', placeItems: 'center', background: '#ffedd5', color: '#ea580c', fontSize: 12, fontWeight: 900 }}>!</span>
                        <div className="exams-side-label" style={{ color: '#c2410c' }}>Errores a corregir</div>
                      </div>
                      <p className="exams-side-text">
                        {correccion ? 'Consulta el detalle para ver fallos concretos, pasos omitidos y mejoras.' : 'Aquí verás qué debes corregir.'}
                      </p>
                    </div>
                    <div className="exams-side-section" style={{ background: '#f5f3ff', borderColor: '#ddd6fe' }}>
                      <div className="exams-side-label" style={{ color: '#7c3aed' }}>Teoría relacionada</div>
                      <p className="exams-side-text">
                        {!isCatalunaExam && preguntaActiva ? bloqueActivoLabel : 'Selecciona un ejercicio para ver el bloque asociado.'}
                      </p>
                      <a href="/planning" style={{ marginTop: 12, border: '1px solid #ddd6fe', background: '#ffffff', color: '#6d28d9', borderRadius: 999, padding: '8px 11px', fontSize: 12, fontWeight: 850, display: 'inline-flex', textDecoration: 'none' }}>
                        Ver material de repaso
                      </a>
                    </div>
                  </div>
                </div>

                <div className="exams-side-card" style={{ background: 'linear-gradient(145deg, #ffffff, #f8fafc)' }}>
                  <div className="exams-side-label">Racha de estudio</div>
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', background: '#fff7ed', color: '#ea580c', boxShadow: '0 10px 22px rgba(15,23,42,0.06)' }}>
                      <Flame size={20} />
                    </div>
                    <div>
                      <div style={{ color: '#111827', fontSize: 15, fontWeight: 850 }}>Sesión activa</div>
                      <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 650, marginTop: 2 }}>
                        {respuesta.trim() || imagen ? 'Respuesta en progreso' : 'Empieza con el enunciado actual'}
                      </div>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <footer className="exams-footer">
              <div>
                <strong style={{ color: '#111827' }}>Pausia</strong>
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
        )}

        {seccion === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mensajes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '58px', height: '58px', borderRadius: '20px', background: 'linear-gradient(145deg, #1d4ed8, #2563eb 54%, #38bdf8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 16px 34px rgba(37,99,235,0.22)' }}><MessageCircle size={28} /></div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>¡Hola! Soy Pausia</div>
                  <div style={{ fontSize: '15px', color: WARM.muted, maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>Tu compa de estudio para {examSystemLabel(ccaa)}.</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
                    {['¿Cómo es el examen de mates?', '¿Qué temas caen en historia?', 'Explícame la Segunda República'].map(s => (
                      <button className="campus-hover" key={s} onClick={() => setInputChat(s)} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '8px 16px', borderRadius: '20px', background: WARM.wash, border: '1px solid #dbe7fb', color: WARM.muted, fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {mensajes.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.rol === 'usuario' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: msg.rol === 'usuario' ? '#2563eb' : 'linear-gradient(145deg, #1d4ed8, #2563eb 58%, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                    {msg.rol === 'usuario' ? usuario?.email?.[0]?.toUpperCase() : 'P'}
                  </div>
                  <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '18px', background: msg.rol === 'usuario' ? '#2563eb' : WARM.surface, color: msg.rol === 'usuario' ? '#fff' : '#1f2937', border: msg.rol === 'pausia' ? '1px solid #dbe7fb' : 'none', fontSize: '14px', lineHeight: '1.7', boxShadow: msg.rol === 'pausia' ? '0 10px 24px rgba(37,99,235,0.06)' : '0 10px 24px rgba(37,99,235,0.12)' }}>
                    {msg.rol === 'pausia' ? <MathMarkdown text={msg.texto} format={false} components={mdComponents} /> : msg.texto}
                  </div>
                </div>
              ))}
              {cargandoChat && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(145deg, #1d4ed8, #2563eb 58%, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>P</div>
                  <div style={{ padding: '12px 16px', borderRadius: '18px', background: WARM.surface, border: '1px solid #dbe7fb', color: WARM.muted, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}><PausiaLoadingDot className="text-blue-500" />Pausia está escribiendo...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '16px 0 24px', borderTop: '1px solid #dbe7fb' }}>
              <div style={{ display: 'flex', gap: '10px', background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '8px 8px 8px 16px', alignItems: 'flex-end', boxShadow: '0 16px 38px rgba(37,99,235,0.08)' }}>
                <textarea value={inputChat} onChange={e => setInputChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat() } }} placeholder="Pregunta lo que quieras a Pausia..." rows={1} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', lineHeight: '1.6', resize: 'none', background: 'transparent', color: '#1f2937', fontFamily: 'inherit', maxHeight: '120px' }} />
                <button className="campus-primary" onClick={enviarChat} disabled={!inputChat.trim() || cargandoChat} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '10px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: inputChat.trim() && !cargandoChat ? 'linear-gradient(135deg, #1d4ed8, #60a5fa)' : '#dbe7fb', color: inputChat.trim() && !cargandoChat ? '#fff' : WARM.softText, fontSize: '13px', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '7px' }}>{cargandoChat ? <PausiaLoadingDot /> : <SendHorizontal size={15} />}{cargandoChat ? 'Pensando...' : 'Enviar'}</button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: WARM.softText, margin: '8px 0 0' }}>Enter para enviar · Shift+Enter para nueva línea</p>
            </div>
          </div>
        )}

        {seccion === 'historial' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            {cargandoHistorial ? (
              <div style={{ textAlign: 'center', padding: '60px', color: WARM.muted }}>Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '20px', background: WARM.wash, color: WARM.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 14px 30px rgba(37,99,235,0.14)', border: '1px solid #dbeafe' }}><BarChart3 size={28} /></div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>Sin correcciones aún</div>
                <div style={{ fontSize: '14px', color: WARM.muted }}>Haz tu primera corrección en Exámenes</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total correcciones</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: WARM.ink }}>{historial.length}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Matemáticas</div>
                    {mediaM ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaM)) }}>{mediaM}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Física</div>
                    {mediaFisica ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaFisica)) }}>{mediaFisica}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Química</div>
                    {mediaQuimica ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaQuimica)) }}>{mediaQuimica}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Biología</div>
                    {mediaBiologia ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaBiologia)) }}>{mediaBiologia}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Inglés</div>
                    {mediaIngles ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaIngles)) }}>{mediaIngles}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Lengua</div>
                    {mediaLengua ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaLengua)) }}>{mediaLengua}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.78)', borderRadius: '18px', border: '1px solid rgba(219,231,251,0.80)', padding: '20px', textAlign: 'center', boxShadow: '0 2px 12px rgba(37,99,235,0.06)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Historia</div>
                    {mediaHist ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaHist)) }}>{mediaHist}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historial.map((item, i) => {
                    const itemCfg = ASIGNATURAS[item.asignatura as Asignatura] ?? ASIGNATURAS.historia
                    return (
                    <div className="campus-hover" key={i} onClick={() => setItemSeleccionado(item)} style={{ ...hoverVars(itemCfg.color, itemCfg.light, itemCfg.accent), background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', cursor: 'pointer', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: itemCfg.color }}>{nombreAsignatura(item.asignatura)}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: WARM.wash, color: WARM.muted, fontSize: '11px' }}>{item.tipo}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: WARM.wash, color: WARM.muted, fontSize: '11px' }}>{item.año}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: WARM.wash, color: WARM.muted, fontSize: '11px' }}>{item.bloque}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: WARM.softText, marginTop: '4px' }}>{new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {item.nota !== null && item.nota_maxima !== null && (
                          <div>
                            <span style={{ fontSize: '28px', fontWeight: 800, color: colorNota(item.nota / item.nota_maxima * 10) }}>{item.nota}</span>
                            <span style={{ fontSize: '14px', color: WARM.softText }}>/{item.nota_maxima}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: WARM.muted, display: 'flex', alignItems: 'center', gap: '6px' }}>Haz clic para ver la corrección completa <ArrowUpRight size={14} /></div>
                    </div>
                  )})}
                </div>
              </div>
            )}
          </main>
        )}

        {seccion === 'planning' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            <div style={{ background: WARM.surface, borderRadius: '28px', border: '1px solid #dbe7fb', padding: '30px', marginBottom: '20px', textAlign: 'center', boxShadow: WARM.shadow }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '22px', background: 'linear-gradient(145deg, #1d4ed8, #2563eb 52%, #38bdf8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', boxShadow: '0 18px 38px rgba(37,99,235,0.24), inset 0 1px 0 rgba(255,255,255,0.28)' }}><Rocket size={30} /></div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>Plan de estudio personalizado</div>
              <div style={{ fontSize: '14px', color: WARM.muted, marginBottom: '20px' }}>Pausia mira tus correcciones y te monta una semana realista para remontar puntos débiles</div>
              <button className="campus-primary" onClick={generarPlan} disabled={cargandoPlan} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: cargandoPlan ? 'not-allowed' : 'pointer', background: cargandoPlan ? '#cbd5e1' : 'linear-gradient(135deg, #1d4ed8, #60a5fa)', color: '#fff', fontSize: '15px', fontWeight: 700, boxShadow: cargandoPlan ? 'none' : '0 16px 34px rgba(37,99,235,0.22)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                {cargandoPlan ? <PausiaLoadingDot /> : <BrainCircuit size={17} />}
                {cargandoPlan ? 'Generando...' : 'Abrir Mi Plan'}
              </button>
            </div>
            {planIA && (
              <div style={{ background: WARM.surface, borderRadius: '28px', border: '1px solid #dbe7fb', overflow: 'hidden', boxShadow: WARM.shadow }}>
                <div style={{ padding: '18px 24px', background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '10px', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BrainCircuit size={17} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>TU PLAN SEMANAL · PAUSIA</span>
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
                  {itemSeleccionado.nota !== null && (
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: colorNota(itemSeleccionado.nota / itemSeleccionado.nota_maxima * 10) }}>{itemSeleccionado.nota}</span>
                      <span style={{ fontSize: '13px', color: WARM.softText }}>/{itemSeleccionado.nota_maxima}</span>
                    </div>
                  )}
                  <button className="campus-primary" onClick={() => abrirChatConContexto(itemSeleccionado)} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '9px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={15} />Preguntar a Pausia</button>
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
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Corrección de Pausia</div>
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
