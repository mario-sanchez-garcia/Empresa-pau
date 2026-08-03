'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { RankingRow } from './RankingRow'

type LigaMember = { user_id: string; name: string; weekly_xp: number; total_xp: number }
type LigaInfo = { id: string; codigo: string; nombre: string; miembros: LigaMember[] }

type GlobalEntry = { name: string; xp: number; rank: number; isCurrentUser: boolean }
type GlobalData = { entries: GlobalEntry[]; nextTarget: { name: string; xpNeeded: number } | null; activeCount: number }

function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: '48px 0' }}>
      <div style={{ width: 22, height: 22, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: 'rgba(255,255,255,0.5)', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function Hint({ xpNeeded, name }: { xpNeeded: number; name: string }) {
  return (
    <p style={{ marginTop: 14, fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>
      A <strong style={{ color: '#60a5fa' }}>{xpNeeded.toLocaleString('es-ES')} XP</strong> de adelantar a {name}
    </p>
  )
}

function PeriodToggle({ period, onChange }: { period: 'total' | 'week'; onChange: (p: 'total' | 'week') => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 3, marginBottom: 16 }}>
      {(['total', 'week'] as const).map(p => (
        <button key={p} onClick={() => onChange(p)} style={{
          padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 700,
          background: period === p ? 'rgba(255,255,255,0.14)' : 'transparent',
          color: period === p ? 'white' : 'rgba(255,255,255,0.35)',
          transition: 'background 150ms, color 150ms',
        }}>
          {p === 'total' ? 'XP total' : 'Esta semana'}
        </button>
      ))}
    </div>
  )
}

function LigaTab({ liga, onCopyInvite, copied }: { liga: LigaInfo | null | undefined; onCopyInvite: () => void; copied: boolean }) {
  const [period, setPeriod] = useState<'total' | 'week'>('total')

  if (liga === undefined) return <Loading />

  if (!liga) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>
          Únete a una liga para ver tu clasificación.
        </p>
      </div>
    )
  }

  // Re-sort and re-rank client-side based on selected period
  const ranked = [...liga.miembros]
    .sort((a, b) => period === 'total' ? b.total_xp - a.total_xp : b.weekly_xp - a.weekly_xp)
    .map((m, i) => ({ ...m, rank: i + 1, displayXp: period === 'total' ? m.total_xp : m.weekly_xp }))

  const allZero = period === 'week' && ranked.every(m => m.weekly_xp === 0)

  const myIndex = ranked.findIndex(m => m.name === 'Tú')
  const above = myIndex > 0 ? ranked[myIndex - 1] : null
  const myXp = ranked[myIndex]?.displayXp ?? 0
  const nextTarget = above && above.displayXp > myXp ? { name: above.name, xpNeeded: above.displayXp - myXp } : null

  return (
    <div>
      <PeriodToggle period={period} onChange={setPeriod} />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        {liga.nombre}
      </p>
      {allZero ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>✨</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Sé el primero en puntuar esta semana</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {ranked.map(m => (
              <RankingRow key={m.user_id} rank={m.rank} name={m.name} xp={m.displayXp} isMe={m.name === 'Tú'} theme="dark" />
            ))}
          </div>
          {nextTarget && <Hint xpNeeded={nextTarget.xpNeeded} name={nextTarget.name} />}
        </>
      )}
      <button
        onClick={onCopyInvite}
        style={{ marginTop: 20, width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#4ade80' : 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'color 200ms' }}
      >
        {copied ? '¡Enlace copiado! ✓' : '🔗 Invitar a amigos'}
      </button>
    </div>
  )
}

function GlobalTab({ data }: { data: GlobalData | null | undefined }) {
  if (data === undefined) return <Loading />

  if (!data || data.activeCount === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ fontSize: 30, marginBottom: 10 }}>🌱</p>
        <p style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Kairo acaba de empezar</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>Sé el primero en completar misiones.</p>
      </div>
    )
  }

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        {data.activeCount} alumnos · XP de la ronda actual
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {data.entries.map((e, i) => (
          <RankingRow key={i} rank={e.rank} name={e.name} xp={e.xp} isMe={e.isCurrentUser} theme="dark" />
        ))}
      </div>
      {data.nextTarget && <Hint xpNeeded={data.nextTarget.xpNeeded} name={data.nextTarget.name} />}
    </div>
  )
}

export default function FullRankingModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [tab, setTab] = useState<'liga' | 'global'>('liga')
  const [liga, setLiga] = useState<LigaInfo | null | undefined>(undefined)
  const [globalData, setGlobalData] = useState<GlobalData | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/ligas', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLiga((d.liga as LigaInfo) ?? null))
      .catch(() => setLiga(null))
  }, [token])

  useEffect(() => {
    if (tab !== 'global' || globalData !== undefined) return
    fetch('/api/ligas/global', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setGlobalData(d as GlobalData))
      .catch(() => setGlobalData(null))
  }, [tab, token, globalData])

  async function copyInvite() {
    if (!liga) return
    await navigator.clipboard.writeText(`${window.location.origin}/liga/${liga.codigo}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ background: '#0e0e14', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>Clasificación</span>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(255,255,255,0.55)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Main tabs */}
        <div style={{ padding: '14px 20px 0', display: 'flex', gap: 6, flexShrink: 0 }}>
          {(['liga', 'global'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '6px 18px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: tab === t ? 'white' : 'rgba(255,255,255,0.08)',
                color: tab === t ? '#0e0e14' : 'rgba(255,255,255,0.45)',
                transition: 'background 150ms, color 150ms',
              }}
            >
              {t === 'liga' ? 'Mi liga' : 'Global'}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 32px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {tab === 'liga'
                ? <LigaTab liga={liga} onCopyInvite={copyInvite} copied={copied} />
                : <GlobalTab data={globalData} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
