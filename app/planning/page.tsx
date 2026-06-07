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
        await generarPlanning(p, data.user.id)
      }
      setCargando(false)
    })
  }, [])

  async function generarPlanning(p: any, userId: string) {
    setGenerando(true)
    const { data: prog } = await supabase.from('progreso').select('*').eq('user_id', userId)
    const hoy = new Date()
    const examen = new Date(p.fecha_examen)
    const diasRestantes = Math.ceil((examen.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: `Eres un planificador de estudio para la EBAU de Madrid.
El estudiante tiene ${diasRestantes} días hasta el examen.
Puede estudiar ${p.horas_dia} horas al día.
Su nota objetivo es ${p.nota_objetivo} sobre 14.
Asignaturas que lleva peor: ${p.asignaturas_flojas?.join(', ') || 'ninguna indicada'}.
Progreso reciente: ${prog?.length ? prog.slice(-10).map((x: any) => `${x.asignatura} ${x.bloque}: ${x.nota}/10`).join(', ') : 'sin datos aún'}.

Genera un plan de estudio para los próximos 7 días en formato JSON. 
Responde SOLO con un array JSON válido, sin texto adicional, sin bloques de código markdown, con esta estructura exacta:
[{"dia": "Lunes 9 Jun", "tareas": [{"asignatura": "Matematicas II", "bloque": "Algebra", "tipo": "Practica", "duracion": 60, "descripcion": "Resolver 2 ejercicios de matrices"}]}]
Máximo 3 tareas por día. Adapta la carga a las horas disponibles. Prioriza las asignaturas flojas.`,
        imagen: null,
        imagenTipo: null
      })
    })
    const data = await res.json()
    try {
      const texto = data.respuesta.trim().replace(/```json/g, '').replace(/```/g, '').trim()
      const parsed = JSON.parse(texto)
      setPlanning(parsed)
    } catch {
      setPlanning([])
    }
    setGenerando(false)
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
    const perfil = { fecha_examen: fechaExamen, horas_dia: horasDia, nota_objetivo: notaObjetivo, asignaturas_flojas: asignaturasFlo }
    setPerfil(perfil)
    setPaso('planning')
    await generarPlanning(perfil, userId!)
    setCargando(false)
  }

  function toggleAsignatura(a: string) {
    setAsignaturasFlo(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

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
          <div className="flex gap-2">
            <button onClick={() => router.push('/')} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}>← Exámenes</button>
          </div>
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
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>¿Cuántas horas puedes estudiar al día? <span className="font-bold" style={{ color: config.accent }}>{horasDia}h</span></label>
                <input type="range" min={1} max={8} value={horasDia} onChange={e => setHorasDia(Number(e.target.value))}
                  className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}>
                  <span>1h</span><span>4h</span><span>8h</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>¿Qué nota quieres sacar? <span className="font-bold" style={{ color: config.accent }}>{notaObjetivo}/14</span></label>
                <input type="range" min={5} max={14} step={0.5} value={notaObjetivo} onChange={e => setNotaObjetivo(Number(e.target.value))}
                  className="w-full" />
                <div className="flex justify-between text-xs mt-1" style={{ color: '#9ca3af' }}>
                  <span>5</span><span>9.5</span><span>14</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#374151' }}>¿Qué asignaturas llevas peor? (elige las que quieras)</label>
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

              <button onClick={guardarPerfil}
                disabled={!fechaExamen || asignaturasFlo.length === 0}
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
              <button onClick={() => { setPaso('onboarding') }}
                className="text-xs px-4 py-2 rounded-xl font-medium"
                style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                ✏️ Editar perfil
              </button>
            </div>

            {generando ? (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
                <div className="text-4xl mb-4">🤖</div>
                <p className="font-semibold" style={{ color: '#1e3a5f' }}>La IA está generando tu plan personalizado...</p>
                <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>Analizando tu progreso y tiempo disponible</p>
              </div>
            ) : planning.length > 0 ? (
              <div className="grid gap-4">
                {planning.map((dia: any, i: number) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
                    <div className="px-5 py-3" style={{ background: config.light, borderBottom: `2px solid ${config.accent}` }}>
                      <span className="font-bold text-sm" style={{ color: '#1e3a5f' }}>📅 {dia.dia}</span>
                    </div>
                    <div className="p-4 flex flex-col gap-3">
                      {dia.tareas?.map((tarea: any, j: number) => (
                        <div key={j} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e5e7eb' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: config.bg, color: '#fff' }}>
                            {j + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: config.light, color: '#1e3a5f' }}>{tarea.asignatura}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#f3f4f6', color: '#6b7280' }}>{tarea.bloque}</span>
                              <span className="text-xs" style={{ color: '#9ca3af' }}>⏱ {tarea.duracion} min</span>
                            </div>
                            <p className="text-sm" style={{ color: '#374151' }}>{tarea.descripcion}</p>
                          </div>
                          <button onClick={() => router.push('/')}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0"
                            style={{ background: config.bg, color: '#fff' }}>
                            Practicar →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => generarPlanning(perfil, usuario?.id)}
                  className="w-full py-3 rounded-2xl font-semibold text-sm"
                  style={{ background: '#f3f4f6', color: '#6b7280', border: '1px solid #e5e7eb' }}>
                  🔄 Regenerar plan
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center" style={{ border: '1px solid #e5e7eb' }}>
                <p style={{ color: '#6b7280' }}>No se pudo generar el plan. Intenta de nuevo.</p>
                <button onClick={() => generarPlanning(perfil, usuario?.id)} className="mt-4 px-6 py-2 rounded-xl font-semibold text-white" style={{ background: config.bg }}>
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
