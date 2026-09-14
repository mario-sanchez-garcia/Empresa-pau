// El RITMO del temario nuevo: cuántos minutos de contenido sin ver puede
// recibir un día para que el curso llegue entero a la PAU en vez de agotarse
// en ocho semanas.
//
// El problema que resuelve, reproducido con el temario real (Matemáticas II,
// Historia de España, Lengua y Física: 308 temas, ~7.700 minutos) y la
// disponibilidad máxima de la beta (180 min × 6 días, PAU del 07/06/2027):
// el motor llenaba cada día hasta su presupuesto con lo primero de la cola,
// así que colocaba TODO el temario entre el 14/09 y el 06/11 y dejaba 173 de
// los 218 días de estudio —el 79% del curso— sin una sola misión. El alumno
// lo veía como semanas en blanco ("Aún sin planificar"), y elegir MÁS
// disponibilidad empeoraba el efecto porque vaciaba la cola antes.
//
// Dos consecuencias, no una: además de los huecos, un alumno de 2º de
// Bachillerato acababa estudiando en octubre temario que su instituto da en
// marzo. El ritmo existe tanto para que no haya días vacíos como para que el
// Camino no se despegue del curso académico.
//
// Puro y sin Supabase: "el temario cabe y termina con margen" tiene que poder
// comprobarse en aislamiento, igual que planWindow.ts.

import { REFERENCE_MISSION_MINUTES } from './xpMap.ts'

/**
 * Porción final de los días de estudio que NO recibe temario nuevo.
 *
 * No es la ventana de repaso final (FINAL_REVIEW_RESERVED_STUDY_DAYS, que se
 * mide en días y va pegada al examen): es un tramo proporcional al curso que
 * queda reservado a consolidar. Con 218 días de estudio son ~54 días —algo
 * más de dos meses— en los que el alumno ya no ve nada nuevo y solo repasa,
 * practica y hace simulacros.
 */
export const CONSOLIDATION_RESERVE_RATIO = 0.25

/**
 * Los días de estudio en los que SÍ puede entrar temario nuevo.
 *
 * Recibe la lista completa de días de planificación (planWindow.planningDates)
 * y recorta el tramo final de consolidación. Nunca devuelve vacío mientras
 * haya un solo día: quedarse sin fechas donde colocar temario es peor que
 * colocarlo sin margen.
 */
export function contentPaceDates(studyDates: readonly string[]): string[] {
  if (studyDates.length === 0) return []
  const reserved = Math.floor(studyDates.length * CONSOLIDATION_RESERVE_RATIO)
  return studyDates.slice(0, Math.max(1, studyDates.length - reserved))
}

/**
 * Minutos de temario nuevo que admite UN día.
 *
 * Reparte lo que queda de temario entre los días que quedan para cerrarlo. Se
 * recalcula en cada ejecución, así que el ritmo se corrige solo: quien se
 * adelanta recibe menos y quien se atrasa, más.
 *
 * Nunca frena a quien va justo. Si el temario pendiente no cabe repartido
 * —porque el alumno empezó tarde, declaró poca disponibilidad o arrastra
 * atrasos—, el reparto pide más minutos de los que tiene el día y el tope se
 * queda en el presupuesto diario completo: exactamente el comportamiento de
 * antes. El ritmo solo actúa cuando SOBRA tiempo, que es cuando se producían
 * los huecos.
 */
export function dailyNewContentBudget(input: {
  /** Minutos estimados de todo el temario que todavía no tiene sitio. */
  pendingContentMinutes: number
  /** Días de estudio que quedan para cerrar el temario (contentPaceDates). */
  paceStudyDays: number
  /** Presupuesto diario declarado por el alumno. */
  dailyMinutes: number
  /** Suelo: por debajo de una misión de referencia el día se queda en nada. */
  minimumMinutes?: number
}): number {
  const { pendingContentMinutes, paceStudyDays, dailyMinutes } = input
  if (!(dailyMinutes > 0)) return 0
  // Sin temario pendiente o sin tramo donde repartirlo no hay nada que frenar.
  if (paceStudyDays <= 0 || pendingContentMinutes <= 0) return dailyMinutes
  const minimum = Math.min(dailyMinutes, input.minimumMinutes ?? REFERENCE_MISSION_MINUTES)
  const evenShare = Math.ceil(pendingContentMinutes / paceStudyDays)
  return Math.max(minimum, Math.min(dailyMinutes, evenShare))
}

/**
 * ¿Cabe UNA misión más de temario nuevo en este día?
 *
 * No basta con `ya colocado + duración <= tope`: las misiones son indivisibles
 * y el tope casi nunca es múltiplo de su duración. Con un tope de 48 minutos y
 * misiones de 25, esa comparación coloca UNA al día (25) y rechaza la segunda
 * (50 > 48), así que el ritmo real cae a la mitad del calculado y el temario
 * deja de caber antes del examen — reproducido: 96 temas de 308 se quedaban
 * sin fecha pese a haber sitio de sobra.
 *
 * Se redondea al múltiplo más cercano en vez de truncar: la misión entra si no
 * se pasa del tope en más de media misión. El error queda repartido en torno a
 * cero y, cuando se pasa, se pasa por arriba — terminar el temario un poco
 * antes es el lado seguro.
 *
 * El día nunca se queda a cero: sin nada colocado todavía, siempre cabe.
 */
export function admitsMoreNewContent(input: {
  /** Minutos de temario nuevo que ese día ya tiene. */
  scheduledMinutes: number
  /** Duración de la misión que se quiere añadir. */
  missionMinutes: number
  /** Tope del día (dailyNewContentBudget). */
  dailyBudget: number
}): boolean {
  if (input.scheduledMinutes <= 0) return true
  return input.scheduledMinutes + input.missionMinutes / 2 <= input.dailyBudget
}
