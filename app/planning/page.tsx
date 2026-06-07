'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'

const config = { bg: '#1e3a5f', light: '#dbeafe', accent: '#3b82f6' }

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
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4f8' }}>
      <div className="text-center">
        <div className="text-4xl mb-4">📅</div>
        <p style={{ color: '#6b7280' }}>Cargando tu planning...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#f0f4f8', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ background: config.bg }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>P</div>
            <div>
              <div className="font-bold text-white text-xl leading-none">Pausia</div>
              <div className="text-xs mt-1" style={{ color: '#93c5fd' }}>Tu academia IA para la EBAU</div>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>← Exámenes</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {paso === 'onboarding' && (
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #e5e7eb' }}>
            <div className="text-center mb-8">
              <div className="text-5xl mb-4">📅</div>
              <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Tu plan de estudio personalizado</h1>
              <p className="text-sm mt-2" style={{ color: '#6b7280' }}>Dinos tres cosas y la IA genera tu plan día a día</p>
            </div>

            <div className="flex flex-col gap-6 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>¿Cuándo es tu examen?</label>
                <input type="date" value={fechaExamen} onChange={e => setFechaExamen(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
                  style={{ border: '1.5px solid #e5e7eb', background: '#fafafa' }} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  ¿Cuántas horas puedes estudiar al día? <span className="font-bold" style={{ color: config.accent }}>{horasDia}h</span>
                </label>
                <input type="range" min={1} max={8} value={horasDia} onChange={e => setHorasDia(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}><span>1h</span><span>4h</span><span>8h</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>
                  ¿Qué nota quieres sacar? <span className="font-bold" style={{ color: config.accent }}>{notaObjetivo}/14</span>
                </label>
                <input type="range" min={5} max={14} step={0.5} value={notaObjetivo} onChange={e => setNotaObjetivo(Number(e.target.value))} className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}><span>5</span><span>9.5</span><span>14</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>¿Qué asignaturas llevas peor?</label>
                <div className="flex flex-wrap gap-2">
                  {ASIGNATURAS.map(a => (
                    <button key={a} onClick={() => toggleAsignatura(a)}
                      className="px-3 py-1.5 rounded-xl text-xs font-medium"
                      style={asignaturasFlo.includes(a)
                        ? { background: config.bg, color: '#fff' }
                        : { background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={guardarPerfil} disabled={!fechaExamen || asignaturasFlo.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-white text-lg disabled:opacity-40"
                style={{ background: config.bg }}>
                🚀 Generar mi plan con IA
              </button>
            </div>
          </div>
        )}

        {paso === 'planning' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Tu plan de esta semana</h1>
                <p className="text-sm mt-1" style={{ color: '#6b7280' }}>
                  Objetivo: {perfil?.nota_objetivo}/14 · {perfil?.horas_dia}h/día · Examen: {perfil?.fecha_examen ? new Date(perfil.fecha_examen).toLocaleDateString('es-ES') : ''}
                </p>
              </div>
              <button onClick={() => setPaso('onboarding')}
                className="text-xs px-4 py-2 rounded-xl font-medium"
                style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                ✏️ Editar perfil
              </button>
            </div>

            {totalTareas > 0 && (
              <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid #e5e7eb' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: '#374151' }}>Progreso semanal</span>
                  <span className="text-sm font-bold" style={{ color: config.accent }}>{completadasHoy}/{totalTareas} tareas · {porcentaje}%</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: '#e5e7eb' }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${porcentaje}%`, background: config.accent }}></div>
                </div>
              </div>
            )}

            {generando ? (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
                <div className="text-4xl mb-4">🤖</div>
                <p className="font-semibold" style={{ color: '#1e3a5f' }}>La IA está generando tu plan...</p>
                <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>Analizando tu progreso y redistribuyendo tareas pendientes</p>
              </div>
            ) : planning.length > 0 ? (
              <div className="grid gap-4">
                {planning.map((dia: any, i: number) => {
                  const completadasDia = dia.tareas?.filter((t: any) => t.completada)?.length ?? 0
                  const totalDia = dia.tareas?.length ?? 0
                  return (
                    <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                      <div className="px-5 py-3 flex items-center justify-between" style={{ background: config.light, borderBottom: `2px solid ${config.accent}` }}>
                        <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>📅 {dia.dia}</span>
                        <span className="text-xs" style={{ color: '#6b7280' }}>{completadasDia}/{totalDia} completadas</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {dia.tareas?.map((tarea: any, j: number) => (
                          <div key={j} className="flex items-start gap-3 p-3 rounded-xl"
                            style={{ background: tarea.completada ? '#f0fdf4' : '#f8fafc', border: `1px solid ${tarea.completada ? '#bbf7d0' : '#e5e7eb'}` }}>
                            <button onClick={() => !tarea.completada && marcarCompletada(i, j)}
                              className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs"
                              style={{ background: tarea.completada ? '#22c55e' : '#fff', border: `2px solid ${tarea.completada ? '#22c55e' : '#d1d5db'}`, color: '#fff' }}>
                              {tarea.completada ? '✓' : ''}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: config.light, color: '#1e3a5f' }}>{tarea.asignatura}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>{tarea.bloque}</span>
                                <span className="text-xs" style={{ color: '#9ca3af' }}>⏱ {tarea.duracion} min</span>
                              </div>
                              <p className="text-sm" style={{ color: tarea.completada ? '#6b7280' : '#374151', textDecoration: tarea.completada ? 'line-through' : 'none' }}>
                                {tarea.descripcion}
                              </p>
                            </div>
                            {!tarea.completada && (
                              <button onClick={() => router.push('/')}
                                className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
                                style={{ background: config.bg, color: '#fff' }}>
                                Practicar →
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => cargarTareasYPlanning(perfil, usuario?.id)}
                  className="w-full py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                  🔄 Recalcular plan
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280' }}>No se pudo generar el plan. Intenta de nuevo.</p>
                <button onClick={() => generarPlanning(perfil, usuario?.id, [])} className="mt-4 px-6 py-2 rounded-xl font-semibold text-white" style={{ background: config.bg }}>
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
