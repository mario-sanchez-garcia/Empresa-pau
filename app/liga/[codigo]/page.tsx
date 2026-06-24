'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Medal, Users, Zap } from 'lucide-react'
import { supabase } from '@/app/lib/supabase'

type Miembro = { user_id: string; name: string; weekly_xp: number; rank: number }
type LigaPayload = {
  liga: { id: string; codigo: string; nombre: string; miembros: Miembro[] }
  isMember: boolean
  isAuthenticated: boolean
  memberCount: number
}

export default function LigaPublicPage() {
  const { codigo } = useParams<{ codigo: string }>()
  const router = useRouter()
  const [data, setData] = useState<LigaPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [joining, setJoining] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    if (!codigo) return
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const headers: Record<string, string> = {}
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`
      const res = await fetch(`/api/ligas/${codigo.toUpperCase()}`, { headers })
      if (!res.ok) { setNotFound(true); setLoading(false); return }
      setData(await res.json())
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [codigo])

  async function handleJoin() {
    setJoining(true)
    setJoinError(null)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/login'); return }
    const res = await fetch('/api/ligas/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ codigo: codigo?.toUpperCase() }),
    })
    const json = await res.json()
    if (!res.ok) { setJoinError(json.error ?? 'Error al unirse'); setJoining(false); return }
    router.push('/camino')
  }

  if (loading) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fb' }}>
      <p style={{ color: '#94a3b8', fontWeight: 700 }}>Cargando liga…</p>
    </div>
  )

  if (notFound || !data) return (
    <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f7fb' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#ef4444', fontWeight: 800, fontSize: 16 }}>Liga no encontrada</p>
        <a href="/" style={{ marginTop: 12, display: 'inline-block', color: '#2563eb', fontWeight: 700, fontSize: 14 }}>Volver al inicio</a>
      </div>
    </div>
  )

  const { liga, isMember, isAuthenticated } = data

  return (
    <div style={{ minHeight: '100dvh', background: '#f4f7fb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{
        width: '100%', maxWidth: 480, borderRadius: 28, background: '#fff',
        padding: 32, boxShadow: '0 18px 45px rgba(37,99,235,0.10)',
        border: '1.5px solid rgba(219,231,248,0.85)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <Users size={14} color="#2563eb" />
          <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#2563eb', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Liga Pausia</p>
        </div>
        <h1 style={{ margin: '4px 0 4px', fontSize: 24, fontWeight: 900, color: '#111827', letterSpacing: '-0.025em' }}>{liga.nombre}</h1>
        <p style={{ margin: '0 0 20px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>
          Código: {liga.codigo} · {liga.miembros.length} miembro{liga.miembros.length !== 1 ? 's' : ''}
        </p>

        {/* Ranking semanal */}
        <div style={{ borderRadius: 18, background: '#f8fbff', border: '1.5px solid rgba(219,231,248,0.7)', padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Zap size={12} color="#2563eb" />
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: '#2563eb', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Ranking semanal
            </p>
          </div>
          {liga.miembros.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Sin actividad esta semana.</p>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {liga.miembros.map(m => (
                <div key={m.user_id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                  borderRadius: 12, padding: '8px 12px',
                  background: m.name === 'Tú' ? '#eff6ff' : '#fff',
                  border: m.name === 'Tú' ? '1px solid #bfdbfe' : '1px solid #f1f5f9',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                      background: m.rank <= 3 ? '#eff6ff' : '#f1f5f9',
                      fontSize: 10, fontWeight: 900,
                      color: m.rank <= 3 ? '#1d4ed8' : '#64748b',
                    }}>
                      {m.rank <= 3 ? <Medal size={12} /> : `${m.rank}`}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>{m.name}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8', flexShrink: 0 }}>
                    {m.weekly_xp} XP
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        {isMember ? (
          <a href="/camino" style={{
            display: 'block', textAlign: 'center', borderRadius: 16,
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
            padding: 14, fontSize: 14, fontWeight: 900, textDecoration: 'none',
          }}>
            Ir a Camino PAU
          </a>
        ) : isAuthenticated ? (
          <button onClick={handleJoin} disabled={joining} style={{
            width: '100%', borderRadius: 16,
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
            padding: 14, fontSize: 14, fontWeight: 900, border: 'none',
            cursor: joining ? 'not-allowed' : 'pointer', opacity: joining ? 0.7 : 1,
          }}>
            {joining ? 'Uniéndote…' : 'Unirme a esta liga'}
          </button>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            <a href="/login" style={{
              display: 'block', textAlign: 'center', borderRadius: 16,
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)', color: '#fff',
              padding: 14, fontSize: 14, fontWeight: 900, textDecoration: 'none',
            }}>
              Regístrate para unirte
            </a>
            <p style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', fontWeight: 600, margin: 0 }}>
              ¿Ya tienes cuenta?{' '}
              <a href="/login" style={{ color: '#2563eb', fontWeight: 700 }}>Inicia sesión</a>
            </p>
          </div>
        )}

        {joinError && (
          <p style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>
            {joinError}
          </p>
        )}
      </div>
    </div>
  )
}
