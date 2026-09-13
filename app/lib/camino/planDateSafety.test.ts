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
  // El corte lo garantizan las fechas candidatas (todas del contexto, ya
  // acotadas por el examen) y `eligibleDatesFor`, con tests sobre datos en
  // planPlacement.test.ts.
  assert.ok(code.includes('candidateDates(context, appliedFrom)'), 'las fechas candidatas no salen del contexto')
  // Y cambiar la convocatoria tiene que invalidar lo ya aplicado.
  assert.ok(
    /preferenceHash = stableHash\(/.test(code) && code.includes('context.examDate'),
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
  const route = readFileSync(join(ROOT, '../api/onboarding/finalize/route.ts'), 'utf8').replace(/\s+/g, ' ')
  const migration = readFileSync(
    join(ROOT, '../../supabase/migrations/20260917120000_harden_auth_onboarding_integrity.sql'),
    'utf8',
  ).replace(/\s+/g, ' ')
  const verifyAt = route.indexOf('loadRewardMissions(db, user.id) if (missions.length === 0)')
  const commitAt = route.indexOf("db.rpc('complete_onboarding_processing'")
  const functionAt = migration.indexOf('create or replace function public.complete_onboarding_processing')
  const eventAt = migration.indexOf("values (p_user_id, 'onboarding_completed', p_payload)", functionAt)
  const draftAt = migration.indexOf("status='completed'", functionAt)
  assert.ok(verifyAt > 0 && commitAt > 0 && functionAt > 0 && eventAt > 0 && draftAt > 0)
  assert.ok(commitAt > verifyAt, 'el commit de completado se ha adelantado a la verificación del calendario')
  assert.ok(eventAt < draftAt, 'la transacción no registra el evento antes de cerrar el draft')
})

// ── Entrada muy tardía: siempre hay una primera acción ───────────────────

