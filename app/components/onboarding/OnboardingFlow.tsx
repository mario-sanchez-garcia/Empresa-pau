'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Lock, Search } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { CENTROS_MADRID } from '@/app/data/centros_madrid'
import { CENTROS_CATALUNA } from '@/app/data/centros_cataluna'
import {
  loadOnboarding,
  markOnboardingComplete,
  saveOnboarding,
  type OnboardingCommunity,
  type OnboardingData,
} from '@/app/lib/onboarding/onboardingStorage'

type Step = 'welcome' | 'community' | 'school' | 'subjects' | 'feeling' | 'daily-time' | 'weekly-days' | 'confirm' | 'saving' | 'done'

const STEPS: Step[] = ['community', 'school', 'subjects', 'feeling', 'daily-time', 'weekly-days', 'confirm']

const COMMUNITY_OPTS: Array<{ id: OnboardingCommunity; label: string; desc: string }> = [
  { id: 'Madrid', label: 'Madrid', desc: 'EBAU Madrid' },
  { id: 'Cataluña', label: 'Cataluña', desc: 'PAU Cataluña' },
  { id: 'Otra', label: 'Otra comunidad', desc: 'Ruta troncal común' },
]

const SUBJECT_OPTS: Array<{ id: string; label: string; color: string; bg: string; betaStatus: 'enabled' | 'locked'; badge?: string }> = [
  { id: 'Matemáticas II', label: 'Matemáticas II', color: '#2563eb', bg: '#eff6ff', betaStatus: 'enabled' },
  { id: 'Matemáticas CCSS', label: 'Matemáticas CCSS', color: '#7c3aed', bg: '#f5f3ff', betaStatus: 'enabled' },
  { id: 'Lengua Castellana', label: 'Lengua Castellana y Literatura', color: '#0891b2', bg: '#ecfeff', betaStatus: 'enabled' },
  { id: 'Historia de España', label: 'Historia de España', color: '#b45309', bg: '#fff7ed', betaStatus: 'enabled' },
  { id: 'Historia de la Filosofía', label: 'Historia de la Filosofía', color: '#64748b', bg: '#f8fafc', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Inglés', label: 'Inglés', color: '#64748b', bg: '#f8fafc', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Física', label: 'Física', color: '#64748b', bg: '#f8fafc', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Química', label: 'Química', color: '#64748b', bg: '#f8fafc', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Biología', label: 'Biología', color: '#64748b', bg: '#f8fafc', betaStatus: 'locked', badge: 'Próximamente' },
]
const PRIVATE_BETA_ENABLED_SUBJECTS = SUBJECT_OPTS.filter(subject => subject.betaStatus === 'enabled')
const PRIVATE_BETA_LOCKED_SUBJECTS = SUBJECT_OPTS.filter(subject => subject.betaStatus === 'locked')
const PRIVATE_BETA_SUPPORTED_SUBJECTS = new Set(PRIVATE_BETA_ENABLED_SUBJECTS.map(subject => subject.id))

const FEELING_OPTS = [
  'Voy bastante bien',
  'Voy bien, pero quiero mejorar',
  'Me cuesta organizarme',
  'Voy un poco perdido/a',
  'Prefiero empezar desde lo básico',
]

const TIME_OPTS = [
  { label: '15-30 min', minutes: 30 },
  { label: '30-45 min', minutes: 45 },
  { label: '45-60 min', minutes: 60 },
  { label: '1-2 horas', minutes: 90 },
  { label: '2-3 horas', minutes: 150 },
  { label: 'Más de 3 horas', minutes: 180 },
  { label: 'Depende del día', minutes: null },
]

const WEEKLY_DAY_OPTS = [
  { label: '2-3 días', value: 3 },
  { label: '3-4 días', value: 4 },
  { label: '4-5 días', value: 5 },
  { label: '5-6 días', value: 6 },
  { label: 'Todos los días', value: 7 },
  { label: 'Depende de la semana', value: null },
]

const STEP_LABELS: Record<Step, { title: string; help: string }> = {
  welcome: {
    title: 'Crea tu Camino PAU',
    help: 'Te haremos unas preguntas rápidas para adaptar Kairo a tu comunidad, centro y ritmo real.',
  },
  community: {
    title: '¿Dónde haces la PAU?',
    help: 'Así ajustamos la experiencia a tu comunidad autónoma.',
  },
  school: {
    title: '¿Cuál es tu centro educativo?',
    help: 'Si coincides con alumnos de tu mismo instituto, adaptamos el temario a vuestro ritmo real.',
  },
  subjects: {
    title: '¿Qué asignaturas quieres preparar?',
    help: 'Elige todas las que entran en tu PAU. Puedes cambiarlo más adelante.',
  },
  feeling: {
    title: '¿Cómo llevas la preparación?',
    help: 'No es una evaluación. Solo nos ayuda a ajustar el tono y el ritmo.',
  },
  'daily-time': {
    title: '¿Cuánto tiempo podrías estudiar al día con Kairo?',
    help: 'Lo ajustaremos mejor más adelante según tu ritmo.',
  },
  'weekly-days': {
    title: '¿Cuántos días a la semana te gustaría estudiar?',
    help: 'En el futuro, Kairo adaptará el plan a tu ritmo y preferencias.',
  },
  confirm: {
    title: 'Perfecto. Con esto Kairo puede empezar a construir tu Camino PAU.',
    help: 'Revisa el resumen y empieza cuando lo tengas claro.',
  },
  saving: {
    title: 'Guardando tu Camino PAU',
    help: 'Estamos preparando tu experiencia inicial.',
  },
  done: {
    title: 'Tu Camino PAU está listo',
    help: 'Kairo ya tiene lo necesario para empezar a ayudarte.',
  },
}

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding())
  const [savingError, setSavingError] = useState('')
  const [savingMsgIdx, setSavingMsgIdx] = useState(0)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolOpen, setSchoolOpen] = useState(false)
  const generateRetriesRef = useRef(0)

  const centers = useMemo(
    () => data.community === 'Madrid' ? CENTROS_MADRID : data.community === 'Cataluña' ? CENTROS_CATALUNA : [],
    [data.community]
  )
  const filteredCenters = useMemo(() => {
    const q = normalizeSearch(schoolQuery)
    if (q.length < 2) return []
    return centers.filter(c => normalizeSearch(c).includes(q)).slice(0, 10)
  }, [centers, schoolQuery])

  const savingMessages = useMemo(() => {
    const msgs: string[] = []
    const selectedEnabledSubjects = data.subjects.filter(subject => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(subject))
    if (selectedEnabledSubjects.includes('Matemáticas II')) msgs.push('Ordenando tus 60 temas de Matemáticas II…')
    if (selectedEnabledSubjects.includes('Matemáticas CCSS')) msgs.push('Ordenando tus temas de Matemáticas CCSS…')
    if (selectedEnabledSubjects.includes('Lengua Castellana')) msgs.push('Preparando comentario, gramática y literatura…')
    if (selectedEnabledSubjects.includes('Historia de España')) msgs.push('Construyendo tu cronología de Historia de España…')
    if (msgs.length === 0) {
      msgs.push('Calculando tu ritmo de estudio…')
      msgs.push('Construyendo tu Camino PAU…')
    }
    msgs.push('Listo — tu primer día empieza mañana.')
    return msgs
  }, [data.subjects])

  useEffect(() => {
    if (step !== 'saving' || savingError) return
    const interval = setInterval(() => {
      setSavingMsgIdx(i => Math.min(i + 1, savingMessages.length - 1))
    }, 2200)
    return () => clearInterval(interval)
  }, [step, savingError, savingMessages.length])

  const stepIndex = STEPS.indexOf(step)
  const currentStep = stepIndex >= 0 ? stepIndex + 1 : 0
  const progressPct = step === 'done' ? 100 : step === 'welcome' ? 0 : Math.round((currentStep / STEPS.length) * 100)

  const canContinue = (() => {
    if (step === 'community') return Boolean(data.community)
    if (step === 'school') return Boolean(data.schoolName?.trim())
    if (step === 'subjects') return data.subjects.some(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    if (step === 'feeling') return Boolean(data.preparationFeeling)
    if (step === 'daily-time') return Boolean(data.dailyStudyTime)
    if (step === 'weekly-days') return Boolean(data.weeklyStudyDays)
    return true
  })()

  function update(partial: Partial<OnboardingData>) {
    setData(current => {
      const next = { ...current, ...partial }
      saveOnboarding(next)
      return next
    })
  }

  function goNext() {
    if (step === 'welcome') { setStep('community'); return }
    if (stepIndex >= 0 && stepIndex < STEPS.length - 1 && canContinue) setStep(STEPS[stepIndex + 1])
  }

  function goBack() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1])
    else if (step === 'community') setStep('welcome')
  }

  function selectCommunity(community: OnboardingCommunity) {
    update({ community, schoolName: null, schoolSource: null })
    setSchoolQuery('')
    setSchoolOpen(false)
  }

  function selectSchool(name: string, source: 'dataset' | 'manual') {
    update({ schoolName: name, schoolSource: source })
    setSchoolQuery(name)
    setSchoolOpen(false)
  }

  function toggleSubject(subject: string) {
    if (!PRIVATE_BETA_SUPPORTED_SUBJECTS.has(subject)) return
    update({ subjects: data.subjects.includes(subject) ? data.subjects.filter(item => item !== subject) : [...data.subjects, subject] })
  }

  const SUBJECT_TO_SLUG: Record<string, string> = {
    'Matemáticas II': 'matematicas_ii',
    'Matemáticas CCSS': 'matematicas_ccss',
    'Lengua Castellana': 'lengua',
    'Historia de España': 'historia_espana',
  }

  async function finish() {
    setSavingError('')
    setSavingMsgIdx(0)
    setStep('saving')
    const completedAt = new Date().toISOString()
    const selectedEnabledSubjects = data.subjects.filter(subject => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(subject))
    saveOnboarding({ ...data, subjects: selectedEnabledSubjects, completedAt })
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (token) {
        await fetch('/api/onboarding/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            routeId: 'completa',
            community: data.community,
            schoolName: data.schoolName,
            schoolSource: data.schoolSource,
            subjects: selectedEnabledSubjects,
            preparationFeeling: data.preparationFeeling,
            dailyStudyTime: data.dailyStudyTime,
            dailyMinutes: data.dailyMinutes,
            weeklyStudyDays: data.weeklyStudyDays,
            weeklyStudyDaysValue: data.weeklyStudyDaysValue,
            onboardingCompleted: true,
          }),
        })

        const subjectSlugs = selectedEnabledSubjects
          .map(s => SUBJECT_TO_SLUG[s])
          .filter((s): s is string => Boolean(s))

        if (subjectSlugs.length > 0) {
          generateRetriesRef.current += 1
          const genRes = await fetch('/api/onboarding/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ subjects: subjectSlugs, startMode: 'zero' }),
          })
          if (!genRes.ok) {
            setSavingError(
              generateRetriesRef.current >= 2
                ? 'Algo fue mal. Contacta con soporte en hola@pausia.es'
                : 'No pudimos generar tu plan. Inténtalo de nuevo.'
            )
            return
          }
          const genJson = await genRes.json()
          if (!genJson.success) {
            setSavingError(
              generateRetriesRef.current >= 2
                ? 'Algo fue mal. Contacta con soporte en hola@pausia.es'
                : 'No pudimos generar tu plan. Inténtalo de nuevo.'
            )
            return
          }
        }
      }
      markOnboardingComplete()
      router.push('/camino')
    } catch {
      setSavingError(
        generateRetriesRef.current >= 2
          ? 'Algo fue mal. Contacta con soporte en hola@pausia.es'
          : 'No hemos podido guardar el onboarding. Prueba otra vez en unos segundos.'
      )
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#f8fafc]" style={{ minHeight: '100dvh', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-4">
          <img src="/brand/pausia-lockup.png" alt="Kairo" className="h-7 shrink-0 object-contain" />
          <div className="ml-auto hidden items-center gap-3 text-sm font-bold text-slate-500 sm:flex">
            <span>Preparación PAU</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span>Ruta personalizada</span>
          </div>
        </div>
      </header>

      <main className={`mx-auto grid w-full max-w-6xl gap-6 px-5 py-8 lg:py-12 ${step !== 'welcome' ? 'lg:grid-cols-[320px_1fr]' : ''}`}>
        {step !== 'welcome' && (
          <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] lg:sticky lg:top-8 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">Onboarding</p>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Camino PAU</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">Una configuración breve, amable y útil para empezar sin burocracia.</p>

            <div className="my-6">
              <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                <span>Progreso</span>
                <span>{progressPct}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg, #1d4ed8, #7c3aed)' }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.45 }} />
              </div>
            </div>

            <div className="space-y-3">
              {['Comunidad', 'Centro', 'Asignaturas', 'Preparación', 'Tiempo', 'Días', 'Confirmar'].map((item, index) => {
                const active = currentStep >= index + 1 || step === 'done'
                return (
                  <div key={item} className="flex items-center gap-3">
                    <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      {active ? <Check size={13} strokeWidth={3} /> : index + 1}
                    </span>
                    <span className={`text-sm font-bold ${active ? 'text-slate-800' : 'text-slate-400'}`}>{item}</span>
                  </div>
                )
              })}
            </div>
          </aside>
        )}

        <section className="flex min-h-[620px] items-center">
          <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }} className="w-full rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_28px_90px_rgba(15,23,42,0.10)] sm:p-8">
            <div className="mb-7 flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-blue-700">
                {step === 'welcome' ? 'Inicio' : step === 'saving' ? 'Guardando' : step === 'done' ? 'Completado' : `Paso ${currentStep} de ${STEPS.length}`}
              </span>
              {stepIndex > 0 && step !== 'saving' && step !== 'done' && (
                <button onClick={goBack} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-black text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700">
                  <ArrowLeft size={14} /> Atrás
                </button>
              )}
            </div>

            <div className="mb-7">
              <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{STEP_LABELS[step].title}</h2>
              <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-slate-500">{STEP_LABELS[step].help}</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={`${step}-content`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {stepIndex >= 0 && step !== 'confirm' && step !== 'saving' && step !== 'done' && (
              <div className="mt-7">
                <PrimaryButton onClick={goNext}>Continuar <ArrowRight size={16} /></PrimaryButton>
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </div>
  )

  function renderStep() {
    if (step === 'welcome') {
      return <PrimaryButton onClick={goNext}>Empezar con Kairo <ArrowRight size={16} /></PrimaryButton>
    }

    if (step === 'community') {
      return <OptionGrid>{COMMUNITY_OPTS.map(option => <ChoiceCard key={option.id} title={option.label} desc={option.desc} selected={data.community === option.id} onClick={() => selectCommunity(option.id)} />)}</OptionGrid>
    }

    if (step === 'school') {
      const showDropdown = schoolOpen && schoolQuery.length >= 2
      return (
        <div className="relative">
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input
              type="text"
              value={schoolQuery}
              onChange={e => { setSchoolQuery(e.target.value); setSchoolOpen(true) }}
              onFocus={() => setSchoolOpen(true)}
              onBlur={() => setTimeout(() => setSchoolOpen(false), 150)}
              placeholder="Busca tu instituto..."
              className="min-w-0 flex-1 bg-transparent text-sm font-bold text-slate-700 outline-none placeholder:font-semibold placeholder:text-slate-400"
              autoFocus
            />
          </label>
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)]">
              {filteredCenters.map(center => (
                <button
                  key={center}
                  type="button"
                  onMouseDown={() => selectSchool(center, 'dataset')}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-800 border-b border-slate-100 last:border-0"
                >
                  <Check size={13} className={`shrink-0 ${data.schoolName === center ? 'text-blue-600' : 'text-transparent'}`} strokeWidth={3} />
                  {center}
                </button>
              ))}
              <button
                type="button"
                onMouseDown={() => selectSchool('Mi centro no aparece', 'manual')}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
              >
                <Check size={13} className={`shrink-0 ${data.schoolName === 'Mi centro no aparece' ? 'text-blue-600' : 'text-transparent'}`} strokeWidth={3} />
                Mi centro no aparece
              </button>
            </div>
          )}
        </div>
      )
    }

    if (step === 'subjects') {
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <p className="text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">Beta privada</p>
            <p className="mt-1 text-sm font-bold leading-5 text-blue-900">De momento puedes probar Kairo con Matemáticas II, Matemáticas CCSS, Lengua e Historia. El resto de asignaturas se irán abriendo próximamente.</p>
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Disponibles en beta privada</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIVATE_BETA_ENABLED_SUBJECTS.map(subject => {
                const selected = data.subjects.includes(subject.id)
                return (
                  <button key={subject.id} onClick={() => toggleSubject(subject.id)} className="flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 text-left transition active:scale-[0.98]" style={{ borderColor: selected ? subject.color : '#e2e8f0', background: selected ? subject.bg : '#ffffff', boxShadow: selected ? `0 0 0 3px ${subject.color}1a` : '0 1px 3px rgba(0,0,0,0.04)' }}>
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2" style={{ borderColor: selected ? subject.color : '#cbd5e1', background: selected ? subject.color : 'white' }}>{selected && <Check size={11} color="white" strokeWidth={3} />}</span>
                    <span className="text-sm font-black" style={{ color: selected ? subject.color : '#334155' }}>{subject.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Próximamente</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIVATE_BETA_LOCKED_SUBJECTS.map(subject => {
                return (
                  <button key={subject.id} type="button" disabled title="Esta asignatura estará disponible próximamente. En esta beta estamos probando Matemáticas II, Matemáticas CCSS, Lengua e Historia." className="flex min-h-14 cursor-not-allowed items-center justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 text-left opacity-75">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-slate-300 bg-white text-slate-400"><Lock size={11} strokeWidth={3} /></span>
                      <span className="truncate text-sm font-black text-slate-500">{subject.label}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">{subject.badge}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {!canContinue && <p className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800">Selecciona al menos una asignatura disponible para construir tu Camino PAU.</p>}
        </div>
      )
    }

    if (step === 'feeling') {
      return <OptionGrid>{FEELING_OPTS.map(label => <ChoiceCard key={label} title={label} selected={data.preparationFeeling === label} onClick={() => update({ preparationFeeling: label })} />)}</OptionGrid>
    }

    if (step === 'daily-time') {
      return <OptionGrid>{TIME_OPTS.map(option => <ChoiceCard key={option.label} title={option.label} selected={data.dailyStudyTime === option.label} onClick={() => update({ dailyStudyTime: option.label, dailyMinutes: option.minutes })} />)}</OptionGrid>
    }

    if (step === 'weekly-days') {
      return <OptionGrid>{WEEKLY_DAY_OPTS.map(option => <ChoiceCard key={option.label} title={option.label} selected={data.weeklyStudyDays === option.label} onClick={() => update({ weeklyStudyDays: option.label, weeklyStudyDaysValue: option.value })} />)}</OptionGrid>
    }

    if (step === 'confirm') {
      return (
        <div className="space-y-5">
          {savingError && <p className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">{savingError}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryItem label="Comunidad" value={data.community || '-'} />
            <SummaryItem label="Centro educativo" value={data.schoolName || '-'} />
            <SummaryItem label="Asignaturas" value={data.subjects.join(', ') || '-'} />
            <SummaryItem label="Preparación" value={data.preparationFeeling || '-'} />
            <SummaryItem label="Tiempo diario" value={data.dailyStudyTime || '-'} />
            <SummaryItem label="Días por semana" value={data.weeklyStudyDays || '-'} />
          </div>
          <PrimaryButton onClick={finish}>Crear mi Camino PAU <ArrowRight size={16} /></PrimaryButton>
        </div>
      )
    }

    if (step === 'saving') {
      if (savingError) {
        return (
          <div className="space-y-4 rounded-3xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="text-sm font-bold text-red-800">{savingError}</p>
            {generateRetriesRef.current < 2 && (
              <button
                type="button"
                onClick={finish}
                className="mx-auto flex items-center justify-center rounded-2xl bg-red-600 px-6 py-3 text-sm font-black text-white transition hover:bg-red-700 active:scale-[0.98]"
              >
                Reintentar
              </button>
            )}
          </div>
        )
      }
      return (
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          <AnimatePresence mode="wait">
            <motion.p
              key={savingMsgIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-sm font-bold text-blue-800"
            >
              {savingMessages[savingMsgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      )
    }

    if (step === 'done') {
      return (
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_18px_55px_rgba(37,99,235,0.35)]"><Check size={34} strokeWidth={3} /></div>
          <PrimaryButton onClick={() => router.push('/camino')}>Ver mi Camino PAU <ArrowRight size={16} /></PrimaryButton>
        </div>
      )
    }

    return null
  }

  function PrimaryButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
    return (
      <button onClick={onClick} disabled={!canContinue && step !== 'welcome'} className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-black text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400" style={canContinue || step === 'welcome' ? { background: 'linear-gradient(135deg, #1d4ed8, #7c3aed)', boxShadow: '0 10px 28px rgba(37,99,235,0.30)' } : undefined}>
        {children}
      </button>
    )
  }
}

function normalizeSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
}

function OptionGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-2">{children}</div>
}

function ChoiceCard({ title, desc, selected, compact, onClick }: { title: string; desc?: string; selected: boolean; compact?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-3 rounded-2xl border text-left transition active:scale-[0.98] ${compact ? 'px-4 py-3' : 'px-4 py-4'} ${selected ? 'border-blue-500 bg-blue-50 shadow-[0_0_0_3px_rgba(37,99,235,0.10)]' : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50'}`}>
      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${selected ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'}`}>{selected && <Check size={11} color="white" strokeWidth={3} />}</span>
      <span className="min-w-0">
        <span className={`block text-sm font-black ${selected ? 'text-blue-800' : 'text-slate-800'}`}>{title}</span>
        {desc && <span className="mt-0.5 block text-xs font-semibold text-slate-400">{desc}</span>}
      </span>
    </button>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}
