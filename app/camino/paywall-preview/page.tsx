'use client'

import Link from 'next/link'
import { Send, X } from 'lucide-react'
import ClayThemeScope from '@/components/clay/ClayThemeScope'
import ClayCard from '@/components/clay/ClayCard'
import ClayButton from '@/components/clay/ClayButton'
import { useClayThemePreference } from '@/components/clay/useClayThemePreference'

export default function PaywallPreviewPage() {
  const { theme } = useClayThemePreference()

  return (
    <ClayThemeScope theme={theme} className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Label de preview */}
      <p className="mb-6 rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-[0.12em]" style={{ background: 'rgba(245,158,11,.15)', color: '#b45309' }}>
        Preview · día 7 paywall
      </p>

      {/* Simulación del overlay + modal */}
      <div className="relative w-full max-w-sm">
        {/* El modal exacto */}
        <ClayCard radius={28} padding={24}>
          {/* Cabecera */}
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black" style={{ color: 'var(--clay-text)' }}>Tu plan gratuito ha terminado</h2>
              <p className="mt-2 text-sm font-semibold leading-6" style={{ color: 'var(--clay-text-muted)' }}>
                Has completado 7 días de Camino PAU. Para seguir avanzando, desbloquea el acceso completo.
              </p>
            </div>
            {/* X decorativa */}
            <button
              type="button"
              aria-label="Cerrar"
              className="shrink-0 rounded-full p-1"
              style={{ color: 'var(--clay-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* ParentLinkModule — estado idle inline decorativo */}
          <ClayCard radius={16} padding={20}>
            <div className="mb-3 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'var(--clay-accent-soft)', color: 'var(--clay-accent)' }}>
                <Send size={19} />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black" style={{ color: 'var(--clay-text)' }}>Tu Camino PAU completo</h3>
                <p className="mt-1 text-sm font-semibold leading-6" style={{ color: 'var(--clay-text-muted)' }}>
                  Puedes enviar tu plan a tus padres para desbloquear el Pack Curso PAU.
                </p>
              </div>
            </div>
            {/* Botón decorativo */}
            <ClayButton type="button" style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Send size={16} /> Enviar a mis padres
            </ClayButton>
          </ClayCard>

          <Link
            href="/pricing"
            className="mt-3 block text-center text-sm font-black hover:underline"
            style={{ color: 'var(--clay-accent-text)' }}
          >
            Ver planes
          </Link>
        </ClayCard>
      </div>

      {/* Contexto de ejemplo */}
      <ClayCard radius={16} padding={16} style={{ marginTop: 32, maxWidth: 384, fontSize: 12, fontWeight: 600, color: 'var(--clay-text-muted)' }}>
        <p className="font-black" style={{ color: 'var(--clay-text)' }}>Contexto del alumno de ejemplo</p>
        <p className="mt-1">Nombre: Mario</p>
        <p>Días completados: 7</p>
        <p>Plan: Free</p>
      </ClayCard>
    </ClayThemeScope>
  )
}
