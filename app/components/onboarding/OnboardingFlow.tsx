'use client'

import { Children, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, Eye, EyeOff, Lock, Plus, Search, Trash2 } from 'lucide-react'
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
import { sendOnboardingEvent, ONBOARDING_FLOW_VERSION, type OnboardingStepId } from '@/app/lib/onboarding/onboardingEvents'
import { createActiveDurationTracker } from '@/app/lib/onboarding/activeDuration'
import { loadLocalDraft, saveLocalDraft } from '@/app/lib/onboarding/onboardingDraftStorage'
import { LEGAL_VERSIONS } from '@/app/lib/legalVersions'
import { PLATFORM_STRUCTURED_EXERCISES_LABEL, PLATFORM_STRUCTURED_EXERCISES_TEXT } from '@/app/lib/platformStats'

type Step = 'welcome' | 'pain' | 'pain-result' | 'name' | 'community' | 'school' | 'subjects' | 'upcoming-exams' | 'feeling' | 'daily-time' | 'weekly-days' | 'grade-threshold' | 'confirm' | 'preview' | 'signup'

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
  preview: 'preview',
  signup: 'signup',
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
  { id: 'Física', label: 'Física', color: '#0f766e', betaStatus: 'enabled' },
  { id: 'Química', label: 'Química', color: '#65a30d', betaStatus: 'enabled' },
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
  name: { title: '¿Cómo quieres aparecer en Kairo?', help: 'Es tu nombre público en ligas y clasificaciones. Nunca mostramos tu email.' },
  community: { title: '¿Dónde haces la PAU?', help: 'Así ajustamos la experiencia a tu comunidad autónoma.' },
  school: { title: '¿Cuál es tu centro educativo?', help: 'Si coincides con alumnos de tu mismo instituto, adaptamos el temario a vuestro ritmo real.' },
  subjects: { title: '¿Qué asignaturas quieres preparar?', help: 'Elige todas las que entran en tu PAU. Puedes cambiarlo más adelante.' },
  'upcoming-exams': { title: '¿Tienes algún examen pronto?', help: 'Opcional. Si tienes un parcial cerca, Kairo añadirá práctica específica antes de esa fecha.' },
  feeling: { title: '¿Cómo llevas la preparación?', help: 'No es una evaluación. Solo nos ayuda a ajustar el tono y el ritmo.' },
  'daily-time': { title: '¿Cuánto tiempo podrías estudiar al día?', help: 'Lo ajustaremos mejor más adelante según tu ritmo.' },
  'weekly-days': { title: '¿Cuántos días a la semana estudiarías?', help: 'Kairo adapta el Camino a tu ritmo real de estudio.' },
  'grade-threshold': { title: '¿A partir de qué nota quieres repetir para mejorar?', help: 'Cuando saques menos de esta nota en un simulacro, examen o curso, Kairo te sugerirá repetirlo — tú decides si aceptar.' },
  confirm: { title: 'Así vamos a preparar tu Camino', help: 'Revisa cada bloque y edítalo si algo no encaja.' },
  preview: { title: 'Así se organizará tu preparación', help: 'Una vista previa de cómo Kairo organiza tu Camino.' },
  signup: { title: 'Guarda tu Camino', help: 'Crea tu cuenta para guardar tu preparación.' },
}

const SIDEBAR_STEPS = ['Dolor', 'Nombre', 'Comunidad', 'Centro', 'Asignaturas', 'Parciales', 'Preparación', 'Tiempo', 'Días', 'Umbral', 'Confirmar']

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800;900&display=swap');`

// Mismas instancias next/font que usa /login — el panel de signup (post-onboarding)
// tiene que renderizar con exactamente las mismas formas de letra que el login real,
// no solo el mismo layout/foto. El resto del onboarding sigue con el @import de arriba.
const signupBebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const signupDmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })
const SIGNUP_FONT_DISPLAY = signupBebas.style.fontFamily
const SIGNUP_FONT_MONO = signupDmMono.style.fontFamily

