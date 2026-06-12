export type CaminoRouteId = 'completa' | 'ajustada' | 'acelerada' | 'sprint' | 'intensiva'

export interface CaminoRoute {
  id: CaminoRouteId
  nombre: string
  meses: string
  duracionAproximada: string
  intensidadDiaria: string
  logica: string
  prioridad: string
  mensajeAlumno: string
  queNoHacer: string
}

export interface CaminoWeek {
  semana: number
  fase: string
  fechasAproximadas: string
  objetivo: string
  matematicas: string
  historia: string
  ingles: string
  mision: string
  duracion: string
  nota: string
}

export type CaminoTaskTypeId =
  | 'flashcard'
  | 'ejercicio_corto'
  | 'correccion_ia'
  | 'repaso_error'
  | 'mini_simulacro'
  | 'simulacro_completo'
  | 'estrategia_examen'
  | 'simulacro_completo_escalonado'
  | 'repaso_ligero'
  | 'reading'
  | 'writing'
  | 'test'

export interface CaminoTaskType {
  id: CaminoTaskTypeId
  label: string
  baseXp: number
  description: string
  variant: 'blue' | 'sky' | 'violet' | 'emerald' | 'amber' | 'slate'
}

export type CaminoActionType = 'flashcards' | 'practice' | 'correction' | 'review_error' | 'simulacro'

export interface DailyCaminoTask {
  id: string
  title: string
  type: CaminoTaskTypeId
  xp: number
  subject: string
  block?: string
  detail: string
  actionLabel: string
  actionHref: string
  actionType: CaminoActionType
}

export interface ProgressNode {
  id: string
  label: string
  description: string
  status: 'completed' | 'current' | 'next' | 'locked'
}

export const caminoRoutes: CaminoRoute[] = [
  {
    id: 'completa',
    nombre: 'Ruta completa',
    meses: 'Septiembre → Junio',
    duracionAproximada: '38 semanas',
    intensidadDiaria: '20-30 min/dia',
    logica: 'Base + habito + mezcla + simulacros',
    prioridad: 'Aprender bien',
    mensajeAlumno: 'Empiezas desde el principio con una ruta completa hasta la PAU.',
    queNoHacer: 'No meter presion desde el dia 1'
  },
  {
    id: 'ajustada',
    nombre: 'Ruta ajustada',
    meses: 'Octubre-Noviembre',
    duracionAproximada: '28-34 semanas',
    intensidadDiaria: '25-30 min/dia',
    logica: 'Saltar bienvenida y comprimir base',
    prioridad: 'Recuperar ritmo',
    mensajeAlumno: 'Te hemos creado una ruta ajustada para ponerte al dia sin agobio.',
    queNoHacer: 'No mostrar "vas tarde"'
  },
  {
    id: 'acelerada',
    nombre: 'Ruta acelerada',
    meses: 'Diciembre-Enero',
    duracionAproximada: '20-26 semanas',
    intensidadDiaria: '30-40 min/dia',
    logica: 'Diagnostico + bloques clave + mini simulacros antes',
    prioridad: 'Ponerse al dia',
    mensajeAlumno: 'Te hemos creado una ruta acelerada hasta la PAU.',
    queNoHacer: 'No obligar a completar septiembre'
  },
  {
    id: 'sprint',
    nombre: 'Ruta sprint',
    meses: 'Febrero-Marzo',
    duracionAproximada: '10-16 semanas',
    intensidadDiaria: '35-45 min/dia',
    logica: 'Bloques de alto impacto + simulacros parciales + errores',
    prioridad: 'Subir nota rapido',
    mensajeAlumno: 'Vamos a priorizar lo que mas impacto tiene en tu nota.',
    queNoHacer: 'No empezar desde teoria basica'
  },
  {
    id: 'intensiva',
    nombre: 'Ruta intensiva',
    meses: 'Abril-Mayo',
    duracionAproximada: '4-8 semanas',
    intensidadDiaria: '45-60 min/dia',
    logica: 'Simulacros completos + repaso errores + estrategia',
    prioridad: 'Examen real',
    mensajeAlumno: 'Entramos en modo intensivo final.',
    queNoHacer: 'No introducir contenido nuevo innecesario'
  }
]

