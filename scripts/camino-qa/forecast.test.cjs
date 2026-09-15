const { test } = require('node:test'), assert = require('node:assert/strict')
const { runtime, database } = require('./runtime.cjs')
const load = runtime('2027-01-11')
const { buildCoverageForecast: forecast } = load('app/lib/camino/coverageForecast.ts')
const base = load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-01-11',examDate:'2027-01-13',dailyMinutes:60,weeklyStudyDays:7,holidays:new Set()})
const ctx = {...base, planningCutoff:'2027-01-12'}
// Fixed-duration new content for budget/deadline tests; variable concept/review
// sessions are tested below against the real personalizer.
const q = (id, minutes=30, extra={}) => ({id,subject:'fisica',queue_status:'pending',metadata:{mission_type:'comment_text',estimated_minutes:minutes},...extra})
const row = (id, extra={}) => ({id,queue_id:null,subject:'fisica',scheduled_date:'2027-01-11',status:'pending',source:'algorithm',locked:false,mission_type:'concept',start_time:'16:00',end_time:'16:30',metadata:{},...extra})
test('forecast: queue and calendar share identity; completed work and retry remnants are not counted twice',()=>{
 const result=forecast(ctx,[row('placed',{queue_id:'q'}),row('old',{queue_id:'q',status:'missed'}),row('done',{queue_id:'done',status:'completed',scheduled_date:'2027-01-10'})],[q('q'),q('done',30,{queue_status:'completed'})],[])
 assert.equal(result.scheduledMinutes,30);assert.equal(result.pendingMinutes,0);assert.equal(result.atRiskMinutes,0)
})
test('forecast: final reserve is not available to new lessons',()=>{
 const result=forecast(ctx,[],[q('a',60),q('b',60)],[])
 assert.equal(result.totalCapacityMinutes,120);assert.equal(result.finalReviewCapacityMinutes,60)
 assert.equal(result.projectedPendingMinutes,60);assert.equal(result.atRiskMinutes,60)
})
test('forecast: a 45-minute partial cannot fit a 30-minute day, even with 60 total minutes',()=>{
 const result=forecast({...ctx,dailyMinutes:30},[row('p',{status:'unscheduled',mission_type:'partial_practice',source:'partial',start_time:null,end_time:null,metadata:{partial_exam_date:'2027-01-13'}})],[],[])
 assert.equal(result.pendingMinutes,45);assert.equal(result.projectedPendingMinutes,0);assert.equal(result.atRiskMinutes,45)
})
test('forecast: partial deadline applies before the PAU',()=>{
 const result=forecast(ctx,[row('fixed',{locked:true,end_time:'17:00'}),row('p',{status:'unscheduled',mission_type:'partial_practice',source:'partial',start_time:null,end_time:null,metadata:{partial_exam_date:'2027-01-12'}})],[],[])
 assert.equal(result.atRiskMinutes,45);assert.equal(result.projectedPendingMinutes,0)
})
test('forecast: custom events consume real slots and fragment the remaining time',()=>{
 const events=[{event_date:'2027-01-11',recurrence:'none',start_time:'16:20',end_time:'22:00'}]
 const result=forecast(ctx,[],[q('a',30)],events)
 assert.equal(result.totalCapacityMinutes,80);assert.equal(result.atRiskMinutes,30)
})
test('forecast: overlapping and recurring events are not double-counted',()=>{
 const events=[{event_date:'2027-01-01',recurrence:'weekly',day_of_week:0,recurrence_until:'2027-01-12',start_time:'16:00',end_time:'21:30'}, {event_date:'2027-01-11',recurrence:'none',start_time:'17:00',end_time:'21:00'}]
 assert.equal(forecast(ctx,[],[],events).totalCapacityMinutes,90)
})
test('forecast: completed work today consumes today without becoming pending work',()=>{
 const result=forecast(ctx,[row('done',{status:'completed',end_time:'17:00'})],[q('a')],[])
 assert.equal(result.totalCapacityMinutes,60);assert.equal(result.scheduledMinutes,0);assert.equal(result.atRiskMinutes,30)
})
test('forecast: protected conflicts and calendar overload remain visible',()=>{
 const result=forecast(ctx,[row('a',{locked:true,end_time:'17:00'}),row('b',{locked:true,start_time:'17:00',end_time:'17:30'})],[],[])
 assert.equal(result.scheduledMinutes,90);assert.equal(result.atRiskMinutes,30);assert.equal(result.protectedConflictMinutes,30)
})
test('forecast: missing subject data never looks like completed preparation',()=>{
 assert.deepEqual([...forecast(ctx,[],[],[],['fisica']).missingSubjects],['fisica'])
})
test('forecast: a scheduled queue entry without a calendar row still counts as work',()=>{
 assert.equal(forecast(ctx,[],[q('a',30,{queue_status:'scheduled'})],[]).pendingMinutes,30)
})
test('forecast: retry delay is respected',()=>{
 const result=forecast(ctx,[],[q('a',30,{retry_not_before:'2027-01-13'})],[])
 assert.equal(result.atRiskMinutes,30)
})
test('forecast loader paginates beyond 1000 items and errors do not become empty successful forecasts',async()=>{
 const db=database({perfiles:[{id:'u',subjects:['fisica'],pau_exam_date:'2027-06-07'}],billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:2}}],user_learning_queue:Array.from({length:1101},(_,i)=>({...q(String(i)),user_id:'u'}))})
 const loader=load('app/lib/camino/loadCoverageForecast.ts').loadCoverageForecast
 const result=await loader('u',db);assert.equal(result.pendingMinutes,1101*30)
 db.failNext('user_learning_queue');await assert.rejects(loader('u',db),/injected_write_failure/)
})
test('notice invariants include partial deadline and the final review window',async()=>{
 const db=database({perfiles:[{id:'u',pau_exam_date:'2027-01-20'}],billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:2}}],camino_calendar:[{...row('late-partial',{source:'partial',scheduled_date:'2027-01-14',metadata:{partial_exam_date:'2027-01-13'}}),user_id:'u'},{...row('late-concept',{scheduled_date:'2027-01-18'}),user_id:'u'}]})
 const notices=await load('app/lib/camino/planNotices.ts').collectPlanNotices('u',db)
 assert.deepEqual([...notices.misplaced].sort(),['late-concept','late-partial'])
})
test('public beta source reports Premium and six days',()=>{
 const access=load('app/lib/camino/studyAccess.ts').resolveStudyAccess([{plan_id:'premium',status:'active',source:'auto_promo_beta'}])
 assert.equal(access.beta,true);assert.equal(access.maxStudyDaysPerWeek,6)
})
test('reorganization obeys daily capacity and the same study-day window',async()=>{
 const db=database({billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:60}}],camino_calendar:[{...row('occupied',{end_time:'17:00'}),user_id:'u'}]})
 const scheduler=load('app/lib/camino/scheduleTimeSlot.ts')
 const result=await scheduler.placeBestAcrossDates('u',db,['2027-01-11','2027-01-12'],30,{planContext:{...ctx,planningCutoff:'2027-01-13'},behaviorProfile:null,context:{missionType:'concept'}})
 assert.equal(result.date,'2027-01-12','Monday already consumed its 60-minute budget')
 const late=await scheduler.placeBestAcrossDates('u',db,['2027-01-12'],30,{planContext:ctx,behaviorProfile:null,context:{missionType:'concept'}})
 assert.equal(late,null,'new content cannot consume the final reserve')
})
test('actual ensure HTTP handler: same-day invalid placement does not bypass replan',async()=>{
 const user='http-user', db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:[]}],billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:7}}],camino_ensure_log:[{user_id:user,last_ensured_day:'2027-01-11'}],camino_calendar:[{...row('invalid',{scheduled_date:'2027-01-12',mission_type:'review'}),user_id:user}]})
 const runtimeLoad=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'test'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })
 const response=await runtimeLoad('app/api/camino/ensure-calendar/route.ts').POST({json:async()=>({})})
 const body=await response.json()
 assert.equal(response.status,200);assert.equal(body.skipped,undefined);assert.equal(body.availability.effectiveWeeklyStudyDays,2)
 const again=await runtimeLoad('app/api/camino/ensure-calendar/route.ts').POST({json:async()=>({})})
 const next=await again.json();assert.equal(next.skipped,'already_ensured_today');assert.equal(next.availability.effectiveWeeklyStudyDays,2)
})

