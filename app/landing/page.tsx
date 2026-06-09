import Link from 'next/link'
import {
  ArrowRight,
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  ClipboardList,
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
  ink: '#111827',
  muted: '#64748b',
  soft: '#94a3b8',
  surface: '#ffffff',
  wash: '#eff6ff',
  border: '#dbe7fb',
  blue: '#2563eb',
  deep: '#1d4ed8',
  accent: '#60a5fa',
  sky: '#38bdf8',
  grad: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 54%, #38bdf8 100%)',
  bg: 'radial-gradient(circle at 16% 12%, rgba(219,234,254,0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224,231,255,0.78), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186,230,253,0.52), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)',
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
  { icon: Sigma, label: 'Matemáticas II', color: '#b4232a', light: '#fff1f2', ready: true },
  { icon: Atom, label: 'Física', color: '#ca8a04', light: '#fefce8', ready: true },
  { icon: Landmark, label: 'Historia de España', color: '#78350f', light: '#fff8f1', ready: true },
  { icon: FlaskConical, label: 'Química', color: '#ea580c', light: '#fff7ed', ready: true },
  { icon: BookOpen, label: 'Lengua', color: '#2563eb', light: '#eff6ff', ready: true },
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

export default function LandingPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
        color: C.ink,
      }}
    >
      <style>{`
        .lp-btn-primary {
          transition: transform 160ms ease, box-shadow 160ms ease, filter 160ms ease;
        }
        .lp-btn-primary:hover {
          transform: translateY(-2px);
          filter: saturate(1.08) brightness(1.04);
          box-shadow: 0 22px 48px rgba(37,99,235,0.28) !important;
        }
        .lp-btn-ghost {
          transition: transform 160ms ease, border-color 160ms ease, color 160ms ease, background 160ms ease;
        }
        .lp-btn-ghost:hover {
          transform: translateY(-2px);
          border-color: #60a5fa !important;
          background: rgba(239,246,255,0.9) !important;
          color: #1d4ed8 !important;
        }
        .lp-card {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .lp-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 32px 80px rgba(37,99,235,0.13) !important;
        }
        .lp-subject {
          transition: transform 180ms ease, box-shadow 180ms ease;
        }
        .lp-subject:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 60px rgba(37,99,235,0.12) !important;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.82)',
          backdropFilter: 'blur(22px)',
          borderBottom: '1px solid rgba(219,231,251,0.95)',
          padding: '0 clamp(20px, 5vw, 48px)',
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '14px',
              background: C.grad,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 12px 28px rgba(37,99,235,0.22)',
            }}
          >
            <GraduationCap size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: C.ink, lineHeight: 1 }}>Pausia</div>
            <div style={{ fontSize: '11px', color: C.soft, marginTop: '2px' }}>EBAU Madrid · estudio con ritmo</div>
          </div>
        </div>
        <Link
          href="/login"
          className="lp-btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 22px',
            borderRadius: '999px',
            background: C.grad,
            color: '#fff',
            fontWeight: 700,
            fontSize: '14px',
            textDecoration: 'none',
            boxShadow: '0 14px 32px rgba(37,99,235,0.22)',
          }}
        >
          Entrar <ArrowRight size={15} />
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section
        style={{
          maxWidth: '760px',
          margin: '0 auto',
          padding: 'clamp(64px,10vw,110px) clamp(20px,5vw,32px) clamp(56px,8vw,96px)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '7px 16px',
            borderRadius: '999px',
            background: 'rgba(239,246,255,0.95)',
            border: '1px solid #dbe7fb',
            fontSize: '13px',
            fontWeight: 700,
            color: C.blue,
            marginBottom: '32px',
            boxShadow: '0 8px 20px rgba(37,99,235,0.07)',
          }}
        >
          <Sparkles size={13} />
          Pensado para estudiantes de 2º de Bachillerato
        </div>

        <h1
          style={{
            fontSize: 'clamp(2.1rem, 6vw, 3.2rem)',
            fontWeight: 900,
            lineHeight: 1.12,
            letterSpacing: '-0.02em',
            color: C.ink,
            margin: '0 0 22px',
          }}
        >
          Prepara la PAU con{' '}
          <span
            style={{
              background: C.grad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            simulacros corregidos por IA
          </span>
        </h1>

        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.18rem)',
            color: C.muted,
            lineHeight: 1.75,
            maxWidth: '600px',
            margin: '0 auto 40px',
          }}
        >
          Practica exámenes reales de la EBAU Madrid, recibe nota al instante y deja que
          Pausia convierta tus errores en un plan de estudio.
        </p>

        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            href="/login"
            className="lp-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '14px 32px',
              borderRadius: '999px',
              background: C.grad,
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 18px 40px rgba(37,99,235,0.25)',
            }}
          >
            Empezar gratis <ArrowRight size={16} />
          </Link>
          <a
            href="#como-funciona"
            className="lp-btn-ghost"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '14px 28px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.92)',
              border: '1.5px solid #dbe7fb',
              color: C.muted,
              fontWeight: 700,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 8px 22px rgba(37,99,235,0.06)',
            }}
          >
            Ver cómo funciona
          </a>
        </div>
      </section>

      {/* ── How it works ── */}
      <section
        id="como-funciona"
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,32px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.blue,
              background: C.wash,
              border: '1px solid #dbe7fb',
              borderRadius: '999px',
              padding: '5px 14px',
              marginBottom: '16px',
            }}
          >
            Cómo funciona
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
              fontWeight: 900,
              color: C.ink,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Tres pasos. Sin complicaciones.
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
          }}
        >
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.n}
                className="lp-card"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid #dbe7fb',
                  borderRadius: '24px',
                  padding: '32px 28px',
                  boxShadow: '0 16px 44px rgba(37,99,235,0.07)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '20px',
                    right: '24px',
                    fontSize: '52px',
                    fontWeight: 900,
                    color: 'rgba(219,231,251,0.6)',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {step.n}
                </div>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: C.wash,
                    border: '1px solid #dbe7fb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: C.blue,
                    marginBottom: '18px',
                  }}
                >
                  <Icon size={22} />
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

      {/* ── Features ── */}
      <section
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,32px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '52px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.blue,
              background: C.wash,
              border: '1px solid #dbe7fb',
              borderRadius: '999px',
              padding: '5px 14px',
              marginBottom: '16px',
            }}
          >
            Lo que incluye
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
              fontWeight: 900,
              color: C.ink,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Todo lo que necesitas para la EBAU
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
            gap: '18px',
          }}
        >
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.title}
                className="lp-card"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid #dbe7fb',
                  borderRadius: '22px',
                  padding: '28px 26px',
                  boxShadow: '0 14px 40px rgba(37,99,235,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '15px',
                    background: f.light,
                    color: f.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={21} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.97rem', color: C.ink, marginBottom: '6px' }}>
                    {f.title}
                  </div>
                  <div style={{ fontSize: '0.88rem', color: C.muted, lineHeight: 1.7 }}>{f.desc}</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Subjects ── */}
      <section
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,32px)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: C.blue,
              background: C.wash,
              border: '1px solid #dbe7fb',
              borderRadius: '999px',
              padding: '5px 14px',
              marginBottom: '16px',
            }}
          >
            Asignaturas
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.7rem, 4vw, 2.4rem)',
              fontWeight: 900,
              color: C.ink,
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Las cinco materias de la EBAU Madrid
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '16px',
          }}
        >
          {SUBJECTS.map((s) => {
            const Icon = s.icon
            return (
              <div
                key={s.label}
                className="lp-subject"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  border: '1px solid #dbe7fb',
                  borderRadius: '20px',
                  padding: '24px 20px',
                  textAlign: 'center',
                  boxShadow: '0 12px 34px rgba(37,99,235,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '18px',
                    background: s.light,
                    color: s.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={24} />
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: C.ink, lineHeight: 1.3 }}>
                  {s.label}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#10b981',
                    background: '#ecfdf5',
                    border: '1px solid #a7f3d0',
                    borderRadius: '999px',
                    padding: '3px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <CheckCircle2 size={10} />
                  Disponible
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── Beta / Social proof ── */}
      <section
        style={{
          maxWidth: '1040px',
          margin: '0 auto',
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,32px)',
        }}
      >
        <div
          style={{
            borderRadius: '28px',
            background: 'linear-gradient(135deg, rgba(239,246,255,0.95), rgba(238,242,255,0.9))',
            border: '1px solid #dbe7fb',
            padding: 'clamp(36px,6vw,60px) clamp(28px,5vw,56px)',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(37,99,235,0.09)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-60px',
              right: '-60px',
              width: '220px',
              height: '220px',
              borderRadius: '50%',
              background: 'rgba(96,165,250,0.08)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-40px',
              left: '-40px',
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: 'rgba(37,99,235,0.06)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 16px',
              borderRadius: '999px',
              background: C.blue,
              color: '#fff',
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '22px',
              boxShadow: '0 10px 24px rgba(37,99,235,0.22)',
            }}
          >
            <Sparkles size={12} /> Beta
          </div>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.1rem)',
              fontWeight: 900,
              color: C.ink,
              margin: '0 0 14px',
              letterSpacing: '-0.02em',
            }}
          >
            Estamos construyendo Pausia con estudiantes reales.
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.06rem)',
              color: C.muted,
              lineHeight: 1.75,
              maxWidth: '520px',
              margin: '0 auto 32px',
            }}
          >
            Tus exámenes, tus errores y tu feedback directo ayudan a mejorar Pausia cada semana.
            Únete ahora y forma parte desde el principio.
          </p>
          <Link
            href="/login"
            className="lp-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              padding: '14px 34px',
              borderRadius: '999px',
              background: C.grad,
              color: '#fff',
              fontWeight: 800,
              fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 18px 40px rgba(37,99,235,0.24)',
            }}
          >
            Probar la beta <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section
        style={{
          maxWidth: '700px',
          margin: '0 auto',
          padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,32px) clamp(72px,10vw,120px)',
          textAlign: 'center',
        }}
      >
        <h2
          style={{
            fontSize: 'clamp(2rem, 5.5vw, 3rem)',
            fontWeight: 900,
            color: C.ink,
            margin: '0 0 16px',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
          }}
        >
          Deja de estudiar a ciegas.
        </h2>
        <p
          style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            color: C.muted,
            lineHeight: 1.75,
            margin: '0 auto 38px',
            maxWidth: '520px',
          }}
        >
          Pausia te dice qué fallas, cuánto sacarías y qué repasar después.
        </p>
        <Link
          href="/login"
          className="lp-btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '16px 40px',
            borderRadius: '999px',
            background: C.grad,
            color: '#fff',
            fontWeight: 800,
            fontSize: '16px',
            textDecoration: 'none',
            boxShadow: '0 22px 50px rgba(37,99,235,0.26)',
          }}
        >
          Entrar a Pausia <ArrowRight size={17} />
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer
        style={{
          borderTop: '1px solid rgba(219,231,251,0.85)',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(16px)',
          padding: '28px clamp(20px,5vw,48px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '11px',
              background: C.grad,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 18px rgba(37,99,235,0.2)',
            }}
          >
            <GraduationCap size={16} />
          </div>
          <span style={{ fontWeight: 700, color: C.ink, fontSize: '14px' }}>Pausia</span>
        </div>
        <span style={{ fontSize: '13px', color: C.soft }}>
          EBAU Madrid · 2º Bachillerato
        </span>
        <Link
          href="/login"
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: C.blue,
            textDecoration: 'none',
          }}
        >
          Entrar →
        </Link>
      </footer>
    </div>
  )
}
