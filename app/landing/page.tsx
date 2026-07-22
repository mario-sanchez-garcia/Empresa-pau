import Link from 'next/link'
import {
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Dna,
  FlaskConical,
  Landmark,
  MessageCircle,
  Sigma,
  Sparkles,
  Star,
  TimerReset,
  UploadCloud,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import KairoBrand from '@/components/shared/KairoBrand'
import HeroCardsAnimator from '@/app/landing/HeroCardsAnimator'
import { ZoomParallax } from '@/components/ui/zoom-parallax'
import { PLATFORM_STRUCTURED_EXERCISES_LABEL, PLATFORM_STRUCTURED_EXERCISES_LONG_TEXT } from '@/app/lib/platformStats'

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:        '#ffffff',
  bgSub:     '#f8fafc',
  bgMuted:   '#f1f5f9',
  bgBlue:    '#eff6ff',
  bgBlueMid: '#dbeafe',
  ink:       '#0f172a',
  ink2:      '#1e293b',
  muted:     '#64748b',
  soft:      '#94a3b8',
  border:    '#e2e8f0',
  borderHi:  '#bfdbfe',
  blue:      '#2563eb',
  blueDeep:  '#1d4ed8',
  grad:      'linear-gradient(135deg, #1d4ed8 0%, #2563eb 52%, #3b82f6 100%)',
  green:     '#16a34a',
  greenBg:   '#f0fdf4',
  greenBd:   '#bbf7d0',
  amber:     '#d97706',
  amberBg:   '#fffbeb',
  red:       '#dc2626',
  redBg:     '#fef2f2',
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATS = [
  { value: PLATFORM_STRUCTURED_EXERCISES_LABEL,  label: PLATFORM_STRUCTURED_EXERCISES_LONG_TEXT },
  { value: '38',      label: 'Semanas de currículum PAU' },
  { value: '< 30s',   label: 'Para recibir tu corrección' },
]

const STEPS = [
  { n: '01', icon: ClipboardList, title: 'Elige asignatura y examen', desc: 'Selecciona cualquier convocatoria oficial de la EBAU Madrid, desde 2010 hasta hoy.' },
  { n: '02', icon: Zap,           title: 'Resuelve como en la PAU',   desc: 'Escribe tu respuesta o adjunta una foto de tu hoja. Con o sin cronómetro integrado.' },
  { n: '03', icon: BrainCircuit,  title: 'Nota, feedback y plan',     desc: 'Nota inmediata, corrección comentada y un plan de repaso ajustado a tus errores.' },
]

const SCROLL_MOMENTS = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Practica con exámenes reales',
    desc: 'Madrid y Cataluña, con años, bloques y opciones.',
    kind: 'exams',
    color: C.blue,
    soft: C.bgBlue,
    accent: '#93c5fd',
  },
  {
    n: '02',
    icon: WandSparkles,
    title: 'Corrige con criterios oficiales',
    desc: 'Recibe nota, feedback y errores a mejorar.',
    kind: 'correction',
    color: '#7c3aed',
    soft: '#f5f3ff',
    accent: '#c4b5fd',
  },
  {
    n: '03',
    icon: BrainCircuit,
    title: 'Sabe qué estudiar cada día',
    desc: 'Misiones diarias, racha y progreso hasta el examen.',
    kind: 'path',
    color: '#059669',
    soft: '#ecfdf5',
    accent: '#86efac',
  },
  {
    n: '04',
    icon: UploadCloud,
    title: 'Sube tu desarrollo y recibe feedback',
    desc: 'Escribe, sube foto y mejora paso a paso.',
    kind: 'upload',
    color: '#0891b2',
    soft: '#ecfeff',
    accent: '#67e8f9',
  },
] as const

const FEATURES = [
  { icon: TimerReset,   title: 'Simulacros con tiempo real',      desc: 'Cronómetro integrado para que practiques exactamente como en la PAU.',                              color: C.blue,  bg: C.bgBlue  },
  { icon: WandSparkles, title: 'Corrección IA paso a paso',       desc: 'Nota al instante con desglose detallado de cada apartado y criterio de corrección.',                color: '#7c3aed', bg: '#f5f3ff' },
  { icon: BarChart3,    title: 'Historial de progreso',           desc: 'Todas tus correcciones guardadas para que veas tu evolución semana a semana.',                      color: '#0891b2', bg: '#ecfeff' },
  { icon: BrainCircuit, title: 'Plan de estudio personalizado',   desc: 'Kairo analiza tus errores y genera un plan semanal concreto y accionable.',                        color: '#059669', bg: '#ecfdf5' },
  { icon: Sparkles,     title: 'Flashcards y zona de repaso',     desc: 'Repasa conceptos clave con flashcards y un canvas libre para tus esquemas.',                        color: C.amber, bg: C.amberBg },
  { icon: MessageCircle,title: 'Chat con Kairo',                 desc: 'Tutor IA disponible 24/7 para resolver cualquier duda de Matemáticas, Física, Historia y más.',    color: '#db2777', bg: '#fdf2f8' },
]

const FEATURE_SPANS = [2, 1, 1, 2, 1, 2]

const SUBJECTS = [
  { icon: Sigma,        label: 'Matemáticas II',    color: C.blue,    bg: C.bgBlue,   ready: true  },
  { icon: BarChart3,    label: 'Matemáticas CCSS',  color: '#7c3aed', bg: '#f5f3ff',  ready: false },
  { icon: Atom,         label: 'Física',             color: '#ca8a04', bg: '#fefce8',  ready: true  },
  { icon: Landmark,     label: 'Historia de España', color: '#78350f', bg: '#fff8f1',  ready: true  },
  { icon: FlaskConical, label: 'Química',            color: '#ea580c', bg: '#fff7ed',  ready: true  },
  { icon: Dna,          label: 'Biología',            color: '#047857', bg: '#D1FAE5',  ready: false },
  { icon: BookOpen,     label: 'Lengua',              color: C.blue,    bg: C.bgBlue,   ready: true  },
]

const COMPARE_ROWS = [
  { label: 'Exámenes reales EBAU Madrid',    kairo: true,   academia: true,  solo: true  },
  { label: 'Corrección instantánea por IA',  kairo: true,   academia: false, solo: false },
  { label: 'Desglose por apartado/criterio', kairo: true,   academia: false, solo: false },
  { label: 'Plan de estudio personalizado',  kairo: true,   academia: false, solo: false },
  { label: 'Disponible 24 horas al día',     kairo: true,   academia: false, solo: true  },
  { label: 'Chat con tutor IA',              kairo: true,   academia: false, solo: false },
  { label: 'Historial de progreso',          kairo: true,   academia: false, solo: false },
  { label: 'Precio mensual',                 pText: 'Free / 9,99€', aText: '100–200€', sText: 'Gratis' },
]

const LANDING_PRICING = [
  {
    name: 'Free',
    price: '0 €',
    period: 'Para empezar',
    badge: 'Prueba',
    description: 'Para probar Kairo y empezar a entrenar.',
    bullets: ['25 correcciones/mes', '3 fotos/mes', '1 parcial/mes', 'Camino PAU limitado', 'Preview de ranking'],
    cta: 'Empezar gratis',
    featured: false,
  },
  {
    name: 'Premium',
    price: '9,99 €/mes',
    period: 'Plan principal',
    badge: 'Recomendado',
    description: 'El plan principal para preparar la PAU durante el curso.',
    bullets: ['200 correcciones/mes', '80 fotos/mes', '5 simulacros completos/mes', 'Camino PAU completo', 'Ranking completo'],
    cta: 'Probar Premium',
    featured: true,
  },
  {
    name: 'Intensivo PAU',
    price: '19,99 € / 3 meses',
    period: 'Sprint final',
    badge: 'Sprint PAU',
    description: 'Para el sprint final antes de la PAU.',
    bullets: ['150 correcciones/mes', '60 fotos/mes', '6 simulacros completos/mes', 'Camino PAU intensivo', 'Ranking completo'],
    cta: 'Preparar sprint final',
    featured: false,
  },
  {
    name: 'Superpremium',
    price: '17,99 €/mes',
    period: 'Uso intensivo',
    badge: 'Avanzado',
    description: 'Para alumnos que quieren entrenar mucho más sin ansiedad de límites.',
    bullets: ['600 correcciones/mes', '200 fotos/mes', '20 simulacros completos/mes', 'Camino PAU avanzado', 'Uso intensivo con política razonable'],
    cta: 'Entrenar al máximo',
    featured: false,
  },
  {
    name: 'Curso PAU',
    price: 'Desde 59 €',
    period: 'Pago único',
    badge: 'Curso completo',
    description: 'Pago único para preparar la PAU con Camino completo.',
    bullets: ['Early: 59 €', 'Normal: 79 €', '80 fotos/mes', '5 simulacros/mes', 'Ranking completo'],
    cta: 'Reservar Curso PAU',
    featured: false,
  },
]

