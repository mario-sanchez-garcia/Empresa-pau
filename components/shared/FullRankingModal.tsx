'use client'

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown } from 'lucide-react'
import { Bebas_Neue, DM_Mono } from 'next/font/google'
import RankingRow, { type RankingEntry } from './RankingRow'

const bebas = Bebas_Neue({ weight: '400', subsets: ['latin'] })
const mono  = DM_Mono({ weight: ['400', '500'], subsets: ['latin'] })

type Scope = 'personal' | 'comunidad_materia' | 'global'
type Mode = 'ronda' | 'etapas' | 'xp_total'

// "Todas las asignaturas" — agrega el XP de todas las materias. Estado
// por defecto del selector de materia, compartido por los tres ámbitos
// (Personal/Comunidad/Global): la materia decide qué XP cuenta, el
// ámbito decide contra quién compites — son ejes independientes.
const ALL_SUBJECTS = '__all__'

type RankingApiEntry = {
  id: string
  name: string
  score: number
  rank: number
  isCurrentUser: boolean
  medals?: { oro: number; plata: number; bronce: number }
}
type RankingResponse = {
  entries: RankingApiEntry[]
  currentUserId: string
  availableSubjects?: string[]
  error?: string
}

const SCOPES: Array<{ id: Scope; label: string; sublabel: string }> = [
  { id: 'personal',          label: 'Personal',   sublabel: 'tu liga'     },
  { id: 'comunidad_materia', label: 'Comunidad',  sublabel: 'por materia' },
  { id: 'global',            label: 'Global',     sublabel: 'todos'       },
]

const MODES: Array<{ id: Mode; label: string }> = [
  { id: 'ronda',    label: 'Ronda actual' },
  { id: 'etapas',   label: 'Etapas' },
  { id: 'xp_total', label: 'XP total' },
]

function toRankingEntry(entry: RankingApiEntry): RankingEntry {
  return { id: entry.id, name: entry.name, community: '', xp: entry.score, rank: entry.rank, isCurrentUser: entry.isCurrentUser, medals: entry.medals }
}

