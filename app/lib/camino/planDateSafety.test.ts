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
