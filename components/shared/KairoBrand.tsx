import type { CSSProperties } from 'react'

type KairoBrandProps = {
  variant?: 'default' | 'inverse' | 'mark'
  subtitle?: string | null
  size?: 'sm' | 'md' | 'lg'
  format?: 'horizontal' | 'stacked'
  className?: string
  style?: CSSProperties
}

const scale = {
  sm: { mark: 34, radius: 12, logoH: 40, logoW: 98, stackH: 68, stackW: 68, sub: 9.5 },
  md: { mark: 44, radius: 15, logoH: 50, logoW: 122, stackH: 84, stackW: 84, sub: 10.5 },
  lg: { mark: 58, radius: 18, logoH: 68, logoW: 165, stackH: 122, stackW: 122, sub: 11 },
}

export default function KairoBrand({
  variant = 'default',
  subtitle,
  size = 'md',
  format = 'horizontal',
  className,
  style,
}: KairoBrandProps) {
  const s = scale[size]
  const inverse = variant === 'inverse'
  const subColor = inverse ? 'rgba(255,255,255,0.64)' : '#7c8da5'
  const stacked = format === 'stacked'

  const mark = (
    <span
      aria-hidden={variant === 'mark' ? undefined : 'true'}
      aria-label={variant === 'mark' ? 'Kairo' : undefined}
      className={variant === 'mark' ? className : undefined}
      style={{
        width: s.mark,
        height: s.mark,
        borderRadius: s.radius,
        flexShrink: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#0f172a',
        border: '1px solid rgba(37,99,235,0.35)',
        boxShadow: '0 8px 24px rgba(2,8,23,0.22)',
        overflow: 'hidden',
        ...(variant === 'mark' ? style : undefined),
      }}
    >
      <img
        src="/brand/kairo-logo-new.png"
        alt=""
        width={s.mark}
        height={s.mark}
        style={{ width: '90%', height: '90%', objectFit: 'contain', display: 'block' }}
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
          width: stacked ? s.stackW : s.logoW,
          height: stacked ? s.stackH : s.logoH,
          borderRadius: inverse ? Math.round(s.radius * 1.1) : 0,
          padding: inverse ? (stacked ? '6px 10px' : '5px 8px') : 0,
          background: inverse ? 'rgba(255,255,255,0.92)' : 'transparent',
          border: inverse ? '1px solid rgba(255,255,255,0.30)' : 'none',
          boxShadow: inverse ? '0 14px 34px rgba(2,8,23,0.16)' : 'none',
          overflow: 'hidden',
        }}
      >
        <img
          src={stacked ? '/brand/kairo-lockup.png' : '/brand/kairo-logo-new.png'}
          alt="Kairo"
          width={stacked ? s.stackW : s.logoW}
          height={stacked ? s.stackH : s.logoH}
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
