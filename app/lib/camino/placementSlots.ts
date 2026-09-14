/**
 * Las plazas que la tabla `camino_calendar` sólo admite una vez.
 *
 * La restricción `camino_calendar_unique_mission` (migración 20260717120000)
 * es UNIQUE(user_id, scheduled_date, subject, v2_sort_order) y existe para que
 * una misión no se duplique. Sembrar el calendario la respeta desde siempre:
 * el upsert de ensureCaminoCalendar lleva justo esas cuatro columnas en su
 * `onConflict`.
 *
 * Recolocar NO la respetaba. El pase de personalización mueve misiones de
 * fecha, y dos misiones de la misma asignatura que compartan `v2_sort_order`
 * —un tema que aparece más de una vez en el plan, por ejemplo con su repaso—
 * podían caer en el MISMO día. Entonces `camino_apply_placements`, que escribe
 * las 60-70 filas dentro de una única transacción, se abortaba entera por esa
 * colisión: la personalización quedaba en `error`, la ruta respondía
 * `degraded: ['personalization']`, y el alumno veía "no hemos podido terminar
 * de actualizar tu Camino" en cada carga, sin que nada llegara a moverse nunca.
 * Como el resultado no cambiaba, el siguiente intento colisionaba igual.
 *
 * De ahí que esto sea una plaza OCUPADA y no un conflicto a resolver después:
 * un día que ya tiene esa plaza tomada sencillamente no es una fecha elegible
 * para esa misión, igual que un día sin hueco horario. Se prueba la siguiente.
 *
 * Las filas con `v2_sort_order` nulo (los parciales) quedan fuera: en SQL dos
 * NULL nunca son iguales, así que la restricción no las alcanza.
 */

/** Identidad de la plaza. Null cuando la fila no está sujeta a la restricción. */
export function missionSlotKey(
  scheduledDate: string | null,
  subject: string | null,
  v2SortOrder: number | null,
): string | null {
  if (v2SortOrder === null || v2SortOrder === undefined) return null
  if (!scheduledDate || !subject) return null
  return `${scheduledDate}|${subject}|${v2SortOrder}`
}

export type SlotRow = { scheduled_date: string | null; subject: string | null; v2_sort_order: number | null }

/**
 * Ocupación viva del calendario durante un pase de recolocación.
 *
 * Se siembra con TODAS las filas del alumno, también las que este pase no va a
 * tocar (completadas, falladas, manuales, superseded): la restricción no mira
 * el estado, así que una fila inmóvil ocupa su plaza igual. Cuando una misión
 * se recoloca, libera la plaza que dejaba y toma la nueva.
 */
export class MissionSlots {
  private readonly taken = new Set<string>()

  constructor(rows: Iterable<SlotRow>) {
    for (const row of rows) {
      const key = missionSlotKey(row.scheduled_date, row.subject, row.v2_sort_order)
      if (key) this.taken.add(key)
    }
  }

  /** ¿Cabe esta misión en esta fecha sin chocar con la restricción? */
  available(date: string, row: SlotRow): boolean {
    const key = missionSlotKey(date, row.subject, row.v2_sort_order)
    if (!key) return true
    // Su propia plaza actual no la bloquea: quedarse donde está es válido.
    if (key === missionSlotKey(row.scheduled_date, row.subject, row.v2_sort_order)) return true
    return !this.taken.has(key)
  }

  /** Confirma el movimiento: libera la plaza de origen y toma la de destino. */
  move(date: string, row: SlotRow): void {
    const from = missionSlotKey(row.scheduled_date, row.subject, row.v2_sort_order)
    const to = missionSlotKey(date, row.subject, row.v2_sort_order)
    if (!to) return
    if (from && from !== to) this.taken.delete(from)
    this.taken.add(to)
  }
}
