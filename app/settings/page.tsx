'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, LogOut, Save, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'
import { supabase } from '@/app/lib/supabase'
import SidebarNav from '@/app/components/SidebarNav'

const NOTEBOOK_IMG = 'https://d8j0ntlcm91z4.cloudfront.net/user_3FE1qfsmGuEldtlzta7SsGkWNIV/hf_20260725_171854_b8f1489a-95e8-4506-a6c5-742030f50c09.png'
const STORAGE_KEY = 'kairo_profile_preferences'
const CHANGE_EVENT = 'kairo_profile_preferences_change'

type Preferences = {
  displayName: string
  photo: string
  dailyGoal: number
  educationLevel: string
  defaultSubject: string
  correctionStyle: 'breve' | 'normal' | 'detallado'
  longAdvice: boolean
  studyReminders: boolean
  correctionEmails: boolean
}

const defaults: Preferences = {
  displayName: '',
  photo: '',
  dailyGoal: 45,
  educationLevel: '2-bachillerato',
  defaultSubject: 'mates',
  correctionStyle: 'normal',
  longAdvice: true,
  studyReminders: true,
  correctionEmails: false
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


export default function SettingsPage() {
  const router = useRouter()
  const { ccaa, setCCAA } = useCCAA()
  const [email, setEmail] = useState('')
  const [preferences, setPreferences] = useState<Preferences>(defaults)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [emailNotifSaving, setEmailNotifSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push('/login'); return }
      setEmail(data.user.email ?? '')
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (token) {
        try {
          const res = await fetch('/api/profile', { headers: { Authorization: `Bearer ${token}` } })
          if (res.ok) {
            const json = await res.json() as { email_notifications: boolean }
            setEmailNotifications(json.email_notifications ?? true)
          }
        } catch { /* silent */ }
      }
    })
    try {
      setPreferences({ ...defaults, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') })
    } catch {
      setPreferences(defaults)
    }
  }, [router])

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

  function save() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
      window.dispatchEvent(new Event(CHANGE_EVENT))
      setSaveError('')
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2200)
    } catch {
      setSaved(false)
      setSaveError('No se han podido guardar los cambios en este dispositivo. Prueba con una foto más pequeña.')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const displayName = preferences.displayName || email.split('@')[0] || '?'
  const initial = displayName[0]?.toUpperCase() ?? '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>
      <SidebarNav />

      {/* Main column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

        {/* V4 CREDENTIAL HEADER */}
        <div style={{ position: 'relative', height: 240, flexShrink: 0, overflow: 'hidden', background: '#0f172a' }}>
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
            { label: 'Recordatorios', value: preferences.studyReminders ? 'Activos' : 'Inactivos', unit: '', green: preferences.studyReminders },
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 40px 20px' }}>

          {/* Identidad */}
          <Section label="Identidad" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 }}>
            <Field label="Nombre visible">
              <input value={preferences.displayName} onChange={e => setPreferences(cur => ({ ...cur, displayName: e.target.value }))} placeholder="¿Cómo quieres que te llamemos?" style={inputStyle} />
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
          <Toggle label="Recordatorios de estudio" description="Mantener activa tu rutina de Mi Plan." checked={preferences.studyReminders} onChange={v => setPreferences(cur => ({ ...cur, studyReminders: v }))} />
          <Toggle label="Resumen de correcciones por email" description="Preparar un resumen periódico de tu progreso." checked={preferences.correctionEmails} onChange={v => setPreferences(cur => ({ ...cur, correctionEmails: v }))} />
          <div style={{ display: 'flex', cursor: 'pointer', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '14px 0', borderBottom: '1px solid #f8fafc', marginBottom: 28 }}>
            <span>
              <strong style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Recibir recordatorios diarios por email</strong>
              <small style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#94a3b8' }}>Kairo te avisará cuando tengas misiones pendientes en Camino PAU.{emailNotifSaving ? ' Guardando…' : ''}</small>
            </span>
            <input type="checkbox" checked={emailNotifications} onChange={e => saveEmailNotifications(e.target.checked)} disabled={emailNotifSaving} style={{ width: 18, height: 18, accentColor: '#2563eb', flexShrink: 0 }} />
          </div>

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
        <div style={{ background: 'white', borderTop: '2px solid #0f172a', padding: '12px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, gap: 12 }}>
          <button type="button" onClick={logout} style={{ padding: '9px 18px', borderRadius: 999, background: 'white', color: '#dc2626', fontSize: 12, fontWeight: 900, border: '1px solid #fee2e2', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
            <LogOut size={14} /> Cerrar sesión
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {saveError && <div style={{ maxWidth: 360, borderRadius: 10, border: '1px solid #fee2e2', background: '#fff5f5', padding: '8px 14px', fontSize: 11, fontWeight: 600, color: '#dc2626' }}>{saveError}</div>}
            <button type="button" onClick={save} style={{ padding: '10px 22px', borderRadius: 999, background: '#0f172a', color: 'white', fontSize: 12, fontWeight: 900, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7 }}>
              <Save size={14} /> {saved ? 'Cambios guardados' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
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
