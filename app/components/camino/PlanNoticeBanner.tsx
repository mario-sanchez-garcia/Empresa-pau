'use client'

import { useEffect, useState } from 'react'
import { getLastPlanNotices, type PlanNoticeState } from '@/app/lib/camino/ensureCalendarClient'

// Dos cosas que el Camino decide y que el alumno tiene derecho a saber.
//
// 1. RECORTE POR ACCESO. El alumno pudo guardar 6 días de estudio con un plan
//    que llegaba a tanto; si ese acceso caduca o baja, el plan se recalcula con
//    los días que su acceso permite HOY. El contexto ya lo medía
//    (`availabilityExceedsAccess`, `requestedWeeklyStudyDays`) desde que se
//    arregló el desajuste entre selector y motor, pero no lo leía nadie: el
//    recorte era correcto y aun así invisible. Un calendario que de pronto
//    tiene menos días, sin explicación, se lee como que la app ha perdido
//    trabajo.
//
// 2. CONFLICTO PROTEGIDO. Una misión que el alumno bloqueó o movió a mano y que
//    ha quedado en una fecha imposible —en o después de su fecha objetivo— NO
//    se toca: se le enseña. Moverla por detrás sería deshacer una decisión
//    suya, y que no se borre la fila no hace inocuo el cambio.
//
// Ninguno de los dos es descartable: no son notificaciones puntuales sino
// condiciones del plan que siguen siendo ciertas hasta que dejan de serlo.

type AvailabilityCap = NonNullable<PlanNoticeState['availability']>

function dias(n: number | null | undefined) {
  return n === 1 ? '1 día' : `${n ?? 0} días`
}

export default function PlanNoticeBanner() {
  // Arranca con el último estado conocido, no en blanco: el banner se monta
  // antes de que conteste la petición, y tras una recarga el aviso debe seguir
  // ahí mientras su causa siga ahí.
  const [notices, setNotices] = useState<PlanNoticeState | null>(() =>
    typeof window === 'undefined' ? null : getLastPlanNotices())

  useEffect(() => {
    // Un único evento con el estado COMPLETO. Con un evento por problema no
    // había forma de expresar "ya no ocurre", así que el aviso no se retiraba
    // nunca; ahora cada respuesta reemplaza el estado entero.
    const onNotices = (event: Event) => setNotices((event as CustomEvent<PlanNoticeState>).detail ?? null)
    // El estado inicial ya sale de getLastPlanNotices(), así que una respuesta
    // anterior a este montaje (navegación dentro de la app) también se pinta.
    window.addEventListener('camino:plan-notices', onNotices)
    return () => window.removeEventListener('camino:plan-notices', onNotices)
  }, [])

  const cap: AvailabilityCap | null = notices?.availability ?? null
  const protectedCount = notices?.protectedConflicts.length ?? 0

  if (!cap && protectedCount === 0) return null

  return (
    <div style={{ display: 'grid', gap: 10 }}>
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
          {dias(cap.accessMaxStudyDaysPerWeek)}. Hemos recolocado tus misiones en
          esos días — no se ha perdido ninguna.
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
