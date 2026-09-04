'use client'

import { useState, type FormEvent } from 'react'
import ClayButton from '@/components/clay/ClayButton'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Partial<Record<'name' | 'email' | 'subject' | 'message', string>>

export default function ContactForm({ M }: { M: string }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    if (name.trim().length < 2) next.name = 'Escribe tu nombre.'
    if (!EMAIL_RE.test(email.trim())) next.email = 'Ese email no parece válido.'
    if (subject.trim().length < 3) next.subject = 'Cuéntanos brevemente el motivo.'
    if (message.trim().length < 10) next.message = 'Danos un poco más de contexto (mínimo 10 caracteres).'
    return next
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const fieldErrors = validate()
    setErrors(fieldErrors)
    if (Object.keys(fieldErrors).length > 0) return

    setStatus('sending')
    setErrorMsg('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setStatus('error')
        setErrorMsg(data.error || 'No hemos podido enviar tu mensaje. Inténtalo de nuevo en un momento.')
        return
      }
      setStatus('sent')
      setName(''); setEmail(''); setSubject(''); setMessage('')
    } catch {
      setStatus('error')
      setErrorMsg('Parece que no tienes conexión. Comprueba tu red e inténtalo de nuevo.')
    }
  }

  if (status === 'sent') {
    return (
      <div style={{ padding: '28px 24px', borderRadius: 12, background: 'rgba(34,197,94,.08)', border: '1px solid rgba(34,197,94,.25)' }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: '#86efac', margin: '0 0 6px' }}>Mensaje enviado.</p>
        <p style={{ fontSize: 13, color: 'var(--clay-text-muted)', margin: 0, lineHeight: 1.6 }}>
          Te responderemos a tu email en 1–2 días laborables.
        </p>
      </div>
    )
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '11px 14px',
    borderRadius: 10,
    background: 'var(--clay-surface-raised)',
    border: `1px solid ${hasError ? 'rgba(248,113,113,.6)' : 'var(--clay-border)'}`,
    color: 'var(--clay-text)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  })

  const labelStyle: React.CSSProperties = {
    fontFamily: M, fontSize: 10, color: 'var(--clay-text-muted)', letterSpacing: '.1em',
    textTransform: 'uppercase', marginBottom: 6, display: 'block',
  }

  const errorStyle: React.CSSProperties = { fontSize: 12, color: '#f87171', marginTop: 6 }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label htmlFor="contact-name" style={labelStyle}>Nombre</label>
          <input
            id="contact-name"
            className="contact-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle(!!errors.name)}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>
        <div>
          <label htmlFor="contact-email" style={labelStyle}>Email</label>
          <input
            id="contact-email"
            type="email"
            className="contact-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle(!!errors.email)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" style={labelStyle}>Asunto</label>
        <input
          id="contact-subject"
          className="contact-input"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          style={inputStyle(!!errors.subject)}
          aria-invalid={!!errors.subject}
        />
        {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" style={labelStyle}>Mensaje</label>
        <textarea
          id="contact-message"
          className="contact-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          style={{ ...inputStyle(!!errors.message), resize: 'vertical' as const }}
          aria-invalid={!!errors.message}
        />
        {errors.message && <p style={errorStyle}>{errors.message}</p>}
      </div>

      {status === 'error' && (
        <p style={{ fontSize: 13, color: '#f87171', margin: 0 }}>{errorMsg}</p>
      )}

      <ClayButton type="submit" disabled={status === 'sending'} style={{ alignSelf: 'flex-start', borderRadius: 999, padding: '12px 28px', fontSize: 13, letterSpacing: '.04em' }}>
        {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
      </ClayButton>

      <style>{`
        .contact-input:focus { border-color: var(--clay-accent) !important; background: var(--clay-accent-soft) !important; }
        @media (max-width: 560px) {
          .contact-input { font-size: 16px !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </form>
  )
}
