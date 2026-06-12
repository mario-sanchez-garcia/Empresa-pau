import { caminoRoutes, getRouteById, type CaminoRouteId } from '@/app/lib/camino/caminoData'

interface RouteCardProps {
  selectedRouteId: CaminoRouteId
  onRouteChange: (routeId: CaminoRouteId) => void
}

export default function RouteCard({ selectedRouteId, onRouteChange }: RouteCardProps) {
  const route = getRouteById(selectedRouteId)

  return (
    <section className="rounded-[28px] border border-[#dbe7fb] bg-white/90 p-5 shadow-[0_18px_48px_rgba(37,99,235,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Ruta de entrada</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{route.nombre}</h2>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{route.prioridad}</span>
      </div>

      <label htmlFor="camino-route-select" className="block">
        <span className="mb-2 block text-xs font-black text-slate-500">Cambiar ruta activa</span>
        <select
          id="camino-route-select"
          value={selectedRouteId}
          onChange={(event) => onRouteChange(event.target.value as CaminoRouteId)}
          className="w-full rounded-2xl border border-[#dbe7fb] bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        >
          {caminoRoutes.map(item => <option key={item.id} value={item.id}>{item.nombre}</option>)}
        </select>
      </label>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <RouteFact label="Meses" value={route.meses} />
        <RouteFact label="Duración" value={route.duracionAproximada} />
        <RouteFact label="Intensidad" value={route.intensidadDiaria} />
        <RouteFact label="Lógica" value={route.logica} />
      </div>

      <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm font-bold leading-6 text-blue-950">{route.mensajeAlumno}</p>
      <p className="mt-3 text-xs font-bold leading-5 text-slate-400">No hacer: {route.queNoHacer}</p>
    </section>
  )
}

function RouteFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}
