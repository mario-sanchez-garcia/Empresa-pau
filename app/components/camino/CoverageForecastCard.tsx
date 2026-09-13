'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CoverageForecast } from '@/app/lib/camino/coverageForecast'

// La previsión responde a una pregunta que el alumno ya se hace solo: si le
// va a dar tiempo. Por eso la cabecera ES esa pregunta y, cerrada, ya lleva la
// respuesta al lado — un acordeón que no dice nada hasta que lo abres obliga a
// abrirlo para saber si merecía la pena.
//
// Cerrada ocupa una fila. El detalle —reparto, supuestos, límites— vive
// dentro, porque es lo que se consulta de vez en cuando y no cada día.

const SUBJECT_LABELS: Record<string, string> = {
  matematicas_ii: 'Matemáticas II',
  matematicas_ccss: 'Matemáticas CCSS',
  fisica: 'Física',
  quimica: 'Química',
  lengua: 'Lengua',
  historia_espana: 'Historia de España',
  historia_filosofia: 'Historia de la Filosofía',
  biologia: 'Biología',
  ingles: 'Inglés',
  economia: 'Economía',
}

function hours(minutes: number) {
  return `${(minutes / 60).toLocaleString('es-ES', { maximumFractionDigits: 1 })} h`
}

function examDateLabel(iso: string) {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

type Tone = 'accent' | 'warn' | 'neutral'

const TONE_FILL: Record<Tone, string> = {
  accent: 'var(--clay-accent)',
  warn: 'var(--clay-warn)',
  neutral: 'var(--clay-surface-deep)',
}

/** Misma geometría que ClayBadge, con un tono más: el aviso. */
function AnswerChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const solid = tone !== 'neutral'
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        flex: 'none',
        fontSize: 11,
        fontWeight: 800,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        fontVariantNumeric: 'tabular-nums',
        color: solid ? 'var(--clay-on-accent)' : 'var(--clay-text-muted)',
        background: solid ? TONE_FILL[tone] : 'var(--clay-surface-raised)',
        borderRadius: 999,
        padding: '6px 12px',
        boxShadow: `0 3px 0 0 ${tone === 'warn' ? 'var(--clay-warn-deep)' : tone === 'accent' ? 'var(--clay-accent-deep)' : 'var(--clay-surface-deep)'}`,
      }}
    >
      {children}
    </span>
  )
}

function Segment({ minutes, total, tone, faded }: { minutes: number; total: number; tone: Tone; faded?: boolean }) {
  if (minutes <= 0 || total <= 0) return null
  return (
    <div
      style={{
        width: `${(minutes / total) * 100}%`,
        background: TONE_FILL[tone],
        opacity: faded ? 0.42 : 1,
      }}
    />
  )
}

function Dot({ tone, faded }: { tone: Tone; faded?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 8, height: 8, borderRadius: 999, flex: 'none',
        background: TONE_FILL[tone], opacity: faded ? 0.42 : 1,
      }}
    />
  )
}

