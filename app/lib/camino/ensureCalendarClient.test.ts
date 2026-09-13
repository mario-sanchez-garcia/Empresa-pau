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
  assert.deepEqual(events.map(event => event.type), ['camino:plan-error'])
  assert.deepEqual(events[0].detail, { kind: 'degraded', steps: ['calendar_upsert', 'personalization'], status: 503 })
})

test('un plan ocupado y una caida de red no se cuentan como el mismo fallo', async () => {
  const busy = harness([{ status: 409, body: { ok: false, retryable: true, error: 'plan_busy' } }])
  await ensureServerCalendar('token')
  assert.equal(busy.events[0].detail?.kind, 'busy')
  assert.deepEqual(busy.events[0].detail?.steps, [])

  const globals = globalThis as Record<string, unknown>
  const seen: { type: string }[] = []
  globals.setTimeout = ((fn: () => void) => { fn(); return 0 }) as unknown as typeof setTimeout
  globals.window = { dispatchEvent(event: Event) { seen.push({ type: event.type }); return true } }
  globals.fetch = async () => { throw new Error('offline') }
  assert.equal(await ensureServerCalendar('token'), false)
  assert.equal(seen.length, 1)
})

test('una respuesta correcta no inventa un fallo y no reintenta', async () => {
  const { events, attempts } = harness([{ status: 200, body: { ok: true, skipped: 'already_ensured_today' } }])
  assert.equal(await ensureServerCalendar('token'), true)
  assert.deepEqual(events.map(event => event.type), ['camino:updated'])
  assert.equal(attempts(), 1)
})

test('un error no reintentable se rinde a la primera; uno reintentable agota los tres intentos', async () => {
  const fatal = harness([{ status: 400, body: { ok: false, retryable: false, error: 'bad_request' } }])
  await ensureServerCalendar('token')
  assert.equal(fatal.attempts(), 1)
  assert.equal(fatal.events[0].detail?.kind, 'server')

  const flaky = harness([{ status: 503, body: { ok: false, retryable: true, degraded: ['partials'] } }])
  await ensureServerCalendar('token')
  assert.equal(flaky.attempts(), 3, 'un fallo recuperable se reintenta antes de avisar')
  assert.equal(flaky.events.length, 1, 'el aviso se manda una sola vez, al final')
})

test('force viaja tal cual: el reintento del alumno no puede caer en el throttle diario', async () => {
  const { calls } = harness([{ status: 200, body: { ok: true } }])
  await ensureServerCalendar('token', true)
  assert.deepEqual(calls, [{ force: true }])
})
