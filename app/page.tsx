'use client'
import { useState, useRef, useEffect } from 'react'
import { examenes } from './data/examenes'
import { supabase } from './lib/supabase'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

const config = { color: '#1e3a5f', bg: '#1e3a5f', light: '#dbeafe', accent: '#3b82f6' }

const mdComponents = {
  h1: ({children}: any) => <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f', margin: '1.2rem 0 0.5rem', borderBottom: '2px solid #dbeafe', paddingBottom: '0.3rem' }}>{children}</h1>,
  h2: ({children}: any) => <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', margin: '1rem 0 0.4rem' }}>{children}</h2>,
  h3: ({children}: any) => <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#374151', margin: '0.8rem 0 0.3rem' }}>{children}</h3>,
  strong: ({children}: any) => <strong style={{ fontWeight: 700, color: '#111' }}>{children}</strong>,
  p: ({children}: any) => <p style={{ margin: '0.4rem 0', color: '#374151' }}>{children}</p>,
  li: ({children}: any) => <li style={{ margin: '0.25rem 0', color: '#374151' }}>{children}</li>,
  blockquote: ({children}: any) => <blockquote style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '1rem', margin: '0.8rem 0', color: '#6b7280', fontStyle: 'italic' }}>{children}</blockquote>,
}

type Tipo = 'Ordinaria' | 'Extraordinaria' | 'Modelo'