function assertPartition(result) {
 assert.equal(result.validScheduledMinutes + result.projectedPendingMinutes + result.atRiskMinutes,
  result.scheduledMinutes + result.pendingMinutes, 'every minute belongs to exactly one displayed category')
 // Decir "se salen 11,3 h" sin decir CUÁLES es el diagnóstico que llevaba a
 // recomendar quitar temario ante un simple solape. Cada minuto en riesgo
 // tiene que venir con la actividad concreta y su causa.
 assert.equal(result.riskItems.reduce((sum, item) => sum + item.minutes, 0), result.atRiskMinutes,
  'every at-risk minute names the activity and the cause behind it')
 for (const item of result.riskItems) assert.ok(item.reason && item.subject, 'a risk item without a cause explains nothing')
 for (const subject of result.subjects) {
  assert.equal(subject.scheduledMinutes - subject.scheduledAtRiskMinutes + subject.projectedPendingMinutes + subject.atRiskMinutes,
   subject.scheduledMinutes + subject.pendingMinutes)
 }
}
test('forecast: scheduled conflicts occupy one category, never two',()=>{
 const result=forecast(ctx,[row('a',{locked:true,end_time:'17:00'}),row('b',{locked:true,start_time:'17:00',end_time:'17:30'})],[q('review',20,{metadata:{mission_type:'pau_practice',estimated_minutes:20}})],[])
 assert.equal(result.scheduledMinutes,90)
 assert.equal(result.validScheduledMinutes,60)
 assert.equal(result.scheduledAtRiskMinutes,30)
 assert.equal(result.projectedPendingMinutes,20)
 assertPartition(result)
})
// Same six 20-minute activities at every availability setting: more daily
// time may fit more work, but cannot inflate the workload of these activities.
for (const minutes of [30,45,60,90,150,180]) {
 for (const type of ['concept','review']) test(`content duration and actual placement agree: ${minutes} minutes, ${type}`,async()=>{
  const context=load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:ctx.today,examDate:'2027-01-17',dailyMinutes:minutes,weeklyStudyDays:7,holidays:new Set()})
  const work=Array.from({length:6},(_,i)=>q(`q-${i}`,0,{metadata:{mission_type:type,content_estimated_minutes:20}}))
  const before=forecast(context,[],work,[])
  assert.equal(before.pendingMinutes,120,'workload cannot grow with availability')
  const db=database({perfiles:[{id:'u',pau_exam_date:context.examDate}],
   billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:minutes,weekly_study_days_value:7}}],
   user_learning_queue:work.map(q=>({...q,user_id:'u'})),
   camino_calendar:work.map((q,i)=>({...row(`c-${i}`,{queue_id:q.id,mission_type:type,metadata:q.metadata}),user_id:'u'})),
  })
  const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization('u',db,{planContext:context})
  assert.equal(result.reason,'applied')
  const placed=db.tables.camino_calendar.filter(r=>r.status==='pending')
  assert.ok(placed.every(r=>r.metadata.estimated_minutes===20))
  assert.equal(placed.length+result.unscheduledRows,6)
  const perDay=new Map()
  for(const r of placed) perDay.set(r.scheduled_date,(perDay.get(r.scheduled_date)||0)+20)
  assert.ok([...perDay.values()].every(value=>value<=minutes))
  const after=forecast(context,db.tables.camino_calendar,db.tables.user_learning_queue,[])
  assert.equal(after.scheduledMinutes,before.projectedPendingMinutes)
  assert.equal(after.atRiskMinutes,before.atRiskMinutes)
  assert.equal(after.scheduledMinutes+after.pendingMinutes,120)
  assertPartition(before);assertPartition(after)
 })
}
test('forecast: existing automatic, completed and manual work all consume minutes without resizing new work',()=>{
 const concept=q('c',0,{metadata:{mission_type:'concept'}})
 // La sesion de estudio mide lo que reparte el dia declarado: con 60 min al
 // dia son 30, no 25 fijos (ver dailyTimeCapacity.sessionSlotsForMinutes).
 const withFirst=forecast(ctx,[row('a',{end_time:'16:30'})],[concept],[])
 assert.equal(withFirst.projectedPendingMinutes,30);assert.equal(withFirst.atRiskMinutes,0)
 for(const extra of [{source:'manual'},{locked:true},{status:'completed'}]) {
  const result=forecast(ctx,[row('a',{end_time:'16:25',...extra})],[concept],[])
  assert.equal(result.projectedPendingMinutes,30);assert.equal(result.atRiskMinutes,0)
  assertPartition(result)
 }
})
test('forecast: three short activities fit when their total fits, without a session-count cap',()=>{
 const result=forecast(ctx,[],[q('a',10),q('b',10),q('c',10)],[])
 assert.equal(result.projectedPendingMinutes,30);assert.equal(result.atRiskMinutes,0)
 assertPartition(result)
})
test('forecast: an unscheduled lesson forgets old hours and adapts to the current session length',()=>{
 const result=forecast(ctx,[row('a',{status:'unscheduled',end_time:'19:00',metadata:{estimated_minutes:180,camino_personalization:{version:'calendar_personalization_v5'}}})],[],[])
 assert.equal(result.pendingMinutes,30);assert.equal(result.projectedPendingMinutes,30);assert.equal(result.atRiskMinutes,0)
 assertPartition(result)
})
test('forecast: an unplaced session keeps an explicit estimate, with no lost minutes',()=>{
 const result=forecast(ctx,[],['a','b','c'].map(id=>q(id,0,{metadata:{mission_type:'concept'}})),[])
 // Dos sesiones llenan el dia ENTERO (30+30=60). Antes entraban dos de 25 y
 // los 10 minutos sobrantes no le valian a nadie: eso es lo que sumaba horas
 // de "no cabe" sobre un curso completo.
 assert.equal(result.projectedPendingMinutes,60);assert.equal(result.atRiskMinutes,30)
 assert.equal(result.pendingMinutes,90);assertPartition(result)
 // Capacidad total 120 min (dos dias), trabajo 90: de tiempo va sobrado. Lo
 // que deja fuera la tercera sesion es la reserva de repaso final, que el
 // temario nuevo no cruza — encaje, no volumen. Sumar horas no lo arregla.
 assert.equal(result.deficitMinutes,0,'hay tiempo de sobra: esto no es un deficit')
 assert.equal(result.unfitMinutes,30,'no encaja, que es otro problema')
})

// End-to-end orchestration with the beta curriculum shipped in the repository.
// Supabase is in-memory here; these tests do not certify the production catalog.
// Nueve asignaturas es el caso real que rompia el modelo anterior: con un tope
// de misiones por dia, mas tiempo declarado no compraba mas temario cubierto.
// Todas las que el onboarding sabe generar (ALLOWED_GENERATE_SUBJECTS).
const JOURNEY_SUBJECTS=['matematicas_ii','fisica','lengua','historia_espana','ingles','quimica','matematicas_ccss','historia_filosofia','economia','biologia']
// Filas publicadas de las asignaturas sin fallback estatico, tomadas del
// catalogo real: la identidad de un tema es (block_slug, v2_sort_order), asi
// que inventarlas aqui no las haria coincidir con nada.
const JOURNEY_PUBLISHED=['ingles','historia_filosofia','economia','biologia'].flatMap(subject=>
 load('app/lib/camino/caminoCurriculumPlan.ts').CAMINO_CURRICULUM_TOPICS
  .filter(topic=>topic.subject===subject&&topic.v2SortOrder)
  .map(topic=>({subject,block_key:topic.blockTitle,block_slug:topic.blockSlug,sort_order:topic.v2SortOrder,title:topic.title,review_status:'published'})))
