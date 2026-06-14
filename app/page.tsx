'use client'
import { useState, useRef, useEffect } from 'react'
import { examenes, examenesHistoria } from './data/examenes'
import { examenesFisica } from './data/fisica'
import { examenesQuimica } from './data/quimica'
import { examenesLengua } from './data/lengua'
import { supabase } from './lib/supabase'
import { buildCorrectionPrompt, correctionJsonToMarkdown, parseCorrectionJson } from './lib/correctionPrompt'
import { formatExamText } from './lib/mathFormatting'
import Sidebar, { type SidebarItemId } from './components/Sidebar'
import MathMarkdown from '@/components/shared/MathMarkdown'
import {
  ArrowUpRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Camera,
  ClipboardList,
  FileText,
  Flame,
  FlaskConical,
  GraduationCap,
  Landmark,
  LibraryBig,
  LogOut,
  MessageCircle,
  PenLine,
  Rocket,
  SendHorizontal,
  Sigma,
  Target,
  TimerReset,
  UploadCloud,
  WandSparkles,
  X
} from 'lucide-react'
const ASIGNATURAS = {
  mates: { label: 'Matemáticas II', short: 'Mates', icon: Sigma, color: '#b4232a', light: '#fff1f2', accent: '#fb7185', soft: '#ffe4e6' },
  fisica: { label: 'Física', short: 'Física', icon: Atom, color: '#1e3a8a', light: '#eff6ff', accent: '#3b82f6', soft: '#dbeafe' },
  quimica: { label: 'Química', short: 'Química', icon: FlaskConical, color: '#c2410c', light: '#fff7ed', accent: '#fb923c', soft: '#fed7aa' },
  lengua: { label: 'Lengua Castellana y Literatura II', short: 'Lengua', icon: BookOpen, color: '#7c2d12', light: '#fff7ed', accent: '#f97316', soft: '#fed7aa' },
  historia: { label: 'Historia de España', short: 'Historia', icon: Landmark, color: '#a16207', light: '#fffbeb', accent: '#facc15', soft: '#fef3c7' }
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
  }
}

const mdComponents = {
  h1: ({children}: any) => <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.2rem 0 0.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.3rem' }}>{children}</h1>,
  h2: ({children}: any) => <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '1rem 0 0.4rem' }}>{children}</h2>,
  h3: ({children}: any) => <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: '0.8rem 0 0.3rem' }}>{children}</h3>,
  strong: ({children}: any) => <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>,
  p: ({children}: any) => <p style={{ margin: '0.4rem 0', color: '#374151' }}>{children}</p>,
  li: ({children}: any) => <li style={{ margin: '0.25rem 0', color: '#374151' }}>{children}</li>,
  blockquote: ({children}: any) => <blockquote style={{ borderLeft: '3px solid #9ca3af', paddingLeft: '1rem', margin: '0.8rem 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
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

type Asignatura = 'mates' | 'fisica' | 'quimica' | 'lengua' | 'historia'
type Tipo = 'Ordinaria' | 'Extraordinaria' | 'Modelo'
type Seccion = 'examenes' | 'chat' | 'historial' | 'planning'
interface MensajeChat { rol: 'usuario' | 'pausia'; texto: string }

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

function calcMedia(items: any[]) {
  if (!items.length) return null
  return (items.reduce((a: number, h: any) => a + (h.nota / h.nota_maxima * 10), 0) / items.length).toFixed(1)
}

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
  const [seccion, setSeccion] = useState<Seccion>('examenes')
  const [asignatura, setAsignatura] = useState<Asignatura>('mates')
  const [tipo, setTipo] = useState<Tipo>('Ordinaria')
  const [examenIdx, setExamenIdx] = useState(0)
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

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUsuario(data.user)
    })
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    if (seccion === 'historial') {
      setCargandoHistorial(true)
      supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(50)
        .then(({ data }) => { setHistorial(data || []); setCargandoHistorial(false) })
    }
  }, [seccion])

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

const examenesFiltrados =
    asignatura === 'mates'
      ? examenes.filter(e => e.tipo === tipo)
      : asignatura === 'fisica'
        ? examenesFisica.filter(e => e.tipo === tipo)
        : asignatura === 'quimica'
          ? examenesQuimica.filter(e => e.tipo === tipo)
          : asignatura === 'lengua'
            ? examenesLengua.filter(e => e.tipo === tipo)
            : examenesHistoria.filter(e => e.tipo === tipo)

