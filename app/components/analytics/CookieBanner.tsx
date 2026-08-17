'use client'

import Link from 'next/link'

export default function CookieBanner({
  onAccept,
  onReject,
  onClose,
  showCloseButton = false,
}: {
  onAccept: () => void
  onReject: () => void
  onClose?: () => void
  showCloseButton?: boolean
}) {
  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Preferencias de cookies"
      style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 9999,
        padding: '16px', background: '#0f172a', borderTop: '1px solid rgba(255,255,255,.08)',
        boxShadow: '0 -8px 32px rgba(0,0,0,.28)',
      }}
    >
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, flex: '1 1 340px', color: 'rgba(255,255,255,.75)' }}>
          Usamos cookies técnicas necesarias para que Kairo funcione. Con tu consentimiento, también usamos cookies analíticas (PostHog) para entender cómo se usa la app y mejorarla. Puedes cambiar tu decisión cuando quieras desde{' '}
          <Link href="/legal/privacidad" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
            la política de privacidad
          </Link>.
        </p>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={onReject}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, borderRadius: 7, border: '1px solid rgba(255,255,255,.22)', background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            Rechazar
          </button>
          <button
            type="button"
            onClick={onAccept}
            style={{ padding: '10px 16px', fontSize: 13, fontWeight: 700, borderRadius: 7, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}
          >
            Aceptar
          </button>
          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              style={{ padding: '10px 12px', fontSize: 13, borderRadius: 7, border: '1px solid rgba(255,255,255,.22)', background: 'transparent', color: 'rgba(255,255,255,.7)', cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
