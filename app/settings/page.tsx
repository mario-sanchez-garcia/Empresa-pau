'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Camera, LogOut, Save, Settings2, ShieldCheck, UserRound, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/app/components/Sidebar'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'
import { supabase } from '@/app/lib/supabase'

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
      // setState síncrono de inicialización desde localStorage
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferences({ ...defaults, ...JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}') })
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferences(defaults)
    }
  }, [router])

  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreferences(current => ({ ...current, photo: reader.result as string }))
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

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-900 lg:flex">
      <Sidebar activeItem="settings" email={email} />
      <main className="w-full flex-1 px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl">
          <header className="mb-8">
            <div className="text-xs font-black uppercase tracking-[0.08em] text-blue-600">Ajustes / Perfil</div>
            <h1 className="mt-2 text-3xl font-black">Tu espacio en Kairo</h1>
            <p className="mt-2 text-sm text-slate-500">Identidad, comunidad por defecto y preferencias de estudio.</p>
          </header>

          <div className="grid gap-8">
            <section className="border-y border-blue-100 bg-white px-5 py-6 sm:px-7">
              <SectionTitle icon={<UserRound size={18} />} title="Perfil" />
              <div className="mt-5 flex flex-wrap items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-2 border-blue-100 bg-blue-50 text-2xl font-black text-blue-700">
                  {preferences.photo ? <img src={preferences.photo} alt="Foto de perfil" className="h-full w-full object-cover" /> : (preferences.displayName || email)[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex gap-2">
                  <input ref={fileRef} type="file" accept="image/*" onChange={choosePhoto} className="hidden" />
                  <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-black text-white"><Camera size={15} />Elegir foto</button>
                  {preferences.photo && <button type="button" onClick={() => setPreferences(current => ({ ...current, photo: '' }))} aria-label="Eliminar foto" className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 text-blue-700"><X size={16} /></button>}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label="Nombre visible"><input value={preferences.displayName} onChange={event => setPreferences(current => ({ ...current, displayName: event.target.value }))} placeholder="¿Cómo quieres que te llamemos?" className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white" /></Field>
                <Field label="Email"><input value={email} readOnly className="w-full cursor-not-allowed rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-500 outline-none" /></Field>
                <Field label="Comunidad por defecto"><select value={ccaa} onChange={event => setCCAA(event.target.value as CCAA)} className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white">{CCAA_OPTIONS.map(option => <option key={option}>{option}</option>)}</select></Field>
                <Field label="Curso o nivel"><select value={preferences.educationLevel} onChange={event => setPreferences(current => ({ ...current, educationLevel: event.target.value }))} className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white"><option value="1-bachillerato">1.º Bachillerato</option><option value="2-bachillerato">2.º Bachillerato</option><option value="preparacion-pau">Preparación PAU</option><option value="otro">Otro</option></select></Field>
              </div>
              <p className="mt-4 text-xs font-semibold text-amber-700">La subida permanente de foto todavía no está configurada. La imagen se guarda solo en este dispositivo.</p>
            </section>

            <section className="border-y border-blue-100 bg-white px-5 py-6 sm:px-7">
              <SectionTitle icon={<Bell size={18} />} title="Preferencias" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Objetivo diario"><select value={preferences.dailyGoal} onChange={event => setPreferences(current => ({ ...current, dailyGoal: Number(event.target.value) }))} className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white"><option value={20}>20 minutos</option><option value={45}>45 minutos</option><option value={60}>60 minutos</option><option value={90}>90 minutos</option></select></Field>
                <Field label="Asignatura por defecto"><select value={preferences.defaultSubject} onChange={event => setPreferences(current => ({ ...current, defaultSubject: event.target.value }))} className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white"><option value="mates">Matemáticas II</option><option value="matematicas_ccss">Matemáticas CCSS</option><option value="fisica">Física</option><option value="quimica">Química</option><option value="lengua">Lengua</option><option value="historia">Historia de España</option><option value="historia_filosofia">Historia de la Filosofía</option><option value="ingles">Inglés</option><option value="biologia">Biología</option></select></Field>
              </div>
              <div className="mt-5 divide-y divide-blue-50">
                <Toggle label="Recordatorios de estudio" description="Mantener activa tu rutina de Mi Plan." checked={preferences.studyReminders} onChange={value => setPreferences(current => ({ ...current, studyReminders: value }))} />
                <Toggle label="Resumen de correcciones por email" description="Preparar un resumen periódico de tu progreso." checked={preferences.correctionEmails} onChange={value => setPreferences(current => ({ ...current, correctionEmails: value }))} />
                <div className="flex cursor-pointer items-center justify-between gap-4 py-4">
                  <span>
                    <strong className="block text-sm">Recibir recordatorios diarios por email</strong>
                    <small className="mt-1 block text-xs text-slate-500">Kairo te avisará cuando tengas misiones pendientes en Camino PAU.{emailNotifSaving ? ' Guardando…' : ''}</small>
                  </span>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={e => saveEmailNotifications(e.target.checked)}
                    disabled={emailNotifSaving}
                    className="h-5 w-5 accent-blue-700"
                  />
                </div>
              </div>
            </section>

            <section className="border-y border-blue-100 bg-white px-5 py-6 sm:px-7">
              <SectionTitle icon={<Settings2 size={18} />} title="Personalización" />
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <Field label="Estilo de corrección"><select value={preferences.correctionStyle} onChange={event => setPreferences(current => ({ ...current, correctionStyle: event.target.value as Preferences['correctionStyle'] }))} className="w-full rounded-xl border border-blue-100 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-blue-300 focus:bg-white"><option value="breve">Breve</option><option value="normal">Normal</option><option value="detallado">Detallado</option></select></Field>
              </div>
              <div className="mt-2 divide-y divide-blue-50">
                <Toggle label="Mostrar consejos largos" description="Conservar explicaciones amplias al final de las correcciones." checked={preferences.longAdvice} onChange={value => setPreferences(current => ({ ...current, longAdvice: value }))} />
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-500">Estas preferencias se guardan localmente en este dispositivo. No modifican todavía el formato de la corrección IA.</p>
            </section>

            <section className="border-y border-blue-100 bg-white px-5 py-6 sm:px-7">
              <SectionTitle icon={<ShieldCheck size={18} />} title="Cuenta" />
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <div><div className="text-sm font-bold">Sesión activa</div><div className="mt-1 text-xs text-slate-500">{email}</div></div>
                <button type="button" onClick={logout} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-xs font-black text-red-700"><LogOut size={15} />Cerrar sesión</button>
              </div>
            </section>
          </div>

          <div className="sticky bottom-5 mt-7 flex justify-end">
            <div className="grid justify-items-end gap-2">
              {saveError && <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{saveError}</div>}
              <button type="button" onClick={save} className="flex items-center gap-2 rounded-2xl bg-blue-700 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200"><Save size={17} />{saved ? 'Cambios guardados en este dispositivo' : 'Guardar cambios'}</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SectionTitle({ icon, title }: { icon: React.ReactNode, title: string }) {
  return <div className="flex items-center gap-2 text-base font-black text-slate-900"><span className="text-blue-700">{icon}</span>{title}</div>
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
  return <label><span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">{label}</span>{children}</label>
}

function Toggle({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 py-4"><span><strong className="block text-sm">{label}</strong><small className="mt-1 block text-xs text-slate-500">{description}</small></span><input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="h-5 w-5 accent-blue-700" /></label>
}
