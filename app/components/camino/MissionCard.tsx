import type { ReactNode } from 'react'
import { ArrowRight, CheckCircle2, Clock3, Target } from 'lucide-react'
import { getRouteById, todayMission, type CaminoRouteId } from '@/app/lib/camino/caminoData'

interface MissionCardProps {
  routeId: CaminoRouteId
  completedCount: number
  totalTasks: number
  missionCompleted: boolean
  onPrimaryAction: () => void
}

export default function MissionCard({ routeId, completedCount, totalTasks, missionCompleted, onPrimaryAction }: MissionCardProps) {
  const route = getRouteById(routeId)
  const started = completedCount > 0
  const progress = Math.round((completedCount / totalTasks) * 100)
  const cta = missionCompleted ? 'Misión completada' : started ? 'Continuar misión' : 'Empezar misión'

  return (
    <section style={{ overflow: 'hidden', borderRadius: 16, border: '1px solid #dbe7fb', background: '#fff', boxShadow: '0 1px 4px rgba(15,23,42,0.04)' }}>
      <div style={{ padding: '24px 28px' }}>
        {/* Badge row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase',
            background: '#1e293b', color: '#fff', padding: '3px 10px', borderRadius: 999,
          }}>
            MISIÓN DE HOY
          </span>
          <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>
            Día {todayMission.day} · {route.nombre}
          </span>
        </div>

        {/* Mission title */}
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
          Tu misión de hoy
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 15, color: '#64748b', lineHeight: 1.6, fontWeight: 500 }}>
          {todayMission.objective}
        </p>

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 14 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
            <Clock3 size={14} style={{ color: '#94a3b8' }} /> {todayMission.estimatedTime}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#64748b', fontWeight: 600 }}>
            <CheckCircle2 size={14} style={{ color: '#94a3b8' }} /> {completedCount}/{totalTasks} tareas
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>
            +250 XP
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 11, fontWeight: 700, color: '#94a3b8' }}>
            <span>Progreso de misión</span><span>{progress}%</span>
          </div>
          <div className="pau-progress-bar">
            <div className="pau-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
          </div>
        </div>

        {/* CTA + route info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={onPrimaryAction}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '11px 22px', borderRadius: 12,
              background: missionCompleted ? '#16a34a' : '#7c3aed',
              color: '#fff', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 800, letterSpacing: '-0.01em',
              boxShadow: missionCompleted
                ? '0 6px 20px rgba(22,163,74,0.24)'
                : '0 6px 20px rgba(124,58,237,0.26)',
              transition: 'transform 160ms ease, box-shadow 160ms ease',
            }}
          >
            {cta} {!missionCompleted && <ArrowRight size={15} />}
          </button>
          <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 500, textAlign: 'right' }}>
            {route.duracionAproximada} · {route.intensidadDiaria}
          </div>
        </div>
      </div>
    </section>
  )
}

function InfoPill({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div style={{ borderRadius: 10, border: '1px solid var(--pau-border)', background: '#f8fbff', padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#2563eb', marginBottom: 4 }}>{icon}<span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: '#94a3b8' }}>{label}</span></div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{value}</p>
    </div>
  )
}