export const caminoWeeks: CaminoWeek[] = [
  { semana: 1, fase: 'Fase 1', fechasAproximadas: '1-7 sep', objetivo: 'Bienvenida, diagnostico y configuracion del perfil', matematicas: 'Álgebra base + diagnostico', historia: 'Antiguo Regimen', ingles: 'Vocabulario PAU + diagnostico', mision: 'flashcard + test', duracion: '15-20 min', nota: 'Semana corta para activar habito sin abrumar' },
  { semana: 2, fase: 'Fase 1', fechasAproximadas: '8-14 sep', objetivo: 'Primeras tareas reales', matematicas: 'Sistemas de ecuaciones', historia: 'Antiguo Regimen: economia y sociedad', ingles: 'Reading comprension general', mision: 'flashcard + ejercicio_corto', duracion: '20 min', nota: 'Primer contacto con tareas de bloque' },
  { semana: 3, fase: 'Fase 1', fechasAproximadas: '15-21 sep', objetivo: 'Consolidar habito diario', matematicas: 'Matrices y determinantes', historia: 'Reformismo borbonico e Ilustracion', ingles: 'Reading preguntas tipo PAU', mision: 'ejercicio_corto + flashcard', duracion: '20 min', nota: 'Verificar ejercicios reales disponibles' },
  { semana: 4, fase: 'Fase 1', fechasAproximadas: '22-28 sep', objetivo: 'Primer repaso guiado', matematicas: 'Repaso álgebra', historia: 'Crisis Antiguo Regimen: contexto', ingles: 'Use of English: lexico', mision: 'repaso_error + ejercicio_corto', duracion: '20 min', nota: 'Repaso sin meter presion' },
  { semana: 5, fase: 'Fase 1', fechasAproximadas: '29 sep - 5 oct', objetivo: 'Primer bloque análisis', matematicas: 'Limites y continuidad', historia: 'Guerra de Independencia', ingles: 'Word formation', mision: 'ejercicio_corto + flashcard', duracion: '20-25 min', nota: 'Validar diferencias Madrid/Cataluna' },
  { semana: 6, fase: 'Fase 1', fechasAproximadas: '6-12 oct', objetivo: 'Derivadas', matematicas: 'Derivadas y reglas', historia: 'Constitucion 1812 y liberalismo', ingles: 'Collocations y conectores', mision: 'ejercicio_corto + correccion_ia', duracion: '20-25 min', nota: 'Primera correccion IA corta' },
  { semana: 7, fase: 'Fase 1', fechasAproximadas: '13-19 oct', objetivo: 'Análisis aplicado', matematicas: 'Maximos y minimos', historia: 'Fernando VII: absolutismo', ingles: 'Tiempos verbales', mision: 'ejercicio_corto + flashcard', duracion: '20-25 min', nota: 'Consolidar bloque antes del repaso' },
  { semana: 8, fase: 'Fase 1', fechasAproximadas: '20-26 oct', objetivo: 'Repaso y writing', matematicas: 'Repaso mixto álgebra + análisis', historia: 'Estado liberal: introduccion', ingles: 'Mini writing PAU 100-120 palabras', mision: 'repaso_error + writing + flashcard', duracion: '25 min', nota: 'Revisar si el alumno entiende su progreso' },
  { semana: 17, fase: 'Fase 2', fechasAproximadas: '12-18 ene', objetivo: 'Vuelta al habito tras Navidad', matematicas: 'Integrales indefinidas', historia: 'Guerra Civil: causas y sublevacion', ingles: 'Reported speech', mision: 'ejercicio_corto + flashcard', duracion: '20 min', nota: 'Mision reducida si lleva mas de 2 dias sin entrar' },
  { semana: 18, fase: 'Fase 2', fechasAproximadas: '19-25 ene', objetivo: 'Integrales y primera correccion del trimestre', matematicas: 'Integrales definidas', historia: 'Guerra Civil: desarrollo y bandos', ingles: 'Argumentativo con correccion IA', mision: 'ejercicio_corto + correccion_ia', duracion: '25 min', nota: 'Primer feedback serio del trimestre' },
  { semana: 19, fase: 'Fase 2', fechasAproximadas: '26 ene - 1 feb', objetivo: 'Integrales aplicadas', matematicas: 'Areas entre curvas', historia: 'Guerra Civil: consecuencias', ingles: 'Reading actualidad PAU', mision: 'ejercicio_corto + reading', duracion: '25 min', nota: 'Verificar ejercicios PAU de areas' },
  { semana: 20, fase: 'Fase 2', fechasAproximadas: '2-8 feb', objetivo: 'Primer mini simulacro de análisis', matematicas: 'Mini simulacro: limites, derivadas, integrales', historia: 'Franquismo: etapas y bases', ingles: 'Phrasal verbs PAU', mision: 'mini_simulacro', duracion: '30 min', nota: 'Centrar el mini simulacro en análisis' },
  { semana: 24, fase: 'Fase 2', fechasAproximadas: '2-8 mar', objetivo: 'Transicion y repaso de estadistica', matematicas: 'Estadistica repaso PAU', historia: 'Transicion y Constitucion 1978', ingles: 'Articulo de opinion', mision: 'ejercicio_corto + reading', duracion: '25 min', nota: 'Validar diferencias Madrid/Cataluna' },
  { semana: 25, fase: 'Fase 2', fechasAproximadas: '9-15 mar', objetivo: 'Espana democratica y repaso de puntos debiles', matematicas: 'Probabilidad repaso', historia: 'Espana democratica y Europa', ingles: 'Conditionals y modal verbs', mision: 'repaso_error + ejercicio_corto', duracion: '25 min', nota: 'Validar temario por CCAA' },
  { semana: 26, fase: 'Fase 2', fechasAproximadas: '16-22 mar', objetivo: 'Prediccion de nota con datos reales', matematicas: 'Simulacro parcial análisis', historia: 'Mini simulacro mixto historia', ingles: 'Simulacro parcial ingles', mision: 'mini_simulacro + correccion_ia', duracion: '35 min', nota: 'Prediccion solo si hay datos suficientes' },
  { semana: 29, fase: 'Fase 3', fechasAproximadas: '6-12 abr', objetivo: 'Estrategia de examen', matematicas: 'Estrategia: orden y eleccion', historia: 'Estrategia: comentario y tema', ingles: 'Estrategia: tiempo y orden', mision: 'estrategia_examen + ejercicio_corto', duracion: '25 min', nota: 'Crear guias por asignatura antes' },
  { semana: 30, fase: 'Fase 3', fechasAproximadas: '13-19 abr', objetivo: 'Formato PAU con rubricas', matematicas: 'Simulacro parcial PAU', historia: 'Comentario/fuente con rubrica PAU', ingles: 'Writing completo con IA', mision: 'correccion_ia + mini_simulacro', duracion: '40 min', nota: 'No llamar examen real a tarea parcial' },
  { semana: 34, fase: 'Fase 4', fechasAproximadas: '11-17 may', objetivo: 'Primera semana de simulacros completos escalonados', matematicas: 'Simulacro completo Matemáticas II', historia: 'Simulacro completo Historia', ingles: 'Simulacro completo Ingles', mision: 'simulacro_completo_escalonado', duracion: '60-90 min / 25-30 min', nota: 'No hacer los tres simulacros el mismo dia' },
  { semana: 35, fase: 'Fase 4', fechasAproximadas: '18-24 may', objetivo: 'Repaso de errores del primer simulacro', matematicas: 'Repaso errores por bloque', historia: 'Repaso comentario y temas', ingles: 'Repaso writing, reading y Use of English', mision: 'repaso_error', duracion: '30 min', nota: 'Usar errores reales del simulacro' },
  { semana: 36, fase: 'Fase 4', fechasAproximadas: '25-31 may', objetivo: 'Segunda semana de simulacros completos escalonados', matematicas: 'Segundo simulacro Matemáticas II', historia: 'Segundo simulacro Historia', ingles: 'Segundo simulacro Ingles', mision: 'simulacro_completo_escalonado', duracion: '60-90 min / 25-30 min', nota: 'Comparar evolucion sin generar ansiedad' },
  { semana: 37, fase: 'Fase 4', fechasAproximadas: '1-7 jun', objetivo: 'Repaso intenso final sin contenido nuevo', matematicas: 'Errores recurrentes del año', historia: 'Errores recurrentes y estructuras', ingles: 'Errores writing, reading y grammar', mision: 'repaso_error + flashcard', duracion: '25-30 min', nota: 'Comunicacion calmada; sin contenido nuevo' },
  { semana: 38, fase: 'Fase 4', fechasAproximadas: '8-14 jun', objetivo: 'Semana PAU - repaso ligero y confianza', matematicas: 'Formulas y conceptos clave', historia: 'Fechas y estructura de respuesta', ingles: 'Vocabulary y grammar muy ligero', mision: 'flashcard + repaso_ligero', duracion: '10-15 min', nota: 'Ajustar fechas segun convocatoria oficial' }
]

