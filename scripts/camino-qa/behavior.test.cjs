const { test } = require('node:test'), assert = require('node:assert/strict')
const { runtime, database } = require('./runtime.cjs')
const user = 'student'
function fixture(today, minutes = 30, weekly = 3) {
  return database({ perfiles: [{ id: user, pau_exam_date: '2027-06-07', subjects: ['fisica'], student_exams: [] }],
    billing_events: [{ user_id: user, event_type: 'onboarding_completed', payload: { daily_minutes: minutes, weekly_study_days_value: weekly } }],
    user_entitlements: [{ user_id: user, status: 'active', plan_id: 'premium' }],
  })
}
function row(id,date,status = 'pending',type = 'concept') { return { id, user_id: user, queue_id: id+'-q', subject: 'fisica', v2_sort_order: Number(id.replace(/\D/g,'')) || 1,
 scheduled_date: date, status, mission_type: type, source: 'algorithm', locked: false, metadata: {}, created_at: '2027-01-01', updated_at: '2027-01-01', start_time: '16:00', end_time: '16:30' } }
function seed(db,rows) { db.tables.camino_calendar = rows; db.tables.user_learning_queue = rows.map(r => ({ id: r.queue_id, user_id: user, subject:r.subject, title:'Tema', v2_sort_order:r.v2_sort_order, queue_status:'pending',metadata:{} })) }

test('unscheduled work releases time; re-placement uses same ID and resolves summary', async () => {
 const load=runtime(),db=fixture(); seed(db,[row('1','2027-05-17','unscheduled')])
 const schedule=load('app/lib/camino/scheduleTimeSlot.ts')
 assert.equal((await schedule.getBusyIntervalsForDate(user,db,'2027-05-17')).length,0)
 const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(result.reason,'applied'); assert.equal(db.tables.camino_calendar.length,1)
 assert.equal(db.tables.camino_calendar[0].status,'pending'); assert.equal(db.tables.user_learning_queue[0].queue_status,'scheduled')
 const summary=load('app/lib/camino/unscheduledWork.ts').summarizeUnscheduled(db.tables.camino_calendar.filter(r=>r.status==='unscheduled'),new Set())
 assert.equal(summary.topics,0)
})
// El parcial ocupa presupuesto del dia como cualquier otra mision, y vence
// antes, asi que se coloca primero. Lo que la leccion haga despues depende de
// cuantos minutos le queden al dia — no de una fecha fija.
//
// La version anterior de esta prueba usaba un parcial SIN fecha de examen y
// una jornada de 30 minutos, y afirmaba que la leccion se iba al miercoles.
// Con el contrato actual eso no puede pasar: una practica de 45 minutos no
// cabe en un dia de 30, asi que el parcial se queda sin programar y la leccion
// conserva su lunes. La prueba pasaba a verde por un motivo que ya no existia
// y dejaba de comprobar la propiedad de su propio nombre.
function partial(id, date, examDate) {
 return {...row(id,date,'pending','partial_practice'), queue_id:null, source:'partial',
  metadata:{partial_exam_date:examDate}}
}
const MONDAY='2027-05-17', WEDNESDAY='2027-05-19', PARTIAL_EXAM='2027-05-21'

test('45 min: el parcial ocupa el lunes y la leccion se va al miercoles',async()=>{
 const load=runtime(),db=fixture(MONDAY,45);seed(db,[row('1',MONDAY)])
 db.tables.camino_calendar.push(partial('2',MONDAY,PARTIAL_EXAM))
 const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(result.reason,'applied')
 const leccion=db.tables.camino_calendar.find(r=>r.id==='1')
 const parcial=db.tables.camino_calendar.find(r=>r.id==='2')
 assert.equal(parcial.scheduled_date,MONDAY,'el parcial vence antes: se coloca primero')
 assert.equal(parcial.status,'pending')
 assert.equal(leccion.scheduled_date,WEDNESDAY,'sin minutos libres el lunes, la leccion se desplaza')
 assert.equal(leccion.status,'pending','desplazar no es perder: sigue activa')
})

test('60 min: mismo reparto — dos misiones caben en el dia, los minutos no',async()=>{
 const load=runtime(),db=fixture(MONDAY,60);seed(db,[row('1',MONDAY)])
 db.tables.camino_calendar.push(partial('2',MONDAY,PARTIAL_EXAM))
 await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(db.tables.camino_calendar.find(r=>r.id==='2').scheduled_date,MONDAY)
 assert.equal(db.tables.camino_calendar.find(r=>r.id==='1').scheduled_date,WEDNESDAY)
})

