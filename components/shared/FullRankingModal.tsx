'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { RankingRow } from './RankingRow'

type LigaMember = { user_id: string; name: string; weekly_xp: number; total_xp: number }
type LigaInfo = { id: string; codigo: string; nombre: string; miembros: LigaMember[] }

type GlobalEntry = { name: string; xp: number; rank: number; isCurrentUser: boolean }
type GlobalData = { entries: GlobalEntry[]; nextTarget: { name: string; xpNeeded: number } | null; activeCount: number; myRank: number }
type GlobalPeriod = 'total' | 'month' | 'week'

// Con menos alumnos que esto, un porcentaje ("top 18%") no significa nada
// de fiar — mismo problema que el "Percentil P50" del historial con pocos
// datos: el alumno se lo cree igual aunque la muestra sea minúscula.
const MIN_PARTICIPANTS_FOR_PERCENTILE = 50
// Por debajo de esto, una tabla de ranking con 2-4 filas no transmite "esto
// es un ranking" — mejor explicar qué se verá cuando haya más gente que
// enseñar una tabla que parece vacía o rota.
const MIN_PARTICIPANTS_FOR_TABLE = 5

type Medal = 'oro' | 'plata' | 'bronce'
type PastRound = { periodStart: string; periodEnd: string; scopeType: string; label: string; roundXp: number; rank: number; medal: Medal | null }
type TemporadasData = {
  medals: Record<Medal, number>
  currentRoundXp: number
  currentRoundRange: { start: string; end: string }
  currentRank: number | null
  currentTotalParticipants: number
  currentMedal: Medal | null
  daysRemaining: number
  pastRounds: PastRound[]
}
const MEDAL_EMOJI: Record<Medal, string> = { oro: '🥇', plata: '🥈', bronce: '🥉' }

