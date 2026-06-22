import { whyExplanationToMarkdown } from './whyExplanation'

export interface CorrectionPromptBlock {
  numeroBloque: string
  tema: string
  community?: string
  year: number | string
  convocatoria: string
  option: string
  maxScore: number
  officialPrompt: string
  studentAnswer: string
  criteria?: string
  sourceText?: string
  concepts?: string[]
}

export interface CorrectionPromptInput {
  subject: string
  community?: string
  simulacroId: string
  option: string
  elapsedMinutes: number
  difficulty: 'Fácil' | 'Media' | 'Difícil'
  blocks: CorrectionPromptBlock[]
}

export function buildCorrectionPrompt(input: CorrectionPromptInput) {
  const community = input.community ?? 'Comunidad de Madrid'
  const bloques = input.blocks.map(block => ({
    numero_bloque: block.numeroBloque,
    tema: block.tema,
    comunidad: block.community ?? input.community ?? 'Comunidad de Madrid',
    año_origen: block.year,
    convocatoria_origen: block.convocatoria,
    opcion_origen: block.option,
    puntuacion_maxima: block.maxScore,
    enunciado_oficial: block.officialPrompt,
    criterios_oficiales_disponibles: block.criteria ?? '',
    texto_fuente: block.sourceText ?? null,
    conceptos: block.concepts ?? null,
    respuesta_alumno: block.studentAnswer
  }))

  return `Eres el corrector oficial certificado de las pruebas de acceso a la universidad de ${community} para la asignatura de ${input.subject}. Has corregido miles de exámenes reales y conoces con precisión los criterios oficiales de corrección de esa comunidad.

Este simulacro ha sido generado con preguntas oficiales reales de ${community}. En Matemáticas, Física, Química, Biología, Inglés e Historia puede combinar preguntas de distintos años y convocatorias; en Lengua Castellana y Literatura II los bloques deben tratarse como partes de un mismo examen cuando compartan texto fuente. Cada pregunta tiene su propio año, convocatoria y criterio de corrección oficial. Tu evaluación debe tratar cada pregunta de forma independiente aplicando el criterio del año exacto del que proviene, y en Lengua e Inglés debes conservar la coherencia del texto común.

### CONTEXTO DEL SIMULACRO

- Asignatura: ${input.subject}
- ID del simulacro: ${input.simulacroId}
- Opción elegida por el alumno: ${input.option}
- Tiempo real empleado: ${input.elapsedMinutes} minutos sobre 90 minutos oficiales. Si es 0, el sistema no ha cronometrado esta práctica.
- Dificultad estimada del simulacro: ${input.difficulty}

### COMPOSICIÓN DEL SIMULACRO

Este examen está formado por ${bloques.length} bloque(s). Se te proporciona para cada bloque: el enunciado oficial original, el año y convocatoria de procedencia, la puntuación máxima oficial, los criterios disponibles y la respuesta redactada por el alumno.

${JSON.stringify(bloques, null, 2)}

### CRITERIOS DE CORRECCIÓN POR ASIGNATURA

Matemáticas II:
- Resultado correcto sin desarrollo: máximo 0.5 pts sobre cualquier apartado.
- Ausencia de unidades en resultado final: -0.25 pts por apartado.
- Error de cálculo arrastrado desde un paso correcto: no penaliza dos veces. Descuenta máximo 0.5 pts adicionales sobre el total del bloque.
- Planteamiento correcto con resultado erróneo: hasta el 60% de la puntuación máxima.
- Geometría y análisis: exige justificación explícita de todos los pasos intermedios.
- Probabilidad: exige identificación del espacio muestral y justificación del modelo usado.

Matemáticas Aplicadas a las Ciencias Sociales:
- No la trates como Matemáticas II: aplica un enfoque de PAU CCSS, con problemas contextualizados de economía, ciencias sociales, probabilidad, estadística, funciones, derivadas, integrales, matrices, sistemas y programación lineal cuando aparezcan en el enunciado oficial.
- Resultado correcto sin desarrollo: máximo 0.5 pts por apartado.
- Planteamiento correcto con resultado erróneo: hasta el 60% de la puntuación máxima.
- En probabilidad y estadística exige identificar sucesos, distribución o parámetro usado y justificar el modelo.
- En programación lineal exige definir variables, restricciones, región factible, función objetivo y conclusión contextualizada.
- Conserva LaTeX para fórmulas, matrices, fracciones, distribuciones y notación matemática.

Física:
- Sin enunciado explícito de la ley o principio físico aplicado: -0.5 pts por apartado.
- Ausencia de unidades en resultado numérico: -0.25 pts por apartado.
- Orden de magnitud incorrecto en resultado final: máximo 0.5 pts sobre ese apartado.
- Análisis dimensional presente y correcto: suma hasta +0.1 pts de valoración positiva.
- Planteamiento correcto con error numérico final: hasta el 70% de la puntuación máxima.

Química:
- Reacción sin ajustar o mal ajustada: -0.5 pts por apartado afectado.
- Ausencia de estados de agregación cuando sean relevantes: -0.25 pts.
- Nomenclatura IUPAC incorrecta en compuestos clave: -0.25 pts.
- Cálculos estequiométricos sin factor de conversión explícito: máximo 0.5 pts sobre ese apartado.
- Resultado correcto sin desarrollo del cálculo: máximo 0.5 pts.

Biología:
- En Cataluña, respeta la puntuación y todos los apartados del ejercicio oficial concreto. No fuerces el formato ni las opciones de Madrid.
- Si el ejercicio está marcado como pendiente de imagen y la imagen no se ha enviado, corrige únicamente los apartados que puedan evaluarse con el texto disponible e indica claramente la limitación.
- Valora precisión conceptual y uso correcto de terminología biológica. Un término clave usado de forma incorrecta debe penalizarse de forma proporcional.
- En procesos biológicos, exige orden causal: moléculas, estructuras, mecanismos y consecuencias deben estar relacionados, no solo enumerados.
- En genética, bioquímica y fisiología, distingue entre planteamiento correcto, error puntual de nomenclatura y error conceptual grave.
- Si hay esquemas, imágenes o figuras en el enunciado, evalúa la interpretación de sus elementos solo cuando estén disponibles en el bloque.
- Respuestas memorísticas sin aplicación al caso planteado: máximo 60% del bloque si no conectan con el enunciado concreto.

Historia de España:
- Error cronológico grave (más de 10 años en fecha clave): -0.5 pts por error, máximo -1 pt total.
- Comentario de texto sin identificar naturaleza, contexto, ideas principales y conclusión: descuento proporcional según elementos ausentes.
- Desarrollo sin estructura (introducción, argumentación con causas/consecuencias, conclusión): máximo 60% de la puntuación del bloque.
- Mera enumeración de datos sin argumentación histórica: máximo 1.0 pt independientemente de la extensión.
- Uso correcto de vocabulario histórico específico: valoración positiva de hasta +0.25 pts.

Inglés:
- Aplica siempre primero los criterios oficiales incluidos en el bloque. No fuerces el formato de Madrid cuando la comunidad sea Cataluña.
- Cataluña Reading (2020-2024): cada pregunta tipo test vale 0,375 pts; una respuesta incorrecta resta 0,125 pts y una pregunta no contestada no penaliza.
- Cataluña Reading (2025): cada respuesta abierta vale 0,5 pts y la falta de inteligibilidad puede descontar hasta 0,3 pts del total de Reading.
- Cataluña Writing: máximo 4 pts. Evalúa gramática, vocabulario, organización del texto y madurez/adecuación según el enunciado oficial.
- Q1 True/False (pre-2024): 1 pt por apartado. La respuesta TRUE o FALSE debe ir acompañada de la cita textual exacta del texto que la justifica. Sin cita = 0 en ese apartado. No penalices imprecisiones menores en la cita si la idea es correcta.
- Q1 True/False/Not Given (2024-2025): el alumno elige 2 de 3 enunciados. Mismos criterios que T/F pero si la respuesta es NG no debe aportar cita; si aporta cita cuando es NG = 0.
- Q2 Comprensión abierta: 1 pt por pregunta (total 2 pts). 0,5 pts por las ideas parafraseadas correctas; 0,5 pts por la expresión escrita. Penaliza copia literal del texto (máximo 0,25 pts en ese subapartado).
- Q3 Vocabulario/Sinónimos: 0,25 pts por ítem correcto (4 ítems = 1 pt). El sinónimo debe ser adecuado al contexto del párrafo indicado. Acepta variantes léxicas siempre que sean contextualmente correctas.
- Q4 Gramática (pre-2024): 0,25 pts por hueco en blanco correcto. 0,5 pts por transformación de oración o ítem de estilo indirecto (carácter unitario). La oración debe ser gramatical, ortográfica y semánticamente correcta. No penalices variantes válidas no incluidas en la solución oficial si son correctas.
- Q4 Gramática (2024-2025): el alumno elige 4 de 6 ítems. 0,5 pts por ítem correcto (carácter unitario). Si responde más de 4, solo puntúan los primeros 4.
- Q5 Redacción: 3 pts. Escala de 6 subapartados de 0,5 pts cada uno (2024-2025) o 1,5 pts dominio de la lengua + 1,5 pts madurez de ideas. Evalúa: cumplimiento de la tarea, extensión (150-200 palabras), organización, coherencia, conectores, variedad gramatical, vocabulario y ortografía. Penaliza contenido irrelevante, falta de registro o extensión claramente insuficiente.
- Para todos los ejercicios: responde en inglés tal y como hace el alumno. Evalúa en español pero cita las partes relevantes de la respuesta del alumno en inglés.

Lengua Castellana y Literatura II:
- Bloque 1, 1.1a tema: valora si enuncia el tema de forma concisa en 1-2 líneas. Máximo 0.5 pts.
- Bloque 1, 1.1b características: valora si analiza recursos lingüísticos y estilísticos y explica su función en el texto. Máximo 1.5 pts. Si solo lista rasgos sin explicar función, máximo 0.75 pts.
- Bloque 1, 1.1c tipo de texto: valora si identifica correctamente tipo textual y género discursivo. Máximo 0.5 pts.
- Bloque 1, 1.2 resumen: debe tener como máximo 6-7 líneas, ideas principales, palabras propias, coherencia y objetividad. Máximo 1 pt.
- Bloque 1, 1.3 texto argumentativo: posición clara, argumentos, estructura y expresión personal. Máximo 1.5 pts.
- Bloque 2, 2.1/2.2 sintaxis: exige análisis funcional interoracional e intraoracional hasta el nivel de palabras. Máximo 1.5 pts.
- Bloque 2, 2.3/2.4 morfología/semántica: definición, análisis y ejemplos correctos cuando proceda. Máximo 1 pt.
- Bloque 3, 3.1/3.2 literatura: conocimiento global del movimiento, autores y obras relevantes. Máximo 1.5 pts. Si es mero catálogo sin análisis conjunto, máximo 0.75 pts.
- Bloque 3, 3.3/3.4 obra leída: relación obra-contexto sociohistórico-tradición literaria. Máximo 1 pt.
- Penalización ortográfica sobre nota final: la primera falta distinta no penaliza; la misma falta repetida cuenta una sola vez; desde la segunda falta distinta, descuenta -0.25 pts por falta hasta un máximo de -2 pts.
- Errores de redacción, presentación, coherencia, cohesión, léxico o gramática: hasta -1 pt adicional, respetando una deducción máxima global de 2 pts.
- En respuestas abiertas, valora precisión conceptual, organización, riqueza léxica y corrección gramatical. No exijas una única solución literal si el criterio oficial admite respuesta abierta.

### INSTRUCCIONES DE EVALUACIÓN

REGLAS DE FORMATO LATEX — OBLIGATORIAS:

1. Para fórmulas inline usa SIEMPRE $...$ con contenido en una sola línea.
   CORRECTO: $f(x) = x^2$
   INCORRECTO: $$f(x) = x^2$$

2. Para bloques de ecuación usa $$...$$ con el contenido en líneas separadas:
   CORRECTO:
   $$
   \\int_a^b f(x)\\,dx
   $$
   INCORRECTO: $$\\int_a^b f(x)\\,dx$$ (todo en una línea mezclado con texto)

3. NUNCA uses \\begin{cases} dentro de $...$:
   INCORRECTO: $\\begin{cases} x=1 \\\\ y=2 \\end{cases}$
   CORRECTO — escribe sistemas como lista de ecuaciones separadas:
   - $x = 1$
   - $y = 2$
   O usa bloque $$ separado:
   $$
   \\begin{cases} x=1 \\\\ y=2 \\end{cases}
   $$

4. NUNCA mezcles $$ y $:
   INCORRECTO: $$\\vec{v}$
   CORRECTO: $\\vec{v}$

5. NUNCA dejes un delimitador $ sin cerrar.

6. NUNCA escribas LaTeX dentro de bloques de código.

7. Si una fórmula es larga, divídela en partes más cortas.

8. Mantén las respuestas compactas — no expliques más de lo necesario.

1. Corrige cada bloque de forma independiente.
2. Si la respuesta está en blanco, dilo claramente y puntúa solo lo justificable. No inventes trabajo del alumno.
3. Si la respuesta es absurda, irrelevante o no responde al enunciado, dilo con respeto y explica por qué no puntúa.
4. Para cada bloque identifica qué ha hecho bien, qué está mal, qué falta, dónde falla exactamente y cómo debería mejorar.
5. Cada punto descontado debe tener un motivo claro y concreto en penalizaciones_aplicadas.
6. No des 0 automáticamente salvo que esté justificado por respuesta en blanco, ausencia total de planteamiento válido o respuesta no relacionada.
7. Para cada bloque, puntos_maximos debe ser exactamente la puntuación máxima oficial enviada en puntuacion_maxima. No uses 10, 14, 100 ni ninguna escala inventada para un ejercicio individual.
8. Si calculas nota_final, hazlo únicamente como resumen proporcional sobre 10 a partir de la suma de puntos_conseguidos / puntos_maximos de los bloques. La corrección visible del ejercicio debe basarse siempre en puntos_conseguidos / puntos_maximos.
9. Si una puntuación máxima enviada es 2.5, 1.5, 4, etc., la respuesta JSON debe conservar exactamente esa escala en puntos_maximos. Nunca inventes /14.
10. Si el tiempo supera 90 minutos, rellena advertencia_tiempo. Si el tiempo es 0, advertencia_tiempo debe indicar que esta práctica no ha sido cronometrada.
11. Feedback directo, accionable y específico a la respuesta real del alumno. Evita frases genéricas.
12. El plan de repaso debe salir solo de los errores detectados.
13. Incluye solucion_orientativa por bloque con el planteamiento o respuesta esperada.
14. Resume cada bloque temático con nivel: Domina / En progreso / Necesita refuerzo urgente.
15. Contextualiza la nota según la dificultad.
16. En todos los campos de texto usa Markdown claro: títulos cortos, listas y pasos numerados cuando ayuden a entender la corrección.
17. Escribe las fórmulas matemáticas, físicas y químicas con LaTeX: inline con $...$. Para sistemas, matrices y expresiones de varias líneas, usa entornos \\begin{cases}...\\end{cases}, \\begin{pmatrix}...\\end{pmatrix}, etc. SIN $ externos — el renderizador los envuelve automáticamente.
18. No uses HTML ni párrafos largos y apelmazados. Separa claramente aciertos, errores, corrección paso a paso, respuesta modelo y consejo final.
19. Aunque la salida completa sea JSON puro, los valores de texto dentro del JSON pueden y deben contener Markdown y LaTeX válidos.
20. porqueEsAsi es opcional. Inclúyelo solo si puedes cerrar el JSON correctamente. Debe sonar como una explicación de un profesor PAU: concepto central, por qué se aplica al enunciado concreto, cómo pensarlo, qué ocurrió en la respuesta del alumno, error típico, mini ejemplo original y frase/checklist para sacar puntos. No copies apuntes ni libros. Usa Markdown y LaTeX cuando proceda: $...$ inline; entornos \\begin{...} sin $ externos para sistemas. NUNCA mezcles delimitadores ni pongas \\begin{...} dentro de $...$.
21. Mantén teoria_ejercicio solo como compatibilidad legacy si aparece en datos antiguos; para respuestas nuevas usa porqueEsAsi. Si falta espacio o no hay información suficiente, devuelve porqueEsAsi como null o con status "not_available" y prioriza siempre la corrección principal y un JSON válido.

22. No escribas nunca valores visibles como undefined, null o NaN en campos de texto. Si falta informacion, deja el campo como cadena vacia, array vacio o null JSON real segun corresponda.
23. No juntes titulos con el texto siguiente: escribe "Definir las variables" y luego un salto de linea antes de "Asignamos...". Lo mismo para "Plantear las ecuaciones", "Resolver el sistema", "Sistema resultante", "Puntos fuertes", "Errores a corregir", "Correccion paso a paso", "Teoria aplicada", "Solucion" y "Conclusion".
24. Separa listas numeradas con saltos de linea reales. Nunca devuelvas "1. ...2. ...3. ..." en una sola linea.
25. Usa LaTeX solo para formulas, no para parrafos completos. Formulas cortas en $...$. Sistemas, matrices y bloques multilínea: usa entornos \\begin{...}...\\end{...} sin delimitadores $ externos.
26. Para sistemas y matrices usa entornos KaTeX SIN delimitadores externos: \\begin{cases}...\\end{cases}, \\begin{pmatrix}...\\end{pmatrix}, etc. — el renderizador los envuelve automáticamente. NUNCA pongas \\begin{...} dentro de $...$: causa errores. No dejes \\frac, \\implies, \\cdot, \\begin{cases} o \\end{matrix} como texto plano fuera de delimitadores.
27. Manten el idioma del enunciado o de la respuesta del alumno: castellano si esta en castellano, catalan si esta en catalan. No mezcles idiomas salvo citas necesarias.
28. Control de longitud: se especifico pero breve. No repitas el enunciado ni la respuesta del alumno. Maximo 3 puntos fuertes, 3 errores principales y 3 pasos de mejora. La teoria relacionada debe ocupar como maximo 2 lineas. Prioriza correccion accionable y JSON valido sobre explicaciones largas.
29. Evita introducciones, recapitulaciones y frases de relleno. Si hay muchos apartados, usa una frase clara por apartado y reserva el detalle para los errores que cambian nota.
30. En correcciones de imagen, limita aciertos, errores y mejoras a 3 elementos cada uno. No describas la imagen salvo que sea imprescindible para justificar la nota.
31. La solucion_orientativa debe ser suficiente para aprender, pero compacta: pasos clave, resultado esperado y criterio de puntuacion. No desarrolles una clase completa.

### FORMATO DE SALIDA

Responde ÚNICAMENTE con un objeto JSON válido. Cero texto fuera del JSON. Cero markdown. Cero introducciones. Solo JSON puro con esta forma:

{
  "simulacro_id": "${input.simulacroId}",
  "asignatura": "${input.subject}",
  "nota_final": 0.00,
  "tiempo_empleado_minutos": ${input.elapsedMinutes},
  "advertencia_tiempo": null,
  "dificultad_simulacro": "${input.difficulty}",
  "contexto_dificultad": "",
  "feedback_general": "",
  "fortalezas": [""] ,
  "errores_principales": [""] ,
  "puntos_fuertes": "",
  "puntos_mejora": "",
  "plan_repaso": [
    { "prioridad": 1, "tema": "", "accion": "", "tiempo_recomendado": "", "recurso_sugerido": "" },
    { "prioridad": 2, "tema": "", "accion": "", "tiempo_recomendado": "", "recurso_sugerido": "" },
    { "prioridad": 3, "tema": "", "accion": "", "tiempo_recomendado": "", "recurso_sugerido": "" }
  ],
  "desglose_bloques": [
    {
      "numero_bloque": "Bloque 1",
      "tema": "",
      "año_origen": 0,
      "convocatoria_origen": "",
      "nota": 0.00,
      "max_puntos": 0.00,
      "puntos_conseguidos": 0.00,
      "puntos_maximos": 0.00,
      "porcentaje_logrado": 0,
      "que_hizo_bien": "",
      "errores_detectados": [""],
      "que_faltaba": "",
      "penalizaciones_aplicadas": [
        { "motivo": "", "puntos_descontados": -0.25 }
      ],
      "correccion_detalle": "",
      "solucion_correcta_corta": "",
      "solucion_orientativa": "",
      "consejo_especifico": "",
      "consejo_para_mejorar": "",
      "teoria_ejercicio": "",
      "porqueEsAsi": {
        "title": "¿Por qué es así?",
        "keyIdea": "",
        "whyHere": "",
        "method": "",
        "studentConnection": "",
        "commonMistake": "",
        "miniExample": "",
        "examTip": "",
        "sourcesUsed": [],
        "status": "generated"
      }
    }
  ],
  "resumen_por_bloque_tematico": [
    {
      "bloque": "",
      "puntos_conseguidos": 0.00,
      "puntos_maximos": 0.00,
      "porcentaje": 0,
      "nivel": "Domina / En progreso / Necesita refuerzo urgente",
      "aparece_en_plan_repaso": true
    }
  ]
}`
}

