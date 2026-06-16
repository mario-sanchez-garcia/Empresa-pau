import Link from 'next/link'
import {
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  CheckCircle2,
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
import PausiaBrand from '@/components/shared/PausiaBrand'
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero'

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
  { value: '2.400+',  label: 'Exámenes oficiales EBAU' },
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
  { icon: BrainCircuit, title: 'Plan de estudio personalizado',   desc: 'Pausia analiza tus errores y genera un plan semanal concreto y accionable.',                        color: '#059669', bg: '#ecfdf5' },
  { icon: Sparkles,     title: 'Flashcards y zona de repaso',     desc: 'Repasa conceptos clave con flashcards y un canvas libre para tus esquemas.',                        color: C.amber, bg: C.amberBg },
  { icon: MessageCircle,title: 'Chat con Pausia',                 desc: 'Tutor IA disponible 24/7 para resolver cualquier duda de Matemáticas, Física, Historia y más.',    color: '#db2777', bg: '#fdf2f8' },
]

const FEATURE_SPANS = [2, 1, 1, 2, 1, 2]

const SUBJECTS = [
  { icon: Sigma,        label: 'Matemáticas II',    color: C.blue,    bg: C.bgBlue,   ready: true  },
  { icon: Atom,         label: 'Física',             color: '#ca8a04', bg: '#fefce8',  ready: true  },
  { icon: Landmark,     label: 'Historia de España', color: '#78350f', bg: '#fff8f1',  ready: true  },
  { icon: FlaskConical, label: 'Química',            color: '#ea580c', bg: '#fff7ed',  ready: true  },
  { icon: Dna,          label: 'Biología',            color: '#047857', bg: '#D1FAE5',  ready: false },
  { icon: BookOpen,     label: 'Lengua',              color: C.blue,    bg: C.bgBlue,   ready: true  },
]

