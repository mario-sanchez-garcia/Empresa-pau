'use client'
import dynamic from 'next/dynamic'

const ExamPage = dynamic(() => import('./page-client'), { ssr: false, loading: () => null })

export default function Page() {
  return <ExamPage />
}