test('90 min: con presupuesto suficiente las dos caben el mismo dia, sin solaparse',async()=>{
 const load=runtime(),db=fixture(MONDAY,90);seed(db,[row('1',MONDAY)])
 db.tables.camino_calendar.push(partial('2',MONDAY,PARTIAL_EXAM))
 await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 const leccion=db.tables.camino_calendar.find(r=>r.id==='1')
 const parcial=db.tables.camino_calendar.find(r=>r.id==='2')
 assert.equal(parcial.scheduled_date,MONDAY);assert.equal(leccion.scheduled_date,MONDAY)
 assert.ok(leccion.start_time>=parcial.end_time,`solape: parcial ${parcial.start_time}-${parcial.end_time}, leccion ${leccion.start_time}-${leccion.end_time}`)
})

test('30 min: una practica de 45 no cabe — se declara, no se esconde',async()=>{
 const load=runtime(),db=fixture(MONDAY,30);seed(db,[row('1',MONDAY)])
 db.tables.camino_calendar.push(partial('2',MONDAY,PARTIAL_EXAM))
 await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 const parcial=db.tables.camino_calendar.find(r=>r.id==='2')
 assert.equal(parcial.status,'unscheduled','no cabe en ningun dia de 30 minutos')
 assert.equal(parcial.start_time,null)
 // Y la leccion conserva su sitio: nada la desplaza, porque nada le quito el hueco.
 assert.equal(db.tables.camino_calendar.find(r=>r.id==='1').scheduled_date,MONDAY)
})

test('cambios sucesivos de disponibilidad conservan todas las misiones en dias validos',async()=>{
 const load=runtime(),db=fixture(MONDAY,60,2)
 seed(db,[row('1',MONDAY),row('2','2027-05-18'),row('3',WEDNESDAY)])
 const personalize=load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization
 const ctx=load('app/lib/camino/studentPlanContext.ts')
 const win=load('app/lib/camino/planWindow.ts')
 for (const weekly of [2,4,6,2]) {
  db.tables.billing_events[0].payload.weekly_study_days_value=weekly
  await personalize(user,db,{force:true})
  const context=await ctx.loadStudentPlanContext(user,db)
  const validas=new Set(win.planningDates(context,{includeFinalReviewWindow:true}))
  const activas=db.tables.camino_calendar.filter(r=>r.status==='pending')
  assert.equal(activas.length+db.tables.camino_calendar.filter(r=>r.status==='unscheduled').length,3,
   `con ${weekly} dias no se pierde ninguna mision`)
  for (const r of activas)
   assert.ok(validas.has(r.scheduled_date),`con ${weekly} dias, ${r.id} cayo en ${r.scheduled_date}, fuera del patron`)
 }
})