for (const [today, count, minutes] of [['2026-09-14',6,90],['2027-01-11',4,60],['2027-05-31',6,90],['2027-06-05',4,60],['2026-09-14',10,180],['2027-05-31',9,180]]) {
 test(`generate → personalize → read → forecast: ${today}, ${count} subjects`,async()=>{
  const user='journey', examDate='2027-06-07'
  const subjects=JOURNEY_SUBJECTS.slice(0,count)
  const weekly=Math.min(count,7)
  const journey=runtime(today,{'app/lib/onboarding/hasCompletedOnboarding.ts':{hasCompletedOnboarding:async()=>false}})
  const partialDate=today<'2027-05-01' ? today.slice(0,8)+'25' : '2027-06-06'
  const exams=[{id:'exam',subject:'fisica',date:partialDate,name:'Parcial',block:'Repaso general',topic:'',priority:'normal'}]
  const db=database({perfiles:[{id:user,subjects,pau_exam_date:examDate,student_exams:exams}],
   user_entitlements:[{user_id:user,plan_id:'premium',status:'active',source:'auto_promo_beta'}],
   // Titles/keys follow 20260901090000; publication follows 20260904093000.
   curriculum_content_v2:JOURNEY_PUBLISHED,
  })
  const generated=await journey('app/lib/onboarding/generateCaminoPlan.ts').generateCaminoPlan({userId:user,db,subjects,startMode:'from_zero',studentExams:exams,dailyMinutes:minutes,weeklyStudyDays:weekly})
  assert.equal(generated.success,true)
  assert.ok(generated.missions.length>0,'onboarding returns actual calendar missions')
  assert.equal(generated.skippedSubjects.length,0)
  for (const name of subjects) assert.ok(db.tables.user_learning_queue.some(q=>q.subject===name),`${name} must have curriculum work`)
  const pref={user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:minutes,weekly_study_days_value:weekly}}
  db.tables.billing_events.push(pref)
  const queueIds=new Set(db.tables.user_learning_queue.map(q=>q.id))
  const durations=journey('app/lib/camino/missionDuration.ts')
  for (const [days, daily, target] of [[weekly,minutes,examDate],[2,30,examDate],[6,90,examDate],[4,60,'2027-06-06']]) {
   pref.payload={daily_minutes:daily,weekly_study_days_value:days}
   db.tables.perfiles[0].pau_exam_date=target
   const personalize=await journey('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
   assert.notEqual(personalize.reason,'error')
   const context=await journey('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db)
   const valid=new Set(journey('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true}))
   const perDay=new Map()
   for (const r of db.tables.camino_calendar.filter(r=>['pending','postponed'].includes(r.status))) {
    assert.ok(valid.has(r.scheduled_date),`${r.id} outside effective availability`)
    assert.ok(r.scheduled_date<target)
    if(r.source==='partial') assert.ok(r.scheduled_date<r.metadata.partial_exam_date)
    else if(r.mission_type==='concept'||r.mission_type==='comment_text') assert.ok(r.scheduled_date<context.planningCutoff)
    const day=perDay.get(r.scheduled_date)||[];day.push(r);perDay.set(r.scheduled_date,day)
   }
   for(const rows of perDay.values()) {
    assert.ok(rows.reduce((sum,r)=>sum+durations.estimatedMinutesForMission(r),0)<=daily,'all missions share the daily budget')
    rows.sort((a,b)=>a.start_time.localeCompare(b.start_time))
    for(let i=1;i<rows.length;i++) assert.ok(rows[i].start_time>=rows[i-1].end_time,'missions cannot overlap')
   }
   assert.deepEqual(new Set(db.tables.user_learning_queue.map(q=>q.id)),queueIds,'availability changes cannot erase curriculum')
   const before=JSON.stringify(db.tables)
   const result=await journey('app/lib/camino/loadCoverageForecast.ts').loadCoverageForecast(user,db)
   assert.equal(JSON.stringify(db.tables),before,'reading the forecast cannot mutate the plan')
   assert.equal(result.missingSubjects.length,0)
   assert.equal(result.scheduledAtRiskMinutes,0,'the forecast must accept the valid calendar just produced')
   assertPartition(result)
   if(today>='2027-05-31') assert.ok(result.atRiskMinutes>0,'late entry cannot promise all pending curriculum fits')
  }
 })
}

test('onboarding reports a selected subject with no published curriculum or fallback',async()=>{
 const journey=runtime('2027-01-11',{'app/lib/onboarding/hasCompletedOnboarding.ts':{hasCompletedOnboarding:async()=>false}})
 const db=database({perfiles:[{id:'u',subjects:['fisica','ingles'],pau_exam_date:'2027-06-07'}]})
 const result=await journey('app/lib/onboarding/generateCaminoPlan.ts').generateCaminoPlan({userId:'u',db,subjects:['fisica','ingles'],startMode:'from_zero',studentExams:[],dailyMinutes:60,weeklyStudyDays:2})
 assert.equal(result.success,true);assert.deepEqual([...result.skippedSubjects],['ingles'])
 const projection=await journey('app/lib/camino/loadCoverageForecast.ts').loadCoverageForecast('u',db)
 assert.deepEqual([...projection.missingSubjects],['ingles'])
})

for (const minutes of [30,45,60,90]) test(`forecast and placement share partial budget: ${minutes} minutes`,async()=>{
 const context={...ctx,dailyMinutes:minutes}
 const calendar=[row('lesson',{queue_id:'lesson-q',status:'unscheduled',start_time:null,end_time:null}),
  row('exam',{source:'partial',mission_type:'partial_practice',status:'unscheduled',start_time:null,end_time:null,metadata:{partial_exam_date:'2027-01-12'}})]
 const queue=[q('lesson-q',0,{metadata:{mission_type:'concept'}})]
 const before=forecast(context,calendar,queue,[])
 const db=database({perfiles:[{id:'u',pau_exam_date:context.examDate}],
  billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:minutes,weekly_study_days_value:7}}],
  camino_calendar:calendar.map(r=>({...r,user_id:'u'})),user_learning_queue:queue.map(q=>({...q,user_id:'u'}))})
 const placed=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization('u',db,{planContext:context})
 assert.equal(placed.reason,'applied')
 const after=forecast(context,db.tables.camino_calendar,db.tables.user_learning_queue,[])
 assert.equal(before.projectedPendingMinutes,after.scheduledMinutes)
 assert.equal(before.atRiskMinutes,after.atRiskMinutes)
 assert.equal(after.scheduledAtRiskMinutes,0)
 assertPartition(before);assertPartition(after)
})

test('overview uses one availability snapshot and recovers after a failed read',async()=>{
 const user='snapshot',db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:['fisica']}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:7}}],
  user_learning_queue:[{...q('snapshot-q'),user_id:user}]})
 const counts=new Map(),from=db.from.bind(db)
 db.from=table=>{counts.set(table,(counts.get(table)||0)+1);return from(table)}
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'test'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/plan-overview/route.ts')
 const response=await api.GET({})
 assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'private, no-store')
 const body=await response.json()
 assert.equal(body.notices.availability.effectiveWeeklyStudyDays,body.forecast.weeklyStudyDays)
 assert.equal(counts.get('user_entitlements'),1,'access must be read once for both notices and forecast')
 assert.equal(counts.get('billing_events'),2,'one preferences read and one emergency availability read')
 db.failNext('perfiles')
 assert.equal((await api.GET({})).status,503,'read failure is not a successful empty plan')
 assert.equal((await api.GET({})).status,200,'the next request can recover without a poisoned cache')
})

