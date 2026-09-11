'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f7fb',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <p
        style={{
          fontSize: 13,
          fontWeight: 900,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#ef4444',
          marginBottom: 12,
        }}
      >
        Algo ha fallado
      </p>
      <h1
        style={{
          fontSize: 28,
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          lineHeight: 1.2,
          marginBottom: 10,
          maxWidth: 420,
        }}
      >
        Ha ocurrido un error inesperado
      </h1>
      <p
        style={{
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.6,
          marginBottom: 28,
          maxWidth: 380,
        }}
      >
        Prueba a intentarlo de nuevo. Si el problema persiste, vuelve al inicio.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            fontSize: 13,
            fontWeight: 900,
            color: 'white',
            background: '#2563eb',
            border: 'none',
            borderRadius: 999,
            padding: '10px 22px',
            cursor: 'pointer',
          }}
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: 13,
            fontWeight: 900,
            color: '#2563eb',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 999,
            padding: '10px 22px',
            textDecoration: 'none',
          }}
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
