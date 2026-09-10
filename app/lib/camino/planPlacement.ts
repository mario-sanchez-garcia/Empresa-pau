// QUÉ fila va a QUÉ fecha, y cuáles no caben. Puro y sin Supabase.
//
// Existe porque la parte arriesgada de la personalización del calendario no es
// escribir en base de datos, sino decidir. Y esa decisión tenía dos fallos que
// solo se ven razonando sobre datos concretos:
//
//  1. Una sola ventana para todo. El temario nuevo NO puede entrar en la
//     reserva de repaso final —esa reserva existe justamente para no tener
//     lecciones nuevas la última semana— pero la práctica y el repaso sí. Con
//     una ventana única, una lección del curso acababa dentro de la reserva.
//
//  2. La fila que no encontraba fecha se quedaba con la que ya tenía. Una
//     misión pendiente el 08/06, con la PAU el 07/06, seguía mostrándose como
//     trabajo programado normal. No moverla evita movimientos absurdos, pero
//     no representa el problema: lo honesto es decir que no cabe.
//
// El trabajo NUNCA se pierde. Una fila sin sitio queda marcada, contada y con
// su tema de vuelta en la cola para replanificarse.

export type PlacementRow = {
  id: string
  scheduledDate: string
  /** mission_type de la fila (o de su metadata). */
  missionType: string | null
  /** Fila de user_learning_queue que la originó, si la hay. */
  queueId?: string | null
}

export type PlacementWindow = {
  /** Fechas de estudio disponibles, en orden, todas anteriores al examen. */
  dates: readonly string[]
  /** Misiones que caben en un día. */
  capacityPerDay: number
  /** Primer día de la reserva de repaso final: el temario nuevo no la cruza. */
  planningCutoff: string
  /** Fecha objetivo. Nada la alcanza. */
  examDate: string
}

export type PlacementDecision = {
  /** Fila → fecha nueva y hueco del día (0-based). */
  placements: Array<{ id: string; date: string; slot: number }>
  /** Filas sin sitio, con el motivo. */
  unscheduled: Array<{ id: string; queueId?: string | null; reason: UnscheduledReason }>
}

export type UnscheduledReason =
  /** Su fecha actual está en o después del examen. */
  | 'after_exam'
  /** Es temario nuevo y solo quedan días de la reserva de repaso final. */
  | 'final_review_window'
  /** No queda hueco en ningún día disponible. */
  | 'no_capacity'

/**
 * Temario NUEVO. El repaso, la práctica y los simulacros no lo son: pueden —y
 * deben— caer dentro de la reserva final.
 */
export function isNewContent(missionType: string | null | undefined): boolean {
  const type = missionType ?? 'concept'
  return type === 'concept' || type === 'comment_text'
}

/**
 * Fechas en las que ESTA misión puede caer, en orden de preferencia.
 *
 * Es la regla, y la comparten la decisión pura de aquí y el ejecutor que habla
 * con el scheduler real (applyCalendarPersonalization). Cuando cada uno tenía
 * la suya, el ejecutor probaba UNA fecha y, si ese día no tenía hueco horario,
 * declaraba la misión sin sitio aunque hubiera días libres después.
 */
export function eligibleDatesFor(
  missionType: string | null | undefined,
  window: PlacementWindow,
): string[] {
  const dates = window.dates.filter(date => date < window.examDate)
  return isNewContent(missionType) ? dates.filter(date => date < window.planningCutoff) : dates
}

/**
 * Orden de servicio: el temario nuevo primero.
 *
 * Tiene la ventana más corta, así que servirlo después le dejaría la capacidad
 * ya gastada por repasos que sí caben más tarde.
 */
export function orderRowsForPlacement<T extends PlacementRow>(rows: readonly T[]): T[] {
  return [...rows.filter(row => isNewContent(row.missionType)), ...rows.filter(row => !isNewContent(row.missionType))]
}

/**
 * Por qué una fila se ha quedado sin sitio.
 *
 * `no_capacity` significa que se agotaron TODOS sus días elegibles, no que
 * falló el primero.
 */
export function unscheduledReasonFor(row: PlacementRow, window: PlacementWindow): UnscheduledReason {
  if (row.scheduledDate >= window.examDate) return 'after_exam'
  if (isNewContent(row.missionType) && eligibleDatesFor(row.missionType, window).length === 0) {
    return 'final_review_window'
  }
  return 'no_capacity'
}

/**
 * ¿Se puede usar este hueco concreto?
 *
 * El ejecutor real pasa aquí la comprobación del scheduler (la agenda propia
 * del alumno: clase, extraescolares). Por defecto, sí: la decisión pura solo
 * razona sobre capacidad de sesiones.
 */
export type CanUseSlot = (row: PlacementRow, date: string, slot: number) => boolean

/**
 * Reparte las filas sobre la ventana disponible.
 *
 * Una fila solo se declara sin sitio cuando ha recorrido TODAS sus fechas
 * elegibles. Un día lleno —de sesiones o de agenda propia— hace pasar a la
 * fecha siguiente, nunca abandonar la misión.
 */
export function planPlacement(
  rows: readonly PlacementRow[],
  window: PlacementWindow,
  canUse: CanUseSlot = () => true,
): PlacementDecision {
  const capacity = Math.max(0, Math.floor(window.capacityPerDay))

  const used = new Map<string, number>()
  const placements: PlacementDecision['placements'] = []
  const placed = new Set<string>()

  for (const row of orderRowsForPlacement(rows)) {
    for (const date of eligibleDatesFor(row.missionType, window)) {
      const slot = used.get(date) ?? 0
      if (slot >= capacity) continue
      // Sin hueco real ese día se prueba el SIGUIENTE día elegible. La
      // capacidad de este no se consume: sigue libre para otra misión más
      // corta o de otra asignatura.
      if (!canUse(row, date, slot)) continue
      used.set(date, slot + 1)
      placements.push({ id: row.id, date, slot })
      placed.add(row.id)
      break
    }
  }

  const unscheduled = rows
    .filter(row => !placed.has(row.id))
    .map(row => ({
      id: row.id,
      queueId: row.queueId ?? null,
      reason: unscheduledReasonFor(row, window),
    }))

  return { placements, unscheduled }
}
