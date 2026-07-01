import Link from 'next/link'
import { Send, X } from 'lucide-react'

export default function PaywallPreviewPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f4f7fb] p-6">
      {/* Label de preview */}
      <p className="mb-6 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-amber-700">
        Preview · día 7 paywall
      </p>

      {/* Simulación del overlay + modal */}
      <div className="relative w-full max-w-sm">
        {/* El modal exacto */}
        <div className="w-full rounded-[28px] bg-white p-6 shadow-2xl ring-1 ring-black/5">
          {/* Cabecera */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-950">Tu plan gratuito ha terminado</h2>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                Has completado 7 días de Camino PAU. Para seguir avanzando, desbloquea el acceso completo.
              </p>
            </div>
            {/* X decorativa */}
            <button
              type="button"
              aria-label="Cerrar"
              className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>

          {/* ParentLinkModule — estado idle inline decorativo */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <Send size={19} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-slate-950">Tu Camino PAU completo</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-500">
                  Puedes enviar tu plan a tus padres para desbloquear el Pack Curso PAU.
                </p>
              </div>
            </div>
            {/* Botón decorativo */}
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-black text-white"
            >
              <Send size={16} /> Enviar a mis padres
            </button>
          </section>

          <Link
            href="/pricing"
            className="mt-3 block text-center text-sm font-black text-blue-700 hover:underline"
          >
            Ver planes
          </Link>
        </div>
      </div>

      {/* Contexto de ejemplo */}
      <div className="mt-8 max-w-sm rounded-2xl border border-blue-100 bg-white p-4 text-xs font-semibold text-slate-500">
        <p className="font-black text-slate-700">Contexto del alumno de ejemplo</p>
        <p className="mt-1">Nombre: Mario</p>
        <p>Días completados: 7</p>
        <p>Plan: Free</p>
      </div>
    </div>
  )
}
