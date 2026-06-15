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
  bg: '#06101e',
  bgCard: '#091828',
  bgCardHi: '#0d2040',
  border: 'rgba(48,95,200,0.18)',
  borderBr: 'rgba(64,130,255,0.36)',
  blue: '#3d7eff',
  blueSoft: '#60a5fa',
  blueGlow: 'rgba(61,126,255,0.22)',
  amber: '#f0ab22',
  text: '#ddeeff',
  textSub: '#6a8cb8',
  textMut: '#3a5a7a',
  success: '#10b981',
  grad: 'linear-gradient(135deg, #1a4fd8 0%, #3d7eff 54%, #60a5fa 100%)',
}

const STATS = [
  { value: '2.400+', label: 'Exámenes disponibles' },
  { value: '38', label: 'Semanas de currículum PAU' },
  { value: '< 30s', label: 'Para recibir tu corrección' },
]

const FEATURES = [
  {
    icon: TimerReset,
    title: 'Simulacros con tiempo real',
    desc: 'Cronómetro integrado para que practiques exactamente como en la PAU.',
    color: '#60a5fa',
    light: 'rgba(61,126,255,0.12)',
  },
  {
    icon: WandSparkles,
    title: 'Corrección IA paso a paso',
    desc: 'Nota al instante con desglose detallado de cada apartado y criterio de corrección.',
    color: '#a78bfa',
    light: 'rgba(124,58,237,0.12)',
  },
  {
    icon: BarChart3,
    title: 'Historial de progreso',
    desc: 'Todas tus correcciones guardadas para que veas tu evolución semana a semana.',
    color: '#22d3ee',
    light: 'rgba(8,145,178,0.12)',
  },
  {
    icon: BrainCircuit,
    title: 'Plan de estudio personalizado',
    desc: 'Pausia analiza tus errores y genera un plan semanal concreto y accionable.',
    color: '#34d399',
    light: 'rgba(5,150,105,0.12)',
  },
  {
    icon: Sparkles,
    title: 'Flashcards y zona de repaso',
    desc: 'Repasa conceptos clave con flashcards y un canvas libre para tus esquemas.',
    color: '#fbbf24',
    light: 'rgba(217,119,6,0.12)',
  },
  {
    icon: MessageCircle,
    title: 'Chat con Pausia',
    desc: 'Tutor IA disponible 24/7 para resolver cualquier duda de Matemáticas, Física, Historia y más.',
    color: '#f472b6',
    light: 'rgba(219,39,119,0.12)',
  },
]

const SUBJECTS = [
  { icon: Sigma,        label: 'Matemáticas II',   color: '#60a5fa', light: 'rgba(61,126,255,0.14)',  ready: true },
  { icon: Atom,         label: 'Física',            color: '#fbbf24', light: 'rgba(217,119,6,0.14)',   ready: true },
  { icon: Landmark,     label: 'Historia de España',color: '#f0ab22', light: 'rgba(240,171,34,0.14)',  ready: true },
  { icon: FlaskConical, label: 'Química',            color: '#fb923c', light: 'rgba(234,88,12,0.14)',   ready: true },
  { icon: Dna,          label: 'Biología',           color: '#34d399', light: 'rgba(5,150,105,0.14)',   ready: false },
  { icon: BookOpen,     label: 'Lengua',             color: '#60a5fa', light: 'rgba(61,126,255,0.14)',  ready: true },
]

const STEPS = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Elige asignatura y examen',
    desc: 'Selecciona cualquier convocatoria oficial de la EBAU Madrid, desde 2010 hasta hoy.',
  },
  {
    n: '02',
    icon: Zap,
    title: 'Resuelve como en la PAU',
    desc: 'Escribe tu respuesta o adjunta una foto de tu hoja. Con o sin cronómetro.',
  },
  {
    n: '03',
    icon: BrainCircuit,
    title: 'Recibe nota, feedback y plan',
    desc: 'Nota inmediata, corrección comentada y un plan de repaso basado en tus fallos.',
  },
]

