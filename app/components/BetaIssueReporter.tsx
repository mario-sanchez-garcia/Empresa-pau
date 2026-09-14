'use client'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

// El botón vive fijo sobre la pantalla, así que en algún sitio TAPA algo: la
// barra de acciones de una corrección, el último día de una semana del Camino,
// el teclado en móvil. Que el alumno pueda apartarlo es más barato que acertar
// con una esquina buena para todas las pantallas y todas las páginas.
//
// Se guarda en localStorage porque es una preferencia de ESTE dispositivo —
// dónde estorba en el portátil no dice nada de dónde estorba en el móvil— y
// porque perderla al recargar convertiría el gesto en inútil.
const POSITION_KEY = 'kairo:beta-reporter-position'
const VIEWPORT_MARGIN = 8
// Por debajo de esto es un dedo temblando, no un arrastre: el clic tiene que
// seguir abriendo el formulario.
const DRAG_THRESHOLD_PX = 4

type Position = { left: number; top: number }

/** Nunca fuera de la pantalla: ni al soltarlo, ni al girar el móvil, ni al
 *  recuperar una posición guardada con otro tamaño de ventana. */
function clampToViewport(position: Position, element: HTMLElement | null): Position {
  const width = element?.offsetWidth ?? 0
  const height = element?.offsetHeight ?? 0
  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN)
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN)
  return {
    left: Math.min(Math.max(position.left, VIEWPORT_MARGIN), maxLeft),
    top: Math.min(Math.max(position.top, VIEWPORT_MARGIN), maxTop),
  }
}

function readSavedPosition(): Position | null {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<Position>
    if (typeof parsed?.left !== 'number' || typeof parsed?.top !== 'number') return null
    if (!Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) return null
    return { left: parsed.left, top: parsed.top }
  } catch {
    // Ventana privada o almacenamiento bloqueado: el botón se queda donde
    // siempre y se puede mover igual, solo que no lo recuerda.
    return null
  }
}

export default function BetaIssueReporter() {
  const dialog = useRef<HTMLDialogElement>(null)
  const [category, setCategory] = useState('technical')
  const [description, setDescription] = useState('')
  const [blocking, setBlocking] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const requestId = useRef<string | null>(null)
  const titleId = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState<Position | null>(null)
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number; moved: boolean } | null>(null)
  // Soltar tras arrastrar dispara igualmente un `click`. Sin esto, apartar el
  // botón abriría el formulario cada vez.
  const ignoreNextClick = useRef(false)

  useEffect(() => {
    const saved = readSavedPosition()
    if (saved) setPosition(clampToViewport(saved, trigger.current))
    // Girar el móvil o estrechar la ventana puede dejar la posición guardada
    // fuera de la pantalla, y entonces el botón ya no se puede ni recuperar.
    const onResize = () => setPosition(current => (current ? clampToViewport(current, trigger.current) : null))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const startDrag = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    drag.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const onDragMove = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    const rect = event.currentTarget.getBoundingClientRect()
    const next = clampToViewport({ left: event.clientX - state.offsetX, top: event.clientY - state.offsetY }, event.currentTarget)
    if (!state.moved) {
      if (Math.abs(next.left - rect.left) < DRAG_THRESHOLD_PX && Math.abs(next.top - rect.top) < DRAG_THRESHOLD_PX) return
      state.moved = true
    }
    setPosition(next)
  }, [])

  const endDrag = useCallback((event: React.PointerEvent<HTMLButtonElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!state.moved) return
    ignoreNextClick.current = true
    // Se guarda lo que se ve, no el último estado de React: el rectángulo real
    // ya está recortado a la pantalla.
    const rect = event.currentTarget.getBoundingClientRect()
    try { localStorage.setItem(POSITION_KEY, JSON.stringify({ left: rect.left, top: rect.top })) } catch { /* sin almacenamiento: vale para esta sesión */ }
  }, [])

  // Teclado: el arrastre con puntero no existe para quien navega con tabulador.
  const onKeyDown = useCallback((event: React.KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 32 : 8
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key]
    if (!delta) return
    event.preventDefault()
    const rect = event.currentTarget.getBoundingClientRect()
    const next = clampToViewport({ left: rect.left + delta[0], top: rect.top + delta[1] }, event.currentTarget)
    setPosition(next)
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(next)) } catch { /* sin almacenamiento */ }
  }, [])
  async function send(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Inicia sesión para enviarnos el aviso.')
      requestId.current ??= crypto.randomUUID()
      const response = await fetch('/api/beta/incidents', {
        method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type':'application/json' },
        body: JSON.stringify({ category, description, blocking, requestId: requestId.current, route: window.location.pathname }),
      })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error ?? 'No se ha podido enviar. Inténtalo de nuevo.')
      setDescription(''); requestId.current = null; setMessage('Aviso recibido. Gracias por ayudarnos a mejorar.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'No se ha podido enviar.') }
    finally { setSaving(false) }
  }
  return <>
    <button type="button" ref={trigger}
      onPointerDown={startDrag} onPointerMove={onDragMove} onPointerUp={endDrag} onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      onClick={() => {
        if (ignoreNextClick.current) { ignoreNextClick.current = false; return }
        setMessage(''); dialog.current?.showModal()
      }}
      title="Arrástralo si te tapa algo (o muévelo con las flechas)"
      style={{ position:'fixed',zIndex:210,padding:'8px 12px',borderRadius:12,background:'#fff',color:'#172033',border:'1px solid #cbd5e1',fontSize:12,
        // touchAction none: sin esto, arrastrarlo en móvil hace scroll de la página en vez de mover el botón.
        touchAction:'none',cursor:'grab',userSelect:'none',
        ...(position ? { left:position.left, top:position.top } : { right:16, bottom:80 }) }}>
      Avisar de un fallo
    </button>
    <dialog ref={dialog} aria-labelledby={titleId} style={{ margin:'auto',width:'min(460px, 92vw)',padding:24,borderRadius:16,border:'1px solid #cbd5e1',background:'#fff',color:'#172033' }}>
      <form onSubmit={send} style={{ display:'grid',gap:14 }}>
        <h2 id={titleId} style={{ fontWeight:700,fontSize:20 }}>Cuéntanos qué ha pasado</h2>
        <label>Tipo de problema <select value={category} onChange={event => setCategory(event.target.value)}>
          <option value="technical">Algo no funciona</option><option value="content">Contenido o corrección incorrectos</option><option value="confusing">No entiendo qué hacer</option>
        </select></label>
        <label>Qué esperabas y qué ocurrió
          <textarea required minLength={10} maxLength={1500} value={description} onChange={event => { setDescription(event.target.value); requestId.current=null }} rows={5}
            style={{ display:'block',width:'100%',border:'1px solid #94a3b8',borderRadius:8,padding:8 }} />
        </label>
        <p style={{ fontSize:12 }}>Incluimos la pantalla y tu cuenta para investigar. No escribas contraseñas ni datos de otras personas.</p>
        <label><input type="checkbox" checked={blocking} onChange={event => setBlocking(event.target.checked)} /> Me impide continuar estudiando</label>
        <p role="status">{message}</p>
        <div style={{ display:'flex',gap:16 }}><button type="submit" disabled={saving}>{saving ? 'Enviando…' : 'Enviar aviso'}</button>
          <button type="button" onClick={() => dialog.current?.close()}>Cerrar</button></div>
      </form>
    </dialog>
  </>
}