const aniosDisponibles = Array.from(
  new Set(examenesFiltrados.map(e => e.año))
)

const anioSeleccionado = aniosDisponibles[examenIdx] ?? aniosDisponibles[0]

const examen = examenesFiltrados.find(e => e.año === anioSeleccionado) ?? examenesFiltrados[0]

const examenesHistoriaDelAnio = asignatura === 'historia'
  ? examenesHistoria.filter(e => e.tipo === tipo && e.año === anioSeleccionado)
  : []

const diasHistoriaDisponibles = Array.from(
  new Set(examenesHistoriaDelAnio.map(e => e.dia).filter(Boolean))
) as ('Lunes' | 'Martes')[]

const diaHistoriaSeleccionado = diasHistoriaDisponibles[diaHistoriaIdx] ?? diasHistoriaDisponibles[0]

const examenesHistoriaDelDia = diasHistoriaDisponibles.length
  ? examenesHistoriaDelAnio.filter(e => e.dia === diaHistoriaSeleccionado)
  : examenesHistoriaDelAnio

const examenesLenguaDelAnio = asignatura === 'lengua'
  ? examenesLengua.filter(e => e.tipo === tipo && e.año === anioSeleccionado)
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
    : asignatura === 'historia' && opcionesHistoriaDisponibles.length
    ? OPCIONES.filter(op => opcionesHistoriaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : asignatura === 'lengua'
    ? []
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
  asignatura === 'lengua' ? preguntaLengua :
  preguntaHistoria

const examenActivo = asignatura === 'lengua'
  ? examenLengua
  : asignatura === 'historia'
    ? examenHistoria ?? examen
    : examen

const enunciadoActivo = formatEnunciado((preguntaActiva as any)?.enunciado)

const bloqueActivoLabel =
  asignatura === 'mates' ? (preguntaActiva as any)?.bloque :
  asignatura === 'fisica' ? (TIPOS_FISICA[bloqueIdx]?.label ?? '') :
  asignatura === 'quimica' ? ((preguntaActiva as any)?.label ?? bloquesQuimica[bloqueIdx]?.label ?? '') :
  asignatura === 'lengua' ? ((preguntaActiva as any)?.label ?? bloquesLengua[bloqueIdx]?.label ?? '') :
  ((preguntaActiva as any)?.label ?? LABELS_HISTORIA[(preguntaActiva as any)?.tipo] ?? '')

const opcionMostrada = asignatura === 'lengua'
  ? (versionLenguaSeleccionada ?? 'Única')
  : (preguntaActiva as any)?.opcion ?? (opcion === 0 ? 'A' : 'B')

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

function nombreAsignatura(a: string) {
  if (a === 'mates') return 'Matematicas II'
  if (a === 'fisica') return 'Física'
  if (a === 'quimica') return 'Química'
  if (a === 'lengua') return 'Lengua Castellana y Literatura II'
  return 'Historia de Espana'
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
  setBloqueIdx(0)
  setDiaHistoriaIdx(0)
  setOpcion(0)
  setTipo('Ordinaria')
  reset()
}

function cambiarTipo(t: Tipo) {
  setTipo(t)
  setExamenIdx(0)
  setBloqueIdx(0)
  setDiaHistoriaIdx(0)
  setOpcion(0)
  reset()
}
  async function cerrarSesion() { await supabase.auth.signOut(); window.location.href = '/login' }

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
    const p = preguntaActiva as any
    const puntuacionMax = Number(p?.puntuacion ?? p?.puntos ?? 10)
    const prompt = buildCorrectionPrompt({
      subject: nombreAsignatura(asignatura),
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
    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: prompt, imagen: modo === 'imagen' ? imagen : null, imagenTipo: modo === 'imagen' ? imagenTipo : null })
      })
      if (!res.ok) {
        setCorreccion('No se pudo obtener la corrección. Comprueba tu conexión e inténtalo de nuevo.')
        return
      }
      const data = await res.json()
      const correccionJson = parseCorrectionJson(data.respuesta || '')
      const correccionVisible = correccionJson ? correctionJsonToMarkdown(correccionJson) : (data.respuesta || 'La corrección no devolvió respuesta. Inténtalo de nuevo.')
      setCorreccion(correccionVisible)
      const bloqueJson = correccionJson?.desglose_bloques?.[0]
      const partes = !correccionJson ? data.respuesta?.match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/) : null
      const nota = bloqueJson?.puntos_conseguidos != null
        ? Number(bloqueJson.puntos_conseguidos)
        : partes ? parseFloat(partes[1].replace(',', '.')) : null
      const notaMax = bloqueJson?.puntos_maximos != null
        ? Number(bloqueJson.puntos_maximos)
        : partes ? parseFloat(partes[2].replace(',', '.')) : null
      supabase.from('historial_examenes').insert({
        user_id: usuario.id, asignatura, tipo, año: examenActivo?.año,
        bloque: bloqueActivoLabel || '',
        opcion: asignatura === 'lengua' ? opcionMostrada : opcion === 0 ? 'A' : 'B', nota, nota_maxima: notaMax,
        enunciado: enunciadoActivo?.substring(0, 500),
        respuesta: respuesta?.substring(0, 1000),
        correccion: correccionVisible?.substring(0, 2000)
      }).then(() => {})
    } catch {
      setCorreccion('Error de conexión. Comprueba tu red e inténtalo de nuevo.')
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
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: 'Eres Pausia, tutor EBAU Madrid. Responde dudas sobre matematicas, fisica, quimica, lengua e historia.\n' +
          (contextoChat ? 'CONTEXTO: ' + contextoChat + '\n' : '') +
          hist.map(m => (m.rol === 'usuario' ? 'Estudiante' : 'Pausia') + ': ' + m.texto).join('\n') +
          '\nResponde solo como Pausia.'
      })
    })
    const data = await res.json()
    setMensajes(prev => [...prev, { rol: 'pausia', texto: data.respuesta }])
    setCargandoChat(false)
  }

  function abrirChatConContexto(item: any) {
    const ctx = 'El estudiante acaba de revisar esta correccion:\n' +
      'Asignatura: ' + nombreAsignatura(item.asignatura) + '\n' +
      'Ejercicio: ' + item.bloque + ' - ' + item.tipo + ' ' + item.año + '\n' +
      'Nota obtenida: ' + item.nota + '/' + item.nota_maxima + '\n' +
      'Enunciado: ' + (item.enunciado || '') + '\n' +
      'Correccion: ' + (item.correccion || '') + '\n\n' +
      'El estudiante quiere entender mejor su nota. Ayudale de forma clara y motivadora.'
    setContextoChat(ctx)
    setMensajes([{ rol: 'pausia', texto: 'Hola! Veo que tienes dudas sobre tu correccion de ' + item.bloque + ' donde sacaste ' + item.nota + '/' + item.nota_maxima + '. Que parte no te queda clara? Preguntame lo que quieras.' }])
    setItemSeleccionado(null)
    setSeccion('chat')
  }

  async function generarPlan() {
    setCargandoPlan(true); setPlanIA('')
    const { data: hist } = await supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(20)
    const items = hist || []
    const resumen = items.length
      ? items.map((h: any) => {
          const pct = h.nota !== null && h.nota_maxima ? (h.nota / h.nota_maxima * 10).toFixed(1) : 'sin nota'
          return nombreAsignatura(h.asignatura) + ' - ' + h.bloque + ' - ' + h.tipo + ' ' + h.año + ': ' + pct + '/10'
        }).join('\n')
      : 'Sin correcciones aun'
    const prompt = 'Eres Pausia, entrenador de estudio para EBAU Madrid.\n' +
      'Genera un plan semanal útil, visual y concreto para esta app.\n\n' +
      'ASIGNATURAS DISPONIBLES EN LA APP: Matemáticas II, Física, Química, Lengua Castellana y Literatura II, Historia de España.\n' +
      'No inventes Inglés, Filosofía ni otras asignaturas si no aparecen en el historial.\n' +
      'Si no hay historial, crea un plan inicial SOLO con Matemáticas II, Física, Química, Lengua Castellana y Literatura II e Historia de España.\n\n' +
      'HISTORIAL DEL ESTUDIANTE:\n' + resumen + '\n\n' +
      'FORMATO OBLIGATORIO:\n' +
      '- Responde en Markdown.\n' +
      '- No uses emojis, pictogramas ni iconos Unicode.\n' +
      '- No uses tablas.\n' +
      '- Usa negritas con **texto** para datos importantes.\n' +
      '- Usa secciones claras: # Plan semanal de Pausia, ## Diagnóstico, ## Semana de estudio, ## Ejercicios prioritarios, ## Objetivo.\n' +
      '- Para cada día usa ### Lunes, ### Martes, etc.\n' +
      '- Cada día debe tener 2 o 3 tareas máximo, con duración aproximada y una entrega concreta que el estudiante pueda mandar a Pausia.\n' +
      '- Evita frases grandilocuentes. Tono cercano, directo y cero relleno.\n' +
      '- No menciones periódicos, apps externas ni recursos que no estén dentro de la app salvo que sea imprescindible.\n' +
      '- Si faltan datos, dilo en una frase breve y aun así da un plan inicial accionable.\n'
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: prompt })
    })
    const data = await res.json()
    setPlanIA(limpiarPlanGenerado(data.respuesta || ''))
    setCargandoPlan(false)
  }

  if (!usuario) return null

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
  const lenguaH = historial.filter((item: any) => item.asignatura === 'lengua')
  const historiaH = historial.filter((item: any) => item.asignatura === 'historia')

  const mediaM = calcMedia(matesH)
  const mediaFisica = calcMedia(fisicaH)
  const mediaQuimica = calcMedia(quimicaH)
  const mediaLengua = calcMedia(lenguaH)
  const mediaHist = calcMedia(historiaH)
  const versionesExamenDisponibles = asignatura === 'historia'
    ? diasHistoriaDisponibles
    : asignatura === 'lengua'
      ? versionesLenguaDisponibles
      : []
  const versionExamenSeleccionada = asignatura === 'historia'
    ? diaHistoriaSeleccionado
    : asignatura === 'lengua'
      ? versionLenguaSeleccionada
      : null

  return (
    <div style={{
  display: 'flex',
  minHeight: '100vh',
  background: 'radial-gradient(circle at 16% 12%, rgba(219, 234, 254, 0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224, 231, 255, 0.78), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186, 230, 253, 0.52), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
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
      `}</style>
      <Sidebar
        activeItem={seccion === 'planning' ? 'plan-estudio' : seccion as SidebarItemId}
        email={usuario?.email}
        onNavigate={(item) => setSeccion(item === 'plan-estudio' ? 'planning' : item as Seccion)}
        onLogout={cerrarSesion}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <header style={{
  background: 'rgba(255, 255, 255, 0.78)',
  backdropFilter: 'blur(22px)',
  borderBottom: '1px solid rgba(219, 231, 251, 0.9)',
  padding: '0 34px',
  height: '78px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 10
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '15px', background: cfg.light, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + cfg.soft }}>
              <HeaderIcon size={20} />
            </div>
            <div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: WARM.ink }}>
              {seccion === 'examenes' && cfg.label}
              {seccion === 'chat' && 'Chat con Pausia'}
              {seccion === 'historial' && 'Historial de correcciones'}
              {seccion === 'planning' && 'Mi plan de estudio'}
            </div>
            <div style={{ fontSize: '12px', color: WARM.softText, marginTop: '2px' }}>
              {seccion === 'examenes' && 'Practica con examenes oficiales EBAU Madrid'}
              {seccion === 'chat' && 'Resuelve dudas sin quedarte bloqueado'}
              {seccion === 'historial' && 'Todas tus correcciones guardadas'}
              {seccion === 'planning' && 'Tu semana de estudio, aterrizada'}
            </div>
            </div>
          </div>
          {seccion === 'examenes' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.entries(ASIGNATURAS) as [Asignatura, typeof ASIGNATURAS.mates][]).map(([key, val]) => {
                const Icon = val.icon
                return (
                <button className={asignatura === key ? 'campus-primary' : 'campus-hover'} key={key} onClick={() => cambiarAsignatura(key)} style={{ ...hoverVars(val.color, val.light, val.accent), padding: '8px 14px', borderRadius: '999px', border: asignatura === key ? '1px solid transparent' : '1px solid #dbe7fb', cursor: 'pointer', background: asignatura === key ? 'linear-gradient(135deg, ' + val.color + ', ' + val.accent + ')' : 'rgba(255,255,255,0.92)', color: asignatura === key ? '#fff' : WARM.muted, fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', boxShadow: asignatura === key ? '0 12px 24px ' + val.accent + '33' : '0 8px 20px rgba(37,99,235,0.04)' }}><Icon size={15} />{val.short}</button>
              )})}
            </div>
          )}
        </header>

        {seccion === 'examenes' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '980px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '16px', marginBottom: '22px' }}>
              {(['mates', 'fisica', 'quimica', 'lengua', 'historia'] as Asignatura[]).map(key => {
                const val = ASIGNATURAS[key]
                const card = SUBJECT_CARDS[key]
                const Icon = card.icon
                const active = asignatura === key
                return (
                  <button
                    className="campus-subject-card"
                    key={key}
                    onClick={() => cambiarAsignatura(key)}
                    style={{
                      ...hoverVars(val.color, val.light, val.accent),
                      position: 'relative',
                      overflow: 'hidden',
                      textAlign: 'left',
                      minHeight: '178px',
                      padding: '20px',
                      borderRadius: '24px',
                      border: active ? '1px solid ' + val.accent : '1px solid rgba(219,231,251,0.95)',
                      background: 'linear-gradient(145deg, #ffffff 0%, ' + val.light + ' 58%, ' + val.soft + ' 100%)',
                      cursor: 'pointer',
                      boxShadow: active ? '0 24px 55px ' + val.accent + '28' : '0 18px 45px rgba(37, 99, 235, 0.08)'
                    }}
                  >
                    <div style={{ position: 'absolute', right: '-34px', bottom: '-42px', width: '128px', height: '128px', borderRadius: '50%', background: val.accent + '22' }} />
                    <SubjectIllustration subject={key} color={val.color} accent={val.accent} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '19px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ffffff', color: val.color, boxShadow: '0 12px 28px rgba(37,99,235,0.08)', position: 'relative', zIndex: 2 }}>
                        <Icon size={26} strokeWidth={2.1} />
                      </div>
                      <div className="campus-arrow" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'linear-gradient(135deg, ' + val.color + ', ' + val.accent + ')' : '#ffffff', color: active ? '#fff' : val.color, boxShadow: '0 10px 22px rgba(37,99,235,0.08)', position: 'relative', zIndex: 2 }}>
                        <ArrowUpRight size={19} />
                      </div>
                    </div>
                    <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 760, color: WARM.ink, position: 'relative', zIndex: 2 }}>{card.title}</div>
                    <div style={{ marginTop: '5px', color: WARM.muted, fontSize: '13px', lineHeight: '1.45', position: 'relative', zIndex: 2, maxWidth: '72%' }}>{card.subtitle}</div>
                    <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.76)', color: val.color, fontSize: '11px', fontWeight: 760, position: 'relative', zIndex: 2 }}>
                      <Flame size={13} />{card.kicker}
                    </div>
                  </button>
                )
              })}
            </div>
           <div style={{
  background: 'rgba(255, 255, 255, 0.92)',
  borderRadius: '24px',
  border: '1px solid rgba(219, 231, 251, 0.95)',
  padding: '24px',
  marginBottom: '22px',
  boxShadow: WARM.shadow,
  backdropFilter: 'blur(12px)'
}}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Filtros</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {(['Ordinaria', 'Extraordinaria', 'Modelo'] as Tipo[]).map(t => (
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
              {(asignatura === 'historia' || asignatura === 'lengua') && versionesExamenDisponibles.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                  <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{asignatura === 'historia' ? 'Día:' : 'Versión:'}</span>
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
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {asignatura === 'mates' ? bloquesMates.map((bloque: string, i: number) => (
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => cambiarBloqueMates(i, bloque)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as any}>{i + 1}. {bloque} · {puntosBloqueMates(bloque)}pts</button>
                )) : (asignatura === 'fisica' ? TIPOS_FISICA : asignatura === 'quimica' ? bloquesQuimica : asignatura === 'lengua' ? bloquesLengua : bloquesHistoria).map((t: any, i: number) => (
                  <button className={bloqueIdx === i ? 'campus-primary' : 'campus-hover'} key={i} onClick={() => { asignatura === 'fisica' ? cambiarBloqueFisica(i, t.tipo) : asignatura === 'quimica' ? cambiarBloqueQuimica(i, t.tipo) : setBloqueIdx(i); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '6px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, background: bloqueIdx === i ? cfg.light : WARM.field, color: bloqueIdx === i ? cfg.color : WARM.muted, border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #dbe7fb' } as any}>{t.label} · {asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : asignatura === 'quimica' ? puntosBloqueQuimica(t.tipo) : (t as any).pts}pts</button>
                ))}
              </div>
              {opcionesDisponibles.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: WARM.muted, fontWeight: 700 }}>Opcion:</span>
                  {opcionesDisponibles.map(op => (
                    <button className={opcion === op ? 'campus-primary' : 'campus-hover'} key={op} onClick={() => { setOpcion(op); reset() }} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontWeight: 800, fontSize: '14px', background: opcion === op ? cfg.color : WARM.field, color: opcion === op ? '#fff' : WARM.ink, border: opcion === op ? 'none' : '1px solid #dbe7fb' } as any}>{op === 0 ? 'A' : 'B'}</button>
                  ))}
                </div>
              )}
            </div>

            {preguntaActiva && (
             <div style={{
  background: 'rgba(255, 253, 249, 0.95)',
  borderRadius: '24px',
  border: '1px solid rgba(242, 228, 212, 0.95)',
  overflow: 'hidden',
  marginBottom: '22px',
  boxShadow: WARM.shadow
}}>
                <div style={{ padding: '16px 24px', background: cfg.light, borderBottom: '2px solid ' + cfg.accent, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EBAU Madrid {examenActivo?.año} · {tipo}</span>
                    {asignatura === 'historia' && diaHistoriaSeleccionado && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{diaHistoriaSeleccionado}</span>
                    )}
                    {asignatura === 'lengua' && versionExamenSeleccionada && (
                      <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#fff', color: cfg.color, fontSize: '11px', border: '1px solid ' + cfg.accent, fontWeight: 700 }}>{versionExamenSeleccionada}</span>
                    )}
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: cfg.color, color: '#fff', fontSize: '11px', fontWeight: 600 }}>{bloqueActivoLabel}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: WARM.wash, color: WARM.ink, fontSize: '11px', border: '1px solid #fed7aa' }}>{asignatura === 'lengua' ? 'Versión' : 'Opcion'} {opcionMostrada}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: cfg.color }}>{preguntaActiva.puntuacion}</span>
                    <span style={{ fontSize: '13px', color: cfg.accent }}>pts</span>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  {(asignatura === 'historia' || (asignatura === 'lengua' && bloqueIdx > 0)) && (preguntaActiva as any).texto_fuente && (
                    <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '14px', background: WARM.field, borderLeft: '3px solid ' + cfg.accent, color: WARM.ink, fontSize: '14px', fontStyle: asignatura === 'historia' ? 'italic' : 'normal', lineHeight: '1.7' }}>
                      <div style={{ marginBottom: '8px', fontSize: '11px', fontWeight: 800, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Texto fuente oficial</div>
                      {(preguntaActiva as any).texto_fuente}
                    </div>
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).imagen_url && (
                    <img
                      src={(preguntaActiva as any).imagen_url}
                      alt="Fuente histórica"
                      className="mt-4 max-w-full rounded-lg border border-gray-200 shadow-sm"
                    />
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).imagenFuente && (
                    <div style={{ marginBottom: '16px', padding: '12px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
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
                  {asignatura === 'historia' && (preguntaActiva as any).conceptos && (
                    <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(preguntaActiva as any).conceptos.map((c: string, i: number) => (
                        <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: cfg.light, color: cfg.color, border: '1px solid ' + cfg.accent, fontSize: '12px', fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#1f2937' }}>
                    <MathMarkdown text={enunciadoActivo} components={mdComponents} />
                  </div>
                </div>
              </div>
            )}

           <div style={{
  background: 'rgba(255, 253, 249, 0.95)',
  borderRadius: '24px',
  border: '1px solid rgba(242, 228, 212, 0.95)',
  padding: '26px',
  marginBottom: '22px',
  boxShadow: WARM.shadow
}}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: WARM.muted, marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu respuesta</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['texto', 'imagen'] as const).map(m => (
                  <button className={modo === m ? 'campus-primary' : 'campus-hover'} key={m} onClick={() => setModo(m)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), padding: '9px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: modo === m ? 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')' : cfg.light, color: modo === m ? '#fff' : cfg.color, display: 'flex', alignItems: 'center', gap: '8px' }}>{m === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}{m === 'texto' ? 'Escribir' : 'Subir foto'}</button>
                ))}
              </div>
              {modo === 'texto' ? (
                <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} placeholder={asignatura === 'historia' || asignatura === 'lengua' ? 'Escribe tu respuesta aqui...' : 'Escribe tu resolucion paso a paso...'} style={{ width: '100%', height: asignatura === 'historia' || asignatura === 'lengua' ? '280px' : '180px', borderRadius: '16px', padding: '14px', fontSize: '14px', lineHeight: '1.7', border: '1.5px solid #dbe7fb', background: WARM.field, color: '#1f2937', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
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
                      <p style={{ fontSize: '12px', color: cfg.accent, margin: '0' }}>Fotografia tu respuesta manuscrita</p>
                    </div>
                  )}
                </div>
              )}
              <button className="campus-primary" onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)} style={{ ...hoverVars(cfg.color, cfg.light, cfg.accent), marginTop: '16px', width: '100%', padding: '15px', borderRadius: '18px', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', background: cargando ? '#94a3b8' : 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')', color: '#fff', fontSize: '15px', fontWeight: 760, opacity: (cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)) ? 0.5 : 1, boxShadow: cargando ? 'none' : '0 16px 34px ' + cfg.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                <WandSparkles size={17} />{cargando ? 'Pausia esta corrigiendo...' : 'Corregir con Pausia'}
              </button>
            </div>

            {correccion && (
              <div style={{ background: WARM.surface, borderRadius: '24px', border: '2px solid ' + cfg.color, overflow: 'hidden', boxShadow: WARM.shadow }}>
                <div style={{ padding: '16px 24px', background: cfg.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><WandSparkles size={16} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>CORRECCION DE PAUSIA</span>
                </div>
                <div style={{ padding: '24px', fontSize: '0.925rem', lineHeight: '1.75', background: 'linear-gradient(180deg, #ffffff, #fafafa)' }}>
                  <MathMarkdown text={correccion} format={false} components={mdComponents} />
                </div>
              </div>
            )}
          </main>
        )}

        {seccion === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mensajes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '58px', height: '58px', borderRadius: '20px', background: 'linear-gradient(145deg, #1d4ed8, #2563eb 54%, #38bdf8)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 16px 34px rgba(37,99,235,0.22)' }}><MessageCircle size={28} /></div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>Hola! Soy Pausia</div>
                  <div style={{ fontSize: '15px', color: WARM.muted, maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>Tu compa de estudio para la EBAU de Madrid.</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
                    {['Como es el examen de mates?', 'Que temas caen en historia?', 'Explicame la Segunda Republica'].map(s => (
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
                  <div style={{ padding: '12px 16px', borderRadius: '18px', background: WARM.surface, border: '1px solid #dbe7fb', color: WARM.muted, fontSize: '14px' }}>Pausia esta escribiendo...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '16px 0 24px', borderTop: '1px solid #dbe7fb' }}>
              <div style={{ display: 'flex', gap: '10px', background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '8px 8px 8px 16px', alignItems: 'flex-end', boxShadow: '0 16px 38px rgba(37,99,235,0.08)' }}>
                <textarea value={inputChat} onChange={e => setInputChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat() } }} placeholder="Pregunta lo que quieras a Pausia..." rows={1} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', lineHeight: '1.6', resize: 'none', background: 'transparent', color: '#1f2937', fontFamily: 'inherit', maxHeight: '120px' }} />
                <button className="campus-primary" onClick={enviarChat} disabled={!inputChat.trim() || cargandoChat} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '10px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: inputChat.trim() && !cargandoChat ? 'linear-gradient(135deg, #1d4ed8, #60a5fa)' : '#dbe7fb', color: inputChat.trim() && !cargandoChat ? '#fff' : WARM.softText, fontSize: '13px', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '7px' }}><SendHorizontal size={15} />Enviar</button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: WARM.softText, margin: '8px 0 0' }}>Enter para enviar · Shift+Enter para nueva linea</p>
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
                <div style={{ fontSize: '18px', fontWeight: 700, color: WARM.ink, marginBottom: '8px' }}>Sin correcciones aun</div>
                <div style={{ fontSize: '14px', color: WARM.muted }}>Haz tu primera correccion en Examenes</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total correcciones</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: WARM.ink }}>{historial.length}</div>
                  </div>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Matematicas</div>
                    {mediaM ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaM)) }}>{mediaM}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Física</div>
                    {mediaFisica ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaFisica)) }}>{mediaFisica}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Química</div>
                    {mediaQuimica ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaQuimica)) }}>{mediaQuimica}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Lengua</div>
                    {mediaLengua ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaLengua)) }}>{mediaLengua}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', textAlign: 'center', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Historia</div>
                    {mediaHist ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaHist)) }}>{mediaHist}<span style={{ fontSize: '16px', color: WARM.softText }}>/10</span></div> : <div style={{ fontSize: '16px', color: WARM.softText, marginTop: '8px' }}>Sin datos</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historial.map((item, i) => (
                    <div className="campus-hover" key={i} onClick={() => setItemSeleccionado(item)} style={{ ...hoverVars(item.asignatura === 'mates' ? ASIGNATURAS.mates.color : item.asignatura === 'fisica' ? ASIGNATURAS.fisica.color : item.asignatura === 'quimica' ? ASIGNATURAS.quimica.color : item.asignatura === 'lengua' ? ASIGNATURAS.lengua.color : ASIGNATURAS.historia.color, item.asignatura === 'mates' ? ASIGNATURAS.mates.light : item.asignatura === 'fisica' ? ASIGNATURAS.fisica.light : item.asignatura === 'quimica' ? ASIGNATURAS.quimica.light : item.asignatura === 'lengua' ? ASIGNATURAS.lengua.light : ASIGNATURAS.historia.light, item.asignatura === 'mates' ? ASIGNATURAS.mates.accent : item.asignatura === 'fisica' ? ASIGNATURAS.fisica.accent : item.asignatura === 'quimica' ? ASIGNATURAS.quimica.accent : item.asignatura === 'lengua' ? ASIGNATURAS.lengua.accent : ASIGNATURAS.historia.accent), background: WARM.surface, borderRadius: '18px', border: '1px solid #dbe7fb', padding: '20px', cursor: 'pointer', boxShadow: '0 12px 30px rgba(37,99,235,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: item.asignatura === 'mates' ? ASIGNATURAS.mates.color : item.asignatura === 'fisica' ? ASIGNATURAS.fisica.color : item.asignatura === 'quimica' ? ASIGNATURAS.quimica.color : item.asignatura === 'lengua' ? ASIGNATURAS.lengua.color : ASIGNATURAS.historia.color }}>{nombreAsignatura(item.asignatura)}</span>
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
                      <div style={{ fontSize: '13px', color: WARM.muted, display: 'flex', alignItems: 'center', gap: '6px' }}>Haz clic para ver la correccion completa <ArrowUpRight size={14} /></div>
                    </div>
                  ))}
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
              <div style={{ fontSize: '14px', color: WARM.muted, marginBottom: '20px' }}>Pausia mira tus correcciones y te monta una semana realista para remontar puntos debiles</div>
              <button className="campus-primary" onClick={generarPlan} disabled={cargandoPlan} style={{ ...hoverVars(WARM.blue, WARM.wash, '#60a5fa'), padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: cargandoPlan ? 'not-allowed' : 'pointer', background: cargandoPlan ? '#cbd5e1' : 'linear-gradient(135deg, #1d4ed8, #60a5fa)', color: '#fff', fontSize: '15px', fontWeight: 700, boxShadow: cargandoPlan ? 'none' : '0 16px 34px rgba(37,99,235,0.22)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                <BrainCircuit size={17} />
                {cargandoPlan ? 'Generando tu plan...' : planIA ? 'Regenerar plan' : 'Generar mi plan semanal'}
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
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #dbe7fb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.94)', backdropFilter: 'blur(18px)' }}>
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
                  <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '16px', background: WARM.field, border: '1px solid #dbe7fb' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Enunciado</div>
                    <MathMarkdown text={itemSeleccionado.enunciado} components={mdComponents} />
                  </div>
                )}
                {itemSeleccionado.correccion && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: WARM.softText, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Correccion de Pausia</div>
                    <MathMarkdown text={itemSeleccionado.correccion} format={false} components={mdComponents} />
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
