import Link from 'next/link'
import {
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
  Dna,
  FlaskConical,
  GraduationCap,
  Landmark,
  MessageCircle,
  Sigma,
  Sparkles,
  TimerReset,
  WandSparkles,
  Zap,
} from 'lucide-react'

const C = {
  ink: '#0d1424',
  ink2: '#1e293b',
  muted: '#5a6b82',
  soft: '#8fa3bc',
  surface: '#ffffff',
  wash: '#eff6ff',
  border: '#dbe7fb',
  blue: '#2563eb',
  deep: '#1d4ed8',
  accent: '#60a5fa',
  grad: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 54%, #3b7cf8 100%)',
  bg: 'radial-gradient(ellipse 90% 60% at -5% -5%, rgba(219,234,254,0.55) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 105% -10%, rgba(224,231,255,0.42) 0%, transparent 50%), radial-gradient(ellipse 50% 70% at 50% 110%, rgba(239,246,255,0.35) 0%, transparent 60%), linear-gradient(165deg, #f7faff 0%, #f0f5fe 60%, #edf2fd 100%)',
}

const FEATURES = [
  {
    icon: TimerReset,
    title: 'Simulacros con tiempo real',
    desc: 'Cronómetro integrado para que practiques exactamente como en la PAU.',
    color: '#2563eb',
    light: '#eff6ff',
  },
  {
    icon: WandSparkles,
    title: 'Corrección IA paso a paso',
    desc: 'Nota al instante con desglose detallado de cada apartado y criterio de corrección.',
    color: '#7c3aed',
    light: '#f5f3ff',
  },
  {
    icon: BarChart3,
    title: 'Historial de progreso',
    desc: 'Todas tus correcciones guardadas para que veas tu evolución semana a semana.',
    color: '#0891b2',
    light: '#ecfeff',
  },
  {
    icon: BrainCircuit,
    title: 'Plan de estudio personalizado',
    desc: 'Pausia analiza tus errores y genera un plan semanal concreto y accionable.',
    color: '#059669',
    light: '#ecfdf5',
  },
  {
    icon: Sparkles,
    title: 'Flashcards y zona de repaso',
    desc: 'Repasa conceptos clave con flashcards y un canvas libre para tus esquemas.',
    color: '#d97706',
    light: '#fffbeb',
  },
  {
    icon: MessageCircle,
    title: 'Chat con Pausia',
    desc: 'Tutor IA disponible 24/7 para resolver cualquier duda de Matemáticas, Física, Historia y más.',
    color: '#db2777',
    light: '#fdf2f8',
  },
]

const SUBJECTS = [
  { icon: Sigma,       label: 'Matemáticas II',  color: '#2563eb', light: '#eff6ff',  ready: true },
  { icon: Atom,        label: 'Física',           color: '#ca8a04', light: '#fefce8',  ready: true },
  { icon: Landmark,    label: 'Historia de España',color: '#78350f', light: '#fff8f1', ready: true },
  { icon: FlaskConical,label: 'Química',           color: '#ea580c', light: '#fff7ed', ready: true },
  { icon: Dna,         label: 'Biología',          color: '#047857', light: '#D1FAE5', ready: false },
  { icon: BookOpen,    label: 'Lengua',            color: '#2563eb', light: '#eff6ff',  ready: true },
]

const STEPS = [
  {
    n: '1',
    icon: ClipboardList,
    title: 'Elige asignatura y examen',
    desc: 'Selecciona cualquier convocatoria oficial de la EBAU Madrid, desde 2010 hasta hoy.',
  },
  {
    n: '2',
    icon: Zap,
    title: 'Resuelve como en la PAU',
    desc: 'Escribe tu respuesta o adjunta una foto de tu hoja. Con o sin cronómetro.',
  },
  {
    n: '3',
    icon: BrainCircuit,
    title: 'Recibe nota, feedback y plan',
    desc: 'Nota inmediata, corrección comentada y un plan de repaso basado en tus fallos.',
  },
]

