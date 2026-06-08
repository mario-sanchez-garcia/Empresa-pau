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

Este simulacro ha sido generado combinando preguntas oficiales reales de distintos años y convocatorias de la EvAU Madrid. Cada pregunta tiene su propio año, convocatoria y criterio de corrección oficial. Tu evaluación debe tratar cada pregunta de forma completamente independiente aplicando el criterio del año exacto del que proviene.

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

Historia de España:
- Error cronológico grave (más de 10 años en fecha clave): -0.5 pts por error, máximo -1 pt total.
- Comentario de texto sin identificar naturaleza, contexto, ideas principales y conclusión: descuento proporcional según elementos ausentes.
- Desarrollo sin estructura (introducción, argumentación con causas/consecuencias, conclusión): máximo 60% de la puntuación del bloque.
- Mera enumeración de datos sin argumentación histórica: máximo 1.0 pt independientemente de la extensión.
- Uso correcto de vocabulario histórico específico: valoración positiva de hasta +0.25 pts.

### INSTRUCCIONES DE EVALUACIÓN

1. Corrige cada bloque de forma independiente.
2. Para cada bloque identifica qué ha hecho bien, qué ha fallado, qué penalizaciones aplicas y por qué.
3. Cada punto descontado debe tener un motivo claro y concreto en penalizaciones_aplicadas.
4. Calcula nota_final sobre 10.00 y nota_sobre_14 con dos decimales. Nunca puede superar 10.00 ni 14.00.
5. Si el tiempo supera 90 minutos, rellena advertencia_tiempo. Si el tiempo es 0, advertencia_tiempo debe indicar que esta práctica no ha sido cronometrada.
6. Feedback directo, accionable y sin suavizar errores.
7. El plan de repaso debe salir solo de los errores detectados.
8. Incluye solucion_correcta_corta por bloque.
9. Resume cada bloque temático con nivel: Domina / En progreso / Necesita refuerzo urgente.
10. Contextualiza la nota según la dificultad.

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
      "puntos_conseguidos": 0.00,
      "puntos_maximos": 0.00,
      "porcentaje_logrado": 0,
      "penalizaciones_aplicadas": [
        { "motivo": "", "puntos_descontados": -0.25 }
      ],
      "correccion_detalle": "",
      "solucion_correcta_corta": "",
      "consejo_especifico": ""
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
    return JSON.parse(text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, ''))
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
