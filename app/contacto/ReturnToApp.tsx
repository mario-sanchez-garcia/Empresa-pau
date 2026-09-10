'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

// Contacto es la misma ruta publica para un visitante de la landing y para
// un alumno logueado que llega desde Ayuda (app/ayuda/page.tsx) — antes no
// habia ninguna forma de volver a la app desde aqui, solo el nav/footer de
// paginas legales. Este componente comprueba sesion en el cliente (la
// pagina en si sigue siendo un Server Component estatico) y solo se
// renderiza algo si hay alguien logueado.
export default function ReturnToApp({ variant = 'banner' }: { variant?: 'banner' | 'inline' }) {
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let cancelled = false
    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) setAuthenticated(Boolean(data.session))
    })
    return () => { cancelled = true }
  }, [])

  if (!authenticated) return null

  if (variant === 'inline') {
    return (
      <Link
        href="/camino"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14, color: '#60a5fa', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}
      >
        <ArrowLeft size={14} /> Volver a Camino PAU
      </Link>
    )
  }

  return (
    <Link
      href="/camino"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
        padding: '8px 14px', borderRadius: 999,
        background: 'rgba(37,99,235,.14)', border: '1px solid rgba(96,165,250,.3)',
        color: '#93c5fd', fontSize: 12, fontWeight: 700, textDecoration: 'none',
      }}
    >
      <ArrowLeft size={14} /> Volver a Camino PAU
    </Link>
  )
}
