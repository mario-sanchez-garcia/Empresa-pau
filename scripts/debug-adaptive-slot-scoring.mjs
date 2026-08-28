import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import vm from 'node:vm'
import { createClient } from '@supabase/supabase-js'
import ts from 'typescript'

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
}

function loadDotEnvLocal() {
  const file = new URL('../.env.local', import.meta.url)
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || process.env[match[1]]) continue
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
  }
}

function loadSlotScoring(env = {}) {
  const source = read('app/lib/camino/slotScoring.ts')
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText
  const module = { exports: {} }
  vm.runInNewContext(js, {
    exports: module.exports,
    module,
    require: () => ({}),
    console,
    process: { env },
  }, { filename: 'slotScoring.ts' })
  return module.exports
}

function toMinutes(hhmm) {
  const [h, m] = String(hhmm).slice(0, 5).split(':').map(Number)
  return h * 60 + (m || 0)
}

function studyWindowFor(dateStr) {
  const dow = new Date(`${dateStr}T12:00:00Z`).getUTCDay()
  return dow === 0 || dow === 6 ? { start: '10:00', end: '21:00' } : { start: '16:00', end: '22:00' }
}

function timeBucketFor(startTime, window) {
  const position = (toMinutes(startTime) - toMinutes(window.start)) / Math.max(1, toMinutes(window.end) - toMinutes(window.start))
  if (position < 1 / 3) return 'early'
  if (position < 2 / 3) return 'middle'
  return 'late'
}

function durationBucketFor(minutes) {
  if (minutes <= 30) return 'short'
  if (minutes <= 45) return 'medium'
  if (minutes <= 60) return 'long'
  return 'extraLong'
}

function smoothedRate(completed, total, config) {
  return (completed + config.smoothingPriorRate * config.smoothingPriorWeight) / (total + config.smoothingPriorWeight)
}

function completionStats(rows, config) {
  const empty = () => ({ completed: 0, total: 0, smoothedRate: 0, adjustment: 0 })
  const stats = {
    sampleSize: 0,
    completed: 0,
    timeOfDay: { early: empty(), middle: empty(), late: empty() },
    durationFit: { short: empty(), medium: empty(), long: empty(), extraLong: empty() },
    continuity: empty(),
  }
  const relevant = rows
    .filter(row => row.start_time && row.end_time && ['completed', 'missed', 'postponed'].includes(row.status ?? ''))
    .slice(0, config.historyLimit)
    .sort((a, b) => `${a.scheduled_date ?? ''} ${a.start_time ?? ''}`.localeCompare(`${b.scheduled_date ?? ''} ${b.start_time ?? ''}`))

  for (let index = 0; index < relevant.length; index += 1) {
    const row = relevant[index]
    const minutes = toMinutes(row.end_time) - toMinutes(row.start_time)
    if (!row.scheduled_date || minutes <= 0) continue
    const completed = row.status === 'completed'
    const timeBucket = timeBucketFor(row.start_time, studyWindowFor(row.scheduled_date))
    const durationBucket = durationBucketFor(minutes)
    stats.timeOfDay[timeBucket].total += 1
    stats.durationFit[durationBucket].total += 1
    stats.sampleSize += 1
    if (completed) {
      stats.timeOfDay[timeBucket].completed += 1
      stats.durationFit[durationBucket].completed += 1
      stats.completed += 1
    }
    const previous = relevant[index - 1]
    if (previous?.subject && row.subject && previous.subject === row.subject && previous.scheduled_date === row.scheduled_date) {
      stats.continuity.total += 1
      if (completed) stats.continuity.completed += 1
    }
  }

  const baseline = stats.sampleSize > 0 ? smoothedRate(stats.completed, stats.sampleSize, config) : config.smoothingPriorRate
  const finishBucket = (bucket, minSample, scale) => {
    bucket.smoothedRate = bucket.total ? smoothedRate(bucket.completed, bucket.total, config) : 0
    const delta = bucket.total >= minSample ? bucket.smoothedRate - baseline : 0
    bucket.adjustment = Math.abs(delta) >= config.minimumMeaningfulDelta ? Math.round(delta * scale) : 0
  }
  for (const bucket of Object.values(stats.timeOfDay)) finishBucket(bucket, config.minSampleTimeBucket, config.timeBucketScale)
  for (const bucket of Object.values(stats.durationFit)) finishBucket(bucket, config.minSampleDurationBucket, config.durationBucketScale)
  finishBucket(stats.continuity, config.minSampleContinuity, config.continuityScale)
  return { ...stats, baselineSmoothedRate: baseline }
}

