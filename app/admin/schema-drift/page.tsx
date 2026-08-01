'use client'

// Página de la comprobación de esquema. Existe porque /api/admin/schema-drift
// se autentica con Bearer token, y abrir la URL a pelo en el navegador no
// manda ninguna cabecera: la sesión vive en localStorage, no en una cookie.
// Esta página la lee y hace la llamada correctamente.

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'

type Hallazgo = { severidad: 'critico' | 'aviso'; que: string; detalle: string; porque: string }
type Resultado = {
  ok: boolean
  resumen: string
  criticos: Hallazgo[]
  avisos: Hallazgo[]
  comprobado: { tablas: number; columnas: number; funciones: number; politicasAbiertas: number }
}

type Estado =
  | { s: 'cargando' }
  | { s: 'sin-sesion' }
  | { s: 'sin-permiso' }
  | { s: 'error'; mensaje: string; ayuda?: string }
  | { s: 'ok'; data: Resultado }

const NARANJA = '#f97316'

export default function SchemaDriftPage() {
  const [estado, setEstado] = useState<Estado>({ s: 'cargando' })

  const cargar = useCallback(async () => {
    setEstado({ s: 'cargando' })
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { setEstado({ s: 'sin-sesion' }); return }

    const res = await fetch('/api/admin/schema-drift', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
    if (res.status === 401) { setEstado({ s: 'sin-sesion' }); return }
    if (res.status === 403) { setEstado({ s: 'sin-permiso' }); return }

    const json = await res.json()
    if (!res.ok) {
      setEstado({ s: 'error', mensaje: json.message ?? json.error ?? 'Error desconocido', ayuda: json.detalle })
      return
    }
    setEstado({ s: 'ok', data: json as Resultado })
  }, [])

  useEffect(() => { void cargar() }, [cargar])

  return (
    <div style={{ minHeight: '100dvh', background: '#0d0d0d', color: '#fff', padding: '40px 20px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, marginBottom: 6 }}>
          <h1 style={{ fontSize: 22, margin: 0, letterSpacing: '-0.01em' }}>Estado del esquema</h1>
          <button
            onClick={() => void cargar()}
            style={{ background: 'none', border: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.7)', borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Recomprobar
          </button>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,.42)', margin: '0 0 28px', lineHeight: 1.6 }}>
          Compara lo que hay en producción con lo que el código espera. Ábrelo antes de cada
          despliegue importante.
        </p>

        {estado.s === 'cargando' && <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13 }}>Comprobando…</p>}

        {estado.s === 'sin-sesion' && (
          <Aviso color="#f87171" titulo="Sin sesión">
            Inicia sesión con tu cuenta interna. <Link href="/login" style={{ color: NARANJA }}>Ir a login</Link>
          </Aviso>
        )}

        {estado.s === 'sin-permiso' && (
          <Aviso color="#f87171" titulo="Sin permiso">
            Tu cuenta no está en la lista de usuarios internos (INTERNAL_USER_EMAILS).
          </Aviso>
        )}

        {estado.s === 'error' && (
          <Aviso color="#fbbf24" titulo="No se pudo comprobar">
            {estado.mensaje}
            {estado.ayuda && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'rgba(255,255,255,.40)' }}>{estado.ayuda}</div>
            )}
          </Aviso>
        )}

        {estado.s === 'ok' && (
          <>
            <div style={{
              borderRadius: 14, padding: '18px 20px', marginBottom: 22,
              background: estado.data.ok ? 'rgba(74,222,128,.10)' : 'rgba(248,113,113,.10)',
              border: `1px solid ${estado.data.ok ? 'rgba(74,222,128,.30)' : 'rgba(248,113,113,.32)'}`,
            }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: estado.data.ok ? '#4ade80' : '#f87171' }}>
                {estado.data.ok ? '✓ Todo aplicado' : '✕ Hay migraciones sin aplicar'}
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.60)', marginTop: 6 }}>{estado.data.resumen}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,.32)', marginTop: 10 }}>
                Comprobadas {estado.data.comprobado.tablas} tablas · {estado.data.comprobado.columnas} columnas ·{' '}
                {estado.data.comprobado.funciones} funciones · {estado.data.comprobado.politicasAbiertas} tablas frente a lectura abierta
              </div>
            </div>

            <Lista titulo="Críticos" hallazgos={estado.data.criticos} color="#f87171" />
            <Lista titulo="Avisos" hallazgos={estado.data.avisos} color="rgba(255,255,255,.35)" />
          </>
        )}
      </div>
    </div>
  )
}

function Aviso({ titulo, color, children }: { titulo: string; color: string; children: React.ReactNode }) {
  return (
    <div style={{ borderRadius: 14, padding: '18px 20px', background: 'rgba(255,255,255,.03)', border: `1px solid ${color}44` }}>
      <div style={{ fontSize: 14, fontWeight: 600, color, marginBottom: 6 }}>{titulo}</div>
      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.62)', lineHeight: 1.65 }}>{children}</div>
    </div>
  )
}

function Lista({ titulo, hallazgos, color }: { titulo: string; hallazgos: Hallazgo[]; color: string }) {
  if (hallazgos.length === 0) return null
  return (
    <div style={{ marginBottom: 26 }}>
      <div style={{ fontSize: 11, letterSpacing: '.16em', color: 'rgba(255,255,255,.38)', marginBottom: 10 }}>
        {titulo.toUpperCase()} · {hallazgos.length}
      </div>
      <div style={{ display: 'grid', gap: 8 }}>
        {hallazgos.map((h, i) => (
          <div key={i} style={{ borderRadius: 11, padding: '13px 15px', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color }}>{h.que}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.50)', marginTop: 4 }}>{h.detalle}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.32)', marginTop: 6, lineHeight: 1.55 }}>{h.porque}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
