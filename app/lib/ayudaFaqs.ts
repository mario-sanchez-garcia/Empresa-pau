// Fuente única de las preguntas frecuentes de /ayuda — importada también por
// page-client.tsx para que "Pregúntale esto a Kairo" pueda darle a Kairo el
// texto EXACTO que el alumno ya leyó (por id, no copiado en la URL), así su
// respuesta nunca contradice ni repite con datos distintos lo que el FAQ ya
// dice. `subject` es el slug de asignatura del Chat con Kairo tal cual lo usa
// page-client.tsx (mates/fisica/... o 'general') — se omite en preguntas que
// no son de una asignatura concreta, y el chat las abre en el hilo General.
export type AyudaFaqSubject = 'general' | 'mates' | 'matematicas_ccss' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'historia_filosofia' | 'ingles'

export type AyudaFaq = {
  id: string
  q: string
  a: string
  subject?: AyudaFaqSubject
}

export const AYUDA_FAQS: AyudaFaq[] = [
  {
    id: 'xp',
    q: '¿Cómo funciona el XP?',
    a: 'Ganas XP cada vez que corriges un ejercicio con Kairo, en cualquier sección — la saques la nota que saques. La base depende de cuánto dura de verdad la actividad (una misión de Camino da menos que una práctica parcial, y esa menos que un simulacro completo de 90 minutos) y de la dificultad del bloque. Sobre esa base se aplican dos bonus que se multiplican entre sí: la nota que sacas (+25% aprobando, +75% con un 7 o más, +125% con un 9 o más) y tu racha de días seguidos estudiando (hasta +50% a partir de dos meses seguidos sin cortar). Si repites algo que ya habías hecho, la base se reduce a la mitad en cada repetición sucesiva — pero si mejoras tu nota respecto a tu último intento, te llevas un bonus extra encima, tanto mayor cuanto más grande sea la mejora y cuanto más cerca del 10 termines. El XP total nunca baja. Puedes ver el desglose visual completo en "XP y divisiones" (arriba a la derecha).',
  },
  {
    id: 'racha',
    q: '¿Qué es la racha?',
    a: 'La racha cuenta los días consecutivos en los que has completado al menos una misión. Si un día no estudias, la racha vuelve a cero. Además de ser una forma de ver tu constancia, una racha larga también da más XP en cada corrección: hasta un +50% extra a partir de dos meses seguidos estudiando (la subida es rápida los primeros días y se suaviza después, nunca se dispara).',
  },
  {
    id: 'dia-sin-estudiar',
    q: '¿Qué pasa si un día no estudio?',
    a: 'Nada grave. La racha se rompe, pero tu XP y tu progreso se quedan donde estaban. Kairo retoma el plan desde donde lo dejaste. Una racha rota no significa empezar de cero — significa continuar.',
  },
  {
    id: 'divisiones',
    q: '¿Qué son las divisiones?',
    a: 'Las divisiones (Bronce, Plata, Oro, Platino, Diamante y Élite PAU) son seis tramos por XP total acumulado, cada uno con más XP que el anterior. Subes de división acumulando XP; no se puede bajar de división una vez alcanzada. Puedes ver los rangos exactos y en cuál estás ahora mismo en "XP y divisiones" (arriba a la derecha).',
  },
  {
    id: 'ligas',
    q: '¿Cómo funcionan las ligas?',
    a: 'Las ligas son grupos de hasta diez alumnos que compiten entre sí por XP cada semana. Puedes unirte a una liga existente con el código de un amigo o crear la tuya. El ranking de Mi Liga muestra el XP total; el toggle "Esta semana" muestra solo el XP de la semana actual.',
  },
]