test('150 concurrent overview requests keep each student’s work and access isolated',async()=>{
 const users=Array.from({length:150},(_,i)=>`beta-student-${i}`)
 const db=database({
  perfiles:users.map((id,i)=>({id,pau_exam_date:'2027-06-07',subjects:[i%2?'quimica':'fisica']})),
  billing_events:users.map((id,i)=>({user_id:id,event_type:'onboarding_completed',payload:{daily_minutes:i%2?90:60,weekly_study_days_value:i%2?6:2}})),
  user_entitlements:users.map((id,i)=>({user_id:id,plan_id:i%2?'premium':'free',status:'active',source:i%2?'auto_promo_beta':null})),
  user_learning_queue:users.flatMap((id,i)=>Array.from({length:i%7+1},(_,j)=>({...q(`${id}-q${j}`,10,{subject:i%2?'quimica':'fisica'}),user_id:id}))),
 })
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async request=>({user:{id:request.testUserId},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/plan-overview/route.ts')
 const responses=await Promise.all(users.map(testUserId=>api.GET({testUserId})))
 for(const [i,response] of responses.entries()) {
  assert.equal(response.status,200)
  const body=await response.json()
  assert.equal(body.userId,users[i]);assert.equal(body.forecast.pendingMinutes,(i%7+1)*10)
  assert.equal(body.forecast.dailyMinutes,i%2?90:60)
  assert.equal(body.forecast.weeklyStudyDays,i%2?6:2)
  assert.deepEqual(body.forecast.subjects.map(s=>s.subject),[i%2?'quimica':'fisica'])
  assert.equal(body.notices.availability,null)
  assertPartition(body.forecast)
 }
 // Real route and planning modules, simulated auth and DB. This proves
 // concurrent isolation, not Vercel/Postgres throughput for 150 real users.
})
// El remedio: no basta con decir cuánto se sale, hay que decir qué tocar. Cada
// cifra sale de resimular el mismo Camino con otra disponibilidad, así que lo
// que se comprueba es que sea el ajuste MÁS PEQUEÑO que de verdad lo cubre.
const long = load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-05-11',examDate:'2027-06-07',dailyMinutes:30,weeklyStudyDays:3,holidays:new Set()})
test('forecast: el remedio nombra el ajuste mas pequeno que cubre todo, por tiempo diario y por dias',()=>{
 const result=forecast(long,[],Array.from({length:10},(_,i)=>q('x'+i,30)),[])
 assert.ok(result.atRiskMinutes>0)
 assert.equal(result.remedy.dailyMinutesNeeded,60)
 assert.equal(result.remedy.weeklyStudyDaysNeeded,4)
 // Y el ajuste que propone tiene que bastar de verdad, cada uno por su cuenta.
 const withMinutes=forecast({...long,dailyMinutes:60},[],Array.from({length:10},(_,i)=>q('x'+i,30)),[])
 assert.equal(withMinutes.atRiskMinutes,0)
 // Subir los dias tambien mueve el corte del repaso final, que se mide en dias
 // de estudio: reproducirlo a mano sin moverlo no seria el mismo escenario.
 const capacity=load('app/lib/camino/studyCapacity.ts')
 const four={...long,weeklyStudyDays:4,studyDayIndexes:capacity.studyDayIndexesFor(4),
  planningCutoff:capacity.planningCutoffDate(long.today,long.examDate,load('app/lib/camino/examDate.ts').FINAL_REVIEW_RESERVED_STUDY_DAYS,{weeklyStudyDays:4,holidays:long.holidays})}
 assert.equal(forecast(four,[],Array.from({length:10},(_,i)=>q('x'+i,30)),[]).atRiskMinutes,0)
})
test('forecast: sin riesgo no hay remedio; lo que no cabe ni al maximo se dice como deficit',()=>{
 assert.equal(forecast(ctx,[],[q('a',30)],[]).remedy,null)
 const impossible=forecast(long,[],Array.from({length:200},(_,i)=>q('x'+i,30)),[])
 assert.equal(impossible.remedy.dailyMinutesNeeded,null)
 assert.equal(impossible.remedy.weeklyStudyDaysNeeded,null)
 assert.equal(impossible.deficitMinutes,impossible.scheduledMinutes+impossible.pendingMinutes-impossible.totalCapacityMinutes)
})
test('forecast: las reservas fijas en conflicto se cuentan aparte, porque ningun ajuste las recoloca',()=>{
 const result=forecast(ctx,[row('a',{locked:true,end_time:'17:00'}),row('b',{locked:true,start_time:'17:00',end_time:'17:30'})],[],[])
 assert.equal(result.remedy.manualMinutes,30)
 assert.equal(result.remedy.manualMinutes,result.protectedConflictMinutes)
})

// El aviso "no cabe ni con el maximo" era falso: probaba subir minutos y subir
// dias por separado, nunca los dos a la vez. Con 40 lecciones de 30 min, ni 180
// min/dia a 3 dias ni 30 min/dia a 7 dias bastan — 60 min/dia x 7 dias si.
test('forecast: un cambio combinado de minutos y dias se propone antes de declarar imposible',()=>{
 const work=Array.from({length:40},(_,i)=>q('x'+i,30))
 const result=forecast(long,[],work,[])
 assert.ok(result.atRiskMinutes>0)
 assert.equal(result.remedy.dailyMinutesNeeded,null,'ningun cambio de minutos por si solo basta')
 assert.equal(result.remedy.weeklyStudyDaysNeeded,null,'ningun cambio de dias por si solo basta')
 assert.equal(result.remedy.combinedChange.dailyMinutes,60)
 assert.equal(result.remedy.combinedChange.weeklyStudyDays,7)
 // Y ese cambio combinado tiene que caber DE VERDAD al resimularlo entero:
 // subir los dias tambien mueve el corte del repaso final.
 const capacity=load('app/lib/camino/studyCapacity.ts')
 const combined={...long,dailyMinutes:60,weeklyStudyDays:7,studyDayIndexes:capacity.studyDayIndexesFor(7),
  planningCutoff:capacity.planningCutoffDate(long.today,long.examDate,load('app/lib/camino/examDate.ts').FINAL_REVIEW_RESERVED_STUDY_DAYS,{weeklyStudyDays:7,holidays:long.holidays})}
 assert.equal(forecast(combined,[],work,[]).atRiskMinutes,0)
 assertPartition(result)
})
test('forecast: lo que no cabe ni con la disponibilidad maxima se dice como tal',()=>{
 const impossible=forecast(long,[],Array.from({length:200},(_,i)=>q('x'+i,30)),[])
 assert.equal(impossible.remedy.combinedChange,null)
 assert.ok(impossible.remedy.maxAvailabilityAtRiskMinutes>0,'con 180 min y 7 dias sigue sin caber')
 assert.equal(impossible.remedy.replanRecommended,false)
})
// El solape es el caso que la comprobacion previa de already_current no veia:
// las dos filas tienen fecha valida, asi que revisar fechas las daba por buenas
// mientras la prevision seguia marcando trabajo en riesgo.
test('un solape entre misiones automaticas con fecha valida sigue siendo trabajo a recolocar',async()=>{
 const meta={duration_model:'content_v1'}
 const db=database({perfiles:[{id:'u',pau_exam_date:'2027-06-07'}],
  billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:7}}],
  camino_calendar:[{...row('a',{metadata:meta}),user_id:'u'},{...row('b',{start_time:'16:20',end_time:'16:50',metadata:meta}),user_id:'u'}]})
 const notices=await load('app/lib/camino/planNotices.ts').collectPlanNotices('u',db)
 assert.deepEqual([...notices.misplaced],['b'],'revisar solo fechas dejaba el solape invisible para siempre')
})
test('forecast: el solape se nombra como conflicto de hueco, no como falta de horas',()=>{
 const result=forecast(ctx,[row('a'),row('b',{start_time:'16:20',end_time:'16:50'})],[],[])
 const risk=result.riskItems.find(item=>item.id==='b')
 assert.equal(risk.reason,'occupied_time')
 assert.equal(risk.automatic,true,'es trabajo que Camino si puede recolocar')
 assert.equal(result.remedy.replanRecommended,true,'con recolocar basta: no hay que quitar temario')
 // Un solape NO es falta de horas: el deficit es cero y lo que no encaja se
 // cuenta aparte, para no proponer "estudia mas" donde basta recolocar.
 assert.equal(result.deficitMinutes,0)
 assert.equal(result.unfitMinutes,result.atRiskMinutes)
})

// Tres listas que TIENEN que decir lo mismo: lo que el alumno puede elegir, lo
// que el generador acepta y lo que la base de datos deja insertar. Biologia
// estaba solo en la primera, asi que se elegia, no se generaba y nadie veia un
// error: el onboarding terminaba "con exito" y sin una sola mision suya.
test('las asignaturas elegibles, las generables y las que acepta la cola son la misma lista',()=>{
 const elegibles=[...load('app/lib/camino/betaCurriculum.ts').PRIVATE_BETA_SUBJECTS].sort()
 const generables=[...load('app/lib/onboarding/generateCaminoPlan.ts').ALLOWED_GENERATE_SUBJECTS].sort()
 assert.deepEqual(generables,elegibles,'una asignatura elegible que el generador no acepta se descarta en silencio')
 const fs=require('node:fs'), path=require('node:path')
 const dir=path.join(__dirname,'..','..','supabase','migrations')
 const ultima=fs.readdirSync(dir).sort()
  .filter(name=>fs.readFileSync(path.join(dir,name),'utf8').includes('add constraint user_learning_queue_subject_check')).pop()
 const bloque=fs.readFileSync(path.join(dir,ultima),'utf8').split('add constraint user_learning_queue_subject_check').pop()
 const permitidas=[...bloque.slice(0,bloque.indexOf(')')).matchAll(/'([a-z_]+)'/g)].map(m=>m[1]).sort()
 assert.deepEqual(permitidas,elegibles,`${ultima} no acepta las mismas asignaturas que el generador`)
})


