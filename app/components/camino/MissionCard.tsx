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
    <section className="overflow-hidden rounded-[32px] border border-[#dbe7fb] bg-white/90 shadow-[0_28px_78px_rgba(37,99,235,0.12)]">
      <div className="grid gap-6 p-6 lg:grid-cols-[1fr_280px] lg:p-8">
        <div>
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">Día {todayMission.day} de tu Camino PAU</span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{route.nombre}</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950 md:text-3xl">Tu misión de hoy</h2>
          <p className="mt-3 max-w-2xl text-lg font-bold leading-8 text-slate-600">{todayMission.objective}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InfoPill icon={<Target size={16} />} label="Objetivo" value="Integrales + errores" />
            <InfoPill icon={<Clock3 size={16} />} label="Tiempo estimado" value={todayMission.estimatedTime} />
            <InfoPill icon={<CheckCircle2 size={16} />} label="Progreso" value={`${completedCount}/${totalTasks} tareas`} />
          </div>

          <div className="mt-7">
            <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400">
              <span>Progreso de misión</span>
              <span>{progress}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-[28px] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-blue-400">Ruta activa</p>
            <h3 className="mt-2 text-xl font-black text-slate-950">{route.nombre}</h3>
            <p className="mt-2 text-sm font-bold leading-6 text-slate-600">{route.mensajeAlumno}</p>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-white/80 p-3 text-sm font-bold text-slate-600">
              {route.duracionAproximada} · {route.intensidadDiaria}
            </div>
          </div>
          <button
            type="button"
            onClick={onPrimaryAction}
            className={`mt-6 inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black text-white shadow-[0_18px_38px_rgba(37,99,235,0.22)] transition focus:outline-none focus:ring-2 focus:ring-blue-200 ${missionCompleted ? 'bg-emerald-600' : 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-400 hover:-translate-y-0.5'}`}
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
    <div className="rounded-2xl border border-[#dbe7fb] bg-[#f8fbff] p-3">
      <div className="flex items-center gap-2 text-blue-700">{icon}<span className="text-[11px] font-black uppercase tracking-wide text-slate-400">{label}</span></div>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  )
}
