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
import { resolvePostAuthDestination } from '@/app/lib/onboarding/postAuthDestination'
import { loadLocalDraft, setLocalDraftId } from '@/app/lib/onboarding/onboardingDraftStorage'
import { sendOnboardingEvent, flushQueuedOnboardingEvents } from '@/app/lib/onboarding/onboardingEvents'
import { SUPPORT_EMAIL } from '@/app/lib/support'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMsg, setErrorMsg] = useState('')
  const [expiredEmailLink, setExpiredEmailLink] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const hashParams = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.hash.replace(/^#/, ''))
      : new URLSearchParams()
    const errorParam = searchParams.get('error') ?? hashParams.get('error')
    const errorCode = searchParams.get('error_code') ?? hashParams.get('error_code')
    const errorDescription = searchParams.get('error_description') ?? hashParams.get('error_description')
    const next = searchParams.get('next') ?? '/camino'
    // Fase 2 (signup al final): presencia de `draft` = este login viene del
    // onboarding anónimo (Google o email) y debe reclamar el server draft
    // antes de seguir — ver POST /api/onboarding/draft/claim.
    const draftId = searchParams.get('draft')
    const signupMethod = searchParams.get('method') === 'google' ? 'google' as const : searchParams.get('method') === 'email' ? 'email' as const : null

    if (errorParam) {
      const description = errorDescription ?? errorParam
      const isExpiredEmailLink =
        errorCode === 'otp_expired' ||
        /email link is invalid|expired|otp/i.test(description)

      queueMicrotask(() => {
        setExpiredEmailLink(isExpiredEmailLink)
        setErrorMsg(isExpiredEmailLink
          ? 'El enlace de confirmación ha caducado o ya se ha usado. Pide un correo nuevo para continuar.'
          : 'No se pudo completar el inicio de sesión. Vuelve a intentarlo.')
      })
      return
    }

    // After auth, always land on the canonical production domain so
    // localStorage (onboarding data) is consistent across Vercel preview and prod.
    const productionBase = process.env.NEXT_PUBLIC_APP_URL

    // `keepLocalOnboarding` conserva las respuestas locales del alumno. Solo
    // se usa cuando volvemos a /onboarding por un claim fallido: en ese caso
    // son lo único que le evita repetir las once preguntas por un fallo de
    // infraestructura que no es suyo.
    function go(target: string, keepLocalOnboarding = false) {
      // El navegador puede tener onboarding local de otra cuenta (misma
      // máquina, distinta sesión); se descarta aquí para que la página de
      // destino reconcilie con el servidor de la cuenta que acaba de entrar.
      if (!keepLocalOnboarding) clearOnboarding()
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
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        // Sin token no se puede reclamar nada. Con draft, el destino seguro es
        // el onboarding —igual que antes de extraer este helper—; nunca
        // /onboarding/finalizando, que sin draft ni sesión solo sabe enseñar
        // su pantalla de error.
        if (draftId) { go('/onboarding', true); return }
        go(next)
        return
      }

      // La secuencia "reclama el draft, luego decide destino" vive en
      // postAuthDestination.ts porque ahora hay DOS entradas a este mismo
      // punto: este callback (Google, y el enlace de email de respaldo) y la
      // pantalla de verificación por código. Duplicarla es la forma más
      // directa de que una de las dos pierda el draft del alumno.
      const { destination, draftClaimed } = await resolvePostAuthDestination(draftId, {
        claimDraft: async id => {
          const res = await fetch('/api/onboarding/draft/claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ draft_id: id }),
          })
          return res.ok
        },
        fetchOnboardingMe: async () => {
          const res = await fetch('/api/onboarding/me', { headers: { Authorization: `Bearer ${token}` } })
          return res.ok ? await res.json() : null
        },
      }, next)

      if (draftClaimed && draftId) {
        setLocalDraftId(draftId)
        const traceId = loadLocalDraft()?.traceId ?? null
        if (signupMethod === 'email') {
          void sendOnboardingEvent(traceId, 'email_confirmation_completed', {})
        }
        void sendOnboardingEvent(traceId, 'onboarding_signup_completed', signupMethod ? { method: signupMethod } : {})
      }
      void flushQueuedOnboardingEvents(token)
      // Mismo criterio que en /verificar-email: un claim fallido conserva las
      // respuestas locales.
      go(destination, Boolean(draftId) && !draftClaimed)
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
        <div style={{ color: '#f87171', fontSize: 14, maxWidth: 440, textAlign: 'center', lineHeight: 1.6 }}>
          {expiredEmailLink ? errorMsg : `Error al iniciar sesión: ${errorMsg}`}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {expiredEmailLink && (
            <button
              onClick={() => router.replace('/confirmar-email?expired=1')}
              style={{ padding: '10px 24px', background: '#fff', color: '#0d0d0d', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
            >
              Reenviar correo
            </button>
          )}
          <button
            onClick={() => router.replace('/login')}
            style={{ padding: '10px 24px', background: expiredEmailLink ? 'transparent' : '#fff', color: expiredEmailLink ? '#fff' : '#0d0d0d', border: expiredEmailLink ? '1px solid rgba(255,255,255,0.24)' : 'none', borderRadius: 8, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
          >
            Volver al login
          </button>
        </div>
        <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: '#94a3b8', fontSize: 12 }}>¿Sigue sin funcionar? Escríbenos a soporte</a>
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
