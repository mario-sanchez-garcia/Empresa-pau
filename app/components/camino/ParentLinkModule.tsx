'use client'

import { useState } from 'react'
import { CheckCircle2, Copy, ExternalLink, Send, Sparkles, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import type { BillingStatus } from '@/app/hooks/useBillingStatus'

interface Props {
  billing: BillingStatus
  onPackActivated?: () => void
}

const SHARE_TEXT = 'Hola, he creado mi Camino PAU en Pausia. Me organiza cada día qué estudiar, corrige mis ejercicios y me ayuda a llegar preparado/a al examen. Puedes ver el plan aquí: '

type UIState =
  | { phase: 'idle' }
  | { phase: 'loading' }
  | { phase: 'ready'; url: string; copied: boolean }
  | { phase: 'error'; message: string }
  | { phase: 'shared' }

export default function ParentLinkModule({ billing }: Props) {
  const [ui, setUi] = useState<UIState>({ phase: 'idle' })

  if (billing.loading) return null

  // Pack already active — show minimal badge
  if (billing.hasActivePack) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
        <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
        <div>
          <p className="text-sm font-black text-emerald-900">Pack Curso PAU activo</p>
          <p className="text-xs font-semibold text-emerald-700">Tienes acceso completo a Camino PAU.</p>
        </div>
      </section>
    )
  }

  async function handleGenerateLink() {
    setUi({ phase: 'loading' })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) {
      setUi({ phase: 'error', message: 'Necesitas iniciar sesión para generar el enlace.' })
      return
    }

    try {
      const res = await fetch('/api/checkout/parent-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ planId: 'pack_curso_pau' })
      })

      const data = await res.json()

      if (!res.ok) {
        setUi({ phase: 'error', message: data.error ?? 'Error al generar el enlace.' })
        return
      }

      const url: string = data.url
      setUi({ phase: 'ready', url, copied: false })

      // Try Web Share API first
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: 'Mi Camino PAU',
            text: SHARE_TEXT,
            url,
          })
          setUi({ phase: 'shared' })
        } catch {
          // User cancelled share — still show the URL for manual copy
          setUi({ phase: 'ready', url, copied: false })
        }
      }
    } catch {
      setUi({ phase: 'error', message: 'Error de conexión. Inténtalo de nuevo.' })
    }
  }

  async function handleCopy(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setUi(prev => prev.phase === 'ready' ? { ...prev, copied: true } : prev)
      setTimeout(() => setUi(prev => prev.phase === 'ready' ? { ...prev, copied: false } : prev), 2000)
    } catch {
      // Clipboard not available — show text to copy
    }
  }

  function handleReset() {
    setUi({ phase: 'idle' })
  }

  return (
    <section style={{ borderRadius: 16, border: '1px solid var(--pau-border)', background: '#fff', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-3 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
          <Send size={19} />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-slate-950">Tu Camino PAU completo</h3>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
            Puedes enviar tu plan a tus padres para desbloquear el Pack Curso PAU.
          </p>
        </div>
      </div>

      {/* Pending checkout notice */}
      {billing.pendingParentCheckout && ui.phase === 'idle' && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          <Sparkles size={13} />
          Tienes un enlace pendiente que aún no ha sido pagado.
        </div>
      )}

      {ui.phase === 'idle' && (
        <button
          type="button"
          onClick={handleGenerateLink}
          className="campus-primary w-full"
          style={{ padding: '12px 20px', borderRadius: 12, fontSize: 14, gap: 8 }}
        >
          <Send size={16} /> Enviar a mis padres
        </button>
      )}

      {ui.phase === 'loading' && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-3 text-sm font-bold text-blue-700">
          <span className="animate-spin">⟳</span> Generando enlace…
        </div>
      )}

      {ui.phase === 'ready' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-slate-500">
            Comparte este enlace con tus padres. Caduca en 7 días.
          </p>

          {/* WhatsApp copy text */}
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-bold text-slate-400">Mensaje sugerido</p>
            <p className="text-xs font-semibold leading-5 text-slate-600 select-all">
              {SHARE_TEXT}
              <span className="text-blue-600">{ui.url}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleCopy(ui.url)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:border-blue-300"
            >
              {ui.copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
              {ui.copied ? 'Copiado' : 'Copiar enlace'}
            </button>
            <a
              href={ui.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300"
            >
              <ExternalLink size={13} /> Ver enlace
            </a>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-bold text-slate-400 transition hover:border-slate-300"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {ui.phase === 'shared' && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          <CheckCircle2 size={16} />
          Enlace compartido. Cuando tus padres paguen, tu Pack se activará automáticamente.
          <button type="button" onClick={handleReset} className="ml-auto text-emerald-500 hover:text-emerald-700">
            <X size={14} />
          </button>
        </div>
      )}

      {ui.phase === 'error' && (
        <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="flex-1 text-sm font-semibold text-red-700">{ui.message}</p>
          <button type="button" onClick={handleReset} className="shrink-0 text-red-400 hover:text-red-600">
            <X size={14} />
          </button>
        </div>
      )}
    </section>
  )
}
