'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'
import { compressImageToBase64 } from '@/app/lib/clientImageCompression'

export type PhotoAttachment = { data: string; mediaType: string; preview: string }

// Botón de adjuntar foto reutilizable — misma lógica de lectura de imagen
// (compressImageToBase64) que ya usan Exámenes, Camino y Simulacros para
// corregir con foto, empaquetada en un componente controlado en vez de
// duplicar el patrón input+compresión+preview en cada sitio nuevo que la
// necesite. Componente controlado: el padre guarda `value` y decide qué
// hacer con el adjunto (p. ej. enviarlo en el siguiente mensaje del chat).
export default function PhotoAttachButton({
  value,
  onChange,
  disabled,
  compact = false,
}: {
  value: PhotoAttachment | null
  onChange: (attachment: PhotoAttachment | null) => void
  disabled?: boolean
  compact?: boolean
}) {
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const size = compact ? 34 : 38

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    const preview = URL.createObjectURL(file)
    try {
      const data = await compressImageToBase64(file)
      onChange({ data, mediaType: 'image/jpeg', preview })
    } catch (err) {
      // compressImageToBase64 rechaza en formatos que el navegador no sabe
      // decodificar (típicamente HEIC de iPhone) — sin este catch quedaba
      // una promesa rechazada sin manejar y ningún aviso al alumno.
      console.error('[photo-attach] compression_failed', { message: (err as Error)?.message })
      URL.revokeObjectURL(preview)
      setError('No hemos podido leer esta foto (formato no compatible, p. ej. HEIC de iPhone). Prueba con la cámara del navegador o convierte la imagen a JPG/PNG.')
    }
  }

  function clear() {
    if (value?.preview) URL.revokeObjectURL(value.preview)
    onChange(null)
    setError('')
  }

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: 'none' }} disabled={disabled} />
      {value ? (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img src={value.preview} alt="Foto adjunta" style={{ height: size + 34, width: size + 34, objectFit: 'cover', borderRadius: 10, border: '1.5px solid #dbe7fb' }} />
          <button
            type="button"
            onClick={clear}
            aria-label="Quitar foto"
            style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#2563eb', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={11} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={disabled}
          aria-label="Adjuntar foto"
          title="Adjuntar foto"
          style={{ width: size, height: size, borderRadius: 10, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#475569', cursor: disabled ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, opacity: disabled ? 0.5 : 1 }}
        >
          <Camera size={compact ? 15 : 17} />
        </button>
      )}
      {error && <p style={{ marginTop: 6, fontSize: 11, fontWeight: 700, color: '#dc2626', maxWidth: 220 }}>{error}</p>}
    </div>
  )
}
