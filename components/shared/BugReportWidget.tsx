'use client'

import { useEffect, useState } from 'react'
import { Bug, Camera, Check, Loader2, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

// Mismo umbral que /api/contact (message.length < 10 => "demasiado corto"),
// para que el botón de enviar nunca se habilite con algo que el servidor
// rechazaría igualmente.
const MIN_MESSAGE_LENGTH = 10
const WIDGET_IGNORE_ATTR = 'data-bug-widget-ignore'

type Phase = 'idle' | 'capturing' | 'submitting' | 'sent'

// Widget flotante global de reporte de bugs — vive fuera de <main>, montado
// directamente en app/layout.tsx (igual que BackToTop), y solo se muestra
// con sesión activa: un reporte de bug siempre debe poder atribuirse a un
// alumno via el email de su JWT (ver /api/contact, rama report_type ===
// 'bug_report'), nunca a un visitante anónimo.
export default function BugReportWidget() {
  const [hasSession, setHasSession] = useState(false)
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>('idle')
  const [error, setError] = useState<string | null>(null)
  const { theme } = useClayThemePreference()

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
    <div data-bug-widget-ignore="true" style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 50 }}>
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
            onClick={() => setOpen(true)}
            aria-label="Reportar un problema"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'var(--clay-accent)',
              color: 'var(--clay-on-accent)',
              border: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 5px 0 var(--clay-accent-deep), 0 10px 20px var(--clay-shadow-elevate)',
            }}
          >
            <Bug size={22} />
          </button>
        )}
      </ClayThemeScope>
    </div>
  )
}
