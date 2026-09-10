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
test('busy Monday moves work to Wednesday; daily budget includes partial missions',async()=>{
 const load=runtime(),db=fixture();seed(db,[row('1','2027-05-17')])
 db.tables.camino_calendar.push({...row('2','2027-05-17','pending','partial_practice'),queue_id:null,source:'partial'})
 const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 assert.equal(result.reason,'applied');assert.equal(db.tables.camino_calendar[0].scheduled_date,'2027-05-19')
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
