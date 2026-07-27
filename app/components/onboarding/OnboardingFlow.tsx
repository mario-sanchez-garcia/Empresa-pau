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

const HF_FLATLAY = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125450_f5670e8f-277d-470e-82b0-58dd6db26d4b.png'
const HF_LIBRARY = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125452_25c3d09d-ecc3-4e9b-8a16-773cfeb46a83.png'
const HF_EQUATIONS = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125527_d366f113-8e29-4f93-b91c-7a6c40bfe1d1.png'

const STEP_PHOTO: Partial<Record<Step, string>> = {
  community: HF_FLATLAY,
  school: HF_EQUATIONS,
  subjects: HF_FLATLAY,
  feeling: HF_EQUATIONS,
  'daily-time': HF_LIBRARY,
  'weekly-days': HF_LIBRARY,
  confirm: HF_FLATLAY,
}

const STEP_HEADLINE: Partial<Record<Step, string[]>> = {
  community: ['¿Dónde', 'haces la', 'PAU?'],
  school: ['¿Cuál es', 'tu', 'centro?'],
  subjects: ['¿Qué', 'asigna-', 'turas?'],
  feeling: ['¿Cómo', 'llevas la', 'prep?'],
  'daily-time': ['¿Cuánto', 'tiempo', 'al día?'],
  'weekly-days': ['¿Cuántos', 'días a la', 'semana?'],
  confirm: ['Tu plan', 'está', 'listo.'],
}

const COMMUNITY_OPTS: Array<{ id: OnboardingCommunity; label: string; desc: string }> = [
  { id: 'Madrid', label: 'Madrid', desc: 'EBAU Madrid' },
  { id: 'Cataluña', label: 'Cataluña', desc: 'PAU Cataluña' },
  { id: 'Otra', label: 'Otra comunidad', desc: 'Ruta troncal común' },
]

const SUBJECT_OPTS: Array<{ id: string; label: string; color: string; betaStatus: 'enabled' | 'locked'; badge?: string }> = [
  { id: 'Matemáticas II', label: 'Matemáticas II', color: '#2563eb', betaStatus: 'enabled' },
  { id: 'Matemáticas CCSS', label: 'Matemáticas CCSS', color: '#7c3aed', betaStatus: 'enabled' },
  { id: 'Lengua Castellana', label: 'Lengua Castellana y Literatura', color: '#0891b2', betaStatus: 'enabled' },
  { id: 'Historia de España', label: 'Historia de España', color: '#b45309', betaStatus: 'enabled' },
  { id: 'Historia de la Filosofía', label: 'Historia de la Filosofía', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Inglés', label: 'Inglés', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Física', label: 'Física', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Química', label: 'Química', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
  { id: 'Biología', label: 'Biología', color: '#64748b', betaStatus: 'locked', badge: 'Próximamente' },
]
const PRIVATE_BETA_ENABLED_SUBJECTS = SUBJECT_OPTS.filter(s => s.betaStatus === 'enabled')
const PRIVATE_BETA_LOCKED_SUBJECTS = SUBJECT_OPTS.filter(s => s.betaStatus === 'locked')
const PRIVATE_BETA_SUPPORTED_SUBJECTS = new Set(PRIVATE_BETA_ENABLED_SUBJECTS.map(s => s.id))

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
  welcome: { title: 'Crea tu Camino PAU', help: 'Te haremos unas preguntas rápidas para adaptar Kairo a tu comunidad, centro y ritmo real.' },
  community: { title: '¿Dónde haces la PAU?', help: 'Así ajustamos la experiencia a tu comunidad autónoma.' },
  school: { title: '¿Cuál es tu centro educativo?', help: 'Si coincides con alumnos de tu mismo instituto, adaptamos el temario a vuestro ritmo real.' },
  subjects: { title: '¿Qué asignaturas quieres preparar?', help: 'Elige todas las que entran en tu PAU. Puedes cambiarlo más adelante.' },
  feeling: { title: '¿Cómo llevas la preparación?', help: 'No es una evaluación. Solo nos ayuda a ajustar el tono y el ritmo.' },
  'daily-time': { title: '¿Cuánto tiempo podrías estudiar al día?', help: 'Lo ajustaremos mejor más adelante según tu ritmo.' },
  'weekly-days': { title: '¿Cuántos días a la semana estudiarías?', help: 'En el futuro, Kairo adaptará el plan a tu ritmo y preferencias.' },
  confirm: { title: 'Perfecto. Ya podemos construir tu Camino PAU.', help: 'Revisa el resumen y empieza cuando lo tengas claro.' },
  saving: { title: 'Construyendo tu Camino PAU', help: 'Estamos preparando tu experiencia inicial.' },
  done: { title: 'Tu Camino PAU está listo', help: 'Kairo ya tiene lo necesario para empezar a ayudarte.' },
}

