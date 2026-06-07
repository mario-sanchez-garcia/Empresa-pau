'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

const config = { bg: '#1e3a5f', light: '#dbeafe', accent: '#3b82f6' }

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
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f4f8' }}>
      <header style={{ background: config.bg }} className="px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }}>P</div>
          <div>
            <div className="font-bold text-white text-xl leading-none">Pausia</div>
            <div className="text-xs mt-1" style={{ color: '#93c5fd' }}>Tu academia IA para la EBAU</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md" style={{ border: '1px solid #e5e7eb' }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {modo === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            {modo === 'login' ? 'Entra en tu cuenta de Pausia' : 'Empieza a preparar tu EBAU con IA'}
          </p>

          <div className="flex flex-col gap-3 mb-4">
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ border: '1.5px solid #e5e7eb', background: '#fafafa' }}
              onFocus={e => e.target.style.border = `1.5px solid ${config.accent}`}
              onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none"
              style={{ border: '1.5px solid #e5e7eb', background: '#fafafa' }}
              onFocus={e => e.target.style.border = `1.5px solid ${config.accent}`}
              onBlur={e => e.target.style.border = '1.5px solid #e5e7eb'}
            />
          </div>

          {mensaje && (
            <p className="text-sm mb-4 px-3 py-2 rounded-lg" style={{ background: config.light, color: config.bg }}>
              {mensaje}
            </p>
          )}

          <button onClick={handleSubmit} disabled={cargando}
            className="w-full rounded-xl py-3 font-bold text-white disabled:opacity-50"
            style={{ background: config.bg }}>
            {cargando ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Crear cuenta'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            {modo === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            {' '}
            <button onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
              className="font-semibold" style={{ color: config.accent }}>
              {modo === 'login' ? 'Crear cuenta' : 'Entrar'}
            </button>
          </p>
        </div>
      </main>
    </div>
  )
}