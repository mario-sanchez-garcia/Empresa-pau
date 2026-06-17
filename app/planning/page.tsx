'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Bot, CalendarDays, Check, Clock3, ListChecks, PenLine, RefreshCw, Rocket, Settings, Target } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import GradePredictionCard from '@/components/grade/GradePredictionCard'
import { calculateGradePredictions, type GradeEvidenceItem, type GradePredictionResult } from '@/app/lib/gradePrediction'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { useCCAA } from '@/app/hooks/useCCAA'
import PausiaBrand from '@/components/shared/PausiaBrand'

const config = {
  bg: '#2563eb',
  light: '#eff6ff',
  accent: '#60a5fa',
  deep: '#1d4ed8',
  sky: '#38bdf8',
  ink: '#111827',
  muted: '#64748b',
  softText: '#94a3b8',
  surface: '#ffffff',
  field: '#fafafa',
  border: '#dbe7fb',
  shadow: '0 24px 70px rgba(37, 99, 235, 0.09)'
}

const SUBJECT_COLORS = {
  mates: { color: '#2563eb', light: '#eff6ff', accent: '#60a5fa', border: '#dbeafe' },
  matematicas_ccss: { color: '#7c3aed', light: '#f5f3ff', accent: '#a78bfa', border: '#ddd6fe' },
  fisica: { color: '#CA8A04', light: '#FEFCE8', accent: '#FACC15', border: '#FEF08A' },
  historia: { color: '#2f6f4e', light: '#f0fdf4', accent: '#86c89a', border: '#dcfce7' },
  quimica: { color: '#ea580c', light: '#fff7ed', accent: '#fb923c', border: '#ffedd5' },
  lengua: { color: '#0284C7', light: '#E0F2FE', accent: '#38BDF8', border: '#BAE6FD' },
  ingles: { color: '#0284c7', light: '#f0f9ff', accent: '#38bdf8', border: '#e0f2fe' },
  bio: { color: '#4d7c0f', light: '#f7fee7', accent: '#84cc16', border: '#ecfccb' },
  geo: { color: '#075985', light: '#f0f9ff', accent: '#7dd3fc', border: '#e0f2fe' },
  arte: { color: '#3730a3', light: '#eef2ff', accent: '#818cf8', border: '#e0e7ff' },
  latin: { color: '#1e40af', light: '#eff6ff', accent: '#60a5fa', border: '#dbeafe' },
  other: { color: '#2563eb', light: '#eff6ff', accent: '#93c5fd', border: '#dbeafe' }
}

function hoverVars(color: string, light: string, accent = color) {
  return {
    '--hover-color': color,
    '--hover-bg': light,
    '--hover-border': accent,
    '--hover-shadow': `${accent}33`
  } as any
}

function subjectTheme(name = '') {
  const value = name.toLowerCase()
  if (value.includes('ccss') || value.includes('ciencias sociales')) return SUBJECT_COLORS.matematicas_ccss
  if (value.includes('mat')) return SUBJECT_COLORS.mates
  if (value.includes('fis')) return SUBJECT_COLORS.fisica
  if (value.includes('historia de espana') || value.includes('historia de españa')) return SUBJECT_COLORS.historia
  if (value.includes('quim')) return SUBJECT_COLORS.quimica
  if (value.includes('lengua')) return SUBJECT_COLORS.lengua
  if (value.includes('ingles') || value.includes('inglés')) return SUBJECT_COLORS.ingles
  if (value.includes('bio')) return SUBJECT_COLORS.bio
  if (value.includes('geo')) return SUBJECT_COLORS.geo
  if (value.includes('arte')) return SUBJECT_COLORS.arte
  if (value.includes('latin') || value.includes('latín')) return SUBJECT_COLORS.latin
  return SUBJECT_COLORS.other
}

