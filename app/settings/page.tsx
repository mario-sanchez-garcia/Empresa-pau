'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, LogOut, Save, Trash2, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'
import { supabase } from '@/app/lib/supabase'
import { loadOnboarding, saveOnboarding, type OnboardingData } from '@/app/lib/onboarding/onboardingStorage'
import { validateUsername } from '@/app/lib/username'
import { loadProfilePreferences, saveProfilePreferences } from '@/app/lib/profilePreferences'
import SidebarNav from '@/app/components/SidebarNav'

const NOTEBOOK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_171854_b8f1489a-95e8-4506-a6c5-742030f50c09.png'

type Preferences = {
  displayName: string // kept for local prefs compat; username is separate
  photo: string
  dailyGoal: number
  educationLevel: string
  defaultSubject: string
  correctionStyle: 'breve' | 'normal' | 'detallado'
  longAdvice: boolean
}

const defaults: Preferences = {
  displayName: '',
  photo: '',
  dailyGoal: 45,
  educationLevel: '2-bachillerato',
  defaultSubject: 'mates',
  correctionStyle: 'normal',
  longAdvice: true,
}

const SUBJECT_LABELS: Record<string, string> = {
  mates: 'Mates II', matematicas_ccss: 'Mates CCSS', fisica: 'Física',
  quimica: 'Química', lengua: 'Lengua', historia: 'Historia',
  historia_filosofia: 'Fil.', ingles: 'Inglés', biologia: 'Biología',
}

const EDUC_LABELS: Record<string, string> = {
  '1-bachillerato': '1.º Bach', '2-bachillerato': '2.º Bach',
  'preparacion-pau': 'Prep. PAU', 'otro': 'Otro',
}

