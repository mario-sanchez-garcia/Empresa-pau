'use client'

const MEDALS = ['🥇', '🥈', '🥉']

export type RankingRowTheme = 'light' | 'dark'

// Fila de ranking compartida entre FullRankingModal (Clasificación
// completa) y el widget "Mi liga" del panel lateral de Camino — antes cada
// uno tenía su propia copia y se desincronizaban entre sí.
export function RankingRow({ rank, name, xp, isMe, theme = 'dark' }: { rank: number; name: string; xp: number; isMe: boolean; theme?: RankingRowTheme }) {
  const medal = rank <= 3 ? MEDALS[rank - 1] : null
  const isDark = theme === 'dark'
  const palette = isDark
    ? {
        bg: isMe ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
        border: isMe ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent',
        rankColor: 'rgba(255,255,255,0.35)',
        nameColor: isMe ? 'white' : 'rgba(255,255,255,0.72)',
        xpColor: isMe ? '#60a5fa' : 'rgba(255,255,255,0.4)',
      }
    : {
        bg: isMe ? '#eff6ff' : 'transparent',
        border: isMe ? '1px solid #dbeafe' : '1px solid transparent',
        rankColor: '#94a3b8',
        nameColor: isMe ? '#1d40af' : '#334155',
        xpColor: '#2563eb',
      }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: isDark ? 12 : 8,
      padding: isDark ? '10px 14px' : '6px 8px', borderRadius: isDark ? 12 : 8,
      background: palette.bg, border: palette.border,
    }}>
      <span style={{ fontSize: medal ? (isDark ? 17 : 11) : (isDark ? 12 : 10), fontWeight: 900, color: palette.rankColor, minWidth: isDark ? 26 : 20, textAlign: 'center', lineHeight: 1, flexShrink: 0 }}>
        {medal ?? `#${rank}`}
      </span>
      <span style={{ flex: 1, fontSize: isDark ? 14 : 11, fontWeight: isMe ? 800 : 600, color: palette.nameColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
      </span>
      <span style={{ fontSize: isDark ? 13 : 10, fontWeight: 800, color: palette.xpColor, flexShrink: 0 }}>
        {xp.toLocaleString('es-ES')} XP
      </span>
    </div>
  )
}
