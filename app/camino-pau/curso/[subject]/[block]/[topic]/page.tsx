import { getTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import CaminoTopicClient from '@/app/camino/tema/[subject]/[block]/[topic]/CaminoTopicClient'

export default async function CaminoCourseTopicPage({ params }: { params: Promise<{ subject: string; block: string; topic: string }> }) {
  const { subject, block, topic } = await params
  const curriculumTopic = getTopic(subject, block, topic)
  return <CaminoTopicClient topic={curriculumTopic} />
}
