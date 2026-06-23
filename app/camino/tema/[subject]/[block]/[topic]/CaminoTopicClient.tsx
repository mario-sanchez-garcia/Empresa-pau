'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, ArrowRight, Camera, Check, MessageCircle, PenLine, RotateCcw, School, UploadCloud, X } from 'lucide-react'
import Sidebar from '@/app/components/Sidebar'
import { buildEvauHref, hasLatexContent, subjectLabelFromSlug, type CaminoCurriculumTopic } from '@/app/lib/camino/caminoCurriculumPlan'
import { loadOnboarding } from '@/app/lib/onboarding/onboardingStorage'
import { buildCorrectionPrompt, correctionJsonToMarkdownWithOptions, normalizeCorrectionForOfficialScores } from '@/app/lib/correctionPrompt'
import { correctionPayloadToMarkdown, parseCorrectionPayload } from '@/app/lib/correctionParsing'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'
import { getApiErrorMessage } from '@/app/lib/rateLimitMessages'
import { supabase } from '@/app/lib/supabase'
import MathMarkdown from '@/components/shared/MathMarkdown'
import CorrectionResultCard from '@/components/shared/CorrectionResultCard'
import RichTextArea from '@/components/shared/RichTextArea'
import PausiaLoadingDot from '@/components/shared/PausiaLoadingDot'

const TOPIC_PROGRESS_KEY = 'pausia_camino_topic_progress_v1'
const SCHOOL_FEEDBACK_KEY = 'pausia_school_topic_feedback_v1'
const CALENDAR_KEY = 'pausia_camino_calendar_v2'
const XP_KEY = 'pausia_camino_xp_events_v1'
const WEAK_AREAS_KEY = 'pausia_camino_weak_areas_v1'

type TopicProgress = Record<string, { explanation?: boolean; guided?: boolean; evau?: boolean; xp: number; score?: number }>
type SchoolFeedback = Array<{ schoolName: string | null; community: string | null; subject: string; block: string; topic: string; reason: 'not_seen_in_class'; date: string }>
type CaminoXpEvent = { id: string; missionId: string; date: string; subject: string; xp: number; bonus: boolean; score?: number }
type CalendarMission = { id: string; status: 'pending' | 'done'; subject: string; role?: 'main' | 'bonus' }
type CalendarDay = { date: string; missions: CalendarMission[] }
type UploadedImage = { data: string; preview: string; type: string }

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

function xpFromScore(score: number) {
  const baseXP = 10
  const bonusXP = score < 4 ? 5 : score < 6 ? 12 : score < 8 ? 22 : score < 9 ? 32 : 45
  return baseXP + bonusXP
}

function scoreFromCorrection(data: unknown, maxScore: number) {
  const raw = (data as { desglose_bloques?: Array<{ puntos_conseguidos?: number | string }> } | null)?.desglose_bloques?.[0]?.puntos_conseguidos
  const numeric = Number(raw)
  if (!Number.isFinite(numeric)) return null
  return Math.min(maxScore, Math.max(0, numeric))
}

