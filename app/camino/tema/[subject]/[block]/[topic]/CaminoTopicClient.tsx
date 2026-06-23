'use client'

'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw, School } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { buildEvauHref, hasLatexContent, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import MathMarkdown from '@/components/shared/MathMarkdown'

const TOPIC_PROGRESS_KEY = 'pausia_camino_topic_progress_v1'
const SCHOOL_FEEDBACK_KEY = 'pausia_school_topic_feedback_v1'

type TopicProgress = Record<string, { explanation?: boolean; guided?: boolean; evau?: boolean; xp: number }>
type SchoolFeedback = Array<{ schoolName: string | null; community: string | null; subject: string; block: string; topic: string; reason: 'not_seen_in_class'; date: string }>

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function saveJson(key: string, value: unknown) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

function progressKey(topic: CaminoCurriculumTopic) {
  return `${topic.subject}:${topic.blockSlug}:${topic.topicSlug}`
}

export default function CaminoTopicClient({ topic }: { topic: CaminoCurriculumTopic | null }) {
  const onboarding = useMemo(() => loadOnboarding(), [])
  const [toast, setToast] = useState('')
  const [progress, setProgress] = useState<TopicProgress>(() => loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {}))

  if (!topic) {
    return <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><h1 className="text-2xl font-black text-slate-950">Tema no encontrado</h1><p className="mt-2 text-sm font-semibold text-slate-500">Este tema todavía no está conectado al itinerario de Camino PAU.</p><Link href="/camino" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"><ArrowLeft size={16} /> Volver a Camino</Link></section></main></Shell>
  }

  const currentTopic = topic
  const key = progressKey(currentTopic)
  const current = progress[key] ?? { xp: 0 }
  const topicCompleted = current.explanation && current.guided && current.evau
  const hasContent = hasLatexContent(currentTopic)
  const statusLabel = topicCompleted ? 'Completado' : current.explanation || current.guided || current.evau ? 'En curso' : 'Pendiente'

  function award(part: 'explanation' | 'guided' | 'evau') {
    const xpByPart = { explanation: 15, guided: 15, evau: 20 }
    setProgress(previous => {
      const item = previous[key] ?? { xp: 0 }
      if (item[part]) return previous
      const allDoneAfter = part === 'evau'
        ? Boolean(item.explanation && item.guided)
        : part === 'guided'
          ? Boolean(item.explanation && item.evau)
          : Boolean(item.guided && item.evau)
      const extra = allDoneAfter ? 30 : 0
      const next = { ...previous, [key]: { ...item, [part]: true, xp: item.xp + xpByPart[part] + extra } }
      saveJson(TOPIC_PROGRESS_KEY, next)
      setToast(extra ? `+${xpByPart[part] + extra} XP · tema completado` : `+${xpByPart[part]} XP`)
      return next
    })
  }

  function markNotSeen() {
    const feedback = loadJson<SchoolFeedback>(SCHOOL_FEEDBACK_KEY, [])
    const next = [...feedback, { schoolName: onboarding.schoolName, community: onboarding.community, subject: currentTopic.subject, block: currentTopic.blockSlug, topic: currentTopic.topicSlug, reason: 'not_seen_in_class' as const, date: new Date().toISOString() }]
    saveJson(SCHOOL_FEEDBACK_KEY, next)
    setToast('Perfecto, lo dejamos para más adelante y ajustamos tu plan.')
  }

  function chatHref(prompt?: string) {
    const params = new URLSearchParams({
      view: 'chat',
      from: 'camino_course',
      subject: currentTopic.subject,
      block: currentTopic.blockSlug,
      topic: currentTopic.topicSlug,
    })
    if (prompt) params.set('question', prompt)
    return `/?${params.toString()}`
  }

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-5 py-6">
        <Link href="/camino" className="mb-4 inline-flex items-center gap-2 text-sm font-black text-blue-700"><ArrowLeft size={16} /> Volver a Camino PAU</Link>
        <section className="rounded-[30px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(37,99,235,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-600">Camino PAU → {subjectLabelFromSlug(currentTopic.subject)} → {currentTopic.blockTitle}</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{currentTopic.title}</h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">25 min</span>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${topicCompleted ? 'bg-emerald-50 text-emerald-700' : statusLabel === 'En curso' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{statusLabel}</span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">Subpágina de aprendizaje</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">{hasContent ? 'Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU/EVAU relacionado.' : 'Itinerario preparado. Falta cargar apunte LaTeX específico para este tema.'}</p>
            </div>
            <button onClick={markNotSeen} className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"><School size={16} /> No lo he dado en clase</button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <LearningCard title="1. Explicación comprensible" done={Boolean(current.explanation)} onDone={() => award('explanation')}>
                <p className="mb-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">Qué es, para qué sirve, cuándo se usa en PAU y qué error conviene evitar.</p>
                {currentTopic.explanation ? <MathMarkdown text={currentTopic.explanation} /> : <EmptyContent />}
              </LearningCard>
              <LearningCard title="2. Ejemplo guiado" done={Boolean(current.guided)} onDone={() => award('guided')}>
                {currentTopic.guidedExample ? <MathMarkdown text={currentTopic.guidedExample} /> : <EmptyContent />}
              </LearningCard>
              <LearningCard title="3. Ahora inténtalo tú" done={Boolean(current.guided)} onDone={() => award('guided')}>
                {currentTopic.practicePrompt ? <MathMarkdown text={currentTopic.practicePrompt} /> : <EmptyContent />}
              </LearningCard>
            </div>
            <aside className="grid content-start gap-4">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Práctica PAU/EVAU</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre Exámenes con asignatura, bloque, tema y modo aleatorio preparados.</p>
                <Link onClick={() => award('evau')} href={buildEvauHref(currentTopic)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Hacer ejercicio PAU de este tema <ArrowRight size={16} /></Link>
                <Link onClick={() => award('evau')} href={buildEvauHref(currentTopic)} className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700">Corregir con Pausia <Check size={16} /></Link>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">Preguntar a Pausia sobre este tema</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre el Chat con Pausia con esta asignatura, bloque y tema como contexto.</p>
                <div className="mt-3 flex flex-wrap gap-2">{['Explícamelo más fácil', 'Ponme otro ejemplo', 'No entiendo este paso', 'Hazme una pregunta parecida', '¿Por qué se hace así?'].map(item => <Link key={item} href={chatHref(item)} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{item}</Link>)}</div>
                <Link href={chatHref()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white">Abrir Chat con Pausia <MessageCircle size={16} /></Link>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-900">{current.xp ?? 0} XP en este tema</p>
                <p className="mt-1 text-xs font-bold text-emerald-700">{topicCompleted ? 'Tema completado.' : 'Completa explicación, práctica y ejercicio PAU para el bonus.'}</p>
              </div>
            </aside>
          </div>
        </section>
        {toast && <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-2xl">{toast}<button onClick={() => setToast('')} className="ml-3 text-slate-300"><RotateCcw size={13} /></button></div>}
      </main>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen bg-[#f4f7fb] max-lg:block"><Sidebar activeItem="camino" /><div className="min-w-0 flex-1">{children}</div></div>
}

function EmptyContent() {
  return <p className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">Todavía no hay apunte LaTeX estructurado para este tema. Camino PAU mantiene el tema en itinerario sin inventar contenido.</p>
}

function LearningCard({ title, children, done, onDone }: { title: string; children: React.ReactNode; done?: boolean; onDone?: () => void }) {
  return <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-black text-slate-950">{title}</h2>{onDone && <button onClick={onDone} disabled={done} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${done ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-600 text-white'}`}><Check size={14} /> {done ? 'Hecho' : 'He trabajado esto'}</button>}</div><div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">{children}</div></article>
}
