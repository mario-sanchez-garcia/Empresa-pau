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
 * Reparte las filas sobre la ventana disponible.
 *
 * El temario nuevo se sirve PRIMERO: tiene la ventana más corta, así que
 * servirlo después le dejaría la capacidad ya gastada por repasos que sí caben
 * más tarde. Dentro de cada grupo se respeta el orden recibido.
 */
export function planPlacement(rows: readonly PlacementRow[], window: PlacementWindow): PlacementDecision {
  const capacity = Math.max(0, Math.floor(window.capacityPerDay))
  const dates = window.dates.filter(date => date < window.examDate)
  const contentDates = dates.filter(date => date < window.planningCutoff)

  const used = new Map<string, number>()
  const placements: PlacementDecision['placements'] = []
  const placed = new Set<string>()

  const place = (row: PlacementRow, candidates: readonly string[]) => {
    for (const date of candidates) {
      const slot = used.get(date) ?? 0
      if (slot >= capacity) continue
      used.set(date, slot + 1)
      placements.push({ id: row.id, date, slot })
      placed.add(row.id)
      return
    }
  }

  for (const row of rows) if (isNewContent(row.missionType)) place(row, contentDates)
  for (const row of rows) if (!isNewContent(row.missionType)) place(row, dates)

  const unscheduled = rows
    .filter(row => !placed.has(row.id))
    .map(row => ({
      id: row.id,
      queueId: row.queueId ?? null,
      reason: unscheduledReason(row, window, contentDates),
    }))

  return { placements, unscheduled }
}

function unscheduledReason(
  row: PlacementRow,
  window: PlacementWindow,
  contentDates: readonly string[],
): UnscheduledReason {
  if (row.scheduledDate >= window.examDate) return 'after_exam'
  if (isNewContent(row.missionType) && contentDates.length === 0) return 'final_review_window'
  return 'no_capacity'
}
