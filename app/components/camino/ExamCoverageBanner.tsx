'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

const DISMISSED_KEY = 'kairo_exam_coverage_dismissed_v1'

// Aviso amable cuando la compresión de ritmo (ver injectPartialExamMissions.ts
// / examCoverage.ts) no llega al 100% de cobertura del Curso antes de la
// fecha de un examen — mismo patrón que WeeklyCheckinBanner (banner
// descartable, se auto-consulta al montar, tono familiar, sin
// infraestructura nueva). La señal ya viaja en camino_calendar.metadata
// (exam_coverage_decision/exam_coverage_pct), escrita por
// injectPartialExamMissions.ts en cualquier misión de ese examen — no hace
// falta ninguna tabla ni endpoint nuevo para leerla.
type CoverageState = {
  examId: string
  subjectLabel: string
  blockDisplay: string
  decision: 'partial' | 'cancelled' | 'monthly_limit'
  coveragePct: number
}

function loadDismissed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function markDismissed(key: string) {
  try {
    const current = loadDismissed()
    current[key] = true
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(current))
  } catch { /* localStorage no disponible — el banner simplemente puede reaparecer */ }
}

export default function ExamCoverageBanner() {
  const [state, setState] = useState<CoverageState | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user.id
      if (!userId) return
      try {
        const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
        const { data, error } = await supabase
          .from('camino_calendar')
          .select('subject, metadata')
          .eq('user_id', userId)
          .eq('source', 'partial')
          .gte('metadata->>partial_exam_date', today)
          .in('metadata->>exam_coverage_decision', ['partial', 'cancelled', 'monthly_limit'])
          .order('metadata->>partial_exam_date', { ascending: true })
          .limit(1)
        if (cancelled || error || !data || data.length === 0) return

        const row = data[0]
        const meta = (row.metadata ?? {}) as Record<string, unknown>
        const examId = typeof meta.partial_exam_id === 'string' ? meta.partial_exam_id : ''
        const decision = meta.exam_coverage_decision as 'partial' | 'cancelled' | 'monthly_limit'
        if (!examId || (decision !== 'partial' && decision !== 'cancelled' && decision !== 'monthly_limit')) return

        const dismissed = loadDismissed()
        const dismissKey = `${examId}:${decision}`
        if (dismissed[dismissKey]) return

        setState({
          examId,
          subjectLabel: String(meta.simulacro_subject ?? row.subject ?? 'esta asignatura') === 'historia' ? 'Historia' : String(meta.simulacro_subject ?? row.subject ?? ''),
          blockDisplay: typeof meta.target_block_display === 'string' ? meta.target_block_display : '',
          decision,
          coveragePct: typeof meta.exam_coverage_pct === 'number' ? meta.exam_coverage_pct : 0,
        })
      } catch { /* el aviso es un nice-to-have, nunca bloquea la página */ }
    }
    load()
    return () => { cancelled = true }
  }, [])

  if (!state) return null

  function dismiss() {
    if (!state) return
    markDismissed(`${state.examId}:${state.decision}`)
    setState(null)
  }

  const contextLabel = state.blockDisplay ? `${state.subjectLabel} — ${state.blockDisplay}` : state.subjectLabel

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 12,
      padding: '14px 16px', margin: '12px 20px 0',
      background: state.decision === 'partial' ? '#f8fafc' : '#fff7ed',
      borderLeft: `3px solid ${state.decision === 'partial' ? '#2563eb' : '#ea580c'}`,
      borderRadius: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 3, lineHeight: 1.4 }}>
          {state.decision === 'partial'
            ? `Vamos a apretar un poco esta semana para llegar a tiempo a tu examen de ${contextLabel}`
            : state.decision === 'monthly_limit'
              ? `Ya usaste tus Simulacros completos de este mes`
              : `No nos ha dado tiempo a verlo todo antes de tu examen de ${contextLabel}`}
        </p>
        <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.5 }}>
          {state.decision === 'partial'
            ? `Verás más lecciones de Curso de lo normal estos días para llegar cubriendo ~${state.coveragePct}% antes del examen. No pasa nada, es lo normal cuando un examen se acerca.`
            : state.decision === 'monthly_limit'
              ? `Tu plan incluye un número limitado de Simulacros completos al mes, y ya los has usado todos — no te vamos a generar uno nuevo para ${contextLabel} este mes. Sigue practicando con normalidad, vuelve a estar disponible el mes que viene.`
              : `Hemos cubierto ~${state.coveragePct}% del Curso de esos temas, así que esta vez no vamos a generarte el Simulacro completo — no compensa hacerlo sin verlo antes. Sigue con lo que ya hemos visto, el resto de tu Camino sigue igual.`}
        </p>
      </div>
      <button
        onClick={dismiss}
        style={{ flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 2, marginTop: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        aria-label="Ahora no"
      >
        <X size={15} />
      </button>
    </div>
  )
}
