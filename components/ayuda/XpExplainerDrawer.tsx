'use client'

import { useEffect, useState } from 'react'
import { X, Zap } from 'lucide-react'
import {
  DIFFICULTY_XP_MULTIPLIER,
  streakBonusFraction,
  previewImprovementBonusXp,
} from '@/app/lib/camino/xpFormula'
import { SIMULACRO_COMPLETION_XP } from '@/app/lib/camino/xpMap'

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

export default function XpExplainerDrawer() {
  const [open, setOpen] = useState(false)

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

  const bigJumpBonus = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', BIG_JUMP.from, BIG_JUMP.to)
  const nearCeilingBonusA = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', NEAR_CEILING_A.from, NEAR_CEILING_A.to)
  const nearCeilingBonusB = previewImprovementBonusXp(SIMULACRO_COMPLETION_XP, 'Media', NEAR_CEILING_B.from, NEAR_CEILING_B.to)

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
        ¿Cómo funciona el XP?
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
                <h2 style={{ fontSize: 20, fontWeight: 900, color: INK, letterSpacing: '-0.02em', margin: 0 }}>El XP, por capas</h2>
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
