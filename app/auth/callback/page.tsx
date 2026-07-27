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

  useEffect(() => {
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/camino'

    if (errorParam) {
      setErrorMsg(errorDescription ?? errorParam)
      return
    }

    // After auth, always land on the canonical production domain so
    // localStorage (onboarding data) is consistent across Vercel preview and prod.
    const productionBase = process.env.NEXT_PUBLIC_APP_URL
    function redirectNext() {
      if (productionBase && window.location.origin !== productionBase) {
        window.location.replace(`${productionBase}${next}`)
      } else {
        router.replace(next)
      }
    }

    if (code) {
      // PKCE flow: exchange code for session
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('[auth/callback] exchangeCodeForSession:', error.message)
          setErrorMsg(error.message)
        } else {
          redirectNext()
        }
      })
      return
    }

    // Implicit flow: supabase-js auto-parses hash tokens before React hydrates.
    // By the time this useEffect runs, getSession() may already have the session.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        redirectNext()
        return
      }

      // Session not yet set — subscribe to auth state change as fallback
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && sess) {
          subscription.unsubscribe()
          redirectNext()
        }
      })

      const timeout = setTimeout(() => {
        subscription.unsubscribe()
        setErrorMsg('No se pudo completar el inicio de sesión. Vuelve a intentarlo.')
      }, 5000)

      return () => {
        clearTimeout(timeout)
        subscription.unsubscribe()
      }
    })
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
