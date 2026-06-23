import { readFileSync, existsSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const seed = JSON.parse(readFileSync(new URL('../app/data/camino/curriculum_seed.json', import.meta.url), 'utf8'))
const sourceFiles = [
  'C:\\Users\\ZEROCITY\\Downloads\\contenidos 2 bach.pdf',
  'C:\\Users\\ZEROCITY\\Downloads\\apuntes mates latex.docx',
  'C:\\Users\\ZEROCITY\\Downloads\\flashcards_asignaturas_latex_pdf.zip',
]

const subjects = [...new Set(seed.map(item => item.subject))]
const latexSources = sourceFiles.filter(existsSync)
const warnings = []

if (!latexSources.some(path => path.endsWith('apuntes mates latex.docx'))) {
  warnings.push('apuntes mates latex.docx not found; math latex content falls back to checked-in structured seed.')
}
if (!latexSources.some(path => path.endsWith('contenidos 2 bach.pdf'))) {
  warnings.push('contenidos 2 bach.pdf not found; itinerary uses checked-in normalized order.')
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let updated = 0
let skipped = 0

if (url && key) {
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const topicRows = seed.map(item => ({
    subject: item.subject,
    block_slug: item.blockSlug,
    block_title: item.blockTitle,
    topic_slug: item.topicSlug,
    title: item.title,
    order_index: item.orderIndex,
    content_status: item.contentStatus,
    explanation: item.explanation || null,
    guided_example: item.guidedExample || null,
    practice_prompt: item.practicePrompt || null,
    raw_latex: item.rawLatex || null,
    evau_practice_query: item.evauPracticeQuery,
    compatible_subjects: item.compatibleSubjects,
    source: item.source,
  }))
  const { error: topicError } = await supabase
    .from('curriculum_topics')
    .upsert(topicRows, { onConflict: 'subject,block_slug,topic_slug' })
  if (topicError) {
    console.error(`curriculum_topics upsert failed: ${topicError.message}`)
    process.exit(1)
  }
  const templates = seed.flatMap(item => [
    ['concept_explanation', 15, 15],
    ['guided_practice', 20, 15],
    ['evau_practice', 25, 20],
  ].map(([missionType, minutes, xp]) => ({
    subject: item.subject,
    block_slug: item.blockSlug,
    topic_slug: item.topicSlug,
    mission_type: missionType,
    title: `${item.title}`,
    estimated_minutes: minutes,
    xp,
    target: item.evauPracticeQuery,
  })))
  const { error: templateError } = await supabase
    .from('mission_templates')
    .upsert(templates, { onConflict: 'subject,block_slug,topic_slug,mission_type' })
  if (templateError) {
    console.error(`mission_templates upsert failed: ${templateError.message}`)
    process.exit(1)
  }
  updated = topicRows.length + templates.length
} else {
  skipped = seed.length
  warnings.push('Supabase env not set; dry-run only. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to apply.')
}

console.log('Subjects seeded:')
for (const subject of subjects) console.log(`- ${subject}`)
console.log(`Inserted: 0`)
console.log(`Updated: ${updated}`)
console.log(`Skipped: ${skipped}`)
console.log(`Latex sources processed: ${latexSources.length}`)
console.log(`Warnings: ${warnings.length ? warnings.join(' | ') : 'none'}`)
