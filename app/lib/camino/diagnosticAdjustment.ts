// Qué filas de la cola cambia un diagnóstico refutado, y cómo.
//
// Puro a propósito: el riesgo real de esta función es tocar de más
// —reconstruir el Camino, pisar trabajo hecho, mover otros bloques— y eso
// tiene que poder comprobarse sin base de datos.
//
// Invariantes que los tests fijan:
//   · solo el bloque diagnosticado
//   · solo filas que aún no han entrado en juego (queue_status 'pending')
//   · solo lo que entró como repaso POR LA DECLARACIÓN
//   · NUNCA se escribe queue_status: ni 'completed' ni ningún otro

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
}

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
    // Trabajo ya hecho, ya programado en el calendario o fuera por otro
    // motivo: intocable. Solo se ajusta lo que todavía no ha empezado.
    if (row.queueStatus !== 'pending') continue

    const meta = metadataObject(row.metadata)
    // Un repaso nacido de otra vía (área débil, por ejemplo) no es asunto de
    // este diagnóstico: solo se revierte lo que la DECLARACIÓN convirtió en
    // repaso.
    if (meta.mission_type !== 'review') continue
    if (typeof meta.declared_start_mode !== 'string') continue

    const { express: _express, ...rest } = meta
    out.push({
      id: row.id,
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
