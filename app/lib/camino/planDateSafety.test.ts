import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// La garantía SISTÉMICA: nadie propone una fecha sin conocer el examen.
//
// El motor cortaba antes de la fecha objetivo, pero era el único que lo hacía:
// la personalización reubicaba filas más allá del examen, y los inyectores de
// repaso, diagnóstico y práctica de bloque elegían sus fechas con ventanas
// fijas de 14 o 30 días laborables que no sabían nada del alumno. Una garantía
// que solo cumple un componente no es una garantía del plan.
//
// Estos tests se comprueban sobre el CÓDIGO FUENTE porque los módulos que
// escriben calendario importan 'server-only' y Supabase: no se pueden cargar
// en un test de Node. Lo que sí se puede fijar es que ninguno vuelva a elegir
// fechas por su cuenta.

const ROOT = join(process.cwd(), 'app', 'lib')

/** Todo módulo que proponga fechas de misión al calendario. */
const CALENDAR_WRITERS = [
  'ensureCaminoCalendar.ts',
  'camino/applyCalendarPersonalization.ts',
  'camino/injectWeakReviewMissions.ts',
  'camino/injectDiagnosticMissions.ts',
  'camino/generateBlockPracticeMission.ts',
  'camino/injectPartialExamMissions.ts',
  'onboarding/generateCaminoPlan.ts',
]

function read(file: string): string {
  return readFileSync(join(ROOT, file), 'utf8')
}

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter(line => !line.trim().startsWith('//'))
    .join('\n')
}