for (const occupiedDays of [1,30]) test(`ensure fills unused minutes even with ${occupiedDays} occupied future days`,async()=>{
 const journey=runtime('2027-01-11'),user='fill'
 const context=journey('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-01-11',examDate:'2027-06-07',dailyMinutes:180,weeklyStudyDays:6})
 const dates=journey('app/lib/camino/planWindow.ts').planningDates(context).slice(0,occupiedDays)
 const calendar=dates.map((date,i)=>({...row(`existing-${i}`,{scheduled_date:date,queue_id:`existing-q${i}`,end_time:'16:20',metadata:{content_estimated_minutes:20,duration_model:'content_v1'}}),user_id:user,v2_sort_order:100+i}))
 const work=Array.from({length:8},(_,i)=>({...q(`new-${i}`,20,{metadata:{mission_type:'concept',content_estimated_minutes:20}}),user_id:user,title:`Tema ${i}`,v2_sort_order:i+1,subject_position:i}))
 const db=database({perfiles:[{id:user,subjects:['fisica'],pau_exam_date:context.examDate,student_exams:[]}],
  user_entitlements:[{user_id:user,status:'active',plan_id:'premium'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:6}}],
  camino_calendar:calendar,user_learning_queue:[...calendar.map(r=>({...q(r.queue_id,20,{queue_status:'scheduled'}),user_id:user,v2_sort_order:r.v2_sort_order})),...work]})
 const result=await journey('app/lib/ensureCaminoCalendar.ts').ensureCaminoCalendar(user,db)
 assert.equal(result.ok,true)
 // El temario ya NO se apelmaza contra el primer día disponible: el ritmo
 // (camino/contentPace.ts) lo reparte para que el curso llegue entero a la
 // PAU en vez de agotarse en ocho semanas. Lo que este caso sigue
 // garantizando es que un día ya ocupado no bloquea la siembra y que no se
 // pierde ni un tema.
 const est=journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission
 const seeded=db.tables.camino_calendar.filter(r=>r.status==='pending'&&work.some(w=>w.id===r.queue_id))
 // Nada se pierde: lo que no recibe fecha en este horizonte sigue pendiente
 // en la cola, nunca desaparece ni se marca como programado en falso.
 assert.equal(seeded.length+db.tables.user_learning_queue.filter(r=>r.queue_status==='pending').length,work.length)
 for(const r of seeded) assert.ok(r.start_time&&r.end_time,'un tema colocado sin hora es un tema sin sitio real')
 // Y lo que sí la recibe se REPARTE. Apelmazar los ocho temas en el primer
 // día es exactamente lo que vaciaba el resto del curso.
 if(seeded.length>1) assert.ok(new Set(seeded.map(r=>r.scheduled_date)).size>1,'el temario no puede apelmazarse en un solo dia')
 const monday=db.tables.camino_calendar.filter(r=>r.scheduled_date===dates[0]&&r.status==='pending')
 monday.sort((a,b)=>a.start_time.localeCompare(b.start_time))
 for(let i=1;i<monday.length;i++) assert.ok(monday[i].start_time>=monday[i-1].end_time)
 assert.equal(new Set(monday.map(r=>r.queue_id)).size,monday.length)
 for(const date of new Set(db.tables.camino_calendar.filter(r=>r.status==='pending').map(r=>r.scheduled_date))){
  const total=db.tables.camino_calendar.filter(r=>r.scheduled_date===date&&r.status==='pending').reduce((sum,r)=>sum+est(r),0)
  assert.ok(total<=180,`${date} se pasa del presupuesto declarado`)
 }
 // Con un solo dia ocupado, los dias libres del horizonte sí reciben temario.
 if(occupiedDays===1) assert.ok(seeded.length===work.length,'con horizonte libre no puede quedarse temario sin fecha')
})

for (const damage of ['overlap','budget']) test(`personalization repairs same-hash ${damage} without force and preserves manual work`,async()=>{
 const user='repair', context={...ctx,examDate:'2027-06-07',planningCutoff:'2027-05-31'}
 const db=database({perfiles:[{id:user,pau_exam_date:context.examDate}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:7}}],
  camino_calendar:[row('a'),row('b'),row('z-manual',{locked:true,scheduled_date:'2027-01-12'})].map(r=>({...r,user_id:user,metadata:{content_estimated_minutes:40}}))})
 const personalize=load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization
 assert.equal((await personalize(user,db,{planContext:context})).reason,'applied')
 const manual=JSON.stringify(db.tables.camino_calendar.find(r=>r.locked))
 const [a,b]=['a','b'].map(id=>db.tables.camino_calendar.find(r=>r.id===id))
 b.scheduled_date=a.scheduled_date
 b.start_time=damage==='overlap'?a.start_time:a.end_time
 b.end_time=damage==='overlap'?a.end_time:'18:00'
 const result=await personalize(user,db,{planContext:context})
 assert.equal(result.reason,'applied','matching preferences cannot conceal invalid placements')
 assert.equal(forecast(context,db.tables.camino_calendar,[],[],[],{withRemedy:false}).scheduledAtRiskMinutes,0)
 assert.equal(JSON.stringify(db.tables.camino_calendar.find(r=>r.locked)),manual)
 assert.equal((await personalize(user,db,{planContext:context})).reason,'already_current')
})

test('forecast recommendations never exceed beta access and an expired partial is not an annual deficit',()=>{
 const result=forecast({...long,accessMaxStudyDaysPerWeek:6},[],Array.from({length:40},(_,i)=>q(`access-${i}`,30)),[])
 assert.ok(result.remedy.combinedChange)
 assert.ok(result.remedy.combinedChange.weeklyStudyDays<=6)
 const expired=forecast({...long,today:'2027-01-11',planningCutoff:'2027-05-31',dailyMinutes:180},[
  row('expired',{status:'unscheduled',source:'partial',mission_type:'partial_practice',metadata:{partial_exam_date:'2027-01-10'}})
 ],[],[])
 assert.equal(expired.riskItems[0].reason,'partial_deadline')
 // Un plazo vencido no es falta de horas al año: deficit cero, y los minutos
 // se cuentan como lo que son, trabajo que ya no encaja en ningun sitio.
 assert.equal(expired.deficitMinutes,0)
 assert.equal(expired.unfitMinutes,expired.atRiskMinutes)
 assert.equal(expired.remedy.replanRecommended,false)
 assert.equal(expired.remedy.combinedChange,null)
})

test('scheduled reference durations remain labelled as estimates',()=>{
 const result=forecast(ctx,[row('reference',{end_time:'16:25',metadata:{duration_model:'content_v1',duration_source:'reference',content_estimated_minutes:25}})],[],[])
 assert.equal(result.scheduledMinutes,25)
 assert.equal(result.estimatedItems,1,'a scheduled slot is not an empirically measured learning duration')
})


// El caso de la captura: cuatro asignaturas, 60 min al dia, 6 dias a la
// semana, y una previsión que anunciaba ~100 h "fuera". Eran DOS problemas
// sumados bajo una etiqueta, y la salida que ofrecia la tarjeta —subir horas—
// no atacaba ninguno del todo.
test('las sesiones embaldosan el dia: ningun presupuesto declarado pierde minutos',()=>{
 const { sessionSlotsForMinutes, VALID_DAILY_MINUTES }=load('app/lib/camino/dailyTimeCapacity.ts')
 for(const minutes of VALID_DAILY_MINUTES){
  const slots=sessionSlotsForMinutes(minutes)
  assert.equal(slots.reduce((sum,value)=>sum+value,0),minutes,`${minutes} min al dia tiene que repartirse entero`)
  assert.ok(slots.every(value=>value>=20&&value<=45),`sesiones de ${minutes} fuera de rango: ${slots}`)
 }
})

test('lo que no cabe se parte en volumen y encaje, que no se arreglan igual',()=>{
 // Tiempo de sobra y aun asi hay trabajo fuera: es encaje (la reserva de
 // repaso final), no deficit. Proponer mas horas aqui seria mentir.
 const soloEncaje=forecast(ctx,[],['a','b','c'].map(id=>q(id,0,{metadata:{mission_type:'concept'}})),[])
 assert.equal(soloEncaje.deficitMinutes,0)
 assert.ok(soloEncaje.unfitMinutes>0)
 // Y al reves: cinco sesiones de 30 en dos dias de 60 (capacidad 120, trabajo
 // 150). Las cuatro primeras llenan los dos dias EXACTOS, asi que lo que queda
 // fuera es volumen puro y no sobra ni un minuto por encaje.
 const soloVolumen=forecast({...ctx,planningCutoff:'2027-01-13'},[],
  ['v1','v2','v3','v4','v5'].map(id=>q(id,30)),[])
 assert.equal(soloVolumen.totalCapacityMinutes,120)
 assert.equal(soloVolumen.atRiskMinutes,30)
 assert.equal(soloVolumen.deficitMinutes,30)
 assert.equal(soloVolumen.unfitMinutes,0)
 // La particion es exacta en los dos casos: ni se pierde ni se cuenta doble.
 for(const result of [soloEncaje,soloVolumen])
  assert.equal(result.deficitMinutes+result.unfitMinutes,result.atRiskMinutes)
})