export default function CoverageForecastCard({ forecast }: { forecast: CoverageForecast }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const known = forecast.scheduledMinutes + forecast.pendingMinutes
  const incomplete = forecast.missingSubjects.length > 0
  const atRisk = forecast.atRiskMinutes

  // El denominador nunca deja que las barras se salgan: si el trabajo supera
  // la capacidad, la escala pasa a ser el trabajo.
  const scale = Math.max(
    forecast.totalCapacityMinutes,
    forecast.scheduledMinutes + forecast.projectedPendingMinutes + atRisk,
    1,
  )

  const answer: { tone: Tone; text: string } = incomplete
    ? { tone: 'neutral', text: 'Incompleta' }
    : known === 0
      ? { tone: 'neutral', text: 'Sin datos' }
      : atRisk > 0
        ? { tone: 'warn', text: `${hours(atRisk)} fuera` }
        : { tone: 'accent', text: 'Cabe todo' }

  const withWork = forecast.subjects.filter(row => row.scheduledMinutes + row.pendingMinutes > 0)

  const muted = { fontSize: 12, lineHeight: 1.5, color: 'var(--clay-text-muted)' }
  const prose = { ...muted, lineHeight: 1.65, margin: 0 }
  const num = { fontVariantNumeric: 'tabular-nums' as const, fontWeight: 800, color: 'var(--clay-text)' }

  return (
    <section
      aria-label="Previsión de tu Camino"
      style={{
        minWidth: 0,
        background: 'var(--clay-surface)',
        borderRadius: 16,
        color: 'var(--clay-text)',
        boxShadow: [
          '0 6px 0 var(--clay-shadow-shelf)',
          '0 10px 20px var(--clay-shadow-elevate)',
          'inset 0 2px 3px var(--clay-shadow-light)',
        ].join(', '),
      }}
    >
      <button
        type="button"
        className="forecast-trigger"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
        aria-controls={panelId}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '14px 16px', background: 'none', border: 'none',
          borderRadius: 16, cursor: 'pointer', textAlign: 'left', color: 'inherit',
        }}
      >
        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 800, letterSpacing: '-0.01em' }}>
          ¿Te cabe todo antes de la PAU?
        </span>
        <AnswerChip tone={answer.tone}>{answer.text}</AnswerChip>
        <ChevronDown
          className="forecast-chevron"
          size={15}
          aria-hidden="true"
          style={{ flex: 'none', color: 'var(--clay-text-muted)', transform: open ? 'rotate(180deg)' : 'none' }}
        />
      </button>

      {/* El colapso va en estilo inline y no en la clase: el panel debe ocultar
          su contenido aunque la hoja global no haya cargado. `visibility` —y no
          solo la altura— es lo que lo saca del arbol de accesibilidad y del
          orden de tabulacion. La clase solo aporta la transicion. */}
      <div
        className="forecast-panel"
        id={panelId}
        role="region"
        aria-label="Detalle de la previsión"
        style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div style={{ overflow: 'hidden', visibility: open ? 'visible' : 'hidden' }}>
          <div style={{ padding: '0 16px 18px', display: 'grid', gap: 16 }}>
            {known === 0 ? (
              <p style={{ ...muted, margin: 0 }}>
                Todavía no hay trabajo registrado en tu Camino, así que no hay nada que estimar.
              </p>
            ) : (
              <>
                <div style={{ display: 'grid', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                    <span style={muted}>Trabajo restante</span>
                    <span style={num}>{hours(known)}</span>
                  </div>
                  <div
                    style={{
                      display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden',
                      background: 'var(--clay-surface-deep)',
                    }}
                  >
                    <Segment minutes={forecast.scheduledMinutes} total={scale} tone="accent" />
                    <Segment minutes={forecast.projectedPendingMinutes} total={scale} tone="accent" faded />
                    <Segment minutes={atRisk} total={scale} tone="warn" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                    <span style={muted}>Capacidad hasta la PAU</span>
                    <span style={num}>{hours(forecast.totalCapacityMinutes)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  {[
                    { tone: 'accent' as Tone, faded: false, label: 'Ya programado', value: forecast.scheduledMinutes },
                    { tone: 'accent' as Tone, faded: true, label: 'Pendiente que prevemos que cabe', value: forecast.projectedPendingMinutes },
                    { tone: 'warn' as Tone, faded: false, label: 'Sin hueco con tu disponibilidad', value: atRisk },
                  ].filter(row => row.value > 0).map(row => (
                    <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Dot tone={row.tone} faded={row.faded} />
                      <span style={{ flex: 1, minWidth: 0, color: 'var(--clay-text-muted)' }}>{row.label}</span>
                      <span style={{ ...num, fontSize: 12 }}>{hours(row.value)}</span>
                    </div>
                  ))}
                </div>

                {withWork.length > 0 && (
                  <div style={{ display: 'grid', gap: 9, borderTop: '1px solid var(--clay-border)', paddingTop: 14 }}>
                    {withWork.map(row => (
                      <div key={row.subject} style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12.5 }}>
                        <span style={{ flex: 1, minWidth: 0, fontWeight: 700 }}>
                          {SUBJECT_LABELS[row.subject] ?? row.subject}
                        </span>
                        {row.atRiskMinutes > 0 && (
                          <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: 'var(--clay-warn)' }}>
                            {hours(row.atRiskMinutes)} fuera
                          </span>
                        )}
                        <span style={{ ...num, fontSize: 12.5 }}>
                          {hours(row.scheduledMinutes + row.pendingMinutes)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'grid', gap: 10, borderTop: '1px solid var(--clay-border)', paddingTop: 14 }}>
              <p style={prose}>
                Calculado con {forecast.dailyMinutes} min al día y {forecast.weeklyStudyDays ?? 5} días por
                semana hasta el {examDateLabel(forecast.examDate)}. Respeta festivos, tus eventos y el plazo
                de cada parcial, y reserva {hours(forecast.finalReviewCapacityMinutes)} para el repaso final.
              </p>
              <p style={prose}>
                Es una estimación sobre el trabajo ya registrado: no cuenta tu Google Calendar, ausencias
                futuras ni repasos que aún no existen. No predice tu nota.
              </p>
              {incomplete && (
                <p style={{ ...prose, color: 'var(--clay-warn)' }}>
                  Faltan datos de {forecast.missingSubjects.map(name => SUBJECT_LABELS[name] ?? name).join(', ')},
                  así que la previsión se queda corta.
                </p>
              )}
            </div>

            {atRisk > 0 && (
              <a
                href="/settings"
                style={{
                  display: 'inline-flex', alignItems: 'center', alignSelf: 'start',
                  fontSize: 12, fontWeight: 800, color: 'var(--clay-accent-text)', textDecoration: 'none',
                }}
              >
                Ajustar mi disponibilidad →
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