test('perder acceso recoloca el calendario: el hash no puede decir already_current',async()=>{
 // Regresion del fallo P1-a. La identidad de personalizacion usaba los dias
 // PEDIDOS, que no cambian al caducar el acceso. El hash salia identico, la
 // funcion respondia already_current y las misiones se quedaban en dias que
 // el alumno ya no tiene.
 const load=runtime(),db=fixture(MONDAY,60,7)
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'superpremium'}]
 seed(db,[row('1',MONDAY),row('2','2027-05-18'),row('3',WEDNESDAY),row('4','2027-05-20')])
 const personalize=load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization
 const primera=await personalize(user,db)
 assert.equal(primera.reason,'applied')
 // Sin cambiar nada, la segunda pasada si debe cortocircuitar.
 assert.equal((await personalize(user,db)).reason,'already_current')

 // Caduca el acceso: de 7 dias permitidos a 2. Lo guardado por el alumno (7)
 // no cambia; lo que su plan puede usar, si.
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'free'}]
 const tras=await personalize(user,db)
 assert.notEqual(tras.reason,'already_current','el recorte de acceso debe invalidar la personalizacion')
 assert.equal(tras.reason,'applied')

 const context=await load('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db)
 assert.equal(context.weeklyStudyDays,2,'el plan se calcula con los dias efectivos')
 assert.equal(context.requestedWeeklyStudyDays,7)
 assert.equal(context.availabilityExceedsAccess,true)
 const validas=new Set(load('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true}))
 for (const r of db.tables.camino_calendar.filter(x=>x.status==='pending'))
  assert.ok(validas.has(r.scheduled_date),`${r.id} quedo en ${r.scheduled_date}, fuera del patron de 2 dias`)
})
test('all occupied days preserve unscheduled work and clear its hours',async()=>{
 const load=runtime('2027-06-05'),db=fixture();seed(db,[row('1','2027-06-05','pending','review')])
 db.tables.billing_events.push({user_id:user,event_type:'camino_emergency_availability',payload:{accepted:true,exam_date:'2027-06-07'}})
 db.tables.camino_custom_events=[5,6].map(day=>({user_id:user,recurrence:'none',event_date:`2027-06-0${day}`,start_time:'00:00',end_time:'23:59'}))
 const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(result.unscheduledRows,1);assert.equal(db.tables.camino_calendar[0].start_time,null);assert.equal(db.tables.user_learning_queue[0].queue_status,'pending')
})
test('late entry needs consent; accepted exception survives personalization',async()=>{
 const load=runtime('2027-06-05'),db=fixture()
 const context=await load('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db)
 assert.equal(context.emergencyAvailability,true);assert.equal(context.emergencyAvailabilityAccepted,false)
 assert.equal(load('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true}).length,0)
 seed(db,[row('1','2027-06-05','pending','review'),row('2','2027-06-06','pending','review')])
 db.tables.billing_events.push({user_id:user,event_type:'camino_emergency_availability',payload:{accepted:true,exam_date:'2027-06-07'}})
 const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(result.updatedRows,2);assert.equal(result.unscheduledRows,0)
})
test('scheduler never exceeds the daily budget, even with hours free',()=>{
 const {DayScheduler}=runtime()('app/lib/camino/scheduleTimeSlot.ts')
 const day=new DayScheduler([],{start:'16:00',end:'22:00'},null,30)
 assert.ok(day.place(20));assert.equal(day.place(20),null);assert.ok(day.place(10));assert.equal(day.place(1),null)
})
test('failed preference reads stop planning instead of assuming availability',async()=>{
 const load=runtime(),db=fixture();db.failNext('perfiles')
 await assert.rejects(load('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db),/read failed/)
})
test('two concurrent runs for one student execute once, other students stay independent',async()=>{
 const {withPlanLock}=runtime()('app/lib/camino/planPersistence.ts'),db=fixture()
 let unblock; const barrier=new Promise(resolve=>{unblock=resolve});let runs=0
 const first=withPlanLock(db,user,async()=>{runs++;await barrier})
 await assert.rejects(withPlanLock(db,user,async()=>{runs++}),/actualizando/)
 await withPlanLock(db,'other',async()=>{runs++});unblock();await first
 assert.equal(runs,2);await withPlanLock(db,user,async()=>{runs++});assert.equal(runs,3)
})
test('failed execution releases lease for a safe retry',async()=>{
 const {withPlanLock}=runtime()('app/lib/camino/planPersistence.ts'),db=fixture()
 await assert.rejects(withPlanLock(db,user,async()=>{throw Error('crash')}),/crash/)
 assert.equal(await withPlanLock(db,user,async()=>42),42)
})
test('new student: generate actual curriculum, personalize, complete, ensure again',async()=>{
 const load=runtime('2027-05-17',{'app/lib/onboarding/hasCompletedOnboarding.ts':{hasCompletedOnboarding:async()=>false}})
 const db=fixture();db.tables.billing_events=[]
 const result=await load('app/lib/onboarding/generateCaminoPlan.ts').generateCaminoPlan({userId:user,db,subjects:['fisica'],startMode:'from_zero',studentExams:[],dailyMinutes:30,weeklyStudyDays:3})
 assert.equal(result.success,true)
 const active=db.tables.camino_calendar.filter(r=>r.status==='pending');assert.ok(active.length>0)
 assert.ok(active.every(r=>r.scheduled_date<'2027-06-07'))
 const done=active[0];done.status='completed';db.tables.user_learning_queue.find(q=>q.id===done.queue_id).queue_status='completed'
 db.tables.billing_events.push({user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:30,weekly_study_days_value:3}})
 const ensured=await load('app/lib/ensureCaminoCalendar.ts').ensureCaminoCalendar(user,db)
 assert.equal(ensured.ok,true)
 assert.equal(db.tables.camino_calendar.filter(r=>r.queue_id===done.queue_id&&r.status==='pending').length,0)
})

// ── Los avisos del plan sobreviven a la recarga y se retiran solos ───────
//
// El aviso no puede vivir solo en la respuesta de la ejecución diaria. Camino
// se prepara una vez al día: si el recorte solo viajara ahí, recargar la página
// por la tarde lo borraba con el problema intacto. Y al revés — si solo se
// avisara de la aparición, el aviso se quedaría encendido para siempre.

test('un recorte vigente se sigue devolviendo aunque hoy ya no se genere nada',async()=>{
 const load=runtime(),db=fixture(MONDAY,60,7)
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'free'}]
 seed(db,[row('1',MONDAY)])
 const notices=await load('app/lib/camino/planNotices.ts').collectPlanNotices(user,db)
 assert.ok(notices.availability,'el recorte no se comunica')
 assert.equal(notices.availability.requestedWeeklyStudyDays,7)
 assert.equal(notices.availability.effectiveWeeklyStudyDays,2)
 // No depende de haber ejecutado nada: es estado del plan, no de la ejecucion.
 const otraVez=await load('app/lib/camino/planNotices.ts').collectPlanNotices(user,db)
 assert.deepEqual(otraVez.availability,notices.availability)
})

test('resuelto el recorte, el aviso se retira',async()=>{
 const load=runtime(),db=fixture(MONDAY,60,7)
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'free'}]
 seed(db,[row('1',MONDAY)])
 const notices=load('app/lib/camino/planNotices.ts').collectPlanNotices
 assert.ok((await notices(user,db)).availability)
 // El alumno renueva: su acceso vuelve a dar para los 7 dias que pidio.
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'superpremium'}]
 const tras=await notices(user,db)
 assert.equal(tras.availability,null,'null es la respuesta que permite apagar el aviso')
 assert.equal([...tras.protectedConflicts].length,0)
})

