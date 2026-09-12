// Real React components and hook in Chromium; authentication and API transport
// use local fixtures. No student account or production database is touched.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),http=require('node:http')
const ts=require('typescript'), webpack=require('next/dist/compiled/webpack/webpack').webpack
const {chromium}=require('@playwright/test'),assert=require('node:assert/strict')
const {runtime}=require('./runtime.cjs'),root=path.resolve(__dirname,'../..')
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
 fs.writeFileSync(path.join(temp,'entry.js'),`import React from 'react';import{createRoot}from'react-dom/client';import Banner from ${JSON.stringify(path.join(root,'app/components/camino/PlanNoticeBanner.tsx'))};createRoot(document.getElementById('root')).render(React.createElement(Banner));`)
 await new Promise((resolve,reject)=>webpack({mode:'development',devtool:false,entry:path.join(temp,'entry.js'),output:{path:temp,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js'],modules:[path.join(root,'node_modules'),'node_modules'],alias:{'@/app/lib/supabase$':path.join(temp,'auth.js'),'@':root}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(temp,'loader.cjs')}]},infrastructureLogging:{level:'error'}},(error,stats)=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()))
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/bundle.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(req.url==='/bundle.js'?fs.readFileSync(path.join(temp,'bundle.js')):'<html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font-family:Arial;margin:20px"><main id="root"></main><script src="/bundle.js"></script></body></html>')})
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
 const page=await browser.newPage({viewport:{width:390,height:844}})
 const errors=[];page.on('pageerror',error=>errors.push(error.message))
 const load=runtime(),context=load('app/lib/camino/planWindow.ts').buildStudentPlanContext({today:'2027-01-11',examDate:'2027-06-07',dailyMinutes:60,weeklyStudyDays:2})
 const forecast=load('app/lib/camino/coverageForecast.ts').buildCoverageForecast(context,[],[{id:'q',subject:'fisica',queue_status:'pending',metadata:{estimated_minutes:30}}],[],['fisica'])
 let mode='cap', delayA=false
 await page.route('**/api/camino/plan-overview',async route=>{
  const userId=route.request().headers().authorization.split(' ')[1]
  if(delayA&&userId==='a')await new Promise(resolve=>setTimeout(resolve,200))
  if(mode==='error')return route.fulfill({status:503,json:{error:'test'}})
  await route.fulfill({json:{userId,forecast,notices:{availability:mode==='cap'&&userId==='a'?{requestedWeeklyStudyDays:7,effectiveWeeklyStudyDays:2,accessMaxStudyDaysPerWeek:2,accessLabel:'Free'}:null,protectedConflicts:mode==='conflict'?['locked']:[],misplaced:[]}}}).catch(()=>{})
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
 await expect(page.getByRole('heading',{name:'¿Qué cabe antes de tu PAU?'})).toBeVisible()
 mode='error';await page.evaluate(()=>window.dispatchEvent(new Event('camino:updated')))
 await expect(page.getByRole('button',{name:'Reintentar'})).toBeVisible()
 mode='clear';await page.getByRole('button',{name:'Reintentar'}).click()
 await expect(page.getByRole('heading',{name:'¿Qué cabe antes de tu PAU?'})).toBeVisible()
 await page.getByText('Ver reparto por asignatura y supuestos').click()
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true)
 const screenshot=path.join(temp,'overview-mobile.png');await page.screenshot({path:screenshot,fullPage:true})
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:['reload','resolve-cap','resolve-protected-conflict','account-switch-late-response','retry','mobile-no-overflow'],screenshot}))
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1})