function anonymize(value) {
  return createHash('sha256').update(String(value)).digest('hex').slice(0, 10)
}

function describeSupabaseError(error) {
  if (!error) return 'unknown'
  const parts = [error.code, error.name, error.message, error.details, error.hint]
    .filter(value => typeof value === 'string' && value.trim())
  return parts.length ? parts.join(':').slice(0, 220) : JSON.stringify(error).slice(0, 220)
}

function signed(value) {
  if (value == null) return 'n/a'
  return value > 0 ? `+${value}` : String(value)
}

function printProfile(label, profile, stats) {
  console.log(`\n=== ${label} ===`)
  if (!profile) {
    console.log('Sin perfil disponible.')
    return
  }
  console.log(`sample total: ${profile.sampleSize}`)
  console.log(`confidence: ${profile.confidence}`)
  console.log(`completion rate suavizado global: ${(stats.baselineSmoothedRate * 100).toFixed(1)}%`)
  for (const [bucket, data] of Object.entries(stats.timeOfDay)) {
    console.log(`${bucket}: ${data.completed}/${data.total} · suavizado ${(data.smoothedRate * 100).toFixed(1)}% · ajuste ${signed(profile.timeOfDay[bucket])}`)
  }
  for (const [bucket, data] of Object.entries(stats.durationFit)) {
    console.log(`duracion ${bucket}: ${data.completed}/${data.total} · suavizado ${(data.smoothedRate * 100).toFixed(1)}% · ajuste ${signed(profile.durationFit[bucket])}`)
  }
  console.log(`continuidad: ${stats.continuity.completed}/${stats.continuity.total} · suavizado ${(stats.continuity.smoothedRate * 100).toFixed(1)}% · ajuste ${signed(profile.continuityAdjustment)}`)
}

function busyOutside(starts, duration = 45, window = { start: '16:00', end: '21:00' }) {
  const allowed = new Set(starts)
  const busy = []
  for (let cursor = toMinutes(window.start); cursor < toMinutes(window.end); cursor += 15) {
    const start = `${String(Math.floor(cursor / 60)).padStart(2, '0')}:${String(cursor % 60).padStart(2, '0')}`
    const endMinutes = cursor + 15
    const end = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}`
    const allowedForCandidate = [...allowed].some(candidate => {
      const cStart = toMinutes(candidate)
      const cEnd = cStart + duration
      return Math.max(cStart, cursor) < Math.min(cEnd, endMinutes)
    })
    if (!allowedForCandidate) busy.push({ start, end })
  }
  return busy
}

function artificialRows({ early = { completed: 0, missed: 0 }, middle = { completed: 0, missed: 0 }, late = { completed: 0, missed: 0 }, long = { completed: 0, missed: 0 }, continuity = { completed: 0, missed: 0 } } = {}) {
  const rows = []
  const add = (count, row) => {
    for (let i = 0; i < count; i += 1) rows.push({ scheduled_date: `2026-06-${String((rows.length % 20) + 1).padStart(2, '0')}`, ...row })
  }
  add(early.completed, { status: 'completed', start_time: '16:30', end_time: '17:00', subject: 'matematicas_ii', mission_type: 'concept' })
  add(early.missed, { status: 'missed', start_time: '16:30', end_time: '17:00', subject: 'matematicas_ii', mission_type: 'concept' })
  add(middle.completed, { status: 'completed', start_time: '18:00', end_time: '18:30', subject: 'lengua', mission_type: 'concept' })
  add(middle.missed, { status: 'missed', start_time: '18:00', end_time: '18:30', subject: 'lengua', mission_type: 'concept' })
  add(late.completed, { status: 'completed', start_time: '20:00', end_time: '20:30', subject: 'historia_espana', mission_type: 'review' })
  add(late.missed, { status: 'missed', start_time: '20:00', end_time: '20:30', subject: 'historia_espana', mission_type: 'review' })
  add(long.completed, { status: 'completed', start_time: '17:30', end_time: '18:45', subject: 'fisica', mission_type: 'pau_practice' })
  add(long.missed, { status: 'missed', start_time: '17:30', end_time: '18:45', subject: 'fisica', mission_type: 'pau_practice' })
  for (let i = 0; i < continuity.completed; i += 1) {
    rows.push({ scheduled_date: `2026-07-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', subject: 'quimica', mission_type: 'concept' })
    rows.push({ scheduled_date: `2026-07-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:30', end_time: '17:00', subject: 'quimica', mission_type: 'concept' })
  }
  for (let i = 0; i < continuity.missed; i += 1) {
    rows.push({ scheduled_date: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`, status: 'completed', start_time: '16:00', end_time: '16:30', subject: 'quimica', mission_type: 'concept' })
    rows.push({ scheduled_date: `2026-08-${String((i % 20) + 1).padStart(2, '0')}`, status: 'missed', start_time: '16:30', end_time: '17:00', subject: 'quimica', mission_type: 'concept' })
  }
  return rows
}

