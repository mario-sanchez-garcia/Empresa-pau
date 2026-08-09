'use client'

import { useEffect, useState } from 'react'
import { X, Zap } from 'lucide-react'
import {
  DIFFICULTY_XP_MULTIPLIER,
  streakBonusFraction,
  previewImprovementBonusXp,
} from '@/app/lib/camino/xpFormula'
import { SIMULACRO_COMPLETION_XP } from '@/app/lib/camino/xpMap'
import { DIVISIONS, divisionFor } from '@/app/lib/camino/leagues'
import { supabase } from '@/app/lib/supabase'
import DivisionIcon from '@/components/shared/DivisionIcon'

// Mismos tokens de color/sombra/easing que ya usa el resto de la app
// (SimulacroShell, modales de confirmación de Simulacros/Camino) — ver
// app/globals.css. Nada de iconos infantiles ni ilustraciones tipo emoji:
// todo aquí es SVG propio con la misma paleta azul/slate de siempre.
const INK = '#0f172a'
const MUTED = '#64748b'
const FAINT = '#94a3b8'
const BLUE = '#2563eb'
const BLUE_SOFT = '#eff6ff'
const BORDER = '#e2e8f0'
const AMBER = '#f59e0b'
const PURPLE = '#7c3aed'
const PURPLE_SOFT = '#f5f3ff'
const EMERALD = '#059669'

const LAYERS = [
  { key: 'effort', label: 'Esfuerzo', sub: 'duración real de la actividad', range: 'base', color: '#94a3b8', width: 0.55 },
  { key: 'difficulty', label: 'Dificultad', sub: 'del bloque/tema', range: '×0,90 – ×1,30', color: BLUE, width: 0.68 },
  { key: 'grade', label: 'Nota', sub: 'la que saques en la corrección', range: '+0% – +125%', color: EMERALD, width: 0.86 },
  { key: 'streak', label: 'Racha', sub: 'días seguidos estudiando', range: '+0% – +50%', color: AMBER, width: 1 },
]

// Puntos reales de la curva de racha (misma streakBonusFraction que usa
// awardXp en producción) — nada de números inventados para el dibujo.
const STREAK_CHART_DAYS = [0, 1, 3, 7, 14, 21, 30, 45, 60, 75, 90]

// Ejemplos con constantes reales de producción (SIMULACRO_COMPLETION_XP,
// dificultad Media) para que el bonus de mejora mostrado aquí sea
// exactamente el que otorgaría hoy /api/simulacro, no un número de
// ilustración aparte.
const BIG_JUMP = { from: 4, to: 8 }
const NEAR_CEILING_A = { from: 6, to: 7 }
const NEAR_CEILING_B = { from: 8, to: 9 }

// Ilustrativo (no son intentos reales del alumno): una secuencia de notas en
// el mismo ejercicio para el diagrama "solo cuenta el último intento" — el
// bonus de mejora real siempre compara contra el intento inmediatamente
// anterior (repeatImprovement.ts), nunca contra el primero.
const ATTEMPT_TIMELINE = [4, 5, 4, 6, 8]

