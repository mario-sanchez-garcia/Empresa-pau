'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, CreditCard, LogOut, Save, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding, saveOnboarding, type OnboardingData } from '@/app/lib/onboarding/onboardingStorage'
import { validateUsername, normalizeUsername } from '@/app/lib/username'
import { loadProfilePreferences, saveProfilePreferences } from '@/app/lib/profilePreferences'
import { VALID_DAILY_MINUTES, dailyMinutesLabel, describeDailyPlan } from '@/app/lib/camino/dailyTimeCapacity'
import { normalizeSubjectSlug } from '@/app/lib/camino/caminoCurriculumPlan'
import { DEFAULT_GRADE_THRESHOLD, type GradeThresholdMode } from '@/app/lib/camino/gradeThreshold'
import SidebarNav from '@/app/components/SidebarNav'
import ClayThemeSwitcher from '@/components/clay/ClayThemeSwitcher'

const NOTEBOOK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_171854_b8f1489a-95e8-4506-a6c5-742030f50c09.png'

type Preferences = {
  displayName: string // kept for local prefs compat; username is separate
  photo: string
  educationLevel: string
  defaultSubject: string
  correctionStyle: 'breve' | 'normal' | 'detallado'
  longAdvice: boolean
}

const defaults: Preferences = {
  displayName: '',
  photo: '',
  educationLevel: '2-bachillerato',
  defaultSubject: 'mates',
  correctionStyle: 'normal',
  longAdvice: true,
}

// onboarding.subjects son las etiquetas largas que usa el onboarding
// (los temarios activos en la beta privada); Asignatura por
// defecto / Historial usan los slugs cortos de /examenes (page-client.tsx).
const ONBOARDING_LABEL_TO_EXAM_SLUG: Record<string, string> = {
  'Matemáticas II': 'mates',
  'Matemáticas CCSS': 'matematicas_ccss',
  'Lengua Castellana': 'lengua',
  'Historia de España': 'historia',
  'Física': 'fisica',
  'Química': 'quimica',
}

// Fallback for "Asignatura por defecto" only, for the brief window before
// onboarding data has loaded — once it has, the selector is limited to the
// student's actual active subjects (see activeSubjectOptions).
const FULL_SUBJECT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'mates', label: 'Matemáticas II' },
  { value: 'matematicas_ccss', label: 'Matemáticas CCSS' },
  { value: 'fisica', label: 'Física' },
  { value: 'quimica', label: 'Química' },
  { value: 'lengua', label: 'Lengua' },
  { value: 'historia', label: 'Historia de España' },
  { value: 'historia_filosofia', label: 'Historia de la Filosofía' },
  { value: 'ingles', label: 'Inglés' },
  { value: 'biologia', label: 'Biología' },
]

const SUBJECT_LEVEL_LABELS: Record<string, string> = { bajo: 'Voy mal', medio: 'Voy regular', alto: 'Voy bien' }
const SUBJECT_LEVELS = ['bajo', 'medio', 'alto'] as const
type SubjectLevel = typeof SUBJECT_LEVELS[number]

const GRADE_THRESHOLD_OPTS = [4, 5, 6, 7, 8]

const SUBJECT_LABELS: Record<string, string> = {
  mates: 'Mates II', matematicas_ccss: 'Mates CCSS', fisica: 'Física',
  quimica: 'Química', lengua: 'Lengua', historia: 'Historia',
  historia_filosofia: 'Fil.', ingles: 'Inglés', biologia: 'Biología',
}

const EDUC_LABELS: Record<string, string> = {
  '1-bachillerato': '1.º Bach', '2-bachillerato': '2.º Bach',
  'preparacion-pau': 'Prep. PAU', 'otro': 'Otro',
}

const DAILY_MINUTES_OPTIONS = VALID_DAILY_MINUTES
const WEEKLY_DAYS_OPTIONS = [3, 4, 5, 6, 7]

function weeklyDaysLabel(days: number | null) {
  if (!days) return null
  return `${days} días por semana`
}


