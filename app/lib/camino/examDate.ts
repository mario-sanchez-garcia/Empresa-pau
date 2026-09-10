// Fecha objetivo del Camino (la EVAU/PAU hacia la que apunta todo el plan).
//
// Antes esto era la constante `EXAM_DATE = '2027-06-07'` dentro de
// ensureCaminoCalendar.ts. Dos problemas:
//
//  1. Está congelada. El 8 de junio de 2027 esa fecha pasa a estar en el
//     pasado, `countWorkingDays(hoy, EXAM_DATE)` devuelve 0 y el cociente de
//     urgencia cae a cero justo cuando más apretado va el alumno.
//  2. No depende de convocatoria, curso ni comunidad, así que un alumno de
//     extraordinaria o del curso siguiente planifica contra una fecha ajena.
//
// Esto arregla (1) derivándola del curso académico en marcha, y deja (2)
// preparado con un override explícito por alumno. La fecha por comunidad y
// convocatoria real todavía no existe en el modelo de datos: cuando exista,
// el único cambio necesario es alimentar `override`.

/**
 * Día aproximado de la ordinaria (junio). Es una aproximación deliberada
 * mientras no haya calendario oficial por comunidad en el modelo de datos —
 * planificar contra el 7 de junio y que la convocatoria real caiga el 9 es un
 * error de dos días; planificar contra una fecha ya pasada, como pasaba con
 * la constante congelada, invalida el plan entero.
 */
const ORDINARIA_MONTH_DAY = '06-07'

/**
 * A partir de julio, el curso que empieza apunta a la convocatoria del año
 * SIGUIENTE; antes de julio, a la de este mismo año.
 */
export function defaultTargetExamDate(today: string): string {
  const year = Number(today.slice(0, 4))
  const monthDay = today.slice(5)
  const targetYear = monthDay >= '07-01' ? year + 1 : year
  return `${targetYear}-${ORDINARIA_MONTH_DAY}`
}

/**
 * Fecha objetivo efectiva. `override` es la fecha declarada del alumno
 * (convocatoria/comunidad) cuando exista; se ignora si ya pasó, porque un
 * objetivo en el pasado deja el plan sin horizonte.
 */
export function resolveTargetExamDate(today: string, override?: string | null): string {
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override) && override > today) return override
  return defaultTargetExamDate(today)
}

/**
 * Días de estudio inmediatamente anteriores al examen que NO se llenan con
 * temario nuevo: quedan reservados para práctica, simulacros y repaso final.
 *
 * Sin esta reserva el plan podía seguir sembrando lecciones nuevas hasta la
 * víspera — y un horizonte de 30 días arrancado a dos semanas del examen
 * llegaba a proponer fechas POSTERIORES a la propia EVAU.
 */
export const FINAL_REVIEW_RESERVED_STUDY_DAYS = 5
