'use client'

// El proyecto no usa @supabase/ssr — la sesión OAuth se gestiona con el
// cliente browser (supabase-js) que tiene acceso a localStorage donde se
// guarda el code_verifier del flujo PKCE. Un Route Handler de servidor no
// tiene acceso a localStorage, por eso el intercambio de código se hace aquí,
// en una página cliente.

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState('')
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/camino'
    const allParams = Object.fromEntries(searchParams.entries())
    const hash = window.location.hash

    // Show debug info for 3 seconds so we can see what Supabase is sending
    setDebugInfo(JSON.stringify({ url: window.location.href, params: allParams, hash: hash || '(none)' }, null, 2))

    const proceed = () => {
      setDebugInfo(null)

      // OAuth provider returned an error
      if (errorParam) {
        console.error('[auth/callback] provider error:', errorParam, errorDescription)
        setErrorMsg(errorDescription ?? errorParam)
        return
      }

      if (code) {
        // PKCE flow: exchange code for session
        supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
          if (error) {
            console.error('[auth/callback] exchangeCodeForSession:', error.message)
            setErrorMsg(error.message)
          } else {
            router.replace(next)
          }
        })
        return
      }

      // No code and no error — check if supabase already set session from URL hash (implicit flow)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
          subscription.unsubscribe()
          router.replace(next)
        }
      })

      const timeout = setTimeout(() => {
        subscription.unsubscribe()
        setErrorMsg('No se recibió código. Params: ' + JSON.stringify(allParams))
      }, 4000)

      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    }

    const debugTimer = setTimeout(proceed, 3000)
    return () => clearTimeout(debugTimer)
  }, [router, searchParams])

  if (errorMsg) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
        background: '#0d0d0d',
        padding: 24,
        gap: 16,
      }}>
        <div style={{ color: '#f87171', fontSize: 14, maxWidth: 400, textAlign: 'center', lineHeight: 1.6 }}>
          Error al iniciar sesión: {errorMsg}
        </div>
        <button
          onClick={() => router.replace('/login')}
          style={{ padding: '10px 24px', background: '#fff', color: '#0d0d0d', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
        >
          Volver al login
        </button>
      </div>
    )
  }

  if (debugInfo) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d0d', padding: 24, fontFamily: 'monospace', color: '#94a3b8', fontSize: 12 }}>
        <div style={{ color: '#60a5fa', marginBottom: 8, fontSize: 14, fontWeight: 700 }}>DEBUG — Callback recibido</div>
        <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{debugInfo}</pre>
        <div style={{ marginTop: 16, color: '#475569' }}>Continuando en 3s…</div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif',
      background: '#0d0d0d',
      color: '#64748b',
      fontSize: 15,
    }}>
      Iniciando sesión…
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  )
}
