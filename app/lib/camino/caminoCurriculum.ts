import type { CaminoTaskTypeId } from './caminoData'

export interface CaminoWeekData {
  semana: number
  fase: 1 | 2 | 3 | 4
  objetivo: string
  mates: string
  historia: string
  ingles: string
  misionTypes: CaminoTaskTypeId[]
  duracion: string
}

// XP canónico por tipo de tarea — compartido entre cliente y servidor.
// Mantener sincronizado con TASK_TYPE_XP_MAP en caminoProgressServer.ts.
export const MISSION_TASK_XP: Record<CaminoTaskTypeId, number> = {
  flashcard: 15,
  ejercicio_corto: 20,
  correccion_ia: 30,
  repaso_error: 15,
  mini_simulacro: 40,
  simulacro_completo: 75,
  simulacro_completo_escalonado: 75,
  estrategia_examen: 10,
  repaso_ligero: 10,
  reading: 15,
  writing: 20,
  test: 10,
}

// Offset de semana por ruta de entrada: cuántas semanas del currículum se saltan al empezar.
export const ROUTE_WEEK_OFFSET: Record<string, number> = {
  completa: 0,
  ajustada: 4,
  acelerada: 8,
  sprint: 16,
  intensiva: 30,
}

// Las 38 semanas del currículum PAU.
// Fuente: docs/camino-pau/calendario-38-semanas-revisado.tsv
export const CAMINO_CURRICULUM: CaminoWeekData[] = [
  { semana: 1,  fase: 1, objetivo: 'Bienvenida y diagnóstico inicial',            mates: 'Diagnóstico + álgebra base PAU',                                  historia: 'Antiguo Régimen y sociedad estamental',                            ingles: 'Vocabulario básico PAU + diagnóstico reading',                misionTypes: ['flashcard','test'],                                    duracion: '15-20 min' },
  { semana: 2,  fase: 1, objetivo: 'Primeras tareas reales',                       mates: 'Álgebra: sistemas de ecuaciones lineales',                          historia: 'Antiguo Régimen: economía, sociedad y monarquía absoluta',         ingles: 'Reading: comprensión general de texto PAU',                   misionTypes: ['flashcard','ejercicio_corto'],                         duracion: '20 min' },
  { semana: 3,  fase: 1, objetivo: 'Consolidar hábito diario',                     mates: 'Álgebra: matrices y determinantes',                                 historia: 'Reformismo borbónico e Ilustración en España',                     ingles: 'Reading: preguntas de comprensión tipo PAU',                  misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20 min' },
  { semana: 4,  fase: 1, objetivo: 'Primer repaso guiado',                         mates: 'Álgebra: repaso de sistemas, matrices y determinantes',              historia: 'Crisis del Antiguo Régimen: contexto europeo y español',           ingles: 'Use of English: léxico en contexto',                          misionTypes: ['repaso_error','ejercicio_corto'],                      duracion: '20 min' },
  { semana: 5,  fase: 1, objetivo: 'Primer bloque de análisis',                    mates: 'Análisis: límites y continuidad de funciones',                      historia: 'Crisis del Antiguo Régimen: Guerra de Independencia',              ingles: 'Use of English: word formation',                              misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20-25 min' },
  { semana: 6,  fase: 1, objetivo: 'Profundizar en análisis',                      mates: 'Análisis: derivadas y reglas de derivación',                        historia: 'Constitución de 1812 y liberalismo',                              ingles: 'Vocabulary: collocations y conectores frecuentes',            misionTypes: ['ejercicio_corto','correccion_ia'],                     duracion: '20-25 min' },
  { semana: 7,  fase: 1, objetivo: 'Análisis aplicado',                            mates: 'Análisis: aplicaciones de la derivada, máximos y mínimos',          historia: 'Reinado de Fernando VII: absolutismo y liberalismo',               ingles: 'Grammar: tiempos verbales + errores frecuentes',              misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20-25 min' },
  { semana: 8,  fase: 1, objetivo: 'Repaso álgebra y análisis',                    mates: 'Repaso mixto álgebra + análisis inicial',                           historia: 'Construcción del Estado liberal: introducción',                    ingles: 'Writing: mini redacción PAU 100-120 palabras',                misionTypes: ['repaso_error','writing','flashcard'],                  duracion: '25 min' },
  { semana: 9,  fase: 1, objetivo: 'Geometría inicial',                            mates: 'Geometría: vectores, operaciones y representación',                 historia: 'Estado liberal: reinado de Isabel II y partidos políticos',        ingles: 'Writing: estructura básica del párrafo PAU',                  misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20-25 min' },
  { semana: 10, fase: 1, objetivo: 'Geometría analítica',                          mates: 'Geometría: ecuaciones de recta y plano',                            historia: 'Sexenio Democrático: revolución de 1868 y Primera República',      ingles: 'Writing: conectores y coherencia textual',                    misionTypes: ['ejercicio_corto'],                                     duracion: '25 min' },
  { semana: 11, fase: 1, objetivo: 'Geometría aplicada con IA',                    mates: 'Geometría: distancias, ángulos y posiciones relativas',             historia: 'Restauración: sistema de Cánovas y Constitución de 1876',         ingles: 'Writing: práctica guiada con corrección IA',                  misionTypes: ['correccion_ia'],                                       duracion: '25 min' },
  { semana: 12, fase: 1, objetivo: 'Estadística básica',                           mates: 'Estadística: variables, distribuciones y parámetros básicos',       historia: 'Restauración: crisis del 98 y regeneracionismo',                   ingles: 'Use of English: transformación de frases',                    misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20-25 min' },
  { semana: 13, fase: 1, objetivo: 'Probabilidad básica',                          mates: 'Probabilidad: combinatoria y probabilidad condicionada básica',     historia: 'Crisis de la Restauración: Alfonso XIII y Semana Trágica',         ingles: 'Vocabulary: temas sociales frecuentes en PAU',                misionTypes: ['flashcard','ejercicio_corto'],                         duracion: '20-25 min' },
  { semana: 14, fase: 1, objetivo: 'Repaso estadística y probabilidad',            mates: 'Estadística y probabilidad: repaso y errores frecuentes',           historia: 'Segunda República: proclamación, reformas y bienios',              ingles: 'Reading: texto de prensa o periodístico',                     misionTypes: ['repaso_error','ejercicio_corto'],                      duracion: '20-25 min' },
  { semana: 15, fase: 1, objetivo: 'Primer mini simulacro',                        mates: 'Mini simulacro diagnóstico: álgebra + análisis inicial',            historia: 'Historia: mini simulacro siglo XIX + Restauración',               ingles: 'Mini test: reading + use of english',                         misionTypes: ['mini_simulacro'],                                      duracion: '30 min' },
  { semana: 16, fase: 1, objetivo: 'Cierre fase 1 y plan de vacaciones',           mates: 'Repaso general fase 1: álgebra, análisis, geometría y probabilidad', historia: 'Repaso general fase 1: siglos XVIII-XIX y Restauración',           ingles: 'Repaso general: reading, use of english y writing básico',    misionTypes: ['repaso_error','flashcard','test'],                     duracion: '20 min' },
  { semana: 17, fase: 2, objetivo: 'Vuelta al hábito tras Navidad',                mates: 'Análisis: integrales indefinidas',                                  historia: 'Guerra Civil: causas, sublevación y contexto político',            ingles: 'Grammar: reported speech y estilo indirecto',                 misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '20 min' },
  { semana: 18, fase: 2, objetivo: 'Integrales y primera corrección del trimestre', mates: 'Análisis: integrales definidas y propiedades',                     historia: 'Guerra Civil: desarrollo y evolución de los bandos',               ingles: 'Writing: texto argumentativo con corrección IA',              misionTypes: ['ejercicio_corto','correccion_ia'],                     duracion: '25 min' },
  { semana: 19, fase: 2, objetivo: 'Integrales aplicadas',                         mates: 'Análisis: cálculo de áreas entre curvas',                           historia: 'Guerra Civil: consecuencias políticas y sociales',                 ingles: 'Reading: texto de actualidad tipo PAU',                       misionTypes: ['ejercicio_corto','reading'],                           duracion: '25 min' },
  { semana: 20, fase: 2, objetivo: 'Primer mini simulacro de análisis',            mates: 'Mini simulacro: límites, derivadas e integrales',                   historia: 'Franquismo: etapas, bases ideológicas y evolución',                ingles: 'Use of English: phrasal verbs frecuentes en PAU',             misionTypes: ['mini_simulacro'],                                      duracion: '30 min' },
  { semana: 21, fase: 2, objetivo: 'Detección de puntos débiles',                  mates: 'Repaso del bloque con más errores acumulados',                      historia: 'Franquismo: economía, sociedad y desarrollismo',                   ingles: 'Writing libre con corrección IA',                             misionTypes: ['correccion_ia','repaso_error'],                        duracion: '25 min' },
  { semana: 22, fase: 2, objetivo: 'Geometría y franquismo tardío',                mates: 'Geometría: repaso y ejercicios tipo PAU',                           historia: 'Franquismo tardío: oposición política y muerte de Franco',         ingles: 'Vocabulary: temas económicos, políticos y sociales',          misionTypes: ['ejercicio_corto','flashcard'],                         duracion: '25 min' },
  { semana: 23, fase: 2, objetivo: 'Simulacro mixto por asignatura',               mates: 'Mini simulacro mixto: álgebra + análisis',                          historia: 'Mini simulacro: Guerra Civil + Franquismo',                        ingles: 'Mini test: reading + use of english + writing corto',         misionTypes: ['mini_simulacro'],                                      duracion: '35 min' },
  { semana: 24, fase: 2, objetivo: 'Transición y repaso de estadística',           mates: 'Estadística: repaso y ejercicios tipo PAU',                         historia: 'Transición: muerte de Franco, reforma política y Constitución',    ingles: 'Reading: artículo de opinión en inglés',                      misionTypes: ['ejercicio_corto','reading'],                           duracion: '25 min' },
  { semana: 25, fase: 2, objetivo: 'España democrática y repaso de puntos débiles', mates: 'Probabilidad: repaso y errores acumulados',                        historia: 'España democrática: gobiernos constitucionales e integración UE',  ingles: 'Grammar: conditionals y modal verbs',                         misionTypes: ['repaso_error','ejercicio_corto'],                      duracion: '25 min' },
  { semana: 26, fase: 2, objetivo: 'Predicción de nota con datos reales',          mates: 'Simulacro parcial: análisis con 2-3 ejercicios',                    historia: 'Historia: mini simulacro mixto con 2 temas',                       ingles: 'Writing + reading: simulacro parcial inglés',                 misionTypes: ['mini_simulacro','correccion_ia'],                      duracion: '35 min' },
  { semana: 27, fase: 2, objetivo: 'Repaso de cierre de fase 2',                   mates: 'Repaso general con enfoque en errores recurrentes',                 historia: 'Repaso general de Historia con flashcards',                        ingles: 'Repaso vocabulario y gramática',                              misionTypes: ['repaso_error','flashcard'],                            duracion: '20 min' },
  { semana: 28, fase: 2, objetivo: 'Cierre fase 2 con simulacros parciales',       mates: 'Simulacro parcial: álgebra + estadística',                          historia: 'Simulacro parcial: 3 temas históricos',                           ingles: 'Mini simulacro inglés completo',                              misionTypes: ['mini_simulacro'],                                      duracion: '35 min' },
  { semana: 29, fase: 3, objetivo: 'Estrategia de examen',                         mates: 'Estrategia: qué ejercicios elegir y en qué orden',                  historia: 'Estrategia: cómo estructurar comentario, tema y fuente histórica', ingles: 'Estrategia: gestión del tiempo en el examen PAU',             misionTypes: ['estrategia_examen','ejercicio_corto'],                 duracion: '25 min' },
  { semana: 30, fase: 3, objetivo: 'Formato PAU con rúbricas',                     mates: 'Simulacro parcial en formato PAU real',                             historia: 'Comentario o fuente histórica con rúbrica PAU',                   ingles: 'Writing completo con corrección IA',                          misionTypes: ['correccion_ia','mini_simulacro'],                      duracion: '40 min' },
  { semana: 31, fase: 3, objetivo: 'Atacar los bloques más débiles',               mates: 'Identificar y atacar el bloque con más errores del año',            historia: 'Historia: repaso de los temas con peor resultado',                 ingles: 'Inglés: tipo de tarea con mayor tasa de error',               misionTypes: ['repaso_error','ejercicio_corto'],                      duracion: '30 min' },
  { semana: 32, fase: 3, objetivo: 'Simulacro parcial intenso',                    mates: 'Simulacro: 2 preguntas en formato PAU real',                        historia: 'Historia: simulacro tema + fuente histórica',                      ingles: 'Reading + writing: examen parcial inglés',                    misionTypes: ['mini_simulacro','correccion_ia'],                      duracion: '40 min' },
  { semana: 33, fase: 3, objetivo: 'Repaso final de fase 3',                       mates: 'Repaso general y consolidación de errores',                         historia: 'Repaso cronológico rápido de toda la historia',                   ingles: 'Vocabulary y grammar: repaso sistemático rápido',             misionTypes: ['repaso_error','flashcard'],                            duracion: '25 min' },
  { semana: 34, fase: 4, objetivo: 'Simulacros completos escalonados — semana 1',  mates: 'Simulacro completo Matemáticas II en formato PAU',                  historia: 'Simulacro completo Historia de España en formato PAU',             ingles: 'Simulacro completo Inglés en formato PAU',                    misionTypes: ['simulacro_completo_escalonado'],                       duracion: '60-90 min' },
  { semana: 35, fase: 4, objetivo: 'Repaso de errores del primer simulacro',       mates: 'Repaso de errores por bloque del simulacro 1',                      historia: 'Repaso de errores en comentario, tema y fuente histórica',         ingles: 'Repaso de errores writing, reading y use of english',         misionTypes: ['repaso_error'],                                        duracion: '30 min' },
  { semana: 36, fase: 4, objetivo: 'Simulacros completos escalonados — semana 2',  mates: 'Segundo simulacro completo Matemáticas II en formato PAU',          historia: 'Segundo simulacro completo Historia de España en formato PAU',     ingles: 'Segundo simulacro completo Inglés en formato PAU',            misionTypes: ['simulacro_completo_escalonado'],                       duracion: '60-90 min' },
  { semana: 37, fase: 4, objetivo: 'Repaso intenso final sin contenido nuevo',     mates: 'Repaso de errores recurrentes de todo el año',                      historia: 'Repaso de errores recurrentes y estructuras de respuesta',         ingles: 'Repaso de errores recurrentes de writing, reading y grammar', misionTypes: ['repaso_error','flashcard'],                            duracion: '25-30 min' },
  { semana: 38, fase: 4, objetivo: 'Semana PAU — repaso ligero y confianza',       mates: 'Flashcards de fórmulas, conceptos clave y errores frecuentes',      historia: 'Flashcards de fechas, conceptos y estructura de respuesta',        ingles: 'Vocabulary, connectors y grammar muy ligero',                 misionTypes: ['flashcard','repaso_ligero'],                           duracion: '10-15 min' },
]

export function getCaminoWeek(semana: number): CaminoWeekData | undefined {
  return CAMINO_CURRICULUM.find(w => w.semana === semana)
}

export function getPhaseLabel(fase: 1 | 2 | 3 | 4): string {
  return { 1: 'Fase 1 — Base', 2: 'Fase 2 — Bloques', 3: 'Fase 3 — Formato PAU', 4: 'Fase 4 — Simulacros' }[fase]
}
