#!/usr/bin/env node
// Análisis de SOLO LECTURA de la telemetría de duración de Camino.
//
// Responde a una pregunta que hoy no sabemos contestar con datos: ¿cuánto
// cuesta DE VERDAD cada contenido? El motor estima hoy con constantes por
// mission_type (missionDuration.ts) y con la tabla por minutos declarados
// (dailyTimeCapacity.ts). Desde la migración de telemetría del 28/08,
// camino_calendar guarda `actual_duration_minutes` de cada misión terminada,
// y nadie lo ha agregado nunca por tema — slotScoring.ts solo lo usa para
// calibrar al ALUMNO ("¿termina en 45 min lo de 45?"), agrupando por duración
// planificada, nunca por contenido.
//
// NO escribe. NO cambia schema. NO toca Camino. Solo lee y cuenta.
//
// Advertencia metodológica que atraviesa todo el informe:
// `actual_duration_minutes` = completed_at − started_at, o sea RELOJ DE PARED.
// Incluye pausas, cenas y pestañas olvidadas. Por eso aquí no se usa la media
// como estadístico principal en ningún sitio: mediana, IQR y percentiles. Y
// por eso todo se muestra DOS VECES, con y sin filtro de atípicos: quitar
// datos en silencio es exactamente cómo se fabrica un modelo que parece
// bueno.
//
//   node scripts/camino-qa/analiza-carga-real.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// ── credenciales ──────────────────────────────────────────────────────────
for (const line of readFileSync(new URL('../../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}
const db = createClient(url, key, { auth: { persistSession: false } })

// Fecha en que la telemetría empezó a existir (migración
// 20260828173000_add_camino_mission_behavior_telemetry.sql). Antes de este
// día NINGUNA misión pudo registrar duración, así que incluirlas en el
// denominador solo sirve para inventarse un porcentaje de cobertura malo.
const TELEMETRY_SINCE = '2026-08-28'

// ── estadística ───────────────────────────────────────────────────────────
const quantile = (sorted, q) => {
  if (sorted.length === 0) return null
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos), hi = Math.ceil(pos)
  return lo === hi ? sorted[lo] : sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo)
}
const r1 = n => (n == null ? null : Math.round(n * 10) / 10)

function describe(values) {
  const s = [...values].sort((a, b) => a - b)
  const p25 = quantile(s, 0.25), p75 = quantile(s, 0.75)
  return {
    n: s.length,
    min: s[0] ?? null,
    p25: r1(p25),
    mediana: r1(quantile(s, 0.5)),
    p75: r1(p75),
    p90: r1(quantile(s, 0.9)),
    max: s[s.length - 1] ?? null,
    iqr: p25 != null && p75 != null ? r1(p75 - p25) : null,
  }
}

// ── lectura paginada ──────────────────────────────────────────────────────
async function readAll(build) {
  const out = []
  for (let from = 0; ; from += 1000) {
    const { data, error } = await build(from, from + 999)
    if (error) throw new Error(error.message)
    out.push(...(data ?? []))
    if (!data || data.length < 1000) return out
  }
}

console.log('Leyendo camino_calendar (solo lectura)…\n')
const rows = await readAll((from, to) => db
  .from('camino_calendar')
  .select('id, user_id, subject, mission_type, status, source, scheduled_date, start_time, end_time, started_at, completed_at, actual_duration_minutes, postpone_count, metadata')
  .eq('status', 'completed')
  .gte('scheduled_date', TELEMETRY_SINCE)
  .order('id')
  .range(from, to))

// ── 1. cobertura de la telemetría ─────────────────────────────────────────
const conDuracion = rows.filter(r => typeof r.actual_duration_minutes === 'number' && Number.isFinite(r.actual_duration_minutes))
const pct = rows.length ? (conDuracion.length / rows.length) * 100 : 0

console.log('═══ 1. COBERTURA DE LA TELEMETRÍA ═══')
console.log(`Misiones completadas desde ${TELEMETRY_SINCE}: ${rows.length}`)
console.log(`  …con actual_duration_minutes:            ${conDuracion.length}  (${r1(pct)}%)`)
console.log(`  …sin ella:                               ${rows.length - conDuracion.length}`)
const sinStart = rows.filter(r => !r.started_at).length
console.log(`  (de las que ${sinStart} no tienen started_at: se completaron sin pasar por start-mission)\n`)

if (conDuracion.length === 0) {
  console.log('No hay ni una sola medida. Nada que analizar todavía.')
  process.exit(0)
}

// ── 2. atípicos, mostrados ANTES de filtrar nada ──────────────────────────
// La duración PLANIFICADA de la fila es su hueco reservado (start_time →
// end_time), que es lo que de verdad ocupó en el día del alumno. Cuando no
// hay hueco, se usa metadata.estimated_minutes.
const toMin = t => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0) }
const planificada = r => {
  const a = toMin(r.start_time), b = toMin(r.end_time)
  if (a != null && b != null && b > a) return b - a
  const est = r.metadata?.estimated_minutes
  return typeof est === 'number' && est > 0 ? est : null
}

