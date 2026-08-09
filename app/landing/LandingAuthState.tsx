'use client'

// Estado de sesión/onboarding para las CTAs de la landing (ver AGENTS.md /
// plan de auth-ux): un visitante anónimo, uno con sesión y onboarding
// completo, y uno con sesión y onboarding incompleto (con o sin borrador
// server-side) deben ver CTAs distintas sin que la landing les haga
// recorrer preguntas ya respondidas ni les pida iniciar sesión de nuevo.
//
// Se mantiene, además, el workaround original de AuthSessionRedirect: si el
// enlace de confirmación de email cae aquí en vez de en /auth/callback (por
// un mismatch en las Redirect URLs de Supabase), el cliente igual consume
// los tokens de la URL y el usuario queda autenticado pero varado en la
// landing — en ESE caso concreto (hay `code` o tokens de hash sin consumir
// en la URL) sí forzamos la redirección, porque el visitante nunca quiso
// aterrizar en la landing. Una visita normal de un usuario ya logueado NO se
// redirige automáticamente: se queda viendo la landing con la CTA ajustada.

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'
import { resolveOnboardingDestination } from '@/app/lib/onboarding/resolveOnboardingDestination'

type LandingAuthStatus = 'loading' | 'anon' | 'authed'

interface LandingAuthValue {
  status: LandingAuthStatus
  href: string
  label: string
}

const DEFAULT_VALUE: LandingAuthValue = { status: 'loading', href: '/onboarding', label: 'Empieza gratis' }

const LandingAuthContext = createContext<LandingAuthValue>(DEFAULT_VALUE)

export function useLandingAuth() {
  return useContext(LandingAuthContext)
}

function labelFor(dest: string): string {
  if (dest === '/camino') return 'Ir a mi Camino'
  return 'Continuar'
}

function hasUnconsumedAuthParams() {
  if (typeof window === 'undefined') return false
  const search = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  return Boolean(search.get('code') || hash.get('access_token'))
}

export default function LandingAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [value, setValue] = useState<LandingAuthValue>(DEFAULT_VALUE)

  useEffect(() => {
    let cancelled = false

    async function resolve(token: string) {
      let dest = '/camino'
      try {
        const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } })
        if (res.ok) dest = resolveOnboardingDestination(await res.json())
      } catch {
        // Falla abierta: mantener el destino por defecto (/camino), que a su
        // vez ya sabe rebotar a /onboarding si hace falta.
      }
      if (cancelled) return
      if (hasUnconsumedAuthParams()) { router.replace(dest); return }
      setValue({ status: 'authed', href: dest, label: labelFor(dest) })
    }

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      const token = data.session?.access_token
      if (token) resolve(token)
      else setValue({ status: 'anon', href: '/onboarding', label: 'Empieza gratis' })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.access_token) {
        resolve(session.access_token)
      }
    })

    return () => { cancelled = true; subscription.unsubscribe() }
  }, [router])

  return <LandingAuthContext.Provider value={value}>{children}</LandingAuthContext.Provider>
}