export const caminoTaskTypes: Record<CaminoTaskTypeId, CaminoTaskType> = {
  flashcard: { id: 'flashcard', label: 'Flashcards', baseXp: 5, description: 'Repaso rapido de conceptos clave.', variant: 'blue' },
  ejercicio_corto: { id: 'ejercicio_corto', label: 'Ejercicio corto', baseXp: 15, description: 'Practica concreta de un bloque PAU.', variant: 'sky' },
  correccion_ia: { id: 'correccion_ia', label: 'Correccion IA', baseXp: 30, description: 'Respuesta enviada para feedback guiado.', variant: 'violet' },
  repaso_error: { id: 'repaso_error', label: 'Repaso de error', baseXp: 20, description: 'Volver sobre un fallo reciente.', variant: 'amber' },
  mini_simulacro: { id: 'mini_simulacro', label: 'Mini simulacro', baseXp: 50, description: '1-2 preguntas en formato examen.', variant: 'emerald' },
  simulacro_completo: { id: 'simulacro_completo', label: 'Simulacro completo', baseXp: 100, description: 'Examen completo en condiciones reales.', variant: 'emerald' },
  estrategia_examen: { id: 'estrategia_examen', label: 'Estrategia', baseXp: 15, description: 'Decidir orden, tiempo y enfoque.', variant: 'slate' },
  simulacro_completo_escalonado: { id: 'simulacro_completo_escalonado', label: 'Simulacro escalonado', baseXp: 100, description: 'Simulacros repartidos durante la semana.', variant: 'emerald' },
  repaso_ligero: { id: 'repaso_ligero', label: 'Repaso ligero', baseXp: 10, description: 'Mantener confianza sin meter contenido nuevo.', variant: 'blue' },
  reading: { id: 'reading', label: 'Reading', baseXp: 15, description: 'Comprension lectora tipo PAU.', variant: 'sky' },
  writing: { id: 'writing', label: 'Writing', baseXp: 25, description: 'Texto breve con estructura PAU.', variant: 'violet' },
  test: { id: 'test', label: 'Test', baseXp: 10, description: 'Preguntas rapidas de repaso.', variant: 'slate' }
}

