'use client'

// El proyecto no usa @supabase/ssr — la sesión OAuth se gestiona con el
// cliente browser (supabase-js) que tiene acceso a localStorage donde se
// guarda el code_verifier del flujo PKCE. Un Route Handler de servidor no
// tiene acceso a localStorage, por eso el intercambio de código se hace aquí,
// en una página cliente.

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { clearOnboarding } from '@/app/lib/onboarding/onboardingStorage'

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

    function go(target: string) {
      // El navegador puede tener onboarding local de otra cuenta (misma
      // máquina, distinta sesión); se descarta aquí para que la página de
      // destino reconcilie con el servidor de la cuenta que acaba de entrar.
      clearOnboarding()
      if (productionBase && window.location.origin !== productionBase) {
        window.location.replace(`${productionBase}${target}`)
      } else {
        router.replace(target)
      }
    }

    // El destino se decide aquí en vez de confiar en `next`. Dos motivos:
    //  1. Supabase no siempre conserva los query params en el redirect de
    //     confirmación de email, así que `next` puede caer a /camino.
    //  2. Un usuario nuevo de Google tampoco ha hecho onboarding.
    // En ambos casos /camino se montaría, vería que falta onboarding y
    // rebotaría a /onboarding — el parpadeo visible.
    //
    // Se consulta /api/onboarding/me, que es la MISMA fuente que usa
    // CaminoCalendarClient para calcular hasProfile (el estado vive en
    // billing_events, no en perfiles; billing_events tiene RLS sin políticas
    // y solo es legible por el service role, de ahí que haya que ir por la
    // API y no por supabase-js directamente).
    async function redirectNext() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (token) {
          const res = await fetch('/api/onboarding/me', {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (res.ok) {
            const { onboarding } = await res.json()
            // Mismo criterio que hasProfile en CaminoCalendarClient.
            const completo = Boolean(
              onboarding?.completedAt &&
              onboarding?.community &&
              onboarding?.subjects?.length
            )
            if (!completo) {
              go('/onboarding')
              return
            }
          }
        }
      } catch {
        // Nunca bloquear el login por esta comprobación.
      }
      go(next)
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
