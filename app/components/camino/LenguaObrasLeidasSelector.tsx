'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase'

type ObraCatalogo = {
  id: string
  titulo: string
  autor: string
  periodo: 'anterior_1936' | '1937_1974' | 'posterior_1975'
  movimiento_literario: string | null
}

export type ObraLeidaDeclarada = {
  obraId: string | null
  titulo: string
  autor?: string
  periodo: 'anterior_1936' | '1937_1974' | 'posterior_1975'
  declaradoEn: string
}

const PERIODOS: { key: ObraCatalogo['periodo']; label: string }[] = [
  { key: 'anterior_1936', label: 'Obra anterior a 1936' },
  { key: '1937_1974', label: 'Obra entre 1937 y 1974' },
  { key: 'posterior_1975', label: 'Obra posterior a 1975' },
]

// Componente autocontenido a propósito: obtiene su propia sesión, catálogo
// y fila de perfiles — no depende de ningún estado/hook del padre
// (CaminoTopicClient.tsx ya tiene mucha lógica de misiones/XP/calendario que
// esta tarea tiene explícitamente prohibido tocar).
export default function LenguaObrasLeidasSelector() {
  const [userId, setUserId] = useState<string | null>(null)
  const [catalogo, setCatalogo] = useState<ObraCatalogo[] | null>(null)
  const [declaradas, setDeclaradas] = useState<ObraLeidaDeclarada[] | null>(null)
  const [customTitulo, setCustomTitulo] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const uid = userData?.user?.id ?? null
      if (cancelled) return
      setUserId(uid)

      const [catalogRes, perfilRes] = await Promise.all([
        supabase.from('lengua_obras_lectura').select('id, titulo, autor, periodo, movimiento_literario').order('periodo').order('titulo'),
        uid ? supabase.from('perfiles').select('lengua_obras_leidas').eq('id', uid).single() : Promise.resolve({ data: null, error: null }),
      ])
      if (cancelled) return
      if (catalogRes.error || !catalogRes.data) {
        setError('No hemos podido cargar el catálogo de obras. Inténtalo de nuevo.')
        return
      }
      setCatalogo(catalogRes.data as ObraCatalogo[])
      const raw = (perfilRes as { data: { lengua_obras_leidas?: ObraLeidaDeclarada[] } | null }).data?.lengua_obras_leidas
      setDeclaradas(Array.isArray(raw) ? raw : [])
    }
    load()
    return () => { cancelled = true }
  }, [])

  async function persist(next: ObraLeidaDeclarada[]) {
    setDeclaradas(next)
    if (!userId) return
    setSaving(true)
    const { error: updateError } = await supabase.from('perfiles').update({ lengua_obras_leidas: next }).eq('id', userId)
    setSaving(false)
    if (updateError) setError('No hemos podido guardar tu selección. Inténtalo de nuevo.')
  }

  function toggleCatalogObra(obra: ObraCatalogo) {
    if (!declaradas) return
    const isSelected = declaradas.some(d => d.obraId === obra.id)
    const next = isSelected
      ? declaradas.filter(d => d.obraId !== obra.id)
      : [...declaradas, { obraId: obra.id, titulo: obra.titulo, autor: obra.autor, periodo: obra.periodo, declaradoEn: new Date().toISOString() }]
    persist(next)
  }

  function addCustomObra(periodo: ObraCatalogo['periodo']) {
    const titulo = (customTitulo[periodo] ?? '').trim()
    if (!titulo || !declaradas) return
    persist([...declaradas, { obraId: null, titulo, periodo, declaradoEn: new Date().toISOString() }])
    setCustomTitulo(prev => ({ ...prev, [periodo]: '' }))
  }

  function removeCustomObra(titulo: string, periodo: ObraCatalogo['periodo']) {
    if (!declaradas) return
    persist(declaradas.filter(d => !(d.obraId === null && d.titulo === titulo && d.periodo === periodo)))
  }

  if (error) return <p style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', margin: '0 0 28px' }}>{error}</p>
  if (!catalogo || !declaradas) {
    return <p style={{ fontSize: 12, fontWeight: 600, color: '#94a3b8', margin: '0 0 28px' }}>Cargando obras de lectura…</p>
  }

  return (
    <div style={{ margin: '0 0 28px', padding: 16, borderRadius: 16, border: '1.5px solid #e2e8f0', background: '#fafbfc' }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em', color: '#2563eb' }}>
        Obra leída
      </p>
      <p style={{ margin: '0 0 14px', fontSize: 12.5, fontWeight: 500, color: '#64748b', lineHeight: 1.6 }}>
        Marca la(s) obra(s) que hayas leído en clase para cada periodo. No hay una lista única oficial —
        cada centro elige la suya, así que si la tuya no está aquí, añádela abajo.
      </p>
      <div style={{ display: 'grid', gap: 16 }}>
        {PERIODOS.map(periodo => {
          const obrasDelPeriodo = catalogo.filter(o => o.periodo === periodo.key)
          const customDelPeriodo = declaradas.filter(d => d.obraId === null && d.periodo === periodo.key)
          return (
            <div key={periodo.key}>
              <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em', color: '#94a3b8' }}>
                {periodo.label}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {obrasDelPeriodo.map(obra => {
                  const active = declaradas.some(d => d.obraId === obra.id)
                  return (
                    <button
                      key={obra.id}
                      type="button"
                      onClick={() => toggleCatalogObra(obra)}
                      aria-pressed={active}
                      title={`${obra.titulo} — ${obra.autor}`}
                      style={{
                        borderRadius: 999,
                        border: `1.5px solid ${active ? '#2563eb' : '#e2e8f0'}`,
                        background: active ? '#2563eb' : '#fff',
                        color: active ? '#fff' : '#475569',
                        fontSize: 11,
                        fontWeight: 800,
                        padding: '6px 12px',
                        cursor: 'pointer',
                        transition: 'all 120ms',
                      }}
                    >
                      {obra.titulo}
                    </button>
                  )
                })}
                {customDelPeriodo.map(d => (
                  <button
                    key={d.titulo}
                    type="button"
                    onClick={() => removeCustomObra(d.titulo, periodo.key)}
                    aria-pressed
                    style={{
                      borderRadius: 999,
                      border: '1.5px solid #16a34a',
                      background: '#16a34a',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 800,
                      padding: '6px 12px',
                      cursor: 'pointer',
                    }}
                  >
                    {d.titulo} ✕
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  type="text"
                  value={customTitulo[periodo.key] ?? ''}
                  onChange={e => setCustomTitulo(prev => ({ ...prev, [periodo.key]: e.target.value }))}
                  onKeyDown={e => { if (e.key === 'Enter') addCustomObra(periodo.key) }}
                  placeholder="Mi obra no está en la lista…"
                  style={{ flex: 1, fontSize: 12, padding: '6px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0' }}
                />
                <button
                  type="button"
                  onClick={() => addCustomObra(periodo.key)}
                  style={{ fontSize: 11, fontWeight: 800, padding: '6px 12px', borderRadius: 8, border: 'none', background: '#0f172a', color: '#fff', cursor: 'pointer' }}
                >
                  Añadir
                </button>
              </div>
            </div>
          )
        })}
      </div>
      {saving && <p style={{ margin: '10px 0 0', fontSize: 10.5, fontWeight: 600, color: '#94a3b8' }}>Guardando…</p>}
    </div>
  )
}
