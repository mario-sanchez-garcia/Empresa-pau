'use client'
import { useState, useRef, useEffect } from 'react'
import { examenes, examenesHistoria } from './data/examenes'
import { examenesFisica } from './data/fisica'
import { supabase } from './lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import {
  ArrowUpRight,
  Atom,
  BarChart3,
  BrainCircuit,
  CalendarDays,
  Camera,
  ClipboardList,
  FileText,
  Flame,
  GraduationCap,
  Landmark,
  LibraryBig,
  LogOut,
  MessageCircle,
  PenLine,
  SendHorizontal,
  Sigma,
  Target,
  UploadCloud,
  WandSparkles,
  X
} from 'lucide-react'
import 'katex/dist/katex.min.css'

const ASIGNATURAS = {
  mates: { label: 'Matemáticas II', short: 'Mates', icon: Sigma, color: '#1e40af', light: '#eff6ff', accent: '#3b82f6', soft: '#dbeafe' },
  fisica: { label: 'Física', short: 'Física', icon: Atom, color: '#6d28d9', light: '#f5f3ff', accent: '#06b6d4', soft: '#ddd6fe' },
  historia: { label: 'Historia de España', short: 'Historia', icon: Landmark, color: '#166534', light: '#f0fdf4', accent: '#22c55e', soft: '#dcfce7' }
}

const SUBJECT_CARDS = {
  mates: {
    title: 'Matemáticas',
    subtitle: 'Problemas, bloques y pasos limpios',
    icon: Sigma,
    kicker: 'Modo precisión'
  },
  fisica: {
    title: 'Física',
    subtitle: 'Ondas, campo, óptica y moderna',
    icon: Atom,
    kicker: 'Modo laboratorio'
  },
  historia: {
    title: 'Historia',
    subtitle: 'Temas, comentarios y conceptos clave',
    icon: LibraryBig,
    kicker: 'Modo contexto'
  }
}

const mdComponents = {
  h1: ({children}: any) => <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '1.2rem 0 0.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0.3rem' }}>{children}</h1>,
  h2: ({children}: any) => <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: '1rem 0 0.4rem' }}>{children}</h2>,
  h3: ({children}: any) => <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: '0.8rem 0 0.3rem' }}>{children}</h3>,
  strong: ({children}: any) => <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>,
  p: ({children}: any) => <p style={{ margin: '0.4rem 0', color: '#374151' }}>{children}</p>,
  li: ({children}: any) => <li style={{ margin: '0.25rem 0', color: '#374151' }}>{children}</li>,
  blockquote: ({children}: any) => <blockquote style={{ borderLeft: '3px solid #9ca3af', paddingLeft: '1rem', margin: '0.8rem 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
}

type Asignatura = 'mates' | 'fisica' | 'historia'
type Tipo = 'Ordinaria' | 'Extraordinaria' | 'Modelo'
type Seccion = 'examenes' | 'chat' | 'historial' | 'planning'
interface MensajeChat { rol: 'usuario' | 'pausia'; texto: string }

function colorNota(n: number) {
  return n >= 7 ? '#16a34a' : n >= 5 ? '#d97706' : '#dc2626'
}

function calcMedia(items: any[]) {
  if (!items.length) return null
  return (items.reduce((a: number, h: any) => a + (h.nota / h.nota_maxima * 10), 0) / items.length).toFixed(1)
}

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
  const [seccion, setSeccion] = useState<Seccion>('examenes')
  const [asignatura, setAsignatura] = useState<Asignatura>('mates')
  const [tipo, setTipo] = useState<Tipo>('Ordinaria')
  const [examenIdx, setExamenIdx] = useState(0)
  const [bloqueIdx, setBloqueIdx] = useState(0)
  const [opcion, setOpcion] = useState<0|1>(0)
  const [respuesta, setRespuesta] = useState('')
  const [imagen, setImagen] = useState<string | null>(null)
  const [imagenTipo, setImagenTipo] = useState('image/jpeg')
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)
  const [correccion, setCorreccion] = useState('')
  const [cargando, setCargando] = useState(false)
  const [modo, setModo] = useState<'texto'|'imagen'>('texto')
  const [mensajes, setMensajes] = useState<MensajeChat[]>([])
  const [inputChat, setInputChat] = useState('')
  const [cargandoChat, setCargandoChat] = useState(false)
  const [historial, setHistorial] = useState<any[]>([])
  const [cargandoHistorial, setCargandoHistorial] = useState(false)
  const [itemSeleccionado, setItemSeleccionado] = useState<any>(null)
  const [planIA, setPlanIA] = useState('')
  const [cargandoPlan, setCargandoPlan] = useState(false)
  const [contextoChat, setContextoChat] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const cfg = ASIGNATURAS[asignatura]

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUsuario(data.user)
    })
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  useEffect(() => {
    if (seccion === 'historial') {
      setCargandoHistorial(true)
      supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(50)
        .then(({ data }) => { setHistorial(data || []); setCargandoHistorial(false) })
    }
  }, [seccion])

  const TIPOS_FISICA = [
  { tipo: 'Gravitacion', label: 'Gravitación', puntos: 2 },
  { tipo: 'Ondas', label: 'Ondas', puntos: 2 },
  { tipo: 'Electricidad', label: 'Electricidad', puntos: 2 },
  { tipo: 'Optica', label: 'Óptica', puntos: 2 },
  { tipo: 'RadioactividadModerna', label: 'Radioactividad moderna', puntos: 2 }
] as const