function printScenario(label, input, profile, enabledScoring, disabledScoring) {
  const context = { ...(input.context ?? {}) }
  const baseRows = disabledScoring.getSlotScoringDebug(input.duration, input.busy ?? [], input.window ?? { start: '16:00', end: '21:00' }, { ...context, behaviorProfile: profile })
  const adaptiveRows = enabledScoring.getSlotScoringDebug(input.duration, input.busy ?? [], input.window ?? { start: '16:00', end: '21:00' }, { ...context, behaviorProfile: profile })
  const baseWinner = baseRows.find(row => row.valid)
  const adaptiveWinner = adaptiveRows.find(row => row.valid)
  console.log(`\n=== ESCENARIO ${label} ===`)
  console.log(`Mission: ${input.name}`)
  console.log(`Base winner: ${baseWinner ? baseWinner.start : 'sin hueco'}`)
  console.log(`Adaptive winner: ${adaptiveWinner ? adaptiveWinner.start : 'sin hueco'}`)
  for (const row of adaptiveRows.filter(row => row.valid).slice(0, 4)) {
    console.log(`\n${row.start}`)
    console.log(`base: ${row.baseScore}`)
    console.log(`personal: ${signed(row.personalAdjustment)}`)
    console.log(`final: ${row.finalScore}`)
    console.log(`base reasons: ${row.reasons.slice(0, 5).join(', ')}`)
    console.log(`personal reasons: ${row.personalReasons.length ? row.personalReasons.join(', ') : '-'}`)
  }
  return { label, baseWinner: baseWinner?.start ?? null, adaptiveWinner: adaptiveWinner?.start ?? null, rows: adaptiveRows }
}

function printDateScenario(label, input, profile, enabledScoring, disabledScoring) {
  const candidates = input.candidates.map(candidate => {
    const base = disabledScoring.scoreDateSlot({
      date: candidate.date,
      slot: candidate.slot,
      busy: candidate.busy,
      context: { ...input.context, behaviorProfile: profile },
      dateIndex: candidate.dateIndex,
    })
    const adaptive = enabledScoring.scoreDateSlot({
      date: candidate.date,
      slot: candidate.slot,
      busy: candidate.busy,
      context: { ...input.context, behaviorProfile: profile },
      dateIndex: candidate.dateIndex,
    })
    return { ...candidate, base, adaptive }
  })
  const baseWinner = [...candidates].sort((a, b) => b.base.score - a.base.score || `${a.date} ${a.slot.start}`.localeCompare(`${b.date} ${b.slot.start}`))[0]
  const adaptiveWinner = [...candidates].sort((a, b) => b.adaptive.score - a.adaptive.score || `${a.date} ${a.slot.start}`.localeCompare(`${b.date} ${b.slot.start}`))[0]
  console.log(`\n=== ESCENARIO ${label} ===`)
  console.log(`Mission: ${input.name}`)
  console.log(`Base winner: ${baseWinner.date} ${baseWinner.slot.start}`)
  console.log(`Adaptive winner: ${adaptiveWinner.date} ${adaptiveWinner.slot.start}`)
  for (const candidate of candidates) {
    console.log(`\n${candidate.date} ${candidate.slot.start}`)
    console.log(`base: ${candidate.adaptive.baseScore}`)
    console.log(`personal: ${signed(candidate.adaptive.personalAdjustment)}`)
    console.log(`final: ${candidate.adaptive.finalScore}`)
    console.log(`base reasons: ${candidate.adaptive.reasons.slice(0, 5).join(', ')}`)
    console.log(`personal reasons: ${candidate.adaptive.personalReasons.length ? candidate.adaptive.personalReasons.join(', ') : '-'}`)
  }
  return {
    label,
    baseWinner: `${baseWinner.date} ${baseWinner.slot.start}`,
    adaptiveWinner: `${adaptiveWinner.date} ${adaptiveWinner.slot.start}`,
    rows: candidates.map(candidate => ({ personalAdjustment: candidate.adaptive.personalAdjustment })),
  }
}

