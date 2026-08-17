// Uso: node --env-file=.env.local docs/seed_lengua_itinerario.mjs
//
// Da de alta los 60 temas de Lengua en app/data/camino/curriculum_seed.json.
//
// PROBLEMA QUE RESUELVE: el contenido de Lengua se insertó en la tabla
// curriculum_content_v2, pero las rutas de Camino PAU no se resuelven contra la
// base de datos, sino contra CAMINO_CURRICULUM_TOPICS, que se construye a partir
// de este JSON (ver app/lib/camino/caminoCurriculumPlan.ts:68). Al no existir
// ahí, cualquier enlace a una misión de Lengua caía en "Tema no encontrado".
//
// El resto de asignaturas ya cumplía esa correspondencia 1:1 —matematicas_ii
// 63/63, historia_espana 128/128, fisica 57/57, quimica 68/68—; Lengua tenía
// 1 entrada de relleno frente a 60 filas en la tabla.
//
// La entrada antigua ("comentario-critico-pau", contentStatus itinerary_only y
// sin contenido) se sustituye: solo se referenciaba a sí misma.
//
// Es idempotente: reescribe siempre las 60 entradas de lengua a partir de la
// tabla, que es la única fuente de verdad del contenido.

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_KEY
)

const SEED_PATH = new URL('../app/data/camino/curriculum_seed.json', import.meta.url).pathname
const SUBJECT = 'lengua'

// Réplica exacta de normalizeTopicSlug y sanitizeLessonTitle
// (app/lib/camino/caminoCurriculumPlan.ts). Deben coincidir carácter a carácter:
// el admin construye el href con estas mismas funciones cuando no encuentra el
// tema por v2SortOrder, así que ambas rutas tienen que dar el mismo slug.
function sanitizeLessonTitle(value) {
  return (value ?? '')
    .replace(/\\vec\{([^{}]*)\}/g, (_m, inner) => `${inner}⃗`)
    .replace(/\$\\cdot\$/g, '·')
    .replace(/\$([^$]*?)\\cdot([^$]*?)\$/g, (_m, l, r) => `${l.trim()} · ${r.trim()}`.trim())
    .replace(/\\cdot|cdot/g, '·')
    .replace(/\\times|times/g, '×')
    .replace(/\\[a-zA-Z]+\{([^{}]*)\}/g, '$1')
    .replace(/\$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeTopicSlug(value) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\$\\cdot\$/g, ' ')
    .replace(/\$([^$]+)\$/g, '$1')
    .replace(/\\cdot|cdot|[·∙⋅×]/g, ' ')
    .replace(/\\times|times/g, ' ')
    .replace(/\\[a-z]+/g, ' ')
    .replace(/[{}]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const { data: rows, error } = await supabase
    .from('curriculum_content_v2')
    .select('sort_order, title, block_key, block_slug')
    .eq('subject', SUBJECT)
    .order('sort_order', { ascending: true })

  if (error) { console.error('Error leyendo la tabla:', error); process.exit(1) }
  if (!rows.length) { console.error('No hay filas de lengua en curriculum_content_v2.'); process.exit(1) }

  // Mismo shape que las entradas de historia_espana, que sí funcionan.
  const entries = rows.map(r => {
    const title = sanitizeLessonTitle(r.title)
    const topicSlug = normalizeTopicSlug(title)
    return {
      subject: SUBJECT,
      blockSlug: r.block_slug,
      blockTitle: r.block_key,
      topicSlug,
      title,
      orderIndex: r.sort_order,
      contentStatus: 'flashcard_v2',
      explanation: '',
      guidedExample: '',
      practicePrompt: '',
      rawLatex: '',
      evauPracticeQuery: {
        subject: SUBJECT,
        block: r.block_slug,
        topic: topicSlug,
      },
      source: 'curriculum_content_v2',
      compatibleSubjects: [SUBJECT],
      v2SortOrder: r.sort_order,
    }
  })

  // Un slug duplicado haría que dos misiones distintas resolviesen al mismo tema.
  const slugs = entries.map(e => e.topicSlug)
  const dupes = slugs.filter((s, i) => slugs.indexOf(s) !== i)
  if (dupes.length) { console.error('✗ topicSlug duplicados:', [...new Set(dupes)]); process.exit(1) }

  const raw = fs.readFileSync(SEED_PATH, 'utf8')
  const seed = JSON.parse(raw)
  const before = seed.filter(t => t.subject === SUBJECT).length
  const next = [...seed.filter(t => t.subject !== SUBJECT), ...entries]

  fs.writeFileSync(SEED_PATH, JSON.stringify(next, null, 2) + '\n')

  console.log(`Entradas de lengua: ${before} → ${entries.length}`)
  console.log(`Total en el seed: ${seed.length} → ${next.length}\n`)
  for (const b of ['Comunicación', 'Reflexión sobre la lengua', 'Educación literaria']) {
    const g = entries.filter(e => e.blockTitle === b)
    console.log(`  ${String(g.length).padStart(2)}  ${b.padEnd(28)} [${g[0]?.orderIndex}-${g.at(-1)?.orderIndex}]`)
  }
  console.log(`\nEjemplos de ruta generada:`)
  for (const e of [entries[0], entries[27], entries[42]]) {
    console.log(`  /camino-pau/curso/${e.subject}/${e.blockSlug}/${e.topicSlug}`)
  }
  console.log('\n✅ Itinerario de Lengua registrado.')
}

main()
