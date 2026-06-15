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
  GraduationCap,
  Landmark,
  MessageCircle,
  Sigma,
  Sparkles,
  Star,
  TimerReset,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import SmoothScrollHero from '@/components/ui/smooth-scroll-hero'

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
        .lp-h1   { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) both; }
        .lp-p    { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) 80ms both; }
        .lp-ctas { animation: lp-up 560ms cubic-bezier(0.22,1,0.36,1) 160ms both; }
        .lp-mock { animation: lp-in  660ms cubic-bezier(0.22,1,0.36,1) 240ms both; }
        .lp-float { animation: lp-float 4.5s ease-in-out infinite; }

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
        }
      `}</style>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.90)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 clamp(20px,5vw,48px)', height: '62px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, flexShrink: 0,
            background: C.grad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37,99,235,0.24)',
          }}>
            <GraduationCap size={17} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Pausia</div>
            <div style={{ fontSize: 9, color: C.soft, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>EBAU Madrid</div>
          </div>
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

      {/* ── Hero — SmoothScrollHero ──────────────────────────────────────── */}
      <SmoothScrollHero
        scrollHeight={1400}
        desktopImage="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1920&q=85&auto=format&fit=crop"
        mobileImage="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&q=85&auto=format&fit=crop"
        initialClipPercentage={22}
        finalClipPercentage={78}
      >
        {/* Hero text — white on dark image overlay */}
        <div className="lp-h1" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
          {/* Badge */}
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

          {/* Headline */}
          <h1 className="lp-h1" style={{
            fontSize: 'clamp(2.6rem,6vw,4rem)', fontWeight: 900,
            lineHeight: 1.08, letterSpacing: '-0.03em',
            color: '#ffffff',
            margin: '0 0 20px',
            textWrap: 'balance' as never,
            textShadow: '0 2px 24px rgba(0,0,0,0.3)',
            animationDelay: '60ms',
          }}>
            La forma más inteligente de preparar la{' '}
            <span style={{ color: '#93c5fd' }}>PAU</span>
          </h1>

          {/* Subtext */}
          <p className="lp-p" style={{
            fontSize: 'clamp(1rem,2.2vw,1.15rem)',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.8, margin: '0 auto 36px',
            maxWidth: 520, fontWeight: 400,
          }}>
            Resuelve exámenes reales de la EBAU Madrid, recibe nota al instante
            y deja que la IA convierta tus errores en un plan de estudio personalizado.
          </p>

          {/* CTAs */}
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

          {/* Trust pills */}
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
      </SmoothScrollHero>

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
      <section id="como-funciona" style={{
        maxWidth: 1040, margin: '0 auto',
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
      }}>
        <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.blue, marginBottom: 10 }}>
          Cómo funciona
        </p>
        <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.4rem)', fontWeight: 900, color: C.ink, margin: '0 0 44px', letterSpacing: '-0.03em', lineHeight: 1.15, textWrap: 'balance' as never }}>
          Tres pasos. Sin complicaciones.
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 26, height: 26, borderRadius: 8,
            background: C.grad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 10px rgba(37,99,235,0.2)',
          }}>
            <GraduationCap size={13} />
          </div>
          <span style={{ fontWeight: 700, color: C.ink, fontSize: 14, letterSpacing: '-0.02em' }}>Pausia</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: C.soft }}>EBAU Madrid · 2º Bachillerato</span>
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
