'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, Lock, Plus, Search, Trash2 } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { validateUsername, normalizeUsername } from '@/app/lib/username'
import { CENTROS_MADRID } from '@/app/data/centros_madrid'
import { CENTROS_CATALUNA } from '@/app/data/centros_cataluna'
import { normalizeInstituteName } from '@/app/lib/camino/instituteNormalize'
import { normalizeBlockKey } from '@/app/lib/simulacros/blockNormalization'
import { DAILY_MINUTES_LABELS } from '@/app/lib/camino/dailyTimeCapacity'
import { normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { DEFAULT_GRADE_THRESHOLD } from '@/app/lib/camino/gradeThreshold'
import {
  clearOnboarding,
  ensureOnboardingTraceId,
  loadOnboarding,
  markOnboardingComplete,
  restoreOnboardingFromServer,
  saveOnboarding,
  syncOnboardingCommunity,
  type OnboardingCommunity,
  type OnboardingData,
  type OnboardingStudentExam,
  type PainType,
} from '@/app/lib/onboarding/onboardingStorage'
import { sendOnboardingEvent, type OnboardingStepId } from '@/app/lib/onboarding/onboardingEvents'
import { createActiveDurationTracker } from '@/app/lib/onboarding/activeDuration'

type Step = 'welcome' | 'pain' | 'pain-result' | 'name' | 'community' | 'school' | 'subjects' | 'upcoming-exams' | 'feeling' | 'daily-time' | 'weekly-days' | 'grade-threshold' | 'confirm' | 'saving' | 'done'

// 'pain' cuenta como pregunta real dentro del wizard (progreso, chrome
// estándar). 'pain-result' es una pantalla de resultado sin formulario (como
// 'welcome'/'saving'/'done') y por eso vive fuera de este array.
const STEPS: Step[] = ['pain', 'name', 'community', 'school', 'subjects', 'upcoming-exams', 'feeling', 'daily-time', 'weekly-days', 'grade-threshold', 'confirm']

// Fase 0 de observabilidad: mapea los steps internos del wizard a step_id
// semánticos y estables para no depender del índice numérico.
const STEP_ID_MAP: Record<Step, OnboardingStepId> = {
  welcome: 'welcome',
  pain: 'pain',
  'pain-result': 'pain_result',
  name: 'username',
  community: 'community',
  school: 'school',
  subjects: 'subjects',
  'upcoming-exams': 'upcoming_exam',
  feeling: 'preparation',
  'daily-time': 'study_time',
  'weekly-days': 'study_days',
  'grade-threshold': 'grade_threshold',
  confirm: 'confirmation',
  saving: 'saving',
  done: 'done',
}

const PAIN_OPTS: Array<{ id: PainType; label: string }> = [
  { id: 'daily_plan', label: 'Nunca sé qué estudiar cada día.' },
  { id: 'correction_confidence', label: 'Hago ejercicios, pero no sé si están bien.' },
  { id: 'procrastination', label: 'Sé que acabaré dejándolo para el final.' },
  { id: 'improve_grade', label: 'Necesito subir mi nota en la PAU.' },
]

const PAIN_RESULT_COPY: Record<PainType, { title: string; body: string }> = {
  daily_plan: {
    title: 'Deja de decidir cada tarde qué toca.',
    body: 'Kairo organizará tus asignaturas y tu tiempo para que cada día tengas una tarea clara.',
  },
  correction_confidence: {
    title: 'Sabrás exactamente dónde pierdes puntos.',
    body: 'Practicarás y corregirás tus errores antes de repetirlos en el examen.',
  },
  procrastination: {
    title: 'Llega al final de curso sin tenerlo todo pendiente.',
    body: 'Kairo distribuirá el trabajo según el tiempo que puedas mantener de verdad.',
  },
  improve_grade: {
    title: 'Entrena para mejorar, no solo para terminar.',
    body: 'Kairo priorizará aquello que más puede ayudarte a avanzar.',
  },
}

const HF_FLATLAY = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125450_f5670e8f-277d-470e-82b0-58dd6db26d4b.png'
const HF_LIBRARY = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125452_25c3d09d-ecc3-4e9b-8a16-773cfeb46a83.png'
const HF_EQUATIONS = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260727_125527_d366f113-8e29-4f93-b91c-7a6c40bfe1d1.png'

const STEP_PHOTO: Partial<Record<Step, string>> = {
  pain: HF_EQUATIONS,
  name: HF_FLATLAY,
  community: HF_FLATLAY,
  school: HF_EQUATIONS,
  subjects: HF_FLATLAY,
  'upcoming-exams': HF_EQUATIONS,
  feeling: HF_EQUATIONS,
  'daily-time': HF_LIBRARY,
  'weekly-days': HF_LIBRARY,
  'grade-threshold': HF_LIBRARY,
  confirm: HF_FLATLAY,
}

const STEP_HEADLINE: Partial<Record<Step, string[]>> = {
  pain: ['¿Qué te', 'preocupa', 'más?'],
  name: ['¿Cómo', 'te', 'llamas?'],
  community: ['¿Dónde', 'haces la', 'PAU?'],
  school: ['¿Cuál es', 'tu', 'centro?'],
  subjects: ['¿Qué', 'asigna-', 'turas?'],
  'upcoming-exams': ['¿Tienes', 'un parcial', 'pronto?'],
  feeling: ['¿Cómo', 'llevas la', 'prep?'],
  'daily-time': ['¿Cuánto', 'tiempo', 'al día?'],
  'weekly-days': ['¿Cuántos', 'días a la', 'semana?'],
  'grade-threshold': ['¿Cuándo', 'repetir', 'para mejorar?'],
  confirm: ['Tu plan', 'está', 'listo.'],
}

const COMMUNITY_OPTS: Array<{ id: OnboardingCommunity; label: string; desc: string; available: boolean }> = [
  { id: 'Madrid', label: 'Madrid', desc: 'EBAU Madrid', available: true },
  // Cataluña no se puede seleccionar para un Camino nuevo todavía — Camino
  // no está operativo ahí. No se elimina de OnboardingCommunity (drafts o
  // perfiles antiguos con 'Cataluña' guardada deben poder seguir cargando).
  { id: 'Cataluña', label: 'Cataluña', desc: 'Próximamente', available: false },
  { id: 'Otra', label: 'Otra comunidad', desc: 'Ruta troncal común', available: true },
]
const COMMUNITY_AVAILABLE_IDS = new Set(COMMUNITY_OPTS.filter(opt => opt.available).map(opt => opt.id))

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

// Etiquetas tomadas de DAILY_MINUTES_LABELS (dailyTimeCapacity.ts) — misma
// fuente que usa Ajustes al recalcular esta etiqueta tras un cambio
// posterior, para que nunca queden desincronizadas.
const TIME_OPTS = [
  { label: DAILY_MINUTES_LABELS[30], minutes: 30 },
  { label: DAILY_MINUTES_LABELS[45], minutes: 45 },
  { label: DAILY_MINUTES_LABELS[60], minutes: 60 },
  { label: DAILY_MINUTES_LABELS[90], minutes: 90 },
  { label: DAILY_MINUTES_LABELS[150], minutes: 150 },
  { label: DAILY_MINUTES_LABELS[180], minutes: 180 },
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

const GRADE_THRESHOLD_OPTS = [4, 5, 6, 7, 8]

const STEP_LABELS: Record<Step, { title: string; help: string }> = {
  welcome: { title: 'Crea tu Camino PAU', help: 'Te haremos unas preguntas rápidas para adaptar Kairo a tu comunidad, centro y ritmo real.' },
  pain: { title: '¿Qué es lo que más te preocupa de segundo?', help: 'No hay una respuesta correcta — nos ayuda a priorizar tu Camino.' },
  'pain-result': { title: '', help: '' },
  name: { title: '¿Cómo quieres que te llamemos?', help: 'Usaremos tu nombre para personalizar la experiencia dentro de la app.' },
  community: { title: '¿Dónde haces la PAU?', help: 'Así ajustamos la experiencia a tu comunidad autónoma.' },
  school: { title: '¿Cuál es tu centro educativo?', help: 'Si coincides con alumnos de tu mismo instituto, adaptamos el temario a vuestro ritmo real.' },
  subjects: { title: '¿Qué asignaturas quieres preparar?', help: 'Elige todas las que entran en tu PAU. Puedes cambiarlo más adelante.' },
  'upcoming-exams': { title: '¿Tienes algún examen pronto?', help: 'Opcional. Si tienes un parcial cerca, Kairo añadirá práctica específica antes de esa fecha.' },
  feeling: { title: '¿Cómo llevas la preparación?', help: 'No es una evaluación. Solo nos ayuda a ajustar el tono y el ritmo.' },
  'daily-time': { title: '¿Cuánto tiempo podrías estudiar al día?', help: 'Lo ajustaremos mejor más adelante según tu ritmo.' },
  'weekly-days': { title: '¿Cuántos días a la semana estudiarías?', help: 'Kairo adapta el Camino a tu ritmo real de estudio.' },
  'grade-threshold': { title: '¿A partir de qué nota quieres repetir para mejorar?', help: 'Cuando saques menos de esta nota en un simulacro, examen o curso, Kairo te sugerirá repetirlo — tú decides si aceptar.' },
  confirm: { title: 'Así vamos a preparar tu Camino', help: 'Revisa cada bloque y edítalo si algo no encaja.' },
  saving: { title: 'Construyendo tu Camino PAU', help: 'Estamos preparando tu experiencia inicial.' },
  done: { title: 'Tu Camino PAU está listo', help: 'Kairo ya tiene lo necesario para empezar a ayudarte.' },
}

const SIDEBAR_STEPS = ['Dolor', 'Nombre', 'Comunidad', 'Centro', 'Asignaturas', 'Parciales', 'Preparación', 'Tiempo', 'Días', 'Umbral', 'Confirmar']

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
@media(max-width:767px){
  .onb-photo-panel{display:none!important}
  .onb-form-panel{width:100%!important;padding:0 20px!important}
  .onb-welcome-left{width:100%!important;padding:28px 24px!important}
  .onb-welcome-right{display:none!important}
  .onb-main-pad{padding:0 24px!important}
  .onb-header-pad{padding:18px 24px!important}
  .onb-footer-pad{padding:14px 24px!important}
  .onb-steps-header{padding:14px 20px!important}
  .onb-scroll-form{padding:20px 24px!important}
  .onb-steps-tabs{display:none!important}
  .onb-steps-compact{display:flex!important}
}
`

export default function OnboardingFlow() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isPreview = searchParams.get('preview') === '1'
  const [step, setStep] = useState<Step>('welcome')
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding())
  const [savingError, setSavingError] = useState('')
  const [savingMsgIdx, setSavingMsgIdx] = useState(0)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolOpen, setSchoolOpen] = useState(false)
  const [dbInstitutes, setDbInstitutes] = useState<string[]>([])
  const [examDraft, setExamDraft] = useState({ subject: '', date: inputDate(addDays(new Date(), 10)), block: '', topic: '', name: '', priority: 'normal' as const })
  const generateRetriesRef = useRef(0)
  // Efecto espejo (Fase 1): mission_type NO determina si una misión admite
  // corrección paso a paso (auditado — ver app/api/onboarding/generate/route.ts).
  // supportsStepCorrection es la señal real, calculada en servidor con la
  // misma resolución de tema que usa /api/camino/correct.
  const firstMissionSupportsCorrectionRef = useRef<boolean>(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [usernameError, setUsernameError] = useState('')
  const usernameCheckId = useRef(0)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fase 0 de observabilidad del onboarding (medición pura, ver AGENTS.md).
  const traceIdRef = useRef<string | null>(null)
  const onboardingStartedRef = useRef(false)
  const stepTimerRef = useRef<ReturnType<typeof createActiveDurationTracker> | null>(null)
  const stepVisitCountsRef = useRef<Record<string, number>>({})
  const stepValidationAttemptsRef = useRef<Record<string, number>>({})

  function incrementValidationAttempt(stepKey: Step) {
    const next = (stepValidationAttemptsRef.current[stepKey] ?? 0) + 1
    stepValidationAttemptsRef.current[stepKey] = next
    return next
  }

  async function checkUsername(u: string): Promise<boolean> {
    const err = validateUsername(u)
    if (err) {
      setUsernameStatus('invalid')
      setUsernameError(err)
      setUsernameSuggestions([])
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_validation_failed', {
        step_id: 'username',
        step_index: STEPS.indexOf('name'),
        error_code: 'invalid_format',
        validation_attempts: incrementValidationAttempt('name'),
      })
      return false
    }
    const id = ++usernameCheckId.current
    setUsernameStatus('checking')
    setUsernameError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/username/check?u=${encodeURIComponent(u)}`, { headers })
      if (usernameCheckId.current !== id) return false // stale
      const json = await res.json() as { available?: boolean; error?: string; suggestions?: string[] }
      if (json.error && !json.available) {
        setUsernameStatus('invalid')
        setUsernameError(json.error)
        setUsernameSuggestions([])
        void sendOnboardingEvent(traceIdRef.current, 'onboarding_validation_failed', {
          step_id: 'username',
          step_index: STEPS.indexOf('name'),
          error_code: 'invalid_format',
          validation_attempts: incrementValidationAttempt('name'),
        })
        return false
      }
      if (json.available) {
        setUsernameStatus('available')
        setUsernameSuggestions([])
        return true
      }
      setUsernameStatus('taken')
      setUsernameSuggestions(json.suggestions ?? [])
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_validation_failed', {
        step_id: 'username',
        step_index: STEPS.indexOf('name'),
        error_code: 'username_taken',
        validation_attempts: incrementValidationAttempt('name'),
      })
      return false
    } catch {
      if (usernameCheckId.current !== id) return false
      setUsernameStatus('idle')
      return false
    }
  }

  // On mount: redirect already-completed users; restore last step for interrupted sessions.
  // El servidor es la única fuente de verdad de si ESTA cuenta completó
  // onboarding — `kairo_onboarding_v1` no está vinculado al usuario, así que
  // en un navegador compartido entre cuentas puede traer un `completedAt` de
  // otra cuenta. Por eso se consulta el servidor primero y solo se usa la
  // copia local como fallback si la consulta falla (offline).
  useEffect(() => {
    let cancelled = false
    async function restore() {
      let saved = loadOnboarding()
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const token = sessionData.session?.access_token
        if (token) {
          const result = await restoreOnboardingFromServer(token)
          if (result.status === 'found') {
            if (!isPreview) { router.replace('/camino'); return }
            saved = result.data
          } else if (result.status === 'empty' && saved.completedAt) {
            // Copia local "completada" que no pertenece a esta cuenta.
            clearOnboarding()
            saved = loadOnboarding()
          } else if (result.status === 'error' && saved.completedAt && !isPreview) {
            // No se pudo consultar el servidor; si ya había onboarding local
            // (offline / fallo puntual) se respeta como antes.
            router.replace('/camino')
            return
          }
        }
      } catch { /* local resume still works */ }
      if (cancelled) return
      traceIdRef.current = saved.traceId ?? null
      if (traceIdRef.current) onboardingStartedRef.current = true
      const savedStep = saved.lastStep as Step | null
      if (savedStep && (STEPS.includes(savedStep) || savedStep === 'welcome')) {
        setStep(savedStep)
        if (savedStep !== 'welcome' && saved.schoolName) setSchoolQuery(saved.schoolName)
        // Username NUNCA se deriva del email (ver AGENTS.md / plan de
        // onboarding). Si el draft restaurado ya trae uno guardado, se
        // revalida su disponibilidad aquí mismo (tras los awaits de arriba,
        // no de forma síncrona en el cuerpo del efecto).
        if (savedStep === 'name' && saved.username && saved.username.length >= 3) {
          void checkUsername(saved.username)
        }
      }
    }
    restore()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist current step so interrupted sessions can resume
  useEffect(() => {
    if (step !== 'saving' && step !== 'done') saveOnboarding({ lastStep: step })
  }, [step])

  // Fase 0 de observabilidad: registra onboarding_step_viewed cuando el paso
  // está efectivamente renderizado, y arranca/reinicia el medidor de tiempo
  // activo del paso. No se dispara para 'welcome' (cubierto por
  // onboarding_started) ni para 'saving'/'done' (cubiertos por los eventos
  // de generación/finalización).
  useEffect(() => {
    stepTimerRef.current?.destroy()
    stepTimerRef.current = createActiveDurationTracker()

    if (step === 'welcome' || step === 'saving' || step === 'done') return
    if (!traceIdRef.current) return

    const visitCount = (stepVisitCountsRef.current[step] ?? 0) + 1
    stepVisitCountsRef.current[step] = visitCount

    void sendOnboardingEvent(traceIdRef.current, 'onboarding_step_viewed', {
      step_id: STEP_ID_MAP[step],
      step_index: STEPS.indexOf(step),
      is_revisit: visitCount > 1,
      visit_number: visitCount,
    })

    return () => { stepTimerRef.current?.destroy() }
  }, [step]) // eslint-disable-line react-hooks/exhaustive-deps

  function onUsernameChange(raw: string) {
    const val = raw.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20)
    update({ username: val })
    setUsernameStatus('idle')
    setUsernameError('')
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (val.length >= 3) {
      usernameTimer.current = setTimeout(() => void checkUsername(val), 350)
    }
  }

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
    // Fase 1: cada mensaje debe reflejar algo que realmente está ocurriendo
    // (no fingir pasos ni mostrar porcentajes falsos) — ver AGENTS.md.
    const contextMsgs: string[] = []
    if (data.community && data.community !== 'Otra') {
      contextMsgs.push(`Preparando tu Camino para la PAU de ${data.community}…`)
    }
    const nextExam = [...(data.studentExams ?? [])].sort((a, b) => a.date.localeCompare(b.date))[0]
    if (nextExam) {
      contextMsgs.push(`Priorizando ${nextExam.subject} por tu próximo parcial…`)
    }
    if (data.weeklyStudyDaysValue) {
      contextMsgs.push(`Distribuyendo tus sesiones entre ${data.weeklyStudyDaysValue} días…`)
    }
    if (data.dailyMinutes) {
      contextMsgs.push(`Adaptando las sesiones a tus ${data.dailyMinutes} minutos disponibles…`)
    }

    const subjectMsgs: string[] = []
    const enabledSelected = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    if (enabledSelected.includes('Matemáticas II')) subjectMsgs.push('Ordenando tus 60 temas de Matemáticas II…')
    if (enabledSelected.includes('Matemáticas CCSS')) subjectMsgs.push('Ordenando tus temas de Matemáticas CCSS…')
    if (enabledSelected.includes('Lengua Castellana')) subjectMsgs.push('Preparando comentario, gramática y literatura…')
    if (enabledSelected.includes('Historia de España')) subjectMsgs.push('Construyendo tu cronología de Historia de España…')
    if (subjectMsgs.length === 0) {
      subjectMsgs.push('Calculando tu ritmo de estudio…')
      subjectMsgs.push('Construyendo tu Camino PAU…')
    }

    return [...contextMsgs, ...subjectMsgs, 'Listo — tu primer día empieza mañana.']
  }, [data.subjects, data.community, data.studentExams, data.weeklyStudyDaysValue, data.dailyMinutes])

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
    if (step === 'pain') return Boolean(data.painType)
    if (step === 'name') return usernameStatus === 'available' && Boolean(data.username?.trim())
    if (step === 'community') return Boolean(data.community) && COMMUNITY_AVAILABLE_IDS.has(data.community as OnboardingCommunity)
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
    if (step === 'welcome') {
      const traceId = ensureOnboardingTraceId()
      traceIdRef.current = traceId
      if (!onboardingStartedRef.current) {
        onboardingStartedRef.current = true
        void sendOnboardingEvent(traceId, 'onboarding_started', { step_id: 'pain', step_index: 0 })
      }
      setStep('pain')
      return
    }
    if (step === 'pain') {
      // No avanza al siguiente STEPS[] — primero pasa por la pantalla de
      // resultado personalizado (sin formulario, fuera del contador de pasos).
      const durations = stepTimerRef.current?.getDurations()
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_step_completed', {
        step_id: 'pain',
        step_index: 0,
        elapsed_duration_ms: durations?.elapsedMs,
        active_duration_ms: durations?.activeMs,
        validation_attempts: stepValidationAttemptsRef.current[step] ?? 0,
      })
      setStep('pain-result')
      return
    }
    if (step === 'pain-result') {
      setStep('name')
      // Username NUNCA se deriva del email (ver AGENTS.md / plan de
      // onboarding). Si ya hay uno guardado (vuelta atrás previa, draft
      // restaurado), se revalida aquí, en la propia interacción de avanzar.
      const currentUsername = data.username
      if (currentUsername && currentUsername.length >= 3) void checkUsername(currentUsername)
      return
    }
    if (stepIndex >= 0 && stepIndex < STEPS.length - 1 && canContinue) {
      const durations = stepTimerRef.current?.getDurations()
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_step_completed', {
        step_id: STEP_ID_MAP[step],
        step_index: stepIndex,
        elapsed_duration_ms: durations?.elapsedMs,
        active_duration_ms: durations?.activeMs,
        validation_attempts: stepValidationAttemptsRef.current[step] ?? 0,
      })
      setStep(STEPS[stepIndex + 1])
    }
  }

  function goBack() {
    if (step === 'pain-result') {
      setStep('pain')
      return
    }
    if (stepIndex > 0) {
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_back_clicked', { step_id: STEP_ID_MAP[step], step_index: stepIndex })
      const previousStep = STEPS[stepIndex - 1]
      setStep(previousStep)
      // Username NUNCA se deriva del email (ver AGENTS.md / plan de
      // onboarding). Revalida al volver a 'name', en la propia interacción.
      if (previousStep === 'name') {
        const currentUsername = data.username
        if (currentUsername && currentUsername.length >= 3) void checkUsername(currentUsername)
      }
    } else if (step === 'pain') {
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_back_clicked', { step_id: STEP_ID_MAP[step], step_index: 0 })
      setStep('welcome')
    }
  }

  function selectCommunity(community: OnboardingCommunity) {
    update({ community, schoolName: null, schoolSource: null })
    setSchoolQuery('')
    setSchoolOpen(false)
    // Sync to kairo_ccaa so simulacros use the correct community immediately
    syncOnboardingCommunity({ community })
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

  function addUpcomingExam() {
    const subject = examDraft.subject || data.subjects.find(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s)) || PRIVATE_BETA_ENABLED_SUBJECTS[0]?.id || ''
    const date = examDraft.date
    if (!subject || !date) return
    const block = normalizeBlockKey(examDraft.block.trim() || 'Repaso general')
    const topic = examDraft.topic.trim()
    const exam: OnboardingStudentExam = {
      id: `onb-exam-${date}-${Date.now()}`,
      subject,
      date,
      block,
      topic,
      name: examDraft.name.trim() || `Parcial de ${subject}`,
      priority: examDraft.priority,
    }
    update({ studentExams: [...(data.studentExams ?? []), exam] })
    setExamDraft(current => ({ ...current, block: '', topic: '', name: '', date: inputDate(addDays(new Date(), 10)), priority: 'normal' }))
  }

  function removeUpcomingExam(id: string) {
    update({ studentExams: (data.studentExams ?? []).filter(exam => exam.id !== id) })
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
    const usernameForSave = data.username?.trim() || loadOnboarding().username?.trim() || ''
    const usernameErrorForSave = validateUsername(usernameForSave)
    if (usernameErrorForSave) {
      setSavingError(usernameErrorForSave)
      setStep('confirm')
      return
    }
    const selectedEnabled = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    const upcomingExams = sanitizeOnboardingExams(data.studentExams ?? [], selectedEnabled)
    saveOnboarding({ ...data, username: usernameForSave, subjects: selectedEnabled, studentExams: upcomingExams, completedAt })
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) {
        setSavingError('No hemos podido confirmar tu sesión. Inicia sesión otra vez para guardar tu perfil.')
        setStep('confirm')
        return
      }

      if (token) {
        const setupRes = await fetch('/api/onboarding/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            'X-Kairo-Trace-Id': traceIdRef.current ?? '',
            'X-Kairo-Request-Id': crypto.randomUUID(),
          },
          body: JSON.stringify({
            routeId: 'completa',
            username: usernameForSave,
            community: data.community,
            schoolName: data.schoolName,
            schoolSource: data.schoolSource,
            subjects: selectedEnabled,
            studentExams: upcomingExams,
            preparationFeeling: data.preparationFeeling,
            dailyStudyTime: data.dailyStudyTime,
            dailyMinutes: data.dailyMinutes,
            weeklyStudyDays: data.weeklyStudyDays,
            weeklyStudyDaysValue: data.weeklyStudyDaysValue,
            gradeThresholdMode: data.gradeThresholdMode,
            gradeThreshold: data.gradeThreshold,
            subjectGradeThresholds: data.subjectGradeThresholds,
            onboardingCompleted: true,
          }),
        })
        if (!setupRes.ok) {
          const setupJson = await setupRes.json().catch(() => null) as { error?: string } | null
          setSavingError(setupJson?.error ?? 'No hemos podido guardar tu perfil. Prueba otra vez en unos segundos.')
          return
        }

        const subjectSlugs = selectedEnabled
          .map(s => SUBJECT_TO_SLUG[s])
          .filter((s): s is string => Boolean(s))

        if (subjectSlugs.length > 0) {
          generateRetriesRef.current += 1
          // onboarding_generation_started/succeeded/failed se emiten desde
          // /api/onboarding/generate (servidor), no desde aquí — ver Fase 0:
          // el servidor es la única fuente de verdad para esos 3 eventos,
          // así un cierre de pestaña a mitad de fetch no puede hacer parecer
          // que una generación exitosa falló.
          const generateRequestId = crypto.randomUUID()
          const genRes = await fetch('/api/onboarding/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Kairo-Trace-Id': traceIdRef.current ?? '',
              'X-Kairo-Request-Id': generateRequestId,
            },
            body: JSON.stringify({ subjects: subjectSlugs, startMode: 'zero', studentExams: upcomingExams, dailyMinutes: data.dailyMinutes }),
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
          firstMissionSupportsCorrectionRef.current = Boolean(genJson.firstMission?.supportsStepCorrection)
        }
      }
      markOnboardingComplete()
      // Ensure kairo_ccaa is in sync at completion (covers edge cases where
      // selectCommunity ran on a previous session)
      syncOnboardingCommunity(data)
      void sendOnboardingEvent(traceIdRef.current, 'onboarding_flow_completed', {
        step_id: 'done',
        subjects_count: selectedEnabled.length,
        has_upcoming_exam: upcomingExams.length > 0,
        study_time_bucket: data.dailyMinutes ? String(data.dailyMinutes) : (data.dailyStudyTime ?? undefined),
        study_days_count: data.weeklyStudyDaysValue,
      })
      setStep('done')
    } catch {
      setSavingError(generateRetriesRef.current >= 2 ? 'Algo fue mal. Contacta con soporte en hola@kairo.es' : 'No hemos podido guardar el onboarding. Prueba otra vez en unos segundos.')
    }
  }

  const isSaving = step === 'saving'
  const isDone = step === 'done'
  const showBack = !isDone && !isSaving && (step === 'pain' || stepIndex > 0)
  const showContinue = !isDone && !isSaving && stepIndex >= 0 && step !== 'confirm'
  const showConfirm = !isDone && !isSaving && step === 'confirm'

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{FONTS + BASE_CSS}</style>
      {step === 'welcome'
        ? renderWelcome()
        : step === 'pain-result'
          ? renderPainResult()
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
        <div className="onb-welcome-left" style={{ width: '50%', display: 'flex', flexDirection: 'column', background: '#111', position: 'relative', overflow: 'hidden' }}>
          {/* Decorative large K */}
          <div style={{ position: 'absolute', top: '50%', left: '-20px', transform: 'translateY(-56%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(200px, 22vw, 300px)', color: 'rgba(255,255,255,.025)', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-0.03em' }}>K</div>

          {/* Header */}
          <div className="onb-header-pad" style={{ padding: '22px 44px', borderBottom: '1px solid rgba(255,255,255,.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative', zIndex: 1 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '.05em', color: '#fff' }}>Kairo</span>
            <span style={{ padding: '4px 10px', border: '1px solid rgba(37,99,235,.3)', background: 'rgba(37,99,235,.1)', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#3b82f6' }}>Beta privada</span>
          </div>

          {/* Main */}
          <div className="onb-main-pad" style={{ flex: 1, padding: '0 44px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 20 }}>La PAU empieza hoy</div>
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(52px, 6.5vw, 88px)', lineHeight: .91, color: '#fff', letterSpacing: '.01em', marginBottom: 22 }}>
              La PAU<br />empieza<br /><span style={{ color: 'rgba(255,255,255,.2)' }}>hoy.</span>
            </div>
            <p style={{ fontSize: 13, lineHeight: 1.75, color: 'rgba(255,255,255,.4)', maxWidth: 380, marginBottom: 40 }}>
              En unos minutos tendrás una preparación adaptada a tus asignaturas, tu tiempo y tus próximos exámenes.
            </p>

            {/* Circle CTA */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <button
                onClick={goNext}
                style={{ width: 100, height: 100, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,.2)', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform .2s, border-color .2s', flexShrink: 0 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.07)'; (e.currentTarget as HTMLElement).style.borderColor = '#fff' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.2)' }}
              >
                <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: '.04em', color: '#fff', lineHeight: 1.2, textAlign: 'center', padding: '0 8px' }}>Preparar<br />mi Camino</span>
                <span style={{ fontSize: 18, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>↗</span>
              </button>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)', lineHeight: 1.7 }}>
                Adaptado a tus asignaturas<br />tu tiempo y tus exámenes<br />Gratis en beta privada
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
        <div className="onb-welcome-right" style={{ width: '50%', position: 'relative', overflow: 'hidden' }}>
          <img src={HF_LIBRARY} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(.55) saturate(.6)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,17,17,.9) 0%, rgba(17,17,17,.15) 45%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: 32, right: 32, textAlign: 'right' }}>
            <div style={{ display: 'inline-block', padding: '4px 10px', border: '1px solid rgba(255,255,255,.15)', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.4)', marginBottom: 8 }}>Editorial · Higgsfield</div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.25)', maxWidth: 160, lineHeight: 1.6 }}>Cada Camino se adapta a tu comunidad, tus asignaturas y tu ritmo real</p>
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
        <div className="onb-photo-panel" style={{ width: '44%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
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
        <div className="onb-form-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9', overflow: 'hidden' }}>
          {/* Progress track */}
          <div style={{ height: 2, background: '#e0e0e0', flexShrink: 0, position: 'relative' }}>
            <motion.div
              style={{ position: 'absolute', left: 0, top: 0, height: '100%', background: '#1c1c1c' }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            />
          </div>

          {/* Header */}
          <div className="onb-steps-header" style={{ padding: '16px 40px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '.04em', color: '#1c1c1c' }}>Kairo</span>
            <div className="onb-steps-tabs" style={{ display: 'flex', gap: 0 }}>
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
            {/* Mobile: sustituye la tira completa de pestañas (se corta fuera
                de pantalla con 11 pasos) por un indicador compacto */}
            <div className="onb-steps-compact" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1c1c1c', whiteSpace: 'nowrap' }}>
                {currentStep} de {STEPS.length}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {SIDEBAR_STEPS[stepIndex] ?? ''}
              </span>
            </div>
          </div>

          {/* Step title */}
          <div style={{ padding: '24px 40px 0', flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Paso {currentStep} · {SIDEBAR_STEPS[stepIndex] ?? ''}</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.03em', color: '#1c1c1c', marginBottom: 4, lineHeight: 1.15 }}>{STEP_LABELS[step].title}</div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>{STEP_LABELS[step].help}</p>
          </div>

          {/* Body */}
          <div className="onb-scroll-form" style={{ flex: 1, overflowY: 'auto', padding: '20px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
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
      // Efecto espejo (Fase 1): el dolor elegido no cambia qué misión eligió
      // el generador, solo cómo se presenta la recompensa. El badge de
      // corrección solo aparece si el backend confirmó que ESA misión en
      // concreto resuelve a un tema real y corregible (ver
      // supportsStepCorrection en /api/onboarding/generate) — nunca se finge.
      const painType = data.painType
      const mirrorMessage = painType === 'daily_plan' ? 'Tu primera tarea ya está decidida. Solo tienes que empezar.'
        : painType === 'procrastination' ? 'Hoy solo necesitas 25 minutos.'
        : null
      const mirrorBadge = painType === 'correction_confidence' && firstMissionSupportsCorrectionRef.current ? 'Incluye corrección paso a paso'
        : painType === 'improve_grade' ? 'Enfocada en asegurar puntos'
        : null
      return (
        <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Check size={30} color="#111" strokeWidth={3} />
          </div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, color: '#fff', letterSpacing: '.02em' }}>Tu Camino PAU está listo</div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)', textAlign: 'center', maxWidth: 360 }}>Revisa tu semana, mira tus misiones y empieza cuando te venga bien.</p>
          {mirrorMessage && (
            <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,.75)', textAlign: 'center', maxWidth: 340, margin: 0 }}>{mirrorMessage}</p>
          )}
          {mirrorBadge && (
            <span style={{ padding: '5px 12px', border: '1px solid rgba(37,99,235,.35)', background: 'rgba(37,99,235,.12)', borderRadius: 999, fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: '#60a5fa' }}>{mirrorBadge}</span>
          )}
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

  // ─── Pantalla de resultado personalizado (sin formulario) ─────────────────────
  function renderPainResult() {
    const copy = data.painType ? PAIN_RESULT_COPY[data.painType] : null
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 16, padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3b82f6', marginBottom: 4 }}>Tu Camino, a tu medida</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', lineHeight: 1.05, color: '#fff', maxWidth: 520 }}>
          {copy?.title ?? 'Kairo se adapta a lo que más te cuesta.'}
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,.55)', maxWidth: 440 }}>
          {copy?.body ?? 'Organizará tus asignaturas, tu tiempo y tus próximos exámenes.'}
        </p>
        <button onClick={goNext} style={{ marginTop: 16, padding: '13px 32px', background: '#fff', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
          Construir mi Camino →
        </button>
        <button onClick={goBack} style={{ marginTop: 4, background: 'none', border: 'none', color: 'rgba(255,255,255,.3)', fontSize: 11, fontFamily: "'DM Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', cursor: 'pointer' }}>
          ← Cambiar respuesta
        </button>
      </div>
    )
  }

  // ─── Step content ─────────────────────────────────────────────────────────────
  function renderStep() {
    if (step === 'pain') {
      return (
        <EditorialGrid cols={1}>
          {PAIN_OPTS.map(opt => (
            <EditorialChoice
              key={opt.id}
              title={opt.label}
              selected={data.painType === opt.id}
              onClick={() => {
                update({ painType: opt.id })
                void sendOnboardingEvent(traceIdRef.current, 'onboarding_pain_selected', { step_id: 'pain', pain_type: opt.id })
              }}
            />
          ))}
        </EditorialGrid>
      )
    }

    if (step === 'name') {
      const borderColor = usernameStatus === 'available' ? '#16a34a'
        : (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#dc2626'
        : '#e0e0e0'
      return (
        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, border: `1px solid ${borderColor}`, background: '#fff', padding: '13px 16px', transition: 'border-color .15s' }}>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>@</span>
            <input
              type="text"
              value={data.username ?? ''}
              onChange={e => onUsernameChange(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && usernameStatus === 'available') goNext() }}
              placeholder="tu_usuario"
              className="onb-input"
              autoFocus
              autoComplete="username"
              spellCheck={false}
            />
            {usernameStatus === 'checking' && (
              <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e0e0e0', borderTopColor: '#2563eb', animation: 'spin .6s linear infinite', flexShrink: 0 }} />
            )}
            {usernameStatus === 'available' && (
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill="#16a34a"/><path d="M6 10l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            )}
            {(usernameStatus === 'taken' || usernameStatus === 'invalid') && (
              <svg viewBox="0 0 20 20" fill="none" style={{ width: 18, height: 18, flexShrink: 0 }}><circle cx="10" cy="10" r="9" fill="#dc2626"/><path d="M7 7l6 6M13 7l-6 6" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg>
            )}
          </label>

          {usernameStatus === 'available' && (
            <p style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#16a34a' }}>@{data.username} está disponible ✓</p>
          )}
          {usernameStatus === 'invalid' && usernameError && (
            <p style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{usernameError}</p>
          )}
          {usernameStatus === 'taken' && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', marginBottom: 8 }}>Ese nombre ya está cogido</p>
              {usernameSuggestions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.1em', color: '#94a3b8' }}>PRUEBA:</span>
                  {usernameSuggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => { update({ username: s }); void checkUsername(s) }}
                      style={{ padding: '4px 12px', border: '1px solid #e0e0e0', background: '#f9fafb', fontSize: 12, fontWeight: 700, color: '#1c1c1c', cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}
                    >
                      @{s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <p style={{ marginTop: 12, fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>
            Letras, números, punto y guion bajo · 3–20 caracteres · Único en Kairo · Aparece en clasificaciones
          </p>
        </div>
      )
    }

    if (step === 'community') {
      return (
        <div>
          <EditorialGrid cols={3}>
            {COMMUNITY_OPTS.map(opt => {
              const selected = data.community === opt.id
              if (!opt.available) {
                return (
                  <div
                    key={opt.id}
                    style={{
                      padding: '16px 18px',
                      background: selected ? '#fef2f2' : '#fff',
                      border: selected ? '1px solid #fecaca' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', lineHeight: 1.3 }}>{opt.label}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.06em', color: '#dc2626', marginTop: 3, textTransform: 'uppercase' }}>Próximamente</div>
                    </div>
                    <Lock size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} strokeWidth={2.5} />
                  </div>
                )
              }
              return (
                <EditorialChoice key={opt.id} title={opt.label} sub={opt.desc} selected={selected} onClick={() => selectCommunity(opt.id)} />
              )
            })}
          </EditorialGrid>
          {data.community && !COMMUNITY_AVAILABLE_IDS.has(data.community) && (
            <div style={{ marginTop: 14, border: '1px solid #fecaca', background: '#fef2f2', padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#991b1b' }}>
              Camino todavía no está disponible en {data.community}. Elige Madrid u Otra comunidad para poder continuar — el resto de tus respuestas se conservan.
            </div>
          )}
        </div>
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

    if (step === 'upcoming-exams') {
      const enabledSubjects = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
      const subjectOptions = enabledSubjects.length > 0 ? enabledSubjects : PRIVATE_BETA_ENABLED_SUBJECTS.map(s => s.id)
      const exams = data.studentExams ?? []
      const canAddExam = Boolean((examDraft.subject || subjectOptions[0]) && examDraft.date)
      return (
        <div>
          <div style={{ border: '1px solid #dbeafe', background: '#eff6ff', padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 3 }}>Paso opcional</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', lineHeight: 1.5 }}>Si tienes un parcial cerca, añadiremos repasos específicos en los días previos.</div>
          </div>
          <button
            type="button"
            onClick={() => update({ studentExams: [] })}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left',
              border: exams.length === 0 ? 'none' : '1px solid #e0e0e0', cursor: 'pointer', padding: '13px 16px', marginBottom: 14,
              background: exams.length === 0 ? '#1c1c1c' : '#fff',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: exams.length === 0 ? '#fff' : '#1c1c1c' }}>
              Ahora mismo no tengo ningún parcial próximo
            </span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: exams.length === 0 ? '#fff' : 'transparent', border: exams.length === 0 ? 'none' : '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {exams.length === 0 && <Check size={9} color="#1c1c1c" strokeWidth={3} />}
            </div>
          </button>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
            <label style={{ background: '#fff', padding: '12px 14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Asignatura</div>
              <select
                value={examDraft.subject || subjectOptions[0] || ''}
                onChange={e => setExamDraft(current => ({ ...current, subject: e.target.value }))}
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 800, color: '#1c1c1c', outline: 'none' }}
              >
                {subjectOptions.map(subject => <option key={subject} value={subject}>{subject}</option>)}
              </select>
            </label>
            <label style={{ background: '#fff', padding: '12px 14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Fecha</div>
              <input
                type="date"
                min={inputDate(addDays(new Date(), 1))}
                value={examDraft.date}
                onChange={e => setExamDraft(current => ({ ...current, date: e.target.value }))}
                style={{ width: '100%', border: 'none', background: 'transparent', fontSize: 13, fontWeight: 800, color: '#1c1c1c', outline: 'none' }}
              />
            </label>
            <label style={{ background: '#fff', padding: '12px 14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Bloque o tema</div>
              <input
                type="text"
                value={examDraft.block}
                onChange={e => setExamDraft(current => ({ ...current, block: e.target.value }))}
                placeholder="Ej. Álgebra, Edad Media..."
                className="onb-input"
              />
            </label>
            <label style={{ background: '#fff', padding: '12px 14px' }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>Nombre opcional</div>
              <input
                type="text"
                value={examDraft.name}
                onChange={e => setExamDraft(current => ({ ...current, name: e.target.value }))}
                placeholder="Ej. Parcial del viernes"
                className="onb-input"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={addUpcomingExam}
            disabled={!canAddExam}
            style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, border: 'none', background: canAddExam ? '#1c1c1c' : '#e0e0e0', color: canAddExam ? '#fff' : '#94a3b8', padding: '10px 14px', fontSize: 12, fontWeight: 900, cursor: canAddExam ? 'pointer' : 'not-allowed' }}
          >
            <Plus size={14} /> Añadir parcial
          </button>
          {exams.length > 0 && (
            <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
              {exams.map(exam => (
                <div key={exam.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid #e0e0e0', background: '#fff', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Calendar size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#1c1c1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.name}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{exam.subject} · {exam.date} · {exam.block}</div>
                    </div>
                  </div>
                  <button type="button" onClick={() => removeUpcomingExam(exam.id)} style={{ border: '1px solid #fee2e2', background: '#fff', color: '#dc2626', padding: 7, cursor: 'pointer' }} aria-label="Eliminar parcial">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
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
        <div>
          <EditorialGrid cols={2}>
            {WEEKLY_DAY_OPTS.map(opt => (
              <EditorialChoice key={opt.label} title={opt.label} selected={data.weeklyStudyDays === opt.label} onClick={() => update({ weeklyStudyDays: opt.label, weeklyStudyDaysValue: opt.value })} />
            ))}
          </EditorialGrid>
          <div style={{ marginTop: 14, border: '1px solid rgba(37,99,235,.18)', background: 'linear-gradient(135deg, rgba(239,246,255,.92), rgba(255,255,255,.96))', padding: '12px 14px', boxShadow: '0 12px 30px rgba(37,99,235,.08)' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.16em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 6 }}>Cuenta gratis</div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.55, fontWeight: 700, color: '#334155' }}>
              Recuerda: con la cuenta gratis tendrás 2 días de Camino activos. Con Premium desbloqueas la planificación completa según los días que elijas.
            </p>
          </div>
        </div>
      )
    }

    if (step === 'grade-threshold') {
      const enabledSubjects = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
      return (
        <div>
          <EditorialGrid cols={2}>
            <EditorialChoice
              title="Mismo umbral para todo"
              sub="Una nota para todas las asignaturas"
              selected={data.gradeThresholdMode === 'general'}
              onClick={() => update({ gradeThresholdMode: 'general' })}
            />
            <EditorialChoice
              title="Distinto por asignatura"
              sub="Ajusta cada asignatura por separado"
              selected={data.gradeThresholdMode === 'per_subject'}
              onClick={() => update({ gradeThresholdMode: 'per_subject' })}
            />
          </EditorialGrid>

          {data.gradeThresholdMode === 'general' ? (
            <div style={{ marginTop: 14 }}>
              <EditorialGrid cols={5}>
                {GRADE_THRESHOLD_OPTS.map(value => (
                  <EditorialChoice
                    key={value}
                    title={`${value}`}
                    selected={(data.gradeThreshold ?? DEFAULT_GRADE_THRESHOLD) === value}
                    onClick={() => update({ gradeThreshold: value })}
                  />
                ))}
              </EditorialGrid>
            </div>
          ) : (
            <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
              {enabledSubjects.length === 0 && (
                <p style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>Elige primero tus asignaturas en el paso anterior.</p>
              )}
              {enabledSubjects.map(subjectLabel => {
                const slug = normalizeSubjectSlug(subjectLabel)
                const current = data.subjectGradeThresholds[slug] ?? DEFAULT_GRADE_THRESHOLD
                return (
                  <div key={slug} style={{ border: '1px solid #e0e0e0', background: '#fff', padding: '12px 14px' }}>
                    <div style={{ fontSize: 12, fontWeight: 900, color: '#1c1c1c', marginBottom: 8 }}>{subjectLabel}</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {GRADE_THRESHOLD_OPTS.map(value => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update({ subjectGradeThresholds: { ...data.subjectGradeThresholds, [slug]: value } })}
                          style={{
                            width: 34, height: 34, borderRadius: '50%', fontSize: 12, fontWeight: 900, cursor: 'pointer',
                            border: current === value ? 'none' : '1.5px solid #e0e0e0',
                            background: current === value ? '#1c1c1c' : '#fff',
                            color: current === value ? '#fff' : '#1c1c1c',
                          }}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    if (step === 'confirm') {
      const communityValue = data.community
        ? COMMUNITY_AVAILABLE_IDS.has(data.community) ? data.community : `${data.community} (no disponible todavía)`
        : '—'
      const examValue = data.studentExams?.length
        ? `${data.studentExams.length} parcial${data.studentExams.length === 1 ? '' : 'es'} añadido${data.studentExams.length === 1 ? '' : 's'}`
        : 'Ningún parcial próximo'
      const summaryBlocks: Array<{ label: string; value: string; step: Step }> = [
        { label: 'Usuario', value: data.username ? `@${data.username}` : '—', step: 'name' },
        { label: 'Comunidad', value: communityValue, step: 'community' },
        { label: 'Centro educativo', value: data.schoolName || '—', step: 'school' },
        { label: 'Asignaturas', value: data.subjects.join(', ') || '—', step: 'subjects' },
        { label: 'Próximo examen', value: examValue, step: 'upcoming-exams' },
        { label: 'Preparación', value: data.preparationFeeling || '—', step: 'feeling' },
        { label: 'Duración de sesión', value: data.dailyStudyTime || '—', step: 'daily-time' },
        { label: 'Días por semana', value: data.weeklyStudyDays || '—', step: 'weekly-days' },
        { label: 'Umbral para repetir', value: data.gradeThresholdMode === 'per_subject' ? 'Distinto por asignatura' : `Menos de ${data.gradeThreshold ?? DEFAULT_GRADE_THRESHOLD}/10`, step: 'grade-threshold' },
      ]
      return (
        <div>
          {savingError && (
            <div style={{ border: '1px solid #fecaca', background: '#fef2f2', padding: '10px 14px', fontSize: 11, fontWeight: 700, color: '#991b1b', marginBottom: 14 }}>
              {savingError}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
            {summaryBlocks.map(block => (
              <div key={block.label} style={{ background: '#fff', padding: '16px 18px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.15em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 6 }}>{block.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#1c1c1c', lineHeight: 1.4 }}>{block.value}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(block.step)}
                  style={{ flexShrink: 0, border: 'none', background: 'none', padding: 0, fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Editar
                </button>
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

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function inputDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

function sanitizeOnboardingExams(exams: OnboardingStudentExam[], selectedSubjects: string[]) {
  const allowedSubjects = new Set(selectedSubjects)
  const today = inputDate(new Date())
  return exams
    .filter(exam => allowedSubjects.has(exam.subject))
    .filter(exam => /^\d{4}-\d{2}-\d{2}$/.test(exam.date) && exam.date > today)
    .map(exam => ({
      ...exam,
      subject: exam.subject.trim(),
      date: exam.date,
      block: normalizeBlockKey((exam.block || 'Repaso general').trim()).slice(0, 80),
      topic: (exam.topic || '').trim().slice(0, 120),
      name: (exam.name || `Parcial de ${exam.subject}`).trim().slice(0, 120),
      priority: exam.priority,
    }))
    .slice(0, 8)
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
