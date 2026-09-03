export type ExamScoreItem = { label: string; points: string; detail?: string }

export type OfficialExamGuide = {
  id: string
  subject: string
  academicYear: string
  examLabel: string
  durationMinutes: number
  totalPoints: number
  structure: ExamScoreItem[]
  officialCriteria: string[]
  kairoExplanation: string[]
  sourceUrl: string
  sourceDocument: string
  organism: string
  sourceType: 'official_model' | 'official_agreement'
  formalRubric: boolean
}

export const GENERAL_CORRECTION_GUIDE: OfficialExamGuide = {
  id: 'madrid-general-2026',
  subject: 'Criterios generales (todas las materias)',
  academicYear: '2025-2026',
  examLabel: 'Convocatorias PAU 2026',
  durationMinutes: 90,
  totalPoints: 10,
  structure: [
    { label: 'Materias generales', points: 'Hasta -1 punto', detail: 'Los dos primeros errores ortográficos no penalizan; desde el tercero, -0,10 por falta. Redacción y presentación: hasta -0,50.' },
    { label: 'Lengua Castellana y Literatura II', points: 'Hasta -2 puntos', detail: 'El primer error no penaliza; desde el segundo, -0,25 por falta. Redacción y presentación: hasta -1.' },
    { label: 'Latín II y Griego II', points: 'Hasta -1 punto', detail: 'El primer error no penaliza; desde el segundo, -0,10 por falta. Incluyen una rúbrica para producción de textos.' },
    { label: 'Lengua Extranjera II', points: 'Según rúbrica específica', detail: 'La Comisión eliminó el límite global de un punto para no contradecir la rúbrica específica de producción escrita.' },
  ],
  officialCriteria: [
    'En todos los ejercicios se valoran la capacidad expresiva, la corrección ortográfica, la coherencia, la cohesión, la gramática, el léxico y la presentación.',
    'El corrector debe marcar los errores y especificar claramente la deducción aplicada en la nota global.',
    'La misma falta de ortografía repetida se cuenta una sola vez.',
  ],
  kairoExplanation: [
    'Revisa al final tildes y puntuación: una respuesta correcta puede perder nota por la forma.',
    'En Lengua el margen de penalización es mayor, así que reserva unos minutos para releer todo el examen.',
  ],
  sourceUrl: 'https://www.ucm.es/file/criterios-generales-de-correcci%C3%93n-3?ver=',
  sourceDocument: 'Acuerdo de 8 de octubre de 2025 de la Comisión Organizadora de la PAU de Madrid',
  organism: 'Comisión Organizadora PAU · Universidades Públicas de Madrid',
  sourceType: 'official_agreement',
  formalRubric: false,
}