const FEATURE_SPANS = [2, 1, 1, 2, 1, 2]

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');

        * { box-sizing: border-box; }

        body { font-family: 'DM Sans', system-ui, sans-serif; }

        /* Display typography */
        .lp-serif { font-family: 'Instrument Serif', Georgia, serif; }

        /* Gradient text */
        .lp-grad-text {
          background: ${C.grad};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Animations */
        @keyframes lp-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-float {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50%       { transform: translateY(-12px) rotate(-1.5deg); }
        }
        @keyframes lp-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes lp-glow-pulse {
          0%, 100% { opacity: 0.45; transform: scale(1); }
          50%       { opacity: 0.65; transform: scale(1.08); }
        }
        @keyframes lp-score-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .lp-hero-h1   { animation: lp-up 600ms cubic-bezier(0.16,1,.3,1) both; }
        .lp-hero-p    { animation: lp-up 600ms cubic-bezier(0.16,1,.3,1) 90ms both; }
        .lp-hero-ctas { animation: lp-up 600ms cubic-bezier(0.16,1,.3,1) 180ms both; }
        .lp-hero-mock { animation: lp-score-in 700ms cubic-bezier(0.16,1,.3,1) 260ms both; }
        .lp-float     { animation: lp-float 5s ease-in-out infinite; }
        .lp-stat-num  {
          background: linear-gradient(90deg, ${C.blue} 0%, ${C.blueSoft} 45%, ${C.blue} 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lp-shimmer 3s linear infinite;
        }
        .lp-glow-orb  { animation: lp-glow-pulse 7s ease-in-out infinite; }

        /* CTA buttons */
        .lp-btn-primary {
          transition: transform 180ms cubic-bezier(0.16,1,.3,1),
                      box-shadow 180ms cubic-bezier(0.16,1,.3,1);
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 24px 48px rgba(61,126,255,0.38) !important;
          }
        }
        .lp-btn-primary:active { transform: scale(0.97) !important; }

        .lp-btn-ghost {
          transition: transform 160ms cubic-bezier(0.16,1,.3,1),
                      border-color 160ms ease,
                      background 160ms ease,
                      color 160ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-btn-ghost:hover {
            transform: translateY(-2px);
            border-color: ${C.borderBr} !important;
            background: rgba(13,32,64,0.8) !important;
          }
        }
        .lp-btn-ghost:active { transform: scale(0.97) !important; }

        .lp-card {
          transition: transform 220ms cubic-bezier(0.16,1,.3,1),
                      box-shadow 220ms cubic-bezier(0.16,1,.3,1),
                      border-color 220ms ease;
        }
        @media (hover: hover) and (pointer: fine) {
          .lp-card:hover {
            transform: translateY(-3px);
            border-color: ${C.borderBr} !important;
            box-shadow: 0 16px 40px rgba(61,126,255,0.14) !important;
          }
          .lp-subject-chip:hover {
            border-color: ${C.borderBr} !important;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(61,126,255,0.12) !important;
          }
        }

        /* Bento grid mobile */
        @media (max-width: 767px) {
          .lp-bento { grid-template-columns: 1fr !important; }
          .lp-bento-card { grid-column: auto !important; flex-direction: column !important; }
          .lp-hero-grid { grid-template-columns: 1fr !important; }
          .lp-hero-mock-wrap { display: none !important; }
        }

        @media (prefers-reduced-motion: reduce) {
          .lp-hero-h1, .lp-hero-p, .lp-hero-ctas, .lp-hero-mock { animation: none !important; }
          .lp-float  { animation: none !important; }
          .lp-stat-num { animation: none !important; -webkit-text-fill-color: ${C.blue}; }
          .lp-glow-orb { animation: none !important; }
        }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
        <div className="lp-glow-orb" style={{
          position: 'absolute', top: '-15%', left: '-10%',
          width: '55vw', height: '55vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(61,126,255,0.09) 0%, transparent 70%)',
        }} />
        <div className="lp-glow-orb" style={{
          position: 'absolute', bottom: '10%', right: '-8%',
          width: '40vw', height: '40vw', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)',
          animationDelay: '3.5s',
        }} />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(6,16,30,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${C.border}`,
        padding: '0 clamp(20px,5vw,48px)',
        height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <div style={{
            width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
            background: C.grad, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 16px rgba(61,126,255,0.32)',
          }}>
            <GraduationCap size={17} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: C.text, letterSpacing: '-0.03em', lineHeight: 1.1 }}>Pausia</div>
            <div style={{ fontSize: '9px', color: C.textMut, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>EBAU Madrid</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', position: 'relative', zIndex: 1 }}>
          <Link href="/pricing" className="lp-btn-ghost" style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '8px 16px', borderRadius: '999px',
            border: `1.5px solid ${C.border}`, background: 'transparent',
            color: C.textSub, fontWeight: 700, fontSize: '13px', textDecoration: 'none',
          }}>
            Ver planes
          </Link>
          <Link href="/login" className="lp-btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 18px', borderRadius: '999px',
            background: C.grad, color: '#fff',
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
            boxShadow: '0 6px 20px rgba(61,126,255,0.28)',
          }}>
            Entrar <ArrowRight size={13} />
          </Link>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: 'clamp(72px,10vw,120px) clamp(20px,5vw,40px) clamp(56px,8vw,96px)',
        }}>
          <div className="lp-hero-grid" style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 'clamp(40px,6vw,80px)',
            alignItems: 'center',
          }}>
            {/* Left: copy */}
            <div>
              <div className="lp-hero-h1" style={{ marginBottom: '8px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '999px',
                  border: `1px solid rgba(61,126,255,0.28)`,
                  background: 'rgba(61,126,255,0.08)',
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.07em',
                  color: C.blueSoft, textTransform: 'uppercase',
                  marginBottom: '20px',
                }}>
                  <Sparkles size={10} /> Beta privada · EBAU Madrid 2025
                </span>
              </div>

              <h1 className="lp-hero-h1 lp-serif" style={{
                fontSize: 'clamp(2.6rem, 5.5vw, 3.8rem)',
                fontWeight: 400,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                color: C.text,
                margin: '0 0 20px',
                textWrap: 'balance' as never,
                animationDelay: '60ms',
              }}>
                Prepara la PAU con{' '}
                <em className="lp-grad-text" style={{ fontStyle: 'italic' }}>
                  corrección real por IA
                </em>
              </h1>

              <p className="lp-hero-p" style={{
                fontSize: 'clamp(1rem, 2.2vw, 1.12rem)',
                color: C.textSub,
                lineHeight: 1.8,
                maxWidth: '460px',
                margin: '0 0 36px',
                fontWeight: 400,
              }}>
                Practica exámenes reales de la EBAU Madrid, recibe nota al instante y deja que
                Pausia convierta tus errores en un plan de estudio personalizado.
              </p>

              <div className="lp-hero-ctas" style={{
                display: 'flex', gap: '10px', flexWrap: 'wrap',
              }}>
                <Link href="/login" className="lp-btn-primary" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '10px',
                  padding: '13px 28px', borderRadius: '999px',
                  background: C.grad, color: '#fff',
                  fontWeight: 800, fontSize: '14px', textDecoration: 'none',
                  boxShadow: '0 12px 32px rgba(61,126,255,0.32)',
                  letterSpacing: '-0.01em',
                }}>
                  Empezar gratis
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.16)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <ArrowRight size={13} />
                  </span>
                </Link>
                <a href="#como-funciona" className="lp-btn-ghost" style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  padding: '13px 24px', borderRadius: '999px',
                  border: `1.5px solid ${C.border}`, background: 'rgba(9,24,40,0.6)',
                  color: C.textSub, fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                }}>
                  Ver cómo funciona
                </a>
              </div>
            </div>

            {/* Right: score mockup */}
            <div className="lp-hero-mock-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="lp-hero-mock lp-float" style={{
                transform: 'rotate(-1.5deg)',
                maxWidth: '320px', width: '100%',
              }}>
                {/* Score card */}
                <div style={{
                  borderRadius: '18px',
                  background: C.bgCardHi,
                  border: `1px solid ${C.borderBr}`,
                  boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(61,126,255,0.06)',
                  overflow: 'hidden',
                }}>
                  {/* Header bar */}
                  <div style={{
                    padding: '14px 18px',
                    borderBottom: `1px solid ${C.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: 'rgba(61,126,255,0.15)', color: C.blue,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Sigma size={14} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 800, color: C.text, letterSpacing: '-0.02em' }}>
                          Matemáticas II
                        </div>
                        <div style={{ fontSize: '10px', color: C.textMut, fontWeight: 600 }}>
                          EBAU Madrid · Junio 2024
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: '9px', color: C.textMut, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      Corregido
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ padding: '20px 18px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '52px', fontWeight: 900, color: C.text, letterSpacing: '-0.04em', lineHeight: 1 }}>
                      8.<span style={{ color: C.blue }}>4</span>
                    </div>
                    <div style={{ fontSize: '11px', color: C.textMut, fontWeight: 600, marginTop: '4px' }}>
                      sobre 10 puntos
                    </div>

                    {/* Section breakdown */}
                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { label: 'Análisis', score: '10.0', color: C.success },
                        { label: 'Geometría', score: '8.5', color: C.blue },
                        { label: 'Probabilidad', score: '6.2', color: C.amber },
                      ].map((row) => (
                        <div key={row.label} style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '7px 10px', borderRadius: '8px',
                          background: 'rgba(13,32,64,0.7)',
                          border: `1px solid ${C.border}`,
                        }}>
                          <span style={{ fontSize: '11px', color: C.textSub, fontWeight: 600 }}>{row.label}</span>
                          <span style={{ fontSize: '12px', fontWeight: 900, color: row.color, letterSpacing: '-0.02em' }}>{row.score}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI feedback bubble */}
                  <div style={{
                    margin: '0 12px 12px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'rgba(61,126,255,0.08)',
                    border: `1px solid rgba(61,126,255,0.22)`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
                      <Sparkles size={11} style={{ color: C.blue, marginTop: '2px', flexShrink: 0 }} />
                      <p style={{
                        margin: 0, fontSize: '10px', lineHeight: 1.6,
                        color: C.textSub, fontWeight: 500,
                      }}>
                        Buen dominio del análisis. Repasa el producto vectorial en Geometría — cometiste el mismo error en dos apartados.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '900px', margin: '0 auto',
          padding: '0 clamp(20px,5vw,40px) clamp(56px,8vw,80px)',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1px',
            background: C.border,
            borderRadius: '16px',
            overflow: 'hidden',
            border: `1px solid ${C.border}`,
          }}>
            {STATS.map((s, i) => (
              <div key={s.label} style={{
                padding: 'clamp(24px,4vw,36px) clamp(18px,3vw,28px)',
                background: i % 2 === 0 ? C.bgCard : C.bgCardHi,
                textAlign: 'center',
              }}>
                <div className="lp-stat-num" style={{
                  fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
                  fontWeight: 900,
                  letterSpacing: '-0.04em',
                  lineHeight: 1,
                  marginBottom: '6px',
                }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '12px', color: C.textMut, fontWeight: 600, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="como-funciona" style={{
          maxWidth: '1040px', margin: '0 auto',
          padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
        }}>
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.blue, marginBottom: '10px',
            }}>
              Cómo funciona
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              color: C.text,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              textWrap: 'balance' as never,
            }}>
              Tres pasos. Sin complicaciones.
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}>
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div key={step.n} className="lp-card" style={{
                  background: C.bgCard,
                  borderRadius: '14px',
                  padding: '28px 24px',
                  border: `1px solid ${C.border}`,
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: '14px', right: '18px',
                    fontSize: '56px', fontWeight: 900,
                    color: 'rgba(61,126,255,0.06)', lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.04em',
                  }}>
                    {step.n}
                  </div>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '11px',
                    background: 'rgba(61,126,255,0.12)', color: C.blue,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '18px', flexShrink: 0,
                  }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '0.96rem', color: C.text, marginBottom: '8px', letterSpacing: '-0.02em' }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: C.textSub, lineHeight: 1.75, fontWeight: 400 }}>
                    {step.desc}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Features — Bento grid ─────────────────────────────────────── */}
        <section style={{
          maxWidth: '1040px', margin: '0 auto',
          padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
        }}>
          <div style={{ marginBottom: '48px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.blue, marginBottom: '10px',
            }}>
              Funcionalidades
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              color: C.text,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              textWrap: 'balance' as never,
            }}>
              Todo lo que necesitas para la EBAU
            </h2>
          </div>

          <div className="lp-bento" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
          }}>
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              const span = FEATURE_SPANS[i]
              const isWide = span === 2
              return (
                <div key={f.title} className="lp-card lp-bento-card" style={{
                  background: C.bgCard,
                  borderRadius: '14px',
                  padding: isWide ? '26px 28px' : '26px 22px',
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  flexDirection: isWide ? 'row' : 'column',
                  gap: isWide ? '18px' : '14px',
                  alignItems: isWide ? 'flex-start' : undefined,
                  gridColumn: `span ${span}`,
                }}>
                  <div style={{
                    width: '44px', height: '44px', minWidth: '44px',
                    borderRadius: '11px',
                    background: f.light, color: f.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={21} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.93rem', color: C.text, marginBottom: '6px', letterSpacing: '-0.02em' }}>
                      {f.title}
                    </div>
                    <div style={{ fontSize: '0.87rem', color: C.textSub, lineHeight: 1.75, fontWeight: 400 }}>
                      {f.desc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Subjects ─────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '1040px', margin: '0 auto',
          padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
        }}>
          <div style={{ marginBottom: '36px' }}>
            <p style={{
              fontSize: '11px', fontWeight: 800, letterSpacing: '0.12em',
              textTransform: 'uppercase', color: C.blue, marginBottom: '10px',
            }}>
              Asignaturas
            </p>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
              fontWeight: 900,
              color: C.text,
              margin: 0,
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              textWrap: 'balance' as never,
            }}>
              Las seis materias de la EBAU Madrid
            </h2>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {SUBJECTS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="lp-card lp-subject-chip" style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 16px',
                  borderRadius: '12px',
                  background: C.bgCard,
                  border: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: '32px', height: '32px',
                    borderRadius: '9px',
                    background: s.light, color: s.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: C.text, lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontSize: '10px', fontWeight: 700, marginTop: '2px',
                      color: s.ready ? C.success : C.textMut,
                    }}>
                      {s.ready ? 'Disponible' : 'En preparación'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Beta CTA ─────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '1040px', margin: '0 auto',
          padding: 'clamp(56px,8vw,96px) clamp(20px,5vw,40px)',
        }}>
          <div style={{
            borderRadius: '18px',
            background: `linear-gradient(135deg, #091428 0%, #0d1e3a 50%, #0a1830 100%)`,
            border: `1px solid ${C.borderBr}`,
            padding: 'clamp(44px,7vw,72px) clamp(28px,5vw,60px)',
            textAlign: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-100px', right: '-80px',
              width: '340px', height: '340px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(61,126,255,0.1) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <div style={{
              position: 'absolute', bottom: '-60px', left: '-60px',
              width: '240px', height: '240px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(96,165,250,0.07) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />
            <span style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 12px', borderRadius: '999px',
              background: C.blue, color: '#fff',
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '20px',
              boxShadow: '0 6px 18px rgba(61,126,255,0.28)',
            }}>
              <Sparkles size={10} /> Beta privada
            </span>
            <h2 style={{
              position: 'relative',
              fontSize: 'clamp(1.6rem, 4vw, 2.3rem)',
              fontWeight: 900, color: C.text,
              margin: '0 0 14px', letterSpacing: '-0.03em',
              lineHeight: 1.15, textWrap: 'balance' as never,
            }}>
              Estamos construyendo Pausia con estudiantes reales.
            </h2>
            <p style={{
              position: 'relative',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              color: C.textSub, lineHeight: 1.8,
              maxWidth: '460px', margin: '0 auto 32px',
              fontWeight: 400,
            }}>
              Tus exámenes, tus errores y tu feedback directo ayudan a mejorar Pausia cada semana.
              Únete ahora y forma parte desde el principio.
            </p>
            <Link href="/login" className="lp-btn-primary" style={{
              position: 'relative',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '13px 28px', borderRadius: '999px',
              background: C.grad, color: '#fff',
              fontWeight: 800, fontSize: '14px', textDecoration: 'none',
              boxShadow: '0 12px 32px rgba(61,126,255,0.32)',
              letterSpacing: '-0.01em',
            }}>
              Probar la beta <ArrowRight size={15} />
            </Link>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section style={{
          maxWidth: '680px', margin: '0 auto',
          padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,32px) clamp(88px,12vw,136px)',
          textAlign: 'center',
        }}>
          <h2 className="lp-serif" style={{
            fontSize: 'clamp(2.2rem, 5.5vw, 3.4rem)',
            fontWeight: 400,
            color: C.text,
            margin: '0 0 16px',
            letterSpacing: '-0.01em',
            lineHeight: 1.1,
            textWrap: 'balance' as never,
            fontStyle: 'italic',
          }}>
            Deja de estudiar a ciegas.
          </h2>
          <p style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.1rem)',
            color: C.textSub, lineHeight: 1.8,
            margin: '0 auto 36px', maxWidth: '420px',
            fontWeight: 400,
          }}>
            Pausia te dice qué fallas, cuánto sacarías y qué repasar después.
          </p>
          <Link href="/login" className="lp-btn-primary" style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            padding: '14px 34px', borderRadius: '999px',
            background: C.grad, color: '#fff',
            fontWeight: 800, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 14px 40px rgba(61,126,255,0.32)',
            letterSpacing: '-0.01em',
          }}>
            Entrar a Pausia <ArrowRight size={15} />
          </Link>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <footer style={{
          borderTop: `1px solid ${C.border}`,
          background: 'rgba(9,24,40,0.6)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '20px clamp(20px,5vw,48px)',
          display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px', height: '26px', borderRadius: '8px',
              background: C.grad, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(61,126,255,0.24)',
            }}>
              <GraduationCap size={13} />
            </div>
            <span style={{ fontWeight: 700, color: C.text, fontSize: '14px', letterSpacing: '-0.02em' }}>Pausia</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: C.textMut }}>EBAU Madrid · 2º Bachillerato</span>
            <Link href="/legal/privacidad" style={{ fontSize: '12px', color: C.textMut, textDecoration: 'none' }}>
              Privacidad
            </Link>
            <Link href="/legal/terminos" style={{ fontSize: '12px', color: C.textMut, textDecoration: 'none' }}>
              Términos
            </Link>
          </div>
          <Link href="/login" style={{
            fontSize: '13px', fontWeight: 700, color: C.blue, textDecoration: 'none',
          }}>
            Entrar →
          </Link>
        </footer>
      </div>
    </div>
  )
}
