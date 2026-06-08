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
      actions={<button onClick={() => { setHistoryOpen(!historyOpen); void loadHistory() }} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"><Eye size={16} />Ver mis simulacros</button>}
    >
      <div className="mx-auto grid max-w-6xl gap-6">
        {historyOpen && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-black">Mis simulacros anteriores</h2>
            <div className="grid gap-2">
              {history.length === 0 && <p className="text-sm font-semibold text-slate-500">Todavía no tienes simulacros guardados.</p>}
              {history.map(item => (
                <a key={item.id} href={item.estado === 'completado' ? `/simulacros/${item.id}/results` : `/simulacros/${item.id}`} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 no-underline">
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

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 1 · Asignatura</p>
          <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-sm:grid-cols-1">
            {(Object.keys(SUBJECTS) as SimulacroSubject[]).map(key => {
              const cfg = SUBJECTS[key]
              const Icon = cfg.icon
              return (
                <button key={key} onClick={() => setSubject(key)} className={`rounded-xl border p-5 text-left transition ${subject === key ? 'shadow-lg' : 'hover:shadow-md'}`} style={{ borderColor: subject === key ? cfg.color : '#e2e8f0', background: subject === key ? cfg.light : '#fff', boxShadow: subject === key ? `0 0 0 2px ${cfg.color}` : undefined }}>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: cfg.light, color: cfg.color }}><Icon size={24} /></div>
                  <h3 className="font-black">{cfg.label}</h3>
                  <p className="text-sm font-semibold text-slate-500">Simulacro oficial mezclado</p>
                </button>
              )
            })}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 2 · Dificultad</p>
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            {DIFFICULTIES.map(item => (
              <button key={item.id} onClick={() => setDifficulty(item.id)} className={`rounded-xl border p-5 text-left ${difficulty === item.id ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200' : 'border-slate-200 bg-white'}`}>
                <h3 className="font-black">{item.label}</h3>
                <p className="mt-1 text-sm font-semibold text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">Paso 3 · Opción</p>
          <div className="flex gap-3">
            {(['A', 'B'] as SimulacroOption[]).map(item => (
              <button key={item} onClick={() => setOption(item)} className={`h-12 w-14 rounded-xl text-lg font-black ${option === item ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-white text-slate-700'}`}>{item}</button>
            ))}
          </div>
        </section>

        <button onClick={createSimulacro} disabled={loading || !userId} className="flex items-center justify-center gap-3 rounded-xl bg-violet-600 px-6 py-4 text-lg font-black text-white shadow-xl disabled:opacity-60">
          <PlayCircle size={22} />{loading ? 'Generando...' : userId ? 'Generar simulacro' : 'Cargando sesión...'}
        </button>
      </div>
    </SimulacroShell>
  )
}
