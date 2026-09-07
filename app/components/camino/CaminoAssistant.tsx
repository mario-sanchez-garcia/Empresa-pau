'use client'

import { FormEvent, useRef, useState } from 'react'
import { CalendarDays, Check, MessageCircle, RotateCcw, Send, Sparkles, X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import type { CaminoChatPreview } from '@/app/api/camino/chat/route'

type ChatMessage = { id: string; role: 'user' | 'kairo'; text: string }
type ApiReply = { reply?: string; preview?: CaminoChatPreview; requiresConfirmation?: boolean; pending?: { kind: string; message: string }; error?: string }

const QUICK_ACTIONS = [
  '¿Qué estudio hoy?',
  'Mover una misión',
  'Añadir examen',
  'Añadir repaso',
  'Reorganizar mi semana',
]

async function authToken() {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

async function authedFetch(url: string, token: string, body: Record<string, unknown>, method = 'POST') {
  return fetch(url, {
    method,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export default function CaminoAssistant({ onChanged }: { onChanged: () => Promise<void> | void }) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'ask' | 'organize'>('ask')
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'welcome', role: 'kairo', text: 'Estoy conectado a tu Camino real. Puedo explicarte qué estudiar o preparar cambios seguros en tu calendario.' },
  ])
  const [preview, setPreview] = useState<CaminoChatPreview | null>(null)
  const [pendingContext, setPendingContext] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastRequest = useRef<string | null>(null)

  function add(role: ChatMessage['role'], text: string) {
    setMessages(current => [...current, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }

  async function ask(rawMessage: string) {
    const message = rawMessage.trim()
    if (!message || busy) return
    const fullMessage = pendingContext ? `${pendingContext}. Temario: ${message}` : message
    lastRequest.current = fullMessage
    add('user', message)
    setInput('')
    setError(null)
    setPreview(null)
    setBusy(true)
    try {
      const token = await authToken()
      if (!token) throw new Error('Tu sesión ha caducado.')
      const response = await authedFetch('/api/camino/chat', token, { message: fullMessage })
      const data = await response.json().catch(() => ({})) as ApiReply
      if (!response.ok) throw new Error(data.error || 'No he podido consultar tu Camino.')
      if (data.reply) add('kairo', data.reply)
      setPreview(data.requiresConfirmation && data.preview ? data.preview : null)
      setPendingContext(data.pending?.message ?? null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No he podido consultar tu Camino.')
    } finally {
      setBusy(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    await ask(input)
  }

  async function executePreview() {
    if (!preview || busy) return
    setBusy(true)
    setError(null)
    try {
      const token = await authToken()
      if (!token) throw new Error('Tu sesión ha caducado.')
      let response: Response
      if (preview.kind === 'MOVE_MISSION') {
        response = await authedFetch('/api/camino/calendar-editor/mission', token, {
          missionId: preview.missionId,
          scheduledDate: preview.toDate,
          startTime: preview.startTime,
          estimatedMinutes: preview.durationMinutes,
          source: 'kairo_chat',
        }, 'PATCH')
      } else if (preview.kind === 'CREATE_EXTRA_MISSION') {
        response = await authedFetch('/api/camino/calendar-editor/mission', token, {
          scheduledDate: preview.scheduledDate,
          subject: preview.subject,
          title: preview.title,
          topicSlug: preview.topicSlug,
          blockKey: preview.blockKey,
          blockSlug: preview.blockSlug,
          startTime: preview.startTime,
          estimatedMinutes: preview.durationMinutes,
          missionType: 'review',
          kind: 'guided_practice',
          role: 'bonus',
          source: 'kairo_chat',
          requestKey: `kairo_chat:${preview.scheduledDate}:${preview.subject}:${preview.topicSlug ?? preview.title}:${preview.startTime ?? 'no-time'}`,
          metadata: { chat_created: true, extra_review: true },
        })
      } else if (preview.kind === 'CREATE_EXAM') {
        response = await authedFetch('/api/camino/exams', token, { subject: preview.subject, topic: preview.topic, date: preview.date, source: 'kairo_chat' })
      } else if (preview.kind === 'POSTPONE_MISSION') {
        response = await authedFetch('/api/camino/postpone-mission', token, { subject: preview.subject, v2SortOrder: preview.v2SortOrder, source: 'kairo_chat' })
      } else {
        response = await authedFetch('/api/camino/chat/reorganize', token, { missionIds: preview.missionIds, sourceDate: preview.sourceDate })
      }
      const result = await response.json().catch(() => ({})) as { error?: string; code?: string; suggestedStart?: string; persisted?: boolean }
      if (!response.ok) {
        if (result.code === 'TIME_CONFLICT') throw new Error(result.suggestedStart ? `Ese hueco está ocupado. Prueba a las ${result.suggestedStart}.` : 'Ese hueco está ocupado. Elige otra hora.')
        if (result.error === 'google_sync_failed') {
          throw new Error(result.persisted ? 'El cambio está en Kairo, pero Google Calendar no se ha sincronizado. Reintentar.' : 'No he podido aplicar el cambio.')
        }
        throw new Error(result.persisted ? 'El cambio se ha guardado parcialmente. Reintentar.' : result.error || 'No he podido aplicar el cambio.')
      }
      await onChanged()
      add('kairo', preview.kind === 'CREATE_EXAM' ? 'Examen añadido ✓ He actualizado las prioridades que dependen de él.' : preview.kind === 'REORGANIZE_DAY' ? 'Cambios aplicados en tu calendario ✓' : 'Calendario actualizado ✓')
      setPreview(null)
      setPendingContext(null)
    } catch (operationError) {
      setError(operationError instanceof Error ? operationError.message : 'No he podido aplicar el cambio.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <button className="camino-chat-fab" type="button" onClick={() => setOpen(value => !value)} aria-label={open ? 'Cerrar Kairo' : 'Hablar con Kairo'} aria-expanded={open}>
        {open ? <X size={20} /> : <MessageCircle size={21} />}
        <span>{open ? 'Cerrar' : 'Hablar con Kairo'}</span>
      </button>
      {open && (
        <section className="camino-chat" role="dialog" aria-label="Kairo, asistente de Camino">
          <header className="camino-chat__header">
            <div><small>Kairo · Camino</small><strong>Tu semana, en conversación</strong></div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar"><X size={17} /></button>
          </header>
          <div className="camino-chat__modes" aria-label="Tipo de ayuda">
            <button type="button" aria-pressed={mode === 'ask'} onClick={() => setMode('ask')}><Sparkles size={13} /> Preguntar a Kairo</button>
            <button type="button" aria-pressed={mode === 'organize'} onClick={() => setMode('organize')}><CalendarDays size={13} /> Organizar calendario</button>
          </div>
          <div className="camino-chat__messages" aria-live="polite">
            {messages.map(message => <p key={message.id} className={`camino-chat__message camino-chat__message--${message.role}`}>{message.text}</p>)}
            {busy && <p className="camino-chat__thinking">Revisando tu Camino…</p>}
            {preview && <div className="camino-chat__preview">
              <span>Vista previa</span>
              <strong>{preview.kind === 'MOVE_MISSION' ? preview.missionTitle : preview.kind === 'CREATE_EXTRA_MISSION' ? preview.title : preview.kind === 'CREATE_EXAM' ? `Examen de ${preview.subjectLabel}` : preview.kind === 'POSTPONE_MISSION' ? preview.missionTitle : `${preview.missionIds.length} misiones`}</strong>
              {preview.kind === 'REORGANIZE_DAY' && <ul>{preview.summary.map(item => <li key={item}>{item}</li>)}</ul>}
              <div><button type="button" onClick={executePreview} disabled={busy}><Check size={13} /> {preview.kind === 'REORGANIZE_DAY' ? 'Aplicar cambios' : 'Confirmar'}</button><button type="button" onClick={() => setPreview(null)} disabled={busy}>Cancelar</button></div>
            </div>}
            {error && <div className="camino-chat__error" data-testid="camino-chat-error" role="alert"><span>{error}</span><button type="button" onClick={() => preview ? executePreview() : lastRequest.current ? ask(lastRequest.current) : undefined}><RotateCcw size={12} /> Reintentar</button></div>}
          </div>
          {messages.length <= 2 && <div className="camino-chat__quick">{QUICK_ACTIONS.map(action => <button key={action} type="button" onClick={() => ask(action)}>{action}</button>)}</div>}
          <form className="camino-chat__form" onSubmit={submit}>
            <input value={input} onChange={event => setInput(event.target.value)} placeholder={pendingContext ? 'Escribe el tema o bloque…' : mode === 'ask' ? '¿Qué necesitas saber?' : 'Ej. Mueve Física al viernes'} maxLength={500} />
            <button type="submit" disabled={!input.trim() || busy} aria-label="Enviar"><Send size={16} /></button>
          </form>
        </section>
      )}
      <style jsx>{`
        .camino-chat-fab { position: fixed; right: 22px; bottom: 22px; z-index: 47; display: flex; align-items: center; gap: 8px; border: 0; border-radius: 18px; background: linear-gradient(145deg,#2563eb,#1d4ed8); box-shadow: 0 12px 30px rgba(37,99,235,.3), inset 0 1px 0 rgba(255,255,255,.25); color: white; padding: 12px 16px; font-size: 12px; font-weight: 900; cursor: pointer; }
        .camino-chat { position: fixed; right: 22px; bottom: 78px; z-index: 46; width: min(390px,calc(100vw - 32px)); max-height: min(680px,calc(100vh - 110px)); display: flex; flex-direction: column; overflow: hidden; border: 1px solid rgba(148,163,184,.28); border-radius: 24px; background: rgba(248,250,252,.96); box-shadow: 0 24px 70px rgba(15,23,42,.22), inset 0 1px 0 white; backdrop-filter: blur(22px); }
        .camino-chat__header { display: flex; align-items: center; justify-content: space-between; padding: 15px 17px 12px; border-bottom: 1px solid rgba(226,232,240,.9); }
        .camino-chat__header div { display:flex; flex-direction:column; gap:2px; } .camino-chat__header small { color:#2563eb; font-size:9px; font-weight:900; letter-spacing:.12em; text-transform:uppercase; } .camino-chat__header strong { color:#0f172a; font-size:14px; } .camino-chat__header button { border:0; background:transparent; color:#64748b; cursor:pointer; }
        .camino-chat__modes { display:grid; grid-template-columns:1fr 1fr; gap:6px; padding:10px 12px; } .camino-chat__modes button { display:flex; align-items:center; justify-content:center; gap:5px; border:1px solid #dbe3ee; border-radius:11px; background:#f1f5f9; color:#64748b; padding:8px 5px; font-size:10px; font-weight:850; cursor:pointer; } .camino-chat__modes button[aria-pressed=true] { border-color:#bfdbfe; background:#eff6ff; color:#1d4ed8; box-shadow:inset 1px 1px 3px rgba(37,99,235,.08); }
        .camino-chat__messages { min-height:140px; overflow-y:auto; display:flex; flex-direction:column; gap:8px; padding:10px 13px; } .camino-chat__message { max-width:88%; margin:0; border-radius:14px; padding:9px 11px; font-size:12px; font-weight:600; line-height:1.45; } .camino-chat__message--kairo { align-self:flex-start; background:white; border:1px solid #e2e8f0; color:#334155; } .camino-chat__message--user { align-self:flex-end; background:#2563eb; color:white; } .camino-chat__thinking { margin:0; color:#94a3b8; font-size:11px; font-weight:700; }
        .camino-chat__preview { display:grid; gap:7px; border:1px solid #bfdbfe; border-radius:15px; background:#eff6ff; padding:11px; color:#1e3a8a; } .camino-chat__preview>span { font-size:9px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; } .camino-chat__preview>strong { font-size:12px; } .camino-chat__preview ul { margin:0; padding-left:17px; font-size:10px; font-weight:700; line-height:1.5; } .camino-chat__preview>div { display:flex; gap:7px; } .camino-chat__preview button { display:flex; align-items:center; gap:4px; border:0; border-radius:9px; padding:7px 10px; font-size:10px; font-weight:900; cursor:pointer; } .camino-chat__preview button:first-child { background:#2563eb; color:white; } .camino-chat__preview button:last-child { background:white; color:#64748b; }
        .camino-chat__error { display:flex; align-items:center; justify-content:space-between; gap:8px; border:1px solid #fecaca; border-radius:12px; background:#fef2f2; color:#b91c1c; padding:9px 10px; font-size:10px; font-weight:750; } .camino-chat__error button { display:flex; align-items:center; gap:4px; border:0; background:transparent; color:#b91c1c; font-size:10px; font-weight:900; cursor:pointer; }
        .camino-chat__quick { display:flex; gap:6px; overflow-x:auto; padding:3px 13px 10px; scrollbar-width:none; } .camino-chat__quick button { flex:none; border:1px solid #e2e8f0; border-radius:999px; background:white; color:#475569; padding:6px 9px; font-size:9.5px; font-weight:800; cursor:pointer; }
        .camino-chat__form { display:flex; gap:7px; border-top:1px solid #e2e8f0; padding:11px 12px calc(11px + env(safe-area-inset-bottom)); background:rgba(255,255,255,.72); } .camino-chat__form input { flex:1; min-width:0; border:1px solid #dbe3ee; border-radius:13px; background:#f8fafc; box-shadow:inset 2px 2px 5px rgba(15,23,42,.05); color:#0f172a; padding:10px 11px; font-size:12px; outline:none; } .camino-chat__form input:focus { border-color:#93c5fd; } .camino-chat__form button { width:38px; border:0; border-radius:12px; background:#2563eb; color:white; display:grid; place-items:center; cursor:pointer; } .camino-chat__form button:disabled { opacity:.45; }
        @media(max-width:640px) { .camino-chat-fab { right:16px; bottom:calc(78px + env(safe-area-inset-bottom)); } .camino-chat { inset:64px 8px calc(132px + env(safe-area-inset-bottom)); width:auto; max-height:none; border-radius:20px; } .camino-chat__messages { flex:1; } }
      `}</style>
    </>
  )
}