export const OFFICIAL_EXAM_GUIDES: OfficialExamGuide[] = [
  {
    id: 'lengua-castellana-2026', subject: 'Lengua Castellana y Literatura II', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [
      { label: 'Bloque 1 · Comprensión y comentario', points: '4 puntos', detail: 'Comentario 2; resumen de 40-50 palabras 0,6; texto argumentativo de 100-150 palabras 1,4.' },
      { label: 'Bloque 2 · Lengua', points: '3 puntos', detail: 'Sintaxis o reflexión lingüística 1,4; dos cuestiones de morfología, léxico o sociolingüística 1,6.' },
      { label: 'Bloque 3 · Literatura', points: '3 puntos', detail: 'Tema o relación de texto 2; obra leída y contexto 1.' },
    ],
    officialCriteria: ['El resumen debe sintetizar las ideas principales con palabras propias, ser objetivo y no convertirse en paráfrasis.', 'El texto argumentativo debe mostrar una posición clara, argumentos coherentes y expresión personal.', 'La prueba aplica una deducción global máxima de 2 puntos por corrección escrita según los criterios generales de Madrid.'],
    kairoExplanation: ['No basta con saber teoría: en el bloque 1 cuenta mucho ajustarse al tipo y extensión exactos de cada texto.', 'Practica con cronómetro y reserva la revisión final para ortografía, cohesión y claridad.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-leng-y-lit-ort-2025', sourceDocument: 'Modelo de Lengua Castellana y Literatura II · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'historia-espana-2026', subject: 'Historia de España', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [
      { label: 'Cuestiones', points: '3 puntos', detail: 'Tres cuestiones: una por cada bloque; 1 punto cada una.' },
      { label: 'Fuente histórica', points: '3 puntos', detail: 'Identificación y localización 0,5; relación con el proceso histórico 2,5.' },
      { label: 'Análisis de texto o tema', points: '4 puntos', detail: 'En análisis: resumen 0,5; ideas fundamentales 1; contexto histórico 2,5.' },
    ],
    officialCriteria: ['Se valora la síntesis, el lenguaje histórico y las referencias espacio-temporales.', 'En la fuente cuentan la explicación, la conexión temática y la cronología.', 'Las extensiones que aparecen en el modelo son orientativas, no requisitos automáticos de puntuación.'],
    kairoExplanation: ['Organiza cada respuesta con fechas, proceso y consecuencia; así haces visible la relación histórica que busca el corrector.', 'En la fuente no te limites a describir la imagen o texto: conéctala con el proceso pedido.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-historia-de-espana-1', sourceDocument: 'Modelo provisional de Historia de España · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'historia-filosofia-2026', subject: 'Historia de la Filosofía', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [
      { label: 'Pregunta 1 · Texto y diálogo', points: '2,5 puntos', detail: 'Tesis 1; análisis crítico desde otro autor o corriente 1; vocabulario preciso 0,5.' },
      { label: 'Pregunta 2 · Antigua o medieval', points: '2,5 puntos', detail: 'Contenido 2; vocabulario preciso 0,5.' },
      { label: 'Pregunta 3 · Moderna', points: '2,5 puntos', detail: 'Contenido 2; vocabulario preciso 0,5.' },
      { label: 'Pregunta 4 · Contemporánea', points: '2,5 puntos', detail: 'Contenido 2; vocabulario preciso 0,5.' },
    ],
    officialCriteria: ['La primera pregunta separa la identificación de la tesis y su análisis crítico mediante otro autor o corriente.', 'En las preguntas de desarrollo se puntúa el contenido hasta 2 puntos y la precisión del vocabulario hasta 0,5.', 'La cohesión, la coherencia y la adecuación forman parte de la valoración de la exposición.'],
    kairoExplanation: ['Usa vocabulario filosófico exacto y construye un hilo argumental, no una lista de ideas memorizadas.', 'En el diálogo compara de verdad: presenta un punto de encuentro o conflicto entre las dos posiciones.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-historia-de-la-filosofia', sourceDocument: 'Modelo de Historia de la Filosofía · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'matematicas-ii-2026', subject: 'Matemáticas II', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Cinco preguntas', points: '2 puntos cada una', detail: 'Tres obligatorias y dos elegidas entre dos opciones.' }],
    officialCriteria: ['Todas las respuestas deben estar razonadas y debidamente justificadas.', 'El modelo distribuye la puntuación por apartados dentro de cada pregunta.', 'Las preguntas cubren geometría, análisis, probabilidad y los bloques indicados en el modelo.'],
    kairoExplanation: ['Escribe el procedimiento: un resultado aislado puede no demostrar el razonamiento que se evalúa.', 'Antes de elegir opción, compara qué apartados puedes justificar completos, no solo cuál parece más corta.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-matematicas-ii', sourceDocument: 'Modelo orientativo de Matemáticas II · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'matematicas-ccss-2026', subject: 'Matemáticas Aplicadas a las Ciencias Sociales II', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Ejercicio 1', points: '2,5 puntos', detail: 'Obligatorio, sin apartados optativos.' }, { label: 'Ejercicios 2, 3 y 4', points: '2,5 puntos cada uno', detail: 'En cada ejercicio se elige una de las dos preguntas propuestas.' }],
    officialCriteria: ['Todas las respuestas deben estar razonadamente justificadas.', 'La corrección se realiza en múltiplos de 0,1 puntos.', 'Un procedimiento correcto distinto al propuesto debe valorarse adaptando los criterios.'],
    kairoExplanation: ['Indica fórmulas, sustituciones y conclusión contextualizada: los baremos reparten puntos entre esos pasos.', 'En problemas aplicados, termina con una respuesta en el contexto del enunciado.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-matematicas-aplicadas-a-las-ciencias-sociales-ii', sourceDocument: 'Modelo de Matemáticas Aplicadas a las CCSS II · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'fisica-2026', subject: 'Física', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Cuatro preguntas', points: '2,5 puntos cada una', detail: 'Una pregunta sin optatividad y una elección en cada uno de los otros tres bloques.' }],
    officialCriteria: ['Se valora una estructura adecuada, el rigor, los pasos detallados, diagramas y esquemas.', 'Cuenta identificar los principios y leyes físicas implicados, obtener correctamente los resultados y usar unidades del Sistema Internacional.', 'Cada pregunta justificada y correcta vale hasta 2,5 puntos; los apartados se desglosan en múltiplos de 0,1.'],
    kairoExplanation: ['Empieza nombrando la ley física, dibuja cuando ayude y no saltes del dato al resultado.', 'Comprueba unidades y orden de magnitud: forman parte explícita de los criterios.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-fisica', sourceDocument: 'Modelo de Física · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'quimica-2026', subject: 'Química', academicYear: '2025-2026', examLabel: 'Modelo oficial PAU 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Pregunta 1', points: '2,5 puntos', detail: 'Obligatoria.' }, { label: 'Preguntas 2, 3 y 4', points: '2,5 puntos cada una', detail: 'Se elige A o B en cada bloque; el documento desglosa cada apartado entre 0,5 y 1,5 puntos.' }],
    officialCriteria: ['Se valoran la claridad conceptual, la formulación, nomenclatura y lenguaje químico.', 'También cuentan el análisis, las relaciones entre conceptos, la coherencia del desarrollo y el uso correcto de unidades.', 'El modelo publica un baremo específico para cada apartado de las opciones 1, 2A/2B, 3A/3B y 4A/4B.'],
    kairoExplanation: ['Cuida tanto el planteamiento como el lenguaje químico: una fórmula o nomenclatura incorrecta afecta al criterio específico.', 'En cálculos, escribe el desarrollo coherente y termina con unidades.'],
    sourceUrl: 'https://www.ucm.es/file/2026-modelo-quimica-1', sourceDocument: 'Modelo de Química · curso 2025-2026', organism: 'Universidades Públicas de la Comunidad de Madrid', sourceType: 'official_model', formalRubric: false,
  },
]

