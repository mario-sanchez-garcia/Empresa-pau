'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Lock, Search } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { CENTROS_MADRID } from '@/app/data/centros_madrid'
import { CENTROS_CATALUNA } from '@/app/data/centros_cataluna'
import { normalizeInstituteName } from '@/app/lib/camino/instituteNormalize'
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
    title: '¿Cuánto tiempo podrías estudiar al día?',
    help: 'Lo ajustaremos mejor más adelante según tu ritmo.',
  },
  'weekly-days': {
    title: '¿Cuántos días a la semana estudiarías?',
    help: 'En el futuro, Kairo adaptará el plan a tu ritmo y preferencias.',
  },
  confirm: {
    title: 'Perfecto. Ya podemos construir tu Camino PAU.',
    help: 'Revisa el resumen y empieza cuando lo tengas claro.',
  },
  saving: {
    title: 'Construyendo tu Camino PAU',
    help: 'Estamos preparando tu experiencia inicial.',
  },
  done: {
    title: 'Tu Camino PAU está listo',
    help: 'Kairo ya tiene lo necesario para empezar a ayudarte.',
  },
}

const SIDEBAR_STEPS = ['Comunidad', 'Centro', 'Asignaturas', 'Preparación', 'Tiempo', 'Días', 'Confirmar']

