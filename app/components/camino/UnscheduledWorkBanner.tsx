'use client'

import { useEffect, useState } from 'react'
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

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user.id
      if (!userId) return
      try {
        const { data, error } = await supabase
          .from('camino_calendar')
          .select('subject, v2_sort_order, metadata')
          .eq('user_id', userId)
          .eq('status', 'unscheduled')
          .limit(200)
        if (cancelled || error || !data || data.length === 0) return

        // Un mismo tema puede haber pasado por 'unscheduled' más de una vez
        // (se recolocó, volvió a no caber). Contar filas inflaría el número:
        // lo que el alumno necesita saber es cuánto TEMARIO queda sin encajar.
        const seen = new Set<string>()
        const subjects = new Set<string>()
        const reasons = new Set<UnscheduledReason>()
        for (const row of data) {
          const meta = (row.metadata ?? {}) as Record<string, unknown>
          const topicKey = typeof meta.topic_slug === 'string' && meta.topic_slug
            ? `${row.subject}:${meta.topic_slug}`
            : `${row.subject}:${row.v2_sort_order ?? 'sin-tema'}`
          seen.add(topicKey)
          subjects.add(String(row.subject))
          const reason = meta.unscheduled_reason
          if (reason === 'after_exam' || reason === 'final_review_window' || reason === 'no_capacity') {
            reasons.add(reason)
          }
        }
        if (cancelled) return
        setState({ topics: seen.size, subjects: [...subjects], reasons: [...reasons] })
      } catch { /* el aviso nunca bloquea la página */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

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
