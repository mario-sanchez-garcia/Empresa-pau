// Puebla curriculum_topics (ver migración
// 20260825120000_create_curriculum_topics_and_exam_relations.sql) a partir
// de los dos orígenes de datos que hoy son la única identidad real de un
// "tema" en Kairo:
//   - app/data/camino/curriculum_seed.json (temas de curriculum_content_v2)
//   - app/lib/camino/betaCurriculum.ts (temas de la beta privada, PRIVATE_BETA_CURRICULUM_TOPICS)
//
// betaCurriculum.ts es TypeScript con funciones que generan contenido de
// lección — no se importa/ejecuta aquí. Solo se extraen con una regex los
// argumentos literales de cada `topic({ subject, orderIndex, blockSlug,
// blockTitle, topicSlug, title, ... })`, que es todo lo que curriculum_topics
// necesita. Si algún topic() no matchea el patrón esperado, el script aborta
// en vez de insertar filas a medias.
//
// Idempotente: usa upsert con onConflict (subject, topic_slug), así que
// puede re-ejecutarse sin duplicar filas.
//
// Igual que scripts/seed-camino-curriculum.mjs: sin
// NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY en el entorno, solo
// imprime el resumen (dry-run) y no escribe nada.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const seedPath = new URL('../app/data/camino/curriculum_seed.json', import.meta.url)
const betaPath = new URL('../app/lib/camino/betaCurriculum.ts', import.meta.url)

const seedRaw = JSON.parse(readFileSync(seedPath, 'utf8'))
const seedTopics = seedRaw.map(item => ({
  subject: item.subject,
  comunidad: null,
  block_key: item.blockSlug,
  block_title: item.blockTitle,
  topic_slug: item.topicSlug,
  title: item.title,
  order: item.orderIndex,
}))

const betaSrc = readFileSync(betaPath, 'utf8')
const topicCallCount = (betaSrc.match(/^  topic\(\{/gm) ?? []).length
const topicLineRe = /^  topic\(\{ subject: '([^']*)', orderIndex: (\d+), blockSlug: '([^']*)', blockTitle: '([^']*)', topicSlug: '([^']*)', title: '([^']*)'/gm
const betaTopics = []
let match
while ((match = topicLineRe.exec(betaSrc)) !== null) {
  betaTopics.push({
    subject: match[1],
    comunidad: null,
    block_key: match[3],
    block_title: match[4],
    topic_slug: match[5],
    title: match[6],
    order: Number(match[2]),
  })
}

if (betaTopics.length !== topicCallCount) {
  console.error(
    `betaCurriculum.ts: se esperaban ${topicCallCount} entradas topic({...}) pero la regex solo reconoció ${betaTopics.length}. ` +
    'Alguna línea no matchea el patrón esperado (subject, orderIndex, blockSlug, blockTitle, topicSlug, title en ese orden) — abortando sin escribir nada.'
  )
  process.exit(1)
}

const allTopics = [...seedTopics, ...betaTopics]

// Validación de forma, igual que se haría antes del insert real.
const invalid = allTopics.filter(t =>
  !t.subject || !t.block_key || !t.block_title || !t.topic_slug || !t.title ||
  typeof t.order !== 'number' || Number.isNaN(t.order)
)
if (invalid.length > 0) {
  console.error(`${invalid.length} filas con campos requeridos vacíos/ inválidos — abortando sin escribir nada.`)
  console.error(JSON.stringify(invalid.slice(0, 5), null, 2))
  process.exit(1)
}

const seen = new Map()
const duplicates = []
for (const t of allTopics) {
  const key = `${t.subject}::${t.topic_slug}`
  if (seen.has(key)) duplicates.push({ key, existing: seen.get(key), duplicate: t })
  else seen.set(key, t)
}
if (duplicates.length > 0) {
  console.error(`${duplicates.length} pares (subject, topic_slug) duplicados entre ambos orígenes — abortando sin escribir nada.`)
  console.error(JSON.stringify(duplicates, null, 2))
  process.exit(1)
}

console.log(`curriculum_seed.json: ${seedTopics.length} temas`)
console.log(`betaCurriculum.ts:    ${betaTopics.length} temas`)
console.log(`TOTAL a upsert-ear en curriculum_topics: ${allTopics.length}`)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (url && key) {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error, count } = await supabase
    .from('curriculum_topics')
    .upsert(allTopics, { onConflict: 'subject,topic_slug', count: 'exact' })
  if (error) {
    console.error(`curriculum_topics upsert failed: ${error.message}`)
    process.exit(1)
  }
  console.log(`OK: ${count ?? allTopics.length} filas upsert-eadas en curriculum_topics.`)
} else {
  console.log('NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY no están en el entorno — dry-run, no se ha escrito nada.')
}