export const CATALUNYA_GENERAL_CORRECTION_GUIDE: OfficialExamGuide = {
  id: 'catalunya-general-2026', subject: 'Criterios generales (todas las materias)', academicYear: '2025-2026', examLabel: 'PAU Cataluña · junio 2026', durationMinutes: 90, totalPoints: 10,
  structure: [{ label: 'Criterio específico por materia', points: '10 puntos', detail: 'Canal Universitats publica el examen y su pauta de corrección por asignatura y tribunal.' }],
  officialCriteria: ['Cada ejercicio dura una hora y media.', 'La estructura, el reparto de puntos y las penalizaciones se consultan en la ficha oficial de cada materia.', 'Los exámenes y correcciones de junio de 2026 están publicados por día y tribunal.'],
  kairoExplanation: ['Elige tu asignatura para ver su reparto real: no trasladamos el baremo de Madrid a Cataluña.', 'Practica en bloques de 90 minutos y contrasta siempre tu respuesta con la corrección oficial del tribunal.'],
  sourceUrl: 'https://universitats.gencat.cat/es/pau/examens-criteris-correccions/', sourceDocument: 'Exámenes y criterios de corrección 2026', organism: 'Generalitat de Catalunya · Canal Universitats', sourceType: 'official_agreement', formalRubric: false,
}

