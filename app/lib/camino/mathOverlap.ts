import { normalizeTopicSlug } from './caminoCurriculumPlan'

// Matemáticas II y Matemáticas CCSS comparten temario en Álgebra, Análisis y
// Probabilidad — Inferencia es exclusivo de CCSS entero, ningún tema suyo
// pasa por esta comparación. Quien hace las dos no tiene que ver el solape
// dos veces — la regla, tal como la pidió Mario (15/09/2026): "si haces
// Análisis de Ciencias, no hagas Análisis de Sociales".
//
// Dos intentos anteriores, el mismo día, y los dos mal:
//
//  1. Descartar el BLOQUE entero de CCSS cuando había Mates II. Un bloque
//     con el mismo nombre no es el mismo temario: "Programación Lineal" no
//     existe en Mates II, y todo el bloque de análisis económico de CCSS
//     (Optimización económica, Funciones de Coste/Ingreso/Beneficio,
//     Dominio/Asíntotas/Representación Gráfica) tampoco tiene equivalente.
//     Se estaba borrando contenido real y exclusivo de CCSS.
//
//  2. Coincidencia EXACTA de título contra Mates II. Demasiado estricto en
//     la otra dirección: "Discusión de Sistemas: Teorema de Rouché-Frobenius"
//     (CCSS) y "Teorema de Rouché-Frobenius (Discusión)" (Mates II) son el
//     mismo tema con las palabras en otro orden, y el título exacto no lo ve
//     — se quedaba en solo 7 de 38 duplicados reales.
//
// Lo que sigue es una comparación tema a tema, a mano, de los 38 temas de
// los tres bloques con solape (15/09/2026). No hay atajo de texto que
// sustituya esto: es una decisión de contenido, y donde había duda se
// decidió a favor de CCSS (mejor un tema que se repite —recuperable
// marcándolo como ya dado— que uno que desaparece sin que el alumno sepa
// que le faltaba).
//
// Los 8 temas de CCSS SIN equivalente en Mates II, que se estudian siempre
// aunque el alumno tenga también Mates II:
//   - Programación Lineal: Región Factible y Optimización — Mates II no la
//     tiene en absoluto.
//   - Optimización económica / Funciones de Coste, Ingreso y Beneficio /
//     Optimización Económica: Máximo Beneficio y Mínimo Coste — el bloque
//     de análisis aplicado a la empresa, que Mates II nunca enseña así.
//   - Dominio de una Función / Asíntotas de una Función / Representación
//     Gráfica de Funciones — Mates II no las da como lección propia (entra
//     directo a límites, sin una lección de dominio o asíntotas aparte).
//   - Probabilidad Condicionada e Independencia — sin lección propia en
//     Mates II, aunque se roce en la definición axiomática.
//
// Los otros 30 (matrices, Gauss, determinantes, inversa, Rouché-Frobenius,
// límites/continuidad/derivadas básicas, integrales, Laplace, árboles,
// Bayes, binomial, normal) SÍ los cubre Mates II, con la misma profundidad o
// más, aunque el título no coincida palabra por palabra.
const CCSS_OVERLAP_BLOCKS = new Set(['algebra', 'analisis', 'probabilidad'])

const CCSS_TOPICS_UNIQUE_TO_CCSS = new Set([
  'Programación Lineal: Región Factible y Optimización',
  'Optimización económica',
  'Funciones de Coste, Ingreso y Beneficio',
  'Optimización Económica: Máximo Beneficio y Mínimo Coste',
  'Dominio de una Función',
  'Asíntotas de una Función',
  'Representación Gráfica de Funciones',
  'Probabilidad Condicionada e Independencia',
].map(normalizeTopicSlug))

/**
 * ¿Este tema de Matemáticas CCSS ya lo cubre Matemáticas II? Solo tiene
 * sentido cuando el alumno estudia las dos — quien solo hace CCSS recibe su
 * temario completo, solape incluido, porque no hay otra versión de la que
 * tirar.
 *
 * Primero el bloque: fuera de Álgebra/Análisis/Probabilidad no hay solape
 * que comparar (Inferencia es 100% exclusivo de CCSS) y la respuesta es
 * siempre "no". Dentro de esos tres bloques, el tema se queda solo si está
 * en la lista curada de arriba.
 */
export function isCcssTopicCoveredByMatesII(blockSlug: string | null | undefined, title: string | null | undefined): boolean {
  if (blockSlug == null || !CCSS_OVERLAP_BLOCKS.has(blockSlug)) return false
  if (title == null) return false
  return !CCSS_TOPICS_UNIQUE_TO_CCSS.has(normalizeTopicSlug(title))
}
