'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bot, CalendarDays, Check, Clock3, GraduationCap, PenLine, RefreshCw, Rocket } from 'lucide-react'

const config = { bg: '#1e40af', light: '#fff7ed', accent: '#f59e0b', coral: '#fb7185', ink: '#172033' }

const ASIGNATURAS = ['Matematicas II', 'Fisica', 'Quimica', 'Historia de Espana', 'Lengua', 'Ingles', 'Biologia', 'Geografia', 'Historia del Arte', 'Latin']

export default function Planning() {
  const [usuario, setUsuario] = useState<any>(null)
  const [perfil, setPerfil] = useState<any>(null)
  const [planning, setPlanning] = useState<any[]>([])
  const [tareasCompletadas, setTareasCompletadas] = useState<string[]>([])
  const [cargando, setCargando] = useState(true)
  const [generando, setGenerando] = useState(false)
  const [paso, setPaso] = useState<'onboarding'|'planning'>('onboarding')
  const [fechaExamen, setFechaExamen] = useState('')
  const [horasDia, setHorasDia] = useState(2)
  const [notaObjetivo, setNotaObjetivo] = useState(10)
  const [asignaturasFlo, setAsignaturasFlo] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUsuario(data.user)
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single()
      if (p) {
        setPerfil(p)
        setPaso('planning')
        await cargarTareasYPlanning(p, data.user.id)
      }
      setCargando(false)
    })
  }, [])

  async function cargarTareasYPlanning(p: any, userId: string) {
    const { data: tareas } = await supabase
      .from('tareas_completadas')
      .select('*')
      .eq('user_id', userId)
    
    const completadas = tareas?.filter(t => t.completada).map(t => t.id) ?? []
    setTareasCompletadas(completadas)
    
    const tareasIncompletas = tareas?.filter(t => !t.completada && esDiaAnterior(t.dia)) ?? []
    
    await generarPlanning(p, userId, tareasIncompletas)
  }

  function esDiaAnterior(diaStr: string) {
    try {
      const hoy = new Date()
      hoy.setHours(0,0,0,0)
      const partes = diaStr.split(' ')
      if (partes.length < 2) return false
      const meses: any = { 'Ene':0,'Feb':1,'Mar':2,'Abr':3,'May':4,'Jun':5,'Jul':6,'Ago':7,'Sep':8,'Oct':9,'Nov':10,'Dic':11 }
      const mes = meses[partes[2]] ?? new Date().getMonth()
      const dia = parseInt(partes[1])
      const fecha = new Date(new Date().getFullYear(), mes, dia)
      return fecha < hoy
    } catch { return false }
  }

  async function generarPlanning(p: any, userId: string, tareasAtrasadas: any[] = []) {
    setGenerando(true)
    const { data: prog } = await supabase.from('progreso').select('*').eq('user_id', userId)
    const hoy = new Date()
    const examen = new Date(p.fecha_examen)
    const diasRestantes = Math.ceil((examen.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    const atrasadasTexto = tareasAtrasadas.length > 0
      ? `IMPORTANTE: El estudiante no completó estas tareas del día anterior y hay que redistribuirlas: ${tareasAtrasadas.map((t: any) => `${t.asignatura} - ${t.descripcion}`).join(', ')}. Incluye estas tareas pendientes en los próximos días.`
      : ''

    const res = await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `Eres un planificador de estudio para la EBAU de Madrid.
El estudiante tiene ${diasRestantes} días hasta el examen.
Puede estudiar ${p.horas_dia} horas al día.
Su nota objetivo es ${p.nota_objetivo} sobre 14.
Asignaturas que lleva peor: ${p.asignaturas_flojas?.join(', ') || 'ninguna indicada'}.
Progreso reciente: ${prog?.length ? prog.slice(-10).map((x: any) => `${x.asignatura} ${x.bloque}: ${x.nota}/10`).join(', ') : 'sin datos aún'}.
${atrasadasTexto}

Genera un plan de estudio para los próximos 7 días en formato JSON.
Responde SOLO con un array JSON válido, sin texto adicional, sin bloques de código markdown.
Usa exactamente esta estructura:
[{"dia": "Lun 9 Jun", "tareas": [{"id": "t1", "asignatura": "Matematicas II", "bloque": "Algebra", "descripcion": "Resolver 2 ejercicios de matrices", "duracion": 60}]}]
Máximo 3 tareas por día. Adapta la carga a las horas disponibles (${p.horas_dia}h = ${p.horas_dia * 60} min/día). Prioriza las asignaturas flojas.`
      })
    })
    const data = await res.json()
    try {
      const texto = data.respuesta.trim().replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(texto)
      setPlanning(parsed)
      await guardarTareasEnSupabase(parsed, userId)
    } catch {
      setPlanning([])
    }
    setGenerando(false)
  }

  async function guardarTareasEnSupabase(plan: any[], userId: string) {
    await supabase.from('tareas_completadas').delete().eq('user_id', userId).eq('completada', false)
    const tareas = plan.flatMap((dia: any) =>
      dia.tareas.map((t: any) => ({
        user_id: userId,
        dia: dia.dia,
        asignatura: t.asignatura,
        bloque: t.bloque,
        descripcion: t.descripcion,
        completada: false
      }))
    )
    if (tareas.length > 0) await supabase.from('tareas_completadas').insert(tareas)
  }

  async function marcarCompletada(diaIdx: number, tareaIdx: number) {
    const tarea = planning[diaIdx].tareas[tareaIdx]
    const { data: rows } = await supabase
      .from('tareas_completadas')
      .select('id')
      .eq('user_id', usuario.id)
      .eq('dia', planning[diaIdx].dia)
      .eq('descripcion', tarea.descripcion)
      .single()
    
    if (rows?.id) {
      await supabase.from('tareas_completadas').update({ completada: true }).eq('id', rows.id)
      setTareasCompletadas(prev => [...prev, rows.id])
    }

    const nuevoPlan = [...planning]
    nuevoPlan[diaIdx].tareas[tareaIdx].completada = true
    setPlanning(nuevoPlan)
  }

  async function guardarPerfil() {
    if (!fechaExamen || asignaturasFlo.length === 0) return
    setCargando(true)
    const { data } = await supabase.auth.getUser()
    const userId = data.user?.id
    await supabase.from('perfiles').upsert({
      id: userId,
      fecha_examen: fechaExamen,
      horas_dia: horasDia,
      nota_objetivo: notaObjetivo,
      asignaturas_flojas: asignaturasFlo
    })
    const p = { fecha_examen: fechaExamen, horas_dia: horasDia, nota_objetivo: notaObjetivo, asignaturas_flojas: asignaturasFlo }
    setPerfil(p)
    setPaso('planning')
    await generarPlanning(p, userId!, [])
    setCargando(false)
  }

  function toggleAsignatura(a: string) {
    setAsignaturasFlo(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const totalTareas = planning.reduce((acc, dia) => acc + (dia.tareas?.length ?? 0), 0)
  const completadasHoy = planning.reduce((acc, dia) => acc + (dia.tareas?.filter((t: any) => t.completada)?.length ?? 0), 0)
  const porcentaje = totalTareas > 0 ? Math.round((completadasHoy / totalTareas) * 100) : 0

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fff8f1 0%, #fff7ed 45%, #eff6ff 100%)' }}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 22, background: 'linear-gradient(145deg, #f59e0b, #fb7185 55%, #2563eb)', color: '#fff', boxShadow: '0 18px 38px rgba(245,158,11,0.25)' }}><Rocket size={28} /></div>
        <p style={{ color: '#7c6f64', fontWeight: 700 }}>Cargando tu planning...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #fff8f1 0%, #fff7ed 45%, #eff6ff 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <header className="px-6 py-4" style={{ background: 'rgba(255, 253, 249, 0.78)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(242, 228, 212, 0.9)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f59e0b, #fb7185 48%, #2563eb)', color: '#fff', boxShadow: '0 16px 34px rgba(245,158,11,0.25)' }}><GraduationCap size={23} /></div>
            <div>
              <div className="font-bold text-xl leading-none" style={{ color: config.ink }}>Pausia</div>
              <div className="text-xs mt-1" style={{ color: '#8a7663' }}>EBAU Madrid · planning que se puede cumplir</div>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2" style={{ background: '#fffdf9', color: '#1e40af', border: '1px solid #f2e4d4', boxShadow: '0 10px 24px rgba(92,64,35,0.06)' }}><ArrowLeft size={14} />Exámenes</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {paso === 'onboarding' && (
          <div className="rounded-3xl p-8" style={{ background: 'rgba(255, 253, 249, 0.94)', border: '1px solid #f2e4d4', boxShadow: '0 24px 70px rgba(92, 64, 35, 0.12)', backdropFilter: 'blur(18px)' }}>
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 62, height: 62, borderRadius: 24, background: 'linear-gradient(145deg, #f59e0b, #fb7185 52%, #2563eb)', color: '#fff', boxShadow: '0 18px 42px rgba(245, 158, 11, 0.28)' }}><CalendarDays size={30} /></div>
              <h1 className="text-2xl font-bold" style={{ color: config.ink }}>Tu plan de estudio personalizado</h1>
              <p className="text-sm mt-2" style={{ color: '#7c6f64' }}>Dinos tres cosas y Pausia te monta un plan día a día</p>
            </div>

            <div className="flex flex-col gap-6 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>¿Cuándo es tu examen?</label>
                <input type="date" value={fechaExamen} onChange={e => setFechaExamen(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
                  style={{ border: '1.5px solid #f2e4d4', background: '#fffaf5', color: config.ink, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)' }} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>
                  ¿Cuántas horas puedes estudiar al día? <span className="font-bold" style={{ color: config.accent }}>{horasDia}h</span>
                </label>
                <input type="range" min={1} max={8} value={horasDia} onChange={e => setHorasDia(Number(e.target.value))} className="w-full" style={{ accentColor: config.accent }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#a5917d' }}><span>1h</span><span>4h</span><span>8h</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>
                  ¿Qué nota quieres sacar? <span className="font-bold" style={{ color: config.accent }}>{notaObjetivo}/14</span>
                </label>
                <input type="range" min={5} max={14} step={0.5} value={notaObjetivo} onChange={e => setNotaObjetivo(Number(e.target.value))} className="w-full" style={{ accentColor: config.accent }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#a5917d' }}><span>5</span><span>9.5</span><span>14</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>¿Qué asignaturas llevas peor?</label>
                <div className="flex flex-wrap gap-2">
                  {ASIGNATURAS.map(a => (
                    <button key={a} onClick={() => toggleAsignatura(a)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold"
                      style={asignaturasFlo.includes(a)
                        ? { background: 'linear-gradient(135deg, #2563eb, #f59e0b)', color: '#fff', boxShadow: '0 10px 22px rgba(37,99,235,0.16)' }
                        : { background: '#fffaf5', color: '#7c6f64', border: '1px solid #f2e4d4' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={guardarPerfil} disabled={!fechaExamen || asignaturasFlo.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #2563eb, #f59e0b)', boxShadow: '0 18px 40px rgba(245, 158, 11, 0.22)' }}>
                <Rocket size={19} /> Generar mi plan
              </button>
            </div>
          </div>
        )}

        {paso === 'planning' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: config.ink }}>Tu plan de esta semana</h1>
                <p className="text-sm mt-1" style={{ color: '#7c6f64' }}>
                  Objetivo: {perfil?.nota_objetivo}/14 · {perfil?.horas_dia}h/día · Examen: {perfil?.fecha_examen ? new Date(perfil.fecha_examen).toLocaleDateString('es-ES') : ''}
                </p>
              </div>
              <button onClick={() => setPaso('onboarding')}
                className="text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2"
                style={{ background: '#fffdf9', color: '#1e40af', border: '1px solid #f2e4d4', boxShadow: '0 10px 24px rgba(92,64,35,0.06)' }}>
                <PenLine size={14} /> Editar perfil
              </button>
            </div>

            {totalTareas > 0 && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255, 253, 249, 0.94)', border: '1px solid #f2e4d4', boxShadow: '0 18px 45px rgba(92,64,35,0.08)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: config.ink }}>Progreso semanal</span>
                  <span className="text-sm font-bold" style={{ color: config.accent }}>{completadasHoy}/{totalTareas} tareas · {porcentaje}%</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: '#f4e5d6' }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #f59e0b, #fb7185, #2563eb)' }}></div>
                </div>
              </div>
            )}

            {generando ? (
              <div className="rounded-3xl p-12 text-center" style={{ background: 'rgba(255, 253, 249, 0.94)', border: '1px solid #f2e4d4', boxShadow: '0 22px 55px rgba(92,64,35,0.1)' }}>
                <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 22, background: '#fff7ed', color: config.accent, border: '1px solid #fed7aa' }}><Bot size={28} /></div>
                <p className="font-semibold" style={{ color: config.ink }}>Pausia está montando tu plan...</p>
                <p className="text-sm mt-2" style={{ color: '#a5917d' }}>Analizando tu progreso y redistribuyendo tareas pendientes</p>
              </div>
            ) : planning.length > 0 ? (
              <div className="grid gap-4">
                {planning.map((dia: any, i: number) => {
                  const completadasDia = dia.tareas?.filter((t: any) => t.completada)?.length ?? 0
                  const totalDia = dia.tareas?.length ?? 0
                  return (
                    <div key={i} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255, 253, 249, 0.95)', border: '1px solid #f2e4d4', boxShadow: '0 18px 45px rgba(92,64,35,0.08)' }}>
                      <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #fff7ed, #eff6ff)', borderBottom: `2px solid ${config.accent}` }}>
                        <span className="font-bold text-sm flex items-center gap-2" style={{ color: config.ink }}><CalendarDays size={15} color={config.accent} /> {dia.dia}</span>
                        <span className="text-xs" style={{ color: '#7c6f64' }}>{completadasDia}/{totalDia} completadas</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {dia.tareas?.map((tarea: any, j: number) => (
                          <div key={j} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: tarea.completada ? '#f0fdf4' : '#fffaf5', border: `1px solid ${tarea.completada ? '#bbf7d0' : '#f2e4d4'}` }}>
                            <button onClick={() => !tarea.completada && marcarCompletada(i, j)}
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs"
                              style={{ background: tarea.completada ? '#22c55e' : '#fffdf9', border: `2px solid ${tarea.completada ? '#22c55e' : '#e7c9ad'}`, color: '#fff' }}>
                              {tarea.completada ? <Check size={14} /> : ''}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#eff6ff', color: '#1e40af' }}>{tarea.asignatura}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fff7ed', color: '#9a5b00', border: '1px solid #fed7aa' }}>{tarea.bloque}</span>
                                <span className="text-xs flex items-center gap-1" style={{ color: '#a5917d' }}><Clock3 size={13} /> {tarea.duracion} min</span>
                              </div>
                              <p className="text-sm" style={{ color: tarea.completada ? '#7c6f64' : config.ink, textDecoration: tarea.completada ? 'line-through' : 'none' }}>
                                {tarea.descripcion}
                              </p>
                            </div>
                            {!tarea.completada && (
                              <button onClick={() => router.push('/')}
                                className="text-xs px-3 py-1.5 rounded-full font-bold flex-shrink-0 flex items-center gap-1.5"
                                style={{ background: 'linear-gradient(135deg, #2563eb, #f59e0b)', color: '#fff', boxShadow: '0 10px 22px rgba(37,99,235,0.16)' }}>
                                Practicar <ArrowUpRight size={13} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => cargarTareasYPlanning(perfil, usuario?.id)}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#fffdf9', color: '#1e40af', border: '1px solid #f2e4d4', boxShadow: '0 12px 28px rgba(92,64,35,0.06)' }}>
                  <RefreshCw size={15} /> Recalcular plan
                </button>
              </div>
            ) : (
              <div className="rounded-3xl p-12 text-center" style={{ background: 'rgba(255, 253, 249, 0.94)', border: '1px solid #f2e4d4', boxShadow: '0 22px 55px rgba(92,64,35,0.1)' }}>
                <p style={{ color: '#7c6f64' }}>No se pudo generar el plan. Intenta de nuevo.</p>
                <button onClick={() => generarPlanning(perfil, usuario?.id, [])} className="mt-4 px-6 py-2 rounded-xl font-semibold text-white" style={{ background: 'linear-gradient(135deg, #2563eb, #f59e0b)' }}>
                  Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
