'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, PlayCircle } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import SimulacroShell from '@/components/simulacros/SimulacroShell'
import { DIFFICULTIES, SUBJECTS, generateSimulacro } from '@/components/simulacros/data'
import type { SimulacroDifficulty, SimulacroOption, SimulacroRecord, SimulacroSubject } from '@/components/simulacros/types'

export default function SimulacrosPage() {
  const [userId, setUserId] = useState('')
  const [subject, setSubject] = useState<SimulacroSubject>('mates')
  const [difficulty, setDifficulty] = useState<SimulacroDifficulty>('Media')
  const [option, setOption] = useState<SimulacroOption>('A')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState<SimulacroRecord[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

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
      .limit(20)
    setHistory((data ?? []) as SimulacroRecord[])
  }

  async function createSimulacro() {
    setLoading(true)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const currentUserId = sessionData.session?.user?.id
    if (sessionError || !currentUserId) {
      console.error('SIMULACRO_SESSION_ERROR', sessionError)
      setLoading(false)
      router.push('/login')
      return
    }
    setUserId(currentUserId)

    const generated = generateSimulacro(subject, difficulty, option)
    const now = new Date().toISOString()
    const row = {
      id: generated.id,
      user_id: currentUserId,
      asignatura: subject,
      opcion: option,
      dificultad: difficulty,
      dificultad_real: generated.dificultadReal,
      bloques: generated.blocks,
      respuestas_parciales: {},
      estado: 'en_progreso',
      created_at: now,
      updated_at: now
    }
    console.log('SIMULACRO_INSERT_ROW', row)
    const { error } = await supabase.from('historial_simulacros').insert(row)
    if (error) {
      console.error('SIMULACRO_INSERT_ERROR', error)
      alert('No se pudo crear el simulacro. Revisa que la tabla historial_simulacros exista en Supabase.')
      setLoading(false)
      return
    }
    router.push(`/simulacros/${generated.id}`)
  }

  return (
    <SimulacroShell
      title="Simulacros"
      subtitle="Ponte a prueba en condiciones reales"
      actions={<button onClick={() => { setHistoryOpen(!historyOpen); void loadHistory() }} className="flex items-center gap-2 rounded-2xl border border-[#dbe7fb] bg-white/90 px-4 py-2 text-sm font-black text-slate-700 shadow-[0_12px_28px_rgba(37,99,235,0.08)] transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"><Eye size={16} />Ver mis simulacros</button>}
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        {historyOpen && (
          <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_22px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
            <h2 className="mb-4 text-lg font-black">Mis simulacros anteriores</h2>
            <div className="grid gap-2">
              {history.length === 0 && <p className="text-sm font-semibold text-slate-500">Todavía no tienes simulacros guardados.</p>}
              {history.map(item => (
                <a key={item.id} href={item.estado === 'completado' ? `/simulacros/${item.id}/results` : `/simulacros/${item.id}`} className="flex items-center justify-between rounded-2xl border border-[#dbe7fb] bg-[#f8fbff] p-3 no-underline transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50">
                  <div>
                    <strong className="block text-sm text-slate-900">{SUBJECTS[item.asignatura]?.label ?? item.asignatura} · {item.dificultad}</strong>
                    <small className="text-slate-500">{item.id.slice(0, 8)} · {item.estado === 'completado' ? `Nota ${item.nota_final ?? '-'}/10` : 'En progreso'}</small>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600">{item.opcion}</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_22px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 1 · Asignatura</p>
          <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {(Object.keys(SUBJECTS) as SimulacroSubject[]).map(key => {
              const cfg = SUBJECTS[key]
              const Icon = cfg.icon
              return (
                <button key={key} onClick={() => setSubject(key)} className="relative overflow-hidden rounded-3xl border p-5 text-left transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(37,99,235,0.12)]" style={{ borderColor: subject === key ? cfg.color : '#dbe7fb', background: subject === key ? `linear-gradient(145deg,#ffffff,${cfg.light})` : '#fff', boxShadow: subject === key ? `0 0 0 2px ${cfg.color}22, 0 18px 44px ${cfg.color}1f` : undefined }}>
                  <Icon size={92} className="pointer-events-none absolute -bottom-5 -right-4 opacity-10" style={{ color: cfg.color }} />
                  <div className="relative mb-4 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm" style={{ background: cfg.light, color: cfg.color }}><Icon size={24} /></div>
                  <h3 className="relative font-black">{cfg.label}</h3>
                  <p className="relative text-sm font-semibold text-slate-500">Simulacro oficial mezclado</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_22px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 2 · Dificultad</p>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {DIFFICULTIES.map(item => (
              <button key={item.id} onClick={() => setDifficulty(item.id)} className={`rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50 ${difficulty === item.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-100' : 'border-[#dbe7fb] bg-white'}`}>
                <h3 className="font-black">{item.label}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-6 shadow-[0_22px_60px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 3 · Opción</p>
          <div className="flex gap-3">
            {(['A', 'B'] as SimulacroOption[]).map(item => (
              <button key={item} onClick={() => setOption(item)} className={`h-12 w-14 rounded-2xl text-lg font-black transition hover:-translate-y-0.5 ${option === item ? 'bg-blue-600 text-white shadow-[0_16px_30px_rgba(37,99,235,0.22)]' : 'border border-[#dbe7fb] bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}`}>{item}</button>
            ))}
          </div>
        </section>

        <button onClick={createSimulacro} disabled={loading || !userId} className="flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 px-6 py-4 text-lg font-black text-white shadow-[0_20px_45px_rgba(37,99,235,0.24)] transition hover:-translate-y-1 hover:shadow-[0_26px_58px_rgba(37,99,235,0.3)] disabled:opacity-60">
          <PlayCircle size={22} />{loading ? 'Generando...' : userId ? 'Generar simulacro' : 'Cargando sesión...'}
        </button>
      </div>
    </SimulacroShell>
  )
}
