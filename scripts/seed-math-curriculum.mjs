import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })

const { data: matesRows, error: readError } = await supabase
  .from('curriculum_flashcards')
  .select('region, chapter_number, chapter_title, block_key, order_label, sort_order, title, concept_latex, alert_title, alert_latex, worked_case_title, worked_case_latex')
  .eq('subject', 'mates')
  .eq('region', 'ambas')
  .order('sort_order', { ascending: true })

if (readError) {
  console.error(`Read failed: ${readError.message}`)
  process.exit(1)
}

const ccssRows = (matesRows ?? [])
  .filter(row => row.block_key !== 'Geometría')
  .map(row => ({ ...row, subject: 'matematicas_ccss' }))

if (ccssRows.length === 0) {
  console.log('Inserted: 0')
  console.log('Updated: 0')
  console.log('Skipped: 0')
  console.log('Subjects: mates, matematicas_ccss')
  console.log('No source rows found. Apply the mates curriculum migration first.')
  process.exit(0)
}

const { error: upsertError } = await supabase
  .from('curriculum_flashcards')
  .upsert(ccssRows, { onConflict: 'subject,region,sort_order' })

if (upsertError) {
  console.error(`Upsert failed: ${upsertError.message}`)
  process.exit(1)
}

console.log(`Inserted: 0`)
console.log(`Updated: ${ccssRows.length}`)
console.log(`Skipped: ${(matesRows ?? []).length - ccssRows.length}`)
console.log('Subjects: mates, matematicas_ccss')