export default function FullRankingModal({ token, onClose }: { token: string; onClose: () => void }) {
  const [scope, setScope] = useState<Scope>('personal')
  const [mode, setMode] = useState<Mode>('ronda')
  // Por defecto "todas las asignaturas": el XP se agrega entre materias
  // salvo que el alumno elija una concreta arriba de la clasificación.
  // Se aplica igual en los tres ámbitos (Personal/Comunidad/Global).
  const [subject, setSubject] = useState<string>(ALL_SUBJECTS)
  const [data, setData] = useState<RankingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [subjectOpen, setSubjectOpen] = useState(false)

  const B = bebas.style.fontFamily
  const M = mono.style.fontFamily

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams({ scope, mode, subject })

    fetch(`/api/ligas/rankings?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.ok ? res.json() as Promise<RankingResponse> : null)
      .then(payload => { if (!cancelled) setData(payload) })
      .catch(() => { if (!cancelled) setData(null) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [scope, mode, subject, token])

  const entries = data?.entries ?? []
  const availableSubjects = data?.availableSubjects ?? []

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'grid', placeItems: 'center',
        background: 'rgba(0,0,0,.82)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, y: 20, opacity: 0 }}
        transition={{ type: 'spring', duration: 0.4, bounce: 0.12 }}
        style={{
          display: 'flex', flexDirection: 'column',
          width: '100%', maxWidth: 500,
          maxHeight: '88vh',
          borderRadius: 24,
          background: '#0e0e14',
          border: '1px solid rgba(255,255,255,.1)',
          boxShadow: '0 32px 80px rgba(0,0,0,.6), 0 0 0 1px rgba(255,255,255,.04) inset',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 0',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <p style={{ fontFamily: M, fontSize: 9, color: 'rgba(255,255,255,.3)', letterSpacing: '.2em', textTransform: 'uppercase', margin: '0 0 4px' }}>
              Kairo · Rankings
            </p>
            <h2 style={{ fontFamily: B, fontSize: 40, lineHeight: .88, letterSpacing: '.02em', color: '#fff', margin: 0 }}>
              CLASIFICACIÓN<br />COMPLETA
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              display: 'grid', placeItems: 'center',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              color: 'rgba(255,255,255,.45)', cursor: 'pointer',
              transition: 'background 140ms, color 140ms',
            }}
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {/* Subject selector — arriba de todo, se aplica a los tres ámbitos */}
        <div style={{ padding: '16px 24px 0' }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setSubjectOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                width: '100%',
                fontFamily: M, fontSize: 10, fontWeight: 500, letterSpacing: '.08em', textTransform: 'uppercase',
                padding: '9px 12px', borderRadius: 12, cursor: 'pointer',
                background: 'rgba(37,99,235,.12)', border: '1px solid rgba(37,99,235,.3)',
                color: '#93c5fd',
              }}
            >
              <span>{subject === ALL_SUBJECTS ? 'Todas las asignaturas' : subject}</span>
              <ChevronDown size={11} strokeWidth={2.5} style={{ transform: subjectOpen ? 'rotate(180deg)' : 'none', transition: 'transform 160ms' }} />
            </button>
            <AnimatePresence>
              {subjectOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: .96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: .96 }}
                  transition={{ duration: .15 }}
                  style={{
                    position: 'absolute', left: 0, right: 0, top: '110%', zIndex: 10,
                    background: '#1a1a24', border: '1px solid rgba(255,255,255,.12)',
                    borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,.5)',
                  }}
                >
                  <button
                    onClick={() => { setSubject(ALL_SUBJECTS); setSubjectOpen(false) }}
                    style={{
                      display: 'block', width: '100%', textAlign: 'left',
                      padding: '9px 14px',
                      fontFamily: M, fontSize: 10, letterSpacing: '.06em',
                      color: subject === ALL_SUBJECTS ? '#fff' : 'rgba(255,255,255,.5)',
                      background: subject === ALL_SUBJECTS ? 'rgba(37,99,235,.2)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,.05)',
                      transition: 'background 120ms',
                    }}
                  >
                    Todas las asignaturas
                  </button>
                  {availableSubjects.map(s => (
                    <button
                      key={s}
                      onClick={() => { setSubject(s); setSubjectOpen(false) }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '9px 14px',
                        fontFamily: M, fontSize: 10, letterSpacing: '.06em',
                        color: s === subject ? '#fff' : 'rgba(255,255,255,.5)',
                        background: s === subject ? 'rgba(37,99,235,.2)' : 'transparent',
                        border: 'none', cursor: 'pointer',
                        borderBottom: '1px solid rgba(255,255,255,.05)',
                        transition: 'background 120ms',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Scope tabs */}
        <div style={{ padding: '20px 24px 0' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
            gap: 4, background: 'rgba(255,255,255,.04)',
            borderRadius: 14, padding: 4,
            border: '1px solid rgba(255,255,255,.07)',
          }}>
            {SCOPES.map(s => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                style={{
                  borderRadius: 10, padding: '8px 6px',
                  background: scope === s.id ? '#2563eb' : 'transparent',
                  border: 'none', cursor: 'pointer',
                  transition: 'background 160ms',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                }}
              >
                <span style={{
                  fontFamily: M, fontSize: 10, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase',
                  color: scope === s.id ? '#fff' : 'rgba(255,255,255,.4)',
                  transition: 'color 160ms',
                }}>
                  {s.label}
                </span>
                <span style={{
                  fontFamily: M, fontSize: 8, letterSpacing: '.06em', textTransform: 'uppercase',
                  color: scope === s.id ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)',
                  transition: 'color 160ms',
                }}>
                  {s.sublabel}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Mode chips */}
        <div style={{
          padding: '12px 24px 16px',
          display: 'flex', alignItems: 'center', gap: 8,
          borderBottom: '1px solid rgba(255,255,255,.06)',
        }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
            {MODES.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                style={{
                  fontFamily: M, fontSize: 9, fontWeight: 500, letterSpacing: '.1em', textTransform: 'uppercase',
                  padding: '5px 10px', borderRadius: 20, cursor: 'pointer',
                  background: mode === m.id ? 'rgba(255,255,255,.12)' : 'transparent',
                  border: `1px solid ${mode === m.id ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.08)'}`,
                  color: mode === m.id ? '#fff' : 'rgba(255,255,255,.35)',
                  transition: 'all 140ms',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rankings list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 24px', scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,.08) transparent' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[1,2,3,4,5].map(i => (
                <div key={i} style={{ height: 52, borderRadius: 12, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.05)' }} />
              ))}
            </div>
          ) : scope === 'personal' && data?.error === 'not_in_liga' ? (
            <EmptyState
              M={M}
              title="No estás en ninguna liga"
              body="Únete o crea una liga para ver tu clasificación personal. Puedes buscar una o crear la tuya desde Camino PAU."
            />
          ) : scope === 'comunidad_materia' && data?.error === 'no_comunidad' ? (
            <EmptyState
              M={M}
              title="Configura tu comunidad"
              body="Añade tu comunidad autónoma en tu perfil para ver el ranking de alumnos de tu región."
              action={{ label: 'Ir a configuración →', href: '/settings' }}
            />
          ) : mode === 'etapas' && !entries.length ? (
            <EmptyState
              M={M}
              title="Aún no hay etapas cerradas"
              body="Las etapas se calculan al cierre de cada ronda mensual. Las primeras clasificaciones aparecerán a final de mes."
            />
          ) : entries.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {entries.map(entry => (
                <RankingRow key={entry.id} row={toRankingEntry(entry)} fixed={entry.isCurrentUser} />
              ))}
            </div>
          ) : (
            <EmptyState M={M} title="Sin actividad" body="Aún no hay XP registrado para este periodo. ¡Completa misiones para aparecer aquí!" />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function EmptyState({ M, title, body, action }: { M: string; title: string; body: string; action?: { label: string; href: string } }) {
  return (
    <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>📊</span>
      </div>
      <p style={{ fontFamily: M, fontSize: 11, fontWeight: 500, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', margin: 0 }}>
        {title}
      </p>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,.3)', lineHeight: 1.6, margin: 0, maxWidth: 280 }}>
        {body}
      </p>
      {action && (
        <a href={action.href} style={{ marginTop: 4, fontFamily: M, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
          {action.label}
        </a>
      )}
    </div>
  )
}
