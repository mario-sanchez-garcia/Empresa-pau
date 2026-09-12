// Lo que ocurre en el instante del clic en "Ir a practicar".
//
// Es el único momento en que sabemos con certeza que el alumno ha decidido
// ponerse con una misión. La página de destino, por sí sola, no puede
// distinguir a quien abre para estudiar de quien abre y cierra — y esperar al
// primer engagement semántico dejaba fuera justo al alumno que abre, lee la
// explicación entera y se va sin tocar nada.
//
// Aquí solo se acuña la identidad del tramo y se deja en sessionStorage. No se
// escribe en red: una petición lanzada justo antes de navegar se cancela con
// la navegación, y no vale la pena montar una vía de autenticación nueva para
// sendBeacon (que no admite cabeceras, y getAuthContext es Bearer-only) cuando
// el destino puede mandarla autenticada dos segundos después.

import { safeSessionStorage, writePendingStart } from './pendingMissionStart.ts'

function mintId(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID()
    }
  } catch { /* seguimos al fallback */ }
  return `seg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Marca el inicio observable de una misión. Silenciosa por diseño: si falla
 * (modo privado, storage bloqueado) el destino cae al primer engagement y la
 * navegación del alumno no se entera de nada.
 */
export function beginMissionObservation(missionId: string | null | undefined): void {
  if (!missionId) return
  writePendingStart(safeSessionStorage(), {
    missionId,
    segmentId: mintId(),
    t0: Date.now(),
  })
}

export { mintId as mintSegmentId }
