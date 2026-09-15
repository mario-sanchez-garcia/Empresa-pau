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

// ── Presupuesto ACUMULADO ────────────────────────────────────────────────
//
// dailyNewContentBudget/admitsMoreNewContent reparten el ritmo DÍA A DÍA: un
// presupuesto de 36 min con sesiones de 30 redondea a "cabe una" y tira los
// 6 min sobrantes — CADA DÍA, para siempre, porque el sobrante nunca se lleva
// al día siguiente. Reproducido con el temario real: 44 de 119 días sin una
// sola lección nueva pese a tener más de 100 temas pendientes, porque ese
// hueco lo ocupaba el repaso en su lugar.
//
// Dos arreglos probados y descartados el mismo día (15/09/2026):
//   1. Presupuesto independiente por asignatura — arregla el síntoma pero
//      ROMPE LA IDEMPOTENCIA: la asignatura "preferida" de un día cambia
//      entre ejecuciones según cuánta cola le va quedando a cada una, y con
//      presupuesto propio cada una que llega a ser preferida en algún
//      momento añade SU cuota — llamar a ensureCaminoCalendar varias veces
//      seguidas con el mismo throughDate seguía añadiendo filas sin parar
//      (480 → 494 → 516 → ...). No puede llegar a producción.
//   2. Arrastre mutable (carryMinutes) acotado a una sesión — mismo defecto
//      de fondo (estado que depende del ORDEN de ejecución) y además
//      insuficiente (solo bajaba de 44 a 35 días de puro repaso).
//
// La diferencia de fondo: los dos intentos anteriores repartían el
// presupuesto EN EL TIEMPO (por día) o ENTRE ASIGNATURAS. Lo correcto es
// repartirlo como lo que es — un total — y comparar contra un ACUMULADO:
//
//   cumulativeAllowedNewContentMinutes(D) = N-ésimo día de ritmo × presupuesto diario
//   cumulativeScheduledNewContentMinutes(D) = temario nuevo YA colocado con fecha <= D
//
// Una misión cabe si scheduled + su duración <= allowed. Sin redondear "al
// más cercano" — el acumulado no lo necesita, porque lo que un día no gasta
// sigue disponible en el siguiente en vez de perderse; redondear aquí
// volvería a regalar minutos que el acumulado ya cuenta con exactitud.
//
// Por qué esto SÍ es idempotente y los otros dos no: `allowed` es una
// función puramente POSICIONAL (día 1º, 2º, 3º... del ritmo) que no depende
// de cuántas veces se haya ejecutado el motor, y `scheduled` es lo que YA
// hay en el calendario (una lectura, no un cálculo que dependa de la
// ejecución anterior). Dos ejecuciones seguidas con la misma cola ven el
// mismo `allowed` y el mismo `scheduled` inicial, así que colocan lo mismo
// y paran en el mismo sitio — no hay estado intermedio que arrastrar entre
// llamadas, ni un reparto por asignatura que dependa del orden de rotación.

/**
 * Presupuesto ACUMULADO de temario nuevo autorizado hasta cada fecha de
 * ritmo (inclusive), en el mismo orden que `contentPaceDates`.
 *
 * La fecha N-ésima autoriza `N × dailyBudget` en total — no `dailyBudget`
 * por separado cada día. Es una tabla, no un contador: se recalcula entera
 * cada vez a partir de las mismas fechas y el mismo presupuesto diario, así
 * que la misma entrada produce siempre la misma tabla.
 */
export function cumulativeNewContentAllowance(
  paceDates: readonly string[],
  dailyBudget: number,
): Map<string, number> {
  const result = new Map<string, number>()
  let cumulative = 0
  for (const date of paceDates) {
    cumulative += dailyBudget
    result.set(date, cumulative)
  }
  return result
}

/**
 * ¿Cabe esta misión de temario nuevo dentro del presupuesto ACUMULADO hasta
 * su fecha? Sustituye a `admitsMoreNewContent` cuando se usa presupuesto
 * acumulado — comparación exacta, sin redondeo: lo que un día no gasta lo
 * hereda el siguiente a través del propio acumulado, así que no hace falta
 * la tolerancia de "media misión" que `admitsMoreNewContent` necesitaba
 * para compensar el redondeo día a día.
 *
 * La primera misión de TODO el plan siempre cabe (scheduled=0), aunque sea
 * más larga que un solo día de presupuesto: el plan no puede empezar a
 * cero. A partir de ahí, cabe justo lo que el acumulado permite — ni una
 * asignatura recibe trato especial, ni el orden en que se prueban importa
 * para CUÁNTO cabe, solo para QUÉ es lo que cabe.
 */
export function admitsCumulativeNewContent(input: {
  /** Minutos de temario nuevo (cualquier asignatura) ya colocados con fecha <= la de esta misión. */
  cumulativeScheduledMinutes: number
  /** Duración de la misión que se quiere añadir. */
  missionMinutes: number
  /** Presupuesto acumulado autorizado hasta esta fecha (cumulativeNewContentAllowance). */
  cumulativeAllowedMinutes: number
}): boolean {
  if (input.cumulativeScheduledMinutes <= 0) return true
  return input.cumulativeScheduledMinutes + input.missionMinutes <= input.cumulativeAllowedMinutes
}
