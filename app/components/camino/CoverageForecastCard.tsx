'use client'

import { useId, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { CoverageForecast, ForecastRiskReason } from '@/app/lib/camino/coverageForecast'
import { ensureServerCalendar } from '@/app/lib/camino/ensureCalendarClient'
import { supabase } from '@/app/lib/supabase'
import { dailyMinutesLabel } from '@/app/lib/camino/dailyTimeCapacity'

// La cabecera muestra el resultado incluso cerrada. Se limita al trabajo
// registrado: caber en el calendario no acredita la preparación académica.
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

// Las mismas opciones del onboarding, con el texto en primera persona: aquí
// el alumno no está describiendo un curso que aún no ha empezado, está
// corrigiendo lo que declaró cuando se dio de alta.
const START_MODE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'zero', label: 'No he dado nada todavía' },
  { value: 'first_block', label: 'He dado el primer bloque' },
  { value: 'mid', label: 'Voy por la mitad' },
  { value: 'review', label: 'Lo he dado todo, me toca repasar' },
]

const RISK_LABELS: Record<ForecastRiskReason, string> = {
  after_exam: 'Fecha posterior a la PAU', partial_deadline: 'Fuera del plazo del parcial',
  final_review_window: 'Temario nuevo en la reserva de repaso', unavailable_day: 'Día fuera de tu disponibilidad',
  daily_budget: 'Supera los minutos de ese día', occupied_time: 'Solape o hueco horario ocupado',
  task_too_long: 'La actividad supera tu presupuesto diario', retry_wait: 'La espera no deja días dentro del plazo',
  no_slot: 'No se ha encontrado un hueco antes del plazo',
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

/** Una receta: qué tocar y desde qué valor. El "ahora" es lo que hace que se
 *  entienda el salto, así que nunca se enseña el destino sin el punto de partida. */
function RemedyRow({ label, value, from }: { label: string; value: string; from: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 12.5 }}>
      <span style={{ flex: 1, minWidth: 0, color: 'var(--clay-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 11.5, color: 'var(--clay-text-muted)' }}>ahora {from}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800, color: 'var(--clay-accent-text)' }}>{value}</span>
    </div>
  )
}

export default function CoverageForecastCard({ forecast }: { forecast: CoverageForecast }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const [replanning, setReplanning] = useState(false)
  const [replanError, setReplanError] = useState<string | null>(null)
  const [visibleRisks, setVisibleRisks] = useState(10)
  const [startModes, setStartModes] = useState<Record<string, string>>({})
  const [savingSubject, setSavingSubject] = useState<string | null>(null)
  const [startModeError, setStartModeError] = useState<string | null>(null)

  async function declareStartMode(subject: string) {
    const mode = startModes[subject]
    if (!mode || savingSubject) return
    setSavingSubject(subject); setStartModeError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Vuelve a iniciar sesión para cambiar tu punto de partida.')
      const response = await fetch('/api/camino/start-mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ subject, mode }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload?.error ?? 'No se pudo cambiar tu punto de partida.')
      window.location.reload()
    } catch (error) {
      setStartModeError(error instanceof Error ? error.message : 'No se pudo cambiar tu punto de partida.')
      setSavingSubject(null)
    }
  }

  async function replan() {
    if (replanning) return
    setReplanning(true); setReplanError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Vuelve a iniciar sesión para recolocar tu plan.')
      if (!(await ensureServerCalendar(session.access_token, true)))
        throw new Error('La actualización sigue pendiente. Consulta el aviso de Camino y vuelve a intentarlo.')
      // Recargar también renueva el calendario, no solo las cifras del aviso.
      window.location.reload()
    } catch (error) {
      setReplanError(error instanceof Error ? error.message : 'No se pudo recolocar el plan.')
    } finally { setReplanning(false) }
  }

  const known = forecast.scheduledMinutes + forecast.pendingMinutes
  const incomplete = forecast.missingSubjects.length > 0
  const atRisk = forecast.atRiskMinutes
  const remedy = forecast.remedy

  // El denominador nunca deja que las barras se salgan: si el trabajo supera
  // la capacidad, la escala pasa a ser el trabajo.
  const scale = Math.max(
    forecast.totalCapacityMinutes,
    known,
    1,
  )

  // El titular dice el problema DOMINANTE, no la suma. "102 h fuera" cuando el
  // tiempo existe y lo que falla es el encaje empujaba a la conclusión
  // equivocada: que no da tiempo y hay que estudiar el doble.
  const answer: { tone: Tone; text: string } = incomplete
    ? { tone: 'neutral', text: 'Incompleta' }
    : known === 0
      ? { tone: 'neutral', text: 'Sin datos' }
      : forecast.deficitMinutes > 0
        ? { tone: 'warn', text: `${hours(forecast.deficitMinutes)} de más` }
        : atRisk > 0
          ? { tone: 'warn', text: 'Hay que recolocar' }
          : { tone: 'accent', text: 'Lo registrado cabe' }

  const withWork = forecast.subjects.filter(row => row.scheduledMinutes + row.pendingMinutes > 0)

  // `p, li { max-width: 72ch }` de globals.css corta estos parrafos a media
  // tarjeta (a 12px, 72ch son ~430px) y deja el lado derecho vacio. Aqui el
  // ancho lo pone la tarjeta, asi que se quita el tope.
  const muted = { fontSize: 12, lineHeight: 1.5, color: 'var(--clay-text-muted)', maxWidth: 'none' }
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
          Tu previsión hasta la PAU
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
                    role="img"
                    aria-label={`Reparto del trabajo registrado: ${hours(forecast.validScheduledMinutes)} programado sin conflicto, ${hours(forecast.projectedPendingMinutes)} pendiente que cabe, ${hours(forecast.deficitMinutes)} sin tiempo suficiente y ${hours(forecast.unfitMinutes)} que no encaja`}
                    style={{
                      display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden',
                      background: 'var(--clay-surface-deep)',
                    }}
                  >
                    <Segment minutes={forecast.validScheduledMinutes} total={scale} tone="accent" />
                    <Segment minutes={forecast.projectedPendingMinutes} total={scale} tone="accent" faded />
                    <Segment minutes={forecast.deficitMinutes} total={scale} tone="warn" />
                    <Segment minutes={forecast.unfitMinutes} total={scale} tone="warn" faded />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, fontSize: 12.5 }}>
                    <span style={muted}>Capacidad hasta la PAU</span>
                    <span style={num}>{hours(forecast.totalCapacityMinutes)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 6, fontSize: 12 }}>
                  {[
                    { tone: 'accent' as Tone, faded: false, label: 'Programado sin conflicto', value: forecast.validScheduledMinutes },
                    { tone: 'accent' as Tone, faded: true, label: 'Pendiente que prevemos que cabe', value: forecast.projectedPendingMinutes },
                    { tone: 'warn' as Tone, faded: false, label: 'Más trabajo que tiempo hasta la PAU', value: forecast.deficitMinutes },
                    { tone: 'warn' as Tone, faded: true, label: 'Tiempo que existe pero no encaja', value: forecast.unfitMinutes },
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

            {forecast.riskItems.length > 0 && (
              <details>
                <summary style={{ ...num, fontSize: 12, cursor: 'pointer' }}>Ver las {forecast.riskItems.length} actividades sin encajar</summary>
                <ul style={{ paddingLeft: 18, display: 'grid', gap: 10, ...muted }}>
                  {forecast.riskItems.slice(0, visibleRisks).map(item => (
                    <li key={`${item.scheduled ? 'calendar' : 'pending'}:${item.id}`} style={{ maxWidth: 'none' }}>
                      <strong>{item.title || SUBJECT_LABELS[item.subject] || item.subject}</strong> · {Math.round(item.minutes)} min<br />
                      {RISK_LABELS[item.reason]}{item.deadlineDate ? ` (${examDateLabel(item.deadlineDate)})` : ''}.
                      {!item.automatic && ' La colocaste tú; no la moveremos automáticamente.'}
                    </li>
                  ))}
                </ul>
                {visibleRisks < forecast.riskItems.length && <button type="button" onClick={() => setVisibleRisks(value => value + 10)}>Ver 10 más</button>}
              </details>
            )}

            {remedy && (
              <div style={{ display: 'grid', gap: 10, borderTop: '1px solid var(--clay-border)', paddingTop: 14 }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--clay-text-muted)' }}>
                  Para cubrir todo
                </span>

                {remedy.replanRecommended ? (
                  <>
                    <p style={prose}>Lo registrado puede encajar con tu disponibilidad actual. Hay que recolocar las actividades automáticas que están en conflicto.</p>
                    <button type="button" disabled={replanning} onClick={() => void replan()}
                      style={{ color: 'var(--clay-accent-text)', background: 'var(--clay-surface-raised)', border: '1px solid var(--clay-border)', borderRadius: 8, padding: '10px 12px', cursor: replanning ? 'wait' : 'pointer' }}>
                      {replanning ? 'Recolocando…' : 'Recolocar mi plan'}
                    </button>
                    {replanError && <p role="alert" style={prose}>{replanError}</p>}
                  </>
                ) : remedy.combinedChange ? (
                  <p style={prose}>Con <strong>{dailyMinutesLabel(remedy.combinedChange.dailyMinutes)} al día y {remedy.combinedChange.weeklyStudyDays} días a la semana</strong> puede encajar lo registrado. En este caso hay que cambiar ambas opciones.</p>
                ) : remedy.dailyMinutesNeeded != null || remedy.weeklyStudyDaysNeeded != null ? (
                  <>
                    {remedy.dailyMinutesNeeded != null && <RemedyRow label="Tiempo diario" value={dailyMinutesLabel(remedy.dailyMinutesNeeded)} from={dailyMinutesLabel(forecast.dailyMinutes)} />}
                    {remedy.weeklyStudyDaysNeeded != null && <RemedyRow label={remedy.dailyMinutesNeeded != null ? 'O días a la semana' : 'Días a la semana'} value={`${remedy.weeklyStudyDaysNeeded} días`} from={`${forecast.weeklyStudyDays ?? 5} días`} />}
                    <p style={prose}>La previsión contempla recolocar las actividades automáticas al guardar el cambio.</p>
                  </>
                ) : (
                  <p style={prose}>Con los ajustes permitidos siguen quedando actividades sin encajar. Revisa los motivos de cada actividad: un plazo vencido o un solape no se resuelve necesariamente añadiendo horas.</p>
                )}

                {forecast.unfitMinutes > 0 && (
                  <p style={prose}>
                    <strong style={num}>{hours(forecast.unfitMinutes)}</strong> no encajan aunque el tiempo
                    exista: son la reserva de repaso final —que el temario nuevo no cruza—, plazos de parciales
                    ya pasados y huecos que ninguna actividad llena. Añadir horas al día puede no mover esta
                    parte; mira los motivos de cada actividad antes de cambiar tu disponibilidad.
                  </p>
                )}

                {forecast.deficitMinutes > 0 && withWork.length > 0 && (
                  <div style={{ display: 'grid', gap: 10 }}>
                    <p style={prose}>
                      Sumar horas no es la única salida. Si parte de este temario ya lo has dado en clase,
                      dilo y entrará como <strong>repaso express</strong> en vez de como lección nueva: más
                      corto, pero sigue en tu Camino y sigue contando. No lo damos por aprobado — declarar
                      no es demostrar.
                    </p>
                    {withWork.map(row => (
                      <div key={row.subject} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ flex: '1 1 120px', minWidth: 0, fontSize: 12.5, fontWeight: 700 }}>
                          {SUBJECT_LABELS[row.subject] ?? row.subject}
                        </span>
                        <select
                          aria-label={`Punto de partida en ${SUBJECT_LABELS[row.subject] ?? row.subject}`}
                          value={startModes[row.subject] ?? ''}
                          onChange={event => setStartModes(current => ({ ...current, [row.subject]: event.target.value }))}
                          style={{ flex: '1 1 160px', minWidth: 0, fontSize: 12, padding: '7px 8px', borderRadius: 8,
                            border: '1px solid var(--clay-border)', background: 'var(--clay-surface-raised)', color: 'inherit' }}
                        >
                          <option value="">¿Por dónde vas?</option>
                          {START_MODE_OPTIONS.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!startModes[row.subject] || savingSubject != null}
                          onClick={() => void declareStartMode(row.subject)}
                          style={{ flex: 'none', fontSize: 12, fontWeight: 800, padding: '7px 12px', borderRadius: 8,
                            border: '1px solid var(--clay-border)', background: 'var(--clay-surface-raised)',
                            color: 'var(--clay-accent-text)',
                            cursor: !startModes[row.subject] || savingSubject != null ? 'not-allowed' : 'pointer',
                            opacity: !startModes[row.subject] || savingSubject != null ? 0.5 : 1 }}
                        >
                          {savingSubject === row.subject ? 'Aplicando…' : 'Aplicar'}
                        </button>
                      </div>
                    ))}
                    {startModeError && <p role="alert" style={prose}>{startModeError}</p>}
                  </div>
                )}

                {remedy.manualMinutes > 0 && (
                  <p style={prose}>
                    <strong style={num}>{hours(remedy.manualMinutes)}</strong> están en sesiones con hora fija que
                    pusiste tú, y conservamos tu decisión. Revisa su fecha u horario desde el calendario.
                  </p>
                )}
              </div>
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
              {forecast.estimatedItems > 0 && <p style={prose}>{forecast.estimatedItems} actividades usan duraciones de referencia por tipo; todavía no son mediciones personales.</p>}
              {incomplete && (
                <p style={{ ...prose, color: 'var(--clay-warn)' }}>
                  {forecast.missingSubjects.map(name => SUBJECT_LABELS[name] ?? name).join(', ')} no{' '}
                  {forecast.missingSubjects.length === 1 ? 'tiene' : 'tienen'} ni una misión en tu Camino, así que
                  esta previsión se queda corta. Genera{' '}
                  {forecast.missingSubjects.length === 1 ? 'su temario' : 'sus temarios'} desde «+ Añadir asignatura»
                  y vuelve a mirarla: el trabajo que falta puede cambiar el resultado.
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