const enriquecidas = conDuracion.map(r => {
  const plan = planificada(r)
  return {
    ...r,
    plan,
    ratio: plan ? r.actual_duration_minutes / plan : null,
    topic: r.metadata?.topic_slug ?? null,
    block: r.metadata?.block_slug ?? r.metadata?.block_key ?? null,
    tipo: r.mission_type ?? r.metadata?.mission_type ?? 'concept',
  }
})

const MUY_CORTA = 2      // min: por debajo de esto no cabe haber hecho nada
const MUY_LARGA = 240    // min: 4h de reloj = pestaña olvidada, no estudio
const RATIO_ABSURDO = 6  // 6× lo reservado

const cortas = enriquecidas.filter(r => r.actual_duration_minutes < MUY_CORTA)
const largas = enriquecidas.filter(r => r.actual_duration_minutes > MUY_LARGA)
const absurdas = enriquecidas.filter(r => r.ratio != null && r.ratio > RATIO_ABSURDO)

console.log('═══ 2. ATÍPICOS (se enseñan, no se esconden) ═══')
console.log(`Duración < ${MUY_CORTA} min:        ${cortas.length}  (${r1(cortas.length / enriquecidas.length * 100)}%)`)
console.log(`Duración > ${MUY_LARGA} min:      ${largas.length}  (${r1(largas.length / enriquecidas.length * 100)}%)`)
console.log(`Ratio real/plan > ${RATIO_ABSURDO}×:      ${absurdas.length}  (${r1(absurdas.length / enriquecidas.length * 100)}%)`)
console.log(`Sin duración planificada:   ${enriquecidas.filter(r => r.plan == null).length}`)
console.log('\nGlobal, TODAS las observaciones:')
console.table([describe(enriquecidas.map(r => r.actual_duration_minutes))])

const limpias = enriquecidas.filter(r =>
  r.actual_duration_minutes >= MUY_CORTA &&
  r.actual_duration_minutes <= MUY_LARGA &&
  (r.ratio == null || r.ratio <= RATIO_ABSURDO))
console.log(`Global, sin atípicos (quedan ${limpias.length} de ${enriquecidas.length}):`)
console.table([describe(limpias.map(r => r.actual_duration_minutes))])

// ── 3. distribuciones por agrupador ───────────────────────────────────────
function agrupa(datos, clave, etiqueta, minN = 1) {
  const grupos = new Map()
  for (const r of datos) {
    const k = clave(r)
    if (k == null) continue
    if (!grupos.has(k)) grupos.set(k, [])
    grupos.get(k).push(r)
  }
  const filas = [...grupos.entries()]
    .filter(([, v]) => v.length >= minN)
    .map(([k, v]) => {
      const d = describe(v.map(x => x.actual_duration_minutes))
      const planes = v.map(x => x.plan).filter(x => x != null)
      const ratios = v.map(x => x.ratio).filter(x => x != null).sort((a, b) => a - b)
      return {
        [etiqueta]: String(k).slice(0, 42),
        n: d.n,
        p25: d.p25, mediana: d.mediana, p75: d.p75, p90: d.p90,
        iqr: d.iqr,
        plan_med: planes.length ? r1(quantile([...planes].sort((a, b) => a - b), 0.5)) : null,
        ratio_med: ratios.length ? r1(quantile(ratios, 0.5)) : null,
      }
    })
    .sort((a, b) => b.n - a.n)
  return filas
}

