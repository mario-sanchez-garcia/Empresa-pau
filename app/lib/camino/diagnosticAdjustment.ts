// Qué filas de la cola cambia un diagnóstico refutado, y cómo.
//
// Puro a propósito: el riesgo real de esta función es tocar de más
// —reconstruir el Camino, pisar trabajo hecho, mover otros bloques— y eso
// tiene que poder comprobarse sin base de datos.
//
// Invariantes que los tests fijan:
//   · solo el bloque diagnosticado
//   · solo trabajo que AÚN NO HA EMPEZADO ('pending' o 'scheduled')
//   · solo lo que entró como repaso POR LA DECLARACIÓN
//   · NUNCA se escribe queue_status: ni 'completed' ni ningún otro
//   · idempotente: aplicarlo dos veces no cambia nada la segunda
//
// Sobre 'scheduled': antes solo se ajustaban las filas 'pending', con el
// argumento de que una fila programada "ya está en juego". No lo está. El
// calendario siembra 30 días por delante, así que en un bloque recién
// diagnosticado la mayoría de sus temas ya estaban PROGRAMADOS pero sin
// empezar — y se quedaban como repaso express justo después de que el alumno
// demostrara que no domina el bloque (reproducido: una fila programada
// devolvía cero cambios). Lo que de verdad no se puede tocar es el trabajo
// EMPEZADO o HECHO, y eso lo marcan 'completed' y la fila de calendario, no
// 'scheduled'. Las fechas no se mueven: cambia el contenido de la misión, no
// cuándo toca.

export type QueueRowForAdjustment = {
  id: string
  subject: string
  blockSlug: string | null
  queueStatus: string
  metadata: Record<string, unknown> | null
}

export type QueueAdjustment = {
  id: string
  metadata: Record<string, unknown>
  /** El estado de cola de la fila. NO se escribe: sirve para saber si además hay misión de calendario que corregir. */
  queueStatus: string
}

/** Estados de cola cuyo trabajo todavía no ha empezado. */
export const ADJUSTABLE_QUEUE_STATUSES: readonly string[] = ['pending', 'scheduled']

function metadataObject(value: Record<string, unknown> | null | undefined) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
}

/**
 * Filas que deben volver de "repaso express" a "lección completa" tras un
 * diagnóstico refutado, con su metadata nueva ya calculada.
 *
 * Devuelve SOLO metadata. Nada de estado de cola, nada de borrar, nada de
 * recrear: ajustar el punto de entrada futuro no es reconstruir el plan.
 */
export function planQueueAdjustment(
  rows: QueueRowForAdjustment[],
  context: { subject: string; blockSlug: string; at: string },
): QueueAdjustment[] {
  const out: QueueAdjustment[] = []
  for (const row of rows) {
    if (row.subject !== context.subject) continue
    if (row.blockSlug !== context.blockSlug) continue
    // Trabajo ya hecho, o fuera del plan por otro motivo ('completed',
    // 'inactive'…): intocable. 'scheduled' SÍ entra: tiene fecha, pero el
    // alumno no la ha empezado, y esa fecha no se toca.
    if (!ADJUSTABLE_QUEUE_STATUSES.includes(row.queueStatus)) continue

    const meta = metadataObject(row.metadata)
    // Un repaso nacido de otra vía (área débil, por ejemplo) no es asunto de
    // este diagnóstico: solo se revierte lo que la DECLARACIÓN convirtió en
    // repaso.
    if (meta.mission_type !== 'review') continue
    if (typeof meta.declared_start_mode !== 'string') continue

    const { express: _express, ...rest } = meta
    out.push({
      id: row.id,
      queueStatus: row.queueStatus,
      metadata: {
        ...rest,
        mission_type: 'concept',
        reverted_by_diagnostic: true,
        reverted_at: context.at,
      },
    })
  }
  return out
}
