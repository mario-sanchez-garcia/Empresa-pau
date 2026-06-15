'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, PlayCircle } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { DIFFICULTIES, SUBJECTS, generateSimulacro } from '@/components/simulacros/data'
import type { SimulacroDifficulty, SimulacroOption, SimulacroRecord, SimulacroSubject } from '@/components/simulacros/types'
import { useCCAA } from '@/app/hooks/useCCAA'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'

export default function SimulacrosPage() {
  const [userId, setUserId] = useState('')
  const [subject, setSubject] = useState<SimulacroSubject>('mates')
  const [difficulty, setDifficulty] = useState<SimulacroDifficulty>('Media')
  const [option, setOption] = useState<SimulacroOption>('A')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<SimulacroRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()
  const { ccaa } = useCCAA()
  const stats = useMemo(() => buildStats(history), [history])

  useEffect(() => {
    setDifficulty('Media')
    setOption('A')
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
    const { data } = await supabase
      .from('historial_simulacros')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(100)
    setHistory((data ?? []) as SimulacroRecord[])
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

      const effectiveOption: SimulacroOption = subject === 'lengua' ? 'A' : option
      const generated = generateSimulacro(subject, difficulty, effectiveOption, ccaa)
      if (!generated) {
        setErrorMessage('No hay suficientes ejercicios disponibles para crear este simulacro.')
        setLoading(false)
        return
      }
      const now = new Date().toISOString()
      const row = {
        id: generated.id,
        user_id: currentUserId,
        asignatura: subject,
        opcion: effectiveOption,
        dificultad: difficulty,
        dificultad_real: generated.dificultadReal,
        bloques: generated.blocks,
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
      router.push(`/simulacros/${generated.id}`)
    } catch (error) {
      console.error('SIMULACRO_CREATE_ERROR', error)
      setErrorMessage('No se pudo crear el simulacro ahora mismo. Inténtalo de nuevo en unos segundos.')
      setLoading(false)
    }
  }

  const cfg = SUBJECTS[subject]

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
                        {SUBJECTS[item.asignatura]?.label ?? item.asignatura} · {item.dificultad}
                      </strong>
                      <small style={{ color: '#94a3b8' }}>
                        {item.id.slice(0, 8)} · {item.estado === 'completado' ? `Nota ${item.nota_final ?? '-'}/10` : 'En progreso'}
                      </small>
                    </div>
                    <div className="ml-3 flex shrink-0 items-center gap-2">
                      {item.estado === 'completado' ? (
                        <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#f0fdf4', color: '#15803d' }}>✓ Completado</span>
                      ) : (
                        <span className="rounded-full px-2 py-0.5 text-xs font-black" style={{ background: '#fffbeb', color: '#b45309' }}>En progreso</span>
                      )}
                      <span className="rounded-full px-3 py-1 text-xs font-black" style={{ background: '#f1f5f9', color: '#475569' }}>{item.opcion}</span>
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

        {/* Step 2: Difficulty */}
        <section className="pau-reveal pau-reveal-delay-2">
          <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
            Paso 2 · Dificultad
          </p>
          <div className="pau-stagger grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {DIFFICULTIES.map((item, idx) => {
              const isActive = difficulty === item.id
              const bars = idx + 1
              return (
                <button
                  key={item.id}
                  onClick={() => setDifficulty(item.id)}
                  className="rounded-2xl border p-5 text-left transition hover:-translate-y-0.5"
                  style={{
                    borderColor: isActive ? '#2563eb' : 'rgba(219,231,251,0.82)',
                    background: isActive
                      ? 'linear-gradient(145deg, #eff6ff, #dbeafe)'
                      : 'rgba(255,255,255,0.82)',
                    boxShadow: isActive
                      ? '0 0 0 2.5px rgba(37,99,235,0.18), 0 12px 28px rgba(37,99,235,0.1)'
                      : '0 2px 8px rgba(37,99,235,0.04)',
                    cursor: 'pointer',
                  }}
                >
                  <div className="mb-3 flex items-center gap-1.5">
                    {[1, 2, 3].map(n => (
                      <div
                        key={n}
                        className="h-1.5 rounded-full transition"
                        style={{
                          width: 28,
                          background: n <= bars
                            ? isActive ? '#2563eb' : '#94a3b8'
                            : '#e2e8f0',
                        }}
                      />
                    ))}
                  </div>
                  <h3 className="font-black" style={{ color: '#0f172a' }}>{item.label}</h3>
                  <p className="mt-1 text-xs font-semibold" style={{ color: '#94a3b8' }}>{item.description}</p>
                </button>
              )
            })}
          </div>
        </section>

        {/* Step 3: Option */}
        {subject !== 'lengua' && (
          <section className="pau-reveal pau-reveal-delay-3">
            <p className="mb-4 text-[11px] font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>
              Paso 3 · Opción de examen
            </p>
            <div className="flex gap-3">
              {(['A', 'B'] as SimulacroOption[]).map(item => (
                <button
                  key={item}
                  onClick={() => setOption(item)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-black transition"
                  style={{
                    background: option === item ? '#2563eb' : 'rgba(255,255,255,0.82)',
                    color: option === item ? '#fff' : '#334155',
                    border: `1.5px solid ${option === item ? '#2563eb' : 'rgba(219,231,251,0.82)'}`,
                    boxShadow: option === item
                      ? '0 0 0 2.5px rgba(37,99,235,0.18), 0 10px 28px rgba(37,99,235,0.22)'
                      : '0 2px 8px rgba(37,99,235,0.04)',
                    transform: option === item ? 'translateY(-2px)' : 'none',
                    transition: 'all 200ms var(--ease-out)',
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        )}

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
            ? `Generar simulacro de ${cfg.short}`
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

function formatScore(value: any) {
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(2).replace(/\.00$/, '') : '-'
}

function formatDate(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' }).format(new Date(value))
}
