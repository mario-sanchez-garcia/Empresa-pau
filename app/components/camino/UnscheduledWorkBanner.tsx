'use client'

import { useEffect, useState } from 'react'
import { ensureServerCalendar } from '@/app/lib/camino/ensureCalendarClient'
import { supabase } from '@/app/lib/supabase'

// Trabajo que NO cabe en el Camino del alumno.
//
// Cuando la planificación no encuentra fecha válida para una misión —porque su
// sitio caía después de la PAU, porque es temario nuevo y solo quedan días de
// la reserva de repaso final, o porque no queda hueco en ninguno de sus días—
// la fila pasa a status 'unscheduled' (ver applyCalendarPersonalization.ts y
// planPlacement.ts). El trabajo NO se pierde: su tema vuelve a la cola.
//
// Pero sin esto, ese estado no se veía en ninguna parte: el alumno tenía menos
// misiones y ninguna explicación, sin poder distinguir "he terminado" de "esto
// no cabe". Este aviso es esa distinción.
//
// NO es descartable a propósito, al revés que ExamCoverageBanner: no es una
// notificación puntual sino una condición del plan que sigue siendo cierta
// mientras haya trabajo sin encajar. Desaparece solo cuando deja de haberlo.

type UnscheduledReason = 'after_exam' | 'final_review_window' | 'no_capacity'

type UnscheduledState = {
  /** Temas ÚNICOS sin encajar. Una tarea reprogramada varias veces cuenta una. */
  needsAvailability: boolean
  examDate: string
  availableDays: number
  pendingTopics: number
  topics: number
  subjects: string[]
  reasons: UnscheduledReason[]
}

const SUBJECT_LABELS: Record<string, string> = {
  matematicas_ii: 'Matemáticas II',
  matematicas_ccss: 'Matemáticas CCSS',
  lengua: 'Lengua',
  historia_espana: 'Historia de España',
  historia_filosofia: 'Historia de la Filosofía',
  fisica: 'Física',
  quimica: 'Química',
  ingles: 'Inglés',
  economia: 'Economía',
}

function subjectLabel(slug: string): string {
  return SUBJECT_LABELS[slug] ?? slug
}

function reasonText(reasons: UnscheduledReason[]): string {
  if (reasons.includes('after_exam')) {
    return 'Su sitio caía después de tu fecha de examen, así que no puede quedarse ahí.'
  }
  if (reasons.includes('final_review_window')) {
    return 'Son lecciones nuevas y ya solo quedan los días reservados a repaso y práctica, que es lo que toca ahora.'
  }
  return 'No queda hueco libre en los días que estudias, contando lo que ya tienes ocupado.'
}

export default function UnscheduledWorkBanner() {
  const [state, setState] = useState<UnscheduledState | null>(null)

  const [error, setError] = useState(false)
  const [saving, setSaving] = useState(false)
  useEffect(() => {
    let cancelled = false
    let generation = 0
    async function load() {
      const version = ++generation
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      try {
        const response = await fetch('/api/camino/plan-status', { headers: { Authorization: `Bearer ${session.access_token}` } })
        if (!response.ok) throw new Error('status_unavailable')
        const next = await response.json()
        if (!cancelled && version === generation) { setState(next); setError(false) }
      } catch { if (!cancelled) setError(true) }
    }
    const failed = () => setError(true)
    void load()
    window.addEventListener('camino:updated', load)
    window.addEventListener('focus', load)
    window.addEventListener('camino:plan-error', failed)
    return () => {
      cancelled = true
      window.removeEventListener('camino:updated', load)
      window.removeEventListener('focus', load)
      window.removeEventListener('camino:plan-error', failed)
    }
  }, [])

  async function retry(acceptEmergency = false) {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('session')
      if (acceptEmergency) {
        const saved = await fetch('/api/camino/plan-status', {
          method: 'POST', headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ acceptEmergency: true }),
        })
        if (!saved.ok) throw new Error('save')
      }
      if (!(await ensureServerCalendar(session.access_token, true))) throw new Error('plan')
      window.location.reload()
    } catch { setError(true) }
    finally { setSaving(false) }
  }

  if (error) return <div role="status" style={{ padding: 16 }}>
    No hemos podido actualizar todo tu Camino. Tu trabajo guardado sigue disponible.{' '}
    <button disabled={saving} onClick={() => void retry()}>Reintentar</button>
  </div>
  if (state?.needsAvailability) return <div role="status" style={{ padding: 16 }}>
    Con tu horario habitual no quedan sesiones antes del examen del {state.examDate}.{' '}
    Puedes habilitar los días restantes, incluido el fin de semana, manteniendo tus minutos diarios.{' '}
    <button disabled={saving} onClick={() => void retry(true)}>Puedo estudiar esos días</button>{' '}
    <a href="/settings">Revisar mi disponibilidad</a>
  </div>
  if (!state || state.topics === 0) return null

  const subjectsText = state.subjects.map(subjectLabel).join(', ')

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px', margin: '12px 20px 0',
      background: '#fff7ed',
      borderLeft: '3px solid #ea580c',
      borderRadius: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3, lineHeight: 1.4 }}>
          {state.topics === 1
            ? '1 tema se queda pendiente de encajar'
            : `${state.topics} temas se quedan pendientes de encajar`}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>
          {reasonText(state.reasons)}
          {subjectsText ? ` Es de ${subjectsText}.` : ''}
          {' '}No se ha perdido nada: sigue en tu temario pendiente. Si quieres que entre,
          puedes añadir días o minutos de estudio en Ajustes, o revisar tu fecha de examen.
        </p>
      </div>
    </div>
  )
}