async function loadRealRows(config) {
  loadDotEnvLocal()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return { rows: [], reason: 'missing_supabase_env' }
  const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  let userId = process.env.KAIRO_DEBUG_USER_ID
  if (!userId) {
    const { data, error } = await db
      .from('camino_calendar')
      .select('user_id, scheduled_date, status, start_time, end_time, subject, mission_type')
      .in('status', ['completed', 'missed', 'postponed'])
      .not('start_time', 'is', null)
      .not('end_time', 'is', null)
      .order('scheduled_date', { ascending: false })
      .limit(500)
    if (error) return { rows: [], reason: `supabase_user_lookup_error:${describeSupabaseError(error)}` }
    const counts = new Map()
    for (const row of data ?? []) counts.set(row.user_id, (counts.get(row.user_id) ?? 0) + 1)
    userId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
  }
  if (!userId) return { rows: [], reason: 'no_timed_behavior_rows' }
  const { data, error } = await db
    .from('camino_calendar')
    .select('scheduled_date, status, start_time, end_time, subject, mission_type')
    .eq('user_id', userId)
    .in('status', ['completed', 'missed', 'postponed'])
    .not('start_time', 'is', null)
    .not('end_time', 'is', null)
    .order('scheduled_date', { ascending: false })
    .order('start_time', { ascending: false })
    .limit(config.historyLimit)
  if (error) return { rows: [], reason: `supabase_profile_error:${describeSupabaseError(error)}`, userHash: anonymize(userId) }
  return { rows: data ?? [], userHash: anonymize(userId) }
}

