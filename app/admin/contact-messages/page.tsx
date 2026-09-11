'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

// Mismo patron que app/admin/camino-status/page.tsx: C.bg es texto legible
// sobre el fondo claro del cuerpo (--clay-accent-text); la cabecera usa
// --clay-accent-deep explicito (oscuro en los 3 temas) para el texto blanco.
const C = {
  bg: 'var(--clay-accent-text)',
  ink: 'var(--clay-text)',
  muted: 'var(--clay-text-muted)',
  border: 'var(--clay-border)',
  surface: 'var(--clay-surface)',
  shadow: '0 10px 0 var(--clay-shadow-shelf), 0 16px 28px var(--clay-shadow-elevate)',
}

type ContactMessage = {
  id: number
  name: string
  email: string
  subject: string
  message: string
  created_at: string
  is_read: boolean
  respuesta: string | null
  respuesta_at: string | null
  respondido_por: string | null
}

type PageState =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'unauthorized' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; messages: ContactMessage[]; generatedAt: string }

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleString('es-ES', {
      timeZone: 'Europe/Madrid',
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  } catch { return s }
}

function ReadBadge({ isRead }: { isRead: boolean }) {
  const { theme } = useClayThemePreference()
  const dark = theme === 'dark'
  if (isRead) {
    return (
      <span style={{ ...(dark ? { background: 'rgba(52,211,153,0.14)', color: '#34d399', border: '1px solid rgba(52,211,153,0.35)' } : { background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' }), borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
        Leído
      </span>
    )
  }
  return (
    <span style={{ ...(dark ? { background: 'rgba(251,191,36,0.14)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.35)' } : { background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }), borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      Sin leer
    </span>
  )
}

export default function ContactMessagesPage() {
  const [state, setState] = useState<PageState>({ status: 'loading' })
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<number, string>>({})
  const [replyPendingId, setReplyPendingId] = useState<number | null>(null)
  const [replyErrors, setReplyErrors] = useState<Record<number, string>>({})

  async function load() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setState({ status: 'unauthenticated' }); return }
    const res = await fetch('/api/admin/contact-messages', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.status === 403) { setState({ status: 'unauthorized' }); return }
    if (res.status === 401) { setState({ status: 'unauthenticated' }); return }
    if (!res.ok) { setState({ status: 'error', message: `HTTP ${res.status}` }); return }
    const json = await res.json() as { messages: ContactMessage[]; generatedAt: string }
    setState({ status: 'loaded', messages: json.messages, generatedAt: json.generatedAt })
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  async function markAsRead(id: number) {
    setPendingId(id)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setState({ status: 'unauthenticated' }); return }
      const res = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id, is_read: true }),
      })
      if (!res.ok) return
      setState(current => current.status === 'loaded'
        ? { ...current, messages: current.messages.map(m => m.id === id ? { ...m, is_read: true } : m) }
        : current)
    } finally {
      setPendingId(null)
    }
  }

  async function sendReply(id: number) {
    const respuesta = (replyDrafts[id] ?? '').trim()
    if (respuesta.length < 3) {
      setReplyErrors(cur => ({ ...cur, [id]: 'Escribe una respuesta.' }))
      return
    }
    setReplyPendingId(id)
    setReplyErrors(cur => { const next = { ...cur }; delete next[id]; return next })
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { setState({ status: 'unauthenticated' }); return }
      const res = await fetch('/api/admin/contact-messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ id, respuesta }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        setReplyErrors(cur => ({ ...cur, [id]: json.error || 'No se pudo guardar la respuesta.' }))
        return
      }
      const nowIso = new Date().toISOString()
      setState(current => current.status === 'loaded'
        ? { ...current, messages: current.messages.map(m => m.id === id
            ? { ...m, respuesta, respuesta_at: nowIso, respondido_por: session.user.email ?? null }
            : m) }
        : current)
      setReplyDrafts(cur => { const next = { ...cur }; delete next[id]; return next })
    } finally {
      setReplyPendingId(null)
    }
  }

  const { theme } = useClayThemePreference()
  const unreadCount = state.status === 'loaded' ? state.messages.filter(m => !m.is_read).length : 0

  return (
    <ClayThemeScope theme={theme} style={{ minHeight: '100vh' }}>
      {/* ── Header ── */}
      <div style={{ background: 'var(--clay-accent-deep)', padding: '0 32px', boxShadow: '0 2px 20px rgba(0,0,0,0.2)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
              <Link href="/admin" style={{ color: '#bfdbfe', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                ← Panel admin
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <Link href="/" style={{ color: '#bfdbfe', fontSize: 11, fontWeight: 700, textDecoration: 'none', letterSpacing: '0.05em' }}>
                Volver a Kairo
              </Link>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>·</span>
              <span style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#e0f2fe', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em' }}>
                Solo usuarios internos
              </span>
            </div>
            <h1 style={{ color: '#ffffff', fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
              Mensajes de contacto
            </h1>
            {state.status === 'loaded' && (
              <p style={{ color: '#bfdbfe', fontSize: 12, margin: '3px 0 0', fontWeight: 500 }}>
                {state.messages.length} mensaje{state.messages.length !== 1 ? 's' : ''}
                {unreadCount > 0 ? ` · ${unreadCount} sin leer` : ''} · {fmtDate(state.generatedAt)}
              </p>
            )}
          </div>
          <button
            onClick={() => { setState({ status: 'loading' }); load() }}
            disabled={state.status === 'loading'}
            style={{
              background: state.status === 'loading' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: 8, padding: '8px 18px',
              fontSize: 12, fontWeight: 700, cursor: state.status === 'loading' ? 'default' : 'pointer',
              opacity: state.status === 'loading' ? 0.6 : 1,
            }}
          >
            {state.status === 'loading' ? 'Cargando…' : 'Actualizar'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px 48px' }}>
        {state.status === 'loading' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ color: C.muted, fontSize: 15 }}>Cargando mensajes…</p>
          </div>
        )}

        {state.status === 'unauthenticated' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 12 }}>Inicia sesión para acceder.</p>
            <a href="/login" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline' }}>Ir a login →</a>
          </div>
        )}

        {state.status === 'unauthorized' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 18, color: C.ink, fontWeight: 700, marginBottom: 8 }}>No tienes acceso a esta página.</p>
            <p style={{ fontSize: 13, color: C.muted }}>Solo los usuarios del equipo interno pueden ver este panel.</p>
            <Link href="/" style={{ color: C.bg, fontSize: 14, fontWeight: 700, textDecoration: 'underline', display: 'block', marginTop: 16 }}>← Volver a Kairo</Link>
          </div>
        )}

        {state.status === 'error' && (
          <div style={{ textAlign: 'center', marginTop: 80 }}>
            <p style={{ fontSize: 15, color: '#dc2626', fontWeight: 700 }}>Error: {state.message}</p>
            <button onClick={load} style={{ marginTop: 12, color: C.bg, fontSize: 14, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Reintentar
            </button>
          </div>
        )}

        {state.status === 'loaded' && (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
            {state.messages.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', color: C.muted, fontStyle: 'italic', fontSize: 14 }}>
                Sin mensajes de contacto todavía.
              </div>
            ) : (
              <div>
                {state.messages.map((m, i) => {
                  const expanded = expandedId === m.id
                  return (
                    <div key={m.id} style={{ background: i % 2 === 0 ? C.surface : 'var(--clay-surface-raised)', borderBottom: `1px solid ${C.border}` }}>
                      <button
                        type="button"
                        onClick={() => setExpandedId(expanded ? null : m.id)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
                          background: 'transparent', border: 0, textAlign: 'left', cursor: 'pointer', font: 'inherit',
                        }}
                      >
                        <span style={{ flex: '0 0 auto' }}><ReadBadge isRead={m.is_read} /></span>
                        <span style={{ flex: '0 0 150px', fontSize: 11, color: C.muted, whiteSpace: 'nowrap' }}>{fmtDate(m.created_at)}</span>
                        <span style={{ flex: '0 0 180px', fontSize: 12, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</span>
                        <span style={{ flex: '0 0 220px', fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-geist-mono, monospace)' }}>{m.email}</span>
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13, color: C.ink, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subject}</span>
                        <span style={{ flex: '0 0 auto', color: C.muted, fontSize: 11 }}>{expanded ? '▲' : '▼'}</span>
                      </button>
                      {expanded && (
                        <div style={{ padding: '0 16px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <p style={{ margin: 0, fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '12px 14px' }}>
                            {m.message}
                          </p>
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <a
                              href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`}
                              style={{ fontSize: 12, fontWeight: 700, color: C.bg, textDecoration: 'underline' }}
                            >
                              Responder por email →
                            </a>
                            {!m.is_read && (
                              <button
                                type="button"
                                onClick={() => markAsRead(m.id)}
                                disabled={pendingId === m.id}
                                style={{
                                  background: 'var(--clay-accent-soft)', border: '1px solid var(--clay-border)', color: 'var(--clay-accent-text)',
                                  borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700,
                                  cursor: pendingId === m.id ? 'default' : 'pointer', opacity: pendingId === m.id ? 0.6 : 1,
                                }}
                              >
                                {pendingId === m.id ? 'Guardando…' : 'Marcar como leído'}
                              </button>
                            )}
                          </div>

                          {m.respuesta ? (
                            <div style={{ background: 'var(--clay-accent-soft)', border: '1px solid var(--clay-border)', borderRadius: 10, padding: '12px 14px' }}>
                              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>
                                Respuesta{m.respondido_por ? ` de ${m.respondido_por}` : ''}{m.respuesta_at ? ` · ${fmtDate(m.respuesta_at)}` : ''}
                              </p>
                              <p style={{ margin: 0, fontSize: 13, color: C.ink, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                {m.respuesta}
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              <textarea
                                value={replyDrafts[m.id] ?? ''}
                                onChange={(e) => setReplyDrafts(cur => ({ ...cur, [m.id]: e.target.value }))}
                                rows={3}
                                placeholder="Escribe la respuesta para el alumno…"
                                style={{
                                  width: '100%', resize: 'vertical', fontSize: 13, color: C.ink, fontFamily: 'inherit',
                                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: '10px 12px',
                                }}
                              />
                              {replyErrors[m.id] && (
                                <p style={{ margin: 0, fontSize: 12, color: '#dc2626' }}>{replyErrors[m.id]}</p>
                              )}
                              <button
                                type="button"
                                onClick={() => sendReply(m.id)}
                                disabled={replyPendingId === m.id}
                                style={{
                                  alignSelf: 'flex-start', background: 'var(--clay-accent-deep)', border: 0, color: '#fff',
                                  borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 700,
                                  cursor: replyPendingId === m.id ? 'default' : 'pointer', opacity: replyPendingId === m.id ? 0.6 : 1,
                                }}
                              >
                                {replyPendingId === m.id ? 'Enviando…' : 'Responder'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </ClayThemeScope>
  )
}