test('declarar "ya lo he dado" recorta trabajo sin darlo por aprobado, y no se repite',async()=>{
 const user='punto-partida',subjects=['fisica']
 const bloques=['b1','b2','b3','b4']
 const cola=bloques.flatMap((block,b)=>Array.from({length:3},(_,i)=>({
  id:`q-${b}-${i}`,user_id:user,subject:'fisica',queue_status:'pending',
  v2_sort_order:b*10+i,subject_position:b*10+i,title:`Tema ${b}.${i}`,
  block_key:block,block_slug:block,metadata:{mission_type:'concept',topic_slug:`t-${b}-${i}`},retry_not_before:null})))
 // Una ya terminada: lo hecho no se reescribe nunca.
 cola[0].queue_status='completed'
 const db=database({perfiles:[{id:user,subjects,pau_exam_date:'2027-06-07',student_exams:[]}],
  user_entitlements:[{user_id:user,plan_id:'premium',status:'active'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:6}}],
  user_learning_queue:cola})
 const mk=mod=>runtime('2026-09-15',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'t'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })(mod)
 assert.equal((await mk('app/api/camino/ensure-calendar/route.ts').POST({json:async()=>({})})).status,200)
 // Una sesion movida a mano por el alumno: ningun pase automatico la toca.
 const aMano=db.tables.camino_calendar.find(r=>r.status==='pending'&&r.queue_id)
 aMano.locked=true
 const tipoAntes=aMano.mission_type

 const api=mk('app/api/camino/start-mode/route.ts')
 assert.equal((await api.POST({json:async()=>({subject:'fisica',mode:'nope'})})).status,400)
 assert.equal((await api.POST({json:async()=>({mode:'mid'})})).status,400)

 const respuesta=await api.POST({json:async()=>({subject:'fisica',mode:'mid'})})
 const cuerpo=await respuesta.json()
 assert.equal(respuesta.status,200)
 assert.ok(cuerpo.changedQueueItems>0,'la mitad del temario tenia que pasar a repaso')

 const porId=new Map(db.tables.user_learning_queue.map(r=>[r.id,r]))
 assert.equal(porId.get('q-0-0').queue_status,'completed')
 assert.equal(porId.get('q-0-0').metadata.mission_type,'concept','lo completado no se reescribe')
 assert.equal(porId.get('q-0-1').metadata.mission_type,'review','el primer bloque queda como repaso')
 assert.equal(porId.get('q-0-1').metadata.express,true)
 assert.notEqual(porId.get('q-0-1').queue_status,'completed','declarar no es demostrar: sigue en el plan')
 assert.equal(porId.get('q-3-2').metadata.mission_type,'concept','el ultimo bloque sigue siendo temario nuevo')
 assert.equal(db.tables.camino_calendar.find(r=>r.id===aMano.id).mission_type,tipoAntes,'lo que el alumno fijo no se toca')

 // Repetir el mismo punto de partida no vuelve a cambiar nada.
 assert.deepEqual(await (await api.POST({json:async()=>({subject:'fisica',mode:'mid'})})).json(),
  {ok:true,changedQueueItems:0,changedMissions:0})
})

// El orden del temario es NUESTRO, no el del instituto del alumno. "He dado
// el primer bloque" daba por vistos los primeros de nuestra lista, que para
// media beta no son por donde empezó su clase. Se declara por nombre.
test('se declara QUE bloque se ha dado, aunque no sea el primero de nuestra lista',async()=>{
 const user='bloques-sueltos'
 const bloques=['Cinematica','Campo gravitatorio','Ondas','Optica']
 const cola=bloques.flatMap((block,b)=>Array.from({length:3},(_,i)=>({
  id:`q-${b}-${i}`,user_id:user,subject:'fisica',queue_status:'pending',
  v2_sort_order:b*10+i,subject_position:b*10+i,title:`Tema ${b}.${i}`,
  block_key:block,block_slug:block,metadata:{mission_type:'concept',topic_slug:`t-${b}-${i}`},retry_not_before:null})))
 const db=database({perfiles:[{id:user,subjects:['fisica'],pau_exam_date:'2027-06-07',student_exams:[]}],
  user_entitlements:[{user_id:user,plan_id:'premium',status:'active'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:6}}],
  user_learning_queue:cola})
 const api=runtime('2026-09-15',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'t'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/start-mode/route.ts')

 const listado=await (await api.GET({})).json()
 assert.deepEqual(listado.subjects.fisica.map(b=>b.key),bloques,'la lista es el temario del alumno, en su orden')
 assert.ok(listado.subjects.fisica.every(b=>b.declared===false&&b.lessons===3))

 // Ni el primero ni consecutivos: justamente lo que una fraccion no sabe decir.
 const respuesta=await api.POST({json:async()=>({subject:'fisica',blocks:['Campo gravitatorio','Optica']})})
 assert.equal(respuesta.status,200)
 const porId=new Map(db.tables.user_learning_queue.map(r=>[r.id,r]))
 assert.equal(porId.get('q-0-0').metadata.mission_type,'concept','Cinematica no se ha declarado: sigue siendo nueva')
 assert.equal(porId.get('q-1-0').metadata.mission_type,'review')
 assert.equal(porId.get('q-1-0').metadata.express,true)
 assert.equal(porId.get('q-3-2').metadata.mission_type,'review')
 assert.notEqual(porId.get('q-1-0').queue_status,'completed','declarar no es demostrar')
 assert.equal(porId.get('q-1-0').metadata.beta_sequence,undefined,'declarar no inventa procedencia')

 // La declaracion es completa: desmarcar deshace.
 assert.equal((await api.POST({json:async()=>({subject:'fisica',blocks:['Campo gravitatorio']})})).status,200)
 const tras=new Map(db.tables.user_learning_queue.map(r=>[r.id,r]))
 assert.equal(tras.get('q-3-2').metadata.mission_type,'concept','al desmarcar vuelve a ser temario nuevo')
 assert.equal(tras.get('q-3-2').metadata.express,undefined)
 assert.equal(tras.get('q-1-0').metadata.mission_type,'review','y lo que sigue marcado no se toca')
 assert.deepEqual((await (await api.GET({})).json()).subjects.fisica.filter(b=>b.declared).map(b=>b.key),['Campo gravitatorio'])

 // Un bloque que no es suyo no se puede declarar.
 assert.equal((await api.POST({json:async()=>({subject:'fisica',blocks:['Termodinamica']})})).status,409)
})

test('same-day ensure upgrades legacy durations even if the preference hash still matches',async()=>{
 const user='legacy',db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:[]}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:2}}],
  camino_ensure_log:[{user_id:user,last_ensured_day:'2027-01-11'}],
  camino_calendar:[{...row('legacy'),user_id:user}]})
 const personalize=load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization
 await personalize(user,db)
 const saved=db.tables.camino_calendar[0]
 delete saved.metadata.duration_model;delete saved.metadata.content_estimated_minutes
 saved.metadata.estimated_minutes=55
 saved.start_time='16:00';saved.end_time='16:55'
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'test'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 const response=await api.POST({json:async()=>({})}),body=await response.json()
 assert.equal(response.status,200);assert.equal(body.skipped,undefined)
 assert.equal(saved.metadata.duration_model,'content_v1')
 // La duracion heredada (55 min declarados) se reescribe a la sesion que
 // reparte este dia: 180 min al dia son 6 sesiones de 30.
 assert.equal(load('app/lib/camino/missionDuration.ts').estimatedMinutesForMission(saved),30)
 const again=await api.POST({json:async()=>({})})
 assert.equal((await again.json()).skipped,'already_ensured_today')
})


test('ensure cannot report a successful empty plan when reading the pending queue fails',async()=>{
 const db=database({perfiles:[{id:'u',subjects:['fisica'],pau_exam_date:'2027-06-07'}],
  billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:60,weekly_study_days_value:2}}]})
 db.failNext('user_learning_queue','select')
 await assert.rejects(load('app/lib/ensureCaminoCalendar.ts').ensureCaminoCalendar('u',db),/injected_write_failure/)
})

test('HTTP planning contention returns 409 only while the owner runs and succeeds after release',async()=>{
 const user='http-lock',db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:[]}],billing_events:[]})
 let release,entered
 const gate=new Promise(resolve=>{release=resolve}),started=new Promise(resolve=>{entered=resolve})
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'test'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
  'app/lib/ensureCaminoCalendar.ts':{ensureCaminoCalendar:async()=>{entered();await gate;return{ok:true,degraded:[],protectedConflicts:[]}}},
 })('app/api/camino/ensure-calendar/route.ts')
 const first=api.POST({json:async()=>({})})
 await started
 const duplicate=await api.POST({json:async()=>({})})
 assert.equal(duplicate.status,409)
 assert.equal((await duplicate.json()).error,'plan_busy')
 release()
 assert.equal((await first).status,200)
 const retry=await api.POST({json:async()=>({})})
 assert.equal(retry.status,200)
 assert.equal((await retry.json()).skipped,'already_ensured_today')
})

