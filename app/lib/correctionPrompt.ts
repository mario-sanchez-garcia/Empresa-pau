export interface CorrectionPromptBlock {
  numeroBloque: string
  tema: string
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
  simulacroId: string
  option: string
  elapsedMinutes: number
  difficulty: 'Fácil' | 'Media' | 'Difícil'
  blocks: CorrectionPromptBlock[]
}

export function buildCorrectionPrompt(input: CorrectionPromptInput) {
  const bloques = input.blocks.map(block => ({
    numero_bloque: block.numeroBloque,
    tema: block.tema,
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

  return `Eres el corrector oficial certificado de las pruebas de acceso a la universidad EvAU de la Comunidad de Madrid para la asignatura de ${input.subject}. Has corregido miles de exámenes reales y conoces con precisión milimétrica los criterios oficiales de corrección publicados por las universidades coordinadoras de Madrid.

Este simulacro ha sido generado con preguntas oficiales reales de la EvAU Madrid. En Matemáticas, Física, Química, Biología e Historia puede combinar preguntas de distintos años y convocatorias; en Lengua Castellana y Literatura II los bloques deben tratarse como partes de un mismo examen cuando compartan texto fuente. Cada pregunta tiene su propio año, convocatoria y criterio de corrección oficial. Tu evaluación debe tratar cada pregunta de forma independiente aplicando el criterio del año exacto del que proviene, y en Lengua debes conservar la coherencia del texto común.

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

1. Corrige cada bloque de forma independiente.
2. Si la respuesta está en blanco, dilo claramente y puntúa solo lo justificable. No inventes trabajo del alumno.
3. Si la respuesta es absurda, irrelevante o no responde al enunciado, dilo con respeto y explica por qué no puntúa.
4. Para cada bloque identifica qué ha hecho bien, qué está mal, qué falta, dónde falla exactamente y cómo debería mejorar.
5. Cada punto descontado debe tener un motivo claro y concreto en penalizaciones_aplicadas.
6. No des 0 automáticamente salvo que esté justificado por respuesta en blanco, ausencia total de planteamiento válido o respuesta no relacionada.
7. Calcula nota_final sobre 10.00 y nota_sobre_14 con dos decimales. Nunca puede superar 10.00 ni 14.00.
8. Si el tiempo supera 90 minutos, rellena advertencia_tiempo. Si el tiempo es 0, advertencia_tiempo debe indicar que esta práctica no ha sido cronometrada.
9. Feedback directo, accionable y específico a la respuesta real del alumno. Evita frases genéricas.
10. El plan de repaso debe salir solo de los errores detectados.
11. Incluye solucion_orientativa por bloque con el planteamiento o respuesta esperada.
12. Resume cada bloque temático con nivel: Domina / En progreso / Necesita refuerzo urgente.
13. Contextualiza la nota según la dificultad.

### FORMATO DE SALIDA

Responde ÚNICAMENTE con un objeto JSON válido. Cero texto fuera del JSON. Cero markdown. Cero introducciones. Solo JSON puro con esta forma:

{
  "simulacro_id": "${input.simulacroId}",
  "asignatura": "${input.subject}",
  "nota_final": 0.00,
  "nota_sobre_14": 0.00,
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
      "consejo_para_mejorar": ""
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
    return JSON.parse(jsonText)
  } catch {
    return null
  }
}

export function correctionJsonToMarkdown(data: any) {
  const bloques = Array.isArray(data?.desglose_bloques) ? data.desglose_bloques : []
  const plan = Array.isArray(data?.plan_repaso) ? data.plan_repaso : []
  const resumen = Array.isArray(data?.resumen_por_bloque_tematico) ? data.resumen_por_bloque_tematico : []

  return [
    `## Nota: ${formatNumber(data?.nota_final)}/10 (${formatNumber(data?.nota_sobre_14)}/14)`,
    data?.advertencia_tiempo ? `> ${data.advertencia_tiempo}` : '',
    `### Feedback general\n${data?.feedback_general ?? ''}`,
    `### Puntos fuertes\n${data?.puntos_fuertes ?? ''}`,
    `### Puntos de mejora\n${data?.puntos_mejora ?? ''}`,
    ...bloques.map((block: any) => [
      `### ${block.numero_bloque ?? 'Bloque'} · ${block.tema ?? ''}`,
      `**Puntuación:** ${formatNumber(block.puntos_conseguidos)}/${formatNumber(block.puntos_maximos)} (${block.porcentaje_logrado ?? 0}%)`,
      `**Corrección:** ${block.correccion_detalle ?? ''}`,
      penaltiesToMarkdown(block.penalizaciones_aplicadas),
      `**Solución correcta corta:** ${block.solucion_correcta_corta ?? ''}`,
      `**Consejo específico:** ${block.consejo_especifico ?? ''}`
    ].filter(Boolean).join('\n\n')),
    plan.length ? `### Plan de repaso\n${plan.map((item: any) => `${item.prioridad}. **${item.tema}**: ${item.accion} (${item.tiempo_recomendado}). ${item.recurso_sugerido}`).join('\n')}` : '',
    resumen.length ? `### Resumen por bloque\n${resumen.map((item: any) => `- **${item.bloque}**: ${formatNumber(item.puntos_conseguidos)}/${formatNumber(item.puntos_maximos)} · ${item.nivel}`).join('\n')}` : ''
  ].filter(Boolean).join('\n\n')
}

function penaltiesToMarkdown(items: any) {
  if (!Array.isArray(items) || !items.length) return ''
  return `**Penalizaciones aplicadas:**\n${items.map((item: any) => `- ${item.motivo}: ${item.puntos_descontados}`).join('\n')}`
}

function formatNumber(value: any) {
  return typeof value === 'number' ? value.toFixed(2).replace(/\.00$/, '') : '0'
}