// Compact subject-specific grading rules for per-block prompts.
// Full version lives in buildCorrectionPrompt; this covers the key deductions only.
const BLOCK_SUBJECT_CRITERIA: Record<string, string> = {
  'Matemáticas II': `- Resultado sin desarrollo: máx 0.5 pts por apartado.
- Sin unidades en resultado final: -0.25 pts por apartado.
- Error de cálculo arrastrado desde paso correcto: máx -0.5 pts adicionales sobre el bloque.
- Planteamiento correcto con resultado erróneo: hasta 60% de la puntuación.
- Geometría y análisis: exige justificación explícita de todos los pasos intermedios.`,
  'Matemáticas Aplicadas a las Ciencias Sociales': `- No la trates como Matemáticas II: aplica formato PAU CCSS y el contexto social/económico del enunciado.
- Resultado sin desarrollo: máx 0.5 pts por apartado.
- Planteamiento correcto con resultado erróneo: hasta 60% de la puntuación.
- Probabilidad/estadística: exige identificar sucesos, distribución o parámetro y justificar el modelo.
- Programación lineal: exige variables, restricciones, región factible, función objetivo y conclusión contextualizada.
- Conserva LaTeX en fórmulas, matrices, fracciones y notación matemática.`,
  'Física': `- Sin enunciar la ley o principio físico aplicado: -0.5 pts por apartado.
- Sin unidades en resultado numérico: -0.25 pts por apartado.
- Orden de magnitud incorrecto en resultado final: máx 0.5 pts en ese apartado.
- Planteamiento correcto con error numérico: hasta 70% de la puntuación.`,
  'Química': `- Reacción sin ajustar o mal ajustada: -0.5 pts por apartado.
- Sin estados de agregación cuando sean relevantes: -0.25 pts.
- IUPAC incorrecta en compuestos clave: -0.25 pts.
- Sin factor de conversión explícito en estequiometría: máx 0.5 pts por apartado.
- Resultado correcto sin desarrollo: máx 0.5 pts.`,
  'Biología': `- Valora precisión conceptual y uso correcto de terminología biológica.
- En procesos biológicos exige orden causal: moléculas → estructuras → mecanismos → consecuencias.
- Respuesta memorística sin aplicación al caso planteado: máx 60%.`,
  'Historia de España': `- Error cronológico grave (>10 años en fecha clave): -0.5 pts/error, máx -1 pt total.
- Sin identificar naturaleza, contexto, ideas principales y conclusión: descuento proporcional.
- Sin estructura (introducción, argumentación, conclusión): máx 60%.
- Enumeración sin argumentación histórica: máx 1.0 pt.`,
  'Inglés': `- Aplica primero los criterios oficiales incluidos en el bloque.
- Cataluña: sigue el modelo de corrección de Cataluña, no el de Madrid.
- Evalúa en español; cita partes relevantes del alumno en inglés.`,
  'Lengua Castellana y Literatura II': `- Penalización ortográfica: desde la 2ª falta distinta, -0.25 pts por falta, máx -2 pts total.
- Errores de redacción, presentación, coherencia o gramática: hasta -1 pt adicional, máx -2 pts global.`
}

