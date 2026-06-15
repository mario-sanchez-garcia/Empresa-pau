import Image from 'next/image'

export type PauMascotVariant =
  | 'avatar' | 'welcome' | 'guide' | 'study' | 'laptop'
  | 'celebrate' | 'thinking' | 'calm-error' | 'sleepy'

export type PauMascotSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'

export type PauMascotPresentation =
  | 'plain'    // just the image
  | 'halo'     // soft radial glow behind the image
  | 'bubble'   // speech bubble above + image with halo
  | 'success'  // image with pulsing green success ring
  | 'empty'    // centered column: image + optional title + message
  | 'error'    // centered column with error tones
  | 'helper'   // horizontal row: image + blue message pill

export type PauMascotProps = {
  variant?: PauMascotVariant
  size?: PauMascotSize
  presentation?: PauMascotPresentation
  message?: string
  title?: string
  className?: string
  alt?: string
  priority?: boolean
}

const VARIANT_SRC: Record<PauMascotVariant, string> = {
  avatar:       '/mascots/pau/pau-avatar.png',
  welcome:      '/mascots/pau/pau-welcome.png',
  guide:        '/mascots/pau/pau-guide.png',
  study:        '/mascots/pau/pau-study.png',
  laptop:       '/mascots/pau/pau-laptop.png',
  celebrate:    '/mascots/pau/pau-celebrate.png',
  thinking:     '/mascots/pau/pau-thinking.png',
  'calm-error': '/mascots/pau/pau-calm-error.png',
  sleepy:       '/mascots/pau/pau-sleepy.png',
}

const SIZE_PX: Record<PauMascotSize, number> = {
  xs: 32, sm: 48, md: 80, lg: 128, xl: 180, hero: 220,
}

export default function PauMascot({
  variant = 'guide',
  size = 'md',
  presentation = 'plain',
  message,
  title,
  className,
  alt,
  priority = false,
}: PauMascotProps) {
  const px     = SIZE_PX[size]
  const src    = VARIANT_SRC[variant]
  const label  = alt ?? 'Pau, mascota de Pausia'
  const haloR  = Math.round(px * 0.35)

  const imgEl = (
    <Image
      src={src}
      alt={label}
      width={px}
      height={px}
      priority={priority}
      style={{ display: 'block', userSelect: 'none', flexShrink: 0 }}
    />
  )

  /* ── halo ───────────────────────────────────────────────────────── */
  if (presentation === 'halo') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: px,
          height: px,
          flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute',
          top: -haloR, right: -haloR, bottom: -haloR, left: -haloR,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(101,163,130,0.18) 0%, rgba(101,163,130,0.06) 45%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{imgEl}</div>
      </div>
    )
  }

  /* ── success ────────────────────────────────────────────────────── */
  if (presentation === 'success') {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: px,
          height: px,
          flexShrink: 0,
        }}
      >
        <div className="pau-success-ring" style={{
          position: 'absolute',
          top: -haloR, right: -haloR, bottom: -haloR, left: -haloR,
          borderRadius: '50%',
          border: '2px solid rgba(34,197,94,0.45)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute',
          top: -(haloR * 0.55), right: -(haloR * 0.55),
          bottom: -(haloR * 0.55), left: -(haloR * 0.55),
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(34,197,94,0.13) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>{imgEl}</div>
      </div>
    )
  }

  /* ── bubble ─────────────────────────────────────────────────────── */
  if (presentation === 'bubble') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {message && (
          <div style={{
            position: 'relative',
            background: '#fff',
            border: '1.5px solid #dbe7fb',
            borderRadius: 14,
            padding: '10px 16px',
            maxWidth: 300,
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.5,
            boxShadow: '0 4px 16px rgba(37,99,235,0.07)',
          }}>
            {message}
            <div style={{
              position: 'absolute', bottom: -7, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid #dbe7fb',
            }} />
            <div style={{
              position: 'absolute', bottom: -5, left: '50%',
              transform: 'translateX(-50%)',
              width: 0, height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #fff',
            }} />
          </div>
        )}
        {/* halo around image */}
        <div style={{
          position: 'relative',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: px,
          height: px,
          flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute',
            top: -haloR, right: -haloR, bottom: -haloR, left: -haloR,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(101,163,130,0.18) 0%, rgba(101,163,130,0.06) 45%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>{imgEl}</div>
        </div>
      </div>
    )
  }

  /* ── helper ─────────────────────────────────────────────────────── */
  if (presentation === 'helper') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {imgEl}
        {message && (
          <div style={{
            flex: 1,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: 10,
            padding: '7px 12px',
            fontSize: 12.5,
            fontWeight: 600,
            color: '#1e40af',
            lineHeight: 1.45,
          }}>
            {message}
          </div>
        )}
      </div>
    )
  }

  /* ── empty / error ──────────────────────────────────────────────── */
  if (presentation === 'empty' || presentation === 'error') {
    const isErr = presentation === 'error'
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, textAlign: 'center' }}>
        {imgEl}
        {title && (
          <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: isErr ? '#991b1b' : '#0f172a' }}>
            {title}
          </p>
        )}
        {message && (
          <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: isErr ? '#b91c1c' : '#64748b', lineHeight: 1.55, maxWidth: 280 }}>
            {message}
          </p>
        )}
      </div>
    )
  }

  /* ── plain (default) ────────────────────────────────────────────── */
  return (
    <Image
      src={src}
      alt={label}
      width={px}
      height={px}
      priority={priority}
      className={className}
      style={{ display: 'block', userSelect: 'none' }}
    />
  )
}