export default function CaminoTopicClient({ topic }: { topic: CaminoCurriculumTopic | null }) {
  const onboarding = useMemo(() => loadOnboarding(), [])
  const params = useSearchParams()
  const missionId = params.get('missionId')
  const shouldStartExercise = params.get('start') === 'exercise'
  const exerciseRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [toast, setToast] = useState('')
  const [progress, setProgress] = useState<TopicProgress>(() => loadJson<TopicProgress>(TOPIC_PROGRESS_KEY, {}))
  const [answerMode, setAnswerMode] = useState<'texto' | 'imagen'>('texto')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [image, setImage] = useState<UploadedImage | null>(null)
  const [correction, setCorrection] = useState('')
  const [score, setScore] = useState<number | null>(null)
  const [xpAwarded, setXpAwarded] = useState<number | null>(null)
  const [correcting, setCorrecting] = useState(false)

  useEffect(() => {
    if (shouldStartExercise) exerciseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [shouldStartExercise])

  if (!topic) {
    return <Shell><main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-5 py-10"><section className="rounded-[28px] border border-blue-100 bg-white p-8 shadow-[0_18px_45px_rgba(37,99,235,0.08)]"><h1 className="text-2xl font-black text-slate-950">Tema no encontrado</h1><p className="mt-2 text-sm font-semibold text-slate-500">Este tema todavía no está conectado al itinerario de Camino PAU.</p><Link href="/camino" className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white"><ArrowLeft size={16} /> Volver a Camino</Link></section></main></Shell>
  }

  const currentTopic = topic
  const key = progressKey(currentTopic)
  const current = progress[key] ?? { xp: 0 }
  const topicCompleted = Boolean(current.evau)
  const hasContent = hasLatexContent(currentTopic)
  const statusLabel = topicCompleted ? 'Completado' : 'Pendiente'

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

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (image?.preview) URL.revokeObjectURL(image.preview)
    setImage({ data: await compressImageToBase64(file), preview: URL.createObjectURL(file), type: 'image/jpeg' })
  }

  function clearImage() {
    if (image?.preview) URL.revokeObjectURL(image.preview)
    setImage(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  function awardCorrectionXp(scoreOnTen: number) {
    const xp = xpFromScore(scoreOnTen)
    const eventMissionId = missionId ?? `course:${key}`
    const calendar = loadJson<CalendarDay[]>(CALENDAR_KEY, [])
    const xpEvents = loadJson<CaminoXpEvent[]>(XP_KEY, [])
    const previous = xpEvents.find(event => event.missionId === eventMissionId)
    const nextEvents = previous
      ? xpEvents.map(event => event.missionId === eventMissionId && scoreOnTen > (event.score ?? -1) ? { ...event, xp, score: scoreOnTen, date: new Date().toISOString().slice(0, 10) } : event)
      : [...xpEvents, { id: `${eventMissionId}-${Date.now()}`, missionId: eventMissionId, date: new Date().toISOString().slice(0, 10), subject: subjectLabelFromSlug(currentTopic.subject), xp, bonus: false, score: scoreOnTen }]
    const xpChanged = !previous || scoreOnTen > (previous.score ?? -1)

    saveJson(XP_KEY, nextEvents)
    if (missionId) {
      saveJson(CALENDAR_KEY, calendar.map(day => ({ ...day, missions: day.missions.map(mission => mission.id === missionId ? { ...mission, status: 'done' as const } : mission) })))
    }
    setProgress(previous => {
      const item = previous[key] ?? { xp: 0 }
      const storedXp = xpChanged ? xp : item.xp || xp
      const storedScore = xpChanged ? scoreOnTen : item.score ?? scoreOnTen
      const next = {
        ...previous,
        [key]: {
          ...item,
          evau: true,
          xp: storedXp,
          score: storedScore,
        }
      }
      saveJson(TOPIC_PROGRESS_KEY, next)
      return next
    })
    if (scoreOnTen < 6) {
      const weakAreas = loadJson<Array<{ subject: string; block: string; topic: string; score: number; date: string }>>(WEAK_AREAS_KEY, [])
      const nextWeakAreas = [{ subject: subjectLabelFromSlug(currentTopic.subject), block: currentTopic.blockTitle, topic: currentTopic.title, score: scoreOnTen, date: new Date().toISOString() }, ...weakAreas.filter(item => !(item.subject === subjectLabelFromSlug(currentTopic.subject) && item.topic === currentTopic.title))].slice(0, 12)
      saveJson(WEAK_AREAS_KEY, nextWeakAreas)
    }
    setXpAwarded(xpChanged ? xp : previous?.xp ?? xp)
    return { xp, xpChanged }
  }

  async function correctCourseExercise() {
    if (answerMode === 'texto' && !studentAnswer.trim()) return
    if (answerMode === 'imagen' && !image) return
    const maxScore = 10
    setCorrecting(true)
    setCorrection('')
    setScore(null)
    setXpAwarded(null)
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token
      if (sessionError || !accessToken) {
        setCorrection('Tu sesión ha caducado. Vuelve a iniciar sesión para continuar.')
        return
      }
      const subjectLabel = subjectLabelFromSlug(currentTopic.subject)
      const statement = currentTopic.practicePrompt || currentTopic.guidedExample || `Ejercicio de ${currentTopic.title}`
      const prompt = buildCorrectionPrompt({
        subject: subjectLabel,
        simulacroId: `Camino PAU · ${subjectLabel} · ${currentTopic.blockTitle} · ${currentTopic.title}`,
        option: 'Curso',
        elapsedMinutes: 0,
        difficulty: 'Media',
        blocks: [{
          numeroBloque: 'Ejercicio de curso',
          tema: currentTopic.title,
          year: new Date().getFullYear(),
          convocatoria: 'Camino PAU',
          option: 'Curso',
          maxScore,
          officialPrompt: statement,
          criteria: currentTopic.guidedExample ? `Solución orientativa del curso:\n${currentTopic.guidedExample}` : 'Corrección orientativa de curso. No hay rúbrica oficial asociada a este ejercicio.',
          studentAnswer: answerMode === 'imagen' ? 'Respuesta manuscrita adjunta como imagen. Corrígela leyendo la imagen enviada.' : studentAnswer,
        }]
      })
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ pregunta: prompt, imagen: answerMode === 'imagen' ? image?.data : null, imagenTipo: answerMode === 'imagen' ? image?.type : null })
      })
      const data = await response.json()
      if (!response.ok) {
        setCorrection(getApiErrorMessage(data, 'No hemos podido corregir ahora mismo. Inténtalo de nuevo en unos minutos.'))
        return
      }
      const parsed = parseCorrectionPayload(data.respuesta)
      const normalized = parsed ? normalizeCorrectionForOfficialScores(parsed, [maxScore]) : null
      const visibleCorrection = normalized
        ? correctionJsonToMarkdownWithOptions(normalized, { officialMaxScore: maxScore })
        : correctionPayloadToMarkdown(data.respuesta ?? '', { officialMaxScore: maxScore })
      const storedCorrection = normalized ? JSON.stringify(normalized) : visibleCorrection
      const rawScore = normalized ? scoreFromCorrection(normalized, maxScore) : null
      setCorrection(storedCorrection)
      if (rawScore == null) {
        setToast('Corrección recibida sin nota clara. No se asigna XP hasta tener una nota.')
      } else {
        const { xp, xpChanged } = awardCorrectionXp(rawScore)
        setScore(rawScore)
        setToast(xpChanged ? `+${xp} XP por corrección · nota ${rawScore}/10` : `Nota ${rawScore}/10 · XP ya registrado para esta misión`)
      }

      const { data: userData } = await supabase.auth.getUser()
      if (userData.user) {
        await supabase.from('historial_examenes').insert({
          user_id: userData.user.id,
          asignatura: currentTopic.subject,
          tipo: 'Camino PAU',
          año: new Date().getFullYear(),
          bloque: currentTopic.blockTitle,
          opcion: 'Curso',
          nota: rawScore,
          nota_maxima: maxScore,
          enunciado: statement.substring(0, 2000),
          respuesta: answerMode === 'imagen' ? 'Respuesta manuscrita adjunta como imagen.' : studentAnswer.substring(0, 4000),
          correccion: storedCorrection
        })
      }
    } finally {
      setCorrecting(false)
    }
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
                <span className={`rounded-full px-3 py-1 text-xs font-black ${topicCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{statusLabel}</span>
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">Subpágina de aprendizaje</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-500">{hasContent ? 'Primero entiende la idea, después practica guiado y por último salta a un ejercicio PAU/EVAU relacionado.' : 'Itinerario preparado. Falta cargar apunte LaTeX específico para este tema.'}</p>
            </div>
            <button onClick={markNotSeen} className="inline-flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-black text-amber-700"><School size={16} /> No lo he dado en clase</button>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <LearningCard title="1. Explicación comprensible">
                <p className="mb-3 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-bold text-blue-900">Qué es, para qué sirve, cuándo se usa en PAU y qué error conviene evitar.</p>
                {currentTopic.explanation ? <MathMarkdown text={currentTopic.explanation} /> : <EmptyContent />}
              </LearningCard>
              <LearningCard title="2. Ejemplo guiado">
                {currentTopic.guidedExample ? <MathMarkdown text={currentTopic.guidedExample} /> : <EmptyContent />}
              </LearningCard>
              <LearningCard title="3. Ahora inténtalo tú">
                {currentTopic.practicePrompt ? <MathMarkdown text={currentTopic.practicePrompt} /> : <EmptyContent />}
              </LearningCard>
              <article ref={exerciseRef} id="course-exercise" className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-black text-slate-950">4. Entrega tu ejercicio</h2>
                    <p className="mt-1 text-sm font-semibold text-slate-500">El XP se asigna sólo después de corregir con Pausia y depende de la nota obtenida.</p>
                  </div>
                  {missionId && <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">Misión conectada</span>}
                </div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setAnswerMode('texto')} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${answerMode === 'texto' ? 'bg-blue-600 text-white' : 'border border-blue-100 bg-blue-50 text-blue-700'}`}><PenLine size={14} /> Escribir respuesta</button>
                  <button type="button" onClick={() => setAnswerMode('imagen')} className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-black ${answerMode === 'imagen' ? 'bg-blue-600 text-white' : 'border border-blue-100 bg-blue-50 text-blue-700'}`}><Camera size={14} /> Subir foto</button>
                </div>
                {answerMode === 'texto' ? (
                  <RichTextArea value={studentAnswer} onChange={setStudentAnswer} placeholder="Escribe aquí tu desarrollo paso a paso..." minHeight={160} accentColor="#2563eb" />
                ) : (
                  <div className="rounded-2xl border border-dashed border-blue-200 bg-blue-50 p-4">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} className="hidden" />
                    {image ? (
                      <div className="grid gap-3">
                        <img src={image.preview} alt="Respuesta subida" className="max-h-72 rounded-2xl border border-blue-100 object-contain" />
                        <button type="button" onClick={clearImage} className="inline-flex w-fit items-center gap-2 rounded-xl border border-red-100 bg-white px-3 py-2 text-xs font-black text-red-600"><X size={14} /> Quitar foto</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-black text-blue-700 shadow-sm"><UploadCloud size={16} /> Elegir foto de mi respuesta</button>
                    )}
                  </div>
                )}
                <button type="button" onClick={correctCourseExercise} disabled={correcting || (answerMode === 'texto' ? !studentAnswer.trim() : !image)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
                  {correcting ? <><PausiaLoadingDot /> Corrigiendo con Pausia...</> : <>Corregir con Pausia <Check size={16} /></>}
                </button>
                {score != null && <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-800">Nota: {score}/10{xpAwarded != null ? ` · XP registrado: ${xpAwarded}` : ''}</p>}
                {correction && <div className="mt-4"><CorrectionResultCard correction={correction} officialMaxScore={10} className="p-5 text-sm leading-7" /></div>}
              </article>
            </div>
            <aside className="grid content-start gap-4">
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">Práctica PAU/EVAU</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre Exámenes con asignatura, bloque, tema y modo aleatorio preparados.</p>
                <Link href={buildEvauHref(currentTopic)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white">Hacer ejercicio PAU de este tema <ArrowRight size={16} /></Link>
                <a href="#course-exercise" className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm font-black text-blue-700">Corregir ejercicio del curso <Check size={16} /></a>
              </div>
              <div className="rounded-3xl border border-violet-100 bg-white p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-violet-700">Preguntar a Pausia sobre este tema</p>
                <p className="mt-2 text-sm font-semibold text-slate-600">Abre el Chat con Pausia con esta asignatura, bloque y tema como contexto.</p>
                <div className="mt-3 flex flex-wrap gap-2">{['Explícamelo más fácil', 'Ponme otro ejemplo', 'No entiendo este paso', 'Hazme una pregunta parecida', '¿Por qué se hace así?'].map(item => <Link key={item} href={chatHref(item)} className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-xs font-black text-violet-700">{item}</Link>)}</div>
                <Link href={chatHref()} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-4 py-3 text-sm font-black text-white">Abrir Chat con Pausia <MessageCircle size={16} /></Link>
              </div>
              <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-900">{current.xp ?? 0} XP en este tema</p>
                <p className="mt-1 text-xs font-bold text-emerald-700">{topicCompleted ? 'Tema completado con corrección.' : 'El XP se asigna solo después de corregir el ejercicio final.'}</p>
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

function LearningCard({ title, children }: { title: string; children: React.ReactNode }) {
  return <article className="rounded-3xl border border-blue-100 bg-white p-5 shadow-sm"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg font-black text-slate-950">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">Paso de lectura</span></div><div className="prose prose-slate max-w-none text-sm font-semibold leading-7 text-slate-700">{children}</div></article>
}
