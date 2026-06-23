'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Eye, EyeOff, ListChecks, PlayCircle, Settings2, Shuffle, Target, TrendingDown } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { SUBJECTS, generateSimulacro } from '@/components/simulacros/data'
import type { SimulacroBlock, SimulacroDifficulty, SimulacroOption, SimulacroRecord, SimulacroSubject } from '@/components/simulacros/types'
import { useCCAA } from '@/app/hooks/useCCAA'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'

type SimulacroMode = 'normal' | 'errores' | 'tipicos' | 'personalizado'
type YearChoice = 'all' | 'recent' | 'middle' | 'classic'
type OptionChoice = 'mixed' | SimulacroOption

interface ExamHistoryRow {
  id: string
  asignatura?: string | null
  tipo?: string | null
  año?: number | null
  bloque?: string | null
  opcion?: string | null
  nota?: number | null
  nota_maxima?: number | null
  enunciado?: string | null
  correccion?: string | null
  created_at?: string | null
}

const YEAR_CHOICES: Array<{ id: YearChoice; label: string; description: string }> = [
  { id: 'all', label: 'Todos los años', description: 'Pausia mezcla ejercicios oficiales disponibles.' },
  { id: 'recent', label: 'Años recientes', description: 'Entrena con convocatorias más actuales.' },
  { id: 'middle', label: 'Años intermedios', description: 'Práctica equilibrada con exámenes estándar.' },
  { id: 'classic', label: 'Años clásicos', description: 'Base sólida con ejercicios más directos.' },
]

const OPTION_CHOICES: Array<{ id: OptionChoice; label: string; description: string }> = [
  { id: 'mixed', label: 'A/B automático', description: 'La app mezcla opciones cuando haya ejercicios compatibles.' },
  { id: 'A', label: 'Opción A', description: 'Solo ejercicios de opción A.' },
  { id: 'B', label: 'Opción B', description: 'Solo ejercicios de opción B.' },
]

