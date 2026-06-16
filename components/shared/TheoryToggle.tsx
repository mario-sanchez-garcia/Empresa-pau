'use client'

import WhyExplanation from './WhyExplanation'

export default function TheoryToggle({
  theory,
  components,
}: {
  theory?: string | null
  components?: Record<string, any>
}) {
  return <WhyExplanation markdown={theory} components={components} />
}
