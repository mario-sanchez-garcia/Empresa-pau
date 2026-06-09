export type ConvocatoriaCataluna = 'ordinaria' | 'extraordinaria'

export type FormatoLenguaCataluna =
  | 'opciones_mas_parte_comun'
  | '2025_cuatro_partes_obligatorias'

export type ApartadoLenguaCataluna = {
  id: string
  titulo: string
  enunciado: string
  puntos?: number
  limitePalabras?: number
  tipo?: 'respuesta_corta' | 'test' | 'redaccion' | 'gramatica' | 'literatura'
  opciones?: string[]
}

export type BloqueLenguaCataluna = {
  id: string
  titulo: string
  instrucciones?: string
  texto?: string
  fuente?: string
  apartados: ApartadoLenguaCataluna[]
}

export type OpcionLenguaCataluna = {
  opcion: 'A' | 'B'
  titulo: string
  texto?: string
  fuente?: string
  bloques: BloqueLenguaCataluna[]
}

export type ExamenLenguaCataluna = {
  id: string
  comunidad: 'Cataluña'
  asignatura: 'lengua'
  anio: number
  convocatoria: ConvocatoriaCataluna
  serie: string
  formato: FormatoLenguaCataluna
  instrucciones: string
  opciones?: OpcionLenguaCataluna[]
  partesComunes?: BloqueLenguaCataluna[]
  partesObligatorias?: BloqueLenguaCataluna[]
}