const TIPOS_HISTORIA = [
  { tipo: 'tema', label: 'Tema', pts: 4 },
  { tipo: 'comentario', label: 'Comentario', pts: 3 },
  { tipo: 'definicion', label: 'Definiciones', pts: 1.5 },
  { tipo: 'corta', label: 'Respuesta corta', pts: 1.5 }
] as const

const examenesFiltrados =
    asignatura === 'mates'
      ? examenes.filter(e => e.tipo === tipo)
      : asignatura === 'fisica'
        ? examenesFisica.filter(e => e.tipo === tipo)
        : examenesHistoria.filter(e => e.tipo === tipo)

const aniosDisponibles = Array.from(
  new Set(examenesFiltrados.map(e => e.año))
)

const anioSeleccionado = aniosDisponibles[examenIdx] ?? aniosDisponibles[0]

const examen = examenesFiltrados.find(e => e.año === anioSeleccionado) ?? examenesFiltrados[0]

const preguntasA = asignatura === 'mates'
  ? (examen as any)?.preguntas?.filter((p: any) => p.opcion === 'A') ?? []
  : []

const preguntasB = asignatura === 'mates'
  ? (examen as any)?.preguntas?.filter((p: any) => p.opcion === 'B') ?? []
  : []

const preguntaMates =
  (opcion === 0 ? preguntasA : preguntasB)[bloqueIdx] ??
  (examen as any)?.preguntas?.[0]

const bloquesMates = preguntasA.map((p: any) => p.bloque)

const tipoFisicaActivo = TIPOS_FISICA[bloqueIdx]?.tipo

const preguntaFisica = asignatura === 'fisica'
  ? (examen as any)?.preguntas?.find(
      (p: any) =>
        p.opcion === (opcion === 0 ? 'A' : 'B') &&
        p.bloque === tipoFisicaActivo
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoFisicaActivo) ??
    (examen as any)?.preguntas?.find((p: any) => p.opcion === (opcion === 0 ? 'A' : 'B')) ??
    (examen as any)?.preguntas?.[0]
  : null

const OPCIONES = [0, 1] as const

const opcionesFisicaDisponibles = asignatura === 'fisica'
  ? Array.from(new Set(
      ((examen as any)?.preguntas ?? [])
        .filter((p: any) => p.bloque === tipoFisicaActivo)
        .map((p: any) => p.opcion)
    ))
  : []

const opcionesDisponibles: (0 | 1)[] =
  asignatura === 'fisica' && opcionesFisicaDisponibles.length
    ? OPCIONES.filter(op => opcionesFisicaDisponibles.includes(op === 0 ? 'A' : 'B'))
    : [...OPCIONES]

const examenHistoria = asignatura === 'historia'
  ? examenesHistoria.find(
      e =>
        e.tipo === tipo &&
        e.año === anioSeleccionado &&
        e.opcion === (opcion === 0 ? 'A' : 'B')
    )
  : null

const preguntasHistoria = examenHistoria?.preguntas ?? []

const tipoHistoriaActivo = TIPOS_HISTORIA[bloqueIdx]?.tipo

const preguntaHistoria =
  preguntasHistoria.find(p => p.tipo === tipoHistoriaActivo) ??
  preguntasHistoria[0]

const preguntaActiva =
  asignatura === 'mates' ? preguntaMates :
  asignatura === 'fisica' ? preguntaFisica :
  preguntaHistoria

const bloqueActivoLabel =
  asignatura === 'mates' ? (preguntaActiva as any)?.bloque :
  asignatura === 'fisica' ? (TIPOS_FISICA[bloqueIdx]?.label ?? '') :
  (TIPOS_HISTORIA[bloqueIdx]?.label ?? '')

const opcionMostrada = (preguntaActiva as any)?.opcion ?? (opcion === 0 ? 'A' : 'B')

function puntosBloqueFisica(tipoBloque: string) {
  return (
    (examen as any)?.preguntas?.find(
      (p: any) => p.bloque === tipoBloque && p.opcion === (opcion === 0 ? 'A' : 'B')
    ) ??
    (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque)
  )?.puntuacion ?? 2
}

function cambiarBloqueFisica(i: number, tipoBloque: string) {
  setBloqueIdx(i)
  const primeraOpcion = (examen as any)?.preguntas?.find((p: any) => p.bloque === tipoBloque)?.opcion
  if (primeraOpcion) setOpcion(primeraOpcion === 'B' ? 1 : 0)
  reset()
}

function nombreAsignatura(a: string) {
  if (a === 'mates') return 'Matematicas II'
  if (a === 'fisica') return 'Física'
  return 'Historia de Espana'
}

function reset() {
  setCorreccion('')
  setRespuesta('')
  setImagen(null)
  setImagenPreview(null)
}

function cambiarAsignatura(a: Asignatura) {
  setAsignatura(a)
  setExamenIdx(0)
  setBloqueIdx(0)
  setOpcion(0)
  setTipo('Ordinaria')
  reset()
}