export const todayMission = {
  day: 47,
  objective: 'Reforzar integrales y repasar errores recientes',
  estimatedTime: '25 min',
  week: 17
}

export const dailyTasks: DailyCaminoTask[] = [
  {
    id: 'flashcards-integrales',
    title: '5 flashcards de integrales',
    type: 'flashcard',
    xp: 25,
    subject: 'Matemáticas II',
    block: 'Análisis',
    detail: 'Calienta con formulas, primitivas inmediatas y errores frecuentes.',
    actionLabel: 'Repasar flashcards',
    actionHref: '/zona',
    actionType: 'flashcards'
  },
  {
    id: 'ejercicios-análisis',
    title: '2 ejercicios cortos de análisis',
    type: 'ejercicio_corto',
    xp: 30,
    subject: 'Matemáticas II',
    block: 'Análisis',
    detail: 'Practica limites, derivadas e integrales sin formato de examen completo.',
    actionLabel: 'Practicar ahora',
    actionHref: '/?subject=mates',
    actionType: 'practice'
  },
  {
    id: 'correccion-corta',
    title: '1 corrección IA corta',
    type: 'correccion_ia',
    xp: 30,
    subject: 'Matemáticas II',
    block: 'Análisis',
    detail: 'Deja preparada una respuesta para feedback cuando conectemos IA real.',
    actionLabel: 'Hacer corrección',
    actionHref: '/?subject=mates',
    actionType: 'correction'
  },
  {
    id: 'repaso-areas',
    title: 'Repasar error reciente: cálculo de áreas',
    type: 'repaso_error',
    xp: 20,
    subject: 'Matemáticas II',
    block: 'Análisis',
    detail: 'Vuelve al fallo típico: límites de integración y signo del área.',
    actionLabel: 'Ver historial',
    actionHref: '/?view=historial',
    actionType: 'review_error'
  }
]

export const progressNodes: ProgressNode[] = [
  { id: 'algebra', label: 'Álgebra', description: 'Base completada', status: 'completed' },
  { id: 'análisis', label: 'Análisis', description: 'Bloque actual', status: 'current' },
  { id: 'geometria', label: 'Geometría', description: 'Siguiente fase', status: 'next' },
  { id: 'simulacros', label: 'Simulacros', description: 'Bloqueado hasta consolidar', status: 'locked' }
]

export const nextObjectives = [
  { week: 17, label: 'Integrales indefinidas', detail: 'Volver al habito tras Navidad' },
  { week: 18, label: 'Integrales definidas', detail: 'Primera correccion del trimestre' },
  { week: 19, label: 'Areas entre curvas', detail: 'Integrales aplicadas' },
  { week: 20, label: 'Mini simulacro de análisis', detail: 'Limites, derivadas e integrales' }
]

export function getRouteById(routeId: CaminoRouteId) {
  return caminoRoutes.find(route => route.id === routeId) ?? caminoRoutes[0]
}
