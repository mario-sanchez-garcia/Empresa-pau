import { getTopic, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import CaminoTopicClient from './CaminoTopicClient'

export default async function CaminoTopicPage({ params }: { params: Promise<{ subject: string; block: string; topic: string }> }) {
  const { subject, block, topic } = await params
  const curriculumTopic = getTopic(subject, block, topic)
  return <CaminoTopicClient topic={toPublicTopic(curriculumTopic)} />
}

function toPublicTopic(topic: CaminoCurriculumTopic | null) {
  if (!topic) return null
  return { ...topic, referenceSolution: undefined }
}