test('caducar el acceso tras haber generado ese mismo dia obliga a replanificar',async()=>{
 // Sin esto, `already_ensured_today` dejaba el calendario en dias perdidos
 // hasta el dia siguiente: el retorno corto esquivaba la replanificacion.
 const load=runtime(),db=fixture(MONDAY,60,7)
 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'superpremium'}]
 seed(db,[row('1',MONDAY),row('2','2027-05-18'),row('3',WEDNESDAY),row('4','2027-05-20')])
 await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 const notices=load('app/lib/camino/planNotices.ts').collectPlanNotices
 assert.equal([...(await notices(user,db)).misplaced].length,0,'con su acceso, todo esta en su sitio')

 db.tables.user_entitlements=[{user_id:user,status:'active',plan_id:'free'}]
 const tras=await notices(user,db)
 assert.ok(tras.misplaced.length>0,'las misiones en dias que ya no tiene deben detectarse')
 assert.ok(tras.availability,'y el recorte debe poder contarse')
})

test('adelantar la PAU no toca las misiones que el alumno fijo',async()=>{
 const load=runtime(),db=fixture(MONDAY,60,3)
 const bloqueada={...row('lock','2027-06-08'),locked:true}
 const manual={...row('man','2027-06-09'),metadata:{manual_editor:true}}
 const normal=row('auto','2027-06-10')
 seed(db,[bloqueada,manual,normal])
 db.tables.camino_calendar=[bloqueada,manual,normal]
 // La PAU ya era el 07/06: las tres estan despues.
 const ensured=await load('app/lib/ensureCaminoCalendar.ts').ensureCaminoCalendar(user,db)
 const f=id=>db.tables.camino_calendar.find(r=>r.id===id)
 assert.equal(f('lock').status,'pending','una mision bloqueada no se desprograma sola')
 assert.equal(f('lock').scheduled_date,'2027-06-08','ni se mueve de fecha')
 assert.equal(f('man').status,'pending','ni una movida a mano')
 // La recolocable si sale del plan: el barrido la desprograma y la
 // reconciliacion la da por sustituida al recolocar su trabajo en fecha valida.
 assert.notEqual(f('auto').status,'pending','la recolocable no puede quedarse despues de la PAU')
 const recolocadas=db.tables.camino_calendar.filter(r=>r.status==='pending'&&r.scheduled_date<'2027-06-07')
 assert.ok(recolocadas.length>0,'su trabajo tiene que reaparecer en una fecha valida')
 assert.deepEqual([...ensured.protectedConflicts].sort(),['lock','man'],'y el conflicto se comunica')
})