const COMPARE_ROWS = [
  { label: 'Exámenes reales EBAU Madrid',    pausia: true,   academia: true,  solo: true  },
  { label: 'Corrección instantánea por IA',  pausia: true,   academia: false, solo: false },
  { label: 'Desglose por apartado/criterio', pausia: true,   academia: false, solo: false },
  { label: 'Plan de estudio personalizado',  pausia: true,   academia: false, solo: false },
  { label: 'Disponible 24 horas al día',     pausia: true,   academia: false, solo: true  },
  { label: 'Chat con tutor IA',              pausia: true,   academia: false, solo: false },
  { label: 'Historial de progreso',          pausia: true,   academia: false, solo: false },
  { label: 'Precio mensual',                 pText: 'Gratis / 14,99€', aText: '100–200€', sText: 'Gratis' },
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
    quote: 'Sin dinero para academia. Solo Pausia y la biblioteca municipal. 9,2 en Historia de España. El plan semanal me dijo qué estudiar cada día.',
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
        <div style={{
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

        <div style={{
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

        <div style={{
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
          view-timeline-name: --pausia-hero;
          view-timeline-axis: block;
        }
        .lp-hero-grid {
          animation: lp-hero-depth 1s linear both;
          animation-timeline: --pausia-hero;
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
          animation-timeline: --pausia-hero;
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
          animation-timeline: --pausia-hero;
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
        @media (max-width: 768px) {
          .lp-hero-grid, .lp-moment-grid { grid-template-columns: 1fr !important; }
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

        /* ── Reduced motion ── */
        @media (prefers-reduced-motion: reduce) {
          .lp-h1, .lp-p, .lp-ctas, .lp-mock { animation: none !important; }
          .lp-float { animation: none !important; }
          .lp-scroll-reveal, .lp-cloud, .lp-particle, .lp-hero-grid, .lp-hero-cloud, .lp-hero-vapor { animation: none !important; }
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
          <PausiaBrand subtitle={null} size="lg" />
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

      {/* ── Hero — ScrollExpandMedia ─────────────────────────────────────── */}
      <ScrollExpandMedia
        mediaType="image"
        mediaSrc="/brand/pausia-hero-3d.png"
        bgImageSrc="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=85&auto=format&fit=crop"
        title="Prepara la PAU"
        date="EBAU Madrid 2025"
        scrollToExpand="Scroll para explorar"
        textBlend
        overlayClass="absolute inset-0 rounded-xl"
      >
        <div style={{
          background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: 20, padding: 'clamp(40px,6vw,64px) clamp(24px,5vw,56px)',
          textAlign: 'center', maxWidth: 680, margin: '0 auto',
        }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '5px 14px', borderRadius: 999,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
            backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
            fontSize: 11, fontWeight: 800, letterSpacing: '0.07em',
            color: 'rgba(255,255,255,0.92)', textTransform: 'uppercase',
            marginBottom: 24,
          } as React.CSSProperties}>
            <Sparkles size={10} style={{ color: '#60a5fa' }} /> Beta privada · EBAU Madrid 2025
          </span>
          <h1 className="lp-h1" style={{
            fontSize: 'clamp(2.6rem,6vw,4rem)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-0.03em',
            color: '#ffffff', margin: '0 0 20px',
            textWrap: 'balance' as never,
            textShadow: '0 2px 24px rgba(0,0,0,0.3)',
            animationDelay: '60ms',
          }}>
            La forma más inteligente de preparar la{' '}
            <span style={{ color: '#93c5fd' }}>PAU</span>
          </h1>
          <p className="lp-p" style={{
            fontSize: 'clamp(1rem,2.2vw,1.15rem)',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.8, margin: '0 auto 36px',
            maxWidth: 520, fontWeight: 400,
          }}>
            Resuelve exámenes reales de la EBAU Madrid, recibe nota al instante
            y deja que la IA convierta tus errores en un plan de estudio personalizado.
          </p>
          <div className="lp-ctas" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/login" className="lp-btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '13px 28px', borderRadius: 999,
              background: C.grad, color: '#fff',
              fontWeight: 800, fontSize: 15, textDecoration: 'none',
              boxShadow: '0 12px 32px rgba(37,99,235,0.40)',
              letterSpacing: '-0.01em',
            }}>
              Empezar gratis
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <ArrowRight size={13} />
              </span>
            </Link>
            <a href="#como-funciona" className="lp-btn-ghost" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '13px 24px', borderRadius: 999,
              border: '1.5px solid rgba(255,255,255,0.30)',
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
              color: 'rgba(255,255,255,0.88)', fontWeight: 600, fontSize: 15, textDecoration: 'none',
            }}>
              Ver cómo funciona
            </a>
          </div>
          <div className="lp-ctas" style={{
            display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 28,
            justifyContent: 'center', animationDelay: '220ms',
          }}>
            {['Exámenes oficiales EBAU', 'Criterios Ministerio Educación', 'Currículum 2025'].map((t) => (
              <span key={t} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.70)',
                padding: '4px 12px', borderRadius: 999,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              }}>
                <CheckCircle2 size={11} style={{ color: '#86efac' }} /> {t}
              </span>
            ))}
          </div>
        </div>
      </ScrollExpandMedia>

      {/* ── Hero abstracto ───────────────────────────────────────────────── */}
      <section className="lp-hero-section" style={{
        position: 'relative',
        overflow: 'hidden',
        minHeight: 'calc(100vh - 76px)',
        padding: 'clamp(72px,9vw,118px) clamp(20px,5vw,48px) clamp(54px,7vw,86px)',
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
          <div className="lp-hero-visual">
            <HeroProductCloud />
          </div>
        </div>
      </section>

      {/* ── Scroll narrative ─────────────────────────────────────────────── */}
      <section id="como-funciona" style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(72px,9vw,112px) clamp(20px,5vw,48px)',
        background: 'linear-gradient(180deg, #eff6ff 0%, #ffffff 30%, #f8fafc 100%)',
      }}>
        <div style={{ maxWidth: 1140, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ maxWidth: 660, marginBottom: 'clamp(34px,5vw,56px)' }}>
            <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
              Cómo funciona
            </p>
            <h2 style={{ fontSize: 'clamp(2rem,4.6vw,3.3rem)', fontWeight: 950, color: C.ink, margin: '0 0 14px', letterSpacing: '-0.05em', lineHeight: 1.04, textWrap: 'balance' as never }}>
              Un scroll, cuatro momentos clave.
            </h2>
            <p style={{ fontSize: 'clamp(0.98rem,2vw,1.08rem)', color: C.muted, lineHeight: 1.8, margin: 0 }}>
              Pausia no solo corrige: organiza el proceso completo desde el examen real hasta el siguiente paso de estudio.
            </p>
          </div>

          <div style={{ display: 'grid', gap: 'clamp(24px,4vw,34px)' }}>
            {SCROLL_MOMENTS.map((moment, i) => {
              const Icon = moment.icon
              return (
                <article key={moment.n} className="lp-scroll-moment lp-scroll-reveal" style={{
                  borderRadius: 34,
                  padding: 'clamp(26px,4vw,42px)',
                  border: '1px solid rgba(191,219,254,0.76)',
                  background: 'rgba(255,255,255,0.76)',
                  boxShadow: '0 24px 70px rgba(37,99,235,0.08)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at ${i % 2 ? '16% 24%' : '84% 18%'}, ${moment.soft}, transparent 36%)`, pointerEvents: 'none' }} />
                  <div className="lp-moment-grid" style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'grid',
                    gridTemplateColumns: i % 2 ? '1.04fr 0.96fr' : '0.96fr 1.04fr',
                    gap: 'clamp(26px,5vw,58px)',
                    alignItems: 'center',
                  }}>
                    <div style={{ order: i % 2 ? 2 : 1 }}>
                      <div style={{
                        width: 52,
                        height: 52,
                        borderRadius: 18,
                        display: 'grid',
                        placeItems: 'center',
                        background: moment.soft,
                        color: moment.color,
                        boxShadow: `0 16px 36px ${moment.accent}44`,
                        marginBottom: 22,
                      }}>
                        <Icon size={24} />
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 950, letterSpacing: '0.1em', textTransform: 'uppercase', color: moment.color, marginBottom: 10 }}>
                        Momento {moment.n}
                      </div>
                      <h3 style={{ margin: '0 0 12px', fontSize: 'clamp(1.8rem,4vw,2.7rem)', lineHeight: 1.05, fontWeight: 950, letterSpacing: '-0.05em', color: C.ink, textWrap: 'balance' as never }}>
                        {moment.title}
                      </h3>
                      <p style={{ margin: 0, fontSize: 'clamp(0.98rem,2vw,1.1rem)', lineHeight: 1.8, color: C.muted, maxWidth: 430, fontWeight: 500 }}>
                        {moment.desc}
                      </p>
                    </div>
                    <div style={{ order: i % 2 ? 1 : 2 }}>
                      <MomentVisual moment={moment} />
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
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
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
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
      <section style={{ background: C.bgSub, padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
            Por qué Pausia
          </p>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
            Pausia vs cómo estudias ahora
          </h2>

          <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, overflow: 'hidden', background: C.bg, boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
            {/* Table header */}
            <div className="lp-compare-table" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', borderBottom: `1px solid ${C.border}`, background: C.bgSub }}>
              <div style={{ padding: '14px 20px', fontSize: 12, fontWeight: 700, color: C.soft }}>Funcionalidad</div>
              {[
                { label: 'Pausia', accent: true  },
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
                {/* Pausia */}
                <div style={{
                  padding: '13px 16px', borderLeft: `1px solid ${C.border}`,
                  background: C.bgBlue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {'pText' in row
                    ? <span style={{ fontSize: 12, fontWeight: 800, color: C.blue }}>{row.pText}</span>
                    : row.pausia
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
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
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
      <section style={{ background: C.bgSub, padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)' }}>
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
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
          Precios
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
          Empieza gratis. Sube cuando quieras.
        </h2>
        <div className="lp-plan-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, maxWidth: 740, margin: '0 auto' }}>
          {/* Free */}
          <div className="lp-card" style={{
            background: C.bg, borderRadius: 18,
            padding: '28px 26px',
            border: `1px solid ${C.border}`,
            boxShadow: '0 1px 4px rgba(15,23,42,0.04)',
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Básico</div>
            <div style={{ fontSize: 38, fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>Gratis</div>
            <div style={{ fontSize: 12, color: C.soft, marginBottom: 22 }}>Para empezar</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
              {['10 exámenes al mes', 'Corrección IA por apartado', 'Historial de 4 semanas', '4 asignaturas disponibles'].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: C.ink2 }}>
                  <Check size={14} style={{ color: C.green, flexShrink: 0 }} /> {item}
                </div>
              ))}
            </div>
            <Link href="/login" className="lp-btn-ghost" style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              padding: '11px 20px', borderRadius: 12,
              border: `1.5px solid ${C.border}`, background: C.bg,
              color: C.ink2, fontWeight: 700, fontSize: 14, textDecoration: 'none',
            }}>
              Empezar gratis
            </Link>
          </div>

          {/* Premium */}
          <div className="lp-card" style={{
            background: C.blue, borderRadius: 18,
            padding: '28px 26px',
            border: 'none',
            boxShadow: '0 16px 40px rgba(37,99,235,0.28)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: -30, right: -30,
              width: 140, height: 140, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Premium</div>
                <span style={{ fontSize: 10, fontWeight: 800, background: 'rgba(255,255,255,0.18)', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>Recomendado</span>
              </div>
              <div style={{ fontSize: 38, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 4 }}>14,99€</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 22 }}>por mes · cancela cuando quieras</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 24 }}>
                {['Exámenes ilimitados', 'Plan semanal personalizado', 'Chat con tutor IA 24/7', 'Flashcards y zona de repaso', 'Historial completo', 'Acceso anticipado a nuevas materias'].map((item) => (
                  <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>
                    <Check size={14} style={{ color: 'rgba(255,255,255,0.8)', flexShrink: 0 }} /> {item}
                  </div>
                ))}
              </div>
              <Link href="/login" className="lp-btn-primary" style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                padding: '11px 20px', borderRadius: 12,
                background: '#fff', color: C.blueDeep,
                fontWeight: 800, fontSize: 14, textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
              }}>
                Empezar con Premium <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link href="/pricing" style={{ fontSize: 13, color: C.blue, fontWeight: 600, textDecoration: 'none' }}>
            Ver todos los detalles del plan →
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
      <section style={{ padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)' }}>
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
            Pausia te dice exactamente qué fallas, cuánto sacarías hoy y qué repasar mañana.
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
      <footer style={{
        borderTop: `1px solid ${C.border}`,
        background: C.bgSub,
        padding: '20px clamp(20px,5vw,48px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12,
      }}>
        <PausiaBrand subtitle={null} size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: C.soft }}>Preparación PAU · 2º Bachillerato</span>
          <Link href="/legal/privacidad" style={{ fontSize: 12, color: C.soft, textDecoration: 'none' }} className="lp-nav-link">Privacidad</Link>
          <Link href="/legal/terminos" style={{ fontSize: 12, color: C.soft, textDecoration: 'none' }} className="lp-nav-link">Términos</Link>
        </div>
        <Link href="/login" style={{ fontSize: 13, fontWeight: 700, color: C.blue, textDecoration: 'none' }}>
          Entrar →
        </Link>
      </footer>
    </div>
  )
}