export function buildBlockPrompt({
  block,
  blockIndex,
  totalBlocks,
  subject,
  community
}: {
  block: CorrectionPromptBlock
  blockIndex: number
  totalBlocks: number
  subject: string
  community: string
}): string {
  const criteria = BLOCK_SUBJECT_CRITERIA[subject] ?? ''
  const studentAnswer = block.studentAnswer?.trim() ? block.studentAnswer : '(sin respuesta)'

  return `Eres el corrector oficial certificado de ${subject} para ${community}. Corrige el siguiente ejercicio oficial de acceso a la universidad.

CONTEXTO:
- Bloque: ${blockIndex + 1} de ${totalBlocks}
- Tema: ${block.tema}
- Año/convocatoria: ${block.year} · ${block.convocatoria}
- Puntuación máxima oficial: ${block.maxScore}
${block.criteria ? `\nCRITERIOS OFICIALES DEL EJERCICIO:\n${block.criteria}` : ''}
ENUNCIADO OFICIAL:
${block.officialPrompt}
${block.sourceText ? `\nTEXTO FUENTE:\n${block.sourceText.slice(0, 1500)}` : ''}
RESPUESTA DEL ALUMNO:
${studentAnswer}
${criteria ? `\nCRITERIOS DE CORRECCIÓN:\n${criteria}` : ''}
INSTRUCCIONES:
REGLAS DE FORMATO LATEX — OBLIGATORIAS:

1. Para fórmulas inline usa SIEMPRE $...$ con contenido en una sola línea.
   CORRECTO: $f(x) = x^2$
   INCORRECTO: $$f(x) = x^2$$

2. Para bloques de ecuación usa $$...$$ con el contenido en líneas separadas:
   CORRECTO:
   $$
   \\int_a^b f(x)\\,dx
   $$
   INCORRECTO: $$\\int_a^b f(x)\\,dx$$ (todo en una línea mezclado con texto)

3. NUNCA uses \\begin{cases} dentro de $...$:
   INCORRECTO: $\\begin{cases} x=1 \\\\ y=2 \\end{cases}$
   CORRECTO — escribe sistemas como lista de ecuaciones separadas:
   - $x = 1$
   - $y = 2$
   O usa bloque $$ separado:
   $$
   \\begin{cases} x=1 \\\\ y=2 \\end{cases}
   $$

4. NUNCA mezcles $$ y $:
   INCORRECTO: $$\\vec{v}$
   CORRECTO: $\\vec{v}$

5. NUNCA dejes un delimitador $ sin cerrar.

6. NUNCA escribas LaTeX dentro de bloques de código.

7. Si una fórmula es larga, divídela en partes más cortas.

8. Mantén las respuestas compactas — no expliques más de lo necesario.

1. Aplica el criterio oficial exacto de ${block.year}. La nota no puede superar ${block.maxScore}.
2. Si la respuesta está en blanco, puntúa 0 y justifícalo brevemente.
3. Cada punto descontado en penalizaciones_aplicadas debe tener motivo concreto.
4. Usa Markdown y LaTeX en los campos de texto: $...$ para inline; entornos \\begin{...} sin $ externos para sistemas y matrices.
5. Feedback directo y específico a la respuesta real, no genérico.
6. Añade porqueEsAsi si puedes hacerlo de forma específica y breve. Debe explicar por qué el concepto/método se aplica aquí, conectar con el error o acierto del alumno y dar un mini ejemplo original. Si falta contexto, usa status "not_available" sin inventar. No copies material externo.
7. Formato obligatorio dentro de los campos de texto: Markdown limpio, listas separadas por saltos de linea, sin parrafos enormes, sin "undefined", "null" o "NaN" visibles, y sin titulos pegados a la frase siguiente.
8. LaTeX obligatorio para matematicas/fisica/quimica: formulas inline en $...$; sistemas y matrices con \\begin{cases}...\\end{cases}, \\begin{pmatrix}...\\end{pmatrix} SIN $ externos (el renderizador envuelve). No dejes \\frac, \\implies, \\cdot, \\begin{cases} o \\end{matrix} como texto plano. NUNCA pongas \\begin{...} dentro de $...$.
9. Manten el idioma del ejercicio o de la respuesta del alumno. Si el enunciado esta en catalan, corrige en catalan; si esta en castellano, corrige en castellano.
10. Control de longitud: se especifico pero breve. Maximo 3 aciertos, 3 errores y 3 mejoras; teoria en 2 lineas; no repitas enunciado ni respuesta del alumno.
11. Responde ÚNICAMENTE con el JSON siguiente, sin texto adicional ni markdown envolvente:

{
  "nota": 0.00,
  "max_puntos": ${block.maxScore},
  "porcentaje_logrado": 0,
  "que_hizo_bien": "",
  "errores_detectados": [""],
  "que_faltaba": "",
  "penalizaciones_aplicadas": [
    {"motivo": "", "puntos_descontados": -0.25}
  ],
  "correccion_detalle": "",
  "solucion_orientativa": "",
  "consejo_para_mejorar": "",
  "porqueEsAsi": {
    "title": "¿Por qué es así?",
    "keyIdea": "",
    "whyHere": "",
    "method": "",
    "studentConnection": "",
    "commonMistake": "",
    "miniExample": "",
    "examTip": "",
    "sourcesUsed": [],
    "status": "generated"
  }
}`
}

