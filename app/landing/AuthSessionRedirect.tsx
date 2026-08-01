'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase'

// Si la landing (Site URL) recibe un hash/código de sesión de Supabase —
// p.ej. porque el enlace de confirmación de email cayó aquí en vez de en
// /auth/callback por un mismatch en la lista de Redirect URLs del dashboard
// — el cliente de Supabase consume esos tokens igualmente (está montado en
// toda la app) y deja al usuario autenticado pero varado en la landing. Este
// guard detecta esa sesión y lo manda a /camino, que ya reconcilia con el
// servidor y redirige a /onboarding si no lo ha completado.
export default function AuthSessionRedirect() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled && data.session) router.replace('/camino')
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) router.replace('/camino')
    })
    return () => { cancelled = true; subscription.unsubscribe() }
  }, [router])

  return null
}
