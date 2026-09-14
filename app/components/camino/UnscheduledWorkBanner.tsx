'use client'

import { useEffect, useState } from 'react'
import { ensureServerCalendar, type PlanFailure } from '@/app/lib/camino/ensureCalendarClient'
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
  biologia: 'Biología',
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

// Qué le decimos al alumno según lo que falló de verdad. Los pasos los nombra
// el servidor (ensure-calendar los devuelve en `degraded`); el que manda es el
// primero que el alumno pueda entender, porque una lista de pasos internos no
// le dice qué hacer.
const STEP_TEXT: Record<string, string> = {
  calendar_upsert: 'No se pudieron guardar las misiones nuevas de tu calendario.',
  personalization: 'No se pudo recolocar tu calendario con tu disponibilidad de ahora.',
  partials: 'No se pudo preparar el trabajo de alguno de tus exámenes parciales.',
  forced_missions: 'No se pudo colocar el temario que va antes de un examen tuyo.',
  unschedule_past_exam_rows: 'No se pudieron retirar misiones que quedaban después de tu fecha de examen.',
  queue_status_update: 'Tus misiones están, pero no se pudo marcar su temario como programado.',
  weak_reviews: 'No se pudieron añadir los repasos de lo que llevas peor.',
  diagnostics: 'No se pudo añadir tu microdiagnóstico de hoy.',
  ensure_log: 'Tu Camino se actualizó, pero no se pudo registrar que ya tocaba hoy.',
}

function planFailureText(failure: PlanFailure): string {
  if (failure.kind === 'busy') return 'El servidor sigue ocupado con una actualización de tu Camino. Puedes volver a intentarlo en unos momentos.'
  if (failure.kind === 'network') return 'No hemos podido conectar con el servidor.'
  if (failure.kind === 'status') return 'No hemos podido consultar el estado de tu plan.'
  const known = failure.steps.find(step => STEP_TEXT[step])
  if (known) return STEP_TEXT[known]
  return 'Un paso de la planificación no llegó a terminar.'
}

/** Lo justo para localizarlo en los logs, sin nada de la cuenta del alumno. */
function failureCode(failure: PlanFailure): string {
  return failure.steps.length > 0 ? failure.steps.join('+') : `${failure.kind}${failure.status ? `-${failure.status}` : ''}`
}

export default function UnscheduledWorkBanner() {
  const [state, setState] = useState<UnscheduledState | null>(null)

  const [error, setError] = useState<PlanFailure | null>(null)
  const [saving, setSaving] = useState(false)
  const [updating, setUpdating] = useState(false)
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
        if (!cancelled && version === generation) { setState(next); setError(current => current?.kind === 'status' ? null : current) }
      } catch { if (!cancelled && version === generation) setError({ kind: 'status', steps: [], status: null }) }
    }
    // El detalle lo manda ensureServerCalendar; un evento sin detalle (o de
    // una versión anterior del cliente ya cargada) sigue mostrando el aviso.
    const failed = (event: Event) => setError((event as CustomEvent<PlanFailure>).detail
      ?? { kind: 'server', steps: [], status: null })
    void load()
    const updatingPlan = () => { setUpdating(true); setError(null) }
    const idlePlan = () => setUpdating(false)
    window.addEventListener('camino:plan-updating', updatingPlan)
    window.addEventListener('camino:plan-idle', idlePlan)
    const updatedPlan = () => { setError(null); void load() }
    window.addEventListener('camino:updated', updatedPlan)
    window.addEventListener('focus', load)
    window.addEventListener('camino:plan-error', failed)
    return () => {
      cancelled = true
      window.removeEventListener('camino:plan-updating', updatingPlan)
      window.removeEventListener('camino:plan-idle', idlePlan)
      window.removeEventListener('camino:updated', updatedPlan)
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
      if (!(await ensureServerCalendar(session.access_token, true))) return
      window.location.reload()
    } catch { setError({ kind: 'network', steps: [], status: null }) }
    finally { setSaving(false) }
  }

  if (updating) return <div role="status" style={{ padding: '14px 16px', margin: '12px 20px 0' }}>
    Actualizando tu Camino. Puedes seguir consultándolo mientras termina.
  </div>

  if (error) return (
    <div role="status" style={{
      display: 'grid', gap: 6, padding: '14px 16px', margin: '12px 20px 0',
      background: error.kind === 'busy' ? '#fffbeb' : '#fef2f2', borderLeft: `3px solid ${error.kind === 'busy' ? '#d97706' : '#dc2626'}`, borderRadius: 8,
    }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.4 }}>
        {error.kind === 'busy' ? 'La actualización de tu Camino sigue pendiente' : 'No hemos podido terminar de actualizar tu Camino'}
      </p>
      <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>
        {planFailureText(error)}{' '}
        Puedes consultar las misiones guardadas mientras se completa la actualización.
      </p>
      <p>
        <button disabled={saving} onClick={() => void retry()}>
          {saving ? 'Reintentando…' : 'Reintentar'}
        </button>
      </p>
      {failureCode(error) && (
        // El código va delante del alumno a propósito: en beta privada es lo
        // que hace que un informe suyo sea seguible sin reproducir el caso.
        <p style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>
          Si vuelve a pasar, mándanoslo con este código: <code>{failureCode(error)}</code>
        </p>
      )}
    </div>
  )
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
