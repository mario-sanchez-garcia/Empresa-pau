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
// La extraordinaria cae a principios de julio en la mayoría de comunidades.
const EXTRAORDINARIA_MONTH_DAY = '07-01'

export const VALID_CONVOCATORIAS = ['ordinaria', 'extraordinaria'] as const
export type Convocatoria = typeof VALID_CONVOCATORIAS[number]

export function isConvocatoria(value: unknown): value is Convocatoria {
  return typeof value === 'string' && (VALID_CONVOCATORIAS as readonly string[]).includes(value)
}

/**
 * Fecha por defecto de una convocatoria para el curso académico en marcha.
 *
 * A partir de julio, el curso que empieza apunta a la convocatoria del año
 * SIGUIENTE; antes de julio, a la de este mismo año. Para la extraordinaria
 * el corte se mueve a agosto, porque una extraordinaria de julio sigue siendo
 * la de este curso hasta que pasa.
 */
export function defaultTargetExamDate(today: string, convocatoria: Convocatoria = 'ordinaria'): string {
  const year = Number(today.slice(0, 4))
  const monthDay = today.slice(5)
  if (convocatoria === 'extraordinaria') {
    const targetYear = monthDay >= '08-01' ? year + 1 : year
    return `${targetYear}-${EXTRAORDINARIA_MONTH_DAY}`
  }
  const targetYear = monthDay >= '07-01' ? year + 1 : year
  return `${targetYear}-${ORDINARIA_MONTH_DAY}`
}

export type TargetExamDateInput = {
  /** Fecha exacta declarada por el alumno (perfiles.pau_exam_date). Manda sobre todo lo demás. */
  examDate?: string | null
  /** perfiles.pau_convocatoria. */
  convocatoria?: string | null
}

/**
 * Fecha objetivo efectiva del Camino.
 *
 * Orden de precedencia:
 *   1. La fecha exacta que el alumno declaró, si aún no ha pasado.
 *   2. La convocatoria declarada (ordinaria/extraordinaria) del curso en marcha.
 *   3. La ordinaria de junio del curso en marcha.
 *
 * Una fecha ya pasada se ignora a propósito: un objetivo en el pasado deja el
 * plan sin horizonte y hunde a cero el cálculo de urgencia.
 */
export function resolveTargetExamDate(today: string, input: TargetExamDateInput = {}): string {
  const { examDate, convocatoria } = input
  if (examDate && /^\d{4}-\d{2}-\d{2}$/.test(examDate) && examDate > today) return examDate

  const conv: Convocatoria = isConvocatoria(convocatoria) ? convocatoria : 'ordinaria'
  const derived = defaultTargetExamDate(today, conv)
  // Si la convocatoria declarada de este curso ya pasó (p. ej. extraordinaria
  // en agosto), se salta al curso siguiente en vez de devolver algo pasado.
  if (derived > today) return derived
  return defaultTargetExamDate(addYear(today), conv)
}

function addYear(dateStr: string): string {
  return `${Number(dateStr.slice(0, 4)) + 1}${dateStr.slice(4)}`
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
