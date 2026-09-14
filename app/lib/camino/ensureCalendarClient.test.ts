import test from 'node:test'
import assert from 'node:assert/strict'

import { ensureServerCalendar, type PlanFailure } from './ensureCalendarClient.ts'

// El aviso solo puede decir QUÉ falló si el cliente deja de tirar la respuesta.
// El endpoint ya devolvía `degraded` con el paso exacto; llegaba hasta aquí y
// se convertía en un booleano, así que el alumno leía "no hemos podido
// actualizar tu Camino" y nadie —ni él ni nosotros— sabía cuál de los pasos
// del planificador había fallado.

type Reply = { status: number; body: unknown }

function harness(replies: Reply[]) {
  const events: { type: string; detail: PlanFailure | undefined }[] = []
  const calls: unknown[] = []
  let index = 0
  const globals = globalThis as Record<string, unknown>
  globals.window = {
    dispatchEvent(event: Event) {
      events.push({ type: event.type, detail: (event as CustomEvent<PlanFailure>).detail })
      return true
    },
  }
  globals.fetch = async (_url: string, init: { body: string }) => {
    calls.push(JSON.parse(init.body))
    const reply = replies[Math.min(index++, replies.length - 1)]
    return { ok: reply.status < 400, status: reply.status, json: async () => reply.body }
  }
  // El backoff real (1 s + 2 s) no aporta nada aquí y multiplica por doce lo
  // que tarda la suite; lo que se comprueba es cuántas veces reintenta.
  globals.setTimeout = ((fn: () => void) => { fn(); return 0 }) as unknown as typeof setTimeout
  return { events, calls, attempts: () => index }
}

test('un fallo del planificador llega al aviso con el paso que fallo', async () => {
  const { events } = harness([{ status: 503, body: { ok: false, retryable: true, degraded: ['calendar_upsert', 'personalization'] } }])
  assert.equal(await ensureServerCalendar('token'), false)
  assert.deepEqual(events.map(event => event.type), ['camino:plan-updating', 'camino:plan-error', 'camino:plan-idle'])
  assert.deepEqual(events[1].detail, { kind: 'degraded', steps: ['calendar_upsert', 'personalization'], status: 503 })
})

test('un plan ocupado y una caida de red no se cuentan como el mismo fallo', async () => {
  const busy = harness([{ status: 409, body: { ok: false, retryable: true, error: 'plan_busy' } }])
  await ensureServerCalendar('token')
  assert.equal(busy.events[1].detail?.kind, 'busy')
  assert.deepEqual(busy.events[1].detail?.steps, [])

  const globals = globalThis as Record<string, unknown>
  const seen: { type: string }[] = []
  globals.setTimeout = ((fn: () => void) => { fn(); return 0 }) as unknown as typeof setTimeout
  globals.window = { dispatchEvent(event: Event) { seen.push({ type: event.type }); return true } }
  globals.fetch = async () => { throw new Error('offline') }
  assert.equal(await ensureServerCalendar('token'), false)
  assert.equal(seen.filter(e=>e.type==='camino:plan-error').length, 1)
})

test('una respuesta correcta no inventa un fallo y no reintenta', async () => {
  const { events, attempts } = harness([{ status: 200, body: { ok: true, skipped: 'already_ensured_today' } }])
  assert.equal(await ensureServerCalendar('token'), true)
  assert.deepEqual(events.map(event => event.type), ['camino:plan-updating', 'camino:updated', 'camino:plan-idle'])
  assert.equal(attempts(), 1)
})

test('un error no reintentable se rinde a la primera; uno reintentable agota los tres intentos', async () => {
  const fatal = harness([{ status: 400, body: { ok: false, retryable: false, error: 'bad_request' } }])
  await ensureServerCalendar('token')
  assert.equal(fatal.attempts(), 1)
  assert.equal(fatal.events[1].detail?.kind, 'server')

  const flaky = harness([{ status: 503, body: { ok: false, retryable: true, degraded: ['partials'] } }])
  await ensureServerCalendar('token')
  assert.equal(flaky.attempts(), 3, 'un fallo recuperable se reintenta antes de avisar')
  assert.equal(flaky.events.filter(e=>e.type==='camino:plan-error').length, 1, 'el aviso se manda una sola vez, al final')
})

