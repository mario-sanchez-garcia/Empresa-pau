'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { CheckCircle2, Clock, Copy, Lightbulb, MessageCircle, Route, RotateCcw, Target, TriangleAlert } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS } from '@/components/simulacros/data'
import type { SimulacroRecord } from '@/components/simulacros/types'
import MathMarkdown from '@/components/shared/MathMarkdown'
import WhyExplanation from '@/components/shared/WhyExplanation'
import KairoSpinner from '@/app/components/ui/KairoSpinner'

type Tab = 'resumen' | 'detalle' | 'plan' | 'bloques'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'detalle', label: 'Corrección detallada' },
  { id: 'plan', label: 'Plan de repaso' },
  { id: 'bloques', label: 'Por bloques' },
]

const CONFETTI_COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#0ea5e9', '#8b5cf6', '#a78bfa', '#10b981', '#34d399', '#f59e0b', '#fbbf24']

export default function SimulacroResultsPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [record, setRecord] = useState<SimulacroRecord | null>(null)
  const [tab, setTab] = useState<Tab>('resumen')
  const [copyMessage, setCopyMessage] = useState('')
  const [displayScore, setDisplayScore] = useState(0)
  const [scoreReady, setScoreReady] = useState(false)
  const confettiRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.push('/login')
        return
      }
      const { data: row } = await supabase
        .from('historial_simulacros')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', data.user.id)
        .single()
      if (!row) router.push('/simulacros')
      else setRecord(row as SimulacroRecord)
    })
  }, [params.id, router])

  const result = record?.resultado_json ?? {}
  const correctionFailed = Boolean(result.correction_error || result.estado_correccion === 'error')
  const nota = safeNumber(result.nota_final ?? record?.nota_final, 0)
  const hasGrade = Boolean(record) && !correctionFailed && isFiniteNumber(result.nota_final ?? record?.nota_final)
  const cfg = record ? SUBJECTS[record.asignatura] : SUBJECTS.mates

  // Count-up animation when record loads
  useEffect(() => {
    if (!hasGrade || !record) return
    const target = nota
    const duration = 1500
    const start = performance.now()

    function tick(now: number) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 4)
      setDisplayScore(parseFloat((target * eased).toFixed(2)))
      if (t < 1) {
        requestAnimationFrame(tick)
      } else {
        setDisplayScore(target)
        setScoreReady(true)
      }
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [hasGrade, nota, record])

  // Confetti burst when score animation completes and grade >= 7
  useEffect(() => {
    if (!scoreReady || !hasGrade || nota < 7) return
    const canvas = confettiRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const particles = Array.from({ length: 160 }, () => ({
      x: W / 2 + (Math.random() - 0.5) * 240,
      y: H * 0.26,
      vx: (Math.random() - 0.5) * 18,
      vy: -(Math.random() * 14 + 5),
      w: Math.random() * 10 + 5,
      h: Math.random() * 5 + 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 12,
      alpha: 1,
    }))

    let raf: number
    function animate() {
      ctx!.clearRect(0, 0, W, H)
      let alive = false
      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.44
        p.vx *= 0.98
        p.rot += p.rotV
        p.alpha -= 0.012
        if (p.alpha <= 0) continue
        alive = true
        ctx!.save()
        ctx!.globalAlpha = Math.max(0, p.alpha)
        ctx!.translate(p.x, p.y)
        ctx!.rotate((p.rot * Math.PI) / 180)
        ctx!.fillStyle = p.color
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx!.restore()
      }
      if (alive) {
        raf = requestAnimationFrame(animate)
      } else {
        ctx!.clearRect(0, 0, W, H)
      }
    }
    raf = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(raf)
      ctx.clearRect(0, 0, W, H)
    }
  }, [scoreReady, hasGrade, nota])

  if (!record) return <KairoSpinner />

  const detail = normalizeDetail(result, record, correctionFailed)
  const plan = normalizePlan(result, detail, correctionFailed)
  const resumen = normalizeResumen(result, detail)
  const nextTraining = plan[0]
    ? `${plan[0].tema}: ${plan[0].accion}`
    : 'Repite un bloque parecido al que peor haya salido y compara tu desarrollo con el criterio oficial.'
  const years = unique(record.bloques.map(block => block.year)).join(', ')

  async function share() {
    await navigator.clipboard.writeText(
      hasGrade
        ? `He sacado un ${nota.toFixed(1)} en un simulacro de ${cfg.label} en Kairo.`
        : `He completado un simulacro de ${cfg.label} en Kairo.`
    )
    setCopyMessage('Resultado copiado al portapapeles.')
    window.setTimeout(() => setCopyMessage(''), 2200)
  }

  const scoreDisplay = hasGrade ? displayScore.toFixed(2).replace('.00', '') : null
  const scoreColor = hasGrade ? gradeColor(nota) : '#64748b'

  return (
    <>
      {/* Confetti canvas — fixed full-screen overlay */}
      <canvas
        ref={confettiRef}
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 200 }}
        aria-hidden="true"
      />

      <SimulacroShell
        title="Resultados del simulacro"
        subtitle="Corrección completa bloque a bloque"
        actions={
          <Link
            href="/simulacros"
            className="campus-primary"
            style={{ padding: '9px 18px', fontSize: 13, gap: 8, borderRadius: 12, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <RotateCcw size={14} />Nuevo simulacro
          </Link>
        }
      >
        <div className="mx-auto grid max-w-6xl gap-6">

          {/* Score hero */}
          <section
            className="pau-reveal overflow-hidden rounded-2xl"
            style={{
              background: `linear-gradient(160deg, #ffffff 0%, ${cfg.light} 100%)`,
              border: `1px solid ${cfg.color}22`,
              boxShadow: `0 20px 60px ${cfg.color}14, 0 4px 16px rgba(15,23,42,0.06)`,
            }}
          >
            <div className="p-8 text-center max-sm:p-6">
              {/* Subject chip */}
              <div className="mb-4 flex items-center justify-center gap-2 flex-wrap">
                <span
                  className="inline-flex rounded-full px-4 py-1.5 text-sm font-black text-white"
                  style={{ background: cfg.color }}
                >
                  {cfg.label}
                </span>
                <span
                  className="inline-flex rounded-full px-4 py-1.5 text-sm font-black"
                  style={{ background: `${cfg.color}14`, color: cfg.color }}
                >
                  {record.dificultad_real ?? record.dificultad}
                </span>
              </div>

              {/* Score number */}
              <div className="sim-score-reveal">
                <div
                  className="text-8xl font-black tracking-tight max-sm:text-7xl"
                  style={{ color: scoreColor, letterSpacing: '-0.04em', lineHeight: 1 }}
                >
                  {scoreDisplay ?? '—'}
                </div>
                <div className="mt-2 text-lg font-black" style={{ color: '#94a3b8' }}>
                  {hasGrade ? '/ 10 puntos' : 'Corrección pendiente'}
                </div>
              </div>

              {/* Meta chips */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
                {[
                  `Tiempo: ${record.tiempo_empleado ?? 0} min de 90`,
                  `Años: ${years || 'sin datos'}`,
                  ...(record.asignatura !== 'lengua' ? [optionSummaryForRecord(record)] : []),
                  record.id.slice(0, 8),
                ].map(text => (
                  <span
                    key={text}
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                  >
                    {text}
                  </span>
                ))}
              </div>

              {correctionFailed && (
                <div
                  className="mx-auto mt-6 max-w-2xl rounded-2xl p-4 text-sm font-semibold"
                  style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af' }}
                >
                  <p>{result.mensaje_usuario ?? result.feedback_general ?? 'No hemos podido corregir este simulacro. Tus respuestas están guardadas y puedes intentarlo de nuevo.'}</p>
                  <a
                    href={`/simulacros/${params.id}`}
                    className="mt-3 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-black text-white no-underline transition hover:-translate-y-0.5"
                    style={{ background: '#2563eb', boxShadow: '0 8px 20px rgba(37,99,235,0.22)' }}
                  >
                    Reintentar corrección
                  </a>
                </div>
              )}

              {(record.tiempo_empleado ?? 0) > 90 && (
                <div
                  className="mx-auto mt-5 max-w-2xl rounded-2xl p-4 text-sm font-semibold"
                  style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#854d0e' }}
                >
                  En el examen real habrías entregado al llegar a 90 min.
                </div>
              )}
            </div>

            {/* Grade progress bar */}
            <div className="pau-progress-bar" style={{ borderRadius: 0, height: 5 }}>
              <div
                className="pau-progress-fill"
                style={{
                  transform: `scaleX(${hasGrade ? Math.min(100, nota * 10) / 100 : 0})`,
                  background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}bb)`,
                }}
              />
            </div>
          </section>

          {/* Tab nav */}
          <nav
            className="pau-reveal flex flex-wrap gap-1.5 p-1.5"
            style={{
              borderRadius: 16,
              border: '1px solid var(--pau-border)',
              background: 'rgba(255,255,255,0.82)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="rounded-xl px-4 py-2 text-sm font-black transition"
                style={{
                  background: tab === id ? cfg.color : 'transparent',
                  color: tab === id ? '#fff' : '#64748b',
                  boxShadow: tab === id ? `0 6px 16px ${cfg.color}28` : 'none',
                  border: 'none',
                  transition: 'all 180ms var(--ease-out)',
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Tab content */}
          {tab === 'resumen' && (
            <section className="pau-stagger grid gap-4 md:grid-cols-2">
              <ResultCard icon={<Target size={18} />} title="Feedback general" text={result.feedback_general || 'Revisa la corrección detallada para ver el análisis bloque a bloque.'} color={cfg.color} />
              <ResultCard icon={<CheckCircle2 size={18} />} title="Qué está bien" text={result.puntos_fuertes || listToText(result.fortalezas) || 'Todavía no hay fortalezas detectadas en esta corrección.'} color="#059669" tone="green" />
              <ResultCard icon={<TriangleAlert size={18} />} title="Errores principales" text={result.puntos_mejora || listToText(result.errores_principales) || 'No hay errores principales disponibles. Mira cada bloque para más detalle.'} color="#d97706" tone="orange" />
              <ResultCard icon={<Lightbulb size={18} />} title="Recomendación de próximo entrenamiento" text={nextTraining} color={cfg.color} />
              <ResultCard icon={<Clock size={18} />} title="Contexto del simulacro" text={result.contexto_dificultad || `Configuración: ${record.dificultad_real ?? record.dificultad}.`} color={cfg.color} />
            </section>
          )}

          {tab === 'detalle' && (
            <section className="grid gap-5">
              {detail.map((block, index) => (
                <article
                  key={`${block.numero_bloque}-${index}`}
                  className="pau-card-section sim-tab-reveal"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black" style={{ color: '#0f172a' }}>
                        {block.numero_bloque} · {block.tema}
                      </h2>
                      <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
                        Año {block.año_origen ?? 'sin datos'} · {block.convocatoria_origen || 'convocatoria sin datos'}
                      </p>
                    </div>
                    <div
                      className="rounded-full px-4 py-2 text-sm font-black"
                      style={{
                        background: scoreColorSoft(block.porcentaje_logrado),
                        color: scoreColorStrong(block.porcentaje_logrado),
                      }}
                    >
                      {format(block.puntos_conseguidos)}/{format(block.puntos_maximos)} · {block.porcentaje_logrado}%
                    </div>
                  </div>

                  {/* Score bar for this block */}
                  <div className="mb-4 pau-progress-bar">
                    <div
                      className="pau-progress-fill"
                      style={{
                        transform: `scaleX(${clamp(block.porcentaje_logrado, 0, 100) / 100})`,
                        background: `linear-gradient(90deg, ${scoreColorStrong(block.porcentaje_logrado)}, ${scoreColorStrong(block.porcentaje_logrado)}bb)`,
                      }}
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <TextPanel title="Qué hizo bien" text={block.que_hizo_bien} accent="#059669" />
                    <TextPanel title="Qué faltaba" text={block.que_faltaba} accent="#d97706" />
                    <TextPanel title="Errores detectados" text={listToText(block.errores_detectados)} accent="#dc2626" />
                    <TextPanel title="Cómo mejorar" text={block.consejo_para_mejorar} accent="#2563eb" />
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <TextPanel title="Enunciado oficial" text={block.enunciado_oficial} />
                    <TextPanel title="Respuesta del alumno" text={block.respuesta_alumno} />
                  </div>

                  {block.penalizaciones_aplicadas.length > 0 && (
                    <div
                      className="mt-4 rounded-2xl p-4 text-sm font-bold"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a', color: '#854d0e' }}
                    >
                      <strong className="mb-2 block">Penalizaciones aplicadas</strong>
                      {block.penalizaciones_aplicadas.map((penalty: { motivo?: string; puntos_descontados?: number }, i: number) => (
                        <Markdown key={i} text={`- ${penalty.motivo ?? 'Penalización'}: ${penalty.puntos_descontados ?? ''}`} />
                      ))}
                    </div>
                  )}

                  <div
                    className="mt-4 rounded-2xl p-4"
                    style={{ background: '#f8fbff', border: '1px solid #dde8f8' }}
                  >
                    <strong className="mb-2 block font-black" style={{ color: '#1e3a8a' }}>Corrección detallada</strong>
                    <Markdown text={block.correccion_detalle} />
                  </div>
                  <div
                    className="mt-3 rounded-2xl p-4"
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}
                  >
                    <strong className="mb-2 block font-black" style={{ color: '#1e40af' }}>Solución orientativa</strong>
                    <Markdown text={block.solucion_orientativa} />
                  </div>
                  <WhyExplanation explanation={block.porqueEsAsi} markdown={block.teoria_ejercicio} />
                </article>
              ))}
            </section>
          )}

          {tab === 'plan' && (
            <section className="pau-stagger grid gap-4 md:grid-cols-3">
              {plan.map((item: { prioridad: number; tema: string; accion: string; tiempo_recomendado: string; recurso_sugerido: string }) => (
                <article
                  key={item.prioridad}
                  className="pau-card-section"
                >
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-full font-black text-white"
                    style={{ background: cfg.color, boxShadow: `0 8px 20px ${cfg.color}30` }}
                  >
                    {item.prioridad}
                  </div>
                  <h3 className="mb-2 text-base font-black" style={{ color: '#0f172a' }}>{item.tema}</h3>
                  <Markdown text={item.accion} />
                  <p className="mt-3 flex items-center gap-1 text-sm font-black" style={{ color: '#94a3b8' }}>
                    <Clock size={14} />{item.tiempo_recomendado}
                  </p>
                  <div
                    className="mt-3 rounded-xl p-3 text-sm font-semibold"
                    style={{ background: `${cfg.color}0e`, border: `1px solid ${cfg.color}22`, color: '#1e3a8a' }}
                  >
                    <Lightbulb size={14} className="inline mr-1.5" style={{ color: cfg.color }} />
                    <Markdown text={item.recurso_sugerido} />
                  </div>
                </article>
              ))}
            </section>
          )}

          {tab === 'bloques' && (
            <section className="pau-stagger grid gap-4 md:grid-cols-4 max-sm:grid-cols-2">
              {resumen.map((item: { bloque: string; puntos_conseguidos: number; puntos_maximos: number; porcentaje: number; nivel: string }, index: number) => (
                <article key={`${item.bloque}-${index}`} className="pau-card-section">
                  <h3 className="mb-1 text-sm font-black" style={{ color: '#0f172a' }}>{item.bloque}</h3>
                  <p className="text-xs font-bold" style={{ color: '#94a3b8' }}>
                    {format(item.puntos_conseguidos)}/{format(item.puntos_maximos)} pts
                  </p>
                  <div className="my-3 pau-progress-bar">
                    <div
                      className="pau-progress-fill"
                      style={{
                        width: `${clamp(item.porcentaje, 0, 100)}%`,
                        transform: 'none',
                        background: barGradient(item.nivel),
                      }}
                    />
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-black"
                    style={{
                      background: levelBg(item.nivel),
                      color: levelColor(item.nivel),
                    }}
                  >
                    {item.nivel}
                  </span>
                </article>
              ))}
            </section>
          )}

          {/* Footer actions */}
          <div className="flex flex-wrap items-center gap-3 pau-reveal">
            <button
              onClick={share}
              className="pau-button-secondary"
            >
              <Copy size={15} />Compartir resultado
            </button>
            <a
              href="/camino"
              className="campus-primary no-underline"
              style={{ padding: '10px 16px', borderRadius: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <Route size={15} />Crear misión de repaso
            </a>
            <Link
              href="/"
              className="pau-button-secondary no-underline"
            >
              <MessageCircle size={15} />Preguntar a Kairo
            </Link>
            {copyMessage && (
              <span
                className="rounded-full px-3 py-1 text-sm font-black"
                style={{ background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }}
              >
                {copyMessage}
              </span>
            )}
          </div>
        </div>
      </SimulacroShell>
    </>
  )
}

function ResultCard({
  icon, title, text, color, tone = 'blue',
}: { icon: ReactNode; title: string; text?: string; color: string; tone?: 'blue' | 'green' | 'orange' }) {
  const bgs = { blue: '#f8fbff', green: '#f0fdf4', orange: '#fffbeb' }
  const borders = { blue: '#dde8f8', green: '#bbf7d0', orange: '#fde68a' }
  return (
    <article
      className="pau-card-section"
      style={{ background: bgs[tone], borderColor: borders[tone] }}
    >
      <div className="mb-3 flex items-center gap-2 font-black" style={{ color }}>
        {icon}{title}
      </div>
      <Markdown text={text || 'Sin datos disponibles.'} />
    </article>
  )
}

function TextPanel({ title, text, accent = '#2563eb' }: { title: string; text?: string; accent?: string }) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: `${accent}08`,
        border: `1px solid ${accent}20`,
      }}
    >
      <strong className="mb-1.5 block text-xs font-black uppercase tracking-wide" style={{ color: accent }}>
        {title}
      </strong>
      <Markdown text={text || 'Sin datos disponibles.'} />
    </div>
  )
}

function Markdown({ text }: { text?: string }) {
  return <MathMarkdown text={text || 'Sin datos disponibles.'} className="prose prose-slate" />
}

// ─── Data normalizers (unchanged from original) ──────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDetail(result: any, record: SimulacroRecord, correctionFailed: boolean) {
  const raw = Array.isArray(result?.desglose_bloques) ? result.desglose_bloques : []
  return record.bloques.map((source, index) => {
    const block = raw[index] ?? {}
    const max = safeNumber(block.max_puntos ?? block.puntos_maximos ?? source.puntuacion, source.puntuacion ?? 0)
    const score = clamp(safeNumber(block.nota ?? block.puntos_conseguidos, 0), 0, max)
    const percentage = max > 0 ? Math.round(score / max * 100) : 0
    const unavailable = correctionFailed || !raw[index]
    return {
      numero_bloque: block.numero_bloque || `Bloque ${index + 1}`,
      tema: block.tema || source.tema || `Bloque ${index + 1}`,
      año_origen: block.año_origen ?? source.year ?? null,
      convocatoria_origen: block.convocatoria_origen ?? source.convocatoria ?? '',
      enunciado_oficial: source.enunciado,
      respuesta_alumno: record.respuestas_parciales?.[source.id]?.text || (record.respuestas_parciales?.[source.id]?.image ? 'Respuesta manuscrita adjunta como imagen.' : 'Sin respuesta guardada.'),
      puntos_conseguidos: score,
      puntos_maximos: max,
      porcentaje_logrado: safeNumber(block.porcentaje_logrado ?? block.porcentaje, percentage),
      que_hizo_bien: textOrFallback(block.que_hizo_bien, unavailable ? 'La corrección no llegó a completarse, así que no podemos destacar aciertos concretos todavía.' : 'No se han indicado aciertos concretos.'),
      errores_detectados: normalizeList(block.errores_detectados, unavailable ? ['La corrección no llegó a completarse.'] : ['No se han indicado errores concretos.']),
      que_faltaba: textOrFallback(block.que_faltaba, unavailable ? 'Vuelve a intentar la corrección para ver qué faltaba en este bloque.' : 'No se ha indicado qué faltaba.'),
      penalizaciones_aplicadas: Array.isArray(block.penalizaciones_aplicadas) ? block.penalizaciones_aplicadas : [],
      correccion_detalle: textOrFallback(block.correccion_detalle, unavailable ? 'No hay corrección detallada disponible porque la corrección falló o quedó incompleta.' : 'La IA no añadió corrección detallada para este bloque.'),
      solucion_orientativa: textOrFallback(block.solucion_orientativa ?? block.solucion_correcta_corta, unavailable ? 'No hay solución orientativa disponible todavía.' : 'No se ha incluido solución orientativa.'),
      porqueEsAsi: block.porqueEsAsi ?? block.whyExplanation ?? null,
      teoria_ejercicio: typeof block.teoria_ejercicio === 'string' ? block.teoria_ejercicio : '',
      consejo_para_mejorar: textOrFallback(block.consejo_para_mejorar ?? block.consejo_especifico, unavailable ? 'Conserva tu respuesta y vuelve a corregir el simulacro cuando el servicio responda.' : 'Rehaz el bloque comparando tu desarrollo con el criterio oficial.')
    }
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizePlan(result: any, detail: ReturnType<typeof normalizeDetail>, correctionFailed: boolean) {
  if (Array.isArray(result?.plan_repaso) && result.plan_repaso.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.plan_repaso.slice(0, 3).map((item: any, index: number) => ({
      prioridad: item.prioridad ?? index + 1,
      tema: item.tema || `Prioridad ${index + 1}`,
      accion: item.accion || 'Revisa este punto y repite un ejercicio parecido.',
      tiempo_recomendado: item.tiempo_recomendado || '20 min',
      recurso_sugerido: item.recurso_sugerido || 'Vuelve al banco de exámenes de Kairo.'
    }))
  }

  if (correctionFailed) {
    return [{ prioridad: 1, tema: 'Corrección pendiente', accion: 'Vuelve a intentar la corrección. Tus respuestas están guardadas.', tiempo_recomendado: '2 min', recurso_sugerido: 'Abre de nuevo el simulacro y pulsa Ver corrección.' }]
  }

  return detail
    .filter(block => block.porcentaje_logrado < 80)
    .slice(0, 3)
    .map((block, index) => ({
      prioridad: index + 1,
      tema: block.tema,
      accion: `Rehaz ${block.numero_bloque} centrándote en: ${block.que_faltaba}`,
      tiempo_recomendado: block.porcentaje_logrado < 50 ? '30 min' : '20 min',
      recurso_sugerido: 'Practica otro bloque del mismo tema en Kairo.'
    }))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeResumen(result: any, detail: ReturnType<typeof normalizeDetail>) {
  if (Array.isArray(result?.resumen_por_bloque_tematico) && result.resumen_por_bloque_tematico.length) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return result.resumen_por_bloque_tematico.map((item: any) => ({
      bloque: item.bloque || item.tema || 'Bloque',
      puntos_conseguidos: safeNumber(item.puntos_conseguidos, 0),
      puntos_maximos: safeNumber(item.puntos_maximos, 0),
      porcentaje: safeNumber(item.porcentaje, 0),
      nivel: normalizeLevel(item.nivel)
    }))
  }

  return detail.map(block => ({
    bloque: block.tema,
    puntos_conseguidos: block.puntos_conseguidos,
    puntos_maximos: block.puntos_maximos,
    porcentaje: block.porcentaje_logrado,
    nivel: normalizeLevel(block.porcentaje_logrado >= 80 ? 'Domina' : block.porcentaje_logrado >= 50 ? 'En progreso' : 'Necesita refuerzo urgente')
  }))
}

// ─── Color helpers ───────────────────────────────────────────────

function gradeColor(n: number) {
  if (n >= 9) return '#059669'
  if (n >= 7) return '#0284c7'
  if (n >= 5) return '#f59e0b'
  return '#dc2626'
}

function scoreColorSoft(pct: number) {
  if (pct >= 80) return '#f0fdf4'
  if (pct >= 50) return '#fffbeb'
  return '#fef2f2'
}

function scoreColorStrong(pct: number) {
  if (pct >= 80) return '#059669'
  if (pct >= 50) return '#d97706'
  return '#dc2626'
}

function barGradient(level?: string) {
  if (level?.includes('Domina')) return 'linear-gradient(90deg, #059669, #34d399)'
  if (level?.includes('urgente')) return 'linear-gradient(90deg, #dc2626, #f87171)'
  return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
}

function levelBg(level?: string) {
  if (level?.includes('Domina')) return '#f0fdf4'
  if (level?.includes('urgente')) return '#fef2f2'
  return '#fffbeb'
}

function levelColor(level?: string) {
  if (level?.includes('Domina')) return '#059669'
  if (level?.includes('urgente')) return '#dc2626'
  return '#d97706'
}

function normalizeLevel(level?: string) {
  if (level?.includes('Domina')) return 'Domina'
  if (level?.includes('urgente')) return 'Necesita refuerzo urgente'
  return 'En progreso'
}

// ─── Utility helpers (unchanged) ─────────────────────────────────

function normalizeList(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String)
  if (typeof value === 'string' && value.trim()) return [value.trim()]
  return fallback
}

function listToText(value: unknown) {
  return normalizeList(value).join(' ')
}

function textOrFallback(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items.filter(Boolean)))
}

function isFiniteNumber(value: unknown) {
  return Number.isFinite(Number(value))
}

function safeNumber(value: unknown, fallback: number) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function format(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '0'
}

function optionSummaryForRecord(record: SimulacroRecord) {
  const options = Array.from(new Set((record.bloques ?? []).map(block => block.option).filter(Boolean))).sort()
  if (options.length > 1) return 'Opciones A/B'
  if (options[0]) return `Opción ${options[0]}`
  return `Opción ${record.opcion}`
}