const SIDEBAR_STEPS = ['Comunidad', 'Centro', 'Asignaturas', 'Preparación', 'Tiempo', 'Días', 'Confirmar']

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');`

const BASE_CSS = `
*{box-sizing:border-box}
.onb-input{width:100%;border:none;background:transparent;padding:0;font-size:13px;font-weight:700;color:#1c1c1c;font-family:'Inter',system-ui,sans-serif;outline:none}
.onb-input::placeholder{color:#94a3b8;font-weight:500}
@keyframes onb-top-slam{0%{transform:translateY(-50%);opacity:0}45%{opacity:1}72%{transform:translateY(3.5%)}86%{transform:translateY(-1%)}100%{transform:translateY(0)}}
@keyframes onb-bot-slam{0%{transform:translateY(50%);opacity:0}45%{opacity:1}72%{transform:translateY(-3.5%)}86%{transform:translateY(1%)}100%{transform:translateY(0)}}
@keyframes onb-seam{0%{opacity:0;transform:scaleX(0.3)}40%{opacity:1;transform:scaleX(1)}75%{opacity:0.5}100%{opacity:0}}
@keyframes onb-bar-save{0%{width:0}100%{width:80%}}
.onb-lw{position:relative;display:inline-block;margin-right:-4px}.onb-lw:last-child{margin-right:0}
.onb-ghost{font-size:100px;font-weight:900;letter-spacing:-0.04em;line-height:1;visibility:hidden;display:block;white-space:nowrap}
.onb-glyph{position:absolute;top:0;left:0;font-size:100px;font-weight:900;color:white;letter-spacing:-0.04em;line-height:1;white-space:nowrap;display:block}
.onb-top{clip-path:inset(0 0 50% 0);animation:onb-top-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
.onb-bot{clip-path:inset(50% 0 0 0);animation:onb-bot-slam .72s cubic-bezier(0.34,1.4,0.64,1) both}
.onb-seam{position:absolute;left:-2px;right:-2px;top:calc(50% - 1px);height:2px;background:linear-gradient(90deg,transparent,rgba(37,99,235,0.9),rgba(120,196,255,0.95),rgba(37,99,235,0.9),transparent);animation:onb-seam .72s ease-out both;pointer-events:none}
`

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
    const enabledSelected = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    if (enabledSelected.includes('Matemáticas II')) msgs.push('Ordenando tus 60 temas de Matemáticas II…')
    if (enabledSelected.includes('Matemáticas CCSS')) msgs.push('Ordenando tus temas de Matemáticas CCSS…')
    if (enabledSelected.includes('Lengua Castellana')) msgs.push('Preparando comentario, gramática y literatura…')
    if (enabledSelected.includes('Historia de España')) msgs.push('Construyendo tu cronología de Historia de España…')
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
    const selectedEnabled = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    saveOnboarding({ ...data, subjects: selectedEnabled, completedAt })
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
            subjects: selectedEnabled,
            preparationFeeling: data.preparationFeeling,
            dailyStudyTime: data.dailyStudyTime,
            dailyMinutes: data.dailyMinutes,
            weeklyStudyDays: data.weeklyStudyDays,
            weeklyStudyDaysValue: data.weeklyStudyDaysValue,
            onboardingCompleted: true,
          }),
        })

        const subjectSlugs = selectedEnabled
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
            setSavingError(generateRetriesRef.current >= 2 ? 'Algo fue mal. Contacta con soporte en hola@kairo.es' : 'No pudimos generar tu plan. Inténtalo de nuevo.')
            return
          }
          const genJson = await genRes.json()
          if (!genJson.success) {
            setSavingError(generateRetriesRef.current >= 2 ? 'Algo fue mal. Contacta con soporte en hola@kairo.es' : 'No pudimos generar tu plan. Inténtalo de nuevo.')
            return
          }
        }
      }
      markOnboardingComplete()
      router.push('/camino')
    } catch {
      setSavingError(generateRetriesRef.current >= 2 ? 'Algo fue mal. Contacta con soporte en hola@kairo.es' : 'No hemos podido guardar el onboarding. Prueba otra vez en unos segundos.')
    }
  }

  const isSaving = step === 'saving'
  const isDone = step === 'done'
  const showBack = !isDone && !isSaving && (step === 'community' || stepIndex > 0)
  const showContinue = !isDone && !isSaving && stepIndex >= 0 && step !== 'confirm'
  const showConfirm = !isDone && !isSaving && step === 'confirm'

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{FONTS + BASE_CSS}</style>
      {step === 'welcome'
        ? renderWelcome()
        : (isSaving || isDone)
          ? renderSavingDone()
          : renderShell()}
    </div>
  )

  // ─── V4: Welcome screen ──────────────────────────────────────────────────────
  function renderWelcome() {
    return (
      <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#111' }}>
        {/* Left — dark editorial */}
        <div style={{ width: '50%', display: 'flex', flexDirection: 'column', background: '#111', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative large K */}
          <div style={{ position: 'absolute', top: '50%', left: '-20px', transform: 'translateY(-56%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(200px, 22vw, 300px)', color: 'rgba(255,255,255,.025)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-0.03em' }}>K</div>

          {/* Header */}
          <div style={{ padding: '22px 44px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '.05em', color: '#fff' }}>Kairo</span>
            <span style={{ padding: '4px 10px', border: '1px solid rgba(37,99,235,.3)', background: 'rgba(37,99,235,.1)', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#3b82f6' }}>Beta privada</span>
          </div>

          {/* Main */}
          <div style={{ flex: 1, padding: '0 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>Tu plan de selectividad · 2025–2026</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 6.5vw, 88px)', lineHeight: .91, color: '#fff', letterSpacing: '.01em', marginBottom: 22 }}>
              La PAU<br />empieza<br /><span style={{ color: 'rgba(255,255,255,.2)' }}>hoy.</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,.4)', maxWidth: 380, marginBottom: 36 }}>
              7 preguntas. 3 minutos. Kairo construye un Camino PAU adaptado a tu comunidad, asignaturas y ritmo real.
            </p>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0, border: '1px solid rgba(255,255,255,.08)', marginBottom: 40 }}>
              {[['4.200+', 'Alumnos'], ['8.4', 'Nota media'], ['2 min', 'Configurar']].map(([val, label], i) => (
                <div key={i} style={{ padding: '14px 18px', borderRight: i < 2 ? '1px solid rgba(255,255,255,.08)' : 'none' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 28, color: '#fff', lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 3 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Circle CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button
                onClick={goNext}
                style={{ width: 100, height: 100, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.2)', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .2s, border-color .2s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.2)' }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: '.08em', color: '#fff', lineHeight: 1.2, textAlign: 'center' }}>Empezar</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>↗</span>
              </button>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', lineHeight: 1.7 }}>
                Personaliza tu plan<br />de preparación PAU<br />Gratis en beta privada
              </div>
            </div>
          </div>

          {/* Progress */}
          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,.07)', padding: '14px 44px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', gap: 4 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 2, background: 'rgba(255,255,255,.08)', borderRadius: 2 }} />
              ))}
            </div>
          </div>
        </div>

        {/* Right — cinematic photo */}
        <div style={{ width: '50%', position: 'relative', overflow: 'hidden' }}>
          <img src={HF_LIBRARY} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(.55) saturate(.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,17,17,.9) 0%, rgba(17,17,17,.15) 45%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 32, right: 32, textAlign: 'right' }}>
            <div style={{ display: 'inline-block', padding: '4px 10px', border: '1px solid rgba(255,255,255,.15)', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Editorial · Higgsfield</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', maxWidth: 160, lineHeight: 1.6 }}>Miles de alumnos ya han aprobado su PAU con Kairo</p>
          </div>
        </div>
      </div>
    )
  }

  // ─── V1: Step shell ───────────────────────────────────────────────────────────
  function renderShell() {
    const photo = STEP_PHOTO[step] ?? HF_FLATLAY
    const headlines = STEP_HEADLINE[step] ?? []

    return (
      <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#111' }}>
        {/* Left — cinematic photo */}
        <div style={{ width: '44%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          <AnimatePresence mode="wait">
            <motion.img
              key={photo}
              src={photo}
              alt=""
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(.45) saturate(.55)' }}
            />
          </AnimatePresence>
          {/* Gradient: dark right edge + dark bottom */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,17,17,.1) 0%, rgba(17,17,17,.75) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,.7) 0%, transparent 55%)' }} />

          {/* Content overlay */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 36px', zIndex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
              Paso {currentStep} de {STEPS.length} · {SIDEBAR_STEPS[stepIndex] ?? ''}
            </div>

            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
                >
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px, 5.5vw, 72px)', lineHeight: .92, color: '#fff', letterSpacing: '.01em' }}>
                    {headlines.map((line, i) => <div key={i}>{line}</div>)}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom mini stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,.06)', marginTop: 28 }}>
                <div style={{ background: 'rgba(17,17,17,.7)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', lineHeight: 1 }}>{currentStep}/{STEPS.length}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 2 }}>Pasos</div>
                </div>
                <div style={{ background: 'rgba(17,17,17,.7)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', lineHeight: 1 }}>{progressPct}%</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 2 }}>Completado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — editorial white panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9', overflow: 'hidden' }}>
          {/* Progress track */}
          <div style={{ height: 2, background: '#e0e0e0', flexShrink: 0, position: 'relative' }}>
            <motion.div
              style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#1c1c1c' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          {/* Header */}
          <div style={{ padding: '16px 40px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '.04em', color: '#1c1c1c' }}>Kairo</span>
            <div style={{ display: 'flex', gap: 0 }}>
              {SIDEBAR_STEPS.map((label, i) => {
                const done = currentStep > i + 1
                const active = currentStep === i + 1
                return (
                  <div key={label} style={{ padding: '5px 12px', borderLeft: i === 0 ? '1px solid #e0e0e0' : 'none', border: '1px solid #e0e0e0', borderRight: i === SIDEBAR_STEPS.length - 1 ? '1px solid #e0e0e0' : 'none', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: active ? '#fff' : done ? '#1c1c1c' : '#94a3b8', background: active ? '#1c1c1c' : done ? '#f0f0f0' : 'transparent' }}>
                    {label}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Step title */}
          <div style={{ padding: '24px 40px 0', flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Paso {currentStep} · {SIDEBAR_STEPS[stepIndex] ?? ''}</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.03em', color: '#1c1c1c', marginBottom: 4, lineHeight: 1.15 }}>{STEP_LABELS[step].title}</div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{STEP_LABELS[step].help}</p>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${step}-content`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                style={{ width: '100%' }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e0e0e0', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#f9f9f9' }}>
            <div>
              {showBack && (
                <button onClick={goBack} style={{ padding: '9px 18px', background: 'none', border: '1px solid #e0e0e0', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', cursor: 'pointer' }}>
                  ← Atrás
                </button>
              )}
            </div>
            <div>
              {showContinue && (
                <button
                  onClick={goNext}
                  disabled={!canContinue}
                  style={{ padding: '11px 28px', background: canContinue ? '#1c1c1c' : '#e0e0e0', border: 'none', color: canContinue ? '#fff' : '#94a3b8', fontSize: 13, fontWeight: 800, letterSpacing: '-.01em', cursor: canContinue ? 'pointer' : 'not-allowed', transition: 'background .12s' }}
                >
                  Continuar →
                </button>
              )}
              {showConfirm && (
                <button onClick={finish} style={{ padding: '11px 28px', background: '#1c1c1c', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-.01em', cursor: 'pointer' }}>
                  Crear mi Camino PAU →
                </button>
              )}
              {isDone && (
                <button onClick={() => router.push('/camino')} style={{ padding: '11px 28px', background: '#1c1c1c', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                  Ver mi Camino PAU →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Saving / Done full-screen ────────────────────────────────────────────────
  function renderSavingDone() {
    if (isDone) {
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={30} color="#111" strokeWidth={3} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', letterSpacing: '.02em' }}>Tu Camino PAU está listo</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Tu primer día empieza mañana.</p>
          <button onClick={() => router.push('/camino')} style={{ marginTop: 8, padding: '12px 32px', background: '#fff', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            Ver mi Camino PAU →
          </button>
        </div>
      )
    }

    if (savingError) {
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16, padding: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#f87171', textAlign: 'center', maxWidth: 400 }}>{savingError}</p>
          {generateRetriesRef.current < 2 && (
            <button onClick={finish} style={{ padding: '11px 24px', background: '#fff', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Reintentar
            </button>
          )}
        </div>
      )
    }

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 40 }}>
          {['K', 'A', 'I', 'R', 'O'].map((ch, i) => (
            <div key={i} className="onb-lw">
              <span className="onb-ghost">{ch}</span>
              <span className="onb-glyph onb-top" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
              <span className="onb-glyph onb-bot" style={{ animationDelay: `${i * 110}ms` }}>{ch}</span>
              <div className="onb-seam" style={{ animationDelay: `${i * 110}ms` }} />
            </div>
          ))}
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginBottom: 10 }}>
          Generando tu Camino PAU
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={savingMsgIdx}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3 }}
            style={{ fontSize: 13, fontWeight: 700, color: '#475569', margin: '0 0 28px', fontFamily: "'Inter', system-ui, sans-serif" }}
          >
            {savingMessages[savingMsgIdx]}
          </motion.p>
        </AnimatePresence>
        <div style={{ width: 200, height: 2, background: 'rgba(255,255,255,.06)', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#2563eb', animation: 'onb-bar-save 6s ease-out forwards' }} />
        </div>
      </div>
    )
  }

  // ─── Step content ─────────────────────────────────────────────────────────────
  function renderStep() {
    if (step === 'community') {
      return (
        <EditorialGrid cols={3}>
          {COMMUNITY_OPTS.map(opt => (
            <EditorialChoice key={opt.id} title={opt.label} sub={opt.desc} selected={data.community === opt.id} onClick={() => selectCommunity(opt.id)} />
          ))}
        </EditorialGrid>
      )
    }

    if (step === 'school') {
      const showDropdown = schoolOpen && schoolQuery.length >= 2
      return (
        <div style={{ position: 'relative' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #e0e0e0', background: '#fff', padding: '11px 16px' }}>
            <Search size={15} style={{ color: '#94a3b8', flexShrink: 0 }} />
            <input
              type="text"
              value={schoolQuery}
              onChange={e => { setSchoolQuery(e.target.value); setSchoolOpen(true) }}
              onFocus={() => setSchoolOpen(true)}
              onBlur={() => setTimeout(() => setSchoolOpen(false), 150)}
              placeholder="Busca tu instituto..."
              className="onb-input"
              autoFocus
            />
          </label>
          {showDropdown && (
            <div style={{ position: 'absolute', left: 0, right: 0, top: 'calc(100% + 4px)', zIndex: 20, border: '1px solid #e0e0e0', background: '#fff', overflow: 'hidden', boxShadow: '0 12px 40px rgba(0,0,0,.1)' }}>
              {filteredCenters.map(center => (
                <button
                  key={center}
                  type="button"
                  onMouseDown={() => selectSchool(center, 'dataset')}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', border: 'none', borderBottom: '1px solid #f0f0f0', background: data.schoolName === center ? '#1c1c1c' : '#fff', cursor: 'pointer', padding: '10px 16px' }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: data.schoolName === center ? '#fff' : '#1c1c1c' }}>{center}</span>
                </button>
              ))}
              <button
                type="button"
                onMouseDown={() => selectSchool('Mi centro no aparece', 'manual')}
                style={{ display: 'flex', alignItems: 'center', width: '100%', textAlign: 'left', border: 'none', background: data.schoolName === 'Mi centro no aparece' ? '#1c1c1c' : '#f9f9f9', cursor: 'pointer', padding: '10px 16px', borderTop: '1px solid #e0e0e0' }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: data.schoolName === 'Mi centro no aparece' ? '#fff' : '#64748b' }}>Mi centro no aparece</span>
              </button>
            </div>
          )}
        </div>
      )
    }

    if (step === 'subjects') {
      return (
        <div>
          <div style={{ border: '1px solid #bfdbfe', background: '#eff6ff', padding: '10px 14px', marginBottom: 16 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 3 }}>Beta privada</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', lineHeight: 1.5 }}>De momento puedes probar con Matemáticas II, CCSS, Lengua e Historia. El resto se irá abriendo próximamente.</div>
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Disponibles en beta privada</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0', marginBottom: 14 }}>
            {PRIVATE_BETA_ENABLED_SUBJECTS.map(subject => {
              const selected = data.subjects.includes(subject.id)
              return (
                <button
                  key={subject.id}
                  onClick={() => toggleSubject(subject.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: selected ? '#1c1c1c' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
                >
                  <div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected ? '#fff' : subject.color, marginBottom: 8 }} />
                    <div style={{ fontSize: 12, fontWeight: 700, color: selected ? '#fff' : '#1c1c1c', lineHeight: 1.3 }}>{subject.label}</div>
                  </div>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: selected ? '#fff' : 'transparent', border: selected ? 'none' : '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {selected && <Check size={9} color="#1c1c1c" strokeWidth={3} />}
                  </div>
                </button>
              )
            })}
          </div>
          <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.2em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Próximamente</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0', opacity: .45 }}>
            {PRIVATE_BETA_LOCKED_SUBJECTS.map(subject => (
              <div key={subject.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#fff' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>{subject.label}</div>
                <Lock size={11} style={{ color: '#cbd5e1' }} strokeWidth={2.5} />
              </div>
            ))}
          </div>
          {!canContinue && (
            <div style={{ marginTop: 14, border: '1px solid #fde68a', background: '#fffbeb', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#92400e' }}>
              Selecciona al menos una asignatura disponible para construir tu Camino PAU.
            </div>
          )}
        </div>
      )
    }

    if (step === 'feeling') {
      return (
        <EditorialGrid cols={2}>
          {FEELING_OPTS.map(label => (
            <EditorialChoice key={label} title={label} selected={data.preparationFeeling === label} onClick={() => update({ preparationFeeling: label })} />
          ))}
        </EditorialGrid>
      )
    }

    if (step === 'daily-time') {
      return (
        <EditorialGrid cols={2}>
          {TIME_OPTS.map(opt => (
            <EditorialChoice key={opt.label} title={opt.label} selected={data.dailyStudyTime === opt.label} onClick={() => update({ dailyStudyTime: opt.label, dailyMinutes: opt.minutes })} />
          ))}
        </EditorialGrid>
      )
    }

    if (step === 'weekly-days') {
      return (
        <EditorialGrid cols={2}>
          {WEEKLY_DAY_OPTS.map(opt => (
            <EditorialChoice key={opt.label} title={opt.label} selected={data.weeklyStudyDays === opt.label} onClick={() => update({ weeklyStudyDays: opt.label, weeklyStudyDaysValue: opt.value })} />
          ))}
        </EditorialGrid>
      )
    }

    if (step === 'confirm') {
      return (
        <div>
          {savingError && (
            <div style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#991b1b', marginBottom: 14 }}>
              {savingError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
            {[
              ['Comunidad', data.community || '—'],
              ['Centro educativo', data.schoolName || '—'],
              ['Asignaturas', data.subjects.join(', ') || '—'],
              ['Preparación', data.preparationFeeling || '—'],
              ['Tiempo diario', data.dailyStudyTime || '—'],
              ['Días por semana', data.weeklyStudyDays || '—'],
            ].map(([label, value]) => (
              <div key={label} style={{ background: '#fff', padding: '16px 18px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1c', lineHeight: 1.4 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return null
  }
}

function normalizeSearch(value: string) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim().replace(/\s+/g, ' ')
}

function EditorialGrid({ children, cols }: { children: ReactNode; cols: number }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
      {children}
    </div>
  )
}

function EditorialChoice({ title, sub, selected, onClick }: { title: string; sub?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '16px 18px', background: selected ? '#1c1c1c' : '#fff', border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background .12s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: selected ? '#fff' : '#1c1c1c', lineHeight: 1.3 }}>{title}</div>
        {sub && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.06em', color: selected ? 'rgba(255,255,255,.4)' : '#94a3b8', marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ width: 14, height: 14, borderRadius: '50%', background: selected ? '#fff' : 'transparent', border: selected ? 'none' : '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {selected && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="#1c1c1c" strokeWidth="1.8" strokeLinecap="round" /></svg>}
      </div>
    </button>
  )
}