const ASIGNATURAS = ['Matematicas II', 'Matematicas CCSS', 'Fisica', 'Quimica', 'Historia de Espana', 'Lengua', 'Ingles', 'Biología', 'Geografia', 'Historia del Arte', 'Latin']
type PlanTab = 'general' | 'semana' | 'tareas' | 'ajustes'

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
  const [activeTab, setActiveTab] = useState<PlanTab>('general')
  const [planningError, setPlanningError] = useState('')
  const [gradePredictions, setGradePredictions] = useState<GradePredictionResult[]>([])
  const [gradePredictionLoading, setGradePredictionLoading] = useState(false)
  const [gradePredictionError, setGradePredictionError] = useState('')
  const router = useRouter()
  const { ccaa } = useCCAA()

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setUsuario(data.user)
      void cargarNotaEstimada(data.user.id)
      const { data: p } = await supabase.from('perfiles').select('*').eq('id', data.user.id).single()
      if (p) {
        setPerfil(p)
        setPaso('planning')
        await cargarTareasYPlanning(p, data.user.id)
      }
      setCargando(false)
    })
  }, [])

  async function cargarNotaEstimada(userId: string) {
    setGradePredictionLoading(true)
    setGradePredictionError('')
    try {
      const [simulacrosResult, correctionsResult] = await Promise.all([
        supabase
          .from('historial_simulacros')
          .select('asignatura,estado,nota_final,resultado_json,created_at,updated_at')
          .eq('user_id', userId)
          .eq('estado', 'completado')
          .order('updated_at', { ascending: false })
          .limit(100),
        supabase
          .from('historial_examenes')
          .select('asignatura,nota,nota_maxima,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(150)
      ])

      if (simulacrosResult.error) console.error('GRADE_PREDICTION_SIMULACROS_ERROR', simulacrosResult.error)
      if (correctionsResult.error) console.error('GRADE_PREDICTION_CORRECTIONS_ERROR', correctionsResult.error)

      const simulacros: GradeEvidenceItem[] = (simulacrosResult.data ?? []).map((item: any) => {
        const score = firstNumber(item.nota_final, item.resultado_json?.nota_final)
        const blockScore = score == null ? scoreFromBlocks(item.resultado_json?.desglose_bloques) : null
        return {
          source: 'simulacro',
          subject: item.asignatura,
          score: score ?? blockScore?.score ?? null,
          maxScore: score == null ? blockScore?.maxScore ?? null : 10,
          createdAt: item.updated_at ?? item.created_at
        }
      })

      const corrections: GradeEvidenceItem[] = (correctionsResult.data ?? []).map((item: any) => ({
        source: 'correction',
        subject: item.asignatura,
        score: item.nota,
        maxScore: item.nota_maxima,
        createdAt: item.created_at
      }))

      setGradePredictions(calculateGradePredictions([...simulacros, ...corrections]))
      if (simulacrosResult.error || correctionsResult.error) {
        setGradePredictionError('No hemos podido leer todos los datos todavía; la estimación se actualizará cuando haya más historial disponible.')
      }
    } catch (error) {
      console.error('GRADE_PREDICTION_ERROR', error)
      setGradePredictions([])
      setGradePredictionError('Todavía no hay datos suficientes para estimar tu nota.')
    } finally {
      setGradePredictionLoading(false)
    }
  }

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

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token
    if (sessionError || !accessToken) {
      setPlanning([])
      setGenerando(false)
      return
    }

    const examLabel = ccaa === 'Cataluña' ? 'PAU Catalunya' : 'EBAU Madrid'

    const res = await fetch('/api/planning', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({
        prompt: `Eres un planificador de estudio para ${examLabel}.
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

    if (!res.ok) {
      let message = 'No se pudo generar el plan. Intenta de nuevo.'
      try {
        const errorBody = await res.json()
        if (res.status === 429) {
          message = getApiErrorMessage(errorBody, message)
        } else if (res.status === 401) {
          message = 'Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.'
        } else {
          message = getApiErrorMessage(errorBody, message)
        }
      } catch { /* mantener mensaje genérico */ }
      setPlanning([])
      setPlanningError(message)
      setGenerando(false)
      return
    }

    setPlanningError('')
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

  function firstNumber(...values: any[]) {
    for (const value of values) {
      const number = Number(value)
      if (Number.isFinite(number)) return number
    }
    return null
  }

  function scoreFromBlocks(blocks: any) {
    if (!Array.isArray(blocks)) return null
    const totals = blocks.reduce((acc, block) => {
      const score = firstNumber(block?.puntos_conseguidos, block?.nota)
      const maxScore = firstNumber(block?.puntos_maximos, block?.max_puntos)
      if (score == null || maxScore == null || maxScore <= 0) return acc
      return { score: acc.score + score, maxScore: acc.maxScore + maxScore }
    }, { score: 0, maxScore: 0 })
    return totals.maxScore > 0 ? totals : null
  }

  function toggleAsignatura(a: string) {
    setAsignaturasFlo(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  const totalTareas = planning.reduce((acc, dia) => acc + (dia.tareas?.length ?? 0), 0)
  const completadasHoy = planning.reduce((acc, dia) => acc + (dia.tareas?.filter((t: any) => t.completada)?.length ?? 0), 0)
  const porcentaje = totalTareas > 0 ? Math.round((completadasHoy / totalTareas) * 100) : 0
  const tareasPlano = planning.flatMap((dia: any, diaIdx: number) =>
    (dia.tareas ?? []).map((tarea: any, tareaIdx: number) => ({ ...tarea, dia: dia.dia, diaIdx, tareaIdx }))
  )
  const tareasPendientes = tareasPlano.filter((tarea: any) => !tarea.completada)
  const tabs: Array<{ id: PlanTab; label: string; icon: any }> = [
    { id: 'general', label: 'Vista general', icon: Target },
    { id: 'semana', label: 'Plan semanal', icon: CalendarDays },
    { id: 'tareas', label: 'Tareas', icon: ListChecks },
    { id: 'ajustes', label: 'Ajustes', icon: Settings }
  ]

  if (cargando) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(circle at 16% 12%, rgba(219, 234, 254, 0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224, 231, 255, 0.72), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186, 230, 253, 0.58), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)' }}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 22, background: 'linear-gradient(145deg, #1d4ed8, #2563eb 55%, #38bdf8)', color: '#fff', boxShadow: '0 18px 38px rgba(37,99,235,0.24)' }}><Rocket size={28} /></div>
        <p style={{ color: config.muted, fontWeight: 700 }}>Cargando tu planning...</p>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen max-lg:block" style={{ background: 'radial-gradient(circle at 16% 12%, rgba(219, 234, 254, 0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224, 231, 255, 0.72), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186, 230, 253, 0.58), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <Sidebar activeItem="plan-estudio" email={usuario?.email} />
      <div className="min-w-0 flex-1">
      <style>{`
        .campus-hover,
        .campus-primary,
        .campus-task {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease, filter 180ms ease;
        }

        .campus-hover:hover {
          transform: translateY(-2px);
          border-color: var(--hover-border, #60a5fa) !important;
          background: linear-gradient(135deg, #ffffff, var(--hover-bg, #eff6ff)) !important;
          color: var(--hover-color, #2563eb) !important;
          box-shadow: 0 16px 34px var(--hover-shadow, rgba(96, 165, 250, 0.2)) !important;
        }

        .campus-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: saturate(1.08) brightness(1.03);
          box-shadow: 0 20px 42px var(--hover-shadow, rgba(96, 165, 250, 0.24)) !important;
        }

        .campus-task:hover {
          transform: translateY(-2px);
          border-color: var(--hover-border, #60a5fa) !important;
          box-shadow: 0 18px 38px var(--hover-shadow, rgba(96, 165, 250, 0.16)) !important;
        }
      `}</style>
      <header className="px-6 py-4" style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(219, 231, 251, 0.9)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PausiaBrand subtitle="Mi Plan" size="md" />
          </div>
          <button onClick={() => router.push('/')} className="campus-hover text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2" style={{ ...hoverVars(config.bg, config.light, config.accent), background: '#fff', color: config.bg, border: '1px solid #dbe7fb', boxShadow: '0 10px 24px rgba(37,99,235,0.06)' }}>Exámenes</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">

        {paso === 'onboarding' && (
          <div className="rounded-3xl p-8" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: config.shadow, backdropFilter: 'blur(18px)' }}>
            <div className="text-center mb-8">
              <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 62, height: 62, borderRadius: 24, background: 'linear-gradient(145deg, #1d4ed8, #2563eb 52%, #38bdf8)', color: '#fff', boxShadow: '0 18px 42px rgba(37, 99, 235, 0.22)' }}><CalendarDays size={30} /></div>
              <h1 className="text-2xl font-bold" style={{ color: config.ink }}>Mi Plan</h1>
              <p className="text-sm mt-2" style={{ color: config.muted }}>Dinos tres cosas y Pausia te monta un plan día a día</p>
            </div>

            <div className="flex flex-col gap-6 max-w-lg mx-auto">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>¿Cuándo es tu examen?</label>
                <input type="date" value={fechaExamen} onChange={e => setFechaExamen(e.target.value)}
                  className="w-full rounded-2xl px-4 py-3 text-sm focus:outline-none"
                  style={{ border: '1.5px solid #dbe7fb', background: config.field, color: config.ink, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.75)', accentColor: config.accent }} />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>
                  ¿Cuántas horas puedes estudiar al día? <span className="font-bold" style={{ color: config.accent }}>{horasDia}h</span>
                </label>
                <input type="range" min={1} max={8} value={horasDia} onChange={e => setHorasDia(Number(e.target.value))} className="w-full" style={{ accentColor: config.accent }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: config.softText }}><span>1h</span><span>4h</span><span>8h</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>
                  ¿Qué nota quieres sacar? <span className="font-bold" style={{ color: config.accent }}>{notaObjetivo}/14</span>
                </label>
                <input type="range" min={5} max={14} step={0.5} value={notaObjetivo} onChange={e => setNotaObjetivo(Number(e.target.value))} className="w-full" style={{ accentColor: config.accent }} />
                <div className="flex justify-between text-xs mt-1" style={{ color: config.softText }}><span>5</span><span>9.5</span><span>14</span></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: config.ink }}>¿Qué asignaturas llevas peor?</label>
                <div className="flex flex-wrap gap-2">
                  {ASIGNATURAS.map(a => {
                    const theme = subjectTheme(a)
                    const active = asignaturasFlo.includes(a)
                    return (
                      <button key={a} onClick={() => toggleAsignatura(a)}
                        className={active ? 'campus-primary px-3 py-1.5 rounded-xl text-xs font-bold' : 'campus-hover px-3 py-1.5 rounded-xl text-xs font-bold'}
                        style={active
                          ? { ...hoverVars(theme.color, theme.light, theme.accent), background: 'linear-gradient(135deg, ' + theme.color + ', ' + theme.accent + ')', color: '#fff', boxShadow: '0 10px 22px ' + theme.accent + '33' }
                          : { ...hoverVars(theme.color, theme.light, theme.accent), background: theme.light, color: theme.color, border: '1px solid ' + theme.border }}>
                        {a}
                      </button>
                    )
                  })}
                </div>
              </div>

              <button onClick={guardarPerfil} disabled={!fechaExamen || asignaturasFlo.length === 0}
                className="campus-primary w-full py-4 rounded-2xl font-bold text-white text-lg disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ ...hoverVars(config.bg, config.light, config.accent), background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)', boxShadow: '0 18px 40px rgba(37, 99, 235, 0.2)' }}>
                <Rocket size={19} /> Generar mi plan
              </button>
            </div>
          </div>
        )}

        {paso === 'planning' && (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: config.ink }}>Mi Plan</h1>
                <p className="text-sm mt-1" style={{ color: config.muted }}>
                  Objetivo: {perfil?.nota_objetivo}/14 · {perfil?.horas_dia}h/día · Examen: {perfil?.fecha_examen ? new Date(perfil.fecha_examen).toLocaleDateString('es-ES') : ''}
                </p>
              </div>
              <button onClick={() => setPaso('onboarding')}
                className="campus-hover text-xs px-4 py-2 rounded-full font-bold flex items-center gap-2"
                style={{ ...hoverVars(config.bg, config.light, config.accent), background: '#fff', color: config.bg, border: '1px solid #dbe7fb', boxShadow: '0 10px 24px rgba(37,99,235,0.06)' }}>
                <PenLine size={14} /> Editar perfil
              </button>
            </div>

            <GradePredictionCard
              predictions={gradePredictions}
              loading={gradePredictionLoading}
              error={gradePredictionError}
            />

            <div className="flex flex-wrap gap-2 rounded-3xl p-2" style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(219,231,251,0.95)', boxShadow: '0 14px 34px rgba(37,99,235,0.06)' }}>
              {tabs.map(tab => {
                const Icon = tab.icon
                const active = activeTab === tab.id
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className="campus-hover flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-bold"
                    style={{ ...hoverVars(config.bg, config.light, config.accent), background: active ? 'linear-gradient(135deg, #1d4ed8, #60a5fa)' : '#fff', color: active ? '#fff' : config.muted, border: active ? '1px solid transparent' : '1px solid #dbe7fb', boxShadow: active ? '0 12px 26px rgba(37,99,235,0.18)' : 'none' }}>
                    <Icon size={15} /> {tab.label}
                  </button>
                )
              })}
            </div>

            {activeTab === 'general' && (
              <div className="grid gap-4 md:grid-cols-3">
                <PlanMetric label="Progreso" value={`${porcentaje}%`} detail={`${completadasHoy}/${totalTareas} tareas`} />
                <PlanMetric label="Pendientes" value={String(tareasPendientes.length)} detail="por completar" />
                <PlanMetric label="Ritmo" value={`${perfil?.horas_dia ?? 0}h/día`} detail={`objetivo ${perfil?.nota_objetivo ?? '-'} / 14`} />
                <div className="rounded-3xl p-5 md:col-span-3" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: '0 18px 45px rgba(37,99,235,0.07)' }}>
                  <h2 className="mb-3 text-sm font-bold" style={{ color: config.ink }}>Próximos objetivos</h2>
                  <div className="grid gap-2">
                    {tareasPendientes.slice(0, 4).map((tarea: any, index: number) => (
                      <div key={`${tarea.dia}-${index}`} className="rounded-2xl border border-[#dbe7fb] bg-[#f8fbff] p-3 text-sm">
                        <strong style={{ color: config.ink }}>{tarea.dia}</strong>
                        <span style={{ color: config.muted }}> · {tarea.asignatura} · {tarea.descripcion}</span>
                      </div>
                    ))}
                    {tareasPendientes.length === 0 && <p className="text-sm" style={{ color: config.muted }}>No tienes tareas pendientes en el plan actual.</p>}
                  </div>
                </div>
              </div>
            )}

            {totalTareas > 0 && activeTab !== 'ajustes' && (
              <div className="rounded-3xl p-5" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: '0 18px 45px rgba(37,99,235,0.07)' }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: config.ink }}>Progreso semanal</span>
                  <span className="text-sm font-bold" style={{ color: config.accent }}>{completadasHoy}/{totalTareas} tareas · {porcentaje}%</span>
                </div>
                <div className="w-full rounded-full h-3" style={{ background: '#f1e8ee' }}>
                  <div className="h-3 rounded-full transition-all" style={{ width: `${porcentaje}%`, background: 'linear-gradient(90deg, #1d4ed8, #2563eb, #38bdf8)' }}></div>
                </div>
              </div>
            )}

            {generando ? (
              <div className="rounded-3xl p-12 text-center" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: config.shadow }}>
                <div className="mx-auto mb-4 flex items-center justify-center" style={{ width: 58, height: 58, borderRadius: 22, background: config.light, color: config.bg, border: '1px solid #dbeafe' }}><Bot size={28} /></div>
                <p className="font-semibold" style={{ color: config.ink }}>Pausia está montando tu plan...</p>
                <p className="text-sm mt-2" style={{ color: config.softText }}>Analizando tu progreso y redistribuyendo tareas pendientes</p>
              </div>
            ) : planning.length > 0 ? (
              activeTab === 'semana' ? <div className="grid gap-4">
                {planning.map((dia: any, i: number) => {
                  const completadasDia = dia.tareas?.filter((t: any) => t.completada)?.length ?? 0
                  const totalDia = dia.tareas?.length ?? 0
                  return (
                    <div key={i} className="rounded-3xl overflow-hidden" style={{ background: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: '0 18px 45px rgba(37,99,235,0.07)' }}>
                      <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)', borderBottom: `2px solid ${config.accent}` }}>
                        <span className="font-bold text-sm flex items-center gap-2" style={{ color: config.ink }}><CalendarDays size={15} color={config.accent} /> {dia.dia}</span>
                        <span className="text-xs" style={{ color: config.muted }}>{completadasDia}/{totalDia} completadas</span>
                      </div>
                      <div className="p-4 flex flex-col gap-3">
                        {dia.tareas?.map((tarea: any, j: number) => {
                          const theme = subjectTheme(tarea.asignatura)
                          return (
                          <div key={j} className="campus-task flex items-start gap-3 p-3 rounded-xl"
                            style={{ ...hoverVars(theme.color, theme.light, theme.accent), background: tarea.completada ? '#eff6ff' : theme.light, border: `1px solid ${tarea.completada ? '#bfdbfe' : theme.border}` }}>
                            <button onClick={() => !tarea.completada && marcarCompletada(i, j)}
                              className="campus-hover w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs"
                              style={{ ...hoverVars(theme.color, theme.light, theme.accent), background: tarea.completada ? '#2563eb' : '#fff', border: `2px solid ${tarea.completada ? '#2563eb' : theme.accent}`, color: '#fff' }}>
                              {tarea.completada ? <Check size={14} /> : ''}
                            </button>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: theme.color, border: '1px solid ' + theme.border }}>{tarea.asignatura}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: '#fff', color: config.muted, border: '1px solid ' + theme.border }}>{tarea.bloque}</span>
                                <span className="text-xs flex items-center gap-1" style={{ color: config.softText }}><Clock3 size={13} /> {tarea.duracion} min</span>
                              </div>
                              <p className="text-sm" style={{ color: tarea.completada ? config.muted : config.ink, textDecoration: tarea.completada ? 'line-through' : 'none' }}>
                                {tarea.descripcion}
                              </p>
                            </div>
                            {!tarea.completada && (
                              <button onClick={() => router.push('/')}
                                className="campus-primary text-xs px-3 py-1.5 rounded-full font-bold flex-shrink-0 flex items-center gap-1.5"
                                style={{ ...hoverVars(theme.color, theme.light, theme.accent), background: 'linear-gradient(135deg, ' + theme.color + ', ' + theme.accent + ')', color: '#fff', boxShadow: '0 10px 22px ' + theme.accent + '33' }}>
                                Practicar <ArrowUpRight size={13} />
                              </button>
                            )}
                          </div>
                        )})}
                      </div>
                    </div>
                  )
                })}
                <button onClick={() => cargarTareasYPlanning(perfil, usuario?.id)}
                  className="campus-hover w-full py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2"
                  style={{ ...hoverVars(config.bg, config.light, config.accent), background: '#fff', color: config.bg, border: '1px solid #dbe7fb', boxShadow: '0 12px 28px rgba(37,99,235,0.06)' }}>
                  <RefreshCw size={15} /> Recalcular plan
                </button>
              </div> : activeTab === 'tareas' ? (
                <div className="grid gap-3">
                  {tareasPlano.map((tarea: any, index: number) => {
                    const theme = subjectTheme(tarea.asignatura)
                    return (
                      <div key={`${tarea.dia}-${index}`} className="campus-task flex items-start gap-3 rounded-2xl p-4"
                        style={{ ...hoverVars(theme.color, theme.light, theme.accent), background: tarea.completada ? '#eff6ff' : '#fff', border: `1px solid ${tarea.completada ? '#bfdbfe' : theme.border}`, boxShadow: '0 12px 28px rgba(37,99,235,0.05)' }}>
                        <button onClick={() => !tarea.completada && marcarCompletada(tarea.diaIdx, tarea.tareaIdx)}
                          className="campus-hover mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{ ...hoverVars(theme.color, theme.light, theme.accent), background: tarea.completada ? '#2563eb' : '#fff', border: `2px solid ${tarea.completada ? '#2563eb' : theme.accent}`, color: '#fff' }}>
                          {tarea.completada ? <Check size={14} /> : ''}
                        </button>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex flex-wrap gap-2 text-xs font-bold">
                            <span style={{ color: theme.color }}>{tarea.asignatura}</span>
                            <span style={{ color: config.softText }}>{tarea.dia}</span>
                            <span style={{ color: config.softText }}>{tarea.duracion} min</span>
                          </div>
                          <p className="text-sm" style={{ color: tarea.completada ? config.muted : config.ink, textDecoration: tarea.completada ? 'line-through' : 'none' }}>{tarea.descripcion}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : activeTab === 'ajustes' ? (
                <div className="rounded-3xl p-6" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: config.shadow }}>
                  <h2 className="mb-2 text-lg font-bold" style={{ color: config.ink }}>Ajustes del plan</h2>
                  <p className="mb-5 text-sm" style={{ color: config.muted }}>Cambia tu objetivo, disponibilidad o asignaturas flojas y Pausia recalcula la semana.</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setPaso('onboarding')} className="campus-hover rounded-2xl px-4 py-2 text-sm font-bold" style={{ ...hoverVars(config.bg, config.light, config.accent), background: '#fff', color: config.bg, border: '1px solid #dbe7fb' }}><PenLine size={14} /> Editar datos</button>
                    <button onClick={() => cargarTareasYPlanning(perfil, usuario?.id)} className="campus-primary rounded-2xl px-4 py-2 text-sm font-bold text-white" style={{ ...hoverVars(config.bg, config.light, config.accent), background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)' }}><RefreshCw size={14} /> Regenerar plan</button>
                  </div>
                </div>
              ) : null
            ) : (
              <div className="rounded-3xl p-12 text-center" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: config.shadow }}>
                <p style={{ color: config.muted }}>{planningError || 'No se pudo generar el plan. Intenta de nuevo.'}</p>
                {!planningError && (
                  <button onClick={() => generarPlanning(perfil, usuario?.id, [])} className="campus-primary mt-4 px-6 py-2 rounded-xl font-semibold text-white" style={{ ...hoverVars(config.bg, config.light, config.accent), background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)' }}>
                    Intentar de nuevo
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  )
}

function PlanMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-3xl p-5" style={{ background: 'rgba(255, 255, 255, 0.92)', border: '1px solid rgba(219, 231, 251, 0.95)', boxShadow: '0 18px 45px rgba(37,99,235,0.07)' }}>
      <p className="text-xs font-black uppercase tracking-[0.08em]" style={{ color: config.softText }}>{label}</p>
      <p className="mt-2 text-3xl font-black" style={{ color: config.ink }}>{value}</p>
      <p className="mt-1 text-sm font-semibold" style={{ color: config.muted }}>{detail}</p>
    </div>
  )
}