test('ningún escritor del calendario elige fechas con una ventana fija propia', () => {
  for (const file of CALENDAR_WRITERS) {
    const code = stripComments(read(file))
    assert.ok(
      !/getStudyDays\s*\(/.test(code),
      `${file} vuelve a usar getStudyDays: esa ventana no conoce la fecha de examen del alumno`,
    )
  }
})

test('todo escritor del calendario conoce la ventana de planificación del alumno', () => {
  for (const file of CALENDAR_WRITERS) {
    const code = stripComments(read(file))
    assert.ok(
      /studentPlanContext|planWindow|StudentPlanContext/.test(code),
      `${file} escribe fechas sin pasar por la ventana de planificación`,
    )
  }
})

test('la preparación de parciales cae en días del alumno y nunca tras la PAU', () => {
  // injectPartialExamMissions lo importa también el componente de calendario,
  // así que no puede cargar la ventana él mismo (es `server-only`): la recibe
  // de quien la tiene. Lo que sí se fija aquí es que la use.
  const code = stripComments(read('camino/injectPartialExamMissions.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('function prepSlotOptions('), 'no traduce la ventana a huecos de preparación')
  assert.ok(code.includes('notAfter: context.examDate'), 'la fecha objetivo no acota los huecos de preparación')
  assert.equal(
    (code.match(/weekdaysBefore\([^)]*prepSlotOptions\(/g) ?? []).length,
    2,
    'algún cálculo de huecos de preparación sigue asumiendo L-V',
  )
  assert.ok(code.includes('weeklyStudyDays,'), 'el reparto entre exámenes sigue sin recibir los días semanales')
})

test('quienes tienen la ventana se la pasan a la inyección de parciales', () => {
  for (const file of ['ensureCaminoCalendar.ts', 'onboarding/generateCaminoPlan.ts']) {
    const code = stripComments(read(file)).replace(/\s+/g, ' ')
    assert.ok(
      /injectAllPartialExamMissions\([^)]*planContext/.test(code),
      `${file} inyecta parciales sin pasar la ventana de planificación`,
    )
  }
})

test('la personalización no reubica más allá del examen', () => {
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('if (current >= examDate) break'), 'falta el corte por fecha de examen')
  // Y cambiar la convocatoria tiene que invalidar lo ya aplicado.
  assert.ok(
    /preferenceHash = stableHash\([^)]*context\.examDate/.test(code),
    'la fecha objetivo no entra en el hash: mover el examen no re-dispararía la personalización',
  )
})

test('el motor decide fecha Y asignatura: el servidor no vuelve a rotar por su cuenta', () => {
  const code = stripComments(read('ensureCaminoCalendar.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('plannedSubjectByDate'), 'el servidor no consume la asignatura que decidió el motor')
  assert.ok(
    code.includes('rotationWeights: examRotationWeights('),
    'el servidor no alimenta el motor con los mismos pesos de rotación que la vista previa',
  )
})

test('la cola solo se marca como programada si el calendario se escribió', () => {
  const code = stripComments(read('ensureCaminoCalendar.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('let calendarWritten = true'), 'no se comprueba el resultado del upsert de calendario')
  assert.ok(
    code.includes("if (calendarWritten && scheduledQueueIds.length > 0)"),
    'la cola puede marcarse como programada aunque el calendario no se haya escrito',
  )
})

// ── El primer plan no puede leer preferencias que aún no existen ─────────

test('el generador de onboarding recibe la disponibilidad declarada', () => {
  // El evento `onboarding_completed` se escribe DESPUÉS de generar y verificar
  // el calendario — y debe seguir siendo así: es el evento que significa "el
  // proceso terminó". Por eso los días/minutos llegan por parámetro.
  const code = stripComments(read('onboarding/generateCaminoPlan.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('weeklyStudyDays?: number | null'), 'el generador no acepta los días semanales declarados')
  assert.ok(
    code.includes('const declaredAvailability = { weeklyStudyDays: params.weeklyStudyDays ?? null, dailyMinutes }'),
    'el generador no construye la disponibilidad declarada',
  )
  assert.ok(
    code.includes('loadStudentPlanContext(userId, db, today, declaredAvailability)'),
    'el contexto del primer plan no recibe lo declarado',
  )
  assert.ok(
    /applyCalendarPersonalization\(userId, db, \{ planContext, declared: declaredAvailability \}\)/.test(code),
    'la personalización del primer pase no recibe lo declarado',
  )
})

test('las dos rutas de onboarding pasan los días semanales declarados', () => {
  for (const file of ['../api/onboarding/finalize/route.ts', '../api/onboarding/generate/route.ts']) {
    const code = stripComments(readFileSync(join(ROOT, file), 'utf8')).replace(/\s+/g, ' ')
    assert.ok(/weeklyStudyDays[:,]/.test(code), `${file} genera el plan sin los días semanales declarados`)
  }
})

test('el evento de onboarding completado sigue escribiéndose al final', () => {
  // La solución NO puede ser adelantar el evento: significaría "completado"
  // antes de que exista el Camino.
  const code = readFileSync(join(ROOT, '../api/onboarding/finalize/route.ts'), 'utf8')
  const verifyAt = code.indexOf('loadRewardMissions(db, user.id)\n  if (missions.length === 0)')
  const eventAt = code.indexOf("event_type: 'onboarding_completed'")
  assert.ok(verifyAt > 0 && eventAt > 0)
  assert.ok(eventAt > verifyAt, 'el evento de completado se ha adelantado a la verificación del calendario')
})

// ── Entrada muy tardía: siempre hay una primera acción ───────────────────

test('la entrada en la última semana tiene rama propia y salida garantizada', () => {
  const code = stripComments(read('onboarding/generateCaminoPlan.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('const finalSprint = contentDays.length === 0'), 'no hay rama de entrada muy tardía')
  assert.ok(
    code.includes('includeFinalReviewWindow: true'),
    'la rama tardía no usa los días de la reserva de repaso final',
  )
  // Último recurso: si el patrón semanal no deja ni un día, valen todos.
  assert.ok(
    code.includes('for (let d = today; d < planContext.examDate; d = addDaysIso(d, 1)) sprintDays.push(d)'),
    'sin este último recurso una cuenta puede quedarse sin poder terminar el onboarding',
  )
  // Y lo que se siembra ahí es repaso, no temario nuevo.
  assert.ok(code.includes("finalSprint ? 'review' :"), 'la rama tardía siembra temario nuevo dentro de la reserva')
})

// ── El calendario existente también se corrige ───────────────────────────

test('la personalización delega la decisión en el módulo puro y le pasa las dos ventanas', () => {
  // El QUÉ-va-DÓNDE se comprueba de verdad en planPlacement.test.ts, sobre
  // datos. Aquí solo se fija que la personalización no vuelva a decidirlo por
  // su cuenta y que le pase el corte de temario nuevo, no solo el examen.
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('const decision = planPlacement('), 'la personalización vuelve a decidir por su cuenta')
  assert.ok(code.includes('planningCutoff: context.planningCutoff'), 'no le pasa el corte de temario nuevo')
  assert.ok(code.includes('examDate: context.examDate'), 'no le pasa la fecha objetivo')
})

test('lo que no cabe queda en un estado explícito y vuelve a la cola', () => {
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes("status: 'unscheduled'"), 'las filas sin sitio se quedan con su fecha imposible')
  assert.ok(code.includes('unscheduled_reason: item.reason'), 'no se registra por qué no cabe')
  assert.ok(code.includes('unscheduledRows: unplaced.length'), 'no se informa de cuántas quedan fuera')
  assert.ok(!/\.delete\(/.test(code), 'la personalización borra trabajo del alumno')
  assert.ok(
    /user_learning_queue[\s\S]*queue_status: 'pending'/.test(code),
    'el trabajo sin sitio no vuelve a la cola para replanificarse',
  )
})

test('las filas ya escritas con fecha posterior al examen se corrigen', () => {
  const code = stripComments(read('ensureCaminoCalendar.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes(".gte('scheduled_date', examDate)"), 'no se barren las filas con fecha imposible')
  assert.ok(code.includes("status: 'unscheduled'"), 'esas filas siguen mostrándose como trabajo programado')
})

test('la migración de estado es aditiva y conserva los estados existentes', () => {
  const sql = readFileSync(
    join(process.cwd(), 'supabase', 'migrations', '20260916100000_camino_calendar_unscheduled_status.sql'),
    'utf8',
  )
  for (const status of ['pending', 'completed', 'missed', 'postponed', 'unscheduled']) {
    assert.ok(sql.includes(`'${status}'`), `la migración pierde el estado ${status}`)
  }
  assert.ok(!/delete|drop table|update .* set/i.test(sql.replace(/drop constraint/gi, '')), 'la migración toca datos')
})
