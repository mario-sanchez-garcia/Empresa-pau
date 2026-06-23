'use client'

import type { Components } from 'react-markdown'
import WhyExplanation from './WhyExplanation'

export default function TheoryToggle({
  theory,
  components,
}: {
  theory?: string | null
  components?: Partial<Components>
}) {
  return <WhyExplanation markdown={theory} components={components} />
}
