'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { normalizeCorrectionForOfficialScores, scoreFromCorrection } from '@/app/lib/correctionPrompt'
import { parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import CorrectionResultCard from './CorrectionResultCard'
import RichTextArea from './RichTextArea'
import KairoLoadingDot from './KairoLoadingDot'

export type RepeatExamSource = {
  id: string
  asignatura: string
  tipo?: string | null
  bloque?: string | null
  opcion?: string | null
  año?: number | null
  enunciado: string
  nota_maxima: number | null
}

// "Repetir para mejorar" para la vista de Historial de Exámenes: mismo
// enunciado exacto, nueva respuesta, corregido por el mismo /api/exam/correct
// que ya usa la página de Exámenes. Autocontenido a propósito — no toca el
// árbol de estado de la práctica normal de Exámenes (page-client.tsx es un
// monolito grande y delicado), solo inserta un intento nuevo en
// historial_examenes con repeated_from_id y deja que
// /api/camino/award-exam-xp decida el XP reducido leyendo esa misma fila.
export default function RepeatExamModal({ source, onClose, onDone }: {
  source: RepeatExamSource
  onClose: () => void
  onDone?: (result: { xpAwarded: number; bonusXp: number; nota: number | null; noImprovement: boolean }) => void
}) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [correction, setCorrection] = useState<unknown>(null)
  const [nota, setNota] = useState<number | null>(null)
  const [xpMessage, setXpMessage] = useState('')
  const maxScore = source.nota_maxima ?? 10

  async function submit() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (!accessToken) { setError('Tu sesión ha caducado. Vuelve a iniciar sesión.'); return }

      const res = await fetch('/api/exam/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          subject: source.asignatura,
          examLabel: source.bloque || source.asignatura,
          maxScore,
          officialPrompt: source.enunciado,
          studentAnswer: answer,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = parseCorrectionPayload(data.respuesta ?? data)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const rawScore = normalized ? scoreFromCorrection(normalized, maxScore) : null
      setCorrection(normalized ?? data.respuesta ?? data)
      setNota(rawScore)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return
      const { data: inserted } = await supabase.from('historial_examenes').insert({
        user_id: userData.user.id,
        asignatura: source.asignatura,
        tipo: source.tipo ?? 'Examen',
        año: source.año ?? new Date().getFullYear(),
        bloque: source.bloque ?? null,
        opcion: source.opcion ?? null,
        nota: rawScore,
        nota_maxima: maxScore,
        enunciado: source.enunciado.slice(0, 2000),
        respuesta: answer.slice(0, 4000),
        correccion: normalized ? JSON.stringify(normalized) : JSON.stringify(data),
        repeated_from_id: source.id,
      }).select('id').single()

      if (inserted?.id) {
        try {
          const xpRes = await fetch('/api/camino/award-exam-xp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
            body: JSON.stringify({ historialExamenId: inserted.id }),
          })
          const xpJson = await xpRes.json()
          if (xpJson.success && typeof xpJson.xpAwarded === 'number' && xpJson.xpAwarded > 0) {
            setXpMessage(`+${xpJson.xpAwarded} XP${xpJson.bonusXp > 0 ? ` · +${xpJson.bonusXp} bonus por la nota` : ''} — ¡nota mejorada!`)
            onDone?.({ xpAwarded: xpJson.xpAwarded, bonusXp: xpJson.bonusXp ?? 0, nota: rawScore, noImprovement: false })
          } else {
            setXpMessage('No has mejorado tu mejor nota anterior, así que no hay XP extra esta vez.')
            onDone?.({ xpAwarded: 0, bonusXp: 0, nota: rawScore, noImprovement: true })
          }
        } catch { /* silent */ }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,23,42,.4)', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 640, maxHeight: '88vh', overflowY: 'auto', borderRadius: 20, background: 'white', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#2563eb' }}>Repetir para mejorar</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginTop: 4 }}>{source.bloque || source.asignatura}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" style={{ border: 'none', background: '#f1f5f9', borderRadius: 8, padding: 6, cursor: 'pointer' }}><X size={15} /></button>
        </div>

        <div style={{ borderRadius: 14, border: '1px solid #e2e8f0', background: '#f8fafc', padding: '12px 14px', fontSize: 13, color: '#334155', marginBottom: 14, whiteSpace: 'pre-wrap' }}>
          {source.enunciado}
        </div>

        {!correction ? (
          <>
            <RichTextArea
              value={answer}
              onChange={setAnswer}
              placeholder="Escribe tu nueva respuesta..."
              minHeight={200}
            />
            {error && <p style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{error}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button onClick={onClose} style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontSize: 13, fontWeight: 800, color: '#475569', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={submit} disabled={!answer.trim() || submitting} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#2563eb', fontSize: 13, fontWeight: 800, color: 'white', cursor: submitting ? 'default' : 'pointer', opacity: !answer.trim() || submitting ? .6 : 1 }}>
                {submitting ? (<><KairoLoadingDot /> Corrigiendo…</>) : 'Corregir'}
              </button>
            </div>
          </>
        ) : (
          <>
            {nota != null && (
              <div style={{ marginBottom: 10, fontSize: 22, fontWeight: 900, color: '#0f172a' }}>{nota}/{maxScore}</div>
            )}
            {xpMessage && (
              <div style={{ marginBottom: 14, padding: '8px 12px', borderRadius: 10, background: '#f5f3ff', color: '#6d28d9', fontSize: 12, fontWeight: 800 }}>{xpMessage}</div>
            )}
            <CorrectionResultCard correction={correction} officialMaxScore={maxScore} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={onClose} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: '#0f172a', fontSize: 13, fontWeight: 800, color: 'white', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
