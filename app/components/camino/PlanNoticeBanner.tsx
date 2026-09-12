'use client'

import { usePlanOverview } from '@/app/hooks/usePlanOverview'
import CoverageForecastCard from './CoverageForecastCard'

function dias(n: number | null | undefined) {
  return n === 1 ? '1 día' : `${n ?? 0} días`
}

export default function PlanNoticeBanner() {
  const { state, error } = usePlanOverview()
  const cap = state?.notices.availability ?? null
  const protectedCount = state?.notices.protectedConflicts.length ?? 0
  if (error) return <p role="status">No se pudo actualizar la previsión de tu Camino. <button onClick={() => window.dispatchEvent(new Event('camino:updated'))}>Reintentar</button></p>
  if (!state) return null


  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <CoverageForecastCard forecast={state.forecast} />
      {cap && (
        <div
          role="status"
          style={{
            borderRadius: 14,
            border: '1px solid #fcd34d',
            background: '#fffbeb',
            padding: '12px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#78350f',
          }}
        >
          <strong style={{ display: 'block', fontWeight: 900, marginBottom: 4 }}>
            Tu plan usa {dias(cap.effectiveWeeklyStudyDays)} a la semana
          </strong>
          Elegiste {dias(cap.requestedWeeklyStudyDays)}, pero tu acceso
          {cap.accessLabel ? ` (${cap.accessLabel})` : ''} llega a{' '}
          {dias(cap.accessMaxStudyDaysPerWeek)}. El trabajo que no encuentra hueco queda pendiente de programar.
        </div>
      )}
      {protectedCount > 0 && (
        <div
          role="status"
          style={{
            borderRadius: 14,
            border: '1px solid #fdba74',
            background: '#fff7ed',
            padding: '12px 14px',
            fontSize: 13,
            fontWeight: 600,
            color: '#7c2d12',
          }}
        >
          <strong style={{ display: 'block', fontWeight: 900, marginBottom: 4 }}>
            {protectedCount === 1
              ? '1 misión tuya queda después de tu fecha objetivo'
              : `${protectedCount} misiones tuyas quedan después de tu fecha objetivo`}
          </strong>
          La fijaste tú, así que no la hemos movido. Cámbiala de fecha desde el
          calendario si quieres que entre en el plan.
        </div>
      )}
    </div>
  )
}