const TESTIMONIALS = [
  {
    name: 'María G.',       city: 'Madrid, 18 años',
    score: '8,4 en Mat. II', prev: 'Antes: 5,1',
    quote: 'El desglose por apartados es lo mejor. Supe exactamente en qué fallaba y no volví a cometer el mismo error. Subí tres puntos en dos meses.',
  },
  {
    name: 'Carlos M.',      city: 'Alcalá de Henares, 17 años',
    score: '9,2 en Historia', prev: 'Sin academia',
    quote: 'Sin dinero para academia. Solo Kairo y la biblioteca municipal. 9,2 en Historia de España. El plan semanal me dijo qué estudiar cada día.',
  },
  {
    name: 'Lucía P.',       city: 'Leganés, 18 años',
    score: '8,8 en Física',  prev: 'Empezó 4 semanas antes',
    quote: 'Empecé a usarlo justo un mes antes de la PAU. Me asusté mucho cuando vi el primer simulacro, pero la corrección me explicó todo y fui mejorando rápido.',
  },
]

type ScrollMoment = (typeof SCROLL_MOMENTS)[number]

function AmbientLayer() {
  return (
    <>
      <div className="lp-cloud lp-cloud-a" />
      <div className="lp-cloud lp-cloud-b" />
      <div className="lp-cloud lp-cloud-c" />
      <div className="lp-particle lp-particle-a" />
      <div className="lp-particle lp-particle-b" />
      <div className="lp-particle lp-particle-c" />
    </>
  )
}

function HeroCloudCurtain() {
  return (
    <div className="lp-hero-cloud-curtain" aria-hidden="true">
      <div className="lp-hero-cloud lp-hero-cloud-left" />
      <div className="lp-hero-cloud lp-hero-cloud-right" />
      <div className="lp-hero-cloud lp-hero-cloud-bottom" />
      <div className="lp-hero-cloud lp-hero-cloud-top" />
      <div className="lp-hero-vapor lp-hero-vapor-a" />
      <div className="lp-hero-vapor lp-hero-vapor-b" />
    </div>
  )
}

function ScreenExam() {
  return (
    <div style={{ background: '#fff', minHeight: 330 }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: C.blue, letterSpacing: '-0.03em' }}>kairo</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {([56, 36] as const).map((w, i) => <div key={i} style={{ height: 22, width: w, borderRadius: 6, background: C.bgMuted }} />)}
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.blue, background: C.bgBlue, padding: '2.5px 8px', borderRadius: 5 }}>Matemáticas II</div>
          <div style={{ fontSize: 10, color: C.soft }}>Junio 2024 · Madrid · Op. A</div>
        </div>
        <div style={{ background: C.bgSub, borderRadius: 10, padding: '11px 13px', marginBottom: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: C.ink, marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
            <span>Apartado 1</span><span style={{ color: C.blue }}>2 pts</span>
          </div>
          <div style={{ fontSize: 10.5, color: C.ink2, lineHeight: 1.65 }}>
            Halla las asíntotas de{' '}
            <span style={{ fontFamily: 'monospace', background: C.bgBlue, color: C.blue, padding: '1px 4px', borderRadius: 3 }}>f(x)=(x²−1)/(x−2)</span>
            {' '}y represéntala gráficamente.
          </div>
        </div>
        <div style={{ border: `1.5px solid ${C.blue}`, borderRadius: 8, padding: '10px 12px', marginBottom: 12, background: '#fafbff', minHeight: 64 }}>
          <div style={{ fontSize: 10, color: '#cbd5e1', fontStyle: 'italic' }}>Tu respuesta aquí...</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.amber, fontWeight: 700 }}>
            <TimerReset size={13} /> 47:32
          </div>
          <div style={{ background: C.grad, color: '#fff', fontSize: 11, fontWeight: 800, padding: '7px 14px', borderRadius: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
            Enviar <ArrowRight size={10} />
          </div>
        </div>
      </div>
    </div>
  )
}

function ScreenCorrection() {
  return (
    <div style={{ background: '#fff', minHeight: 330 }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: C.blue, letterSpacing: '-0.03em' }}>kairo</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {([56, 36] as const).map((w, i) => <div key={i} style={{ height: 22, width: w, borderRadius: 6, background: C.bgMuted }} />)}
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 58, height: 58, borderRadius: 16, background: C.grad, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>8.4</span>
            <span style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>/10</span>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, marginBottom: 4 }}>Muy bien — sigue así</div>
            <div style={{ height: 5, width: 110, background: C.bgBlueMid, borderRadius: 3 }}>
              <div style={{ width: '84%', height: '100%', background: C.grad, borderRadius: 3 }} />
            </div>
          </div>
        </div>
        {([
          { ok: true,  text: 'Asíntota vertical x=2', pts: '2/2' },
          { ok: true,  text: 'Asíntota horizontal', pts: '2/2' },
          { ok: false, text: 'Asíntota oblicua — incompleta', pts: '1.4/2' },
        ] as const).map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none' }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: item.ok ? C.greenBg : C.amberBg, border: `1.5px solid ${item.ok ? C.greenBd : '#fde68a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {item.ok ? <Check size={9} style={{ color: C.green }} /> : <span style={{ fontSize: 9, fontWeight: 900, color: C.amber }}>!</span>}
            </div>
            <span style={{ flex: 1, fontSize: 10.5, color: C.ink2 }}>{item.text}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: item.ok ? C.green : C.amber }}>{item.pts}</span>
          </div>
        ))}
        <div style={{ marginTop: 12, background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', borderRadius: 10, padding: '9px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={13} color="#a78bfa" />
          <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>+120 XP</span>
          <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2 }}>
            <div style={{ width: '72%', height: '100%', background: '#7c3aed', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>Nv. 4</span>
        </div>
      </div>
    </div>
  )
}