export default function XpExplainerDrawer() {
  const [open, setOpen] = useState(false)
  const [xpTotal, setXpTotal] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  // Se pide solo al abrir (no en cada render) para marcar la división real
  // del alumno en el diagrama — un simple SELECT de una fila, no algo que
  // valga la pena precargar antes de que el panel se abra.
  useEffect(() => {
    if (!open || xpTotal !== null) return
    let cancelled = false
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || cancelled) return
      const { data: progress } = await supabase
        .from('camino_user_progress')
        .select('xp_total')
        .eq('user_id', data.user.id)
        .maybeSingle()
      if (!cancelled) setXpTotal(progress?.xp_total ?? 0)
    })
    return () => { cancelled = true }
  }, [open, xpTotal])

  const bigJumpBonus = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', BIG_JUMP.from, BIG_JUMP.to)
  const nearCeilingBonusA = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', NEAR_CEILING_A.from, NEAR_CEILING_A.to)
  const nearCeilingBonusB = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', NEAR_CEILING_B.from, NEAR_CEILING_B.to)
  const currentDivision = xpTotal != null ? divisionFor(xpTotal) : null
  const currentDivisionIndex = currentDivision ? DIVISIONS.indexOf(currentDivision) : -1

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 999,
          background: BLUE_SOFT, border: `1px solid #bfdbfe`,
          color: BLUE, fontSize: 12.5, fontWeight: 900, cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        <Zap size={14} />
        XP y divisiones
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cómo funciona el XP"
          onClick={() => setOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 'var(--z-modal-bg, 50)',
            background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)',
            display: 'flex', justifyContent: 'flex-end',
          }}
        >
          <style>{`
            @keyframes xp-drawer-in { from { transform: translateX(24px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            .xp-drawer-panel { animation: xp-drawer-in 260ms var(--ease-out, cubic-bezier(0.23,1,0.32,1)) both; }
            @media (max-width: 640px) { .xp-drawer-panel { width: 100vw !important; } }
          `}</style>
          <div
            className="xp-drawer-panel"
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(480px, 100vw)', height: '100%', background: 'white',
              boxShadow: 'var(--shadow-xl, 0 16px 48px rgba(37,99,235,0.12), 0 32px 80px rgba(37,99,235,0.12))',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, padding: '22px 24px 18px', borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
              <div>
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.16em', textTransform: 'uppercase', color: FAINT, marginBottom: 6 }}>Cómo funciona</p>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: '-0.02em', margin: 0 }}>El XP y las divisiones</h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                style={{ flexShrink: 0, width: 32, height: 32, borderRadius: '50%', background: '#f1f5f9', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: MUTED }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px 24px 40px' }}>

              {/* ── 1. Capas apiladas ── */}
              <section style={{ marginBottom: 34 }}>
                <p style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 4 }}>4 ingredientes, uno encima del otro</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 16 }}>
                  El XP no se suma, se multiplica: cada capa escala la de abajo. Por eso una nota alta con racha larga vale mucho más que la suma de sus partes por separado.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: 2 }}>
                  {LAYERS.map((layer, i) => (
                    <div key={layer.key}>
                      {i > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '1px 0' }}>
                          <span style={{ fontSize: 10, fontWeight: 900, color: FAINT }}>×</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div
                          style={{
                            height: 34, width: `${layer.width * 100}%`, minWidth: 90,
                            borderRadius: 8, background: layer.color,
                            display: 'flex', alignItems: 'center', paddingLeft: 12,
                            boxShadow: `0 4px 10px ${layer.color}33`,
                          }}
                        >
                          <span style={{ fontSize: 11.5, fontWeight: 900, color: 'white' }}>{layer.label}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 900, color: INK }}>{layer.range}</div>
                          <div style={{ fontSize: 9.5, fontWeight: 600, color: FAINT, whiteSpace: 'nowrap' }}>{layer.sub}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 14, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 10.5, fontWeight: 700, color: MUTED, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.7, margin: 0 }}>
                    XP = Esfuerzo × Dificultad × (1 + Nota) × (1 + Racha)
                  </p>
                </div>
              </section>

              {/* ── 2. Curva de racha ── */}
              <section style={{ marginBottom: 34 }}>
                <p style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 4 }}>La racha sube rápido... y luego se calma</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 14 }}>
                  Los primeros días se nota mucho — a partir de dos meses seguidos el extra se estabiliza cerca de +50% y no sigue subiendo. Perder un día no es una catástrofe.
                </p>
                <StreakCurveChart />
              </section>

              {/* ── 3. Bonus de mejora ── */}
              <section>
                <p style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 4 }}>Repetir y mejorar mucho, compensa</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 16 }}>
                  Al repetir algo ya hecho, comparamos con tu intento anterior (no con el primero). Cuanto más subas, mayor el bonus — y subir cerca del 10 vale más que subir cerca del 5.
                </p>

                <AttemptTimeline attempts={ATTEMPT_TIMELINE} />

                <ImprovementArrow from={BIG_JUMP.from} to={BIG_JUMP.to} bonus={bigJumpBonus} size="large" />

                <p style={{ fontSize: 10.5, fontWeight: 800, color: FAINT, textTransform: 'uppercase', letterSpacing: '.08em', margin: '20px 0 10px' }}>
                  Mismo salto de 1 punto, distinto bonus
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <ImprovementArrow from={NEAR_CEILING_A.from} to={NEAR_CEILING_A.to} bonus={nearCeilingBonusA} size="small" />
                  <ImprovementArrow from={NEAR_CEILING_B.from} to={NEAR_CEILING_B.to} bonus={nearCeilingBonusB} size="small" />
                </div>
                <p style={{ fontSize: 10.5, color: FAINT, lineHeight: 1.5, marginTop: 10 }}>
                  {NEAR_CEILING_B.from}→{NEAR_CEILING_B.to} da más que {NEAR_CEILING_A.from}→{NEAR_CEILING_A.to} — ese último punto cerca del techo es más difícil de conseguir, y el XP lo refleja.
                </p>
              </section>

              {/* ── Divisiones ── */}
              <section style={{ marginTop: 34, paddingTop: 26, borderTop: `1px solid ${BORDER}` }}>
                <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.16em', textTransform: 'uppercase', color: FAINT, marginBottom: 8 }}>Divisiones</p>
                <p style={{ fontSize: 13, fontWeight: 900, color: INK, marginBottom: 4 }}>Seis tramos por XP total acumulado</p>
                <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.55, marginBottom: 16 }}>
                  Solo suben, nunca bajan — tu división refleja lo que ya has ganado, no depende de una semana floja.
                </p>

                <DivisionLadder currentIndex={currentDivisionIndex} />

                {currentDivision && xpTotal != null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, padding: '10px 12px', borderRadius: 10, background: currentDivision.bg, border: `1px solid ${BORDER}` }}>
                    <DivisionIcon tierIndex={currentDivisionIndex} size={18} color={currentDivision.text} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 900, color: currentDivision.text }}>Estás en {currentDivision.name}</div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: FAINT, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>{xpTotal.toLocaleString('es-ES')} XP</div>
                    </div>
                  </div>
                )}
              </section>

            </div>
          </div>
        </div>
      )}
    </>
  )
}

