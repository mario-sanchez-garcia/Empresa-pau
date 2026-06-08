'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowRight, GraduationCap, LockKeyhole, Mail, Sparkles } from 'lucide-react'

const config = { bg: '#1e40af', light: '#fff7ed', accent: '#f59e0b', coral: '#fb7185', ink: '#172033' }

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
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #fff8f1 0%, #fff7ed 42%, #eff6ff 100%)' }}>
      <header className="px-6 py-4" style={{ background: 'rgba(255, 253, 249, 0.78)', backdropFilter: 'blur(22px)', borderBottom: '1px solid rgba(242, 228, 212, 0.9)' }}>
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(145deg, #f59e0b, #fb7185 48%, #2563eb)', color: '#fff', boxShadow: '0 16px 34px rgba(245, 158, 11, 0.28)' }}><GraduationCap size={23} /></div>
          <div>
            <div className="font-bold text-xl leading-none" style={{ color: config.ink }}>Pausia</div>
            <div className="text-xs mt-1" style={{ color: '#8a7663' }}>EBAU Madrid · estudio con ritmo</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="rounded-3xl p-8 w-full max-w-md" style={{ background: 'rgba(255, 253, 249, 0.92)', border: '1px solid #f2e4d4', boxShadow: '0 28px 70px rgba(92, 64, 35, 0.12)' }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: '#fff7ed', color: config.accent, border: '1px solid #fed7aa' }}><Sparkles size={23} /></div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: config.ink }}>
            {modo === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-sm mb-6" style={{ color: '#7c6f64' }}>
            {modo === 'login' ? 'Entra en tu cuenta de Pausia' : 'Empieza a preparar tu EBAU con Pausia'}
          </p>

          <div className="flex flex-col gap-3 mb-4">
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ border: '1.5px solid #f2e4d4', background: '#fffaf5' }}>
              <Mail size={17} color="#f59e0b" />
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full text-sm focus:outline-none"
                style={{ background: 'transparent', color: config.ink }}
              />
            </div>
            <div className="flex items-center gap-3 rounded-2xl px-4 py-3" style={{ border: '1.5px solid #f2e4d4', background: '#fffaf5' }}>
              <LockKeyhole size={17} color="#fb7185" />
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
            <p className="text-sm mb-4 px-3 py-2 rounded-xl" style={{ background: config.light, color: '#9a3412', border: '1px solid #fed7aa' }}>
              {mensaje}
            </p>
          )}

          <button onClick={handleSubmit} disabled={cargando}
            className="w-full rounded-2xl py-3 font-bold text-white disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1e40af, #f59e0b)', boxShadow: '0 18px 38px rgba(37, 99, 235, 0.2)' }}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'} <ArrowRight size={17} />
          </button>

          <p className="text-center text-sm mt-4" style={{ color: '#7c6f64' }}>
            {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            {' '}
            <button onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
              className="font-bold" style={{ color: '#1e40af' }}>
              {modo === 'login' ? 'Crear cuenta' : 'Entrar'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}