function ScreenPlan() {
  return (
    <div style={{ background: '#fff', minHeight: 330 }}>
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 900, color: C.blue, letterSpacing: '-0.03em' }}>kairo</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {([56, 36] as const).map((w, i) => <div key={i} style={{ height: 22, width: w, borderRadius: 6, background: C.bgMuted }} />)}
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', background: C.ink, padding: '2px 8px', borderRadius: 99 }}>Día 47</span>
          <span style={{ fontSize: 10, color: C.soft }}>Sem. 17 · PAU Madrid 2026</span>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: C.ink, marginBottom: 12 }}>Límites y continuidad</div>
        {([
          { done: false, bg: '#dbeafe', fg: '#2563eb', label: 'L', text: 'Flashcards Límites', sub: 'Matemáticas II', xp: 40 },
          { done: false, bg: '#dbeafe', fg: '#2563eb', label: 'E', text: 'Examen Madrid 2023', sub: 'Matemáticas II', xp: 80 },
          { done: true,  bg: '#fef3c7', fg: '#d97706', label: 'R', text: 'Repaso de Física', sub: 'Física', xp: 60 },
        ] as const).map((task, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 2 ? `1px solid ${C.border}` : 'none', opacity: task.done ? 0.55 : 1 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, background: task.done ? 'linear-gradient(135deg,#16a34a,#22c55e)' : task.bg, color: task.done ? '#fff' : task.fg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
              {task.done ? <Check size={13} strokeWidth={2.5} /> : task.label}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: task.done ? C.soft : C.ink, textDecoration: task.done ? 'line-through' : 'none', textDecorationColor: '#d1d5db' }}>{task.text}</div>
              <div style={{ fontSize: 9.5, color: C.soft }}>{task.sub} · {task.xp} XP</div>
            </div>
            {!task.done && <ChevronRight size={13} color={C.border} />}
          </div>
        ))}
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9.5, color: C.soft, fontWeight: 700, marginBottom: 5 }}>
            <span>Progreso hoy</span><span style={{ color: C.ink, fontWeight: 800 }}>60%</span>
          </div>
          <div style={{ height: 5, background: C.bgMuted, borderRadius: 3 }}>
            <div style={{ width: '60%', height: '100%', background: C.grad, borderRadius: 3 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroProductCloud() {
  return (
    <div className="lp-mock lp-float" style={{
      position: 'relative',
      minHeight: 520,
      borderRadius: 34,
      border: '1px solid rgba(191,219,254,0.74)',
      background: 'linear-gradient(145deg, rgba(255,255,255,0.84), rgba(239,246,255,0.58))',
      boxShadow: '0 34px 90px rgba(37,99,235,0.14)',
      overflow: 'hidden',
      backdropFilter: 'blur(22px)',
      WebkitBackdropFilter: 'blur(22px)',
    }}>
      <AmbientLayer />
      <div style={{ position: 'absolute', inset: 26, zIndex: 2 }}>
        <div className="lp-hero-card-1" style={{
          width: '72%',
          borderRadius: 24,
          padding: 18,
          background: 'rgba(255,255,255,0.76)',
          border: '1px solid rgba(255,255,255,0.82)',
          boxShadow: '0 20px 48px rgba(15,23,42,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue }}>Examen oficial</div>
              <div style={{ marginTop: 7, fontSize: 22, fontWeight: 900, letterSpacing: '-0.04em', color: C.ink }}>Matemáticas II</div>
            </div>
            <span style={{ padding: '7px 11px', borderRadius: 999, background: C.bgBlue, color: C.blue, fontSize: 12, fontWeight: 900 }}>2025</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20 }}>
            {['Ordinaria', 'Opción A', 'Análisis', '2.5 pts'].map(label => (
              <span key={label} style={{ padding: '7px 11px', borderRadius: 999, background: '#fff', border: `1px solid ${C.border}`, color: C.ink2, fontSize: 12, fontWeight: 800 }}>{label}</span>
            ))}
          </div>
          <div style={{ display: 'grid', gap: 9, marginTop: 20 }}>
            {[84, 62, 74].map((w, i) => <div key={i} style={{ height: 9, width: `${w}%`, borderRadius: 999, background: i === 0 ? C.bgBlueMid : C.bgMuted }} />)}
          </div>
        </div>

        <div className="lp-hero-card-2" style={{
          position: 'absolute',
          right: 0,
          top: 122,
          width: '58%',
          borderRadius: 24,
          padding: 18,
          background: 'rgba(255,255,255,0.78)',
          border: '1px solid rgba(255,255,255,0.84)',
          boxShadow: '0 24px 60px rgba(37,99,235,0.13)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 14, display: 'grid', placeItems: 'center', background: '#f5f3ff', color: '#7c3aed' }}><WandSparkles size={19} /></div>
            <div>
              <div style={{ fontSize: 12, color: C.soft, fontWeight: 800 }}>Corrección</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, lineHeight: 1 }}>8.4<span style={{ fontSize: 13, color: C.soft }}> / 10</span></div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: 8, marginTop: 18 }}>
            <div style={{ height: 8, borderRadius: 999, background: '#ede9fe' }}><div style={{ width: '84%', height: '100%', borderRadius: 999, background: '#8b5cf6' }} /></div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {['Rolle bien aplicado', 'Revisar límites'].map(label => (
                <span key={label} style={{ padding: '6px 9px', borderRadius: 999, background: '#fff', border: '1px solid #ede9fe', color: '#6d28d9', fontSize: 11, fontWeight: 800 }}>{label}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="lp-hero-card-3" style={{
          position: 'absolute',
          left: 38,
          bottom: 18,
          width: '52%',
          borderRadius: 24,
          padding: 18,
          background: 'rgba(255,255,255,0.74)',
          border: '1px solid rgba(255,255,255,0.84)',
          boxShadow: '0 22px 54px rgba(15,23,42,0.08)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 900, color: '#059669' }}>Misión de hoy</span>
            <span style={{ fontSize: 11, fontWeight: 900, color: C.soft }}>+120 XP</span>
          </div>
          <div style={{ marginTop: 12, fontSize: 15, fontWeight: 850, color: C.ink }}>2 ejercicios de Análisis</div>
          <div style={{ marginTop: 14, height: 8, borderRadius: 999, background: '#d1fae5' }}><div style={{ width: '68%', height: '100%', borderRadius: 999, background: '#10b981' }} /></div>
        </div>
      </div>
    </div>
  )
}

function MomentVisual({ moment }: { moment: ScrollMoment }) {
  const commonCard = {
    background: 'rgba(255,255,255,0.76)',
    border: '1px solid rgba(255,255,255,0.82)',
    boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
  } as React.CSSProperties

  if (moment.kind === 'correction') {
    return (
      <div className="lp-visual-stage">
        <AmbientLayer />
        <div className="lp-glass-card lp-scroll-panel" style={{ ...commonCard, width: '78%', margin: '42px auto 0', padding: 22, borderRadius: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: moment.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Corrección oficial</div>
              <div style={{ marginTop: 8, fontSize: 34, fontWeight: 950, color: C.ink, letterSpacing: '-0.06em' }}>8.7<span style={{ fontSize: 15, color: C.soft }}> / 10</span></div>
            </div>
            <div style={{ width: 58, height: 58, borderRadius: 20, background: moment.soft, color: moment.color, display: 'grid', placeItems: 'center' }}><WandSparkles size={26} /></div>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {[
              ['Planteamiento correcto', '92%'],
              ['Desarrollo mejorable', '64%'],
              ['Resultado final', '78%'],
            ].map(([label, width]) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, fontWeight: 800, marginBottom: 6 }}><span>{label}</span><span>{width}</span></div>
                <div style={{ height: 8, borderRadius: 999, background: '#ede9fe' }}><div style={{ width, height: '100%', borderRadius: 999, background: moment.color }} /></div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap' }}>
            {['Puntos fuertes', 'A mejorar', 'Siguiente paso'].map(label => (
              <span key={label} style={{ padding: '7px 11px', borderRadius: 999, background: '#fff', border: `1px solid ${moment.accent}`, color: moment.color, fontSize: 11, fontWeight: 850 }}>{label}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (moment.kind === 'path') {
    return (
      <div className="lp-visual-stage">
        <AmbientLayer />
        <div className="lp-scroll-panel" style={{ ...commonCard, width: '76%', margin: '38px auto 0', padding: 22, borderRadius: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 900, color: moment.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Camino PAU</div>
              <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900, color: C.ink }}>Misión diaria</div>
            </div>
            <span style={{ padding: '7px 10px', borderRadius: 999, background: moment.soft, color: moment.color, fontSize: 12, fontWeight: 900 }}>Racha 12 días</span>
          </div>
          <div style={{ marginTop: 20, display: 'grid', gap: 10 }}>
            {['Repasar derivadas', 'Simulacro parcial', 'Corregir errores'].map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 16, background: i === 0 ? moment.soft : '#fff', border: `1px solid ${i === 0 ? moment.accent : C.border}` }}>
                <span style={{ width: 28, height: 28, borderRadius: 10, display: 'grid', placeItems: 'center', background: i === 0 ? moment.color : C.bgMuted, color: i === 0 ? '#fff' : C.soft, fontSize: 12, fontWeight: 900 }}>{i + 1}</span>
                <span style={{ fontSize: 13, fontWeight: 850, color: C.ink2 }}>{label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: i === 0 ? moment.color : C.soft, fontWeight: 900 }}>{i === 0 ? '+80 XP' : 'Pendiente'}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, fontWeight: 850, marginBottom: 8 }}><span>Progreso hasta el examen</span><span>68%</span></div>
            <div style={{ height: 10, borderRadius: 999, background: '#d1fae5' }}><div style={{ width: '68%', height: '100%', borderRadius: 999, background: moment.color }} /></div>
          </div>
        </div>
      </div>
    )
  }

  if (moment.kind === 'upload') {
    return (
      <div className="lp-visual-stage">
        <AmbientLayer />
        <div className="lp-scroll-panel" style={{ ...commonCard, width: '74%', margin: '34px auto 0', padding: 20, borderRadius: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 50, height: 50, borderRadius: 18, display: 'grid', placeItems: 'center', background: moment.soft, color: moment.color }}><UploadCloud size={24} /></div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900, color: C.ink }}>Respuesta subida</div>
              <div style={{ marginTop: 4, fontSize: 12, fontWeight: 750, color: C.soft }}>Foto o desarrollo escrito</div>
            </div>
          </div>
          <div style={{ marginTop: 18, padding: 14, borderRadius: 18, background: '#f8fafc', border: `1px dashed ${moment.accent}` }}>
            <div style={{ height: 8, width: '84%', borderRadius: 999, background: '#cbd5e1', marginBottom: 9 }} />
            <div style={{ height: 8, width: '62%', borderRadius: 999, background: '#e2e8f0', marginBottom: 9 }} />
            <div style={{ height: 8, width: '72%', borderRadius: 999, background: '#cbd5e1' }} />
          </div>
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {['Feedback preciso', 'Paso siguiente'].map(label => (
              <div key={label} style={{ borderRadius: 16, background: '#fff', border: `1px solid ${C.border}`, padding: 12 }}>
                <div style={{ height: 7, width: '70%', borderRadius: 999, background: moment.soft, marginBottom: 8 }} />
                <div style={{ fontSize: 11, fontWeight: 900, color: moment.color }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="lp-visual-stage">
      <AmbientLayer />
      <div className="lp-scroll-panel" style={{ ...commonCard, width: '80%', margin: '36px auto 0', padding: 20, borderRadius: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 900, color: moment.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Exámenes reales</div>
            <div style={{ marginTop: 8, fontSize: 21, fontWeight: 900, color: C.ink }}>EBAU Madrid 2025</div>
          </div>
          <span style={{ padding: '7px 10px', borderRadius: 999, background: moment.soft, color: moment.color, fontSize: 12, fontWeight: 900 }}>Opción B</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
          {['2025', '2024', 'Análisis', 'Álgebra', '2.5 pts'].map(label => (
            <span key={label} style={{ padding: '7px 10px', borderRadius: 999, background: '#fff', border: `1px solid ${C.border}`, color: C.ink2, fontSize: 11, fontWeight: 850 }}>{label}</span>
          ))}
        </div>
        <div style={{ marginTop: 20, borderRadius: 18, padding: 16, background: '#fff', border: `1px solid ${C.border}` }}>
          <div style={{ height: 9, width: '86%', borderRadius: 999, background: C.bgBlueMid, marginBottom: 10 }} />
          <div style={{ height: 9, width: '66%', borderRadius: 999, background: C.bgMuted, marginBottom: 10 }} />
          <div style={{ height: 9, width: '74%', borderRadius: 999, background: C.bgMuted }} />
        </div>
      </div>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; }
        html { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        /* ── Entry animations ── */
        @keyframes lp-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-in {
          from { opacity: 0; transform: scale(0.97) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-8px); }
        }
        @keyframes lp-drift {
          0%, 100% { transform: translate3d(0,0,0) scale(1); }
          50% { transform: translate3d(18px,-16px,0) scale(1.04); }
        }
        @keyframes lp-particle-drift {
          0%, 100% { transform: translate3d(0,0,0); opacity: 0.48; }
          50% { transform: translate3d(-10px,14px,0); opacity: 0.78; }
        }
        @keyframes lp-scroll-reveal {
          from { opacity: 0; transform: translateY(44px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lp-cloud-scroll-away {
          from { opacity: 0.78; transform: translate3d(0,42px,0) scale(1.08); }
          to { opacity: 0.04; transform: translate3d(var(--cloud-drift-x, 0px), -180px,0) scale(0.9); }
        }
        @keyframes lp-panel-approach {
          from { opacity: 0.70; transform: translateY(38px) scale(0.93); filter: blur(1px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes lp-hero-cloud-open {
          from {
            opacity: var(--cloud-alpha, 0.82);
            transform: translate3d(0,0,0) scale(var(--cloud-scale, 1));
            filter: blur(var(--cloud-blur, 30px)) saturate(1.08);
          }
          to {
            opacity: 0;
            transform: translate3d(var(--cloud-open-x, 0), var(--cloud-open-y, -34vh), 0) scale(var(--cloud-end-scale, 0.76));
            filter: blur(calc(var(--cloud-blur, 30px) + 10px)) saturate(1.05);
          }
        }
        @keyframes lp-hero-vapor-open {
          from { opacity: 0.48; transform: translate3d(0,0,0) scale(1); }
          to { opacity: 0; transform: translate3d(var(--vapor-x, 0), -30vh, 0) scale(0.86); }
        }
        @keyframes lp-hero-depth {
          from { transform: translateY(0) scale(1); opacity: 1; }
          to { transform: translateY(-42px) scale(1.045); opacity: 0.78; }
        }
        .lp-h1   { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) both; }
        .lp-p    { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) 80ms both; }
        .lp-ctas { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) 160ms both; }
        .lp-mock { animation: lp-in  660ms cubic-bezier(0.22,1,0.36,1) 240ms both; }
        .lp-float { animation: lp-float 4.5s ease-in-out infinite; }
        .lp-scroll-reveal {
          animation: lp-scroll-reveal 720ms cubic-bezier(0.22,1,0.36,1) both;
          animation-timeline: view();
          animation-range: entry 12% cover 38%;
        }
        .lp-hero-section {
          view-timeline-name: --kairo-hero;
          view-timeline-axis: block;
        }
        .lp-hero-grid {
          animation: lp-hero-depth 1s linear both;
          animation-timeline: --kairo-hero;
          animation-range: exit 0% exit 82%;
          transform-origin: center top;
          will-change: transform, opacity;
        }
        .lp-hero-cloud-curtain {
          position: absolute;
          inset: -18% -8% -12%;
          z-index: 1;
          overflow: hidden;
          pointer-events: none;
        }
        .lp-hero-cloud {
          position: absolute;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 38%, rgba(255,255,255,0.96), rgba(255,255,255,0.72) 34%, transparent 66%),
            radial-gradient(circle at 68% 58%, rgba(219,234,254,0.82), transparent 58%),
            radial-gradient(circle at 32% 72%, rgba(224,231,255,0.52), transparent 62%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.75), 0 36px 90px rgba(37,99,235,0.10);
          animation: lp-hero-cloud-open 1s linear both;
          animation-timeline: --kairo-hero;
          animation-range: exit 0% exit 88%;
          will-change: transform, opacity, filter;
        }
        .lp-hero-cloud-left {
          width: clamp(330px, 36vw, 620px);
          height: clamp(190px, 21vw, 330px);
          left: -11vw;
          top: 16vh;
          --cloud-open-x: -28vw;
          --cloud-open-y: -38vh;
          --cloud-alpha: 0.70;
          --cloud-blur: 26px;
        }
        .lp-hero-cloud-right {
          width: clamp(360px, 38vw, 660px);
          height: clamp(210px, 23vw, 360px);
          right: -14vw;
          top: 10vh;
          --cloud-open-x: 30vw;
          --cloud-open-y: -42vh;
          --cloud-alpha: 0.64;
          --cloud-blur: 28px;
        }
        .lp-hero-cloud-bottom {
          width: clamp(520px, 62vw, 980px);
          height: clamp(230px, 25vw, 420px);
          left: 50%;
          bottom: -15vh;
          margin-left: min(-31vw, -260px);
          --cloud-open-x: 0;
          --cloud-open-y: -46vh;
          --cloud-alpha: 0.78;
          --cloud-blur: 32px;
          --cloud-scale: 1.06;
          --cloud-end-scale: 0.72;
        }
        .lp-hero-cloud-top {
          width: clamp(300px, 34vw, 560px);
          height: clamp(160px, 18vw, 280px);
          left: 35vw;
          top: -10vh;
          --cloud-open-x: 4vw;
          --cloud-open-y: -34vh;
          --cloud-alpha: 0.42;
          --cloud-blur: 34px;
          --cloud-end-scale: 0.68;
        }
        .lp-hero-vapor {
          position: absolute;
          border-radius: 999px;
          background: linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,0.72), rgba(219,234,254,0.40), rgba(255,255,255,0));
          filter: blur(18px);
          animation: lp-hero-vapor-open 1s linear both;
          animation-timeline: --kairo-hero;
          animation-range: exit 6% exit 86%;
          will-change: transform, opacity;
        }
        .lp-hero-vapor-a {
          width: 62vw;
          height: 70px;
          left: 8vw;
          top: 42vh;
          transform: rotate(-7deg);
          --vapor-x: -18vw;
        }
        .lp-hero-vapor-b {
          width: 54vw;
          height: 62px;
          right: 2vw;
          top: 54vh;
          transform: rotate(5deg);
          --vapor-x: 20vw;
        }
        .lp-cloud {
          position: absolute;
          border-radius: 999px;
          filter: blur(26px);
          opacity: 0.72;
          pointer-events: none;
          animation: lp-drift 10s ease-in-out infinite;
        }
        .lp-cloud-a {
          width: 240px; height: 150px; left: -48px; top: 34px;
          background: rgba(191,219,254,0.88);
        }
        .lp-cloud-b {
          width: 220px; height: 180px; right: -58px; top: 120px;
          background: rgba(221,214,254,0.78);
          animation-delay: -3s;
        }
        .lp-cloud-c {
          width: 250px; height: 150px; left: 36%; bottom: -58px;
          background: rgba(207,250,254,0.68);
          animation-delay: -6s;
        }
        .lp-scroll-moment .lp-cloud {
          animation-name: lp-cloud-scroll-away;
          animation-duration: 1s;
          animation-timing-function: linear;
          animation-fill-mode: both;
          animation-timeline: view();
          animation-range: entry 0% cover 72%;
        }
        .lp-scroll-moment .lp-cloud-a { --cloud-drift-x: -42px; }
        .lp-scroll-moment .lp-cloud-b { --cloud-drift-x: 34px; }
        .lp-scroll-moment .lp-cloud-c { --cloud-drift-x: -16px; }
        .lp-particle {
          position: absolute;
          width: 8px; height: 8px;
          border-radius: 50%;
          background: rgba(37,99,235,0.24);
          pointer-events: none;
          animation: lp-particle-drift 7s ease-in-out infinite;
        }
        .lp-particle-a { left: 14%; top: 22%; }
        .lp-particle-b { right: 18%; top: 18%; width: 11px; height: 11px; background: rgba(124,58,237,0.20); animation-delay: -2s; }
        .lp-particle-c { right: 28%; bottom: 18%; width: 6px; height: 6px; background: rgba(8,145,178,0.22); animation-delay: -4s; }
        .lp-visual-stage {
          position: relative;
          min-height: 390px;
          border-radius: 32px;
          overflow: hidden;
          background: linear-gradient(145deg, rgba(255,255,255,0.78), rgba(239,246,255,0.54));
          border: 1px solid rgba(191,219,254,0.72);
          box-shadow: 0 26px 70px rgba(37,99,235,0.11);
        }
        .lp-glass-card {
          transition: transform 240ms cubic-bezier(0.22,1,0.36,1), box-shadow 240ms ease;
        }
        .lp-scroll-panel {
          transform-origin: center;
          animation: lp-panel-approach 1s cubic-bezier(0.22,1,0.36,1) both;
          animation-timeline: view();
          animation-range: entry 8% cover 46%;
        }
        @media (hover: hover) {
          .lp-glass-card:hover { transform: translateY(-4px); box-shadow: 0 30px 70px rgba(37,99,235,0.16) !important; }
        }

        /* ── Button transitions ── */
        .lp-btn-primary {
          cursor: pointer;
          transition: transform 160ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 160ms cubic-bezier(0.22,1,0.36,1);
        }
        @media (hover: hover) {
          .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 20px 44px rgba(37,99,235,0.28) !important; }
        }
        .lp-btn-primary:active { transform: scale(0.97) !important; }

        .lp-btn-ghost {
          cursor: pointer;
          transition: transform 160ms cubic-bezier(0.22,1,0.36,1),
                      border-color 160ms ease, background 160ms ease, color 160ms ease;
        }
        @media (hover: hover) {
          .lp-btn-ghost:hover { transform: translateY(-2px); border-color: ${C.borderHi} !important; background: ${C.bgBlue} !important; color: ${C.blueDeep} !important; }
        }
        .lp-btn-ghost:active { transform: scale(0.97) !important; }

        /* ── Card transitions ── */
        .lp-card {
          transition: transform 220ms cubic-bezier(0.22,1,0.36,1),
                      box-shadow 220ms cubic-bezier(0.22,1,0.36,1),
                      border-color 220ms ease;
        }
        @media (hover: hover) {
          .lp-card:hover { transform: translateY(-3px); box-shadow: 0 12px 36px rgba(37,99,235,0.10) !important; border-color: ${C.borderHi} !important; }
          .lp-chip:hover { transform: translateY(-2px); border-color: ${C.borderHi} !important; box-shadow: 0 6px 20px rgba(37,99,235,0.08) !important; }
          .lp-tcard:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(15,23,42,0.08) !important; }
        }

        /* ── Nav link ── */
        .lp-nav-link {
          transition: color 140ms ease;
          cursor: pointer;
        }
        @media (hover: hover) {
          .lp-nav-link:hover { color: ${C.blue} !important; }
        }

        /* ── Table highlight ── */
        .lp-compare-row:nth-child(even) { background: ${C.bgSub}; }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          .lp-plan-grid { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
        }
        @media (max-width: 768px) {
          .lp-hero-grid, .lp-moment-grid { grid-template-columns: 1fr !important; }
          .lp-screens-grid { grid-template-columns: 1fr !important; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .lp-story-panel { grid-template-columns: 1fr !important; min-height: auto !important; }
          .lp-story-panel > div { order: unset !important; min-height: 280px; }
          .lp-hero-visual { order: -1; }
          .lp-scroll-moment { padding: 24px !important; }
          .lp-hero-cloud-curtain { inset: -16% -34% -10% !important; }
          .lp-hero-cloud-left { left: -34vw !important; top: 20vh !important; }
          .lp-hero-cloud-right { right: -40vw !important; top: 8vh !important; }
          .lp-hero-cloud-bottom { width: 120vw !important; left: 50% !important; margin-left: -60vw !important; }
          .lp-bento { grid-template-columns: 1fr !important; }
          .lp-bento-card { grid-column: auto !important; flex-direction: column !important; }
          .lp-compare-table { font-size: 12px !important; }
          .lp-plan-grid { grid-template-columns: 1fr !important; }
          .lp-tgrid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 480px) {
          .lp-stats-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .lp-stats-item + .lp-stats-item { border-top: 1px solid ${C.border} !important; border-left: none !important; }
        }

        .lp-card-1 { animation: lp-in 600ms cubic-bezier(0.22,1,0.36,1) 300ms both; }
        .lp-card-2 { animation: lp-in 620ms cubic-bezier(0.22,1,0.36,1) 500ms both; }
        .lp-card-3 { animation: lp-in 600ms cubic-bezier(0.22,1,0.36,1) 700ms both; }
        .lp-hero-card-1, .lp-hero-card-2, .lp-hero-card-3 {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1);
        }
        .lp-hero-card--visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lp-h1, .lp-p, .lp-ctas, .lp-mock { animation: none !important; }
          .lp-float { animation: none !important; }
          .lp-scroll-reveal, .lp-cloud, .lp-particle, .lp-hero-grid, .lp-hero-cloud, .lp-hero-vapor { animation: none !important; }
          .lp-card-1, .lp-card-2, .lp-card-3 { animation: none !important; }
          .lp-hero-card-1, .lp-hero-card-2, .lp-hero-card-3 { opacity: 1 !important; transform: none !important; transition: none !important; }
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 clamp(20px,5vw,48px)', height: '76px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <KairoBrand subtitle={null} size="lg" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Link href="/pricing" className="lp-nav-link" style={{ padding: '8px 14px', fontSize: 13, fontWeight: 600, color: C.muted, textDecoration: 'none' }}>
            Precios
          </Link>
          <Link href="/login" className="lp-btn-ghost" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '7px 16px', borderRadius: 999,
            border: `1.5px solid ${C.border}`,
            background: 'transparent', color: C.ink2,
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
          }}>
            Entrar
          </Link>
          <Link href="/login" className="lp-btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '7px 16px', borderRadius: 999,
            background: C.grad, color: '#fff',
            fontWeight: 700, fontSize: 13, textDecoration: 'none',
            boxShadow: '0 4px 14px rgba(37,99,235,0.22)',
          }}>
            Empezar gratis <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      {/* ── Zoom parallax hero ───────────────────────────────────────────── */}
      <ZoomParallax
        images={[
          { src: '/brand/hero-student.jpg',         alt: 'Estudiante preparando la PAU' },
          { src: '/brand/scene-exam.jpg',            alt: 'Examen oficial EBAU' },
          { src: '/brand/scene-laptop.jpg',          alt: 'Preparando con Kairo' },
          { src: '/brand/scene-books.jpg',           alt: 'Libros de estudio PAU' },
          { src: '/brand/fa-barboza-NWoaoMgMiVY-unsplash.jpg', alt: 'Estudiando' },
          { src: '/brand/scene-exam.jpg',            alt: 'Simulacro PAU' },
          { src: '/brand/hero-student.jpg',          alt: 'Preparación PAU' },
        ]}
        centerReveal={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <img src="/brand/kairo-logo.png" alt="Kairo" style={{ width: 'clamp(190px,26vw,380px)', height: 'auto', filter: 'drop-shadow(0 16px 28px rgba(2,8,23,0.18))' }} />
            <p style={{ fontSize: 'clamp(1rem,2vw,1.3rem)', color: '#ffffff', fontWeight: 600, opacity: 0.85, letterSpacing: '-0.02em' }}>
              Prepara la PAU con claridad.
            </p>
          </div>
        }
      />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="lp-hero-section" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,48px) clamp(56px,7vw,88px)',
        background: 'radial-gradient(circle at 14% 12%, rgba(219,234,254,0.92), transparent 32%), radial-gradient(circle at 86% 16%, rgba(221,214,254,0.72), transparent 30%), radial-gradient(circle at 72% 84%, rgba(207,250,254,0.58), transparent 32%), linear-gradient(180deg, #ffffff 0%, #f8fbff 58%, #eff6ff 100%)',
      }}>
        <HeroCloudCurtain />
        <AmbientLayer />
        <div className="lp-hero-grid" style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1180,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,0.92fr) minmax(360px,1.08fr)',
          gap: 'clamp(36px,6vw,70px)',
          alignItems: 'center',
        }}>
          <div>
            <span className="lp-ctas" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '7px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.72)',
              border: `1px solid ${C.borderHi}`,
              color: C.blueDeep,
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '0 14px 34px rgba(37,99,235,0.08)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}>
              <Sparkles size={12} /> Campus PAU inteligente
            </span>
            <h1 className="lp-h1" style={{
              fontSize: 'clamp(3rem,7vw,5.7rem)',
              fontWeight: 950,
              lineHeight: 0.96,
              letterSpacing: '-0.07em',
              color: C.ink,
              margin: '22px 0 24px',
              textWrap: 'balance' as never,
            }}>
              Prepara la PAU con claridad.
            </h1>
            <p className="lp-p" style={{
              fontSize: 'clamp(1rem,2.1vw,1.22rem)',
              color: C.muted,
              lineHeight: 1.85,
              margin: '0 0 34px',
              maxWidth: 610,
              fontWeight: 500,
            }}>
              Exámenes reales, corrección con criterios oficiales y un camino diario para saber qué estudiar sin perder tiempo.
            </p>
            <div className="lp-ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/login" className="lp-btn-primary" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '14px 28px', borderRadius: 999,
                background: C.grad, color: '#fff',
                fontWeight: 850, fontSize: 15, textDecoration: 'none',
                boxShadow: '0 16px 36px rgba(37,99,235,0.28)',
                letterSpacing: '-0.01em',
              }}>
                Empezar gratis
                <span style={{ width: 25, height: 25, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ArrowRight size={14} />
                </span>
              </Link>
              <a href="#como-funciona" className="lp-btn-ghost" style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '14px 24px', borderRadius: 999,
                border: `1.5px solid ${C.border}`,
                background: 'rgba(255,255,255,0.66)',
                color: C.ink2,
                fontWeight: 750,
                fontSize: 15,
                textDecoration: 'none',
                backdropFilter: 'blur(14px)',
                WebkitBackdropFilter: 'blur(14px)',
              }}>
                Ver cómo funciona
              </a>
            </div>
            <div className="lp-ctas" style={{ display: 'flex', flexWrap: 'wrap', gap: 9, marginTop: 30, animationDelay: '220ms' }}>
              {['Madrid y Cataluña', 'Criterios oficiales', 'Plan diario PAU'].map(label => (
                <span key={label} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  color: C.muted,
                  padding: '7px 12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.68)',
                  border: `1px solid ${C.border}`,
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                }}>
                  <CheckCircle2 size={13} style={{ color: C.green }} /> {label}
                </span>
              ))}
            </div>
          </div>
          <div className="lp-hero-visual" style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 40px 90px rgba(15,23,42,0.18), 0 0 0 1px rgba(255,255,255,0.7)',
              aspectRatio: '4/5',
            }}>
              <img
                src="/brand/hero-student.jpg"
                alt="Estudiante preparando la PAU con Kairo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              {/* floating correction card */}
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20 }}>
                <div style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderRadius: 14, padding: '13px 16px',
                  border: '1px solid rgba(255,255,255,0.95)',
                  boxShadow: '0 8px 32px rgba(15,23,42,0.12)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.soft, fontWeight: 600 }}>Corrección · Matemáticas II</div>
                      <div style={{ fontSize: 14, fontWeight: 900, color: C.ink, letterSpacing: '-0.02em', marginTop: 2 }}>8.4 / 10 — Muy bien</div>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: C.grad, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <WandSparkles size={15} color="#fff" />
                    </div>
                  </div>
                  <div style={{ height: 4, background: C.bgBlueMid, borderRadius: 2 }}>
                    <div style={{ width: '84%', height: '100%', background: C.grad, borderRadius: 2 }} />
                  </div>
                </div>
              </div>
            </div>
            {/* floating streak badge */}
            <div style={{
              position: 'absolute', top: -12, right: -12,
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              borderRadius: 12, padding: '8px 14px',
              boxShadow: '0 8px 24px rgba(109,40,217,0.35)',
              border: '2px solid rgba(255,255,255,0.9)',
            }}>
              <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Racha</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1 }}>12 días</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────────────────────── */}
      <div style={{ background: C.bgSub, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '15px clamp(20px,5vw,48px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '6px 28px' }}>
          {['Exámenes oficiales EBAU', 'Madrid y Cataluña', 'Corrección con criterios', 'Plan diario PAU', 'Beta privada · 2026'].map(label => (
            <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.muted, whiteSpace: 'nowrap' }}>
              <Check size={11} style={{ color: C.green, flexShrink: 0 }} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* ── Product screenshots ───────────────────────────────────────────── */}
      <section style={{ background: 'linear-gradient(180deg,#0f172a 0%,#1e293b 100%)', padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,48px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(32px,5vw,52px)' }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 10 }}>La app</p>
            <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: '#f8fafc', margin: '0 0 12px', letterSpacing: '-0.05em', lineHeight: 1.05, textWrap: 'balance' as never }}>
              Así se ve Kairo por dentro.
            </h2>
            <p style={{ fontSize: 'clamp(0.93rem,1.8vw,1.03rem)', color: '#64748b', lineHeight: 1.8, maxWidth: 420, margin: '0 auto' }}>
              Del examen real a la nota y el siguiente paso — todo en el mismo sitio.
            </p>
          </div>
          <div className="lp-screens-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {([
              { label: 'Examen oficial', url: 'kairo.es/examenes/mates-ii', screen: <ScreenExam /> },
              { label: 'Corrección IA',  url: 'kairo.es/examenes/correccion', screen: <ScreenCorrection /> },
              { label: 'Plan diario',    url: 'kairo.es/camino', screen: <ScreenPlan /> },
            ] as const).map(({ label, url, screen }) => (
              <div key={label}>
                <p style={{ textAlign: 'center', fontSize: 11.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.01em', marginBottom: 10 }}>{label}</p>
                <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 28px 70px rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ background: '#1a2744', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ display: 'flex', gap: 4.5 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 5, padding: '3px 10px', fontSize: 9.5, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                      {url}
                    </div>
                  </div>
                  {screen}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Scroll narrative ─────────────────────────────────────────────── */}
      <section id="como-funciona">
        {/* section header — contained */}
        <div style={{ maxWidth: 1140, margin: '0 auto', padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,48px) clamp(28px,4vw,44px)' }}>
          <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            Cómo funciona
          </p>
          <h2 style={{ fontSize: 'clamp(2rem,4.6vw,3.3rem)', fontWeight: 950, color: C.ink, margin: '0 0 14px', letterSpacing: '-0.05em', lineHeight: 1.04, textWrap: 'balance' as never }}>
            Un scroll, cuatro momentos clave.
          </h2>
          <p style={{ fontSize: 'clamp(0.98rem,2vw,1.08rem)', color: C.muted, lineHeight: 1.8, margin: 0, maxWidth: 600 }}>
            Kairo no solo corrige: organiza el proceso completo desde el examen real hasta el siguiente paso de estudio.
          </p>
        </div>

        {/* editorial photo panels — full bleed */}
        {SCROLL_MOMENTS.map((moment, i) => {
          const Icon = moment.icon
          const PHOTOS: Record<string, string | null> = {
            exams:      '/brand/scene-exam.jpg',
            correction: null,
            path:       '/brand/scene-laptop.jpg',
            upload:     '/brand/scene-books.jpg',
          }
          const photo     = PHOTOS[moment.kind] ?? null
          const visualLeft = i % 2 === 1   // odd → visual on left

          return (
            <div key={moment.n} className="lp-story-panel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 460 }}>

              {/* ── text side ─────────────────────────────────────────── */}
              <div style={{
                order: visualLeft ? 2 : 1,
                padding: 'clamp(40px,6vw,80px) clamp(28px,4vw,64px)',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                background: i % 2 === 0 ? '#ffffff' : C.bgSub,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 13,
                    background: moment.soft, color: moment.color,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    boxShadow: `0 6px 18px ${moment.accent}55`,
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 900, color: moment.color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    Momento {moment.n}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 14px', fontSize: 'clamp(1.6rem,3.2vw,2.3rem)', lineHeight: 1.08, fontWeight: 950, letterSpacing: '-0.04em', color: C.ink, textWrap: 'balance' as never }}>
                  {moment.title}
                </h3>
                <p style={{ margin: 0, fontSize: 'clamp(0.95rem,1.8vw,1.05rem)', lineHeight: 1.8, color: C.muted, maxWidth: 380, fontWeight: 500 }}>
                  {moment.desc}
                </p>
              </div>

              {/* ── visual side ───────────────────────────────────────── */}
              <div style={{ order: visualLeft ? 1 : 2, position: 'relative', overflow: 'hidden', minHeight: 360 }}>
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    aria-hidden
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `linear-gradient(135deg, ${moment.soft} 0%, #fff 100%)`,
                    padding: '32px',
                  }}>
                    <MomentVisual moment={moment} />
                  </div>
                )}
              </div>

            </div>
          )
        })}
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: '0 clamp(20px,5vw,40px) clamp(56px,8vw,80px)',
      }}>
        <div className="lp-stats-grid" style={{
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden',
        }}>
          {STATS.map((s, i) => (
            <div key={s.label} className="lp-stats-item" style={{
              padding: 'clamp(22px,4vw,32px) clamp(16px,3vw,24px)',
              background: i === 1 ? C.bgSub : C.bg,
              borderLeft: i > 0 ? `1px solid ${C.border}` : 'none',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 900, color: C.blue, letterSpacing: '-0.04em', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: C.soft, fontWeight: 600, marginTop: 6, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1040, margin: '0 auto',
        padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
          Proceso de estudio
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
          Tres pasos para mejorar de verdad.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 12 }}>
          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.n} className="lp-card" style={{
                background: C.bg, borderRadius: 14,
                padding: '28px 24px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: 14, right: 18,
                  fontSize: 52, fontWeight: 900, color: C.bgMuted,
                  lineHeight: 1, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
                }}>
                  {s.n}
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: C.bgBlue, color: C.blue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18,
                }}>
                  <Icon size={20} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: C.ink, marginBottom: 8, letterSpacing: '-0.02em' }}>{s.title}</div>
                <div style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.75 }}>{s.desc}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Comparison table ─────────────────────────────────────────────── */}
      <section style={{ background: C.bgSub, padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            Por qué Kairo
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
            Kairo vs cómo estudias ahora
          </h2>

          <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', background: C.bg, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            {/* Table header */}
            <div className="lp-compare-table" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: `1px solid ${C.border}`, background: C.bgSub }}>
              <div style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: C.soft }}>Funcionalidad</div>
              {[
                { label: 'Kairo', accent: true  },
                { label: 'Academia presencial', accent: false },
                { label: 'Por tu cuenta', accent: false },
              ].map((col) => (
                <div key={col.label} style={{
                  padding: '14px 16px', fontSize: 12, fontWeight: 800,
                  color: col.accent ? C.blue : C.ink2,
                  background: col.accent ? C.bgBlue : 'transparent',
                  borderLeft: `1px solid ${C.border}`,
                  textAlign: 'center',
                }}>
                  {col.accent && <Sparkles size={10} style={{ display: 'inline', marginRight: 4 }} />}
                  {col.label}
                </div>
              ))}
            </div>

            {/* Rows */}
            {COMPARE_ROWS.map((row, i) => (
              <div key={i} className="lp-compare-row lp-compare-table" style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                borderBottom: i < COMPARE_ROWS.length - 1 ? `1px solid ${C.border}` : 'none',
              }}>
                <div style={{ padding: '13px 20px', fontSize: 13, fontWeight: 600, color: C.ink2, display: 'flex', alignItems: 'center' }}>
                  {row.label}
                </div>
                {/* Kairo */}
                <div style={{
                  padding: '13px 16px', borderLeft: `1px solid ${C.border}`,
                  background: C.bgBlue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {'pText' in row
                    ? <span style={{ fontSize: 12, fontWeight: 800, color: C.blue }}>{row.pText}</span>
                    : row.kairo
                    ? <Check size={16} style={{ color: C.green }} />
                    : <X size={14} style={{ color: C.soft }} />
                  }
                </div>
                {/* Academia */}
                <div style={{ padding: '13px 16px', borderLeft: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {'aText' in row
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{row.aText}</span>
                    : row.academia
                    ? <Check size={16} style={{ color: C.green }} />
                    : <X size={14} style={{ color: '#e2e8f0' }} />
                  }
                </div>
                {/* Solo */}
                <div style={{ padding: '13px 16px', borderLeft: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {'sText' in row
                    ? <span style={{ fontSize: 12, fontWeight: 700, color: C.muted }}>{row.sText}</span>
                    : row.solo
                    ? <Check size={16} style={{ color: C.green }} />
                    : <X size={14} style={{ color: '#e2e8f0' }} />
                  }
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features bento ───────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1040, margin: '0 auto',
        padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
          Funcionalidades
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
          Todo lo que necesitas para la EBAU
        </h2>
        <div className="lp-bento" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            const span = FEATURE_SPANS[i]
            const wide = span === 2
            return (
              <div key={f.title} className="lp-card lp-bento-card" style={{
                background: C.bg, borderRadius: 14,
                padding: wide ? '26px 28px' : '26px 22px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                display: 'flex', flexDirection: wide ? 'row' : 'column',
                gap: wide ? 18 : 14,
                alignItems: wide ? 'flex-start' : undefined,
                gridColumn: `span ${span}`,
              }}>
                <div style={{
                  width: 44, height: 44, minWidth: 44, borderRadius: 11, flexShrink: 0,
                  background: f.bg, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={21} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.93rem', color: C.ink, marginBottom: 6, letterSpacing: '-0.02em' }}>{f.title}</div>
                  <div style={{ fontSize: '0.87rem', color: C.muted, lineHeight: 1.75 }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section style={{ background: C.bgSub, padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            Estudiantes reales
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
            Resultados que se ven en la nota
          </h2>
          <div className="lp-tgrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="lp-tcard" style={{
                background: C.bg, borderRadius: 16,
                padding: '24px 22px',
                border: `1px solid ${C.border}`,
                boxShadow: '0 2px 8px rgba(15,23,42,0.04)',
                display: 'flex', flexDirection: 'column', gap: 16,
                transition: 'transform 220ms cubic-bezier(0.22,1,0.36,1), box-shadow 220ms ease, border-color 220ms ease',
              }}>
                {/* Stars */}
                <div style={{ display: 'flex', gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} fill={C.amber} style={{ color: C.amber }} />
                  ))}
                </div>

                {/* Quote */}
                <p style={{ margin: 0, fontSize: '0.9rem', color: C.ink2, lineHeight: 1.75, fontWeight: 400, flex: 1 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Score badge */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  background: C.greenBg, border: `1px solid ${C.greenBd}`,
                  alignSelf: 'flex-start',
                }}>
                  <CheckCircle2 size={12} style={{ color: C.green }} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: C.green }}>{t.score}</span>
                  <span style={{ fontSize: 10, color: '#86efac', fontWeight: 500 }}>· {t.prev}</span>
                </div>

                {/* Author */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, borderTop: `1px solid ${C.border}` }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: C.bgBlue, color: C.blue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: C.soft }}>{t.city}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing preview ──────────────────────────────────────────────── */}
      <section style={{
        maxWidth: 1040, margin: '0 auto',
        padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
          Precios
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
          Exámenes oficiales, correcciones con foto y Camino PAU diario.
        </h2>
        <p style={{ maxWidth: 680, margin: '-28px auto 28px', color: C.muted, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
          Menos que una clase particular al mes. Beta privada: de momento probamos Matemáticas II y Matemáticas CCSS.
        </p>
        <div className="lp-plan-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 14, maxWidth: 1040, margin: '0 auto' }}>
          {LANDING_PRICING.map((plan) => (
            <div key={plan.name} className="lp-card" style={{
              background: plan.featured ? C.blue : C.bg,
              borderRadius: 18,
              padding: '24px 20px',
              border: plan.featured ? 'none' : `1px solid ${C.border}`,
              boxShadow: plan.featured ? '0 16px 40px rgba(37,99,235,0.28)' : '0 1px 4px rgba(15,23,42,0.04)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {plan.featured && <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />}
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: 12, fontWeight: 800, color: plan.featured ? 'rgba(255,255,255,0.7)' : C.muted, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{plan.name}</div>
                  <span style={{ fontSize: 10, fontWeight: 800, background: plan.featured ? 'rgba(255,255,255,0.18)' : C.bgBlue, color: plan.featured ? '#fff' : C.blueDeep, padding: '2px 8px', borderRadius: 999 }}>{plan.badge}</span>
                </div>
                <div style={{ fontSize: plan.price.length > 12 ? 25 : 34, fontWeight: 900, color: plan.featured ? '#fff' : C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 5 }}>{plan.price}</div>
                <div style={{ fontSize: 12, color: plan.featured ? 'rgba(255,255,255,0.64)' : C.soft, marginBottom: 14 }}>{plan.period}</div>
                <p style={{ minHeight: 58, margin: '0 0 16px', fontSize: 12, lineHeight: 1.55, color: plan.featured ? 'rgba(255,255,255,0.82)' : C.muted, fontWeight: 600 }}>{plan.description}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
                  {plan.bullets.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, lineHeight: 1.35, color: plan.featured ? 'rgba(255,255,255,0.9)' : C.ink2 }}>
                      <Check size={13} style={{ color: plan.featured ? 'rgba(255,255,255,0.84)' : C.green, flexShrink: 0, marginTop: 1 }} /> {item}
                    </div>
                  ))}
                </div>
                <Link href="/login" className={plan.featured ? 'lp-btn-primary' : 'lp-btn-ghost'} style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 7,
                  padding: '10px 14px', borderRadius: 12,
                  border: plan.featured ? 'none' : `1.5px solid ${C.border}`,
                  background: plan.featured ? '#fff' : C.bg,
                  color: plan.featured ? C.blueDeep : C.ink2,
                  fontWeight: 800, fontSize: 13, textDecoration: 'none',
                  boxShadow: plan.featured ? '0 4px 14px rgba(0,0,0,0.12)' : 'none',
                }}>
                  {plan.cta}{plan.featured && <ArrowRight size={14} />}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/pricing" style={{ fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
            Ver todos los detalles de planes →
          </Link>
        </div>
      </section>

      {/* ── Subjects ─────────────────────────────────────────────────────── */}
      <section style={{ background: C.bgSub, padding: 'clamp(56px,8vw,80px) clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 1040, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            Asignaturas
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 36px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
            Las seis materias de la EBAU Madrid
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {SUBJECTS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="lp-chip lp-card" style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 16px', borderRadius: 12,
                  background: C.bg, border: `1px solid ${C.border}`,
                  boxShadow: '0 1px 3px rgba(15,23,42,0.04)',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: s.bg, color: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={15} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: C.ink, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{s.label}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, marginTop: 2, color: s.ready ? C.green : C.soft }}>
                      {s.ready ? 'Disponible' : 'En preparación'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(40px,5.5vw,68px) clamp(20px,5vw,40px)' }}>
        <div style={{
          maxWidth: 1040, margin: '0 auto',
          borderRadius: 20,
          background: C.grad,
          padding: 'clamp(48px,7vw,72px) clamp(28px,5vw,60px)',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(37,99,235,0.24)',
        }}>
          <div style={{ position: 'absolute', top: -80, right: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -50, left: -50, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

          <span style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 999,
            background: 'rgba(255,255,255,0.18)', color: '#fff',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
            marginBottom: 20,
          }}>
            <Sparkles size={10} /> Beta privada
          </span>

          <h2 style={{
            position: 'relative',
            fontSize: 'clamp(1.8rem,4.5vw,2.8rem)', fontWeight: 900, color: '#fff',
            margin: '0 0 14px', letterSpacing: '-0.03em',
            lineHeight: 1.1, textWrap: 'balance' as never,
          }}>
            Deja de estudiar a ciegas.
          </h2>
          <p style={{
            position: 'relative',
            fontSize: 'clamp(0.95rem,2vw,1.05rem)',
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.8,
            maxWidth: 460, margin: '0 auto 32px', fontWeight: 400,
          }}>
            Kairo te dice exactamente qué fallas, cuánto sacarías hoy y qué repasar mañana.
          </p>
          <Link href="/login" className="lp-btn-primary" style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: 10,
            padding: '14px 32px', borderRadius: 999,
            background: '#fff', color: C.blueDeep,
            fontWeight: 800, fontSize: 15, textDecoration: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            letterSpacing: '-0.01em',
          }}>
            Empezar gratis <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}`, background: C.bgSub }}>
        <div className="lp-footer-grid" style={{ maxWidth: 1040, margin: '0 auto', padding: 'clamp(36px,5vw,52px) clamp(20px,5vw,48px) clamp(24px,4vw,36px)', display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', gap: 32 }}>
          {/* Brand */}
          <div>
            <KairoBrand subtitle={null} size="sm" />
            <p style={{ margin: '12px 0 0', fontSize: 12.5, color: C.soft, lineHeight: 1.7, maxWidth: 210 }}>
              Prepara la PAU con exámenes reales, corrección IA y un plan diario personalizado.
            </p>
          </div>
          {/* Producto */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.ink, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Producto</p>
            {[
              { label: 'Exámenes EBAU', href: '/examenes' },
              { label: 'Simulacros',    href: '/simulacros' },
              { label: 'Camino PAU',    href: '/camino' },
              { label: 'Zona de repaso', href: '/zona' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 8, fontWeight: 500 }} className="lp-nav-link">{label}</Link>
            ))}
          </div>
          {/* Info */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.ink, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Info</p>
            {[
              { label: 'Precios',        href: '/pricing' },
              { label: 'Cómo funciona',  href: '#como-funciona' },
              { label: 'Privacidad',     href: '/legal/privacidad' },
              { label: 'Términos',       href: '/legal/terminos' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ display: 'block', fontSize: 13, color: C.muted, textDecoration: 'none', marginBottom: 8, fontWeight: 500 }} className="lp-nav-link">{label}</Link>
            ))}
          </div>
          {/* CTA */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.ink, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>Acceder</p>
            <p style={{ fontSize: 12.5, color: C.soft, lineHeight: 1.65, marginBottom: 14 }}>Beta privada para estudiantes de 2º de Bachillerato.</p>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, background: C.grad, color: '#fff', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(37,99,235,0.22)' }}>
              Empezar gratis <ArrowRight size={12} />
            </Link>
          </div>
        </div>
        {/* Copyright bar */}
        <div style={{ borderTop: `1px solid ${C.border}`, padding: '13px clamp(20px,5vw,48px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <span style={{ fontSize: 11, color: C.soft }}>© 2026 Kairo · Preparación PAU · 2º Bachillerato</span>
          <span style={{ fontSize: 11, color: C.soft }}>Madrid y Cataluña · Beta privada</span>
        </div>
      </footer>
      <HeroCardsAnimator />
    </div>
  )
}
