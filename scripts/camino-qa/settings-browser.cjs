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
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'kairo-settings-'))
 fs.writeFileSync(path.join(temp,'loader.cjs'),`const ts=require(${JSON.stringify(require.resolve('typescript'))});module.exports=function(source){return ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText}`)
 fs.writeFileSync(path.join(temp,'auth.js'),`export const supabase={auth:{getUser:async()=>({data:{user:{id:'settings-user',email:'fixture@example.test'}}}),getSession:async()=>({data:{session:{access_token:'fixture',user:{id:'settings-user'}}}})}};`)
 fs.writeFileSync(path.join(temp,'navigation.js'),`const router={push:()=>{}};export const useRouter=()=>router;`)
 fs.writeFileSync(path.join(temp,'sidebar.js'),`export default function Sidebar(){return null}`)
 fs.writeFileSync(path.join(temp,'entry.js'),`import React from 'react';import{createRoot}from'react-dom/client';import Settings from ${JSON.stringify(path.join(root,'app/settings/page.tsx'))};createRoot(document.getElementById('root')).render(React.createElement(Settings));`)
 await new Promise((resolve,reject)=>webpack({mode:'development',devtool:false,entry:path.join(temp,'entry.js'),output:{path:temp,filename:'bundle.js'},resolve:{extensions:['.tsx','.ts','.js'],modules:[path.join(root,'node_modules'),'node_modules'],alias:{'@/app/lib/supabase$':path.join(temp,'auth.js'),'@/app/components/SidebarNav$':path.join(temp,'sidebar.js'),'next/navigation$':path.join(temp,'navigation.js'),'@':root}},module:{rules:[{test:/\.tsx?$/,exclude:/node_modules/,use:path.join(temp,'loader.cjs')}]},infrastructureLogging:{level:'error'}},(error,stats)=>error||stats.hasErrors()?reject(error||new Error(stats.toString({all:false,errors:true}))):resolve()))
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type',req.url==='/bundle.js'?'text/javascript; charset=utf-8':'text/html; charset=utf-8');res.end(req.url==='/bundle.js'?fs.readFileSync(path.join(temp,'bundle.js')):'<html lang="es"><meta charset="utf-8"><style>'+CLAY_TOKENS+'</style><div id="root"></div><script src="/bundle.js"></script>')})
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve))
 const browser=await chromium.launch({channel:'chrome',headless:true})
 try{
 const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[]
 page.on('pageerror',error=>errors.push(error.message))
 await page.addInitScript(()=>{const timer=window.setTimeout.bind(window);window.setTimeout=((fn,ms,...args)=>timer(fn,typeof ms==='number'&&ms>=1000&&ms<=10000?20:ms,...args))})
 const onboarding={completedAt:'2026-09-01',subjects:['Física'],dailyMinutes:60,weeklyStudyDaysValue:2,community:'Madrid'}
 let setupCalls=0,ensureCalls=0,failProfile=false
 const payloads=[]
 await page.route('https://**',route=>route.abort())
 await page.route('**/api/**',async route=>{
  const path=new URL(route.request().url()).pathname
  if(path==='/api/profile')return route.fulfill({status:failProfile&&route.request().method()==='PATCH'?500:200,json:route.request().method()==='PATCH'?{ok:!failProfile}:{username:'fixture',subject_levels:{fisica:'medio'},pau_exam_date:'2027-06-07'}})
  if(path==='/api/billing/me')return route.fulfill({json:{studyAccess:{maxStudyDaysPerWeek:6,beta:true,label:'Beta',planId:'premium'}}})
  if(path==='/api/onboarding/me')return route.fulfill({json:{onboarding}})
  if(path==='/api/onboarding/setup'){setupCalls++;payloads.push(route.request().postDataJSON());return route.fulfill({json:{ok:true,replanPending:true}})}
  if(path==='/api/camino/ensure-calendar'){ensureCalls++;return route.fulfill({status:ensureCalls<5?409:200,json:ensureCalls<5?{ok:false,retryable:true,replanPending:true}:{ok:true}})}
  return route.fulfill({json:{}})
 })
 const {expect}=require('@playwright/test')
 await page.goto(`http://127.0.0.1:${server.address().port}`)
 const days=page.getByLabel(/Días de Camino/),minutes=page.getByLabel(/Tiempo disponible al día/)
 await expect(days).toHaveValue('2');await expect(minutes).toHaveValue('60')
 await days.selectOption('6');await minutes.selectOption('180')
 await expect(page.getByRole('button',{name:/Recalcular/})).toHaveCount(0)
 await page.getByRole('button',{name:'Guardar cambios',exact:true}).click()
 await expect(page.getByText('Tus ajustes están guardados y tu Camino actualizado.',{exact:true})).toBeVisible()
 assert.equal(setupCalls,1);assert.equal(ensureCalls,5)
 assert.equal(payloads[0].dailyMinutes,180);assert.equal(payloads[0].weeklyStudyDaysValue,6)
 // Un fallo del perfil no puede pintarse como guardado ni iniciar otro plan.
 failProfile=true
 const save=page.getByRole('button',{name:/Guardar cambios|Cambios guardados/}).last()
 await save.click()
 await expect(page.getByText(/No se pudieron guardar los cambios de tu perfil/)).toBeVisible()
 assert.equal(ensureCalls,5);assert.equal(setupCalls,1)
 assert.deepEqual(errors,[])
 console.log(JSON.stringify({passed:['save-once-applies-180x6','four-409-then-success','no-manual-recalculate','profile-failure-not-success']}))
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
main().catch(error=>{console.error(error);process.exitCode=1})