function cambiarTipo(t: Tipo) {
  setTipo(t)
  setExamenIdx(0)
  setBloqueIdx(0)
  setOpcion(0)
  reset()
}
  async function cerrarSesion() { await supabase.auth.signOut(); window.location.href = '/login' }

  function handleImagen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImagenTipo(file.type)
    setImagenPreview(URL.createObjectURL(file))
    const reader = new FileReader()
    reader.onload = () => setImagen((reader.result as string).split(',')[1])
    reader.readAsDataURL(file)
  }

  async function corregir() {
    if (modo === 'texto' && !respuesta.trim()) return
    if (modo === 'imagen' && !imagen) return
    setCargando(true); setCorreccion('')
    let prompt = ''
    if (asignatura === 'historia' && preguntaActiva) {
      const p = preguntaActiva as any
      const tipoMap: Record<string, string> = { tema: 'desarrollo de tema', comentario: 'comentario de texto', definicion: 'definicion de conceptos', corta: 'respuesta corta' }
      prompt = 'Eres corrector oficial EBAU Madrid Historia de Espana.\n' +
        'TIPO: ' + (tipoMap[p.tipo] || p.tipo) + '\n' +
        'ENUNCIADO: ' + p.enunciado + '\n' +
        (p.texto_fuente ? 'FUENTE: ' + p.texto_fuente + '\n' : '') +
        (p.conceptos ? 'CONCEPTOS: ' + p.conceptos.join(', ') + '\n' : '') +
        'PUNTUACION MAX: ' + p.puntuacion + '\n' +
        'CRITERIOS: ' + p.criterios + '\n' +
        (modo === 'imagen' ? 'Imagen adjunta con respuesta manuscrita.' : 'RESPUESTA: ' + respuesta) + '\n' +
        'Corrige con: ## Nota (X/' + p.puntuacion + '), ## Que esta bien, ## Que falta, ## Respuesta modelo'
    } else {
      prompt = 'Eres corrector oficial EBAU Madrid ' + (asignatura === 'fisica' ? 'Fisica' : 'Matematicas') + '.\n' +
        'PREGUNTA: ' + preguntaActiva?.enunciado + '\n' +
        'PUNTUACION MAX: ' + preguntaActiva?.puntuacion + '\n' +
        'CRITERIOS: ' + (preguntaActiva as any)?.criterios + '\n' +
        (modo === 'imagen' ? 'Imagen adjunta con respuesta manuscrita.' : 'RESPUESTA: ' + respuesta) + '\n' +
        'Corrige con: ## Nota, ## Que esta bien, ## Que falta, ## Respuesta completa'
    }
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: prompt, imagen: modo === 'imagen' ? imagen : null, imagenTipo: modo === 'imagen' ? imagenTipo : null })
    })
    const data = await res.json()
    setCorreccion(data.respuesta)
    const partes = data.respuesta.match(/([0-9]+[.,]?[0-9]*)\s*\/\s*([0-9]+[.,]?[0-9]*)/)
    const nota = partes ? parseFloat(partes[1].replace(',', '.')) : null
    const notaMax = partes ? parseFloat(partes[2].replace(',', '.')) : null
    supabase.from('historial_examenes').insert({
      user_id: usuario.id, asignatura, tipo, año: examen?.año,
      bloque: bloqueActivoLabel || '',
      opcion: opcion === 0 ? 'A' : 'B', nota, nota_maxima: notaMax,
      enunciado: preguntaActiva?.enunciado?.substring(0, 500),
      respuesta: respuesta?.substring(0, 1000),
      correccion: data.respuesta?.substring(0, 2000)
    }).then(() => {})
    setCargando(false)
  }

  async function enviarChat() {
    if (!inputChat.trim()) return
    const nuevoMensaje: MensajeChat = { rol: 'usuario', texto: inputChat }
    const hist = [...mensajes, nuevoMensaje]
    setMensajes(hist)
    setInputChat('')
    setCargandoChat(true)
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: 'Eres Pausia, tutor EBAU Madrid. Responde dudas sobre matematicas e historia.\n' +
          (contextoChat ? 'CONTEXTO: ' + contextoChat + '\n' : '') +
          hist.map(m => (m.rol === 'usuario' ? 'Estudiante' : 'Pausia') + ': ' + m.texto).join('\n') +
          '\nResponde solo como Pausia.'
      })
    })
    const data = await res.json()
    setMensajes(prev => [...prev, { rol: 'pausia', texto: data.respuesta }])
    setCargandoChat(false)
  }

  function abrirChatConContexto(item: any) {
    const ctx = 'El estudiante acaba de revisar esta correccion:\n' +
      'Asignatura: ' + nombreAsignatura(item.asignatura) + '\n' +
      'Ejercicio: ' + item.bloque + ' - ' + item.tipo + ' ' + item.año + '\n' +
      'Nota obtenida: ' + item.nota + '/' + item.nota_maxima + '\n' +
      'Enunciado: ' + (item.enunciado || '') + '\n' +
      'Correccion: ' + (item.correccion || '') + '\n\n' +
      'El estudiante quiere entender mejor su nota. Ayudale de forma clara y motivadora.'
    setContextoChat(ctx)
    setMensajes([{ rol: 'pausia', texto: 'Hola! Veo que tienes dudas sobre tu correccion de ' + item.bloque + ' donde sacaste ' + item.nota + '/' + item.nota_maxima + '. Que parte no te queda clara? Preguntame lo que quieras.' }])
    setItemSeleccionado(null)
    setSeccion('chat')
  }

  async function generarPlan() {
    setCargandoPlan(true); setPlanIA('')
    const { data: hist } = await supabase.from('historial_examenes').select('*').order('created_at', { ascending: false }).limit(20)
    const items = hist || []
    const resumen = items.length
      ? items.map((h: any) => {
          const pct = h.nota !== null && h.nota_maxima ? (h.nota / h.nota_maxima * 10).toFixed(1) : 'sin nota'
          return h.asignatura + ' - ' + h.bloque + ' - ' + h.tipo + ' ' + h.año + ': ' + pct + '/10'
        }).join('\n')
      : 'Sin correcciones aun'
    const prompt = 'Eres Pausia, tutor EBAU Madrid. Analiza el historial y genera plan semanal personalizado.\n\nHISTORIAL:\n' + resumen + '\n\nIncluye: 1) Diagnostico puntos debiles 2) Plan lunes-domingo 3) Ejercicios especificos 4) Objetivo de nota. Se concreto y motivador.'
    const res = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta: prompt })
    })
    const data = await res.json()
    setPlanIA(data.respuesta)
    setCargandoPlan(false)
  }

  if (!usuario) return null

  const NAV_ITEMS = [
    { id: 'examenes' as Seccion, label: 'Examenes', icon: ClipboardList, desc: 'Practica y corrige' },
    { id: 'chat' as Seccion, label: 'Chat con Pausia', icon: MessageCircle, desc: 'Resuelve dudas' },
    { id: 'historial' as Seccion, label: 'Historial', icon: BarChart3, desc: 'Tus correcciones' },
    { id: 'planning' as Seccion, label: 'Plan de estudio', icon: BrainCircuit, desc: 'Semana organizada' },
  ]

  const HeaderIcon =
    seccion === 'examenes' ? cfg.icon :
    seccion === 'chat' ? MessageCircle :
    seccion === 'historial' ? BarChart3 :
    CalendarDays

  const calcMedia = (items: any[]) => {
    const notas = items
      .filter((item) => item.nota !== null && item.nota_maxima)
      .map((item) => (item.nota / item.nota_maxima) * 10)

    if (notas.length === 0) return null

    return (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1)
  }

  const matesH = historial.filter((item: any) => item.asignatura === 'mates')
  const fisicaH = historial.filter((item: any) => item.asignatura === 'fisica')
  const historiaH = historial.filter((item: any) => item.asignatura === 'historia')

  const mediaM = calcMedia(matesH)
  const mediaFisica = calcMedia(fisicaH)
  const mediaHist = calcMedia(historiaH)

  return (
    <div style={{
  display: 'flex',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f5f9ff 45%, #f7fdf9 100%)',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
}}>
      <aside style={{
  width: '282px',
  minHeight: '100vh',
  background: 'rgba(255, 255, 255, 0.78)',
  backdropFilter: 'blur(24px)',
  display: 'flex',
  flexDirection: 'column',
  position: 'sticky',
  top: 0,
  flexShrink: 0,
  borderRight: '1px solid rgba(226, 232, 240, 0.9)',
  boxShadow: '18px 0 50px rgba(15, 23, 42, 0.06)'
}}>
        <div style={{ padding: '26px 22px 22px', borderBottom: '1px solid rgba(226,232,240,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
           <div style={{
  width: '44px',
  height: '44px',
  borderRadius: '16px',
  background: 'linear-gradient(145deg, #60a5fa 0%, #2563eb 58%, #1d4ed8 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  boxShadow: '0 14px 30px rgba(37, 99, 235, 0.28), inset 0 1px 0 rgba(255,255,255,0.35)'
}}><GraduationCap size={23} strokeWidth={2.2} /></div>
            <div>
              <div style={{ color: '#0f172a', fontWeight: 760, fontSize: '18px' }}>Pausia</div>
              <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>EBAU Madrid · practica mejor</div>
            </div>
          </div>
        </div>
        <nav style={{ padding: '18px 14px', flex: 1 }}>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px', marginBottom: '10px' }}>Navegacion</div>
          {NAV_ITEMS.map(item => {
            const Icon = item.icon
            const active = seccion === item.id
            return (
            <button key={item.id} onClick={() => setSeccion(item.id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 13px', borderRadius: '16px', border: active ? '1px solid rgba(59,130,246,0.18)' : '1px solid transparent', cursor: 'pointer', marginBottom: '6px', textAlign: 'left', background: active ? 'linear-gradient(135deg, #ffffff, #eff6ff)' : 'transparent', boxShadow: active ? '0 12px 28px rgba(37, 99, 235, 0.08)' : 'none' }}>
              <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? '#2563eb' : '#64748b', background: active ? '#dbeafe' : '#f8fafc' }}><Icon size={17} /></span>
              <div>
                <div style={{ color: active ? '#0f172a' : '#475569', fontWeight: active ? 700 : 520, fontSize: '14px' }}>{item.label}</div>
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>{item.desc}</div>
              </div>
            </button>
          )})}
          <a href="/planning" style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 13px', borderRadius: '16px', textDecoration: 'none', marginBottom: '6px', background: 'transparent' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', background: '#f8fafc' }}><CalendarDays size={17} /></span>
            <div>
              <div style={{ color: '#475569', fontSize: '14px', fontWeight: 520 }}>Planning</div>
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '2px' }}>Tareas completables</div>
            </div>
          </a>
          <div style={{ color: '#94a3b8', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 10px', margin: '22px 0 10px' }}>Asignaturas</div>
          {(Object.entries(ASIGNATURAS) as [Asignatura, typeof ASIGNATURAS.mates][]).map(([key, val]) => {
            const Icon = val.icon
            const active = asignatura === key && seccion === 'examenes'
            return (
            <button key={key} onClick={() => { cambiarAsignatura(key); setSeccion('examenes') }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 13px', borderRadius: '16px', border: active ? '1px solid ' + val.soft : '1px solid transparent', cursor: 'pointer', marginBottom: '6px', textAlign: 'left', background: active ? val.light : 'transparent' }}>
              <span style={{ width: '32px', height: '32px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: val.color, background: active ? '#fff' : val.light }}><Icon size={16} /></span>
              <div style={{ color: active ? val.color : '#64748b', fontSize: '13px', fontWeight: active ? 700 : 520 }}>{val.label}</div>
            </button>
          )})}
        </nav>
        <div style={{ padding: '16px', borderTop: '1px solid rgba(226,232,240,0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontSize: '13px', fontWeight: 700 }}>{usuario?.email?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#0f172a', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{usuario?.email}</div>
              <div style={{ color: '#94a3b8', fontSize: '11px' }}>Estudiante</div>
            </div>
          </div>
          <button onClick={cerrarSesion} style={{ width: '100%', padding: '10px 12px', borderRadius: '14px', background: '#fff', border: '1px solid #fee2e2', color: '#dc2626', fontSize: '12px', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)' }}><LogOut size={15} />Cerrar sesion</button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
       <header style={{
  background: 'rgba(255, 255, 255, 0.76)',
  backdropFilter: 'blur(22px)',
  borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
  padding: '0 34px',
  height: '78px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  position: 'sticky',
  top: 0,
  zIndex: 10
}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '15px', background: cfg.light, color: cfg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid ' + cfg.soft }}>
              <HeaderIcon size={20} />
            </div>
            <div>
            <div style={{ fontWeight: 700, fontSize: '18px', color: '#0f172a' }}>
              {seccion === 'examenes' && cfg.label}
              {seccion === 'chat' && 'Chat con Pausia'}
              {seccion === 'historial' && 'Historial de correcciones'}
              {seccion === 'planning' && 'Mi plan de estudio'}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
              {seccion === 'examenes' && 'Practica con examenes oficiales EBAU Madrid'}
              {seccion === 'chat' && 'Resuelve dudas sin quedarte bloqueado'}
              {seccion === 'historial' && 'Todas tus correcciones guardadas'}
              {seccion === 'planning' && 'Tu semana de estudio, aterrizada'}
            </div>
            </div>
          </div>
          {seccion === 'examenes' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {(Object.entries(ASIGNATURAS) as [Asignatura, typeof ASIGNATURAS.mates][]).map(([key, val]) => {
                const Icon = val.icon
                return (
                <button key={key} onClick={() => cambiarAsignatura(key)} style={{ padding: '8px 14px', borderRadius: '999px', border: asignatura === key ? '1px solid transparent' : '1px solid #e2e8f0', cursor: 'pointer', background: asignatura === key ? 'linear-gradient(135deg, ' + val.color + ', ' + val.accent + ')' : 'rgba(255,255,255,0.9)', color: asignatura === key ? '#fff' : '#64748b', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px', boxShadow: asignatura === key ? '0 12px 24px ' + val.accent + '33' : '0 8px 20px rgba(15,23,42,0.04)' }}><Icon size={15} />{val.short}</button>
              )})}
            </div>
          )}
        </header>

        {seccion === 'examenes' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '980px', width: '100%', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginBottom: '22px' }}>
              {(['mates', 'fisica', 'historia'] as Asignatura[]).map(key => {
                const val = ASIGNATURAS[key]
                const card = SUBJECT_CARDS[key]
                const Icon = card.icon
                const active = asignatura === key
                return (
                  <button
                    key={key}
                    onClick={() => cambiarAsignatura(key)}
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      textAlign: 'left',
                      minHeight: '162px',
                      padding: '22px',
                      borderRadius: '24px',
                      border: active ? '1px solid ' + val.accent : '1px solid rgba(226,232,240,0.95)',
                      background: 'linear-gradient(145deg, #ffffff 0%, ' + val.light + ' 58%, ' + val.soft + ' 100%)',
                      cursor: 'pointer',
                      boxShadow: active ? '0 24px 55px ' + val.accent + '26' : '0 18px 45px rgba(15, 23, 42, 0.07)'
                    }}
                  >
                    <div style={{ position: 'absolute', right: '-28px', bottom: '-34px', width: '116px', height: '116px', borderRadius: '50%', background: val.accent + '1f' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '14px' }}>
                      <div style={{ width: '56px', height: '56px', borderRadius: '19px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: val.color, boxShadow: '0 12px 28px rgba(15,23,42,0.08)' }}>
                        <Icon size={26} strokeWidth={2.1} />
                      </div>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'linear-gradient(135deg, ' + val.color + ', ' + val.accent + ')' : '#fff', color: active ? '#fff' : val.color, boxShadow: '0 10px 22px rgba(15,23,42,0.08)' }}>
                        <ArrowUpRight size={19} />
                      </div>
                    </div>
                    <div style={{ marginTop: '22px', fontSize: '20px', fontWeight: 760, color: '#0f172a', position: 'relative' }}>{card.title}</div>
                    <div style={{ marginTop: '5px', color: '#64748b', fontSize: '13px', lineHeight: '1.45', position: 'relative' }}>{card.subtitle}</div>
                    <div style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '999px', background: '#ffffffcc', color: val.color, fontSize: '11px', fontWeight: 760, position: 'relative' }}>
                      <Flame size={13} />{card.kicker}
                    </div>
                  </button>
                )
              })}
            </div>
           <div style={{
  background: 'rgba(255, 255, 255, 0.9)',
  borderRadius: '24px',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  padding: '24px',
  marginBottom: '22px',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
  backdropFilter: 'blur(12px)'
}}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '14px' }}>Filtros</div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
                {(['Ordinaria', 'Extraordinaria', 'Modelo'] as Tipo[]).map(t => (
                  <button key={t} onClick={() => cambiarTipo(t)} style={{ padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, background: tipo === t ? cfg.color : '#f8fafc', color: tipo === t ? '#fff' : '#64748b', border: tipo === t ? 'none' : '1px solid #e2e8f0' } as any}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
                      {t === 'Ordinaria' ? <ClipboardList size={14} /> : t === 'Extraordinaria' ? <FileText size={14} /> : <Target size={14} />}
                      {t}
                    </span>
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {aniosDisponibles.map((anio, i) => (
  <button
    key={anio}
    onClick={() => {
      setExamenIdx(i)
      setBloqueIdx(0)
      setOpcion(0)
      reset()
    }}
    style={{
      padding: '6px 14px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: 500,
      background: examenIdx === i ? cfg.color : '#f8fafc',
      color: examenIdx === i ? '#fff' : '#374151',
      border: examenIdx === i ? 'none' : '1px solid #e2e8f0'
    } as any}
  >
    {anio}
  </button>
))}
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {asignatura === 'mates' ? bloquesMates.map((bloque: string, i: number) => (
                  <button key={i} onClick={() => { setBloqueIdx(i); setOpcion(0); reset() }} style={{ padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: bloqueIdx === i ? cfg.light : '#f8fafc', color: bloqueIdx === i ? cfg.color : '#64748b', border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #e2e8f0' } as any}>{i + 1}. {bloque} · {preguntasA[i]?.puntuacion}pts</button>
                )) : (asignatura === 'fisica' ? TIPOS_FISICA : TIPOS_HISTORIA).map((t, i) => (
                  <button key={i} onClick={() => { asignatura === 'fisica' ? cambiarBloqueFisica(i, t.tipo) : setBloqueIdx(i); reset() }} style={{ padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 500, background: bloqueIdx === i ? cfg.light : '#f8fafc', color: bloqueIdx === i ? cfg.color : '#64748b', border: bloqueIdx === i ? '1.5px solid ' + cfg.accent : '1px solid #e2e8f0' } as any}>{t.label} · {asignatura === 'fisica' ? puntosBloqueFisica(t.tipo) : (t as any).pts}pts</button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>Opcion:</span>
                {opcionesDisponibles.map(op => (
                  <button key={op} onClick={() => { setOpcion(op); reset() }} style={{ width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700, fontSize: '14px', background: opcion === op ? cfg.color : '#f8fafc', color: opcion === op ? '#fff' : '#374151', border: opcion === op ? 'none' : '1px solid #e2e8f0' } as any}>{op === 0 ? 'A' : 'B'}</button>
                ))}
              </div>
            </div>

            {preguntaActiva && (
             <div style={{
  background: 'rgba(255, 255, 255, 0.94)',
  borderRadius: '24px',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  overflow: 'hidden',
  marginBottom: '22px',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)'
}}>
                <div style={{ padding: '16px 24px', background: cfg.light, borderBottom: '2px solid ' + cfg.accent, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>EBAU Madrid {examen?.año} · {tipo}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: cfg.color, color: '#fff', fontSize: '11px', fontWeight: 600 }}>{bloqueActivoLabel}</span>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', background: '#f1f5f9', color: '#374151', fontSize: '11px', border: '1px solid #e2e8f0' }}>Opcion {opcionMostrada}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: cfg.color }}>{preguntaActiva.puntuacion}</span>
                    <span style={{ fontSize: '13px', color: cfg.accent }}>pts</span>
                  </div>
                </div>
                <div style={{ padding: '24px' }}>
                  {asignatura === 'historia' && (preguntaActiva as any).texto_fuente && (
                    <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '10px', background: '#f8fafc', borderLeft: '3px solid ' + cfg.accent, color: '#374151', fontSize: '14px', fontStyle: 'italic', lineHeight: '1.7' }}>{(preguntaActiva as any).texto_fuente}</div>
                  )}
                  {asignatura === 'historia' && (preguntaActiva as any).conceptos && (
                    <div style={{ marginBottom: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {(preguntaActiva as any).conceptos.map((c: string, i: number) => (
                        <span key={i} style={{ padding: '4px 12px', borderRadius: '20px', background: cfg.light, color: cfg.color, border: '1px solid ' + cfg.accent, fontSize: '12px', fontWeight: 600 }}>{c}</span>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#1f2937' }}>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{preguntaActiva.enunciado}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}

           <div style={{
  background: 'rgba(255, 255, 255, 0.94)',
  borderRadius: '24px',
  border: '1px solid rgba(226, 232, 240, 0.9)',
  padding: '26px',
  marginBottom: '22px',
  boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)'
}}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tu respuesta</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {(['texto', 'imagen'] as const).map(m => (
                  <button key={m} onClick={() => setModo(m)} style={{ padding: '9px 18px', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, background: modo === m ? 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')' : '#f1f5f9', color: modo === m ? '#fff' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>{m === 'texto' ? <PenLine size={15} /> : <Camera size={15} />}{m === 'texto' ? 'Escribir' : 'Subir foto'}</button>
                ))}
              </div>
              {modo === 'texto' ? (
                <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)} placeholder={asignatura === 'historia' ? 'Escribe tu respuesta aqui...' : 'Escribe tu resolucion paso a paso...'} style={{ width: '100%', height: asignatura === 'historia' ? '280px' : '180px', borderRadius: '10px', padding: '14px', fontSize: '14px', lineHeight: '1.7', border: '1.5px solid #e2e8f0', background: '#fafafa', color: '#1f2937', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
              ) : (
                <div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
                  {imagenPreview ? (
                    <div style={{ position: 'relative' }}>
                      <img src={imagenPreview} alt="Respuesta" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '10px', border: '1.5px solid #e2e8f0' }} />
                      <button onClick={() => { setImagen(null); setImagenPreview(null) }} style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', background: cfg.color, color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} /></button>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current?.click()} style={{ height: '180px', borderRadius: '10px', border: '2px dashed ' + cfg.accent, background: cfg.light + '40', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <UploadCloud size={34} color={cfg.color} />
                      <p style={{ fontSize: '14px', fontWeight: 600, color: cfg.color, margin: '8px 0 4px' }}>Haz clic para subir una foto</p>
                      <p style={{ fontSize: '12px', color: cfg.accent, margin: '0' }}>Fotografia tu respuesta manuscrita</p>
                    </div>
                  )}
                </div>
              )}
              <button onClick={corregir} disabled={cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)} style={{ marginTop: '16px', width: '100%', padding: '15px', borderRadius: '16px', border: 'none', cursor: cargando ? 'not-allowed' : 'pointer', background: cargando ? '#94a3b8' : 'linear-gradient(135deg, ' + cfg.color + ', ' + cfg.accent + ')', color: '#fff', fontSize: '15px', fontWeight: 760, opacity: (cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)) ? 0.5 : 1, boxShadow: cargando ? 'none' : '0 16px 34px ' + cfg.accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '9px' }}>
                <WandSparkles size={17} />{cargando ? 'Pausia esta corrigiendo...' : 'Corregir con Pausia'}
              </button>
            </div>

            {correccion && (
              <div style={{ background: '#fff', borderRadius: '14px', border: '2px solid ' + cfg.color, overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: cfg.color, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><WandSparkles size={16} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>CORRECCION DE PAUSIA</span>
                </div>
                <div style={{ padding: '24px', fontSize: '0.925rem', lineHeight: '1.75' }}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{correccion}</ReactMarkdown>
                </div>
              </div>
            )}
          </main>
        )}

        {seccion === 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '800px', width: '100%', margin: '0 auto', padding: '0 32px' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mensajes.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                  <div style={{ width: '58px', height: '58px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 14px 30px rgba(37,99,235,0.12)' }}><MessageCircle size={28} /></div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Hola! Soy Pausia</div>
                  <div style={{ fontSize: '15px', color: '#64748b', maxWidth: '400px', margin: '0 auto', lineHeight: '1.6' }}>Tu compa de estudio para la EBAU de Madrid.</div>
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
                    {['Como es el examen de mates?', 'Que temas caen en historia?', 'Explicame la Segunda Republica'].map(s => (
                      <button key={s} onClick={() => setInputChat(s)} style={{ padding: '8px 16px', borderRadius: '20px', background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>{s}</button>
                    ))}
                  </div>
                </div>
              )}
              {mensajes.map((msg, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', flexDirection: msg.rol === 'usuario' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0, background: msg.rol === 'usuario' ? '#1e3a5f' : '#1a4731', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                    {msg.rol === 'usuario' ? usuario?.email?.[0]?.toUpperCase() : 'P'}
                  </div>
                  <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '14px', background: msg.rol === 'usuario' ? '#1e3a5f' : '#fff', color: msg.rol === 'usuario' ? '#fff' : '#1f2937', border: msg.rol === 'pausia' ? '1px solid #e2e8f0' : 'none', fontSize: '14px', lineHeight: '1.7' }}>
                    {msg.rol === 'pausia' ? <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{msg.texto}</ReactMarkdown> : msg.texto}
                  </div>
                </div>
              ))}
              {cargandoChat && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1a4731', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 700 }}>P</div>
                  <div style={{ padding: '12px 16px', borderRadius: '14px', background: '#fff', border: '1px solid #e2e8f0', color: '#64748b', fontSize: '14px' }}>Pausia esta escribiendo...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '16px 0 24px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '10px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '8px 8px 8px 16px', alignItems: 'flex-end' }}>
                <textarea value={inputChat} onChange={e => setInputChat(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarChat() } }} placeholder="Pregunta lo que quieras a Pausia..." rows={1} style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', lineHeight: '1.6', resize: 'none', background: 'transparent', color: '#1f2937', fontFamily: 'inherit', maxHeight: '120px' }} />
                <button onClick={enviarChat} disabled={!inputChat.trim() || cargandoChat} style={{ padding: '10px 16px', borderRadius: '999px', border: 'none', cursor: 'pointer', background: inputChat.trim() && !cargandoChat ? 'linear-gradient(135deg, #0f172a, #2563eb)' : '#e2e8f0', color: inputChat.trim() && !cargandoChat ? '#fff' : '#94a3b8', fontSize: '13px', fontWeight: 700, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '7px' }}><SendHorizontal size={15} />Enviar</button>
              </div>
              <p style={{ textAlign: 'center', fontSize: '11px', color: '#cbd5e1', margin: '8px 0 0' }}>Enter para enviar · Shift+Enter para nueva linea</p>
            </div>
          </div>
        )}

        {seccion === 'historial' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            {cargandoHistorial ? (
              <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Cargando historial...</div>
            ) : historial.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ width: '58px', height: '58px', borderRadius: '20px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 14px 30px rgba(37,99,235,0.12)' }}><BarChart3 size={28} /></div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Sin correcciones aun</div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>Haz tu primera correccion en Examenes</div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Total correcciones</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: '#0f172a' }}>{historial.length}</div>
                  </div>
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Matematicas</div>
                    {mediaM ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaM)) }}>{mediaM}<span style={{ fontSize: '16px', color: '#94a3b8' }}>/10</span></div> : <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Física</div>
                    {mediaFisica ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaFisica)) }}>{mediaFisica}<span style={{ fontSize: '16px', color: '#94a3b8' }}>/10</span></div> : <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>Sin datos</div>}
                  </div>
                  <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Media Historia</div>
                    {mediaHist ? <div style={{ fontSize: '36px', fontWeight: 800, color: colorNota(parseFloat(mediaHist)) }}>{mediaHist}<span style={{ fontSize: '16px', color: '#94a3b8' }}>/10</span></div> : <div style={{ fontSize: '16px', color: '#94a3b8', marginTop: '8px' }}>Sin datos</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {historial.map((item, i) => (
                    <div key={i} onClick={() => setItemSeleccionado(item)} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', cursor: 'pointer' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: item.asignatura === 'mates' ? '#1e3a5f' : item.asignatura === 'fisica' ? '#4c1d95' : '#1a4731' }}>{nombreAsignatura(item.asignatura)}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>{item.tipo}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>{item.año}</span>
                            <span style={{ padding: '2px 8px', borderRadius: '20px', background: '#f1f5f9', color: '#475569', fontSize: '11px' }}>{item.bloque}</span>
                          </div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{new Date(item.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        {item.nota !== null && item.nota_maxima !== null && (
                          <div>
                            <span style={{ fontSize: '28px', fontWeight: 800, color: colorNota(item.nota / item.nota_maxima * 10) }}>{item.nota}</span>
                            <span style={{ fontSize: '14px', color: '#94a3b8' }}>/{item.nota_maxima}</span>
                          </div>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>Haz clic para ver la correccion completa <ArrowUpRight size={14} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        {seccion === 'planning' && (
          <main style={{ flex: 1, padding: '28px 32px', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '18px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}><CalendarDays size={26} /></div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Plan de estudio personalizado</div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>Pausia mira tus correcciones y te monta una semana realista para remontar puntos debiles</div>
              <button onClick={generarPlan} disabled={cargandoPlan} style={{ padding: '14px 32px', borderRadius: '999px', border: 'none', cursor: cargandoPlan ? 'not-allowed' : 'pointer', background: cargandoPlan ? '#94a3b8' : 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#fff', fontSize: '15px', fontWeight: 700, boxShadow: cargandoPlan ? 'none' : '0 16px 34px rgba(37,99,235,0.24)', display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
                <BrainCircuit size={17} />
                {cargandoPlan ? 'Generando tu plan...' : planIA ? 'Regenerar plan' : 'Generar mi plan semanal'}
              </button>
            </div>
            {planIA && (
              <div style={{ background: '#fff', borderRadius: '14px', border: '2px solid #0f172a', overflow: 'hidden' }}>
                <div style={{ padding: '16px 24px', background: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><BrainCircuit size={16} /></div>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>TU PLAN SEMANAL · PAUSIA</span>
                </div>
                <div style={{ padding: '24px', fontSize: '0.925rem', lineHeight: '1.75' }}>
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{planIA}</ReactMarkdown>
                </div>
              </div>
            )}
          </main>
        )}

        {itemSeleccionado && (
          <div onClick={() => setItemSeleccionado(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px', maxHeight: '85vh', overflow: 'auto' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: '#fff' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>{nombreAsignatura(itemSeleccionado.asignatura)} · {itemSeleccionado.año} · {itemSeleccionado.bloque}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{new Date(itemSeleccionado.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {itemSeleccionado.nota !== null && (
                    <div>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: colorNota(itemSeleccionado.nota / itemSeleccionado.nota_maxima * 10) }}>{itemSeleccionado.nota}</span>
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>/{itemSeleccionado.nota_maxima}</span>
                    </div>
                  )}
                  <button onClick={() => abrirChatConContexto(itemSeleccionado)} style={{ padding: '9px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #0f172a, #2563eb)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={15} />Preguntar a Pausia</button>
                  <button onClick={() => setItemSeleccionado(null)} style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#f1f5f9', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}><X size={17} /></button>
                </div>
              </div>
              <div style={{ padding: '24px' }}>
                {itemSeleccionado.enunciado && (
                  <div style={{ marginBottom: '20px', padding: '16px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>Enunciado</div>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{itemSeleccionado.enunciado}</ReactMarkdown>
                  </div>
                )}
                {itemSeleccionado.correccion && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Correccion de Pausia</div>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>{itemSeleccionado.correccion}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
