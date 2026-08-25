'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'

export type PhotoAttachment = { data: string; mediaType: string; preview: string }

// Botón de adjuntar foto(s) reutilizable — misma lógica de lectura de imagen
// (compressImageToBase64) que ya usan Exámenes, Camino y Simulacros para
// corregir con foto, empaquetada en un componente controlado en vez de
// duplicar el patrón input+compresión+preview en cada sitio nuevo que la
// necesite. Componente controlado: el padre guarda `value` (varias páginas
// de una misma respuesta) y decide qué hacer con el adjunto (p. ej.
// enviarlo en el siguiente mensaje del chat).
export default function PhotoAttachButton({
  value,
  onChange,
  disabled,
  compact = false,
}: {
  value: PhotoAttachment[]
  onChange: (attachments: PhotoAttachment[]) => void
  disabled?: boolean
  compact?: boolean
}) {
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const size = compact ? 34 : 38

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (!files.length) return
    setError('')
    // allSettled: una sola foto en formato no compatible (típicamente HEIC
    // de iPhone) no debe descartar las demás ya comprimidas del mismo lote.
    const results = await Promise.allSettled(files.map(async file => {
      const preview = URL.createObjectURL(file)
      try {
        const data = await compressImageToBase64(file)
        return { data, mediaType: 'image/jpeg', preview }
      } catch (err) {
        URL.revokeObjectURL(preview)
        throw err
      }
    }))
    const succeeded = results.filter((r): r is PromiseFulfilledResult<PhotoAttachment> => r.status === 'fulfilled').map(r => r.value)
    const failedCount = results.length - succeeded.length
    if (succeeded.length) onChange([...value, ...succeeded])
    if (failedCount > 0) {
      // compressImageToBase64 rechaza en formatos que el navegador no sabe
      // decodificar (típicamente HEIC de iPhone) — el resto del lote ya
      // comprimido se conserva, solo se avisa de las que fallaron.
      console.error('[photo-attach] compression_failed', { failedCount })
      setError(`No hemos podido leer ${failedCount === 1 ? 'una foto' : `${failedCount} fotos`} (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte la imagen a JPG/PNG.`)
    }
  }

  function removeAt(index: number) {
    const item = value[index]
    if (item?.preview) URL.revokeObjectURL(item.preview)
    onChange(value.filter((_, i) => i !== index))
    setError('')
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <input ref={fileRef} type="file" accept="image/*" multiple capture="environment" onChange={handleFiles} style={{ display: 'none' }} disabled={disabled} />
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {value.map((att, index) => (
          <div key={`${att.preview}-${index}`} style={{ position: 'relative', display: 'inline-block' }}>
            <img src={att.preview} alt={`Página ${index + 1}`} loading="lazy" decoding="async" style={{ height: size + 34, width: size + 34, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #dbe7fb' }} />
            {value.length > 1 && (
              <span style={{ position: 'absolute', bottom: 2, left: 2, borderRadius: 5, background: 'rgba(15,23,42,0.75)', color: 'white', fontSize: 9, fontWeight: 900, padding: '0 4px' }}>{index + 1}</span>
            )}
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Quitar página ${index + 1}`}
              style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={11} />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label={value.length > 0 ? 'Añadir otra página' : 'Adjuntar foto'}
          title={value.length > 0 ? 'Añadir otra página' : 'Adjuntar foto'}
          style={{ width: size, height: size, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}
        >
          <Camera size={compact ? 15 : 17} />
        </button>
      </div>
      {error && <p style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#dc2626', maxWidth: 220 }}>{error}</p>}
    </div>
  )
}