// Feature bento: wide = span 2, narrow = span 1
// Row 1: [0:wide][1:narrow]  →  2+1=3
// Row 2: [2:narrow][3:wide]  →  1+2=3
// Row 3: [4:narrow][5:wide]  →  1+2=3
const FEATURE_SPANS = [2, 1, 1, 2, 1, 2]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.ink }}>
      <style>{`
        /* Transitions — custom cubic-bezier (Emil Kowalski) */
        .lp-cta-primary {
          transition: transform 180ms cubic-bezier(0.23,1,0.32,1),
                      box-shadow 180ms cubic-bezier(0.23,1,0.32,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-cta-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 22px 48px rgba(37,99,235,0.32) !important;
          }
        }
        .lp-cta-primary:active { transform: scale(0.97) !important; }

        .lp-cta-ghost {
          transition: transform 160ms cubic-bezier(0.23,1,0.32,1),
                      border-color 160ms cubic-bezier(0.23,1,0.32,1),
                      background 160ms cubic-bezier(0.23,1,0.32,1),
                      color 160ms cubic-bezier(0.23,1,0.32,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-cta-ghost:hover {
            transform: translateY(-2px);
            border-color: #93c5fd !important;
            background: rgba(239,246,255,0.95) !important;
            color: #1d4ed8 !important;
          }
        }
        .lp-cta-ghost:active { transform: scale(0.97) !important; }

        .lp-card {
          transition: transform 220ms cubic-bezier(0.23,1,0.32,1),
                      box-shadow 220ms cubic-bezier(0.23,1,0.32,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 36px rgba(37,99,235,0.13) !important;
          }
          .lp-subject-chip:hover {
            box-shadow: 0 8px 24px rgba(37,99,235,0.10) !important;
            transform: translateY(-2px);
          }
        }

        /* Hero entry animations */
        @keyframes lp-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .lp-hero-h1   { animation: lp-fade-up 560ms cubic-bezier(0.23,1,0.32,1) both; }
        .lp-hero-p    { animation: lp-fade-up 560ms cubic-bezier(0.23,1,0.32,1) 80ms both; }
        .lp-hero-ctas { animation: lp-fade-up 560ms cubic-bezier(0.23,1,0.32,1) 160ms both; }

        /* Bento grid: mobile collapse */
        @media (max-width: 767px) {
          .lp-bento { grid-template-columns: 1fr !important; }
          .lp-bento-card { grid-column: auto !important; flex-direction: column !important; }
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .lp-hero-h1, .lp-hero-p, .lp-hero-ctas { animation: none; }
        }
      `}</style>

      {/* ── Nav ───────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(219,231,251,0.8)',
        padding: '0 clamp(20px, 5vw, 48px)',
        height: '66px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            background: C.grad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(37,99,235,0.24)',
          }}>
            <GraduationCap size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '16px', color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.1 }}>Pausia</div>
            <div style={{ fontSize: '10px', color: C.soft, fontWeight: 600, letterSpacing: '0.01em' }}>EBAU Madrid</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Link href="/pricing" className="lp-cta-ghost" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '9px 16px', borderRadius: '999px',
            border: '1.5px solid #dbe7fb', background: 'transparent',
            color: C.muted, fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          }}>
            Ver planes
          </Link>
          <Link href="/login" className="lp-cta-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 18px', borderRadius: '999px',
            background: C.grad, color: '#fff',
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(37,99,235,0.22)',
          }}>
            Entrar <ArrowRight size={14} />
          </Link>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '800px', margin: '0 auto',
        padding: 'clamp(80px,12vw,136px) clamp(20px,5vw,32px) clamp(72px,10vw,120px)',
        textAlign: 'center',
      }}>
        <h1 className="lp-hero-h1" style={{
          fontSize: 'clamp(2.5rem, 7vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          color: C.ink,
          margin: '0 0 22px',
          textWrap: 'balance' as never,
        }}>
          Prepara la PAU con{' '}
          <span style={{ color: C.blue }}>simulacros corregidos por IA</span>
        </h1>

        <p className="lp-hero-p" style={{
          fontSize: 'clamp(1.05rem, 2.6vw, 1.2rem)',
          color: C.muted,
          lineHeight: 1.75,
          maxWidth: '560px',
          margin: '0 auto 40px',
        }}>
          Practica exámenes reales de la EBAU Madrid, recibe nota al instante y deja que
          Pausia convierta tus errores en un plan de estudio.
        </p>

        <div className="lp-hero-ctas" style={{
          display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap',
        }}>
          <Link href="/login" className="lp-cta-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 30px', borderRadius: '999px',
            background: C.grad, color: '#fff',
            fontWeight: 800, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 12px 32px rgba(37,99,235,0.28)',
          }}>
            Empezar gratis
            <span style={{
              width: '24px', height: '24px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <ArrowRight size={14} />
            </span>
          </Link>
          <a href="#como-funciona" className="lp-cta-ghost" style={{
            display: 'inline-flex', alignItems: 'center', gap: '9px',
            padding: '14px 28px', borderRadius: '999px',
            border: '1.5px solid #dbe7fb', background: 'rgba(255,255,255,0.92)',
            color: C.muted, fontWeight: 700, fontSize: '15px', textDecoration: 'none',
          }}>
            Ver cómo funciona
          </a>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────── */}
      <section id="como-funciona" style={{
        maxWidth: '1040px', margin: '0 auto',
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,32px)',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.9rem, 4.5vw, 2.7rem)',
          fontWeight: 900,
          color: C.ink,
          margin: '0 0 48px',
          letterSpacing: '-0.025em',
          textAlign: 'center',
          textWrap: 'balance' as never,
        }}>
          Tres pasos. Sin complicaciones.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '14px',
        }}>
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.n} className="lp-card" style={{
                background: '#fff',
                borderRadius: '14px',
                padding: '32px 26px',
                boxShadow: '0 2px 6px rgba(37,99,235,0.05), 0 6px 20px rgba(37,99,235,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: '18px', right: '22px',
                  fontSize: '50px', fontWeight: 900,
                  color: 'rgba(219,231,251,0.55)', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {step.n}
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: C.wash, color: C.blue,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <Icon size={21} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: C.ink, marginBottom: '8px' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.7 }}>{step.desc}</div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Features — Bento grid ──────────────────────────────────── */}
      <section style={{
        maxWidth: '1040px', margin: '0 auto',
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,32px)',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.9rem, 4.5vw, 2.7rem)',
          fontWeight: 900,
          color: C.ink,
          margin: '0 0 48px',
          letterSpacing: '-0.025em',
          textWrap: 'balance' as never,
        }}>
          Todo lo que necesitas para la EBAU
        </h2>

        <div className="lp-bento" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '14px',
        }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            const span = FEATURE_SPANS[i]
            const isWide = span === 2
            return (
              <div key={f.title} className="lp-card lp-bento-card" style={{
                background: '#fff',
                borderRadius: '14px',
                padding: isWide ? '28px 30px' : '28px 24px',
                boxShadow: '0 2px 6px rgba(37,99,235,0.05), 0 6px 20px rgba(37,99,235,0.05)',
                display: 'flex',
                flexDirection: isWide ? 'row' : 'column',
                gap: isWide ? '20px' : '14px',
                alignItems: isWide ? 'flex-start' : undefined,
                gridColumn: `span ${span}`,
              }}>
                <div style={{
                  width: '46px', height: '46px', minWidth: '46px',
                  borderRadius: '12px',
                  background: f.light, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1rem', color: C.ink, marginBottom: '7px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: C.muted, lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Subjects ──────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1040px', margin: '0 auto',
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,32px)',
      }}>
        <h2 style={{
          fontSize: 'clamp(1.9rem, 4.5vw, 2.7rem)',
          fontWeight: 900,
          color: C.ink,
          margin: '0 0 36px',
          letterSpacing: '-0.025em',
          textWrap: 'balance' as never,
        }}>
          Las seis materias de la EBAU Madrid
        </h2>

        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: '12px',
        }}>
          {SUBJECTS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="lp-card lp-subject-chip" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 18px',
                borderRadius: '12px',
                background: '#fff',
                boxShadow: '0 2px 6px rgba(37,99,235,0.05), 0 4px 14px rgba(37,99,235,0.04)',
              }}>
                <div style={{
                  width: '34px', height: '34px',
                  borderRadius: '10px',
                  background: s.light, color: s.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.ink, lineHeight: 1.2 }}>{s.label}</div>
                  <div style={{
                    fontSize: '11px', fontWeight: 700, marginTop: '2px',
                    color: s.ready ? '#059669' : '#047857',
                  }}>
                    {s.ready ? 'Disponible' : 'En preparación'}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Beta CTA ──────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '1040px', margin: '0 auto',
        padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,32px)',
      }}>
        <div style={{
          borderRadius: '14px',
          background: '#f0f6ff',
          border: '1px solid #dbe7fb',
          padding: 'clamp(40px,6vw,64px) clamp(28px,5vw,52px)',
          textAlign: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '260px', height: '260px', borderRadius: '50%',
            background: 'rgba(96,165,250,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-50px', left: '-50px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'rgba(37,99,235,0.05)', pointerEvents: 'none',
          }} />
          <span style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: C.blue, color: '#fff',
            fontSize: '11px', fontWeight: 800, letterSpacing: '0.04em',
            marginBottom: '20px',
            boxShadow: '0 6px 16px rgba(37,99,235,0.22)',
          }}>
            <Sparkles size={11} /> Beta privada
          </span>
          <h2 style={{
            position: 'relative',
            fontSize: 'clamp(1.6rem, 4.5vw, 2.3rem)',
            fontWeight: 900, color: C.ink,
            margin: '0 0 14px', letterSpacing: '-0.025em',
            textWrap: 'balance' as never,
          }}>
            Estamos construyendo Pausia con estudiantes reales.
          </h2>
          <p style={{
            position: 'relative',
            fontSize: 'clamp(0.95rem, 2vw, 1.06rem)',
            color: C.muted, lineHeight: 1.75,
            maxWidth: '480px', margin: '0 auto 32px',
          }}>
            Tus exámenes, tus errores y tu feedback directo ayudan a mejorar Pausia cada semana.
            Únete ahora y forma parte desde el principio.
          </p>
          <Link href="/login" className="lp-cta-primary" style={{
            position: 'relative',
            display: 'inline-flex', alignItems: 'center', gap: '9px',
            padding: '13px 30px', borderRadius: '999px',
            background: C.grad, color: '#fff',
            fontWeight: 800, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 12px 32px rgba(37,99,235,0.26)',
          }}>
            Probar la beta <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section style={{
        maxWidth: '680px', margin: '0 auto',
        padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,32px) clamp(88px,12vw,136px)',
        textAlign: 'center',
      }}>
        <h2 style={{
          fontSize: 'clamp(2.1rem, 5.5vw, 3.2rem)',
          fontWeight: 900, color: C.ink,
          margin: '0 0 16px', letterSpacing: '-0.03em',
          lineHeight: 1.1, textWrap: 'balance' as never,
        }}>
          Deja de estudiar a ciegas.
        </h2>
        <p style={{
          fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
          color: C.muted, lineHeight: 1.75,
          margin: '0 auto 36px', maxWidth: '480px',
        }}>
          Pausia te dice qué fallas, cuánto sacarías y qué repasar después.
        </p>
        <Link href="/login" className="lp-cta-primary" style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          padding: '15px 36px', borderRadius: '999px',
          background: C.grad, color: '#fff',
          fontWeight: 800, fontSize: '15px', textDecoration: 'none',
          boxShadow: '0 14px 36px rgba(37,99,235,0.28)',
        }}>
          Entrar a Pausia <ArrowRight size={16} />
        </Link>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid rgba(219,231,251,0.8)',
        background: 'rgba(255,255,255,0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        padding: '24px clamp(20px,5vw,48px)',
        display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '9px',
            background: C.grad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(37,99,235,0.2)',
          }}>
            <GraduationCap size={14} />
          </div>
          <span style={{ fontWeight: 700, color: C.ink, fontSize: '14px', letterSpacing: '-0.01em' }}>Pausia</span>
        </div>
        <span style={{ fontSize: '13px', color: C.soft }}>EBAU Madrid · 2º Bachillerato</span>
        <Link href="/login" style={{
          fontSize: '13px', fontWeight: 700, color: C.blue, textDecoration: 'none',
        }}>
          Entrar →
        </Link>
      </footer>
    </div>
  )
}