export function parseCorrectionJson(text: string) {
  try {
    const cleaned = text
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim()
    const firstBrace = cleaned.indexOf('{')
    const lastBrace = cleaned.lastIndexOf('}')
    const jsonText = firstBrace >= 0 && lastBrace > firstBrace ? cleaned.slice(firstBrace, lastBrace + 1) : cleaned

    const latexRepaired = repairLatexEscapes(jsonText)
    const closedJson = closeTruncatedJson(jsonText)
    const attempts = [jsonText, latexRepaired, closedJson, repairLatexEscapes(closedJson)]

    for (const attempt of attempts) {
      try {
        return restoreLatexEscapes(JSON.parse(attempt))
      } catch {
        // Try the next progressively more tolerant representation.
      }
    }
    return null
  } catch {
    return null
  }
}

function repairLatexEscapes(jsonText: string) {
  return jsonText.replace(/"(?:[^"\\]|\\.)*"/g, match =>
    match.replace(/\\(?!["\\\/bfnrtu])/g, '\\\\')
  )
}

function closeTruncatedJson(jsonText: string) {
  const stack: string[] = []
  let inString = false
  let escaped = false

  for (const char of jsonText) {
    if (inString) {
      if (escaped) {
        escaped = false
      } else if (char === '\\') {
        escaped = true
      } else if (char === '"') {
        inString = false
      }
      continue
    }

    if (char === '"') inString = true
    else if (char === '{' || char === '[') stack.push(char)
    else if (char === '}' && stack.at(-1) === '{') stack.pop()
    else if (char === ']' && stack.at(-1) === '[') stack.pop()
  }

  let repaired = jsonText.trimEnd()
  if (inString) {
    if (escaped) repaired += '\\'
    repaired += '"'
  }
  repaired = repaired.replace(/,\s*$/, '')
  if (/:\s*$/.test(repaired)) repaired += 'null'

  while (stack.length) repaired += stack.pop() === '{' ? '}' : ']'
  return repaired
}

// After parsing, restore LaTeX commands that were silently corrupted by valid JSON escapes.
// \f (form-feed U+000C) and \b (backspace U+0008) are valid JSON escapes, so the AI's
// \frac / \forall (→ form-feed + rac/orall) and \beta / \begin (→ backspace + eta/egin)
// survive JSON.parse but arrive as wrong characters. Restore them here.
function restoreLatexEscapes(obj: any): any {
  if (typeof obj === 'string') {
    return obj
      .replace(/([a-zA-Z])/g, '\\f$1')  // form-feed + letter → \f... (was \frac, \forall…)
      .replace(/\x08([a-zA-Z])/g, '\\b$1')    // backspace + letter  → \b... (was \beta, \begin…)
  }
  if (Array.isArray(obj)) return obj.map(restoreLatexEscapes)
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, any>).map(([k, v]) => [k, restoreLatexEscapes(v)])
    )
  }
  return obj
}

