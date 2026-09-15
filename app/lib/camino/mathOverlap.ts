// Matemáticas II y Matemáticas CCSS comparten temario real en Álgebra,
// Análisis y Probabilidad —distinto nombre de bloque en cada catálogo
// (algebra-lineal en Mates II, algebra en CCSS) pero el mismo contenido de
// fondo—. Quien hace las dos no tiene que verlo dos veces.
//
// La regla, tal como la pidió Mario (15/09/2026): "si haces Análisis de
// Ciencias, no hagas Análisis de Sociales". Mates II es la versión más
// profunda (integrales por partes, Rolle/Lagrange, geometría 3D) y se
// estudia ENTERA, sin recortes. De CCSS solo entra lo que Mates II NO
// cubre: el bloque de Inferencia/Muestreo (intervalos de confianza,
// contraste de hipótesis), que Ciencias no tiene.
//
// Primer intento (el mismo día): bloquear elegir las dos a la vez. Estaba
// mal — hay razones reales para querer ambas (una carrera que pide la nota
// de una y el itinerario real es el otro, o simple interés) y bloquear
// borró Camino real de alumnos que sí las querían. Lo correcto es dejar
// elegir las dos y no duplicar el solape, no impedir la combinación.
const CCSS_BLOCKS_COVERED_BY_MATES_II = new Set(['algebra', 'analisis', 'probabilidad'])

/**
 * ¿Este bloque de Matemáticas CCSS ya lo cubre Matemáticas II?
 * Solo tiene sentido cuando el alumno estudia las dos — quien solo hace
 * CCSS recibe su temario completo, solape incluido, porque no hay otra
 * versión de la que tirar.
 */
export function isCcssBlockCoveredByMatesII(blockSlug: string | null | undefined): boolean {
  return blockSlug != null && CCSS_BLOCKS_COVERED_BY_MATES_II.has(blockSlug)
}
