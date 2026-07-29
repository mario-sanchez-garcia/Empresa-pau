'use client'

import { Trophy } from 'lucide-react'
import { divisionFor } from '@/app/lib/camino/leagues'

export type MedalTally = { oro: number; plata: number; bronce: number }

export type RankingEntry = {
  id: string
  name: string
  community: string
  xp: number
  rank: number
  isCurrentUser: boolean
  isMock?: boolean
  // Presente solo en el ranking "Etapas" — ahí no hay XP, hay medallas de
  // ronda ganadas, así que la fila se pinta distinto (ver abajo).
  medals?: MedalTally
}

const PODIUM_COLORS = ['#f59e0b', '#94a3b8', '#c2956e']

const DARK_DIVISIONS: Record<string, { bg: string; text: string; border: string }> = {
  'Bronce':    { bg: 'rgba(180,83,9,.14)',    text: '#fbbf24', border: 'rgba(180,83,9,.28)'   },
  'Plata':     { bg: 'rgba(148,163,184,.1)',  text: '#cbd5e1', border: 'rgba(148,163,184,.2)' },
  'Oro':       { bg: 'rgba(234,179,8,.13)',   text: '#fde68a', border: 'rgba(234,179,8,.28)'  },
  'Platino':   { bg: 'rgba(56,189,248,.12)',  text: '#7dd3fc', border: 'rgba(56,189,248,.25)' },
  'Diamante':  { bg: 'rgba(37,99,235,.15)',   text: '#93c5fd', border: 'rgba(37,99,235,.3)'   },
  'Élite PAU': { bg: 'rgba(124,58,237,.14)',  text: '#c4b5fd', border: 'rgba(124,58,237,.28)' },
}

function MedalTallyBadge({ medals }: { medals: MedalTally }) {
  const total = medals.oro + medals.plata + medals.bronce
  if (!total) {
    return (
      <span style={{ flexShrink: 0, fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.25)', fontFamily: 'var(--font-geist-mono, monospace)' }}>
        0 oro · 0 plata · 0 bronce
      </span>
    )
  }
  return (
    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-geist-mono, monospace)' }}>
      {medals.oro > 0 && <span style={{ color: '#fde68a' }}>🥇 {medals.oro}</span>}
      {medals.plata > 0 && <span style={{ color: '#cbd5e1' }}>🥈 {medals.plata}</span>}
      {medals.bronce > 0 && <span style={{ color: '#fbbf24' }}>🥉 {medals.bronce}</span>}
    </span>
  )
}

export default function RankingRow({ row, fixed = false, showDivision = true }: { row: RankingEntry; fixed?: boolean; showDivision?: boolean }) {
  const div = divisionFor(row.xp)
  const darkDiv = DARK_DIVISIONS[div.name] ?? DARK_DIVISIONS['Bronce']
  const podium = row.rank <= 3
  const podiumColor = PODIUM_COLORS[row.rank - 1]
  const isEtapas = Boolean(row.medals)

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '10px 14px',
      borderRadius: 12,
      background: row.isCurrentUser ? 'rgba(37,99,235,.12)' : podium ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,.03)',
      border: `1px solid ${row.isCurrentUser ? 'rgba(37,99,235,.4)' : podium ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.06)'}`,
      boxShadow: row.isCurrentUser ? '0 0 0 1px rgba(37,99,235,.15) inset' : 'none',
      transition: 'background 140ms',
    }}>
      {/* Rank badge */}
      <span style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        display: 'grid', placeItems: 'center',
        background: podium ? `rgba(${podiumColor.replace('#','').match(/.{2}/g)!.map(h=>parseInt(h,16)).join(',')}, .15)` : 'rgba(255,255,255,.05)',
        border: `1px solid ${podium ? podiumColor + '44' : 'rgba(255,255,255,.08)'}`,
        color: podium ? podiumColor : 'rgba(255,255,255,.35)',
        fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-geist-mono, monospace)',
        letterSpacing: '.05em',
      }}>
        {podium ? <Trophy size={12} strokeWidth={2.5} /> : `${row.rank}`}
      </span>

      {/* Name */}
      <span style={{ flex: 1, minWidth: 0, fontSize: 13, fontWeight: 700, color: row.isCurrentUser ? '#fff' : 'rgba(255,255,255,.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.name}
        {row.isCurrentUser && (
          <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: '#60a5fa', verticalAlign: 'middle' }}>tú</span>
        )}
        {row.isMock && (
          <span style={{ marginLeft: 8, fontSize: 9, color: 'rgba(255,255,255,.25)', verticalAlign: 'middle' }}>demo</span>
        )}
      </span>

      {isEtapas ? (
        <MedalTallyBadge medals={row.medals as MedalTally} />
      ) : (
        <>
          {/* Division badge — basada en umbrales de XP histórico total
              (leagues.ts), no tiene sentido sobre un XP acotado a un
              periodo (ronda/top): con un mes normal casi nadie supera los
              500 XP de "Bronce", así que todo el mundo saldría con la
              misma división aunque no tenga nada que ver con su nivel. */}
          {showDivision && (
            <span style={{
              flexShrink: 0, padding: '3px 8px', borderRadius: 6,
              fontSize: 10, fontWeight: 600, letterSpacing: '.06em',
              background: darkDiv.bg, color: darkDiv.text, border: `1px solid ${darkDiv.border}`,
            }}>
              {div.name}
            </span>
          )}

          {/* XP */}
          <span style={{
            flexShrink: 0, fontSize: 11, fontWeight: 700,
            color: row.isCurrentUser ? '#60a5fa' : 'rgba(255,255,255,.4)',
            fontFamily: 'var(--font-geist-mono, monospace)',
            minWidth: 52, textAlign: 'right',
          }}>
            {row.xp.toLocaleString('es-ES')} XP
          </span>
        </>
      )}
    </div>
  )
}