function StreakCurveChart() {
  const width = 400
  const height = 150
  const padLeft = 34
  const padBottom = 22
  const padTop = 10
  const padRight = 10
  const plotW = width - padLeft - padRight
  const plotH = height - padTop - padBottom
  const maxDays = 90

  const points = STREAK_CHART_DAYS.map(d => {
    const x = padLeft + (d / maxDays) * plotW
    const y = padTop + (1 - streakBonusFraction(d) / 0.5) * plotH
    return { d, x, y, pct: streakBonusFraction(d) }
  })
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
  const ceilingY = padTop

  const labelDays = [1, 7, 30, 60]

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }} role="img" aria-label="Curva del bonus de racha por días">
      {/* Techo +50% */}
      <line x1={padLeft} y1={ceilingY} x2={width - padRight} y2={ceilingY} stroke={AMBER} strokeWidth={1} strokeDasharray="3 4" opacity={0.55} />
      <text x={width - padRight} y={ceilingY - 4} textAnchor="end" fontSize={9} fontWeight={800} fill={AMBER}>techo +50%</text>

      {/* Ejes */}
      <line x1={padLeft} y1={padTop} x2={padLeft} y2={height - padBottom} stroke={BORDER} strokeWidth={1} />
      <line x1={padLeft} y1={height - padBottom} x2={width - padRight} y2={height - padBottom} stroke={BORDER} strokeWidth={1} />

      {/* Curva */}
      <path d={pathD} fill="none" stroke={AMBER} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={`${pathD} L ${padLeft + plotW} ${height - padBottom} L ${padLeft} ${height - padBottom} Z`} fill={AMBER} opacity={0.08} stroke="none" />

      {/* Puntos etiquetados */}
      {points.filter(p => labelDays.includes(p.d)).map(p => (
        <g key={p.d}>
          <circle cx={p.x} cy={p.y} r={3.2} fill="white" stroke={AMBER} strokeWidth={2} />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize={9} fontWeight={800} fill={INK}>+{Math.round(p.pct * 100)}%</text>
          <text x={p.x} y={height - padBottom + 13} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={FAINT}>{p.d}d</text>
        </g>
      ))}
    </svg>
  )
}