test('la entrada en la última semana tiene rama propia y salida garantizada', () => {
  const code = stripComments(read('onboarding/generateCaminoPlan.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes('const finalSprint = contentDays.length === 0'), 'no hay rama de entrada muy tardía')
  assert.ok(
    code.includes('includeFinalReviewWindow: true'),
    'la rama tardía no usa los días de la reserva de repaso final',
  )
  // El último recurso (abrir la semana entera) vive en el CONTEXTO, no aquí:
  // si lo abriera solo este paso, la personalización lo desharía después.
  assert.ok(
    !/for \(let d = today; d < planContext\.examDate/.test(code),
    'el generador vuelve a abrir días por su cuenta; esa apertura es del contexto',
  )
  assert.ok(
    code.includes('planningDates(planContext, { limit: ONBOARDING_PLAN_DAYS, includeFinalReviewWindow: true })'),
    'la rama tardía no toma sus días del contexto compartido',
  )
  // Y lo que se siembra ahí es repaso, no temario nuevo.
  assert.ok(code.includes("finalSprint ? 'review' :"), 'la rama tardía siembra temario nuevo dentro de la reserva')
})

test('la disponibilidad excepcional es del alumno, no de un paso', () => {
  const window = stripComments(read('camino/planWindow.ts')).replace(/\s+/g, ' ')
  assert.ok(window.includes('emergencyAvailability'), 'el contexto no expresa la apertura excepcional de días')
  const personalization = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  // La personalización ya no calcula su propia lista de días preferidos.
  assert.ok(
    !personalization.includes('isPreferredStudyDay'),
    'la personalización vuelve a tener su propia fuente de disponibilidad',
  )
  assert.ok(personalization.includes('planningDates(context'), 'no toma los días del contexto compartido')
})

test('el tope comercial de días forma parte de la disponibilidad efectiva', () => {
  const loader = stripComments(read('camino/studentPlanContext.ts')).replace(/\s+/g, ' ')
  assert.ok(loader.includes('loadStudyAccess('), 'el contexto ignora el acceso comercial del alumno')
  // El tope SE APLICA (el plan nunca usa más días de los que da el acceso)…
  assert.ok(
    /weeklyStudyDays: effectiveWeekly/.test(loader) && /access\.maxStudyDaysPerWeek/.test(loader),
    'el tope no se aplica al patrón semanal',
  )
  // …pero NO en silencio: lo pedido viaja para poder decírselo al alumno.
  assert.ok(loader.includes('availabilityExceedsAccess'), 'el recorte vuelve a ser invisible para el alumno')
  // Y NUNCA lanzando: esta es una lectura, y la llaman ensureCaminoCalendar,
  // los inyectores y la personalización. Un alumno free con 5 días guardados
  // del selector antiguo se quedaba sin Camino ninguno.
  assert.ok(!/if \(invalid\) throw/.test(loader), 'la carga del contexto vuelve a lanzar por disponibilidad guardada')
})

test('"no cabe" significa que se agotaron los días, no que falló el primero', () => {
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  // Un día sin hueco horario continúa al siguiente día elegible.
  assert.ok(
    /if \(!timeSlot\) continue/.test(code),
    'un día sin hueco horario vuelve a abandonar la misión en vez de probar el siguiente',
  )
  assert.ok(code.includes('for (const date of preferredDatesFor('), 'no se recorren todas las fechas elegibles')
  // Y la lista de candidatas no se recorta al mínimo necesario.
  assert.ok(code.includes('MAX_CANDIDATE_DAYS'), 'la ventana candidata sigue recortada al mínimo de filas')
})

test('subir el algoritmo de colocación invalida la personalización anterior', () => {
  const code = read('camino/applyCalendarPersonalization.ts')
  // No se fija una versión CONCRETA —sube cada vez que cambia el algoritmo—
  // sino que exista y entre en el hash, que es lo que invalida lo aplicado.
  const version = code.match(/const PERSONALIZATION_VERSION = 'calendar_personalization_v(\d+)'/)
  assert.ok(version, 'no hay versión de personalización')
  assert.ok(Number(version[1]) >= 4, `la versión no ha subido tras cambiar el algoritmo (v${version[1]})`)
  assert.ok(
    code.replace(/\s+/g, ' ').includes('stableHash( `${PERSONALIZATION_VERSION}')
      || code.includes('stableHash(`${PERSONALIZATION_VERSION}'),
    'la versión no entra en el hash: las filas antiguas saldrían por already_current',
  )
})

// ── El calendario existente también se corrige ───────────────────────────

test('la personalización usa las reglas del módulo puro, no unas propias', () => {
  // El QUÉ-va-DÓNDE se comprueba de verdad en planPlacement.test.ts, sobre
  // datos. Aquí solo se fija que la personalización no vuelva a decidirlo por
  // su cuenta y que le pase el corte de temario nuevo, no solo el examen.
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  for (const rule of ['preferredDatesFor(', 'orderRowsForPlacement(', 'unscheduledReasonFor(']) {
    assert.ok(code.includes(rule), `la personalización no usa la regla compartida ${rule}`)
  }
  assert.ok(code.includes('planningCutoff: context.planningCutoff'), 'no le pasa el corte de temario nuevo')
  assert.ok(code.includes('examDate: context.examDate'), 'no le pasa la fecha objetivo')
})

test('lo que no cabe queda en un estado explícito y vuelve a la cola', () => {
  const code = stripComments(read('camino/applyCalendarPersonalization.ts')).replace(/\s+/g, ' ')
  assert.ok(code.includes("status: 'unscheduled'"), 'las filas sin sitio se quedan con su fecha imposible')
  assert.ok(code.includes('unscheduled_reason: unscheduledReasonFor('), 'no se registra por qué no cabe')
  assert.ok(code.includes('unscheduledRows: unplaced.length'), 'no se informa de cuántas quedan fuera')
  assert.ok(!/\.delete\(/.test(code), 'la personalización borra trabajo del alumno')
  // La vuelta a la cola ya NO la hace la personalización con un UPDATE suelto:
  // va dentro de camino_apply_placements, que en la MISMA transacción coloca
  // las filas y reconcilia user_learning_queue. Un fallo a mitad ya no puede
  // dejar calendario y cola en desacuerdo.
  assert.ok(code.includes("supabase.rpc('camino_apply_placements'"), 'la escritura ya no es transaccional')
  const migration = readFileSync(
    join(process.cwd(), 'supabase', 'migrations', '20260919100000_camino_reliability.sql'), 'utf8',
  )
  assert.ok(migration.includes('camino_reconcile_work'), 'no existe la reconciliación cola-calendario')
  assert.ok(
    /update user_learning_queue q set queue_status='pending'/.test(migration),
    'la reconciliación no devuelve a pending el trabajo sin colocación viva',
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

// ── Un fallo de escritura no es una ejecución completa ───────────────────

test('una ejecución degradada NO marca el día como hecho', () => {
  // Una escritura que falla y se registra —una migración todavía sin aplicar,
  // por ejemplo— deja el Camino incompleto sin lanzar excepción. Marcar el día
  // igualmente convertía un fallo recuperable en un día perdido.
  const ensure = stripComments(read('ensureCaminoCalendar.ts')).replace(/\s+/g, ' ')
  assert.ok(ensure.includes('degraded.push('), 'los fallos registrados no se reportan')
  // Se comprueba que `ok` se DERIVA de degraded, no la lista literal de
  // campos: el resultado puede crecer (p. ej. `protectedConflicts`, las
  // misiones que el alumno fijó y quedaron en fecha imposible) sin que eso
  // afecte a lo que esta prueba defiende.
  assert.ok(/return \{ ok: degraded\.length === 0, degraded[,}]/.test(ensure), 'la ejecución no devuelve su estado')

  const route = stripComments(
    readFileSync(join(ROOT, '../api/camino/ensure-calendar/route.ts'), 'utf8'),
  ).replace(/\s+/g, ' ')
  assert.ok(route.includes('if (degraded.length === 0) {'), 'el día se marca sin comprobar si la ejecución fue completa')
  assert.ok(
    route.includes("personalization.reason === 'error' ? ['personalization'] : []"),
    'un fallo de personalización no cuenta como ejecución degradada',
  )
})

test('la siembra no puede proponer una segunda colocacion viva del mismo item', () => {
  // Un alumno con 6 dias de estudio a la semana veia "Repaso libre" a partir
  // de su ultimo dia sembrado. No era una decision sobre sus dias: el lote de
  // ~100 misiones del mes se rechazaba ENTERO porque una sola fila chocaba con
  // el indice camino_one_live_placement_per_queue. El upsert lleva
  // ignoreDuplicates sobre (user_id, scheduled_date, subject, v2_sort_order) y
  // un ON CONFLICT DO NOTHING solo perdona la restriccion que nombra.
  const ensure = stripComments(read('ensureCaminoCalendar.ts')).replace(/\s+/g, ' ')
  assert.ok(
    ensure.includes('alreadyPlacedQueueIds'),
    'la siembra no mira si el item de cola ya tiene una colocacion viva',
  )
  assert.ok(
    ensure.includes('if (alreadyPlacedQueueIds.has(item.id)) continue'),
    'un item ya colocado entra igual en la siembra y tumba el lote entero',
  )
  // La lista de ocupados se lee SIN filtro de fecha: el indice unico no mira
  // scheduled_date, asi que una colocacion viva en el pasado colisiona igual.
  assert.ok(
    /livePlacementRows[\s\S]{0,400}?\.in\('status', \['pending', 'postponed'\]\)/.test(ensure),
    'la lista de items ya colocados no se limita a las filas vivas',
  )
})

test('un reajuste que pilla el Camino ocupado no se pierde ni se delega en el alumno', () => {
  // Guardar los ajustes tiene que bastar. El bloqueo por alumno que comparte
  // ensure-calendar con el resto del Camino hace que un `force` legítimo se
  // lleve un 409 solo por tenerlo abierto en otra pestaña; antes eso acababa
  // en «cierra las demás pestañas y pulsa Recalcular» y el plan se quedaba
  // viejo. Ahora queda apuntado en camino_ensure_log.replan_pending_at y lo
  // aplica la siguiente ejecución.
  const route = stripComments(
    readFileSync(join(ROOT, '../api/camino/ensure-calendar/route.ts'), 'utf8'),
  ).replace(/\s+/g, ' ')
  assert.ok(route.includes('markReplanPending'), 'un reajuste que no entra no se apunta en ninguna parte')
  // Las dos salidas por las que un `force` puede no entrar: la ejecución
  // degradada y el catch (ocupado o error). Ninguna puede quedarse sin anotar.
  assert.ok(route.includes('if (force) degradedPending = await markReplanPending(db, user.id)'), 'un reajuste forzado que sale degradado se pierde')
  assert.ok(route.includes('const pending = force ? await markReplanPending(db, user.id) : false'), 'un reajuste forzado que falla o pilla el plan ocupado se pierde')
  assert.ok(route.includes('if (pendingAt) force = true'), 'el pendiente no se salta el throttle diario, así que no llegaría a aplicarse')
  // La limpieza va por igualdad con la marca leída: un pendiente NUEVO que
  // entre mientras corre esta ejecución tiene que sobrevivir.
  assert.ok(
    route.includes(".eq('replan_pending_at', pendingAt)"),
    'el pendiente se borra a ciegas y puede llevarse por delante uno posterior',
  )

  const settings = readFileSync(join(process.cwd(), 'app', 'settings', 'page.tsx'), 'utf8')
  const busyMessage = settings.split('\n').find(line => line.includes('const pending: CaminoPrefsStatus')) ?? ''
  assert.ok(busyMessage.length > 0, 'Ajustes ya no distingue el caso "ocupado"')
  assert.ok(
    !busyMessage.includes('Recalcular'),
    'Ajustes sigue pidiendo pulsar «Recalcular» por algo que se aplica solo',
  )
})

test('el trabajo sin fecha se le muestra al alumno', () => {
  // El recuento ya no lo hace el navegador: vive en /api/camino/plan-status,
  // que puede descontar el trabajo que la cola ya ha resuelto — algo que el
  // cliente no sabe. La regla pura está en unscheduledWork.ts, con tests.
  const route = readFileSync(
    join(process.cwd(), 'app', 'api', 'camino', 'plan-status', 'route.ts'), 'utf8',
  )
  assert.ok(route.includes("eq('status', 'unscheduled')"), 'el estado no lee el trabajo sin fecha')
  assert.ok(route.includes('summarizeUnscheduled('), 'el estado no resume el trabajo sin fecha')

  const summary = readFileSync(
    join(process.cwd(), 'app', 'lib', 'camino', 'unscheduledWork.ts'), 'utf8',
  )
  // Temas ÚNICOS: una tarea recolocada varias veces no puede inflar el número.
  assert.ok(summary.includes('const seen = new Set<string>()'), 'se cuentan filas en vez de temas únicos')
  assert.ok(summary.includes('resolvedQueueIds.has(row.queue_id)'), 'se cuenta trabajo que la cola ya resolvió')

  const banner = readFileSync(
    join(process.cwd(), 'app', 'components', 'camino', 'UnscheduledWorkBanner.tsx'), 'utf8',
  )
  assert.ok(banner.includes('/api/camino/plan-status'), 'el aviso no consulta el estado del plan')
  const client = readFileSync(
    join(process.cwd(), 'app', 'components', 'camino', 'CaminoCalendarClient.tsx'), 'utf8',
  )
  assert.ok(client.includes('<UnscheduledWorkBanner />'), 'el aviso no está montado en Camino')
})
