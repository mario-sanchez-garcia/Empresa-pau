'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type ContactMessage = {
  id: number
  subject: string
  message: string
  created_at: string
  respuesta: string | null
  respuesta_at: string | null
  respuesta_leida: boolean
}

type State =
  | { status: 'loading' }
  | { status: 'signed-out' }
  | { status: 'empty' }
  | { status: 'error' }
  | { status: 'loaded'; messages: ContactMessage[] }

function fmtDate(s: string): string {
  try {
    return new Date(s).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch { return s }
}

// Historial de mensajes del alumno a /contacto y la respuesta del admin, si
// la hay. Lee directo con el cliente de Supabase (no una API route): la RLS
// de contact_messages (ver migracion add_contact_messages_response) solo
// deja ver filas cuyo email coincide con el del JWT de la sesion, asi que un
// alumno nunca puede ver mensajes de otro aunque cambiemos este componente.
export default function ContactanosWidget() {
  const [state, setState] = useState<State>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        if (!cancelled) setState({ status: 'signed-out' })
        return
      }

      const { data, error } = await supabase
        .from('contact_messages')
        .select('id, subject, message, created_at, respuesta, respuesta_at, respuesta_leida')
        .order('created_at', { ascending: false })

      if (cancelled) return

      if (error) {
        console.error('[ContactanosWidget] load failed:', error.message)
        setState({ status: 'error' })
        return
      }

      const messages = (data ?? []) as ContactMessage[]
      if (messages.length === 0) {
        setState({ status: 'empty' })
        return
      }
      setState({ status: 'loaded', messages })

      const unread = messages.filter(m => m.respuesta && !m.respuesta_leida).map(m => m.id)
      if (unread.length > 0) {
        try {
          await fetch('/api/contact-messages', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({ ids: unread }),
          })
        } catch {
          // Best-effort: si falla, la respuesta sigue visible, solo no se marca como leida.
        }
      }
    }

    void load()
    return () => { cancelled = true }
  }, [])

  if (state.status === 'loading' || state.status === 'signed-out' || state.status === 'error') return null

  if (state.status === 'empty') {
    return (
      <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 24px' }}>
        Todavía no nos has escrito ningún mensaje.
      </p>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 24 }}>
      {state.messages.map((m) => (
        <div
          key={m.id}
          style={{ padding: '18px 20px', background: 'white', borderRadius: 10, border: '1px solid #e2e8f0' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
            <p style={{ fontSize: 14, fontWeight: 900, color: '#0f172a', margin: 0 }}>{m.subject}</p>
            <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap' }}>{fmtDate(m.created_at)}</span>
          </div>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, margin: '0 0 12px', whiteSpace: 'pre-wrap' }}>
            {m.message}
          </p>

          {m.respuesta ? (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '12px 14px' }}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#2563eb' }}>
                Respuesta del equipo{m.respuesta_at ? ` · ${fmtDate(m.respuesta_at)}` : ''}
              </p>
              <p style={{ margin: 0, fontSize: 13, color: '#1e3a8a', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {m.respuesta}
              </p>
            </div>
          ) : (
            <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#b45309' }}>
              Pendiente de respuesta del equipo.
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
