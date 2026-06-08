'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart3,
  BrainCircuit,
  ClipboardList,
  GraduationCap,
  LogOut,
  MessageCircle,
  Rocket,
  Sparkles,
  Zap
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase'
import Flashcards from '@/components/zona/Flashcards'
import type { Flashcard, ZonaUser } from '@/components/zona/types'

const ZONA = '#7C3AED'

const WARM = {
  ink: '#172033',
  muted: '#7c6f64',
  softText: '#a5917d',
  surface: '#fffdf9',
  field: '#fffaf5',
  border: '#f2e4d4',
  wash: '#fff7ed',
  amber: '#f59e0b',
  blue: '#2563eb',
  shadow: '0 22px 60px rgba(92, 64, 35, 0.10)'
}

export default function ZonaPage() {
  const [user, setUser] = useState<ZonaUser | null>(null)
  const [cards, setCards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.push('/login')
        return
      }
      const nextUser = { id: data.user.id, email: data.user.email }
      setUser(nextUser)
      const { data: flashcards } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', data.user.id)
        .order('created_at', { ascending: false })

      setCards((flashcards ?? []) as Flashcard[])
      setLoading(false)
    }

    load()
  }, [router])

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading || !user) {
    return (
      <div className="zona-root zona-center">
        <div style={{ textAlign: 'center' }}>
          <div className="zona-logo"><Zap size={28} /></div>
          <p style={{ color: WARM.muted, fontWeight: 800 }}>Cargando La Zona...</p>
        </div>
        <ZonaStyles />
      </div>
    )
  }

  return (
    <div className="zona-root">
      <aside className="zona-sidebar">
        <div style={{ padding: '26px 22px 22px', borderBottom: '1px solid rgba(242,228,212,0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: 'linear-gradient(145deg, #f59e0b 0%, #fb7185 45%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 14px 30px rgba(245, 158, 11, 0.28), inset 0 1px 0 rgba(255,255,255,0.35)' }}>
              <GraduationCap size={23} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ color: WARM.ink, fontWeight: 760, fontSize: 18 }}>Pausia</div>
              <div style={{ color: WARM.muted, fontSize: 11, marginTop: 2 }}>EBAU Madrid · practica mejor</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: '18px 14px', flex: 1 }}>
          <div className="zona-nav-title">Navegacion</div>
          <a className="zona-nav-item" href="/">
            <span className="zona-nav-icon"><ClipboardList size={17} /></span>
            <span><strong>Examenes</strong><small>Practica y corrige</small></span>
          </a>
          <div className="zona-nav-item zona-active">
            <span className="zona-nav-icon zona-active-icon"><BrainCircuit size={17} /></span>
            <span><strong>La Zona</strong><small>Estudia a tu manera</small></span>
          </div>
          <a className="zona-nav-item" href="/">
            <span className="zona-nav-icon"><MessageCircle size={17} /></span>
            <span><strong>Chat con Pausia</strong><small>Resuelve dudas</small></span>
          </a>
          <a className="zona-nav-item" href="/">
            <span className="zona-nav-icon"><BarChart3 size={17} /></span>
            <span><strong>Historial</strong><small>Tus correcciones</small></span>
          </a>
          <a className="zona-nav-item" href="/planning">
            <span className="zona-nav-icon"><Rocket size={17} /></span>
            <span><strong>Planning</strong><small>Tareas completables</small></span>
          </a>
        </nav>

        <div style={{ padding: 16, borderTop: '1px solid rgba(242,228,212,0.9)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f5f3ff', border: '1px solid #ddd6fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: ZONA, fontSize: 13, fontWeight: 800 }}>{user.email?.[0]?.toUpperCase()}</div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: WARM.ink, fontSize: 13, fontWeight: 650, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
              <div style={{ color: WARM.softText, fontSize: 11 }}>Estudiante</div>
            </div>
          </div>
          <button onClick={cerrarSesion} style={{ width: '100%', padding: '10px 12px', borderRadius: 14, background: WARM.surface, border: '1px solid #fee2e2', color: '#dc2626', fontSize: 12, cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 22px rgba(92,64,35,0.05)' }}>
            <LogOut size={15} />Cerrar sesion
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minHeight: '100vh' }}>
        <header className="zona-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 16, background: '#f5f3ff', color: ZONA, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ddd6fe' }}>
              <BrainCircuit size={22} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: WARM.ink }}>La Zona</h1>
              <p style={{ margin: '3px 0 0', fontSize: 13, color: WARM.softText }}>Estudia a tu manera</p>
            </div>
          </div>
          <div className="zona-tab">
            <Sparkles size={15} /> Flashcards
          </div>
        </header>

        <main className="zona-main">
          <Flashcards userId={user.id} initialCards={cards} />
        </main>
      </div>

      <ZonaStyles />
    </div>
  )
}

