const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), crypto = require('node:crypto')
const ts = require('typescript')
const root = path.resolve(__dirname, '../..')
function runtime(today = '2027-05-17', overrides = {}) {
  const cache = new Map()
  class Clock extends Date { constructor(...args) { super(...(args.length ? args : [today + 'T08:00:00Z'])) } static now() { return new Date(today + 'T08:00:00Z').getTime() } }
  const stubs = {
    'app/lib/calendar/availability.ts': { getAvailabilityForDate: async () => [] },
    'app/lib/calendar/sync.ts': { syncKairoMissionsToGoogle: async () => ({ failed: 0 }) },
    'app/lib/email/sendWelcomeEmail.ts': { sendWelcomeEmail: async () => {} },
    'app/lib/unsubscribeToken.ts': { generateUnsubscribeToken: () => 'test' },
    'app/lib/betaMetrics.ts': { recordBetaMetric: async () => {} },
    ...overrides,
  }
  function load(name) {
    name = name.replaceAll('\\', '/')
    if (stubs[name]) return stubs[name]
    if (cache.has(name)) return cache.get(name).exports
    const module = { exports: {} }; cache.set(name, module)
    const filename = path.join(root, name)
    const js = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText
    const resolve = key => {
      if (key === 'server-only') return {}
      if (!key.startsWith('.') && !key.startsWith('@/')) return require(key)
      let resolved = key.startsWith('@/') ? key.slice(2) : path.relative(root, path.resolve(path.dirname(filename), key))
      if (resolved.endsWith('.json')) return JSON.parse(fs.readFileSync(path.join(root, resolved), 'utf8'))
      if (!/\.[cm]?[jt]sx?$/.test(resolved)) resolved += '.ts'
      return load(resolved)
    }
    vm.runInNewContext(js, { module, exports: module.exports, require: resolve, console, Date: Clock, Map, Set, crypto,
      process: { env: {} }, setTimeout, clearTimeout, URL, window: { dispatchEvent() {} }, Event: class Event {} }, { filename })
    return module.exports
  }
  return load
}
function database(initial = {}) {
  const tables = structuredClone(initial), locks = new Set(), failures = []
  let tick = 1
  const tableRows = name => tables[name] ??= []
  function reconcile(user) {
    const calendar = tableRows('camino_calendar'), queue = tableRows('user_learning_queue')
    for (const row of calendar.filter(r => r.user_id === user)) {
      const q = queue.find(q => q.id === row.queue_id)
      if (row.status === 'unscheduled' && (q?.queue_status === 'completed' || calendar.some(c => c.queue_id && c.queue_id === row.queue_id && ['pending','postponed','completed'].includes(c.status)))) row.status = 'superseded'
      if (['unscheduled','superseded'].includes(row.status)) row.start_time = row.end_time = null
    }
    for (const q of queue.filter(q => q.user_id === user && ['pending','scheduled'].includes(q.queue_status))) {
      const c = calendar.find(c => c.queue_id === q.id && ['pending','postponed'].includes(c.status))
      if (c) { q.queue_status = 'scheduled'; q.calendar_id = c.id }
      else if (q.queue_status === 'scheduled') { q.queue_status = 'pending'; q.calendar_id = null }
    }
  }
  const db = { tables, failNext(table, action = 'select') { failures.push({ table, action }) },
    from(table) {
      let action = 'select', values, filters = [], orders = [], limit = Infinity, offset = 0, single = false, head = false, strict = false, conflict, ignore = false
      const q = {
        select(_fields, options = {}) { head = options.head; return q },
        insert(v) { action = 'insert'; values = v; return q },
        upsert(v, options = {}) { action = 'upsert'; values = v; conflict = options.onConflict; ignore = options.ignoreDuplicates; return q },
        update(v) { action = 'update'; values = v; return q }, delete() { action = 'delete'; return q },
        eq(k,v) { filters.push(r => r[k] === v); return q }, neq(k,v) { filters.push(r => r[k] !== v); return q },
        in(k,v) { filters.push(r => v.includes(r[k])); return q },
        gte(k,v) { filters.push(r => r[k] >= v); return q }, lte(k,v) { filters.push(r => r[k] <= v); return q },
        gt(k,v) { filters.push(r => r[k] > v); return q }, lt(k,v) { filters.push(r => r[k] < v); return q },
        not(k,op,v) { filters.push(r => op === 'is' ? r[k] != null : r[k] !== v); return q },
        filter(k,op,v) { const [col,key] = k.split('->>'); filters.push(r => (key ? r[col]?.[key] : r[col]) === v); return q },
        or(expr) { if (expr.startsWith('scheduled_date.gte.')) { const date = expr.split(',')[0].slice(19); filters.push(r => r.scheduled_date >= date || r.status === 'unscheduled') } return q },
        order(k,opt = {}) { orders.push([k,opt.ascending !== false]); return q },
        limit(n) { limit = n; return q }, range(a,b) { offset = a; limit = b-a+1; return q },
        maybeSingle() { single = true; return q }, single() { single = true; return q }, throwOnError() { strict = true; return q },
        then(resolve,reject) { return Promise.resolve().then(() => {
          const failure = failures.findIndex(f => f.table === table && f.action === action)
          if (failure >= 0) { failures.splice(failure,1); if (strict) throw new Error('injected_write_failure'); return { data: null, error: { message: 'injected_write_failure' } } }
          let rows = tableRows(table), selected = rows.filter(r => filters.every(f => f(r)))
          if (action === 'delete') { tables[table] = rows.filter(r => !selected.includes(r)); return { data: [], error: null } }
          if (action === 'update') selected.forEach(r => Object.assign(r, structuredClone(values), { updated_at: `2027-01-01T00:00:${String(tick++ % 60).padStart(2,'0')}Z` }))
          if (action === 'insert' || action === 'upsert') {
            selected = []
            for (const val of Array.isArray(values) ? values : [values]) {
              let existing = conflict && rows.find(r => conflict.split(',').every(k => r[k] === val[k]))
              if (existing) { if (!ignore) Object.assign(existing, structuredClone(val)); selected.push(existing); continue }
              const row = { id: crypto.randomUUID(), created_at: '2027-01-01T00:00:00Z', updated_at: '2027-01-01T00:00:00Z', metadata: {}, ...structuredClone(val) }
              rows.push(row); selected.push(row)
            }
          }
          for (const [key, asc] of [...orders].reverse()) selected.sort((a,b) => String(a[key] ?? '').localeCompare(String(b[key] ?? '')) * (asc ? 1 : -1))
          const count = selected.length; selected = selected.slice(offset, offset + limit)
          return { data: head ? null : single ? (selected[0] ?? null) : selected, count, error: null }
        }).then(resolve,reject) },
      }
      return q
    },
    async rpc(name,args) {
      const user = args.p_user_id
      if (name === 'camino_claim_plan') { if (locks.has(user)) return { data: false, error: null }; locks.add(user); return { data: true, error: null } }
      if (name === 'camino_release_plan') { locks.delete(user); return { error: null } }
      if (name === 'camino_reconcile_work') { reconcile(user); return { error: null } }
      if (name === 'camino_apply_placements') {
        const rows = tableRows('camino_calendar')
        for (const change of args.p_changes) {
          const row = rows.find(r => r.id === change.id && r.user_id === user)
          if (!row || row.status !== change.expected_status || row.updated_at !== change.expected_updated_at) return { error: { message: 'plan_changed_retry' } }
        }
        for (const change of args.p_changes) { const { expected_status, expected_updated_at, ...patch } = change; Object.assign(rows.find(r => r.id === change.id),patch) }
        reconcile(user); return { error: null }
      }
      throw new Error('Unmocked RPC: ' + name)
    },
  }
  return db
}
module.exports = { runtime, database }