function formatMonthLabel(dateISO: string): string {
  const d = new Date(dateISO + 'T12:00:00Z')
  const label = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

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

function PeriodToggle<T extends string>({ period, options, onChange }: { period: T; options: { value: T; label: string }[]; onChange: (p: T) => void }) {
  return (
    <div style={{ display: 'inline-flex', gap: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 999, padding: 3, marginBottom: 16 }}>
      {options.map(opt => (
        <button key={opt.value} onClick={() => onChange(opt.value)} style={{
          padding: '5px 14px', borderRadius: 999, border: 'none', cursor: 'pointer',
          fontSize: 11, fontWeight: 700,
          background: period === opt.value ? 'rgba(255,255,255,0.14)' : 'transparent',
          color: period === opt.value ? 'white' : 'rgba(255,255,255,0.35)',
          transition: 'background 150ms, color 150ms',
        }}>
          {opt.label}
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

  if (liga.miembros.length <= 1) {
    return (
      <div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
          {liga.nombre}
        </p>
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>👋</p>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Todavía estás solo aquí</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>Invita a amigos con tu enlace y en cuanto se unan verás aquí quién va primero cada semana.</p>
        </div>
        <button
          onClick={onCopyInvite}
          style={{ marginTop: 8, width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: copied ? '#4ade80' : 'rgba(255,255,255,0.65)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'color 200ms' }}
        >
          {copied ? '¡Enlace copiado! ✓' : '🔗 Invitar a amigos'}
        </button>
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
      <PeriodToggle period={period} options={[{ value: 'total', label: 'XP total' }, { value: 'week', label: 'Esta semana' }]} onChange={setPeriod} />
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

function GlobalTab({ token }: { token: string }) {
  const [period, setPeriod] = useState<GlobalPeriod>('total')
  const [dataByPeriod, setDataByPeriod] = useState<Record<GlobalPeriod, GlobalData | null | undefined>>({ total: undefined, month: undefined, week: undefined })

  useEffect(() => {
    if (dataByPeriod[period] !== undefined) return
    fetch(`/api/ligas/global?period=${period}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setDataByPeriod(prev => ({ ...prev, [period]: d as GlobalData })))
      .catch(() => setDataByPeriod(prev => ({ ...prev, [period]: null })))
  }, [period, token, dataByPeriod])

  const data = dataByPeriod[period]

  const PERIOD_LABELS: Record<GlobalPeriod, string> = { total: 'XP de siempre', month: 'XP de este mes', week: 'XP de esta semana' }
  // El toggle cambia qué XP se suma para ordenar, no cambia qué es "tu
  // posición": en Mes/Semana el ranking es por XP ganado en ese periodo, no
  // por tu puesto histórico — vale la pena decirlo explícito, porque el
  // toggle de al lado invita a leerlo como "tu posición esta semana".
  const PERIOD_CLARIFICATION: Record<GlobalPeriod, string | null> = {
    total: null,
    month: 'Ordenado por XP ganado este mes, no por tu posición histórica.',
    week: 'Ordenado por XP ganado esta semana, no por tu posición histórica.',
  }
  const percentile = data && data.activeCount >= MIN_PARTICIPANTS_FOR_PERCENTILE
    ? Math.max(1, Math.round((data.myRank / data.activeCount) * 100))
    : null

  return (
    <div>
      <PeriodToggle period={period} options={[{ value: 'total', label: 'Total' }, { value: 'month', label: 'Mes' }, { value: 'week', label: 'Semana' }]} onChange={setPeriod} />
      {data === undefined ? <Loading /> : !data || data.activeCount === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 0' }}>
          <p style={{ fontSize: 30, marginBottom: 10 }}>🌱</p>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Kairo acaba de empezar</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>Sé el primero en completar misiones. En cuanto haya más alumnos, aquí verás el ranking completo.</p>
        </div>
      ) : data.activeCount < MIN_PARTICIPANTS_FOR_TABLE ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 28, marginBottom: 10 }}>🌱</p>
          <p style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Todavía sois pocos</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>
            Ahora mismo hay {data.activeCount} alumno{data.activeCount === 1 ? '' : 's'} con {PERIOD_LABELS[period].toLowerCase()}. Cuando se una más gente, aquí verás el ranking completo con tu puesto entre todos.
          </p>
        </div>
      ) : (
        <>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
            {data.activeCount} alumnos · {PERIOD_LABELS[period]}
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, marginBottom: 10 }}>
            Tu puesto: #{data.myRank}{percentile != null ? ` · Top ${percentile}%` : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.entries.map((e, i) => (
              <RankingRow key={i} rank={e.rank} name={e.name} xp={e.xp} isMe={e.isCurrentUser} theme="dark" />
            ))}
          </div>
          {data.nextTarget && <Hint xpNeeded={data.nextTarget.xpNeeded} name={data.nextTarget.name} />}
          {PERIOD_CLARIFICATION[period] && (
            <p style={{ marginTop: 10, fontSize: 10.5, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>{PERIOD_CLARIFICATION[period]}</p>
          )}
        </>
      )}
    </div>
  )
}

function TemporadasTab({ token }: { token: string }) {
  const [data, setData] = useState<TemporadasData | null | undefined>(undefined)

  useEffect(() => {
    fetch('/api/ligas/etapas', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setData(d as TemporadasData))
      .catch(() => setData(null))
  }, [token])

  if (data === undefined) return <Loading />
  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 0' }}>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.6 }}>No se pudo cargar tu medallero.</p>
      </div>
    )
  }

  const { medals, currentRoundXp, currentRoundRange, currentRank, currentTotalParticipants, currentMedal, daysRemaining, pastRounds } = data
  const hasCurrentStanding = currentRoundXp > 0 && currentRank != null

  return (
    <div>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        Medallero
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 20 }}>
        {(['oro', 'plata', 'bronce'] as const).map(medal => (
          <div key={medal} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '14px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>{MEDAL_EMOJI[medal]}</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: 'white' }}>{medals[medal]}</div>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{medal}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.25)', borderRadius: 12, padding: '14px 16px', marginBottom: 20 }}>
        <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#60a5fa', marginBottom: 4 }}>Temporada actual · {formatMonthLabel(currentRoundRange.start)}</p>
        <p style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{currentRoundXp.toLocaleString('es-ES')} <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)' }}>XP</span></p>
        {hasCurrentStanding ? (
          <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
            Puesto provisional #{currentRank} de {currentTotalParticipants}{currentMedal ? ` · ${MEDAL_EMOJI[currentMedal]} ${currentMedal}` : ''}
          </p>
        ) : (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Todavía no tienes XP esta temporada.</p>
        )}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
          {daysRemaining === 0 ? 'Se cierra hoy' : `Quedan ${daysRemaining} día${daysRemaining === 1 ? '' : 's'}`} — entonces se reparten medallas según el puesto final.
        </p>
      </div>

      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>
        Temporadas anteriores
      </p>
      {pastRounds.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <p style={{ fontSize: 24, marginBottom: 8 }}>🏁</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>Aún no se ha cerrado ninguna temporada.<br />Vuelve el día 1 del próximo mes.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {pastRounds.map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)' }}>
              <span style={{ fontSize: 17, minWidth: 26, textAlign: 'center' }}>{r.medal ? MEDAL_EMOJI[r.medal] : '—'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.label}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{formatMonthLabel(r.periodStart)} · #{r.rank}</div>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa', flexShrink: 0 }}>{r.roundXp.toLocaleString('es-ES')} XP</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FullRankingModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [tab, setTab] = useState<'liga' | 'global' | 'temporadas'>('liga')
  const [liga, setLiga] = useState<LigaInfo | null | undefined>(undefined)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/ligas', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setLiga((d.liga as LigaInfo) ?? null))
      .catch(() => setLiga(null))
  }, [token])

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
          {(['liga', 'global', 'temporadas'] as const).map(t => (
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
              {t === 'liga' ? 'Mi liga' : t === 'global' ? 'Global' : 'Temporadas'}
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
                : tab === 'global'
                  ? <GlobalTab token={token} />
                  : <TemporadasTab token={token} />
              }
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