const DAILY_MINUTES_OPTIONS = [30, 45, 60, 90, 150, 180]
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
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid' | 'saved'>('idle')
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([])
  const usernameCheckId = useRef(0)
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
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
            const json = await res.json() as { email_notifications: boolean; username?: string }
            setEmailNotifications(json.email_notifications ?? true)
            serverDisplayName = json.username ?? ''
            if (json.username) { setUsername(json.username); setUsernameStatus('saved') }
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
    const id = ++usernameCheckId.current
    setUsernameStatus('checking')
    setUsernameError('')
    try {
      const res = await fetch(`/api/username/check?u=${encodeURIComponent(u)}`)
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
  }, [])

  function onUsernameInputChange(raw: string) {
    const val = raw.replace(/[^a-zA-Z0-9_.]/g, '').slice(0, 20)
    setUsername(val)
    setUsernameStatus('idle')
    setUsernameError('')
    if (usernameTimer.current) clearTimeout(usernameTimer.current)
    if (val.length >= 3) {
      usernameTimer.current = setTimeout(() => void checkUsernameSettings(val), 350)
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
      if (username.trim() && (usernameStatus === 'available' || usernameStatus === 'saved') && token) {
        const patchRes = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: username.trim() }),
        })
        if (!patchRes.ok) {
          const json = await patchRes.json().catch(() => null) as { error?: string } | null
          throw new Error(json?.error ?? 'username_save_failed')
        }
        setUsernameStatus('saved')
      }
      if (token && onboarding?.completedAt) {
        const nextOnboarding: OnboardingData = {
          ...onboarding,
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

        const ensureRes = await fetch('/api/camino/ensure-calendar', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!ensureRes.ok) throw new Error('camino_personalization_failed')
        setCaminoPrefsStatus('Tu Camino se ha ajustado para las próximas misiones.')
      }
    } catch {
      setSaved(false)
      setSaveError('No se han podido guardar todos los cambios. Revisa la conexión y vuelve a intentarlo.')
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

  const displayName = username || preferences.displayName || email.split('@')[0] || '?'
  const initial = displayName[0]?.toUpperCase() ?? '?'

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
          <img src={NOTEBOOK_IMG} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 35%', filter: 'brightness(.2) saturate(.4)' }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0, padding: '20px 0' }}>
            <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: '.22em', textTransform: 'uppercase', color: '#374151', marginBottom: 10 }}>Kairo · Mi perfil</div>
            {/* Avatar */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: 80, height: 80, borderRadius: '50%', background: preferences.photo ? 'transparent' : 'rgba(37,99,235,.25)', border: '3px solid rgba(37,99,235,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 900, color: 'white', cursor: 'pointer', position: 'relative', marginBottom: 12, overflow: 'hidden', flexShrink: 0 }}
            >
              {preferences.photo
                ? <img src={preferences.photo} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            { label: 'Objetivo', value: `${preferences.dailyGoal}`, unit: 'min' },
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
          <div className="settings-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <Field label="Nombre de usuario">
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${usernameStatus === 'available' || usernameStatus === 'saved' ? '#16a34a' : usernameStatus === 'taken' || usernameStatus === 'invalid' ? '#dc2626' : '#e2e8f0'}`, borderRadius: 8, background: 'white', paddingLeft: 10, transition: 'border-color .15s' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', flexShrink: 0, fontFamily: 'monospace' }}>@</span>
                  <input
                    value={username}
                    onChange={e => onUsernameInputChange(e.target.value)}
                    placeholder="tu_usuario"
                    spellCheck={false}
                    autoComplete="username"
                    style={{ ...inputStyle, border: 'none', paddingLeft: 6, borderRadius: 0 }}
                  />
                  <div style={{ paddingRight: 10, flexShrink: 0 }}>
                    {usernameStatus === 'checking' && <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #e2e8f0', borderTopColor: '#2563eb', animation: 'spin .6s linear infinite' }} />}
                    {(usernameStatus === 'available' || usernameStatus === 'saved') && <span style={{ color: '#16a34a', fontSize: 14 }}>✓</span>}
                    {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <span style={{ color: '#dc2626', fontSize: 14 }}>✗</span>}
                  </div>
                </div>
                {usernameStatus === 'invalid' && usernameError && (
                  <p style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: '#dc2626' }}>{usernameError}</p>
                )}
                {usernameStatus === 'taken' && (
                  <div style={{ marginTop: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#dc2626', marginBottom: 4 }}>Nombre en uso</p>
                    {usernameSuggestions.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {usernameSuggestions.map(s => (
                          <button key={s} type="button" onClick={() => { setUsername(s); void checkUsernameSettings(s) }}
                            style={{ padding: '3px 10px', border: '1px solid #e2e8f0', borderRadius: 6, background: '#f8fafc', fontSize: 11, fontWeight: 700, color: '#0f172a', cursor: 'pointer', fontFamily: 'monospace' }}>
                            @{s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {usernameStatus === 'saved' && <p style={{ marginTop: 4, fontSize: 11, fontWeight: 600, color: '#16a34a' }}>Nombre de usuario guardado</p>}
              </div>
              <Hint>Único en Kairo · 3–20 caracteres · Aparece en clasificaciones</Hint>
            </Field>
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

          {/* Preferencias */}
          <Section label="Preferencias de estudio" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <Field label="Objetivo diario">
              <select value={preferences.dailyGoal} onChange={e => setPreferences(cur => ({ ...cur, dailyGoal: Number(e.target.value) }))} style={inputStyle}>
                <option value={20}>20 minutos</option>
                <option value={45}>45 minutos</option>
                <option value={60}>60 minutos</option>
                <option value={90}>90 minutos</option>
              </select>
              <Hint>Solo orientativo: no ajusta todavía la carga de misiones.</Hint>
            </Field>
            <Field label="Días de Camino">
              <select value={caminoWeeklyDays} onChange={e => setCaminoWeeklyDays(Number(e.target.value))} style={inputStyle}>
                {WEEKLY_DAYS_OPTIONS.map(days => <option key={days} value={days}>{days} días por semana</option>)}
              </select>
              <Hint>Se aplica a tus próximas misiones. Lo completado no cambia.</Hint>
            </Field>
            <Field label="Minutos por día">
              <select value={caminoDailyMinutes} onChange={e => setCaminoDailyMinutes(Number(e.target.value))} style={inputStyle}>
                {DAILY_MINUTES_OPTIONS.map(minutes => <option key={minutes} value={minutes}>{minutes} minutos</option>)}
              </select>
              <Hint>Kairo concentrará el Camino en los días que puedes estudiar.</Hint>
            </Field>
            <Field label="Asignatura por defecto">
              <select value={preferences.defaultSubject} onChange={e => setPreferences(cur => ({ ...cur, defaultSubject: e.target.value }))} style={inputStyle}>
                <option value="mates">Matemáticas II</option>
                <option value="matematicas_ccss">Matemáticas CCSS</option>
                <option value="fisica">Física</option>
                <option value="quimica">Química</option>
                <option value="lengua">Lengua</option>
                <option value="historia">Historia de España</option>
                <option value="historia_filosofia">Historia de la Filosofía</option>
                <option value="ingles">Inglés</option>
                <option value="biologia">Biología</option>
              </select>
            </Field>
          </div>
          {caminoPrefsStatus && (
            <div style={{ margin: '-4px 0 18px', borderRadius: 14, border: '1px solid #bfdbfe', background: '#eff6ff', padding: '10px 12px', fontSize: 11, fontWeight: 750, color: '#1d4ed8' }}>
              {caminoPrefsStatus}
            </div>
          )}
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
