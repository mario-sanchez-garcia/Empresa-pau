'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import RankingRow, { type RankingEntry } from './RankingRow'

type Scope = 'personal' | 'comunidad_materia' | 'global'
type Mode = 'ronda' | 'etapas' | 'xp_total'

type RankingApiEntry = { id: string; name: string; score: number; rank: number; isCurrentUser: boolean }
type RankingResponse = {
  entries: RankingApiEntry[]
  currentUserId: string
  availableSubjects?: string[]
  error?: string
}

const SCOPES: Array<{ id: Scope; label: string }> = [
  { id: 'personal', label: 'Personal' },
  { id: 'comunidad_materia', label: 'Comunidad · Materia' },
  { id: 'global', label: 'Global' },
]

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'ronda', label: 'Ronda actual' },
  { id: 'etapas', label: 'Etapas' },
  { id: 'xp_total', label: 'XP total' },
]

// RankingRow espera un RankingEntry (con `community`/`xp`) — lo adaptamos
// desde la forma genérica {score} que devuelve /api/ligas/rankings, sin
// tocar RankingRow ni su estilo.
function toRankingEntry(entry: RankingApiEntry): RankingEntry {
  return { id: entry.id, name: entry.name, community: '', xp: entry.score, rank: entry.rank, isCurrentUser: entry.isCurrentUser }
}

export default function FullRankingModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [scope, setScope] = useState<Scope>('personal')
  const [mode, setMode] = useState<Mode>('ronda')
  const [subject, setSubject] = useState<string | null>(null)
  const [data, setData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ scope, mode })
    if (scope === 'comunidad_materia' && subject) params.set('subject', subject)

    fetch(`/api/ligas/rankings?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() as Promise<RankingResponse> : null)
      .then(payload => {
        if (cancelled) return
        setData(payload)
        // Autoselecciona la primera asignatura disponible si aún no hay ninguna elegida.
        if (scope === 'comunidad_materia' && !subject && payload?.availableSubjects?.length) {
          setSubject(payload.availableSubjects[0])
        }
      })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [scope, mode, subject, token])

  const entries = data?.entries ?? []
  const availableSubjects = data?.availableSubjects ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 16 }}
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-[28px] border border-blue-100 bg-white p-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="text-base font-black text-slate-950">Clasificación completa</p>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="mb-3 flex gap-1 rounded-2xl bg-slate-50 p-1">
          {SCOPES.map(s => (
            <button
              key={s.id}
              onClick={() => setScope(s.id)}
              className={`flex-1 rounded-xl px-2 py-1.5 text-[11px] font-black transition ${scope === s.id ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex gap-1">
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`rounded-full px-3 py-1 text-[11px] font-black ${mode === m.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {scope === 'comunidad_materia' && availableSubjects.length > 0 && (
            <select
              value={subject ?? ''}
              onChange={e => setSubject(e.target.value)}
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-600 outline-none"
            >
              {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          )}
        </div>

        <div className="min-h-[200px] flex-1 overflow-y-auto">
          {loading ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-400">Cargando…</p>
          ) : scope === 'comunidad_materia' && !availableSubjects.length ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-400">Todavía no tienes XP registrado en ninguna asignatura este mes.</p>
          ) : scope === 'personal' && data?.error === 'not_in_liga' ? (
            <p className="py-8 text-center text-sm font-semibold text-slate-400">Únete o crea una liga para ver esta clasificación.</p>
          ) : entries.length ? (
            <div className="grid gap-1.5">
              {entries.map(entry => <RankingRow key={entry.id} row={toRankingEntry(entry)} fixed={entry.isCurrentUser} />)}
            </div>
          ) : (
            <p className="py-8 text-center text-sm font-semibold text-slate-400">Sin datos por ahora.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