test('force viaja tal cual: el reintento del alumno no puede caer en el throttle diario', async () => {
  const { calls } = harness([{ status: 200, body: { ok: true } }])
  await ensureServerCalendar('token', true)
  assert.deepEqual(calls, [{ force: true }])
})


test('several callers in the same session share one request and result', async () => {
  const h = harness([{status:200,body:{ok:true}}])
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  const fetchImpl = globalThis.fetch
  globalThis.fetch = async (...args) => { await gate; return fetchImpl(...args) }
  const a = ensureServerCalendar('shared'), b = ensureServerCalendar('shared')
  assert.equal(a,b)
  release()
  assert.deepEqual(await Promise.all([a,b]),[true,true])
  assert.equal(h.attempts(),1)
  assert.equal(h.events.filter(e=>e.type==='camino:updated').length,1)
})

test('force queues after a normal request, and simultaneous force callers share it', async () => {
  const h=harness([{status:200,body:{ok:true}}])
  let release!: () => void
  const gate=new Promise<void>(resolve=>{release=resolve})
  const fetchImpl=globalThis.fetch
  globalThis.fetch=async (...args)=>{await gate;return fetchImpl(...args)}
  const normal=ensureServerCalendar('queue')
  const force=ensureServerCalendar('queue',true)
  assert.equal(force,ensureServerCalendar('queue',true))
  release()
  await Promise.all([normal,force])
  assert.deepEqual(h.calls,[{force:false},{force:true}])
})

test('busy waits beyond the old three attempts and resolves without an error event',async()=>{
  const h=harness([...Array.from({length:4},()=>({status:409,body:{error:'plan_busy'}})),{status:200,body:{ok:true}}])
  assert.equal(await ensureServerCalendar('long-running'),true)
  assert.equal(h.attempts(),5)
  assert.equal(h.events.filter(e=>e.type==='camino:plan-error').length,0)
})

test('persistent busy is bounded and a later retry is not stuck in a cached failure',async()=>{
  const h=harness([{status:409,body:{error:'plan_busy'}}])
  assert.equal(await ensureServerCalendar('persistent'),false)
  assert.equal(h.attempts(),8)
  assert.equal(h.events.find(e=>e.type==='camino:plan-error')?.detail?.kind,'busy')
  const retry=harness([{status:200,body:{ok:true}}])
  assert.equal(await ensureServerCalendar('persistent'),true)
  assert.equal(retry.attempts(),1)
})

test('different sessions never share a planning response',async()=>{
  const h=harness([{status:200,body:{ok:true}}])
  await Promise.all([ensureServerCalendar('one'),ensureServerCalendar('two')])
  assert.equal(h.attempts(),2)
})

test('opening a farther week queues the requested horizon without losing it behind the initial load',async()=>{
 const h=harness([{status:200,body:{ok:true}}])
 let release!:()=>void
 const gate=new Promise<void>(resolve=>{release=resolve}),fetchImpl=globalThis.fetch
 globalThis.fetch=async(...args)=>{await gate;return fetchImpl(...args)}
 const initial=ensureServerCalendar('week')
 const later=ensureServerCalendar('week',false,'2026-10-25')
 assert.equal(later,ensureServerCalendar('week',false,'2026-10-25'))
 release();await Promise.all([initial,later])
 assert.deepEqual(h.calls,[{force:false},{force:false,throughDate:'2026-10-25'}])
})

test('rapid navigation coalesces all waiting weeks into one request and preserves a pending settings change', async () => {
  const h = harness([{ status: 200, body: { ok: true } }])
  let release!: () => void
  const gate = new Promise<void>(resolve => { release = resolve })
  const fetchImpl = globalThis.fetch
  globalThis.fetch = async (...args) => { await gate; return fetchImpl(...args) }
  const active = ensureServerCalendar('rapid-weeks')
  const pending = ensureServerCalendar('rapid-weeks', false, '2026-10-25')
  for (const date of ['2026-11-01', '2026-11-08', '2026-11-15', '2026-12-06'])
    assert.equal(ensureServerCalendar('rapid-weeks', false, date), pending)
  assert.equal(ensureServerCalendar('rapid-weeks', true), pending)
  release()
  assert.deepEqual(await Promise.all([active, pending]), [true, true])
  assert.deepEqual(h.calls, [{ force: false }, { force: true, throughDate: '2026-12-06' }])
})
