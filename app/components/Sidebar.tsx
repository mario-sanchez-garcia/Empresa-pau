'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Atom,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ClipboardList,
  Dna,
  FlaskConical,
  Globe,
  GraduationCap,
  Landmark,
  LogOut,
  MessageCircle,
  Rocket,
  Sigma,
  TimerReset
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import { CCAA_OPTIONS, useCCAA, type CCAA } from '@/app/hooks/useCCAA'

export type SidebarItemId = 'examenes' | 'simulacros' | 'zona' | 'chat' | 'historial' | 'plan-estudio' | 'planning'
export type SidebarSubjectId = 'mates' | 'fisica' | 'quimica' | 'biologia' | 'lengua' | 'historia' | 'ingles'

interface SidebarProps {
  activeItem?: SidebarItemId
  activeSubject?: SidebarSubjectId
  email?: string | null
  onNavigate?: (item: SidebarItemId) => void
  onSubjectChange?: (subject: SidebarSubjectId) => void
  onLogout?: () => void | Promise<void>
}

const NAV_ITEMS = [
  { id: 'examenes', label: 'Exámenes', desc: 'Practica y corrige', href: '/', icon: ClipboardList },
  { id: 'simulacros', label: 'Simulacros', desc: 'Condiciones reales', href: '/simulacros', icon: TimerReset },
  { id: 'zona', label: 'La Zona', desc: 'Estudia a tu manera', href: '/zona', icon: BrainCircuit },
  { id: 'chat', label: 'Chat con Pausia', desc: 'Resuelve dudas', href: '/?view=chat', icon: MessageCircle },
  { id: 'historial', label: 'Historial', desc: 'Tus correcciones', href: '/?view=historial', icon: BarChart3 },
  { id: 'plan-estudio', label: 'Mi Plan', desc: 'Semana organizada', href: '/?view=planning', icon: BrainCircuit },
  { id: 'planning', label: 'Planning', desc: 'Tareas completables', href: '/planning', icon: Rocket }
] as const

const SUBJECTS = [
  { id: 'mates', label: 'Matemáticas II', icon: Sigma, color: '#2563eb', light: '#eff6ff', border: '#dbeafe' },
  { id: 'fisica', label: 'Física', icon: Atom, color: '#6d28d9', light: '#f5f3ff', border: '#ede9fe' },
  { id: 'quimica', label: 'Química', icon: FlaskConical, color: '#ea580c', light: '#fff7ed', border: '#ffedd5' },
  { id: 'biologia', label: 'Biología', icon: Dna, color: '#4d7c0f', light: '#f7fee7', border: '#ecfccb' },
  { id: 'lengua', label: 'Lengua', icon: BookOpen, color: '#4f46e5', light: '#eef2ff', border: '#ffe4e6' },
  { id: 'historia', label: 'Historia de España', icon: Landmark, color: '#2f6f4e', light: '#f0fdf4', border: '#dcfce7' },
  { id: 'ingles', label: 'Inglés', icon: Globe, color: '#0891B2', light: '#CFFAFE', border: '#A5F3FC' }
] as const

function routeItem(pathname: string): SidebarItemId {
  if (pathname.startsWith('/simulacros')) return 'simulacros'
  if (pathname.startsWith('/zona')) return 'zona'
  if (pathname.startsWith('/planning')) return 'planning'
  return 'examenes'
}