export default function SettingsPage() {
  const router = useRouter()
  const { ccaa, setCCAA } = useCCAA()
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [emailNotifSaving, setEmailNotifSaving] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [caminoDailyMinutes, setCaminoDailyMinutes] = useState(60)
  const [caminoWeeklyDays, setCaminoWeeklyDays] = useState(4)
  const [caminoPrefsStatus, setCaminoPrefsStatus] = useState('')
  const [subjectLevels, setSubjectLevels] = useState<Record<string, SubjectLevel>>({})
  const [gradeThresholdMode, setGradeThresholdMode] = useState<GradeThresholdMode>('general')
  const [gradeThreshold, setGradeThreshold] = useState<number | null>(null)
  const [subjectGradeThresholds, setSubjectGradeThresholds] = useState<Record<string, number>>({})
  const [gradeThresholdLoaded, setGradeThresholdLoaded] = useState('')
  const [recalculating, setRecalculating] = useState(false)
  const [recalculateStatus, setRecalculateStatus] = useState('')
  const [customInstructions, setCustomInstructions] = useState('')
  const [customInstructionsLoaded, setCustomInstructionsLoaded] = useState('')
  const [username, setUsername] = useState('')
  const [usernameEditMode, setUsernameEditMode] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [originalUsername, setOriginalUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'saving' | 'saved'>('idle')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const usernameCheckId = useRef(0)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [hasActivePack, setHasActivePack] = useState(false)
  const [portalLoading, setPortalLoading] = useState(false)
  const [portalError, setPortalError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      const currentUserId = data.user.id
      setUserId(currentUserId)
      setEmail(data.user.email ?? '')
      const storedPreferences = loadProfilePreferences(currentUserId)
      let serverDisplayName = ''
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (token) {
        try {
          const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json() as {
              email_notifications: boolean; username?: string; custom_instructions?: string; subject_levels?: Record<string, string>
              grade_threshold_mode?: string; grade_threshold?: number | null; subject_grade_thresholds?: Record<string, number>
            }
            setEmailNotifications(json.email_notifications ?? true)
            serverDisplayName = json.username ?? ''
            if (json.username) {
              setUsername(json.username)
            } else {
              const localUsername = loadOnboarding().username?.trim()
              if (localUsername && !validateUsername(localUsername)) {
                try {
                  const repairRes = await fetch('/api/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({ username: localUsername }),
                  })
                  if (repairRes.ok) {
                    serverDisplayName = localUsername
                    setUsername(localUsername)
                  }
                } catch { /* best-effort repair for legacy onboarding rows */ }
              }
            }
            setCustomInstructions(json.custom_instructions ?? '')
            setCustomInstructionsLoaded(json.custom_instructions ?? '')
            const levels = json.subject_levels ?? {}
            setSubjectLevels(
              Object.fromEntries(
                Object.entries(levels).filter((entry): entry is [string, SubjectLevel] =>
                  (SUBJECT_LEVELS as readonly string[]).includes(entry[1])),
              ),
            )
            const loadedMode: GradeThresholdMode = json.grade_threshold_mode === 'per_subject' ? 'per_subject' : 'general'
            const loadedGeneral = typeof json.grade_threshold === 'number' ? json.grade_threshold : null
            const loadedBySubject = json.subject_grade_thresholds ?? {}
            setGradeThresholdMode(loadedMode)
            setGradeThreshold(loadedGeneral)
            setSubjectGradeThresholds(loadedBySubject)
            setGradeThresholdLoaded(JSON.stringify({ mode: loadedMode, general: loadedGeneral, bySubject: loadedBySubject }))
          }
        } catch { /* silent */ }
        try {
          const res = await fetch('/api/billing/me', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json() as { hasActivePack?: boolean }
            setHasActivePack(Boolean(json.hasActivePack))
          }
        } catch { /* silent */ }
        try {
          const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json() as { onboarding?: Partial<OnboardingData> | null }
            const localOnboarding = loadOnboarding()
            const nextOnboarding = {
              ...localOnboarding,
              ...(json.onboarding ?? {}),
            } as OnboardingData
            setOnboarding(nextOnboarding)
            setCaminoDailyMinutes(nextOnboarding.dailyMinutes ?? 60)
            setCaminoWeeklyDays(nextOnboarding.weeklyStudyDaysValue ?? 4)
          }
        } catch { /* silent */ }
      }
      setPreferences({ ...defaults, ...storedPreferences, displayName: serverDisplayName || storedPreferences.displayName || '' })
    })
  }, [router])

  const checkUsernameSettings = useCallback(async (u: string) => {
    const err = validateUsername(u)
    if (err) { setUsernameStatus('invalid'); setUsernameError(err); return }
    // Own current username is always available — avoid false "taken"
    if (username && normalizeUsername(u) === normalizeUsername(username)) {
      setUsernameStatus('available'); setUsernameSuggestions([]); setUsernameError(''); return
    }
    const id = ++usernameCheckId.current
    setUsernameStatus('checking')
    setUsernameError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/username/check?u=${encodeURIComponent(u)}`, { headers })
      if (usernameCheckId.current !== id) return
      const json = await res.json() as { available?: boolean; error?: string; suggestions?: string[] }
      if (json.error && !json.available) { setUsernameStatus('invalid'); setUsernameError(json.error ?? ''); return }
      if (json.available) { setUsernameStatus('available'); setUsernameSuggestions([]); return }
      setUsernameStatus('taken')
      setUsernameSuggestions(json.suggestions ?? [])
    } catch {
      if (usernameCheckId.current !== id) return
      setUsernameStatus('idle')
    }
  }, [username])

  function onUsernameInputChange(raw: string) {
    const val = raw.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20)
    setUsernameInput(val)
    setUsernameStatus('idle')
    setUsernameError('')
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (val.length >= 3) {
      usernameTimer.current = setTimeout(() => void checkUsernameSettings(val), 350)
    }
  }

  function enterUsernameEditMode() {
    setOriginalUsername(username)
    setUsernameInput(username)
    setUsernameEditMode(true)
    setUsernameError('')
    setUsernameSuggestions([])
    setUsernameStatus(username ? 'available' : 'idle')
  }

  function cancelUsernameEdit() {
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    setUsernameInput(originalUsername)
    setUsernameEditMode(false)
    setUsernameStatus('idle')
    setUsernameError('')
    setUsernameSuggestions([])
  }

  async function saveUsernameNow() {
    if (usernameStatus !== 'available' || !usernameInput.trim()) return
    setUsernameStatus('saving')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) { setUsernameStatus('available'); return }
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: usernameInput.trim() }),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null) as { error?: string } | null
        setUsernameStatus('invalid')
        setUsernameError(json?.error ?? 'No se ha podido guardar el nombre')
        return
      }
      setUsername(usernameInput.trim())
      setUsernameEditMode(false)
      setUsernameStatus('idle')
    } catch {
      setUsernameStatus('invalid')
      setUsernameError('No se ha podido guardar el nombre. Revisa la conexión.')
    }
  }

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreferences(cur => ({ ...cur, photo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  async function saveEmailNotifications(value: boolean) {
    setEmailNotifications(value)
    setEmailNotifSaving(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (token) {
        await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ email_notifications: value }),
        })
      }
    } catch { /* silent */ }
    setEmailNotifSaving(false)
  }

  async function save() {
    try {
      saveProfilePreferences(userId, preferences)
      setSaveError('')
      setCaminoPrefsStatus('')
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      const instructionsChanged = customInstructions.trim() !== customInstructionsLoaded.trim()
      const gradeThresholdChanged = JSON.stringify({ mode: gradeThresholdMode, general: gradeThreshold, bySubject: subjectGradeThresholds }) !== gradeThresholdLoaded
      if (token && (instructionsChanged || Object.keys(subjectLevels).length > 0 || gradeThresholdChanged)) {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ...(instructionsChanged ? { custom_instructions: customInstructions } : {}),
            subject_levels: subjectLevels,
            ...(gradeThresholdChanged ? {
              grade_threshold_mode: gradeThresholdMode,
              grade_threshold: gradeThreshold,
              subject_grade_thresholds: subjectGradeThresholds,
            } : {}),
          }),
        })
        if (res.ok && instructionsChanged) setCustomInstructionsLoaded(customInstructions.trim())
        if (res.ok && gradeThresholdChanged) {
          setGradeThresholdLoaded(JSON.stringify({ mode: gradeThresholdMode, general: gradeThreshold, bySubject: subjectGradeThresholds }))
        }
      }
      if (token && onboarding?.completedAt) {
        const nextOnboarding: OnboardingData = {
          ...onboarding,
          // dailyStudyTime es solo la etiqueta legible ("1-2 horas") del
          // mismo dailyMinutes — antes se dejaba tal cual venía del
          // onboarding original, así que quedaba desincronizada de
          // dailyMinutes en cuanto el alumno cambiaba este selector aquí.
          // Se deriva siempre del número, que es la única fuente de verdad.
          dailyStudyTime: dailyMinutesLabel(caminoDailyMinutes),
          dailyMinutes: caminoDailyMinutes,
          weeklyStudyDays: weeklyDaysLabel(caminoWeeklyDays),
          weeklyStudyDaysValue: caminoWeeklyDays,
        }
        saveOnboarding(nextOnboarding)
        setOnboarding(nextOnboarding)

        const setupRes = await fetch('/api/onboarding/setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            routeId: 'completa',
            community: nextOnboarding.community ?? ccaa ?? 'Madrid',
            schoolName: nextOnboarding.schoolName,
            schoolSource: nextOnboarding.schoolSource,
            subjects: nextOnboarding.subjects,
            preparationFeeling: nextOnboarding.preparationFeeling,
            dailyStudyTime: nextOnboarding.dailyStudyTime,
            dailyMinutes: nextOnboarding.dailyMinutes,
            weeklyStudyDays: nextOnboarding.weeklyStudyDays,
            weeklyStudyDaysValue: nextOnboarding.weeklyStudyDaysValue,
            onboardingCompleted: true,
          }),
        })
        if (!setupRes.ok) throw new Error('onboarding_setup_failed')

        // force: el usuario acaba de cambiar días/minutos (o sus instrucciones
        // personalizadas) y espera que sus próximas misiones se reajusten
        // ahora, no mañana. Sin esto, el throttle diario de la ruta se lo
        // saltaría en silencio.
        const ensureRes = await fetch('/api/camino/ensure-calendar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: true }),
        })
        if (!ensureRes.ok) throw new Error('camino_personalization_failed')
        setCaminoPrefsStatus('Tu Camino se ha ajustado para las próximas misiones.')
      } else if (token && (instructionsChanged || Object.keys(subjectLevels).length > 0 || gradeThresholdChanged)) {
        await fetch('/api/camino/ensure-calendar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ force: true }),
        }).catch(() => undefined)
      }
    } catch {
      setSaved(false)
      setSaveError('No se han podido guardar todos los cambios. Revisa la conexión y vuelve a intentarlo.')
    }
  }

  // Manual "recalcular mi plan" — always available, independent of whether
  // any field actually changed (saving days/minutos/instrucciones already
  // forces a recalculation as a side effect of changing them; this covers
  // "nothing changed but I want a fresh look at my plan").
  async function recalculateNow() {
    setRecalculating(true)
    setRecalculateStatus('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) throw new Error('no_session')
      const res = await fetch('/api/camino/ensure-calendar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      })
      if (!res.ok) throw new Error('recalculate_failed')
      await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mark_weekly_checkin: true }),
      }).catch(() => undefined)
      setRecalculateStatus('Tu Camino se ha recalculado.')
    } catch {
      setRecalculateStatus('No se ha podido recalcular. Revisa la conexión e inténtalo de nuevo.')
    } finally {
      setRecalculating(false)
      window.setTimeout(() => setRecalculateStatus(''), 4000)
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== 'BORRAR') return
    setDeleting(true)
    setDeleteError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) {
        setDeleteError('No se ha podido verificar la sesión. Vuelve a iniciar sesión.')
        setDeleting(false)
        return
      }
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        await supabase.auth.signOut()
        router.push('/login')
      } else {
        const json = await res.json().catch(() => null) as { error?: string } | null
        setDeleteError(json?.error ?? 'No se ha podido borrar la cuenta. Contacta con soporte.')
        setDeleting(false)
      }
    } catch {
      setDeleteError('No se ha podido borrar la cuenta. Revisa la conexión y vuelve a intentarlo.')
      setDeleting(false)
    }
  }

  function openDeleteModal() {
    setDeleteConfirm('')
    setDeleteError('')
    setShowDeleteModal(true)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function openBillingPortal() {
    setPortalLoading(true)
    setPortalError('')
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) { setPortalError('No se ha podido verificar la sesión.'); return }
      const res = await fetch('/api/billing/portal', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const json = await res.json().catch(() => null) as { url?: string; error?: string } | null
      if (!res.ok || !json?.url) {
        setPortalError(json?.error ?? 'No se ha podido abrir la gestión de facturación.')
        return
      }
      window.location.href = json.url
    } catch {
      setPortalError('No se ha podido abrir la gestión de facturación. Revisa la conexión.')
    } finally {
      setPortalLoading(false)
    }
  }

  const displayName = username || preferences.displayName || email.split('@')[0] || '?'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  // Antes este selector tenía las 9 asignaturas de /examenes hardcodeadas
  // siempre, sin relación con lo elegido en onboarding. Ahora se limita a
  // las asignaturas activas del alumno; solo cae al listado completo si
  // todavía no hay onboarding cargado (por ejemplo, justo tras iniciar
  // sesión) para no dejar el selector vacío.
  const activeSubjectOptions = (onboarding?.subjects ?? [])
    .map(label => {
      const value = ONBOARDING_LABEL_TO_EXAM_SLUG[label]
      return value ? { value, label } : null
    })
    .filter((opt): opt is { value: string; label: string } => opt !== null)
  const defaultSubjectOptions = activeSubjectOptions.length > 0 ? activeSubjectOptions : FULL_SUBJECT_OPTIONS

  return (
    <div style={{ display: 'flex', height: '100dvh', overflow: 'hidden', background: '#f8fafc' }}>
      <style>{`
        @media (max-width: 767px) {
          .settings-header { height: 160px !important; }
          .settings-scroll { padding: 20px 16px 20px !important; }
          .settings-savebar { padding: 12px 16px !important; flex-wrap: wrap; }
          .settings-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <SidebarNav />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* V4 CREDENTIAL HEADER */}
        <div className="settings-header" style={{ position: 'relative', height: 240, flexShrink: 0, overflow: 'hidden', background: '#0f172a' }}>
          <img src={NOTEBOOK_IMG} alt="" loading="eager" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(.2) saturate(.4)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '20px 0' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: '#374151', marginBottom: 10 }}>Kairo · Mi perfil</div>
            {/* Avatar */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: 80, height: 80, borderRadius: '50%', background: preferences.photo ? 'transparent' : 'rgba(37,99,235,.25)', border: '3px solid rgba(37,99,235,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', cursor: 'pointer', position: 'relative', marginBottom: 12, overflow: 'hidden', flexShrink: 0 }}
            >
              {preferences.photo
                ? <img src={preferences.photo} alt="Foto" loading="eager" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 150ms', borderRadius: '50%' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
              >
                <Camera size={18} color="white" />
              </div>
            </div>
            <div style={{ fontSize: 32, fontWeight: 900, color: 'white', letterSpacing: '-.04em', lineHeight: 1, marginBottom: 8, textAlign: 'center' }}>{displayName}</div>
            <div style={{ width: 40, height: 3, background: '#2563eb', borderRadius: 999, marginBottom: 10 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 9, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(37,99,235,.2)', border: '1px solid rgba(37,99,235,.25)', color: '#60a5fa' }}>{ccaa || 'Madrid'}</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, fontSize: 9, fontWeight: 900, letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', color: '#4b5563' }}>{EDUC_LABELS[preferences.educationLevel] ?? '2.º Bach'}</span>
            </div>
          </div>
          {/* Remove photo button */}
          {preferences.photo && (
            <button
              type="button"
              onClick={() => setPreferences(cur => ({ ...cur, photo: '' }))}
              style={{ position: 'absolute', top: 14, right: 24, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', fontSize: 10, fontWeight: 700, color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <X size={12} /> Quitar foto
            </button>
          )}
          {!preferences.photo && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ position: 'absolute', top: 14, right: 24, padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)', fontSize: 10, fontWeight: 700, color: '#60a5fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Camera size={12} /> Cambiar foto
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} className="hidden" />
        </div>

        {/* Editorial separator */}
        <div style={{ height: 2, background: '#0f172a', flexShrink: 0 }} />

        {/* Stats band */}
        <div style={{ background: 'white', borderBottom: '1px solid #f1f5f9', display: 'flex', flexShrink: 0 }}>
          {[
            { label: 'Tiempo diario', value: `${caminoDailyMinutes}`, unit: 'min' },
            { label: 'Asignatura', value: SUBJECT_LABELS[preferences.defaultSubject] ?? 'Mates II', unit: '' },
            { label: 'Corrección', value: preferences.correctionStyle.charAt(0).toUpperCase() + preferences.correctionStyle.slice(1), unit: '' },
            { label: 'Recordatorios', value: emailNotifications ? 'Activos' : 'Inactivos', unit: '', green: emailNotifications },
          ].map(s => (
            <div key={s.label} style={{ flex: 1, padding: '12px 20px', borderRight: '1px solid #f1f5f9', textAlign: 'center' }}>
              <div style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: s.green ? '#16a34a' : '#0f172a', letterSpacing: '-.02em', lineHeight: 1 }}>
                {s.value}{s.unit && <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginLeft: 2 }}>{s.unit}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable form — V1 style */}
        <div className="kairo-page-scroll settings-scroll" style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 20px' }}>

          {/* Identidad */}
          <Section label="Identidad" />

          {/* Username — full-width block with display/edit toggle */}
          <div style={{ marginBottom: 12 }}>
            <span style={{ display: 'block', marginBottom: 5, fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8' }}>Nombre de usuario</span>
            <div style={{ border: `1px solid ${usernameEditMode && (usernameStatus === 'taken' || usernameStatus === 'invalid') ? '#dc2626' : usernameEditMode && usernameStatus === 'available' ? '#16a34a' : '#e2e8f0'}`, borderRadius: 10, background: 'white', overflow: 'hidden', transition: 'border-color .15s' }}>
              {!usernameEditMode ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: username ? '#0f172a' : '#94a3b8', fontFamily: username ? 'monospace' : 'inherit' }}>
                    {username ? `@${username}` : 'Sin nombre de usuario aún'}
                  </span>
                  <button type="button" onClick={enterUsernameEditMode}
                    style={{ padding: '5px 12px', borderRadius: 6, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 11, fontWeight: 900, color: '#0f172a', cursor: 'pointer' }}>
                    {username ? 'Cambiar →' : 'Añadir →'}
                  </button>
                </div>
              ) : (
                <div style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${usernameStatus === 'available' ? '#16a34a' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#dc2626' : '#e2e8f0'}`, borderRadius: 8, background: 'white', paddingLeft: 10, transition: 'border-color .15s' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', flexShrink: 0, fontFamily: 'monospace' }}>@</span>
                    <input
                      value={usernameInput}
                      onChange={e => onUsernameInputChange(e.target.value)}
                      placeholder="tu_usuario"
                      spellCheck={false}
                      autoComplete="username"
                      autoFocus
                      style={{ ...inputStyle, border: 'none', paddingLeft: 6, borderRadius: 0 }}
                    />
                    <div style={{ paddingRight: 10, flexShrink: 0 }}>
                      {usernameStatus === 'checking' && <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#2563eb', animation: 'spin .6s linear infinite' }} />}
                      {usernameStatus === 'available' && <span style={{ color: '#16a34a', fontSize: 14 }}>✓</span>}
                      {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <span style={{ color: '#dc2626', fontSize: 14 }}>✗</span>}
                    </div>
                  </div>
                  {usernameStatus === 'invalid' && usernameError && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: '#dc2626' }}>{usernameError}</p>
                  )}
                  {usernameStatus === 'taken' && (
                    <div style={{ marginTop: 6 }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Nombre en uso</p>
                      {usernameSuggestions.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {usernameSuggestions.map(s => (
                            <button key={s} type="button" onClick={() => { setUsernameInput(s); void checkUsernameSettings(s) }}
                              style={{ padding: '3px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', fontSize: 11, fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontFamily: 'monospace' }}>
                              @{s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  {usernameStatus === 'available' && usernameInput && (
                    <p style={{ margin: '4px 0 0', fontSize: 11, fontWeight: 600, color: '#16a34a' }}>@{usernameInput} está disponible</p>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 10 }}>
                    <button type="button" onClick={cancelUsernameEdit}
                      style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 11, fontWeight: 900, color: '#64748b', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                    <button type="button" onClick={saveUsernameNow}
                      disabled={usernameStatus === 'saving' || usernameStatus !== 'available' || !usernameInput.trim()}
                      style={{ padding: '7px 14px', borderRadius: 8, border: 'none', background: (usernameStatus === 'available' || usernameStatus === 'saving') && usernameInput.trim() ? '#0f172a' : '#e2e8f0', color: (usernameStatus === 'available' || usernameStatus === 'saving') && usernameInput.trim() ? 'white' : '#94a3b8', fontSize: 11, fontWeight: 900, cursor: usernameStatus === 'available' && usernameInput.trim() ? 'pointer' : 'not-allowed' }}>
                      {usernameStatus === 'saving' ? 'Guardando…' : 'Guardar cambio'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <small style={{ display: 'block', marginTop: 6, fontSize: 10, lineHeight: 1.4, color: '#94a3b8', fontWeight: 650 }}>Único en Kairo · 3–20 caracteres · Aparece en clasificaciones</small>
          </div>

          <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <Field label="Email">
              <input value={email} readOnly style={{ ...inputStyle, background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }} />
            </Field>
            <Field label="Comunidad por defecto">
              <select value={ccaa} onChange={e => setCCAA(e.target.value as CCAA)} style={inputStyle}>
                {CCAA_OPTIONS.map(o => <option key={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Curso o nivel">
              <select value={preferences.educationLevel} onChange={e => setPreferences(cur => ({ ...cur, educationLevel: e.target.value }))} style={inputStyle}>
                <option value="1-bachillerato">1.º Bachillerato</option>
                <option value="2-bachillerato">2.º Bachillerato</option>
                <option value="preparacion-pau">Preparación PAU</option>
                <option value="otro">Otro</option>
              </select>
              <Hint>Solo orientativo: ahora mismo no cambia el algoritmo de Camino.</Hint>
            </Field>
          </div>

          {/* Facturación — solo si hay un plan de pago activo */}
          {hasActivePack && (
            <>
              <Section label="Facturación" />
              <div style={{ marginBottom: 28, borderRadius: 14, border: '1px solid #e2e8f0', background: 'white', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Gestionar mi suscripción</strong>
                  <small style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#94a3b8' }}>Cambia tu método de pago, descarga facturas o cancela tu plan cuando quieras.</small>
                  {portalError && <small style={{ display: 'block', marginTop: 6, fontSize: 11, fontWeight: 700, color: '#dc2626' }}>{portalError}</small>}
                </div>
                <button type="button" onClick={openBillingPortal} disabled={portalLoading}
                  style={{ padding: '9px 18px', borderRadius: 999, background: '#0f172a', color: 'white', fontSize: 12, fontWeight: 900, border: 'none', cursor: portalLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0, opacity: portalLoading ? .7 : 1 }}>
                  <CreditCard size={14} /> {portalLoading ? 'Abriendo…' : 'Gestionar facturación'}
                </button>
              </div>
            </>
          )}

          {/* Preferencias */}
          <Section label="Preferencias de estudio" />
          {/* Único sitio con el tiempo de estudio disponible — antes había un
              "Objetivo diario" que no hacía nada ("solo orientativo") junto a
              este, y no quedaba claro cuál mandaba de verdad. */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Días de Camino">
              <select value={caminoWeeklyDays} onChange={e => setCaminoWeeklyDays(Number(e.target.value))} style={inputStyle}>
                {WEEKLY_DAYS_OPTIONS.map(days => <option key={days} value={days}>{days} días por semana</option>)}
              </select>
              <Hint>Se aplica a tus próximas misiones. Lo completado no cambia.</Hint>
            </Field>
            <Field label="Tiempo disponible al día">
              <select value={caminoDailyMinutes} onChange={e => setCaminoDailyMinutes(Number(e.target.value))} style={inputStyle}>
                {DAILY_MINUTES_OPTIONS.map(minutes => <option key={minutes} value={minutes}>{minutes} minutos</option>)}
              </select>
              <Hint>{describeDailyPlan(caminoDailyMinutes)}</Hint>
            </Field>
            <Field label="Asignatura por defecto">
              <select value={preferences.defaultSubject} onChange={e => setPreferences(cur => ({ ...cur, defaultSubject: e.target.value }))} style={inputStyle}>
                {defaultSubjectOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <Hint>Solo tus asignaturas activas de Camino PAU.</Hint>
            </Field>
          </div>
          {caminoPrefsStatus && (
            <div style={{ margin: '-4px 0 18px', borderRadius: 14, border: '1px solid #bfdbfe', background: '#eff6ff', padding: '10px 12px', fontSize: 11, fontWeight: 750, color: '#1d4ed8' }}>
              {caminoPrefsStatus}
            </div>
          )}

          <Section label="Apariencia (piloto)" />
          <div style={{ marginBottom: 24 }}>
            <ClayThemeSwitcher />
          </div>

          {activeSubjectOptions.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <span style={{ display: 'block', marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8' }}>Cómo vas en cada asignatura</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {activeSubjectOptions.map(opt => (
                  <div key={opt.value} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9', background: '#fafbfc' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{opt.label}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {SUBJECT_LEVELS.map(level => {
                        const active = subjectLevels[opt.value] === level
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSubjectLevels(cur => ({ ...cur, [opt.value]: level }))}
                            style={{
                              padding: '6px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                              border: `1.5px solid ${active ? '#93c5fd' : '#e2e8f0'}`,
                              background: active ? '#eff6ff' : 'white',
                              color: active ? '#1d4ed8' : '#94a3b8',
                              cursor: 'pointer',
                            }}
                          >
                            {SUBJECT_LEVEL_LABELS[level]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <Hint>Kairo lo tiene en cuenta al preparar tus misiones, junto con tus notas de Personalización IA.</Hint>
            </div>
          )}

          <div style={{ marginBottom: 20 }}>
            <span style={{ display: 'block', marginBottom: 8, fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8' }}>
              Repetir para mejorar
            </span>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {([
                { value: 'general' as const, label: 'Mismo umbral para todo' },
                { value: 'per_subject' as const, label: 'Distinto por asignatura' },
              ]).map(opt => {
                const active = gradeThresholdMode === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGradeThresholdMode(opt.value)}
                    style={{
                      padding: '7px 12px', borderRadius: 10, fontSize: 11, fontWeight: 800,
                      border: `1.5px solid ${active ? '#93c5fd' : '#e2e8f0'}`,
                      background: active ? '#eff6ff' : 'white',
                      color: active ? '#1d4ed8' : '#94a3b8',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            {gradeThresholdMode === 'general' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9', background: '#fafbfc' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Sugerir repetir si saco menos de</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {GRADE_THRESHOLD_OPTS.map(value => {
                    const active = (gradeThreshold ?? DEFAULT_GRADE_THRESHOLD) === value
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setGradeThreshold(value)}
                        style={{
                          width: 30, height: 30, borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                          border: `1.5px solid ${active ? '#93c5fd' : '#e2e8f0'}`,
                          background: active ? '#eff6ff' : 'white',
                          color: active ? '#1d4ed8' : '#94a3b8',
                        }}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(onboarding?.subjects ?? []).length === 0 && (
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: '#94a3b8' }}>Añade asignaturas activas para ajustarlas una a una.</p>
                )}
                {(onboarding?.subjects ?? []).map(subjectLabel => {
                  const slug = normalizeSubjectSlug(subjectLabel)
                  const current = subjectGradeThresholds[slug] ?? DEFAULT_GRADE_THRESHOLD
                  return (
                    <div key={slug} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 12px', borderRadius: 10, border: '1px solid #f1f5f9', background: '#fafbfc' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{subjectLabel}</span>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {GRADE_THRESHOLD_OPTS.map(value => {
                          const active = current === value
                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => setSubjectGradeThresholds(cur => ({ ...cur, [slug]: value }))}
                              style={{
                                width: 30, height: 30, borderRadius: 8, fontSize: 11, fontWeight: 800, cursor: 'pointer',
                                border: `1.5px solid ${active ? '#93c5fd' : '#e2e8f0'}`,
                                background: active ? '#eff6ff' : 'white',
                                color: active ? '#1d4ed8' : '#94a3b8',
                              }}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <Hint>Cuando saques menos de esta nota en un simulacro, examen o curso, Kairo te sugerirá repetirlo — tú decides si aceptar.</Hint>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <button
              type="button"
              onClick={recalculateNow}
              disabled={recalculating}
              style={{ padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 800, color: '#0f172a', cursor: recalculating ? 'default' : 'pointer', opacity: recalculating ? 0.6 : 1 }}
            >
              {recalculating ? 'Recalculando…' : 'Recalcular mi plan ahora'}
            </button>
            {recalculateStatus && <span style={{ fontSize: 11, fontWeight: 700, color: recalculateStatus.startsWith('No') ? '#dc2626' : '#16a34a' }}>{recalculateStatus}</span>}
          </div>

          <Toggle
            label={`Recordatorios de estudio por email${emailNotifSaving ? ' · Guardando…' : ''}`}
            description="Kairo te avisará cuando tengas misiones pendientes en Camino PAU."
            checked={emailNotifications}
            onChange={v => saveEmailNotifications(v)}
          />
          <div style={{ marginBottom: 28 }} />

          {/* Personalización IA */}
          <Section label="Personalización IA" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Estilo de corrección">
              <select value={preferences.correctionStyle} onChange={e => setPreferences(cur => ({ ...cur, correctionStyle: e.target.value as Preferences['correctionStyle'] }))} style={inputStyle}>
                <option value="breve">Breve</option>
                <option value="normal">Normal</option>
                <option value="detallado">Detallado</option>
              </select>
            </Field>
          </div>
          <Toggle label="Mostrar consejos largos" description="Conservar explicaciones amplias al final de las correcciones." checked={preferences.longAdvice} onChange={v => setPreferences(cur => ({ ...cur, longAdvice: v }))} />
          <p style={{ marginTop: 10, fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>Estas preferencias se guardan localmente en este dispositivo.</p>
          <div style={{ marginTop: 20 }}>
            <Field label="Instrucciones personalizadas">
              <textarea
                value={customInstructions}
                onChange={e => setCustomInstructions(e.target.value.slice(0, 600))}
                placeholder="Ej: no puedo estudiar los findes, tengo entrenamientos por la tarde, prefiero sesiones cortas..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
              />
            </Field>
            <p style={{ marginTop: 6, fontSize: 11, fontWeight: 600, color: '#94a3b8' }}>El plan de tus parciales las tiene en cuenta al generar misiones.</p>
          </div>
        </div>

        {/* Save bar */}
        <div className="settings-savebar" style={{ background: 'white', borderTop: '2px solid #0f172a', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button type="button" onClick={logout} style={{ padding: '9px 18px', borderRadius: 999, background: 'white', color: '#dc2626', fontSize: 12, fontWeight: 900, border: '1px solid #fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <LogOut size={14} /> Cerrar sesión
            </button>
            <button type="button" onClick={openDeleteModal} style={{ padding: '9px 18px', borderRadius: 999, background: '#fff7ed', color: '#c2410c', fontSize: 12, fontWeight: 900, border: '1px solid #fed7aa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Trash2 size={14} /> Borrar cuenta
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {saveError && <div style={{ maxWidth: 360, borderRadius: 10, border: '1px solid #fee2e2', background: '#fff5f5', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#dc2626' }}>{saveError}</div>}
            <button type="button" onClick={save} style={{ padding: '10px 22px', borderRadius: 999, background: '#0f172a', color: 'white', fontSize: 12, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Save size={14} /> {saved ? 'Cambios guardados' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-account-title" style={{ width: 'min(460px, 100%)', borderRadius: 24, background: 'white', boxShadow: '0 24px 70px rgba(15,23,42,.26)', border: '1px solid #fee2e2', overflow: 'hidden' }}>
            <div style={{ padding: '22px 24px 18px', borderBottom: '1px solid #fee2e2', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
              <div>
                <div style={{ width: 42, height: 42, borderRadius: 16, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c2410c', marginBottom: 12 }}>
                  <Trash2 size={20} />
                </div>
                <h2 id="delete-account-title" style={{ margin: 0, fontSize: 22, fontWeight: 900, letterSpacing: '-.04em', color: '#0f172a' }}>Borrar cuenta</h2>
                <p style={{ margin: '8px 0 0', fontSize: 13, lineHeight: 1.55, fontWeight: 600, color: '#64748b' }}>Esta acción eliminará tu cuenta y los datos asociados de Kairo. No se puede deshacer.</p>
              </div>
              <button type="button" onClick={() => setShowDeleteModal(false)} disabled={deleting} aria-label="Cerrar" style={{ width: 34, height: 34, borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', color: '#64748b', cursor: deleting ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <label>
                <span style={{ display: 'block', marginBottom: 8, fontSize: 11, fontWeight: 900, letterSpacing: '.12em', textTransform: 'uppercase', color: '#991b1b' }}>Escribe BORRAR para confirmar</span>
                <input
                  value={deleteConfirm}
                  onChange={e => setDeleteConfirm(e.target.value)}
                  disabled={deleting}
                  placeholder="BORRAR"
                  style={{ ...inputStyle, borderColor: deleteConfirm && deleteConfirm !== 'BORRAR' ? '#fecaca' : '#fed7aa', background: '#fff7ed' }}
                />
              </label>
              {deleteError && <div style={{ marginTop: 12, borderRadius: 12, border: '1px solid #fecaca', background: '#fff5f5', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#dc2626' }}>{deleteError}</div>}
              <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowDeleteModal(false)} disabled={deleting} style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid #e2e8f0', background: 'white', color: '#475569', fontSize: 12, fontWeight: 900, cursor: deleting ? 'not-allowed' : 'pointer' }}>Cancelar</button>
                <button type="button" onClick={deleteAccount} disabled={deleting || deleteConfirm !== 'BORRAR'} style={{ padding: '10px 16px', borderRadius: 999, border: 'none', background: deleteConfirm === 'BORRAR' ? '#dc2626' : '#fecaca', color: 'white', fontSize: 12, fontWeight: 900, cursor: deleting || deleteConfirm !== 'BORRAR' ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Trash2 size={14} /> {deleting ? 'Borrando…' : 'Borrar definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600, color: '#0f172a', background: 'white', outline: 'none' }

function Section({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <span style={{ fontSize: 8, fontWeight: 900, letterSpacing: '.2em', textTransform: 'uppercase', color: '#94a3b8', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
    </div>
  )
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <label>
      <span style={{ display: 'block', marginBottom: 5, fontSize: 8, fontWeight: 900, letterSpacing: '.14em', textTransform: 'uppercase', color: '#94a3b8' }}>{label}</span>
      {children}
    </label>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <small style={{ display: 'block', marginTop: 6, fontSize: 10, lineHeight: 1.4, color: '#94a3b8', fontWeight: 650 }}>{children}</small>
}

function Toggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid #f8fafc' }}>
      <span>
        <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{label}</strong>
        <small style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#94a3b8' }}>{description}</small>
      </span>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ width: 18, height: 18, accentColor: '#2563eb', flexShrink: 0 }} />
    </label>
  )
}
