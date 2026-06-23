import { getTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import CaminoTopicClient from './CaminoTopicClient'

export default async function CaminoTopicPage({ params }: { params: Promise<{ subject: string; block: string; topic: string }> }) {
  const { subject, block, topic } = await params
  const curriculumTopic = getTopic(subject, block, topic)
  return <CaminoTopicClient topic={curriculumTopic} />
}
