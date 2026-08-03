import type { Flashcard, ZonaSubject } from './types'

function deck(subject: ZonaSubject, topic: string, pairs: [string, string][]): Flashcard[] {
  return pairs.map(([front, back], index) => ({
    id: `recommended-${subject}-${index}`,
    user_id: '',
    subject,
    topic,
    front,
    back,
  }))
}

export const RECOMMENDED_FLASHCARDS: Flashcard[] = [
  ...deck('mates', 'Fórmulas esenciales', [
    ['Derivada de $x^n$', '$n x^{n-1}$'],
    ['Integral de $x^n$', '$\\frac{x^{n+1}}{n+1}+C$, si $n\\neq -1$'],
    ['Determinante $2\\times2$', '$ad-bc$'],
    ['Probabilidad condicionada', '$P(A\\mid B)=\\frac{P(A\\cap B)}{P(B)}$'],
    ['Error típico en límites', 'Sustituir directamente sin comprobar indeterminaciones.'],
  ]),
  ...deck('fisica', 'Fórmulas frecuentes', [
    ['Energía cinética', '$E_c=\\frac{1}{2}mv^2$'],
    ['Velocidad en caída libre', '$v=\\sqrt{2gh}$'],
    ['Segunda ley de Newton', '$\\sum \\vec F=m\\vec a$'],
    ['Ley de Ohm', '$V=IR$'],
    ['¿Qué no debes olvidar al resolver un problema?', 'Escribe siempre la ley aplicada, sustituye y añade unidades.'],
  ]),
  ...deck('quimica', 'Química PAU', [
    ['Ácido sulfúrico', '$\\mathrm{H_2SO_4}$'],
    ['Ácido acético', '$\\mathrm{CH_3COOH}$'],
    ['Constante de equilibrio', '$K_c=\\frac{[NH_3]^2}{[N_2][H_2]^3}$'],
    ['Síntesis del amoniaco', '$\\mathrm{N_2 + 3H_2 \\rightarrow 2NH_3}$'],
    ['¿Qué hacer antes de un cálculo estequiométrico?', 'Ajusta la reacción antes de hacer cálculos estequiométricos.'],
  ]),
  ...deck('lengua', 'Estructura de respuesta', [
    ['Tema de un texto', 'Una frase breve, precisa y sin ejemplos secundarios.'],
    ['Resumen', 'Ideas principales, palabras propias y tono objetivo.'],
    ['Texto argumentativo', 'Tesis clara, argumentos ordenados y conclusión.'],
    ['Comentario lingüístico', 'Identifica el rasgo y explica su función en el texto.'],
    ['Error típico', 'Enumerar recursos sin relacionarlos con la intención comunicativa.'],
  ]),
  ...deck('historia', 'Respuesta histórica', [
    ['Comentario de fuente', 'Naturaleza, contexto, ideas principales y valoración histórica.'],
    ['Tema de desarrollo', 'Introducción, causas, desarrollo, consecuencias y conclusión.'],
    ['Error cronológico', 'Comprueba fechas clave antes de cerrar la respuesta.'],
    ['Concepto histórico', 'Define, sitúa cronológicamente y explica su relevancia.'],
    ['¿Cómo evitar una respuesta que parezca una lista?', 'Relaciona hechos; no presentes una mera lista de datos.'],
  ]),
  ...deck('ingles', 'English PAU', [
    ['True / False', 'Answer and quote the exact evidence from the text.'],
    ['Open question', 'Paraphrase the source instead of copying it literally.'],
    ['Writing structure', 'Introduction, developed ideas, connectors and conclusion.'],
    ['Useful connector', 'However: introduces contrast.'],
    ['Final check', 'Review task fulfilment, verb tenses, spelling and word count.'],
  ]),
  ...deck('biologia', 'Conceptos clave', [
    ['ADN', 'Molécula que almacena la información genética.'],
    ['Mitosis', 'División celular que produce dos células genéticamente iguales.'],
    ['Enzima', 'Catalizador biológico que reduce la energía de activación.'],
    ['Homeostasis', 'Mantenimiento de condiciones internas relativamente estables.'],
    ['¿Qué tres cosas debe cubrir tu respuesta?', 'Relaciona estructura, mecanismo y función en cada respuesta.'],
  ]),
  ...deck('historia_filosofia', 'Respuesta filosófica', [
    ['Comentario de texto', 'Identifica la tesis, explica las ideas y relaciona sus conceptos.'],
    ['Comparación filosófica', 'Define un criterio común y contrasta semejanzas y diferencias.'],
    ['Argumentación', 'Formula una tesis y justifícala con razones y objeciones.'],
    ['Precisión conceptual', 'Usa los términos del autor con significado filosófico exacto.'],
    ['¿Qué error se penaliza más en filosofía?', 'Evita biografías generales: responde al problema planteado.'],
  ]),
]
