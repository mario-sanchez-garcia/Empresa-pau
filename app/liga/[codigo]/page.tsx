'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Medal, Users, Zap } from 'lucide-react'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import { supabase } from '@/app/lib/supabase'

const bebas  = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

// Mismo lenguaje visual que la landing: foto a sangre + oscurecido + tarjeta
// negra encima. Quien llega desde un enlace de WhatsApp sin conocer Kairo ve
// lo mismo que si hubiera entrado por la home.
//
// El original (hero-student.jpg) pesa 1,5 MB a 5184px: inviable para una
// página que se abre casi siempre en móvil con datos. Estas dos versiones
// WebP son 66 KB y 26 KB; image-set deja que el navegador elija.
const BG_LARGE = '/brand/hero-student-bg.webp'
const BG_SMALL = '/brand/hero-student-bg-sm.webp'
const ORANGE = '#f97316'

type Miembro = { user_id: string; name: string; weekly_xp: number; rank: number }
type LigaPayload = {
  liga: { id?: string; codigo?: string; nombre: string; miembros?: Miembro[] }
  isMember: boolean
  isAuthenticated: boolean
  memberCount: number
}

function Fondo({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100dvh', background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', overflow: 'hidden' }}>
      <div
        aria-hidden
        className="lg-bg"
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${BG_SMALL})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'grayscale(0.35)',
        }}
      />
      <style>{`
        /* Móvil se queda con la de 900px (26 KB). Solo pantallas grandes o
           de alta densidad piden la de 1600px (66 KB). */
        @media (min-width: 760px), (min-resolution: 2dppx) {
          .lg-bg { background-image: url(${BG_LARGE}); }
        }
      `}</style>
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(13,13,13,.78) 0%, rgba(13,13,13,.88) 55%, rgba(13,13,13,.96) 100%)',
        }}
      />
      <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
        {children}
      </div>
    </div>
  )
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

  const B = bebas.style.fontFamily
  const M = dmMono.style.fontFamily

  if (loading) return (
    <Fondo>
      <p style={{ fontFamily: M, fontSize: 13, color: 'rgba(255,255,255,.45)', letterSpacing: '.08em' }}>
        Cargando liga…
      </p>
    </Fondo>
  )

  if (notFound || !data) return (
    <Fondo>
      <div style={{ textAlign: 'center', fontFamily: M }}>
        <h1 style={{ fontFamily: B, fontSize: 40, color: '#fff', letterSpacing: '.04em', margin: 0 }}>
          LIGA NO ENCONTRADA
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', margin: '10px 0 22px' }}>
          El código no existe o la liga se ha cerrado.
        </p>
        <Link href="/" style={{ fontSize: 13, color: ORANGE, fontWeight: 600, textDecoration: 'none' }}>
          ← Volver al inicio
        </Link>
      </div>
    </Fondo>
  )

  const { liga, isMember, isAuthenticated } = data
  const memberCount = data.memberCount ?? liga.miembros?.length ?? 0
  const miembros = liga.miembros ?? []

  const botonBase: React.CSSProperties = {
    display: 'block', width: '100%', textAlign: 'center',
    borderRadius: 14, background: ORANGE, color: '#0d0d0d',
    padding: '15px 18px', fontSize: 14, fontWeight: 700,
    letterSpacing: '.04em', textDecoration: 'none', border: 'none',
    fontFamily: M, cursor: 'pointer',
  }

  return (
    <Fondo>
      <style>{`
        @keyframes lg-up { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .lg-card { animation: lg-up 460ms cubic-bezier(0.22,1,0.36,1) both; }
        .lg-cta:hover { filter: brightness(1.08); }
        .lg-cta:disabled { opacity: .5; cursor: not-allowed; }
      `}</style>

      <div
        className="lg-card"
        style={{
          width: '100%', maxWidth: 440,
          borderRadius: 22,
          background: 'rgba(18,18,18,.82)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          border: '1px solid rgba(255,255,255,.10)',
          padding: 30,
          fontFamily: M,
          boxShadow: '0 30px 70px rgba(0,0,0,.55)',
        }}
      >
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
          <Users size={13} color={ORANGE} />
          <span style={{ fontSize: 10, fontWeight: 700, color: ORANGE, letterSpacing: '.2em' }}>
            LIGA KAIRO
          </span>
        </div>

        {/* Nombre de liga */}
        <h1 style={{ fontFamily: B, fontSize: 46, lineHeight: 1.02, color: '#fff', letterSpacing: '.02em', margin: 0 }}>
          {liga.nombre}
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '12px 0 22px' }}>
          <span style={{
            fontSize: 12, fontWeight: 600, color: '#fff', letterSpacing: '.16em',
            border: '1px solid rgba(249,115,22,.35)', background: 'rgba(249,115,22,.10)',
            borderRadius: 8, padding: '5px 11px',
          }}>
            {codigo?.toUpperCase()}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.40)' }}>
            {memberCount} miembro{memberCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Ranking semanal */}
        <div style={{
          borderRadius: 16, border: '1px solid rgba(255,255,255,.08)',
          background: 'rgba(255,255,255,.03)', padding: '16px 16px 14px', marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <Zap size={12} color={ORANGE} />
            <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.55)', letterSpacing: '.16em' }}>
              RANKING SEMANAL
            </span>
          </div>

          {!isMember ? (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6 }}>
              Únete a la liga para ver quién va ganando esta semana.
            </p>
          ) : miembros.length === 0 ? (
            <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
              Sin actividad esta semana. Sé el primero.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 6 }}>
              {miembros.map(m => {
                const esTu = m.name === 'Tú'
                const podio = m.rank <= 3
                return (
                  <div key={m.user_id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                    borderRadius: 11, padding: '10px 12px',
                    background: esTu ? 'rgba(249,115,22,.12)' : 'rgba(255,255,255,.03)',
                    border: esTu ? '1px solid rgba(249,115,22,.30)' : '1px solid rgba(255,255,255,.05)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                        background: podio ? 'rgba(249,115,22,.16)' : 'rgba(255,255,255,.05)',
                        color: podio ? ORANGE : 'rgba(255,255,255,.40)',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {podio ? <Medal size={12} /> : m.rank}
                      </span>
                      <span style={{
                        fontSize: 13, fontWeight: 500,
                        color: esTu ? '#fff' : 'rgba(255,255,255,.75)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {m.name}
                      </span>
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, flexShrink: 0,
                      color: esTu ? ORANGE : 'rgba(255,255,255,.55)',
                    }}>
                      {m.weekly_xp} XP
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* CTA */}
        {isMember ? (
          <a href="/camino" className="lg-cta" style={botonBase}>
            Ir a mi Camino →
          </a>
        ) : isAuthenticated ? (
          <button onClick={handleJoin} disabled={joining} className="lg-cta" style={botonBase}>
            {joining ? 'Uniéndote…' : 'Unirme a esta liga'}
          </button>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            <a href="/login" className="lg-cta" style={botonBase}>
              Crear cuenta y unirme
            </a>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,.35)', margin: 0 }}>
              ¿Ya tienes cuenta?{' '}
              <a href="/login" style={{ color: 'rgba(255,255,255,.70)', fontWeight: 500 }}>Inicia sesión</a>
            </p>
          </div>
        )}

        {joinError && (
          <p style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: '#f87171' }}>
            {joinError}
          </p>
        )}
      </div>
    </Fondo>
  )
}