async function main() {
  const enabledScoring = loadSlotScoring({})
  const disabledScoring = loadSlotScoring({ ENABLE_ADAPTIVE_SLOT_SCORING: 'false' })
  const config = enabledScoring.ADAPTIVE_SLOT_SCORING_CONFIG
  console.log('Adaptive config:', JSON.stringify(config, null, 2))

  const real = await loadRealRows(config)
  if (real.reason) {
    console.log(`\n=== PERFIL REAL ===\nNo disponible: ${real.reason}`)
  } else {
    const realProfile = enabledScoring.buildSchedulingBehaviorProfile(real.rows)
    const realStats = completionStats(real.rows, config)
    console.log(`Usuario analizado: anon_${real.userHash}`)
    printProfile('PERFIL REAL', realProfile, realStats)
  }

  const tieProfile = enabledScoring.buildSchedulingBehaviorProfile(artificialRows({ early: { completed: 10, missed: 1 }, middle: { completed: 5, missed: 5 }, late: { completed: 4, missed: 7 } }))
  const lateProfile = enabledScoring.buildSchedulingBehaviorProfile(artificialRows({ early: { completed: 1, missed: 10 }, middle: { completed: 5, missed: 5 }, late: { completed: 10, missed: 1 } }))
  const sparseProfile = enabledScoring.buildSchedulingBehaviorProfile(artificialRows({ early: { completed: 2, missed: 0 } }))
  const continuityProfile = enabledScoring.buildSchedulingBehaviorProfile(artificialRows({ middle: { completed: 2, missed: 8 }, late: { completed: 2, missed: 8 }, continuity: { completed: 7, missed: 0 } }))
  const extremeProfile = {
    sampleSize: 60,
    timeOfDay: { early: 99, middle: -99, late: 99 },
    durationFit: { short: 99, medium: 99, long: -99, extraLong: -99 },
    continuityAdjustment: 99,
    confidence: 1,
  }

  const results = [
    printScenario('A - dos huecos similares', {
      name: 'Repaso ligero con desempate personal',
      duration: 30,
      busy: busyOutside(['16:00', '20:00'], 30),
      context: { subject: 'historia_espana', missionType: 'review' },
    }, tieProfile, enabledScoring, disabledScoring),
    printScenario('B - examen urgente', {
      name: 'Simulacro dificil, examen manana',
      duration: 45,
      busy: busyOutside(['16:00', '20:00'], 45),
      context: { subject: 'matematicas_ii', missionType: 'mock_exam', daysUntilExam: 1, priority: 'high' },
    }, lateProfile, enabledScoring, disabledScoring),
    printDateScenario('C - dia saturado', {
      name: 'Comparacion de dia cargado vs ligero',
      context: { subject: 'lengua', missionType: 'concept' },
      candidates: [
        { date: '2026-09-15', dateIndex: 0, slot: { start: '16:00', end: '16:30' }, busy: [{ start: '17:00', end: '20:00' }] },
        { date: '2026-09-16', dateIndex: 1, slot: { start: '16:00', end: '16:30' }, busy: [{ start: '18:00', end: '19:00' }] },
      ],
    }, tieProfile, enabledScoring, disabledScoring),
    printScenario('D - continuidad', {
      name: 'Misma asignatura ya programada antes',
      duration: 30,
      busy: [{ start: '16:00', end: '16:30', subject: 'quimica' }, ...busyOutside(['16:30', '20:00'], 30)],
      context: { subject: 'quimica', missionType: 'concept' },
    }, continuityProfile, enabledScoring, disabledScoring),
    printScenario('E - historico insuficiente', {
      name: 'Pocas muestras early',
      duration: 30,
      busy: busyOutside(['16:30', '20:00'], 30),
      context: { subject: 'lengua', missionType: 'concept' },
    }, sparseProfile, enabledScoring, disabledScoring),
    printScenario('F - perfil extremo', {
      name: 'Perfil artificial extremo con cap',
      duration: 30,
      busy: [{ start: '16:00', end: '16:30', subject: 'quimica' }, ...busyOutside(['16:30', '20:00'], 30)],
      context: { subject: 'quimica', missionType: 'concept' },
    }, extremeProfile, enabledScoring, disabledScoring),
    printScenario('F2 - perfil extremo con urgencia', {
      name: 'Urgencia fuerte contra preferencia personal',
      duration: 45,
      busy: busyOutside(['16:00', '20:00'], 45),
      context: { subject: 'matematicas_ii', missionType: 'mock_exam', daysUntilExam: 1, priority: 'high' },
    }, extremeProfile, enabledScoring, disabledScoring),
  ]

  const changed = results.filter(result => result.baseWinner !== result.adaptiveWinner)
  const adjustments = results.flatMap(result => result.rows.filter(row => row.valid).map(row => row.personalAdjustment))
  const nonZero = adjustments.filter(value => value !== 0).length
  const capHits = adjustments.filter(value => Math.abs(value) >= config.maxPersonalAdjustment).length
  const urgent = results.find(result => result.label.startsWith('B'))
  console.log('\n=== RESUMEN DIAGNOSTICO ===')
  console.log(`decisiones cambiadas: ${changed.length}/${results.length}`)
  console.log(`ajustes no cero: ${nonZero}/${adjustments.length}`)
  console.log(`cap alcanzado: ${capHits}/${adjustments.length}`)
  console.log(`urgencia domina: ${urgent?.adaptiveWinner === '16:00' ? 'si' : 'revisar'}`)
  console.log(`determinismo: ${JSON.stringify(results.map(result => [result.label, result.adaptiveWinner])) === JSON.stringify(results.map(result => [result.label, result.adaptiveWinner])) ? 'ok' : 'revisar'}`)
}

main().catch(error => {
  console.error(error)
  process.exit(1)
})