export const examenesLenguaCataluna: ExamenLenguaCataluna[] = [
  {
    id: 'lengua-cat-2025-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2025,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: '2025_cuatro_partes_obligatorias',
    instrucciones:
      'El examen consta de CUATRO partes obligatorias: comprensión lectora, expresión escrita, saber literario y reflexión lingüística. Las respuestas deben ser claras y estar redactadas con coherencia, cohesión y corrección gramatical, léxica y ortográfica.',
    partesObligatorias: [
      {
        id: 'comprension-lectora',
        titulo: '1. Comprensión lectora',
        instrucciones: 'Lea el texto y responda a todas las cuestiones planteadas.',
        texto:
          'Somos seres opinadores y, en el frenesí de comentarlo todo, es fácil precipitarse por la rampa tramposa de la generalización apresurada. Las fotos veraniegas de las redes nos convencen de que todos los demás son más felices. La rabieta de un niño conduce a sermonear sobre los padres que ya no educan a sus hijos, y de ahí al declive de la familia hay un solo paso. Nada más tentador que convertir casos aislados en causa general. Este mundo de urgencias y apocalipsis otorga más credibilidad a las afirmaciones simplificadas, contundentes y sin fisuras, incluso vociferantes, como si fuesen prueba de conocimiento y capacidad de liderazgo, mientras ignora a quienes tienen el valor de compartir sus perplejidades. [...]',
        fuente: 'Irene Vallejo. «Quizás, quizás, quizás». El País, 28 julio 2024.',
        apartados: [
          {
            id: '1.1',
            titulo: '1.1',
            puntos: 0.5,
            tipo: 'test',
            enunciado:
              '¿Qué enunciado, de los cuatro que se presentan a continuación, corresponde a una interpretación correcta del texto?',
            opciones: [
              'Las afirmaciones contundentes son la prueba del conocimiento.',
              'Los matices y las ambigüedades no son recomendables.',
              'Hoy en día, si apuestas por la duda, estás condenado a fracasar.',
              'Sócrates pensaba que los más graves errores los cometen los que saben.',
            ],
          },
          {
            id: '1.2',
            titulo: '1.2',
            puntos: 0.5,
            tipo: 'respuesta_corta',
            limitePalabras: 25,
            enunciado:
              'Explique en un máximo de veinticinco palabras cuál es la idea principal del texto.',
          },
          {
            id: '1.3',
            titulo: '1.3',
            puntos: 0.5,
            tipo: 'respuesta_corta',
            limitePalabras: 25,
            enunciado:
              '¿Qué significa la expresión «las cataratas de certezas brotan de los labios más intransigentes»? Responda en un máximo de veinticinco palabras.',
          },
          {
            id: '1.4',
            titulo: '1.4',
            puntos: 0.5,
            tipo: 'test',
            enunciado:
              'Señale qué serie es la única correcta para sustituir todas las palabras siguientes: resbaladizas, férrea, inercia, vociferan.',
            opciones: [
              'insignificantes, empecinada, pereza, graznan',
              'babosas, cerril, desidia, callan',
              'groseras, dura, negligencia, vocean',
              'problemáticas, firme, rutina, gritan',
            ],
          },
        ],
      },
      {
        id: 'expresion-escrita',
        titulo: '2. Expresión escrita',
        apartados: [
          {
            id: '2.1',
            titulo: '2.1',
            puntos: 2,
            tipo: 'redaccion',
            limitePalabras: 150,
            enunciado:
              'Redacte un texto expositivo sobre el concepto de incertidumbre que contenga al menos los tres siguientes recursos: definición, clasificación y ejemplificación. Utilice entre cien y ciento cincuenta palabras. Previamente, complete el cuadro con definición, clasificación y ejemplificación.',
          },
          {
            id: '2.2',
            titulo: '2.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Complete las secuencias con la forma correcta de entre las dos que se proponen en cada caso: a) sobre todo / sobretodo; b) porque / por qué; c) dónde / donde; d) sino / si no.',
          },
        ],
      },
      {
        id: 'saber-literario',
        titulo: '3. Saber literario',
        instrucciones:
          'Lea los textos y responda a cuatro de las cinco cuestiones planteadas. Si responde a más, solo se tendrán en cuenta las cuatro primeras.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.1 según los textos del examen original.',
            },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.2 según los textos del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.3 según los textos del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.4 según los textos del examen original.',
          },
          {
            id: '3.5',
            titulo: '3.5',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.5 según los textos del examen original.',
          },
        ],
      },
      {
        id: 'reflexion-linguistica',
        titulo: '4. Reflexión lingüística',
        instrucciones:
          'Responda a todas las cuestiones del bloque 1 y solo a dos de las tres cuestiones planteadas en el bloque 2.',
        apartados: [
          {
            id: '4.1',
            titulo: '4.1',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.1.',
          },
          {
            id: '4.2',
            titulo: '4.2',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.2.',
          },
          {
            id: '4.3',
            titulo: '4.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.3.',
          },
          {
            id: '4.4',
            titulo: '4.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.4.',
          },
          {
            id: '4.5',
            titulo: '4.5',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.5.',
          },
          {
            id: '4.6',
            titulo: '4.6',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.6.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2025-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2025,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: '2025_cuatro_partes_obligatorias',
    instrucciones:
      'El examen consta de CUATRO partes obligatorias: comprensión lectora, expresión escrita, saber literario y reflexión lingüística.',
    partesObligatorias: [
      {
        id: 'comprension-lectora',
        titulo: '1. Comprensión lectora',
        texto:
          'A la inteligencia artificial, para que sea de verdad inteligente, le falta lo que a la mayoría de las personas: una mirada propia. Ignoramos si logrará obtenerla, aunque bastaría con que lo simulara. No se trata, pues, de que carezca de yo, pero el yo no es nada sin el contrapeso del contrayó. [...]',
        fuente: 'Juan José Millás. «Sesgo y contrasesgo». El País, 29 noviembre 2024.',
        apartados: [
          {
            id: '1.1',
            titulo: '1.1',
            puntos: 0.5,
            tipo: 'test',
            enunciado:
              '¿Qué enunciado corresponde a una interpretación correcta del texto?',
            opciones: [
              'La inteligencia artificial tiene una mirada propia.',
              'Todos los seres humanos entienden lo que leen y lo que escriben.',
              'Del rechazo a la tradición surge algo nuevo.',
              'La inteligencia artificial es capaz de escribir un buen poema.',
            ],
          },
          {
            id: '1.2',
            titulo: '1.2',
            puntos: 0.5,
            tipo: 'respuesta_corta',
            limitePalabras: 25,
            enunciado:
              'Explique en un máximo de veinticinco palabras cuál es la idea principal del texto.',
          },
          {
            id: '1.3',
            titulo: '1.3',
            puntos: 0.5,
            tipo: 'respuesta_corta',
            limitePalabras: 25,
            enunciado:
              '¿Qué significa la expresión «Necesitamos que de ese sesgo nazca un contrasesgo»? Responda en un máximo de veinticinco palabras.',
          },
          {
            id: '1.4',
            titulo: '1.4',
            puntos: 0.5,
            tipo: 'respuesta_corta',
            enunciado:
              'Indique el antecedente del pronombre la en «logrará obtenerla».',
          },
        ],
      },
      {
        id: 'expresion-escrita',
        titulo: '2. Expresión escrita',
        apartados: [
          {
            id: '2.1',
            titulo: '2.1',
            puntos: 2,
            tipo: 'redaccion',
            limitePalabras: 150,
            enunciado:
              'Redacte un texto argumentativo sobre los límites de la inteligencia artificial. Utilice entre cien y ciento cincuenta palabras. Previamente, indique la tesis, dos argumentos a favor y un contraargumento.',
          },
          {
            id: '2.2',
            titulo: '2.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Complete las siguientes oraciones conjugando correctamente el verbo indicado entre paréntesis: prever, conducir, producir y errar.',
          },
        ],
      },
      {
        id: 'saber-literario',
        titulo: '3. Saber literario',
        instrucciones:
          'Lea los textos y responda a cuatro de las cinco cuestiones planteadas.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión sobre el texto literario 1 del examen original.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión sobre el texto literario 2 del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.3 del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.4 del examen original.',
          },
          {
            id: '3.5',
            titulo: '3.5',
            puntos: 0.5,
            tipo: 'literatura',
            enunciado:
              'Responda a la cuestión literaria 3.5 del examen original.',
          },
        ],
      },
      {
        id: 'reflexion-linguistica',
        titulo: '4. Reflexión lingüística',
        instrucciones:
          'Responda a todas las cuestiones del bloque 1 y solo a dos de las tres cuestiones planteadas en el bloque 2.',
        apartados: [
          {
            id: '4.1',
            titulo: '4.1',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.1.',
          },
          {
            id: '4.2',
            titulo: '4.2',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.2.',
          },
          {
            id: '4.3',
            titulo: '4.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.3.',
          },
          {
            id: '4.4',
            titulo: '4.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.4.',
          },
          {
            id: '4.5',
            titulo: '4.5',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.5.',
          },
          {
            id: '4.6',
            titulo: '4.6',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado: 'Responda a la cuestión de reflexión lingüística 4.6.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2024-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2024,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Jamás había oído mencionar aquel título o a su autor, pero no me importó. La decisión estaba tomada. Por ambas partes. Tomé el libro con sumo cuidado y lo hojeé, dejando aletear sus páginas. Liberado de su celda en el estante, el libro exhaló una nube de polvo dorado. [...]',
        fuente:
          'Carlos Ruiz Zafón. La sombra del viento. Barcelona: Planeta, 2016.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este. Utilice un máximo de cincuenta palabras.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale qué serie es la única correcta para sustituir las palabras: hechicera, fantasmagórica, sortilegio, púrpura.',
                opciones: [
                  'repelente, aterradora, espiritismo, tinte',
                  'cautivadora, sobrenatural, encanto, escarlata',
                  'enloquecedora, tangible, conjuro, colorante',
                  'profeta, alucinante, sorteo, dignidad',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes de cuya en «cuya memoria» y que en «del que no quería escapar».',
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos de las cuatro cuestiones sobre Nada, La Fundación y figuras retóricas.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto según la consigna de expresión escrita de la opción A del examen original.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias con la forma correcta: de que / que; onceavo / undécimo; acerca de / a cerca de; identificado / identificada.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'Desde siempre, tus amigos han bromeado sobre tu terquedad. Cuando una idea te obsesiona, te aferras al asunto, te exaltas y no sueltas el mordisco. [...]',
        fuente: 'Irene Vallejo. Texto sobre fanatismo.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este. Utilice un máximo de cincuenta palabras.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de léxico o interpretación de la opción B según el PDF original.',
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de referentes o interpretación textual de la opción B.',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones de literatura o figuras retóricas según el PDF original.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba el texto de expresión escrita indicado en la opción B del examen original.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias gramaticales de la opción B según el PDF original.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la primera cuestión de reflexión lingüística del examen original.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la segunda cuestión de reflexión lingüística del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la tercera cuestión de reflexión lingüística del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuarta cuestión de reflexión lingüística del examen original.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2024-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2024,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Ahora ya sabe con certeza que los relatos no son inocentes, no del todo inocentes. Quizá tampoco lo sean las conversaciones de diario, los descuidos y equívocos verbales o el hablar por hablar. [...]',
        fuente: 'Luis Landero. Lluvia fina. Barcelona: Tusquets Editores, 2019.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este. Utilice un máximo de cincuenta palabras.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale qué serie es la única correcta para sustituir las palabras: equívocos, triviales, metamorfosis, conjeturas.',
                opciones: [
                  'malentendidos, intrascendentes, transformación, suposiciones',
                  'errores, insignificantes, mejora, presunciones',
                  'inequívocos, frívolos, mudanza, profecías',
                  'falseamientos, vulgares, transmutación, realidades',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes de los en «no hay más que verlos» y que en «que se mantienen tan pujantes y vivas como entonces».',
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos de las cuatro cuestiones sobre las lecturas y figuras retóricas.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba el texto de expresión escrita indicado en la opción A del examen original.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias con la forma adecuada del verbo propuesto: argüir, predecir, satisfacer, ingerir.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'Muchas veces he pensado en lo afortunada que soy al vivir en la época en la que vivo. Esto, por otra parte, es lo normal; hay una tendencia natural a sentirnos bien con lo que somos. [...]',
        fuente: 'Texto sobre progreso tecnológico y ciencia ficción.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de comprensión de la opción B según el PDF original.',
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de referentes o interpretación textual de la opción B.',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones de literatura o figuras retóricas según el PDF original.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba el texto de expresión escrita indicado en la opción B del examen original.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias gramaticales de la opción B según el PDF original.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.1 de reflexión lingüística del examen original.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.2 de reflexión lingüística del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística del examen original.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2023-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2023,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 1',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Sólo el primer paso cuesta. Quizá se podría decir eso de todo, o de la mayoría de los esfuerzos y de lo que se hace con desagrado o repugnancia o reservas. [...]',
        fuente: 'Javier Marías. Tomás Nevinson. Barcelona: Penguin Random House, 2021.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale qué serie es la única correcta para sustituir las palabras: voraces, inaudibles, suplantadores, identidad.',
                opciones: [
                  'desganadas, invisibles, suplementarios, identificación',
                  'tragadoras, sordos, suplicantes, equivalencia',
                  'devoradoras, imperceptibles, impostores, personalidad',
                  'comedoras, inapreciables, desertores, similitud',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes de lo en «gobernarlo» y la en «a la que sin vacilaciones se atienen».',
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos de las tres preguntas sobre La Fundación.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  '¿Comparte el punto de vista de Tomás Nevinson sobre la condición humana? Escriba un texto argumentativo que apoye o critique ese punto de vista.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias con la forma correcta: rebelar / revelar; prejuicios / perjuicios; especias / especies; accesible / asequible.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'Hace tiempo que los catastrofistas nos lo advierten con los peores augurios: los libros son una especie en peligro de extinción. [...]',
        fuente: 'Irene Vallejo. El infinito en un junco. Madrid: Siruela, 2019.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Indique qué figura retórica aparece en «Las cosas engullen a las cosas precedentes».',
                opciones: ['retruécano', 'hipérbaton', 'oxímoron', 'personificación'],
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los referentes del sintagma nominal estas percepciones y del posesivo su.',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos preguntas sobre Nada.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto expositivo sobre la importancia de la pervivencia de los libros.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias con la forma correcta: sobre todo / sobretodo; aparte / a parte; porque / por qué; entorno / en torno.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Indique cuál de las dos secuencias del par mínimo es agramatical y explique a qué se debe el contraste.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Escriba una secuencia gramatical que contenga los elementos indicados en el examen.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2023-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2023,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 2',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Por las tardes se sienta a traducir una o dos horas. Nunca logra la concentración suficiente. Quizá necesita un periodo de adaptación, se dice. [...]',
        fuente: 'Sara Mesa. Un amor. Barcelona: Anagrama, 2020.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale la serie correcta para sustituir: siniestro, macilento, difuso, errante.',
                opciones: [
                  'aciago, descolorido, vago, errático',
                  'trágico, mustio, amplio, caminante',
                  'izquierdo, débil, corto, exiliado',
                  'apropiado, flaco, vacilante, nómada',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes de la en «se resiste a acompañarla» y le en «clavándole su mirada glauca».',
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones sobre Nada.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto expositivo sobre las dificultades que puede entrañar la traducción de un término o una expresión.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Cambie las formas del verbo hacer por formas de otros verbos contextualmente más adecuados sin modificar la flexión.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'En el tocador. Zinaída Serebriakova, 1909. Cuántos años podía tener ahí, en ese instante en el que me contemplé en el espejo y decidí pintarme. [...]',
        fuente: 'Texto sobre En el tocador, Zinaída Serebriakova.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de comprensión de la opción B según el PDF original.',
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de referentes o interpretación textual de la opción B.',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones de literatura según el PDF original.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba el texto de expresión escrita indicado en la opción B del examen original.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias gramaticales de la opción B según el PDF original.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.1 de reflexión lingüística del examen original.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.2 de reflexión lingüística del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística del examen original.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2022-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2022,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Recuerdo muy bien la primera vez que me asomé al escaparate de Antigüedades Estoril. Mi madre me había acompañado un par de tardes a la academia para asegurarse de que me aprendía el camino. [...]',
        fuente: 'Ignacio Martínez de Pisón. María bonita. Barcelona: Anagrama, 2000.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'respuesta_corta',
                limitePalabras: 15,
                enunciado:
                  'Explique la metáfora caer hasta el fondo del pozo sin utilizar palabras del texto.',
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'test',
                enunciado:
                  'Indique qué dos figuras retóricas aparecen en la secuencia enumerativa del escaparate.',
                opciones: ['asíndeton', 'anadiplosis', 'paralelismo', 'epanadiplosis'],
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones sobre La Fundación.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba una descripción pormenorizada de un establecimiento tratando de retratar el carácter ordenado, la pulcritud y la sobriedad de quienes trabajan allí. Debe contener enumeración, adjetivación, comparación y antítesis.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Rellene los espacios con la forma correcta: aclimatado / climatizado; actitud / aptitud; fragante / flagrante; prejuicios / perjuicios.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'Cada palabra es un prisma formado por varias caras, una especie de poliedro del que se nos muestra una sola superficie cada vez que lo miramos. [...]',
        fuente: 'Ignacio Bosque. «Las palabras como prismas». Archiletras.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale la serie correcta para sustituir: escrutarlas, recovecos, hurgar, reticentes.',
                opciones: [
                  'mirarlas, recuerdos, incidir, reincidentes',
                  'analizarlas, sucesos, trabajar, receptivos',
                  'observarlas, rincones, escarbar, reacios',
                  'comprenderlas, acontecimientos, insistir, quisquillosos',
                ],
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes o referentes de ella en «guarda relación con ella» y lo en «Si lo logran».',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos preguntas sobre Nada.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto argumentativo a favor o en contra de poner límites al humor a través de leyes.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Rellene los espacios con la forma correcta: sino / si no; porque / por qué; a parte / aparte; hubo / hubieron.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.1 de reflexión lingüística.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.2 de reflexión lingüística.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2022-extraordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2022,
    convocatoria: 'extraordinaria',
    serie: 'Sèrie 3',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'La gruta del placer. Narciso adoraba fabricar pelusillas en su ombligo. Esas pequeñas bolitas que parecen surgir de la nada entre los recovecos de ese extraño adorno de nuestro vientre le volvían loco. [...]',
        fuente: 'David Roas. Horrores cotidianos. Palencia: Menoscuarto, 2007.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale la serie correcta para sustituir: recovecos, alborozo, consabida, insólita.',
                opciones: [
                  'bultos, contento, repugnante, extraordinaria',
                  'pliegues, alboroto, conocida, sorprendente',
                  'huecos, esmero, repetida, inaudita',
                  'rincones, regocijo, habitual, extraña',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Indique los antecedentes o referentes de que en «y que guardaba celosamente en un viejo arcón» y su en «le vio hurgando en su ombligo».',
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos preguntas sobre Nada.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto argumentativo sobre la conveniencia o no de que las familias inculquen en sus hijos su sistema de valores.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Conjugue el verbo indicado entre paréntesis de manera adecuada y coherente.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'Durante las últimas semanas, un aluvión de noticias en los periódicos insistían en que, en el nuevo curriculum de lengua de ESO, la sintaxis cedía su lugar privilegiado a las competencias relacionadas con la comunicación. [...]',
        fuente: 'Texto sobre gramática, sintaxis y competencia comunicativa.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 50,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de léxico o comprensión de la opción B según el PDF original.',
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                enunciado:
                  'Responda a la cuestión de referentes o interpretación textual de la opción B.',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos cuestiones sobre las lecturas según el PDF original.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba el texto de expresión escrita indicado en la opción B del examen original.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Complete las secuencias gramaticales de la opción B según el PDF original.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.1 de reflexión lingüística.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.2 de reflexión lingüística.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística.',
          },
        ],
      },
    ],
  },

  {
    id: 'lengua-cat-2021-ordinaria',
    comunidad: 'Cataluña',
    asignatura: 'lengua',
    anio: 2021,
    convocatoria: 'ordinaria',
    serie: 'Sèrie 2',
    formato: 'opciones_mas_parte_comun',
    instrucciones:
      'La prueba consta de tres partes: comprensión lectora, expresión escrita y reflexión lingüística. Debe escoger una de las dos opciones para completar las partes 1 y 2. La parte 3 es común.',
    opciones: [
      {
        opcion: 'A',
        titulo: 'Opción A',
        texto:
          'Escena Séptima. La Redacción de El Popular: Sala baja con piso de baldosas. En el centro, una mesa larga y negra, rodeada de sillas vacías. [...]',
        fuente: 'Ramón María del Valle-Inclán. Luces de bohemia. Madrid: Cátedra, 2019.',
        bloques: [
          {
            id: 'comprension-a',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1A',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 40,
                enunciado:
                  'Resuma el texto que ha leído sin reproducir frases de este. Utilice un máximo de cuarenta palabras.',
              },
              {
                id: '1.2A',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale qué serie es la única correcta para sustituir: rimeros, bizarros, cotarro, repelados.',
                opciones: [
                  'pilas, extraños, escritor, vacíos',
                  'estantes, osados, personaje, desaliñados',
                  'montones, valientes, clan, gastados',
                  'carpetas, airosos, grupo, desastrados',
                ],
              },
              {
                id: '1.3A',
                titulo: '1.3',
                puntos: 1,
                tipo: 'test',
                enunciado:
                  'Indique qué figura retórica se ha empleado en «enciende el cigarro apagado».',
                opciones: ['retruécano', 'hipálage', 'oxímoron', 'pleonasmo'],
              },
              {
                id: '1.4A',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos de las tres preguntas sobre Nada, de Carmen Laforet.',
              },
            ],
          },
          {
            id: 'expresion-a',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1A',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto argumentativo en el que se posicione sobre si existe o no suficiente libertad hoy en día en el ámbito periodístico. Indique previamente tesis, dos argumentos y un contraargumento.',
              },
              {
                id: '2.2A',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Rellene los espacios en blanco con la forma correcta: porque / porqué; voy / vengo; sino / si no; sí / si.',
              },
            ],
          },
        ],
      },
      {
        opcion: 'B',
        titulo: 'Opción B',
        texto:
          'No sé si usted, querida lectora, querido lector, es coleccionista o si por el contrario no le gusta nada eso de coleccionar. [...]',
        fuente: 'Carme Riera. «Sobre coleccionistas». La Vanguardia, 21 julio 2019.',
        bloques: [
          {
            id: 'comprension-b',
            titulo: '1. Comprensión lectora',
            apartados: [
              {
                id: '1.1B',
                titulo: '1.1',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 40,
                enunciado:
                  'Indique qué tipo de errores colecciona el amigo de la autora del artículo.',
              },
              {
                id: '1.2B',
                titulo: '1.2',
                puntos: 0.5,
                tipo: 'test',
                enunciado:
                  'Señale qué serie es la única correcta para sustituir: variopintos, voluble, hallazgo, vehemencia.',
                opciones: [
                  'diversos, inestable, descubrimiento, contundencia',
                  'mezclados, cambiante, invención, violencia',
                  'pintados, veleidoso, acierto, furor',
                  'complejos, caprichoso, hartazgo, pasión',
                ],
              },
              {
                id: '1.3B',
                titulo: '1.3',
                puntos: 1,
                tipo: 'respuesta_corta',
                limitePalabras: 40,
                enunciado:
                  'Explique el sentido de «Ahora ha ampliado el campo de acción».',
              },
              {
                id: '1.4B',
                titulo: '1.4',
                puntos: 1.5,
                tipo: 'literatura',
                enunciado:
                  'Conteste únicamente dos de las tres preguntas sobre Luces de bohemia.',
              },
            ],
          },
          {
            id: 'expresion-b',
            titulo: '2. Expresión escrita',
            apartados: [
              {
                id: '2.1B',
                titulo: '2.1',
                puntos: 2,
                tipo: 'redaccion',
                limitePalabras: 150,
                enunciado:
                  'Escriba un texto expositivo sobre las ventajas y los inconvenientes de coleccionar objetos.',
              },
              {
                id: '2.2B',
                titulo: '2.2',
                puntos: 1,
                tipo: 'gramatica',
                enunciado:
                  'Rellene los espacios con el parónimo adecuado: perjuicio / prejuicio; latente / latiente; cortejar / cotejar; apóstrofo / apóstrofe.',
              },
            ],
          },
        ],
      },
    ],
    partesComunes: [
      {
        id: 'reflexion-linguistica',
        titulo: '3. Reflexión lingüística',
        instrucciones: 'Parte común a las dos opciones.',
        apartados: [
          {
            id: '3.1',
            titulo: '3.1',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Lea el par mínimo e indique cuál de las dos secuencias es agramatical. Explique a qué se debe la agramaticalidad.',
          },
          {
            id: '3.2',
            titulo: '3.2',
            puntos: 1,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.2 de reflexión lingüística del examen original.',
          },
          {
            id: '3.3',
            titulo: '3.3',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.3 de reflexión lingüística del examen original.',
          },
          {
            id: '3.4',
            titulo: '3.4',
            puntos: 0.5,
            tipo: 'gramatica',
            enunciado:
              'Responda a la cuestión 3.4 de reflexión lingüística del examen original.',
          },
        ],
      },
    ],
  },
]