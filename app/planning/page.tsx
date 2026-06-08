'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Atom,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronRight,
  Clock3,
  GraduationCap,
  LoaderCircle,
  PenLine,
  RefreshCw,
  Rocket,
  Route,
  Sigma,
  Sparkles,
  Target,
  Trophy,
  WandSparkles
} from 'lucide-react'

const config = { bg: '#1e40af', light: '#eff6ff', accent: '#3b82f6', ink: '#0f172a' }

const ASIGNATURAS = ['Matematicas II', 'Fisica', 'Quimica', 'Historia de Espana', 'Lengua', 'Ingles', 'Biologia', 'Geografia', 'Historia del Arte', 'Latin']

const subjectColor = (asignatura: string) => {
  const key = asignatura.toLowerCase()
  if (key.includes('fisica') || key.includes('quimica')) return { bg: '#f5f3ff', fg: '#6d28d9', ring: '#ddd6fe', icon: Atom }
  if (key.includes('historia') || key.includes('geografia') || key.includes('latin')) return { bg: '#f0fdf4', fg: '#166534', ring: '#bbf7d0', icon: Route }
  if (key.includes('matematica')) return { bg: '#eff6ff', fg: '#1e40af', ring: '#bfdbfe', icon: Sigma }
  return { bg: '#f8fafc', fg: '#475569', ring: '#e2e8f0', icon: Sparkles }
}

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
  const diasParaExamen = perfil?.fecha_examen
    ? Math.max(0, Math.ceil((new Date(perfil.fecha_examen).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f5f9ff 50%, #f7fdf9 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 66, height: 66, borderRadius: 24, background: 'linear-gradient(145deg, #60a5fa, #7c3aed)', color: '#fff', boxShadow: '0 20px 44px rgba(37,99,235,0.26)' }}>
          <LoaderCircle size={30} />
        </div>
        <p style={{ color: '#64748b', fontWeight: 700 }}>Cargando tu planning...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f5f9ff 50%, #f7fdf9 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <header className="px-6 py-4" style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(226,232,240,0.9)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{ width: 44, height: 44, borderRadius: 16, background: 'linear-gradient(145deg, #60a5fa 0%, #2563eb 58%, #1d4ed8 100%)', color: '#fff', boxShadow: '0 14px 30px rgba(37,99,235,0.28), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
              <GraduationCap size={23} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-bold text-xl leading-none" style={{ color: config.ink }}>Pausia</div>
              <div className="text-xs mt-1" style={{ color: '#64748b' }}>EBAU Madrid · planning que se puede cumplir</div>
            </div>
          </div>
          <button onClick={() => router.push('/')} className="text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2" style={{ background: '#fff', color: '#2563eb', border: '1px solid #dbeafe', boxShadow: '0 10px 24px rgba(15,23,42,0.05)' }}>
            <ArrowLeft size={14} />Exámenes
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {paso === 'onboarding' && (
          <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            <section className="rounded-3xl p-8 overflow-hidden" style={{ position: 'relative', background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 62%, #ddd6fe 100%)', border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <div style={{ position: 'absolute', right: '-46px', bottom: '-58px', width: 190, height: 190, borderRadius: '50%', background: 'rgba(59,130,246,0.16)' }} />
              <div className="flex items-center justify-center mb-7" style={{ width: 72, height: 72, borderRadius: 26, background: 'linear-gradient(145deg, #60a5fa, #7c3aed)', color: '#fff', boxShadow: '0 20px 44px rgba(37,99,235,0.28)' }}>
                <Rocket size={34} />
              </div>
              <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: '#2563eb' }}>Plan de ataque</p>
              <h1 className="text-3xl font-bold leading-tight mb-3" style={{ color: config.ink }}>Tu semana de estudio, sin humo.</h1>
              <p className="text-sm leading-6" style={{ color: '#64748b' }}>Dinos fecha, horas y asignaturas flojas. Pausia lo convierte en tareas cortas, concretas y repartidas con cabeza.</p>
              <div className="grid gap-3 mt-8" style={{ position: 'relative', gridTemplateColumns: 'repeat(auto-fit, minmax(92px, 1fr))' }}>
                {[
                  { label: 'Días', value: diasParaExamen ?? '--', icon: Route },
                  { label: 'Horas', value: `${horasDia}h`, icon: Clock3 },
                  { label: 'Meta', value: `${notaObjetivo}/14`, icon: Trophy }
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(226,232,240,0.95)' }}>
                      <Icon size={18} color="#2563eb" />
                      <div className="text-xl font-bold mt-3" style={{ color: config.ink }}>{item.value}</div>
                      <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="bg-white rounded-3xl p-8" style={{ border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <div className="mb-7">
                <h2 className="text-2xl font-bold" style={{ color: config.ink }}>Configura tu planning</h2>
                <p className="text-sm mt-2" style={{ color: '#64748b' }}>Tres ajustes y lo dejamos listo.</p>
              </div>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: '#334155' }}><Target size={16} color={config.accent} />¿Cuándo es tu examen?</label>
                  <input type="date" value={fechaExamen} onChange={e => setFechaExamen(e.target.value)}
                    className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
                    style={{ border: '1.5px solid #e2e8f0', background: '#f8fafc', color: config.ink }} />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: '#334155' }}><Clock3 size={16} color={config.accent} />Horas al día <span style={{ color: config.accent }}>{horasDia}h</span></label>
                  <input type="range" min={1} max={8} value={horasDia} onChange={e => setHorasDia(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#94a3b8' }}><span>1h</span><span>4h</span><span>8h</span></div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-2" style={{ color: '#334155' }}><Trophy size={16} color={config.accent} />Nota objetivo <span style={{ color: config.accent }}>{notaObjetivo}/14</span></label>
                  <input type="range" min={5} max={14} step={0.5} value={notaObjetivo} onChange={e => setNotaObjetivo(Number(e.target.value))} className="w-full" />
                  <div className="flex justify-between text-xs mt-1" style={{ color: '#94a3b8' }}><span>5</span><span>9.5</span><span>14</span></div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-bold mb-3" style={{ color: '#334155' }}><BrainCircuit size={16} color={config.accent} />Asignaturas que se atragantan</label>
                  <div className="flex flex-wrap gap-2">
                    {ASIGNATURAS.map(a => {
                      const palette = subjectColor(a)
                      const active = asignaturasFlo.includes(a)
                      return (
                        <button key={a} onClick={() => toggleAsignatura(a)}
                          className="px-3 py-2 rounded-full text-xs font-bold flex items-center gap-2"
                          style={active
                            ? { background: palette.fg, color: '#fff', border: '1px solid transparent', boxShadow: '0 10px 22px rgba(15,23,42,0.08)' }
                            : { background: palette.bg, color: palette.fg, border: '1px solid ' + palette.ring }}>
                          {a}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <button onClick={guardarPerfil} disabled={!fechaExamen || asignaturasFlo.length === 0}
                  className="w-full py-4 rounded-2xl font-bold text-white text-base disabled:opacity-40 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', boxShadow: '0 18px 38px rgba(37,99,235,0.25)' }}>
                  <WandSparkles size={18} />Generar mi plan
                </button>
              </div>
            </section>
          </div>
        )}

        {paso === 'planning' && (
          <div className="flex flex-col gap-6">
            <section className="rounded-3xl p-6 md:p-7 overflow-hidden" style={{ position: 'relative', background: 'linear-gradient(145deg, #ffffff 0%, #eff6ff 62%, #f5f3ff 100%)', border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 24px 60px rgba(15,23,42,0.08)' }}>
              <div style={{ position: 'absolute', right: '-42px', top: '-54px', width: 170, height: 170, borderRadius: '50%', background: 'rgba(59,130,246,0.14)' }} />
              <div className="flex items-start justify-between gap-4" style={{ position: 'relative' }}>
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center" style={{ width: 64, height: 64, borderRadius: 22, background: 'linear-gradient(145deg, #60a5fa, #7c3aed)', color: '#fff', boxShadow: '0 18px 38px rgba(37,99,235,0.26)' }}>
                    <Rocket size={30} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#2563eb' }}>Ruta semanal</p>
                    <h1 className="text-3xl font-bold leading-tight" style={{ color: config.ink }}>Tu plan de esta semana</h1>
                    <p className="text-sm mt-2" style={{ color: '#64748b' }}>
                      Objetivo {perfil?.nota_objetivo}/14 · {perfil?.horas_dia}h al día · Examen {perfil?.fecha_examen ? new Date(perfil.fecha_examen).toLocaleDateString('es-ES') : ''}
                    </p>
                  </div>
                </div>
                <button onClick={() => setPaso('onboarding')}
                  className="text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2"
                  style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0', boxShadow: '0 10px 24px rgba(15,23,42,0.05)' }}>
                  <PenLine size={14} />Editar perfil
                </button>
              </div>

              <div className="grid gap-3 mt-7" style={{ position: 'relative', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))' }}>
                {[
                  { label: 'Progreso', value: `${porcentaje}%`, icon: BarChart3, color: '#2563eb' },
                  { label: 'Tareas', value: totalTareas, icon: Target, color: '#0f766e' },
                  { label: 'Hechas', value: completadasHoy, icon: Check, color: '#16a34a' },
                  { label: 'Días examen', value: diasParaExamen ?? '--', icon: Route, color: '#7c3aed' }
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <div key={item.label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.78)', border: '1px solid rgba(226,232,240,0.95)' }}>
                      <Icon size={18} color={item.color} />
                      <div className="text-2xl font-bold mt-2" style={{ color: config.ink }}>{item.value}</div>
                      <div className="text-xs mt-1" style={{ color: '#94a3b8' }}>{item.label}</div>
                    </div>
                  )
                })}
              </div>
            </section>

            {totalTareas > 0 && (
              <div className="bg-white rounded-3xl p-5" style={{ border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 16px 36px rgba(15,23,42,0.05)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold flex items-center gap-2" style={{ color: '#334155' }}><BarChart3 size={16} color={config.accent} />Progreso semanal</span>
                  <span className="text-sm font-bold" style={{ color: config.accent }}>{completadasHoy}/{totalTareas} tareas · {porcentaje}%</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: '#e2e8f0' }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${porcentaje}%`, background: 'linear-gradient(135deg, #2563eb, #22c55e)' }}></div>
                </div>
              </div>
            )}

            {generando ? (
              <div className="bg-white rounded-3xl p-12 text-center" style={{ border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 20px 50px rgba(15,23,42,0.07)' }}>
                <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 66, height: 66, borderRadius: 24, background: 'linear-gradient(145deg, #60a5fa, #7c3aed)', color: '#fff' }}>
                  <BrainCircuit size={30} />
                </div>
                <p className="font-bold" style={{ color: config.ink }}>Pausia está montando tu ruta...</p>
                <p className="text-sm mt-2" style={{ color: '#94a3b8' }}>Analizando progreso y recolocando tareas pendientes</p>
              </div>
            ) : planning.length > 0 ? (
              <div className="grid gap-4">
                {planning.map((dia: any, i: number) => {
                  const completadasDia = dia.tareas?.filter((t: any) => t.completada)?.length ?? 0
                  const totalDia = dia.tareas?.length ?? 0
                  return (
                    <div key={i} className="bg-white rounded-3xl overflow-hidden" style={{ border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 16px 36px rgba(15,23,42,0.05)' }}>
                      <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #eff6ff, #f8fafc)', borderBottom: '1px solid #e2e8f0' }}>
                        <span className="font-bold text-sm flex items-center gap-2" style={{ color: config.ink }}><Route size={16} color={config.accent} />{dia.dia}</span>
                        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ color: '#2563eb', background: '#dbeafe' }}>{completadasDia}/{totalDia} completadas</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {dia.tareas?.map((tarea: any, j: number) => {
                          const palette = subjectColor(tarea.asignatura)
                          const SubjectIcon = palette.icon
                          return (
                            <div key={j} className="flex items-start gap-3 p-4 rounded-2xl"
                              style={{ background: tarea.completada ? '#f0fdf4' : '#f8fafc', border: `1px solid ${tarea.completada ? '#bbf7d0' : '#e2e8f0'}` }}>
                              <button onClick={() => !tarea.completada && marcarCompletada(i, j)}
                                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: tarea.completada ? '#22c55e' : '#fff', border: `2px solid ${tarea.completada ? '#22c55e' : '#cbd5e1'}`, color: '#fff' }}>
                                {tarea.completada ? <Check size={16} strokeWidth={3} /> : null}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <span className="text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5" style={{ background: palette.bg, color: palette.fg, border: '1px solid ' + palette.ring }}><SubjectIcon size={13} />{tarea.asignatura}</span>
                                  <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#fff', color: '#64748b', border: '1px solid #e2e8f0' }}>{tarea.bloque}</span>
                                  <span className="text-xs flex items-center gap-1" style={{ color: '#94a3b8' }}><Clock3 size={13} />{tarea.duracion} min</span>
                                </div>
                                <p className="text-sm leading-6" style={{ color: tarea.completada ? '#64748b' : '#334155', textDecoration: tarea.completada ? 'line-through' : 'none' }}>
                                  {tarea.descripcion}
                                </p>
                              </div>
                              {!tarea.completada && (
                                <button onClick={() => router.push('/')}
                                  className="text-xs px-3 py-2 rounded-full font-bold flex-shrink-0 flex items-center gap-1"
                                  style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)', color: '#fff', boxShadow: '0 10px 22px rgba(37,99,235,0.18)' }}>
                                  Practicar <ChevronRight size={13} />
                                </button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => cargarTareasYPlanning(perfil, usuario?.id)}
                  className="w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0', boxShadow: '0 12px 28px rgba(15,23,42,0.04)' }}>
                  <RefreshCw size={16} />Recalcular plan
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center" style={{ border: '1px solid rgba(226,232,240,0.95)', boxShadow: '0 20px 50px rgba(15,23,42,0.07)' }}>
                <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 20, background: '#eff6ff', color: '#2563eb' }}>
                  <Route size={28} />
                </div>
                <p style={{ color: '#64748b' }}>No se pudo generar el plan. Intenta de nuevo.</p>
                <button onClick={() => generarPlanning(perfil, usuario?.id, [])} className="mt-4 px-6 py-2 rounded-full font-bold text-white inline-flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1e40af, #3b82f6)' }}>
                  <RefreshCw size={15} />Intentar de nuevo
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
