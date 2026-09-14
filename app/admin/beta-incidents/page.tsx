'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type Incident = { id:string; user_id:string|null; source:string; code:string; route:string; description:string; severity:string; status:string; occurrences:number; last_seen_at:string }
export default function BetaIncidentsPage() {
  const [rows,setRows]=useState<Incident[]>([])
  const [error,setError]=useState('')
  const [cursor,setCursor]=useState<string|null>(null)
  const [busy,setBusy]=useState(false)
  async function load(before?: string) {
    try {
      const {data:{session}}=await supabase.auth.getSession()
      if(!session) throw Error('Inicia sesión con una cuenta del equipo.')
      const response=await fetch(`/api/admin/beta-incidents${before ? `?before=${encodeURIComponent(before)}`:''}`,{headers:{Authorization:`Bearer ${session.access_token}`}})
      if(!response.ok) throw Error(response.status===403?'Solo el equipo puede consultar las incidencias.':'No se pudo actualizar el panel.')
      const body=await response.json();setRows(previous=>before?[...previous,...body.incidents]:body.incidents);setCursor(body.nextCursor);setError('')
    }catch(e){setError(e instanceof Error?e.message:'Error de conexión')}
  }
  useEffect(()=>{ void load(); const timer=setInterval(()=>{ if(!document.hidden) void load() },60000); return()=>clearInterval(timer) },[])
  async function status(id:string,value:string){
    setBusy(true)
    try {
      const {data:{session}}=await supabase.auth.getSession();if(!session)throw Error('Sesión caducada')
      const response=await fetch('/api/admin/beta-incidents',{method:'PATCH',headers:{Authorization:`Bearer ${session.access_token}`,'Content-Type':'application/json'},body:JSON.stringify({id,status:value})})
      if(!response.ok)throw Error('No se pudo guardar el estado');await load()
    }catch(e){setError(e instanceof Error?e.message:'Error')}finally{setBusy(false)}
  }
  const open=rows.filter(row=>row.status!=='resolved')
  return <main style={{maxWidth:1100,margin:'40px auto',padding:24}}>
    <a href="/admin">← Panel interno</a><h1 style={{fontSize:28,fontWeight:800,margin:'20px 0'}}>Incidencias de la beta</h1>
    <p>En esta página: {open.length} abiertas · {open.filter(row=>row.severity==='blocking').length} bloqueantes · {new Set(open.map(row=>row.user_id).filter(Boolean)).size} alumnos afectados</p>
    <p>Se actualiza cada minuto mientras esté visible. No envía notificaciones externas.</p>
    <button onClick={()=>void load()}>Actualizar</button><p role="status">{error}</p>
    {!rows.length&&!error&&<p>No hay incidencias registradas.</p>}
    {rows.map(row=><article key={row.id} style={{padding:16,margin:'14px 0',border:'1px solid #94a3b8',borderRadius:12}}>
      <strong>{row.severity==='blocking'?'Bloqueante':row.severity==='high'?'Prioritaria':'Normal'} · {row.code}</strong>
      <p>{row.route} · {row.occurrences} apariciones · {new Date(row.last_seen_at).toLocaleString('es-ES')}</p>
      <p style={{whiteSpace:'pre-wrap'}}>{row.description||'Detectada automáticamente. Revisar los registros del servidor para esta fecha y código.'}</p>
      <label>Estado <select disabled={busy} value={row.status} onChange={event=>void status(row.id,event.target.value)}>
        <option value="open">Abierta</option><option value="investigating">Investigando</option><option value="resolved">Resuelta</option>
      </select></label>
    </article>)}
    {cursor&&<button onClick={()=>void load(cursor)}>Cargar anteriores</button>}
  </main>
}