export default function Sidebar({ activeItem, activeSubject, email, onNavigate, onSubjectChange, onLogout }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessionEmail, setSessionEmail] = useState('')
  const currentItem = activeItem ?? routeItem(pathname)
  const displayedEmail = email ?? sessionEmail
  const { ccaa, setCCAA } = useCCAA()

  useEffect(() => {
    if (email === undefined) supabase.auth.getUser().then(({ data }) => setSessionEmail(data.user?.email ?? ''))
  }, [email])

  async function logout() {
    if (onLogout) {
      await onLogout()
      return
    }
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="sticky top-0 flex h-screen w-[282px] shrink-0 flex-col border-r border-[#dbe7fb] bg-white/80 shadow-[18px_0_55px_rgba(37,99,235,0.055)] backdrop-blur-2xl max-lg:relative max-lg:h-auto max-lg:w-full">
      <div className="border-b border-[#dbe7fb] px-[22px] py-[24px]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-sky-400 text-white shadow-[0_16px_34px_rgba(37,99,235,0.24)]">
            <GraduationCap size={23} strokeWidth={2.2} />
          </div>
          <div>
            <div className="text-lg font-black text-[#111827]">Pausia</div>
            <div className="mt-0.5 text-[11px] text-slate-500">EBAU Madrid · practica mejor</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-[14px] py-[18px]">
        <div className="mb-2.5 px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Navegación</div>
        {NAV_ITEMS.map(item => {
          const Icon = item.icon
          const active = currentItem === item.id
          const content = (
            <>
              <span className={`flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[13px] border ${active ? 'border-blue-200 bg-blue-100 text-blue-700' : 'border-[#dbe7fb] bg-[#fafafa] text-slate-500'}`}><Icon size={17} /></span>
              <span>
                <strong className={`block text-sm ${active ? 'text-slate-900' : 'font-semibold text-slate-500'}`}>{item.label}</strong>
                <small className="mt-0.5 block text-[11px] text-slate-400">{item.desc}</small>
              </span>
            </>
          )
          const classes = `mb-1.5 flex w-full items-center gap-3 rounded-[18px] border px-[13px] py-3 text-left no-underline transition hover:translate-x-0.5 hover:border-blue-300 hover:bg-blue-50 ${active ? 'border-blue-300 bg-gradient-to-br from-white to-blue-50 shadow-[0_14px_32px_rgba(37,99,235,0.09)]' : 'border-transparent bg-transparent'}`

          if (onNavigate && ['examenes', 'chat', 'historial', 'plan-estudio'].includes(item.id)) {
            return <button key={item.id} className={classes} onClick={() => onNavigate(item.id)}>{content}</button>
          }
          return <Link key={item.id} className={classes} href={item.href}>{content}</Link>
        })}

        <div className="mb-2.5 mt-[22px] px-2.5 text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Asignaturas</div>
        {SUBJECTS.map(subject => {
          const Icon = subject.icon
          const active = currentItem === 'examenes' && activeSubject === subject.id
          const classes = `mb-1.5 flex w-full items-center gap-3 rounded-[18px] border px-[13px] py-[11px] text-left no-underline transition hover:translate-x-0.5 ${active ? 'bg-gradient-to-br from-white to-blue-50' : 'border-transparent bg-transparent'}`
          const style = { borderColor: active ? subject.border : 'transparent', color: active ? subject.color : '#64748b' }
          const content = (
            <>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ color: subject.color, background: subject.light }}><Icon size={16} /></span>
              <span className={`text-[13px] ${active ? 'font-bold' : 'font-semibold'}`}>{subject.label}</span>
            </>
          )
          return onSubjectChange
            ? <button key={subject.id} className={classes} style={style} onClick={() => onSubjectChange(subject.id)}>{content}</button>
            : <Link key={subject.id} className={classes} style={style} href={`/?subject=${subject.id}`}>{content}</Link>
        })}
      </nav>

      <div className="border-t border-[#dbe7fb] p-4">
        <label className="mb-3 block">
          <span className="mb-1.5 block text-[10px] font-black uppercase tracking-[0.08em] text-slate-400">Comunidad autónoma</span>
          <select
            value={ccaa}
            onChange={(event) => setCCAA(event.target.value as CCAA)}
            className="w-full rounded-xl border border-[#dbe7fb] bg-white px-3 py-2 text-xs font-bold text-slate-600 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          >
            {CCAA_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
          </select>
        </label>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-blue-100 bg-blue-50 text-[13px] font-black text-blue-700">{displayedEmail[0]?.toUpperCase() ?? '?'}</div>
          <div className="min-w-0">
            <div className="truncate text-[13px] font-bold text-slate-900">{displayedEmail || 'Estudiante'}</div>
            <div className="text-[11px] text-slate-400">Estudiante</div>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-white px-3 py-2.5 text-xs font-black text-blue-700 transition hover:border-blue-300 hover:bg-blue-50"><LogOut size={15} />Cerrar sesión</button>
      </div>
    </aside>
  )
}