// Diagrama 4: secuencia de intentos sobre el mismo ejercicio, con el último
// resaltado — refuerzo visual de que el bonus de mejora compara contra el
// intento inmediatamente anterior, no contra el primero ni la media.
function AttemptTimeline({ attempts }: { attempts: number[] }) {
  const width = 260
  const height = 76
  const padX = 16
  const padTop = 16
  const padBottom = 20
  const plotH = height - padTop - padBottom
  const stepX = (width - padX * 2) / (attempts.length - 1)
  const y = (v: number) => padTop + (1 - v / 10) * plotH

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', maxWidth: 260, height: 'auto', display: 'block' }} role="img" aria-label="Solo el último intento cuenta para el bonus de mejora">
      <line x1={padX} y1={height - padBottom} x2={width - padX} y2={height - padBottom} stroke={BORDER} strokeWidth={1} />
      {attempts.map((v, i) => {
        const x = padX + stepX * i
        const isLast = i === attempts.length - 1
        const prevX = i > 0 ? padX + stepX * (i - 1) : x
        const prevY = i > 0 ? y(attempts[i - 1]) : y(v)
        return (
          <g key={i}>
            {i > 0 && (
              <line
                x1={prevX} y1={prevY} x2={x} y2={y(v)}
                stroke={isLast ? PURPLE : FAINT} strokeWidth={isLast ? 2 : 1} opacity={isLast ? 1 : 0.45}
              />
            )}
            <circle cx={x} cy={y(v)} r={isLast ? 6 : 3} fill={isLast ? PURPLE : 'white'} stroke={isLast ? 'none' : FAINT} strokeWidth={1.3} />
            <text x={x} y={height - padBottom + 13} textAnchor="middle" fontSize={8} fontWeight={700} fill={FAINT} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{v}</text>
            {isLast && (
              <text x={x} y={y(v) - 12} textAnchor="middle" fontSize={9} fontWeight={900} fill={PURPLE}>cuenta este</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

function ImprovementArrow({ from, to, bonus, size }: { from: number; to: number; bonus: number; size: 'large' | 'small' }) {
  const isLarge = size === 'large'
  const pillSize = isLarge ? 52 : 38
  const fontSize = isLarge ? 20 : 15
  return (
    <div
      style={{
        flex: 1,
        display: 'flex', alignItems: 'center', gap: isLarge ? 14 : 8,
        padding: isLarge ? '16px 18px' : '12px 10px',
        borderRadius: 14, background: PURPLE_SOFT, border: `1px solid #e9d5ff`,
      }}
    >
      <Grade value={from} size={pillSize} fontSize={fontSize} tone="muted" />
      <svg width={isLarge ? 40 : 24} height={16} viewBox="0 0 40 16" aria-hidden="true" style={{ flexShrink: 0 }}>
        <line x1={2} y1={8} x2={34} y2={8} stroke={PURPLE} strokeWidth={2} />
        <path d="M 28 3 L 36 8 L 28 13" fill="none" stroke={PURPLE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <Grade value={to} size={pillSize} fontSize={fontSize} tone="strong" />
      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
        <div style={{ fontSize: isLarge ? 18 : 13, fontWeight: 900, color: PURPLE, whiteSpace: 'nowrap' }}>+{bonus} XP</div>
        <div style={{ fontSize: 8.5, fontWeight: 800, color: FAINT, textTransform: 'uppercase', letterSpacing: '.06em' }}>bonus mejora</div>
      </div>
    </div>
  )
}

function Grade({ value, size, fontSize, tone }: { value: number; size: number; fontSize: number; tone: 'muted' | 'strong' }) {
  const bg = tone === 'strong' ? PURPLE : 'white'
  const color = tone === 'strong' ? 'white' : MUTED
  const border = tone === 'strong' ? 'none' : `1.5px solid #ddd6fe`
  return (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: bg, color, border,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 900,
      }}
    >
      {value}
    </div>
  )
}

// Diagrama 5+6: escalera de las seis divisiones (icono técnico + rango de
// XP como único texto) con la división actual del alumno marcada aparte —
// currentIndex === -1 mientras xpTotal todavía no ha cargado, así que nada
// se marca como "actual" hasta tener el dato real.
function DivisionLadder({ currentIndex }: { currentIndex: number }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {DIVISIONS.map((d, i) => {
        const isCurrent = i === currentIndex
        const range = d.max === Infinity ? `${d.min.toLocaleString('es-ES')}+` : `${d.min.toLocaleString('es-ES')}–${d.max.toLocaleString('es-ES')}`
        return (
          <div key={d.name} style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ height: 14, display: 'flex', alignItems: 'flex-end', marginBottom: 3 }}>
              {isCurrent && (
                <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M5 10 L0 2 L10 2 Z" fill={d.bar} />
                </svg>
              )}
            </div>
            <div
              style={{
                width: '100%', borderRadius: 8, padding: '8px 2px 7px',
                background: d.bg, border: `${isCurrent ? 2 : 1}px solid ${isCurrent ? d.bar : BORDER}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              }}
            >
              <DivisionIcon tierIndex={i} size={16} color={d.text} />
              <span style={{ fontSize: 8.5, fontWeight: 900, color: d.text, textAlign: 'center', lineHeight: 1.2 }}>{d.name}</span>
              <span style={{ fontSize: 7, fontWeight: 700, color: FAINT, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'nowrap' }}>{range}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
