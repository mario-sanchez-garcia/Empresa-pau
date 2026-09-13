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
for (const [minutes, slots] of [[30,[30]],[45,[45]],[60,[35,25]],[90,[50,40]],[150,[55,50,45]],[180,[50,45,45,40]]]) {
 for (const type of ['concept','review']) test(`forecast and real placement agree: ${minutes} minutes, ${type}`,async()=>{
  const context=load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:ctx.today,examDate:'2027-01-17',dailyMinutes:minutes,weeklyStudyDays:7,holidays:new Set()})
  const work=slots.map((_,i)=>q(`q-${i}`,0,{metadata:type==='concept'?{mission_type:type}:{mission_type:type,estimated_minutes:999}}))
  const before=forecast(context,[],work,[])
  assert.equal(before.pendingMinutes,minutes)
  assert.equal(before.projectedPendingMinutes,minutes)
  assert.equal(before.atRiskMinutes,0)
  const db=database({
   perfiles:[{id:'u',pau_exam_date:context.examDate}],
   billing_events:[{user_id:'u',event_type:'onboarding_completed',payload:{daily_minutes:minutes,weekly_study_days_value:7}}],
   user_learning_queue:work.map(q=>({...q,user_id:'u'})),
   camino_calendar:work.map((q,i)=>({...row(`c-${i}`,{queue_id:q.id,mission_type:type,metadata:q.metadata}),user_id:'u'})),
  })
  const result=await load('app/lib/camino/applyCalendarPersonalization.ts').applyCalendarPersonalization('u',db,{planContext:context})
  assert.equal(result.reason,'applied');assert.equal(result.unscheduledRows,0)
  const placed=db.tables.camino_calendar.filter(r=>r.status==='pending')
  assert.deepEqual(placed.map(r=>r.metadata.estimated_minutes),slots)
  assert.ok(placed.every(r=>r.scheduled_date===context.today))
  const after=forecast(context,db.tables.camino_calendar,db.tables.user_learning_queue,[])
  assert.equal(after.scheduledMinutes,before.projectedPendingMinutes)
  assert.equal(after.atRiskMinutes,0);assert.equal(after.pendingMinutes,0)
  assertPartition(before);assertPartition(after)
 })
}
test('forecast: remaining slot follows existing automatic work; completed/manual work only consumes minutes',()=>{
 const concept=q('c',0,{metadata:{mission_type:'concept'}})
 const withFirst=forecast(ctx,[row('a',{end_time:'16:35'})],[concept],[])
 assert.equal(withFirst.projectedPendingMinutes,25);assert.equal(withFirst.atRiskMinutes,0)
 for(const extra of [{source:'manual'},{locked:true},{status:'completed'}]) {
  const result=forecast(ctx,[row('a',{end_time:'16:25',...extra})],[concept],[])
  assert.equal(result.projectedPendingMinutes,35);assert.equal(result.atRiskMinutes,0)
  assertPartition(result)
 }
})
test('forecast: spare minutes do not invent extra sessions',()=>{
 const result=forecast(ctx,[],[q('a',10),q('b',10),q('c',10)],[])
 assert.equal(result.projectedPendingMinutes,20);assert.equal(result.atRiskMinutes,10)
 assertPartition(result)
})
test('forecast: an unscheduled lesson forgets old hours and adapts to the current session length',()=>{
 const result=forecast(ctx,[row('a',{status:'unscheduled',end_time:'19:00',metadata:{estimated_minutes:180}})],[],[])
 assert.equal(result.pendingMinutes,35);assert.equal(result.projectedPendingMinutes,35);assert.equal(result.atRiskMinutes,0)
 assertPartition(result)
})
test('forecast: an unplaced session keeps an explicit estimate, with no lost minutes',()=>{
 const result=forecast(ctx,[],['a','b','c'].map(id=>q(id,0,{metadata:{mission_type:'concept'}})),[])
 assert.equal(result.projectedPendingMinutes,60);assert.equal(result.atRiskMinutes,35)
 assert.equal(result.pendingMinutes,95);assertPartition(result)
})

// End-to-end orchestration with the beta curriculum shipped in the repository.
// Supabase is in-memory here; these tests do not certify the production catalog.
for (const [today, count, minutes] of [['2026-09-14',6,90],['2027-01-11',4,60],['2027-05-31',6,90],['2027-06-05',4,60]]) {
 test(`generate → personalize → read → forecast: ${today}, ${count} subjects`,async()=>{
  const user='journey', examDate='2027-06-07'
  const subjects=['matematicas_ii','fisica','lengua','historia_espana','ingles','quimica'].slice(0,count)
  const journey=runtime(today,{'app/lib/onboarding/hasCompletedOnboarding.ts':{hasCompletedOnboarding:async()=>false}})
  const partialDate=today<'2027-05-01' ? today.slice(0,8)+'25' : '2027-06-06'
  const exams=[{id:'exam',subject:'fisica',date:partialDate,name:'Parcial',block:'Repaso general',topic:'',priority:'normal'}]
  const db=database({perfiles:[{id:user,subjects,pau_exam_date:examDate,student_exams:exams}],
   user_entitlements:[{user_id:user,plan_id:'premium',status:'active',source:'auto_promo_beta'}],
   // Representative published English rows; this subject has no static fallback.
   // Titles/keys follow 20260901090000; publication follows 20260904093000.
   curriculum_content_v2:['Comprensión Lectora: Verdadero/Falso con Evidencia Textual','Vocabulario en Contexto','Redacción: Ensayo de Opinión (150-200 palabras)'].map((title,i)=>({subject:'ingles',block_key:'Destrezas PAU',block_slug:'destrezas-pau',sort_order:i+2,title,review_status:'published'})),
  })
  const generated=await journey('app/lib/onboarding/generateCaminoPlan.ts').generateCaminoPlan({userId:user,db,subjects,startMode:'from_zero',studentExams:exams,dailyMinutes:minutes,weeklyStudyDays:count})
  assert.equal(generated.success,true)
  assert.ok(generated.missions.length>0,'onboarding returns actual calendar missions')
  assert.equal(generated.skippedSubjects.length,0)
  for (const name of subjects) assert.ok(db.tables.user_learning_queue.some(q=>q.subject===name),`${name} must have curriculum work`)
  const pref={user_id:user,event_type:'onboarding_completed',payload:{daily_minutes:minutes,weekly_study_days_value:count}}
  db.tables.billing_events.push(pref)
  const queueIds=new Set(db.tables.user_learning_queue.map(q=>q.id))
  const durations=journey('app/lib/camino/missionDuration.ts')
  for (const [days, daily, target] of [[count,minutes,examDate],[2,30,examDate],[6,90,examDate],[4,60,'2027-06-06']]) {
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
