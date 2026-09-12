const { test } = require('node:test'), assert = require('node:assert/strict')
const { runtime, database } = require('./runtime.cjs')
const load = runtime('2027-01-11')
const { buildCoverageForecast: forecast } = load('app/lib/camino/coverageForecast.ts')
const base = load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-01-11',examDate:'2027-01-13',dailyMinutes:60,weeklyStudyDays:7,holidays:new Set()})
const ctx = {...base, planningCutoff:'2027-01-12'}
const q = (id, minutes=30, extra={}) => ({id,subject:'fisica',queue_status:'pending',metadata:{mission_type:'concept',estimated_minutes:minutes},...extra})
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
