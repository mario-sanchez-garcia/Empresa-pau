// A18 de la auditoría del 7-8 de septiembre de 2026.
//
// Las tres rutas que aceptan fotos (exam/correct, camino/correct y chat)
// definían cada una su propio MAX_IMAGE_PAYLOAD_CHARS = 8_000_000 y devolvían
// un 413 con un mensaje cuidado. Ese mensaje era inalcanzable: 8 millones de
// caracteres de base64 son unos 6 MB de cuerpo, y Vercel corta la petición en
// 4,5 MB — la plataforma respondía antes de que el código llegara a ejecutarse,
// así que el alumno veía un error genérico y podía perder lo que había escrito.
//
// El tope baja a 4 millones de caracteres, que sí caben con holgura: base64
// infla el binario un tercio, y al cuerpo hay que sumarle el enunciado, los
// criterios y el resto del JSON. Es un presupuesto AGREGADO: comprimir cada
// foto por separado (clientImageCompression.ts las limita a 1568 px) no impide
// que cuatro páginas sumadas se pasen, que es exactamente el caso que fallaba.
//
// El límite vive aquí y no en cada ruta para que no vuelvan a divergir.
export const MAX_IMAGE_PAYLOAD_CHARS = 4_000_000

/** Suma de caracteres base64 de un conjunto de imágenes ya codificadas.
 *  Se llama sumImagePayloadChars y no imagePayloadChars porque dos de las rutas
 *  ya usan ese nombre para su variable local. */
export function sumImagePayloadChars(images: Array<{ data: string }>): number {
  return images.reduce((sum, img) => sum + (img.data?.length ?? 0), 0)
}

/**
 * Mensaje único para cliente y servidor. Se le dice al alumno cuánto se pasa,
 * porque "sube fotos más ligeras" sin cifra no le dice qué hacer.
 */
export function imagePayloadTooLargeMessage(totalChars: number, photoCount: number): string {
  const approxMb = (totalChars / 1_000_000 * 0.75).toFixed(1)
  const limitMb = (MAX_IMAGE_PAYLOAD_CHARS / 1_000_000 * 0.75).toFixed(1)
  return photoCount > 1
    ? `Las ${photoCount} fotos suman unos ${approxMb} MB y el máximo por envío son ${limitMb} MB. Envía menos páginas de una vez — tu texto no se pierde.`
    : `La foto ocupa unos ${approxMb} MB y el máximo por envío son ${limitMb} MB. Haz la foto con menos resolución o recorta el margen — tu texto no se pierde.`
}
