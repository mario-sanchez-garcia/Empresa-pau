'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, GraduationCap, LockKeyhole, Mail, Sparkles } from 'lucide-react'

const config = {
  bg: '#2563eb',
  light: '#eff6ff',
  accent: '#60a5fa',
  deep: '#1d4ed8',
  sky: '#38bdf8',
  ink: '#111827',
  muted: '#64748b',
  border: '#dbe7fb'
}

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [modo, setModo] = useState<'login' | 'registro'>('login')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit() {
    if (!email || !password) return
    setCargando(true)
    setMensaje('')

    if (modo === 'registro') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMensaje(error.message)
      else setMensaje('Revisa tu email para confirmar tu cuenta.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje(error.message)
      else window.location.href = '/'
    }
    setCargando(false)
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(circle at 16% 12%, rgba(219, 234, 254, 0.9), transparent 30%), radial-gradient(circle at 86% 8%, rgba(224, 231, 255, 0.72), transparent 28%), radial-gradient(circle at 78% 82%, rgba(186, 230, 253, 0.58), transparent 30%), linear-gradient(135deg, #fbfdff 0%, #f8fafc 48%, #eff6ff 100%)' }}>
      <style>{`
        .campus-hover,
        .campus-primary {
          transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, background 180ms ease, color 180ms ease, filter 180ms ease;
        }

        .campus-hover:hover {
          transform: translateY(-2px);
          border-color: #60a5fa !important;
          background: linear-gradient(135deg, #ffffff, #eff6ff) !important;
          color: #2563eb !important;
          box-shadow: 0 16px 34px rgba(96, 165, 250, 0.2) !important;
        }

        .campus-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: saturate(1.08) brightness(1.03);
          box-shadow: 0 20px 42px rgba(37, 99, 235, 0.22) !important;
        }

        .campus-field {
          transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }

        .campus-field:focus-within {
          border-color: #60a5fa !important;
          background: #ffffff !important;
          box-shadow: 0 14px 34px rgba(96, 165, 250, 0.15);
        }
      `}</style>
      <header className="px-6 py-4" style={{ background: 'rgba(255, 255, 255, 0.78)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(219, 231, 251, 0.95)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #1d4ed8 0%, #2563eb 54%, #38bdf8 100%)', color: '#fff', boxShadow: '0 16px 34px rgba(37, 99, 235, 0.24)' }}><GraduationCap size={23} /></div>
          <div>
            <div className="font-bold text-xl leading-none" style={{ color: config.ink }}>Pausia</div>
            <div className="text-xs mt-1" style={{ color: config.muted }}>EBAU Madrid · estudio con ritmo</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="p-8 w-full max-w-md" style={{ borderRadius: '16px', background: '#fff', boxShadow: '0 2px 8px rgba(37,99,235,0.06), 0 8px 28px rgba(37,99,235,0.08)' }}>
          <div className="w-11 h-11 flex items-center justify-center mb-5" style={{ borderRadius: '12px', background: '#eff6ff', color: config.bg }}><Sparkles size={22} /></div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: config.ink }}>
            {modo === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-sm mb-6" style={{ color: config.muted }}>
            {modo === 'login' ? 'Entra en tu cuenta de Pausia' : 'Empieza a preparar tu EBAU con Pausia'}
          </p>

          <div className="flex flex-col gap-3 mb-4">
            <div className="campus-field flex items-center gap-3 px-4 py-3" style={{ borderRadius: '10px', border: '1.5px solid #dbe7fb', background: '#fafafa' }}>
              <Mail size={17} color="#2563eb" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-sm focus:outline-none"
                style={{ background: 'transparent', color: config.ink }}
              />
            </div>
            <div className="campus-field flex items-center gap-3 px-4 py-3" style={{ borderRadius: '10px', border: '1.5px solid #dbe7fb', background: '#fafafa' }}>
              <LockKeyhole size={17} color="#1d4ed8" />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-sm focus:outline-none"
                style={{ background: 'transparent', color: config.ink }}
              />
            </div>
          </div>

          {mensaje && (
            <p className="text-sm mb-4 px-3 py-2 rounded-xl" style={{ background: config.light, color: config.bg, border: '1px solid #dbeafe' }}>
              {mensaje}
            </p>
          )}

          <button onClick={handleSubmit} disabled={cargando}
            className="campus-primary w-full py-3 font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ borderRadius: '999px', background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', boxShadow: '0 8px 20px rgba(37,99,235,0.24)' }}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'} <ArrowRight size={17} />
          </button>

          <p className="text-center text-sm mt-4" style={{ color: config.muted }}>
            {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            {' '}
            <button onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
              className="campus-hover font-bold px-2 py-1 rounded-lg" style={{ color: config.bg, border: '1px solid transparent', background: 'transparent' }}>
              {modo === 'login' ? 'Crear cuenta' : 'Entrar'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
