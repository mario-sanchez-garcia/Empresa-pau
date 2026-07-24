import dynamic from 'next/dynamic'

const ExamPage = dynamic(() => import('@/app/page-client'), { ssr: false, loading: () => null })

export default function Page() {
  return <ExamPage />
}
