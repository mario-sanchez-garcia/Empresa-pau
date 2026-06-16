import type { CSSProperties } from 'react'

type PausiaBrandProps = {
  variant?: 'default' | 'inverse' | 'mark'
  subtitle?: string | null
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

const scale = {
  sm: { mark: 32, radius: 11, logoH: 31, logoW: 104, sub: 9.5 },
  md: { mark: 42, radius: 14, logoH: 38, logoW: 128, sub: 10.5 },
  lg: { mark: 54, radius: 17, logoH: 48, logoW: 162, sub: 11 },
}

export default function PausiaBrand({
  variant = 'default',
  subtitle,
  size = 'md',
  className,
  style,
}: PausiaBrandProps) {
  const s = scale[size]
  const inverse = variant === 'inverse'
  const subColor = inverse ? 'rgba(255,255,255,0.64)' : '#7c8da5'

  const mark = (
    <span
      aria-hidden={variant === 'mark' ? undefined : 'true'}
      aria-label={variant === 'mark' ? 'Pausia' : undefined}
      className={variant === 'mark' ? className : undefined}
      style={{
        width: s.mark,
        height: s.mark,
        borderRadius: s.radius,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: inverse ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.88)',
        border: inverse ? '1px solid rgba(255,255,255,0.30)' : '1px solid rgba(191,219,254,0.82)',
        boxShadow: inverse
          ? '0 14px 34px rgba(2,8,23,0.18)'
          : '0 12px 28px rgba(37,99,235,0.14)',
        overflow: 'hidden',
        ...(variant === 'mark' ? style : undefined),
      }}
    >
      <img
        src="/brand/pausia-mark.svg"
        alt=""
        width={s.mark}
        height={s.mark}
        style={{ width: '82%', height: '82%', objectFit: 'contain', display: 'block' }}
      />
    </span>
  )

  if (variant === 'mark') return mark

  return (
    <span
      className={className}
      style={{
        display: 'inline-grid',
        justifyItems: 'start',
        alignItems: 'center',
        minWidth: 0,
        ...style,
      }}
    >
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: s.logoW,
          height: s.logoH,
          borderRadius: inverse ? Math.round(s.radius * 1.1) : 0,
          padding: inverse ? '5px 8px' : 0,
          background: inverse ? 'rgba(255,255,255,0.92)' : 'transparent',
          border: inverse ? '1px solid rgba(255,255,255,0.30)' : 'none',
          boxShadow: inverse ? '0 14px 34px rgba(2,8,23,0.16)' : 'none',
          overflow: 'hidden',
        }}
      >
        <img
          src="/brand/pausia-logo.svg"
          alt="Pausia"
          width={s.logoW}
          height={s.logoH}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
        />
      </span>
      <span style={{ minWidth: 0, display: 'block' }}>
        {subtitle !== null && (
          <span
            style={{
              display: 'block',
              marginTop: 4,
              color: subColor,
              fontSize: s.sub,
              fontWeight: 750,
              letterSpacing: '0.14em',
              lineHeight: 1,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {subtitle ?? 'PAU'}
          </span>
        )}
      </span>
    </span>
  )
}
