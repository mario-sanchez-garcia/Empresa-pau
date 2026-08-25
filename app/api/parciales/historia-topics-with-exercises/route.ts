import { NextResponse } from 'next/server'
import { examenesHistoria } from '@/app/data/examenes'
import { isIncompleteOfficialExercise } from '@/app/lib/contentQuality'

// Computed from the real exercise bank, not a hardcoded list, so it stays
// correct as exercises/topicSlugs are added or corrected later. Used by
// HistoriaTopicChips to hide curriculum_topics rows (mostly the ~10 generic
// betaCurriculum.ts topics, which have no exercises tagged with their slugs)
// that would silently match zero exercises if selected.
export async function GET() {
  const slugs = new Set<string>()
  for (const exam of examenesHistoria) {
    for (const pregunta of exam.preguntas) {
      if (isIncompleteOfficialExercise(pregunta)) continue
      for (const slug of pregunta.topicSlugs ?? []) slugs.add(slug)
    }
  }
  return NextResponse.json({ topicSlugs: [...slugs] })
}
