'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Bug, Camera, Check, Loader2, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

// Mismo umbral que /api/contact (message.length < 10 => "demasiado corto"),
// para que el botón de enviar nunca se habilite con algo que el servidor
// rechazaría igualmente.
const MIN_MESSAGE_LENGTH = 10
const WIDGET_IGNORE_ATTR = 'data-bug-widget-ignore'

// El widget es fijo, así que en alguna pantalla SIEMPRE tapa algo: el botón
// de una corrección, el último día de una semana del Camino, la barra de
// guardado. El offset de /settings de abajo es la prueba de que no existe una
// esquina buena para todas las páginas. En vez de seguir añadiendo excepciones
// por ruta, el alumno lo aparta donde quiera.
//
// La posición se guarda por dispositivo (localStorage): dónde estorba en el
// portátil no dice nada de dónde estorba en el móvil, y perderla al recargar
// haría el gesto inútil.
const POSITION_KEY = 'kairo:bug-widget-position'
const VIEWPORT_MARGIN = 8
// Por debajo de esto es un dedo temblando, no un arrastre: el clic tiene que
// seguir abriendo el formulario.
const DRAG_THRESHOLD_PX = 4

type WidgetPosition = { left: number; top: number }

/** Nunca fuera de la pantalla: ni al soltarlo, ni al abrir el panel (que es
 *  mucho más alto que el botón), ni al girar el móvil, ni al recuperar una
 *  posición guardada con otro tamaño de ventana. */
function clampToViewport(position: WidgetPosition, element: HTMLElement | null): WidgetPosition {
  const width = element?.offsetWidth ?? 0
  const height = element?.offsetHeight ?? 0
  const maxLeft = Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN)
  const maxTop = Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN)
  return {
    left: Math.min(Math.max(position.left, VIEWPORT_MARGIN), maxLeft),
    top: Math.min(Math.max(position.top, VIEWPORT_MARGIN), maxTop),
  }
}

