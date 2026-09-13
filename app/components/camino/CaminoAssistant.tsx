'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { Check, RotateCcw, Send, Sparkles } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'
import type { CaminoChatPreview } from '@/app/api/camino/chat/route'

type DisplayMessage = { id: string; role: 'user' | 'kairo'; text: string }
type ApiTurn = { role: 'user' | 'assistant'; content: string }
type ApiReply = { reply?: string; preview?: CaminoChatPreview; requiresConfirmation?: boolean; error?: string }

const QUICK_ACTIONS = [
  '¿Qué estudio hoy?',
  'Mueve mi próxima misión',
  'Añade un examen',
  'Añade un repaso extra',
  'Reorganiza mi semana',
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

// Chat ampliado de Camino PAU -- vive como sección normal del documento,
// justo debajo del calendario semanal (ver CaminoCalendarClient.tsx), no
// como overlay flotante. La IA (Claude, con tool calling -- ver
// app/api/camino/chat/route.ts) solo PROPONE cambios: cada acción llega
// como preview y hace falta pulsar "Confirmar" para que se aplique de
// verdad, contra los mismos endpoints ya validados que usaba el parser de
// keywords anterior. El cliente manda el historial completo cada turno
// (apiHistory) para que Kairo pueda mantener una conversación real y
// preguntar cuando falte un dato, en vez del pendingContext de un solo
// string que usaba la versión anterior.
export default function CaminoAssistant({ onChanged }: { onChanged: () => Promise<void> | void }) {
  const [displayMessages, setDisplayMessages] = useState<DisplayMessage[]>([
    { id: 'welcome', role: 'kairo', text: 'Hola, soy Kairo. Puedo explicarte tu plan o proponer cambios en tu calendario -- siempre te los enseño antes de aplicarlos, nunca los aplico solo.' },
  ])
  const [apiHistory, setApiHistory] = useState<ApiTurn[]>([])
  const [input, setInput] = useState('')
  const [preview, setPreview] = useState<CaminoChatPreview | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastTurns = useRef<ApiTurn[] | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const didMount = useRef(false)
  const { theme } = useClayThemePreference()

  // Scrolleamos el contenedor del chat a mano en vez de scrollIntoView: ese
  // scrollea TODOS los ancestros scrollables, incluida la ventana, y como el
  // chat vive como sección normal al final del documento arrastraba la página
  // entera hacia abajo. Además lo saltamos en el primer render, para que al
  // cargar /camino se entre por arriba y no a media página.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    const container = messagesRef.current
    if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [displayMessages, busy])

  function addDisplay(role: DisplayMessage['role'], text: string) {
    setDisplayMessages(current => [...current, { id: `${Date.now()}-${Math.random()}`, role, text }])
  }

  async function send(turns: ApiTurn[]) {
    lastTurns.current = turns
    setError(null)
    setPreview(null)
    setBusy(true)
    try {
      const token = await authToken()
      if (!token) throw new Error('Tu sesión ha caducado.')
      const response = await authedFetch('/api/camino/chat', token, { messages: turns })
      const data = await response.json().catch(() => ({})) as ApiReply
      if (!response.ok) throw new Error(data.error || 'No he podido consultar tu Camino.')
      setApiHistory(data.reply ? [...turns, { role: 'assistant', content: data.reply }] : turns)
      if (data.reply) addDisplay('kairo', data.reply)
      setPreview(data.requiresConfirmation && data.preview ? data.preview : null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No he podido consultar tu Camino.')
    } finally {
      setBusy(false)
    }
  }

  async function ask(rawMessage: string) {
    const message = rawMessage.trim()
    if (!message || busy) return
    addDisplay('user', message)
    setInput('')
    await send([...apiHistory, { role: 'user', content: message }])
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
      } else {
        response = await authedFetch('/api/camino/chat/reorganize', token, { missionIds: preview.missionIds, sourceDate: preview.sourceDate })
      }
      const result = await response.json().catch(() => ({})) as { error?: string; code?: string; suggestedStart?: string; persisted?: boolean }
      if (!response.ok) {
        if (result.code === 'TIME_CONFLICT') throw new Error(result.suggestedStart ? `Ese hueco está ocupado. Prueba a las ${result.suggestedStart}.` : 'Ese hueco está ocupado. Elige otra hora.')
        if (result.error === 'simulacro_limit_reached') throw new Error('Has alcanzado el límite de Simulacros de tu plan este mes.')
        if (result.error === 'google_sync_failed') {
          throw new Error(result.persisted ? 'El cambio está en Kairo, pero Google Calendar no se ha sincronizado. Reintentar.' : 'No he podido aplicar el cambio.')
        }
        throw new Error(result.persisted ? 'El cambio se ha guardado parcialmente. Reintentar.' : result.error || 'No he podido aplicar el cambio.')
      }
      await onChanged()
      addDisplay('kairo', preview.kind === 'CREATE_EXAM' ? 'Examen añadido ✓ He actualizado las prioridades que dependen de él.' : preview.kind === 'REORGANIZE_DAY' ? 'Cambios aplicados en tu calendario ✓' : 'Calendario actualizado ✓')
      setPreview(null)
    } catch (operationError) {
      setError(operationError instanceof Error ? operationError.message : 'No he podido aplicar el cambio.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ClayThemeScope theme={theme} style={{ background: 'transparent' }}>
      <section className="camino-chat-panel" aria-label="Kairo, asistente de Camino">
        <header className="camino-chat-panel__header">
          <Sparkles size={17} color="var(--clay-accent-text)" />
          <div>
            <strong>Habla con Kairo</strong>
            <small>Pregunta por tu plan o pídele cambios en tu calendario -- siempre los confirmas tú antes de que se apliquen.</small>
          </div>
        </header>

        <div ref={messagesRef} className="camino-chat-panel__messages" aria-live="polite">
          {displayMessages.map(message => (
            <p key={message.id} className={`camino-chat-panel__message camino-chat-panel__message--${message.role}`}>{message.text}</p>
          ))}
          {busy && <p className="camino-chat-panel__thinking">Kairo está revisando tu Camino…</p>}

          {preview && (
            <div className="camino-chat-panel__preview">
              <span>Vista previa -- pendiente de confirmar</span>
              <strong>
                {preview.kind === 'MOVE_MISSION' ? preview.missionTitle
                  : preview.kind === 'CREATE_EXTRA_MISSION' ? preview.title
                  : preview.kind === 'CREATE_EXAM' ? `Examen de ${preview.subjectLabel}`
                  : `${preview.missionIds.length} misión${preview.missionIds.length === 1 ? '' : 'es'}`}
              </strong>
              {preview.kind === 'REORGANIZE_DAY' && <ul>{preview.summary.map(item => <li key={item}>{item}</li>)}</ul>}
              <div>
                <button type="button" onClick={executePreview} disabled={busy}><Check size={13} /> {preview.kind === 'REORGANIZE_DAY' ? 'Aplicar cambios' : 'Confirmar'}</button>
                <button type="button" onClick={() => setPreview(null)} disabled={busy}>Cancelar</button>
              </div>
            </div>
          )}

          {error && (
            <div className="camino-chat-panel__error" data-testid="camino-chat-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => lastTurns.current ? send(lastTurns.current) : undefined}><RotateCcw size={12} /> Reintentar</button>
            </div>
          )}
        </div>

        {displayMessages.length <= 1 && (
          <div className="camino-chat-panel__quick">
            {QUICK_ACTIONS.map(action => <button key={action} type="button" onClick={() => ask(action)}>{action}</button>)}
          </div>
        )}

        <form className="camino-chat-panel__form" onSubmit={submit}>
          <input
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Ej. Mueve mi misión de mañana a las 18h…"
            maxLength={500}
          />
          <button type="submit" disabled={!input.trim() || busy} aria-label="Enviar"><Send size={16} /></button>
        </form>
      </section>
      <style jsx>{`
        .camino-chat-panel {
          width: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--clay-border);
          border-radius: 22px;
          background: var(--clay-surface);
          box-shadow: 0 10px 0 var(--clay-shadow-shelf), 0 16px 28px var(--clay-shadow-elevate);
          overflow: hidden;
        }
        .camino-chat-panel__header { display: flex; align-items: flex-start; gap: 10px; padding: 14px 20px 10px; border-bottom: 1px solid var(--clay-border); }
        .camino-chat-panel__header div { display: flex; flex-direction: column; gap: 3px; }
        .camino-chat-panel__header strong { color: var(--clay-text); font-size: 15px; font-weight: 800; }
        .camino-chat-panel__header small { color: var(--clay-text-muted); font-size: 12px; line-height: 1.4; }
        .camino-chat-panel__messages { min-height: 0; max-height: 420px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 12px 20px; }
        .camino-chat-panel__message { max-width: 78%; margin: 0; border-radius: 14px; padding: 10px 13px; font-size: 13px; font-weight: 500; line-height: 1.5; }
        .camino-chat-panel__message--kairo { align-self: flex-start; background: var(--clay-surface-raised); border: 1px solid var(--clay-border); color: var(--clay-text); }
        .camino-chat-panel__message--user { align-self: flex-end; background: var(--clay-accent); color: var(--clay-on-accent); font-weight: 600; }
        .camino-chat-panel__thinking { margin: 0; color: var(--clay-text-muted); font-size: 12px; font-weight: 700; }
        .camino-chat-panel__preview { display: grid; gap: 8px; border: 1px solid var(--clay-border); border-radius: 15px; background: var(--clay-accent-soft); padding: 13px 14px; color: var(--clay-text); align-self: stretch; }
        .camino-chat-panel__preview > span { font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; color: var(--clay-accent-text); }
        .camino-chat-panel__preview > strong { font-size: 13px; }
        .camino-chat-panel__preview ul { margin: 0; padding-left: 18px; font-size: 12px; font-weight: 600; line-height: 1.6; color: var(--clay-text-muted); }
        .camino-chat-panel__preview > div { display: flex; gap: 8px; }
        .camino-chat-panel__preview button { display: flex; align-items: center; gap: 5px; border: 0; border-radius: 10px; padding: 8px 14px; font-size: 12px; font-weight: 800; cursor: pointer; }
        .camino-chat-panel__preview button:first-child { background: var(--clay-accent); color: var(--clay-on-accent); box-shadow: 0 3px 0 var(--clay-accent-deep); }
        .camino-chat-panel__preview button:last-child { background: var(--clay-surface); color: var(--clay-text-muted); border: 1px solid var(--clay-border); }
        .camino-chat-panel__error { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid rgba(248,113,113,.4); border-radius: 12px; background: rgba(248,113,113,.1); color: #dc2626; padding: 10px 13px; font-size: 12px; font-weight: 700; }
        .camino-chat-panel__error button { display: flex; align-items: center; gap: 5px; border: 0; background: transparent; color: #dc2626; font-size: 12px; font-weight: 900; cursor: pointer; }
        .camino-chat-panel__quick { display: flex; gap: 8px; overflow-x: auto; padding: 0 20px 10px; scrollbar-width: none; }
        .camino-chat-panel__quick button { flex: none; border: 1px solid var(--clay-border); border-radius: 999px; background: var(--clay-surface-raised); color: var(--clay-text-muted); padding: 7px 12px; font-size: 11px; font-weight: 700; cursor: pointer; }
        .camino-chat-panel__form { display: flex; gap: 9px; border-top: 1px solid var(--clay-border); padding: 10px 20px; background: var(--clay-surface); }
        .camino-chat-panel__form input { flex: 1; min-width: 0; border: 1px solid var(--clay-border); border-radius: 13px; background: var(--clay-surface-raised); color: var(--clay-text); padding: 11px 13px; font-size: 13px; outline: none; }
        .camino-chat-panel__form input:focus { border-color: var(--clay-accent); }
        .camino-chat-panel__form button { width: 42px; border: 0; border-radius: 12px; background: var(--clay-accent); color: var(--clay-on-accent); display: grid; place-items: center; cursor: pointer; box-shadow: 0 3px 0 var(--clay-accent-deep); }
        .camino-chat-panel__form button:disabled { opacity: .45; box-shadow: none; }
      `}</style>
    </ClayThemeScope>
  )
}