test('opening October 19–25 extends the real server plan beyond thirty study days at 180 min × 6',async()=>{
 const user='future-week',journey=runtime('2026-09-14'),subjects=['fisica','matematicas_ii','matematicas_ccss','historia_espana']
 const work=Array.from({length:480},(_,i)=>({...q(`topic-${i}`,20,{subject:subjects[i%4],metadata:{mission_type:'concept',content_estimated_minutes:20}}),user_id:user,v2_sort_order:Math.floor(i/4)+1,subject_position:Math.floor(i/4),title:`Tema ${i}`}))
 const db=database({perfiles:[{id:user,subjects,pau_exam_date:'2027-06-07',student_exams:[]}],
  user_entitlements:[{user_id:user,plan_id:'premium',status:'active'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:6}}],user_learning_queue:work})
 const api=runtime('2026-09-14',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 assert.equal((await api.POST({json:async()=>({})})).status,200)
 assert.ok(db.tables.camino_calendar.filter(r=>r.scheduled_date==='2026-10-20'&&r.status==='pending').reduce((sum,r)=>sum+journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission(r),0)<180,'the initial horizon leaves the following week incomplete')
 const response=await api.POST({json:async()=>({throughDate:'2026-10-25'})})
 assert.equal(response.status,200);assert.equal((await response.json()).skipped,undefined)
 const days=journey('app/lib/camino/planWindow.ts').planningDates(await journey('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db))
 const rows=db.tables.camino_calendar.filter(r=>r.status==='pending')
 for(const date of days.filter(d=>d>='2026-10-19'&&d<='2026-10-25')){
  const day=rows.filter(r=>r.scheduled_date===date)
  assert.ok(day.length>0,`${date} must be materialized when opening this week`)
  const total=day.reduce((sum,r)=>sum+journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission(r),0)
  // El día ya no es "180 minutos de temario nuevo": es su parte de temario
  // según el ritmo más el repaso espaciado que llena lo que sobra. Lo que se
  // exige es que el presupuesto declarado se aproveche y no se rebase.
  assert.ok(total>=120&&total<=180,`${date} aprovecha ${total} de 180 minutos declarados`)
 }
 // La semana sigue llevando temario nuevo: el ritmo reparte, no suprime. No
 // se exige en CADA día — con el reparto hay días que salen solo de repaso, y
 // eso es el plan funcionando, no un hueco.
 assert.ok(days.filter(d=>d>='2026-10-19'&&d<='2026-10-25').some(date=>rows.some(r=>r.scheduled_date===date&&r.queue_id)),
  'la semana abierta debe llevar temario nuevo ademas de repaso')
 const ids=rows.map(r=>r.queue_id).filter(Boolean)
 assert.equal(new Set(ids).size,ids.length,'no duplicated work while expanding')
 // Repetir la misma petición no duplica trabajo. El relleno de repaso sí
 // puede rematar los minutos que quedaran libres, así que la garantía no es
 // "el mismo número de filas para siempre" sino que CONVERGE y que ningún día
 // se pasa del presupuesto declarado: dos pasadas más no mueven el número.
 const again=await api.POST({json:async()=>({throughDate:'2026-10-25'})})
 assert.equal(again.status,200)
 const afterSecond=db.tables.camino_calendar.filter(r=>r.status==='pending')
 const idsAfter=afterSecond.map(r=>r.queue_id).filter(Boolean)
 assert.equal(new Set(idsAfter).size,idsAfter.length,'no duplicated work while expanding')
 assert.equal((await api.POST({json:async()=>({throughDate:'2026-10-25'})})).status,200)
 assert.equal((await api.POST({json:async()=>({throughDate:'2026-10-25'})})).status,200)
 assert.equal(db.tables.camino_calendar.filter(r=>r.status==='pending').length,afterSecond.length,'el relleno tiene que converger, no crecer en cada carga')
 const est=journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission
 for(const date of new Set(afterSecond.map(r=>r.scheduled_date))){
  const total=afterSecond.filter(r=>r.scheduled_date===date).reduce((sum,r)=>sum+est(r),0)
  assert.ok(total<=180,`${date} se pasa del presupuesto declarado (${total})`)
 }
})

test('el curso entero se reparte: 180 min x 6 dias no puede dejar semanas en blanco',async()=>{
 // EL CASO REPRODUCIDO. Con el temario REAL de cuatro asignaturas (308 temas),
 // disponibilidad maxima y la PAU en junio, el motor colocaba todo el curso
 // entre el 14/09 y el 06/11 y dejaba 173 de los 218 dias de estudio sin una
 // sola mision — el 79% del curso en "Aun sin planificar". Y elegir MAS
 // disponibilidad lo empeoraba, porque vaciaba la cola antes.
 const seed=require('../../app/data/camino/curriculum_seed.json')
 const user='curso-completo',subjects=['matematicas_ii','historia_espana','lengua','fisica']
 const topics=(Array.isArray(seed)?seed:(seed.topics||Object.values(seed)[0])).filter(t=>subjects.includes(t.subject))
 assert.ok(topics.length>250,'el seed real tiene que traer el temario de las cuatro asignaturas')
 const work=topics.map((t,i)=>({id:`q-${i}`,user_id:user,subject:t.subject,queue_status:'pending',
  v2_sort_order:t.v2SortOrder??t.orderIndex??i+1,subject_position:i,title:t.title??`Tema ${i}`,
  block_key:t.blockSlug??null,block_slug:t.blockSlug??null,
  metadata:{mission_type:'concept',topic_slug:t.topicSlug},retry_not_before:null}))
 const db=database({perfiles:[{id:user,subjects,pau_exam_date:'2027-06-07',student_exams:[]}],
  user_entitlements:[{user_id:user,plan_id:'premium',status:'active'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:6}}],
  user_learning_queue:work})
 const journey=runtime('2026-09-14')
 const api=runtime('2026-09-14',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 assert.equal((await api.POST({json:async()=>({})})).status,200)
 const context=await journey('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db)
 const allDays=journey('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true})
 assert.equal((await api.POST({json:async()=>({throughDate:allDays[allDays.length-1]})})).status,200)

 const est=journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission
 const rows=db.tables.camino_calendar.filter(r=>['pending','postponed'].includes(r.status))
 const minutesByDate=new Map()
 for(const r of rows) minutesByDate.set(r.scheduled_date,(minutesByDate.get(r.scheduled_date)??0)+est(r))
 const empty=allDays.filter(d=>!(minutesByDate.get(d)>0))
 assert.equal(empty.length,0,`${empty.length} de ${allDays.length} dias de estudio se quedan sin una sola mision: ${empty.slice(0,5).join(', ')}`)
 for(const d of allDays) assert.ok(minutesByDate.get(d)<=180,`${d} se pasa del presupuesto declarado`)

 // El temario no se pierde y no se agota en ocho semanas: entra entero y
 // termina con margen antes de la PAU, no la vispera y no en noviembre.
 assert.equal(db.tables.user_learning_queue.filter(r=>r.queue_status==='pending').length,0)
 const contentDates=rows.filter(r=>r.queue_id).map(r=>r.scheduled_date).sort()
 assert.equal(contentDates.length,work.length)
 assert.ok(contentDates[contentDates.length-1]>'2027-01-31',`el temario seguia agotandose el ${contentDates[contentDates.length-1]}`)
 assert.ok(contentDates[contentDates.length-1]<context.planningCutoff,'el temario nuevo no puede llegar pegado al examen')
 // Ningun repaso puede caer antes de la leccion que repasa. Se compara con la
 // PRIMERA leccion del tema, no con una cualquiera: hay contenidos que se
 // repiten a lo largo del curso (el comentario de texto entra cada pocas
 // semanas) y comparar con la ultima daria por adelantado un repaso correcto.
 const lessonByTopic=new Map()
 // "Leccion" es toda mision que NO es repaso, tenga o no fila de cola: el
 // comentario de texto se inyecta sin queue_id y es contenido igual.
 for(const r of rows.filter(x=>x.mission_type!=='review'&&x.v2_sort_order!=null)){
  const key=`${r.subject}:${r.v2_sort_order}`
  const known=lessonByTopic.get(key)
  if(!known||r.scheduled_date<known) lessonByTopic.set(key,r.scheduled_date)
 }
 for(const r of rows.filter(x=>x.mission_type==='review')){
  const lesson=lessonByTopic.get(`${r.subject}:${r.v2_sort_order}`)
  if(lesson) assert.ok(r.scheduled_date>lesson,`repaso del ${r.scheduled_date} antes de su leccion del ${lesson}`)
 }
})

test('pending settings apply on a normal visit without a manual recalculation request',async()=>{
 const user='saved-settings',db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:[]}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:2}}],
  camino_calendar:[{...row('existing'),user_id:user}],camino_ensure_log:[{user_id:user,last_ensured_day:'2027-01-11'}]})
 await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization(user,db)
 db.tables.billing_events[0].payload.daily_minutes=30
 assert.equal(await load('app/lib/camino/replanPending.ts').markReplanPending(db,user),true)
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 const response=await api.POST({json:async()=>({})})
 assert.equal(response.status,200);assert.equal((await response.json()).skipped,undefined)
 assert.equal(db.tables.camino_ensure_log[0].replan_pending_at,null)
 assert.equal((await load('app/lib/camino/planNotices.ts').collectPlanNotices(user,db)).misplaced.length,0)
})

