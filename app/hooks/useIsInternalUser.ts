'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

export interface InternalUserStatus {
  loading: boolean
  isInternalUser: boolean
}

const INITIAL: InternalUserStatus = { loading: true, isInternalUser: false }

export function useIsInternalUser(): InternalUserStatus {
  const [status, setStatus] = useState<InternalUserStatus>(INITIAL)

  useEffect(() => {
    let cancelled = false
    // supabase restaura el token desde localStorage de forma asíncrona, así que
    // en una pestaña recién abierta getSession() puede devolver null aunque la
    // sesión sea válida. Sin esto se resolvía a isInternalUser:false de forma
    // definitiva y el panel interno respondía "Acceso denegado" a alguien del
    // equipo hasta que recargaba. Mientras no haya sesión seguimos esperándola.
    let unsubscribe: (() => void) | null = null
    function esperarSesion() {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.access_token && !cancelled) { subscription.unsubscribe(); unsubscribe = null; void run() }
      })
      unsubscribe = () => subscription.unsubscribe()
    }
    async function run() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.access_token) {
          // Se resuelve a "no" para que quien de verdad no ha entrado vea
          // "Inicia sesión" y no un spinner eterno, pero seguimos escuchando:
          // si la sesión llega tarde, se recalcula sola.
          if (!cancelled) setStatus({ loading: false, isInternalUser: false })
          if (!cancelled && !unsubscribe) esperarSesion()
          return
        }
        const res = await fetch('/api/admin/me', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        const data = res.ok ? await res.json() : { isAdmin: false }
        if (!cancelled) setStatus({ loading: false, isInternalUser: data?.isAdmin === true })
      } catch {
        if (!cancelled) setStatus({ loading: false, isInternalUser: false })
      }
    }
    void run()
    return () => { cancelled = true; unsubscribe?.() }
  }, [])

  return status
}