export default function Home() {
  const [usuario, setUsuario] = useState<any>(null)
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
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUsuario(data.user)
    })
  }, [])

  const examenesFiltrados = examenes.filter(e => e.tipo === tipo)
  const examen = examenesFiltrados[examenIdx] ?? examenesFiltrados[0]
  const preguntasA = examen?.preguntas.filter(p => p.opcion === 'A') ?? []
  const preguntasB = examen?.preguntas.filter(p => p.opcion === 'B') ?? []
  const pregunta = (opcion === 0 ? preguntasA : preguntasB)[bloqueIdx] ?? examen?.preguntas[0]
  const bloques = preguntasA.map(p => p.bloque)

  function reset() {
    setCorreccion(''); setRespuesta(''); setImagen(null); setImagenPreview(null)
  }

  function cambiarTipo(t: Tipo) {
    setTipo(t); setExamenIdx(0); setBloqueIdx(0); setOpcion(0); reset()
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

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
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pregunta: `Eres un corrector oficial de la EBAU de Madrid.
PREGUNTA: ${pregunta.enunciado}
PUNTUACIÓN MÁXIMA: ${pregunta.puntuacion} puntos
CRITERIOS: ${pregunta.criterios}
${modo === 'imagen' ? 'La imagen adjunta contiene la respuesta manuscrita.' : `RESPUESTA: ${respuesta}`}
Corrige con ## headers: ## Nota, ## Qué está bien, ## Qué falta, ## Respuesta completa`,
        imagen: modo === 'imagen' ? imagen : null,
        imagenTipo: modo === 'imagen' ? imagenTipo : null,
      })
    })
    const data = await res.json()
    setCorreccion(data.respuesta)
    setCargando(false)
  }

  if (!usuario) return null

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
          <div className="flex items-center gap-2">
            <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.08)', color: '#93c5fd' }}>{usuario.email}</span>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>Matemáticas II</span>
            <a href="/planning" className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>📅 Mi plan</a>
            <button onClick={cerrarSesion} className="text-xs px-3 py-1.5 rounded-lg font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: '#fca5a5' }}>Cerrar sesión</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 flex flex-col gap-5">

        {/* PESTAÑAS TIPO */}
        <div className="flex gap-1 p-1 rounded-2xl" style={{ background: '#e2e8f0' }}>
          {(['Ordinaria', 'Extraordinaria', 'Modelo'] as Tipo[]).map(t => (
            <button key={t} onClick={() => cambiarTipo(t)}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={tipo === t
                ? { background: '#fff', color: config.color, boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }
                : { background: 'transparent', color: '#64748b' }}>
              {t === 'Ordinaria' ? '📋 Ordinaria' : t === 'Extraordinaria' ? '📝 Extraordinaria' : '🎯 Modelo'}
            </button>
          ))}
        </div>

        {/* SELECTOR DE AÑO */}
        <div className="flex gap-2 flex-wrap">
          {examenesFiltrados.map((ex, i) => (
            <button key={ex.id} onClick={() => { setExamenIdx(i); setBloqueIdx(0); setOpcion(0); reset() }}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={examenIdx === i ? { background: config.bg, color: '#fff' } : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
              {ex.año}
            </button>
          ))}
        </div>

        {/* SELECTOR DE BLOQUE */}
        <div className="flex gap-2 flex-wrap">
          {bloques.map((bloque, i) => (
            <button key={i} onClick={() => { setBloqueIdx(i); setOpcion(0); reset() }}
              className="px-4 py-2 rounded-xl text-sm font-medium"
              style={bloqueIdx === i
                ? { background: config.light, color: config.color, border: `1.5px solid ${config.accent}`, fontWeight: 600 }
                : { background: '#fff', color: '#6b7280', border: '1px solid #e5e7eb' }}>
              {i + 1}. {bloque} <span style={{ opacity: 0.6 }}>· {preguntasA[i]?.puntuacion} pts</span>
            </button>
          ))}
        </div>

        {/* SELECTOR A/B — oculto en Modelo si solo hay una opción */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Elige opción:</span>
          <div className="flex gap-2">
            {([0, 1] as const).map(op => (
              <button key={op} onClick={() => { setOpcion(op); reset() }}
                className="w-10 h-10 rounded-xl text-sm font-bold"
                style={opcion === op
                  ? { background: config.bg, color: '#fff', boxShadow: '0 2px 8px rgba(30,58,95,0.25)' }
                  : { background: '#fff', color: '#374151', border: '1px solid #e5e7eb' }}>
                {op === 0 ? 'A' : 'B'}
              </button>
            ))}
          </div>
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: '#f3f4f6', color: '#9ca3af' }}>
            Opción {opcion === 0 ? 'A' : 'B'}
          </span>
        </div>

        {/* ENUNCIADO */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid #e5e7eb' }}>
          <div className="px-6 py-4" style={{ background: config.light, borderBottom: `2px solid ${config.accent}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: config.color }}>
                  EBAU Madrid {examen?.año} · {tipo}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: config.bg, color: '#fff' }}>{pregunta?.bloque}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: '#f0f4f8', color: '#374151', border: '1px solid #e5e7eb' }}>
                  Opción {pregunta?.opcion}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold" style={{ color: config.color }}>{pregunta?.puntuacion}</span>
                <span className="text-sm" style={{ color: config.accent }}>pts</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-5">
            <div style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#1f2937' }}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
                {pregunta?.enunciado ?? ''}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* RESPUESTA */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid #e5e7eb' }}>
          <div className="flex gap-2 mb-4">
            <button onClick={() => setModo('texto')} className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={modo === 'texto' ? { background: config.bg, color: '#fff' } : { background: '#f3f4f6', color: '#6b7280' }}>
              ✏️ Escribir respuesta
            </button>
            <button onClick={() => setModo('imagen')} className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={modo === 'imagen' ? { background: config.bg, color: '#fff' } : { background: '#f3f4f6', color: '#6b7280' }}>
              📷 Subir foto
            </button>
          </div>
          {modo === 'texto' ? (
            <textarea value={respuesta} onChange={e => setRespuesta(e.target.value)}
              placeholder="Escribe tu resolución paso a paso..."
              className="w-full rounded-xl p-4 text-gray-800 text-sm resize-none focus:outline-none"
              style={{ height: '180px', border: '1.5px solid #e5e7eb', lineHeight: '1.7', background: '#fafafa' }}
              onFocus={e => e.target.style.border = `1.5px solid ${config.accent}`}
              onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'} />
          ) : (
            <div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImagen} style={{ display: 'none' }} />
              {imagenPreview ? (
                <div className="relative">
                  <img src={imagenPreview} alt="Respuesta" className="w-full rounded-xl object-contain" style={{ maxHeight: '300px', border: '1.5px solid #e5e7eb' }} />
                  <button onClick={() => { setImagen(null); setImagenPreview(null) }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{ background: config.bg, color: '#fff' }}>✕</button>
                </div>
              ) : (
                <div onClick={() => fileRef.current?.click()}
                  className="w-full rounded-xl flex flex-col items-center justify-center cursor-pointer"
                  style={{ height: '180px', border: '2px dashed #93c5fd', background: '#f0f7ff' }}>
                  <span style={{ fontSize: '2rem' }}>📷</span>
                  <p className="text-sm font-medium mt-2" style={{ color: config.color }}>Haz clic para subir una foto</p>
                  <p className="text-xs mt-1" style={{ color: '#93c5fd' }}>Fotografía tu respuesta manuscrita</p>
                </div>
              )}
            </div>
          )}
          <button onClick={corregir}
            disabled={cargando || (modo === 'texto' ? !respuesta.trim() : !imagen)}
            className="mt-4 w-full rounded-xl py-3.5 font-bold text-white disabled:opacity-40"
            style={{ background: cargando ? '#6b7280' : config.bg }}>
            {cargando ? '⏳ Pausia está corrigiendo...' : '✓ Corregir con Pausia IA'}
          </button>
        </div>

        {/* CORRECCIÓN */}
        {correccion && (
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `2px solid ${config.bg}` }}>
            <div className="px-6 py-4 flex items-center gap-3" style={{ background: config.bg }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}>P</div>
              <span className="font-bold text-white text-sm tracking-wide">CORRECCIÓN DE PAUSIA IA</span>
            </div>
            <div className="px-6 py-6" style={{ fontSize: '0.925rem', lineHeight: '1.75' }}>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={mdComponents}>
                {correccion}
              </ReactMarkdown>
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