test('planning dates are validated and optional pending-marker failure never masks the main result',async()=>{
 const user='validation',db=database({perfiles:[{id:user,pau_exam_date:'2027-06-07',subjects:[]}]})
 const api=runtime('2027-01-11',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 for(const throughDate of ['bad','2027-02-31','2030-01-01']) assert.equal((await api.POST({json:async()=>({throughDate})})).status,400)
 db.failNext('camino_ensure_log','upsert')
 const checked=load('app/lib/camino/checkedDb.ts').checkedDb(db)
 assert.equal(await load('app/lib/camino/replanPending.ts').markReplanPending(checked,user),false)
})

test('batched day schedulers preserve slots and shared minutes with bounded database reads',async()=>{
 const user='batch',dates=Array.from({length:30},(_,i)=>load('app/lib/camino/studyDays.ts').addDays('2027-01-11',i))
 const db=database({billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180}}],
  camino_custom_events:[
   {id:'one',user_id:user,event_date:'2027-01-11',recurrence:'none',start_time:'16:00',end_time:'17:00'},
   {id:'weekly',user_id:user,event_date:'2027-01-01',recurrence:'weekly',day_of_week:3,recurrence_until:'2027-06-01',start_time:'16:00',end_time:'18:00'}],
  camino_calendar:[
   {...row('manual',{source:'manual',start_time:'17:00',end_time:'17:30'}),user_id:user},
   {...row('untimed',{start_time:null,end_time:null,metadata:{estimated_minutes:30}}),user_id:user},
   {...row('done',{status:'completed',start_time:'18:00',end_time:'18:45'}),user_id:user}]})
 const external=new Map([['2027-01-11',[{start:'17:30',end:'18:00'}]]])
 let reads=0
 const originalFrom=db.from.bind(db);db.from=(...args)=>{reads++;return originalFrom(...args)}
 const api=load('app/lib/camino/scheduleTimeSlot.ts')
 const batch=await api.createDaySchedulers(user,db,dates,{dailyMinutes:180,externalBusyByDate:external})
 const batchReads=reads
 assert.ok(batchReads<=3,`expected <=3 reads, got ${batchReads}`)
 reads=0
 for(const date of dates){
  const old=await api.createDayScheduler(user,db,date,{externalBusy:external.get(date)??[]})
  const expected=[],actual=[]
  for(let n=0;n<12;n++){
   expected.push(old.placeBest(25,{date,subject:'fisica',missionType:'concept'}))
   actual.push(batch.get(date).placeBest(25,{date,subject:'fisica',missionType:'concept'}))
  }
  assert.deepEqual(actual,expected,`${date}: same reservations, events, scoring and minutes`)
 }
 assert.ok(reads>=150,`daily version should demonstrate repeated reads: ${reads}`)
 db.failNext('camino_calendar','select')
 await assert.rejects(api.createDaySchedulers(user,db,dates,{dailyMinutes:180}),/injected_write_failure/)
})

test('abrir una semana lejana no cuesta una lectura por dia de plan',async()=>{
 // EL CASO DE LOS 45 SEGUNDOS. La recolocacion pedia un scheduler por fecha
 // candidata (5 lecturas) y la disponibilidad de Google dia a dia: con el
 // curso entero abierto eran ~500 idas y vueltas SECUENCIALES contra Supabase
 // antes de responder. El plan resultante tiene que ser el mismo; lo que no
 // puede es escalar con el numero de dias.
 const seed=require('../../app/data/camino/curriculum_seed.json')
 const user='coste-apertura',subjects=['matematicas_ii','historia_espana','lengua','fisica']
 const topics=(Array.isArray(seed)?seed:(seed.topics||Object.values(seed)[0])).filter(t=>subjects.includes(t.subject))
 const work=topics.map((t,i)=>({id:`q-${i}`,user_id:user,subject:t.subject,queue_status:'pending',
  v2_sort_order:t.v2SortOrder??t.orderIndex??i+1,subject_position:i,title:t.title??`Tema ${i}`,
  block_key:t.blockSlug??null,block_slug:t.blockSlug??null,
  metadata:{mission_type:'concept',topic_slug:t.topicSlug},retry_not_before:null}))
 const db=database({perfiles:[{id:user,subjects,pau_exam_date:'2027-06-07',student_exams:[]}],
  user_entitlements:[{user_id:user,plan_id:'premium',status:'active'}],
  billing_events:[{user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:180,weekly_study_days_value:6}}],
  user_learning_queue:work})
 let reads=0
 const originalFrom=db.from.bind(db);db.from=(...args)=>{reads++;return originalFrom(...args)}
 const api=runtime('2026-09-14',{
  'app/lib/camino/caminoProgressServer.ts':{getAuthContext:async()=>({user:{id:user},accessToken:'fixture'})},
  'app/lib/billing/supabase.ts':{createServiceClient:()=>db},
 })('app/api/camino/ensure-calendar/route.ts')
 assert.equal((await api.POST({json:async()=>({})})).status,200)
 assert.ok(reads<=120,`la primera carga ya cuesta ${reads} consultas`)
 for(const throughDate of ['2026-12-06','2027-02-07']){
  reads=0
  assert.equal((await api.POST({json:async()=>({throughDate})})).status,200)
  assert.ok(reads<=120,`abrir ${throughDate} cuesta ${reads} consultas: alguien ha vuelto a leer por dia`)
 }
 // Y sigue planificando: ni una fecha vacia ni presupuesto desbordado.
 const journey=runtime('2026-09-14')
 const context=await journey('app/lib/camino/studentPlanContext.ts').loadStudentPlanContext(user,db)
 const est=journey('app/lib/camino/missionDuration.ts').estimatedMinutesForMission
 const minutesByDate=new Map()
 for(const r of db.tables.camino_calendar.filter(r=>['pending','postponed'].includes(r.status)))
  minutesByDate.set(r.scheduled_date,(minutesByDate.get(r.scheduled_date)??0)+est(r))
 // Solo el horizonte pedido: lo posterior a febrero se materializa cuando el
 // alumno llegue a esa semana, no en esta peticion.
 const days=journey('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true}).filter(d=>d<='2027-02-07')
 const empty=days.filter(d=>!(minutesByDate.get(d)>0))
 assert.equal(empty.length,0,`${empty.length} de ${days.length} dias sembrados se quedan sin mision: ${empty.slice(0,5).join(', ')}`)
 for(const d of days) assert.ok(minutesByDate.get(d)<=180,`${d} se pasa del presupuesto declarado`)

 // Y el horizonte pedido se siembra ENTERO, tambien el curso completo. Hubo un
 // tope de 8 semanas medido desde hoy que no avanzaba con las peticiones: el
 // temario se quedaba en noviembre para siempre. El coste sigue sin escalar
 // con los dias, que es lo unico que ese tope tenia que proteger.
 reads=0
 const finDePlan=journey('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true}).at(-1)
 assert.equal((await api.POST({json:async()=>({throughDate:finDePlan})})).status,200)
 assert.ok(reads<=120,`abrir el curso entero cuesta ${reads} consultas`)
 const todo=journey('app/lib/camino/planWindow.ts').planningDates(context,{includeFinalReviewWindow:true})
 const minutosFinal=new Map()
 for(const r of db.tables.camino_calendar.filter(r=>['pending','postponed'].includes(r.status)))
  minutosFinal.set(r.scheduled_date,(minutosFinal.get(r.scheduled_date)??0)+est(r))
 const vacios=todo.filter(d=>!(minutosFinal.get(d)>0))
 assert.equal(vacios.length,0,`${vacios.length} de ${todo.length} dias del curso se quedan sin mision: ${vacios.slice(0,5).join(', ')}`)
})