export default function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding())
  const [savingError, setSavingError] = useState('')
  const [savingMsgIdx, setSavingMsgIdx] = useState(0)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolOpen, setSchoolOpen] = useState(false)
  const [dbInstitutes, setDbInstitutes] = useState<string[]>([])
  const generateRetriesRef = useRef(0)

  const centers = useMemo(
    () => data.community === 'Madrid' ? CENTROS_MADRID : data.community === 'Cataluña' ? CENTROS_CATALUNA : [],
    [data.community]
  )

  const fetchDbInstitutes = useCallback(async (query: string, community: string) => {
    const normalizedQuery = normalizeInstituteName(query)
    if (normalizedQuery.length < 2) { setDbInstitutes([]); return }
    try {
      let req = supabase.from('institutes').select('name')
      if (community === 'Madrid' || community === 'Cataluña') req = req.eq('community', community)
      req = req.ilike('normalized_name', `%${normalizedQuery}%`).order('name').limit(8)
      const { data: rows } = await req
      setDbInstitutes((rows ?? []).map((r: { name: string }) => r.name))
    } catch { setDbInstitutes([]) }
  }, [])

  useEffect(() => {
    if (schoolQuery.length < 2) { setDbInstitutes([]); return }
    const timer = setTimeout(() => fetchDbInstitutes(schoolQuery, data.community ?? ''), 250)
    return () => clearTimeout(timer)
  }, [schoolQuery, data.community, fetchDbInstitutes])

  const filteredCenters = useMemo(() => {
    const q = normalizeSearch(schoolQuery)
    if (q.length < 2) return []
    const dbSet = new Set(dbInstitutes.map(s => normalizeSearch(s)))
    const staticExtra = centers.filter(c => normalizeSearch(c).includes(q) && !dbSet.has(normalizeSearch(c)))
    return [...dbInstitutes.filter(s => normalizeSearch(s).includes(q)), ...staticExtra].slice(0, 10)
  }, [dbInstitutes, centers, schoolQuery])

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
                ? 'Algo fue mal. Contacta con soporte en hola@kairo.es'
                : 'No pudimos generar tu plan. Inténtalo de nuevo.'
            )
            return
          }
          const genJson = await genRes.json()
          if (!genJson.success) {
            setSavingError(
              generateRetriesRef.current >= 2
                ? 'Algo fue mal. Contacta con soporte en hola@kairo.es'
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
          ? 'Algo fue mal. Contacta con soporte en hola@kairo.es'
          : 'No hemos podido guardar el onboarding. Prueba otra vez en unos segundos.'
      )
    }
  }

  const isSaving = step === 'saving'
  const isDone = step === 'done'
  const showBack = !isDone && !isSaving && (step === 'community' || stepIndex > 0)
  const showContinue = !isDone && !isSaving && stepIndex >= 0 && step !== 'confirm'
  const showConfirm = !isDone && !isSaving && step === 'confirm'

  return (
    <div style={{ minHeight: '100dvh', fontFamily: 'Geist, system-ui, sans-serif', background: '#0f172a' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap');*{box-sizing:border-box}.onb-input{width:100%;border-radius:8px;border:1px solid #e2e8f0;background:#fafbfc;padding:10px 12px;font-size:13px;font-weight:700;color:#0f172a;font-family:Geist,system-ui,sans-serif;outline:none}.onb-input::placeholder{color:#94a3b8;font-weight:600}.onb-input:focus{border-color:#2563eb;background:white}`}</style>
      {step === 'welcome' ? renderWelcome() : renderShell()}
    </div>
  )

  function renderWelcome() {
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', gridTemplateRows: 'auto 1fr auto', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(37,99,235,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,0.025) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        {/* Nav */}
        <nav style={{ position: 'relative', zIndex: 2, padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Kairo</div>
          <div style={{ padding: '5px 12px', borderRadius: 999, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)', fontSize: 9, fontWeight: 900, color: '#3b82f6', letterSpacing: '.1em', textTransform: 'uppercase' }}>Beta privada</div>
        </nav>

        {/* Body */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', padding: '0 96px', gap: 60 }}>
          {/* Left: hero */}
          <div style={{ flex: 1, maxWidth: 560 }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.28em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 20 }}>Camino PAU · Configuración inicial</div>
            <h1 style={{ fontSize: 68, fontWeight: 900, color: 'white', letterSpacing: '-0.045em', lineHeight: 0.93, margin: '0 0 24px' }}>
              Tu plan de<br /><span style={{ color: '#3b82f6' }}>PAU</span><br />empieza aquí.
            </h1>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#64748b', lineHeight: 1.75, margin: '0 0 36px', maxWidth: 420 }}>
              7 preguntas. 3 minutos. Kairo construye un Camino PAU adaptado a tu comunidad, asignaturas y ritmo real.
            </p>
            <div style={{ display: 'flex', gap: 24, marginBottom: 44 }}>
              {['Simulacros reales', 'Misiones diarias', 'IA de corrección'].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 900, color: '#475569' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#2563eb', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={goNext}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 36px', borderRadius: 10, border: 'none', background: 'white', color: '#0f172a', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 8px 28px rgba(0,0,0,0.3)', transition: 'all .14s' }}
            >
              Empezar con Kairo →
            </button>
            <div style={{ marginTop: 12, fontSize: 10, fontWeight: 700, color: '#334155' }}>Acceso gratuito durante la beta privada</div>
          </div>

          {/* Right: floating step preview */}
          <div style={{ width: 300, flexShrink: 0 }}>
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 24px 64px rgba(0,0,0,0.5)' }}>
              <div style={{ height: 3, background: '#0a101e' }}><div style={{ height: '100%', width: '57%', background: '#2563eb' }} /></div>
              <div style={{ background: '#060e1e', padding: '18px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.24em', textTransform: 'uppercase', color: '#1e293b', marginBottom: 4 }}>Camino PAU</div>
                <div style={{ fontSize: 9, fontWeight: 900, color: '#2563eb', marginBottom: 5 }}>Paso 4 de 7</div>
                <div style={{ fontSize: 13, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.02em', lineHeight: 1.2 }}>¿Cómo llevas la preparación?</div>
              </div>
              <div style={{ background: '#fff', padding: '14px 18px' }}>
                {[
                  { label: 'Voy bastante bien', sel: false },
                  { label: 'Voy bien, quiero mejorar', sel: true },
                  { label: 'Me cuesta organizarme', sel: false },
                  { label: 'Voy un poco perdido/a', sel: false },
                  { label: 'Prefiero empezar desde lo básico', sel: false },
                ].map(opt => (
                  <div key={opt.label} style={{ display: 'grid', gridTemplateColumns: '3px 1fr auto', borderRadius: 7, border: `1px solid ${opt.sel ? '#2563eb' : '#f1f5f9'}`, overflow: 'hidden', marginBottom: 5, background: opt.sel ? '#eff6ff' : '#fafbfc' }}>
                    <div style={{ background: opt.sel ? '#2563eb' : '#e2e8f0' }} />
                    <div style={{ padding: '8px 10px', fontSize: 10, fontWeight: 900, color: opt.sel ? '#1e40af' : '#475569' }}>{opt.label}</div>
                    <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center' }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: opt.sel ? '#2563eb' : 'transparent', border: opt.sel ? 'none' : '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {opt.sel && <svg width="7" height="7" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px solid #0f172a', background: '#fff', padding: '10px 18px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ padding: '7px 16px', borderRadius: 6, background: '#0f172a', color: 'white', fontSize: 10, fontWeight: 900 }}>Continuar →</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer style={{ position: 'relative', zIndex: 2, padding: '18px 96px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: 28 }}>
          {[
            { label: 'Comunidad', hint: 'Madrid o Cataluña' },
            { label: 'Asignaturas', hint: '4 disponibles en beta' },
            { label: 'Plan generado por', hint: 'Kairo IA' },
          ].map(item => (
            <div key={item.label} style={{ fontSize: 10, fontWeight: 900, color: '#1e293b' }}>
              {item.label}: <span style={{ color: '#2563eb' }}>{item.hint}</span>
            </div>
          ))}
        </footer>
      </div>
    )
  }

  function renderShell() {
    const displayNum = isDone ? '✓' : isSaving ? String(STEPS.length) : (currentStep > 0 ? String(currentStep) : '—')
    const allDone = isDone || isSaving

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ width: '100%', maxWidth: 900, borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.2), 0 32px 80px rgba(0,0,0,0.55)', display: 'grid', gridTemplateColumns: '240px 1fr' }}>

          {/* LEFT SIDEBAR */}
          <div style={{ background: '#060e1e', padding: '32px 26px', display: 'flex', flexDirection: 'column', minHeight: 540, borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: '-0.02em', marginBottom: 32 }}>Kairo</div>
            <div style={{ fontSize: 7, fontWeight: 900, letterSpacing: '.28em', textTransform: 'uppercase', color: '#1e3a5f', marginBottom: 8 }}>Camino PAU</div>
            <div style={{ fontSize: 72, fontWeight: 900, color: 'white', letterSpacing: '-0.04em', lineHeight: 0.88, marginBottom: 6 }}>{displayNum}</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 32 }}>
              {isDone ? 'completado' : isSaving ? 'generando' : `de ${STEPS.length} pasos`}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
              {SIDEBAR_STEPS.map((label, i) => {
                const done = allDone || currentStep > i + 1
                const active = !allDone && currentStep === i + 1
                return (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? '#2563eb' : active ? 'white' : '#0f172a', border: done || active ? 'none' : '1px solid #1e293b', fontSize: 8, fontWeight: 900, color: done ? 'white' : active ? '#0f172a' : '#334155' }}>
                      {done
                        ? <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" /></svg>
                        : i + 1}
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: done ? '#2563eb' : active ? 'white' : '#334155' }}>{label}</span>
                  </div>
                )
              })}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: '#2563eb', borderRadius: 99 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                />
              </div>
              <div style={{ fontSize: 8, fontWeight: 900, color: '#1e3a5f', marginTop: 6 }}>{progressPct}% completado</div>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div style={{ background: '#fff', display: 'flex', flexDirection: 'column' }}>
            {/* Panel header */}
            <div style={{ background: '#0f172a', padding: '28px 32px 22px' }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: '#475569', marginBottom: 8 }}>
                {isDone ? 'Completado' : isSaving ? 'Procesando' : `Paso ${currentStep} de ${STEPS.length}`}
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#f1f5f9', letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 6px' }}>
                {STEP_LABELS[step].title}
              </h2>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#64748b', lineHeight: 1.6, margin: 0 }}>{STEP_LABELS[step].help}</p>
            </div>

            {/* Panel body */}
            <div style={{ padding: '22px 32px', flex: 1, overflowY: 'auto' }}>
              <AnimatePresence mode="wait">
                <motion.div key={`${step}-content`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}>
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Panel footer */}
            {!isSaving && (
              <div style={{ borderTop: '2px solid #0f172a', padding: '14px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  {showBack && (
                    <button
                      onClick={goBack}
                      style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 12, fontWeight: 900, color: '#64748b', cursor: 'pointer', transition: 'all .12s' }}
                    >
                      ← Atrás
                    </button>
                  )}
                </div>
                <div>
                  {showContinue && (
                    <button
                      onClick={goNext}
                      disabled={!canContinue}
                      style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: canContinue ? '#0f172a' : '#f1f5f9', color: canContinue ? 'white' : '#cbd5e1', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13, fontWeight: 900, cursor: canContinue ? 'pointer' : 'not-allowed', boxShadow: canContinue ? '0 4px 14px rgba(15,23,42,0.18)' : 'none', transition: 'all .12s' }}
                    >
                      Continuar →
                    </button>
                  )}
                  {showConfirm && (
                    <button
                      onClick={finish}
                      style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0f172a', color: 'white', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.18)', transition: 'all .12s' }}
                    >
                      Crear mi Camino PAU →
                    </button>
                  )}
                  {isDone && (
                    <button
                      onClick={() => router.push('/camino')}
                      style={{ padding: '10px 24px', borderRadius: 8, border: 'none', background: '#0f172a', color: 'white', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.18)' }}
                    >
                      Ver mi Camino PAU →
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function renderStep() {
    if (step === 'welcome') return null

    if (step === 'community') {
      return <OptionGrid>{COMMUNITY_OPTS.map(option => <ChoiceCard key={option.id} title={option.label} desc={option.desc} selected={data.community === option.id} onClick={() => selectCommunity(option.id)} />)}</OptionGrid>
    }

    if (step === 'school') {
      const showDropdown = schoolOpen && schoolQuery.length >= 2
      return (
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, border: '1px solid #e2e8f0', background: '#fafbfc', padding: '10px 14px', transition: 'border-color .12s' }}>
            <Search size={16} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              value={schoolQuery}
              onChange={e => { setSchoolQuery(e.target.value); setSchoolOpen(true) }}
              onFocus={() => setSchoolOpen(true)}
              onBlur={() => setTimeout(() => setSchoolOpen(false), 150)}
              placeholder="Busca tu instituto..."
              className="onb-input"
              style={{ border: 'none', padding: 0, background: 'transparent' }}
              autoFocus
            />
          </label>
          {showDropdown && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 6px)', zIndex: 20, borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', overflow: 'hidden', boxShadow: '0 12px 40px rgba(15,23,42,0.14)' }}>
              {filteredCenters.map(center => (
                <button
                  key={center}
                  type="button"
                  onMouseDown={() => selectSchool(center, 'dataset')}
                  style={{ display: 'grid', gridTemplateColumns: '4px 1fr', width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid #f8fafc', background: data.schoolName === center ? '#eff6ff' : 'white', cursor: 'pointer', overflow: 'hidden' }}
                >
                  <div style={{ background: data.schoolName === center ? '#2563eb' : 'transparent' }} />
                  <div style={{ padding: '10px 13px', fontSize: 12, fontWeight: 900, color: data.schoolName === center ? '#1e40af' : '#334155' }}>{center}</div>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={() => selectSchool('Mi centro no aparece', 'manual')}
                style={{ display: 'grid', gridTemplateColumns: '4px 1fr', width: '100%', textAlign: 'left', border: 'none', background: data.schoolName === 'Mi centro no aparece' ? '#eff6ff' : '#fafbfc', cursor: 'pointer', overflow: 'hidden' }}
              >
                <div style={{ background: data.schoolName === 'Mi centro no aparece' ? '#2563eb' : 'transparent' }} />
                <div style={{ padding: '10px 13px', fontSize: 12, fontWeight: 900, color: data.schoolName === 'Mi centro no aparece' ? '#1e40af' : '#64748b' }}>Mi centro no aparece</div>
              </button>
            </div>
          )}
        </div>
      )
    }

    if (step === 'subjects') {
      return (
        <div>
          <div style={{ borderRadius: 10, border: '1px solid #bfdbfe', background: '#eff6ff', padding: '11px 14px', marginBottom: 16 }}>
            <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 3 }}>Beta privada</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', lineHeight: 1.5 }}>De momento puedes probar con Matemáticas II, CCSS, Lengua e Historia. El resto se irá abriendo próximamente.</div>
          </div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 10 }}>Disponibles en beta privada</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 14 }}>
            {PRIVATE_BETA_ENABLED_SUBJECTS.map(subject => {
              const selected = data.subjects.includes(subject.id)
              return (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  style={{ display: 'grid', gridTemplateColumns: '4px 1fr auto', borderRadius: 10, border: `1px solid ${selected ? subject.color : '#f1f5f9'}`, overflow: 'hidden', background: selected ? subject.bg : '#fafbfc', cursor: 'pointer', textAlign: 'left', transition: 'all .12s' }}
                >
                  <div style={{ background: selected ? subject.color : '#e2e8f0', transition: 'background .12s' }} />
                  <div style={{ padding: '11px 12px' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: selected ? subject.color : '#0f172a', lineHeight: 1.3 }}>{subject.label}</div>
                  </div>
                  <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: selected ? subject.color : 'transparent', border: selected ? 'none' : '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {selected && <Check size={9} color="white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#cbd5e1', marginBottom: 10 }}>Próximamente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: !canContinue ? 14 : 0 }}>
            {PRIVATE_BETA_LOCKED_SUBJECTS.map(subject => (
              <div key={subject.id} style={{ display: 'grid', gridTemplateColumns: '4px 1fr auto', borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden', background: '#fafbfc', opacity: 0.5 }}>
                <div style={{ background: '#e2e8f0' }} />
                <div style={{ padding: '11px 12px' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#94a3b8' }}>{subject.label}</div>
                </div>
                <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'center' }}>
                  <Lock size={11} style={{ color: '#cbd5e1' }} strokeWidth={2.5} />
                </div>
              </div>
            ))}
          </div>
          {!canContinue && (
            <div style={{ borderRadius: 8, border: '1px solid #fde68a', background: '#fffbeb', padding: '10px 13px', fontSize: 11, fontWeight: 700, color: '#92400e' }}>
              Selecciona al menos una asignatura disponible para construir tu Camino PAU.
            </div>
          )}
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
        <div>
          {savingError && (
            <div style={{ borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', padding: '10px 13px', fontSize: 11, fontWeight: 700, color: '#991b1b', marginBottom: 14 }}>
              {savingError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <SummaryItem label="Comunidad" value={data.community || '-'} />
            <SummaryItem label="Centro educativo" value={data.schoolName || '-'} />
            <SummaryItem label="Asignaturas" value={data.subjects.join(', ') || '-'} />
            <SummaryItem label="Preparación" value={data.preparationFeeling || '-'} />
            <SummaryItem label="Tiempo diario" value={data.dailyStudyTime || '-'} />
            <SummaryItem label="Días por semana" value={data.weeklyStudyDays || '-'} />
          </div>
        </div>
      )
    }

    if (step === 'saving') {
      if (savingError) {
        return (
          <div style={{ borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: generateRetriesRef.current < 2 ? 16 : 0 }}>{savingError}</p>
            {generateRetriesRef.current < 2 && (
              <button
                type="button"
                onClick={finish}
                style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}
              >
                Reintentar
              </button>
            )}
          </div>
        )
      }
      return (
        <div style={{ borderRadius: 10, border: '1px solid #bfdbfe', background: '#eff6ff', padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #bfdbfe', borderTopColor: '#2563eb', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          <AnimatePresence mode="wait">
            <motion.p
              key={savingMsgIdx}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', margin: 0 }}
            >
              {savingMessages[savingMsgIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      )
    }

    if (step === 'done') {
      return (
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 12px 36px rgba(15,23,42,0.2)' }}>
            <Check size={30} color="white" strokeWidth={3} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#64748b', margin: 0 }}>Todo listo. Tu primer día empieza mañana.</p>
        </div>
      )
    }

    return null
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
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</div>
}

function ChoiceCard({ title, desc, selected, onClick }: { title: string; desc?: string; selected: boolean; compact?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'grid', gridTemplateColumns: '4px 1fr auto', borderRadius: 10, border: `1px solid ${selected ? '#2563eb' : '#f1f5f9'}`, overflow: 'hidden', background: selected ? '#eff6ff' : '#fafbfc', cursor: 'pointer', textAlign: 'left', transition: 'all .12s', width: '100%' }}
    >
      <div style={{ background: selected ? '#2563eb' : '#e2e8f0', transition: 'background .12s' }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: selected ? '#1e40af' : '#0f172a', lineHeight: 1.3 }}>{title}</div>
        {desc && <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', background: selected ? '#2563eb' : 'transparent', border: selected ? 'none' : '1.5px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .12s' }}>
          {selected && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
        </div>
      </div>
    </button>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '4px 1fr', borderRadius: 10, border: '1px solid #f1f5f9', overflow: 'hidden', background: '#fafbfc' }}>
      <div style={{ background: '#2563eb' }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 900, color: '#0f172a', lineHeight: 1.4 }}>{value}</div>
      </div>
    </div>
  )
}