const BASE_CSS = `
*{box-sizing:border-box}
.onb-input{width:100%;border:none;background:transparent;padding:0;font-size:13px;font-weight:700;color:#1c1c1c;font-family:'Inter',system-ui,sans-serif;outline:none}
.onb-input::placeholder{color:#94a3b8;font-weight:500}
@keyframes spin{to{transform:rotate(360deg)}}
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
  const [step, setStep] = useState<Step>('pain')
  const [data, setData] = useState<OnboardingData>(() => loadOnboarding())
  // Fase 2 (signup al final): error de la pantalla de preview/signup —
  // draft server-side, Google OAuth o signup por email. Ya no existe un
  // paso "saving" en este componente: la generación real ocurre server-side
  // en /api/onboarding/finalize, orquestada desde /onboarding/finalizando.
  const [authError, setAuthError] = useState('')
  const [signupOptionsReady, setSignupOptionsReady] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupTerms, setSignupTerms] = useState(false)
  const [showSignupPwd, setShowSignupPwd] = useState(false)
  const [schoolQuery, setSchoolQuery] = useState('')
  const [schoolOpen, setSchoolOpen] = useState(false)
  const [dbInstitutes, setDbInstitutes] = useState<string[]>([])
  const [examDraft, setExamDraft] = useState({ subject: '', date: inputDate(addDays(new Date(), 10)), block: '', topic: '', name: '', priority: 'normal' as const })
  const [examFormOpen, setExamFormOpen] = useState(false)
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const [usernameError, setUsernameError] = useState('')
  const usernameCheckId = useRef(0)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fase 0 de observabilidad del onboarding (medición pura, ver AGENTS.md).
  const traceIdRef = useRef<string | null>(null)
  const onboardingStartedRef = useRef(false)
  // El paso inicial ya es 'pain' desde el primer render (ya no hay 'welcome'
  // de por medio), pero el trace_id se resuelve de forma async en restore().
  // Sin esto, el efecto de onboarding_step_viewed de abajo correría antes de
  // que exista trace_id y jamás se repetiría (step no vuelve a cambiar).
  const [traceReady, setTraceReady] = useState(false)
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
          } else if (result.status === 'empty' && result.draft && !isPreview) {
            // Ya existe un borrador server-side (claimed/processing/failed)
            // para esta cuenta — retomar la finalización en vez de volver a
            // hacer las 11 preguntas (ver AGENTS.md / plan de auth-ux).
            router.replace(`/onboarding/finalizando?draft=${encodeURIComponent(result.draft.id)}`)
            return
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
      // Fase 2: 'preview'/'signup' viven fuera de STEPS (no cuentan para el
      // progreso de 11 pasos, igual que 'pain-result'), pero SÍ son destinos
      // válidos para reanudar — si no, volver de /onboarding/revisa-tu-email
      // o recargar en 'signup' rebotaría siempre a 'welcome'.
      // 'welcome' ya no es un destino del flujo normal (se salta directo a
      // 'pain'); una copia local antigua que apunte ahí se reanuda en 'pain'.
      if (savedStep === 'welcome') {
        setStep('pain')
      } else if (savedStep && (STEPS.includes(savedStep) || savedStep === 'preview' || savedStep === 'signup')) {
        setStep(savedStep)
        if (saved.schoolName) setSchoolQuery(saved.schoolName)
        // Username NUNCA se deriva del email (ver AGENTS.md / plan de
        // onboarding). Si el draft restaurado ya trae uno guardado, se
        // revalida su disponibilidad aquí mismo (tras los awaits de arriba,
        // no de forma síncrona en el cuerpo del efecto).
        if (savedStep === 'name' && saved.username && saved.username.length >= 3) {
          void checkUsername(saved.username)
        }
      }
      // Ya no hay pantalla 'welcome' que dispare onboarding_started al hacer
      // click — el usuario nuevo aterriza directo en 'pain', así que el
      // evento nace aquí, una sola vez por trace_id (idempotente vía
      // ensureOnboardingTraceId + onboardingStartedRef).
      if (!traceIdRef.current) {
        const traceId = ensureOnboardingTraceId()
        traceIdRef.current = traceId
        if (!onboardingStartedRef.current) {
          onboardingStartedRef.current = true
          void sendOnboardingEvent(traceId, 'onboarding_started', { step_id: 'pain', step_index: 0 })
        }
      }
      if (!cancelled) setTraceReady(true)
    }
    restore()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Persist current step so interrupted sessions can resume
  useEffect(() => {
    saveOnboarding({ lastStep: step })
  }, [step])

  // Fase 0 de observabilidad: registra onboarding_step_viewed cuando el paso
  // está efectivamente renderizado, y arranca/reinicia el medidor de tiempo
  // activo del paso. También depende de traceReady porque el paso inicial
  // ('pain') ya está montado antes de que restore() resuelva el trace_id, y
  // como 'step' no cambia solo por eso, sin traceReady este efecto nunca se
  // volvería a ejecutar y el evento del primer paso no se dispararía.
  useEffect(() => {
    stepTimerRef.current?.destroy()
    stepTimerRef.current = createActiveDurationTracker()

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
  }, [step, traceReady])

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

  const stepIndex = STEPS.indexOf(step)
  const currentStep = stepIndex >= 0 ? stepIndex + 1 : 0
  const progressPct = (step === 'preview' || step === 'signup') ? 100 : Math.round((currentStep / STEPS.length) * 100)

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

  // Fase 2 (signup al final): 'confirm' ya no llama directamente a
  // setup+generate — pasa a 'preview' (organizativa, sin generar nada) y el
  // signup ocurre DESPUÉS, al final del todo. La generación real ocurre
  // server-side en /api/onboarding/finalize, orquestada desde
  // /onboarding/finalizando (ver esa página).
  function goToPreview() {
    const durations = stepTimerRef.current?.getDurations()
    void sendOnboardingEvent(traceIdRef.current, 'onboarding_step_completed', {
      step_id: STEP_ID_MAP[step],
      step_index: stepIndex,
      elapsed_duration_ms: durations?.elapsedMs,
      active_duration_ms: durations?.activeMs,
      validation_attempts: stepValidationAttemptsRef.current[step] ?? 0,
    })
    setAuthError('')
    setStep('preview')
  }

  // Crea o actualiza el draft server-side ANÓNIMO (tabla onboarding_drafts)
  // justo antes de iniciar cualquier auth — nunca antes. Devuelve el
  // draft_id opaco o null si falló. Reutiliza el draft local existente
  // (mismo id) si el usuario vuelve atrás y cambia respuestas, en vez de
  // acumular drafts nuevos en cada intento.
  async function ensureServerDraft(): Promise<string | null> {
    // traceIdRef.current (no data.traceId) es la fuente fiable: Fase 0 fija
    // el traceId escribiendo directo a localStorage vía
    // ensureOnboardingTraceId() sin pasar por setData, así que el siguiente
    // update() (que persiste el `data` de React tal cual) lo sobreescribe a
    // null en localStorage — encontrado en el E2E de Fase 2. El ref en
    // memoria, en cambio, es correcto durante toda la sesión.
    const traceId = traceIdRef.current ?? data.traceId ?? ensureOnboardingTraceId()
    const selectedEnabled = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    const upcomingExams = sanitizeOnboardingExams(data.studentExams ?? [], selectedEnabled)
    const existingDraftId = loadLocalDraft()?.draftId ?? undefined
    try {
      const res = await fetch('/api/onboarding/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_id: existingDraftId,
          trace_id: traceId,
          flow_version: ONBOARDING_FLOW_VERSION,
          payload: {
            painType: data.painType,
            username: data.username?.trim() || null,
            community: data.community,
            schoolName: data.schoolName,
            schoolSource: data.schoolSource,
            subjects: selectedEnabled,
            upcomingExams,
            preparationLevel: data.preparationFeeling,
            minutesPerSession: data.dailyMinutes,
            studyDays: data.weeklyStudyDaysValue,
            dailyStudyTime: data.dailyStudyTime,
            weeklyStudyDays: data.weeklyStudyDays,
            gradeThresholdMode: data.gradeThresholdMode,
            gradeThreshold: data.gradeThreshold,
            subjectGradeThresholds: data.subjectGradeThresholds,
          },
        }),
      })
      if (!res.ok) return null
      const json = await res.json() as { draft_id: string }
      saveLocalDraft({ ...data, subjects: selectedEnabled, studentExams: upcomingExams }, json.draft_id)
      return json.draft_id
    } catch {
      return null
    }
  }

  function goToFinalizing(draftId: string) {
    markOnboardingComplete()
    syncOnboardingCommunity(data)
    router.push(`/onboarding/finalizando?draft=${encodeURIComponent(draftId)}`)
  }

  async function handleGoogleSignup() {
    setAuthError('')
    void sendOnboardingEvent(traceIdRef.current, 'onboarding_signup_method_selected', { method: 'google' })
    const draftId = await ensureServerDraft()
    if (!draftId) {
      setAuthError('No se pudo preparar tu cuenta. Inténtalo de nuevo.')
      return
    }
    void sendOnboardingEvent(traceIdRef.current, 'onboarding_signup_started', { method: 'google' })
    const base = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin
    const callbackUrl = `${base}/auth/callback?next=${encodeURIComponent('/onboarding/finalizando')}&draft=${encodeURIComponent(draftId)}&method=google`
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: callbackUrl },
    })
    if (error) setAuthError('No se pudo iniciar sesión con Google. Inténtalo de nuevo.')
  }

  async function handleEmailSignup(email: string, password: string) {
    setAuthError('')
    void sendOnboardingEvent(traceIdRef.current, 'onboarding_signup_method_selected', { method: 'email' })
    const draftId = await ensureServerDraft()
    if (!draftId) {
      setAuthError('No se pudo preparar tu cuenta. Inténtalo de nuevo.')
      return
    }
    void sendOnboardingEvent(traceIdRef.current, 'onboarding_signup_started', { method: 'email' })
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          terms_version: LEGAL_VERSIONS.terminos.version,
          privacy_version: LEGAL_VERSIONS.privacidad.version,
          next: '/onboarding/finalizando',
          draft_id: draftId,
        }),
      })
      const result = await res.json()
      if (!res.ok) {
        setAuthError(mensajeAuthLegible(result.error))
        return
      }
      if (result.needsConfirmation) {
        void sendOnboardingEvent(traceIdRef.current, 'email_confirmation_sent', {})
        router.push(`/onboarding/revisa-tu-email?email=${encodeURIComponent(email)}&draft=${encodeURIComponent(draftId)}`)
        return
      }
      await supabase.auth.setSession(result.session)
      goToFinalizing(draftId)
    } catch {
      setAuthError('Error de conexión. Inténtalo de nuevo.')
    }
  }

  function mensajeAuthLegible(error?: string) {
    const text = error?.toLowerCase() ?? ''
    if (text.includes('already been registered') || text.includes('already registered')) {
      return 'Ya existe una cuenta con este email. Inicia sesión o usa otra contraseña.'
    }
    if (text.includes('invalid login credentials')) {
      return 'Email o contraseña incorrectos.'
    }
    return error ?? 'No se pudo completar la operación. Inténtalo de nuevo.'
  }

  // Si el alumno YA tiene sesión al llegar a 'signup' (usuario existente que
  // reanuda onboarding, o volvió atrás tras autenticarse) no se le pide
  // autenticarse otra vez — se prepara el draft y se pasa directo a
  // finalizar. signupOptionsReady empieza en false para no enseñar
  // "Continuar con Google/email" ni una fracción de segundo mientras se
  // comprueba la sesión — solo se revela si de verdad hace falta autenticarse.
  useEffect(() => {
    if (step !== 'signup') return
    let cancelled = false
    setSignupOptionsReady(false)
    supabase.auth.getSession().then(async ({ data: sessionData }) => {
      if (cancelled) return
      if (!sessionData.session) {
        setSignupOptionsReady(true)
        return
      }
      const draftId = await ensureServerDraft()
      if (cancelled) return
      if (!draftId) {
        setAuthError('No se pudo preparar tu cuenta. Inténtalo de nuevo.')
        setSignupOptionsReady(true)
        return
      }
      goToFinalizing(draftId)
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const showBack = stepIndex > 0
  const showContinue = stepIndex >= 0 && step !== 'confirm'
  const showConfirm = step === 'confirm'

  return (
    <div style={{ minHeight: '100dvh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{FONTS + BASE_CSS}</style>
      {step === 'pain-result'
        ? renderPainResult()
        : step === 'preview'
          ? renderPreview()
          : step === 'signup'
            ? renderSignup()
            : renderShell()}
    </div>
  )


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
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '.04em', color: '#1c1c1c' }}>Kairo</span>
              {step === 'pain' && (
                <Link href="/login" style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.06em', color: '#94a3b8', textDecoration: 'underline', textUnderlineOffset: 3, whiteSpace: 'nowrap' }}>
                  ¿Ya tienes cuenta? Inicia sesión
                </Link>
              )}
            </div>
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
                <button onClick={goToPreview} style={{ padding: '11px 28px', background: '#1c1c1c', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-.01em', cursor: 'pointer' }}>
                  Ver cómo se organiza mi preparación →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─── Preview organizativa + Signup (Fase 2: signup al final) ─────────────────
  function renderPreview() {
    const community = data.community
    const selectedEnabled = data.subjects.filter(s => PRIVATE_BETA_SUPPORTED_SUBJECTS.has(s))
    const nextExam = [...(data.studentExams ?? [])].sort((a, b) => a.date.localeCompare(b.date))[0]

    // Solo inferencias directas de respuestas reales — nunca temas, fechas
    // de misión, XP, número/orden de misiones ni correcciones concretas
    // (eso lo genera de verdad el finalizer, después de crear la cuenta).
    const bullets: string[] = []
    if (data.weeklyStudyDaysValue) bullets.push(`${data.weeklyStudyDaysValue} días de estudio por semana`)
    if (data.dailyMinutes) bullets.push(`Hasta ${DAILY_MINUTES_LABELS[data.dailyMinutes] ?? `${data.dailyMinutes} min`} disponibles al día`)
    if (nextExam) bullets.push(`${nextExam.subject} tendrá prioridad por tu próximo parcial`)
    if (community) bullets.push(`Preparación adaptada a la PAU de ${community}`)
    if (selectedEnabled.length > 0) bullets.push(`Asignaturas: ${selectedEnabled.join(', ')}`)

    return (
      <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#111', gap: 20, padding: 24, textAlign: 'center' }}>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: '#3b82f6' }}>Así se organizará tu preparación</div>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(32px, 5vw, 48px)', color: '#fff', letterSpacing: '.01em', maxWidth: 560, lineHeight: 1.05 }}>
          Un vistazo a cómo Kairo organiza tu Camino
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%', maxWidth: 460, marginTop: 8 }}>
          {bullets.map((bullet, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', textAlign: 'left' }}>
              <Check size={14} color="#3b82f6" strokeWidth={3} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.85)' }}>{bullet}</span>
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: '.04em', color: 'rgba(255,255,255,.3)', maxWidth: 380, lineHeight: 1.7, marginTop: 4 }}>
          Esta es una vista de cómo se organizará. Tus misiones reales se generarán al crear la cuenta.
        </p>
        <button
          onClick={() => {
            void sendOnboardingEvent(traceIdRef.current, 'onboarding_preview_viewed', { step_id: 'preview' })
            setStep('signup')
          }}
          style={{ marginTop: 8, padding: '13px 32px', background: '#fff', border: 'none', color: '#111', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}
        >
          Crear mi cuenta y construir mi Camino →
        </button>
        <button onClick={() => setStep('confirm')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', fontSize: 11, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
          ← Volver y revisar respuestas
        </button>
      </div>
    )
  }

  function renderSignup() {
    const email = signupEmail
    const password = signupPassword
    const terms = signupTerms
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', overflow: 'hidden', background: '#0d0d0d' }}>
        {/* Mismas clases que /login (app/login/page.tsx) para que ambas pantallas
            rendericen con exactamente el mismo look — campos, botón de Google,
            ojo de contraseña, tipografía. */}
        <style>{`
          .su-field {
            display: flex; align-items: center; gap: 10px;
            padding: 0 14px; height: 48px;
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.1);
            cursor: text;
            transition: border-color 160ms, background 160ms, box-shadow 160ms;
          }
          .su-field:focus-within {
            border-color: rgba(255,255,255,.35);
            background: rgba(255,255,255,.09);
            box-shadow: 0 0 0 3px rgba(255,255,255,.04);
          }
          .su-field input {
            flex: 1; background: transparent; border: none; outline: none;
            font-size: 14px; font-weight: 400; color: #fff;
            font-family: var(--font-geist-sans, system-ui, sans-serif);
          }
          .su-field input::placeholder { color: rgba(255,255,255,.25); }

          .su-btn-primary {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            width: 100%; height: 52px;
            background: #fff; color: #0d0d0d;
            font-size: 15px; font-weight: 700; letter-spacing: .02em;
            border: none; cursor: pointer;
            transition: transform 160ms cubic-bezier(0.22,1,0.36,1), opacity 160ms;
            font-family: var(--font-geist-sans, system-ui, sans-serif);
          }
          .su-btn-primary:hover:not(:disabled) { transform: translateY(-1px); opacity: .93; }
          .su-btn-primary:active:not(:disabled) { transform: scale(0.98); }
          .su-btn-primary:disabled { opacity: 0.38; cursor: not-allowed; }

          .su-btn-google {
            display: flex; align-items: center; justify-content: center; gap: 10px;
            width: 100%; height: 48px;
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.1);
            color: rgba(255,255,255,.85);
            font-size: 14px; font-weight: 500; cursor: pointer;
            transition: border-color 160ms, background 160ms, transform 160ms;
            font-family: var(--font-geist-sans, system-ui, sans-serif);
          }
          .su-btn-google:hover { border-color: rgba(255,255,255,.25); background: rgba(255,255,255,.09); transform: translateY(-1px); }
          .su-btn-google:active { transform: scale(0.98); }

          .su-link {
            background: none; border: none; cursor: pointer; padding: 0;
            color: rgba(255,255,255,.7); font-size: 13px; font-weight: 500;
            font-family: var(--font-geist-sans, system-ui, sans-serif);
            text-decoration: underline; text-underline-offset: 3px;
            transition: color 140ms;
          }
          .su-link:hover { color: #fff; }

          .su-eye {
            background: none; border: none; cursor: pointer; padding: 4px;
            color: rgba(255,255,255,.25); display: flex; align-items: center;
            flex-shrink: 0; transition: color 140ms;
          }
          .su-eye:hover { color: rgba(255,255,255,.7); }
        `}</style>

        {/* Left — mismo panel que /login (imagen, gradiente, logo, tagline, stats) */}
        <div className="onb-photo-panel" style={{ position: 'sticky', top: 0, height: '100dvh', width: '46%', flexShrink: 0, overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/login-bg.png"
            alt=""
            aria-hidden
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(1.4) brightness(1.05) contrast(1.08)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(13,13,13,.78) 0%, rgba(13,13,13,.35) 45%, rgba(13,13,13,.82) 100%)' }} />

          {/* Logo */}
          <div style={{ position: 'absolute', top: 32, left: 36, zIndex: 2 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/kairo-logo-new.png" alt="Kairo" style={{ height: 30, width: 'auto', mixBlendMode: 'lighten', display: 'block' }} />
          </div>

          {/* Tagline */}
          <div style={{ position: 'absolute', bottom: 100, left: 36, right: 36, zIndex: 2 }}>
            <h2 style={{ fontFamily: SIGNUP_FONT_DISPLAY, fontSize: 'clamp(44px, 5vw, 68px)', lineHeight: .92, letterSpacing: '.01em', color: '#fff', marginBottom: 16 }}>
              Guarda<br />tu Camino.
            </h2>
            <p style={{ fontFamily: SIGNUP_FONT_MONO, fontSize: 11, color: 'rgba(255,255,255,.4)', letterSpacing: '.1em', textTransform: 'uppercase', lineHeight: 1.6 }}>
              Exámenes reales · Corrección IA · Plan diario
            </p>
          </div>

          {/* Stats */}
          <div style={{ position: 'absolute', bottom: 32, left: 36, right: 36, zIndex: 2, display: 'flex', gap: 32, borderTop: '1px solid rgba(255,255,255,.1)', paddingTop: 20 }}>
            {[
              { v: PLATFORM_STRUCTURED_EXERCISES_LABEL, l: PLATFORM_STRUCTURED_EXERCISES_TEXT },
              { v: '38', l: 'Semanas PAU' },
              { v: '<30s', l: 'Corrección' },
            ].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: SIGNUP_FONT_DISPLAY, fontSize: 26, color: '#fff', letterSpacing: '.01em', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontFamily: SIGNUP_FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — cuenta, mismo layout que /login (columna izquierda-alineada, max-width 400) */}
        <div className="onb-form-panel" style={{
          flex: 1,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 'clamp(40px,6vw,72px) clamp(24px,5vw,56px)',
          overflowY: 'auto',
          background: '#0d0d0d',
          borderLeft: '1px solid rgba(255,255,255,.07)',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontFamily: SIGNUP_FONT_DISPLAY, fontSize: 'clamp(40px, 5vw, 56px)', lineHeight: .92, letterSpacing: '.01em', color: '#fff', marginBottom: 10 }}>
                Crea tu cuenta.
              </h1>
              <p style={{ fontFamily: SIGNUP_FONT_MONO, fontSize: 10, color: 'rgba(255,255,255,.35)', letterSpacing: '.12em', textTransform: 'uppercase', margin: 0 }}>
                Guarda tu Camino
              </p>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.6, marginTop: 14, marginBottom: 0 }}>
                Ya tenemos todo para construir tu preparación. Crea tu cuenta para generar tus primeras misiones.
              </p>
            </div>

            {authError && (
              <div style={{ marginBottom: 18 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#f87171', margin: 0 }}>{authError}</p>
                {/ya (tienes|existe) una cuenta/i.test(authError) && (
                  <a
                    href={`/login?returnTo=${encodeURIComponent(`/onboarding/finalizando?draft=${loadLocalDraft()?.draftId ?? ''}`)}`}
                    className="su-link"
                    style={{ display: 'inline-block', marginTop: 6, fontSize: 12, fontWeight: 700 }}
                  >
                    Iniciar sesión con esta cuenta →
                  </a>
                )}
              </div>
            )}

            {signupOptionsReady ? (
              <>
                {/* Google button */}
                <div style={{ marginBottom: 8 }}>
                  <button type="button" className="su-btn-google" onClick={handleGoogleSignup} aria-label="Crea tu cuenta con Google">
                    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Crea tu cuenta con Google
                  </button>
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
                  <span style={{ fontFamily: SIGNUP_FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,.25)', letterSpacing: '.14em', textTransform: 'uppercase' }}>
                    o con email
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,.08)' }} />
                </div>

                {/* Form fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label htmlFor="signup-email" style={{ display: 'block', fontFamily: SIGNUP_FONT_MONO, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.35)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 7 }}>
                      Correo electrónico
                    </label>
                    <div className="su-field">
                      <input
                        id="signup-email"
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setSignupEmail(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && email && password && terms) void handleEmailSignup(email, password) }}
                        autoComplete="email"
                        aria-required="true"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" style={{ display: 'block', fontFamily: SIGNUP_FONT_MONO, fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.35)', letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 7 }}>
                      Contraseña
                    </label>
                    <div className="su-field">
                      <input
                        id="signup-password"
                        type={showSignupPwd ? 'text' : 'password'}
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={e => setSignupPassword(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && email && password && terms) void handleEmailSignup(email, password) }}
                        autoComplete="new-password"
                        aria-required="true"
                      />
                      <button
                        type="button"
                        className="su-eye"
                        onClick={() => setShowSignupPwd(v => !v)}
                        aria-label={showSignupPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showSignupPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11, color: 'rgba(255,255,255,.4)', textAlign: 'left', cursor: 'pointer', marginTop: 2 }}>
                    <input type="checkbox" checked={terms} onChange={e => setSignupTerms(e.target.checked)} style={{ marginTop: 2 }} />
                    <span>Acepto los <a href="/legal/terminos" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,.6)' }}>Términos</a> y la <a href="/legal/privacidad" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,.6)' }}>Política de Privacidad</a>.</span>
                  </label>
                </div>

                {/* Submit */}
                <div style={{ marginTop: 22 }}>
                  <button
                    type="button"
                    className="su-btn-primary"
                    onClick={() => { if (email && password && terms) void handleEmailSignup(email, password) }}
                    disabled={!email || !password || !terms}
                  >
                    Crear mi cuenta
                  </button>
                </div>
              </>
            ) : (
              // Comprobando si ya hay sesión (usuario existente reanudando onboarding)
              // — nunca se enseñan los botones de Google/email hasta saber que hacen
              // falta de verdad, para no dar el parpadeo de "signup" que luego se
              // redirige solo a /camino.
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '24px 0' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,.15)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', margin: 0 }}>Comprobando tu sesión…</p>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <button onClick={() => setStep('preview')} className="su-link" style={{ fontSize: 11, fontWeight: 700 }}>
                ← Volver y revisar respuestas
              </button>
            </div>

            {/* Legal footer */}
            <p style={{
              textAlign: 'center', marginTop: 28,
              fontFamily: SIGNUP_FONT_MONO, fontSize: 9, color: 'rgba(255,255,255,.15)',
              lineHeight: 1.7, letterSpacing: '.04em',
            }}>
              Al continuar aceptas los{' '}
              <a href="/legal/terminos" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Términos</a>
              {' '}y la{' '}
              <a href="/legal/privacidad" style={{ color: 'rgba(255,255,255,.3)', textDecoration: 'underline', textUnderlineOffset: 2 }}>Privacidad</a>
            </p>

          </div>
        </div>
      </div>
    )
  }

  // (bloque legacy eliminado — la generación real ahora ocurre en
  // /api/onboarding/finalize, ver /onboarding/finalizando)
  // ─── Pantalla de resultado personalizado (sin formulario) ─────────────────────
  // Mismo "shell" que renderShell() (foto izquierda, cabecera con pestañas,
  // panel blanco derecho) en vez de una pantalla negra centrada aparte: así
  // el momento emocional post-pain se lee como parte del mismo onboarding
  // ("paso 1.5"), no como un corte de experiencia hacia otra pantalla.
  function renderPainResult() {
    const copy = data.painType ? PAIN_RESULT_COPY[data.painType] : null
    const painIndex = STEPS.indexOf('pain')
    const painCurrentStep = painIndex + 1
    const painProgressPct = Math.round((painCurrentStep / STEPS.length) * 100)
    const photo = STEP_PHOTO.pain ?? HF_FLATLAY
    const headlines = STEP_HEADLINE.pain ?? []

    return (
      <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#111' }}>
        {/* Left — misma foto/headline que el paso "pain", sin cambios */}
        <div className="onb-photo-panel" style={{ width: '44%', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', filter: 'brightness(.45) saturate(.55)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(17,17,17,.1) 0%, rgba(17,17,17,.75) 100%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(17,17,17,.7) 0%, transparent 55%)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '32px 36px', zIndex: 1 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>
              Paso {painCurrentStep} de {STEPS.length} · {SIDEBAR_STEPS[painIndex] ?? ''}
            </div>
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(44px, 5.5vw, 72px)', lineHeight: .92, color: '#fff', letterSpacing: '.01em' }}>
                {headlines.map((line, i) => <div key={i}>{line}</div>)}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(255,255,255,.06)', marginTop: 28 }}>
                <div style={{ background: 'rgba(17,17,17,.7)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', lineHeight: 1 }}>{painCurrentStep}/{STEPS.length}</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 2 }}>Pasos</div>
                </div>
                <div style={{ background: 'rgba(17,17,17,.7)', padding: '10px 14px' }}>
                  <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: '#fff', lineHeight: 1 }}>{painProgressPct}%</div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.25)', marginTop: 2 }}>Completado</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — mismo panel blanco/cabecera/pestañas que renderShell() */}
        <div className="onb-form-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f9f9f9', overflow: 'hidden' }}>
          <div style={{ height: 2, background: '#e0e0e0', flexShrink: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${painProgressPct}%`, background: '#1c1c1c' }} />
          </div>

          <div className="onb-steps-header" style={{ padding: '16px 40px', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: '.04em', color: '#1c1c1c' }}>Kairo</span>
            <div className="onb-steps-tabs" style={{ display: 'flex', gap: 0 }}>
              {SIDEBAR_STEPS.map((label, i) => {
                const done = painCurrentStep > i + 1
                const active = painCurrentStep === i + 1
                return (
                  <div key={label} style={{ padding: '5px 12px', borderLeft: i === 0 ? '1px solid #e0e0e0' : 'none', border: '1px solid #e0e0e0', borderRight: i === SIDEBAR_STEPS.length - 1 ? '1px solid #e0e0e0' : 'none', fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', color: active ? '#fff' : done ? '#1c1c1c' : '#94a3b8', background: active ? '#1c1c1c' : done ? '#f0f0f0' : 'transparent' }}>
                    {label}
                  </div>
                )
              })}
            </div>
            <div className="onb-steps-compact" style={{ display: 'none', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: '#1c1c1c', whiteSpace: 'nowrap' }}>
                {painCurrentStep} de {STEPS.length}
              </span>
              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                {SIDEBAR_STEPS[painIndex] ?? ''}
              </span>
            </div>
          </div>

          <div style={{ padding: '24px 40px 0', flexShrink: 0 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.18em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 8 }}>Paso {painCurrentStep} · Tu objetivo</div>
            <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-.03em', color: '#1c1c1c', marginBottom: 4, lineHeight: 1.15 }}>
              {copy?.title ?? 'Kairo se adapta a lo que más te cuesta.'}
            </div>
            <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.6, marginBottom: 0 }}>
              {copy?.body ?? 'Organizará tus asignaturas, tu tiempo y tus próximos exámenes.'}
            </p>
          </div>

          <div className="onb-scroll-form" style={{ flex: 1, overflowY: 'auto', padding: '20px 40px', position: 'relative' }} />

          <div style={{ borderTop: '1px solid #e0e0e0', padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, background: '#f9f9f9' }}>
            <button onClick={goBack} style={{ padding: '9px 18px', background: 'none', border: '1px solid #e0e0e0', fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: '#94a3b8', cursor: 'pointer' }}>
              ← Cambiar respuesta
            </button>
            <button onClick={goNext} style={{ padding: '11px 28px', background: '#1c1c1c', border: 'none', color: '#fff', fontSize: 13, fontWeight: 800, letterSpacing: '-.01em', cursor: 'pointer' }}>
              Continuar →
            </button>
          </div>
        </div>
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
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', lineHeight: 1.5 }}>De momento puedes probar con Matemáticas II, Matemáticas CCSS, Lengua Castellana y Literatura, Historia de España, Física y Química. El resto se irá abriendo próximamente.</div>
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
            {PRIVATE_BETA_LOCKED_SUBJECTS.length % 2 !== 0 && <div aria-hidden style={{ background: '#f9f9f9' }} />}
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
      const showExamForm = examFormOpen || exams.length > 0
      return (
        <div>
          <div style={{ border: '1px solid #dbeafe', background: '#eff6ff', padding: '10px 14px', marginBottom: 14 }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 8, letterSpacing: '.14em', textTransform: 'uppercase', color: '#2563eb', marginBottom: 3 }}>Paso opcional</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#1e40af', lineHeight: 1.5 }}>Si tienes un parcial cerca, añadiremos repasos específicos en los días previos.</div>
          </div>
          <button
            type="button"
            onClick={() => { update({ studentExams: [] }); setExamFormOpen(false) }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', textAlign: 'left',
              border: !showExamForm ? 'none' : '1px solid #e0e0e0', cursor: 'pointer', padding: '13px 16px', marginBottom: 14,
              background: !showExamForm ? '#1c1c1c' : '#fff',
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 700, color: !showExamForm ? '#fff' : '#1c1c1c' }}>
              No tengo ningún parcial próximo
            </span>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: !showExamForm ? '#fff' : 'transparent', border: !showExamForm ? 'none' : '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {!showExamForm && <Check size={9} color="#1c1c1c" strokeWidth={3} />}
            </div>
          </button>
          {!showExamForm && (
            <button
              type="button"
              onClick={() => setExamFormOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #e0e0e0', background: '#fff', color: '#1c1c1c', padding: '10px 14px', fontSize: 12, fontWeight: 900, cursor: 'pointer' }}
            >
              <Plus size={14} /> Añadir parcial
            </button>
          )}
          {showExamForm && (
            <>
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
                  {examDraft.date && (
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#94a3b8', marginTop: 4 }}>{formatDateEs(examDraft.date)}</div>
                  )}
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
            </>
          )}
          {exams.length > 0 && (
            <div style={{ marginTop: 16, display: 'grid', gap: 8 }}>
              {exams.map(exam => (
                <div key={exam.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, border: '1px solid #e0e0e0', background: '#fff', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <Calendar size={15} style={{ color: '#2563eb', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#1c1c1c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{exam.name}</div>
                      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 9, color: '#94a3b8', marginTop: 2 }}>{exam.subject} · {formatDateEs(exam.date)} · {exam.block}</div>
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
        { label: 'Tiempo disponible al día', value: data.dailyStudyTime || '—', step: 'daily-time' },
        { label: 'Días por semana', value: data.weeklyStudyDays || '—', step: 'weekly-days' },
        { label: 'Umbral para repetir', value: data.gradeThresholdMode === 'per_subject' ? 'Distinto por asignatura' : `Menos de ${data.gradeThreshold ?? DEFAULT_GRADE_THRESHOLD}/10`, step: 'grade-threshold' },
      ]
      return (
        <div>
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
            {summaryBlocks.length % 2 !== 0 && <div aria-hidden style={{ background: '#f9f9f9' }} />}
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

// El <input type="date"> nativo muestra el valor con el formato del
// navegador/SO (a menudo MM/DD/YYYY aunque lang="es-ES"), así que junto al
// campo mostramos el mismo valor formateado sin ambigüedad. El ISO
// YYYY-MM-DD que viaja al backend no cambia.
const ES_DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
function formatDateEs(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate
  const [year, month, day] = isoDate.split('-').map(Number)
  return ES_DATE_FORMATTER.format(new Date(Date.UTC(year, month - 1, day)))
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
  // Con nº de opciones no múltiplo de `cols`, la última fila queda
  // incompleta y CSS grid reserva igualmente esa celda: sin relleno, el
  // fondo gris del contenedor (el mismo que dibuja las líneas de separación
  // entre celdas) ocupa toda la celda vacía y parece una opción bloqueada.
  // Se rellena con celdas invisibles (mismo fondo que la página, sin borde)
  // para que el grid se mantenga correcto sin ese efecto visual.
  const count = Children.count(children)
  const remainder = count % cols
  const fillers = remainder === 0 ? 0 : cols - remainder
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 1, background: '#e0e0e0', border: '1px solid #e0e0e0' }}>
      {children}
      {Array.from({ length: fillers }, (_, i) => (
        <div key={`filler-${i}`} aria-hidden style={{ background: '#f9f9f9' }} />
      ))}
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