function ZonaStyles() {
  return (
    <style jsx global>{`
      .zona-root {
        display: flex;
        min-height: 100vh;
        background: linear-gradient(135deg, #fff8f1 0%, #fff7ed 34%, #eef6ff 70%, #f7fff8 100%);
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif;
      }
      .zona-center {
        align-items: center;
        justify-content: center;
      }
      .zona-logo {
        width: 58px;
        height: 58px;
        border-radius: 21px;
        background: linear-gradient(145deg, #7C3AED, #a855f7);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 14px;
        box-shadow: 0 18px 38px rgba(124, 58, 237, 0.24);
      }
      .zona-sidebar {
        width: 282px;
        min-height: 100vh;
        background: rgba(255, 253, 249, 0.84);
        backdrop-filter: blur(24px);
        display: flex;
        flex-direction: column;
        position: sticky;
        top: 0;
        flex-shrink: 0;
        border-right: 1px solid rgba(242, 228, 212, 0.92);
        box-shadow: 18px 0 55px rgba(92, 64, 35, 0.08);
      }
      .zona-nav-title {
        color: #a5917d;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        padding: 0 10px;
        margin-bottom: 10px;
      }
      .zona-nav-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 13px;
        border-radius: 16px;
        border: 1px solid transparent;
        margin-bottom: 6px;
        text-align: left;
        background: transparent;
        color: #7c6f64;
        text-decoration: none;
        box-sizing: border-box;
      }
      .zona-nav-item strong {
        display: block;
        color: inherit;
        font-size: 14px;
      }
      .zona-nav-item small {
        display: block;
        color: #a5917d;
        font-size: 11px;
        margin-top: 2px;
      }
      .zona-active {
        background: linear-gradient(135deg, #fffdf9, #f5f3ff);
        border-color: #ddd6fe;
        color: #7C3AED;
        box-shadow: 0 12px 28px rgba(92, 64, 35, 0.08);
      }
      .zona-nav-icon {
        width: 34px;
        height: 34px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7c6f64;
        background: #fffaf5;
        border: 1px solid #f2e4d4;
        flex-shrink: 0;
      }
      .zona-active-icon {
        color: #7C3AED;
        background: #f5f3ff;
        border-color: #ddd6fe;
      }
      .zona-header {
        height: 78px;
        padding: 0 34px;
        background: rgba(255,253,249,.78);
        backdrop-filter: blur(22px);
        border-bottom: 1px solid rgba(242,228,212,.9);
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .zona-tab {
        padding: 9px 15px;
        border-radius: 999px;
        color: #fff;
        background: linear-gradient(135deg, #7C3AED, #a855f7);
        font-size: 13px;
        font-weight: 850;
        display: flex;
        align-items: center;
        gap: 7px;
        box-shadow: 0 12px 24px rgba(124,58,237,.22);
      }
      .zona-main {
        width: 100%;
        max-width: 1120px;
        margin: 0 auto;
        padding: 28px 32px;
        box-sizing: border-box;
      }
      @media (max-width: 920px) {
        .zona-root {
          display: block;
        }
        .zona-sidebar {
          width: 100%;
          min-height: auto;
          position: relative;
        }
        .zona-header {
          height: auto;
          padding: 18px;
          align-items: flex-start;
          gap: 14px;
        }
        .zona-main {
          padding: 18px;
        }
        .zona-main section {
          grid-template-columns: 1fr !important;
        }
      }
    `}</style>
  )
}