for (const [datos, titulo] of [[enriquecidas, 'CON atípicos'], [limpias, 'SIN atípicos']]) {
  console.log(`\n═══ 3. DISTRIBUCIONES — ${titulo} ═══`)
  console.log('\nPor asignatura:');    console.table(agrupa(datos, r => r.subject, 'asignatura'))
  console.log('Por mission_type:');   console.table(agrupa(datos, r => r.tipo, 'mission_type'))
  console.log('Por source:');         console.table(agrupa(datos, r => r.source, 'source'))
  console.log('Por bloque (top 15):');console.table(agrupa(datos, r => r.block && `${r.subject}/${r.block}`, 'bloque').slice(0, 15))
  console.log('Por topic_slug (top 15):'); console.table(agrupa(datos, r => r.topic && `${r.subject}/${r.topic}`, 'tema').slice(0, 15))
}

// ── 4. ¿hay muestra suficiente para un modelo por tema? ────────────────────
console.log('\n═══ 4. MUESTRA DISPONIBLE POR NIVEL ═══')
for (const [datos, titulo] of [[enriquecidas, 'CON atípicos'], [limpias, 'SIN atípicos']]) {
  const porNivel = (clave) => {
    const c = new Map()
    for (const r of datos) { const k = clave(r); if (k != null) c.set(k, (c.get(k) ?? 0) + 1) }
    return c
  }
  const temas = porNivel(r => r.topic && `${r.subject}/${r.topic}`)
  const bloques = porNivel(r => r.block && `${r.subject}/${r.block}`)
  const st = porNivel(r => `${r.subject}/${r.tipo}`)
  const cuenta = (m, min) => [...m.values()].filter(v => v >= min).length
  console.log(`\n${titulo}:`)
  console.table([
    { nivel: 'topic_slug',           distintos: temas.size,   'n>=3': cuenta(temas, 3),   'n>=5': cuenta(temas, 5),   'n>=10': cuenta(temas, 10) },
    { nivel: 'bloque',               distintos: bloques.size, 'n>=3': cuenta(bloques, 3), 'n>=5': cuenta(bloques, 5), 'n>=10': cuenta(bloques, 10) },
    { nivel: 'asignatura+tipo',      distintos: st.size,      'n>=3': cuenta(st, 3),      'n>=5': cuenta(st, 5),      'n>=10': cuenta(st, 10) },
  ])
}
const temasTotales = new Set(enriquecidas.map(r => r.topic && `${r.subject}/${r.topic}`).filter(Boolean)).size
console.log(`\nDenominador: el temario tiene 569 temas cargados. Con medida: ${temasTotales}.`)

// ── 5. duración ≠ aprendizaje: qué señales hay para cruzar ────────────────
console.log('\n═══ 5. SEÑALES DISPONIBLES PARA CRUZAR CON DURACIÓN ═══')
console.log('(una misión de 8 min puede ser fácil… o hecha mal y rápido)')
const conNota = enriquecidas.filter(r => r.metadata?.score != null || r.metadata?.grade != null || r.metadata?.correction_id != null)
const conAciertos = enriquecidas.filter(r => r.metadata?.correct_count != null || r.metadata?.answers != null)
const conPospuestas = enriquecidas.filter(r => (r.postpone_count ?? 0) > 0)
console.table([
  { señal: 'metadata.score / grade / correction_id', misiones: conNota.length,      pct: r1(conNota.length / enriquecidas.length * 100) },
  { señal: 'metadata.correct_count / answers',       misiones: conAciertos.length,  pct: r1(conAciertos.length / enriquecidas.length * 100) },
  { señal: 'postpone_count > 0',                     misiones: conPospuestas.length,pct: r1(conPospuestas.length / enriquecidas.length * 100) },
])
const claves = new Map()
for (const r of enriquecidas) for (const k of Object.keys(r.metadata ?? {})) claves.set(k, (claves.get(k) ?? 0) + 1)
console.log('\nClaves de metadata más frecuentes (candidatas a señal de aprendizaje):')
console.table([...claves.entries()].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, v]) => ({ clave: k, misiones: v, pct: r1(v / enriquecidas.length * 100) })))
