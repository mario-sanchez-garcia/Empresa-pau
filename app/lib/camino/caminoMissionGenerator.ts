import type { CaminoTaskTypeId, DailyCaminoTask } from './caminoData'
import { buildCaminoAction } from './caminoActions'
import { CAMINO_CURRICULUM, MISSION_TASK_XP, ROUTE_WEEK_OFFSET, getPhaseLabel, type CaminoWeekData } from './caminoCurriculum'
import { extractBlockKey } from './curriculumFlashcards'

export interface WeekContext {
  semana: number
  fase: 1 | 2 | 3 | 4
  faseLabel: string
  objetivo: string
  duracion: string
  mates: string
  historia: string
  ingles: string
}

// Calcula la semana del currículum para un usuario dado su fecha de entrada, ruta y fecha actual.
// El offset desplaza el punto de inicio en el currículum según la ruta elegida.
export function calculateCaminoWeek(
  entryDate: string | null,
  routeId: string,
  today: string
): number {
  const offset = ROUTE_WEEK_OFFSET[routeId] ?? 0
  if (!entryDate) return Math.min(38, 1 + offset)

  const entry = new Date(entryDate + 'T12:00:00Z')
  const now = new Date(today + 'T12:00:00Z')
  const daysSinceEntry = Math.max(0, Math.floor((now.getTime() - entry.getTime()) / (1000 * 60 * 60 * 24)))
  const weeksSinceEntry = Math.floor(daysSinceEntry / 7)
  return Math.min(38, Math.max(1, weeksSinceEntry + 1 + offset))
}

// Determina qué subject (subjectKey + display) usar para un tipo de tarea en el contexto de la semana.
function resolveTaskSubject(
  type: CaminoTaskTypeId,
  week: CaminoWeekData
): { subjectKey: string; subjectLabel: string; blockDetail: string } {
  if (type === 'reading') return { subjectKey: 'ingles', subjectLabel: 'Inglés', blockDetail: week.ingles }
  if (type === 'writing') return { subjectKey: 'ingles', subjectLabel: 'Inglés', blockDetail: week.ingles }
  if (type === 'correccion_ia') {
    const isWriting = /writing|redacc/i.test(week.ingles)
    if (isWriting) return { subjectKey: 'ingles', subjectLabel: 'Inglés', blockDetail: week.ingles }
    return { subjectKey: 'mates', subjectLabel: 'Matemáticas II', blockDetail: week.mates }
  }
  return { subjectKey: 'mates', subjectLabel: 'Matemáticas II', blockDetail: week.mates }
}

// Genera el título corto para una tarea basado en el tipo y la semana.
function buildTaskTitle(type: CaminoTaskTypeId, blockDetail: string): string {
  const maxLen = 52
  const truncate = (s: string) => s.length > maxLen ? s.slice(0, maxLen - 1) + '…' : s

  const templates: Record<CaminoTaskTypeId, string> = {
    flashcard: `Flashcards: ${blockDetail}`,
    ejercicio_corto: `Ejercicio: ${blockDetail}`,
    correccion_ia: `Corrección: ${blockDetail}`,
    repaso_error: `Repaso de errores: ${blockDetail}`,
    mini_simulacro: `Mini simulacro: ${blockDetail}`,
    simulacro_completo: `Simulacro completo: ${blockDetail}`,
    simulacro_completo_escalonado: `Simulacro escalonado: ${blockDetail}`,
    estrategia_examen: `Estrategia de examen: ${blockDetail}`,
    repaso_ligero: `Repaso ligero: ${blockDetail}`,
    reading: `Reading: ${blockDetail}`,
    writing: `Writing: ${blockDetail}`,
    test: `Test rápido: ${blockDetail}`,
  }
  return truncate(templates[type] ?? blockDetail)
}