export function correctionJsonToMarkdown(data: any) {
  return correctionJsonToMarkdownWithOptions(data)
}

export function correctionJsonToMarkdownWithOptions(data: any, options: { officialMaxScore?: number } = {}) {
  const bloques = Array.isArray(data?.desglose_bloques) ? data.desglose_bloques : []
  const plan = Array.isArray(data?.plan_repaso) ? data.plan_repaso : []
  const resumen = Array.isArray(data?.resumen_por_bloque_tematico) ? data.resumen_por_bloque_tematico : []
  const firstBlock = bloques[0] ?? null
  const officialMax = normalizeScore(options.officialMaxScore)
  const firstMax = officialMax ?? normalizeScore(firstBlock?.puntos_maximos ?? firstBlock?.max_puntos)
  const firstScore = firstMax != null
    ? clampScore(normalizeScore(firstBlock?.puntos_conseguidos ?? firstBlock?.nota) ?? 0, firstMax)
    : null
  const heading = firstMax != null
    ? `## Nota: ${formatNumber(firstScore)}/${formatNumber(firstMax)} pts`
    : `## Nota: ${formatNumber(data?.nota_final)}/10`

  return [
    `# Resultado general\n${heading.replace(/^## /, '')}`,
    data?.advertencia_tiempo ? `> ${data.advertencia_tiempo}` : '',
    data?.feedback_general ?? '',
    `## Lo que está bien\n${listOrText(data?.fortalezas, data?.puntos_fuertes)}`,
    `## Errores o mejoras\n${listOrText(data?.errores_principales, data?.puntos_mejora)}`,
    ...bloques.map((block: any) => [
      `## Corrección paso a paso`,
      `### ${block.numero_bloque ?? 'Bloque'} · ${block.tema ?? ''}`,
      `**Puntuación:** ${formatNumber(block.puntos_conseguidos)}/${formatNumber(block.puntos_maximos)} (${block.porcentaje_logrado ?? 0}%)`,
      block.que_hizo_bien ? `**Aciertos**\n\n${block.que_hizo_bien}` : '',
      block.errores_detectados?.length ? `**Errores detectados**\n\n${listOrText(block.errores_detectados)}` : '',
      block.que_faltaba ? `**Qué faltaba**\n\n${block.que_faltaba}` : '',
      block.correccion_detalle ?? '',
      penaltiesToMarkdown(block.penalizaciones_aplicadas),
      `## Respuesta modelo\n${block.solucion_orientativa ?? block.solucion_correcta_corta ?? ''}`,
      `## Consejo final\n${block.consejo_especifico ?? block.consejo_para_mejorar ?? ''}`
    ].filter(Boolean).join('\n\n')),
    plan.length ? `### Plan de repaso\n${plan.map((item: any) => `${item.prioridad}. **${item.tema}**: ${item.accion} (${item.tiempo_recomendado}). ${item.recurso_sugerido}`).join('\n')}` : '',
    resumen.length ? `### Resumen por bloque\n${resumen.map((item: any) => `- **${item.bloque}**: ${formatNumber(item.puntos_conseguidos)}/${formatNumber(item.puntos_maximos)} · ${item.nivel}`).join('\n')}` : '',
    bloques.some((block: any) => whyBlockMarkdown(block))
      ? `## ¿Por qué es así?\n${bloques
        .filter((block: any) => whyBlockMarkdown(block))
        .map((block: any) => [
          `### ${block.numero_bloque ?? 'Bloque'} · ${block.tema ?? ''}`,
          whyBlockMarkdown(block)
        ].filter(Boolean).join('\n\n'))
        .join('\n\n')}`
      : ''
  ].filter(Boolean).join('\n\n')
}

export function normalizeCorrectionForOfficialScores(data: any, officialMaxScores: number[]) {
  const hasBlockShape = data && typeof data === 'object' && (
    data.correccion_detalle ||
    data.solucion_orientativa ||
    data.que_hizo_bien ||
    data.errores_detectados ||
    data.porqueEsAsi ||
    data.whyExplanation
  )
  const blocks = Array.isArray(data?.desglose_bloques)
    ? data.desglose_bloques
    : hasBlockShape
      ? [data]
      : []
  const normalizedBlocks = blocks.map((block: any, index: number) => {
    const officialMax = normalizeScore(officialMaxScores[index]) ?? normalizeScore(block?.puntos_maximos ?? block?.max_puntos) ?? 0
    const score = clampScore(normalizeScore(block?.puntos_conseguidos ?? block?.nota) ?? 0, officialMax)
    const percentage = officialMax > 0 ? Math.round((score / officialMax) * 100) : 0
    return {
      ...block,
      nota: score,
      max_puntos: officialMax,
      puntos_conseguidos: score,
      puntos_maximos: officialMax,
      porcentaje_logrado: percentage
    }
  })
  const totalMax = normalizedBlocks.reduce((sum: number, block: any) => sum + (normalizeScore(block.puntos_maximos) ?? 0), 0)
  const totalScore = normalizedBlocks.reduce((sum: number, block: any) => sum + (normalizeScore(block.puntos_conseguidos) ?? 0), 0)
  const notaFinal = totalMax > 0 ? Number(((totalScore / totalMax) * 10).toFixed(2)) : normalizeScore(data?.nota_final) ?? 0

  return {
    ...data,
    nota_final: notaFinal,
    nota_sobre_14: undefined,
    desglose_bloques: normalizedBlocks,
    resumen_por_bloque_tematico: Array.isArray(data?.resumen_por_bloque_tematico) && data.resumen_por_bloque_tematico.length
      ? data.resumen_por_bloque_tematico.map((item: any, index: number) => {
        const block = normalizedBlocks[index]
        if (!block) return item
        return {
          ...item,
          puntos_conseguidos: block.puntos_conseguidos,
          puntos_maximos: block.puntos_maximos,
          porcentaje: block.porcentaje_logrado
        }
      })
      : normalizedBlocks.map((block: any) => ({
        bloque: block.tema ?? block.numero_bloque ?? 'Bloque',
        puntos_conseguidos: block.puntos_conseguidos,
        puntos_maximos: block.puntos_maximos,
        porcentaje: block.porcentaje_logrado,
        nivel: block.porcentaje_logrado >= 80 ? 'Domina' : block.porcentaje_logrado >= 50 ? 'En progreso' : 'Necesita refuerzo urgente',
        aparece_en_plan_repaso: block.porcentaje_logrado < 80
      }))
  }
}

function penaltiesToMarkdown(items: any) {
  if (!Array.isArray(items) || !items.length) return ''
  return `**Penalizaciones aplicadas:**\n${items.map((item: any) => `- ${item.motivo}: ${item.puntos_descontados}`).join('\n')}`
}

function whyBlockMarkdown(block: any) {
  return whyExplanationToMarkdown(block?.porqueEsAsi ?? block?.whyExplanation) || block?.teoria_ejercicio || ''
}

function listOrText(items: any, fallback = '') {
  if (Array.isArray(items) && items.filter(Boolean).length) {
    return items.filter(Boolean).map((item: any) => `- ${String(item)}`).join('\n')
  }
  return fallback || 'Sin observaciones adicionales.'
}

function formatNumber(value: any) {
  return typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : '0'
}

function normalizeScore(value: any) {
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function clampScore(value: number, max: number) {
  return Math.min(max, Math.max(0, value))
}