function readSavedPosition(): WidgetPosition | null {
  try {
    const raw = localStorage.getItem(POSITION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<WidgetPosition>
    if (typeof parsed?.left !== 'number' || typeof parsed?.top !== 'number') return null
    if (!Number.isFinite(parsed.left) || !Number.isFinite(parsed.top)) return null
    return { left: parsed.left, top: parsed.top }
  } catch {
    // Ventana privada o almacenamiento bloqueado: el widget sigue donde
    // siempre y se puede mover igual, solo que no lo recuerda.
    return null
  }
}

type Phase = 'idle' | 'capturing' | 'submitting' | 'sent'

// La landing pública y la pantalla de login no deben mostrar el widget aunque
// el visitante arrastre una sesión activa de otra pestaña (Supabase guarda la
// sesión en localStorage, así que hasSession por sí solo no distingue "estoy
// en la app" de "estoy de paso por la landing"). El onboarding NO se excluye
// aquí a propósito: antes de crear la cuenta no hay sesión (ni siquiera
// anónima -- no se usa signInAnonymously en el proyecto) y /api/contact exige
// un JWT con email real para un bug_report, así que el widget ya aparece solo
// en cuanto el alumno tiene cuenta (a mitad de OnboardingFlow o en
// /onboarding/finalizando), vía el mismo chequeo de hasSession de abajo.
function isPublicRoute(pathname: string) {
  return pathname === '/' || pathname === '/landing' || pathname.startsWith('/landing/') || pathname === '/login' || pathname.startsWith('/login/')
}

// En /settings la barra de guardado ("Guardar cambios") vive pegada abajo del
// todo -- el widget flotante, en su posición normal (bottom:20), la tapa. Solo
// aquí se sube con un offset extra; en el resto de la app no cambia nada.
function isSettingsRoute(pathname: string) {
  return pathname === '/settings' || pathname.startsWith('/settings/')
}

// Widget flotante global de reporte de bugs — vive fuera de <main>, montado
// directamente en app/layout.tsx (igual que BackToTop), y solo se muestra
// con sesión activa: un reporte de bug siempre debe poder atribuirse a un
// alumno via el email de su JWT (ver /api/contact, rama report_type ===
// 'bug_report'), nunca a un visitante anónimo.
export default function BugReportWidget() {
  const pathname = usePathname()
  const [hasSession, setHasSession] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const { theme } = useClayThemePreference()
  const container = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<WidgetPosition | null>(null)
  const drag = useRef<{ pointerId: number; offsetX: number; offsetY: number; moved: boolean } | null>(null)
  // Soltar tras arrastrar dispara igualmente un `click`. Sin esto, apartar el
  // widget abriría el formulario cada vez.
  const ignoreNextClick = useRef(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setHasSession(!!data.session)
    })
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setHasSession(!!session)
    })
    return () => { cancelled = true; subscription.subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    const saved = readSavedPosition()
    if (saved) setPosition(clampToViewport(saved, container.current))
    const onResize = () => setPosition(current => (current ? clampToViewport(current, container.current) : null))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Abrir el panel convierte un botón de 44 px en una tarjeta de 320 px: desde
  // una posición baja o pegada a la derecha se saldría de la pantalla.
  useEffect(() => {
    if (!open) return
    setPosition(current => (current ? clampToViewport(current, container.current) : null))
  }, [open])

  const startDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    const box = container.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    drag.current = { pointerId: event.pointerId, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const onDragMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    const box = container.current
    if (!box) return
    const rect = box.getBoundingClientRect()
    const next = clampToViewport({ left: event.clientX - state.offsetX, top: event.clientY - state.offsetY }, box)
    if (!state.moved) {
      if (Math.abs(next.left - rect.left) < DRAG_THRESHOLD_PX && Math.abs(next.top - rect.top) < DRAG_THRESHOLD_PX) return
      state.moved = true
    }
    setPosition(next)
  }, [])

  const endDrag = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const state = drag.current
    if (!state || state.pointerId !== event.pointerId) return
    drag.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    if (!state.moved) return
    ignoreNextClick.current = true
    // Se guarda lo que se ve, no el último estado de React: el rectángulo real
    // ya está recortado a la pantalla.
    const rect = container.current?.getBoundingClientRect()
    if (!rect) return
    try { localStorage.setItem(POSITION_KEY, JSON.stringify({ left: rect.left, top: rect.top })) } catch { /* sin almacenamiento: vale para esta sesión */ }
  }, [])

  // Teclado: el arrastre con puntero no existe para quien navega con tabulador.
  const onWidgetKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    const step = event.shiftKey ? 32 : 8
    const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[event.key]
    const box = container.current
    if (!delta || !box) return
    event.preventDefault()
    const rect = box.getBoundingClientRect()
    const next = clampToViewport({ left: rect.left + delta[0], top: rect.top + delta[1] }, box)
    setPosition(next)
    try { localStorage.setItem(POSITION_KEY, JSON.stringify(next)) } catch { /* sin almacenamiento */ }
  }, [])

  if (isPublicRoute(pathname ?? '')) return null
  if (!hasSession) return null

  async function handleCapture() {
    setError(null)
    setPhase('capturing')
    try {
      const { toPng } = await import('html-to-image')
      // Captura document.body (el "contenedor principal" real de la app) y
      // excluye el propio widget vía filter — así una captura tomada con el
      // panel abierto no muestra el panel de reporte dentro de sí mismo.
      const dataUrl = await toPng(document.body, {
        cacheBust: true,
        pixelRatio: 1,
        filter: (node) => !node.hasAttribute?.(WIDGET_IGNORE_ATTR),
      })
      setScreenshot(dataUrl)
    } catch (err) {
      console.error('[BugReportWidget] capture failed:', err instanceof Error ? err.message : String(err))
      setError('No se pudo capturar la pantalla. Puedes enviar el reporte sin captura.')
    } finally {
      setPhase('idle')
    }
  }

  async function handleSubmit() {
    const trimmed = message.trim()
    if (trimmed.length < MIN_MESSAGE_LENGTH) return

    setError(null)
    setPhase('submitting')
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Tu sesión ha caducado. Recarga la página e inténtalo de nuevo.')
        setPhase('idle')
        return
      }

      // Subida de la captura best-effort: si falla, el reporte de texto
      // sigue siendo útil y no debe bloquearse por un problema de Storage
      // (mismo criterio que el insert secundario en /api/contact).
      let screenshotPath: string | null = null
      if (screenshot) {
        try {
          const blob = await (await fetch(screenshot)).blob()
          const path = `${session.user.id}/${Date.now()}.png`
          const { error: uploadError } = await supabase.storage
            .from('bug-report-screenshots')
            .upload(path, blob, { contentType: 'image/png', upsert: true })
          if (uploadError) {
            console.error('[BugReportWidget] screenshot upload failed:', uploadError.message)
          } else {
            screenshotPath = path
          }
        } catch (err) {
          console.error('[BugReportWidget] screenshot upload threw:', err instanceof Error ? err.message : String(err))
        }
      }

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ report_type: 'bug_report', message: trimmed, screenshot_path: screenshotPath }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(json.error || 'No se pudo enviar el reporte. Inténtalo de nuevo.')
        setPhase('idle')
        return
      }

      setPhase('sent')
      setMessage('')
      setScreenshot(null)
      setTimeout(() => {
        setOpen(false)
        setPhase('idle')
      }, 2200)
    } catch (err) {
      console.error('[BugReportWidget] submit failed:', err instanceof Error ? err.message : String(err))
      setError('No se pudo enviar el reporte. Inténtalo de nuevo.')
      setPhase('idle')
    }
  }

  const canSubmit = message.trim().length >= MIN_MESSAGE_LENGTH && phase === 'idle'

  return (
    <div
      ref={container}
      data-bug-widget-ignore="true"
      style={{
        position: 'fixed', zIndex: 50,
        // Mientras el alumno no lo mueva, exactamente donde estaba (con el
        // offset de /settings incluido); en cuanto lo mueve, manda su sitio.
        ...(position ? { left: position.left, top: position.top } : { bottom: isSettingsRoute(pathname ?? '') ? 90 : 20, right: 20 }),
      }}
    >
      <ClayThemeScope theme={theme} style={{ background: 'transparent' }}>
        {open ? (
          <div
            role="dialog"
            aria-label="Reportar un problema"
            style={{
              width: 320,
              maxWidth: 'calc(100vw - 40px)',
              background: 'var(--clay-surface)',
              border: '1px solid var(--clay-border)',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 10px 0 var(--clay-shadow-shelf), 0 16px 28px var(--clay-shadow-elevate)',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {phase === 'sent' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '20px 8px' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: 'var(--clay-accent-soft)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={20} color="var(--clay-accent-text)" />
                </div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--clay-text)', textAlign: 'center' }}>
                  ¡Gracias! Hemos recibido tu reporte.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: 'var(--clay-text)' }}>
                    Reportar un problema
                  </p>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Minimizar"
                    style={{ background: 'none', border: 0, cursor: 'pointer', padding: 4, color: 'var(--clay-text-muted)', display: 'flex' }}
                  >
                    <X size={16} />
                  </button>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  placeholder="Cuéntanos qué ha pasado…"
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    color: 'var(--clay-text)',
                    background: 'var(--clay-surface-raised)',
                    border: '1px solid var(--clay-border)',
                    borderRadius: 10,
                    padding: '10px 12px',
                  }}
                />

                {screenshot ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={screenshot}
                      alt="Captura de pantalla adjunta"
                      style={{ width: '100%', borderRadius: 10, border: '1px solid var(--clay-border)', display: 'block' }}
                    />
                    <button
                      type="button"
                      onClick={() => setScreenshot(null)}
                      aria-label="Quitar captura"
                      style={{
                        position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%',
                        background: 'rgba(15,23,42,0.65)', border: 0, color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleCapture}
                    disabled={phase === 'capturing'}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: 'var(--clay-surface-raised)', border: '1px solid var(--clay-border)',
                      color: 'var(--clay-text)', borderRadius: 10, padding: '9px 12px',
                      fontSize: 12, fontWeight: 700, cursor: phase === 'capturing' ? 'default' : 'pointer',
                      opacity: phase === 'capturing' ? 0.7 : 1,
                    }}
                  >
                    {phase === 'capturing' ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                    {phase === 'capturing' ? 'Capturando…' : 'Adjuntar captura de pantalla'}
                  </button>
                )}

                {error && (
                  <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{error}</p>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: canSubmit ? 'var(--clay-accent)' : 'var(--clay-surface-deep)',
                    color: canSubmit ? 'var(--clay-on-accent)' : 'var(--clay-text-muted)',
                    border: 0, borderRadius: 10, padding: '10px 12px',
                    fontSize: 13, fontWeight: 800, cursor: canSubmit ? 'pointer' : 'default',
                    boxShadow: canSubmit ? '0 4px 0 var(--clay-accent-deep)' : 'none',
                  }}
                >
                  {phase === 'submitting' ? <Loader2 size={14} className="animate-spin" /> : null}
                  {phase === 'submitting' ? 'Enviando…' : 'Enviar reporte'}
                </button>
              </>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (ignoreNextClick.current) { ignoreNextClick.current = false; return }
              setOpen(true)
            }}
            onPointerDown={startDrag}
            onPointerMove={onDragMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onWidgetKeyDown}
            aria-label="Reportar un problema"
            title="Arrástralo si te tapa algo (o muévelo con las flechas)"
            style={{
              // touchAction none: sin esto, arrastrarlo en móvil hace scroll
              // de la página en vez de mover el widget.
              touchAction: 'none',
              userSelect: 'none',
              height: 44,
              padding: '0 16px 0 14px',
              borderRadius: 999,
              background: 'var(--clay-accent)',
              color: 'var(--clay-on-accent)',
              border: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              cursor: 'pointer',
              boxShadow: '0 5px 0 var(--clay-accent-deep), 0 10px 20px var(--clay-shadow-elevate)',
            }}
          >
            <Bug size={18} />
            <span style={{ fontSize: 12, fontWeight: 800 }}>Reportar</span>
          </button>
        )}
      </ClayThemeScope>
    </div>
  )
}