// Genera el detalle descriptivo para el card de la tarea.
function buildTaskDetail(type: CaminoTaskTypeId, blockDetail: string): string {
  const details: Partial<Record<CaminoTaskTypeId, string>> = {
    flashcard: `Repasa los conceptos clave de este bloque sin presión.`,
    ejercicio_corto: `Practica un ejercicio corto de ${blockDetail.split(':')[0]}.`,
    correccion_ia: `Escribe una respuesta y recibe feedback guiado.`,
    repaso_error: `Vuelve a los puntos donde más errores cometes.`,
    mini_simulacro: `Responde 1-2 preguntas en formato PAU real.`,
    simulacro_completo: `Examen completo en condiciones reales.`,
    simulacro_completo_escalonado: `Un simulacro completo — reparte los exámenes durante la semana.`,
    estrategia_examen: `Decide qué elegir, en qué orden y cómo aprovechar el tiempo.`,
    repaso_ligero: `Repasa sin presión para llegar al examen con confianza.`,
    reading: `Comprensión lectora de un texto tipo PAU.`,
    writing: `Redacción guiada con estructura PAU.`,
    test: `Preguntas rápidas para afianzar lo aprendido.`,
  }
  return details[type] ?? `Trabaja ${blockDetail.split(':')[0]}.`
}

// Genera la lista de tareas para la misión diaria de una semana concreta.
// Si hay weakBlocks, añade un repaso de error extra si no hay uno ya.
export function buildDailyTasksFromWeek(
  week: CaminoWeekData,
  weakBlocks: string[] = []
): DailyCaminoTask[] {
  const visibleTypes = week.misionTypes.map(type => type === 'flashcard' ? 'ejercicio_corto' : type)
  const tasks: DailyCaminoTask[] = visibleTypes.map((type, index) => {
    const { subjectKey, subjectLabel, blockDetail } = resolveTaskSubject(type, week)
    const id = `w${week.semana}-${type}-${index}`
    const action = buildCaminoAction(type, subjectKey)
    const block = subjectKey === 'mates' ? (extractBlockKey(blockDetail) ?? undefined) : undefined
    return {
      id,
      title: buildTaskTitle(type, blockDetail),
      type,
      xp: MISSION_TASK_XP[type],
      subject: subjectLabel,
      subjectKey,
      detail: buildTaskDetail(type, blockDetail),
      actionLabel: action.label,
      actionHref: action.href,
      block,
    }
  })

  // Si hay bloques débiles y la misión no incluye repaso de error, añadir uno
  const hasRepaso = tasks.some(t => t.type === 'repaso_error')
  if (!hasRepaso && weakBlocks.length > 0) {
    tasks.push({
      id: `w${week.semana}-repaso_error-weak`,
      title: `Refuerza ${weakBlocks[0]}`,
      type: 'ejercicio_corto',
      xp: MISSION_TASK_XP.ejercicio_corto,
      subject: 'Matemáticas II',
      subjectKey: 'mates',
      detail: `Trabajas este bloque porque aparece como punto débil reciente.`,
      actionLabel: 'Practicar bloque',
      actionHref: `/?subject=mates&block=${encodeURIComponent(weakBlocks[0])}&mode=random&source=camino_legacy`,
    })
  }

  return tasks
}

// Punto de entrada principal: genera la misión del día y el contexto de la semana.
export function getMissionForDate({
  entryDate,
  routeId,
  today,
  weakBlocks = [],
}: {
  entryDate: string | null
  routeId: string
  today: string
  weakBlocks?: string[]
}): { tasks: DailyCaminoTask[]; weekContext: WeekContext | null } {
  const semana = calculateCaminoWeek(entryDate, routeId, today)
  const week = CAMINO_CURRICULUM.find(w => w.semana === semana)

  if (!week) {
    return { tasks: [], weekContext: null }
  }

  const tasks = buildDailyTasksFromWeek(week, weakBlocks)
  const weekContext: WeekContext = {
    semana: week.semana,
    fase: week.fase,
    faseLabel: getPhaseLabel(week.fase),
    objetivo: week.objetivo,
    duracion: week.duracion,
    mates: week.mates,
    historia: week.historia,
    ingles: week.ingles,
  }

  return { tasks, weekContext }
}
