// Real React components and hook in Chromium; authentication and API transport
// use local fixtures. No student account or production database is touched.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http')
const ts=require('typescript'), webpack=require('next/dist/compiled/webpack/webpack').webpack
const {chromium}=require('@playwright/test'),assert=require('node:assert/strict')
const {runtime}=require('./runtime.cjs'),root=path.resolve(__dirname,'../..')
// Tokens clay del tema claro: el bundle no incluye globals.css, y sin ellos la
// captura de verificacion no representa lo que ve el alumno.
const CLAY_TOKENS=":root{--clay-bg:#e9eefb;--clay-surface:#eef3fc;--clay-surface-raised:#f6f9fe;--clay-shadow-dark:rgba(37, 99, 235, 0.22);--clay-shadow-light:rgba(255, 255, 255, 0.95);--clay-accent:#2563eb;--clay-accent-soft:rgba(37, 99, 235, 0.12);--clay-accent-text:#1d4ed8;--clay-text:#0d1424;--clay-text-muted:#55627a;--clay-border:rgba(37, 99, 235, 0.14);--clay-accent-deep:#1d4ed8;--clay-surface-deep:#c7d6f0;--clay-shadow-shelf:rgba(37, 99, 235, 0.10);--clay-shadow-elevate:rgba(37, 99, 235, 0.18);--clay-on-accent:#ffffff;--clay-warn:#b45309;--clay-warn-soft:rgba(180, 83, 9, 0.12);--clay-warn-deep:#92400e;}body{background:var(--clay-bg);font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;color:var(--clay-text)}"+'[data-kairo-clay-theme="dark"]{--clay-bg:#10162a;--clay-surface:#171e38;--clay-surface-raised:#1c2440;--clay-shadow-dark:rgba(0, 0, 0, 0.55);--clay-shadow-light:rgba(96, 165, 250, 0.28);--clay-accent:#60a5fa;--clay-accent-soft:rgba(96, 165, 250, 0.16);--clay-accent-text:#60a5fa;--clay-text:#eef2fb;--clay-text-muted:#9aa7c4;--clay-border:rgba(96, 165, 250, 0.20);--clay-accent-deep:#1e3a8a;--clay-surface-deep:#060912;--clay-shadow-shelf:rgba(0, 0, 0, 0.35);--clay-shadow-elevate:rgba(0, 0, 0, 0.55);--clay-on-accent:#0b1220;--clay-warn:#fbbf24;--clay-warn-soft:rgba(251, 191, 36, 0.16);--clay-warn-deep:#78350f;}'
async function main(){
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kairo-overview-'))
 fs.writeFileSync(path.join(temp,'loader.cjs'),`const ts=require(${JSON.stringify(require.resolve('typescript'))});module.exports=function(source){return ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText}`)
 fs.writeFileSync(path.join(temp,'auth.js'),`
 let id='a';const listeners=new Set();
 window.switchAccount=value=>{id=value;for(const listener of listeners)listener()};
 export const supabase={auth:{
   getSession:async()=>({data:{session:id?{access_token:id,user:{id}}:null}}),
   onAuthStateChange:listener=>{
     listeners.add(listener);
     return {data:{subscription:{unsubscribe:()=>listeners.delete(listener)}}};
   }
 }};
 `)
 fs.writeFileSync(path.join(temp,'entry.js'),`import React from 'react';import{createRoot}from'react-dom/client';import Banner from ${JSON.stringify(path.join(root,'app/components/camino/PlanNoticeBanner.tsx'))};import WorkBanner from ${JSON.stringify(path.join(root,'app/components/camino/UnscheduledWorkBanner.tsx'))};createRoot(document.getElementById('root')).render(React.createElement(React.Fragment,null,React.createElement(WorkBanner),React.createElement(Banner)));`)
 await new Promise((resolve,reject)=>webpack({mode:'development',devtool:false,entry:path.join(temp,'entry.js'),output:{path:temp,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js'],modules:[path.join(root,'node_modules'),'node_modules'],alias:{'@/app/lib/supabase$':path.join(temp,'auth.js'),'@':root}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(temp,'loader.cjs')}]},infrastructureLogging:{level:'error'}},(error,stats)=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()))
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/bundle.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(req.url==='/bundle.js'?fs.readFileSync(path.join(temp,'bundle.js')):'<html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>'+CLAY_TOKENS+'</style><body style="margin:16px"><main id="root"></main><script src="/bundle.js"></script></body></html>')})
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}})
 // Acortar solo los backoffs del planificador; la lógica de reintentos es real.
 await page.addInitScript(()=>{const timer=window.setTimeout.bind(window);window.setTimeout=((fn,ms,...args)=>timer(fn,typeof ms==='number'&&ms>=1000&&ms<=10000?10:ms,...args))})
 await page.route('**/api/camino/plan-status',route=>route.fulfill({json:{topics:0,subjects:[],reasons:[],needsAvailability:false}}))
 const errors=[];page.on('pageerror',error=>errors.push(error.message))
 const load=runtime(),context=load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-01-11',examDate:'2027-06-07',dailyMinutes:60,weeklyStudyDays:2})
 const forecast=load('app/lib/camino/coverageForecast.ts').buildCoverageForecast(context,[],[{id:'q',subject:'fisica',queue_status:'pending',metadata:{estimated_minutes:30}}],[],['fisica'])
 const conflictForecast=load('app/lib/camino/coverageForecast.ts').buildCoverageForecast(context,[
  {id:'a',subject:'fisica',status:'pending',source:'algorithm',locked:true,mission_type:'concept',scheduled_date:context.today,start_time:'16:00',end_time:'17:00'},
  {id:'b',subject:'fisica',status:'pending',source:'algorithm',locked:true,mission_type:'concept',scheduled_date:context.today,start_time:'17:00',end_time:'17:30'},
 ],[],[],['fisica'])
 const build=load('app/lib/camino/coverageForecast.ts').buildCoverageForecast
 const replanForecast=build(context,[
  {id:'auto-a',title:'Física A',subject:'fisica',status:'pending',source:'algorithm',locked:false,mission_type:'concept',scheduled_date:context.today,start_time:'16:00',end_time:'16:25'},
  {id:'auto-b',title:'Física B',subject:'fisica',status:'pending',source:'algorithm',locked:false,mission_type:'concept',scheduled_date:context.today,start_time:'16:10',end_time:'16:35'},
 ],[],[],['fisica'])
 const combinedContext={...load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-05-11',examDate:'2027-06-07',dailyMinutes:30,weeklyStudyDays:3,holidays:new Set()}),accessMaxStudyDaysPerWeek:6}
 const combinedForecast=build(combinedContext,[],Array.from({length:40},(_,i)=>({id:'q'+i,subject:'fisica',queue_status:'pending',metadata:{content_estimated_minutes:30}})),[])
 const expiredForecast=build(context,[{id:'expired',title:'Parcial vencido',subject:'fisica',status:'unscheduled',source:'partial',mission_type:'partial_practice',scheduled_date:'2027-01-09',metadata:{partial_exam_date:'2027-01-10'}}],[],[])
 let mode='cap', delayA=false
 let replanStatus=503, replanRequests=0, busyRemaining=0
 await page.route('**/api/camino/ensure-calendar',async route=>{
  replanRequests++
  assert.deepEqual(route.request().postDataJSON(),{force:true})
  assert.equal(route.request().headers().authorization,'Bearer b')
  const status=busyRemaining-->0?409:replanStatus
  if(status===200)mode='clear'
  await route.fulfill({status,json:{ok:status===200,retryable:true}})
 })
 await page.route('**/api/camino/plan-overview',async route=>{
  const userId=route.request().headers().authorization.split(' ')[1]
  if(delayA&&userId==='a')await new Promise(resolve=>setTimeout(resolve,200))
  if(mode==='error')return route.fulfill({status:503,json:{error:'test'}})
  await route.fulfill({json:{userId,forecast:mode==='forecast-conflict'?conflictForecast:mode==='replan'?replanForecast:mode==='combined'?combinedForecast:mode==='expired'?expiredForecast:forecast,notices:{availability:mode==='cap'&&userId==='a'?{requestedWeeklyStudyDays:7,effectiveWeeklyStudyDays:2,accessMaxStudyDaysPerWeek:2,accessLabel:'Free'}:null,protectedConflicts:mode==='conflict'?['locked']:[],misplaced:[]}}}).catch(()=>{})
 })
 const {expect}=require('@playwright/test')
 await page.goto(`http://127.0.0.1:${server.address().port}`)
 await expect(page.getByText('Tu plan usa 2 días a la semana')).toBeVisible()
 await page.reload();await expect(page.getByText('Tu plan usa 2 días a la semana')).toBeVisible()
 mode='clear';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByText('Tu plan usa 2 días a la semana')).toHaveCount(0)
 mode='conflict';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByText('1 misión tuya queda después de tu fecha objetivo')).toBeVisible()
 mode='clear';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByText('1 misión tuya queda después de tu fecha objetivo')).toHaveCount(0)
 mode='cap';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByText('Tu plan usa 2 días a la semana')).toBeVisible()
 delayA=true;await page.evaluate(()=>{window.dispatchEvent(new Event('camino:updated'));window.switchAccount('b')})
 await expect(page.getByText('Tu plan usa 2 días a la semana')).toHaveCount(0)
 await expect(page.getByRole('button',{name:/Tu previsión hasta la PAU/})).toBeVisible()
 mode='error';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByRole('button',{name:'Reintentar'})).toBeVisible()
 mode='clear';await page.getByRole('button',{name:'Reintentar'}).click()
 // La previsión abre cerrada: la pregunta es el disparador y ya trae respuesta.
 const trigger=page.getByRole('button',{name:/Tu previsión hasta la PAU/})
 await expect(trigger).toBeVisible()
 await expect(trigger).toContainText('Lo registrado cabe')
 await expect(trigger).toHaveAttribute('aria-expanded','false')
 await expect(page.getByText('Capacidad hasta la PAU')).not.toBeVisible()
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true)
 await trigger.click()
 await expect(trigger).toHaveAttribute('aria-expanded','true')
 await expect(page.getByText('Capacidad hasta la PAU')).toBeVisible()
 await expect(page.getByText('No predice tu nota.')).toBeVisible()
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true)
 // Conflicting scheduled work is counted once in both the legend and bar.
 mode='forecast-conflict';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(trigger).toContainText('0,5 h fuera')
 await expect(page.getByText('Programado sin conflicto',{exact:true})).toBeVisible()
 const bar=page.getByRole('img',{name:/Reparto del trabajo registrado/})
 await expect(bar).toHaveAttribute('aria-label','Reparto del trabajo registrado: 1 h programado sin conflicto, 0 h pendiente que cabe, 0,5 h en riesgo')
 const widths=await bar.locator(':scope > div').evaluateAll(nodes=>nodes.map(node=>parseFloat(node.style.width)))
 const scale=Math.max(conflictForecast.totalCapacityMinutes,90,1)
 assert.equal(widths.length,2)
 // CSSOM serializes percentages with limited decimal precision.
 assert.ok(Math.abs(widths[0]-60/scale*100)<0.0001,`scheduled width ${widths[0]} must represent 60 minutes`)
 assert.ok(Math.abs(widths[1]-30/scale*100)<0.0001,`risk width ${widths[1]} must represent 30 minutes`)
 for(const width of [320,390]) {
  await page.setViewportSize({width,height:844})
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true)
 }
 mode='clear';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(trigger).toContainText('Lo registrado cabe')
 // Probar las recomendaciones y la recuperación del botón con transporte simulado.
 mode='combined';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByText(/hay que cambiar ambas opciones/)).toBeVisible()
 assert.ok(combinedForecast.remedy.combinedChange.weeklyStudyDays<=6)
 mode='expired';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await page.getByText(/Ver las 1 actividades sin encajar/).click()
 await expect(page.getByText(/Fuera del plazo del parcial/)).toBeVisible()
 await expect(page.getByRole('button',{name:'Recolocar mi plan'})).toHaveCount(0)
 await expect(page.getByText(/No cabe ni estudiando/)).toHaveCount(0)
 mode='replan';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 const replanButton=page.getByRole('button',{name:'Recolocar mi plan'})
 await expect(replanButton).toBeVisible()
 await replanButton.click()
 await expect(page.getByText('No hemos podido terminar de actualizar tu Camino',{exact:true})).toBeVisible()
 await page.evaluate(()=>window.dispatchEvent(new Event('focus')))
 await expect(page.getByText('No hemos podido terminar de actualizar tu Camino',{exact:true})).toBeVisible()
 await expect(replanButton).toBeEnabled()
 replanStatus=200;busyRemaining=4
 await replanButton.click()
 await expect(trigger).toContainText('Lo registrado cabe')
 assert.equal(replanRequests,8)
 await expect(page.getByText('No hemos podido terminar de actualizar tu Camino',{exact:true})).toHaveCount(0)
 await expect(page.getByText(/Actualizando tu Camino/)).toHaveCount(0)
 await expect(trigger).toHaveAttribute('aria-expanded','false')
 await trigger.click()
 // Cerrada es el estado por defecto y el que mas se ve: se captura tambien.
 const shots={}
 await trigger.click();await expect(trigger).toHaveAttribute('aria-expanded','false')
 shots.collapsed=path.join(temp,'forecast-collapsed.png');await page.screenshot({path:shots.collapsed,fullPage:true})
 await trigger.click();await expect(trigger).toHaveAttribute('aria-expanded','true')
 shots.expanded=path.join(temp,'forecast-expanded.png');await page.screenshot({path:shots.expanded,fullPage:true})
 // El tema oscuro usa otros tokens: el aviso ambar cambia para no fallar AA.
 await page.evaluate(()=>document.documentElement.setAttribute('data-kairo-clay-theme','dark'))
 shots.dark=path.join(temp,'forecast-dark.png');await page.screenshot({path:shots.dark,fullPage:true})
 await page.evaluate(()=>document.documentElement.removeAttribute('data-kairo-clay-theme'))
 const screenshot=shots.expanded
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({shots,passed:['reload','resolve-cap','resolve-protected-conflict','account-switch-late-response','retry','forecast-collapsed-by-default','forecast-expands','mobile-no-overflow-320-390','forecast-conflict-counted-once','registered-work-copy','combined-remedy-within-access','expired-partial-reason','replan-503-visible-after-focus','replan-4-busy-then-success-reload'],screenshot}))
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1})