export const CATALUNYA_OFFICIAL_EXAM_GUIDES: OfficialExamGuide[] = [
  {
    id: 'catalunya-historia-filosofia-2026', subject: 'Historia de la Filosofía', academicYear: '2025-2026', examLabel: 'PAU Cataluña · junio 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Ejercicio 1 · Texto y tres preguntas', points: '6 puntos' }, { label: 'Ejercicio 2 · Desarrollo', points: '2 puntos' }, { label: 'Ejercicio 3 · Evaluación razonada', points: '2 puntos' }],
    officialCriteria: ['El resumen debe identificar las ideas principales y la estructura argumentativa sin añadir teoría ajena al texto.', 'La claridad, coherencia, cohesión y precisión forman parte de la evaluación de la comprensión.', 'Seis o más faltas de ortografía, incluyendo problemas graves de presentación, pueden restar hasta 0,25 puntos.'],
    kairoExplanation: ['En el ejercicio 1 separa lo que afirma el texto de lo que sabes del autor.', 'En el ejercicio 3 toma posición y razona: una opinión sin argumento no demuestra la competencia evaluada.'],
    sourceUrl: 'https://universitats.gencat.cat/es/pau/materies-pau/historia-filosofia/index.html', sourceDocument: 'Estructura y criterios generales de evaluación · Historia de la Filosofía 2026', organism: 'Generalitat de Catalunya · Canal Universitats', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'catalunya-historia-2026', subject: 'Historia', academicYear: '2025-2026', examLabel: 'PAU Cataluña · 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Ejercicio 1 · Análisis crítico de fuentes', points: '2,5 puntos' }, { label: 'Ejercicio 2 · Tiempo y términos históricos', points: '2,5 puntos' }, { label: 'Ejercicio 3 · Tema mediante descriptores', points: '2,5 puntos' }, { label: 'Ejercicio 4 · Saberes', points: '2,5 puntos' }],
    officialCriteria: ['En el análisis de fuentes, 1 punto identifica la información de ambas fuentes y 1,5 puntos las compara y contextualiza.', 'Se valora el vocabulario histórico, el orden lógico, la concreción y la argumentación.', 'La falta de coherencia, corrección o presentación puede descontar hasta el 10 % del ejercicio cuando se indique.'],
    kairoExplanation: ['No describas las fuentes por separado: reserva la mayor parte de la respuesta para contrastarlas y situarlas.', 'Usa conectores de contraste y ubica cada afirmación en su marco temporal.'],
    sourceUrl: 'https://universitats.gencat.cat/es/pau/materies-pau/historia/', sourceDocument: 'Estructura y criterios generales de evaluación · Historia 2026', organism: 'Generalitat de Catalunya · Canal Universitats', sourceType: 'official_model', formalRubric: false,
  },
  {
    id: 'catalunya-quimica-2026', subject: 'Química', academicYear: '2025-2026', examLabel: 'PAU Cataluña · junio 2026', durationMinutes: 90, totalPoints: 10,
    structure: [{ label: 'Ejercicios 1, 2 y 3', points: '2,5 puntos cada uno', detail: 'Dos apartados de 1,25 puntos.' }, { label: 'Ejercicio 4', points: '2,5 puntos', detail: 'Se eligen dos de cuatro tareas; 1,25 puntos cada una.' }],
    officialCriteria: ['Las respuestas deben estar organizadas lógicamente y justificadas de forma que el corrector pueda seguir el razonamiento.', 'Una fórmula química equivocada se penaliza con 0,5 puntos en la subpregunta donde aparezca.', 'Se evalúan conceptos, ecuaciones, cálculos, unidades, terminología científica y legibilidad.'],
    kairoExplanation: ['Escribe el razonamiento completo: el resultado numérico no permite recuperar puntos si no se ve cómo llegaste.', 'Revisa fórmulas y ajuste de ecuaciones antes de entregar; una fórmula errónea tiene una penalización explícita importante.'],
    sourceUrl: 'https://universitats.gencat.cat/es/pau/materies-pau/quimica/index.html', sourceDocument: 'Estructura y criterios generales de evaluación · Química 2026', organism: 'Generalitat de Catalunya · Canal Universitats', sourceType: 'official_model', formalRubric: false,
  },
]

export const ALL_OFFICIAL_EXAM_GUIDES = [GENERAL_CORRECTION_GUIDE, ...OFFICIAL_EXAM_GUIDES]
