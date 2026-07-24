import { caminoRoutes, getRouteById, type CaminoRouteId } from '@/app/lib/camino/caminoData'

interface RouteCardProps {
  selectedRouteId: CaminoRouteId
  onRouteChange: (routeId: CaminoRouteId) => void
}

export default function RouteCard({ selectedRouteId, onRouteChange }: RouteCardProps) {
  const route = getRouteById(selectedRouteId)

  return (
    <section style={{ borderRadius: 16, border: '1px solid var(--pau-border)', background: '#fff', padding: 20, boxShadow: 'var(--shadow-sm)' }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold text-slate-400">Ruta de entrada</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{route.nombre}</h2>
        </div>
        <span className="rounded-full bg-[#f5f5f5] px-3 py-1 text-xs font-black text-[#1c1c1c]">{route.prioridad}</span>
      </div>

      <label htmlFor="camino-route-select" className="block">
        <span className="mb-2 block text-xs font-black text-slate-500">Cambiar ruta activa</span>
        <select
          id="camino-route-select"
          value={selectedRouteId}
          onChange={(event) => onRouteChange(event.target.value as CaminoRouteId)}
          className="w-full rounded-[6px] border border-[#e0e0e0] bg-white px-4 py-3 text-sm font-black text-slate-700 outline-none transition focus:border-[#999]"
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

      <p className="mt-4 rounded-[6px] border border-[#e8e8e8] bg-[#f9f9f9] p-4 text-sm font-bold leading-6 text-slate-700">{route.mensajeAlumno}</p>
      <p className="mt-3 text-xs font-bold leading-5 text-slate-400">No hacer: {route.queNoHacer}</p>
    </section>
  )
}

function RouteFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-[10px] font-bold text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-black text-slate-800">{value}</p>
    </div>
  )
}