export default function SimulacrosPage() {
  const [userId, setUserId] = useState('')
  const [subject, setSubject] = useState<SimulacroSubject>('mates')
  const [mode, setMode] = useState<SimulacroMode>('normal')
  const [yearChoice, setYearChoice] = useState<YearChoice>('all')
  const [optionChoice, setOptionChoice] = useState<OptionChoice>('mixed')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<SimulacroRecord[]>([])
  const [examHistory, setExamHistory] = useState<ExamHistoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { ccaa } = useCCAA()
  const stats = useMemo(() => buildStats(history), [history])
  const weakCandidateCount = useMemo(
    () => buildWeakBlocks(history, examHistory, subject, ccaa).length,
    [history, examHistory, subject, ccaa]
  )

  useEffect(() => {
    // React 18 batchea estos setStates en un solo render — no hay riesgo real de cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMode('normal')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYearChoice('all')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOptionChoice('mixed')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setErrorMessage('')
  }, [ccaa])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login')
      else {
        setUserId(data.user.id)
        void loadHistory(data.user.id)
      }
    })
  }, [router])

  async function loadHistory(uid = userId) {
    if (!uid) return
    const [simulacrosResult, examenesResult] = await Promise.all([
      supabase
        .from('historial_simulacros')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('historial_examenes')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(120)
    ])
    setHistory((simulacrosResult.data ?? []) as SimulacroRecord[])
    setExamHistory((examenesResult.data ?? []) as ExamHistoryRow[])
  }

  async function createSimulacro() {
    if (loading) return
    setLoading(true)
    setErrorMessage('')

    try {
      if (!SUBJECTS[subject].available) {
        setErrorMessage(`${SUBJECTS[subject].label} estará disponible en simulacros cuando carguemos suficientes ejercicios oficiales.`)
        setLoading(false)
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const currentUserId = sessionData.session?.user?.id
      if (sessionError || !currentUserId) {
        console.error('SIMULACRO_SESSION_ERROR', sessionError)
        setLoading(false)
        router.push('/login')
        return
      }
      setUserId(currentUserId)

      const effectiveYearChoice = mode === 'personalizado' ? yearChoice : 'all'
      const yearSelection = yearChoiceToSelection(effectiveYearChoice)
      const optionSelection = effectiveOptionChoice(mode, subject, optionChoice)
      const technicalDifficulty = technicalDifficultyForYearChoice(effectiveYearChoice)
      const generatorOption: SimulacroOption = optionSelection === 'B' ? 'B' : 'A'
      const generated = generateSimulacro(subject, technicalDifficulty, generatorOption, ccaa, {
        yearSelection,
        optionSelection,
      })

      const weakBlocks = mode === 'errores'
        ? buildWeakBlocks(history, examHistory, subject, ccaa)
        : []
      if (mode === 'errores' && weakBlocks.length === 0) {
        setErrorMessage('Para crear un simulacro con tus peores notas necesito al menos una corrección previa de esta asignatura.')
        setLoading(false)
        return
      }

      const finalBlocks = mode === 'errores'
        ? mergeBlocksForExam(weakBlocks, generated?.blocks ?? [], ccaa)
        : generated?.blocks ?? []

      if (!generated && finalBlocks.length === 0) {
        setErrorMessage('No hay suficientes ejercicios disponibles para crear este simulacro.')
        setLoading(false)
        return
      }
      const generatedId = generated?.id ?? crypto.randomUUID()
      const storedOption = finalBlocks.find(block => block.option === 'A' || block.option === 'B')?.option ?? generatorOption
      const configLabel = buildConfigLabel(mode, effectiveYearChoice, optionSelection)
      const now = new Date().toISOString()
      const row = {
        id: generatedId,
        user_id: currentUserId,
        asignatura: subject,
        opcion: storedOption,
        dificultad: technicalDifficulty,
        dificultad_real: configLabel,
        bloques: finalBlocks,
        respuestas_parciales: {},
        estado: 'en_progreso',
        created_at: now,
        updated_at: now
      }
      const { error } = await supabase.from('historial_simulacros').insert(row)
      if (error) {
        console.error('SIMULACRO_INSERT_ERROR', error)
        setErrorMessage('No se pudo crear el simulacro. Revisa la conexión o la tabla historial_simulacros en Supabase.')
        setLoading(false)
        return
      }
      router.push(`/simulacros/${generatedId}`)
    } catch (error) {
      console.error('SIMULACRO_CREATE_ERROR', error)
      setErrorMessage('No se pudo crear el simulacro ahora mismo. Inténtalo de nuevo en unos segundos.')
      setLoading(false)
    }
  }

  const cfg = SUBJECTS[subject]
  const autoInfo = autoModeInfo(mode, weakCandidateCount)
  const AutoInfoIcon = mode === 'errores' ? TrendingDown : mode === 'tipicos' ? Target : Shuffle

  return (
    <SimulacroShell
      title="Simulacros"
      subtitle="Ponte a prueba en condiciones reales de examen"
      actions={
        <button
          onClick={() => { setHistoryOpen(!historyOpen); void loadHistory() }}
          className="pausia-pill px-4 py-2 text-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
        >
          {historyOpen ? <EyeOff size={15} /> : <Eye size={15} />}
          {historyOpen ? 'Ocultar historial' : 'Mis simulacros'}
        </button>
      }
    >
      <div className="mx-auto grid max-w-6xl gap-7">

        {/* Stats */}
        <section className="pau-reveal">
          <p className="mb-3 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Tus estadísticas</p>
          {stats.completedCount === 0 ? (
            <div className="pau-empty text-sm">
              Completa tu primer simulacro para ver tu media, mejor nota y tiempo medio aquí.
            </div>
          ) : (
            <div className="pau-stagger grid grid-cols-5 gap-3 max-lg:grid-cols-3 max-sm:grid-cols-2">
              <StatCard label="Completados" value={String(stats.completedCount)} />
              <StatCard label="Media" value={`${formatScore(stats.averageScore)}/10`} />
              <StatCard label="Mejor nota" value={`${formatScore(stats.bestScore)}/10`} accent />
              <StatCard label="Tiempo medio" value={`${stats.averageTime} min`} />
              <StatCard
                label="Último simulacro"
                value={stats.lastCompleted ? formatDate(stats.lastCompleted.updated_at ?? stats.lastCompleted.created_at) : '-'}
              />
            </div>
          )}
          {stats.lastCompleted && (
            <div className="mt-3 flex items-center gap-2">
              <span
                className="rounded-full px-3 py-1 text-xs font-black"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
              >
                Último: {SUBJECTS[stats.lastCompleted.asignatura]?.label ?? stats.lastCompleted.asignatura} · {formatScore(stats.lastCompleted.nota_final)}/10
              </span>
            </div>
          )}
        </section>

        {/* History panel */}
        {historyOpen && (
          <section className="pau-card-section pau-reveal grid gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black" style={{ color: '#0f172a' }}>Mis simulacros anteriores</h2>
              <span
                className="rounded-full px-3 py-1 text-xs font-black"
                style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
              >
                {history.length} total
              </span>
            </div>
            {history.length === 0 ? (
              <p className="text-sm font-semibold" style={{ color: '#94a3b8' }}>Todavía no tienes simulacros guardados.</p>
            ) : (
              <div className="pau-stagger grid gap-2" style={{ maxHeight: 320, overflowY: 'auto' }}>
                {history.map(item => (
                  <a
                    key={item.id}
                    href={item.estado === 'completado' ? `/simulacros/${item.id}/results` : `/simulacros/${item.id}`}
                    className="flex items-center justify-between rounded-xl border p-3 no-underline transition hover:-translate-y-0.5 hover:shadow-sm"
                    style={{
                      borderColor: '#dbe7fb',
                      background: '#f8fbff',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'
                      ;(e.currentTarget as HTMLElement).style.background = '#eff6ff'
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = '#dbe7fb'
                      ;(e.currentTarget as HTMLElement).style.background = '#f8fbff'
                    }}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-sm" style={{ color: '#0f172a' }}>
                        {SUBJECTS[item.asignatura]?.label ?? item.asignatura} · {item.dificultad_real ?? item.dificultad}
                      </strong>
                      <small style={{ color: '#94a3b8' }}>
                        {item.id.slice(0, 8)} · {item.estado === 'completado' ? `Nota ${item.nota_final ?? '-'}/10` : 'En progreso'}
                      </small>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      {item.estado === 'completado' ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#f0fdf4', color: '#15803d' }}>
                          <CheckCircle2 size={12} />Completado
                        </span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#fffbeb', color: '#b45309' }}>En progreso</span>
                      )}
                      <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: '#f1f5f9', color: '#475569' }}>{optionSummaryForRecord(item)}</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="pau-error pau-reveal" role="alert">
            {errorMessage}
          </div>
        )}

        {/* Step 1: Subject */}
        <section className="pau-reveal pau-reveal-delay-1">
          <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Paso 1 · Asignatura
          </p>
          <div className="pau-stagger grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {(Object.keys(SUBJECTS) as SimulacroSubject[]).map(key => {
              const s = SUBJECTS[key]
              const available = s.available
              const Icon = s.icon
              const isActive = subject === key
              return (
                <button
                  key={key}
                  disabled={!available}
                  onClick={() => available && setSubject(key)}
                  className="pau-subject-card relative overflow-hidden rounded-2xl border p-5 text-left"
                  style={{
                    borderColor: isActive ? s.color : 'rgba(219,231,251,0.82)',
                    background: isActive
                      ? `linear-gradient(145deg, #ffffff 0%, ${s.light} 100%)`
                      : 'rgba(255,255,255,0.82)',
                    boxShadow: isActive
                      ? `0 0 0 2.5px ${s.color}28, 0 14px 36px ${s.color}18`
                      : '0 2px 8px rgba(37,99,235,0.05)',
                    cursor: available ? 'pointer' : 'not-allowed',
                    opacity: available ? 1 : 0.6,
                  }}
                >
                  {/* Watermark icon */}
                  <Icon
                    size={96}
                    className="pointer-events-none absolute -bottom-5 -right-4"
                    style={{ color: s.color, opacity: isActive ? 0.13 : 0.07 }}
                  />
                  {/* Icon badge */}
                  <div
                    className="relative mb-4 flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      background: isActive ? s.color : s.light,
                      color: isActive ? '#fff' : s.color,
                      boxShadow: isActive ? `0 6px 16px ${s.color}33` : 'none',
                      transition: 'background 220ms, color 220ms, box-shadow 220ms',
                    }}
                  >
                    <Icon size={22} />
                  </div>
                  <h3 className="relative mb-1 text-sm font-black" style={{ color: '#0f172a' }}>{s.label}</h3>
                  <p className="relative text-xs font-semibold" style={{ color: '#94a3b8' }}>
                    {available
                      ? key === 'lengua'
                        ? 'Examen oficial completo'
                        : 'Simulacro mezclado oficial'
                      : 'Cargando ejercicios oficiales'}
                  </p>
                  {!available && (
                    <span
                      className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide"
                      style={{ background: '#f0fdf4', color: '#15803d' }}
                    >
                      Pronto
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* Step 2: Mode */}
        <section className="pau-reveal pau-reveal-delay-2">
          <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Paso 2 · Tipo de simulacro
          </p>
          <div className="pau-stagger grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
            <button
              onClick={() => setMode('normal')}
              className="group rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5"
              style={{
                borderColor: mode === 'normal' ? cfg.color : 'rgba(219,231,251,0.82)',
                background: mode === 'normal'
                  ? `linear-gradient(145deg, #ffffff 0%, ${cfg.light} 100%)`
                  : 'rgba(255,255,255,0.84)',
                boxShadow: mode === 'normal'
                  ? `0 0 0 2.5px ${cfg.color}24, 0 16px 38px ${cfg.color}16`
                  : '0 2px 8px rgba(37,99,235,0.04)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl text-white transition group-hover:scale-105"
                  style={{ background: cfg.color, boxShadow: `0 10px 24px ${cfg.color}2b` }}
                >
                  <Shuffle size={22} />
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}24` }}>
                  Recomendado
                </span>
              </div>
              <h3 className="text-lg font-black" style={{ color: '#0f172a' }}>Simulacro normal</h3>
              <p className="mt-2 text-sm font-semibold leading-6" style={{ color: '#64748b' }}>
                Puede salir cualquier año oficial disponible y cualquier opción A/B. Ideal para practicar como examen real.
              </p>
            </button>

            <button
              onClick={() => setMode('errores')}
              className="group rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5"
              style={{
                borderColor: mode === 'errores' ? cfg.color : 'rgba(219,231,251,0.82)',
                background: mode === 'errores'
                  ? `linear-gradient(145deg, #ffffff 0%, ${cfg.light} 100%)`
                  : 'rgba(255,255,255,0.84)',
                boxShadow: mode === 'errores'
                  ? `0 0 0 2.5px ${cfg.color}24, 0 16px 38px ${cfg.color}16`
                  : '0 2px 8px rgba(37,99,235,0.04)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105"
                  style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                >
                  <TrendingDown size={22} />
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: weakCandidateCount > 0 ? '#f0fdf4' : '#fffbeb', color: weakCandidateCount > 0 ? '#15803d' : '#b45309', border: `1px solid ${weakCandidateCount > 0 ? '#bbf7d0' : '#fde68a'}` }}>
                  {weakCandidateCount > 0 ? `${weakCandidateCount} detectados` : 'Necesita historial'}
                </span>
              </div>
              <h3 className="text-lg font-black" style={{ color: '#0f172a' }}>Peores notas</h3>
              <p className="mt-2 text-sm font-semibold leading-6" style={{ color: '#64748b' }}>
                Crea un examen con ejercicios y bloques donde peor has rendido para remontar puntos concretos.
              </p>
            </button>

            <button
              onClick={() => setMode('tipicos')}
              className="group rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5"
              style={{
                borderColor: mode === 'tipicos' ? cfg.color : 'rgba(219,231,251,0.82)',
                background: mode === 'tipicos'
                  ? `linear-gradient(145deg, #ffffff 0%, ${cfg.light} 100%)`
                  : 'rgba(255,255,255,0.84)',
                boxShadow: mode === 'tipicos'
                  ? `0 0 0 2.5px ${cfg.color}24, 0 16px 38px ${cfg.color}16`
                  : '0 2px 8px rgba(37,99,235,0.04)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105"
                  style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                >
                  <Target size={22} />
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}24` }}>
                  Recurrente
                </span>
              </div>
              <h3 className="text-lg font-black" style={{ color: '#0f172a' }}>Típicos PAU</h3>
              <p className="mt-2 text-sm font-semibold leading-6" style={{ color: '#64748b' }}>
                Prioriza patrones habituales de examen: bloques clave, años mezclados y estructura equilibrada.
              </p>
            </button>

            <button
              onClick={() => setMode('personalizado')}
              className="group rounded-[24px] border p-5 text-left transition hover:-translate-y-0.5"
              style={{
                borderColor: mode === 'personalizado' ? cfg.color : 'rgba(219,231,251,0.82)',
                background: mode === 'personalizado'
                  ? `linear-gradient(145deg, #ffffff 0%, ${cfg.light} 100%)`
                  : 'rgba(255,255,255,0.84)',
                boxShadow: mode === 'personalizado'
                  ? `0 0 0 2.5px ${cfg.color}24, 0 16px 38px ${cfg.color}16`
                  : '0 2px 8px rgba(37,99,235,0.04)',
              }}
            >
              <div className="mb-4 flex items-center justify-between gap-4">
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-105"
                  style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}
                >
                  <Settings2 size={22} />
                </span>
                <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: '#f8fbff', color: '#64748b', border: '1px solid #dbe7fb' }}>
                  Ajustable
                </span>
              </div>
              <h3 className="text-lg font-black" style={{ color: '#0f172a' }}>Simulacro personalizado</h3>
              <p className="mt-2 text-sm font-semibold leading-6" style={{ color: '#64748b' }}>
                Elige el rango de años y, si la asignatura lo permite, la opción concreta que quieres entrenar.
              </p>
            </button>
          </div>
        </section>

        {/* Step 3: Personalization */}
        {mode === 'personalizado' ? (
          <section className="pau-reveal pau-reveal-delay-3">
            <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Paso 3 · Ajustes personalizados
            </p>
            <div className="grid gap-5 rounded-[26px] border bg-white/80 p-5 shadow-[0_18px_46px_rgba(37,99,235,0.06)] backdrop-blur-xl" style={{ borderColor: '#dbe7fb' }}>
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <ListChecks size={16} style={{ color: cfg.color }} />
                  <h3 className="text-sm font-black" style={{ color: '#0f172a' }}>Años de convocatoria</h3>
                </div>
                <div className="grid grid-cols-4 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
                  {YEAR_CHOICES.map(item => {
                    const isActive = yearChoice === item.id
                    return (
                      <button
                        key={item.id}
                        onClick={() => setYearChoice(item.id)}
                        className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                        style={{
                          borderColor: isActive ? cfg.color : '#dbe7fb',
                          background: isActive ? `${cfg.color}10` : '#f8fbff',
                          boxShadow: isActive ? `0 0 0 2px ${cfg.color}18` : 'none',
                        }}
                      >
                        <span className="block text-sm font-black" style={{ color: isActive ? cfg.color : '#0f172a' }}>{item.label}</span>
                        <span className="mt-1 block text-xs font-semibold leading-5" style={{ color: '#64748b' }}>{item.description}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {subject !== 'lengua' ? (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <Shuffle size={16} style={{ color: cfg.color }} />
                    <h3 className="text-sm font-black" style={{ color: '#0f172a' }}>Opciones del examen</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-3 max-md:grid-cols-1">
                    {OPTION_CHOICES.map(item => {
                      const isActive = optionChoice === item.id
                      return (
                        <button
                          key={item.id}
                          onClick={() => setOptionChoice(item.id)}
                          className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                          style={{
                            borderColor: isActive ? cfg.color : '#dbe7fb',
                            background: isActive ? `${cfg.color}10` : '#f8fbff',
                            boxShadow: isActive ? `0 0 0 2px ${cfg.color}18` : 'none',
                          }}
                        >
                          <span className="block text-sm font-black" style={{ color: isActive ? cfg.color : '#0f172a' }}>{item.label}</span>
                          <span className="mt-1 block text-xs font-semibold leading-5" style={{ color: '#64748b' }}>{item.description}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border p-4 text-sm font-semibold leading-6" style={{ borderColor: `${cfg.color}24`, background: `${cfg.color}0f`, color: '#475569' }}>
                  Lengua se genera como examen oficial coherente. Pausia elige automáticamente la versión compatible con el banco de ejercicios.
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="pau-reveal pau-reveal-delay-3">
            <div className="flex flex-wrap items-center gap-3 rounded-[24px] border p-5" style={{ background: `${cfg.color}0d`, borderColor: `${cfg.color}22` }}>
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: '#fff', color: cfg.color, boxShadow: '0 8px 20px rgba(15,23,42,0.06)' }}>
                <AutoInfoIcon size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-black" style={{ color: '#0f172a' }}>{autoInfo.title}</p>
                <p className="text-sm font-semibold leading-6" style={{ color: '#64748b' }}>
                  {autoInfo.description}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Summary */}
        <section className="pau-reveal pau-reveal-delay-3">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border bg-white/82 p-5 shadow-[0_16px_42px_rgba(37,99,235,0.06)]" style={{ borderColor: '#dbe7fb' }}>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Listo para crear</p>
              <p className="mt-1 text-base font-black" style={{ color: '#0f172a' }}>
                {cfg.label} · {buildConfigLabel(mode, mode === 'personalizado' ? yearChoice : 'all', effectiveOptionChoice(mode, subject, optionChoice))}
              </p>
            </div>
            <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: `${cfg.color}12`, color: cfg.color, border: `1px solid ${cfg.color}22` }}>
              {ccaa}
            </span>
          </div>
        </section>

        {/* Generate CTA */}
        <button
          onClick={createSimulacro}
          disabled={loading || !userId || !SUBJECTS[subject].available}
          className="campus-primary"
          style={{ width: '100%', borderRadius: 16, padding: '16px 24px', fontSize: 16, gap: 10 }}
        >
          {loading ? <PausiaLoadingDot /> : <PlayCircle size={20} />}
          {loading
            ? 'Generando simulacro...'
            : !SUBJECTS[subject].available
            ? `Simulacros de ${SUBJECTS[subject].short} próximamente`
            : userId
            ? ctaLabel(mode, cfg.short)
            : 'Cargando sesión...'}
        </button>
      </div>
    </SimulacroShell>
  )
}

function StatCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className="pausia-stitch-card rounded-2xl p-4"
      style={accent ? { background: 'linear-gradient(145deg, #eff6ff, #dbeafe)', borderColor: '#bfdbfe' } : undefined}
    >
      <p className="text-[11px] font-black uppercase tracking-wide" style={{ color: '#94a3b8' }}>{label}</p>
      <p className="mt-2 text-2xl font-black" style={{ color: '#0f172a' }}>{value}</p>
    </div>
  )
}

function buildStats(history: SimulacroRecord[]) {
  const completed = history.filter(item => item.estado === 'completado' && Number.isFinite(Number(item.nota_final)))
  const scores = completed.map(item => Number(item.nota_final))
  const times = completed.map(item => Number(item.tiempo_empleado)).filter(Number.isFinite)
  return {
    completedCount: completed.length,
    averageScore: average(scores),
    bestScore: scores.length ? Math.max(...scores) : 0,
    averageTime: Math.round(average(times)),
    lastCompleted: completed[0] ?? null
  }
}

function average(values: number[]) {
  if (!values.length) return 0
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

function formatScore(value: unknown) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '-'
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(value))
}

function yearChoiceToSelection(choice: YearChoice): 'all' | SimulacroDifficulty {
  if (choice === 'recent') return 'Difícil'
  if (choice === 'middle') return 'Media'
  if (choice === 'classic') return 'Fácil'
  return 'all'
}

function technicalDifficultyForYearChoice(choice: YearChoice): SimulacroDifficulty {
  if (choice === 'recent') return 'Difícil'
  if (choice === 'classic') return 'Fácil'
  return 'Media'
}

function buildConfigLabel(mode: SimulacroMode, yearChoice: YearChoice, optionChoice: OptionChoice) {
  if (mode === 'normal') return 'Normal · cualquier año · opciones mixtas'
  if (mode === 'errores') return 'Peores notas · ejercicios a remontar'
  if (mode === 'tipicos') return 'Típicos PAU · temas recurrentes'
  return `Personalizado · ${yearChoiceLabel(yearChoice)} · ${optionChoiceLabel(optionChoice)}`
}

function effectiveOptionChoice(mode: SimulacroMode, subject: SimulacroSubject, optionChoice: OptionChoice): OptionChoice {
  if (mode !== 'personalizado' || subject === 'lengua') return 'mixed'
  return optionChoice
}

function autoModeInfo(mode: SimulacroMode, weakCandidateCount: number) {
  if (mode === 'errores') {
    return {
      title: weakCandidateCount > 0 ? 'Repaso dirigido por tus notas' : 'Necesita correcciones previas',
      description: weakCandidateCount > 0
        ? `Pausia usará primero ${weakCandidateCount} ejercicio${weakCandidateCount === 1 ? '' : 's'} donde tu porcentaje fue más bajo y completará el examen si hace falta.`
        : 'Completa alguna corrección o simulacro de esta asignatura para que Pausia pueda detectar tus puntos débiles.'
    }
  }
  if (mode === 'tipicos') {
    return {
      title: 'Patrones habituales de PAU',
      description: 'Monta un examen con bloques recurrentes de la asignatura, años oficiales mezclados y opciones A/B cuando existan.'
    }
  }
  return {
    title: 'Configuración automática',
    description: 'Cualquier año oficial disponible, opciones A/B mezcladas cuando existan y bloques elegidos para parecerse a una PAU real.'
  }
}

function ctaLabel(mode: SimulacroMode, subjectShort: string) {
  if (mode === 'errores') return `Crear simulacro de errores de ${subjectShort}`
  if (mode === 'tipicos') return `Crear simulacro típico de ${subjectShort}`
  if (mode === 'personalizado') return `Crear simulacro personalizado de ${subjectShort}`
  return `Empezar simulacro normal de ${subjectShort}`
}

function yearChoiceLabel(choice: YearChoice) {
  const item = YEAR_CHOICES.find(entry => entry.id === choice)
  return item?.label.toLowerCase() ?? 'todos los años'
}

function optionChoiceLabel(choice: OptionChoice) {
  if (choice === 'mixed') return 'A/B automático'
  return `opción ${choice}`
}

function optionSummaryForRecord(record: SimulacroRecord) {
  const options = Array.from(new Set((record.bloques ?? []).map(block => block.option).filter(Boolean))).sort()
  if (options.length > 1) return 'Opciones A/B'
  if (options[0]) return `Opción ${options[0]}`
  return `Opción ${record.opcion}`
}

function buildWeakBlocks(
  history: SimulacroRecord[],
  examHistory: ExamHistoryRow[],
  subject: SimulacroSubject,
  ccaa: string
) {
  const scored = [
    ...weakBlocksFromSimulacros(history, subject, ccaa),
    ...weakBlocksFromCorrections(examHistory, subject, ccaa)
  ].sort((a, b) => a.score - b.score)

  const used = new Set<string>()
  const blocks: SimulacroBlock[] = []
  for (const item of scored) {
    const key = blockIdentity(item.block)
    if (used.has(key)) continue
    used.add(key)
    blocks.push(item.block)
    if (blocks.length === 4) break
  }
  return blocks
}

function weakBlocksFromSimulacros(history: SimulacroRecord[], subject: SimulacroSubject, ccaa: string) {
  return history
    .filter(record => record.estado === 'completado' && record.asignatura === subject && recordMatchesCommunity(record, ccaa))
    .flatMap(record => {
      const details = Array.isArray(record.resultado_json?.desglose_bloques) ? record.resultado_json.desglose_bloques : []
      return (record.bloques ?? []).map((block, index) => ({
        block: { ...block, numero: 0, comunidad: block.comunidad ?? record.comunidad ?? ccaa },
        score: scorePercent(details[index], block, record.nota_final)
      }))
    })
    .filter(item => Number.isFinite(item.score))
}

function weakBlocksFromCorrections(rows: ExamHistoryRow[], subject: SimulacroSubject, ccaa: string) {
  return rows
    .filter(row => rowMatchesSubject(row, subject))
    .map(row => {
      const max = Number(row.nota_maxima ?? 2.5)
      const score = Number(row.nota)
      const percent = Number.isFinite(score) && Number.isFinite(max) && max > 0 ? (score / max) * 100 : 100
      return {
        score: percent,
        block: {
          id: `historial-${row.id}`,
          numero: 0,
          tema: row.bloque || row.tipo || SUBJECTS[subject].label,
          year: Number(row.año ?? new Date().getFullYear()),
          convocatoria: row.tipo || 'Corrección previa',
          option: row.opcion === 'B' ? 'B' as SimulacroOption : 'A' as SimulacroOption,
          puntuacion: Number.isFinite(max) && max > 0 ? max : 2.5,
          enunciado: row.enunciado || 'Ejercicio recuperado de tu historial de correcciones.',
          criterios: undefined,
          comunidad: ccaa
        }
      }
    })
    .filter(item => Number.isFinite(item.score))
}

function mergeBlocksForExam(primary: SimulacroBlock[], fallback: SimulacroBlock[], ccaa: string) {
  const used = new Set<string>()
  const selected: SimulacroBlock[] = []
  for (const block of [...primary, ...fallback]) {
    const key = blockIdentity(block)
    if (used.has(key)) continue
    used.add(key)
    selected.push({ ...block, numero: selected.length + 1, comunidad: block.comunidad ?? ccaa })
    if (selected.length === 4) break
  }
  return selected
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function scorePercent(detail: any, block: SimulacroBlock, fallbackScore?: number | null) {
  const directPercent = Number(detail?.porcentaje_logrado ?? detail?.porcentaje)
  if (Number.isFinite(directPercent)) return directPercent
  const max = Number(detail?.puntos_maximos ?? block.puntuacion)
  const score = Number(detail?.puntos_conseguidos ?? detail?.nota)
  if (Number.isFinite(score) && Number.isFinite(max) && max > 0) return (score / max) * 100
  const fallback = Number(fallbackScore)
  return Number.isFinite(fallback) ? fallback * 10 : 100
}

function rowMatchesSubject(row: ExamHistoryRow, subject: SimulacroSubject) {
  const value = String(row.asignatura ?? '').toLowerCase()
  if (subject === 'mates') return value === 'mates' || value === 'matematicas' || value === 'matemáticas'
  return value === subject
}

function recordMatchesCommunity(record: SimulacroRecord, ccaa: string) {
  const community = record.comunidad ?? record.bloques?.[0]?.comunidad
  return !community || community === ccaa
}

function blockIdentity(block: SimulacroBlock) {
  const statement = (block.enunciado || '').replace(/\s+/g, ' ').trim().slice(0, 160)
  if (statement) return `${block.year || ''}:${statement}`
  return `${block.id || ''}:${block.year || ''}:${block.tema || ''}`
}
