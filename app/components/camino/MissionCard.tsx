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
    <section style={{ overflow: 'hidden', borderRadius: 20, border: '1px solid var(--pau-border)', background: '#fff', boxShadow: 'var(--shadow-md)' }}>
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="pau-badge pau-badge-blue">Día {todayMission.day} de tu Camino PAU</span>
            <span className="pau-badge" style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }}>{route.nombre}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Tu misión de hoy</h2>
          <p className="mt-3 max-w-2xl text-lg font-bold leading-8 text-slate-600">{todayMission.objective}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoPill icon={<Target size={16} />} label="Objetivo" value="Integrales + errores" />
            <InfoPill icon={<Clock3 size={16} />} label="Tiempo estimado" value={todayMission.estimatedTime} />
            <InfoPill icon={<CheckCircle2 size={16} />} label="Progreso" value={`${completedCount}/${totalTasks} tareas`} />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between" style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8' }}>
              <span>Progreso de misión</span>
              <span>{progress}%</span>
            </div>
            <div className="pau-progress-bar">
              <div className="pau-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between p-5" style={{ borderRadius: 14, border: '1px solid #bfdbfe', background: 'linear-gradient(145deg, #eff6ff, #fff)' }}>
          <div>
            <p className="text-xs font-bold text-blue-400">Ruta activa</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{route.nombre}</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{route.mensajeAlumno}</p>
            <div className="mt-4 p-3 text-sm font-bold text-slate-600" style={{ borderRadius: 10, border: '1px solid #dbeafe', background: 'rgba(255,255,255,0.9)' }}>
              {route.duracionAproximada} · {route.intensidadDiaria}
            </div>
          </div>
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`campus-primary mt-6 w-full ${missionCompleted ? '' : ''}`}
            style={missionCompleted ? { background: '#16a34a', boxShadow: '0 8px 20px rgba(22,163,74,0.22)' } : {}}
          >
            {cta} {!missionCompleted && <ArrowRight size={16} />}
          </button>
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
